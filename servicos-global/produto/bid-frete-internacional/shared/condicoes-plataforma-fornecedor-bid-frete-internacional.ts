/**
 * Aviso de Condições Comerciais — fornecedores (BID Frete Internacional).
 * Documento informativo pré-contratual (legislação brasileira) — NÃO constitui contrato;
 * o contrato («li e aceito») é celebrado apenas no Fechamento.
 * SSOT para e-mail de disparo e página pública sem login.
 */

import type { EmpresaPagadoraTaxaFechamentoPlataformaGravity } from './empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'
import {
  ehContratanteGravityPagadorTaxaFechamento,
  normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity,
} from './empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'
import { anexarTokenQueryContratoPlataformaBidFreteInternacional } from './identificacao-eletronica-contrato-bid-frete-internacional.js'

export const ROTA_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL =
  '/bid-frete/visao-fornecedor-bid-frete-internacional/condicoes-plataforma'

const ROTA_BASE_CONTRATO_PROPOSTA_PLATAFORMA =
  '/bid-frete/visao-fornecedor-bid-frete-internacional/contrato-proposta'

/** Taxa cobrada quando o cliente fecha o frete com o fornecedor na plataforma. */
export const TAXA_FECHAMENTO_FRETE_USD = 10

export const ROTULO_TAXA_FECHAMENTO_FRETE_USD = 'USD 10,00'

/** Dias corridos de atraso do boleto que suspendem o acesso do fornecedor. */
export const DIAS_ATRASO_SUSPENSAO_FORNECEDOR_BID_FRETE_INTERNACIONAL = 5

export const VERSAO_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL = '1.0'

export const DATA_VIGENCIA_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL =
  '06/07/2026'

export const TITULO_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL =
  'Aviso de Condições Comerciais — Fornecedores'

export function extrairTokenDisparoDeLinkRespostaBidFreteInternacional(linkResposta: string): string | null {
  try {
    const segmentos = new URL(linkResposta).pathname.split('/').filter(Boolean)
    return segmentos[segmentos.length - 1]?.trim() || null
  } catch {
    return null
  }
}

export function resolverUrlCondicoesPlataformaFornecedorBidFreteInternacional(
  linkResposta: string,
  pagador?: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null,
  token_disparo?: string | null,
): string {
  const pagadorNormalizado = normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(pagador)
  const slug = ehContratanteGravityPagadorTaxaFechamento(pagadorNormalizado)
    ? 'pagamento-contratante-gravity'
    : 'pagamento-fornecedor'
  const rotaBase = `${ROTA_BASE_CONTRATO_PROPOSTA_PLATAFORMA}/${slug}`
  const token = token_disparo?.trim()
    || extrairTokenDisparoDeLinkRespostaBidFreteInternacional(linkResposta)
  const rotaComToken = anexarTokenQueryContratoPlataformaBidFreteInternacional(rotaBase, {
    token_disparo: token,
  })
  try {
    const url = new URL(linkResposta)
    const [path, query = ''] = rotaComToken.split('?')
    return query ? `${url.origin}${path}?${query}` : `${url.origin}${path}`
  } catch {
    return rotaComToken
  }
}

export interface SecaoCondicoesPlataformaFornecedorBidFreteInternacional {
  titulo: string
  paragrafos: string[]
}

export const SECOES_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL: SecaoCondicoesPlataformaFornecedorBidFreteInternacional[] =
  [
    {
      titulo: '1. Natureza deste documento',
      paragrafos: [
        'Este é um aviso informativo de caráter pré-contratual, disponibilizado pela Gravity em atenção ao dever de informação e à boa-fé objetiva previstos no art. 422 da Lei nº 10.406/2002 (Código Civil).',
        'Este documento não constitui contrato, proposta vinculante ou oferta, nos termos dos arts. 427 e seguintes do Código Civil. Sua finalidade é exclusivamente dar ciência prévia ao fornecedor das condições comerciais aplicáveis caso um frete venha a ser fechado por meio da plataforma.',
        'O contrato de prestação de serviços somente será celebrado no momento do fechamento do frete, conforme a Seção 7 abaixo.',
      ],
    },
    {
      titulo: '2. Definições',
      paragrafos: [
        'Para os fins deste aviso: Plataforma é o sistema BID Frete Internacional, operado pela Gravity; Solicitante é a empresa importadora ou exportadora que abre a cotação de frete; Fornecedor é a empresa convidada a apresentar proposta.',
        'Fechamento é a confirmação, registrada na Plataforma, da contratação do frete entre o Solicitante e o Fornecedor. Taxa de Fechamento é o valor devido pelo Fornecedor à Gravity exclusivamente em caso de Fechamento.',
      ],
    },
    {
      titulo: '3. Gratuidade da participação',
      paragrafos: [
        'Receber o convite, acessar o link, analisar o resumo da cotação e enviar proposta pela Plataforma é gratuito. Nenhum valor é cobrado do Fornecedor nesta etapa, independentemente do resultado da cotação.',
        'Não há cobrança se a cotação não resultar em Fechamento, se o Solicitante optar por outro fornecedor ou se a cotação for cancelada ou expirar.',
      ],
    },
    {
      titulo: '4. Taxa de Fechamento (success fee)',
      paragrafos: [
        `Caso o Solicitante escolha a proposta do Fornecedor e o Fechamento seja confirmado na Plataforma, será devida pelo Fornecedor a Taxa de Fechamento de ${ROTULO_TAXA_FECHAMENTO_FRETE_USD} (dez dólares dos Estados Unidos da América) por frete fechado.`,
        'Nos termos da Lei nº 14.286/2022, o valor em dólar é utilizado apenas como referência de indexação: a cobrança é realizada em reais (BRL), mediante conversão pela taxa de câmbio de venda PTAX, divulgada pelo Banco Central do Brasil, do dia útil anterior à data de emissão da cobrança.',
        'O fato gerador da Taxa de Fechamento é única e exclusivamente a confirmação do Fechamento vinculado à cotação respondida pelo Fornecedor.',
      ],
    },
    {
      titulo: '5. Forma de cobrança',
      paragrafos: [
        'As Taxas de Fechamento apuradas no mês são consolidadas em um único boleto bancário mensal, emitido em nome da empresa do Fornecedor, com o detalhamento de cada cotação fechada no período (número da cotação e valor correspondente).',
        'Em caso de divergência sobre qualquer lançamento, o Fornecedor poderá contestá-lo junto ao suporte Gravity, informando o número da cotação, antes do vencimento do boleto.',
      ],
    },
    {
      titulo: '6. Atraso de pagamento e suspensão',
      paragrafos: [
        `Em caso de atraso no pagamento do boleto superior a ${DIAS_ATRASO_SUSPENSAO_FORNECEDOR_BID_FRETE_INTERNACIONAL} (cinco) dias corridos contados do vencimento, o acesso do Fornecedor à Plataforma será suspenso — deixando ele de receber novos convites de cotação e de poder responder cotações em andamento — até a quitação integral do débito.`,
        'A suspensão é medida de resguardo comercial (art. 476 do Código Civil) e não exime o Fornecedor do pagamento dos valores já devidos, tampouco cancela Taxas de Fechamento geradas antes da suspensão. Regularizado o pagamento, o acesso é restabelecido.',
      ],
    },
    {
      titulo: '7. Momento da contratação',
      paragrafos: [
        'Este aviso não cria vínculo contratual entre o Fornecedor e a Gravity. O contrato de prestação de serviços — com as condições completas de uso da Plataforma — é celebrado eletronicamente no momento do Fechamento, mediante aceite expresso do Fornecedor («li e aceito») registrado na Plataforma.',
        'O contrato eletrônico assim celebrado é válido e eficaz entre as partes, nos termos do art. 107 do Código Civil e do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001, sendo admitidos como prova os registros eletrônicos de data, hora e autoria do aceite.',
      ],
    },
    {
      titulo: '8. Declaração de ciência',
      paragrafos: [
        'Ao enviar uma proposta pelo link recebido, o Fornecedor declara ciência das condições descritas neste aviso — a declaração é exibida junto ao botão Enviar Proposta e registrada eletronicamente com data e hora.',
        'A declaração de ciência não implica aceitação de contrato nem gera qualquer obrigação de pagamento; a obrigação somente nasce com o Fechamento (Seções 4 e 7).',
      ],
    },
    {
      titulo: '9. Confidencialidade do Solicitante',
      paragrafos: [
        'Quando o Solicitante optar por manter seu nome oculto, o Fornecedor verá apenas a indicação de cliente anônimo no e-mail e na tela de resposta. A confidencialidade não altera as regras deste aviso: a participação permanece gratuita e a Taxa de Fechamento aplica-se apenas em caso de Fechamento com a empresa do Fornecedor.',
        'A confidencialidade aplica-se exclusivamente à fase de cotação. Em caso de Fechamento, a identidade do Solicitante é revelada ao Fornecedor, e o contrato é celebrado entre as partes plenamente identificadas, mediante o aceite expresso («li e aceito») descrito na Seção 7 — a anonimização anterior não impede nem condiciona a celebração do contrato e a cobrança da Taxa de Fechamento.',
      ],
    },
    {
      titulo: '10. Proteção de dados pessoais',
      paragrafos: [
        'Os dados de contato do Fornecedor (nome, e-mail e empresa) são tratados pela Gravity em conformidade com a Lei nº 13.709/2018 (LGPD), com a finalidade de viabilizar o procedimento de cotação e as etapas preliminares à eventual contratação (art. 7º, inciso V, da LGPD). Solicitações relativas a dados pessoais podem ser dirigidas ao canal de suporte Gravity.',
      ],
    },
    {
      titulo: '11. Relação empresarial',
      paragrafos: [
        'As relações decorrentes da Plataforma são estabelecidas entre pessoas jurídicas, no exercício de suas atividades empresariais, e regem-se pelo Código Civil e pela legislação comercial aplicável.',
      ],
    },
    {
      titulo: '12. Atualizações',
      paragrafos: [
        'A Gravity poderá atualizar este aviso a qualquer tempo. A versão vigente, com a respectiva data, estará sempre disponível nesta página. Alterações não retroagem: aplica-se a cada cotação a versão vigente na data do envio da proposta.',
      ],
    },
  ]
