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
  Lightning,
  ArrowRight,
} from '@phosphor-icons/react'
import type { KanbanColunaDef, CampoRegra, RegraKanban, OperadorRegra } from './tipos'
import { OPERADORES_POR_TIPO } from './regras'
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
  regras:     RegraKanban[]
}

export interface KanbanConfiguracoesProps {
  colunas:     KanbanColunaDef[]
  camposCard:  CampoCardDef[]
  /** Regras de automação salvas */
  regras:      RegraKanban[]
  /** Campos disponíveis para criar regras — definido pelo produto */
  camposRegra: CampoRegra[]
  onSalvar:    (config: KanbanConfigData) => void
  /** Chamado a cada mudança — permite sincronização em tempo real com o board */
  onChange?:   (config: KanbanConfigData) => void
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

  const [label,         setLabel]         = useState(coluna.label)
  const [color,         setColor]         = useState(coluna.color)
  const [wip,           setWip]           = useState<string | number>(coluna.limiteWip ?? '')
  const [colapsavel,    setColapsavel]    = useState(coluna.colapsavel ?? false)
  const [readOnly,      setReadOnly]      = useState(coluna.isReadOnly ?? false)
  const [showCores,     setShowCores]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
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
          {confirmDelete ? (
            <>
              <span className="kc-confirm-label">Remover?</span>
              <button
                className="kc-icon-btn"
                onClick={() => setConfirmDelete(false)}
                title="Cancelar remoção"
              >
                <X size={14} />
              </button>
              <button
                className="kc-icon-btn kc-icon-btn--danger"
                onClick={onDelete}
                title="Confirmar remoção"
              >
                <Check size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                className="kc-icon-btn"
                onClick={editando ? onCancelEdit : onEdit}
                title={editando ? 'Cancelar' : 'Editar'}
              >
                {editando ? <X size={14} /> : <Pencil size={14} />}
              </button>
              <button
                className="kc-icon-btn kc-icon-btn--danger"
                onClick={() => setConfirmDelete(true)}
                title="Remover coluna"
              >
                <Trash size={14} />
              </button>
            </>
          )}
        </div>
      </div>

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
            <label
              className="kc-edit-label"
              title="Máximo de cards simultâneos nesta coluna. Quando excedido, o badge fica vermelho."
            >
              Máx. cards (WIP)
            </label>
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
              <input type="checkbox" checked={colapsavel} onChange={e => setColapsavel(e.target.checked)} />
              Colapsável
            </label>
            <label className="kc-toggle-label">
              <input type="checkbox" checked={readOnly} onChange={e => setReadOnly(e.target.checked)} />
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
      <button className="kc-icon-btn kc-icon-btn--eye" onClick={onToggle} title="Ocultar campo">
        <Eye size={15} />
      </button>
    </div>
  )
}

// ── Sortable item — regra de automação ─────────────────────────────────────────

interface RegraItemProps {
  regra:       RegraKanban
  colunas:     KanbanColunaDef[]
  camposRegra: CampoRegra[]
  onChange:    (updated: RegraKanban) => void
  onDelete:    () => void
}

function RegraItem({ regra, colunas, camposRegra, onChange, onDelete }: RegraItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: regra.id })

  const style: React.CSSProperties = {
    transform:  CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  const campo       = camposRegra.find(c => c.key === regra.campoKey)
  const operadores  = campo ? OPERADORES_POR_TIPO[campo.tipo] : []
  const precisaValor = regra.operador && !['preenchido', 'vazio'].includes(regra.operador)
  const temOpcoes   = campo?.tipo === 'selecao' && (campo.opcoes?.length ?? 0) > 0

  function update(patch: Partial<RegraKanban>) {
    onChange({ ...regra, ...patch })
  }

  function handleCampoChange(key: string) {
    const novoCampo       = camposRegra.find(c => c.key === key)
    const primeiroOp      = novoCampo ? OPERADORES_POR_TIPO[novoCampo.tipo][0]?.value : 'igual'
    update({ campoKey: key, operador: primeiroOp ?? 'igual', valor: undefined })
  }

  function handleOperadorChange(op: OperadorRegra) {
    const semValor = ['preenchido', 'vazio'].includes(op)
    update({ operador: op, valor: semValor ? undefined : regra.valor })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'kc-regra-item',
        isDragging        ? 'kc-regra-item--dragging' : '',
        !regra.ativo      ? 'kc-regra-item--inativa'  : '',
      ].filter(Boolean).join(' ')}
    >
      {/* Drag */}
      <button
        className="kc-drag-handle"
        {...attributes}
        {...listeners}
        title="Arrastar para reordenar prioridade"
      >
        <DotsSixVertical size={16} />
      </button>

      {/* Toggle ativo */}
      <label className="kc-regra-toggle" title={regra.ativo ? 'Desativar' : 'Ativar'}>
        <input
          type="checkbox"
          checked={regra.ativo}
          onChange={e => update({ ativo: e.target.checked })}
        />
        <span className="kc-regra-toggle-track" />
      </label>

      {/* Se */}
      <span className="kc-regra-rotulo">Se</span>

      {/* Campo */}
      <select
        className="kc-regra-select"
        value={regra.campoKey}
        onChange={e => handleCampoChange(e.target.value)}
      >
        <option value="">— campo —</option>
        {camposRegra.map(c => (
          <option key={c.key} value={c.key}>{c.label}</option>
        ))}
      </select>

      {/* Operador */}
      <select
        className="kc-regra-select kc-regra-select--op"
        value={regra.operador}
        onChange={e => handleOperadorChange(e.target.value as OperadorRegra)}
        disabled={!campo}
      >
        {operadores.length === 0 && (
          <option value="">— operador —</option>
        )}
        {operadores.map(op => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {/* Valor */}
      {precisaValor && (
        temOpcoes ? (
          <select
            className="kc-regra-select kc-regra-select--valor"
            value={regra.valor ?? ''}
            onChange={e => update({ valor: e.target.value })}
          >
            <option value="">— selecione —</option>
            {campo!.opcoes!.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        ) : (
          <input
            className="kc-regra-input"
            type={
              campo?.tipo === 'numero' ? 'number' :
              campo?.tipo === 'data'   ? 'date'   : 'text'
            }
            value={regra.valor ?? ''}
            onChange={e => update({ valor: e.target.value || undefined })}
            placeholder="valor"
          />
        )
      )}

      {/* Seta + mover para */}
      <span className="kc-regra-arrow"><ArrowRight size={13} /></span>
      <span className="kc-regra-rotulo">mover para</span>

      {/* Coluna destino */}
      <select
        className="kc-regra-select kc-regra-select--coluna"
        value={regra.colunaDestino}
        onChange={e => update({ colunaDestino: e.target.value })}
      >
        <option value="">— coluna —</option>
        {colunas.map(c => (
          <option key={c.key} value={c.key}>{c.label}</option>
        ))}
      </select>

      {/* Delete */}
      <button className="kc-icon-btn kc-icon-btn--danger" onClick={onDelete} title="Remover regra">
        <Trash size={14} />
      </button>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

type AbaConfig = 'colunas' | 'card' | 'automacoes'

export function KanbanConfiguracoes({
  colunas:     colunasIniciais,
  camposCard:  camposIniciais,
  regras:      regrasIniciais,
  camposRegra,
  onSalvar,
  onChange,
  onCancelar,
}: KanbanConfiguracoesProps) {
  const MAX_COLUNAS = 8
  const MAX_REGRAS  = 20

  const [aba,         setAba]         = useState<AbaConfig>('colunas')
  const [colunas,     setColunas]     = useState<KanbanColunaDef[]>(colunasIniciais)
  const [campos,      setCampos]      = useState<CampoCardDef[]>(camposIniciais)
  const [regras,      setRegras]      = useState<RegraKanban[]>(regrasIniciais)
  const [editandoKey, setEditandoKey] = useState<string | null>(null)

  // Notifica o pai a cada mudança para sincronização em tempo real com o board
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  useEffect(() => {
    onChangeRef.current?.({ colunas, camposCard: campos, regras })
  }, [colunas, campos, regras])

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
    if (colunas.length >= MAX_COLUNAS) return
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
      const visiveis = prev.filter(c => c.visivel)
      const ocultos  = prev.filter(c => !c.visivel)
      const oldIdx   = visiveis.findIndex(c => c.key === String(active.id))
      const newIdx   = visiveis.findIndex(c => c.key === String(over.id))
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

  // ── Automações ────────────────────────────────────────────────────────────

  function handleDragEndRegras({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setRegras(prev => {
      const oldIdx = prev.findIndex(r => r.id === String(active.id))
      const newIdx = prev.findIndex(r => r.id === String(over.id))
      return arrayMove(prev, oldIdx, newIdx).map((r, i) => ({ ...r, prioridade: i }))
    })
  }

  function handleNovaRegra() {
    if (regras.length >= MAX_REGRAS || camposRegra.length === 0) return
    const primeiroCampo  = camposRegra[0]
    const primeiroOp     = OPERADORES_POR_TIPO[primeiroCampo.tipo][0]?.value ?? 'igual'
    const primeiraColuna = colunas[0]?.key ?? ''
    const nova: RegraKanban = {
      id:            `regra-${Date.now()}`,
      ativo:         true,
      campoKey:      primeiroCampo.key,
      operador:      primeiroOp,
      valor:         undefined,
      colunaDestino: primeiraColuna,
      prioridade:    regras.length,
    }
    setRegras(prev => [...prev, nova])
  }

  function handleUpdateRegra(updated: RegraKanban) {
    setRegras(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  function handleDeleteRegra(id: string) {
    setRegras(prev =>
      prev.filter(r => r.id !== id).map((r, i) => ({ ...r, prioridade: i })),
    )
  }

  // ── Salvar ────────────────────────────────────────────────────────────────

  function handleSalvar() {
    onSalvar({ colunas, camposCard: campos, regras })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const regrasAtivas = regras.filter(r => r.ativo).length

  return (
    <div className="kc-shell">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
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

        <button
          className={`kc-menu-item ${aba === 'automacoes' ? 'kc-menu-item--ativo' : ''}`}
          onClick={() => setAba('automacoes')}
        >
          <Lightning size={15} weight="duotone" />
          Automações
          {regrasAtivas > 0 && (
            <span className="kc-menu-badge">{regrasAtivas}</span>
          )}
        </button>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
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
              <span className={`kc-col-contador ${colunas.length >= MAX_COLUNAS ? 'kc-col-contador--cheio' : ''}`}>
                {colunas.length}/{MAX_COLUNAS}
              </span>
            </div>

            <DndContext sensors={sensors} onDragEnd={handleDragEndColunas}>
              <SortableContext items={colunas.map(c => c.key)} strategy={verticalListSortingStrategy}>
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

            <button
              className="kc-add-btn"
              onClick={handleNovaColuna}
              disabled={colunas.length >= MAX_COLUNAS}
              title={colunas.length >= MAX_COLUNAS ? `Limite de ${MAX_COLUNAS} colunas atingido` : undefined}
            >
              <Plus size={14} />
              {colunas.length >= MAX_COLUNAS ? `Limite de ${MAX_COLUNAS} colunas atingido` : 'Nova coluna'}
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
              <SortableContext items={camposVisiveis.map(c => c.key)} strategy={verticalListSortingStrategy}>
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

        {/* Aba: Automações */}
        {aba === 'automacoes' && (
          <div className="kc-section">
            <div className="kc-section-header">
              <div>
                <div className="kc-section-title">Automações</div>
                <div className="kc-section-desc">
                  Arraste para definir prioridade · regras avaliadas ao salvar o card
                </div>
              </div>
              {regras.length > 0 && (
                <span className={`kc-col-contador ${regras.length >= MAX_REGRAS ? 'kc-col-contador--cheio' : ''}`}>
                  {regras.length}/{MAX_REGRAS}
                </span>
              )}
            </div>

            {regras.length === 0 ? (
              <div className="kc-regras-empty">
                <Lightning size={28} weight="duotone" />
                <span className="kc-regras-empty-titulo">Nenhuma automação configurada</span>
                <span className="kc-regras-empty-desc">
                  Crie regras para mover cards automaticamente quando um campo mudar
                </span>
              </div>
            ) : (
              <DndContext sensors={sensors} onDragEnd={handleDragEndRegras}>
                <SortableContext items={regras.map(r => r.id)} strategy={verticalListSortingStrategy}>
                  <div className="kc-list kc-list--regras">
                    {regras.map(regra => (
                      <RegraItem
                        key={regra.id}
                        regra={regra}
                        colunas={colunas}
                        camposRegra={camposRegra}
                        onChange={handleUpdateRegra}
                        onDelete={() => handleDeleteRegra(regra.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <button
              className="kc-add-btn"
              onClick={handleNovaRegra}
              disabled={regras.length >= MAX_REGRAS || camposRegra.length === 0}
              title={
                camposRegra.length === 0
                  ? 'Passe a prop camposRegra para habilitar automações'
                  : regras.length >= MAX_REGRAS
                  ? `Limite de ${MAX_REGRAS} regras atingido`
                  : undefined
              }
            >
              <Plus size={14} />
              {regras.length >= MAX_REGRAS
                ? `Limite de ${MAX_REGRAS} regras atingido`
                : 'Nova automação'}
            </button>

            {camposRegra.length === 0 && (
              <div className="kc-regras-aviso">
                Para criar automações, passe a prop <code>camposRegra</code> com os campos
                disponíveis no produto.
              </div>
            )}
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
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
