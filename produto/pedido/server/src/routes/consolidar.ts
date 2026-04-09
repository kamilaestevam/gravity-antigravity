/**
 * consolidar.ts — Rotas de consolidação de pedidos
 *
 * Rota base: /api/v1/pedidos/consolidar
 *
 * Endpoints:
 *   POST /api/v1/pedidos/consolidar/preview   — retorna divergências e sugestões
 *   POST /api/v1/pedidos/consolidar/confirmar — executa o merge real
 *
 * Regras de negócio:
 *   - Mínimo de 2 pedidos para consolidar
 *   - Pedidos originais recebem deleted_at (soft delete) após merge
 *   - Novo pedido guarda pedidos_origem[] para rastreabilidade
 *   - tenant_id é injetado pelo tenantIsolationMiddleware em todas as queries
 *   - Zod valida entrada antes de qualquer lógica
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}-${ano}`
}

export const consolidarRouter = Router()

// ── Classe de erro local (padrão project) ────────────────────────────────────

class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'BAD_REQUEST',
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const PreviewSchema = z.object({
  ids: z.array(z.string().min(1)).min(2, 'Selecione ao menos 2 pedidos para consolidar'),
})

const ConfirmarSchema = z.object({
  ids: z.array(z.string().min(1)).min(2, 'Selecione ao menos 2 pedidos para consolidar'),
  numero_pedido: z.string().min(1).max(100),
  campos_escolhidos: z.record(z.union([z.string(), z.number(), z.null()])),
  fundir_itens_mesmo_part_number: z.boolean(),
})

// ── Campos que participam da detecção de divergência ─────────────────────────

const CAMPOS_COMPARAR: Array<{ campo: string; rotulo: string }> = [
  { campo: 'incoterm',           rotulo: 'Incoterm'               },
  { campo: 'moeda_pedido',       rotulo: 'Moeda'                  },
  { campo: 'nome_exportador',    rotulo: 'Exportador'             },
  { campo: 'nome_importador',    rotulo: 'Importador'             },
  { campo: 'data_emissao_pedido',rotulo: 'Data Emissão do Pedido' },
  { campo: 'cobertura_cambial_pedido',  rotulo: 'Cobertura Cambial'      },
  { campo: 'condicao_pagamento_pedido', rotulo: 'Condição de Pagamento'  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function gerarNumeroPedido(total: number): string {
  const ano = new Date().getFullYear()
  const seq = String(total + 1).padStart(3, '0')
  return `PO-CONS-${ano}/${seq}`
}

// ── POST /consolidar/preview ─────────────────────────────────────────────────

consolidarRouter.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = PreviewSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const { ids } = parse.data
  const db = (req as any).prisma
  const tenantId = (req as any).tenantId as string

  try {
    // Buscar pedidos com itens — tenant_id injetado automaticamente pelo middleware
    const pedidos = await db.pedido.findMany({
      where: { id: { in: ids } },
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
    })

    if (pedidos.length < 2) {
      throw new AppError('Não foram encontrados pedidos suficientes para consolidar', 404, 'NOT_FOUND')
    }

    if (pedidos.length !== ids.length) {
      throw new AppError('Um ou mais pedidos não foram encontrados', 404, 'NOT_FOUND')
    }

    // Detectar divergências de campo
    const camposDivergentes = []
    const camposIguais: string[] = []

    // Campos em detalhes_operacionais não estão no objeto Prisma cru — extrair do JSON
    const CAMPOS_DETALHES = new Set(['nome_exportador', 'nome_importador', 'nome_fabricante'])

    for (const { campo, rotulo } of CAMPOS_COMPARAR) {
      const valores = pedidos.map((p: any) => {
        const det = (typeof p.detalhes_operacionais === 'object' && p.detalhes_operacionais !== null)
          ? p.detalhes_operacionais as Record<string, unknown>
          : {}
        const valor = CAMPOS_DETALHES.has(campo)
          ? (det[campo] as string | null | undefined) ?? null
          : p[campo] as string | number | null
        return { pedido_id: p.id, numero_pedido: p.numero_pedido, valor }
      })
      const unicos = new Set(valores.map((v: any) => String(v.valor)))
      if (unicos.size > 1) {
        camposDivergentes.push({
          campo,
          rotulo,
          valores,
          valor_sugerido: valores[0].valor,
        })
      } else {
        camposIguais.push(campo)
      }
    }

    // Consolidar itens por part_number (para exibição)
    const itensPorPart: Record<string, any> = {}
    for (const pedido of pedidos) {
      for (const item of pedido.itens) {
        if (itensPorPart[item.part_number]) {
          itensPorPart[item.part_number].quantidade_total += Number(item.saldo_item_pedido ?? 0)
          itensPorPart[item.part_number].pedidos_origem.push(pedido.numero_pedido)
          itensPorPart[item.part_number].pode_fundir = true
        } else {
          itensPorPart[item.part_number] = {
            part_number: item.part_number,
            descricao_item: item.descricao_item,
            ncm: item.ncm,
            unidade_comercializada_item: item.unidade_comercializada_item,
            moeda_item: item.moeda_item,
            valor_unitario: item.valor_unitario_item,
            quantidade_total: Number(item.saldo_item_pedido ?? 0),
            pedidos_origem: [pedido.numero_pedido],
            pode_fundir: false,
          }
        }
      }
    }

    const valorTotal = pedidos.reduce((acc: number, p: any) => acc + (p.valor_total_pedido ?? 0), 0)
    const total = await db.pedido.count()

    res.json({
      ids,
      campos_divergentes: camposDivergentes,
      campos_iguais: camposIguais,
      itens: Object.values(itensPorPart),
      valor_total_soma: valorTotal,
      moeda: pedidos[0].moeda_pedido,
      numero_sugerido: gerarNumeroPedido(total),
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /consolidar/confirmar ───────────────────────────────────────────────

consolidarRouter.post('/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const { ids, numero_pedido, campos_escolhidos, fundir_itens_mesmo_part_number } = parse.data
  const db = (req as any).prisma
  const tenantId = (req as any).tenantId as string

  try {
    // Buscar pedidos originais
    const pedidos = await db.pedido.findMany({
      where: { id: { in: ids } },
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
    })

    if (pedidos.length < 2) {
      throw new AppError('Não foram encontrados pedidos suficientes para consolidar', 404, 'NOT_FOUND')
    }

    if (pedidos.length !== ids.length) {
      throw new AppError('Um ou mais pedidos não foram encontrados', 404, 'NOT_FOUND')
    }

    // Verificar se número do pedido já existe
    const numeroExistente = await db.pedido.findFirst({
      where: { numero_pedido },
    })
    if (numeroExistente) {
      throw new AppError(`Número de pedido "${numero_pedido}" já está em uso`, 409, 'CONFLICT')
    }

    const primeiro = pedidos[0]

    // Consolidar itens
    const itensMerge: any[] = []
    const partNumbersVistos = new Set<string>()

    for (const pedido of pedidos) {
      for (const item of pedido.itens) {
        if (fundir_itens_mesmo_part_number && partNumbersVistos.has(item.part_number)) {
          const existente = itensMerge.find((i: any) => i.part_number === item.part_number)
          if (existente) {
            existente.quantidade_inicial_item_pedido = (Number(existente.quantidade_inicial_item_pedido) || 0) + (Number(item.quantidade_inicial_item_pedido) || 0)
            existente.saldo_item_pedido = (Number(existente.saldo_item_pedido) || 0) + (Number(item.saldo_item_pedido) || 0)
            existente.quantidade_pronta_total_item_pedido = (Number(existente.quantidade_pronta_total_item_pedido) || 0) + (Number(item.quantidade_pronta_total_item_pedido) || 0)
            existente.valor_total_itens = (Number(existente.valor_total_itens) || 0) + (Number(item.valor_total_itens) || 0)
          }
        } else {
          partNumbersVistos.add(item.part_number)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _id, pedido_id: _pedido_id, created_at: _ca, updated_at: _ua, sequencia_item: _seq, ...itemData } = item
          itensMerge.push({ ...itemData, id: gerarId('pite') })
        }
      }
    }

    // Renumerar sequencia_item de forma limpa (1, 2, 3...) no pedido consolidado
    itensMerge.forEach((item, i) => { item.sequencia_item = i + 1 })

    const valorTotal = pedidos.reduce((acc: number, p: any) => acc + (Number(p.valor_total_pedido) || 0), 0)

    // Campos base do pedido consolidado (primeiro prevalece como default)
    const camposBase = {
      tipo_operacao:                   primeiro.tipo_operacao,
      status:                          'consolidado',
      importacao_exportador_id:        primeiro.importacao_exportador_id,
      exportacao_importador_id:        primeiro.exportacao_importador_id,
      incoterm:                        primeiro.incoterm,
      moeda_pedido:                    primeiro.moeda_pedido,
      casas_decimais_total_pedido:     primeiro.casas_decimais_total_pedido,
      casas_decimais_quantidade_total_pedido: primeiro.casas_decimais_quantidade_total_pedido,
      unidade_comercializada_pedido:   primeiro.unidade_comercializada_pedido,
      cobertura_cambial:               primeiro.cobertura_cambial,
      condicao_pagamento:              primeiro.condicao_pagamento,
      data_emissao_pedido:             primeiro.data_emissao_pedido,
      // Preservar nomes dos parceiros de detalhes_operacionais do primeiro pedido
      detalhes_operacionais: (() => {
        const det = (typeof primeiro.detalhes_operacionais === 'object' && primeiro.detalhes_operacionais !== null)
          ? primeiro.detalhes_operacionais as Record<string, unknown>
          : {}
        return {
          exportador_nome: (det.exportador_nome as string | null | undefined) ?? null,
          importador_nome: (det.importador_nome as string | null | undefined) ?? null,
          fabricante_nome: (det.fabricante_nome as string | null | undefined) ?? null,
        }
      })(),
    }

    // Criar pedido consolidado com $transaction para atomicidade
    const pedidoConsolidado = await db.$transaction(async (tx: any) => {
      // 1. Criar o pedido consolidado
      const novo = await tx.pedido.create({
        data: {
          id: gerarId('pedi'),
          company_id: primeiro.company_id,
          ...camposBase,
          ...campos_escolhidos,
          numero_pedido,
          valor_total_pedido: valorTotal,
          pedidos_origem: ids,
          data_consolidacao_pedido: new Date(),
          itens: {
            create: itensMerge,
          },
        },
        include: { itens: { orderBy: { sequencia_item: 'asc' } } },
      })

      // 2. Soft delete dos pedidos originais — marcados como deleted_at
      await tx.pedido.updateMany({
        where: { id: { in: ids } },
        data: {
          deleted_at: new Date(),
          status: 'consolidado',
        },
      })

      // 3. Registrar no histórico (audit trail) se disponível
      try {
        await tx.pedidoHistorico.createMany({
          data: ids.map((id: string) => ({
            tenant_id: tenantId,
            pedido_id: id,
            acao: 'CONSOLIDADO',
            descricao: `Pedido consolidado em ${numero_pedido}`,
            pedido_consolidado_id: novo.id,
            metadata: JSON.stringify({ ids_origem: ids, numero_pedido_destino: numero_pedido }),
          })),
        })
      } catch {
        // Tabela de histórico pode não existir ainda — não bloquear a operação
        console.warn('[Consolidar] Tabela pedidoHistorico não disponível, pulando audit trail')
      }

      return novo
    })

    res.status(201).json(pedidoConsolidado)
  } catch (err) {
    next(err)
  }
})

// ── Error handler local ───────────────────────────────────────────────────────

consolidarRouter.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }
  console.error('[Consolidar]', err.message)
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } })
})
