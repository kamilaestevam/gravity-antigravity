/**
 * CRUD de Moeda — catálogo GLOBAL (sem id_organizacao).
 * Soft delete via `ativo = false`.
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { criarMoedaSchema, atualizarMoedaSchema } from '../../../shared/schemas/index.js'
import { notificarMudancaEntidade } from '../services/notifyPedido.js'

const router = Router()
router.use(requireInternalKey)

router.post('/', async (req, res, next) => {
  try {
    const dados = criarMoedaSchema.parse(req.body)
    const criada = await prisma.moeda.create({ data: dados })
    void notificarMudancaEntidade('moeda', criada.codigo_moeda, '')
    res.status(201).json(criada)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Moeda já cadastrada (codigo duplicado)'))
    }
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const apenasAtivas = req.query.apenas_ativas === 'true'
    const itens = await prisma.moeda.findMany({
      where: apenasAtivas ? { ativo_moeda: true } : undefined,
      orderBy: { codigo_moeda: 'asc' },
    })
    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

router.get('/:id_moeda', async (req, res, next) => {
  try {
    const moeda = await prisma.moeda.findUnique({ where: { codigo_moeda: req.params.id_moeda } })
    if (!moeda) throw AppError.naoEncontrado('Moeda')
    res.status(200).json(moeda)
  } catch (err) {
    next(err)
  }
})

router.put('/:id_moeda', async (req, res, next) => {
  try {
    const dados = atualizarMoedaSchema.parse(req.body)
    const existente = await prisma.moeda.findUnique({ where: { codigo_moeda: req.params.id_moeda } })
    if (!existente) throw AppError.naoEncontrado('Moeda')
    const atualizada = await prisma.moeda.update({
      where: { codigo_moeda: existente.codigo_moeda },
      data: dados,
    })
    void notificarMudancaEntidade('moeda', atualizada.codigo_moeda, '')
    res.status(200).json(atualizada)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id_moeda', async (req, res, next) => {
  try {
    const existente = await prisma.moeda.findUnique({ where: { codigo_moeda: req.params.id_moeda } })
    if (!existente) throw AppError.naoEncontrado('Moeda')
    const desativada = await prisma.moeda.update({
      where: { codigo_moeda: existente.codigo_moeda },
      data: { ativo_moeda: false },
    })
    void notificarMudancaEntidade('moeda', desativada.codigo_moeda, '')
    res.status(200).json(desativada)
  } catch (err) {
    next(err)
  }
})

export { router as moedasRouter }
