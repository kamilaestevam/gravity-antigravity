/**
 * Dashboard.tsx — view Dashboard do Demo
 * Cards configuráveis via Configurações → Cards.
 */

import React from 'react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import {
  Hash,
  CheckCircle,
  ArrowsClockwise,
  SealCheck,
  CurrencyDollar,
  ChartBar,
} from '@phosphor-icons/react'
import { useCardPreferences } from '../shared/useCardPreferences'
import { useCardValues }      from '../shared/useCardValues'
import type { CardVariante }  from '@nucleo/card-global'
import './Dashboard.css'

// ── Mapa visual ───────────────────────────────────────────────────────────────

const CARD_ICONE: Record<string, React.ReactNode> = {
  total:       <Hash           weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />,
  ativos:      <CheckCircle    weight="duotone" size={16} style={{ color: '#34d399' }} />,
  andamento:   <ArrowsClockwise weight="duotone" size={16} style={{ color: '#fbbf24' }} />,
  concluidos:  <SealCheck      weight="duotone" size={16} style={{ color: '#34d399' }} />,
  valor_total: <CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />,
  media:       <ChartBar       weight="duotone" size={16} style={{ color: '#f59e0b' }} />,
}

const CARD_VARIANTE: Record<string, CardVariante> = {
  total:       'padrao',
  ativos:      'sucesso',
  andamento:   'aviso',
  concluidos:  'sucesso',
  valor_total: 'sucesso',
  media:       'aviso',
}

const CARD_LABEL: Record<string, string> = {
  total:       'Total',
  ativos:      'Ativos',
  andamento:   'Em Andamento',
  concluidos:  'Concluídos',
  valor_total: 'Valor Total',
  media:       'Média',
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { visiveis } = useCardPreferences()
  const valores      = useCardValues()

  return (
    <div className="demo-db-page">
      <div className="demo-db-cards">
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
    </div>
  )
}
