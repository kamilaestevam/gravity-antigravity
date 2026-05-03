/**
 * CRUD de NCM — catálogo GLOBAL (sem id_organizacao).
 * Soft delete via `ativo_ncm_sync = false`.
 *
 * Tabela física: `ncm_sync` (renomeada de `ncm` em 2026-05-03 para evitar
 * confusão com a coluna `ncm_item` das tabelas de produto).
 *
 * ACL/DTO: o contrato público (Zod schemas + frontend) continua usando
 * nomes curtos sem o sufixo `_sync` — `codigo_ncm`, `descricao_ncm`, etc.
 * Translate é feito neste router.
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

// ─── ACL: translate Prisma row → DTO público (sem `_sync`) ────────────────────

interface NcmSyncRow {
  codigo_ncm_sync:    string
  descricao_ncm_sync: string
  ipi_ncm_sync:       number | null
  ii_ncm_sync:        number | null
  pis_ncm_sync:       number | null
  cofins_ncm_sync:    number | null
  ativo_ncm_sync:     boolean
}

function toDto(n: NcmSyncRow) {
  return {
    codigo_ncm:    n.codigo_ncm_sync,
    descricao_ncm: n.descricao_ncm_sync,
    ipi_ncm:       n.ipi_ncm_sync,
    ii_ncm:        n.ii_ncm_sync,
    pis_ncm:       n.pis_ncm_sync,
    cofins_ncm:    n.cofins_ncm_sync,
    ativo_ncm:     n.ativo_ncm_sync,
  }
}

router.post('/', async (req, res, next) => {
  try {
    const dados = criarNCMSchema.parse(req.body)
    const criada = await prisma.ncmSync.create({
      data: {
        codigo_ncm_sync:    dados.codigo_ncm,
        descricao_ncm_sync: dados.descricao_ncm,
        ipi_ncm_sync:       dados.ipi_ncm ?? null,
        ii_ncm_sync:        dados.ii_ncm ?? null,
        ativo_ncm_sync:     dados.ativo_ncm,
      },
    })
    // Catálogo global: idOrganizacao vazio → receiver faz fan-out por org.
    void notificarMudancaEntidade('ncm', criada.codigo_ncm_sync, '')
    res.status(201).json(toDto(criada))
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
    const itens = await prisma.ncmSync.findMany({
      where: {
        ...(apenasAtivos ? { ativo_ncm_sync: true } : {}),
        ...(busca ? {
          OR: [
            { codigo_ncm_sync:    { contains: busca } },
            { descricao_ncm_sync: { contains: busca, mode: 'insensitive' } },
          ],
        } : {}),
      },
      orderBy: { codigo_ncm_sync: 'asc' },
      take: 500,
    })
    res.status(200).json({ itens: itens.map(toDto), total: itens.length })
  } catch (err) {
    next(err)
  }
})

router.get('/:id_ncm', async (req, res, next) => {
  try {
    const ncm = await prisma.ncmSync.findUnique({ where: { codigo_ncm_sync: req.params.id_ncm } })
    if (!ncm) throw AppError.naoEncontrado('NCM')
    res.status(200).json(toDto(ncm))
  } catch (err) {
    next(err)
  }
})

router.put('/:id_ncm', async (req, res, next) => {
  try {
    const dados = atualizarNCMSchema.parse(req.body)
    const existente = await prisma.ncmSync.findUnique({ where: { codigo_ncm_sync: req.params.id_ncm } })
    if (!existente) throw AppError.naoEncontrado('NCM')
    const atualizado = await prisma.ncmSync.update({
      where: { codigo_ncm_sync: existente.codigo_ncm_sync },
      data: {
        ...(dados.descricao_ncm !== undefined ? { descricao_ncm_sync: dados.descricao_ncm } : {}),
        ...(dados.ipi_ncm       !== undefined ? { ipi_ncm_sync:       dados.ipi_ncm }       : {}),
        ...(dados.ii_ncm        !== undefined ? { ii_ncm_sync:        dados.ii_ncm }        : {}),
        ...(dados.ativo_ncm     !== undefined ? { ativo_ncm_sync:     dados.ativo_ncm }     : {}),
      },
    })
    void notificarMudancaEntidade('ncm', atualizado.codigo_ncm_sync, '')
    res.status(200).json(toDto(atualizado))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id_ncm', async (req, res, next) => {
  try {
    const existente = await prisma.ncmSync.findUnique({ where: { codigo_ncm_sync: req.params.id_ncm } })
    if (!existente) throw AppError.naoEncontrado('NCM')
    const desativado = await prisma.ncmSync.update({
      where: { codigo_ncm_sync: existente.codigo_ncm_sync },
      data: { ativo_ncm_sync: false },
    })
    void notificarMudancaEntidade('ncm', desativado.codigo_ncm_sync, '')
    res.status(200).json(toDto(desativado))
  } catch (err) {
    next(err)
  }
})

export { router as ncmRouter }
