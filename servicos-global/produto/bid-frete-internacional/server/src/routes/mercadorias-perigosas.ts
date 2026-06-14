/**
 * mercadorias-perigosas.ts — Proxy Cadastros (mercadoria_perigosa) para dados-mestre.
 */
import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/erros.js'
import { fetchCadastrosJson } from '../lib/cadastros-client.js'

const router = Router()

type MercadoriaPerigosaCadastros = {
  id_mercadoria_perigosa: string
  numero_onu_mercadoria_perigosa: string
  nome_tecnico_embarque_mercadoria_perigosa: string
  nome_ascii_mercadoria_perigosa: string
  nome_ingles_mercadoria_perigosa: string
  classe_mercadoria_perigosa: number
  divisao_mercadoria_perigosa?: string | null
  grupo_embalagem_mercadoria_perigosa?: string | null
  ativo_mercadoria_perigosa: boolean
}

type ListaCadastros<T> = { itens: T[]; total: number }

router.get('/mercadorias-perigosas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, classe, limit = '100' } = req.query as { q?: string; classe?: string; limit?: string }
    const limitNum = Math.min(Number(limit) || 100, q || classe ? 500 : 10_000)

    const resp = await fetchCadastrosJson<ListaCadastros<MercadoriaPerigosaCadastros>>(
      '/api/v1/cadastros/mercadorias-perigosas',
      {
        q,
        classe,
        limit: String(limitNum),
        apenas_ativos: 'true',
      },
    )

    res.json({ mercadorias_perigosas: resp.itens, total: resp.total })
  } catch (err) {
    console.warn('[bid-frete][mercadorias-perigosas] falha ao buscar catálogo Cadastros', err)
    next(new AppError(
      'Não foi possível carregar o catálogo de mercadorias perigosas',
      502,
      'CADASTROS_MERCADORIAS_PERIGOSAS_INDISPONIVEL',
    ))
  }
})

export { router as mercadoriasPerigosasRouter }
