/**
 * aeroportos.ts — Proxy Cadastros (aeroporto) para GET /dados-mestre/aeroportos
 */
import { Router, Request, Response } from 'express'
import { fetchCadastrosJson } from '../lib/cadastros-client.js'

const router = Router()

type AeroportoCadastros = {
  id_aeroporto: string
  codigo_iata_aeroporto?: string | null
  codigo_unlocode_aeroporto: string
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
}

type ListaCadastros<T> = { itens: T[]; total: number }

router.get('/aeroportos', async (req: Request, res: Response) => {
  try {
    const { q, pais, limit } = req.query as { q?: string; pais?: string; limit?: string }
    const limiteMax = q || pais ? 500 : 10_000
    const limitNum = Math.min(Number(limit) || limiteMax, limiteMax)

    const resp = await fetchCadastrosJson<ListaCadastros<AeroportoCadastros>>(
      '/api/v1/cadastros/aeroportos',
      {
        q,
        pais: pais?.toUpperCase(),
        limit: String(limitNum),
        apenas_ativos: 'true',
      },
    )

    const aeroportos = resp.itens.map((a) => ({
      id_aeroporto: a.codigo_iata_aeroporto ?? a.codigo_unlocode_aeroporto,
      codigo_iata_aeroporto: a.codigo_iata_aeroporto ?? a.codigo_unlocode_aeroporto,
      nome_aeroporto: a.nome_aeroporto,
      codigo_pais_aeroporto: a.codigo_pais_aeroporto ?? '',
    }))

    res.json({ aeroportos })
  } catch {
    res.json({ aeroportos: [] })
  }
})

export { router as aeroportosRouter }
