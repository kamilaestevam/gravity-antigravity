/**
 * useTaxasCambio — Hook com cache em módulo para taxas PTAX
 *
 * O cache vive no módulo JS (singleton por sessão de browser).
 * Qualquer componente que chame o hook recebe os dados imediatamente
 * se já foram carregados antes — sem re-fetch desnecessário.
 */

import { useState, useEffect } from 'react'
import { z } from 'zod'

// ─── Schemas Zod (Mand. 09 — contrato bilateral com /api/v1/taxas-moeda do Configurador) ──

/** Coerce Prisma.Decimal serializado (string locale EN) ou number puro pra number canonico. */
const decimalCoerced = z.union([z.number(), z.string()]).transform(v => Number(v))

export const BoletimCambioSchema = z.object({
  id:           z.string(),
  moeda:        z.string(),
  compra:       decimalCoerced,
  venda:        decimalCoerced,
  data_cotacao: z.string(),
  hora_cotacao: z.string().nullable(),
  boletim:      z.string(),
  fonte:        z.string(),
  criado_em:    z.string().optional(),
})
export type BoletimCambio = z.infer<typeof BoletimCambioSchema>

export const TaxasMoedaResponseSchema = z.object({
  data:      z.string(),
  por_moeda: z.record(z.string(), z.array(BoletimCambioSchema)),
})

export const HistoricoTaxasResponseSchema = z.object({
  moeda:        z.string(),
  periodo_dias: z.number(),
  total:        z.number(),
  historico:    z.array(BoletimCambioSchema),
})

export const SyncTaxasResponseSchema = z.object({
  sincronizado_em: z.string(),
  total_ok:        z.number(),
  total_erro:      z.number(),
  resultados:      z.array(z.object({
    moeda:   z.string(),
    boletim: z.string(),
    status:  z.enum(['ok', 'erro']),
    detalhe: z.string().optional(),
  })),
})

export type TaxasVenda = Record<string, number>

// ─── Cache singleton no módulo ───────────────────────────────────────────────

let _cache: TaxasVenda = { BRL: 1 }
let _promise: Promise<TaxasVenda> | null = null

async function fetchTaxas(): Promise<TaxasVenda> {
  if (_promise) return _promise

  _promise = fetch('/api/v1/taxas-moeda')
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    .then((raw: unknown) => {
      // Mand. 09 — falha LOUD se backend mudar shape (ZodError com path do campo divergente)
      const parsed = TaxasMoedaResponseSchema.parse(raw)
      const t: TaxasVenda = { BRL: 1 }
      for (const [moeda, boletins] of Object.entries(parsed.por_moeda)) {
        if (!boletins.length) continue
        const ultimo = boletins[boletins.length - 1]
        if (ultimo) t[moeda] = ultimo.venda  // ja eh number pos-transform
      }
      _cache = t
      return t
    })
    .catch((err) => {
      // Mand. 08 — registra para nao mascarar; usa cache anterior pra preservar UX
      console.warn('[useTaxasCambio] falha ao carregar taxas (usando cache):', err)
      return _cache
    })

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
