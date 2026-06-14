/**
 * Catálogo de Mercadorias Perigosas — fonte única ONU (cadastros.mercadoria_perigosa).
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
    const classeRaw = typeof req.query.classe === 'string' ? Number(req.query.classe) : undefined
    const classe = Number.isFinite(classeRaw) ? classeRaw : undefined
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 200
    const limiteMax = q || classe ? 500 : 10_000
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), limiteMax) : 200
    const apenasAtivos = req.query.apenas_ativos !== 'false'

    const where: Prisma.MercadoriaPerigosaWhereInput = {
      ...(apenasAtivos ? { ativo_mercadoria_perigosa: true } : {}),
      ...(classe ? { classe_mercadoria_perigosa: classe } : {}),
      ...(q
        ? {
            OR: [
              { numero_onu_mercadoria_perigosa: { contains: q } },
              { nome_tecnico_embarque_mercadoria_perigosa: { contains: q, mode: 'insensitive' } },
              { nome_ascii_mercadoria_perigosa: { contains: q.toUpperCase() } },
              { nome_ingles_mercadoria_perigosa: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [itens, total] = await Promise.all([
      prisma.mercadoriaPerigosa.findMany({
        where,
        take: limit,
        orderBy: [{ numero_onu_mercadoria_perigosa: 'asc' }, { nome_ascii_mercadoria_perigosa: 'asc' }],
      }),
      prisma.mercadoriaPerigosa.count({ where }),
    ])

    res.status(200).json({ itens, total })
  } catch (err) {
    next(err)
  }
})

router.get('/:codigo', async (req, res, next) => {
  try {
    const codigo = req.params.codigo.replace(/^UN/i, '').trim()
    const apenasAtivos = req.query.apenas_ativos !== 'false'
    const itens = await prisma.mercadoriaPerigosa.findMany({
      where: {
        numero_onu_mercadoria_perigosa: codigo,
        ...(apenasAtivos ? { ativo_mercadoria_perigosa: true } : {}),
      },
      orderBy: [{ nome_ascii_mercadoria_perigosa: 'asc' }],
    })
    if (itens.length === 0) {
      throw AppError.naoEncontrado('Mercadoria perigosa')
    }
    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

export { router as mercadoriasPerigosasRouter }
