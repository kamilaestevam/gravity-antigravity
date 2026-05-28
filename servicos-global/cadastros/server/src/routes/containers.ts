/**
 * Catálogo de Containers — fonte única ISO 6346 (cadastros.container).
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'

const router = Router()
router.use(requireInternalKey)

router.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 200
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200
    const apenasAtivos = req.query.apenas_ativos !== 'false'

    const where: Prisma.ContainerWhereInput = {
      ...(apenasAtivos ? { ativo_container: true } : {}),
      ...(q
        ? {
            OR: [
              { codigo_iso_container: { contains: q.toUpperCase() } },
              { tamanho_container: { contains: q, mode: 'insensitive' } },
              { armador_dono_container: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [itens, total] = await Promise.all([
      prisma.container.findMany({
        where,
        take: limit,
        orderBy: [{ tipo_container: 'asc' }, { tamanho_container: 'asc' }],
      }),
      prisma.container.count({ where }),
    ])

    res.status(200).json({ itens, total })
  } catch (err) {
    next(err)
  }
})

export { router as containersRouter }
