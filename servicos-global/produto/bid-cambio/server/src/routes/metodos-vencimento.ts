/**
 * metodos-vencimento.ts — Catalogo publico de metodos de vencimento
 *
 * Origem: produto/bid-cambio/server/src/routes/masterData.ts (SPLIT — Gamma-3)
 * Endpoint publico (sem autenticacao):
 *   GET /api/v1/metodos-vencimento
 */

import { Router, Request, Response } from 'express'

export const metodosVencimentoRouter = Router()

const METODOS_VENCIMENTO = [
  { codigo: 'DATA_EMBARQUE', label: 'Data de Embarque' },
  { codigo: 'DATA_CHEGADA', label: 'Data de Chegada' },
  { codigo: 'DATA_REGISTRO_DI', label: 'Data de Registro da DI' },
  { codigo: 'DATA_DESEMBARACO', label: 'Data de Desembaraco' },
  { codigo: 'DATA_ENTREGA', label: 'Data de Entrega' },
  { codigo: 'PRONTIDAO_CARGA', label: 'Prontidao de Carga' },
  { codigo: 'DATA_FIXA', label: 'Data Fixa' },
]

metodosVencimentoRouter.get('/metodos-vencimento', (_req: Request, res: Response) => {
  res.json(METODOS_VENCIMENTO)
})
