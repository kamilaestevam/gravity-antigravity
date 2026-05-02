/**
 * portos.ts — Cadastro de portos/aeroportos (publico, sem auth)
 * GET /portos          Buscar portos/aeroportos
 *
 * Origem: split de masterData.ts (Gamma-3) — esta rota e a unica que toca o banco.
 */

import { Router, Request, Response } from 'express'
import { prisma } from '../middleware/tenantIsolation.js'

const router = Router()

// GET /portos?q=&tipo=&pais=
router.get('/portos', async (req: Request, res: Response) => {
  try {
    const { q, tipo, pais, limit = '50' } = req.query as { q?: string; tipo?: string; pais?: string; limit?: string }

    const where: Record<string, unknown> = { ativo: true }
    if (tipo) where.tipo = tipo
    if (pais) where.pais_codigo = pais
    if (q) {
      where.OR = [
        { nome: { contains: q, mode: 'insensitive' } },
        { codigo: { contains: q.toUpperCase() } },
      ]
    }

    const portos = await (prisma as any).freteIntBidPortosCadastro.findMany({
      where,
      take: Number(limit),
      orderBy: { nome: 'asc' },
    })

    res.json({ portos })
  } catch {
    res.json({ portos: [] })
  }
})

export { router as portosRouter }
