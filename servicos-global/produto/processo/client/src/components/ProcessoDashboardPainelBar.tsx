
/**
 * ProcessoDashboardPainelBar — abas de painéis do Dashboard Processo (paridade Pedido/BID Frete).
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
import {
  paineisDashboardProcessoApi,
  type ProcessoDashboardPainel,
} from '../shared/processoDashboardPainelLocal'
import { rotuloExibicaoPainelProcesso } from '../shared/rotuloPainelProcesso'

export interface PainelBarItem {
  id: string
  nome: string
  ordem: number
  is_visivel: boolean
}

export interface PainelBarApiPort {
  atualizar: (id: string, patch: { nome?: string; is_visivel?: boolean }) => Promise<unknown>
  deletar: (id: string) => Promise<unknown>
  reordenar: (ids: string[]) => Promise<unknown>
}

const painelApiDashboardPadrao: PainelBarApiPort = paineisDashboardProcessoApi
import '../pages/ProcessoDashboard-l3.css'
import '../pages/ProcessoDashboard.css'

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

export interface ProcessoDashboardPainelBarProps<T extends PainelBarItem = ProcessoDashboardPainel> {
  paineis: T[]
  painelAtualId: string | null
  setPaineis: (paineis: T[]) => void
  setPainelAtualId: (id: string) => void
  onTrocarPainel: (id: string) => void
  onCriarPainel: (nome: string) => Promise<boolean>
  carregando?: boolean
  variant?: 'standalone' | 'unificado'
  painelApi?: PainelBarApiPort
}

export function ProcessoDashboardPainelBar<T extends PainelBarItem = ProcessoDashboardPainel>({
  paineis,
  painelAtualId,
  setPaineis,
  setPainelAtualId,
  onTrocarPainel,
  onCriarPainel,
  carregando,
  variant = 'unificado',
  painelApi = painelApiDashboardPadrao,
}: ProcessoDashboardPainelBarProps<T>) {
  const { t } = useTranslation()
  const i18n = (chave: string, fallback: string, opts?: Record<string, unknown>) =>
    t(`processo.dashboard.${chave}`, { defaultValue: fallback, ...opts })
  const testIdBar = 'dashboard-painel-bar'
  const testIdPainelAtual = 'dashboard-painel-atual'
  const testIdPrefixTab = 'dashboard-painel-tab'
  const testIdPrefixMenu = 'dashboard-painel-menu'
  const testIdCriar = 'dashboard-painel-criar'
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
    painelApi.atualizar(id, { nome: trimmed })
      .then(() => setPaineis(paineis.map(p => p.id === id ? { ...p, nome: trimmed } : p)))
      .catch(() => {})
      .finally(() => { renameInFlightRef.current = null })
  }, [paineis, setPaineis, painelApi])

  const handleDeletarPainel = useCallback((id: string) => {
    if (paineis.length <= 1) return
    painelApi.deletar(id)
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
  }, [paineis, painelAtualId, setPaineis, setPainelAtualId, onTrocarPainel, painelApi])

  const handlePainelDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = paineis.findIndex(p => p.id === active.id)
    const newIndex = paineis.findIndex(p => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(paineis, oldIndex, newIndex)
    setPaineis(reordered)
    painelApi.reordenar(reordered.map(p => p.id)).catch(() => {})
  }, [paineis, setPaineis, painelApi])

  const painelAtual = paineis.find(p => p.id === painelAtualId) ?? null
  const paineisVisiveis = paineis.filter(p => p.is_visivel !== false)

  const rotulosPainel = useCallback(
    (p: T) =>
      rotuloExibicaoPainelProcesso(p, paineis, {
        padrao: i18n('painel_nome_padrao', 'Padrão'),
        numerado: n => i18n('painel_nome_numerado', 'Painel {{n}}', { n }),
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
    <div className={stripClass} data-testid={testIdBar}>
      <span
        className="lp-paineis-lista-strip__label"
        title={i18n('paineis_secao', 'Painéis do dashboard')}
      >
        {i18n('paineis_secao_curto', 'Painéis')}
      </span>
      <div className="lp-paineis-lista-strip__tabs processo-dashboard-painel-bar">
      {carregando && paineisNaBarra.length === 0 ? (
        <span className="lp-paineis-lista-strip__vazio" role="status">
          {i18n('paineis_carregando', 'Carregando…')}
        </span>
      ) : paineisNaBarra.length === 0 ? (
        <span
          className="lp-paineis-lista-strip__vazio"
          title={i18n('paineis_vazio', 'Crie em + Novo → Novo painel ou no + ao lado.')}
        >
          {i18n('paineis_vazio_curto', '+ Novo painel ou botão +')}
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
                    data-testid={ativo ? testIdPainelAtual : `${testIdPrefixTab}-${p.id}`}
                    className="lp-painel-tab lp-painel-tab--rotulo"
                    onClick={() => onTrocarPainel(p.id)}
                    onDoubleClick={() => { setRenamingId(p.id); setRenameValue(p.nome) }}
                    title={
                      ehGenerico
                        ? t('processo.dashboard.painel_nome_generico_dica', {
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
                    data-testid={`${testIdPrefixMenu}-${p.id}`}
                    className="lp-painel-tab__menu"
                    aria-label={t('processo.dashboard.painel_renomear', { defaultValue: 'Renomear' })}
                    title={t('processo.dashboard.painel_renomear_um_clique', {
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
                        {t('processo.dashboard.painel_excluir_confirmar', { defaultValue: 'Excluir painel?' })}
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
                        {t('processo.dashboard.painel_renomear', { defaultValue: 'Renomear' })}
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
                        {t('processo.dashboard.painel_excluir', { defaultValue: 'Excluir' })}
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
            placeholder={t('processo.dashboard.painel_novo_placeholder', {
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
            aria-label={t('processo.dashboard.painel_criar', { defaultValue: 'Criar' })}
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
          data-testid={testIdCriar}
          onClick={() => setCriandoPainel(true)}
          title={t('processo.dashboard.painel_novo', { defaultValue: 'Novo painel' })}
          aria-label={t('processo.dashboard.painel_novo', { defaultValue: 'Novo painel' })}
        >
          +
        </button>
      ))}
      </div>
    </div>
  )
}
