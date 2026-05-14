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
import { buscarNcm, obterStatusSync } from '../services/motor-sync-ncm.js'
import { validarNcm } from '../connectors/portalUnicoNcm.js'

const router = Router()

// ─── ROTAS PÚBLICAS (sem requireInternalKey) ─────────────────────────────────
// Consumidas pelo frontend (SelectNcmGlobal / CampoBuscarNcm / useNcmValidation)
// via proxy Vite. NCM é catálogo global da Receita — sem id_organizacao.

/**
 * GET /buscar?q=...&limite=20
 * Busca por código (startsWith numérico) ou descrição (contains insensitive).
 * Se busca exata retorna 0 → fallback fuzzy via pg_trgm (word_similarity).
 * Retorna { itens: [{ codigo, descricao }], ultima_sync, fuzzy }
 */
router.get('/buscar', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : ''
    const limiteRaw = typeof req.query.limite === 'string' ? parseInt(req.query.limite, 10) : 20
    const limite = Number.isFinite(limiteRaw) && limiteRaw > 0 ? Math.min(limiteRaw, 100) : 20

    const statusSync = await obterStatusSync(prisma)

    if (q.length < 2) {
      return res.status(200).json({ itens: [], ultima_sync: statusSync.ultima_sync, fuzzy: false })
    }

    // 1. Busca exata (contains / startsWith)
    const itens = await buscarNcm(prisma, q, limite)

    if (itens.length > 0) {
      return res.status(200).json({ itens, ultima_sync: statusSync.ultima_sync, fuzzy: false })
    }

    // 2. Fallback fuzzy via pg_trgm (word_similarity) — apenas para buscas por descrição
    const isCodigoParcial = /^\d+$/.test(q.trim())
    if (!isCodigoParcial) {
      const itensFuzzy = await buscarNcmFuzzy(q, limite)
      if (itensFuzzy.length > 0) {
        return res.status(200).json({ itens: itensFuzzy, ultima_sync: statusSync.ultima_sync, fuzzy: true })
      }
    }

    res.status(200).json({ itens: [], ultima_sync: statusSync.ultima_sync, fuzzy: false })
  } catch (err) {
    next(err)
  }
})

/**
 * Busca fuzzy via pg_trgm — word_similarity ≥ 0.25 (threshold permissivo).
 * Habilita a extensão sob demanda (CREATE EXTENSION IF NOT EXISTS).
 * Fallback gracioso: se pg_trgm não disponível, retorna [].
 */
async function buscarNcmFuzzy(
  query: string,
  limite: number,
): Promise<Array<{ codigo: string; descricao: string }>> {
  try {
    // Garantir extensão (idempotente, ~1ms se já existir)
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_trgm')

    const resultados = await prisma.$queryRaw<
      Array<{ codigo_ncm_sync: string; descricao_ncm_sync: string }>
    >`
      SELECT codigo_ncm_sync, descricao_ncm_sync
      FROM ncm_sync
      WHERE ativo_ncm_sync = true
        AND word_similarity(${query}, descricao_ncm_sync) > 0.25
      ORDER BY word_similarity(${query}, descricao_ncm_sync) DESC
      LIMIT ${limite}
    `

    return resultados.map(r => ({
      codigo: r.codigo_ncm_sync,
      descricao: r.descricao_ncm_sync,
    }))
  } catch {
    // pg_trgm indisponível ou erro de SQL — fallback silencioso
    return []
  }
}

/**
 * GET /:codigo/validar
 * Validação unitária de código NCM.
 * 1. Busca no cache local (ncm_sync)
 * 2. Se não encontrar, consulta Portal Único (TTCE API)
 * Retorna { valido, descricao, fonte, ultima_sync, motivo }
 */
router.get('/:codigo/validar', async (req, res, next) => {
  try {
    const { codigo } = req.params

    if (!/^\d{8}$/.test(codigo)) {
      return res.status(200).json({
        valido:      false,
        descricao:   null,
        fonte:       null,
        ultima_sync: null,
        motivo:      'Código NCM deve ter exatamente 8 dígitos numéricos',
      })
    }

    // 1. Buscar no cache local
    const local = await prisma.ncmSync.findUnique({
      where: { codigo_ncm_sync: codigo },
      select: { codigo_ncm_sync: true, descricao_ncm_sync: true, ativo_ncm_sync: true },
    })

    const statusSync = await obterStatusSync(prisma)

    if (local && local.ativo_ncm_sync) {
      return res.status(200).json({
        valido:      true,
        descricao:   local.descricao_ncm_sync,
        fonte:       'cache',
        ultima_sync: statusSync.ultima_sync,
        motivo:      null,
      })
    }

    // 2. Fallback: consulta Portal Único (TTCE)
    const remoto = await validarNcm(codigo)

    if (remoto) {
      return res.status(200).json({
        valido:      true,
        descricao:   remoto.descricao,
        fonte:       'portal_unico',
        ultima_sync: statusSync.ultima_sync,
        motivo:      null,
      })
    }

    // 3. Não encontrado em nenhuma fonte
    res.status(200).json({
      valido:      false,
      descricao:   null,
      fonte:       null,
      ultima_sync: statusSync.ultima_sync,
      motivo:      'NCM não encontrado no cache local nem no Portal Único Siscomex',
    })
  } catch (err) {
    next(err)
  }
})

// ─── ROTAS PROTEGIDAS (S2S — requireInternalKey) ─────────────────────────────
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
