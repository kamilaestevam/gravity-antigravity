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

function classeCardColocacao(rank: number): string {
  if (rank === 1) return 'dc-prop-card--lider'
  if (rank === 2) return 'dc-prop-card--segundo'
  if (rank === 3) return 'dc-prop-card--terceiro'
  return ''
}

function CelulaColocacaoEixoInterativa({
  eixo,
  t,
  ativa,
  interativo,
  onSelecionar,
}: {
  eixo: EixoColocacaoCombate
  t: TFunction
  ativa: boolean
  interativo: boolean
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

  const classeCelula = [
    'dc-prop-colocacao-celula',
    interativo ? 'sim-insights-interativo sim-insights-ranking-eixo' : '',
    ehMelhor ? 'dc-prop-colocacao-celula--lider' : '',
    comAnalise ? 'dc-prop-colocacao-celula--analise' : '',
    interativo && ativa ? 'sim-insights-interativo--ativa' : '',
  ].filter(Boolean).join(' ')

  const conteudoCelula = (
    <>
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
    </>
  )

  const celula = interativo ? (
    <button
      ref={rowRef}
      type="button"
      className={classeCelula}
      onClick={onSelecionar}
      onMouseEnter={definirAncora}
      onMouseLeave={() => setAncora(null)}
      aria-pressed={ativa}
    >
      {conteudoCelula}
    </button>
  ) : (
    <div className={classeCelula}>{conteudoCelula}</div>
  )

  return (
    <>
      {celula}
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

function CardPropostaRankingManual({
  proposta,
  propostasTodas,
  ehLider,
  foco,
  onSelecionarCampo,
  t,
}: {
  proposta: PropostaRankingBidFreteInternacional
  propostasTodas: PropostaRankingBidFreteInternacional[]
  ehLider: boolean
  foco: CampoPainelInsightsId | null
  onSelecionarCampo: (campo: CampoPainelInsightsId) => void
  t: TFunction
}) {
  const eixos = useMemo(
    () => calcularEixosColocacaoCombate(proposta, propostasTodas, t),
    [proposta, propostasTodas, t],
  )

  const nome = proposta.fornecedor_nome ?? 'Agente'
  const moeda = proposta.moeda_proposta_bid_frete_internacional
  const valorTotal = formatarMoedaBidFrete(
    proposta.valor_total_proposta_bid_frete_internacional,
    moeda,
  )
  const rankCores = coresBadgeColocacao(proposta.ranking_geral)
  const exibirTrofeuRank = proposta.ranking_geral <= 3

  const cabecalhoConteudo = (
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
          {exibirTrofeuRank && <Trophy weight="duotone" size={14} aria-hidden />}
          {proposta.ranking_geral}º
        </span>
      </div>
      <div className="dc-prop-card-titulos dc-prop-card-titulos--combate">
        <div className="dc-prop-card-title-row">
          <h3 className="dc-prop-fornecedor">{nome}</h3>
        </div>
        <span className="dc-prop-total-valor">{valorTotal}</span>
      </div>
    </div>
  )

  return (
    <article className={['dc-prop-card', classeCardColocacao(proposta.ranking_geral)].filter(Boolean).join(' ')}>
      <header className="dc-prop-card-head">
        {ehLider ? (
          <button
            type="button"
            className={[
              'sim-insights-interativo',
              'sim-insights-ranking-cabecalho',
              foco === 'ranking_lider' ? 'sim-insights-interativo--ativa' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onSelecionarCampo('ranking_lider')}
            aria-pressed={foco === 'ranking_lider'}
          >
            {cabecalhoConteudo}
          </button>
        ) : (
          cabecalhoConteudo
        )}
      </header>

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
                key={`${proposta.id_proposta_bid_frete_internacional}-${eixo.id}`}
                eixo={eixo}
                t={t}
                interativo={ehLider}
                ativa={ehLider && foco === campoId}
                onSelecionar={() => onSelecionarCampo(campoId)}
              />
            )
          })}
        </div>
      </section>
    </article>
  )
}

type ManualBidFreteRankingInsightsInterativoProps = {
  propostaLider: PropostaRankingBidFreteInternacional
  propostasTodas: PropostaRankingBidFreteInternacional[]
  foco: CampoPainelInsightsId | null
  destacarAffordance: boolean
  cursorAlvo?: CampoPainelInsightsId
  rotuloAffordance: string
  onSelecionarCampo: (campo: CampoPainelInsightsId) => void
}

/** Manual §7.02 — card Ranking das respostas (3 propostas demo + scroll). */
export function ManualBidFreteRankingInsightsInterativo({
  propostaLider,
  propostasTodas,
  foco,
  destacarAffordance,
  cursorAlvo,
  rotuloAffordance,
  onSelecionarCampo,
}: ManualBidFreteRankingInsightsInterativoProps) {
  const { t } = useTranslation()

  const propostasOrdenadas = useMemo(
    () => [...propostasTodas].sort((a, b) => a.ranking_geral - b.ranking_geral),
    [propostasTodas],
  )

  return (
    <WrapperAlvoAffordanceBidFrete
      destacado={destacarAffordance}
      className={[
        'dc-smart-card',
        'dc-smart-card--ranking',
        'sim-affordance-alvo--card-ranking',
      ].join(' ')}
      rotuloClique={rotuloAffordance}
      cursorAlvo={cursorAlvo}
      conviteViagemPeriodico={destacarAffordance}
      intervaloConviteSegundos={5}
      as="article"
    >
      <header className="dc-smart-card-head">
        <span>{t('bidfrete.detalhe_cotacao.cockpit_combat_matrix', 'Ranking das respostas')}</span>
      </header>
      <div className="dc-smart-card-body dc-smart-card-body--ranking">
        <div className="dc-prop-panel dc-cockpit-combat">
          <div className="dc-prop-list-wrap">
            <div className="dc-prop-list sim-insights-ranking-lista">
              {propostasOrdenadas.map((proposta) => (
                <CardPropostaRankingManual
                  key={proposta.id_proposta_bid_frete_internacional}
                  proposta={proposta}
                  propostasTodas={propostasTodas}
                  ehLider={proposta.id_proposta_bid_frete_internacional
                    === propostaLider.id_proposta_bid_frete_internacional}
                  foco={foco}
                  onSelecionarCampo={onSelecionarCampo}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </WrapperAlvoAffordanceBidFrete>
  )
}
