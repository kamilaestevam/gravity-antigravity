/**
 * BarraFerramentasDashboardPedido — faixa de controles do Dashboard.
 * Cores via gtv-container / gtv-toolbar (paridade Lista).
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { X, RocketLaunch, CalendarBlank } from '@phosphor-icons/react'
import { PeriodDropdown } from '@nucleo/dashboard'
import type { PeriodOption } from '@nucleo/dashboard'
import type { ActiveFilter, GlobalSlicers, DashboardWidgetConfig } from '@nucleo/dashboard'
import '@nucleo/tabela-virtual-global/tabela-virtual.css'
import '../PedidosVisualizacaoTabs.css'
import './BarraFerramentasDashboardPedido.css'
import { DashboardStatusSeletorBotao } from './DashboardStatusSeletorBotao'
import { DashboardAdicionarWidgetBotao } from './DashboardAdicionarWidgetBotao'
import { DashboardSeletorWidgetsBotao } from './DashboardSeletorWidgetsBotao'
import { DashboardToolbarBotaoIcon } from './DashboardToolbarBotaoIcon'
import { DASHBOARD_TOOLBAR_ICONE } from './dashboard-toolbar-icones'

export interface OnboardingDashboardBarra {
  onExplorarSugestoes: () => void
  onCriarDoZero: () => void
}

export interface BarraFerramentasDashboardPedidoProps {
  seletorPaineis: React.ReactNode
  temWidgets: boolean
  onboarding?: OnboardingDashboardBarra
  slicers: GlobalSlicers
  onPeriodChange: (period: string) => void
  periodOptions: PeriodOption[]
  onStatusChange: (status: string[]) => void
  statusOptions: string[]
  statusLabels: Record<string, string>
  statusActiveColors: Record<string, { bg: string; border: string; text: string }>
  statusCounts?: Record<string, number>
  activeFilters: ActiveFilter[]
  onClearFilters: () => void
  onAbrirSugestoes?: () => void
  onCriarWidgetZero?: () => void
  widgetsSeletor?: {
    widgets: DashboardWidgetConfig[]
    getWidgetLabel: (widget: DashboardWidgetConfig) => string
    onToggleVisibilidade: (widgetId: string) => void
    onReordenar: (fromId: string, toId: string) => void
    onSelecionarTodos: () => void
    onRestaurarPadrao: () => void
  }
}

export function BarraFerramentasDashboardPedido({
  seletorPaineis,
  temWidgets,
  onboarding,
  slicers,
  onPeriodChange,
  periodOptions,
  onStatusChange,
  statusOptions,
  statusLabels,
  statusActiveColors,
  statusCounts,
  activeFilters,
  onClearFilters,
  onAbrirSugestoes,
  onCriarWidgetZero,
  widgetsSeletor,
}: BarraFerramentasDashboardPedidoProps) {
  const { t } = useTranslation()
  const temRodape = activeFilters.length > 0
  const mostrarOnboarding = !temWidgets && onboarding != null
  const ic = DASHBOARD_TOOLBAR_ICONE

  const botaoAdicionar = onAbrirSugestoes != null && onCriarWidgetZero != null ? (
    <DashboardAdicionarWidgetBotao
      onAbrirSugestoes={onAbrirSugestoes}
      onCriarWidgetZero={onCriarWidgetZero}
    />
  ) : null

  const mostrarIconesToolbar = true

  return (
    <div
      className="pedido-dashboard-menu"
      data-testid="dashboard-barra-menu"
      data-pedido-toolbar-version="gtv-v11-menu-widget"
    >
      <div className="gtv-container pedido-dashboard-toolbar-card">
        <div className="gtv-toolbar pedido-dashboard-toolbar">
          <div className="gtv-toolbar-esquerda pedido-dashboard-toolbar__esquerda">
            <div className="pedido-dashboard-paineis-toolbar-slot">
              {seletorPaineis}
            </div>

            {mostrarOnboarding && (
              <>
                <span className="pedido-dashboard-menu__divisor" aria-hidden="true" />
                <div className="pedido-dashboard-menu__onboarding-hint">
                  <span className="pedido-dashboard-menu__onboarding-titulo">
                    {t('pedido.dashboard.onboarding_titulo')}
                  </span>
                  <span className="pedido-dashboard-menu__onboarding-texto">
                    {t('pedido.dashboard.onboarding_texto')}
                  </span>
                </div>
              </>
            )}

            {mostrarIconesToolbar && (
              <>
                <span className="pedido-dashboard-menu__divisor" aria-hidden="true" />

                <div className="pedido-dashboard-toolbar__icones" data-testid="dashboard-toolbar-icones">
                  {temWidgets && (
                    <>
                      <PeriodDropdown
                        value={slicers.period}
                        options={periodOptions}
                        onChange={onPeriodChange}
                        modoPainel="dropdown"
                        alinharPainel="esquerda"
                        renderGatilho={({ open, selectedLabel, onToggle }) => (
                          <DashboardToolbarBotaoIcon
                            titulo={t('nucleo.dashboard.barra.periodo')}
                            descricao={selectedLabel}
                            icone={<CalendarBlank {...ic} />}
                            ariaLabel={t('nucleo.dashboard.barra.periodo')}
                            ariaHaspopup="listbox"
                            ariaExpanded={open}
                            data-testid="btn-periodo-dashboard"
                            onClick={onToggle}
                          />
                        )}
                      />

                      {statusOptions.length > 0 && (
                        <DashboardStatusSeletorBotao
                          statusOptions={statusOptions}
                          statusLabels={statusLabels}
                          statusActiveColors={statusActiveColors}
                          selectedStatus={slicers.status}
                          onStatusChange={onStatusChange}
                          statusCounts={statusCounts}
                        />
                      )}
                    </>
                  )}

                  {botaoAdicionar}
                </div>

                {temWidgets && widgetsSeletor != null && (
                  <DashboardSeletorWidgetsBotao
                    widgets={widgetsSeletor.widgets}
                    getWidgetLabel={widgetsSeletor.getWidgetLabel}
                    onToggleVisibilidade={widgetsSeletor.onToggleVisibilidade}
                    onReordenar={widgetsSeletor.onReordenar}
                    onSelecionarTodos={widgetsSeletor.onSelecionarTodos}
                    onRestaurarPadrao={widgetsSeletor.onRestaurarPadrao}
                  />
                )}
              </>
            )}
          </div>

          <div className="gtv-toolbar-direita pedido-dashboard-toolbar__direita">
            {mostrarOnboarding && (
              <div className="pedido-dashboard-menu__acoes-onboarding">
                <button
                  type="button"
                  className="gtv-btn pedido-dashboard-menu__btn pedido-dashboard-menu__btn--primario"
                  onClick={onboarding.onExplorarSugestoes}
                  data-testid="btn-explorar-sugestoes"
                >
                  <RocketLaunch size={14} weight="fill" />
                  {t('pedido.dashboard.onboarding_explorar_sugestoes')}
                </button>
                <button
                  type="button"
                  className="gtv-btn pedido-dashboard-menu__btn"
                  onClick={onboarding.onCriarDoZero}
                  data-testid="btn-criar-dashboard-zero"
                >
                  {t('pedido.dashboard.onboarding_criar_dashboard')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {temRodape && (
        <div className="pedido-dashboard-menu__rodape">
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
        </div>
      )}
    </div>
  )
}
