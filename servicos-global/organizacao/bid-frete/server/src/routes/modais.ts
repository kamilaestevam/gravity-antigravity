/**
 * modais.ts — Lista estatica de modais e modalidades (publico, sem auth)
 * GET /modais
 *
 * Origem: split de masterData.ts (Gamma-3).
 */

import { Router, Request, Response } from 'express'

const router = Router()

// GET /modais
router.get('/modais', (_req: Request, res: Response) => {
  res.json({
    modais: [
      { codigo: 'MARITIMO', nome: 'Maritimo', modalidades: [
        { codigo: 'FCL', nome: 'Full Container Load' },
        { codigo: 'LCL', nome: 'Less than Container Load' },
      ]},
      { codigo: 'AEREO', nome: 'Aereo', modalidades: [
        { codigo: 'AEREO_GERAL', nome: 'Carga Geral' },
      ]},
      { codigo: 'RODOVIARIO', nome: 'Rodoviario', modalidades: [
        { codigo: 'RODOVIARIO_FTL', nome: 'Full Truck Load' },
        { codigo: 'RODOVIARIO_LTL', nome: 'Less than Truck Load' },
      ]},
    ],
  })
})

export { router as modaisRouter }
