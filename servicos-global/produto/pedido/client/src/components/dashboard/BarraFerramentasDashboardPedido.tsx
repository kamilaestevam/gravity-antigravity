/**
 * BarraFerramentasDashboardPedido — menu único do Dashboard (só esta faixa muda).
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Plus, DotsSixVertical, X } from '@phosphor-icons/react'
import { PeriodDropdown } from '@nucleo/dashboard'
import type { PeriodOption } from '@nucleo/dashboard'
import type { ActiveFilter, GlobalSlicers } from '@nucleo/dashboard'
import './BarraFerramentasDashboardPedido.css'

export interface BarraFerramentasDashboardPedidoProps {
  seletorPaineis: React.ReactNode
  temWidgets: boolean
  bannerOnboarding?: React.ReactNode
  chipsPeriodo?: React.ReactNode
  slicers: GlobalSlicers
  onPeriodChange: (period: string) => void
  periodOptions: PeriodOption[]
  onStatusChange: (status: string[]) => void
  statusOptions: string[]
  statusLabels: Record<string, string>
  statusActiveColors: Record<string, { bg: string; border: string; text: string }>
  statusCounts?: Record<string, number>
  compactStatus?: boolean
  activeFilters: ActiveFilter[]
  onClearFilters: () => void
  editMode: boolean
  onEditModeChange: (v: boolean) => void
  onAddWidget?: () => void
}

export function BarraFerramentasDashboardPedido({
  seletorPaineis,
  temWidgets,
  bannerOnboarding,
  chipsPeriodo,
  slicers,
  onPeriodChange,
  periodOptions,
  onStatusChange,
  statusOptions,
  statusLabels,
  statusActiveColors,
  statusCounts,
  compactStatus = false,
  activeFilters,
  onClearFilters,
  editMode,
  onEditModeChange,
  onAddWidget,
}: BarraFerramentasDashboardPedidoProps) {
  const { t } = useTranslation()
  const isTodosActive = slicers.status.length === 0
  const temRodape = chipsPeriodo != null || activeFilters.length > 0

  return (
    <div className="pedido-dashboard-menu" data-testid="dashboard-barra-menu">
      {bannerOnboarding != null && (
        <div className="pedido-dashboard-menu__onboarding">{bannerOnboarding}</div>
      )}

      <div className="pedido-dashboard-menu__toolbar">
        <div className="pedido-dashboard-menu__toolbar-esquerda">
          {seletorPaineis}

          {temWidgets && (
            <>
              {seletorPaineis != null && <span className="pedido-dashboard-menu__divisor" aria-hidden="true" />}

              <div className="pedido-dashboard-menu__slicer">
                <span className="pedido-dashboard-menu__label">{t('nucleo.dashboard.barra.periodo')}</span>
                <PeriodDropdown
                  value={slicers.period}
                  options={periodOptions}
                  onChange={onPeriodChange}
                />
              </div>

              {statusOptions.length > 0 && (
                <>
                  <span className="pedido-dashboard-menu__divisor" aria-hidden="true" />

                  {compactStatus ? (
                    <div data-testid="status-compact-dropdown">
                      <PeriodDropdown
                        value={slicers.status[0] ?? '__todos__'}
                        options={[
                          { value: '__todos__', label: t('nucleo.dashboard.barra.todos_status') },
                          ...statusOptions.map(opt => ({
                            value: opt,
                            label: `${statusLabels[opt] ?? opt.replace(/_/g, ' ')}${statusCounts?.[opt] !== undefined ? ` (${statusCounts[opt]})` : ''}`,
                          })),
                        ]}
                        onChange={(val) => onStatusChange(val === '__todos__' ? [] : [val])}
                      />
                    </div>
                  ) : (
                    <div className="pedido-dashboard-menu__status-chips" data-testid="status-chips-container">
                      <button
                        type="button"
                        className={`pedido-dashboard-menu__chip${isTodosActive ? ' pedido-dashboard-menu__chip--ativo' : ''}`}
                        onClick={() => onStatusChange([])}
                        data-testid="status-chip-todos"
                      >
                        {t('nucleo.dashboard.barra.todos')}
                        {statusCounts !== undefined && (
                          <span className="pedido-dashboard-menu__chip-count">
                            ({statusCounts['todos'] ?? Object.values(statusCounts).reduce((a, b) => a + b, 0)})
                          </span>
                        )}
                      </button>

                      {statusOptions.map(opt => {
                        const active = slicers.status.includes(opt)
                        const customColors = active ? statusActiveColors[opt] : undefined
                        const count = statusCounts?.[opt]
                        const isDisabled = statusCounts !== undefined && count === 0

                        return (
                          <button
                            key={opt}
                            type="button"
                            className={`pedido-dashboard-menu__chip${active ? ' pedido-dashboard-menu__chip--ativo' : ''}${isDisabled ? ' pedido-dashboard-menu__chip--disabled' : ''}`}
                            style={active && customColors ? { color: customColors.text } : undefined}
                            aria-disabled={isDisabled}
                            data-testid={`status-chip-${opt}`}
                            onClick={() => {
                              if (isDisabled) return
                              onStatusChange(
                                active
                                  ? slicers.status.filter(x => x !== opt)
                                  : [...slicers.status, opt],
                              )
                            }}
                          >
                            {statusLabels[opt] ?? opt.replace(/_/g, ' ')}
                            {statusCounts !== undefined && count !== undefined && (
                              <span className="pedido-dashboard-menu__chip-count">({count})</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="pedido-dashboard-menu__toolbar-direita">
          {onAddWidget && (
            <button
              type="button"
              className="pedido-dashboard-menu__btn"
              onClick={onAddWidget}
              data-testid="btn-adicionar-dashboard"
            >
              <Plus size={14} weight="bold" /> {t('nucleo.dashboard.barra.adicionar_dashboard')}
            </button>
          )}
          <button
            type="button"
            className={`pedido-dashboard-menu__btn${editMode ? ' pedido-dashboard-menu__btn--ativo' : ''}`}
            onClick={() => onEditModeChange(!editMode)}
            data-testid="btn-reorganizar"
            title={editMode ? undefined : t('nucleo.dashboard.barra.arraste_widgets_tooltip')}
          >
            {editMode
              ? <><Check size={14} weight="bold" /> {t('nucleo.dashboard.barra.concluir')}</>
              : <><DotsSixVertical size={14} weight="bold" /> {t('nucleo.dashboard.barra.reorganizar')}</>
            }
          </button>
        </div>
      </div>

      {temRodape && (
        <div className="pedido-dashboard-menu__rodape">
          {chipsPeriodo}
          {activeFilters.length > 0 && (
            <div className="pedido-dashboard-menu__filtros-ativos">
              <span className="pedido-dashboard-menu__label">{t('nucleo.dashboard.barra.filtros_ativos')}</span>
              {activeFilters.map(f => (
                <span key={`${f.field}-${f.sourceWidgetId}`} className="pedido-dashboard-menu__filtro-tag">
                  {f.label}
                </span>
              ))}
              <button type="button" className="pedido-dashboard-menu__limpar-btn" onClick={onClearFilters}>
                <X size={12} /> {t('nucleo.dashboard.barra.limpar')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
