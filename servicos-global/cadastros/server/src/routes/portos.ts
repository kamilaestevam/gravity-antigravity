/**
 * Catálogo de Portos — fonte única UN/LOCODE (cadastros.porto).
 * Read-only via API para dropdowns e validação cruzada no Pedido.
 */
import { Router } from 'express'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import {
  filtrarCodigosPaisPorBuscaPorto,
  montarWhereBuscaPaisPorTermoPorto,
  montarWhereBuscaPortoCadastros,
} from '../lib/busca-porto-por-pais-cadastros.js'

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

    let paisesReferencia: Awaited<ReturnType<typeof prisma.pais.findMany>> = []
    let codigosPaisResolvidos: string[] = []
    if (q) {
      paisesReferencia = await prisma.pais.findMany({
        where: montarWhereBuscaPaisPorTermoPorto(q),
        select: {
          codigo_pais_iso_alpha2: true,
          codigo_pais_iso_alpha3: true,
          nome_pais_portugues: true,
          nome_pais_ingles: true,
        },
      })
      codigosPaisResolvidos = filtrarCodigosPaisPorBuscaPorto(q, paisesReferencia)
    }

    const where = montarWhereBuscaPortoCadastros({
      q,
      paisFiltro: pais,
      apenasAtivos,
      codigosPaisResolvidos,
      paisesReferencia,
    })

    const [itens, total] = await Promise.all([
      prisma.porto.findMany({
        where,
        skip,
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
