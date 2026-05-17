// routes/gabiProxy.ts
// Proxy para o serviço GABI — encapsula auth e repassa chamadas do cliente
// Produto Pedido → Gabi Service (tenant isolation via headers)

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export const gabiProxyRouter = Router()

// Default alinhado com contracts.json — Gabi vive no super-server da plataforma (porta 3001).
// Porta 8015 (default antigo) nao esta mais alocada e causava ECONNREFUSED -> 500 nas
// rotas /api/v1/pedidos/gabi/* quando GABI_SERVICE_URL nao era definido no .env.
const GABI_SERVICE_URL = process.env.GABI_SERVICE_URL ?? 'http://localhost:3001'

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

// POST /api/v1/pedidos/gabi/ajuda-campo
gabiProxyRouter.post('/api/v1/pedidos/gabi/ajuda-campo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = FieldHelpBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Dados inválidos', code: 'VALIDATION_ERROR' })
      return
    }

    const tenantId = (req as any).tenantId as string
    const userId   = (req as any).userId as string ?? 'anonymous'

    const response = await fetch(`${GABI_SERVICE_URL}/api/v1/gabi/ajuda-campo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.CHAVE_INTERNA_SERVICO ?? '',
        'x-id-organizacao':    tenantId,
        'x-id-usuario':      userId,
        'x-id-produto':   'pedido',
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
        'x-internal-key': process.env.CHAVE_INTERNA_SERVICO ?? '',
        'x-id-organizacao':    tenantId,
        'x-id-usuario':      'system',
        'x-id-produto':   'pedido',
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
