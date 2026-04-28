/**
 * SeletorVisualizacaoGlobal — Gravity Design System
 *
 * Pill-toggle premium para alternar entre visualizações de uma tela:
 *   Dashboard · Lista · Kanban
 *
 * Uso:
 *   const [view, setView] = useState<ViewMode>('lista')
 *   <SeletorVisualizacaoGlobal view={view} onChange={setView} />
 *
 * Props opcionais `views` permitem customizar quais views aparecem.
 */

import React from 'react'
import './seletor-visualizacao.css'
import {
  ChartBarHorizontal,
  Rows,
  Kanban,
  ChartBar,
} from '@phosphor-icons/react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ViewMode = 'dashboard' | 'lista' | 'kanban'

export interface ViewOption {
  id: ViewMode
  label: string
  icon: React.ReactNode
}

export interface SeletorVisualizacaoProps {
  /** View ativa no momento */
  view: ViewMode
  /** Callback ao trocar de view */
  onChange: (v: ViewMode) => void
  /** Quais views exibir (padrão: dashboard, lista, kanban) */
  views?: ViewMode[]
  /** Tamanho do componente */
  tamanho?: 'pequeno' | 'medio'
}

// ─── Configuração padrão das views ───────────────────────────────────────────

const ALL_VIEWS: ViewOption[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <ChartBar weight="duotone" size={15} />,
  },
  {
    id: 'lista',
    label: 'Lista',
    icon: <Rows weight="duotone" size={15} />,
  },
  {
    id: 'kanban',
    label: 'Kanban',
    icon: <Kanban weight="duotone" size={15} />,
  },
]

// ─── Componente ──────────────────────────────────────────────────────────────

export function SeletorVisualizacaoGlobal({
  view,
  onChange,
  views = ['dashboard', 'lista', 'kanban'],
  tamanho = 'medio',
}: SeletorVisualizacaoProps) {
  const visibles = ALL_VIEWS.filter(v => views.includes(v.id))

  return (
    <nav
      className={`sv-root sv-root--${tamanho}`}
      aria-label="Selecionar visualização"
      role="tablist"
    >
      {/* Trilha de fundo */}
      <div className="sv-track" />

      {visibles.map(opt => {
        const isActive = opt.id === view
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isActive}
            aria-label={`Visualização: ${opt.label}`}
            id={`sv-btn-${opt.id}`}
            className={`sv-btn ${isActive ? 'sv-btn--active' : ''}`}
            onClick={() => onChange(opt.id)}
            type="button"
          >
            <span className="sv-btn__icon">{opt.icon}</span>
            <span className="sv-btn__label">{opt.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
