/**
 * E-mail ao comprador quando um fornecedor envia ou atualiza proposta.
 */

import { formatarMoedaColocacaoEmailBidFrete } from './colocacao-eixos-aprovacao-bid-frete-internacional.js'
import {
  escapeHtmlTextoEmailBidFrete,
  formatarModalExibicaoEmailDisparoBidFrete,
  formatarRotaEmailDisparoBidFrete,
} from './formatar-email-disparo-bid-frete-internacional.js'
import {
  montarHtmlLayoutEmailCompradorBidFreteInternacional,
  montarRodapeTextoPlanoEmailCompradorBidFreteInternacional,
  type LinhaResumoEmailCompradorBidFreteInternacional,
} from './layout-email-comprador-bid-frete-internacional.js'

export const ROTULO_BOTAO_PROPOSTAS_EMAIL_COMPRADOR_BID_FRETE_INTERNACIONAL = 'Ver propostas'

export interface ParametrosEmailRespostaFornecedorCompradorBidFreteInternacional {
  numeroCotacao: string
  nomeComprador: string
  nomeFornecedor: string
  tipo: 'criar' | 'atualizar'
  moeda: string
  valorTotal: number
  diasTransito: number
  modal: string
  modalidade?: string | null
  origemNome: string
  origemPais: string
  destinoNome: string
  destinoPais: string
  quantidadePropostasRecebidas: number
  linkDetalheCotacao: string
}

function linhasResumoRespostaFornecedorComprador(
  params: ParametrosEmailRespostaFornecedorCompradorBidFreteInternacional,
): LinhaResumoEmailCompradorBidFreteInternacional[] {
  return [
    ['Número', params.numeroCotacao],
    ['Fornecedor', params.nomeFornecedor.trim() || '—'],
    [
      'Valor total',
      formatarMoedaColocacaoEmailBidFrete(params.valorTotal, params.moeda),
    ],
    ['Transit time', `${params.diasTransito} dias`],
    [
      'Rota',
      formatarRotaEmailDisparoBidFrete(
        params.origemNome,
        params.origemPais,
        params.destinoNome,
        params.destinoPais,
      ),
    ],
    ['Modal', formatarModalExibicaoEmailDisparoBidFrete(params.modal, params.modalidade)],
    [
      'Propostas recebidas',
      params.quantidadePropostasRecebidas.toLocaleString('pt-BR'),
    ],
  ]
}

export function montarAssuntoEmailRespostaFornecedorCompradorBidFreteInternacional(
  params: ParametrosEmailRespostaFornecedorCompradorBidFreteInternacional,
): string {
  if (params.tipo === 'atualizar') {
    return `Proposta atualizada — ${params.numeroCotacao} · ${params.nomeFornecedor.trim()}`
  }
  return `Nova resposta — ${params.numeroCotacao} · ${params.nomeFornecedor.trim()}`
}

export function montarPreheaderEmailRespostaFornecedorCompradorBidFreteInternacional(
  params: ParametrosEmailRespostaFornecedorCompradorBidFreteInternacional,
): string {
  const valor = formatarMoedaColocacaoEmailBidFrete(params.valorTotal, params.moeda)
  if (params.tipo === 'atualizar') {
    return `${params.nomeFornecedor.trim()} atualizou a proposta (${valor}) na cotação ${params.numeroCotacao}.`
  }
  return `${params.nomeFornecedor.trim()} enviou proposta (${valor}) na cotação ${params.numeroCotacao}.`
}

export function montarTextoPlanoEmailRespostaFornecedorCompradorBidFreteInternacional(
  params: ParametrosEmailRespostaFornecedorCompradorBidFreteInternacional,
): string {
  const intro =
    params.tipo === 'atualizar'
      ? `O fornecedor ${params.nomeFornecedor.trim()} atualizou a proposta na cotação ${params.numeroCotacao}.`
      : `O fornecedor ${params.nomeFornecedor.trim()} enviou uma proposta na cotação ${params.numeroCotacao}.`

  const linhas = linhasResumoRespostaFornecedorComprador(params)

  return [
    'Gravity — BID Frete Internacional',
    '',
    `Olá, ${params.nomeComprador.trim()},`,
    '',
    intro,
    'Confira os valores e compare as respostas na plataforma.',
    '',
    ...linhas.map(([rotulo, valor]) => `${rotulo}: ${valor}`),
    ...montarRodapeTextoPlanoEmailCompradorBidFreteInternacional(
      ROTULO_BOTAO_PROPOSTAS_EMAIL_COMPRADOR_BID_FRETE_INTERNACIONAL,
      params.linkDetalheCotacao,
    ),
  ].join('\n')
}

export function montarHtmlEmailRespostaFornecedorCompradorBidFreteInternacional(
  params: ParametrosEmailRespostaFornecedorCompradorBidFreteInternacional,
): string {
  const fornecedorHtml = escapeHtmlTextoEmailBidFrete(params.nomeFornecedor.trim())
  const numeroHtml = escapeHtmlTextoEmailBidFrete(params.numeroCotacao)
  const assunto = montarAssuntoEmailRespostaFornecedorCompradorBidFreteInternacional(params)
  const subtituloHeader = params.tipo === 'atualizar'
    ? 'Proposta atualizada pelo fornecedor'
    : 'Nova resposta recebida'
  const introHtml = params.tipo === 'atualizar'
    ? `O fornecedor <strong>${fornecedorHtml}</strong> atualizou a proposta na cotação <strong>${numeroHtml}</strong>.`
    : `O fornecedor <strong>${fornecedorHtml}</strong> enviou uma proposta na cotação <strong>${numeroHtml}</strong>.`

  return montarHtmlLayoutEmailCompradorBidFreteInternacional({
    assunto,
    preheader: montarPreheaderEmailRespostaFornecedorCompradorBidFreteInternacional(params),
    subtituloHeader,
    nomeComprador: params.nomeComprador,
    introHtml:
      `${introHtml} Confira os valores e compare as respostas recebidas até o momento.`,
    linhasResumo: linhasResumoRespostaFornecedorComprador(params),
    rotuloBotao: ROTULO_BOTAO_PROPOSTAS_EMAIL_COMPRADOR_BID_FRETE_INTERNACIONAL,
    linkAcao: params.linkDetalheCotacao,
  })
}
