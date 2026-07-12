import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Trophy } from '@phosphor-icons/react'
import type { PropostaRankingBidFreteInternacional } from '@produto/bid-frete-internacional/client/src/shared/types'
import { formatarMoedaBidFrete } from '@produto/bid-frete-internacional/client/src/shared/exibir-taxas-proposta-bid-frete-internacional'
import {
  calcularEixosColocacaoCombate,
  type EixoColocacaoCombate,
  type IdEixoColocacaoCombate,
} from '@produto/bid-frete-internacional/client/src/shared/grade-colocacao-eixos-combate-bid-frete-internacional'
import { TooltipAnaliseMetricaSparkPortal } from '@produto/bid-frete-internacional/client/src/shared/graficos-insights-cotacao-bid-frete-internacional'
import { WrapperAlvoAffordanceBidFrete } from './manual-bid-frete-affordance-interativo'
import type { CampoPainelInsightsId } from './manual-bid-frete-guia-painel-insights-campos'

const MAPEAMENTO_EIXO_CAMPO: Record<IdEixoColocacaoCombate, CampoPainelInsightsId> = {
  frete_total: 'ranking_eixo_frete',
  transit_time: 'ranking_eixo_transit',
  rota: 'ranking_eixo_rota',
  prazo_pagamento: 'ranking_eixo_prazo',
}

function coresBadgeColocacao(rank: number): { bg: string; color: string; border: string } {
  const texto = '#f8fafc'
  if (rank === 1) return { bg: 'rgba(52, 211, 153, 0.1)', color: '#6ee7b7', border: 'rgba(52, 211, 153, 0.225)' }
  if (rank === 2) return { bg: 'rgba(148, 163, 184, 0.08)', color: texto, border: 'rgba(148, 163, 184, 0.175)' }
  if (rank === 3) return { bg: 'rgba(180, 83, 9, 0.08)', color: '#fcd34d', border: 'rgba(180, 83, 9, 0.175)' }
  return { bg: 'rgba(100, 116, 139, 0.07)', color: '#cbd5e1', border: 'rgba(100, 116, 139, 0.14)' }
}

function CelulaColocacaoEixoInterativa({
  eixo,
  t,
  ativa,
  destacarAffordance,
  rotuloAffordance,
  onSelecionar,
}: {
  eixo: EixoColocacaoCombate
  t: TFunction
  ativa: boolean
  destacarAffordance: boolean
  rotuloAffordance: string
  onSelecionar: () => void
}) {
  const rowRef = useRef<HTMLButtonElement>(null)
  const [ancora, setAncora] = useState<{ left: number; top: number } | null>(null)
  const barra = eixo.barras.find((b) => b.destaque)
  const comAnalise = eixo.disponivel && eixo.barras.length >= 2 && barra != null
  const valorReferencia = eixo.barras.find((b) => b.destaque)?.valor ?? eixo.barras[0]?.valor ?? 0

  const rankCores = eixo.disponivel && eixo.rank > 0
    ? coresBadgeColocacao(eixo.rank)
    : null
  const ehMelhor = eixo.disponivel && eixo.rank === 1
  const textoColocacao = !eixo.disponivel
    ? t('bidfrete.detalhe_cotacao.colocacao_sem_dado', '—')
    : ehMelhor
      ? t('bidfrete.detalhe_cotacao.barra_metrica_melhor', 'Melhor')
      : t('bidfrete.detalhe_cotacao.colocacao_eixo_de_total', '{{rank}}º de {{total}}', {
        rank: eixo.rank,
        total: eixo.total,
      })

  const definirAncora = () => {
    if (!comAnalise) return
    const el = rowRef.current
    if (el == null) return
    const rect = el.getBoundingClientRect()
    setAncora({ left: rect.left + rect.width / 2, top: rect.bottom })
  }

  return (
    <>
      <WrapperAlvoAffordanceBidFrete
        destacado={destacarAffordance}
        className="sim-insights-ranking-eixo-affordance"
        rotuloClique={rotuloAffordance}
        varianteCursor="compacto"
      >
        <button
          ref={rowRef}
          type="button"
          className={[
            'dc-prop-colocacao-celula',
            'sim-insights-interativo',
            'sim-insights-ranking-eixo',
            ehMelhor ? 'dc-prop-colocacao-celula--lider' : '',
            comAnalise ? 'dc-prop-colocacao-celula--analise' : '',
            ativa ? 'sim-insights-interativo--ativa' : '',
          ].filter(Boolean).join(' ')}
          onClick={onSelecionar}
          onMouseEnter={definirAncora}
          onMouseLeave={() => setAncora(null)}
          aria-pressed={ativa}
        >
          <span className="dc-prop-colocacao-rotulo">{eixo.rotulo}</span>
          <span className="dc-prop-colocacao-valor" title={eixo.valorExibicao}>
            {eixo.valorExibicao}
          </span>
          <span
            className={[
              'dc-prop-colocacao-badge',
              ehMelhor ? 'dc-prop-colocacao-badge--melhor' : '',
            ].filter(Boolean).join(' ')}
            style={
              rankCores != null
                ? {
                  background: rankCores.bg,
                  color: rankCores.color,
                  border: `1px solid ${rankCores.border}`,
                }
                : undefined
            }
          >
            {ehMelhor && <Trophy weight="duotone" size={12} aria-hidden />}
            {textoColocacao}
          </span>
        </button>
      </WrapperAlvoAffordanceBidFrete>
      {ancora != null && comAnalise && barra != null ? (
        <TooltipAnaliseMetricaSparkPortal
          barra={barra}
          barras={eixo.barras}
          valorReferencia={valorReferencia}
          melhorMenor={eixo.melhorMenor}
          rotuloMetrica={eixo.rotuloMetrica}
          formatarValor={eixo.formatarValor}
          ancora={ancora}
        />
      ) : null}
    </>
  )
}

type ManualBidFreteRankingInsightsInterativoProps = {
  propostaLider: PropostaRankingBidFreteInternacional
  propostasTodas: PropostaRankingBidFreteInternacional[]
  foco: CampoPainelInsightsId | null
  proximoCampoAffordance: CampoPainelInsightsId | null
  rotuloAffordance: string
  onSelecionarCampo: (campo: CampoPainelInsightsId) => void
}

/** Manual §7.02 — card Ranking das respostas (paridade combate + células clicáveis). */
export function ManualBidFreteRankingInsightsInterativo({
  propostaLider,
  propostasTodas,
  foco,
  proximoCampoAffordance,
  rotuloAffordance,
  onSelecionarCampo,
}: ManualBidFreteRankingInsightsInterativoProps) {
  const { t } = useTranslation()
  const eixos = useMemo(
    () => calcularEixosColocacaoCombate(propostaLider, propostasTodas, t),
    [propostaLider, propostasTodas, t],
  )

  const nome = propostaLider.fornecedor_nome ?? 'Agente de Carga Ltda'
  const moeda = propostaLider.moeda_proposta_bid_frete_internacional
  const valorTotal = formatarMoedaBidFrete(
    propostaLider.valor_total_proposta_bid_frete_internacional,
    moeda,
  )
  const rankCores = coresBadgeColocacao(propostaLider.ranking_geral)

  return (
    <article className="dc-smart-card dc-smart-card--ranking">
      <header className="dc-smart-card-head">
        <span>{t('bidfrete.detalhe_cotacao.cockpit_combat_matrix', 'Ranking das respostas')}</span>
      </header>
      <div className="dc-smart-card-body dc-smart-card-body--ranking">
        <div className="dc-prop-panel dc-cockpit-combat">
          <div className="dc-prop-list-wrap">
            <div className="dc-prop-list">
              <article className="dc-prop-card dc-prop-card--lider">
                <WrapperAlvoAffordanceBidFrete
                  destacado={proximoCampoAffordance === 'ranking_lider'}
                  className="sim-insights-ranking-cabecalho-affordance"
                  rotuloClique={rotuloAffordance}
                  varianteCursor="compacto"
                >
                  <button
                    type="button"
                    className={[
                      'dc-prop-card-head',
                      'sim-insights-interativo',
                      'sim-insights-ranking-cabecalho',
                      foco === 'ranking_lider' ? 'sim-insights-interativo--ativa' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => onSelecionarCampo('ranking_lider')}
                    aria-pressed={foco === 'ranking_lider'}
                  >
                    <div className="dc-prop-card-head-main">
                      <div className="dc-prop-rank-group">
                        <span
                          className="dc-prop-rank-inline"
                          style={{
                            background: rankCores.bg,
                            color: rankCores.color,
                            border: `1px solid ${rankCores.border}`,
                          }}
                        >
                          <Trophy weight="duotone" size={14} aria-hidden />
                          {propostaLider.ranking_geral}º
                        </span>
                      </div>
                      <div className="dc-prop-card-titulos dc-prop-card-titulos--combate">
                        <div className="dc-prop-card-title-row">
                          <h3 className="dc-prop-fornecedor">{nome}</h3>
                        </div>
                        <span className="dc-prop-total-valor">{valorTotal}</span>
                      </div>
                    </div>
                  </button>
                </WrapperAlvoAffordanceBidFrete>

                <section
                  className="dc-prop-colocacao-grade"
                  aria-label={t(
                    'bidfrete.detalhe_cotacao.colocacao_grade_titulo',
                    'Colocação por eixo',
                  )}
                >
                  <header className="dc-prop-colocacao-grade-head">
                    {t(
                      'bidfrete.detalhe_cotacao.colocacao_grade_titulo',
                      'Colocação por eixo',
                    )}
                  </header>
                  <div className="dc-prop-colocacao-grid" role="list">
                    {eixos.map((eixo) => {
                      const campoId = MAPEAMENTO_EIXO_CAMPO[eixo.id]
                      return (
                        <CelulaColocacaoEixoInterativa
                          key={eixo.id}
                          eixo={eixo}
                          t={t}
                          ativa={foco === campoId}
                          destacarAffordance={proximoCampoAffordance === campoId}
                          rotuloAffordance={rotuloAffordance}
                          onSelecionar={() => onSelecionarCampo(campoId)}
                        />
                      )
                    })}
                  </div>
                </section>
              </article>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
