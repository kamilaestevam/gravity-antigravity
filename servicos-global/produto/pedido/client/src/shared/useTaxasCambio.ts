/**
 * useTaxasCambio — Hook com cache em módulo para taxas PTAX
 *
 * O cache vive no módulo JS (singleton por sessão de browser).
 * Qualquer componente que chame o hook recebe os dados imediatamente
 * se já foram carregados antes — sem re-fetch desnecessário.
 */

import { useState, useEffect } from 'react'

export type TaxasVenda = Record<string, number>

// ─── Cache singleton no módulo ───────────────────────────────────────────────

let _cache: TaxasVenda = { BRL: 1 }
let _promise: Promise<TaxasVenda> | null = null

async function fetchTaxas(): Promise<TaxasVenda> {
  if (_promise) return _promise

  _promise = fetch('/api/v1/taxas-moeda')
    .then(r => r.ok ? r.json() : null)
    .then((json: { por_moeda?: Record<string, Array<{ venda: string | number }>> } | null) => {
      const t: TaxasVenda = { BRL: 1 }
      if (json?.por_moeda) {
        for (const [moeda, boletins] of Object.entries(json.por_moeda)) {
          if (!boletins.length) continue
          const ultimo = boletins[boletins.length - 1]
          if (ultimo?.venda) t[moeda] = Number(ultimo.venda)
        }
      }
      _cache = t
      return t
    })
    .catch(() => _cache)

  return _promise
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTaxasCambio(): TaxasVenda {
  const [taxas, setTaxas] = useState<TaxasVenda>(_cache)

  useEffect(() => {
    // Se cache já tem moedas além de BRL, usar direto
    if (Object.keys(_cache).length > 1) {
      setTaxas(_cache)
      return
    }
    fetchTaxas().then(t => setTaxas(t))
  }, [])

  return taxas
}

/** Converte um valor de qualquer moeda para BRL usando o último boletim PTAX */
export function converterParaBrl(valor: number, moeda: string, taxas: TaxasVenda): number {
  if (moeda === 'BRL') return valor
  const taxa = taxas[moeda]
  if (taxa == null) return valor * (taxas['USD'] ?? 1) // fallback USD
  return valor * taxa
}
