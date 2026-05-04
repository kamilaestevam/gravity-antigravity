// server/routes/fatura-produto-gravity.ts
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
import multer from 'multer'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { getBillingProvider } from '../lib/billing/index.js'
import type { GravityInvoice, GravityInvoiceLineItem } from '../lib/billing/types.js'
import { faturaProdutoGravityServico } from '../services/fatura-produto-gravity-service.js'
import { faturaDocumentoProdutoGravityServico } from '../services/fatura-documento-produto-gravity-service.js'
import { getStorageAdapter } from '../lib/storage/storageAdapter.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

// Multer em memória — arquivo cai em req.file.buffer; storage adapter persiste depois.
// Limite 10MB, MIMEs aprovados pelo Coordenador (REGRA backup-policy + segurança).
const MIMES_PERMITIDOS = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/xml',
  'text/xml',
])
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!MIMES_PERMITIDOS.has(file.mimetype)) {
      cb(new AppError(`Mime não permitido: ${file.mimetype}`, 400, 'UNSUPPORTED_MIME'))
      return
    }
    cb(null, true)
  },
})

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

// ─── PATCH /api/v1/faturas/:id ───────────────────────────────────────────────
// Editar dados/itens da fatura. Apenas gravity_admin. Bloqueado em status terminal.

const atualizarFaturaSchema = z.object({
  competencia_fatura_produto_gravity:      z.string().nullable().optional(),
  data_vencimento_fatura_produto_gravity:  z.string().datetime().nullable().optional(),
  email_organizacao_fatura_produto_gravity: z.string().email().nullable().optional(),
  moeda_fatura_produto_gravity:            z.string().optional(),
  itens_fatura_produto_gravity: z.array(z.object({
    id_fatura_item_produto_gravity:             z.string().optional(),
    id_produto_gravity:                         z.string().nullable().optional(),
    descricao_fatura_item_produto_gravity:      z.string().min(1),
    quantidade_fatura_item_produto_gravity:     z.number().positive(),
    valor_unitario_fatura_item_produto_gravity: z.number().nonnegative(),
    moeda_fatura_item_produto_gravity:          z.string().optional(),
  })).optional(),
})

billingRouter.patch('/:id_fatura_produto_gravity', requireAuth, requireGravityAdmin, async (req, res, next) => {
  try {
    const body = atualizarFaturaSchema.parse(req.body)
    const fatura = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: req.params.id_fatura_produto_gravity },
      select: { id_organizacao: true },
    })
    if (!fatura) throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')

    const atualizada = await faturaProdutoGravityServico.atualizar({
      id_fatura_produto_gravity: req.params.id_fatura_produto_gravity,
      id_organizacao:            fatura.id_organizacao,
      competencia:               body.competencia_fatura_produto_gravity,
      data_vencimento:           body.data_vencimento_fatura_produto_gravity ? new Date(body.data_vencimento_fatura_produto_gravity) : body.data_vencimento_fatura_produto_gravity as null | undefined,
      email_organizacao:         body.email_organizacao_fatura_produto_gravity,
      moeda:                     body.moeda_fatura_produto_gravity,
      itens:                     body.itens_fatura_produto_gravity,
    })
    res.json({ fatura: paraFaturaResposta(atualizada) })
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/v1/faturas/:id/documentos ──────────────────────────────────────
// Lista anexos de uma fatura. Cliente vê os próprios; admin pode ver qualquer.

billingRouter.get('/:id_fatura_produto_gravity/documentos', requireAuth, async (req, res, next) => {
  try {
    const fatura = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: req.params.id_fatura_produto_gravity },
      select: { id_organizacao: true },
    })
    if (!fatura) throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')

    const isAdmin = req.auth.tipo_usuario === 'SUPER_ADMIN' || req.auth.tipo_usuario === 'ADMIN'
    if (!isAdmin && fatura.id_organizacao !== req.auth.id_organizacao) {
      throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')
    }

    const docs = await faturaDocumentoProdutoGravityServico.listar(
      fatura.id_organizacao,
      req.params.id_fatura_produto_gravity,
    )
    res.json({
      documentos_fatura_produto_gravity: docs.map(d => ({
        id_documento_fatura_produto_gravity:      d.id_documento_fatura_produto_gravity,
        tipo_documento_fatura_produto_gravity:    d.tipo_documento_fatura_produto_gravity,
        nome_documento_fatura_produto_gravity:    d.nome_documento_fatura_produto_gravity,
        url_documento_fatura_produto_gravity:     `/api/v1/faturas/${req.params.id_fatura_produto_gravity}/documentos/${d.id_documento_fatura_produto_gravity}/download`,
        tamanho_documento_fatura_produto_gravity: d.tamanho_documento_fatura_produto_gravity,
        mime_documento_fatura_produto_gravity:    d.mime_documento_fatura_produto_gravity,
        data_criacao_documento_fatura_produto_gravity: d.data_criacao_documento_fatura_produto_gravity.toISOString(),
      })),
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/v1/faturas/:id/documentos ─────────────────────────────────────
// Upload multipart. Apenas gravity_admin. Multer já validou MIME + tamanho.

const tipoDocumentoSchema = z.enum(['BOLETO', 'NFE', 'RECIBO', 'PDF_GENERICO', 'OUTRO'])

billingRouter.post('/:id_fatura_produto_gravity/documentos', requireAuth, requireGravityAdmin, upload.single('arquivo'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Arquivo não enviado (campo "arquivo")', 400, 'BAD_REQUEST')
    const tipo = tipoDocumentoSchema.parse(req.body.tipo_documento_fatura_produto_gravity)

    const fatura = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: req.params.id_fatura_produto_gravity },
      select: { id_organizacao: true },
    })
    if (!fatura) throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')

    const doc = await faturaDocumentoProdutoGravityServico.anexar({
      id_organizacao:                                     fatura.id_organizacao,
      id_fatura_produto_gravity:                          req.params.id_fatura_produto_gravity,
      tipo_documento_fatura_produto_gravity:              tipo,
      nome_documento_fatura_produto_gravity:              req.file.originalname,
      conteudo:                                           req.file.buffer,
      mime_documento_fatura_produto_gravity:              req.file.mimetype,
      id_usuario_anexou_documento_fatura_produto_gravity: req.auth.id_usuario,
    })

    res.status(201).json({
      documento_fatura_produto_gravity: {
        id_documento_fatura_produto_gravity:      doc.id_documento_fatura_produto_gravity,
        tipo_documento_fatura_produto_gravity:    doc.tipo_documento_fatura_produto_gravity,
        nome_documento_fatura_produto_gravity:    doc.nome_documento_fatura_produto_gravity,
        tamanho_documento_fatura_produto_gravity: doc.tamanho_documento_fatura_produto_gravity,
        mime_documento_fatura_produto_gravity:    doc.mime_documento_fatura_produto_gravity,
        data_criacao_documento_fatura_produto_gravity: doc.data_criacao_documento_fatura_produto_gravity.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── DELETE /api/v1/faturas/:id/documentos/:id_doc ───────────────────────────
// Soft-delete. Apenas gravity_admin.

billingRouter.delete('/:id_fatura_produto_gravity/documentos/:id_documento', requireAuth, requireGravityAdmin, async (req, res, next) => {
  try {
    const fatura = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: req.params.id_fatura_produto_gravity },
      select: { id_organizacao: true },
    })
    if (!fatura) throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')

    await faturaDocumentoProdutoGravityServico.excluirSoftDelete(
      fatura.id_organizacao,
      req.params.id_documento,
    )
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/v1/faturas/:id/documentos/:id_doc/download ─────────────────────
// Download do arquivo. Cliente vê o próprio; admin pode baixar qualquer.

billingRouter.get('/:id_fatura_produto_gravity/documentos/:id_documento/download', requireAuth, async (req, res, next) => {
  try {
    const fatura = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: req.params.id_fatura_produto_gravity },
      select: { id_organizacao: true },
    })
    if (!fatura) throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')

    const isAdmin = req.auth.tipo_usuario === 'SUPER_ADMIN' || req.auth.tipo_usuario === 'ADMIN'
    if (!isAdmin && fatura.id_organizacao !== req.auth.id_organizacao) {
      throw new AppError('Documento não encontrado', 404, 'NOT_FOUND')
    }

    const doc = await faturaDocumentoProdutoGravityServico.obterParaDownload(
      fatura.id_organizacao,
      req.params.id_documento,
    )

    const storage = getStorageAdapter()
    const path = (await import('node:path')).default
    const fs = await import('node:fs')
    const raiz = process.env.STORAGE_ANEXOS_FATURA_ROOT
      ?? path.resolve(process.cwd(), 'data/anexos-fatura')
    const caminho = path.join(raiz, doc.url_documento_fatura_produto_gravity)

    if (!fs.existsSync(caminho)) {
      throw new AppError('Arquivo físico não encontrado', 404, 'NOT_FOUND')
    }

    res.setHeader('Content-Type', doc.mime_documento_fatura_produto_gravity ?? 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.nome_documento_fatura_produto_gravity)}"`)
    fs.createReadStream(caminho).pipe(res)
    void storage // mantém referência
  } catch (err) {
    next(err)
  }
})
