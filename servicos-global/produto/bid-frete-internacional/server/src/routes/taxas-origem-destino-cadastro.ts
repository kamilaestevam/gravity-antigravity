/**
 * taxas-origem-destino-cadastro.ts — Proxy público do catálogo Cadastros (SSOT).
 * GET /taxas-origem-destino
 *
 * O formulário público do fornecedor não chama Cadastros direto (exige chave S2S no servidor).
 */
import { Router, Request, Response } from 'express'
import { fetchCadastrosJson } from '../lib/cadastros-client.js'

const router = Router()

type TaxaOrigemDestinoCadastros = {
  id_taxa_origem_destino: string
  nome_taxa_origem_destino: string
  tipo_taxa_origem_destino: string
  codigo_taxa_origem_destino?: string | null
  ativo_taxa_origem_destino: boolean
  legado_taxa_origem_destino?: boolean
  categoria_taxa_origem_destino?: string | null
}

type ListaCadastros<T> = { itens: T[]; total: number }

router.get('/taxas-origem-destino', async (req: Request, res: Response) => {
  try {
    const { q, tipo, limit = '500' } = req.query as {
      q?: string
      tipo?: string
      limit?: string
    }
    const limitNum = Math.min(Number(limit) || 500, 500)

    const resp = await fetchCadastrosJson<ListaCadastros<TaxaOrigemDestinoCadastros>>(
      '/api/v1/cadastros/taxas-origem-destino',
      {
        q,
        tipo: tipo?.toUpperCase(),
        limit: String(limitNum),
        apenas_ativos: 'true',
        apenas_nao_legado: 'true',
      },
    )

    res.json(resp)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao carregar taxas do cadastro'
    console.error('[bid-frete][taxas-origem-destino]', message)
    res.status(502).json({
      error: { message: 'Catálogo de taxas temporariamente indisponível' },
    })
  }
})

export { router as taxasOrigemDestinoCadastroRouter }
