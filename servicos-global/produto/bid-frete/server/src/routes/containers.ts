/**
 * containers.ts — Lista estatica de tipos de container (publico, sem auth)
 * GET /containers
 *
 * Origem: split de masterData.ts (Gamma-3).
 */

import { Router, Request, Response } from 'express'

const router = Router()

// GET /containers
router.get('/containers', (_req: Request, res: Response) => {
  res.json({
    containers: [
      { codigo: '20DRY', nome: "20' Dry Standard", teus: 1 },
      { codigo: '40DRY', nome: "40' Dry Standard", teus: 2 },
      { codigo: '40HC', nome: "40' High Cube", teus: 2 },
      { codigo: '20RF', nome: "20' Reefer", teus: 1 },
      { codigo: '40RF', nome: "40' Reefer", teus: 2 },
      { codigo: '20OT', nome: "20' Open Top", teus: 1 },
      { codigo: '40OT', nome: "40' Open Top", teus: 2 },
      { codigo: '20FR', nome: "20' Flat Rack", teus: 1 },
      { codigo: '40FR', nome: "40' Flat Rack", teus: 2 },
      { codigo: '20TK', nome: "20' Tank", teus: 1 },
    ],
  })
})

export { router as containersRouter }
