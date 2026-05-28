/**
 * portos.ts — Proxy Cadastros (porto + aeroporto) para compat legado GET /portos
 */
import { Router, Request, Response } from 'express'
import { fetchCadastrosJson } from '../lib/cadastros-client.js'

const router = Router()

type PortoCadastros = {
  codigo_unlocode_porto: string
  nome_porto: string
  codigo_pais_porto?: string
}

type AeroportoCadastros = {
  codigo_iata_aeroporto?: string | null
  codigo_unlocode_aeroporto: string
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
}

type ListaCadastros<T> = { itens: T[]; total: number }

router.get('/portos', async (req: Request, res: Response) => {
  try {
    const { q, tipo, pais, limit = '50' } = req.query as {
      q?: string
      tipo?: string
      pais?: string
      limit?: string
    }
    const limitNum = Math.min(Number(limit) || 50, 500)
    const queryBase = {
      q,
      pais: pais?.toUpperCase(),
      limit: String(limitNum),
      apenas_ativos: 'true',
    }

    const portos: Array<{
      codigo: string
      nome: string
      pais_codigo_porto_bid_frete_internacional: string
      tipo: string
    }> = []

    if (!tipo || tipo === 'porto') {
      const resp = await fetchCadastrosJson<ListaCadastros<PortoCadastros>>(
        '/api/v1/cadastros/portos',
        queryBase,
      )
      for (const p of resp.itens) {
        portos.push({
          codigo: p.codigo_unlocode_porto,
          nome: p.nome_porto,
          pais_codigo_porto_bid_frete_internacional: p.codigo_pais_porto ?? '',
          tipo: 'porto',
        })
      }
    }

    if (!tipo || tipo === 'aeroporto') {
      const resp = await fetchCadastrosJson<ListaCadastros<AeroportoCadastros>>(
        '/api/v1/cadastros/aeroportos',
        queryBase,
      )
      for (const a of resp.itens) {
        const codigo = a.codigo_iata_aeroporto ?? a.codigo_unlocode_aeroporto
        portos.push({
          codigo,
          nome: a.nome_aeroporto,
          pais_codigo_porto_bid_frete_internacional: a.codigo_pais_aeroporto ?? '',
          tipo: 'aeroporto',
        })
      }
    }

    portos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    res.json({ portos: portos.slice(0, limitNum) })
  } catch {
    res.json({ portos: [] })
  }
})

export { router as portosRouter }
