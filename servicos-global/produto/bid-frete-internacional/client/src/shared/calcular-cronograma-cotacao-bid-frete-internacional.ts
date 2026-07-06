import type { DisparoCotacaoBidFreteInternacional, StatusCotacao } from './types'

export interface DatasDerivadasCronogramaCotacao {
  data_primeiro_envio_disparo: string | null
  data_ultima_resposta_disparo: string | null
}

/** Status em que o prazo para resposta ainda pode ser ajustado manualmente. */
export const STATUS_COTACAO_PERMITE_EDITAR_PRAZO_RESPOSTA: StatusCotacao[] = [
  'RASCUNHO',
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'COTACAO_ALTERADA',
  'AGUARDANDO_APROVACAO',
  'FALTA_INFORMACAO',
]

function parseMs(iso: string | null | undefined): number | null {
  if (!iso) return null
  const ms = new Date(iso).getTime()
  return Number.isFinite(ms) ? ms : null
}

/** Agrega datas de envio/resposta a partir dos disparos (por fornecedor). */
export function calcularDatasDerivadasCronogramaCotacao(
  disparos: DisparoCotacaoBidFreteInternacional[],
): DatasDerivadasCronogramaCotacao {
  let minEnvio: number | null = null
  let maxResposta: number | null = null

  for (const disparo of disparos) {
    const envio = parseMs(disparo.data_envio_disparo_cotacao_bid_frete_internacional)
    if (envio != null) {
      minEnvio = minEnvio == null ? envio : Math.min(minEnvio, envio)
    }
    const resposta = parseMs(disparo.data_resposta_disparo_cotacao_bid_frete_internacional)
    if (resposta != null) {
      maxResposta = maxResposta == null ? resposta : Math.max(maxResposta, resposta)
    }
  }

  return {
    data_primeiro_envio_disparo: minEnvio != null ? new Date(minEnvio).toISOString() : null,
    data_ultima_resposta_disparo: maxResposta != null ? new Date(maxResposta).toISOString() : null,
  }
}

export function cotacaoPermiteEditarPrazoResposta(status: StatusCotacao | null | undefined): boolean {
  if (!status) return true
  return STATUS_COTACAO_PERMITE_EDITAR_PRAZO_RESPOSTA.includes(status)
}

export function isoParaInputDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const data = new Date(iso)
  if (!Number.isFinite(data.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}`
}

export function inputDatetimeLocalParaIso(valor: string): string | null {
  const texto = valor.trim()
  if (!texto) return null
  const data = new Date(texto)
  if (!Number.isFinite(data.getTime())) return null
  return data.toISOString()
}
