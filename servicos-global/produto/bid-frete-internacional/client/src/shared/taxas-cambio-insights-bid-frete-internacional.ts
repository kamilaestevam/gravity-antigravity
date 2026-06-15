/**
 * PTAX (Configurador) + spread aplicado (config local BID Frete) para Insights.
 */

import { z } from 'zod'

const CHAVE_TAXAS_CAMBIO_BID_FRETE = 'bid-frete:config:taxa-cambio'

const taxaMoedaDtoSchema = z.object({
  moeda: z.string(),
  compra: z.union([z.number(), z.string()]),
  venda: z.union([z.number(), z.string()]),
  data_cotacao: z.union([z.string(), z.date()]).optional(),
})

export const taxasMoedaAtuaisResponseSchema = z.object({
  data: z.string().optional(),
  por_moeda: z.record(z.string(), z.array(taxaMoedaDtoSchema)),
})

export const taxasMoedaHistoricoResponseSchema = z.object({
  moeda: z.string(),
  historico: z.array(
    z.object({
      data_cotacao: z.union([z.string(), z.date()]),
      venda: z.union([z.number(), z.string()]),
      compra: z.union([z.number(), z.string()]).optional(),
    }),
  ),
})

export type TaxasMoedaHistoricoInsights = {
  moeda: string
  dados: Array<{ data: string; venda: number; compra: number }>
}

export type CotacaoPtaxInsights = {
  codigo: string
  nome: string
  referencia: boolean
  valor_brl: number
  variacao: number
}

export type SpreadMoedaInsights = {
  moeda: string
  valor_pct: number
  pct_barra: number
  cor: string
}

const NOMES_MOEDA: Record<string, string> = {
  USD: 'Dólar',
  EUR: 'Euro',
  CNY: 'Yuan',
  GBP: 'Libra',
  JPY: 'Iene',
}

const CORES_SPREAD: Record<string, string> = {
  USD: '#3b82f6',
  EUR: '#8b5cf6',
  CNY: '#fbbf24',
}

function numeroCampo(val: number | string): number {
  const n = typeof val === 'number' ? val : Number(val)
  return Number.isFinite(n) ? n : 0
}

export function lerTaxasCambioConfigBidFreteInternacional(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CHAVE_TAXAS_CAMBIO_BID_FRETE)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    const resultado: Record<string, number> = {}
    for (const [moeda, valor] of Object.entries(parsed)) {
      const n = Number(valor)
      if (Number.isFinite(n) && n > 0) resultado[moeda] = n
    }
    return resultado
  } catch {
    return {}
  }
}

function ultimaPtaxMoeda(
  porMoeda: Record<string, z.infer<typeof taxaMoedaDtoSchema>[]>,
  codigo: string,
): { venda: number; compra: number; data: string } | null {
  const lista = porMoeda[codigo]
  if (!lista?.length) return null
  const ultima = lista[lista.length - 1]
  const venda = numeroCampo(ultima.venda)
  const compra = numeroCampo(ultima.compra)
  if (venda <= 0 && compra <= 0) return null
  const data =
    typeof ultima.data_cotacao === 'string'
      ? ultima.data_cotacao.slice(0, 10)
      : ultima.data_cotacao instanceof Date
        ? ultima.data_cotacao.toISOString().slice(0, 10)
        : ''
  return { venda: venda || compra, compra: compra || venda, data }
}

export function montarCotacoesPtaxInsights(
  porMoeda: Record<string, z.infer<typeof taxaMoedaDtoSchema>[]>,
  moedas: string[] = ['USD', 'EUR', 'CNY'],
): CotacaoPtaxInsights[] {
  return moedas.map((codigo, idx) => {
    const ptax = ultimaPtaxMoeda(porMoeda, codigo)
    const valor = ptax?.venda ?? 0
    return {
      codigo,
      nome: NOMES_MOEDA[codigo] ?? codigo,
      referencia: idx === 0,
      valor_brl: Math.round(valor * 100) / 100,
      variacao: 0,
    }
  })
}

export function montarCotacoesPtaxHistoricoInsights(
  dados: Array<{ data: string; venda: number }>,
  dataSelecionada: string,
  moeda: string,
): CotacaoPtaxInsights[] {
  const alvo = dados.find(d => d.data === dataSelecionada) ?? dados[dados.length - 1]
  const valor = alvo?.venda ?? 0
  if (valor <= 0) return []
  return [{
    codigo: moeda,
    nome: NOMES_MOEDA[moeda] ?? moeda,
    referencia: moeda === 'USD',
    valor_brl: Math.round(valor * 100) / 100,
    variacao: 0,
  }]
}

export function resolverIndiceMesFocus(dias: number): number {
  if (dias <= 30) return 0
  if (dias <= 90) return 2
  if (dias <= 180) return 5
  return 11
}

export function montarCotacoesPtaxFuturoPorMoeda(
  baseAtual: CotacaoPtaxInsights[],
  previsoesPorMoeda: Record<string, Array<{ valor_mediano_previsao_taxa_futura_moeda: number }>>,
  dias: number,
  moedas: string[] = ['USD', 'EUR', 'CNY'],
): CotacaoPtaxInsights[] {
  const indiceMes = resolverIndiceMesFocus(dias)
  const resultado: CotacaoPtaxInsights[] = []

  for (const codigo of moedas) {
    const base = baseAtual.find(m => m.codigo === codigo)
    const previsoes = previsoesPorMoeda[codigo] ?? []
    const previsao = previsoes[Math.min(indiceMes, previsoes.length - 1)]
    if (!base || !previsao || previsao.valor_mediano_previsao_taxa_futura_moeda <= 0) continue

    const valorFuturo = previsao.valor_mediano_previsao_taxa_futura_moeda
    const variacao =
      base.valor_brl > 0
        ? Math.round(((valorFuturo - base.valor_brl) / base.valor_brl) * 1000) / 10
        : 0

    resultado.push({
      ...base,
      referencia: codigo === 'USD',
      valor_brl: Math.round(valorFuturo * 100) / 100,
      variacao,
    })
  }

  return resultado
}

/** @deprecated Preferir montarCotacoesPtaxFuturoPorMoeda com fetch por moeda */
export function montarCotacoesPtaxFuturoFromFocus(
  baseAtual: CotacaoPtaxInsights[],
  previsoesUsd: Array<{ valor_mediano_previsao_taxa_futura_moeda: number }>,
  dias: number,
): CotacaoPtaxInsights[] {
  const indiceMes =
    dias <= 30 ? 0 : dias <= 90 ? 2 : dias <= 180 ? 5 : 11
  const previsao = previsoesUsd[Math.min(indiceMes, previsoesUsd.length - 1)]
  if (!previsao) return []

  const usdAtual = baseAtual.find(m => m.codigo === 'USD')?.valor_brl ?? 0
  const usdFuturo = previsao.valor_mediano_previsao_taxa_futura_moeda
  if (usdFuturo <= 0) return []

  return baseAtual.map(m => {
    if (m.codigo === 'USD') {
      const variacao =
        usdAtual > 0 ? Math.round(((usdFuturo - usdAtual) / usdAtual) * 1000) / 10 : 0
      return {
        ...m,
        valor_brl: Math.round(usdFuturo * 100) / 100,
        variacao,
      }
    }
    const ratio = usdAtual > 0 ? usdFuturo / usdAtual : 1
    const valor = Math.round(m.valor_brl * ratio * 100) / 100
    const variacao =
      m.valor_brl > 0 ? Math.round(((valor - m.valor_brl) / m.valor_brl) * 1000) / 10 : 0
    return { ...m, valor_brl: valor, variacao }
  })
}

export async function buscarTaxasMoedaHistoricoInsights(
  moeda: string,
  dias: number,
): Promise<TaxasMoedaHistoricoInsights> {
  const params = new URLSearchParams({ moeda, dias: String(dias) })
  const res = await fetch(`/api/v1/taxas-moeda/historico?${params}`, { credentials: 'include' })
  if (!res.ok) {
    throw new Error(`Falha ao carregar histórico PTAX (${res.status})`)
  }
  const raw: unknown = await res.json()
  const parsed = taxasMoedaHistoricoResponseSchema.parse(raw)
  const dados = parsed.historico.map(row => {
    const data =
      typeof row.data_cotacao === 'string'
        ? row.data_cotacao.slice(0, 10)
        : row.data_cotacao.toISOString().slice(0, 10)
    return {
      data,
      venda: numeroCampo(row.venda),
      compra: numeroCampo(row.compra ?? row.venda),
    }
  })
  return { moeda: parsed.moeda, dados }
}

export function calcularVariacaoPtaxDiaAnterior(
  porMoeda: Record<string, z.infer<typeof taxaMoedaDtoSchema>[]>,
  codigo: string,
): number {
  const lista = porMoeda[codigo]
  if (!lista || lista.length < 2) return 0
  const atual = numeroCampo(lista[lista.length - 1].venda)
  const anterior = numeroCampo(lista[lista.length - 2].venda)
  if (anterior <= 0) return 0
  return Math.round(((atual - anterior) / anterior) * 10000) / 100
}

export function montarSpreadMedioInsights(
  porMoedaPtax: Record<string, z.infer<typeof taxaMoedaDtoSchema>[]>,
  taxasAplicadas: Record<string, number>,
  moedas: string[] = ['USD', 'EUR', 'CNY'],
): SpreadMoedaInsights[] {
  const spreads = moedas.map(moeda => {
    const ptax = ultimaPtaxMoeda(porMoedaPtax, moeda)
    const aplicada = taxasAplicadas[moeda]
    if (!ptax || !aplicada || ptax.venda <= 0) {
      return { moeda, valor_pct: 0, pct_barra: 0, cor: CORES_SPREAD[moeda] ?? '#94a3b8' }
    }
    const valor_pct = Math.round(((aplicada - ptax.venda) / ptax.venda) * 10000) / 100
    return {
      moeda,
      valor_pct,
      pct_barra: 0,
      cor: CORES_SPREAD[moeda] ?? '#94a3b8',
    }
  })

  const maxAbs = Math.max(...spreads.map(s => Math.abs(s.valor_pct)), 0.01)
  return spreads.map(s => ({
    ...s,
    pct_barra: Math.round((Math.abs(s.valor_pct) / maxAbs) * 100),
  }))
}

export const previsaoTaxaFuturaMoedaResponseSchema = z.object({
  data: z.array(
    z.object({
      moeda_previsao_taxa_futura_moeda: z.string(),
      mes_previsao_taxa_futura_moeda: z.string(),
      valor_mediano_previsao_taxa_futura_moeda: z.number(),
      valor_medio_previsao_taxa_futura_moeda: z.number(),
      fonte_previsao_taxa_futura_moeda: z.string(),
    }),
  ),
  moeda: z.string(),
  meses: z.number(),
  total: z.number(),
})

export async function buscarPrevisoesTaxaFuturaInsights(
  moeda: string,
  meses: number,
): Promise<z.infer<typeof previsaoTaxaFuturaMoedaResponseSchema>> {
  const params = new URLSearchParams({ moeda, meses: String(meses) })
  const res = await fetch(`/api/v1/previsoes-taxa-futura-moeda?${params}`, { credentials: 'include' })
  if (!res.ok) {
    throw new Error(`Falha ao carregar previsões Focus (${res.status})`)
  }
  const raw: unknown = await res.json()
  return previsaoTaxaFuturaMoedaResponseSchema.parse(raw)
}

export async function buscarTaxasMoedaAtuaisInsights(): Promise<
  z.infer<typeof taxasMoedaAtuaisResponseSchema>
> {
  const res = await fetch('/api/v1/taxas-moeda', { credentials: 'include' })
  if (!res.ok) {
    throw new Error(`Falha ao carregar PTAX (${res.status})`)
  }
  const raw: unknown = await res.json()
  return taxasMoedaAtuaisResponseSchema.parse(raw)
}
