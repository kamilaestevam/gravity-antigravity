/**
 * insights-estimativa-custo.tsx — Insights do Estimativa Custo.
 * Paridade visual com o Insights do Bid Frete Internacional (bfd-*):
 * KPIs com subtexto + tooltip, estimativas recentes, distribuição por status.
 * O título/subtítulo vem do MenuTopoGlobal; as pills de navegação, da toolbar.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CardBasicoGlobal } from '@nucleo/card-global'
import {
  Calculator, ClockCountdown, CheckCircle, CurrencyDollar, Receipt,
  ArrowUpRight, TrendUp, TrendDown, ListBullets,
} from '@phosphor-icons/react'
import {
  obterKpisDashboardEstimativaCusto,
  obterRecentesEstimativaCusto,
} from '../shared/api'
import type { KpisDashboardEstimativaCusto, EstimativaCustoRecente } from '../shared/schemas-estimativa-custo'
import { STATUS_LABELS, STATUS_BADGE } from '../shared/types'
import { rotaSimulaCusto, rotaDetalheEstimativaCusto } from '../shared/rotas-estimativa-custo'
import { ConteudoCarregandoEstimativaCusto } from '../shared/pagina-carregando-estimativa-custo'
import './insights-estimativa-custo.css'

const brl = (val: number | null | undefined) =>
  val != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    : '—'

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

const STATUS_COR: Record<string, string> = {
  EM_CRIACAO: '#fbbf24',
  CRIADA: '#34d399',
  ARQUIVADA: '#94a3b8',
}

export default function InsightsEstimativaCusto() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [kpis, setKpis] = useState<KpisDashboardEstimativaCusto | null>(null)
  const [recentes, setRecentes] = useState<EstimativaCustoRecente[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let cancelado = false
    Promise.all([obterKpisDashboardEstimativaCusto(), obterRecentesEstimativaCusto()])
      .then(([k, r]) => {
        if (cancelado) return
        setKpis(k)
        setRecentes(r)
      })
      .catch(() => { if (!cancelado) { setKpis(null); setRecentes([]) } })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [])

  const distribuicao = useMemo(() => {
    const total = kpis?.total_estimativas ?? 0
    return (['EM_CRIACAO', 'CRIADA', 'ARQUIVADA'] as const).map(status => {
      const qtd = status === 'EM_CRIACAO'
        ? kpis?.em_criacao ?? 0
        : status === 'CRIADA' ? kpis?.criadas ?? 0 : kpis?.arquivadas ?? 0
      return {
        status,
        qtd,
        pct: total > 0 ? Math.round((qtd / total) * 100) : 0,
      }
    })
  }, [kpis])

  const subtextoTotal = t('simulacusto.insights.kpi.total.subtexto', {
    defaultValue: '{{em_criacao}} em criação · {{criadas}} criadas',
    em_criacao: kpis?.em_criacao ?? 0,
    criadas: kpis?.criadas ?? 0,
  })

  if (carregando) {
    return <ConteudoCarregandoEstimativaCusto />
  }

  return (
    <div className="ecd-dashboard">
      {/* ── KPIs ── */}
      <div className="ecd-kpi-grid">
        <CardBasicoGlobal
          titulo={t('simulacusto.insights.kpi_total', 'Total de Estimativas')}
          icone={<Calculator weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
          valor={String(kpis?.total_estimativas ?? 0)}
          subtexto={subtextoTotal}
          variante="padrao"
          tooltip={
            <>
              <div className="cg-tooltip__row">
                <span>{t('simulacusto.estimativas.em_criacao', 'Em Criação')}</span>
                <strong style={{ color: STATUS_COR.EM_CRIACAO }}>{kpis?.em_criacao ?? 0}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>{t('simulacusto.estimativas.criadas', 'Criadas')}</span>
                <strong style={{ color: STATUS_COR.CRIADA }}>{kpis?.criadas ?? 0}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>{t('simulacusto.estimativas.arquivadas', 'Arquivadas')}</span>
                <strong style={{ color: STATUS_COR.ARQUIVADA }}>{kpis?.arquivadas ?? 0}</strong>
              </div>
            </>
          }
        />
        <CardBasicoGlobal
          titulo={t('simulacusto.estimativas.custo_medio', 'Custo Nacionalizado Médio')}
          icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
          valor={brl(kpis?.custo_nacionalizado_medio_brl)}
          subtexto={t('simulacusto.insights.kpi.custo_medio.subtexto', {
            defaultValue: 'Maior {{maior}} · Menor {{menor}}',
            maior: brl(kpis?.custo_nacionalizado_maior_brl),
            menor: brl(kpis?.custo_nacionalizado_menor_brl),
          })}
          variante="padrao"
          tooltip={
            <>
              <div className="cg-tooltip__row">
                <span>{t('simulacusto.insights.maior_custo', 'Maior custo')}</span>
                <strong style={{ color: '#f87171' }}>{brl(kpis?.custo_nacionalizado_maior_brl)}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>{t('simulacusto.insights.menor_custo', 'Menor custo')}</span>
                <strong style={{ color: '#34d399' }}>{brl(kpis?.custo_nacionalizado_menor_brl)}</strong>
              </div>
            </>
          }
        />
        <CardBasicoGlobal
          titulo={t('simulacusto.insights.kpi_tributos', 'Tributos Acumulados')}
          icone={<Receipt weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
          valor={brl(kpis?.total_tributos_acumulado_brl)}
          subtexto={t('simulacusto.insights.kpi.tributos.subtexto', {
            defaultValue: 'II + IPI + PIS + COFINS + ICMS das estimativas calculadas',
          })}
          variante="padrao"
          tooltip={
            <div className="cg-tooltip__row">
              <span>{t('simulacusto.insights.kpi.tributos.tooltip', 'Soma dos tributos de todas as estimativas')}</span>
              <strong>{brl(kpis?.total_tributos_acumulado_brl)}</strong>
            </div>
          }
        />
      </div>

      {/* ── Recentes + coluna direita ── */}
      <div className="ecd-grid-principal">
        <div className="ecd-card ecd-card--accent-indigo ecd-recentes">
          <div className="ecd-card__head">
            <div className="cg-card__header">
              <div className="cg-card__icon-wrap">
                <ListBullets weight="duotone" size={16} style={{ color: '#818cf8' }} />
              </div>
              <p className="cg-card__label">
                {t('simulacusto.insights.recentes', 'Estimativas recentes')}
              </p>
            </div>
            <button
              type="button"
              className="ecd-link"
              onClick={() => navigate(rotaSimulaCusto('lista'))}
            >
              {t('simulacusto.insights.ver_todas', 'Ver todas')} <ArrowUpRight size={12} weight="bold" />
            </button>
          </div>

          {recentes.length === 0 ? (
            <div className="ecd-vazio">
              {t('simulacusto.estimativas.vazio', 'Nenhuma estimativa encontrada')}
            </div>
          ) : (
            <ul className="ecd-recentes-lista">
              {recentes.map(e => (
                <li key={e.id_estimativa_custo}>
                  <button
                    type="button"
                    className="ecd-recente"
                    onClick={() => navigate(rotaDetalheEstimativaCusto(e.id_estimativa_custo))}
                  >
                    <span className="ecd-recente__numero">{e.numero_estimativa_custo}</span>
                    <span className="ecd-recente__ncm">NCM {e.ncm_estimativa_custo}</span>
                    <span className={`sc-est-badge sc-est-badge--${STATUS_BADGE[e.status_estimativa_custo]}`}>
                      {STATUS_LABELS[e.status_estimativa_custo]}
                    </span>
                    <span className="ecd-recente__valor">{brl(e.custo_nacionalizado_brl_estimativa_custo)}</span>
                    <span className="ecd-recente__data">{dataBR(e.data_criacao_estimativa_custo)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ecd-coluna-direita">
          {/* Distribuição por status */}
          <div className="ecd-card ecd-card--accent-amber">
            <div className="ecd-card__head">
              <div className="cg-card__header">
                <div className="cg-card__icon-wrap">
                  <ClockCountdown weight="duotone" size={16} style={{ color: '#fbbf24' }} />
                </div>
                <p className="cg-card__label">
                  {t('simulacusto.insights.distribuicao', 'Distribuição por status')}
                </p>
              </div>
            </div>
            <div className="ecd-distribuicao">
              {distribuicao.map(d => (
                <div key={d.status} className="ecd-distribuicao__linha">
                  <span className="ecd-distribuicao__label">
                    <span className="ecd-dot" style={{ background: STATUS_COR[d.status] }} />
                    {STATUS_LABELS[d.status]}
                  </span>
                  <div className="ecd-distribuicao__barra">
                    <div
                      className="ecd-distribuicao__fill"
                      style={{ width: `${d.pct}%`, background: STATUS_COR[d.status] }}
                    />
                  </div>
                  <span className="ecd-distribuicao__qtd">{d.qtd}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extremos de custo */}
          <div className="ecd-card ecd-card--accent-emerald">
            <div className="ecd-card__head">
              <div className="cg-card__header">
                <div className="cg-card__icon-wrap">
                  <CheckCircle weight="duotone" size={16} style={{ color: '#34d399' }} />
                </div>
                <p className="cg-card__label">
                  {t('simulacusto.insights.extremos', 'Extremos de custo')}
                </p>
              </div>
            </div>
            <div className="ecd-extremos">
              <div className="ecd-extremo">
                <span className="ecd-extremo__label">
                  <TrendUp size={14} weight="bold" style={{ color: '#f87171' }} />
                  {t('simulacusto.insights.maior_custo', 'Maior custo')}
                </span>
                <span className="ecd-extremo__valor">{brl(kpis?.custo_nacionalizado_maior_brl)}</span>
              </div>
              <div className="ecd-extremo">
                <span className="ecd-extremo__label">
                  <TrendDown size={14} weight="bold" style={{ color: '#34d399' }} />
                  {t('simulacusto.insights.menor_custo', 'Menor custo')}
                </span>
                <span className="ecd-extremo__valor">{brl(kpis?.custo_nacionalizado_menor_brl)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
