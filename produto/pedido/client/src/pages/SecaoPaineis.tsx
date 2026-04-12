/**
 * SecaoPaineis.tsx — Sub-seção "Painéis" de Configurações > Dashboard
 *
 * Segue o padrão: Preview → Ativos (drag + eye + X) → Disponíveis (ocultos + criar) → Footer.
 * Props controladas pelo componente pai (Configuracoes.tsx).
 */

import React, { useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DotsSixVertical, Eye, EyeSlash, Plus, X, SquaresFour,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { CfgSectionLabel } from '@nucleo/cabecalho-secao-global'
import type { DashboardPainel } from '../shared/api'

// ── Props ─────────────────────────────────────────────────────────────────────

interface SecaoPaineisProps {
  paineis:     DashboardPainel[]
  loading:     boolean
  dirty:       boolean
  onReordenar: (ids: string[]) => void
  onToggleVisivel: (id: string) => void
  onRenomear:  (id: string, nome: string) => void
  onDeletar:   (id: string) => void
  onCriar:     (nome: string) => void
  onSalvar:    () => void
  onDescartar: () => void
}

// ── Item sortável ─────────────────────────────────────────────────────────────

function PainelSortavel({
  painel,
  unico,
  onToggleVisivel,
  onRenomear,
  onDeletar,
}: {
  painel: DashboardPainel
  unico:  boolean
  onToggleVisivel: () => void
  onRenomear: (nome: string) => void
  onDeletar: () => void
}) {
  const [editando, setEditando] = useState(false)
  const [nomeEdit, setNomeEdit] = useState(painel.nome)

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: painel.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex:  isDragging ? 999 : undefined,
  }

  function confirmarRenomear() {
    const nome = nomeEdit.trim()
    if (nome && nome !== painel.nome) onRenomear(nome)
    setEditando(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="cfg-kanban-campo-row">
      <button
        type="button"
        className="cfg-drag-handle"
        {...attributes}
        {...listeners}
        aria-label="Arrastar"
      >
        <DotsSixVertical size={14} weight="bold" />
      </button>

      {editando ? (
        <input
          autoFocus
          className="cfg-painel-nome-input"
          value={nomeEdit}
          maxLength={60}
          onChange={e => setNomeEdit(e.target.value)}
          onBlur={confirmarRenomear}
          onKeyDown={e => {
            if (e.key === 'Enter') confirmarRenomear()
            if (e.key === 'Escape') { setNomeEdit(painel.nome); setEditando(false) }
          }}
        />
      ) : (
        <button
          type="button"
          className="cfg-kanban-campo-row__nome cfg-painel-nome-btn"
          onClick={() => { setNomeEdit(painel.nome); setEditando(true) }}
          title="Clique para renomear"
        >
          {painel.nome}
        </button>
      )}

      <TooltipGlobal descricao={painel.is_visivel ? 'Ocultar painel' : 'Exibir painel'}>
        <button
          type="button"
          className={`cfg-eye-btn${painel.is_visivel ? ' cfg-eye-btn--on' : ''}`}
          onClick={onToggleVisivel}
          aria-label={painel.is_visivel ? 'Ocultar painel' : 'Exibir painel'}
        >
          {painel.is_visivel
            ? <Eye size={14} weight="bold" />
            : <EyeSlash size={14} weight="bold" />}
        </button>
      </TooltipGlobal>

      <TooltipGlobal descricao={unico ? 'Não é possível excluir o único painel' : 'Excluir painel'}>
        <button
          type="button"
          className="cfg-remove-btn"
          onClick={unico ? undefined : onDeletar}
          disabled={unico}
          aria-label="Excluir painel"
          style={{ opacity: unico ? 0.3 : 1, cursor: unico ? 'not-allowed' : 'pointer' }}
        >
          <X size={12} weight="bold" />
        </button>
      </TooltipGlobal>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function SecaoPaineis({
  paineis,
  loading,
  dirty,
  onReordenar,
  onToggleVisivel,
  onRenomear,
  onDeletar,
  onCriar,
  onSalvar,
  onDescartar,
}: SecaoPaineisProps) {
  const [novoNome, setNovoNome] = useState('')
  const [criando, setCriando]   = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

  const ativos      = paineis.filter(p =>  p.is_visivel)
  const disponiveis = paineis.filter(p => !p.is_visivel)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = paineis.findIndex(p => p.id === active.id)
    const newIndex = paineis.findIndex(p => p.id === over.id)
    const reordenado = arrayMove(paineis, oldIndex, newIndex)
    onReordenar(reordenado.map(p => p.id))
  }

  function handleCriar(e: React.FormEvent) {
    e.preventDefault()
    const nome = novoNome.trim()
    if (!nome) return
    onCriar(nome)
    setNovoNome('')
    setCriando(false)
  }

  return (
    <section className="cfg-secao">
      <div className="cfg-secao__header">
        <div>
          <h2 className="cfg-secao__titulo">Painéis do Dashboard</h2>
          <p className="cfg-secao__desc">
            Crie múltiplos painéis com widgets independentes. Arraste para reordenar,
            clique no nome para renomear, olho para ocultar.
          </p>
        </div>
      </div>

      {loading && <p className="cfg-loading-msg">Carregando...</p>}

      {!loading && paineis.length === 0 && (
        <p className="cfg-hint" style={{ textAlign: 'center', padding: '2rem 0' }}>
          Nenhum painel criado ainda
        </p>
      )}

      {!loading && paineis.length > 0 && (
        <>
          {/* ── Preview ── */}
          <div className="cfg-cards-preview-wrap">
            <p className="cfg-cards-preview-label">
              <SquaresFour size={12} weight="fill" />
              Preview — painéis visíveis no Dashboard
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', padding: '0.5rem 0' }}>
              {ativos.length === 0 && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Nenhum painel visível
                </p>
              )}
              {ativos.map((p, i) => (
                <span
                  key={p.id}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: i === 0 ? 600 : 400,
                    background: i === 0 ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${i === 0 ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.12)'}`,
                    color: i === 0 ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {p.nome}
                </span>
              ))}
            </div>
          </div>

          {/* ── Ativos ── */}
          <CfgSectionLabel label="ATIVOS" count={`${paineis.length} painel${paineis.length !== 1 ? 'éis' : ''}`} />
          <p className="cfg-hint">Clique no nome para renomear · olho para ocultar</p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paineis.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="cfg-kanban-campos-lista">
                {paineis.map(p => (
                  <PainelSortavel
                    key={p.id}
                    painel={p}
                    unico={paineis.length === 1}
                    onToggleVisivel={() => onToggleVisivel(p.id)}
                    onRenomear={(nome) => onRenomear(p.id, nome)}
                    onDeletar={() => onDeletar(p.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* ── Disponíveis (ocultos) + Criar ── */}
          <CfgSectionLabel
            label="OCULTOS / CRIAR NOVO"
            hint="painéis não exibidos no dashboard"
            style={{ marginTop: '1.5rem' }}
          />

          <div className="cfg-kanban-disponivel-lista">
            {disponiveis.map(p => (
              <div key={p.id} className="cfg-kanban-disponivel-row">
                <span className="cfg-kanban-disponivel-info">
                  <span className="cfg-kanban-disponivel-label">{p.nome}</span>
                </span>
                <TooltipGlobal descricao="Exibir painel no Dashboard">
                  <button
                    type="button"
                    className="cfg-kanban-add-btn"
                    onClick={() => onToggleVisivel(p.id)}
                    aria-label="Exibir painel"
                  >
                    <Plus size={13} weight="bold" />
                  </button>
                </TooltipGlobal>
              </div>
            ))}

            {/* Criar novo painel */}
            {criando ? (
              <form className="cfg-kanban-disponivel-row" onSubmit={handleCriar} style={{ gap: '0.5rem' }}>
                <input
                  autoFocus
                  className="cfg-painel-nome-input"
                  placeholder="Nome do novo painel"
                  value={novoNome}
                  maxLength={60}
                  onChange={e => setNovoNome(e.target.value)}
                />
                <button type="submit" className="cfg-kanban-add-btn" aria-label="Confirmar">
                  <Plus size={13} weight="bold" />
                </button>
                <button
                  type="button"
                  className="cfg-remove-btn"
                  onClick={() => { setCriando(false); setNovoNome('') }}
                  aria-label="Cancelar"
                >
                  <X size={12} weight="bold" />
                </button>
              </form>
            ) : (
              <div className="cfg-kanban-disponivel-row cfg-kanban-disponivel-row--criar">
                <button
                  type="button"
                  className="cfg-kanban-disponivel-row__criar-btn"
                  onClick={() => setCriando(true)}
                >
                  <Plus size={12} weight="bold" />
                  Criar novo painel
                </button>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="cfg-campo-calc-item__footer">
            <BotaoCancelar onClick={onDescartar} dirty={dirty} />
            <BotaoSalvar   onClick={onSalvar}    dirty={dirty} />
          </div>
        </>
      )}
    </section>
  )
}
