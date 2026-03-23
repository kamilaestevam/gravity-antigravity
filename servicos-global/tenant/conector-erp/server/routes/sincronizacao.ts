// server/routes/sincronizacao.ts
// POST /api/v1/erp/sincronizar — disparar sincronização
// GET  /api/v1/erp/sincronizacoes — listar logs de sincronização

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { executeODataQuery } from '../services/erp-client.js'
import { AppError } from '../lib/app-error.js'

export const sincronizacaoRouter = Router()

const sincronizarSchema = z.object({
  tenant_id: z.string().min(1),
  product_id: z.string().optional(),
  entity: z.string().min(1, 'Entidade OData é obrigatória'),
  filter: z.string().optional(),
  select: z.array(z.string()).optional(),
  top: z.number().int().max(10_000).optional(),
  triggered_by: z.string().default('system'),
})

// ---------------------------------------------------------------------------
// POST /api/v1/erp/sincronizar — executar sincronização OData
// ---------------------------------------------------------------------------
sincronizacaoRouter.post('/api/v1/erp/sincronizar', async (req, res, next) => {
  try {
    const body = sincronizarSchema.parse(req.body)

    // Criar log de sincronização
    const log = await prisma.sincronizacaoLog.create({
      data: {
        tenant_id: body.tenant_id,
        product_id: body.product_id ?? null,
        mode: 'erp',
        triggered_by: body.triggered_by,
        status: 'running',
      },
    })

    // Executar query assíncrona (não bloquear response)
    const run = async () => {
      try {
        const result = await executeODataQuery(
          body.tenant_id,
          body.product_id ?? null,
          {
            entity: body.entity,
            filter: body.filter,
            select: body.select,
            top: body.top,
          },
          body.triggered_by
        )

        await prisma.sincronizacaoLog.update({
          where: { id: log.id },
          data: {
            rows_processed: result.rowsReturned,
            rows_success: result.rowsReturned,
            rows_failed: 0,
            status: 'success',
            finished_at: new Date(),
          },
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        await prisma.sincronizacaoLog.update({
          where: { id: log.id },
          data: {
            status: 'failed',
            error_details: { message: errorMessage },
            finished_at: new Date(),
          },
        })
      }
    }

    // Disparar em background
    run().catch(console.error)

    res.status(202).json({
      ok: true,
      message: 'Sincronização iniciada',
      data: { logId: log.id, status: 'running' },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR', err.errors))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /api/v1/erp/sincronizacoes — listar logs com filtros
// ---------------------------------------------------------------------------
sincronizacaoRouter.get('/api/v1/erp/sincronizacoes', async (req, res, next) => {
  try {
    const { tenant_id, product_id, status, limit = '20', offset = '0' } =
      req.query as Record<string, string>

    if (!tenant_id) {
      throw new AppError('tenant_id é obrigatório', 400, 'MISSING_TENANT_ID')
    }

    const logs = await prisma.sincronizacaoLog.findMany({
      where: {
        tenant_id,
        ...(product_id ? { product_id } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { started_at: 'desc' },
      take: Math.min(Number(limit), 100),
      skip: Number(offset),
    })

    res.json({ ok: true, data: logs })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /api/v1/erp/sincronizacoes/:id — detalhe de uma sincronização
// ---------------------------------------------------------------------------
sincronizacaoRouter.get('/api/v1/erp/sincronizacoes/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { tenant_id } = req.query as { tenant_id: string }

    if (!tenant_id) {
      throw new AppError('tenant_id é obrigatório', 400, 'MISSING_TENANT_ID')
    }

    const log = await prisma.sincronizacaoLog.findFirst({
      where: { id, tenant_id },
    })

    if (!log) {
      throw new AppError('Log de sincronização não encontrado', 404, 'NOT_FOUND')
    }

    res.json({ ok: true, data: log })
  } catch (err) {
    next(err)
  }
})
