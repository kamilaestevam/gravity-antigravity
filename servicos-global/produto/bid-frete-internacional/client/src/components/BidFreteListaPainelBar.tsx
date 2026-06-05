/**
 * BidFreteListaPainelBar — abas de painéis da Lista (paridade Pedido).
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
import { paineisListaBidFreteApi, type ListaPainel } from '../shared/api'
import { rotuloExibicaoPainelLista } from '../shared/rotulo-painel-lista-bid-frete-internacional'
import '../shared/lista-bid-frete-internacional-layout.css'

const sty = {
  painelTabWrap: { position: 'relative' as const, display: 'inline-flex' },
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

export interface BidFreteListaPainelBarProps {
  paineis: ListaPainel[]
  painelAtualId: string | null
  setPaineis: (paineis: ListaPainel[]) => void
  setPainelAtualId: (id: string) => void
  onTrocarPainel: (id: string) => void
  /** Cria painel (API + estado); retorna false se falhar — exibe notificação no pai */
  onCriarPainel: (nome: string) => Promise<boolean>
  carregando?: boolean
  /** standalone = faixa isolada; unificado = embutido na faixa painéis+status */
  variant?: 'standalone' | 'unificado'
}

export function BidFreteListaPainelBar({
  paineis,
  painelAtualId,
  setPaineis,
  setPainelAtualId,
  onTrocarPainel,
  onCriarPainel,
  carregando,
  variant = 'standalone',
}: BidFreteListaPainelBarProps) {
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
    paineisListaBidFreteApi.atualizar(id, { nome: trimmed })
      .then(() => setPaineis(paineis.map(p => p.id === id ? { ...p, nome: trimmed } : p)))
      .catch(() => {})
      .finally(() => { renameInFlightRef.current = null })
  }, [paineis, setPaineis])

  const handleDeletarPainel = useCallback((id: string) => {
    if (paineis.length <= 1) return
    paineisListaBidFreteApi.deletar(id)
      .then(() => {
        const atualizados = paineis.filter(p => p.id !== id)
        setPaineis(atualizados)
        if (painelAtualId === id) {
          const proximo = atualizados.find(p => p.is_visivel !== false) ?? atualizados[0]
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
    paineisListaBidFreteApi.reordenar(reordered.map(p => p.id)).catch(() => {})
  }, [paineis, setPaineis])

  const painelAtual = paineis.find(p => p.id === painelAtualId) ?? null
  const paineisVisiveis = paineis.filter(p => p.is_visivel !== false)

  const rotulosPainel = useCallback(
    (p: ListaPainel) =>
      rotuloExibicaoPainelLista(p, paineis, {
        padrao: t('bid_frete_internacional.lista.painel_nome_padrao', { defaultValue: 'Padrão' }),
        numerado: n =>
          t('bid_frete_internacional.lista.painel_nome_numerado', {
            defaultValue: 'Painel {{n}}',
            n,
          }),
      }),
    [paineis, t],
  )

  /** Garante que o painel em uso aparece na barra mesmo se is_visivel estiver false no banco. */
  let paineisNaBarra = paineisVisiveis
  if (
    painelAtualId &&
    painelAtual &&
    !paineisVisiveis.some(p => p.id === painelAtualId)
  ) {
    paineisNaBarra = [painelAtual, ...paineisVisiveis]
  }

  const stripClass =
    variant === 'unificado'
      ? 'lp-paineis-lista-strip lp-paineis-lista-strip--unificado'
      : 'lp-paineis-lista-strip'

  return (
    <div className={stripClass} data-testid="lista-painel-bar">
      <span
        className="lp-paineis-lista-strip__label"
        title={t('bid_frete_internacional.lista.paineis_secao', { defaultValue: 'Painéis da lista' })}
      >
        {t('bid_frete_internacional.lista.paineis_secao_curto', { defaultValue: 'Painéis' })}
      </span>
      <div className="lp-paineis-lista-strip__tabs pedido-dashboard-painel-bar">
      {carregando && paineisNaBarra.length === 0 ? (
        <span className="lp-paineis-lista-strip__vazio" role="status">
          {t('bid_frete_internacional.lista.paineis_carregando', { defaultValue: 'Carregando…' })}
        </span>
      ) : paineisNaBarra.length === 0 ? (
        <span
          className="lp-paineis-lista-strip__vazio"
          title={t('bid_frete_internacional.lista.paineis_vazio', {
            defaultValue: 'Crie em + Novo → Novo painel ou no + ao lado.',
          })}
        >
          {t('bid_frete_internacional.lista.paineis_vazio_curto', { defaultValue: '+ Novo painel ou botão +' })}
        </span>
      ) : (
      <DndContext sensors={painelSensors} collisionDetection={closestCenter} onDragEnd={handlePainelDragEnd}>
        <SortableContext
          items={paineisNaBarra.map(p => p.id)}
          strategy={horizontalListSortingStrategy}
        >
          {paineisNaBarra.map(p => {
            const { exibicao, ehGenerico, nomeSalvo } = rotulosPainel(p)
            const ativo = p.id === painelAtualId
            return (
            <SortableTabWrapper key={p.id} id={p.id}>
              {renamingId === p.id ? (
                <form
                  className="lp-painel-tab-form"
                  onSubmit={e => { e.preventDefault(); handleRenomearPainel(p.id, renameValue) }}
                  onPointerDown={e => e.stopPropagation()}
                >
                  <input
                    autoFocus
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => handleRenomearPainel(p.id, renameValue)}
                    maxLength={60}
                  />
                </form>
              ) : (
                <div
                  className={[
                    'lp-painel-tab-cluster',
                    ativo ? 'lp-painel-tab-cluster--ativo' : '',
                    ehGenerico ? 'lp-painel-tab-cluster--nome-generico' : '',
                  ].filter(Boolean).join(' ')}
                  onPointerDown={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    data-testid={ativo ? 'lista-painel-atual' : `lista-painel-tab-${p.id}`}
                    className="lp-painel-tab lp-painel-tab--rotulo"
                    onClick={() => onTrocarPainel(p.id)}
                    onDoubleClick={() => { setRenamingId(p.id); setRenameValue(p.nome) }}
                    title={
                      ehGenerico
                        ? t('bid_frete_internacional.lista.painel_nome_generico_dica', {
                            defaultValue:
                              '{{exibicao}} (nome padrão — ⋮ para renomear)',
                            exibicao,
                          })
                        : exibicao
                    }
                    aria-current={ativo ? 'true' : undefined}
                    aria-label={exibicao}
                  >
                    <span className="lp-painel-tab__nome">{exibicao}</span>
                  </button>
                  <button
                    type="button"
                    data-testid={`lista-painel-menu-${p.id}`}
                    className="lp-painel-tab__menu"
                    aria-label={t('bid_frete_internacional.lista.painel_renomear', { defaultValue: 'Renomear' })}
                    title={t('bid_frete_internacional.lista.painel_renomear_um_clique', {
                      defaultValue: 'Renomear painel',
                    })}
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => {
                      e.stopPropagation()
                      setMenuPainelId(null)
                      setDeletingId(null)
                      setRenamingId(p.id)
                      setRenameValue(p.nome)
                    }}
                    onContextMenu={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      setMenuPainelId(prev => prev === p.id ? null : p.id)
                      setDeletingId(null)
                    }}
                  >
                    <DotsThree size={12} weight="bold" />
                  </button>
                </div>
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
                        {t('bid_frete_internacional.lista.painel_excluir_confirmar', { defaultValue: 'Excluir painel?' })}
                        {' '}<strong style={{ color: '#fff' }}>{exibicao}</strong>
                        {ehGenerico && nomeSalvo !== exibicao ? (
                          <span style={{ display: 'block', fontSize: '0.65rem', opacity: 0.65, marginTop: '0.2rem' }}>
                            {nomeSalvo}
                          </span>
                        ) : null}
                      </p>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button type="button" className="lp-painel-tab-form__ok" onClick={() => handleDeletarPainel(p.id)}>
                          {t('comum.confirmar', { defaultValue: 'Confirmar' })}
                        </button>
                        <button type="button" className="lp-painel-tab-form__cancel" onClick={() => setDeletingId(null)}>
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
                        {t('bid_frete_internacional.lista.painel_renomear', { defaultValue: 'Renomear' })}
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
                        {t('bid_frete_internacional.lista.painel_excluir', { defaultValue: 'Excluir' })}
                      </button>
                    </>
                  )}
                </div>
              )}
            </SortableTabWrapper>
            )
          })}
        </SortableContext>
      </DndContext>
      )}

      {!carregando && (criandoPainel ? (
        <form
          className="lp-painel-tab-form"
          onSubmit={e => {
            e.preventDefault()
            void submitNovoPainel()
          }}
        >
          <input
            autoFocus
            type="text"
            placeholder={t('bid_frete_internacional.lista.painel_novo_placeholder', {
              defaultValue: 'Ex.: Exportação Q2',
            })}
            value={novoNomePainel}
            onChange={e => setNovoNomePainel(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void submitNovoPainel()
              }
            }}
            disabled={salvandoPainel}
            maxLength={60}
          />
          <button
            type="submit"
            className="lp-painel-tab-form__ok"
            style={{ opacity: salvandoPainel ? 0.6 : 1, cursor: salvandoPainel ? 'wait' : 'pointer' }}
            disabled={salvandoPainel || !novoNomePainel.trim()}
            aria-label={t('bid_frete_internacional.lista.painel_criar', { defaultValue: 'Criar' })}
          >
            {salvandoPainel ? '…' : '✓'}
          </button>
          <button
            type="button"
            className="lp-painel-tab-form__cancel"
            disabled={salvandoPainel}
            onClick={() => { setCriandoPainel(false); setNovoNomePainel('') }}
          >
            <X size={11} />
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="lp-painel-tab-add"
          data-testid="lista-painel-criar"
          onClick={() => setCriandoPainel(true)}
          title={t('bid_frete_internacional.lista.painel_novo', { defaultValue: 'Novo painel' })}
          aria-label={t('bid_frete_internacional.lista.painel_novo', { defaultValue: 'Novo painel' })}
        >
          +
        </button>
      ))}
      </div>
    </div>
  )
}
