/**
 * Tabela-resumo do passo Conferência — paridade Bid Frete (brc-tabela-resumo).
 */
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { EntradaSimulaCusto } from './schemas-simula-custo'
import {
  agruparSubtotalTaxasPorMoeda,
  formatarTotalMoedaSimulaCusto,
  formatarValorNumericoSimulaCusto,
  montarResumoValoresSimulaCusto,
  type ComposicaoPorMoedaResumoSimulaCusto,
  type LinhaTaxaResumoSimulaCusto,
  type LinhaValorInternacionalResumoSimulaCusto,
} from './resumo-composicao-valores-simula-custo'

function CelulaVazia({ rotulo }: { rotulo: string }) {
  return <span className="brc-tabela-resumo-vazio">{rotulo}</span>
}

function CelulaValoresInternacionais({
  itens,
  rotuloSemValores,
}: {
  itens: LinhaValorInternacionalResumoSimulaCusto[]
  rotuloSemValores: string
}) {
  if (itens.length === 0) return <CelulaVazia rotulo={rotuloSemValores} />

  return (
    <div className="brc-tabela-resumo-coluna">
      <ul className="brc-tabela-resumo-itens">
        {itens.map((item) => (
          <li key={`${item.rotulo}-${item.moeda}`} className="brc-tabela-resumo-item">
            <span className="brc-tabela-resumo-item-nome" title={item.rotulo}>
              {item.rotulo}
            </span>
            <span className="brc-tabela-resumo-item-valores">
              <span className="brc-tabela-resumo-item-valor">
                {formatarTotalMoedaSimulaCusto(item.moeda, item.valor)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CelulaTaxas({
  linhas,
  moedaPrioritaria,
  rotuloSubtotal,
  rotuloSemTaxas,
}: {
  linhas: LinhaTaxaResumoSimulaCusto[]
  moedaPrioritaria: string
  rotuloSubtotal: string
  rotuloSemTaxas: string
}) {
  const subtotais = agruparSubtotalTaxasPorMoeda(linhas, moedaPrioritaria)

  if (linhas.length === 0) return <CelulaVazia rotulo={rotuloSemTaxas} />

  return (
    <div className="brc-tabela-resumo-coluna">
      <ul className="brc-tabela-resumo-itens">
        {linhas.map((linha) => (
          <li key={linha.id} className="brc-tabela-resumo-item">
            <span className="brc-tabela-resumo-item-nome" title={linha.nome}>
              {linha.nome}
            </span>
            <span className="brc-tabela-resumo-item-valores">
              <span className="brc-tabela-resumo-item-valor">
                {formatarTotalMoedaSimulaCusto(linha.moeda, linha.valor)}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {subtotais.length > 0 ? (
        <div className="brc-tabela-resumo-subtotais">
          <span className="brc-tabela-resumo-subtotais-rotulo">{rotuloSubtotal}</span>
          <div className="brc-tabela-resumo-subtotais-valores">
            {subtotais.map(({ moeda, total }) => (
              <span key={moeda} className="brc-tabela-resumo-subtotal-chip">
                <span>{formatarTotalMoedaSimulaCusto(moeda, total)}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CelulaValorTotal({
  composicao,
  rotuloSemTaxas,
}: {
  composicao: ComposicaoPorMoedaResumoSimulaCusto[]
  rotuloSemTaxas: string
}) {
  if (composicao.length === 0) return <CelulaVazia rotulo={rotuloSemTaxas} />

  return (
    <div className="brc-tabela-resumo-coluna brc-tabela-resumo-coluna--totais">
      {composicao.map(({ moeda, total }) => (
        <div key={moeda} className="brc-tabela-resumo-total-linha">
          <span className="brc-total-moeda-sigla">{moeda}</span>
          <span className="brc-tabela-resumo-total-valores">
            <span className="brc-tabela-resumo-total-valor">
              {formatarValorNumericoSimulaCusto(total)}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

export function TabelaResumoValoresSimulaCusto({
  form,
}: {
  form: Pick<
    EntradaSimulaCusto,
    | 'moeda_produto_simula_custo'
    | 'valor_produto_simula_custo'
    | 'moeda_frete_simula_custo'
    | 'valor_frete_simula_custo'
    | 'moeda_seguro_simula_custo'
    | 'valor_seguro_simula_custo'
    | 'taxas_origem_simula_custo'
    | 'taxas_destino_simula_custo'
    | 'itens_produto_simula_custo'
  >
}) {
  const { t } = useTranslation()

  const rotulos = useMemo(() => ({
    colunaValoresInternacionais: t(
      'simulacusto.formulario.resumo_coluna_valores_internacionais',
      'Valores internacionais',
    ),
    colunaTaxasOrigem: t('simulacusto.formulario.resumo_coluna_taxas_origem', 'Taxas de origem'),
    colunaTaxasDestino: t('simulacusto.formulario.resumo_coluna_taxas_destino', 'Taxas de destino'),
    colunaValorTotal: t('simulacusto.formulario.resumo_coluna_valor_total', 'Valor total'),
    subtotal: t('simulacusto.formulario.resumo_subtotal', 'Subtotal'),
    semValores: t('simulacusto.formulario.resumo_sem_valores', '—'),
    semTaxas: t('simulacusto.formulario.resumo_sem_taxas', '—'),
    acessibilidade: t(
      'simulacusto.formulario.resumo_acessibilidade',
      'Resumo dos valores da simula por moeda',
    ),
    legenda: t(
      'simulacusto.formulario.resumo_legenda_moeda',
      'Valores somados por moeda, sem conversão cambial.',
    ),
    produto: t('simulacusto.formulario.valor_produto', 'Valor do produto'),
    frete: t('simulacusto.formulario.frete_internacional', 'Frete internacional'),
    seguro: t('simulacusto.formulario.seguro_internacional', 'Seguro internacional'),
  }), [t])

  const dados = useMemo(
    () => montarResumoValoresSimulaCusto(form, {
      produto: rotulos.produto,
      frete: rotulos.frete,
      seguro: rotulos.seguro,
    }),
    [form, rotulos.frete, rotulos.produto, rotulos.seguro],
  )

  return (
    <div className="nc-bloco-resumo-valores">
      <div className="brc-tabela-resumo-wrapper">
        <table className="brc-tabela-resumo" aria-label={rotulos.acessibilidade}>
          <thead>
            <tr>
              <th scope="col">{rotulos.colunaValoresInternacionais}</th>
              <th scope="col">{rotulos.colunaTaxasOrigem}</th>
              <th scope="col">{rotulos.colunaTaxasDestino}</th>
              <th scope="col">{rotulos.colunaValorTotal}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-label={rotulos.colunaValoresInternacionais}>
                <CelulaValoresInternacionais
                  itens={dados.valoresInternacionais}
                  rotuloSemValores={rotulos.semValores}
                />
              </td>
              <td data-label={rotulos.colunaTaxasOrigem}>
                <CelulaTaxas
                  linhas={dados.linhasOrigem}
                  moedaPrioritaria={dados.moedaPrioritaria}
                  rotuloSubtotal={rotulos.subtotal}
                  rotuloSemTaxas={rotulos.semTaxas}
                />
              </td>
              <td data-label={rotulos.colunaTaxasDestino}>
                <CelulaTaxas
                  linhas={dados.linhasDestino}
                  moedaPrioritaria={dados.moedaPrioritaria}
                  rotuloSubtotal={rotulos.subtotal}
                  rotuloSemTaxas={rotulos.semTaxas}
                />
              </td>
              <td data-label={rotulos.colunaValorTotal}>
                <CelulaValorTotal
                  composicao={dados.composicao}
                  rotuloSemTaxas={rotulos.semValores}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="nc-field-hint nc-field-hint--resumo-valores">{rotulos.legenda}</p>
    </div>
  )
}
