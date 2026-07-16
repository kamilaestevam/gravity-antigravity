/**
 * Termo de Ciência — Envio de Proposta (BID Frete Internacional).
 * SSOT versionado; variantes conforme quem pagará a Taxa de Fechamento, se houver Fechamento.
 */

import type { EmpresaPagadoraTaxaFechamentoPlataformaGravity } from './empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'
import { normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity } from './empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'
import {
  DIAS_ATRASO_SUSPENSAO_FORNECEDOR_BID_FRETE_INTERNACIONAL,
  ROTULO_TAXA_FECHAMENTO_FRETE_USD,
} from './condicoes-plataforma-fornecedor-bid-frete-internacional.js'
import { IDENTIFICACAO_LEGAL_OPERADORA_GRAVITY_DATI } from './contrato-fechamento-plataforma-bid-frete-internacional.js'
import {
  type ContextoIdentificacaoFornecedorContratoBidFreteInternacional,
  montarQualificacaoFornecedorContratoBidFreteInternacional,
  PARAGRAFOS_IDENTIFICACAO_ELETRONICA_CIENCIA_PROPOSTA_BID_FRETE,
  anexarTokenQueryContratoPlataformaBidFreteInternacional,
} from './identificacao-eletronica-contrato-bid-frete-internacional.js'

export const VERSAO_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL = '1.5'

export const DATA_VIGENCIA_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL = '12/07/2026'

export const ROTA_BASE_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL =
  '/bid-frete/visao-fornecedor-bid-frete-internacional/contrato-proposta'

export const ROTA_CONTRATO_PROPOSTA_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL =
  `${ROTA_BASE_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL}/pagamento-fornecedor`

export const ROTA_CONTRATO_PROPOSTA_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL =
  `${ROTA_BASE_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL}/pagamento-contratante-gravity`

export interface SecaoContratoPropostaPlataformaBidFreteInternacional {
  titulo: string
  paragrafos: string[]
}

export interface DocumentoContratoPropostaPlataformaBidFreteInternacional {
  titulo: string
  subtituloPagador: string
  slug: 'pagamento-fornecedor' | 'pagamento-contratante-gravity'
  rota: string
  secoes: SecaoContratoPropostaPlataformaBidFreteInternacional[]
}

function montarSecoesComunsContratoProposta(
  params: {
    clausulaTaxaFechamento: string[]
    clausulaFormaCobranca: string[]
  },
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): SecaoContratoPropostaPlataformaBidFreteInternacional[] {
  return [
    {
      titulo: '1. Qualificação',
      paragrafos: [
        `OPERADORA DA PLATAFORMA: ${IDENTIFICACAO_LEGAL_OPERADORA_GRAVITY_DATI}.`,
        `FORNECEDOR: ${montarQualificacaoFornecedorContratoBidFreteInternacional(contexto)}.`,
      ],
    },
    {
      titulo: '2. Natureza deste documento',
      paragrafos: [
        'Este termo é um aviso pré contratual de caráter informativo, disponibilizado pela DATI (marca Gravity) '
        + 'em atenção ao dever de informação e à boa fé objetiva (art. 422 do Código Civil).',
        'O envio de proposta pela Plataforma constitui declaração de ciência das condições abaixo e não celebra '
        + 'contrato de prestação de serviços nem gera obrigação de pagamento nesta etapa.',
        'O contrato de prestação de serviços da Plataforma será celebrado somente no Fechamento do frete, '
        + 'mediante aceite expresso «li e aceito» registrado eletronicamente.',
      ],
    },
    {
      titulo: '3. Gratuidade da participação',
      paragrafos: [
        'Receber o convite, analisar a cotação e enviar proposta é gratuito. Nenhum valor é cobrado do FORNECEDOR '
        + 'nesta etapa, independentemente do resultado da cotação.',
      ],
    },
    {
      titulo: '4. Taxa de Fechamento (success fee)',
      paragrafos: params.clausulaTaxaFechamento,
    },
    {
      titulo: '5. Forma de cobrança',
      paragrafos: params.clausulaFormaCobranca,
    },
    {
      titulo: '6. Atraso de pagamento',
      paragrafos: [
        `Quando aplicável ao FORNECEDOR, o atraso superior a ${DIAS_ATRASO_SUSPENSAO_FORNECEDOR_BID_FRETE_INTERNACIONAL} (cinco) dias corridos no boleto poderá suspender o acesso à Plataforma até a quitação (art. 476 do Código Civil).`,
      ],
    },
    {
      titulo: '7. Declaração de ciência e identificação eletrônica',
      paragrafos: [
        'Ao enviar a proposta, o FORNECEDOR declara ter lido este termo e estar ciente das condições comerciais '
        + 'aplicáveis caso venha a haver Fechamento na Plataforma.',
        'A declaração é registrada eletronicamente com data e hora, nos termos da Medida Provisória nº 2.200-2/2001.',
        ...PARAGRAFOS_IDENTIFICACAO_ELETRONICA_CIENCIA_PROPOSTA_BID_FRETE,
      ],
    },
    {
      titulo: '8. Confidencialidade do Solicitante',
      paragrafos: [
        'Quando o Solicitante optar por anonimato, o FORNECEDOR verá apenas indicação de cliente oculto até eventual Fechamento, ocasião em que a identidade será revelada.',
      ],
    },
    {
      titulo: '9. Proteção de dados',
      paragrafos: [
        'Os dados do FORNECEDOR são tratados em conformidade com a Lei nº 13.709/2018 (LGPD), para viabilizar a cotação e etapas preliminares à eventual contratação.',
      ],
    },
    {
      titulo: '10. Atualizações',
      paragrafos: [
        'Aplica-se a cada proposta a versão vigente deste termo na data do envio. Versão e data de vigência constam no cabeçalho desta página.',
      ],
    },
  ]
}

const montarSecoesTaxaFornecedorContratoProposta = (
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): SecaoContratoPropostaPlataformaBidFreteInternacional[] =>
  montarSecoesComunsContratoProposta({
    clausulaTaxaFechamento: [
      `Caso o Solicitante feche o frete com o FORNECEDOR na Plataforma, será devida Taxa de Fechamento de ${ROTULO_TAXA_FECHAMENTO_FRETE_USD} por frete. **A taxa é paga pelo FORNECEDOR (você), na modalidade de pagamento que o Solicitante da cotação selecionou ao abrir este BID.**`,
      'O valor em dólar é referência de indexação; a cobrança em reais (BRL) segue PTAX venda D-1 (Lei nº 14.286/2022).',
      '***Nenhuma taxa é devida se não houver Fechamento ou se outro fornecedor for escolhido.***',
    ],
    clausulaFormaCobranca: [
      'As taxas do mês são consolidadas em boleto mensal em nome do FORNECEDOR, com detalhamento por cotação fechada.',
    ],
  }, contexto)

const montarSecoesTaxaContratanteGravityContratoProposta = (
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): SecaoContratoPropostaPlataformaBidFreteInternacional[] =>
  montarSecoesComunsContratoProposta({
    clausulaTaxaFechamento: [
      `Caso haja Fechamento na Plataforma, a Taxa de Fechamento de ${ROTULO_TAXA_FECHAMENTO_FRETE_USD} será paga pelo Solicitante enquanto Contratante Gravity, e o FORNECEDOR não será cobrado por essa taxa.`,
      'O FORNECEDOR declara ciência desta modalidade ao enviar a proposta.',
      'Nenhuma taxa é devida pelo FORNECEDOR nesta etapa nem em caso de Fechamento nesta modalidade.',
    ],
    clausulaFormaCobranca: [
      'A Taxa de Fechamento, quando aplicável, será faturada à organização Solicitante (Contratante Gravity), conforme condições comerciais entre esta e a DATI.',
      'O FORNECEDOR não receberá boleto de success fee da Plataforma nesta modalidade.',
    ],
  }, contexto)

export function montarDocumentoContratoPropostaPlataformaBidFreteInternacional(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null | undefined,
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): DocumentoContratoPropostaPlataformaBidFreteInternacional {
  const normalizado = normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(pagador)
  const slug = normalizado === 'CONTRATANTE_GRAVITY' ? 'pagamento-contratante-gravity' as const : 'pagamento-fornecedor' as const
  const secoes = slug === 'pagamento-contratante-gravity'
    ? montarSecoesTaxaContratanteGravityContratoProposta(contexto)
    : montarSecoesTaxaFornecedorContratoProposta(contexto)

  return {
    titulo: 'Termo de Ciência de Envio de Proposta',
    subtituloPagador: slug === 'pagamento-contratante-gravity'
      ? 'Taxa de fechamento paga pelo Contratante Gravity'
      : 'Taxa de fechamento paga pelo Fornecedor',
    slug,
    rota: slug === 'pagamento-contratante-gravity'
      ? ROTA_CONTRATO_PROPOSTA_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL
      : ROTA_CONTRATO_PROPOSTA_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL,
    secoes,
  }
}

const SECOES_CONTRATO_PROPOSTA_PAGAMENTO_FORNECEDOR = montarSecoesTaxaFornecedorContratoProposta()
const SECOES_CONTRATO_PROPOSTA_PAGAMENTO_CONTRATANTE_GRAVITY = montarSecoesTaxaContratanteGravityContratoProposta()

export const DOCUMENTO_CONTRATO_PROPOSTA_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL: DocumentoContratoPropostaPlataformaBidFreteInternacional =
  {
    titulo: 'Termo de Ciência de Envio de Proposta',
    subtituloPagador: 'Taxa de fechamento paga pelo Fornecedor',
    slug: 'pagamento-fornecedor',
    rota: ROTA_CONTRATO_PROPOSTA_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL,
    secoes: SECOES_CONTRATO_PROPOSTA_PAGAMENTO_FORNECEDOR,
  }

export const DOCUMENTO_CONTRATO_PROPOSTA_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL: DocumentoContratoPropostaPlataformaBidFreteInternacional =
  {
    titulo: 'Termo de Ciência de Envio de Proposta',
    subtituloPagador: 'Taxa de fechamento paga pelo Contratante Gravity',
    slug: 'pagamento-contratante-gravity',
    rota: ROTA_CONTRATO_PROPOSTA_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL,
    secoes: SECOES_CONTRATO_PROPOSTA_PAGAMENTO_CONTRATANTE_GRAVITY,
  }

export function resolverDocumentoContratoPropostaPlataformaBidFreteInternacional(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null | undefined,
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): DocumentoContratoPropostaPlataformaBidFreteInternacional {
  return montarDocumentoContratoPropostaPlataformaBidFreteInternacional(pagador, contexto)
}

export function resolverRotaContratoPropostaPlataformaBidFreteInternacional(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null | undefined,
  linkReferencia?: string,
  tokens?: {
    token_disparo?: string | null
    token_aceite?: string | null
  },
): string {
  const rotaBase = resolverDocumentoContratoPropostaPlataformaBidFreteInternacional(pagador).rota
  const rotaComToken = anexarTokenQueryContratoPlataformaBidFreteInternacional(rotaBase, tokens ?? {})
  if (!linkReferencia?.trim()) return rotaComToken
  try {
    const url = new URL(linkReferencia)
    const [path, query = ''] = rotaComToken.split('?')
    return query ? `${url.origin}${path}?${query}` : `${url.origin}${path}`
  } catch {
    return rotaComToken
  }
}

export function resolverDocumentoContratoPropostaPorSlug(
  slug: string | undefined,
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): DocumentoContratoPropostaPlataformaBidFreteInternacional | null {
  if (slug === 'pagamento-fornecedor') {
    return montarDocumentoContratoPropostaPlataformaBidFreteInternacional('FORNECEDOR', contexto)
  }
  if (slug === 'pagamento-contratante-gravity') {
    return montarDocumentoContratoPropostaPlataformaBidFreteInternacional('CONTRATANTE_GRAVITY', contexto)
  }
  return null
}
