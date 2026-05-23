/**
 * moedas.ts — Lista estatica de moedas (publico, sem auth)
 * GET /moedas
 *
 * Origem: split de masterData.ts (Gamma-3).
 */

import { Router, Request, Response } from 'express'

const router = Router()

// GET /moedas
router.get('/moedas', (_req: Request, res: Response) => {
  res.json({
    moedas: [
      { codigo: 'USD', nome: 'Dolar Americano', simbolo: '$' },
      { codigo: 'BRL', nome: 'Real Brasileiro', simbolo: 'R$' },
      { codigo: 'EUR', nome: 'Euro', simbolo: '€' },
      { codigo: 'CNY', nome: 'Yuan Chines', simbolo: '¥' },
      { codigo: 'GBP', nome: 'Libra Esterlina', simbolo: '£' },
      { codigo: 'JPY', nome: 'Iene Japones', simbolo: '¥' },
    ],
  })
})

export { router as moedasRouter }
