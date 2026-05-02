/**
 * moedas.ts — Catalogo publico de moedas suportadas
 *
 * Origem: produto/bid-cambio/server/src/routes/masterData.ts (SPLIT — Gamma-3)
 * Endpoint publico (sem autenticacao):
 *   GET /api/v1/moedas
 */

import { Router, Request, Response } from 'express'

export const moedasRouter = Router()

const MOEDAS = [
  { codigo: 'USD', nome: 'Dolar Americano', simbolo: 'US$', codigoBcb: 61 },
  { codigo: 'EUR', nome: 'Euro', simbolo: '€', codigoBcb: 222 },
  { codigo: 'GBP', nome: 'Libra Esterlina', simbolo: '£', codigoBcb: 178 },
  { codigo: 'CHF', nome: 'Franco Suico', simbolo: 'CHF', codigoBcb: 425 },
  { codigo: 'CNY', nome: 'Yuan Chines', simbolo: '¥', codigoBcb: 4 },
  { codigo: 'JPY', nome: 'Iene Japones', simbolo: '¥', codigoBcb: 470 },
  { codigo: 'BRL', nome: 'Real Brasileiro', simbolo: 'R$', codigoBcb: null },
]

moedasRouter.get('/moedas', (_req: Request, res: Response) => {
  res.json(MOEDAS)
})
