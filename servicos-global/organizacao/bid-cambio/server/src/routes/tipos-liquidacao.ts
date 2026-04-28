/**
 * tipos-liquidacao.ts — Catalogo publico de tipos de liquidacao
 *
 * Origem: produto/bid-cambio/server/src/routes/masterData.ts (SPLIT — Gamma-3)
 * Endpoint publico (sem autenticacao):
 *   GET /api/v1/tipos-liquidacao
 */

import { Router, Request, Response } from 'express'

export const tiposLiquidacaoRouter = Router()

const LIQUIDACOES = [
  { codigo: 'D0', label: 'D+0 (mesmo dia)' },
  { codigo: 'D1', label: 'D+1 (1 dia util)' },
  { codigo: 'D2', label: 'D+2 (2 dias uteis)' },
]

tiposLiquidacaoRouter.get('/tipos-liquidacao', (_req: Request, res: Response) => {
  res.json(LIQUIDACOES)
})
