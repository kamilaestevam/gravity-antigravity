/**
 * Configuracoes.tsx — Configurações do Demo
 *
 * Categorias:
 *  ├── Cards  ← Período de comparação + DnD + toggle visibilidade + catálogo
 *  ├── Tabela      ← em breve
 *  ├── Notificações ← em breve
 *  └── Exportação  ← em breve
 */

import React, { useState } from 'react'
import {
  SquaresFour, Table, Bell, DownloadSimple,
  ArrowCounterClockwise, Eye, EyeSlash, Plus, X, DotsSixVertical,
  Hash, CheckCircle, ArrowsClockwise, SealCheck, CurrencyDollar, ChartBar,
  PencilSimple,
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
import {
  useCardPreferences, CARDS_CATALOGO,
  type CardPreferencia,
} from '../shared/useCardPreferences'
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

// ── Categorias da sidebar ─────────────────────────────────────────────────────

const CATEGORIAS = [
  { id: 'cards',        label: 'Cards',        icone: <SquaresFour    size={15} weight="duotone" />, ativo: true  },
  { id: 'tabela',       label: 'Tabela',       icone: <Table          size={15} weight="duotone" />, ativo: false },
  { id: 'notificacoes', label: 'Notificações', icone: <Bell           size={15} weight="duotone" />, ativo: false },
  { id: 'exportacao',   label: 'Exportação',   icone: <DownloadSimple size={15} weight="duotone" />, ativo: false },
] as const

type CategoriaId = (typeof CATEGORIAS)[number]['id']

// ── Item sortável (DnD) ───────────────────────────────────────────────────────

function CardSortavel({
  pref, onToggle, onRemover,
}: {
  pref:      CardPreferencia
  onToggle:  () => void
  onRemover: () => void
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

  const { prefs, disponiveis, adicionar, remover, toggle, reordenar, resetar } =
    useCardPreferences()

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

  return (
    <div className="cfg-page">

      {/* ── Sidebar ── */}
      <aside className="cfg-sidebar">
        <p className="cfg-sidebar__titulo">Configurações</p>
        <nav className="cfg-sidebar__nav">
          {CATEGORIAS.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={[
                'cfg-sidebar__item',
                categoria === cat.id ? 'cfg-sidebar__item--ativo' : '',
                !cat.ativo           ? 'cfg-sidebar__item--breve' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => { if (cat.ativo) setCategoria(cat.id) }}
            >
              <span className="cfg-sidebar__item-icon">{cat.icone}</span>
              <span className="cfg-sidebar__item-label">{cat.label}</span>
              {!cat.ativo && <span className="cfg-badge-breve">Em breve</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Conteúdo ── */}
      <main className="cfg-conteudo">
        {categoria === 'cards' && (
          <div className="cfg-cards-wrapper">

            {/* ── Período de comparação ── */}
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

            {/* ── Meus cards ── */}
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
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </section>

            {/* ── Colunas disponíveis ── */}
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
      </main>
    </div>
  )
}
