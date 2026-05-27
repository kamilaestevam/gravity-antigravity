/**
 * importacao.ts — Rotas de importacao de pedidos via arquivo
 *
 * Endpoint base: /api/v1/pedidos/importar
 * Protegido por: requireInternalKey + tenantIsolation
 *
 * Rotas:
 *   POST /importar          Upload + parse + preview
 *   POST /importar/confirmar  Confirmar e criar pedidos em batch
 *   POST /exportar           Exportar pedidos filtrados
 */

import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { importEngine } from '../services/importEngine.js'
import type { PedidoImportado } from '../services/importEngine.js'
import { AppError } from '../services/saldo-pedido.js'
import { buscarIdentidadesComexPorSuids } from '../services/cadastrosClient.js'
import { montarSnapshotIdentidadeComex, type PapelEmpresa } from '../services/pedidoSnapshots.js'
import { recalcularAgregadosPedido } from '../services/recalcularAgregadosPedido.js'
import {
  construirCamposPropagadosParaItem,
  derivarNomesEmpresaParaItem,
} from '../../../pedido/shared/mapaPropagacaoPedidoItem.js'
import { withOrganizacao } from '@gravity/resolver-organizacao'

export const importacaoRouter = Router()

// ── POST /importar — Upload + parse + preview ─────────────────────────────────

importacaoRouter.post('/importar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // O arquivo chega como raw buffer via middleware de upload (multer)
    // ou como base64 no body para simplificar o MVP
    const { arquivo_base64, nome_arquivo } = req.body

    if (!arquivo_base64 || !nome_arquivo) {
      throw new AppError(400, 'Campos arquivo_base64 e nome_arquivo sao obrigatorios')
    }

    const buffer = Buffer.from(arquivo_base64, 'base64')
    const pedidos = await importEngine.processarArquivo(buffer, nome_arquivo)

    res.json({
      preview: pedidos,
      total: pedidos.length,
      total_itens: pedidos.reduce((acc, p) => acc + p.itens.length, 0),
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /importar/confirmar — Criar pedidos em batch ─────────────────────────

const pedidoImportadoObjectSchema = z.object({
  numero_pedido: z.string().min(1),
  tipo_operacao: z.enum(['importacao', 'exportacao']),
  // Fase 4 DDD: SUIDs substituem nomes livres. Empresas devem existir no
  // serviço Cadastros antes da importação.
  suid_importador: z.string().min(1).optional().nullable(),
  suid_exportador: z.string().min(1).optional().nullable(),
  suid_fabricante: z.string().min(1).optional().nullable(),
  incoterm: z.string().optional(),
  moeda_pedido: z.string().optional().default('USD'),
  referencia_importador: z.string().optional(),
  referencia_exportador: z.string().optional(),
  referencia_fabricante: z.string().optional(),
  numero_proforma: z.string().optional(),
  numero_invoice: z.string().optional(),
  data_emissao_pedido: z.string().optional(),
  itens: z.array(z.object({
    part_number: z.string().min(1),
    ncm: z.string().min(1),
    descricao_item: z.string().min(1),
    quantidade_inicial_pedido: z.number().positive(),
    unidade_comercializada_item: z.string().optional(),
    valor_por_unidade_item: z.number().optional(),
    valor_total_item: z.number().optional(),
  })).min(1),
}).superRefine((data, ctx) => {
  if (data.tipo_operacao === 'importacao' && !data.suid_exportador) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['suid_exportador'],
      message: 'suid_exportador e obrigatorio quando tipo_operacao = importacao',
    })
  }
  if (data.tipo_operacao === 'exportacao' && !data.suid_importador) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['suid_importador'],
      message: 'suid_importador e obrigatorio quando tipo_operacao = exportacao',
    })
  }
})

export const confirmarSchema = z.object({
  pedidos: z.array(pedidoImportadoObjectSchema).min(1),
})

importacaoRouter.post('/importar/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = confirmarSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = req.headers['x-id-organizacao'] as string
    const company_id = req.headers['x-id-workspace'] as string
    const correlation_id =
      (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID()

    // ── Fase 4 DDD: coleta SUIDs únicos do batch e busca Empresas no Cadastros
    // ANTES de abrir a transação (I/O de rede fora de $transaction).
    const suidsUnicos = new Set<string>()
    for (const p of result.data.pedidos) {
      if (p.suid_importador) suidsUnicos.add(p.suid_importador)
      if (p.suid_exportador) suidsUnicos.add(p.suid_exportador)
      if (p.suid_fabricante) suidsUnicos.add(p.suid_fabricante)
    }
    const identidadesMap = await buscarIdentidadesComexPorSuids(
      Array.from(suidsUnicos),
      { id_organizacao: tenant_id, correlation_id },
    )

    let criados: string[] = []
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      criados = await db.$transaction(async (tx: Record<string, Record<string, unknown>>) => {
        const pedidosCriados: string[] = []

        // Débito 2B — lookup do FK do status 'rascunho' uma vez, fora do loop.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusRascunhoImp = await (tx as any).statusPedido.findFirst({
          where: { id_organizacao: tenant_id, nome_pedido_status: 'rascunho' },
          select: { id_pedido_status: true },
        })
        if (!statusRascunhoImp) {
          console.warn(
            `[POST /importar] StatusPedido 'rascunho' nao encontrado na organizacao=${tenant_id}; ` +
            `pedidos importados serao criados sem vinculo id_status_pedido.`,
          )
        }

        for (const pedidoData of result.data.pedidos) {
          const pedidoId = gerarId('pedi')
          const valorTotal = pedidoData.itens.reduce((acc, item) => {
            return acc + (item.valor_total_item ?? (item.valor_por_unidade_item ?? 0) * item.quantidade_inicial_pedido)
          }, 0)
          const qtdTotal = pedidoData.itens.reduce((acc, item) => acc + item.quantidade_inicial_pedido, 0)

          const papeisPedido: Array<{ suid: string; papel: PapelEmpresa }> = []
          if (pedidoData.suid_importador) papeisPedido.push({ suid: pedidoData.suid_importador, papel: 'importador' })
          if (pedidoData.suid_exportador) papeisPedido.push({ suid: pedidoData.suid_exportador, papel: 'exportador' })
          if (pedidoData.suid_fabricante) papeisPedido.push({ suid: pedidoData.suid_fabricante, papel: 'fabricante' })

          const snapshotsData = papeisPedido
            .map(({ suid, papel }) => {
              const identidade = identidadesMap.get(suid)
              if (!identidade) return null
              return montarSnapshotIdentidadeComex(identidade, papel, tenant_id, company_id)
            })
            .filter((s): s is NonNullable<typeof s> => s !== null)

          // Monta dados Pedido em DDD-puro (smart import ainda usa nomes legados
          // no payload; tradução localizada aqui — migração completa do Zod fica
          // pra fase própria do smart import).
          const dadosPedidoDdd: Record<string, unknown> = {
            id_pedido:                    pedidoId,
            id_organizacao:               tenant_id,
            id_workspace:                 company_id,
            tipo_operacao_pedido:         pedidoData.tipo_operacao,
            numero_pedido:                pedidoData.numero_pedido,
            status_pedido:                'rascunho',
            id_status_pedido:             statusRascunhoImp?.id_pedido_status ?? null,
            incoterm_pedido:              pedidoData.incoterm ?? null,
            moeda_pedido:                 pedidoData.moeda_pedido ?? 'USD',
            valor_total_pedido:           valorTotal || null,
            quantidade_total_pedido:      qtdTotal || null,
            condicao_pagamento_pedido:    null,
            referencia_importador_pedido: pedidoData.referencia_importador ?? null,
            referencia_exportador_pedido: pedidoData.referencia_exportador ?? null,
            referencia_fabricante_pedido: pedidoData.referencia_fabricante ?? null,
            numero_proforma_pedido:       pedidoData.numero_proforma ?? null,
            numero_invoice_pedido:        pedidoData.numero_invoice ?? null,
          }

          // Propagação Pedido → Item (mesma fonte da verdade do CREATE manual)
          const propagacaoPedido = construirCamposPropagadosParaItem(dadosPedidoDdd)
          const nomesEmpresa     = derivarNomesEmpresaParaItem(snapshotsData)
          const camposHerdados   = { ...propagacaoPedido, ...nomesEmpresa }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (tx as any).pedido.create({
            // @lint-agregados: allow-create-placeholder — recalcularAgregadosPedido
            // roda logo depois do create dentro da mesma $transaction.
            data: {
              ...dadosPedidoDdd,
              itens_pedido: {
                create: pedidoData.itens.map((item, index) => ({
                  id_item:                  gerarId('pite'),
                  id_organizacao:           tenant_id,
                  id_workspace:             company_id,
                  // Herdados do Pedido — 22 campos + 3 nomes de snapshot
                  ...camposHerdados,
                  // Item-specific
                  sequencia_item_pedido:    (index + 1),
                  part_number_item:         item.part_number,
                  ncm_item:                 item.ncm,
                  descricao_item:           item.descricao_item,
                  quantidade_inicial_item:  item.quantidade_inicial_pedido,
                  quantidade_atual_item:    item.quantidade_inicial_pedido,
                  quantidade_pronta_item:   0,
                  quantidade_transferida_item: 0,
                  quantidade_cancelada_item: 0,
                  valor_por_unidade_item:   item.valor_por_unidade_item ?? null,
                  valor_total_item:         item.valor_total_item ?? ((item.valor_por_unidade_item ?? 0) * item.quantidade_inicial_pedido),
                  // Item-explicit override do herdado (se enviado no payload)
                  ...(item.unidade_comercializada_item != null ? { unidade_comercializada_item: item.unidade_comercializada_item } : {}),
                })),
              },
              snapshots_empresa_pedido: snapshotsData.length
                ? { create: snapshotsData }
                : undefined,
            },
          })

          // Recalcular os 5 agregados do pedido recém-criado a partir dos
          // itens — fonte única de verdade. Cobre valor/qty/peso_liq/peso_br/cubagem
          // (importacao.ts antes só populava valor e qty manualmente).
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await recalcularAgregadosPedido(tx as any, pedidoId, tenant_id)

          pedidosCriados.push(pedidoId)
        }

        return pedidosCriados
      })
    })

    res.status(201).json({
      criados: criados.length,
      ids: criados,
      status: 'rascunho',
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /exportar — Exportar pedidos filtrados ───────────────────────────────

importacaoRouter.post('/exportar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formato = 'csv', filtros } = req.body
    const tenant_id = req.headers['x-id-organizacao'] as string
    const company_id = req.headers['x-id-workspace'] as string

    const where: Record<string, unknown> = { id_organizacao: tenant_id, id_workspace: company_id }
    if (filtros?.status) where.status_pedido = filtros.status
    if (filtros?.tipo_operacao) where.tipo_operacao_pedido = filtros.tipo_operacao

    let pedidos: Array<Record<string, unknown>> = []
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      pedidos = await db.pedido.findMany({
        where,
        include: { itens_pedido: true },
        orderBy: { data_emissao_pedido: 'desc' },
      })
    })

    if (formato === 'csv') {
      const headers = [
        'numero_pedido', 'tipo_operacao', 'status', 'incoterm', 'moeda',
        'valor_total', 'quantidade_total', 'data_emissao',
        'item_part_number', 'item_ncm', 'item_descricao',
        'item_qtd_inicial', 'item_qtd_atual', 'item_qtd_transferida',
        'item_unidade', 'item_valor',
      ]

      const rows = pedidos.flatMap((p: Record<string, unknown>) =>
        (p.itens_pedido as Array<Record<string, unknown>>).map((item) =>
          [
            p.numero_pedido, p.tipo_operacao_pedido, p.status_pedido, p.incoterm_pedido ?? '', p.moeda_pedido,
            p.valor_total_pedido ?? '', p.quantidade_total_pedido ?? '', p.data_emissao_pedido,
            item.part_number_item, item.ncm_item, item.descricao_item,
            item.quantidade_inicial_item, item.quantidade_atual_item, item.quantidade_transferida_item,
            item.unidade_comercializada_item ?? '', item.valor_total_item ?? '',
          ].map((v) => `"${String(v).replace(/"/g, '""')}"`)
           .join(',')
        )
      )

      const csv = [headers.join(','), ...rows].join('\n')
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="pedidos.csv"')
      res.send(csv)
    } else {
      res.json({ data: pedidos, total: pedidos.length })
    }
  } catch (err) {
    next(err)
  }
})

// ── Helper ────────────────────────────────────────────────────────────────────

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}/${ano}`
}
