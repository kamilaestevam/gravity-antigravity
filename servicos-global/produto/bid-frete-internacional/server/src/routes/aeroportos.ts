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

router.get('/aeroportos/:codigo', async (req: Request, res: Response) => {
  try {
    const codigo = req.params.codigo.trim().toUpperCase()
    const aeroporto = await fetchCadastrosJson<AeroportoCadastros>(
      `/api/v1/cadastros/aeroportos/${encodeURIComponent(codigo)}`,
    )
    res.json({
      aeroporto: {
        id_aeroporto: aeroporto.codigo_iata_aeroporto ?? aeroporto.codigo_unlocode_aeroporto,
        codigo_iata_aeroporto: aeroporto.codigo_iata_aeroporto ?? aeroporto.codigo_unlocode_aeroporto,
        nome_aeroporto: aeroporto.nome_aeroporto,
        codigo_pais_aeroporto: aeroporto.codigo_pais_aeroporto ?? '',
      },
    })
  } catch {
    res.status(404).json({ error: { message: 'Aeroporto não encontrado' } })
  }
})

router.get('/aeroportos', async (req: Request, res: Response) => {
  try {
    const { q, pais, limit = '50', offset = '0' } = req.query as {
      q?: string
      pais?: string
      limit?: string
      offset?: string
    }
    const limitNum = Math.min(Number(limit) || 50, q || pais ? 500 : 10_000)

    const resp = await fetchCadastrosJson<ListaCadastros<AeroportoCadastros>>(
      '/api/v1/cadastros/aeroportos',
      {
        q,
        pais: pais?.toUpperCase(),
        limit: String(limitNum),
        offset,
        apenas_ativos: 'true',
      },
    )

    const aeroportos = resp.itens.map((a) => ({
      id_aeroporto: a.codigo_iata_aeroporto ?? a.codigo_unlocode_aeroporto,
      codigo_iata_aeroporto: a.codigo_iata_aeroporto ?? a.codigo_unlocode_aeroporto,
      nome_aeroporto: a.nome_aeroporto,
      codigo_pais_aeroporto: a.codigo_pais_aeroporto ?? '',
    }))

    res.json({ aeroportos, total: resp.total })
  } catch {
    res.json({ aeroportos: [], total: 0 })
  }
})

export { router as aeroportosRouter }
