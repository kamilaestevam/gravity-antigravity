/**
 * DashboardStatusSeletorBotao — filtro de status com seleção múltipla (paridade chips da barra).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Check, Funnel, Square } from '@phosphor-icons/react'
import { DashboardToolbarBotaoIcon } from './DashboardToolbarBotaoIcon'
import { DASHBOARD_TOOLBAR_ICONE } from './dashboard-toolbar-icones'

export interface DashboardStatusSeletorBotaoProps {
  statusOptions: string[]
  statusLabels: Record<string, string>
  statusActiveColors: Record<string, { bg: string; border: string; text: string }>
  selectedStatus: string[]
  onStatusChange: (status: string[]) => void
  statusCounts?: Record<string, number>
}

export function DashboardStatusSeletorBotao({
  statusOptions,
  statusLabels,
  statusActiveColors,
  selectedStatus,
  onStatusChange,
  statusCounts,
}: DashboardStatusSeletorBotaoProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const painelRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const isTodosActive = selectedStatus.length === 0

  const atualizarCoords = useCallback(() => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setCoords({ top: r.bottom + 6, left: r.left })
  }, [])

  useEffect(() => {
    if (!open) return
    atualizarCoords()
    window.addEventListener('resize', atualizarCoords)
    window.addEventListener('scroll', atualizarCoords, true)
    return () => {
      window.removeEventListener('resize', atualizarCoords)
      window.removeEventListener('scroll', atualizarCoords, true)
    }
  }, [open, atualizarCoords])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (ref.current?.contains(target)) return
      if (painelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const resumoTooltip = isTodosActive
    ? t('nucleo.dashboard.barra.todos')
    : selectedStatus
      .map(opt => statusLabels[opt] ?? opt.replace(/_/g, ' '))
      .join(', ')

  const toggleStatus = (opt: string) => {
    const count = statusCounts?.[opt]
    if (statusCounts !== undefined && count === 0) return

    const active = selectedStatus.includes(opt)
    onStatusChange(
      active
        ? selectedStatus.filter(x => x !== opt)
        : [...selectedStatus, opt],
    )
  }

  const painel = open && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={painelRef}
          className="pedido-dashboard-toolbar-icon-dropdown__painel pedido-dashboard-toolbar-icon-dropdown__painel--portal"
          style={{ top: coords.top, left: coords.left }}
          role="listbox"
          aria-multiselectable="true"
          aria-label={t('nucleo.dashboard.barra.todos_status', { defaultValue: 'Filtrar por status' })}
        >
          <button
            type="button"
            role="option"
            aria-selected={isTodosActive}
            className={`pedido-dashboard-toolbar-icon-dropdown__opcao pedido-dashboard-toolbar-icon-dropdown__opcao--multi${isTodosActive ? ' pedido-dashboard-toolbar-icon-dropdown__opcao--ativa' : ''}`}
            data-testid="status-chip-todos"
            onClick={() => onStatusChange([])}
          >
            <span className="pedido-dashboard-toolbar-icon-dropdown__checkbox" aria-hidden="true">
              {isTodosActive ? <Check size={12} weight="bold" /> : <Square size={12} />}
            </span>
            <span className="pedido-dashboard-toolbar-icon-dropdown__rotulo">
              {t('nucleo.dashboard.barra.todos')}
            </span>
            {statusCounts !== undefined && (
              <span className="pedido-dashboard-toolbar-icon-dropdown__contagem">
                ({statusCounts['todos'] ?? Object.values(statusCounts).reduce((a, b) => a + b, 0)})
              </span>
            )}
          </button>

          <div className="pedido-dashboard-toolbar-icon-dropdown__separador" role="separator" />

          {statusOptions.map(opt => {
            const active = selectedStatus.includes(opt)
            const count = statusCounts?.[opt]
            const isDisabled = statusCounts !== undefined && count === 0
            const customColors = active ? statusActiveColors[opt] : undefined

            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={active}
                aria-disabled={isDisabled}
                className={`pedido-dashboard-toolbar-icon-dropdown__opcao pedido-dashboard-toolbar-icon-dropdown__opcao--multi${active ? ' pedido-dashboard-toolbar-icon-dropdown__opcao--ativa' : ''}${isDisabled ? ' pedido-dashboard-toolbar-icon-dropdown__opcao--desabilitada' : ''}`}
                style={active && customColors ? { color: customColors.text } : undefined}
                data-testid={`status-chip-${opt}`}
                onClick={() => toggleStatus(opt)}
              >
                <span
                  className="pedido-dashboard-toolbar-icon-dropdown__checkbox"
                  aria-hidden="true"
                  style={active && customColors ? { color: customColors.text } : undefined}
                >
                  {active ? <Check size={12} weight="bold" /> : <Square size={12} />}
                </span>
                <span className="pedido-dashboard-toolbar-icon-dropdown__rotulo">
                  {statusLabels[opt] ?? opt.replace(/_/g, ' ')}
                </span>
                {statusCounts !== undefined && count !== undefined && (
                  <span className="pedido-dashboard-toolbar-icon-dropdown__contagem">({count})</span>
                )}
              </button>
            )
          })}
        </div>,
        document.body,
      )
    : null

  return (
    <div ref={ref} className="pedido-dashboard-toolbar-icon-dropdown">
      <DashboardToolbarBotaoIcon
        titulo={t('nucleo.dashboard.barra.todos_status', { defaultValue: 'Status' })}
        descricao={resumoTooltip}
        icone={<Funnel {...DASHBOARD_TOOLBAR_ICONE} />}
        ariaLabel={t('nucleo.dashboard.barra.todos_status', { defaultValue: 'Filtrar por status' })}
        ariaHaspopup="listbox"
        ariaExpanded={open}
        data-testid="btn-status-dashboard"
        destacado={!isTodosActive}
        onClick={() => setOpen(v => !v)}
      />
      {painel}
    </div>
  )
}
