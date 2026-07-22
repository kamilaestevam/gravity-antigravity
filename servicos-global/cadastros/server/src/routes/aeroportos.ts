/**
 * Catálogo de Aeroportos — fonte única IATA/UN/LOCODE (cadastros.aeroporto).
 * Read-only via API para dropdowns e validação cruzada no Pedido.
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { montarOrBuscaTextoAeroportoCadastros } from '../lib/busca-porto-por-pais-cadastros.js'

const router = Router()
router.use(requireInternalKey)

router.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const pais = typeof req.query.pais === 'string' ? req.query.pais.trim().toUpperCase() : undefined
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 200
    const offsetRaw = typeof req.query.offset === 'string' ? Number(req.query.offset) : 0
    const limiteMax = q || pais ? 500 : 10_000
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), limiteMax) : 200
    const skip = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0
    const apenasAtivos = req.query.apenas_ativos !== 'false'

    const where: Prisma.AeroportoWhereInput = {
      ...(apenasAtivos ? { ativo_aeroporto: true } : {}),
      ...(pais ? { codigo_pais_aeroporto: pais } : {}),
      ...(q ? { OR: montarOrBuscaTextoAeroportoCadastros(q) } : {}),
    }

    const [itens, total] = await Promise.all([
      prisma.aeroporto.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ codigo_pais_aeroporto: 'asc' }, { nome_aeroporto: 'asc' }],
      }),
      prisma.aeroporto.count({ where }),
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
    const aeroporto = await prisma.aeroporto.findFirst({
      where: {
        OR: [
          { codigo_unlocode_aeroporto: codigo },
          { codigo_iata_aeroporto: codigo },
        ],
      },
    })
    if (!aeroporto || (apenasAtivos && !aeroporto.ativo_aeroporto)) {
      throw AppError.naoEncontrado('Aeroporto')
    }
    res.status(200).json(aeroporto)
  } catch (err) {
    next(err)
  }
})

export { router as aeroportosRouter }
