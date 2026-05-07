/**
 * @nucleo/modal-global — modal-overlay
 * ModalOverlay: modal com header, abas, overlay e fechamento por ESC.
 * Estilos via CSS Variables do design system Solid Slate.
 */

import React, { useEffect, useRef, useState, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
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
  tipoAbas,
  centralizarAbas,
  paddingSuperiorAbas,
}: {
  abas: AbaModal[]
  abaAtiva: string
  aoMudarAba: (id: string) => void
  idBase: string
  tipoAbas?: 'underline' | 'pill'
  centralizarAbas?: boolean
  paddingSuperiorAbas?: string
}) {
  const isPill = tipoAbas === 'pill'
  // `centralizada` só vai pro DOM quando o caller pediu E é estilo pill.
  // Mantém alinhamento à esquerda padrão pra todos os modais que não optaram.
  const classeCentralizada = isPill && centralizarAbas ? ' centralizada' : ''

  return (
    <nav
      className={`mg-nav-abas ${isPill ? 'mg-tabs-pill-wrap' : 'tabs-underline'}${classeCentralizada}`}
      style={paddingSuperiorAbas ? { paddingTop: paddingSuperiorAbas } : undefined}
      role="tablist"
      aria-label="Abas do modal"
    >
      {isPill ? (
        <div className="mg-tabs-pill">
          {abas.map((aba) => {
            const btn = (
              <button
                key={aba.id}
                id={`${idBase}-tab-${aba.id}`}
                className={`mg-tab-pill ${abaAtiva === aba.id ? 'active' : ''}`}
                role="tab"
                aria-selected={abaAtiva === aba.id}
                aria-controls={`${idBase}-panel-${aba.id}`}
                disabled={aba.desabilitada}
                onClick={() => !aba.desabilitada && aoMudarAba(aba.id)}
              >
                {aba.rotulo}
              </button>
            )
            return (aba.tooltipTitulo || aba.tooltipDescricao) ? (
              <TooltipGlobal key={aba.id} titulo={aba.tooltipTitulo} descricao={aba.tooltipDescricao}>
                {btn}
              </TooltipGlobal>
            ) : btn
          })}
        </div>
      ) : (
        abas.map((aba) => {
          const btn = (
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
          )
          return (aba.tooltipTitulo || aba.tooltipDescricao) ? (
            <TooltipGlobal key={aba.id} titulo={aba.tooltipTitulo} descricao={aba.tooltipDescricao}>
              {btn}
            </TooltipGlobal>
          ) : btn
        })
      )}
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

export function ModalOverlay({
  aberto,
  aoFechar,
  titulo,
  subtitulo,
  iconeTitulo,
  abas,
  tipoAbas = 'underline',
  centralizarAbas = false,
  paddingSuperiorAbas,
  abaAtivaInicial,
  larguraMaxima,
  cabecalhoPersonalizado,
  children,
  botoes,
  renderizarFooter,
  tamanho = 'md',
  altura,
  fecharAoClicarOverlay = true,
  fecharPorESC = true,
  semFechar = false,
}: ModalProps) {
  const id = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const primeiraAba = abas?.[0]?.id ?? ''
  const [abaAtiva, setAbaAtiva] = useState(abaAtivaInicial || primeiraAba)

  useEffect(() => {
    if (aberto && abaAtivaInicial) {
      setAbaAtiva(abaAtivaInicial)
    } else if (aberto && !abaAtivaInicial) {
      setAbaAtiva(primeiraAba)
    }
  }, [aberto, abaAtivaInicial, primeiraAba])

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

  const modalContent = (
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
        style={{ maxWidth: larguraMaxima ?? LARGURA_MODAL[tamanho], ...(altura ? { height: altura } : {}) }}
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

        {/* Abas */}
        {abas && abas.length > 0 && (
          <div style={{ position: 'relative', top: '1px' }}>
            <NavegacaoAbas
              abas={abas}
              abaAtiva={abaAtiva}
              aoMudarAba={setAbaAtiva}
              idBase={id}
              tipoAbas={tipoAbas}
              centralizarAbas={centralizarAbas}
              paddingSuperiorAbas={paddingSuperiorAbas}
            />
          </div>
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
              renderizarFooter(abaAtiva)
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

  if (typeof document === 'undefined') return null

  return createPortal(modalContent, document.body)
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
        <ModalOverlay
          key={item.id}
          {...item.props}
          aberto
          aoFechar={() => fecharModal(item.id)}
        />
      ))}
    </>
  )
}
