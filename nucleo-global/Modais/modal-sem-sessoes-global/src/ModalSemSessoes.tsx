/**
 * @nucleo/modal-sem-sessoes-global — modal-overlay
 * ModalSemSessoesGlobal: modal com header, overlay e fechamento por ESC, sem suporte a abas/sessões.
 * Estilos via CSS Variables do design system Solid Slate.
 */

import React, { useEffect, useRef, useId } from 'react'
import { X } from '@phosphor-icons/react'
import type { ModalSemSessoesProps } from './tipos.js'
import './modal.css'

// ─── Tamanhos ─────────────────────────────────────────────────────────────────

const LARGURA_MODAL: Record<NonNullable<ModalSemSessoesProps['tamanho']>, string> = {
  sm: '400px',
  md: '560px',
  lg: '720px',
  xl: '960px',
  full: '100%',
}

// ─── Botão de carregamento ────────────────────────────────────────────────────

function BotaoFooter({
  rotulo,
  variante = 'secondary',
  desabilitado,
  carregando,
  ao_clicar,
}: NonNullable<ModalSemSessoesProps['botoes']>[number]) {
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

export function ModalSemSessoes({
  aberto,
  aoFechar,
  titulo,
  subtitulo,
  iconeTitulo,
  cabecalhoPersonalizado,
  children,
  botoes,
  renderizarFooter,
  tamanho = 'md',
  altura,
  fecharAoClicarOverlay = true,
  fecharPorESC = true,
  semFechar = false,
}: ModalSemSessoesProps) {
  const id = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

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
        style={{ maxWidth: LARGURA_MODAL[tamanho], ...(altura ? { height: altura } : {}) }}
      >
        {/* Header */}
        {cabecalhoPersonalizado ? (
          <div style={{ position: 'relative' }}>
            {cabecalhoPersonalizado}
            {!semFechar && (
              <button
                className="mg-btn-fechar"
                onClick={aoFechar}
                aria-label="Fechar modal"
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10 }}
              >
                <X size={20} weight="bold" />
              </button>
            )}
          </div>
        ) : (
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
                className="mg-btn-fechar"
                onClick={aoFechar}
                aria-label="Fechar modal"
              >
                <X size={20} weight="bold" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="mg-body modal-body">
          {children}
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
 * ModalSemSessoesProvider: renderiza todos os modais do stack global sem sessões.
 * Deve ser montado uma única vez na raiz da aplicação.
 */
export function ModalSemSessoesProvider() {
  const { stack } = useModalStack()

  return (
    <>
      {stack.map((item) => (
        <ModalSemSessoes
          key={item.id}
          {...item.props}
          aberto
          aoFechar={() => fecharModal(item.id)}
        />
      ))}
    </>
  )
}
