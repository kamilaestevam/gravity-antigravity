import React, { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DotsSixVertical,
  Eye,
  Pencil,
  Plus,
  Trash,
  X,
  Check,
  ArrowCounterClockwise,
  Kanban,
  SquaresFour,
} from '@phosphor-icons/react'
import type { KanbanColunaDef } from './tipos'
import './kanban-configuracoes.css'

// ── Tipos públicos ─────────────────────────────────────────────────────────────

export interface CampoCardDef {
  key:        string
  label:      string
  descricao?: string
  icone?:     React.ReactNode
  visivel:    boolean
}

export interface KanbanConfigData {
  colunas:    KanbanColunaDef[]
  camposCard: CampoCardDef[]
}

export interface KanbanConfiguracoesProps {
  colunas:     KanbanColunaDef[]
  camposCard:  CampoCardDef[]
  onSalvar:    (config: KanbanConfigData) => void
  onCancelar?: () => void
}

// ── Cores predefinidas ─────────────────────────────────────────────────────────

const CORES_PRESET = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
  '#64748b', '#78716c',
]

// ── Sortable item — coluna ─────────────────────────────────────────────────────

interface ColunaSortItemProps {
  coluna:       KanbanColunaDef
  editando:     boolean
  onEdit:       () => void
  onCancelEdit: () => void
  onSave:       (dados: Partial<KanbanColunaDef>) => void
  onDelete:     () => void
}

function ColunaSortItem({
  coluna, editando, onEdit, onCancelEdit, onSave, onDelete,
}: ColunaSortItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: coluna.key })

  const style: React.CSSProperties = {
    transform:  CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  const [label,      setLabel]      = useState(coluna.label)
  const [color,      setColor]      = useState(coluna.color)
  const [wip,        setWip]        = useState<string | number>(coluna.limiteWip ?? '')
  const [colapsavel, setColapsavel] = useState(coluna.colapsavel ?? false)
  const [readOnly,   setReadOnly]   = useState(coluna.isReadOnly ?? false)
  const [showCores,  setShowCores]  = useState(false)
  const coresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editando) {
      setLabel(coluna.label)
      setColor(coluna.color)
      setWip(coluna.limiteWip ?? '')
      setColapsavel(coluna.colapsavel ?? false)
      setReadOnly(coluna.isReadOnly ?? false)
    }
  }, [editando]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showCores) return
    function handle(e: MouseEvent) {
      if (coresRef.current && !coresRef.current.contains(e.target as Node)) {
        setShowCores(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showCores])

  function handleSave() {
    onSave({
      label,
      color,
      limiteWip:  wip !== '' ? Number(wip) : undefined,
      colapsavel,
      isReadOnly: readOnly,
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'kc-col-item',
        isDragging ? 'kc-col-item--dragging' : '',
        editando   ? 'kc-col-item--editing'  : '',
      ].filter(Boolean).join(' ')}
    >
      {/* ── Linha principal ──────────────────────────────────────────────── */}
      <div className="kc-col-row">
        <button className="kc-drag-handle" {...attributes} {...listeners} title="Arrastar">
          <DotsSixVertical size={16} />
        </button>

        <span className="kc-col-cor-dot" style={{ background: coluna.color }} />

        <span className="kc-col-label-text">{coluna.label}</span>

        {coluna.limiteWip !== undefined && (
          <span className="kc-col-wip-badge">WIP {coluna.limiteWip}</span>
        )}

        {coluna.isReadOnly && (
          <span className="kc-col-tag">somente leitura</span>
        )}

        <div className="kc-col-row-actions">
          <button
            className="kc-icon-btn"
            onClick={editando ? onCancelEdit : onEdit}
            title={editando ? 'Cancelar' : 'Editar'}
          >
            {editando ? <X size={14} /> : <Pencil size={14} />}
          </button>
          <button
            className="kc-icon-btn kc-icon-btn--danger"
            onClick={onDelete}
            title="Remover coluna"
          >
            <Trash size={14} />
          </button>
        </div>
      </div>

      {/* ── Painel de edição inline ───────────────────────────────────────── */}
      {editando && (
        <div className="kc-col-edit-panel">
          <div className="kc-edit-field">
            <label className="kc-edit-label">Nome</label>
            <input
              className="kc-edit-input"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Nome da coluna"
              autoFocus
            />
          </div>

          <div className="kc-edit-field">
            <label className="kc-edit-label">Cor</label>
            <div className="kc-cor-wrap" ref={coresRef}>
              <button
                className="kc-cor-preview"
                style={{ background: color }}
                onClick={() => setShowCores(p => !p)}
                title="Escolher cor"
              />
              {showCores && (
                <div className="kc-cor-grid">
                  {CORES_PRESET.map(c => (
                    <button
                      key={c}
                      className={`kc-cor-swatch ${c === color ? 'kc-cor-swatch--ativa' : ''}`}
                      style={{ background: c }}
                      onClick={() => { setColor(c); setShowCores(false) }}
                    >
                      {c === color && <Check size={10} weight="bold" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="kc-edit-field">
            <label className="kc-edit-label">Limite WIP</label>
            <input
              className="kc-edit-input kc-edit-input--short"
              type="number"
              min={1}
              max={99}
              value={wip}
              onChange={e => setWip(e.target.value)}
              placeholder="—"
            />
          </div>

          <div className="kc-edit-toggles">
            <label className="kc-toggle-label">
              <input
                type="checkbox"
                checked={colapsavel}
                onChange={e => setColapsavel(e.target.checked)}
              />
              Colapsável
            </label>
            <label className="kc-toggle-label">
              <input
                type="checkbox"
                checked={readOnly}
                onChange={e => setReadOnly(e.target.checked)}
              />
              Somente leitura
            </label>
          </div>

          <div className="kc-edit-actions">
            <button className="kc-btn-secondary" onClick={onCancelEdit}>Cancelar</button>
            <button className="kc-btn-primary" onClick={handleSave}>
              <Check size={14} />
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sortable item — campo do card ──────────────────────────────────────────────

interface CampoSortItemProps {
  campo:    CampoCardDef
  onToggle: () => void
}

function CampoSortItem({ campo, onToggle }: CampoSortItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: campo.key })

  const style: React.CSSProperties = {
    transform:  CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kc-campo-item ${isDragging ? 'kc-campo-item--dragging' : ''}`}
    >
      <button className="kc-drag-handle" {...attributes} {...listeners} title="Arrastar">
        <DotsSixVertical size={16} />
      </button>

      {campo.icone && <span className="kc-campo-icone">{campo.icone}</span>}

      <div className="kc-campo-info">
        <span className="kc-campo-label">{campo.label}</span>
        {campo.descricao && <span className="kc-campo-desc">{campo.descricao}</span>}
      </div>

      <button
        className="kc-icon-btn kc-icon-btn--eye"
        onClick={onToggle}
        title="Ocultar campo"
      >
        <Eye size={15} />
      </button>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

type AbaConfig = 'colunas' | 'card'

export function KanbanConfiguracoes({
  colunas:    colunasIniciais,
  camposCard: camposIniciais,
  onSalvar,
  onCancelar,
}: KanbanConfiguracoesProps) {
  const [aba,         setAba]         = useState<AbaConfig>('colunas')
  const [colunas,     setColunas]     = useState<KanbanColunaDef[]>(colunasIniciais)
  const [campos,      setCampos]      = useState<CampoCardDef[]>(camposIniciais)
  const [editandoKey, setEditandoKey] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  )

  // ── Colunas ───────────────────────────────────────────────────────────────

  function handleDragEndColunas({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setColunas(prev => {
      const oldIdx = prev.findIndex(c => c.key === String(active.id))
      const newIdx = prev.findIndex(c => c.key === String(over.id))
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  function handleSaveColuna(key: string, dados: Partial<KanbanColunaDef>) {
    setColunas(prev => prev.map(c => c.key === key ? { ...c, ...dados } : c))
    setEditandoKey(null)
  }

  function handleDeleteColuna(key: string) {
    setColunas(prev => prev.filter(c => c.key !== key))
    if (editandoKey === key) setEditandoKey(null)
  }

  function handleNovaColuna() {
    const key  = `col-${Date.now()}`
    const nova: KanbanColunaDef = {
      key,
      label:      'Nova coluna',
      color:      CORES_PRESET[colunas.length % CORES_PRESET.length],
      colapsavel: true,
    }
    setColunas(prev => [...prev, nova])
    setEditandoKey(key)
  }

  // ── Card ──────────────────────────────────────────────────────────────────

  const camposVisiveis = campos.filter(c => c.visivel)
  const camposOcultos  = campos.filter(c => !c.visivel)

  function handleDragEndCampos({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setCampos(prev => {
      const visiveis   = prev.filter(c => c.visivel)
      const ocultos    = prev.filter(c => !c.visivel)
      const oldIdx = visiveis.findIndex(c => c.key === String(active.id))
      const newIdx = visiveis.findIndex(c => c.key === String(over.id))
      if (oldIdx === -1 || newIdx === -1) return prev
      return [...arrayMove(visiveis, oldIdx, newIdx), ...ocultos]
    })
  }

  function toggleCampo(key: string) {
    setCampos(prev => prev.map(c => c.key === key ? { ...c, visivel: !c.visivel } : c))
  }

  function restaurarPadrao() {
    setCampos(camposIniciais)
  }

  // ── Salvar ────────────────────────────────────────────────────────────────

  function handleSalvar() {
    onSalvar({ colunas, camposCard: campos })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="kc-shell">
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <div className="kc-sidebar">
        <span className="kc-sidebar-titulo">CONFIGURAÇÕES</span>

        <button
          className={`kc-menu-item ${aba === 'colunas' ? 'kc-menu-item--ativo' : ''}`}
          onClick={() => setAba('colunas')}
        >
          <Kanban size={15} weight="duotone" />
          Colunas
        </button>

        <button
          className={`kc-menu-item ${aba === 'card' ? 'kc-menu-item--ativo' : ''}`}
          onClick={() => setAba('card')}
        >
          <SquaresFour size={15} weight="duotone" />
          Card
        </button>
      </div>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="kc-main">

        {/* Aba: Colunas */}
        {aba === 'colunas' && (
          <div className="kc-section">
            <div className="kc-section-header">
              <div>
                <div className="kc-section-title">Colunas do Kanban</div>
                <div className="kc-section-desc">
                  Arraste para reordenar · lápis para editar · × para remover
                </div>
              </div>
            </div>

            <DndContext sensors={sensors} onDragEnd={handleDragEndColunas}>
              <SortableContext
                items={colunas.map(c => c.key)}
                strategy={verticalListSortingStrategy}
              >
                <div className="kc-list">
                  {colunas.map(col => (
                    <ColunaSortItem
                      key={col.key}
                      coluna={col}
                      editando={editandoKey === col.key}
                      onEdit={() => setEditandoKey(col.key)}
                      onCancelEdit={() => setEditandoKey(null)}
                      onSave={(dados) => handleSaveColuna(col.key, dados)}
                      onDelete={() => handleDeleteColuna(col.key)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button className="kc-add-btn" onClick={handleNovaColuna}>
              <Plus size={14} />
              Nova coluna
            </button>
          </div>
        )}

        {/* Aba: Card */}
        {aba === 'card' && (
          <div className="kc-section">
            <div className="kc-section-header">
              <div>
                <div className="kc-section-title">Campos do card</div>
                <div className="kc-section-desc">
                  Arraste para reordenar · olho para ocultar · + para restaurar
                </div>
              </div>
              <button className="kc-btn-ghost" onClick={restaurarPadrao}>
                <ArrowCounterClockwise size={14} />
                Restaurar padrão
              </button>
            </div>

            <DndContext sensors={sensors} onDragEnd={handleDragEndCampos}>
              <SortableContext
                items={camposVisiveis.map(c => c.key)}
                strategy={verticalListSortingStrategy}
              >
                <div className="kc-list">
                  {camposVisiveis.map(campo => (
                    <CampoSortItem
                      key={campo.key}
                      campo={campo}
                      onToggle={() => toggleCampo(campo.key)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {camposOcultos.length > 0 && (
              <div className="kc-campos-ocultos">
                <div className="kc-campos-ocultos-titulo">Campos disponíveis</div>
                <div className="kc-list">
                  {camposOcultos.map(campo => (
                    <div key={campo.key} className="kc-campo-oculto">
                      {campo.icone && (
                        <span className="kc-campo-icone kc-campo-icone--dim">{campo.icone}</span>
                      )}
                      <div className="kc-campo-info">
                        <span className="kc-campo-label">{campo.label}</span>
                        {campo.descricao && (
                          <span className="kc-campo-desc">{campo.descricao}</span>
                        )}
                      </div>
                      <button
                        className="kc-icon-btn kc-icon-btn--add"
                        onClick={() => toggleCampo(campo.key)}
                        title="Adicionar campo"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="kc-footer">
          {onCancelar && (
            <button className="kc-btn-secondary" onClick={onCancelar}>Cancelar</button>
          )}
          <button className="kc-btn-primary" onClick={handleSalvar}>
            <Check size={14} />
            Salvar configurações
          </button>
        </div>
      </div>
    </div>
  )
}
