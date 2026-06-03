/**
 * PedidosListaPainelBar — abas de painéis da Lista (espelho do Dashboard).
 */
import React, { useCallback, useRef, useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, horizontalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'
import { DotsThree, PencilSimple, Trash, X } from '@phosphor-icons/react'
import { paineisListaApi, type ListaPainel } from '../shared/api'
import '../pages/PedidosDashboard.css'

const sty = {
  painelBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    margin: '0 0 0.75rem',
    padding: 0,
    flexWrap: 'wrap' as const,
  },
  painelTab: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '6px',
    padding: '0.3rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
  },
  painelTabAtivo: {
    background: 'rgba(139,92,246,0.18)',
    border: '1px solid rgba(139,92,246,0.5)',
    borderRadius: '6px',
    padding: '0.3rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#c4b5fd',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
  },
  painelAddBtn: {
    background: 'none',
    border: '1px dashed rgba(255,255,255,0.2)',
    borderRadius: '6px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.35)',
    cursor: 'pointer',
    lineHeight: 1,
  },
  painelNovoForm: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  painelNovoInput: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(139,92,246,0.5)',
    borderRadius: '6px',
    padding: '0.28rem 0.5rem',
    fontSize: '0.75rem',
    color: '#fff',
    outline: 'none',
    width: '140px',
  },
  painelNovoBtnOk: {
    background: 'rgba(139,92,246,0.7)',
    border: 'none',
    borderRadius: '6px',
    padding: '0.28rem 0.6rem',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
  },
  painelNovoBtnCancel: {
    background: 'none',
    border: 'none',
    padding: '0.28rem 0.4rem',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
  },
  painelTabWrap: { position: 'relative' as const, display: 'inline-flex' },
  painelTabInner: { display: 'inline-flex', alignItems: 'center', gap: '0.2rem' },
  painelMenuBtn: { display: 'inline-flex', opacity: 0.6, cursor: 'pointer' },
  painelMenuDropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    marginTop: '4px',
    background: 'var(--surface-elevated, #1e1e2e)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '0.25rem 0',
    zIndex: 200,
    minWidth: '140px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  painelMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    width: '100%',
    padding: '0.4rem 0.75rem',
    background: 'none',
    border: 'none',
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  painelMenuItemDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    width: '100%',
    padding: '0.4rem 0.75rem',
    background: 'none',
    border: 'none',
    fontSize: '0.72rem',
    color: '#f87171',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  painelRenameInput: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(139,92,246,0.5)',
    borderRadius: '6px',
    padding: '0.28rem 0.5rem',
    fontSize: '0.75rem',
    color: '#fff',
    outline: 'none',
    width: '120px',
  },
}

function SortableTabWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        ...sty.painelTabWrap,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}

export interface PedidosListaPainelBarProps {
  paineis: ListaPainel[]
  painelAtualId: string | null
  setPaineis: (paineis: ListaPainel[]) => void
  setPainelAtualId: (id: string) => void
  onTrocarPainel: (id: string) => void
  /** Cria painel (API + estado); retorna false se falhar — exibe notificação no pai */
  onCriarPainel: (nome: string) => Promise<boolean>
  carregando?: boolean
}

export function PedidosListaPainelBar({
  paineis,
  painelAtualId,
  setPaineis,
  setPainelAtualId,
  onTrocarPainel,
  onCriarPainel,
  carregando,
}: PedidosListaPainelBarProps) {
  const { t } = useTranslation()
  const [criandoPainel, setCriandoPainel] = useState(false)
  const [salvandoPainel, setSalvandoPainel] = useState(false)
  const [novoNomePainel, setNovoNomePainel] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [menuPainelId, setMenuPainelId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const renameInFlightRef = useRef<string | null>(null)

  const painelSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const submitNovoPainel = useCallback(async () => {
    const nome = novoNomePainel.trim()
    if (!nome || salvandoPainel) return
    setSalvandoPainel(true)
    try {
      const ok = await onCriarPainel(nome)
      if (ok) {
        setNovoNomePainel('')
        setCriandoPainel(false)
      }
    } finally {
      setSalvandoPainel(false)
    }
  }, [novoNomePainel, salvandoPainel, onCriarPainel])

  const handleRenomearPainel = useCallback((id: string, nome: string) => {
    if (renameInFlightRef.current === id) return
    renameInFlightRef.current = id
    setRenamingId(null)
    const trimmed = nome.trim()
    if (!trimmed) {
      renameInFlightRef.current = null
      return
    }
    paineisListaApi.atualizar(id, { nome: trimmed })
      .then(() => setPaineis(paineis.map(p => p.id === id ? { ...p, nome: trimmed } : p)))
      .catch(() => {})
      .finally(() => { renameInFlightRef.current = null })
  }, [paineis, setPaineis])

  const handleDeletarPainel = useCallback((id: string) => {
    if (paineis.length <= 1) return
    paineisListaApi.deletar(id)
      .then(() => {
        const atualizados = paineis.filter(p => p.id !== id)
        setPaineis(atualizados)
        if (painelAtualId === id) {
          const proximo = atualizados.find(p => p.is_visivel) ?? atualizados[0]
          if (proximo) {
            setPainelAtualId(proximo.id)
            onTrocarPainel(proximo.id)
          }
        }
      })
      .catch(() => {})
    setMenuPainelId(null)
    setDeletingId(null)
  }, [paineis, painelAtualId, setPaineis, setPainelAtualId, onTrocarPainel])

  const handlePainelDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = paineis.findIndex(p => p.id === active.id)
    const newIndex = paineis.findIndex(p => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(paineis, oldIndex, newIndex)
    setPaineis(reordered)
    paineisListaApi.reordenar(reordered.map(p => p.id)).catch(() => {})
  }, [paineis, setPaineis])

  const paineisVisiveis = paineis.filter(p => p.is_visivel)

  return (
    <div className="lp-paineis-lista-strip" data-testid="lista-painel-bar">
      <span className="lp-paineis-lista-strip__label">
        {t('pedido.lista.paineis_secao', { defaultValue: 'Painéis da lista' })}
      </span>
      <div style={sty.painelBar} className="pedido-dashboard-painel-bar">
      {carregando ? (
        <span className="lp-paineis-lista-strip__vazio" role="status">
          {t('pedido.lista.paineis_carregando', { defaultValue: 'Carregando painéis…' })}
        </span>
      ) : paineisVisiveis.length === 0 ? (
        <span className="lp-paineis-lista-strip__vazio">
          {paineis.length === 0
            ? t('pedido.lista.paineis_vazio', {
                defaultValue: 'Nenhum painel ainda. Crie em + Novo → Novo painel ou no botão + ao lado.',
              })
            : t('pedido.lista.paineis_todos_ocultos', {
                defaultValue: 'Todos os painéis estão ocultos. Reative em opções do painel.',
              })}
        </span>
      ) : (
      <DndContext sensors={painelSensors} collisionDetection={closestCenter} onDragEnd={handlePainelDragEnd}>
        <SortableContext
          items={paineis.filter(p => p.is_visivel).map(p => p.id)}
          strategy={horizontalListSortingStrategy}
        >
          {paineis.filter(p => p.is_visivel).map(p => (
            <SortableTabWrapper key={p.id} id={p.id}>
              {renamingId === p.id ? (
                <form
                  style={sty.painelNovoForm}
                  onSubmit={e => { e.preventDefault(); handleRenomearPainel(p.id, renameValue) }}
                  onPointerDown={e => e.stopPropagation()}
                >
                  <input
                    autoFocus
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => handleRenomearPainel(p.id, renameValue)}
                    style={sty.painelRenameInput}
                    maxLength={60}
                  />
                </form>
              ) : (
                <button
                  type="button"
                  data-testid={`lista-painel-tab-${p.id}`}
                  style={p.id === painelAtualId ? sty.painelTabAtivo : sty.painelTab}
                  onClick={() => onTrocarPainel(p.id)}
                  onDoubleClick={() => { setRenamingId(p.id); setRenameValue(p.nome) }}
                  onPointerDown={e => e.stopPropagation()}
                >
                  <span style={sty.painelTabInner}>
                    {p.nome}
                    <span
                      role="button"
                      aria-label={t('pedido.lista.painel_opcoes', { defaultValue: 'Opções do painel' })}
                      style={sty.painelMenuBtn}
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => {
                        e.stopPropagation()
                        setMenuPainelId(prev => prev === p.id ? null : p.id)
                        setDeletingId(null)
                      }}
                    >
                      <DotsThree size={14} weight="bold" />
                    </span>
                  </span>
                </button>
              )}
              {menuPainelId === p.id && (
                <div
                  style={sty.painelMenuDropdown}
                  onClick={e => e.stopPropagation()}
                  onPointerDown={e => e.stopPropagation()}
                >
                  {deletingId === p.id ? (
                    <div style={{ padding: '0.5rem 0.75rem' }}>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 0.5rem' }}>
                        {t('pedido.lista.painel_excluir_confirmar', { defaultValue: 'Excluir painel?' })}
                        {' '}<strong style={{ color: '#fff' }}>{p.nome}</strong>
                      </p>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button type="button" style={sty.painelNovoBtnOk} onClick={() => handleDeletarPainel(p.id)}>
                          {t('comum.confirmar', { defaultValue: 'Confirmar' })}
                        </button>
                        <button type="button" style={sty.painelNovoBtnCancel} onClick={() => setDeletingId(null)}>
                          {t('comum.cancelar', { defaultValue: 'Cancelar' })}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        style={sty.painelMenuItem}
                        onClick={() => {
                          setRenamingId(p.id)
                          setRenameValue(p.nome)
                          setMenuPainelId(null)
                        }}
                      >
                        <PencilSimple size={13} />
                        {t('pedido.lista.painel_renomear', { defaultValue: 'Renomear' })}
                      </button>
                      <button
                        type="button"
                        style={paineis.length <= 1
                          ? { ...sty.painelMenuItemDanger, opacity: 0.35, cursor: 'default' }
                          : sty.painelMenuItemDanger}
                        onClick={() => paineis.length > 1 && setDeletingId(p.id)}
                        disabled={paineis.length <= 1}
                      >
                        <Trash size={13} />
                        {t('pedido.lista.painel_excluir', { defaultValue: 'Excluir' })}
                      </button>
                    </>
                  )}
                </div>
              )}
            </SortableTabWrapper>
          ))}
        </SortableContext>
      </DndContext>
      )}

      {!carregando && (criandoPainel ? (
        <form
          style={sty.painelNovoForm}
          onSubmit={e => {
            e.preventDefault()
            void submitNovoPainel()
          }}
        >
          <input
            autoFocus
            type="text"
            placeholder={t('pedido.lista.painel_novo_placeholder', { defaultValue: 'Nome do painel' })}
            value={novoNomePainel}
            onChange={e => setNovoNomePainel(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void submitNovoPainel()
              }
            }}
            disabled={salvandoPainel}
            style={sty.painelNovoInput}
            maxLength={60}
          />
          <button
            type="submit"
            style={{
              ...sty.painelNovoBtnOk,
              opacity: salvandoPainel ? 0.6 : 1,
              cursor: salvandoPainel ? 'wait' : 'pointer',
            }}
            disabled={salvandoPainel || !novoNomePainel.trim()}
            aria-label={t('pedido.dashboard.painel_criar', { defaultValue: 'Criar' })}
          >
            {salvandoPainel ? '…' : '✓'}
          </button>
          <button
            type="button"
            style={sty.painelNovoBtnCancel}
            disabled={salvandoPainel}
            onClick={() => { setCriandoPainel(false); setNovoNomePainel('') }}
          >
            <X size={12} />
          </button>
        </form>
      ) : (
        <button
          type="button"
          style={sty.painelAddBtn}
          data-testid="lista-painel-criar"
          onClick={() => setCriandoPainel(true)}
          title={t('pedido.lista.painel_novo', { defaultValue: 'Novo painel' })}
        >
          +
        </button>
      ))}
      </div>
    </div>
  )
}
