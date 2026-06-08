/**
 * CRUD de Volume — catálogo GLOBAL (sem id_organizacao).
 * Tipos de embalagem/volume para COMEX, NF-e e ERP.
 * Container (Siscomex 22) → tabela `container`, não duplicado aqui.
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { criarVolumeSchema, atualizarVolumeSchema } from '../../../shared/schemas/volume.schema.js'
import { notificarMudancaEntidade } from '../services/notifyPedido.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const apenasAtivas = req.query.apenas_ativas === 'true'
    const categoria_volume = typeof req.query.categoria_volume === 'string' ? req.query.categoria_volume : undefined
    const itens = await prisma.volume.findMany({
      where: {
        ...(apenasAtivas ? { ativo_volume: true } : {}),
        ...(categoria_volume ? { categoria_volume } : {}),
      },
      orderBy: { codigo_volume: 'asc' },
    })
    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

router.use(requireInternalKey)

router.post('/', async (req, res, next) => {
  try {
    const dados = criarVolumeSchema.parse(req.body)
    const criado = await prisma.volume.create({ data: dados })
    void notificarMudancaEntidade('volume', criado.codigo_volume, '')
    res.status(201).json(criado)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Volume já cadastrado (codigo duplicado)'))
    }
    next(err)
  }
})

router.get('/:id_volume', async (req, res, next) => {
  try {
    const volume = await prisma.volume.findUnique({ where: { codigo_volume: req.params.id_volume } })
    if (!volume) throw AppError.naoEncontrado('Volume')
    res.status(200).json(volume)
  } catch (err) {
    next(err)
  }
})

router.put('/:id_volume', async (req, res, next) => {
  try {
    const dados = atualizarVolumeSchema.parse(req.body)
    const atualizado = await prisma.volume.update({
      where: { codigo_volume: req.params.id_volume },
      data: dados,
    })
    void notificarMudancaEntidade('volume', atualizado.codigo_volume, '')
    res.status(200).json(atualizado)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return next(AppError.naoEncontrado('Volume'))
    }
    next(err)
  }
})

router.delete('/:id_volume', async (req, res, next) => {
  try {
    const atualizado = await prisma.volume.update({
      where: { codigo_volume: req.params.id_volume },
      data: { ativo_volume: false },
    })
    void notificarMudancaEntidade('volume', atualizado.codigo_volume, '')
    res.status(200).json(atualizado)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return next(AppError.naoEncontrado('Volume'))
    }
    next(err)
  }
})

export { router as volumesRouter }
