// server/routes/alertas.ts
// GET  /api/v1/alertas-erp — listar alertas inteligentes com filtros
// PATCH /api/v1/alertas-erp/:id_alerta_erp/resolver — dispensar alerta

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'

export const alertasRouter = Router()

const dismissSchema = z.object({
  dismissed_by: z.string().min(1),
})

// ---------------------------------------------------------------------------
// GET /api/v1/alertas-erp — listar alertas ativos/dispensados
// ---------------------------------------------------------------------------
alertasRouter.get('/api/v1/alertas-erp', async (req, res, next) => {
  try {
    const {
      tenant_id,
      product_id,
      type,
      severity,
      dismissed = 'false',
      limit = '20',
      offset = '0',
    } = req.query as Record<string, string>

    if (!tenant_id) {
      throw new AppError('tenant_id é obrigatório', 400, 'MISSING_TENANT_ID')
    }

    const alertas = await prisma.erpAlerta.findMany({
      where: {
        tenant_id,
        ...(product_id ? { product_id } : {}),
        ...(type ? { type } : {}),
        ...(severity ? { severity } : {}),
        dismissed: dismissed === 'true',
      },
      orderBy: [{ severity: 'desc' }, { created_at: 'desc' }],
      take: Math.min(Number(limit), 100),
      skip: Number(offset),
    })

    res.json({ ok: true, data: alertas })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/alertas-erp — criar alerta (usado internamente)
// ---------------------------------------------------------------------------
alertasRouter.post('/api/v1/alertas-erp', async (req, res, next) => {
  try {
    const schema = z.object({
      tenant_id: z.string().min(1),
      product_id: z.string().optional(),
      type: z.enum([
        'li_expiring',
        'di_delayed',
        'tax_variance',
        'ncm_quota',
        'exchange_rate',
      ]),
      title: z.string().min(1),
      description: z.string().min(1),
      severity: z.enum(['info', 'warning', 'critical']).default('warning'),
      entity_id: z.string().optional(),
    })

    const body = schema.parse(req.body)

    const alerta = await prisma.erpAlerta.create({
      data: {
        tenant_id: body.tenant_id,
        product_id: body.product_id ?? null,
        type: body.type,
        title: body.title,
        description: body.description,
        severity: body.severity,
        entity_id: body.entity_id ?? null,
      },
    })

    res.status(201).json({ ok: true, data: alerta })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR', err.errors))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/alertas-erp/:id_alerta_erp/resolver — dispensar alerta
// ---------------------------------------------------------------------------
alertasRouter.patch(
  '/api/v1/alertas-erp/:id_alerta_erp/resolver',
  async (req, res, next) => {
    try {
      const { id_alerta_erp } = req.params
      const { tenant_id } = req.query as { tenant_id: string }

      if (!tenant_id) {
        throw new AppError('tenant_id é obrigatório', 400, 'MISSING_TENANT_ID')
      }

      const body = dismissSchema.parse(req.body)

      const alerta = await prisma.erpAlerta.findFirst({
        where: { id: id_alerta_erp, tenant_id },
      })
      if (!alerta) {
        throw new AppError('Alerta não encontrado', 404, 'NOT_FOUND')
      }

      const atualizado = await prisma.erpAlerta.update({
        where: { id: id_alerta_erp },
        data: {
          dismissed: true,
          dismissed_at: new Date(),
          dismissed_by: body.dismissed_by,
        },
      })

      res.json({ ok: true, data: atualizado })
    } catch (err) {
      if (err instanceof z.ZodError) {
        return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR', err.errors))
      }
      next(err)
    }
  }
)
