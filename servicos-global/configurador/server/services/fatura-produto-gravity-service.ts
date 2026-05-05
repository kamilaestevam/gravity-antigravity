// server/services/fatura-produto-gravity-service.ts
// CRUD de FaturaProdutoGravity — fonte da verdade local para faturas Gravity.
// Quando provider externo (Conta Azul, Itaú, Santander) for plugado, este servico
// segue como fallback/cache para operações que não dependem de integração externa.

import type { Prisma } from '../../../../configurador/generated/index.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import type {
  CreateInvoiceParams,
  GravityInvoice,
  GravityInvoiceStatus,
  ListInvoicesParams,
  ListInvoicesResult,
} from '../lib/billing/types.js'

type FaturaRow = {
  id_fatura_produto_gravity:                string
  id_organizacao:                           string
  numero_fatura_produto_gravity:            string
  status_fatura_produto_gravity:            GravityInvoiceStatus
  nome_organizacao_fatura_produto_gravity:  string
  email_organizacao_fatura_produto_gravity: string | null
  valor_total_fatura_produto_gravity:       Prisma.Decimal
  moeda_fatura_produto_gravity:             string
  competencia_fatura_produto_gravity:       string | null
  data_fatura_produto_gravity:              Date
  data_criacao_fatura_produto_gravity:      Date
  data_atualizacao_fatura_produto_gravity:  Date
}

function paraFaturaDto(row: FaturaRow): GravityInvoice {
  const valor_cents = Math.round(row.valor_total_fatura_produto_gravity.toNumber() * 100)
  return {
    id:     row.id_fatura_produto_gravity,
    number: row.numero_fatura_produto_gravity,
    status: row.status_fatura_produto_gravity,
    customer: {
      id:        row.id_organizacao,
      name:      row.nome_organizacao_fatura_produto_gravity,
      email:     row.email_organizacao_fatura_produto_gravity,
      tenant_id: row.id_organizacao,
    },
    amount_due_cents:  valor_cents,
    amount_paid_cents: row.status_fatura_produto_gravity === 'PAGA' ? valor_cents : 0,
    currency:          row.moeda_fatura_produto_gravity,
    due_date:          row.data_fatura_produto_gravity.toISOString(),
    competencia:       row.competencia_fatura_produto_gravity,
    description:       `Fatura ${row.numero_fatura_produto_gravity}`,
    line_items:        [],
    documents:         [],
    hosted_url:        null,
    created_at:        row.data_criacao_fatura_produto_gravity.toISOString(),
    provider:          'gravity',
    provider_id:       row.id_fatura_produto_gravity,
  }
}

export const faturaProdutoGravityServico = {
  async listar(params: ListInvoicesParams): Promise<ListInvoicesResult> {
    const limit = Math.min(params.limit ?? 50, 100)

    const where: Prisma.ProdutoGravityFaturaWhereInput = {}
    if (params.status)      where.status_fatura_produto_gravity = params.status
    if (params.customer_id) where.id_organizacao = params.customer_id
    if (params.cursor)      where.id_fatura_produto_gravity = { lt: params.cursor }

    const rows = await prisma.produtoGravityFatura.findMany({
      where,
      take: limit + 1,
      orderBy: { data_criacao_fatura_produto_gravity: 'desc' },
    })

    const has_more = rows.length > limit
    const slice = has_more ? rows.slice(0, limit) : rows
    const next_cursor = has_more && slice.length > 0
      ? slice[slice.length - 1].id_fatura_produto_gravity
      : null

    return {
      invoices: slice.map(paraFaturaDto),
      has_more,
      next_cursor,
    }
  },

  async obterPorId(id: string): Promise<GravityInvoice | null> {
    const row = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: id },
    })
    return row ? paraFaturaDto(row) : null
  },

  async criar(params: CreateInvoiceParams): Promise<GravityInvoice> {
    const total_cents = params.line_items.reduce(
      (soma, item) => soma + (item.amount_cents * item.quantity),
      0,
    )

    const org = await prisma.organizacao.findUnique({
      where:  { id_organizacao: params.customer_tenant_id },
      select: { id_organizacao: true, nome_organizacao: true },
    })
    if (!org) {
      throw new AppError(
        `Organização não encontrada: ${params.customer_tenant_id}`,
        404,
        'NOT_FOUND',
      )
    }

    const count = await prisma.produtoGravityFatura.count()
    const numero = `${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`

    const row = await prisma.produtoGravityFatura.create({
      data: {
        id_organizacao:                           params.customer_tenant_id,
        numero_fatura_produto_gravity:            numero,
        status_fatura_produto_gravity:            params.auto_finalize ? 'EMITIDA' : 'RASCUNHO',
        nome_organizacao_fatura_produto_gravity:  org.nome_organizacao,
        email_organizacao_fatura_produto_gravity: params.customer_email ?? null,
        valor_total_fatura_produto_gravity:       total_cents / 100,
        moeda_fatura_produto_gravity:             params.currency ?? 'brl',
        competencia_fatura_produto_gravity:       params.competencia ?? null,
        data_fatura_produto_gravity:              params.due_date ? new Date(params.due_date) : new Date(),
      },
    })

    // Cria os itens (composição da fatura)
    if (params.line_items.length > 0) {
      await prisma.produtoGravityFaturaItem.createMany({
        data: params.line_items.map(item => ({
          id_organizacao:                             params.customer_tenant_id,
          id_fatura_produto_gravity:                  row.id_fatura_produto_gravity,
          descricao_fatura_item_produto_gravity:      item.description,
          quantidade_fatura_item_produto_gravity:     item.quantity,
          valor_unitario_fatura_item_produto_gravity: item.amount_cents / 100,
          valor_total_fatura_item_produto_gravity:    (item.amount_cents * item.quantity) / 100,
          moeda_fatura_item_produto_gravity:          params.currency ?? 'brl',
        })),
      })
    }

    return paraFaturaDto(row)
  },

  async anular(id: string, _motivo?: string): Promise<GravityInvoice> {
    const row = await prisma.produtoGravityFatura.update({
      where: { id_fatura_produto_gravity: id },
      data:  { status_fatura_produto_gravity: 'ANULADA' },
    })
    return paraFaturaDto(row)
  },

  async enviar(id: string): Promise<GravityInvoice> {
    // No-op: sem integração externa, devolve a fatura sem alteração.
    // Quando provider externo for plugado, o envio passa por ele.
    const row = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: id },
    })
    if (!row) {
      throw new AppError(`Fatura não encontrada: ${id}`, 404, 'NOT_FOUND')
    }
    return paraFaturaDto(row)
  },

  async listarItens(id_fatura_produto_gravity: string, id_organizacao: string) {
    return prisma.produtoGravityFaturaItem.findMany({
      where: { id_fatura_produto_gravity, id_organizacao },
      orderBy: { data_criacao_fatura_item_produto_gravity: 'asc' },
    })
  },

  /**
   * Atualiza fatura + itens em uma única transação Prisma.
   * Bloqueia se status for terminal (PAID/VOID/UNCOLLECTIBLE) — Coordenador exigiu
   * validação no backend, não só no front.
   */
  async atualizar(params: {
    id_fatura_produto_gravity: string
    id_organizacao:            string
    competencia?:              string | null
    data_vencimento?:          Date | null
    email_organizacao?:        string | null
    moeda?:                    string
    itens?: Array<{
      id_fatura_item_produto_gravity?: string
      id_produto_gravity?:             string | null
      descricao_fatura_item_produto_gravity:      string
      quantidade_fatura_item_produto_gravity:     number
      valor_unitario_fatura_item_produto_gravity: number
      moeda_fatura_item_produto_gravity?:         string
    }>
  }): Promise<GravityInvoice> {
    const { id_fatura_produto_gravity, id_organizacao, itens } = params

    return prisma.$transaction(async (tx) => {
      const atual = await tx.produtoGravityFatura.findFirst({
        where: { id_fatura_produto_gravity, id_organizacao },
      })
      if (!atual) {
        throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')
      }
      const terminais: GravityInvoiceStatus[] = ['PAGA', 'ANULADA', 'INCOBRAVEL']
      if (terminais.includes(atual.status_fatura_produto_gravity as GravityInvoiceStatus)) {
        throw new AppError(
          `Fatura em status ${atual.status_fatura_produto_gravity} não pode ser editada`,
          409,
          'INVALID_STATE',
        )
      }

      const dadosUpdate: Record<string, unknown> = {}
      if (params.competencia !== undefined) dadosUpdate.competencia_fatura_produto_gravity = params.competencia
      if (params.data_vencimento !== undefined) dadosUpdate.data_fatura_produto_gravity = params.data_vencimento ?? new Date()
      if (params.email_organizacao !== undefined) dadosUpdate.email_organizacao_fatura_produto_gravity = params.email_organizacao
      if (params.moeda !== undefined) dadosUpdate.moeda_fatura_produto_gravity = params.moeda

      if (itens) {
        const idsExistentes = itens.map(i => i.id_fatura_item_produto_gravity).filter((x): x is string => Boolean(x))
        await tx.produtoGravityFaturaItem.deleteMany({
          where: {
            id_organizacao,
            id_fatura_produto_gravity,
            id_fatura_item_produto_gravity: { notIn: idsExistentes.length > 0 ? idsExistentes : ['__nenhum__'] },
          },
        })

        for (const item of itens) {
          const valor_total = item.quantidade_fatura_item_produto_gravity * item.valor_unitario_fatura_item_produto_gravity
          const moeda = item.moeda_fatura_item_produto_gravity ?? params.moeda ?? atual.moeda_fatura_produto_gravity
          if (item.id_fatura_item_produto_gravity) {
            await tx.produtoGravityFaturaItem.update({
              where: { id_fatura_item_produto_gravity: item.id_fatura_item_produto_gravity },
              data: {
                id_produto_gravity:                         item.id_produto_gravity ?? null,
                descricao_fatura_item_produto_gravity:      item.descricao_fatura_item_produto_gravity,
                quantidade_fatura_item_produto_gravity:     item.quantidade_fatura_item_produto_gravity,
                valor_unitario_fatura_item_produto_gravity: item.valor_unitario_fatura_item_produto_gravity,
                valor_total_fatura_item_produto_gravity:    valor_total,
                moeda_fatura_item_produto_gravity:          moeda,
              },
            })
          } else {
            await tx.produtoGravityFaturaItem.create({
              data: {
                id_organizacao,
                id_fatura_produto_gravity,
                id_produto_gravity:                         item.id_produto_gravity ?? null,
                descricao_fatura_item_produto_gravity:      item.descricao_fatura_item_produto_gravity,
                quantidade_fatura_item_produto_gravity:     item.quantidade_fatura_item_produto_gravity,
                valor_unitario_fatura_item_produto_gravity: item.valor_unitario_fatura_item_produto_gravity,
                valor_total_fatura_item_produto_gravity:    valor_total,
                moeda_fatura_item_produto_gravity:          moeda,
              },
            })
          }
        }

        const itensFinais = await tx.produtoGravityFaturaItem.findMany({
          where: { id_fatura_produto_gravity, id_organizacao },
          select: { valor_total_fatura_item_produto_gravity: true },
        })
        const total = itensFinais.reduce((s, i) => s + Number(i.valor_total_fatura_item_produto_gravity), 0)
        dadosUpdate.valor_total_fatura_produto_gravity = total
      }

      const atualizada = await tx.produtoGravityFatura.update({
        where: { id_fatura_produto_gravity },
        data: dadosUpdate,
      })
      return paraFaturaDto(atualizada)
    })
  },
}
