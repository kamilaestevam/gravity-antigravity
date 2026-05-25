/**
 * Catálogo de Portos — fonte única UN/LOCODE (cadastros.porto).
 * Read-only via API para dropdowns e validação cruzada no Pedido.
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'

const router = Router()
router.use(requireInternalKey)

router.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const pais = typeof req.query.pais === 'string' ? req.query.pais.trim().toUpperCase() : undefined
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 200
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200
    const apenasAtivos = req.query.apenas_ativos !== 'false'

    const where: Prisma.PortoWhereInput = {
      ...(apenasAtivos ? { ativo_porto: true } : {}),
      ...(pais ? { codigo_pais_porto: pais } : {}),
      ...(q
        ? {
            OR: [
              { codigo_unlocode_porto: { contains: q.toUpperCase() } },
              { nome_porto: { contains: q, mode: 'insensitive' } },
              { nome_ascii_porto: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [itens, total] = await Promise.all([
      prisma.porto.findMany({
        where,
        take: limit,
        orderBy: [{ codigo_pais_porto: 'asc' }, { nome_porto: 'asc' }],
      }),
      prisma.porto.count({ where }),
    ])

    res.status(200).json({ itens, total })
  } catch (err) {
    next(err)
  }
})

router.get('/:codigo', async (req, res, next) => {
  try {
    const codigo = req.params.codigo.toUpperCase()
    const apenasAtivos = req.query.apenas_ativos !== 'false'
    const porto = await prisma.porto.findFirst({
      where: {
        OR: [
          { codigo_unlocode_porto: codigo },
          { codigo_iata_porto: codigo },
        ],
      },
    })
    if (!porto || (apenasAtivos && !porto.ativo_porto)) {
      throw AppError.naoEncontrado('Porto')
    }
    res.status(200).json(porto)
  } catch (err) {
    next(err)
  }
})

export { router as portosRouter }
