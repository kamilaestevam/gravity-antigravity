/**
 * E-mail ao comprador quando a solicitação de cotação é enviada aos fornecedores.
 */

import {
  escapeHtmlTextoEmailBidFrete,
  formatarDataEmailDisparoBidFrete,
  formatarModalExibicaoEmailDisparoBidFrete,
  formatarRotaEmailDisparoBidFrete,
} from './formatar-email-disparo-bid-frete-internacional.js'
import {
  montarHtmlLayoutEmailCompradorBidFreteInternacional,
  montarRodapeTextoPlanoEmailCompradorBidFreteInternacional,
  montarTabelaFornecedoresDisparoEmailCompradorBidFreteInternacional,
  type LinhaFornecedorDisparoEmailCompradorBidFreteInternacional,
  type LinhaResumoEmailCompradorBidFreteInternacional,
} from './layout-email-comprador-bid-frete-internacional.js'

export const ROTULO_BOTAO_DETALHE_COTACAO_EMAIL_COMPRADOR_BID_FRETE_INTERNACIONAL = 'Ver cotação'

export interface ParametrosEmailDisparoCompradorBidFreteInternacional {
  numeroCotacao: string
  nomeComprador: string
  referenciaInterna?: string | null
  modal: string
  modalidade?: string | null
  origemNome: string
  origemPais: string
  destinoNome: string
  destinoPais: string
  incoterm: string
  mercadoria: string
  quantidadeFornecedores: number
  data_limite_resposta_cotacao_bid_frete_internacional?: string | Date | null
  dataHoraDisparo?: string | Date | null
  fornecedoresDisparo?: LinhaFornecedorDisparoEmailCompradorBidFreteInternacional[]
  linkDetalheCotacao: string
}

export function formatarDataHoraEnvioEmailDisparoCompradorBidFreteInternacional(
  valor: string | Date | null | undefined,
): string {
  if (valor == null || valor === '') return '—'
  const data = valor instanceof Date ? valor : new Date(valor)
  if (Number.isNaN(data.getTime())) return '—'
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

function rotuloCanalDisparoTextoPlanoComprador(canal: string): string {
  if (canal === 'WHATSAPP') return 'WhatsApp'
  if (canal === 'EMAIL') return 'E-mail'
  return canal.trim() || '—'
}

function rotuloStatusDisparoTextoPlanoComprador(
  status: LinhaFornecedorDisparoEmailCompradorBidFreteInternacional['status'],
): string {
  return status === 'ENVIADO' ? 'Enviado' : 'Falha no envio'
}

function ordenarFornecedoresDisparoEmailComprador(
  linhas: LinhaFornecedorDisparoEmailCompradorBidFreteInternacional[],
): LinhaFornecedorDisparoEmailCompradorBidFreteInternacional[] {
  return [...linhas].sort((a, b) => {
    const nome = a.nomeFornecedor.localeCompare(b.nomeFornecedor, 'pt-BR')
    if (nome !== 0) return nome
    return a.canal.localeCompare(b.canal)
  })
}

function linhasResumoDisparoComprador(
  params: ParametrosEmailDisparoCompradorBidFreteInternacional,
): LinhaResumoEmailCompradorBidFreteInternacional[] {
  const linhas: LinhaResumoEmailCompradorBidFreteInternacional[] = [
    ['Número', params.numeroCotacao],
  ]

  if (params.referenciaInterna?.trim()) {
    linhas.push(['Referência interna', params.referenciaInterna.trim()])
  }

  linhas.push(
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
    ['Incoterm', params.incoterm.trim() || '—'],
    ['Mercadoria', params.mercadoria.trim() || '—'],
    [
      'Fornecedores contatados',
      params.quantidadeFornecedores.toLocaleString('pt-BR'),
    ],
  )

  const envio = formatarDataHoraEnvioEmailDisparoCompradorBidFreteInternacional(params.dataHoraDisparo)
  if (envio !== '—') {
    linhas.push(['Envio realizado em', envio])
  }

  const prazo = formatarDataEmailDisparoBidFrete(
    params.data_limite_resposta_cotacao_bid_frete_internacional,
  )
  if (prazo) {
    linhas.push(['Prazo para resposta', prazo])
  }

  return linhas
}

export function montarAssuntoEmailDisparoCompradorBidFreteInternacional(
  params: ParametrosEmailDisparoCompradorBidFreteInternacional,
): string {
  const rota = formatarRotaEmailDisparoBidFrete(
    params.origemNome,
    params.origemPais,
    params.destinoNome,
    params.destinoPais,
  )
  return `Solicitação enviada — ${params.numeroCotacao} · ${rota}`
}

export function montarPreheaderEmailDisparoCompradorBidFreteInternacional(
  params: ParametrosEmailDisparoCompradorBidFreteInternacional,
): string {
  const n = params.quantidadeFornecedores
  const fornecedores = n === 1 ? '1 fornecedor' : `${n} fornecedores`
  return `Cotação ${params.numeroCotacao} enviada a ${fornecedores}. Acompanhe as respostas na plataforma.`
}

export function montarTextoPlanoEmailDisparoCompradorBidFreteInternacional(
  params: ParametrosEmailDisparoCompradorBidFreteInternacional,
): string {
  const n = params.quantidadeFornecedores
  const fornecedores = n === 1 ? '1 fornecedor' : `${n} fornecedores`
  const linhas = linhasResumoDisparoComprador(params)
  const fornecedoresDisparo = ordenarFornecedoresDisparoEmailComprador(params.fornecedoresDisparo ?? [])
  const linhasFornecedores = fornecedoresDisparo.flatMap(linha => [
    `- ${linha.nomeFornecedor.trim() || '—'} · ${rotuloCanalDisparoTextoPlanoComprador(linha.canal)} · ${formatarDataHoraEnvioEmailDisparoCompradorBidFreteInternacional(linha.dataHoraEnvio)} · ${rotuloStatusDisparoTextoPlanoComprador(linha.status)}`,
  ])

  return [
    'Gravity — BID Frete Internacional',
    '',
    `Olá, ${params.nomeComprador.trim()},`,
    '',
    `Sua cotação ${params.numeroCotacao} foi enviada a ${fornecedores}.`,
    'Os fornecedores selecionados receberam o convite por e-mail e podem enviar propostas pelo link da solicitação.',
    '',
    ...linhas.map(([rotulo, valor]) => `${rotulo}: ${valor}`),
    ...(linhasFornecedores.length > 0 ? ['', 'Fornecedores:', ...linhasFornecedores] : []),
    ...montarRodapeTextoPlanoEmailCompradorBidFreteInternacional(
      ROTULO_BOTAO_DETALHE_COTACAO_EMAIL_COMPRADOR_BID_FRETE_INTERNACIONAL,
      params.linkDetalheCotacao,
    ),
  ].join('\n')
}

export function montarHtmlEmailDisparoCompradorBidFreteInternacional(
  params: ParametrosEmailDisparoCompradorBidFreteInternacional,
): string {
  const n = params.quantidadeFornecedores
  const fornecedores = n === 1 ? '1 fornecedor' : `${n} fornecedores`
  const numeroHtml = escapeHtmlTextoEmailBidFrete(params.numeroCotacao)
  const assunto = montarAssuntoEmailDisparoCompradorBidFreteInternacional(params)

  const fornecedoresDisparo = ordenarFornecedoresDisparoEmailComprador(params.fornecedoresDisparo ?? [])
  const tabelaFornecedores = montarTabelaFornecedoresDisparoEmailCompradorBidFreteInternacional({
    titulo: 'Fornecedores contatados',
    linhas: fornecedoresDisparo,
    formatarDataHora: formatarDataHoraEnvioEmailDisparoCompradorBidFreteInternacional,
  })

  return montarHtmlLayoutEmailCompradorBidFreteInternacional({
    assunto,
    preheader: montarPreheaderEmailDisparoCompradorBidFreteInternacional(params),
    subtituloHeader: 'Solicitação enviada aos fornecedores',
    nomeComprador: params.nomeComprador,
    introHtml:
      `Sua cotação <strong>${numeroHtml}</strong> foi enviada a <strong>${escapeHtmlTextoEmailBidFrete(fornecedores)}</strong>. `
      + 'Os convites foram disparados por e-mail — você será avisado conforme as respostas chegarem.',
    linhasResumo: linhasResumoDisparoComprador(params),
    textoPosResumoHtml: tabelaFornecedores,
    rotuloBotao: ROTULO_BOTAO_DETALHE_COTACAO_EMAIL_COMPRADOR_BID_FRETE_INTERNACIONAL,
    linkAcao: params.linkDetalheCotacao,
  })
}
