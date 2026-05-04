// server/routes/billing.ts
// Histórico de faturas do tenant via BillingProvider configurado.
//
// Contrato HTTP em DDD-PT (Opção A — alinhado à refatoração de nomenclatura):
//   GET  /api/v1/faturas                              — lista de faturas da organização
//   GET  /api/v1/faturas/:id_fatura_produto_gravity   — fatura específica
//   GET  /api/v1/faturas/:id_fatura_produto_gravity/itens — composição (line items)
//
// `GravityInvoice` segue como abstração INTERNA (REGRA 4 da skill ddd-nomenclatura
// — providers Conta Azul/Itaú/Santander são sistemas externos). A camada de
// route handler traduz `GravityInvoice` → resposta DDD-PT antes de devolver ao cliente.

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { getBillingProvider } from '../lib/billing/index.js'
import type { GravityInvoice, GravityInvoiceLineItem } from '../lib/billing/types.js'
import { faturaProdutoGravityServico } from '../services/faturaProdutoGravityServico.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const billingRouter = Router()

// ─── Mappers GravityInvoice (interno) → resposta HTTP DDD-PT ────────────────

function paraFaturaResposta(gi: GravityInvoice) {
  return {
    id_fatura_produto_gravity:               gi.id,
    numero_fatura_produto_gravity:           gi.number,
    status_fatura_produto_gravity:           gi.status,
    id_organizacao:                          gi.customer.tenant_id ?? gi.customer.id,
    nome_organizacao_fatura_produto_gravity: gi.customer.name,
    email_organizacao_fatura_produto_gravity: gi.customer.email,
    valor_total_fatura_produto_gravity:      gi.amount_due_cents / 100,
    valor_pago_fatura_produto_gravity:       gi.amount_paid_cents / 100,
    moeda_fatura_produto_gravity:            gi.currency,
    data_vencimento_fatura_produto_gravity:  gi.due_date,
    competencia_fatura_produto_gravity:      gi.competencia,
    descricao_fatura_produto_gravity:        gi.description,
    url_externa_fatura_produto_gravity:      gi.hosted_url,
    data_criacao_fatura_produto_gravity:     gi.created_at,
    documentos_fatura_produto_gravity:       gi.documents.map(d => ({
      tipo_documento_fatura_produto_gravity:    d.type,
      nome_documento_fatura_produto_gravity:    d.name,
      url_documento_fatura_produto_gravity:     d.url,
      tamanho_documento_fatura_produto_gravity: d.size_bytes ?? null,
    })),
    provider_fatura_produto_gravity: gi.provider,
  }
}

function paraFaturaItemResposta(item: GravityInvoiceLineItem, idx: number) {
  return {
    posicao_fatura_item_produto_gravity:        idx,
    descricao_fatura_item_produto_gravity:      item.description,
    quantidade_fatura_item_produto_gravity:     item.quantity,
    valor_unitario_fatura_item_produto_gravity: item.amount_cents / 100,
    valor_total_fatura_item_produto_gravity:    (item.amount_cents * item.quantity) / 100,
    moeda_fatura_item_produto_gravity:          item.currency,
  }
}

// ─── Rotas ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/faturas
 * Lista de faturas da organização autenticada.
 */
billingRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const provider = getBillingProvider()
    const result = await provider.listInvoices({
      customer_id: req.auth.id_organizacao,
      limit: 24,
    })

    res.json({
      faturas:  result.invoices.map(paraFaturaResposta),
      provider: provider.name,
      paginacao: {
        cursor_proxima_fatura_produto_gravity: result.next_cursor,
        existem_mais_faturas_produto_gravity:  result.has_more,
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/faturas/:id_fatura_produto_gravity
 * Fatura específica.
 */
billingRouter.get('/:id_fatura_produto_gravity', requireAuth, async (req, res, next) => {
  try {
    const provider = getBillingProvider()
    const fatura = await provider.getInvoice(req.params.id_fatura_produto_gravity)
    if (!fatura) {
      throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')
    }
    // Verifica que a fatura pertence à organização autenticada
    const id_org_fatura = fatura.customer.tenant_id ?? fatura.customer.id
    if (id_org_fatura !== req.auth.id_organizacao) {
      throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')
    }
    res.json({ fatura: paraFaturaResposta(fatura) })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/faturas/:id_fatura_produto_gravity/itens
 * Composição (line items) da fatura. Para o provider 'gravity', vem do banco
 * via `produtoGravityFaturaItem`. Para providers externos, vem do `line_items`
 * do `GravityInvoice` (já agregado pelo provider).
 */
billingRouter.get('/:id_fatura_produto_gravity/itens', requireAuth, async (req, res, next) => {
  try {
    const provider = getBillingProvider()

    if (provider.name === 'gravity') {
      // Fonte primária — banco local (ProdutoGravityFaturaItem)
      const itens = await faturaProdutoGravityServico.listarItens(
        req.params.id_fatura_produto_gravity,
        req.auth.id_organizacao,
      )
      const fatura = await prisma.produtoGravityFatura.findFirst({
        where: {
          id_fatura_produto_gravity: req.params.id_fatura_produto_gravity,
          id_organizacao:            req.auth.id_organizacao,
        },
        select: { id_fatura_produto_gravity: true },
      })
      if (!fatura) {
        throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')
      }
      res.json({
        itens_fatura_produto_gravity: itens.map((item, idx) => ({
          id_fatura_item_produto_gravity:             item.id_fatura_item_produto_gravity,
          posicao_fatura_item_produto_gravity:        idx,
          id_produto_gravity:                         item.id_produto_gravity,
          descricao_fatura_item_produto_gravity:      item.descricao_fatura_item_produto_gravity,
          quantidade_fatura_item_produto_gravity:     Number(item.quantidade_fatura_item_produto_gravity),
          valor_unitario_fatura_item_produto_gravity: Number(item.valor_unitario_fatura_item_produto_gravity),
          valor_total_fatura_item_produto_gravity:    Number(item.valor_total_fatura_item_produto_gravity),
          moeda_fatura_item_produto_gravity:          item.moeda_fatura_item_produto_gravity,
        })),
      })
      return
    }

    // Provider externo — usa o agregado do próprio GravityInvoice
    const fatura = await provider.getInvoice(req.params.id_fatura_produto_gravity)
    if (!fatura) {
      throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')
    }
    const id_org_fatura = fatura.customer.tenant_id ?? fatura.customer.id
    if (id_org_fatura !== req.auth.id_organizacao) {
      throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')
    }
    res.json({
      itens_fatura_produto_gravity: fatura.line_items.map(paraFaturaItemResposta),
    })
  } catch (err) {
    next(err)
  }
})
