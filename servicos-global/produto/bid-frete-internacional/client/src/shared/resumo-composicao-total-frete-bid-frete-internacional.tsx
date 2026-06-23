/**
 * Tabela-resumo da proposta: Frete Base · Taxas Origem · Taxas Destino · Total por moeda.
 */
import React from 'react'
import {
  agruparValoresPorMoedaLinhas,
  formatarTotalMoedaBidFrete,
  formatarValorNumericoBidFrete,
  parseValorLinhaTaxa,
  type ComposicaoPorMoedaPropostaBidFreteInternacional,
  type LinhaTaxaPropostaBidFreteInternacional,
} from './taxas-linha-proposta-bid-frete-internacional'
import { TextoTruncadoComTooltip } from './texto-truncado-com-tooltip-bid-frete-internacional'
import {
  converterValorMoedaParaBrlEstimado,
  formatarEstimadoBrlProposta,
  somarEstimadoBrlComposicaoProposta,
  somarEstimadoBrlLinhasTaxasProposta,
} from './conversao-estimada-brl-proposta-bid-frete-internacional'

export interface RotulosTabelaResumoPropostaBidFreteInternacional {
  colunaFreteBase: string
  colunaTaxasOrigem: string
  colunaTaxasDestino: string
  colunaValorTotal: string
  subtotal: string
  semTaxas: string
  acessibilidade: string
  rotuloEstimadoBrl?: string
}

function EstimadoBrlColuna({
  valorBrl,
  rotuloEstimadoBrl,
  destaque = false,
}: {
  valorBrl: number | null
  rotuloEstimadoBrl?: string
  destaque?: boolean
}) {
  const texto = formatarEstimadoBrlProposta(valorBrl)
  if (!texto) return null

  return (
    <span
      className={[
        'brc-tabela-resumo-estimado-brl',
        destaque ? 'brc-tabela-resumo-estimado-brl--destaque' : '',
      ].filter(Boolean).join(' ')}
      title={rotuloEstimadoBrl}
    >
      {texto}
    </span>
  )
}

function EstimadoBrlItem({
  valor,
  moeda,
  taxasConversaoBrl,
  rotuloEstimadoBrl,
}: {
  valor: number
  moeda: string
  taxasConversaoBrl: Record<string, number>
  rotuloEstimadoBrl?: string
}) {
  const brl = converterValorMoedaParaBrlEstimado(valor, moeda, taxasConversaoBrl)
  return <EstimadoBrlColuna valorBrl={brl} rotuloEstimadoBrl={rotuloEstimadoBrl} />
}

function linhasTaxaComValor(linhas: LinhaTaxaPropostaBidFreteInternacional[]) {
  return linhas.filter(
    (linha) => parseValorLinhaTaxa(linha.valor_taxa_bid_frete_internacional) > 0,
  )
}

function CelulaTaxasProposta({
  linhas,
  moedaPrioritaria,
  rotuloSubtotal,
  rotuloSemTaxas,
  taxasConversaoBrl,
  rotuloEstimadoBrl,
}: {
  linhas: LinhaTaxaPropostaBidFreteInternacional[]
  moedaPrioritaria: string
  rotuloSubtotal: string
  rotuloSemTaxas: string
  taxasConversaoBrl?: Record<string, number>
  rotuloEstimadoBrl?: string
}) {
  const itens = linhasTaxaComValor(linhas)
  const subtotais = agruparValoresPorMoedaLinhas(linhas, moedaPrioritaria)
  const estimadoColuna =
    taxasConversaoBrl && Object.keys(taxasConversaoBrl).length > 0
      ? somarEstimadoBrlLinhasTaxasProposta(linhas, taxasConversaoBrl)
      : null

  if (itens.length === 0) {
    return <span className="brc-tabela-resumo-vazio">{rotuloSemTaxas}</span>
  }

  return (
    <div className="brc-tabela-resumo-coluna">
      <ul className="brc-tabela-resumo-itens">
        {itens.map((linha) => {
          const nome = linha.nome_taxa_bid_frete_internacional.trim() || '—'
          const moeda = linha.moeda_taxa_bid_frete_internacional || 'USD'
          const valor = parseValorLinhaTaxa(linha.valor_taxa_bid_frete_internacional)
          return (
            <li
              key={linha.id_linha_taxa_proposta_bid_frete_internacional}
              className="brc-tabela-resumo-item"
            >
              <TextoTruncadoComTooltip
                className="brc-tabela-resumo-item-nome"
                texto={nome}
                rotuloTooltip={nome}
              />
              <span className="brc-tabela-resumo-item-valores">
                <span className="brc-tabela-resumo-item-valor">
                  {formatarTotalMoedaBidFrete(moeda, valor)}
                </span>
                {taxasConversaoBrl ? (
                  <EstimadoBrlItem
                    valor={valor}
                    moeda={moeda}
                    taxasConversaoBrl={taxasConversaoBrl}
                    rotuloEstimadoBrl={rotuloEstimadoBrl}
                  />
                ) : null}
              </span>
            </li>
          )
        })}
      </ul>
      {subtotais.length > 0 ? (
        <div className="brc-tabela-resumo-subtotais">
          <span className="brc-tabela-resumo-subtotais-rotulo">{rotuloSubtotal}</span>
          <div className="brc-tabela-resumo-subtotais-valores">
            {subtotais.map(({ moeda, total }) => (
              <span key={moeda} className="brc-tabela-resumo-subtotal-chip">
                <span>{formatarTotalMoedaBidFrete(moeda, total)}</span>
                {taxasConversaoBrl ? (
                  <EstimadoBrlItem
                    valor={total}
                    moeda={moeda}
                    taxasConversaoBrl={taxasConversaoBrl}
                    rotuloEstimadoBrl={rotuloEstimadoBrl}
                  />
                ) : null}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <EstimadoBrlColuna
        valorBrl={estimadoColuna}
        rotuloEstimadoBrl={rotuloEstimadoBrl}
      />
    </div>
  )
}

function CelulaFreteBase({
  moedaFrete,
  valorFrete,
  rotuloSemTaxas,
  taxasConversaoBrl,
  rotuloEstimadoBrl,
}: {
  moedaFrete: string
  valorFrete: string
  rotuloSemTaxas: string
  taxasConversaoBrl?: Record<string, number>
  rotuloEstimadoBrl?: string
}) {
  const valor = parseValorLinhaTaxa(valorFrete)
  if (valor <= 0) {
    return <span className="brc-tabela-resumo-vazio">{rotuloSemTaxas}</span>
  }

  const moeda = moedaFrete.trim() || 'USD'
  const estimadoColuna =
    taxasConversaoBrl && Object.keys(taxasConversaoBrl).length > 0
      ? converterValorMoedaParaBrlEstimado(valor, moeda, taxasConversaoBrl)
      : null

  return (
    <div className="brc-tabela-resumo-coluna brc-tabela-resumo-coluna--frete">
      <span className="brc-tabela-resumo-frete-valor">
        {formatarTotalMoedaBidFrete(moeda, valor)}
      </span>
      <EstimadoBrlColuna
        valorBrl={estimadoColuna}
        rotuloEstimadoBrl={rotuloEstimadoBrl}
        destaque
      />
    </div>
  )
}

function CelulaValorTotal({
  composicao,
  rotuloSemTaxas,
  taxasConversaoBrl,
  rotuloEstimadoBrl,
}: {
  composicao: ComposicaoPorMoedaPropostaBidFreteInternacional[]
  rotuloSemTaxas: string
  taxasConversaoBrl?: Record<string, number>
  rotuloEstimadoBrl?: string
}) {
  if (composicao.length === 0) {
    return <span className="brc-tabela-resumo-vazio">{rotuloSemTaxas}</span>
  }

  const estimadoColuna =
    taxasConversaoBrl && Object.keys(taxasConversaoBrl).length > 0
      ? somarEstimadoBrlComposicaoProposta(composicao, taxasConversaoBrl)
      : null

  return (
    <div className="brc-tabela-resumo-coluna brc-tabela-resumo-coluna--totais">
      {composicao.map(({ moeda, total }) => (
        <div key={moeda} className="brc-tabela-resumo-total-linha">
          <span className="brc-total-moeda-sigla">{moeda}</span>
          <span className="brc-tabela-resumo-total-valores">
            <span className="brc-tabela-resumo-total-valor">
              {formatarValorNumericoBidFrete(total)}
            </span>
            {taxasConversaoBrl ? (
              <EstimadoBrlItem
                valor={total}
                moeda={moeda}
                taxasConversaoBrl={taxasConversaoBrl}
                rotuloEstimadoBrl={rotuloEstimadoBrl}
              />
            ) : null}
          </span>
        </div>
      ))}
      <EstimadoBrlColuna
        valorBrl={estimadoColuna}
        rotuloEstimadoBrl={rotuloEstimadoBrl}
        destaque
      />
    </div>
  )
}

export function TabelaResumoPropostaBidFreteInternacional({
  moedaFrete,
  valorFrete,
  linhasOrigem,
  linhasDestino,
  composicao,
  rotulos,
  taxasConversaoBrl,
}: {
  moedaFrete: string
  valorFrete: string
  linhasOrigem: LinhaTaxaPropostaBidFreteInternacional[]
  linhasDestino: LinhaTaxaPropostaBidFreteInternacional[]
  composicao: ComposicaoPorMoedaPropostaBidFreteInternacional[]
  rotulos: RotulosTabelaResumoPropostaBidFreteInternacional
  taxasConversaoBrl?: Record<string, number>
}) {
  const moedaPrioritaria = moedaFrete.trim()
  const rotuloEstimadoBrl = rotulos.rotuloEstimadoBrl

  return (
    <div className="brc-tabela-resumo-wrapper">
      <table className="brc-tabela-resumo" aria-label={rotulos.acessibilidade}>
        <thead>
          <tr>
            <th scope="col">{rotulos.colunaFreteBase}</th>
            <th scope="col">{rotulos.colunaTaxasOrigem}</th>
            <th scope="col">{rotulos.colunaTaxasDestino}</th>
            <th scope="col">{rotulos.colunaValorTotal}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label={rotulos.colunaFreteBase}>
              <CelulaFreteBase
                moedaFrete={moedaFrete}
                valorFrete={valorFrete}
                rotuloSemTaxas={rotulos.semTaxas}
                taxasConversaoBrl={taxasConversaoBrl}
                rotuloEstimadoBrl={rotuloEstimadoBrl}
              />
            </td>
            <td data-label={rotulos.colunaTaxasOrigem}>
              <CelulaTaxasProposta
                linhas={linhasOrigem}
                moedaPrioritaria={moedaPrioritaria}
                rotuloSubtotal={rotulos.subtotal}
                rotuloSemTaxas={rotulos.semTaxas}
                taxasConversaoBrl={taxasConversaoBrl}
                rotuloEstimadoBrl={rotuloEstimadoBrl}
              />
            </td>
            <td data-label={rotulos.colunaTaxasDestino}>
              <CelulaTaxasProposta
                linhas={linhasDestino}
                moedaPrioritaria={moedaPrioritaria}
                rotuloSubtotal={rotulos.subtotal}
                rotuloSemTaxas={rotulos.semTaxas}
                taxasConversaoBrl={taxasConversaoBrl}
                rotuloEstimadoBrl={rotuloEstimadoBrl}
              />
            </td>
            <td data-label={rotulos.colunaValorTotal}>
              <CelulaValorTotal
                composicao={composicao}
                rotuloSemTaxas={rotulos.semTaxas}
                taxasConversaoBrl={taxasConversaoBrl}
                rotuloEstimadoBrl={rotuloEstimadoBrl}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/** @deprecated alias — prefer TabelaResumoPropostaBidFreteInternacional */
export const ResumoComposicaoTotalFreteBidFreteInternacional = TabelaResumoPropostaBidFreteInternacional
