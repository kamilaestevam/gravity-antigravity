/**
 * Routes Incoterm — catálogo GLOBAL Incoterms 2020 da ICC (sem id_organizacao).
 *
 * Read-only de runtime: produtos consomem GET /api/v1/cadastros/incoterms para
 * popular dropdowns + GET /api/v1/cadastros/incoterms/:codigo para validar
 * cruzado no create/update de Pedido.
 *
 * POST/PUT/DELETE existem para gestão admin (não há UI ainda — gerencia via
 * seed-incoterms.ts). Soft delete via `ativo_incoterm = false`.
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { incotermSchema } from '../../../shared/schemas/index.js'

const router = Router()
router.use(requireInternalKey)

const criarIncotermSchema = incotermSchema.extend({
  ativo_incoterm: incotermSchema.shape.ativo_incoterm.default(true),
})
const atualizarIncotermSchema = incotermSchema.partial().omit({ codigo_incoterm: true })

router.post('/', async (req, res, next) => {
  try {
    const dados = criarIncotermSchema.parse(req.body)
    const criado = await prisma.incoterm.create({ data: dados })
    res.status(201).json(criado)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Incoterm já cadastrado (codigo duplicado)'))
    }
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const apenasAtivos = req.query.apenas_ativos === 'true'
    const modal = typeof req.query.modal_transporte === 'string' ? req.query.modal_transporte : undefined
    const itens = await prisma.incoterm.findMany({
      where: {
        ...(apenasAtivos ? { ativo_incoterm: true } : {}),
        ...(modal ? { modal_transporte: modal } : {}),
      },
      orderBy: { codigo_incoterm: 'asc' },
    })
    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

router.get('/:codigo_incoterm', async (req, res, next) => {
  try {
    const incoterm = await prisma.incoterm.findUnique({
      where: { codigo_incoterm: req.params.codigo_incoterm },
    })
    if (!incoterm) throw AppError.naoEncontrado('Incoterm')
    res.status(200).json(incoterm)
  } catch (err) {
    next(err)
  }
})

router.put('/:codigo_incoterm', async (req, res, next) => {
  try {
    const dados = atualizarIncotermSchema.parse(req.body)
    const existente = await prisma.incoterm.findUnique({
      where: { codigo_incoterm: req.params.codigo_incoterm },
    })
    if (!existente) throw AppError.naoEncontrado('Incoterm')
    const atualizado = await prisma.incoterm.update({
      where: { codigo_incoterm: existente.codigo_incoterm },
      data: dados,
    })
    res.status(200).json(atualizado)
  } catch (err) {
    next(err)
  }
})

router.delete('/:codigo_incoterm', async (req, res, next) => {
  try {
    const existente = await prisma.incoterm.findUnique({
      where: { codigo_incoterm: req.params.codigo_incoterm },
    })
    if (!existente) throw AppError.naoEncontrado('Incoterm')
    const desativado = await prisma.incoterm.update({
      where: { codigo_incoterm: existente.codigo_incoterm },
      data: { ativo_incoterm: false },
    })
    res.status(200).json(desativado)
  } catch (err) {
    next(err)
  }
})

export { router as incotermsRouter }
