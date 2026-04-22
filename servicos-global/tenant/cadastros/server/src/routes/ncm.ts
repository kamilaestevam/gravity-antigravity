/**
 * CRUD de NCM — catálogo GLOBAL (sem id_organizacao).
 * Soft delete via `ativo = false`.
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { criarNCMSchema, atualizarNCMSchema } from '../../../shared/schemas/index.js'

const router = Router()
router.use(requireInternalKey)

router.post('/', async (req, res, next) => {
  try {
    const dados = criarNCMSchema.parse(req.body)
    const criada = await prisma.nCM.create({
      data: {
        codigo: dados.codigo,
        descricao: dados.descricao,
        ipi: dados.ipi ?? null,
        ii: dados.ii ?? null,
        ativo: dados.ativo,
      },
    })
    res.status(201).json(criada)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('NCM já cadastrado (codigo duplicado)'))
    }
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const apenasAtivos = req.query.apenas_ativas === 'true'
    const busca = typeof req.query.busca === 'string' ? req.query.busca : undefined
    const itens = await prisma.nCM.findMany({
      where: {
        ...(apenasAtivos ? { ativo: true } : {}),
        ...(busca ? {
          OR: [
            { codigo: { contains: busca } },
            { descricao: { contains: busca, mode: 'insensitive' } },
          ],
        } : {}),
      },
      orderBy: { codigo: 'asc' },
      take: 500,
    })
    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

router.get('/:codigo', async (req, res, next) => {
  try {
    const ncm = await prisma.nCM.findUnique({ where: { codigo: req.params.codigo } })
    if (!ncm) throw AppError.naoEncontrado('NCM')
    res.status(200).json(ncm)
  } catch (err) {
    next(err)
  }
})

router.put('/:codigo', async (req, res, next) => {
  try {
    const dados = atualizarNCMSchema.parse(req.body)
    const existente = await prisma.nCM.findUnique({ where: { codigo: req.params.codigo } })
    if (!existente) throw AppError.naoEncontrado('NCM')
    const atualizado = await prisma.nCM.update({
      where: { codigo: existente.codigo },
      data: {
        ...(dados.descricao !== undefined ? { descricao: dados.descricao } : {}),
        ...(dados.ipi !== undefined ? { ipi: dados.ipi } : {}),
        ...(dados.ii !== undefined ? { ii: dados.ii } : {}),
        ...(dados.ativo !== undefined ? { ativo: dados.ativo } : {}),
      },
    })
    res.status(200).json(atualizado)
  } catch (err) {
    next(err)
  }
})

router.delete('/:codigo', async (req, res, next) => {
  try {
    const existente = await prisma.nCM.findUnique({ where: { codigo: req.params.codigo } })
    if (!existente) throw AppError.naoEncontrado('NCM')
    const desativado = await prisma.nCM.update({
      where: { codigo: existente.codigo },
      data: { ativo: false },
    })
    res.status(200).json(desativado)
  } catch (err) {
    next(err)
  }
})

export { router as ncmRouter }
