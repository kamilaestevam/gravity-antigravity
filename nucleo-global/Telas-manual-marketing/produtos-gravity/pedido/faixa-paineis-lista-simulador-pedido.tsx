import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DotsThree, PencilSimple, Trash, X } from '@phosphor-icons/react'

export type PainelItemSimulador = {
  id: string
  nome: string
  ordem: number
}

export const PAINEIS_LISTA_SIMULADOR_INICIAIS: PainelItemSimulador[] = [
  { id: 'geral', nome: 'Geral', ordem: 0 },
  { id: 'logistica', nome: 'Logística', ordem: 1 },
  { id: 'financeiro', nome: 'Financeiro', ordem: 2 },
]

type Props = {
  paineis: PainelItemSimulador[]
  painelAtualId: string
  onPaineisChange: (paineis: PainelItemSimulador[]) => void
  onPainelAtualIdChange: (id: string) => void
}

function novoIdPainelSimulador(): string {
  return `painel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function FaixaPaineisListaSimuladorPedido({
  paineis,
  painelAtualId,
  onPaineisChange,
  onPainelAtualIdChange,
}: Props) {
  const [criandoPainel, setCriandoPainel] = useState(false)
  const [novoNomePainel, setNovoNomePainel] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [menuPainelId, setMenuPainelId] = useState<string | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; left: number } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const menuPortalRef = useRef<HTMLDivElement | null>(null)

  const paineisOrdenados = [...paineis].sort((a, b) => a.ordem - b.ordem)

  const fecharMenuPainel = useCallback(() => {
    setMenuPainelId(null)
    setMenuAnchor(null)
    setDeletingId(null)
  }, [])

  useEffect(() => {
    if (!menuPainelId) return

    const fecharSeFora = (ev: PointerEvent) => {
      const alvo = ev.target
      if (!(alvo instanceof Node)) return
      if (menuPortalRef.current?.contains(alvo)) return
      if (alvo instanceof Element && alvo.closest('.pds-lista-painel-menu')) return
      fecharMenuPainel()
    }

    const fecharAoRolar = () => fecharMenuPainel()

    document.addEventListener('pointerdown', fecharSeFora)
    window.addEventListener('scroll', fecharAoRolar, true)
    window.addEventListener('resize', fecharAoRolar)
    return () => {
      document.removeEventListener('pointerdown', fecharSeFora)
      window.removeEventListener('scroll', fecharAoRolar, true)
      window.removeEventListener('resize', fecharAoRolar)
    }
  }, [menuPainelId, fecharMenuPainel])

  const submitNovoPainel = useCallback(() => {
    const nome = novoNomePainel.trim()
    if (!nome) return
    const ordem = paineis.reduce((max, p) => Math.max(max, p.ordem), -1) + 1
    const criado: PainelItemSimulador = { id: novoIdPainelSimulador(), nome, ordem }
    onPaineisChange([...paineis, criado])
    onPainelAtualIdChange(criado.id)
    setNovoNomePainel('')
    setCriandoPainel(false)
  }, [novoNomePainel, paineis, onPaineisChange, onPainelAtualIdChange])

  const handleRenomearPainel = useCallback((id: string, nome: string) => {
    const trimmed = nome.trim()
    setRenamingId(null)
    if (!trimmed) return
    const atual = paineis.find((p) => p.id === id)
    if (!atual || trimmed === atual.nome.trim()) return
    onPaineisChange(paineis.map((p) => (p.id === id ? { ...p, nome: trimmed } : p)))
  }, [paineis, onPaineisChange])

  const toggleMenuPainel = useCallback((id: string, anchorEl: HTMLElement) => {
    if (menuPainelId === id) {
      fecharMenuPainel()
      return
    }
    const rect = anchorEl.getBoundingClientRect()
    setMenuAnchor({ top: rect.bottom + 4, left: rect.left })
    setMenuPainelId(id)
    setDeletingId(null)
  }, [menuPainelId, fecharMenuPainel])

  const abrirRenomearPainel = useCallback((painel: PainelItemSimulador) => {
    fecharMenuPainel()
    setRenamingId(painel.id)
    setRenameValue(painel.nome)
  }, [fecharMenuPainel])

  const handleDeletarPainel = useCallback((id: string) => {
    if (paineis.length <= 1) return
    const atualizados = paineis.filter((p) => p.id !== id)
    onPaineisChange(atualizados)
    if (painelAtualId === id) {
      const proximo = [...atualizados].sort((a, b) => a.ordem - b.ordem)[0]
      if (proximo) onPainelAtualIdChange(proximo.id)
    }
    fecharMenuPainel()
  }, [paineis, painelAtualId, onPaineisChange, onPainelAtualIdChange, fecharMenuPainel])

  const painelMenuAberto = menuPainelId
    ? paineisOrdenados.find((p) => p.id === menuPainelId) ?? null
    : null

  const menuPortal = menuPainelId && menuAnchor && painelMenuAberto
    ? createPortal(
        <div
          ref={menuPortalRef}
          role="menu"
          className="pds-lista-painel-menu-dropdown"
          style={{ top: menuAnchor.top, left: menuAnchor.left }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {deletingId === painelMenuAberto.id ? (
            <div className="pds-lista-painel-menu-confirm">
              <p>
                Excluir painel? <strong>{painelMenuAberto.nome}</strong>
              </p>
              <div className="pds-lista-painel-menu-confirm-acoes">
                <button
                  type="button"
                  className="pds-lista-painel-form__ok"
                  onClick={() => handleDeletarPainel(painelMenuAberto.id)}
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  className="pds-lista-painel-form__cancel"
                  onClick={() => setDeletingId(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                className="pds-lista-painel-menu-item"
                onClick={() => abrirRenomearPainel(painelMenuAberto)}
              >
                <PencilSimple size={13} aria-hidden />
                Renomear
              </button>
              <button
                type="button"
                role="menuitem"
                className="pds-lista-painel-menu-item pds-lista-painel-menu-item--perigo"
                disabled={paineis.length <= 1}
                onClick={() => paineis.length > 1 && setDeletingId(painelMenuAberto.id)}
              >
                <Trash size={13} aria-hidden />
                Excluir
              </button>
            </>
          )}
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <div className="pds-lista-paineis">
        <div className="pds-lista-paineis-strip">
          <span className="pds-lista-paineis-label">Painéis</span>
          <div className="pds-lista-paineis-tabs">
            {paineisOrdenados.map((p) => {
              const ativo = p.id === painelAtualId
              return (
                <div
                  key={p.id}
                  className={`pds-lista-painel-cluster ${ativo ? 'pds-lista-painel-cluster--ativo' : ''}`}
                >
                  {renamingId === p.id ? (
                    <form
                      className="pds-lista-painel-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleRenomearPainel(p.id, renameValue)
                      }}
                    >
                      <input
                        autoFocus
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenomearPainel(p.id, renameValue)}
                        maxLength={60}
                        aria-label="Renomear painel"
                      />
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="pds-lista-painel-tab"
                        onClick={() => onPainelAtualIdChange(p.id)}
                        onDoubleClick={() => abrirRenomearPainel(p)}
                        aria-current={ativo ? 'true' : undefined}
                        title={p.nome}
                      >
                        <span className="pds-lista-painel-tab__nome">{p.nome}</span>
                      </button>
                      <button
                        type="button"
                        className="pds-lista-painel-menu"
                        aria-label={`Opções do painel ${p.nome}`}
                        title="Opções do painel (renomear, excluir)"
                        aria-expanded={menuPainelId === p.id}
                        aria-haspopup="menu"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleMenuPainel(p.id, e.currentTarget)
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleMenuPainel(p.id, e.currentTarget)
                        }}
                      >
                        <DotsThree size={12} weight="bold" aria-hidden />
                      </button>
                    </>
                  )}
                </div>
              )
            })}

            {criandoPainel ? (
              <form
                className="pds-lista-painel-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  submitNovoPainel()
                }}
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Ex.: Exportação Q2"
                  value={novoNomePainel}
                  onChange={(e) => setNovoNomePainel(e.target.value)}
                  maxLength={60}
                  aria-label="Nome do novo painel"
                />
                <button
                  type="submit"
                  className="pds-lista-painel-form__ok"
                  disabled={!novoNomePainel.trim()}
                  aria-label="Criar painel"
                >
                  ✓
                </button>
                <button
                  type="button"
                  className="pds-lista-painel-form__cancel"
                  onClick={() => {
                    setCriandoPainel(false)
                    setNovoNomePainel('')
                  }}
                  aria-label="Cancelar"
                >
                  <X size={11} aria-hidden />
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="pds-lista-painel-add"
                aria-label="Novo painel"
                title="Novo painel"
                onClick={() => setCriandoPainel(true)}
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>
      {menuPortal}
    </>
  )
}
