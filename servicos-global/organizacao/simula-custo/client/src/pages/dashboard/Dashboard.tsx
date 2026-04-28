/**
 * Dashboard.tsx — Visão Dashboard SimulaCusto
 * Produto: SimulaCusto
 *
 * Cards configuráveis pelo usuário via Configurações → Cards.
 * Ordem, visibilidade e catálogo gerenciados por useCardPreferences.
 * Valores calculados por useCardValues (única chamada à API de KPIs).
 */

import React, { useState, useEffect, useCallback } from 'react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import {
  Calculator,
  TrendUp,
  CheckCircle,
  Archive,
  CurrencyDollar,
  Scales,
} from '@phosphor-icons/react'
import { getEstimativasKpis } from '../../shared/api'
import type { EstimativasKpis } from '../../shared/types'
import { useCardPreferences } from '../../shared/useCardPreferences'
import { useCardValues } from '../../shared/useCardValues'
import type { CardVariante } from '@nucleo/card-global'
import './Dashboard.css'

// ─── Mapa visual dos cards ────────────────────────────────────────────────────

const CARD_ICONE: Record<string, React.ReactNode> = {
  'total':               <Calculator    weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />,
  'em_criacao':          <TrendUp       weight="duotone" size={16} style={{ color: '#fbbf24' }} />,
  'criadas':             <CheckCircle   weight="duotone" size={16} style={{ color: '#34d399' }} />,
  'arquivadas':          <Archive       weight="duotone" size={16} style={{ color: '#94a3b8' }} />,
  'landed_cost_medio':   <CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />,
  'total_tributos_acum': <Scales        weight="duotone" size={16} style={{ color: '#f59e0b' }} />,
}

const CARD_VARIANTE: Record<string, CardVariante> = {
  'total':               'padrao',
  'em_criacao':          'aviso',
  'criadas':             'sucesso',
  'arquivadas':          'padrao',
  'landed_cost_medio':   'sucesso',
  'total_tributos_acum': 'aviso',
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [kpis, setKpis] = useState<EstimativasKpis>({
    total: 0, em_criacao: 0, criadas: 0, arquivadas: 0,
    landed_cost_medio: 0, total_tributos_acumulado: 0,
  })

  const { visiveis } = useCardPreferences()
  const valores      = useCardValues(kpis)

  const carregar = useCallback(async () => {
    try { setKpis(await getEstimativasKpis()) }
    catch { /* mantém zeros */ }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="sc-db-page">
      <div className="sc-db-cards">
        {visiveis.map(pref => {
          const v = valores[pref.id]
          if (!v) return null
          return (
            <CardBasicoGlobal
              key={pref.id}
              icone={CARD_ICONE[pref.id]}
              titulo={visiveis.find(p => p.id === pref.id)
                ? (CARD_LABEL[pref.id] ?? pref.id)
                : pref.id}
              valor={v.valor}
              subtexto={v.subtexto}
              tooltip={v.tooltip}
              variante={CARD_VARIANTE[pref.id] ?? 'padrao'}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Labels (fonte de verdade local — evita importar catálogo inteiro) ────────

const CARD_LABEL: Record<string, string> = {
  'total':               'Total',
  'em_criacao':          'Em Criação',
  'criadas':             'Criadas',
  'arquivadas':          'Arquivadas',
  'landed_cost_medio':   'Landed Cost Médio',
  'total_tributos_acum': 'Total Tributos',
}
