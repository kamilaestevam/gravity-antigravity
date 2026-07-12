/**
 * Contrato de Prestação de Serviços — Fechamento na Plataforma (BID Frete Internacional).
 * SSOT versionado; variantes conforme quem paga a Taxa de Fechamento.
 * Operadora legal: DATI (marca Gravity).
 */

import type { EmpresaPagadoraTaxaFechamentoPlataformaGravity } from './empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'
import { normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity } from './empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'
import {
  DIAS_ATRASO_SUSPENSAO_FORNECEDOR_BID_FRETE_INTERNACIONAL,
  ROTULO_TAXA_FECHAMENTO_FRETE_USD,
} from './condicoes-plataforma-fornecedor-bid-frete-internacional.js'
import {
  type ContextoIdentificacaoFornecedorContratoBidFreteInternacional,
  montarQualificacaoFornecedorContratoBidFreteInternacional,
  PARAGRAFOS_IDENTIFICACAO_ELETRONICA_ACEITE_FECHAMENTO_BID_FRETE,
  anexarTokenQueryContratoPlataformaBidFreteInternacional,
} from './identificacao-eletronica-contrato-bid-frete-internacional.js'

export const VERSAO_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL = '1.4'

export const DATA_VIGENCIA_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL = '12/07/2026'

export const ROTA_BASE_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL =
  '/bid-frete/visao-fornecedor-bid-frete-internacional/contrato-fechamento'

export const ROTA_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL =
  `${ROTA_BASE_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL}/pagamento-fornecedor`

export const ROTA_CONTRATO_FECHAMENTO_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL =
  `${ROTA_BASE_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL}/pagamento-contratante-gravity`

/** Identificação da operadora da Plataforma Gravity (CEDENTE / CONTRATADA). */
export const IDENTIFICACAO_LEGAL_OPERADORA_GRAVITY_DATI =
  'DATI INOVAÇÃO E TECNOLOGIA EM COMÉRCIO EXTERIOR S.A., inscrita no CNPJ sob nº 32.964.709/0001-01, '
  + 'com sede na Rod. Jose Carlos Daux, 5500, Torre Campeche A, Sala 212 CFL, Florianópolis, Santa Catarina, '
  + 'Brasil, CEP 88.032-005, neste ato representada por sua Diretora Jurídica MARINA MARTINS MENDES PERFETTI, '
  + 'brasileira, casada, advogada, portadora da Cédula de Identidade RG nº 25.232.392-0, inscrita no CPF/MF sob '
  + 'nº 322.811.018-43, domiciliada na Capital do Estado de São Paulo, doravante denominada CONTRATADA ou DATI'

export interface SecaoContratoFechamentoPlataformaBidFreteInternacional {
  titulo: string
  paragrafos: string[]
}

export interface DocumentoContratoFechamentoPlataformaBidFreteInternacional {
  titulo: string
  subtituloPagador: string
  slug: 'pagamento-fornecedor' | 'pagamento-contratante-gravity'
  rota: string
  secoes: SecaoContratoFechamentoPlataformaBidFreteInternacional[]
}

function montarSecoesComunsContratoFechamento(
  params: {
    clausulaTaxaFechamento: string[]
    clausulaFormaCobranca: string[]
    clausulaAtrasoSuspensao: string[]
  },
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): SecaoContratoFechamentoPlataformaBidFreteInternacional[] {
  return [
    {
      titulo: '1. Qualificação das Partes',
      paragrafos: [
        `CONTRATADA: ${IDENTIFICACAO_LEGAL_OPERADORA_GRAVITY_DATI}.`,
        `CONTRATANTE (FORNECEDOR): ${montarQualificacaoFornecedorContratoBidFreteInternacional(contexto)}.`,
        'A CONTRATADA é titular e operadora da plataforma digital Gravity, módulo BID Frete Internacional, '
        + 'por meio da qual o FORNECEDOR participa de cotações de frete internacional e, quando selecionado, '
        + 'formaliza o Fechamento do frete com o Solicitante.',
      ],
    },
    {
      titulo: '2. Objeto',
      paragrafos: [
        'O presente contrato tem por objeto a prestação de serviços de intermediação tecnológica pela CONTRATADA '
        + 'ao FORNECEDOR, consistente no registro eletrônico do Fechamento do frete internacional na Plataforma, '
        + 'na revelação da identidade do Solicitante ao FORNECEDOR e na disponibilização dos mecanismos de '
        + 'acompanhamento e faturamento da Taxa de Fechamento, conforme condições abaixo.',
        'A celebração deste contrato ocorre exclusivamente no momento do Fechamento, mediante aceite expresso '
        + '«li e aceito» registrado eletronicamente na Plataforma, nos termos do art. 107 do Código Civil e do '
        + 'art. 10, § 2º, da Medida Provisória nº 2.200-2/2001.',
      ],
    },
    {
      titulo: '3. Definições',
      paragrafos: [
        'Plataforma: sistema BID Frete Internacional, operado pela CONTRATADA sob a marca Gravity.',
        'Solicitante: empresa importadora ou exportadora que abriu a cotação de frete.',
        'Fechamento: confirmação registrada na Plataforma da contratação do frete entre Solicitante e FORNECEDOR.',
        `Taxa de Fechamento: remuneração devida à CONTRATADA pelo uso da Plataforma no Fechamento, no valor de referência de ${ROTULO_TAXA_FECHAMENTO_FRETE_USD} por frete fechado.`,
      ],
    },
    {
      titulo: '4. Taxa de Fechamento',
      paragrafos: params.clausulaTaxaFechamento,
    },
    {
      titulo: '5. Forma de cobrança e pagamento',
      paragrafos: params.clausulaFormaCobranca,
    },
    {
      titulo: '6. Atraso de pagamento e suspensão',
      paragrafos: params.clausulaAtrasoSuspensao,
    },
    {
      titulo: '7. Obrigações do Fornecedor',
      paragrafos: [
        'Executar o frete conforme proposta aprovada e registrada na Plataforma.',
        'Manter dados cadastrais atualizados e responder por veracidade das informações prestadas.',
        'Cumprir a legislação aplicável ao transporte internacional e à relação comercial com o Solicitante.',
        'Quitar pontualmente a Taxa de Fechamento quando aplicável a este contrato.',
      ],
    },
    {
      titulo: '8. Obrigações da Contratada',
      paragrafos: [
        'Disponibilizar a Plataforma para registro do Fechamento e comunicação entre as partes.',
        'Emitir cobrança detalhada da Taxa de Fechamento, quando devida, com identificação da cotação.',
        'Tratar dados pessoais em conformidade com a Lei nº 13.709/2018 (LGPD).',
      ],
    },
    {
      titulo: '9. Aceite eletrônico e prova',
      paragrafos: [
        'O FORNECEDOR declara ter lido integralmente este contrato antes de marcar «li e aceito» e confirmar o Fechamento.',
        'O registro eletrônico de data, hora, endereço IP, identificação do usuário e versão deste contrato constitui prova válida da celebração, nos termos da legislação aplicável.',
        ...PARAGRAFOS_IDENTIFICACAO_ELETRONICA_ACEITE_FECHAMENTO_BID_FRETE,
      ],
    },
    {
      titulo: '10. Vigência e rescisão',
      paragrafos: [
        'Este contrato vigora a partir do Fechamento registrado na Plataforma e permanece válido enquanto '
        + 'perdurarem as obrigações dele decorrentes, especialmente quanto à Taxa de Fechamento e eventuais débitos.',
        'A CONTRATADA poderá atualizar este contrato mediante nova versão publicada na Plataforma; aplica-se '
        + 'a cada Fechamento a versão vigente na data do aceite.',
      ],
    },
    {
      titulo: '11. Disposições gerais',
      paragrafos: [
        'As partes elegem o foro da Comarca de Florianópolis/SC para dirimir controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.',
        'A tolerância quanto ao descumprimento de qualquer cláusula não implica novação ou renúncia de direito.',
        'Este contrato é celebrado em relação empresarial (B2B), entre pessoas jurídicas no exercício de suas atividades.',
      ],
    },
  ]
}

const montarSecoesTaxaFornecedorContratoFechamento = (
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): SecaoContratoFechamentoPlataformaBidFreteInternacional[] =>
  montarSecoesComunsContratoFechamento({
    clausulaTaxaFechamento: [
      `Pelo Fechamento registrado na Plataforma, **o FORNECEDOR (você) pagará à CONTRATADA** a Taxa de Fechamento de ${ROTULO_TAXA_FECHAMENTO_FRETE_USD} (dez dólares dos Estados Unidos da América) por frete fechado, **na modalidade de pagamento que o Solicitante da cotação selecionou ao abrir este BID.**`,
      'Nos termos da Lei nº 14.286/2022, o valor em dólar é utilizado como referência de indexação; a cobrança é realizada em reais (BRL), mediante conversão pela taxa PTAX de venda, divulgada pelo Banco Central do Brasil, do dia útil anterior à emissão da cobrança.',
      'O fato gerador da Taxa de Fechamento é a confirmação do Fechamento vinculado à cotação respondida pelo FORNECEDOR.',
    ],
    clausulaFormaCobranca: [
      'As Taxas de Fechamento apuradas no mês serão consolidadas em boleto bancário mensal emitido em nome do FORNECEDOR, com detalhamento de cada cotação fechada (número e valor).',
      'O FORNECEDOR poderá contestar lançamentos junto ao suporte Gravity antes do vencimento do boleto, informando o número da cotação.',
    ],
    clausulaAtrasoSuspensao: [
      `Em caso de atraso superior a ${DIAS_ATRASO_SUSPENSAO_FORNECEDOR_BID_FRETE_INTERNACIONAL} (cinco) dias corridos contados do vencimento do boleto, o acesso do FORNECEDOR à Plataforma poderá ser suspenso até a quitação integral do débito, nos termos do art. 476 do Código Civil.`,
      'A suspensão não exime o FORNECEDOR do pagamento de valores já devidos nem cancela Taxas de Fechamento geradas antes da suspensão.',
    ],
  }, contexto)

const montarSecoesTaxaContratanteGravityContratoFechamento = (
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): SecaoContratoFechamentoPlataformaBidFreteInternacional[] =>
  montarSecoesComunsContratoFechamento({
    clausulaTaxaFechamento: [
      `Pelo Fechamento registrado na Plataforma, a Taxa de Fechamento de ${ROTULO_TAXA_FECHAMENTO_FRETE_USD} será paga pelo Solicitante enquanto Contratante Gravity na cotação, e não pelo FORNECEDOR.`,
      'O FORNECEDOR declara ciência de que, nesta modalidade, nenhum valor de Taxa de Fechamento será debitado de sua conta na Plataforma em razão deste Fechamento.',
      'A CONTRATADA faturará a Taxa de Fechamento diretamente à organização Solicitante (Contratante Gravity), conforme condições comerciais acordadas entre esta e a CONTRATADA.',
    ],
    clausulaFormaCobranca: [
      'A cobrança da Taxa de Fechamento compete à organização Solicitante (Contratante Gravity), nos termos da cotação.',
      'O FORNECEDOR permanece responsável apenas pelas obrigações de execução do frete perante o Solicitante, sem débito de success fee na Plataforma nesta modalidade.',
    ],
    clausulaAtrasoSuspensao: [
      'Nesta modalidade, a Taxa de Fechamento não é debitada do FORNECEDOR; eventuais medidas por inadimplência da Taxa aplicam-se à organização Solicitante (Contratante Gravity), conforme contrato comercial entre esta e a CONTRATADA.',
      'O acesso do FORNECEDOR à Plataforma não será suspenso por inadimplência de Taxa de Fechamento de responsabilidade do Contratante Gravity.',
    ],
  }, contexto)

export function montarDocumentoContratoFechamentoPlataformaBidFreteInternacional(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null | undefined,
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): DocumentoContratoFechamentoPlataformaBidFreteInternacional {
  const normalizado = normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(pagador)
  const slug = normalizado === 'CONTRATANTE_GRAVITY' ? 'pagamento-contratante-gravity' as const : 'pagamento-fornecedor' as const
  const secoes = slug === 'pagamento-contratante-gravity'
    ? montarSecoesTaxaContratanteGravityContratoFechamento(contexto)
    : montarSecoesTaxaFornecedorContratoFechamento(contexto)

  return {
    titulo: 'Contrato de Prestação de Serviços de Fechamento na Plataforma',
    subtituloPagador: slug === 'pagamento-contratante-gravity'
      ? 'Taxa de fechamento paga pelo Contratante Gravity'
      : 'Taxa de fechamento paga pelo Fornecedor',
    slug,
    rota: slug === 'pagamento-contratante-gravity'
      ? ROTA_CONTRATO_FECHAMENTO_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL
      : ROTA_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL,
    secoes,
  }
}

const SECOES_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR = montarSecoesTaxaFornecedorContratoFechamento()
const SECOES_CONTRATO_FECHAMENTO_PAGAMENTO_CONTRATANTE_GRAVITY = montarSecoesTaxaContratanteGravityContratoFechamento()

export const DOCUMENTO_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL: DocumentoContratoFechamentoPlataformaBidFreteInternacional =
  {
    titulo: 'Contrato de Prestação de Serviços de Fechamento na Plataforma',
    subtituloPagador: 'Taxa de fechamento paga pelo Fornecedor',
    slug: 'pagamento-fornecedor',
    rota: ROTA_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL,
    secoes: SECOES_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR,
  }

export const DOCUMENTO_CONTRATO_FECHAMENTO_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL: DocumentoContratoFechamentoPlataformaBidFreteInternacional =
  {
    titulo: 'Contrato de Prestação de Serviços de Fechamento na Plataforma',
    subtituloPagador: 'Taxa de fechamento paga pelo Contratante Gravity',
    slug: 'pagamento-contratante-gravity',
    rota: ROTA_CONTRATO_FECHAMENTO_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL,
    secoes: SECOES_CONTRATO_FECHAMENTO_PAGAMENTO_CONTRATANTE_GRAVITY,
  }

export function resolverDocumentoContratoFechamentoPlataformaBidFreteInternacional(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null | undefined,
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): DocumentoContratoFechamentoPlataformaBidFreteInternacional {
  return montarDocumentoContratoFechamentoPlataformaBidFreteInternacional(pagador, contexto)
}

export function resolverRotaContratoFechamentoPlataformaBidFreteInternacional(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null | undefined,
  linkReferencia?: string,
  tokens?: {
    token_disparo?: string | null
    token_aceite?: string | null
  },
): string {
  const rotaBase = resolverDocumentoContratoFechamentoPlataformaBidFreteInternacional(pagador).rota
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

export function resolverDocumentoContratoFechamentoPorSlug(
  slug: string | undefined,
  contexto?: ContextoIdentificacaoFornecedorContratoBidFreteInternacional | null,
): DocumentoContratoFechamentoPlataformaBidFreteInternacional | null {
  if (slug === 'pagamento-fornecedor') {
    return montarDocumentoContratoFechamentoPlataformaBidFreteInternacional('FORNECEDOR', contexto)
  }
  if (slug === 'pagamento-contratante-gravity') {
    return montarDocumentoContratoFechamentoPlataformaBidFreteInternacional('CONTRATANTE_GRAVITY', contexto)
  }
  return null
}
