/**
 * DashboardAdicionarWidgetBotao — menu do + (sugestões ou criar do zero).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { ChartBar, PencilSimple, Plus } from '@phosphor-icons/react'
import { DashboardToolbarBotaoIcon } from './DashboardToolbarBotaoIcon'
import { DASHBOARD_TOOLBAR_ICONE } from './dashboard-toolbar-icones'

export interface DashboardAdicionarWidgetBotaoProps {
  onAbrirSugestoes: () => void
  onCriarWidgetZero: () => void
}

export function DashboardAdicionarWidgetBotao({
  onAbrirSugestoes,
  onCriarWidgetZero,
}: DashboardAdicionarWidgetBotaoProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const painelRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

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

  const fechar = () => setOpen(false)

  const painel = open && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={painelRef}
          className="pedido-dashboard-toolbar-icon-dropdown__painel pedido-dashboard-toolbar-icon-dropdown__painel--portal pedido-dashboard-adicionar-widget__painel"
          style={{ top: coords.top, left: coords.left }}
          role="menu"
          aria-label={t('nucleo.dashboard.barra.adicionar_dashboard')}
        >
          <button
            type="button"
            role="menuitem"
            className="pedido-dashboard-toolbar-icon-dropdown__opcao pedido-dashboard-adicionar-widget__opcao"
            data-testid="btn-adicionar-sugestoes"
            onClick={() => { fechar(); onAbrirSugestoes() }}
          >
            <ChartBar size={14} weight="duotone" aria-hidden="true" />
            <span className="pedido-dashboard-adicionar-widget__texto">
              <span className="pedido-dashboard-adicionar-widget__titulo">
                {t('nucleo.dashboard.sugestoes.titulo')}
              </span>
              <span className="pedido-dashboard-adicionar-widget__descricao">
                {t('nucleo.dashboard.sugestoes.hint')}
              </span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="pedido-dashboard-toolbar-icon-dropdown__opcao pedido-dashboard-adicionar-widget__opcao"
            data-testid="btn-criar-widget-zero"
            onClick={() => { fechar(); onCriarWidgetZero() }}
          >
            <PencilSimple size={14} weight="duotone" aria-hidden="true" />
            <span className="pedido-dashboard-adicionar-widget__texto">
              <span className="pedido-dashboard-adicionar-widget__titulo">
                {t('nucleo.dashboard.sugestoes.criar_widget_zero')}
              </span>
              <span className="pedido-dashboard-adicionar-widget__descricao">
                {t('pedido.dashboard.criar_widget_zero_descricao', {
                  defaultValue: 'Nome, campos, operação e tipo de gráfico',
                })}
              </span>
            </span>
          </button>
        </div>,
        document.body,
      )
    : null

  return (
    <div ref={ref} className="pedido-dashboard-toolbar-icon-dropdown">
      <DashboardToolbarBotaoIcon
        titulo={t('nucleo.dashboard.barra.adicionar_dashboard')}
        descricao={t('pedido.dashboard.adicionar_widget_menu_descricao', {
          defaultValue: 'Sugestões ou widget personalizado',
        })}
        icone={<Plus {...DASHBOARD_TOOLBAR_ICONE} weight="bold" />}
        ariaLabel={t('nucleo.dashboard.barra.adicionar_dashboard')}
        ariaHaspopup="menu"
        ariaExpanded={open}
        data-testid="btn-adicionar-dashboard"
        onClick={() => setOpen(v => !v)}
      />
      {painel}
    </div>
  )
}
