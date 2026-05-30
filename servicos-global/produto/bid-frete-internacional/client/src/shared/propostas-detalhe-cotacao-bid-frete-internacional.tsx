/**
 * Lista de propostas no detalhe da cotação — ranking, % vs demais e avaliação.
 */

import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Star,
  Trophy,
  Timer,
  CurrencyDollar,
  Ranking,
  PaperPlaneTilt,
  CheckCircle,
  SortAscending,
  SortDescending,
  Path,
  Hourglass,
  Boat,
  Coins,
  CalendarBlank,
} from '@phosphor-icons/react'
import type { TFunction } from 'i18next'
import type { PropostaRankingBidFreteInternacional } from './types'
import {
  calcularMetricasPropostas,
  criterioOrdenacaoAscendentePorPadrao,
  ordenarPropostasPorCriterio,
  type CriterioOrdenacaoRespostaDetalhe,
  type MetricasExibicaoProposta,
} from './metricas-proposta-cotacao-bid-frete-internacional'

interface OpcaoOrdenacaoResposta {
  key: CriterioOrdenacaoRespostaDetalhe
  labelKey: string
  labelPadrao: string
  icone: React.ReactNode
}

const dataBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const moeda = (val: number, currency: string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)

function coresColocacao(posicao: number): { bg: string; color: string; border: string } {
  if (posicao === 1) return { bg: 'rgba(234,179,8,0.18)', color: '#facc15', border: 'rgba(234,179,8,0.45)' }
  if (posicao === 2) return { bg: 'rgba(148,163,184,0.14)', color: '#cbd5e1', border: 'rgba(148,163,184,0.35)' }
  if (posicao === 3) return { bg: 'rgba(180,83,9,0.14)', color: '#fbbf24', border: 'rgba(180,83,9,0.35)' }
  return { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)' }
}

function tagLabel(tag: string, t: TFunction): string {
  const mapa: Record<string, string> = {
    MELHOR_PRECO: t('bidfrete.comparativo.tag_melhor_preco', 'Melhor preço'),
    MELHOR_TRANSIT: t('bidfrete.comparativo.tag_melhor_transit', 'Melhor trânsito'),
    MELHOR_AVALIACAO: t('bidfrete.comparativo.tag_melhor_avaliacao', 'Melhor avaliação'),
  }
  return mapa[tag] ?? tag
}

function montarResumoComparativo(metricas: MetricasExibicaoProposta, t: TFunction): string {
  const partes: string[] = []

  if (metricas.totalPropostas > 1) {
    const pct = metricas.percentualVsMelhorPreco
    if (pct != null && Math.abs(pct) < 0.05) {
      partes.push(t('bidfrete.detalhe_cotacao.resposta_melhor_preco', 'Melhor preço'))
    } else if (pct != null) {
      partes.push(`${pct > 0 ? '+' : ''}${pct.toFixed(1)}% ${t('bidfrete.detalhe_cotacao.resposta_vs_melhor', 'vs 1º preço')}`)
    }
    const pctMedia = metricas.percentualVsMedia
    if (pctMedia != null) {
      partes.push(`${pctMedia > 0 ? '+' : ''}${pctMedia.toFixed(1)}% ${t('bidfrete.detalhe_cotacao.resposta_vs_media', 'vs média')}`)
    }
  }

  partes.push(`${t('bidfrete.detalhe_cotacao.resposta_rank_preco', 'Preço')} ${metricas.rankPreco}º`)
  partes.push(`${t('bidfrete.detalhe_cotacao.resposta_rank_transito', 'Trânsito')} ${metricas.rankTransito}º`)
  partes.push(`${t('bidfrete.detalhe_cotacao.resposta_rank_avaliacao', 'Avaliação')} ${metricas.rankAvaliacao}º`)
  partes.push(`${t('bidfrete.detalhe_cotacao.resposta_score', 'Score')} ${metricas.scoreGeral}`)

  return partes.join(' · ')
}

function LinhaProposta({
  icone,
  label,
  value,
  mono = true,
}: {
  icone: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="dc-info-row dc-info-row--com-icone">
      <div className="dc-info-label-group">
        <span className="dc-info-icon-badge dc-prop-icon-badge" aria-hidden>
          {icone}
        </span>
        <span className="dc-info-label">{label}</span>
      </div>
      <span className={`dc-info-value ${mono ? 'dc-info-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function BarraMetrica({ label, pct }: { label: string; pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="dc-prop-bar-row">
      <span>{label}</span>
      <div className="dc-prop-bar-track">
        <div className="dc-prop-bar-fill" style={{ width: `${clamped}%` }} />
      </div>
      <span>{clamped}%</span>
    </div>
  )
}

function CardProposta({
  proposta,
  metricas,
  posicaoExibicao,
  t,
  variante = 'padrao',
}: {
  proposta: PropostaRankingBidFreteInternacional
  metricas: MetricasExibicaoProposta
  posicaoExibicao: number
  t: TFunction
  variante?: 'padrao' | 'combate'
}) {
  const aprovada = proposta.status_proposta_bid_frete_internacional === 'APROVADA'
  const nome =
    proposta.fornecedor_nome
    ?? proposta.fornecedor?.nome_fornecedor_bid_frete_internacional
    ?? t('bidfrete.comparativo.fornecedor', 'Fornecedor')
  const moedaProposta = proposta.moeda_proposta_bid_frete_internacional
  const rankCores = coresColocacao(posicaoExibicao)
  const tagsTexto = metricas.tags.map((tag) => tagLabel(tag, t)).join(' · ')
  const nota =
    metricas.notaFornecedor != null ? `${metricas.notaFornecedor.toFixed(1)}/5` : null

  const pctPreco = metricas.percentualVsMelhorPreco != null
    ? Math.max(12, Math.min(100, 100 - metricas.percentualVsMelhorPreco))
    : Math.max(15, 100 - (metricas.rankPreco - 1) * 22)
  const pctTransito = metricas.rankTransito <= 1
    ? 100
    : Math.max(20, 100 - (metricas.rankTransito - 1) * 18)
  const pctAvaliacao = metricas.notaFornecedor != null
    ? Math.round((metricas.notaFornecedor / 5) * 100)
    : 70

  if (variante === 'combate') {
    return (
      <article
        className={[
          'dc-prop-card',
          aprovada ? 'dc-prop-card--aprovada' : '',
          posicaoExibicao === 1 ? 'dc-prop-card--lider' : '',
        ].filter(Boolean).join(' ')}
      >
        <header className="dc-prop-card-head">
          <div className="dc-prop-card-head-main">
            <span
              className="dc-prop-rank-inline"
              style={{
                background: rankCores.bg,
                color: rankCores.color,
                border: `1px solid ${rankCores.border}`,
              }}
            >
              {posicaoExibicao <= 3 && <Trophy weight="duotone" size={14} />}
              {posicaoExibicao}º
            </span>
            <div className="dc-prop-card-titulos dc-prop-card-titulos--combate">
              <h3 className="dc-prop-fornecedor">{nome}</h3>
              <span className="dc-prop-total-valor dc-info-mono">
                {moeda(proposta.valor_total_proposta_bid_frete_internacional, moedaProposta)}
              </span>
            </div>
          </div>
        </header>
        <div className="dc-prop-barras">
          <BarraMetrica label={t('bidfrete.detalhe_cotacao.resp_frete', 'Frete')} pct={pctPreco} />
          <BarraMetrica label={t('bidfrete.detalhe_cotacao.resp_taxas', 'Taxas')} pct={Math.min(95, pctPreco + 8)} />
          <BarraMetrica label={t('bidfrete.comparativo.transit_time', 'Transit')} pct={pctTransito} />
        </div>
        {metricas.tags.length > 0 && (
          <div className="dc-prop-tags">
            {metricas.tags.map((tag) => (
              <span
                key={tag}
                className={`dc-prop-tag${tag === 'MELHOR_PRECO' ? ' dc-prop-tag--ouro' : ''}`}
              >
                {tagLabel(tag, t)}
              </span>
            ))}
          </div>
        )}
      </article>
    )
  }

  return (
    <article
      className={[
        'dc-prop-card',
        aprovada ? 'dc-prop-card--aprovada' : '',
        posicaoExibicao === 1 ? 'dc-prop-card--lider' : '',
      ].filter(Boolean).join(' ')}
    >
      <header className="dc-prop-card-head">
        <div className="dc-prop-card-head-main">
          <span
            className="dc-prop-rank-inline"
            style={{
              background: rankCores.bg,
              color: rankCores.color,
              border: `1px solid ${rankCores.border}`,
            }}
          >
            {posicaoExibicao <= 3 && <Trophy weight="duotone" size={14} />}
            {posicaoExibicao}º
          </span>
          <div className="dc-prop-card-titulos">
            <div className="dc-prop-card-title-row">
              <h3 className="dc-prop-fornecedor">{nome}</h3>
              {aprovada && (
                <span className="dc-prop-badge-aprovada">
                  <CheckCircle weight="fill" size={13} />
                  {t('bidfrete.comparativo.aprovada', 'Aprovada')}
                </span>
              )}
            </div>
            <p className="dc-prop-card-meta">
              {t('bidfrete.detalhe_cotacao.resposta_colocacao', {
                posicao: posicaoExibicao,
                total: metricas.totalPropostas,
                defaultValue: `${posicaoExibicao}ª de ${metricas.totalPropostas}`,
              })}
              {tagsTexto ? ` · ${tagsTexto}` : ''}
              {nota ? (
                <>
                  {' · '}
                  <Star weight="duotone" size={12} style={{ color: '#eab308', verticalAlign: '-2px' }} />
                  {' '}
                  {nota}
                </>
              ) : null}
            </p>
          </div>
        </div>
        <div className="dc-prop-card-total-block">
          <span className="dc-info-label">{t('bidfrete.detalhe_cotacao.resp_total')}</span>
          <span className="dc-prop-total-valor dc-info-mono">
            {moeda(proposta.valor_total_proposta_bid_frete_internacional, moedaProposta)}
          </span>
        </div>
      </header>

      <p className="dc-prop-resumo">{montarResumoComparativo(metricas, t)}</p>

      <div className="dc-prop-card-body">
        <LinhaProposta
          icone={<Boat weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_frete')}
          value={moeda(proposta.valor_frete_proposta_bid_frete_internacional, moedaProposta)}
        />
        <LinhaProposta
          icone={<Coins weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_taxas_origem')}
          value={moeda(proposta.taxas_origem_proposta_bid_frete_internacional, moedaProposta)}
        />
        <LinhaProposta
          icone={<Coins weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_taxas_destino')}
          value={moeda(proposta.taxas_destino_proposta_bid_frete_internacional, moedaProposta)}
        />
        <LinhaProposta
          icone={<Timer weight="duotone" size={16} />}
          label={t('bidfrete.comparativo.transit_time')}
          value={`${proposta.dias_transito_proposta_bid_frete_internacional} ${t('bidfrete.detalhe_cotacao.dias')}`}
        />
        <LinhaProposta
          icone={<Hourglass weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_free_time')}
          value={
            proposta.dias_free_time_proposta_bid_frete_internacional != null
              ? `${proposta.dias_free_time_proposta_bid_frete_internacional} ${t('bidfrete.detalhe_cotacao.dias')}`
              : '—'
          }
        />
        <LinhaProposta
          icone={<Path weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_transbordos')}
          value={
            proposta.quantidade_transbordo_proposta_bid_frete_internacional === 0
              ? t('bidfrete.comparativo.direto', 'Direto')
              : String(proposta.quantidade_transbordo_proposta_bid_frete_internacional)
          }
        />
        <LinhaProposta
          icone={<CalendarBlank weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_validade')}
          value={dataBR(proposta.validade_proposta_bid_frete_internacional)}
          mono={false}
        />
      </div>

      {proposta.observacoes_proposta_bid_frete_internacional?.trim() && (
        <p className="dc-prop-obs">{proposta.observacoes_proposta_bid_frete_internacional}</p>
      )}
    </article>
  )
}

export interface ListaPropostasDetalheCotacaoProps {
  id_cotacao_bid_frete_internacional: string
  propostasRanking: PropostaRankingBidFreteInternacional[]
  carregandoRanking?: boolean
  /** Sidebar compacta estilo Combat Matrix (mockup cockpit). */
  variante?: 'padrao' | 'combate'
}

export function ListaPropostasDetalheCotacao({
  id_cotacao_bid_frete_internacional,
  propostasRanking,
  carregandoRanking = false,
  variante = 'padrao',
}: ListaPropostasDetalheCotacaoProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [criterioOrdenacao, setCriterioOrdenacao] =
    useState<CriterioOrdenacaoRespostaDetalhe>('ranking_geral')
  const [ordenacaoAsc, setOrdenacaoAsc] = useState(true)

  const opcoesOrdenacao: OpcaoOrdenacaoResposta[] = useMemo(
    () => [
      {
        key: 'ranking_geral',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_score',
        labelPadrao: 'Score geral',
        icone: <Trophy weight="duotone" size={14} />,
      },
      {
        key: 'valor_total_proposta_bid_frete_internacional',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_preco',
        labelPadrao: 'Menor preço',
        icone: <CurrencyDollar weight="duotone" size={14} />,
      },
      {
        key: 'dias_transito_proposta_bid_frete_internacional',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_transito',
        labelPadrao: 'Melhor trânsito',
        icone: <Timer weight="duotone" size={14} />,
      },
      {
        key: 'rating',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_avaliacao',
        labelPadrao: 'Melhor avaliação',
        icone: <Star weight="duotone" size={14} />,
      },
      {
        key: 'quantidade_transbordo_proposta_bid_frete_internacional',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_transbordo',
        labelPadrao: 'Menor transbordo',
        icone: <Path weight="duotone" size={14} />,
      },
      {
        key: 'dias_free_time_proposta_bid_frete_internacional',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_free_time',
        labelPadrao: 'Maior free time',
        icone: <Hourglass weight="duotone" size={14} />,
      },
    ],
    [],
  )

  const metricasPorId = useMemo(
    () => calcularMetricasPropostas(propostasRanking),
    [propostasRanking],
  )

  const propostasOrdenadas = useMemo(
    () => ordenarPropostasPorCriterio(propostasRanking, criterioOrdenacao, ordenacaoAsc),
    [propostasRanking, criterioOrdenacao, ordenacaoAsc],
  )

  function alternarCriterio(key: CriterioOrdenacaoRespostaDetalhe) {
    if (key === criterioOrdenacao) {
      setOrdenacaoAsc((prev) => !prev)
      return
    }
    setCriterioOrdenacao(key)
    setOrdenacaoAsc(criterioOrdenacaoAscendentePorPadrao(key))
  }

  if (carregandoRanking) {
    return (
      <div className="dc-prop-loading">
        <Ranking weight="duotone" size={28} className="dc-prop-loading-icon" />
        <span>{t('bidfrete.detalhe_cotacao.resposta_carregando_ranking', 'Calculando colocação...')}</span>
      </div>
    )
  }

  if (propostasRanking.length === 0) {
    return (
      <div className="dc-empty">
        <PaperPlaneTilt weight="duotone" size={40} style={{ opacity: 0.3 }} />
        <p>{t('bidfrete.detalhe_cotacao.vazio_respostas')}</p>
      </div>
    )
  }

  return (
    <div className="dc-prop-panel">
      <div className="dc-prop-panel-toolbar">
        <div className="dc-prop-sort-wrap">
          <span className="dc-prop-sort-label">
            {t('bidfrete.detalhe_cotacao.resposta_ordenar_por', 'Ordenar por')}:
          </span>
          <div className="dc-prop-sort-bar" role="group" aria-label={t('bidfrete.detalhe_cotacao.resposta_ordenar_por', 'Ordenar por')}>
            {opcoesOrdenacao.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={[
                  'dc-prop-sort-btn',
                  criterioOrdenacao === opt.key ? 'dc-prop-sort-btn--ativo' : '',
                ].join(' ')}
                onClick={() => alternarCriterio(opt.key)}
                aria-pressed={criterioOrdenacao === opt.key}
              >
                {opt.icone}
                {t(opt.labelKey, opt.labelPadrao)}
                {criterioOrdenacao === opt.key && (
                  ordenacaoAsc
                    ? <SortAscending weight="bold" size={12} aria-hidden />
                    : <SortDescending weight="bold" size={12} aria-hidden />
                )}
              </button>
            ))}
          </div>
        </div>
        {propostasRanking.length > 1 && (
          <button
            type="button"
            className="dc-btn dc-btn--secondary dc-btn--sm dc-prop-comparativo-btn"
            onClick={() => navigate(`/bid-frete/cotacoes/${id_cotacao_bid_frete_internacional}/comparativo`)}
          >
            <Ranking weight="bold" size={14} />
            {t('bidfrete.detalhe_cotacao.ver_comparativo', 'Ver comparativo completo')}
          </button>
        )}
      </div>

      <div className="dc-prop-list">
        {propostasOrdenadas.map((proposta, indice) => {
          const metricas = metricasPorId.get(proposta.id_proposta_bid_frete_internacional)
          if (!metricas) return null
          return (
            <CardProposta
              key={proposta.id_proposta_bid_frete_internacional}
              proposta={proposta}
              metricas={metricas}
              posicaoExibicao={indice + 1}
              t={t}
              variante={variante}
            />
          )
        })}
      </div>
    </div>
  )
}
