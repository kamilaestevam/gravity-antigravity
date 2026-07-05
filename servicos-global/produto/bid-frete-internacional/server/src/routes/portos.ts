/**
 * portos.ts — Proxy Cadastros (porto + aeroporto) para GET /dados-mestre/portos
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

function resolverLimitePortos(query: {
  q?: string
  pais?: string
  limit?: string
}): number {
  const busca = query.q?.trim()
  const pais = query.pais?.trim()
  const limitRaw = Number(query.limit) || 50
  const teto = busca || pais ? 500 : 10_000
  return Math.min(Math.max(limitRaw, 1), teto)
}

router.get('/portos', async (req: Request, res: Response) => {
  try {
    const { q, tipo, pais, limit = '50' } = req.query as {
      q?: string
      pais?: string
      tipo?: string
      limit?: string
    }
    const limitNum = resolverLimitePortos({ q, pais, limit })
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

    let totalPortos = 0
    let totalAeroportos = 0

    if (!tipo || tipo === 'porto') {
      const resp = await fetchCadastrosJson<ListaCadastros<PortoCadastros>>(
        '/api/v1/cadastros/portos',
        queryBase,
      )
      totalPortos = resp.total
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
      totalAeroportos = resp.total
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

    if (tipo === 'porto') {
      res.json({ portos, total: totalPortos })
      return
    }

    if (tipo === 'aeroporto') {
      const aeroportos = portos.filter((p) => p.tipo === 'aeroporto')
      res.json({ portos: aeroportos, total: totalAeroportos })
      return
    }

    portos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    res.json({
      portos: portos.slice(0, limitNum),
      total: totalPortos + totalAeroportos,
    })
  } catch {
    res.json({ portos: [], total: 0 })
  }
})

export { router as portosRouter }
