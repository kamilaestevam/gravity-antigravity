/**
 * Catálogo de Paises — fonte única da verdade para país no monorepo.
 * Read-only via API (251 países seedeados via migration; admin gerencia
 * por novas migrations controladas pelo Coordenador).
 *
 * GET /api/v1/cadastros/paises
 *   - apenas_ativos=true (default true) — filtra ativo_pais=true
 *   - ordenacao: Brasil sempre primeiro, demais alfabéticos pt-BR
 *
 * Lei: skills/governanca/lei/cadastros-snapshot-policy/SKILL.md
 */
import { Router } from 'express'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'

const router = Router()
router.use(requireInternalKey)

router.get('/', async (req, res, next) => {
  try {
    const apenasAtivos = req.query.apenas_ativos !== 'false' // default true
    const where = apenasAtivos ? { ativo_pais: true } : undefined

    const itens = await prisma.pais.findMany({
      where,
      // Brasil primeiro, depois alfabético em pt-BR (ordenação do banco
      // não tem locale-aware nativo simples — fazemos no app):
      orderBy: { nome_pais_portugues: 'asc' },
    })

    // Mover Brasil para o topo
    const brasilIdx = itens.findIndex(p => p.nome_pais_portugues === 'Brasil')
    if (brasilIdx > 0) {
      const [brasil] = itens.splice(brasilIdx, 1)
      itens.unshift(brasil)
    }

    res.status(200).json({ itens, total: itens.length })
  } catch (err) {
    next(err)
  }
})

export { router as paisesRouter }
