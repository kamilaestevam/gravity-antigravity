import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { tipoTaxaOrigemDestinoEnum } from '../../../shared/schemas/taxa-origem-destino.schema.js'

const router = Router()
router.use(requireInternalKey)

router.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const tipoRaw = typeof req.query.tipo === 'string' ? req.query.tipo.trim().toUpperCase() : undefined
    const tipo = tipoRaw ? tipoTaxaOrigemDestinoEnum.safeParse(tipoRaw) : undefined
    if (tipoRaw && tipo && !tipo.success) {
      throw AppError.validacao('tipo inválido — use ORIGEM, DESTINO ou FRETE')
    }
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 200
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200
    const apenasAtivos = req.query.apenas_ativos !== 'false'

    const where: Prisma.TaxaOrigemDestinoWhereInput = {
      ...(apenasAtivos ? { ativo_taxa_origem_destino: true } : {}),
      ...(tipo?.success ? { tipo_taxa_origem_destino: tipo.data } : {}),
      ...(q
        ? {
            OR: [
              { nome_taxa_origem_destino: { contains: q, mode: 'insensitive' } },
              { codigo_taxa_origem_destino: { contains: q.toUpperCase() } },
            ],
          }
        : {}),
    }

    const [itens, total] = await Promise.all([
      prisma.taxaOrigemDestino.findMany({
        where,
        take: limit,
        orderBy: [{ tipo_taxa_origem_destino: 'asc' }, { nome_taxa_origem_destino: 'asc' }],
      }),
      prisma.taxaOrigemDestino.count({ where }),
    ])

    res.status(200).json({ itens, total })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const apenasAtivos = req.query.apenas_ativos !== 'false'
    const id = req.params.id
    const taxa = await prisma.taxaOrigemDestino.findFirst({
      where: {
        OR: [{ id_taxa_origem_destino: id }, { codigo_taxa_origem_destino: id.toUpperCase() }],
      },
    })
    if (!taxa || (apenasAtivos && !taxa.ativo_taxa_origem_destino)) {
      throw AppError.naoEncontrado('Taxa origem/destino')
    }
    res.status(200).json(taxa)
  } catch (err) {
    next(err)
  }
})

export { router as taxasOrigemDestinoRouter }
