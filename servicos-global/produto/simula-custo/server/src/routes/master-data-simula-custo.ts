/**
 * master-data-simula-custo.ts — Master data público do Simula Custo.
 * NCM: proxy ao vivo para Cadastros.NcmSync (fonte única — cadastros-snapshot-policy).
 * UFs / ICMS: catálogo estático com base legal (ver aliquotas-icms-interna-uf.ts).
 */
import { Router, Request, Response } from 'express'
import { buscarJsonCadastros } from '../lib/cadastros-client.js'
import {
  listarOpcoesIcmsSimulaCusto,
  listarUfsComIcms,
} from '../shared/aliquotas-icms-interna-uf.js'

export const masterDataSimulaCustoRouter = Router()

interface RespostaBuscaNcmCadastros {
  itens: Array<{ codigo: string; descricao: string }>
  ultima_sync: string | null
  fuzzy: boolean
}

interface RespostaValidarNcmCadastros {
  valido: boolean
  descricao: string | null
  fonte: string | null
  ultima_sync: string | null
  motivo: string | null
  ii: number | null
  ipi: number | null
  pis: number | null
  cofins: number | null
}

/**
 * GET /ncm/buscar?q={termo}
 * Proxy ao vivo → Cadastros GET /api/v1/cadastros/ncm/buscar
 */
masterDataSimulaCustoRouter.get('/ncm/buscar', async (req: Request, res: Response) => {
  const q = String(req.query.q ?? '')
  if (q.length < 2) return res.json({ itens: [], ultima_sync: null, fuzzy: false })

  try {
    const resposta = await buscarJsonCadastros<RespostaBuscaNcmCadastros>(
      '/api/v1/cadastros/ncm/buscar',
      { q, limite: '20' },
    )
    return res.json(resposta)
  } catch (err) {
    console.warn('[SimulaCusto] Falha na busca NCM no Cadastros:', err instanceof Error ? err.message : err)
    return res.status(502).json({ error: 'Serviço de Cadastros indisponível para busca de NCM' })
  }
})

/**
 * GET /ncm/:codigo/validar
 * Proxy ao vivo → Cadastros GET /api/v1/cadastros/ncm/:codigo/validar
 * Retorna alíquotas TEC (ii, ipi, pis, cofins) para congelar na simula.
 */
masterDataSimulaCustoRouter.get('/ncm/:codigo/validar', async (req: Request, res: Response) => {
  try {
    const resposta = await buscarJsonCadastros<RespostaValidarNcmCadastros>(
      `/api/v1/cadastros/ncm/${encodeURIComponent(req.params.codigo)}/validar`,
    )
    return res.json(resposta)
  } catch (err) {
    console.warn('[SimulaCusto] Falha na validação NCM no Cadastros:', err instanceof Error ? err.message : err)
    return res.status(502).json({ error: 'Serviço de Cadastros indisponível para validação de NCM' })
  }
})

/**
 * GET /unidades-federativas — UFs com ICMS interno (regra geral efetiva).
 */
masterDataSimulaCustoRouter.get('/unidades-federativas', (_req, res) => {
  res.json(
    listarUfsComIcms().map((u) => ({
      uf: u.uf!,
      nome: u.nome,
      icms: u.icms,
      base_legal: u.base_legal,
    })),
  )
})

/**
 * GET /opcoes-icms — UFs + Benefício Fiscal 0% + Supérfluos 25% (RICMS/SP art. 55).
 */
masterDataSimulaCustoRouter.get('/opcoes-icms', (_req, res) => {
  res.json(listarOpcoesIcmsSimulaCusto())
})

interface TaxaOrigemDestinoCadastros {
  id_taxa_origem_destino: string
  nome_taxa_origem_destino: string
  tipo_taxa_origem_destino: string
  codigo_taxa_origem_destino?: string | null
  ativo_taxa_origem_destino: boolean
  legado_taxa_origem_destino?: boolean
}

/**
 * GET /taxas-origem-destino?tipo=ORIGEM|DESTINO
 * Proxy ao vivo → Cadastros GET /api/v1/cadastros/taxas-origem-destino (SSOT).
 */
masterDataSimulaCustoRouter.get('/taxas-origem-destino', async (req: Request, res: Response) => {
  try {
    const { q, tipo, limit = '500' } = req.query as {
      q?: string
      tipo?: string
      limit?: string
    }
    const limitNum = Math.min(Number(limit) || 500, 500)
    const resposta = await buscarJsonCadastros<{ itens: TaxaOrigemDestinoCadastros[]; total: number }>(
      '/api/v1/cadastros/taxas-origem-destino',
      {
        q,
        tipo: tipo?.toUpperCase(),
        limit: String(limitNum),
        apenas_ativos: 'true',
        apenas_nao_legado: 'true',
      },
    )
    return res.json(resposta)
  } catch (err) {
    console.warn(
      '[SimulaCusto] Falha ao carregar taxas origem/destino no Cadastros:',
      err instanceof Error ? err.message : err,
    )
    return res.status(502).json({ error: 'Catálogo de taxas temporariamente indisponível' })
  }
})
