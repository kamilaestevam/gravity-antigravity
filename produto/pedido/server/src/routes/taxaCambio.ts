/**
 * taxaCambio.ts — Proxy para o serviço de taxas de câmbio do Configurador
 *
 * GET  /api/v1/taxas-cambio              → configurador: taxas mais recentes (do DB)
 * GET  /api/v1/taxas-cambio/historico    → configurador: histórico por moeda
 * POST /api/v1/taxas-cambio/sincronizar  → configurador: sincroniza PTAX do BCB
 */

import { Router, Request, Response, NextFunction } from 'express'

export const taxaCambioRouter = Router()

const CONFIGURADOR_URL = process.env.CONFIGURADOR_URL ?? 'http://localhost:8005'

taxaCambioRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await fetch(`${CONFIGURADOR_URL}/api/v1/taxa-cambio`, { signal: AbortSignal.timeout(15000) })
    res.status(r.status).json(await r.json())
  } catch (err) {
    next(err)
  }
})

taxaCambioRouter.get('/historico', async (req: Request, res: Response, next: NextFunction) => {
  const { moeda = 'USD', dias = '30' } = req.query as Record<string, string>
  try {
    const r = await fetch(`${CONFIGURADOR_URL}/api/v1/taxa-cambio/historico?moeda=${moeda}&dias=${dias}`, { signal: AbortSignal.timeout(15000) })
    res.status(r.status).json(await r.json())
  } catch (err) {
    next(err)
  }
})

taxaCambioRouter.post('/sincronizar', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await fetch(`${CONFIGURADOR_URL}/api/v1/taxa-cambio/sync`, { method: 'POST', signal: AbortSignal.timeout(60000) })
    res.status(r.status).json(await r.json())
  } catch (err) {
    next(err)
  }
})
