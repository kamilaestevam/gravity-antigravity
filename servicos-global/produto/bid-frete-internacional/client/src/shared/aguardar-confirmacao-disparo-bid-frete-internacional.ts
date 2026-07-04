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
  cotacao: Cotacao
}

/** Poll GET cotação até disparos terminal (ENVIADO/ERRO) ou timeout. */
export async function aguardarConfirmacaoDisparoCotacao(
  idCotacao: string,
  buscarCotacao: (id: string) => Promise<Cotacao>,
  opts?: { intervaloMs?: number; esperaMaximaMs?: number },
): Promise<ResultadoConfirmacaoDisparoCotacao> {
  const intervaloMs = opts?.intervaloMs ?? INTERVALO_PADRAO_MS
  const esperaMaximaMs = opts?.esperaMaximaMs ?? ESPERA_MAXIMA_PADRAO_MS
  const inicio = Date.now()

  let cotacao = await buscarCotacao(idCotacao)
  let resumo = montarResumoDisparoFromCotacao(cotacao)

  while (!disparosCotacaoResolvidos(listarDisparosCotacao(cotacao))) {
    if (Date.now() - inicio >= esperaMaximaMs) {
      return { resumo, confirmado: false, cotacao }
    }
    await dormir(intervaloMs)
    cotacao = await buscarCotacao(idCotacao)
    resumo = montarResumoDisparoFromCotacao(cotacao)
  }

  return { resumo, confirmado: resumo.disparos !== 0, cotacao }
}
