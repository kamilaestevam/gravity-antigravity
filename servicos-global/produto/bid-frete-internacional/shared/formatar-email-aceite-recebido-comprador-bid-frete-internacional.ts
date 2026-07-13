/**
 * E-mail ao comprador quando o ganhador confirma "Recebi e estou de acordo".
 */

import { escapeHtmlTextoEmailBidFrete } from './formatar-email-disparo-bid-frete-internacional.js'
import {
  montarHtmlLayoutEmailCompradorBidFreteInternacional,
  montarRodapeTextoPlanoEmailCompradorBidFreteInternacional,
  type LinhaResumoEmailCompradorBidFreteInternacional,
} from './layout-email-comprador-bid-frete-internacional.js'

export const ROTULO_BOTAO_COMPARATIVO_EMAIL_ACEITE_COMPRADOR_BID_FRETE_INTERNACIONAL = 'Abrir comparativo'

export const TEXTO_ENCERRAMENTO_BID_FRETE_INTERNACIONAL_EMAIL_ACEITE_COMPRADOR =
  'BID Frete Internacional encerrado — você pode acompanhar todo o histórico na plataforma. '
  + 'Se tiver outros produtos Gravity, acompanhe a evolução do embarque, chegada, desembaraço, entrega, entre outros.'

export type ParametrosEmailAceiteRecebidoCompradorBidFreteInternacional = {
  numeroCotacao: string
  nomeFornecedor: string
  nomeComprador: string
  dataAceite: Date
  linkComparativo: string
}

function formatarDataAceiteEmailComprador(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function linhasResumoAceiteComprador(
  params: ParametrosEmailAceiteRecebidoCompradorBidFreteInternacional,
): LinhaResumoEmailCompradorBidFreteInternacional[] {
  return [
    ['Número', params.numeroCotacao],
    ['Fornecedor ganhador', params.nomeFornecedor.trim() || '—'],
    ['Aceite registrado em', formatarDataAceiteEmailComprador(params.dataAceite)],
  ]
}

export function montarAssuntoEmailAceiteRecebidoCompradorBidFreteInternacional(
  numeroCotacao: string,
): string {
  return `Aceite confirmado — cotação ${numeroCotacao}`
}

export function montarPreheaderEmailAceiteRecebidoCompradorBidFreteInternacional(
  params: ParametrosEmailAceiteRecebidoCompradorBidFreteInternacional,
): string {
  return `${params.nomeFornecedor.trim()} confirmou a aprovação na cotação ${params.numeroCotacao}. Acompanhe o histórico na plataforma Gravity.`
}

export function montarTextoPlanoEmailAceiteRecebidoCompradorBidFreteInternacional(
  params: ParametrosEmailAceiteRecebidoCompradorBidFreteInternacional,
): string {
  const linhas = linhasResumoAceiteComprador(params)

  return [
    'Gravity — BID Frete Internacional',
    '',
    `Olá, ${params.nomeComprador.trim()},`,
    '',
    `O fornecedor ${params.nomeFornecedor.trim()} confirmou o recebimento da aprovação na cotação ${params.numeroCotacao}.`,
    TEXTO_ENCERRAMENTO_BID_FRETE_INTERNACIONAL_EMAIL_ACEITE_COMPRADOR,
    '',
    ...linhas.map(([rotulo, valor]) => `${rotulo}: ${valor}`),
    ...montarRodapeTextoPlanoEmailCompradorBidFreteInternacional(
      ROTULO_BOTAO_COMPARATIVO_EMAIL_ACEITE_COMPRADOR_BID_FRETE_INTERNACIONAL,
      params.linkComparativo,
    ),
  ].join('\n')
}

export function montarHtmlEmailAceiteRecebidoCompradorBidFreteInternacional(
  params: ParametrosEmailAceiteRecebidoCompradorBidFreteInternacional,
): string {
  const fornecedorHtml = escapeHtmlTextoEmailBidFrete(params.nomeFornecedor.trim())
  const numeroHtml = escapeHtmlTextoEmailBidFrete(params.numeroCotacao)
  const assunto = montarAssuntoEmailAceiteRecebidoCompradorBidFreteInternacional(params.numeroCotacao)

  return montarHtmlLayoutEmailCompradorBidFreteInternacional({
    assunto,
    preheader: montarPreheaderEmailAceiteRecebidoCompradorBidFreteInternacional(params),
    subtituloHeader: 'Fornecedor confirmou a aprovação',
    nomeComprador: params.nomeComprador,
    introHtml:
      `O fornecedor <strong>${fornecedorHtml}</strong> confirmou o recebimento da aprovação na cotação `
      + `<strong>${numeroHtml}</strong>. ${escapeHtmlTextoEmailBidFrete(TEXTO_ENCERRAMENTO_BID_FRETE_INTERNACIONAL_EMAIL_ACEITE_COMPRADOR)}`,
    linhasResumo: linhasResumoAceiteComprador(params),
    rotuloBotao: ROTULO_BOTAO_COMPARATIVO_EMAIL_ACEITE_COMPRADOR_BID_FRETE_INTERNACIONAL,
    linkAcao: params.linkComparativo,
  })
}
