// server/routes/fieldHelp.ts
// POST /api/v1/gabi/field-help — explicação contextual de campo (on-demand, consome tokens)
// GET  /api/v1/gabi/quota      — status da quota do tenant no mês atual

import { Router } from 'express'
import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AppError } from '../lib/errors.js'
import { checkQuota, registerTokens, getQuotaInfo } from '../services/quotaService.js'
import { buildFieldHelpPrompt } from '../services/fieldHelpPrompt.js'
import { fieldHelpRateLimit } from '../middleware/fieldHelpRateLimit.js'

export const fieldHelpRouter = Router()

// ── POST /api/v1/gabi/internal/quota-reset (internal — no tenant auth) ───────
// Chamado pelo configurador no dia 1 de cada mês via pg-boss

fieldHelpRouter.post('/api/v1/gabi/internal/quota-reset', async (req, res, next) => {
  try {
    const internalKey = req.headers['x-internal-key']
    if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
      throw new AppError('Chave interna inválida', 401, 'UNAUTHORIZED')
    }

    // Mês que acabou de passar
    const now = new Date()
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const mesRef = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

    const { resetQuotaMensal } = await import('../services/quotaService.js')
    const count = await resetQuotaMensal(mesRef)

    console.log(`[gabi] quota-reset: ${count} registros zerados para ${mesRef}`)
    res.json({ ok: true, mes_ref: mesRef, registros_zerados: count })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/v1/gabi/admin/products/:productId/tokens/stats ──────────────────
// Agrega consumo de todos os tenants para um produto — usado pela aba Tokens do Admin

fieldHelpRouter.get('/api/v1/gabi/admin/products/:productId/tokens/stats', async (req, res, next) => {
  try {
    const internalKey = req.headers['x-internal-key']
    if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
      throw new AppError('Chave interna inválida', 401, 'UNAUTHORIZED')
    }

    const { productId } = req.params
    const now = new Date()
    const mesRef = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const prismaModule = await import('../lib/prisma.js')
    const prismaClient = prismaModule.default

    // Agrega por tenant para o mês atual
    const quotas = await prismaClient.gabiTokenQuota.findMany({
      where: { product_id: productId, mes_ref: mesRef },
    })

    const totalConsumido = quotas.reduce((s: number, q: any) => s + q.tokens_usados, 0)
    const totalTenants = quotas.length
    const mediaPorTenant = totalTenants > 0 ? Math.round(totalConsumido / totalTenants) : 0
    const maiorConsumo = quotas.reduce(
      (max: any, q: any) => (!max || q.tokens_usados > max.tokens_usados ? q : max),
      null as any,
    )

    res.json({
      mes_ref: mesRef,
      total_consumido: totalConsumido,
      total_tenants: totalTenants,
      media_por_tenant: mediaPorTenant,
      maior_consumo: maiorConsumo
        ? { tenant_id: maiorConsumo.tenant_id, tokens: maiorConsumo.tokens_usados }
        : null,
    })
  } catch (err) {
    next(err)
  }
})

const GEMINI_MODEL = 'gemini-2.5-flash'
const DEFAULT_QUOTA = Number(process.env.GABI_DEFAULT_QUOTA ?? 50_000)

// ── Schemas ─────────────────────────────────────────────────────────────────

const CampoMetaSchema = z.object({
  chave:     z.string().min(1).max(100),
  label:     z.string().min(1).max(100),
  descricao: z.string().max(500).optional(),
  unidade:   z.string().max(50).optional(),
  papel:     z.string().max(50).optional(),
  tipo:      z.string().max(50).optional(),
})

const FieldHelpBodySchema = z.object({
  campo:             CampoMetaSchema,
  produto:           z.string().min(1).max(100),
  contextoAdicional: z.string().max(1000).optional(),
})

// ── Helpers ─────────────────────────────────────────────────────────────────

function getQuotaMensalFromHeaders(req: any): number {
  const headerVal = req.headers['x-gabi-quota'] as string | undefined
  if (headerVal) {
    const parsed = parseInt(headerVal, 10)
    if (!isNaN(parsed) && parsed > 0) return parsed
  }
  return DEFAULT_QUOTA
}

// ── POST /api/v1/gabi/field-help ─────────────────────────────────────────────

fieldHelpRouter.post('/api/v1/gabi/field-help', fieldHelpRateLimit, async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth
    const productId = (req.headers['x-product-id'] as string | undefined) ?? 'unknown'
    const quotaMensal = getQuotaMensalFromHeaders(req)

    // 1. Validar body
    const parsed = FieldHelpBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }
    const { campo, produto, contextoAdicional } = parsed.data

    // 2. Verificar quota
    const quota = await checkQuota(tenantId, productId, quotaMensal)
    if (quota.esgotado) {
      throw new AppError('Quota de tokens esgotada para este mês', 403, 'QUOTA_ESGOTADA')
    }

    // 3. Chamar Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new AppError('GEMINI_API_KEY não configurada', 500, 'GEMINI_NOT_CONFIGURED')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 300,
        responseMimeType: 'application/json',
      },
    })

    const systemPrompt = buildFieldHelpPrompt({ campo, produto, contextoAdicional })
    const result = await model.generateContent(systemPrompt)
    const responseText = result.response.text()

    // 4. Parse da resposta JSON
    let gabiResponse: { titulo: string; texto: string; exemplo?: string }
    try {
      gabiResponse = JSON.parse(responseText)
      if (!gabiResponse.titulo || !gabiResponse.texto) {
        throw new Error('Resposta incompleta')
      }
    } catch {
      // Fallback se Gemini não retornar JSON válido
      gabiResponse = {
        titulo: `Sobre ${campo.label}`,
        texto: responseText.slice(0, 400),
      }
    }

    // 5. Registrar tokens
    const tokensInput  = result.response.usageMetadata?.promptTokenCount    ?? 400
    const tokensOutput = result.response.usageMetadata?.candidatesTokenCount ?? 100

    await registerTokens({
      tenantId,
      productId,
      userId,
      campo: campo.chave,
      tokensInput,
      tokensOutput,
      quotaMensal,
    })

    // 6. Retornar resultado com quota atualizada
    const quotaAtualizada = await getQuotaInfo(tenantId, productId, quotaMensal)

    res.json({
      titulo: gabiResponse.titulo,
      texto:  gabiResponse.texto,
      exemplo: gabiResponse.exemplo,
      quota: {
        tokens_usados: quotaAtualizada.tokens_usados,
        quota_mensal:  quotaAtualizada.quota_mensal,
        percentual:    quotaAtualizada.percentual,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/v1/gabi/quota ───────────────────────────────────────────────────

fieldHelpRouter.get('/api/v1/gabi/quota', async (req, res, next) => {
  try {
    const { tenantId } = req.auth
    const productId = (req.headers['x-product-id'] as string | undefined) ?? 'unknown'
    const quotaMensal = getQuotaMensalFromHeaders(req)

    const quota = await getQuotaInfo(tenantId, productId, quotaMensal)

    res.json({ quota })
  } catch (err) {
    next(err)
  }
})
