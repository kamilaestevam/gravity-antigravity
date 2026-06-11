/**
 * Routes CambioSiscomex — catálogo GLOBAL Portal Único / BACEN.
 * Cobertura cambial + modalidade de pagamento (sem id_organizacao).
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { cambioSiscomexSchema, tipoCambioSiscomexEnum } from '../../../shared/schemas/index.js'

const router = Router()
router.use(requireInternalKey)

const criarSchema = cambioSiscomexSchema.extend({
  ativo_cambio_siscomex: cambioSiscomexSchema.shape.ativo_cambio_siscomex.default(true),
  ordem_cambio_siscomex: cambioSiscomexSchema.shape.ordem_cambio_siscomex.default(0),
})
const atualizarSchema = cambioSiscomexSchema.partial().omit({ codigo_cambio_siscomex: true })

router.post('/', async (req, res, next) => {
  try {
    const dados = criarSchema.parse(req.body)
    const criado = await prisma.cambioSiscomex.create({ data: dados })
    res.status(201).json(criado)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Cambio Siscomex já cadastrado (codigo duplicado)'))
    }
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const apenasAtivos = req.query.apenas_ativos === 'true'
    const tipoRaw = typeof req.query.tipo === 'string' ? req.query.tipo : undefined
    const tipo = tipoRaw ? tipoCambioSiscomexEnum.parse(tipoRaw) : undefined
    const itens = await prisma.cambioSiscomex.findMany({
      where: {
        ...(apenasAtivos ? { ativo_cambio_siscomex: true } : {}),
        ...(tipo ? { tipo_cambio_siscomex: tipo } : {}),
      },
      orderBy: [{ ordem_cambio_siscomex: 'asc' }, { codigo_cambio_siscomex: 'asc' }],
    })
    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

router.get('/:codigo_cambio_siscomex', async (req, res, next) => {
  try {
    const item = await prisma.cambioSiscomex.findUnique({
      where: { codigo_cambio_siscomex: req.params.codigo_cambio_siscomex },
    })
    if (!item) throw AppError.naoEncontrado('Cambio Siscomex')
    res.status(200).json(item)
  } catch (err) {
    next(err)
  }
})

router.put('/:codigo_cambio_siscomex', async (req, res, next) => {
  try {
    const dados = atualizarSchema.parse(req.body)
    const existente = await prisma.cambioSiscomex.findUnique({
      where: { codigo_cambio_siscomex: req.params.codigo_cambio_siscomex },
    })
    if (!existente) throw AppError.naoEncontrado('Cambio Siscomex')
    const atualizado = await prisma.cambioSiscomex.update({
      where: { codigo_cambio_siscomex: existente.codigo_cambio_siscomex },
      data: dados,
    })
    res.status(200).json(atualizado)
  } catch (err) {
    next(err)
  }
})

router.delete('/:codigo_cambio_siscomex', async (req, res, next) => {
  try {
    const existente = await prisma.cambioSiscomex.findUnique({
      where: { codigo_cambio_siscomex: req.params.codigo_cambio_siscomex },
    })
    if (!existente) throw AppError.naoEncontrado('Cambio Siscomex')
    await prisma.cambioSiscomex.update({
      where: { codigo_cambio_siscomex: existente.codigo_cambio_siscomex },
      data: { ativo_cambio_siscomex: false },
    })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export { router as cambioSiscomexRouter }
