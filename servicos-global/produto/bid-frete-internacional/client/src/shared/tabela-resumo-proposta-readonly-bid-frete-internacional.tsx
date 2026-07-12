/**
 * Tabela read-only de composição da proposta — paridade visual com portal do agente.
 */

import React, { useEffect, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Receipt, UserCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalOverlay } from '@nucleo/modal-global'
import type { PropostaBidFreteInternacional } from './types'
import {
  TabelaResumoPropostaBidFreteInternacional,
  type RotulosTabelaResumoPropostaBidFreteInternacional,
} from './resumo-composicao-total-frete-bid-frete-internacional'
import { montarDadosTabelaResumoPropostaBidFreteInternacional } from './taxas-linha-proposta-bid-frete-internacional'
import { SecaoPeriodosArmazenagemReadonlyPropostaBidFreteInternacional } from './secao-periodos-armazenagem-readonly-proposta-bid-frete-internacional'
import {
  buscarTaxasMoedaAtuaisInsights,
  lerTaxasCambioConfigBidFreteInternacional,
  montarMapaTaxaParaBrl,
} from './taxas-cambio-insights-bid-frete-internacional'
import './formulario-resposta-cotacao-bid-frete-internacional.css'
import './modal-detalhamento-proposta-bid-frete-internacional.css'

const formatarMoedaProposta = (valor: number, moeda: string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)

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

interface CorpoTabelaResumoPropostaReadonlyProps {
  proposta: PropostaBidFreteInternacional
  dados: ReturnType<typeof montarDadosTabelaResumoPropostaBidFreteInternacional>
  rotulos: RotulosTabelaResumoPropostaBidFreteInternacional
  taxasConversaoBrl: Record<string, number>
  legendaComposicao: string
  legendaSemConversao: string
  legendaEstimadoBrl: string
  className?: string
}

function CorpoTabelaResumoPropostaReadonly({
  proposta,
  dados,
  rotulos,
  taxasConversaoBrl,
  legendaComposicao,
  legendaSemConversao,
  legendaEstimadoBrl,
  className,
}: CorpoTabelaResumoPropostaReadonlyProps) {
  return (
    <div
      className={['dc-prop-tabela-resumo-corpo brc-total brc-total--geral', className]
        .filter(Boolean)
        .join(' ')}
    >
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
      <p className="brc-total-legenda brc-total-legenda--secundaria">{legendaSemConversao}</p>
      <p className="brc-total-legenda brc-total-legenda--secundaria">{legendaEstimadoBrl}</p>
      <SecaoPeriodosArmazenagemReadonlyPropostaBidFreteInternacional proposta={proposta} />
    </div>
  )
}

export interface TabelaResumoPropostaReadonlyBidFreteInternacionalProps {
  proposta: PropostaBidFreteInternacional
  /** Com 2+ propostas no card: abre modal em vez de expandir inline. */
  colapsavel?: boolean
  /** Ignorado quando `colapsavel` — mantido para compatibilidade. */
  expandidoInicial?: boolean
  /** Subtítulo do modal (ex.: nome do fornecedor). */
  rotuloFornecedorModal?: string
  className?: string
}

export function TabelaResumoPropostaReadonlyBidFreteInternacional({
  proposta,
  colapsavel = false,
  expandidoInicial = true,
  rotuloFornecedorModal,
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
  const [modalAberto, setModalAberto] = useState(false)
  const tituloModalId = useId()
  const exibirInline = !colapsavel && expandidoInicial
  const moedaProposta = proposta.moeda_proposta_bid_frete_internacional
  const valorTotalProposta = proposta.valor_total_proposta_bid_frete_internacional

  const tituloSecao = t(
    'bidfrete.portal.responder.valor_total_frete',
    'Valor Total do Frete',
  )
  const tituloModal = t(
    'bidfrete.detalhe_cotacao.modal_detalhamento_proposta_titulo',
    'Detalhamento da proposta',
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
  const rotuloAbrirModal = t(
    'bidfrete.detalhe_cotacao.ver_detalhamento_proposta',
    'Ver detalhamento completo',
  )
  const rotuloFornecedor = t('bidfrete.detalhe_cotacao.modal_detalhamento_fornecedor', 'Fornecedor')
  const rotuloValorTotal = t('bidfrete.detalhe_cotacao.resp_total', 'Valor total')
  const subtituloModal = t(
    'bidfrete.detalhe_cotacao.modal_detalhamento_proposta_subtitulo',
    'Composição completa do frete, taxas e estimativas',
  )

  const corpoProps = {
    proposta,
    dados,
    rotulos,
    taxasConversaoBrl,
    legendaComposicao,
    legendaSemConversao,
    legendaEstimadoBrl,
  }

  return (
    <>
      <section
        className={['dc-prop-tabela-resumo', className].filter(Boolean).join(' ')}
        aria-label={tituloSecao}
      >
        {colapsavel ? (
          <div className="dc-prop-tabela-resumo-cabecalho">
            <h4 className="dc-prop-tabela-resumo-titulo">{tituloSecao}</h4>
            <button
              type="button"
              className="dc-prop-tabela-resumo-link-modal"
              onClick={() => setModalAberto(true)}
            >
              {rotuloAbrirModal}
            </button>
          </div>
        ) : (
          <h4 className="dc-prop-tabela-resumo-titulo">{tituloSecao}</h4>
        )}

        {exibirInline ? <CorpoTabelaResumoPropostaReadonly {...corpoProps} /> : null}
      </section>

      {colapsavel ? (
        <ModalOverlay
          aberto={modalAberto}
          aoFechar={() => setModalAberto(false)}
          titulo={tituloModal}
          tamanho="xl"
          larguraMaxima="min(1080px, 94vw)"
          cabecalhoPersonalizado={(
            <div className="modal-header bf-detalhamento-proposta-modal-header">
              <div className="bf-detalhamento-proposta-modal-header-texto">
                <div className="bf-detalhamento-proposta-modal-titulo-row">
                  <Receipt
                    weight="duotone"
                    size={22}
                    className="bf-detalhamento-proposta-modal-icone"
                    aria-hidden
                  />
                  <h2 id={tituloModalId} className="mg-titulo text-h3">
                    {tituloModal}
                  </h2>
                </div>
                <p className="mg-subtitulo text-sm">{subtituloModal}</p>
              </div>
            </div>
          )}
          renderizarFooter={() => (
            <BotaoGlobal variante="secundario" tamanho="medio" onClick={() => setModalAberto(false)}>
              {t('comum.fechar', 'Fechar')}
            </BotaoGlobal>
          )}
        >
          <div className="bf-detalhamento-proposta-corpo">
            <div className="bf-detalhamento-proposta-resumo">
              {rotuloFornecedorModal ? (
                <div className="bf-detalhamento-proposta-fornecedor">
                  <UserCircle weight="duotone" size={22} aria-hidden />
                  <div className="bf-detalhamento-proposta-fornecedor-texto">
                    <span className="bf-detalhamento-proposta-fornecedor-rotulo">
                      {rotuloFornecedor}
                    </span>
                    <strong>{rotuloFornecedorModal}</strong>
                  </div>
                </div>
              ) : null}
              <div className="bf-detalhamento-proposta-total">
                <span className="bf-detalhamento-proposta-total-rotulo">{rotuloValorTotal}</span>
                <strong className="bf-detalhamento-proposta-total-valor">
                  {formatarMoedaProposta(valorTotalProposta, moedaProposta)}
                </strong>
              </div>
            </div>
            <CorpoTabelaResumoPropostaReadonly
              {...corpoProps}
              className="dc-prop-tabela-resumo-corpo--modal"
            />
          </div>
        </ModalOverlay>
      ) : null}
    </>
  )
}
