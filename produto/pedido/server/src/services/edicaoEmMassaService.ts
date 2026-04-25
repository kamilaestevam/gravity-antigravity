/**
 * edicaoEmMassaService.ts — Serviço de edição em massa de pedidos
 *
 * Responsabilidades:
 *   - Validar campos bloqueados (calculados — nunca editáveis)
 *   - Calcular preview sem alterar banco
 *   - Aplicar edições em $transaction com recálculo de agregados
 *   - Registrar audit trail
 *
 * Regras:
 *   - tenant_id obrigatório em todas as queries
 *   - Campos em CAMPOS_BLOQUEADOS_* são rejeitados com AppError 400
 *   - Operações: substituir / somar / subtrair / percentual / avancar_dias / recuar_dias
 */

// ── Campos calculados — nunca editáveis em massa ──────────────────────────────

import { PrismaClient, Prisma } from '@prisma/client'

// Workaround Prisma 5.22: TransactionClient (Omit em classe genérica) perde delegates
type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

const CAMPOS_BLOQUEADOS_PEDIDO = new Set([
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_transferida_total',
  'id',
  'tenant_id',
  'product_id',
  'deleted_at',
  'created_at',
  'updated_at',
])

// PedidoItem — bloqueia tanto chaves legadas (vindas da API pública) quanto DDD,
// já que a tabela física foi renomeada (Onda 3 — Tabela 6).
const CAMPOS_BLOQUEADOS_ITEM = new Set([
  // legacy (contrato público)
  'valor_total_item',
  'quantidade_atual_pedido',
  'id',
  'tenant_id',
  'pedido_id',
  'created_at',
  'updated_at',
  // DDD (banco)
  'valor_total_item',
  'quantidade_atual_item',
  'id_item',
  'id_organizacao',
  'id_pedido',
  'data_criacao_item',
  'data_atualizacao_item',
])

// ── Campos armazenados em detalhes_operacionais — requerem merge em JSON ────────

const CAMPOS_DETALHES_OPERACIONAIS = new Set([
  'nome_exportador',
  'nome_importador',
  'nome_fabricante',
])

// ── Campos de quantidade — disparam recálculo de agregados ────────────────────
// Aceita chaves legadas (contrato API) e DDD (banco renomeado Onda 3).

const CAMPOS_QUANTIDADE_ITEM = new Set([
  'quantidade_inicial_pedido',
  'quantidade_transferida_pedido',
  'quantidade_pronta_pedido',
  'quantidade_cancelada_pedido',
  'quantidade_atual_pedido',
  'quantidade_inicial_item',
  'quantidade_transferida_item',
  'quantidade_pronta_item',
  'quantidade_cancelada_item',
  'quantidade_atual_item',
])

// ── ACL — chave legada (contrato público) → coluna DDD (banco) para PedidoItem ─

const LEGACY_TO_DDD_PEDIDO_ITEM: Record<string, string> = {
  id: 'id_item',
  tenant_id: 'id_organizacao',
  company_id: 'id_workspace',
  pedido_id: 'id_pedido',
  sequencia_item: 'sequencia_item_pedido',
  part_number: 'part_number_item',
  ncm: 'ncm_item',
  descricao_item: 'descricao_item',
  unidade_comercializada_item: 'unidade_comercializada_item',
  quantidade_inicial_pedido: 'quantidade_inicial_item',
  quantidade_atual_pedido: 'quantidade_atual_item',
  quantidade_pronta_pedido: 'quantidade_pronta_item',
  quantidade_transferida_pedido: 'quantidade_transferida_item',
  quantidade_cancelada_pedido: 'quantidade_cancelada_item',
  casas_decimais_quantidade_item: 'casas_decimais_quantidade_item',
  moeda_item: 'moeda_item',
  valor_total_item: 'valor_total_item',
  valor_por_unidade_item: 'valor_por_unidade_item',
  casas_decimais_valor_item: 'casas_decimais_valor_item',
  cobertura_cambial: 'cobertura_cambial_item',
  nome_exportador: 'nome_exportador_item',
  nome_importador: 'nome_importador_item',
  nome_fabricante: 'nome_fabricante_item',
  referencia_importador: 'referencia_importador_item',
  referencia_exportador: 'referencia_exportador_item',
  referencia_fabricante: 'referencia_fabricante_item',
  incoterm: 'incoterm_item',
  condicao_pagamento_pedido: 'condicao_pagamento_item',
  data_emissao_pedido: 'data_emissao_item',
  peso_liquido_unitario: 'peso_liquido_unitario_item',
  peso_bruto_unitario: 'peso_bruto_unitario_item',
  cubagem_unitaria: 'cubagem_unitaria_item',
  casas_decimais_peso_item: 'casas_decimais_peso_item',
  casas_decimais_cubagem_item: 'casas_decimais_cubagem_item',
  campos_custom: 'dados_extras_importacao_item',
  created_at: 'data_criacao_item',
  updated_at: 'data_atualizacao_item',
}

function legacyKeyToDddPedidoItem(campo: string): string {
  return LEGACY_TO_DDD_PEDIDO_ITEM[campo] ?? campo
}


// ── Tipos internos ────────────────────────────────────────────────────────────

type TipoCampoEdicao = 'texto' | 'numero' | 'data' | 'select' | 'usuario'
type OperacaoCampo = 'substituir' | 'somar' | 'subtrair' | 'percentual' | 'avancar_dias' | 'recuar_dias'

interface CampoEdicaoMassa {
  campo: string
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
  operacao: OperacaoCampo
  valor: string | number
}

interface EdicaoMassaPayload {
  pedido_ids: string[]
  campos: CampoEdicaoMassa[]
  nivel: 'pedido' | 'item' | 'combinado'
}

interface EdicaoMassaPreview {
  pedidos_afetados: number
  itens_afetados: number
  campos: {
    campo: string
    nivel: 'pedido' | 'item'
    operacao: OperacaoCampo
    valor: string | number
    multiplos_valores: boolean
    valores_distintos?: string[]
    alertas: string[]
  }[]
  alertas_globais: string[]
}

interface EdicaoMassaResultado {
  pedidos_atualizados: number
  itens_atualizados: number
  campos_alterados: string[]
  erros: { pedido_id: string; motivo: string }[]
}

// ── Helpers de erro ───────────────────────────────────────────────────────────

/**
 * Converte erros do Prisma em mensagens legíveis para o usuário.
 * P2002 = violação de unique constraint.
 */
function resolverMensagemErro(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } }
    if (prismaErr.code === 'P2002') {
      const campos = prismaErr.meta?.target?.join(', ') ?? 'campo'
      return `Valor duplicado: o campo "${campos}" já existe para outro pedido`
    }
  }
  return err instanceof Error ? err.message : 'Erro desconhecido'
}

// ── Classe de erro — exportada para que o router use a mesma instância ────────

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'BAD_REQUEST',
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// ── Serviço ───────────────────────────────────────────────────────────────────

export class EdicaoEmMassaService {

  /** Preview — retorna impacto sem alterar o banco */
  async preview(
    tenantId: string,
    db: PrismaClient,
    payload: EdicaoMassaPayload,
  ): Promise<EdicaoMassaPreview> {
    this.validarCamposEditaveis(payload.campos)

    const pedidos = await db.pedido.findMany({
      where: { id_organizacao: tenantId, id_pedido: { in: payload.pedido_ids } },
      include: { itens: { orderBy: { sequencia_item_pedido: 'asc' } } },
    })

    const itensAfetados = pedidos.reduce(
      (acc: number, p: Record<string, unknown[]>) => acc + ((p.itens as unknown[])?.length ?? 0),
      0,
    )

    const camposPreview = payload.campos.map(c => {
      const valores: string[] = []

      if (c.nivel === 'pedido') {
        pedidos.forEach((p: Record<string, unknown>) => {
          const valor = CAMPOS_DETALHES_OPERACIONAIS.has(c.campo)
            ? ((p.detalhes_operacionais as Record<string, unknown> | null)?.[c.campo] ?? '')
            : (p[c.campo] ?? '')
          valores.push(String(valor))
        })
      } else {
        const colDdd = legacyKeyToDddPedidoItem(c.campo)
        pedidos.forEach((p: Record<string, unknown>) => {
          const itens = (p.itens as Record<string, unknown>[]) ?? []
          itens.forEach(item => {
            valores.push(String(item[colDdd] ?? item[c.campo] ?? ''))
          })
        })
      }

      const distintos = [...new Set(valores)]
      const alertas: string[] = []

      if (distintos.length > 1) {
        alertas.push(`${distintos.length} valores distintos encontrados`)
      }

      return {
        campo: c.campo,
        nivel: c.nivel,
        operacao: c.operacao,
        valor: c.valor,
        multiplos_valores: distintos.length > 1,
        valores_distintos: distintos,
        alertas,
      }
    })

    return {
      pedidos_afetados: pedidos.length,
      itens_afetados: itensAfetados,
      campos: camposPreview,
      alertas_globais: [],
    }
  }

  /** Confirmar — executa a edição em massa em $transaction */
  async confirmar(
    tenantId: string,
    userId: string,
    db: PrismaClient,
    payload: EdicaoMassaPayload,
  ): Promise<EdicaoMassaResultado> {
    this.validarCamposEditaveis(payload.campos)

    const pedidos = await db.pedido.findMany({
      where: { id_organizacao: tenantId, id_pedido: { in: payload.pedido_ids } },
      include: { itens: { orderBy: { sequencia_item_pedido: 'asc' } } },
    })

    if (pedidos.length === 0) {
      throw new AppError('Nenhum pedido encontrado para edição', 404, 'NOT_FOUND')
    }

    const camposPedido = payload.campos.filter(c => c.nivel === 'pedido')
    const camposItem = payload.campos.filter(c => c.nivel === 'item')
    const erros: { pedido_id: string; motivo: string }[] = []
    let pedidosAtualizados = 0
    let itensAtualizados = 0

    const precisaRecalcularAgregados = camposItem.some(c => CAMPOS_QUANTIDADE_ITEM.has(c.campo))
    const pedidoIds = (pedidos as Record<string, unknown>[]).map(p => p.id_pedido as string)

    // ── CAMINHO RÁPIDO (updateMany) ───────────────────────────────────────────
    // Condição: todos os campos de pedido são "substituir" em campos diretos do
    // schema (não estão em detalhes_operacionais) e não há campos de item.
    // Uma única query SQL atualiza todos os pedidos independente do volume.
    const todosCamposPedidoSaoRapidos =
      camposPedido.length > 0 &&
      camposItem.length === 0 &&
      camposPedido.every(c => c.operacao === 'substituir' && !CAMPOS_DETALHES_OPERACIONAIS.has(c.campo))

    if (todosCamposPedidoSaoRapidos) {
      const dadosUpdateMany: Record<string, unknown> = {}
      for (const c of camposPedido) {
        dadosUpdateMany[c.campo] = c.valor
      }
      await db.pedido.updateMany({
        where: { id_pedido: { in: pedidoIds } },
        data: dadosUpdateMany,
      })
      pedidosAtualizados = pedidos.length
      return {
        pedidos_atualizados: pedidosAtualizados,
        itens_atualizados: 0,
        campos_alterados: payload.campos.map(c => c.campo),
        erros: [],
      }
    }

    // ── CAMINHO LENTO (loop por pedido) ───────────────────────────────────────
    // Campos com operação matemática (somar/subtrair/percentual), campos em
    // detalhes_operacionais (merge JSON), ou campos de item.
    // Timeout de 60s para suportar grandes volumes no Railway.
    await db.$transaction(async (tx0) => {
      const tx = tx0 as Tx
      for (const pedido of pedidos as Record<string, unknown>[]) {
        const pedidoId = pedido.id_pedido as string

        try {
          // Aplicar campos de nível pedido
          if (camposPedido.length > 0) {
            const dadosPedido: Record<string, unknown> = {}
            let detalhesUpdate: Record<string, unknown> | null = null

            for (const c of camposPedido) {
              if (CAMPOS_DETALHES_OPERACIONAIS.has(c.campo)) {
                // Campos armazenados em detalhes_operacionais — merge em JSON
                if (detalhesUpdate === null) {
                  const detAtual = (typeof pedido.detalhes_operacionais === 'object' && pedido.detalhes_operacionais !== null)
                    ? pedido.detalhes_operacionais as Record<string, unknown>
                    : {}
                  detalhesUpdate = { ...detAtual }
                }
                detalhesUpdate[c.campo] = c.valor
              } else {
                dadosPedido[c.campo] = this.aplicarOperacao(pedido[c.campo], c.operacao, c.valor)
              }
            }

            if (detalhesUpdate !== null) {
              dadosPedido.detalhes_operacionais = detalhesUpdate
            }

            await tx.pedido.update({
              where: { id_pedido: pedidoId },
              data: dadosPedido,
            })
          }

          // Aplicar campos de nível item — traduzir chaves legadas para colunas DDD
          if (camposItem.length > 0) {
            const itens = (pedido.itens as Record<string, unknown>[]) ?? []
            for (const item of itens) {
              const dadosItem: Record<string, unknown> = {}
              for (const c of camposItem) {
                const colDdd = legacyKeyToDddPedidoItem(c.campo)
                const valorAtual = item[colDdd] ?? item[c.campo]
                dadosItem[colDdd] = this.aplicarOperacao(valorAtual, c.operacao, c.valor)
              }
              const resultado = await tx.pedidoItem.update({
                where: { id_item: item.id_item as string, id_organizacao: tenantId },
                data: dadosItem,
              })
              if (resultado) itensAtualizados++
            }
          }

          // Recalcular agregados se campos de quantidade foram alterados
          if (precisaRecalcularAgregados) {
            await this.recalcularAgregados(tenantId, pedidoId, tx)
          }

          if (camposPedido.length > 0 || camposItem.length > 0) pedidosAtualizados++
        } catch (err: unknown) {
          erros.push({
            pedido_id: pedidoId,
            motivo: resolverMensagemErro(err),
          })
        }
      }

      // Registrar audit trail (não bloqueia se tabela não existir)
      try {
        const camposAlterados = payload.campos.map(c => c.campo)
        // pedidoHistorico best-effort — tabela pode não existir
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx as any).pedidoHistorico.createMany({
          data: pedidos.map((p: Record<string, unknown>) => ({
            tenant_id: tenantId,
            pedido_id: p.id_pedido as string,
            acao: 'EDICAO_EM_MASSA',
            descricao: `Edição em massa: ${camposAlterados.join(', ')}`,
            usuario_id: userId,
            metadata: JSON.stringify({
              campos: payload.campos,
              nivel: payload.nivel,
            }),
          })),
        })
      } catch {
        // Tabela de histórico pode não existir ainda — não bloquear a operação
        console.warn('[EdicaoEmMassa] Tabela pedidoHistorico não disponível, pulando audit trail')
      }
    }, { timeout: 60000, maxWait: 10000 })

    return {
      pedidos_atualizados: pedidosAtualizados,
      itens_atualizados: itensAtualizados,
      campos_alterados: payload.campos.map(c => c.campo),
      erros,
    }
  }

  /** Aplica a operação a um valor atual, retornando o novo valor */
  private aplicarOperacao(
    valorAtual: unknown,
    operacao: OperacaoCampo,
    valor: string | number,
  ): unknown {
    switch (operacao) {
      case 'substituir':
        return valor

      case 'somar':
        return Number(valorAtual ?? 0) + Number(valor)

      case 'subtrair':
        return Number(valorAtual ?? 0) - Number(valor)

      case 'percentual':
        return Number(valorAtual ?? 0) * (1 + Number(valor) / 100)

      case 'avancar_dias': {
        const base = valorAtual ? new Date(String(valorAtual)) : new Date()
        base.setDate(base.getDate() + Number(valor))
        return base.toISOString()
      }

      case 'recuar_dias': {
        const base = valorAtual ? new Date(String(valorAtual)) : new Date()
        base.setDate(base.getDate() - Number(valor))
        return base.toISOString()
      }

      default:
        return valorAtual
    }
  }

  /** Recalcula campos agregados do pedido após edição de quantidades */
  private async recalcularAgregados(
    tenantId: string,
    pedidoId: string,
    tx: Tx,
  ): Promise<void> {
    const itens = await tx.pedidoItem.findMany({
      where: { id_organizacao: tenantId, id_pedido: pedidoId },
      select: {
        quantidade_inicial_item: true,
        quantidade_transferida_item: true,
        valor_por_unidade_item: true,
        quantidade_atual_item: true,
      },
    })

    const quantidadeInicialTotal = itens.reduce(
      (acc: number, i: { quantidade_inicial_item: number }) => acc + Number(i.quantidade_inicial_item ?? 0),
      0,
    )
    const valorTotal = itens.reduce(
      (acc: number, i: { valor_por_unidade_item: number | null; quantidade_atual_item: number }) =>
        acc + (Number(i.valor_por_unidade_item ?? 0) * Number(i.quantidade_atual_item ?? 0)),
      0,
    )

    await tx.pedido.update({
      where: { id_pedido: pedidoId },
      data: {
        quantidade_total_pedido: quantidadeInicialTotal,
        valor_total_pedido: valorTotal,
      },
    })
  }

  /** Valida que nenhum campo bloqueado está na lista — rejeita server-side */
  private validarCamposEditaveis(campos: CampoEdicaoMassa[]): void {
    for (const c of campos) {
      if (c.nivel === 'pedido' && CAMPOS_BLOQUEADOS_PEDIDO.has(c.campo)) {
        throw new AppError(
          `Campo "${c.campo}" é calculado e não pode ser editado em massa`,
          400,
          'CAMPO_BLOQUEADO',
        )
      }
      if (c.nivel === 'item' && CAMPOS_BLOQUEADOS_ITEM.has(c.campo)) {
        throw new AppError(
          `Campo "${c.campo}" é calculado e não pode ser editado em massa`,
          400,
          'CAMPO_BLOQUEADO',
        )
      }
    }
  }
}
