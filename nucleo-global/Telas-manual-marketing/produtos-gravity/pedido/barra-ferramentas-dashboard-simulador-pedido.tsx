/**
 * Barra de ferramentas do Dashboard simulador — paridade BarraFerramentasDashboardPedido.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  CalendarBlank,
  ChartBar,
  Check,
  Funnel,
  PencilSimple,
  Plus,
  Square,
  X,
} from '@phosphor-icons/react'
import { PeriodDropdown } from '@nucleo/dashboard'
import type { ActiveFilter, DashboardWidgetConfig, GlobalSlicers, PeriodOption } from '@nucleo/dashboard'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { SelectColunasGlobal } from '@nucleo/select-colunas-global'
import {
  idsWidgetsVisiveis,
  ordenarWidgetsLista,
} from './util-widgets-dashboard-simulador-pedido'

const IC = { size: 8, weight: 'duotone' as const }

interface ToolbarIconBtnProps {
  titulo: string
  descricao: string
  icone: React.ReactNode
  ariaLabel: string
  onClick?: () => void
  'data-testid'?: string
  ariaExpanded?: boolean
  ariaHaspopup?: React.AriaAttributes['aria-haspopup']
  destacado?: boolean
}

function ToolbarIconBtn({
  titulo,
  descricao,
  icone,
  ariaLabel,
  onClick,
  'data-testid': dataTestId,
  ariaExpanded,
  ariaHaspopup,
  destacado = false,
}: ToolbarIconBtnProps) {
  return (
    <TooltipGlobal titulo={titulo} descricao={descricao}>
      <BotaoGlobal
        variante={destacado ? 'primario' : 'secundario'}
        tamanho="pequeno"
        icone={icone}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHaspopup}
        data-testid={dataTestId}
        className="pedido-dashboard-toolbar-botao-icone"
        onClick={onClick}
      />
    </TooltipGlobal>
  )
}

function IconeWidgets() {
  return (
    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

interface StatusSeletorProps {
  statusOptions: string[]
  statusLabels: Record<string, string>
  statusActiveColors: Record<string, { bg: string; border: string; text: string }>
  selectedStatus: string[]
  onStatusChange: (status: string[]) => void
  statusCounts?: Record<string, number>
}

function StatusSeletorSimulador({
  statusOptions,
  statusLabels,
  statusActiveColors,
  selectedStatus,
  onStatusChange,
  statusCounts,
}: StatusSeletorProps) {
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
    ? t('nucleo.dashboard.barra.todos', { defaultValue: 'Todos' })
    : selectedStatus.map(opt => statusLabels[opt] ?? opt).join(', ')

  const painel = open && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={painelRef}
          className="pedido-dashboard-toolbar-icon-dropdown__painel pedido-dashboard-toolbar-icon-dropdown__painel--portal"
          style={{ top: coords.top, left: coords.left }}
          role="listbox"
          aria-multiselectable="true"
        >
          <button
            type="button"
            role="option"
            aria-selected={isTodosActive}
            className={`pedido-dashboard-toolbar-icon-dropdown__opcao pedido-dashboard-toolbar-icon-dropdown__opcao--multi${isTodosActive ? ' pedido-dashboard-toolbar-icon-dropdown__opcao--ativa' : ''}`}
            onClick={() => onStatusChange([])}
          >
            <span className="pedido-dashboard-toolbar-icon-dropdown__checkbox" aria-hidden="true">
              {isTodosActive ? <Check size={12} weight="bold" /> : <Square size={12} />}
            </span>
            <span className="pedido-dashboard-toolbar-icon-dropdown__rotulo">
              {t('nucleo.dashboard.barra.todos', { defaultValue: 'Todos' })}
            </span>
            {statusCounts && (
              <span className="pedido-dashboard-toolbar-icon-dropdown__contagem">
                ({statusCounts.todos ?? statusCounts.total_pedidos ?? Object.values(statusCounts).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)})
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
                onClick={() => {
                  if (isDisabled) return
                  onStatusChange(
                    active ? selectedStatus.filter(x => x !== opt) : [...selectedStatus, opt],
                  )
                }}
              >
                <span className="pedido-dashboard-toolbar-icon-dropdown__checkbox" aria-hidden="true">
                  {active ? <Check size={12} weight="bold" /> : <Square size={12} />}
                </span>
                <span className="pedido-dashboard-toolbar-icon-dropdown__rotulo">
                  {statusLabels[opt] ?? opt}
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
      <ToolbarIconBtn
        titulo={t('nucleo.dashboard.barra.todos_status', { defaultValue: 'Status' })}
        descricao={resumoTooltip}
        icone={<Funnel {...IC} />}
        ariaLabel={t('nucleo.dashboard.barra.todos_status', { defaultValue: 'Status' })}
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

interface AdicionarWidgetProps {
  onAbrirSugestoes: () => void
  onCriarWidgetZero: () => void
}

function AdicionarWidgetSimulador({ onAbrirSugestoes, onCriarWidgetZero }: AdicionarWidgetProps) {
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
        >
          <button
            type="button"
            role="menuitem"
            className="pedido-dashboard-toolbar-icon-dropdown__opcao pedido-dashboard-adicionar-widget__opcao"
            onClick={() => { fechar(); onAbrirSugestoes() }}
          >
            <ChartBar size={14} weight="duotone" aria-hidden="true" />
            <span className="pedido-dashboard-adicionar-widget__texto">
              <span className="pedido-dashboard-adicionar-widget__titulo">
                {t('nucleo.dashboard.sugestoes.titulo', { defaultValue: 'Sugestões da GABI' })}
              </span>
              <span className="pedido-dashboard-adicionar-widget__descricao">
                {t('nucleo.dashboard.sugestoes.hint', { defaultValue: 'Widgets recomendados para seu perfil' })}
              </span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="pedido-dashboard-toolbar-icon-dropdown__opcao pedido-dashboard-adicionar-widget__opcao"
            onClick={() => { fechar(); onCriarWidgetZero() }}
          >
            <PencilSimple size={14} weight="duotone" aria-hidden="true" />
            <span className="pedido-dashboard-adicionar-widget__texto">
              <span className="pedido-dashboard-adicionar-widget__titulo">
                {t('nucleo.dashboard.sugestoes.criar_widget_zero', { defaultValue: 'Criar do zero' })}
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
      <ToolbarIconBtn
        titulo={t('nucleo.dashboard.barra.adicionar_dashboard', { defaultValue: 'Adicionar widget' })}
        descricao={t('pedido.dashboard.adicionar_widget_menu_descricao', { defaultValue: 'Sugestões ou widget personalizado' })}
        icone={<Plus {...IC} weight="bold" />}
        ariaLabel={t('nucleo.dashboard.barra.adicionar_dashboard', { defaultValue: 'Adicionar widget' })}
        ariaHaspopup="menu"
        ariaExpanded={open}
        data-testid="btn-adicionar-dashboard"
        onClick={() => setOpen(v => !v)}
      />
      {painel}
    </div>
  )
}

interface SeletorWidgetsProps {
  widgets: DashboardWidgetConfig[]
  getWidgetLabel: (widget: DashboardWidgetConfig) => string
  onToggleVisibilidade: (widgetId: string) => void
  onReordenar: (fromId: string, toId: string) => void
  onSelecionarTodos: () => void
  onRestaurarPadrao: () => void
}

function SeletorWidgetsSimulador({
  widgets,
  getWidgetLabel,
  onToggleVisibilidade,
  onReordenar,
  onSelecionarTodos,
  onRestaurarPadrao,
}: SeletorWidgetsProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const widgetsOrdenados = useMemo(() => ordenarWidgetsLista(widgets), [widgets])
  const colunas = useMemo(
    () => widgetsOrdenados.map(w => ({ key: w.id, label: getWidgetLabel(w) })),
    [widgetsOrdenados, getWidgetLabel],
  )
  const widgetsVisiveisIds = useMemo(() => idsWidgetsVisiveis(widgets), [widgets])
  const algumOculto = widgetsVisiveisIds.length < widgets.length

  return (
    <div className="pedido-dashboard-widgets-seletor">
      <button
        ref={btnRef}
        type="button"
        className={`gtv-btn pedido-dashboard-widgets-seletor__btn${open ? ' gtv-btn--ativo' : ''}${algumOculto ? ' pedido-dashboard-widgets-seletor__btn--destaque' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={t('pedido.dashboard.widgets_aria', { defaultValue: 'Gerenciar widgets' })}
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

export interface OnboardingBarraSimulador {
  onExplorarSugestoes: () => void
  onCriarDoZero: () => void
}

export interface BarraFerramentasDashboardSimuladorPedidoProps {
  temWidgets: boolean
  onboarding?: OnboardingBarraSimulador
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
  onAbrirSugestoes: () => void
  onCriarWidgetZero: () => void
  widgetsSeletor?: SeletorWidgetsProps
}

export function BarraFerramentasDashboardSimuladorPedido({
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
}: BarraFerramentasDashboardSimuladorPedidoProps) {
  const { t } = useTranslation()
  const mostrarOnboarding = !temWidgets && onboarding != null
  const temRodape = activeFilters.length > 0

  return (
    <div className="pedido-dashboard-menu" data-testid="dashboard-barra-menu-simulador">
      <div className="gtv-container pedido-dashboard-toolbar-card">
        <div className="gtv-toolbar pedido-dashboard-toolbar">
          <div className="gtv-toolbar-esquerda pedido-dashboard-toolbar__esquerda">
            {mostrarOnboarding && (
              <div className="pedido-dashboard-menu__onboarding-hint">
                <span className="pedido-dashboard-menu__onboarding-titulo">
                  {t('pedido.dashboard.onboarding_titulo', { defaultValue: 'Monte seu dashboard' })}
                </span>
                <span className="pedido-dashboard-menu__onboarding-texto">
                  {t('pedido.dashboard.onboarding_texto', { defaultValue: 'Adicione widgets com sugestões da GABI ou crie do zero.' })}
                </span>
              </div>
            )}

            <div className="pedido-dashboard-toolbar__icones">
              {mostrarOnboarding && (
                <span className="pedido-dashboard-menu__divisor" aria-hidden="true" />
              )}

              {temWidgets && (
                <>
                  <PeriodDropdown
                    value={slicers.period}
                    options={periodOptions}
                    onChange={onPeriodChange}
                    modoPainel="dropdown"
                    alinharPainel="esquerda"
                    renderGatilho={({ open, selectedLabel, onToggle }) => (
                      <ToolbarIconBtn
                        titulo={t('nucleo.dashboard.barra.periodo', { defaultValue: 'Período' })}
                        descricao={selectedLabel}
                        icone={<CalendarBlank {...IC} />}
                        ariaLabel={t('nucleo.dashboard.barra.periodo', { defaultValue: 'Período' })}
                        ariaHaspopup="listbox"
                        ariaExpanded={open}
                        data-testid="btn-periodo-dashboard"
                        onClick={onToggle}
                      />
                    )}
                  />
                  <StatusSeletorSimulador
                    statusOptions={statusOptions}
                    statusLabels={statusLabels}
                    statusActiveColors={statusActiveColors}
                    selectedStatus={slicers.status}
                    onStatusChange={onStatusChange}
                    statusCounts={statusCounts}
                  />
                </>
              )}

              <AdicionarWidgetSimulador
                onAbrirSugestoes={onAbrirSugestoes}
                onCriarWidgetZero={onCriarWidgetZero}
              />
            </div>

            {temWidgets && widgetsSeletor != null && (
              <SeletorWidgetsSimulador {...widgetsSeletor} />
            )}
          </div>

          <div className="gtv-toolbar-direita pedido-dashboard-toolbar__direita">
            {mostrarOnboarding && onboarding && (
              <div className="pedido-dashboard-menu__acoes-onboarding">
                <button
                  type="button"
                  className="gtv-btn pedido-dashboard-menu__btn pedido-dashboard-menu__btn--primario"
                  onClick={onboarding.onExplorarSugestoes}
                >
                  {t('pedido.dashboard.onboarding_explorar_sugestoes', { defaultValue: 'Explorar sugestões' })}
                </button>
                <button
                  type="button"
                  className="gtv-btn pedido-dashboard-menu__btn"
                  onClick={onboarding.onCriarDoZero}
                >
                  {t('pedido.dashboard.onboarding_criar_dashboard', { defaultValue: 'Criar do zero' })}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {temRodape && (
        <div className="pedido-dashboard-menu__rodape">
          <div className="pedido-dashboard-menu__filtros-ativos">
            <span className="pedido-dashboard-menu__label">
              {t('nucleo.dashboard.barra.filtros_ativos', { defaultValue: 'Filtros ativos' })}
            </span>
            {activeFilters.map(f => (
              <span key={`${f.field}-${f.sourceWidgetId}`} className="pedido-dashboard-menu__filtro-tag">
                {f.label}
              </span>
            ))}
            <button type="button" className="pedido-dashboard-menu__limpar-btn" onClick={onClearFilters}>
              <X size={12} /> {t('nucleo.dashboard.barra.limpar', { defaultValue: 'Limpar' })}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
