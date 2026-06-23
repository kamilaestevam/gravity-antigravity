/**
 * KPI Insights — tooltip «Cotações aguardando resposta».
 */

import type { CotacaoInsightsDetalheCliente } from './insights-detalhe-bid-frete-internacional'

export function formatarDataEnvioTooltipAguardandoRespostaInsights(
  dataEnvioIso: string | null | undefined,
): string {
  if (!dataEnvioIso) return '—'
  const data = new Date(dataEnvioIso)
  if (!Number.isFinite(data.getTime())) return '—'
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatarTempoAguardandoRespostaInsights(
  dataEnvioIso: string | null | undefined,
  agoraMs = Date.now(),
): string {
  if (!dataEnvioIso) return '—'
  const envioMs = new Date(dataEnvioIso).getTime()
  if (!Number.isFinite(envioMs)) return '—'

  const diffMs = Math.max(0, agoraMs - envioMs)
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

function timestampEnvioCotacaoInsights(cotacao: CotacaoInsightsDetalheCliente): number {
  const envio = cotacao.data_envio_disparo_cotacao_bid_frete_internacional
  if (!envio) return Number.POSITIVE_INFINITY
  const ts = new Date(envio).getTime()
  return Number.isFinite(ts) ? ts : Number.POSITIVE_INFINITY
}

/** Mais tempo aguardando primeiro; sem data de envio ao final. */
export function ordenarCotacoesAguardandoRespostaInsights(
  cotacoes: CotacaoInsightsDetalheCliente[],
): CotacaoInsightsDetalheCliente[] {
  return [...cotacoes].sort(
    (a, b) => timestampEnvioCotacaoInsights(a) - timestampEnvioCotacaoInsights(b),
  )
}
