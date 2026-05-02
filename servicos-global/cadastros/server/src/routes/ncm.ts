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
import { notificarMudancaEntidade } from '../services/notifyPedido.js'

const router = Router()
router.use(requireInternalKey)

router.post('/', async (req, res, next) => {
  try {
    const dados = criarNCMSchema.parse(req.body)
    const criada = await prisma.ncm.create({
      data: {
        codigo_ncm: dados.codigo_ncm,
        descricao_ncm: dados.descricao_ncm,
        ipi_ncm: dados.ipi_ncm ?? null,
        ii_ncm: dados.ii_ncm ?? null,
        ativo_ncm: dados.ativo_ncm,
      },
    })
    // Catálogo global: idOrganizacao vazio → receiver faz fan-out por org.
    void notificarMudancaEntidade('ncm', criada.codigo_ncm, '')
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
    const itens = await prisma.ncm.findMany({
      where: {
        ...(apenasAtivos ? { ativo_ncm: true } : {}),
        ...(busca ? {
          OR: [
            { codigo_ncm: { contains: busca } },
            { descricao_ncm: { contains: busca, mode: 'insensitive' } },
          ],
        } : {}),
      },
      orderBy: { codigo_ncm: 'asc' },
      take: 500,
    })
    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

router.get('/:id_ncm', async (req, res, next) => {
  try {
    const ncm = await prisma.ncm.findUnique({ where: { codigo_ncm: req.params.id_ncm } })
    if (!ncm) throw AppError.naoEncontrado('NCM')
    res.status(200).json(ncm)
  } catch (err) {
    next(err)
  }
})

router.put('/:id_ncm', async (req, res, next) => {
  try {
    const dados = atualizarNCMSchema.parse(req.body)
    const existente = await prisma.ncm.findUnique({ where: { codigo_ncm: req.params.id_ncm } })
    if (!existente) throw AppError.naoEncontrado('NCM')
    const atualizado = await prisma.ncm.update({
      where: { codigo_ncm: existente.codigo_ncm },
      data: {
        ...(dados.descricao_ncm !== undefined ? { descricao_ncm: dados.descricao_ncm } : {}),
        ...(dados.ipi_ncm !== undefined ? { ipi_ncm: dados.ipi_ncm } : {}),
        ...(dados.ii_ncm !== undefined ? { ii_ncm: dados.ii_ncm } : {}),
        ...(dados.ativo_ncm !== undefined ? { ativo_ncm: dados.ativo_ncm } : {}),
      },
    })
    void notificarMudancaEntidade('ncm', atualizado.codigo_ncm, '')
    res.status(200).json(atualizado)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id_ncm', async (req, res, next) => {
  try {
    const existente = await prisma.ncm.findUnique({ where: { codigo_ncm: req.params.id_ncm } })
    if (!existente) throw AppError.naoEncontrado('NCM')
    const desativado = await prisma.ncm.update({
      where: { codigo_ncm: existente.codigo_ncm },
      data: { ativo_ncm: false },
    })
    void notificarMudancaEntidade('ncm', desativado.codigo_ncm, '')
    res.status(200).json(desativado)
  } catch (err) {
    next(err)
  }
})

export { router as ncmRouter }
