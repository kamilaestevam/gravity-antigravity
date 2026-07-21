/**
 * dashboard-simula-custo.tsx — Dashboard do Simula Custo.
 * Paridade visual com o Dashboard do Bid Frete Internacional:
 * widgets configuráveis (ordem/visibilidade em Configurações → Cards)
 * + painéis de distribuição. Título/subtítulo vêm do MenuTopoGlobal.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CardBasicoGlobal } from '@nucleo/card-global'
import {
  Calculator, TrendUp, CheckCircle, Archive, CurrencyDollar, Scales,
  GearSix, SquaresFour,
} from '@phosphor-icons/react'
import { obterKpisSimulaCusto } from '../shared/api'
import type { KpisSimulaCusto } from '../shared/schemas-simula-custo'
import { useCardPreferences } from '../shared/preferencias-cards-simula-custo'
import { useCardValues } from '../shared/valores-cards-simula-custo'
import type { CardVariante } from '@nucleo/card-global'
import { STATUS_LABELS } from '../shared/types'
import { rotaSimulaCusto } from '../shared/rotas-simula-custo'
import './dashboard-simula-custo.css'

const CARD_ICONE: Record<string, React.ReactNode> = {
  'total':                     <Calculator     weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />,
  'em_criacao':                <TrendUp        weight="duotone" size={16} style={{ color: '#fbbf24' }} />,
  'criadas':                   <CheckCircle    weight="duotone" size={16} style={{ color: '#34d399' }} />,
  'arquivadas':                <Archive        weight="duotone" size={16} style={{ color: '#94a3b8' }} />,
  'custo_nacionalizado_medio': <CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />,
  'total_tributos_acumulado':  <Scales         weight="duotone" size={16} style={{ color: '#f59e0b' }} />,
}

const CARD_VARIANTE: Record<string, CardVariante> = {
  'total':                     'padrao',
  'em_criacao':                'aviso',
  'criadas':                   'sucesso',
  'arquivadas':                'padrao',
  'custo_nacionalizado_medio': 'sucesso',
  'total_tributos_acumulado':  'aviso',
}

const CARD_LABEL: Record<string, string> = {
  'total':                     'Total de Simulas',
  'em_criacao':                'Em Criação',
  'criadas':                   'Criadas',
  'arquivadas':                'Arquivadas',
  'custo_nacionalizado_medio': 'Custo Nacionalizado Médio',
  'total_tributos_acumulado':  'Total Tributos',
}

const STATUS_COR: Record<string, string> = {
  EM_CRIACAO: '#fbbf24',
  CRIADA: '#34d399',
  ARQUIVADA: '#94a3b8',
}

export default function DashboardSimulaCusto() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [kpis, setKpis] = useState<KpisSimulaCusto>({
    total: 0, em_criacao: 0, criadas: 0, arquivadas: 0,
    custo_nacionalizado_medio_brl: 0, total_tributos_acumulado_brl: 0,
  })

  const { visiveis } = useCardPreferences()
  const valores = useCardValues(kpis)

  const carregar = useCallback(async () => {
    try { setKpis(await obterKpisSimulaCusto()) }
    catch { /* mantém zeros */ }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const distribuicao = useMemo(() => {
    return (['EM_CRIACAO', 'CRIADA', 'ARQUIVADA'] as const).map(status => {
      const qtd = status === 'EM_CRIACAO'
        ? kpis.em_criacao
        : status === 'CRIADA' ? kpis.criadas : kpis.arquivadas
      return {
        status,
        qtd,
        pct: kpis.total > 0 ? Math.round((qtd / kpis.total) * 100) : 0,
      }
    })
  }, [kpis])

  return (
    <div className="ecdb-page">
      {/* ── Barra de painéis (paridade "PAINÉIS Padrão" do Bid Frete) ── */}
      <div className="ecdb-paineis-bar">
        <span className="ecdb-paineis-bar__label">
          {t('simulacusto.dashboard.paineis', 'Painéis')}
        </span>
        <span className="ecdb-paineis-bar__tab ecdb-paineis-bar__tab--ativo">
          {t('simulacusto.dashboard.painel_padrao', 'Padrão')}
        </span>
        <button
          type="button"
          className="ecdb-paineis-bar__config"
          onClick={() => navigate(rotaSimulaCusto('configuracoes'))}
          title={t('simulacusto.dashboard.configurar_cards', 'Configurar cards')}
        >
          <GearSix weight="duotone" size={14} />
          {t('simulacusto.dashboard.widgets', 'Widgets')}
        </button>
      </div>

      {/* ── Widgets configuráveis ── */}
      <div className="ecdb-widgets">
        {visiveis.map(pref => {
          const v = valores[pref.id]
          if (!v) return null
          return (
            <CardBasicoGlobal
              key={pref.id}
              icone={CARD_ICONE[pref.id]}
              titulo={CARD_LABEL[pref.id] ?? pref.id}
              valor={v.valor}
              subtexto={v.subtexto}
              tooltip={v.tooltip}
              variante={CARD_VARIANTE[pref.id] ?? 'padrao'}
            />
          )
        })}
      </div>

      {/* ── Painéis de distribuição ── */}
      <div className="ecdb-paineis-grid">
        <div className="ecd-card ecd-card--accent-indigo">
          <div className="ecd-card__head">
            <div className="cg-card__header">
              <div className="cg-card__icon-wrap">
                <SquaresFour weight="duotone" size={16} style={{ color: '#818cf8' }} />
              </div>
              <p className="cg-card__label">
                {t('simulacusto.dashboard.distribuicao_status', 'Simulas por status')}
              </p>
            </div>
          </div>
          <div className="ecdb-distribuicao">
            {distribuicao.map(d => (
              <div key={d.status} className="ecdb-distribuicao__item">
                <div className="ecdb-distribuicao__topo">
                  <span className="ecd-dot" style={{ background: STATUS_COR[d.status] }} />
                  <span className="ecdb-distribuicao__nome">{STATUS_LABELS[d.status]}</span>
                  <span className="ecdb-distribuicao__pct">{d.pct}%</span>
                </div>
                <div className="ecdb-distribuicao__valor">{d.qtd}</div>
                <div className="ecd-distribuicao__barra">
                  <div
                    className="ecd-distribuicao__fill"
                    style={{ width: `${d.pct}%`, background: STATUS_COR[d.status] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ecd-card ecd-card--accent-emerald">
          <div className="ecd-card__head">
            <div className="cg-card__header">
              <div className="cg-card__icon-wrap">
                <Scales weight="duotone" size={16} style={{ color: '#34d399' }} />
              </div>
              <p className="cg-card__label">
                {t('simulacusto.dashboard.resumo_financeiro', 'Resumo financeiro')}
              </p>
            </div>
          </div>
          <div className="ecdb-resumo">
            <div className="ecdb-resumo__item">
              <span className="ecdb-resumo__label">
                {t('simulacusto.simulas.custo_medio', 'Custo Nacionalizado Médio')}
              </span>
              <span className="ecdb-resumo__valor ecdb-resumo__valor--sucesso">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(kpis.custo_nacionalizado_medio_brl)}
              </span>
            </div>
            <div className="ecdb-resumo__item">
              <span className="ecdb-resumo__label">
                {t('simulacusto.insights.kpi_tributos', 'Tributos Acumulados')}
              </span>
              <span className="ecdb-resumo__valor ecdb-resumo__valor--aviso">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(kpis.total_tributos_acumulado_brl)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
