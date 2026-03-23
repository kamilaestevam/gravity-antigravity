/**
 * @nucleo/modal-global — modal-overlay
 * ModalGlobal: modal com header, abas, overlay e fechamento por ESC.
 * Estilos via CSS Variables do design system Solid Slate.
 */

import React, { useEffect, useRef, useState, useId } from 'react'
import type { ModalProps, AbaModal } from './tipos.js'
import './modal.css'

// ─── Tamanhos ─────────────────────────────────────────────────────────────────

const LARGURA_MODAL: Record<NonNullable<ModalProps['tamanho']>, string> = {
  sm: '400px',
  md: '560px',
  lg: '720px',
  xl: '960px',
  full: '100%',
}

// ─── Abas internas ────────────────────────────────────────────────────────────

function NavegacaoAbas({
  abas,
  abaAtiva,
  aoMudarAba,
  idBase,
}: {
  abas: AbaModal[]
  abaAtiva: string
  aoMudarAba: (id: string) => void
  idBase: string
}) {
  return (
    <nav className="mg-nav-abas tabs-underline" role="tablist" aria-label="Abas do modal">
      {abas.map((aba) => (
        <button
          key={aba.id}
          id={`${idBase}-tab-${aba.id}`}
          className={`tab-underline ${abaAtiva === aba.id ? 'active' : ''}`}
          role="tab"
          aria-selected={abaAtiva === aba.id}
          aria-controls={`${idBase}-panel-${aba.id}`}
          disabled={aba.desabilitada}
          onClick={() => !aba.desabilitada && aoMudarAba(aba.id)}
        >
          {aba.rotulo}
        </button>
      ))}
    </nav>
  )
}

// ─── Botão de carregamento ────────────────────────────────────────────────────

function BotaoFooter({
  rotulo,
  variante = 'secondary',
  desabilitado,
  carregando,
  ao_clicar,
}: NonNullable<ModalProps['botoes']>[number]) {
  const classeMap: Record<string, string> = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    ghost: 'btn btn-ghost',
    danger: 'btn mg-btn-danger',
  }
  return (
    <button
      className={`${classeMap[variante]} ${carregando ? 'mg-btn-loading' : ''}`}
      disabled={desabilitado || carregando}
      onClick={ao_clicar}
      aria-busy={carregando}
    >
      {carregando ? <span className="mg-spinner" aria-hidden="true" /> : null}
      {rotulo}
    </button>
  )
}

// ─── Modal Principal ──────────────────────────────────────────────────────────

export function ModalGlobal({
  aberto,
  aoFechar,
  titulo,
  subtitulo,
  abas,
  children,
  botoes,
  renderizarFooter,
  tamanho = 'md',
  fecharAoClicarOverlay = true,
  fecharPorESC = true,
  semFechar = false,
}: ModalProps) {
  const id = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const primeiraAba = abas?.[0]?.id ?? ''
  const [abaAtiva, setAbaAtiva] = useState(primeiraAba)

  // Sincroniza a aba ativa quando as abas mudam
  useEffect(() => {
    if (abas && abas.length > 0 && !abas.find((a) => a.id === abaAtiva)) {
      setAbaAtiva(abas[0].id)
    }
  }, [abas, abaAtiva])

  // ESC handler
  useEffect(() => {
    if (!aberto || !fecharPorESC || semFechar) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [aberto, fecharPorESC, semFechar, aoFechar])

  // Trava o scroll do body enquanto modal está aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [aberto])

  // Focus trap — move foco para o modal ao abrir
  useEffect(() => {
    if (aberto && dialogRef.current) {
      const primeiroFocavel = dialogRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      primeiroFocavel?.focus()
    }
  }, [aberto])

  if (!aberto) return null

  const conteudoAba = abas?.find((a) => a.id === abaAtiva)?.conteudo ?? children

  return (
    <div
      className="mg-overlay"
      role="presentation"
      onClick={fecharAoClicarOverlay && !semFechar ? (e) => { if (e.target === e.currentTarget) aoFechar() } : undefined}
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        className="mg-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        style={{ maxWidth: LARGURA_MODAL[tamanho] }}
      >
        {/* Header */}
        <div className="mg-header modal-header">
          <div className="mg-header-texto">
            <h2 id={`${id}-titulo`} className="mg-titulo text-h3">
              {titulo}
            </h2>
            {subtitulo && (
              <p className="mg-subtitulo text-sm">{subtitulo}</p>
            )}
          </div>
          {!semFechar && (
            <button
              className="mg-btn-fechar btn btn-ghost"
              onClick={aoFechar}
              aria-label="Fechar modal"
            >
              ✕
            </button>
          )}
        </div>

        {/* Abas */}
        {abas && abas.length > 0 && (
          <NavegacaoAbas
            abas={abas}
            abaAtiva={abaAtiva}
            aoMudarAba={setAbaAtiva}
            idBase={id}
          />
        )}

        {/* Body */}
        <div
          className="mg-body modal-body"
          role={abas ? 'tabpanel' : undefined}
          id={abas ? `${id}-panel-${abaAtiva}` : undefined}
          aria-labelledby={abas ? `${id}-tab-${abaAtiva}` : undefined}
        >
          {conteudoAba}
        </div>

        {/* Footer */}
        {(botoes || renderizarFooter) && (
          <div className="mg-footer modal-footer">
            {renderizarFooter ? (
              renderizarFooter()
            ) : (
              botoes?.map((botao, i) => (
                <BotaoFooter key={`${botao.rotulo}-${i}`} {...botao} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Modal Provider (renderiza todos do stack) ────────────────────────────────

import { useModalStack } from './use-modal.js'
import { fecharModal } from './modal-manager.js'

/**
 * ModalProvider: renderiza todos os modais do stack global.
 * Deve ser montado uma única vez na raiz da aplicação.
 *
 * @example
 * // Em App.tsx
 * <ModalProvider />
 */
export function ModalProvider() {
  const { stack } = useModalStack()

  return (
    <>
      {stack.map((item) => (
        <ModalGlobal
          key={item.id}
          {...item.props}
          aberto
          aoFechar={() => fecharModal(item.id)}
        />
      ))}
    </>
  )
}
