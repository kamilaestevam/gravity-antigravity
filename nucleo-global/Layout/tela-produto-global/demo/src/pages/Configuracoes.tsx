/**
 * Configuracoes.tsx — Configurações do Demo
 *
 * Hub central de configurações do produto.
 * Sidebar hierárquica: Cards | Kanban (Colunas · Card · Automações) | …
 */

import React, { useState } from 'react'
import {
  SquaresFour, Table, Bell, DownloadSimple,
  ArrowCounterClockwise, Eye, EyeSlash, Plus, X, DotsSixVertical,
  Hash, CheckCircle, ArrowsClockwise, SealCheck, CurrencyDollar, ChartBar,
  PencilSimple, Kanban as KanbanIcon, Lightning, Check,
  ChartLine, ChartDonut, NumberSquareOne, Funnel, ChartBarHorizontal,
} from '@phosphor-icons/react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { KanbanConfiguracoes } from '@nucleo/kanban-global'
import type { AbaConfig } from '@nucleo/kanban-global'
import {
  useCardPreferences, CARDS_CATALOGO,
  type CardPreferencia,
} from '../shared/useCardPreferences'
import {
  useKanbanConfig,
  CAMPOS_REGRA_DEFAULT,
} from '../shared/useKanbanConfig'
import {
  useDashboardConfig,
  DEFAULT_WIDGETS,
  type DemoWidget,
} from '../shared/useDashboardConfig'
import './Configuracoes.css'

// ── Período de comparação ─────────────────────────────────────────────────────

const PERIODOS = [
  { id: '7d',  label: '7 dias'  },
  { id: '30d', label: '30 dias' },
  { id: '6m',  label: '6 meses' },
  { id: '1a',  label: '1 ano'   },
  { id: 'all', label: 'Tudo'    },
] as const

type PeriodoId = (typeof PERIODOS)[number]['id']
const PERIODO_KEY = 'demo:periodo-comparacao'

// ── Mapa visual dos cards ─────────────────────────────────────────────────────

const CARD_VISUAL: Record<string, { icone: React.ReactNode; cor: string }> = {
  total:       { icone: <Hash            weight="duotone" size={18} />, cor: 'var(--ws-accent, #818cf8)' },
  ativos:      { icone: <CheckCircle     weight="duotone" size={18} />, cor: '#34d399' },
  andamento:   { icone: <ArrowsClockwise weight="duotone" size={18} />, cor: '#fbbf24' },
  concluidos:  { icone: <SealCheck       weight="duotone" size={18} />, cor: '#34d399' },
  valor_total: { icone: <CurrencyDollar  weight="duotone" size={18} />, cor: '#34d399' },
  media:       { icone: <ChartBar        weight="duotone" size={18} />, cor: '#f59e0b' },
}

// ── Mapeamento de origem → variante CSS ──────────────────────────────────────

function origemVariant(origem: string): string {
  if (origem === 'Item') return 'item'
  return 'meus'
}

// ── Mapa de tipos de gráfico ─────────────────────────────────────────────────

const CHART_TYPE_META: Record<string, { label: string; cor: string; icone: (s: number) => React.ReactNode }> = {
  LINE:           { label: 'Linha',      cor: '#818cf8', icone: (s) => <ChartLine          size={s} weight="duotone" /> },
  AREA:           { label: 'Área',       cor: '#6366f1', icone: (s) => <ChartLine          size={s} weight="fill"    /> },
  BAR:            { label: 'Barras',     cor: '#34d399', icone: (s) => <ChartBar           size={s} weight="duotone" /> },
  BAR_HORIZONTAL: { label: 'Barras H.', cor: '#34d399', icone: (s) => <ChartBarHorizontal size={s} weight="duotone" /> },
  DONUT:          { label: 'Donut',      cor: '#f59e0b', icone: (s) => <ChartDonut         size={s} weight="duotone" /> },
  KPI_CARD:       { label: 'KPI',        cor: '#60a5fa', icone: (s) => <NumberSquareOne    size={s} weight="duotone" /> },
  FUNNEL:         { label: 'Funil',      cor: '#fb923c', icone: (s) => <Funnel             size={s} weight="duotone" /> },
}

const CHART_TYPE_OPTIONS = Object.entries(CHART_TYPE_META).map(([type, meta]) => ({ type, ...meta }))

// ── Sidebar hierárquica ───────────────────────────────────────────────────────

type SidebarItemTipo =
  | { tipo: 'item'; id: string; label: string; icone: React.ReactNode; ativo: boolean }
  | { tipo: 'grupo'; label: string }
  | { tipo: 'sub';  id: string; label: string; icone: React.ReactNode; ativo: boolean }

const SIDEBAR_ITEMS: SidebarItemTipo[] = [
  { tipo: 'item', id: 'cards',             label: 'Cards',        icone: <SquaresFour size={15} weight="duotone" />, ativo: true  },
  { tipo: 'item', id: 'dashboard',         label: 'Dashboard',    icone: <ChartBar    size={15} weight="duotone" />, ativo: true  },
  { tipo: 'grupo', label: 'KANBAN' },
  { tipo: 'sub',  id: 'kanban-colunas',    label: 'Colunas',      icone: <KanbanIcon  size={15} weight="duotone" />, ativo: true  },
  { tipo: 'sub',  id: 'kanban-card',       label: 'Card',         icone: <SquaresFour size={15} weight="duotone" />, ativo: true  },
  { tipo: 'sub',  id: 'kanban-automacoes', label: 'Automações',   icone: <Lightning   size={15} weight="duotone" />, ativo: true  },
  { tipo: 'grupo', label: 'SISTEMA' },
  { tipo: 'item', id: 'tabela',            label: 'Tabela',       icone: <Table          size={15} weight="duotone" />, ativo: false },
  { tipo: 'item', id: 'notificacoes',      label: 'Notificações', icone: <Bell           size={15} weight="duotone" />, ativo: false },
  { tipo: 'item', id: 'exportacao',        label: 'Exportação',   icone: <DownloadSimple size={15} weight="duotone" />, ativo: false },
]

type CategoriaId = string

// Mapeia id de categoria para aba do KanbanConfiguracoes
const KANBAN_ABA_MAP: Record<string, AbaConfig> = {
  'kanban-colunas':    'colunas',
  'kanban-card':       'card',
  'kanban-automacoes': 'automacoes',
}

// ── Item sortável (DnD) ───────────────────────────────────────────────────────

const PERIODOS_CARD = [
  { id: '7d',  label: '7d'   },
  { id: '30d', label: '30d'  },
  { id: '6m',  label: '6m'   },
  { id: '1a',  label: '1 ano'},
  { id: 'all', label: 'Tudo' },
] as const

function CardSortavel({
  pref, onToggle, onRemover, onSetPeriodo,
}: {
  pref:          CardPreferencia
  onToggle:      () => void
  onRemover:     () => void
  onSetPeriodo:  (periodo: string | undefined) => void
}) {
  const def    = CARDS_CATALOGO.find(c => c.id === pref.id)!
  const visual = CARD_VISUAL[pref.id]
  const [expandido, setExpandido] = useState(false)

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: pref.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex:  isDragging ? 999 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`cfg-card-row${!pref.visible ? ' cfg-card-row--oculto' : ''}${expandido ? ' cfg-card-row--editing' : ''}`}>
        <button
          type="button"
          className="cfg-drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>

        <div className="cfg-card-row__info">
          <span className="cfg-card-row__icone" style={{ color: visual.cor }}>
            {visual.icone}
          </span>
          <div>
            <p className="cfg-card-row__nome">{def.label}</p>
            <p className="cfg-card-row__desc">{def.descricao}</p>
          </div>
        </div>

        <span className="cfg-origem-badge cfg-origem-badge--meus">{def.origem}</span>
        {pref.periodo && (
          <span className="cfg-periodo-card-badge">{pref.periodo}</span>
        )}

        <TooltipGlobal descricao="Ver variáveis do card">
          <button
            type="button"
            className={`cfg-eye-btn${expandido ? ' cfg-eye-btn--on' : ''}`}
            onClick={() => setExpandido(v => !v)}
            aria-label="Ver variáveis"
          >
            <PencilSimple size={14} weight="bold" />
          </button>
        </TooltipGlobal>

        <TooltipGlobal descricao={pref.visible ? 'Ocultar na tela' : 'Exibir na tela'}>
          <button
            type="button"
            className={`cfg-eye-btn${pref.visible ? ' cfg-eye-btn--on' : ''}`}
            onClick={onToggle}
            aria-label={pref.visible ? 'Ocultar card' : 'Exibir card'}
          >
            {pref.visible
              ? <Eye      size={15} weight="bold" />
              : <EyeSlash size={15} weight="bold" />
            }
          </button>
        </TooltipGlobal>

        <TooltipGlobal descricao="Remover da lista">
          <button
            type="button"
            className="cfg-remove-btn"
            onClick={onRemover}
            aria-label="Remover card"
          >
            <X size={13} weight="bold" />
          </button>
        </TooltipGlobal>
      </div>

      {expandido && (
        <div className="cfg-edit-panel">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="cfg-edit-panel__field">
              <label className="cfg-edit-panel__label">Campo (ID)</label>
              <div className="cfg-edit-panel__input" style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{def.id}</div>
            </div>
            <div className="cfg-edit-panel__field">
              <label className="cfg-edit-panel__label">Origem</label>
              <div className="cfg-edit-panel__input">{def.origem}</div>
            </div>
            <div className="cfg-edit-panel__field">
              <label className="cfg-edit-panel__label">Agregação</label>
              <div className="cfg-edit-panel__input">{def.tipoAgg}</div>
            </div>
            <div className="cfg-edit-panel__field">
              <label className="cfg-edit-panel__label">Visível</label>
              <div className="cfg-edit-panel__input">{pref.visible ? 'Sim' : 'Não'}</div>
            </div>
          </div>
          <div className="cfg-edit-panel__field" style={{ gridColumn: '1 / -1' }}>
            <label className="cfg-edit-panel__label">Período do card</label>
            <div className="cfg-periodo-pills cfg-periodo-pills--sm">
              <button
                type="button"
                className={`cfg-periodo-pill${!pref.periodo ? ' cfg-periodo-pill--ativo' : ''}`}
                onClick={() => onSetPeriodo(undefined)}
              >
                Global
              </button>
              {PERIODOS_CARD.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`cfg-periodo-pill${pref.periodo === p.id ? ' cfg-periodo-pill--ativo' : ''}`}
                  onClick={() => onSetPeriodo(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="cfg-edit-panel__actions">
            <button type="button" className="cfg-reset-btn" onClick={() => setExpandido(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Configuracoes() {
  const [categoria, setCategoria] = useState<CategoriaId>('cards')

  const [periodo, setPeriodo] = useState<PeriodoId>(
    () => (localStorage.getItem(PERIODO_KEY) as PeriodoId) ?? '30d'
  )

  function handlePeriodo(id: PeriodoId) {
    setPeriodo(id)
    localStorage.setItem(PERIODO_KEY, id)
  }

  const { prefs, disponiveis, adicionar, remover, toggle, reordenar, resetar, setPeriodo: setPeriodoCard } =
    useCardPreferences()

  const { config: kanbanConfig, salvar: salvarKanban } = useKanbanConfig()
  const { widgets, remover: removerWidget, atualizar: atualizarWidget, resetar: resetarWidgets } = useDashboardConfig()

  const [editandoWidgetId, setEditandoWidgetId] = useState<string | null>(null)
  const [editTitle,        setEditTitle]        = useState('')
  const [editChartType,    setEditChartType]    = useState('')

  function abrirEdicaoWidget(w: DemoWidget) {
    setEditTitle(w.title)
    setEditChartType(w.chart_type)
    setEditandoWidgetId(w.id)
  }

  function salvarEdicaoWidget() {
    if (!editandoWidgetId) return
    atualizarWidget(editandoWidgetId, { title: editTitle, chart_type: editChartType })
    setEditandoWidgetId(null)
  }

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = prefs.findIndex(p => p.id === active.id)
    const newIndex  = prefs.findIndex(p => p.id === over.id)
    reordenar(arrayMove(prefs, oldIndex, newIndex))
  }

  function handleSidebarClick(id: string, ativo: boolean) {
    if (ativo) setCategoria(id)
  }

  const kanbanAba = KANBAN_ABA_MAP[categoria]

  return (
    <div className="cfg-page">

      {/* ── Sidebar ── */}
      <aside className="cfg-sidebar">
        <p className="cfg-sidebar__titulo">Configurações</p>
        <nav className="cfg-sidebar__nav">
          {SIDEBAR_ITEMS.map((item, idx) => {
            if (item.tipo === 'grupo') {
              return (
                <span key={`grupo-${idx}`} className="cfg-sidebar__grupo">
                  {item.label}
                </span>
              )
            }

            const isAtivo = categoria === item.id
            const isSub   = item.tipo === 'sub'

            return (
              <button
                key={item.id}
                type="button"
                className={[
                  isSub ? 'cfg-sidebar__sub' : 'cfg-sidebar__item',
                  isAtivo      ? 'cfg-sidebar__item--ativo' : '',
                  !item.ativo  ? 'cfg-sidebar__item--breve' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleSidebarClick(item.id, item.ativo)}
              >
                <span className="cfg-sidebar__item-icon">{item.icone}</span>
                <span className="cfg-sidebar__item-label">{item.label}</span>
                {!item.ativo && <span className="cfg-badge-breve">Em breve</span>}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Conteúdo ── */}
      <main className="cfg-conteudo">

        {/* ── Cards ── */}
        {categoria === 'cards' && (
          <div className="cfg-cards-wrapper">

            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Período de comparação</h2>
                  <p className="cfg-secao__desc">
                    Define o intervalo usado nos badges de tendência dos cards
                  </p>
                </div>
              </div>
              <div className="cfg-periodo-pills">
                {PERIODOS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`cfg-periodo-pill${periodo === p.id ? ' cfg-periodo-pill--ativo' : ''}`}
                    onClick={() => handlePeriodo(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Meus cards</h2>
                  <p className="cfg-secao__desc">
                    Arraste para reordenar · olho para ocultar · × para remover
                  </p>
                </div>
                <TooltipGlobal descricao="Restaura os cards padrão">
                  <button type="button" className="cfg-reset-btn" onClick={resetar}>
                    <ArrowCounterClockwise size={13} weight="bold" />
                    Restaurar padrão
                  </button>
                </TooltipGlobal>
              </div>

              {prefs.length === 0 ? (
                <p className="cfg-empty">
                  Nenhum card adicionado. Escolha no catálogo abaixo.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={prefs.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="cfg-cards-lista">
                      {prefs.map(pref => (
                        <CardSortavel
                          key={pref.id}
                          pref={pref}
                          onToggle={() => toggle(pref.id)}
                          onRemover={() => remover(pref.id)}
                          onSetPeriodo={(p) => setPeriodoCard(pref.id, p)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </section>

            {disponiveis.length > 0 && (
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Colunas disponíveis</h2>
                    <p className="cfg-secao__desc">
                      Todas as métricas · clique em + para adicionar como card
                    </p>
                  </div>
                </div>

                <div className="cfg-tabela-head">
                  <span className="cfg-tabela-head__col cfg-tabela-head__col--nome">Coluna</span>
                  <span className="cfg-tabela-head__col cfg-tabela-head__col--origem">Origem</span>
                  <span className="cfg-tabela-head__col cfg-tabela-head__col--agg">Agregação</span>
                  <span className="cfg-tabela-head__col cfg-tabela-head__col--acao" />
                </div>

                <div className="cfg-cards-lista">
                  {disponiveis.map(def => {
                    const visual = CARD_VISUAL[def.id]
                    return (
                      <div key={def.id} className="cfg-card-row cfg-card-row--disponivel">
                        <span className="cfg-drag-handle cfg-drag-handle--ghost">
                          <DotsSixVertical size={16} weight="bold" />
                        </span>
                        <div className="cfg-card-row__info">
                          <span className="cfg-card-row__icone" style={{ color: visual.cor }}>
                            {visual.icone}
                          </span>
                          <div>
                            <p className="cfg-card-row__nome">{def.label}</p>
                            <p className="cfg-card-row__desc">{def.descricao}</p>
                          </div>
                        </div>
                        <span className={`cfg-origem-badge cfg-origem-badge--${origemVariant(def.origem)}`}>
                          {def.origem}
                        </span>
                        <span className="cfg-agg-badge">{def.tipoAgg}</span>
                        <TooltipGlobal descricao="Adicionar aos meus cards">
                          <button
                            type="button"
                            className="cfg-add-btn"
                            onClick={() => adicionar(def.id)}
                            aria-label="Adicionar card"
                          >
                            <Plus size={13} weight="bold" />
                          </button>
                        </TooltipGlobal>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

          </div>
        )}

        {/* ── Dashboard ── */}
        {categoria === 'dashboard' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Widgets do Dashboard</h2>
                  <p className="cfg-secao__desc">
                    Gerencie os widgets exibidos no Dashboard · × para remover
                  </p>
                </div>
                <button type="button" className="cfg-reset-btn" onClick={resetarWidgets}>
                  <ArrowCounterClockwise size={13} weight="bold" />
                  Restaurar padrão
                </button>
              </div>

              {widgets.length === 0 ? (
                <p className="cfg-empty">Nenhum widget. Restaure o padrão para recriar.</p>
              ) : (
                <div className="cfg-cards-lista">
                  {widgets.map(w => {
                    const meta     = CHART_TYPE_META[w.chart_type]
                    const isEditing = editandoWidgetId === w.id
                    return (
                      <div key={w.id}>
                        <div className={`cfg-card-row${isEditing ? ' cfg-card-row--editing' : ''}`}>
                          <span style={{ color: meta?.cor ?? 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            {meta?.icone(18) ?? <ChartBar size={18} />}
                          </span>

                          <div className="cfg-card-row__info">
                            <div>
                              <p className="cfg-card-row__nome">{w.title}</p>
                              <p className="cfg-card-row__desc">{meta?.label ?? w.chart_type} · {w.query_spec.fields.join(', ')}</p>
                            </div>
                          </div>

                          <span className="cfg-agg-badge">{w.query_spec.operation}</span>

                          <button
                            type="button"
                            className={`cfg-eye-btn${isEditing ? ' cfg-eye-btn--on' : ''}`}
                            onClick={() => isEditing ? setEditandoWidgetId(null) : abrirEdicaoWidget(w)}
                            aria-label="Editar widget"
                          >
                            <PencilSimple size={14} weight="bold" />
                          </button>

                          <button
                            type="button"
                            className="cfg-remove-btn"
                            onClick={() => removerWidget(w.id)}
                            aria-label="Remover widget"
                          >
                            <X size={13} weight="bold" />
                          </button>
                        </div>

                        {isEditing && (
                          <div className="cfg-edit-panel">
                            <div className="cfg-edit-panel__field">
                              <label className="cfg-edit-panel__label">Título</label>
                              <input
                                className="cfg-edit-panel__input"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                maxLength={80}
                                autoFocus
                              />
                            </div>

                            <div className="cfg-edit-panel__field">
                              <label className="cfg-edit-panel__label">Tipo de gráfico</label>
                              <div className="cfg-edit-panel__chart-grid">
                                {CHART_TYPE_OPTIONS.map(opt => (
                                  <button
                                    key={opt.type}
                                    type="button"
                                    className={`cfg-chart-opt${editChartType === opt.type ? ' cfg-chart-opt--ativo' : ''}`}
                                    onClick={() => setEditChartType(opt.type)}
                                  >
                                    <span style={{ color: opt.cor }}>{opt.icone(20)}</span>
                                    <span>{opt.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="cfg-edit-panel__actions">
                              <button type="button" className="cfg-reset-btn" onClick={() => setEditandoWidgetId(null)}>
                                Cancelar
                              </button>
                              <button type="button" className="cfg-save-btn" onClick={salvarEdicaoWidget}>
                                <Check size={13} weight="bold" /> Salvar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── Kanban (Colunas / Card / Automações) ── */}
        {kanbanAba && (
          <KanbanConfiguracoes
            colunas={kanbanConfig.colunas}
            camposCard={kanbanConfig.camposCard}
            regras={kanbanConfig.regras}
            camposRegra={CAMPOS_REGRA_DEFAULT}
            abaControlada={kanbanAba}
            onSalvar={salvarKanban}
            onChange={salvarKanban}
          />
        )}

      </main>
    </div>
  )
}
