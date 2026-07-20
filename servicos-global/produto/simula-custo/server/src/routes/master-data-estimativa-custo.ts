/**
 * master-data-estimativa-custo.ts — Master data público do Estimativa Custo.
 * NCM: proxy ao vivo para Cadastros.NcmSync (fonte única — cadastros-snapshot-policy).
 * UFs: catálogo estático de alíquotas internas de ICMS.
 */
import { Router, Request, Response } from 'express'
import { buscarJsonCadastros } from '../lib/cadastros-client.js'

export const masterDataEstimativaCustoRouter = Router()

// Dados estáticos de UFs com alíquotas internas padrão de ICMS
const UFS_BRASIL = [
  { uf: 'AC', nome: 'Acre', icms: 0.17 },
  { uf: 'AL', nome: 'Alagoas', icms: 0.17 },
  { uf: 'AM', nome: 'Amazonas', icms: 0.20 },
  { uf: 'AP', nome: 'Amapá', icms: 0.18 },
  { uf: 'BA', nome: 'Bahia', icms: 0.19 },
  { uf: 'CE', nome: 'Ceará', icms: 0.18 },
  { uf: 'DF', nome: 'Distrito Federal', icms: 0.18 },
  { uf: 'ES', nome: 'Espírito Santo', icms: 0.17 },
  { uf: 'GO', nome: 'Goiás', icms: 0.17 },
  { uf: 'MA', nome: 'Maranhão', icms: 0.22 },
  { uf: 'MG', nome: 'Minas Gerais', icms: 0.18 },
  { uf: 'MS', nome: 'Mato Grosso do Sul', icms: 0.17 },
  { uf: 'MT', nome: 'Mato Grosso', icms: 0.17 },
  { uf: 'PA', nome: 'Pará', icms: 0.19 },
  { uf: 'PB', nome: 'Paraíba', icms: 0.18 },
  { uf: 'PE', nome: 'Pernambuco', icms: 0.20 },
  { uf: 'PI', nome: 'Piauí', icms: 0.21 },
  { uf: 'PR', nome: 'Paraná', icms: 0.19 },
  { uf: 'RJ', nome: 'Rio de Janeiro', icms: 0.20 },
  { uf: 'RN', nome: 'Rio Grande do Norte', icms: 0.18 },
  { uf: 'RO', nome: 'Rondônia', icms: 0.175 },
  { uf: 'RR', nome: 'Roraima', icms: 0.17 },
  { uf: 'RS', nome: 'Rio Grande do Sul', icms: 0.17 },
  { uf: 'SC', nome: 'Santa Catarina', icms: 0.17 },
  { uf: 'SE', nome: 'Sergipe', icms: 0.18 },
  { uf: 'SP', nome: 'São Paulo', icms: 0.18 },
  { uf: 'TO', nome: 'Tocantins', icms: 0.18 },
].sort((a, b) => a.uf.localeCompare(b.uf))

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
masterDataEstimativaCustoRouter.get('/ncm/buscar', async (req: Request, res: Response) => {
  const q = String(req.query.q ?? '')
  if (q.length < 2) return res.json({ itens: [], ultima_sync: null, fuzzy: false })

  try {
    const resposta = await buscarJsonCadastros<RespostaBuscaNcmCadastros>(
      '/api/v1/cadastros/ncm/buscar',
      { q, limite: '20' },
    )
    return res.json(resposta)
  } catch (err) {
    console.warn('[EstimativaCusto] Falha na busca NCM no Cadastros:', err instanceof Error ? err.message : err)
    return res.status(502).json({ error: 'Serviço de Cadastros indisponível para busca de NCM' })
  }
})

/**
 * GET /ncm/:codigo/validar
 * Proxy ao vivo → Cadastros GET /api/v1/cadastros/ncm/:codigo/validar
 * Retorna alíquotas TEC (ii, ipi, pis, cofins) para congelar na estimativa.
 */
masterDataEstimativaCustoRouter.get('/ncm/:codigo/validar', async (req: Request, res: Response) => {
  try {
    const resposta = await buscarJsonCadastros<RespostaValidarNcmCadastros>(
      `/api/v1/cadastros/ncm/${encodeURIComponent(req.params.codigo)}/validar`,
    )
    return res.json(resposta)
  } catch (err) {
    console.warn('[EstimativaCusto] Falha na validação NCM no Cadastros:', err instanceof Error ? err.message : err)
    return res.status(502).json({ error: 'Serviço de Cadastros indisponível para validação de NCM' })
  }
})

/**
 * GET /unidades-federativas
 */
masterDataEstimativaCustoRouter.get('/unidades-federativas', (_req, res) => {
  res.json(UFS_BRASIL)
})
