/**
 * CRUD de Unidade — catálogo GLOBAL (sem id_organizacao).
 * Soft delete via `ativo = false`.
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { criarUnidadeSchema, atualizarUnidadeSchema } from '../../../shared/schemas/index.js'

const router = Router()
router.use(requireInternalKey)

router.post('/', async (req, res, next) => {
  try {
    const dados = criarUnidadeSchema.parse(req.body)
    const criada = await prisma.unidade.create({ data: dados })
    res.status(201).json(criada)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Unidade já cadastrada (codigo duplicado)'))
    }
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const apenasAtivas = req.query.apenas_ativas === 'true'
    const tipo = typeof req.query.tipo === 'string' ? req.query.tipo : undefined
    const itens = await prisma.unidade.findMany({
      where: {
        ...(apenasAtivas ? { ativo: true } : {}),
        ...(tipo ? { tipo } : {}),
      },
      orderBy: { codigo: 'asc' },
    })
    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

router.get('/:codigo', async (req, res, next) => {
  try {
    const unidade = await prisma.unidade.findUnique({ where: { codigo: req.params.codigo } })
    if (!unidade) throw AppError.naoEncontrado('Unidade')
    res.status(200).json(unidade)
  } catch (err) {
    next(err)
  }
})

router.put('/:codigo', async (req, res, next) => {
  try {
    const dados = atualizarUnidadeSchema.parse(req.body)
    const existente = await prisma.unidade.findUnique({ where: { codigo: req.params.codigo } })
    if (!existente) throw AppError.naoEncontrado('Unidade')
    const atualizada = await prisma.unidade.update({
      where: { codigo: existente.codigo },
      data: dados,
    })
    res.status(200).json(atualizada)
  } catch (err) {
    next(err)
  }
})

router.delete('/:codigo', async (req, res, next) => {
  try {
    const existente = await prisma.unidade.findUnique({ where: { codigo: req.params.codigo } })
    if (!existente) throw AppError.naoEncontrado('Unidade')
    const desativada = await prisma.unidade.update({
      where: { codigo: existente.codigo },
      data: { ativo: false },
    })
    res.status(200).json(desativada)
  } catch (err) {
    next(err)
  }
})

export { router as unidadesRouter }
