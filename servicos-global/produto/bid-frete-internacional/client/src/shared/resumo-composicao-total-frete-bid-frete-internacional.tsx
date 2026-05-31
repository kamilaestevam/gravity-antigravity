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

export interface RotulosTabelaResumoPropostaBidFreteInternacional {
  colunaFreteBase: string
  colunaTaxasOrigem: string
  colunaTaxasDestino: string
  colunaValorTotal: string
  subtotal: string
  semTaxas: string
  acessibilidade: string
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
}: {
  linhas: LinhaTaxaPropostaBidFreteInternacional[]
  moedaPrioritaria: string
  rotuloSubtotal: string
  rotuloSemTaxas: string
}) {
  const itens = linhasTaxaComValor(linhas)
  const subtotais = agruparValoresPorMoedaLinhas(linhas, moedaPrioritaria)

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
              <span className="brc-tabela-resumo-item-valor">
                {formatarTotalMoedaBidFrete(moeda, valor)}
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
                {formatarTotalMoedaBidFrete(moeda, total)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CelulaFreteBase({
  moedaFrete,
  valorFrete,
  rotuloSemTaxas,
}: {
  moedaFrete: string
  valorFrete: string
  rotuloSemTaxas: string
}) {
  const valor = parseValorLinhaTaxa(valorFrete)
  if (valor <= 0) {
    return <span className="brc-tabela-resumo-vazio">{rotuloSemTaxas}</span>
  }

  return (
    <div className="brc-tabela-resumo-coluna brc-tabela-resumo-coluna--frete">
      <span className="brc-tabela-resumo-frete-valor">
        {formatarTotalMoedaBidFrete(moedaFrete.trim() || 'USD', valor)}
      </span>
    </div>
  )
}

function CelulaValorTotal({
  composicao,
}: {
  composicao: ComposicaoPorMoedaPropostaBidFreteInternacional[]
}) {
  return (
    <div className="brc-tabela-resumo-coluna brc-tabela-resumo-coluna--totais">
      {composicao.map(({ moeda, total }) => (
        <div key={moeda} className="brc-tabela-resumo-total-linha">
          <span className="brc-total-moeda-sigla">{moeda}</span>
          <span className="brc-tabela-resumo-total-valor">
            {formatarValorNumericoBidFrete(total)}
          </span>
        </div>
      ))}
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
}: {
  moedaFrete: string
  valorFrete: string
  linhasOrigem: LinhaTaxaPropostaBidFreteInternacional[]
  linhasDestino: LinhaTaxaPropostaBidFreteInternacional[]
  composicao: ComposicaoPorMoedaPropostaBidFreteInternacional[]
  rotulos: RotulosTabelaResumoPropostaBidFreteInternacional
}) {
  const moedaPrioritaria = moedaFrete.trim() || 'USD'

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
              />
            </td>
            <td data-label={rotulos.colunaTaxasOrigem}>
              <CelulaTaxasProposta
                linhas={linhasOrigem}
                moedaPrioritaria={moedaPrioritaria}
                rotuloSubtotal={rotulos.subtotal}
                rotuloSemTaxas={rotulos.semTaxas}
              />
            </td>
            <td data-label={rotulos.colunaTaxasDestino}>
              <CelulaTaxasProposta
                linhas={linhasDestino}
                moedaPrioritaria={moedaPrioritaria}
                rotuloSubtotal={rotulos.subtotal}
                rotuloSemTaxas={rotulos.semTaxas}
              />
            </td>
            <td data-label={rotulos.colunaValorTotal}>
              <CelulaValorTotal composicao={composicao} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/** @deprecated alias — prefer TabelaResumoPropostaBidFreteInternacional */
export const ResumoComposicaoTotalFreteBidFreteInternacional = TabelaResumoPropostaBidFreteInternacional
