/**
 * Confirmação honesta pós-criação: polling até disparos saírem de PENDENTE.
 */

import type { Cotacao, DisparoCotacaoBidFreteInternacional } from './types'
import type { ResultadoDisparoItem, ResultadoDisparoResumo } from './formatar-resultado-disparo-bid-frete-internacional'

const INTERVALO_PADRAO_MS = 2_000
const ESPERA_MAXIMA_PADRAO_MS = 45_000

export function listarDisparosCotacao(cotacao: Cotacao): DisparoCotacaoBidFreteInternacional[] {
  return cotacao.disparo_cotacao_bid_frete_internacional ?? []
}

export function disparosCotacaoResolvidos(disparos: DisparoCotacaoBidFreteInternacional[]): boolean {
  if (disparos.length === 0) return false
  return disparos.every(
    d => d.status_disparo_cotacao_bid_frete_internacional !== 'PENDENTE',
  )
}

export function montarResumoDisparoFromCotacao(cotacao: Cotacao): ResultadoDisparoResumo {
  const disparos = listarDisparosCotacao(cotacao)
  const results: ResultadoDisparoItem[] = disparos.map(d => ({
    id_fornecedor_bid_frete_internacional: d.id_fornecedor_bid_frete_internacional,
    nome_fornecedor_bid_frete_internacional:
      d.fornecedor?.nome_fornecedor_bid_frete_internacional
      ?? d.fornecedor?.nome_fantasia_fornecedor_bid_frete_internacional
      ?? undefined,
    canal_disparo_cotacao_bid_frete_internacional: d.canal_disparo_cotacao_bid_frete_internacional,
    status_disparo_cotacao_bid_frete_internacional: d.status_disparo_cotacao_bid_frete_internacional,
    erro_envio_disparo_cotacao_bid_frete_internacional: d.erro_envio_disparo_cotacao_bid_frete_internacional,
  }))

  const enviadosOk = results.filter(r => r.status_disparo_cotacao_bid_frete_internacional === 'ENVIADO').length
  const errosEnvio = results.filter(r => r.status_disparo_cotacao_bid_frete_internacional === 'ERRO_ENVIO').length
  const pendentes = results.filter(r => r.status_disparo_cotacao_bid_frete_internacional === 'PENDENTE').length

  return {
    disparos: results.length,
    enviados: enviadosOk > 0 && pendentes === 0 && errosEnvio === 0,
    enviados_ok: enviadosOk,
    erros_envio: errosEnvio,
    results,
    ...(pendentes > 0
      ? { message: `${pendentes} disparo(s) ainda sem confirmação de entrega` }
      : {}),
  }
}

function dormir(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export type ResultadoConfirmacaoDisparoCotacao = {
  resumo: ResultadoDisparoResumo
  confirmado: boolean
  cotacao: Cotacao | null
  /** Falhas transitórias de rede/proxy durante o polling (502, timeout). */
  falhasConsulta: number
}

async function buscarCotacaoComRetry(
  idCotacao: string,
  buscarCotacao: (id: string) => Promise<Cotacao>,
): Promise<Cotacao | null> {
  try {
    return await buscarCotacao(idCotacao)
  } catch {
    return null
  }
}

/** Poll GET cotação até disparos terminal (ENVIADO/ERRO) ou timeout. Nunca lança — falhas de rede são retentadas. */
export async function aguardarConfirmacaoDisparoCotacao(
  idCotacao: string,
  buscarCotacao: (id: string) => Promise<Cotacao>,
  opts?: { intervaloMs?: number; esperaMaximaMs?: number },
): Promise<ResultadoConfirmacaoDisparoCotacao> {
  const intervaloMs = opts?.intervaloMs ?? INTERVALO_PADRAO_MS
  const esperaMaximaMs = opts?.esperaMaximaMs ?? ESPERA_MAXIMA_PADRAO_MS
  const inicio = Date.now()
  let falhasConsulta = 0

  let cotacao: Cotacao | null = await buscarCotacaoComRetry(idCotacao, buscarCotacao)
  if (!cotacao) {
    falhasConsulta += 1
  }

  let resumo: ResultadoDisparoResumo = cotacao
    ? montarResumoDisparoFromCotacao(cotacao)
    : { disparos: 0, enviados: false, enviados_ok: 0, erros_envio: 0, results: [] }

  while (!cotacao || !disparosCotacaoResolvidos(listarDisparosCotacao(cotacao))) {
    if (Date.now() - inicio >= esperaMaximaMs) {
      return { resumo, confirmado: false, cotacao, falhasConsulta }
    }
    await dormir(intervaloMs)
    const proxima = await buscarCotacaoComRetry(idCotacao, buscarCotacao)
    if (!proxima) {
      falhasConsulta += 1
      continue
    }
    cotacao = proxima
    resumo = montarResumoDisparoFromCotacao(cotacao)
  }

  return { resumo, confirmado: resumo.disparos !== 0, cotacao, falhasConsulta }
}
