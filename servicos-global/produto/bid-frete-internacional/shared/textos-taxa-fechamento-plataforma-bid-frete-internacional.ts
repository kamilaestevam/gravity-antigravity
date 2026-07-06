import {
  ehContratanteGravityPagadorTaxaFechamento,
  type EmpresaPagadoraTaxaFechamentoPlataformaGravity,
} from './empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'
import { ROTULO_TAXA_FECHAMENTO_FRETE_USD } from './condicoes-plataforma-fornecedor-bid-frete-internacional.js'

export function montarTextoAvisoTaxaEmailDisparoBidFrete(params: {
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity
  urlCondicoes: string
}): string {
  const base =
    'Cotação gratuita na plataforma: nada é cobrado para participar e enviar sua proposta. '

  if (ehContratanteGravityPagadorTaxaFechamento(params.pagador)) {
    return (
      `${base}Caso o cliente feche o frete com sua empresa, a taxa de fechamento de `
      + `${ROTULO_TAXA_FECHAMENTO_FRETE_USD} será paga pelo contratante Gravity — `
      + `você não será cobrado por essa taxa. Condições: ${params.urlCondicoes}`
    )
  }

  return (
    `${base}Caso o cliente feche o frete com sua empresa, será debitado `
    + `${ROTULO_TAXA_FECHAMENTO_FRETE_USD} da sua conta na Gravity. `
    + `Condições: ${params.urlCondicoes}`
  )
}

export function montarCorpoHtmlAvisoTaxaEmailDisparoBidFrete(params: {
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity
  urlCondicoesHtml: string
  corTexto: string
  corAvisoTexto: string
  corIndigo: string
}): string {
  const taxaHtml = `<strong style="color:${params.corTexto};">${ROTULO_TAXA_FECHAMENTO_FRETE_USD}</strong>`

  const trechoTaxa = ehContratanteGravityPagadorTaxaFechamento(params.pagador)
    ? (
      `Caso o cliente feche o frete com sua empresa, a taxa de fechamento de ${taxaHtml} `
      + `será paga pelo contratante Gravity — você não será cobrado por essa taxa. `
    )
    : (
      `Caso o cliente feche o frete com sua empresa, será debitado ${taxaHtml} `
      + `da sua conta na Gravity. `
    )

  return `
                <p style="margin:0;font-size:14px;line-height:1.55;color:${params.corAvisoTexto};">
                  <strong style="color:${params.corTexto};">Cotação gratuita na plataforma.</strong>
                  Nada é cobrado para participar e enviar sua proposta.
                  ${trechoTaxa}
                  <a href="${params.urlCondicoesHtml}" style="color:${params.corIndigo};font-weight:600;text-decoration:underline;">Leia aqui as condições</a>.
                </p>`
}

export function montarTextoAceiteCondicoesPortalRespostaBidFrete(
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity,
): string {
  if (ehContratanteGravityPagadorTaxaFechamento(pagador)) {
    return (
      'Cotar é grátis — nada é cobrado nesta etapa. Ao enviar a proposta você declara ciência '
      + 'das condições da plataforma: a taxa de fechamento de '
      + `${ROTULO_TAXA_FECHAMENTO_FRETE_USD}, quando aplicável, será paga pelo contratante Gravity — `
      + 'você não será cobrado por essa taxa se o cliente fechar o frete com sua empresa.'
    )
  }

  return (
    'Cotar é grátis — nada é cobrado nesta etapa. Ao enviar a proposta você declara ciência '
    + 'das condições da plataforma: '
    + `${ROTULO_TAXA_FECHAMENTO_FRETE_USD}, cobrados via boleto mensal, somente se o cliente `
    + 'fechar o frete com sua empresa.'
  )
}

/** Aviso no modal Confirmar Aprovação — perspectiva do comprador na plataforma. */
export function montarTextoAvisoTaxaModalAprovarPropostaBidFrete(params: {
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity
  nomeFornecedor: string
}): string {
  const fornecedor = params.nomeFornecedor.trim() || 'o fornecedor selecionado'

  if (ehContratanteGravityPagadorTaxaFechamento(params.pagador)) {
    return (
      `Ao confirmar, a taxa de fechamento de ${ROTULO_TAXA_FECHAMENTO_FRETE_USD} será paga pela sua `
      + `organização (contratante Gravity). ${fornecedor} não será cobrado por essa taxa.`
    )
  }

  return (
    `Ao confirmar, a taxa de fechamento de ${ROTULO_TAXA_FECHAMENTO_FRETE_USD} será cobrada de `
    + `${fornecedor} via boleto mensal na Gravity, somente se o frete for fechado na plataforma.`
  )
}
