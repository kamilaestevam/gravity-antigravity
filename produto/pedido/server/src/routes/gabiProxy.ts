// routes/gabiProxy.ts
// Proxy para o serviço GABI — encapsula auth e repassa chamadas do cliente
// Produto Pedido → Gabi Service (tenant isolation via headers)

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export const gabiProxyRouter = Router()

const GABI_SERVICE_URL = process.env.GABI_SERVICE_URL ?? 'http://localhost:8015'

const FieldHelpBodySchema = z.object({
  campo: z.object({
    chave:     z.string().min(1).max(100),
    label:     z.string().min(1).max(100),
    descricao: z.string().max(500).optional(),
    unidade:   z.string().max(50).optional(),
    papel:     z.string().max(50).optional(),
    tipo:      z.string().max(50).optional(),
  }),
  produto:           z.string().min(1).max(100),
  contextoAdicional: z.string().max(1000).optional(),
})

// POST /api/v1/pedidos/gabi/field-help
gabiProxyRouter.post('/api/v1/pedidos/gabi/field-help', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = FieldHelpBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Dados inválidos', code: 'VALIDATION_ERROR' })
      return
    }

    const tenantId = (req as any).tenantId as string
    const userId   = (req as any).userId as string ?? 'anonymous'

    const response = await fetch(`${GABI_SERVICE_URL}/api/v1/gabi/field-help`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_SERVICE_KEY ?? '',
        'x-tenant-id':    tenantId,
        'x-user-id':      userId,
        'x-product-id':   'pedido',
        'x-gabi-quota':   process.env.GABI_QUOTA_PEDIDO ?? '50000',
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(15_000),
    })

    const data = await response.json() as unknown

    if (!response.ok) {
      res.status(response.status).json(data)
      return
    }

    res.json(data)
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/pedidos/gabi/quota
gabiProxyRouter.get('/api/v1/pedidos/gabi/quota', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId as string

    const response = await fetch(`${GABI_SERVICE_URL}/api/v1/gabi/quota`, {
      headers: {
        'x-internal-key': process.env.INTERNAL_SERVICE_KEY ?? '',
        'x-tenant-id':    tenantId,
        'x-user-id':      'system',
        'x-product-id':   'pedido',
        'x-gabi-quota':   process.env.GABI_QUOTA_PEDIDO ?? '50000',
      },
      signal: AbortSignal.timeout(5_000),
    })

    const data = await response.json() as unknown
    res.json(data)
  } catch (err) {
    next(err)
  }
})
