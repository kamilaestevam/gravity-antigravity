/**
 * DashboardSeletorWidgetsBotao — ocultar e reordenar widgets (paridade Colunas da Lista).
 */

import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectColunasGlobal } from '@nucleo/select-colunas-global'
import type { DashboardWidgetConfig } from '@nucleo/dashboard'
import {
  idsWidgetsVisiveis,
  ordenarWidgetsLista,
} from '../../shared/dashboardWidgetVisibilidade'

function IconeWidgets() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export interface DashboardSeletorWidgetsBotaoProps {
  widgets: DashboardWidgetConfig[]
  getWidgetLabel: (widget: DashboardWidgetConfig) => string
  onToggleVisibilidade: (widgetId: string) => void
  onReordenar: (fromId: string, toId: string) => void
  onSelecionarTodos: () => void
  onRestaurarPadrao: () => void
}

export function DashboardSeletorWidgetsBotao({
  widgets,
  getWidgetLabel,
  onToggleVisibilidade,
  onReordenar,
  onSelecionarTodos,
  onRestaurarPadrao,
}: DashboardSeletorWidgetsBotaoProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const widgetsOrdenados = useMemo(() => ordenarWidgetsLista(widgets), [widgets])

  const colunas = useMemo(
    () => widgetsOrdenados.map(w => ({
      key: w.id,
      label: getWidgetLabel(w),
    })),
    [widgetsOrdenados, getWidgetLabel],
  )

  const widgetsVisiveisIds = useMemo(() => idsWidgetsVisiveis(widgets), [widgets])

  const algumOculto = widgetsVisiveisIds.length < widgets.length

  return (
    <div className="bid-frete-dashboard-widgets-seletor">
      <button
        ref={btnRef}
        type="button"
        className={`gtv-btn bid-frete-dashboard-widgets-seletor__btn${open ? ' gtv-btn--ativo' : ''}${algumOculto ? ' bid-frete-dashboard-widgets-seletor__btn--destaque' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={t('pedido.dashboard.widgets_aria', { defaultValue: 'Gerenciar widgets' })}
        title={t('pedido.dashboard.widgets', { defaultValue: 'Widgets' })}
        data-testid="btn-widgets-dashboard"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IconeWidgets />
        {t('pedido.dashboard.widgets', { defaultValue: 'Widgets' })}
      </button>

      {open && (
        <SelectColunasGlobal
          colunas={colunas}
          colunasVisiveis={widgetsVisiveisIds}
          onToggle={onToggleVisibilidade}
          onReordenar={onReordenar}
          onSelecionarTodos={onSelecionarTodos}
          onRestaurarPadrao={onRestaurarPadrao}
          onFechar={() => setOpen(false)}
          triggerRef={btnRef}
          posicao={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200 }}
        />
      )}
    </div>
  )
}
