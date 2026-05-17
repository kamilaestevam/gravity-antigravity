// src/hooks/use-paises.ts
// Hook compartilhado para carregar lista de Países da fonte única
// (Cadastros — GET /api/v1/cadastros/paises). Cache em memória global —
// lista raramente muda, primeira chamada popula, demais usam cache.
//
// Uso típico:
//   const { paises, opcoes, carregando } = usePaises()
//   <SelectGlobal opcoes={opcoes} buscavel ... />
//
// Lei: skills/governanca/lei/cadastros-snapshot-policy/SKILL.md

import { useState, useEffect } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'

export interface Pais {
  id_pais: string
  nome_pais_portugues: string
  nome_pais_ingles: string
  codigo_pais_portal_unico_siscomex: string | null
  codigo_pais_bacen_4: string | null
  codigo_pais_bacen_5: string | null
  codigo_pais_sped_nfe: string | null
  codigo_pais_sped_efd: string | null
  codigo_pais_iso_alpha2: string | null
  codigo_pais_iso_alpha3: string | null
  codigo_pais_iso_numerico: string | null
  ativo_pais: boolean
}

let cachePaises: Pais[] | null = null
let cacheOpcoes: SelectOpcao[] | null = null
let promisePendente: Promise<Pais[]> | null = null

/**
 * Limpa cache em memória — útil em testes ou quando admin atualiza tabela.
 * Em produção, raramente necessário (master data não muda em runtime).
 */
export function invalidatePaisesCache(): void {
  cachePaises = null
  cacheOpcoes = null
  promisePendente = null
}

async function fetchPaises(): Promise<Pais[]> {
  if (cachePaises) return cachePaises
  if (promisePendente) return promisePendente

  promisePendente = (async () => {
    const res = await fetch('/api/v1/cadastros/paises?apenas_ativos=true', {
      headers: { 'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key' },
    })
    if (!res.ok) {
      promisePendente = null
      throw new Error(`GET /api/v1/cadastros/paises retornou ${res.status}`)
    }
    const data = await res.json() as { itens: Pais[] }
    cachePaises = data.itens
    cacheOpcoes = data.itens.map(p => ({
      valor: p.id_pais,
      rotulo: `${p.nome_pais_portugues}${p.codigo_pais_iso_alpha2 ? ` (${p.codigo_pais_iso_alpha2})` : ''}`,
    }))
    return cachePaises
  })()

  return promisePendente
}

export function usePaises(): {
  paises: Pais[]
  opcoes: SelectOpcao[]
  carregando: boolean
  erro: string | null
} {
  const [paises, setPaises] = useState<Pais[]>(() => cachePaises ?? [])
  const [opcoes, setOpcoes] = useState<SelectOpcao[]>(() => cacheOpcoes ?? [])
  const [carregando, setCarregando] = useState(!cachePaises)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (cachePaises && cacheOpcoes) return

    let cancelado = false
    fetchPaises()
      .then((lista) => {
        if (cancelado) return
        setPaises(lista)
        setOpcoes(cacheOpcoes ?? [])
      })
      .catch((e: Error) => {
        if (!cancelado) setErro(e.message)
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => { cancelado = true }
  }, [])

  return { paises, opcoes, carregando, erro }
}
