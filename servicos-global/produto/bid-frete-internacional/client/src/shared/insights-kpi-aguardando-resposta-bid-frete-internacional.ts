/**
 * KPI Insights — formatadores e ordenação das listas nos tooltips dos cards.
 */

import type { CotacaoInsightsDetalheCliente } from './insights-detalhe-bid-frete-internacional'

export function formatarDataCompactaTooltipKpiInsights(
  dataIso: string | null | undefined,
): string {
  if (!dataIso) return '—'
  const data = new Date(dataIso)
  if (!Number.isFinite(data.getTime())) return '—'
  const dd = String(data.getDate()).padStart(2, '0')
  const mm = String(data.getMonth() + 1).padStart(2, '0')
  const aa = String(data.getFullYear()).slice(-2)
  return `${dd}/${mm}/${aa}`
}

export function formatarTempoDecorridoTooltipKpiInsights(
  dataReferenciaIso: string | null | undefined,
  agoraMs = Date.now(),
): string {
  if (!dataReferenciaIso) return '—'
  const referenciaMs = new Date(dataReferenciaIso).getTime()
  if (!Number.isFinite(referenciaMs)) return '—'

  const diffMs = Math.max(0, agoraMs - referenciaMs)
  const minutos = Math.floor(diffMs / (1000 * 60))
  if (minutos < 1) return '< 1 min'
  if (minutos < 60) return `${minutos} min`

  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `${horas} h`

  const dias = Math.floor(horas / 24)
  if (dias < 30) return `${dias} d`

  const meses = Math.floor(dias / 30)
  return `${meses} m`
}

export function formatarLinhaDataTempoTooltipKpiInsights(
  dataReferenciaIso: string | null | undefined,
  agoraMs = Date.now(),
): string {
  const data = formatarDataCompactaTooltipKpiInsights(dataReferenciaIso)
  if (data === '—') return '—'
  const tempo = formatarTempoDecorridoTooltipKpiInsights(dataReferenciaIso, agoraMs)
  return `${data} · ${tempo}`
}

export function ordenarCotacoesTooltipKpiInsights(
  cotacoes: CotacaoInsightsDetalheCliente[],
  resolverDataReferencia: (cotacao: CotacaoInsightsDetalheCliente) => string | null | undefined,
): CotacaoInsightsDetalheCliente[] {
  return [...cotacoes].sort((a, b) => {
    const dataA = resolverDataReferencia(a)
    const dataB = resolverDataReferencia(b)
    const tsA = dataA ? new Date(dataA).getTime() : Number.POSITIVE_INFINITY
    const tsB = dataB ? new Date(dataB).getTime() : Number.POSITIVE_INFINITY
    return tsA - tsB
  })
}

/** @deprecated Use formatarDataCompactaTooltipKpiInsights */
export function formatarDataEnvioTooltipAguardandoRespostaInsights(
  dataEnvioIso: string | null | undefined,
): string {
  return formatarDataCompactaTooltipKpiInsights(dataEnvioIso)
}

/** @deprecated Use formatarTempoDecorridoTooltipKpiInsights */
export function formatarTempoAguardandoRespostaInsights(
  dataEnvioIso: string | null | undefined,
  agoraMs = Date.now(),
): string {
  return formatarTempoDecorridoTooltipKpiInsights(dataEnvioIso, agoraMs)
}

/** @deprecated Use ordenarCotacoesTooltipKpiInsights */
export function ordenarCotacoesAguardandoRespostaInsights(
  cotacoes: CotacaoInsightsDetalheCliente[],
): CotacaoInsightsDetalheCliente[] {
  return ordenarCotacoesTooltipKpiInsights(
    cotacoes,
    c => c.data_envio_disparo_cotacao_bid_frete_internacional,
  )
}
