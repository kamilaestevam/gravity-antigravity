/**
 * Tabela read-only de composição da proposta — paridade visual com portal do agente.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import type { PropostaBidFreteInternacional } from './types'
import {
  TabelaResumoPropostaBidFreteInternacional,
  type RotulosTabelaResumoPropostaBidFreteInternacional,
} from './resumo-composicao-total-frete-bid-frete-internacional'
import { montarDadosTabelaResumoPropostaBidFreteInternacional } from './taxas-linha-proposta-bid-frete-internacional'
import {
  buscarTaxasMoedaAtuaisInsights,
  lerTaxasCambioConfigBidFreteInternacional,
  montarMapaTaxaParaBrl,
} from './taxas-cambio-insights-bid-frete-internacional'
import './formulario-resposta-cotacao-bid-frete-internacional.css'

function useTaxasConversaoBrlProposta(moedasExtras: string[]): Record<string, number> {
  const chaveMoedas = moedasExtras.join('|')
  const [taxas, setTaxas] = useState<Record<string, number>>({ BRL: 1 })

  useEffect(() => {
    const aplicadas = lerTaxasCambioConfigBidFreteInternacional()
    let cancelado = false

    void buscarTaxasMoedaAtuaisInsights()
      .then((resposta) => {
        if (cancelado) return
        setTaxas(montarMapaTaxaParaBrl(resposta.por_moeda, aplicadas, moedasExtras))
      })
      .catch(() => {
        if (cancelado) return
        setTaxas(montarMapaTaxaParaBrl({}, aplicadas, moedasExtras))
      })

    return () => {
      cancelado = true
    }
  }, [chaveMoedas])

  return taxas
}

function useRotulosTabelaResumoPropostaReadonly(): RotulosTabelaResumoPropostaBidFreteInternacional {
  const { t } = useTranslation()

  return useMemo(
    () => ({
      colunaFreteBase: t(
        'bidfrete.portal.responder.tabela_coluna_frete_base',
        'Frete Base',
      ),
      colunaTaxasOrigem: t(
        'bidfrete.portal.responder.tabela_coluna_taxas_origem',
        'Taxas de Origem',
      ),
      colunaTaxasDestino: t(
        'bidfrete.portal.responder.tabela_coluna_taxas_destino',
        'Taxas de Destino',
      ),
      colunaValorTotal: t(
        'bidfrete.portal.responder.tabela_coluna_valor_total',
        'Valor Total',
      ),
      subtotal: t('bidfrete.portal.responder.tabela_subtotal', 'Subtotal'),
      semTaxas: t('bidfrete.portal.responder.tabela_sem_taxas', '—'),
      acessibilidade: t(
        'bidfrete.portal.responder.composicao_acessibilidade',
        'Composição do valor total por moeda',
      ),
      rotuloEstimadoBrl: t(
        'bidfrete.detalhe_cotacao.estimado_brl_tooltip',
        'Estimativa em reais pela taxa configurada no produto ou PTAX (BACEN)',
      ),
    }),
    [t],
  )
}

export interface TabelaResumoPropostaReadonlyBidFreteInternacionalProps {
  proposta: PropostaBidFreteInternacional
  /** Exibe botão expandir/recolher (ex.: lista com 2+ propostas). */
  colapsavel?: boolean
  expandidoInicial?: boolean
  className?: string
}

export function TabelaResumoPropostaReadonlyBidFreteInternacional({
  proposta,
  colapsavel = false,
  expandidoInicial = true,
  className,
}: TabelaResumoPropostaReadonlyBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const rotulos = useRotulosTabelaResumoPropostaReadonly()
  const dados = useMemo(
    () => montarDadosTabelaResumoPropostaBidFreteInternacional(proposta),
    [proposta],
  )
  const moedasProposta = useMemo(() => {
    const moedas = new Set<string>([dados.moedaFrete])
    for (const linha of [...dados.linhasOrigem, ...dados.linhasDestino]) {
      moedas.add(linha.moeda_taxa_bid_frete_internacional)
    }
    for (const parte of dados.composicao) {
      moedas.add(parte.moeda)
    }
    return [...moedas]
  }, [dados])
  const taxasConversaoBrl = useTaxasConversaoBrlProposta(moedasProposta)
  const [expandido, setExpandido] = useState(expandidoInicial)
  const visivel = !colapsavel || expandido

  const tituloSecao = t(
    'bidfrete.portal.responder.valor_total_frete',
    'Valor Total do Frete',
  )
  const legendaComposicao = t(
    'bidfrete.portal.responder.valor_total_frete_legenda',
    'Frete Base + Taxas de Origem + Taxa de Destino',
  )
  const legendaSemConversao = t(
    'bidfrete.portal.responder.sem_conversao_cambial',
    'Valores somados por moeda, sem conversão cambial.',
  )
  const legendaEstimadoBrl = t(
    'bidfrete.detalhe_cotacao.estimado_brl_legenda',
    'Valores em reais são estimativas (taxa do produto ou PTAX), convertidos por moeda de origem.',
  )
  const rotuloExpandir = t(
    'bidfrete.detalhe_cotacao.ver_detalhamento_proposta',
    'Ver detalhamento completo',
  )
  const rotuloRecolher = t(
    'bidfrete.detalhe_cotacao.recolher_detalhamento_proposta',
    'Recolher detalhamento',
  )

  return (
    <section
      className={['dc-prop-tabela-resumo', className].filter(Boolean).join(' ')}
      aria-label={tituloSecao}
    >
      {colapsavel ? (
        <button
          type="button"
          className="dc-prop-tabela-resumo-toggle"
          onClick={() => setExpandido((prev) => !prev)}
          aria-expanded={expandido}
        >
          <span className="dc-prop-tabela-resumo-toggle-titulo">{tituloSecao}</span>
          {expandido ? (
            <CaretUp weight="bold" size={14} aria-hidden />
          ) : (
            <CaretDown weight="bold" size={14} aria-hidden />
          )}
          <span className="dc-prop-tabela-resumo-toggle-acao">
            {expandido ? rotuloRecolher : rotuloExpandir}
          </span>
        </button>
      ) : (
        <h4 className="dc-prop-tabela-resumo-titulo">{tituloSecao}</h4>
      )}

      {visivel && (
        <div className="dc-prop-tabela-resumo-corpo brc-total brc-total--geral">
          <TabelaResumoPropostaBidFreteInternacional
            moedaFrete={dados.moedaFrete}
            valorFrete={dados.valorFrete}
            linhasOrigem={dados.linhasOrigem}
            linhasDestino={dados.linhasDestino}
            composicao={dados.composicao}
            rotulos={rotulos}
            taxasConversaoBrl={taxasConversaoBrl}
          />
          <p className="brc-total-legenda">{legendaComposicao}</p>
          <p className="brc-total-legenda brc-total-legenda--secundaria">
            {legendaSemConversao}
          </p>
          <p className="brc-total-legenda brc-total-legenda--secundaria">
            {legendaEstimadoBrl}
          </p>
        </div>
      )}
    </section>
  )
}
