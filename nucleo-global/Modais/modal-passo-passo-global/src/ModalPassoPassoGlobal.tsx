/**
 * ModalPassoPassoGlobal — Modal com navegacao em passos (wizard)
 * Design System § 12 — Wizard Timeline (Stepper)
 * Design System § 14 — Modal (alinhado com ModalOverlay)
 *
 * UX Features:
 * - Transicao de conteudo animada (slide entre passos)
 * - Barra de progresso no topo do modal
 * - Focus trap (Tab nao escapa do modal)
 * - Navegacao direta: clicar em passo concluido volta a ele
 * - Conector animado (fill progressivo ao completar)
 */

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, Check, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'

const LARGURA: Record<string, string> = {
  sm: '400px',
  md: '560px',
  lg: '720px',
  xl: '960px',
  '2xl': '1200px',
}

export interface PassoConfig {
  id: number
  label: string
  icone?: React.ReactNode
}

export interface ModalPassoPassoProps {
  titulo: string
  icone?: React.ReactNode
  subtitulo?: string
  /** Subtitulo como ReactNode — alternativa a `subtitulo` para conteudo dinamico */
  subtituloNode?: React.ReactNode
  aberto: boolean
  passos: PassoConfig[]
  passoAtual: number
  onProximo: () => void
  onVoltar: () => void
  onFechar: () => void
  podeAvancar?: boolean
  labelBotaoFinal?: string
  labelProximo?: string
  /** Padrao: 'md' (560px). Tamanhos: sm=400, md=560, lg=720, xl=960, 2xl=1200. */
  tamanho?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Altura explicita — opcional */
  altura?: string
  /** Ocultar o stepper (ex: tela de resultado/conclusao) */
  ocultarStepper?: boolean
  /** Ocultar o footer padrao (Voltar/Proximo). Use com `footerCustom` ou para telas sem navegacao */
  ocultarFooter?: boolean
  /** Footer custom — substitui completamente o footer padrao (Voltar/Proximo) */
  footerCustom?: React.ReactNode
  /** Permitir clicar em passos concluidos para navegar diretamente. Padrao: true */
  navegacaoDireta?: boolean
  /** Callback quando usuario clica em um passo concluido (navegacao direta) */
  onIrParaPasso?: (passoId: number) => void
  children: React.ReactNode
}

// ── Focus Trap helper ─────────────────────────────────────────────────────────

function useFocusTrap(aberto: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto || !ref.current) return

    const dialog = ref.current
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const focusable = dialog.querySelectorAll<HTMLElement>(focusableSelector)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // Focus first focusable element on open
    requestAnimationFrame(() => {
      const first = dialog.querySelector<HTMLElement>(focusableSelector)
      first?.focus()
    })

    dialog.addEventListener('keydown', handleTab)
    return () => dialog.removeEventListener('keydown', handleTab)
  }, [aberto])

  return ref
}

export function ModalPassoPassoGlobal({
  titulo,
  icone,
  subtitulo,
  subtituloNode,
  aberto,
  passos,
  passoAtual,
  onProximo,
  onVoltar,
  onFechar,
  podeAvancar = true,
  labelBotaoFinal = 'Salvar',
  labelProximo = 'Proximo',
  tamanho = 'md',
  altura,
  ocultarStepper = false,
  ocultarFooter = false,
  footerCustom,
  navegacaoDireta = true,
  onIrParaPasso,
  children,
}: ModalPassoPassoProps) {
  const dialogRef = useFocusTrap(aberto)
  const [direcao, setDirecao] = useState<'avanco' | 'retorno'>('avanco')
  const passoAnteriorRef = useRef(passoAtual)

  // Detectar direcao da navegacao
  useEffect(() => {
    if (passoAtual > passoAnteriorRef.current) {
      setDirecao('avanco')
    } else if (passoAtual < passoAnteriorRef.current) {
      setDirecao('retorno')
    }
    passoAnteriorRef.current = passoAtual
  }, [passoAtual])

  useEffect(() => {
    if (!aberto) return
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  if (!aberto) return null
  if (typeof document === 'undefined') return null

  const isUltimoPasso  = passoAtual === passos[passos.length - 1]?.id
  const isPrimeiroPasso = passoAtual === passos[0]?.id

  function stepStatus(passo: PassoConfig): 'pendente' | 'ativo' | 'feito' {
    if (passo.id < passoAtual) return 'feito'
    if (passo.id === passoAtual) return 'ativo'
    return 'pendente'
  }

  // Barra de progresso — percentual
  const passoIndex = passos.findIndex(p => p.id === passoAtual)
  const progresso = passos.length > 1 ? (passoIndex / (passos.length - 1)) * 100 : 100

  const largura = LARGURA[tamanho] ?? LARGURA.md

  // Handler para navegacao direta
  function handleClickPasso(passo: PassoConfig) {
    if (!navegacaoDireta) return
    const status = stepStatus(passo)
    if (status !== 'feito') return
    if (onIrParaPasso) {
      onIrParaPasso(passo.id)
    }
  }

  const content = (
    <>
      <style>{`
        @keyframes mpg-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mpg-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mpg-content-slide-left {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes mpg-content-slide-right {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes mpg-check-bounce {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes mpg-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(99,102,241,0.2), 0 4px 14px rgba(99,102,241,0.3); }
          50%      { box-shadow: 0 0 0 6px rgba(99,102,241,0.15), 0 4px 14px rgba(99,102,241,0.15); }
        }
        .mpg-btn-fechar:hover {
          color: var(--text-primary) !important;
          background: var(--bg-elevated, rgba(255,255,255,0.07)) !important;
        }
        .mpg-passo-feito {
          cursor: pointer;
        }
        .mpg-passo-feito:hover .mpg-circulo-feito {
          transform: scale(1.12);
          box-shadow: 0 0 0 3px rgba(34,197,94,0.25), 0 4px 12px rgba(34,197,94,0.2);
        }
        .mpg-circulo-ativo {
          animation: mpg-pulse 2.5s ease-in-out infinite;
        }
        .mpg-circulo-pendente {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .mpg-circulo-pendente:hover {
          background: var(--bg-elevated, rgba(255,255,255,0.1)) !important;
          border-color: var(--text-muted) !important;
        }
        .mpg-check-icon {
          animation: mpg-check-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .mpg-content-wrap {
          animation: mpg-content-slide-left 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .mpg-content-wrap--retorno {
          animation: mpg-content-slide-right 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .mpg-progress-bar {
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mpg-conector-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: var(--success, #22c55e);
          border-radius: 1px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 640px) {
          .mpg-dialog {
            max-width: 100% !important;
            max-height: 92vh !important;
            border-radius: var(--radius-lg) var(--radius-lg) 0 0 !important;
            animation: mpg-slide-up-mobile 0.25s ease !important;
          }
          @keyframes mpg-slide-up-mobile {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);   opacity: 1; }
          }
          .mpg-overlay {
            padding: 0 !important;
            align-items: flex-end !important;
          }
        }
      `}</style>

      <div
        className="mpg-overlay"
        style={s.overlay}
        role="presentation"
        onClick={e => { if (e.target === e.currentTarget) onFechar() }}
      >
        <div
          ref={dialogRef}
          className="mpg-dialog"
          style={{ ...s.dialog, maxWidth: largura, ...(altura ? { height: altura } : {}) }}
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
        >
          {/* Barra de progresso — topo do modal */}
          {!ocultarStepper && (
            <div style={s.progressWrap} aria-hidden="true">
              <div
                className="mpg-progress-bar"
                style={{ ...s.progressBar, width: `${progresso}%` }}
              />
            </div>
          )}

          {/* Header */}
          <div style={s.header}>
            <div style={s.headerTexto}>
              <div style={s.headerTituloRow}>
                {icone && <span style={s.headerIcone}>{icone}</span>}
                <span style={s.titulo}>{titulo}</span>
              </div>
              {(subtitulo || subtituloNode) && (
                <div style={s.subtitulo}>{subtituloNode ?? subtitulo}</div>
              )}
            </div>
            <button
              className="mpg-btn-fechar"
              style={s.fechar}
              onClick={onFechar}
              aria-label="Fechar"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Stepper */}
          {!ocultarStepper && <div style={s.stepperWrap}>
            <div style={s.stepper} role="list" aria-label="Passos">
              {passos.map((passo, idx) => {
                const status = stepStatus(passo)
                const isClickable = navegacaoDireta && status === 'feito' && !!onIrParaPasso
                const circuloStyle = {
                  ...s.circulo,
                  ...(status === 'ativo' ? s.circuloAtivo : {}),
                  ...(status === 'feito' ? s.circuloFeito : {}),
                }
                const labelStyleMerge = {
                  ...s.label,
                  ...(status === 'ativo' ? s.labelAtivo : {}),
                  ...(status === 'feito' ? s.labelFeito : {}),
                }

                return (
                  <React.Fragment key={passo.id}>
                    <div
                      style={s.passo}
                      role="listitem"
                      aria-current={status === 'ativo' ? 'step' : undefined}
                      className={isClickable ? 'mpg-passo-feito' : undefined}
                      onClick={isClickable ? () => handleClickPasso(passo) : undefined}
                      title={isClickable ? `Voltar para: ${passo.label}` : undefined}
                    >
                      <div
                        style={circuloStyle}
                        className={
                          status === 'ativo' ? 'mpg-circulo-ativo' :
                          status === 'feito' ? 'mpg-circulo-feito' : 'mpg-circulo-pendente'
                        }
                      >
                        {status === 'feito'
                          ? <span className="mpg-check-icon"><Check size={13} weight="bold" /></span>
                          : (passo.icone ?? passo.id)
                        }
                      </div>
                      <span style={labelStyleMerge}>{passo.label}</span>
                    </div>
                    {idx < passos.length - 1 && (
                      <div style={s.conector} aria-hidden="true">
                        <div
                          className="mpg-conector-fill"
                          style={{ width: status === 'feito' ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>}

          {/* Conteudo — com transicao animada */}
          <div
            key={passoAtual}
            className={`mpg-content-wrap${direcao === 'retorno' ? ' mpg-content-wrap--retorno' : ''}`}
            style={s.conteudo}
            aria-live="polite"
          >
            {children}
          </div>

          {/* Footer */}
          {footerCustom ? (
            <div style={s.footer}>{footerCustom}</div>
          ) : !ocultarFooter ? (
          <div style={s.footer}>
            <BotaoGlobal
              variante="fantasma"
              tamanho="padrao"
              icone={!isPrimeiroPasso ? <ArrowLeft size={14} /> : undefined}
              onClick={isPrimeiroPasso ? onFechar : onVoltar}
            >
              {isPrimeiroPasso ? 'Cancelar' : 'Voltar'}
            </BotaoGlobal>

            <div style={s.footerDireita}>
              <span style={s.footerIndicador}>
                {passoIndex + 1} / {passos.length}
              </span>
              <BotaoGlobal
                variante="primario"
                tamanho="padrao"
                disabled={!podeAvancar}
                iconeDireita={isUltimoPasso ? <Check size={14} /> : <ArrowRight size={14} />}
                onClick={onProximo}
              >
                {isUltimoPasso ? labelBotaoFinal : labelProximo}
              </BotaoGlobal>
            </div>
          </div>
          ) : null}
        </div>
      </div>
    </>
  )

  return createPortal(content, document.body)
}

// ── Estilos inline (Design System § 12 + § 14) ───────────────────────────────

const s = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
    animation: 'mpg-fade-in 0.15s ease',
  },
  dialog: {
    position: 'relative' as const,
    width: '100%',
    background: 'var(--bg-base)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column' as const,
    maxHeight: 'calc(100vh - 2rem)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
    animation: 'mpg-slide-up 0.2s ease',
  },
  progressWrap: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'var(--bg-elevated, rgba(255,255,255,0.06))',
    zIndex: 1,
    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'var(--accent, #6366f1)',
    borderRadius: '0 2px 2px 0',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--bg-elevated)',
    flexShrink: 0,
    gap: '1rem',
  },
  headerTexto: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
  },
  headerTituloRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  headerIcone: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--ws-accent, var(--color-primary, #818cf8))',
  },
  titulo: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  subtitulo: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary, #94a3b8)',
    margin: 0,
    lineHeight: 1.4,
  },
  fechar: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: 0,
    width: '2rem',
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
    flexShrink: 0,
    transition: 'color 0.15s, background 0.15s',
  },
  stepperWrap: {
    padding: '1rem 1.5rem',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--bg-elevated)',
    flexShrink: 0,
  },
  stepper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
    overflowX: 'auto' as const,
  },
  passo: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    flex: 1,
    gap: '0.5rem',
    flexShrink: 0,
  },
  // Circulo — OBRIGATORIO: min-width e flex-shrink:0 (Design System § 12)
  circulo: {
    width: '2.25rem',
    height: '2.25rem',
    minWidth: '2.25rem',
    flexShrink: 0,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid var(--bg-elevated, rgba(255,255,255,0.12))',
    color: 'var(--text-muted)',
    fontSize: '0.8125rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,
  circuloAtivo: {
    background: 'linear-gradient(135deg, var(--accent, #6366f1), #818cf8)',
    border: '2px solid transparent',
    color: '#fff',
    boxShadow: '0 0 0 3px rgba(99,102,241,0.2), 0 4px 14px rgba(99,102,241,0.3)',
    fontWeight: 800,
  } as React.CSSProperties,
  circuloFeito: {
    background: 'linear-gradient(135deg, #22c55e, #4ade80)',
    border: '2px solid transparent',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(34,197,94,0.25)',
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s ease',
  } as React.CSSProperties,
  label: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textAlign: 'center' as const,
    color: 'var(--text-muted, #64748b)',
    whiteSpace: 'nowrap' as const,
    transition: 'color 0.2s',
  },
  labelAtivo: { color: 'var(--accent, #6366f1)' },
  labelFeito: { color: 'var(--success, #22c55e)' },
  conector: {
    position: 'relative' as const,
    flex: 1,
    height: '2px',
    background: 'var(--bg-elevated, rgba(255,255,255,0.08))',
    minWidth: '20px',
    marginTop: '1.125rem',
    borderRadius: '1px',
    overflow: 'hidden',
  } as React.CSSProperties,
  conteudo: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1.5rem',
    background: 'var(--bg-base)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    background: 'var(--bg-surface)',
    borderTop: '1px solid var(--bg-elevated)',
    flexShrink: 0,
  },
  footerDireita: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  footerIndicador: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    color: 'var(--text-muted, #64748b)',
    letterSpacing: '0.02em',
  },
} as const
