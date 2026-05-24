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
import { notificarMudancaEntidade } from '../services/notifyPedido.js'

const router = Router()

// ─── ROTA PÚBLICA (sem requireInternalKey) ───────────────────────────────────
// Consumida pelo frontend via useUnidades() para alimentar selects de unidades.
// Unidade é catálogo global somente leitura nesta rota; mutações seguem S2S.
router.get('/', async (req, res, next) => {
  try {
    const apenasAtivas = req.query.apenas_ativas === 'true'
    const tipo_unidade = typeof req.query.tipo_unidade === 'string' ? req.query.tipo_unidade : undefined
    const itens = await prisma.unidade.findMany({
      where: {
        ...(apenasAtivas ? { ativo_unidade: true } : {}),
        ...(tipo_unidade ? { tipo_unidade } : {}),
      },
      orderBy: { codigo_unidade: 'asc' },
    })
    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

// ─── ROTAS PROTEGIDAS (S2S — requireInternalKey) ─────────────────────────────
router.use(requireInternalKey)

router.post('/', async (req, res, next) => {
  try {
    const dados = criarUnidadeSchema.parse(req.body)
    const criada = await prisma.unidade.create({ data: dados })
    void notificarMudancaEntidade('unidade', criada.codigo_unidade, '')
    res.status(201).json(criada)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Unidade já cadastrada (codigo duplicado)'))
    }
    next(err)
  }
})

router.get('/:id_unidade', async (req, res, next) => {
  try {
    const unidade = await prisma.unidade.findUnique({ where: { codigo_unidade: req.params.id_unidade } })
    if (!unidade) throw AppError.naoEncontrado('Unidade')
    res.status(200).json(unidade)
  } catch (err) {
    next(err)
  }
})

router.put('/:id_unidade', async (req, res, next) => {
  try {
    const dados = atualizarUnidadeSchema.parse(req.body)
    const existente = await prisma.unidade.findUnique({ where: { codigo_unidade: req.params.id_unidade } })
    if (!existente) throw AppError.naoEncontrado('Unidade')
    const atualizada = await prisma.unidade.update({
      where: { codigo_unidade: existente.codigo_unidade },
      data: dados,
    })
    void notificarMudancaEntidade('unidade', atualizada.codigo_unidade, '')
    res.status(200).json(atualizada)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id_unidade', async (req, res, next) => {
  try {
    const existente = await prisma.unidade.findUnique({ where: { codigo_unidade: req.params.id_unidade } })
    if (!existente) throw AppError.naoEncontrado('Unidade')
    const desativada = await prisma.unidade.update({
      where: { codigo_unidade: existente.codigo_unidade },
      data: { ativo_unidade: false },
    })
    void notificarMudancaEntidade('unidade', desativada.codigo_unidade, '')
    res.status(200).json(desativada)
  } catch (err) {
    next(err)
  }
})

export { router as unidadesRouter }
