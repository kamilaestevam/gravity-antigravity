/**
 * paises.ts — Lista estatica de paises (publico, sem auth)
 * GET /paises
 *
 * Origem: split de masterData.ts (Gamma-3).
 */

import { Router, Request, Response } from 'express'

const router = Router()

// GET /paises
router.get('/paises', (_req: Request, res: Response) => {
  res.json({
    paises: [
      { codigo: 'BR', nome: 'Brasil' }, { codigo: 'CN', nome: 'China' },
      { codigo: 'US', nome: 'Estados Unidos' }, { codigo: 'DE', nome: 'Alemanha' },
      { codigo: 'JP', nome: 'Japao' }, { codigo: 'KR', nome: 'Coreia do Sul' },
      { codigo: 'IN', nome: 'India' }, { codigo: 'IT', nome: 'Italia' },
      { codigo: 'FR', nome: 'Franca' }, { codigo: 'GB', nome: 'Reino Unido' },
      { codigo: 'ES', nome: 'Espanha' }, { codigo: 'NL', nome: 'Holanda' },
      { codigo: 'BE', nome: 'Belgica' }, { codigo: 'AR', nome: 'Argentina' },
      { codigo: 'CL', nome: 'Chile' }, { codigo: 'MX', nome: 'Mexico' },
      { codigo: 'CO', nome: 'Colombia' }, { codigo: 'PE', nome: 'Peru' },
      { codigo: 'TW', nome: 'Taiwan' }, { codigo: 'TH', nome: 'Tailandia' },
      { codigo: 'VN', nome: 'Vietna' }, { codigo: 'MY', nome: 'Malasia' },
      { codigo: 'SG', nome: 'Cingapura' }, { codigo: 'AE', nome: 'Emirados Arabes' },
      { codigo: 'TR', nome: 'Turquia' }, { codigo: 'ZA', nome: 'Africa do Sul' },
      { codigo: 'AU', nome: 'Australia' }, { codigo: 'CA', nome: 'Canada' },
      { codigo: 'PT', nome: 'Portugal' }, { codigo: 'PY', nome: 'Paraguai' },
    ],
  })
})

export { router as paisesRouter }
