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
  /** Titulo como ReactNode — alternativa a `titulo` para conteudo dinamico (ex: truncamento com icone) */
  tituloNode?: React.ReactNode
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
  tituloNode,
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
          0%   { transform: scale(0) rotate(-10deg); }
          50%  { transform: scale(1.2) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes mpg-neon-pulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(99,102,241,0.5), 0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.15), inset 0 0 12px rgba(99,102,241,0.1);
          }
          50% {
            box-shadow: 0 0 12px rgba(99,102,241,0.7), 0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.2), inset 0 0 16px rgba(99,102,241,0.15);
          }
        }
        @keyframes mpg-nucleo-glow {
          0%, 100% { opacity: 0.4; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 0.8; transform: translate(-50%,-50%) scale(1.3); }
        }
        /* --- Orbita 3D ao redor do circulo ativo (identidade Gravity) --- */
        @keyframes mpg-orbita-drift {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to   { transform: rotateX(70deg) rotateZ(360deg); }
        }
        @keyframes mpg-eletron-spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        .mpg-orbita-3d {
          position: absolute;
          top: 50%; left: 50%;
          width: 130%; height: 130%;
          transform: translate(-50%,-50%);
          pointer-events: none;
          perspective: 200px;
          transform-style: preserve-3d;
          z-index: 2;
        }
        .mpg-orbita-ring {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transform-style: preserve-3d;
        }
        .mpg-orbita-ring--1 {
          transform: rotateX(70deg) rotateZ(0deg);
          animation: mpg-orbita-drift 3s linear infinite;
        }
        .mpg-orbita-ring--2 {
          transform: rotateX(70deg) rotateZ(90deg);
          animation: mpg-orbita-drift 4.5s linear infinite reverse;
        }
        .mpg-orbita-anel {
          position: absolute;
          top: 50%; left: 50%;
          width: 100%; height: 100%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          border: 1px solid rgba(129,140,248,0.2);
        }
        .mpg-orbita-ring--2 .mpg-orbita-anel {
          border-color: rgba(167,139,250,0.15);
        }
        .mpg-orbita-eletron {
          position: absolute;
          top: 50%; left: 50%;
          width: 100%; height: 100%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          pointer-events: none;
        }
        .mpg-orbita-eletron--1 {
          animation: mpg-eletron-spin 3s linear infinite;
        }
        .mpg-orbita-eletron--1::after {
          content: '';
          position: absolute;
          width: 5px; height: 5px;
          border-radius: 50%;
          top: -2.5px; left: 50%;
          transform: translateX(-50%);
          background: #818cf8;
          box-shadow: 0 0 8px 2px rgba(129,140,248,0.7), 0 0 16px 4px rgba(129,140,248,0.3);
        }
        .mpg-orbita-eletron--2 {
          animation: mpg-eletron-spin 4.5s linear infinite reverse;
        }
        .mpg-orbita-eletron--2::after {
          content: '';
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 50%;
          top: -2px; left: 50%;
          transform: translateX(-50%);
          background: #a78bfa;
          box-shadow: 0 0 8px 2px rgba(167,139,250,0.7), 0 0 16px 4px rgba(167,139,250,0.3);
        }
        .mpg-btn-fechar:hover {
          color: var(--text-primary) !important;
          background: var(--bg-elevated, rgba(255,255,255,0.07)) !important;
        }
        .mpg-passo-feito {
          cursor: pointer;
        }
        .mpg-passo-feito:hover .mpg-circulo-feito {
          transform: scale(1.1);
          box-shadow: 0 0 10px rgba(34,197,94,0.5), 0 0 25px rgba(34,197,94,0.25), 0 0 50px rgba(34,197,94,0.1);
        }
        .mpg-circulo-ativo {
          animation: mpg-neon-pulse 2s ease-in-out infinite;
        }
        .mpg-circulo-pendente {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .mpg-circulo-pendente:hover {
          border-color: rgba(99,102,241,0.4) !important;
          box-shadow: 0 0 8px rgba(99,102,241,0.15);
        }
        .mpg-check-icon {
          animation: mpg-check-bounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
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
          background: linear-gradient(90deg, #22c55e, #4ade80);
          border-radius: 1px;
          box-shadow: 0 0 6px rgba(34,197,94,0.4);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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
                <span style={s.titulo}>{tituloNode ?? titulo}</span>
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
                      <div style={s.circuloWrap}>
                        <div
                          style={circuloStyle}
                          className={
                            status === 'ativo' ? 'mpg-circulo-ativo' :
                            status === 'feito' ? 'mpg-circulo-feito' : 'mpg-circulo-pendente'
                          }
                        >
                          {status === 'feito'
                            ? <span className="mpg-check-icon"><Check size={16} weight="bold" /></span>
                            : (passo.icone ?? passo.id)
                          }
                        </div>
                        {/* Orbita 3D Gravity — apenas no passo ativo */}
                        {status === 'ativo' && (
                          <>
                            <div className="mpg-orbita-3d" aria-hidden="true">
                              <div className="mpg-orbita-ring mpg-orbita-ring--1">
                                <div className="mpg-orbita-anel" />
                                <div className="mpg-orbita-eletron mpg-orbita-eletron--1" />
                              </div>
                              <div className="mpg-orbita-ring mpg-orbita-ring--2">
                                <div className="mpg-orbita-anel" />
                                <div className="mpg-orbita-eletron mpg-orbita-eletron--2" />
                              </div>
                            </div>
                            {/* Glow atras do circulo */}
                            <div style={s.nucleoGlow} aria-hidden="true" />
                          </>
                        )}
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
  circuloWrap: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.75rem',
    height: '2.75rem',
  },
  nucleoGlow: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)',
    animation: 'mpg-nucleo-glow 3s ease-in-out infinite',
    pointerEvents: 'none' as const,
    zIndex: 0,
  } as React.CSSProperties,
  // Circulo — OBRIGATORIO: min-width e flex-shrink:0 (Design System § 12)
  circulo: {
    position: 'relative' as const,
    zIndex: 3,
    width: '2.75rem',
    height: '2.75rem',
    minWidth: '2.75rem',
    flexShrink: 0,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.03)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,
  circuloAtivo: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1)',
    border: '2px solid rgba(129,140,248,0.5)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 800,
    boxShadow: '0 0 8px rgba(99,102,241,0.5), 0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.15), inset 0 0 12px rgba(99,102,241,0.1)',
  } as React.CSSProperties,
  circuloFeito: {
    background: 'linear-gradient(135deg, #16a34a, #22c55e, #4ade80)',
    border: '2px solid rgba(74,222,128,0.4)',
    color: '#fff',
    boxShadow: '0 0 8px rgba(34,197,94,0.4), 0 0 20px rgba(34,197,94,0.2), 0 0 35px rgba(34,197,94,0.1)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease',
  } as React.CSSProperties,
  label: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textAlign: 'center' as const,
    color: 'var(--text-muted, #64748b)',
    whiteSpace: 'nowrap' as const,
    transition: 'color 0.3s, text-shadow 0.3s',
  },
  labelAtivo: {
    color: '#a5b4fc',
    textShadow: '0 0 8px rgba(99,102,241,0.5)',
  },
  labelFeito: {
    color: '#86efac',
    textShadow: '0 0 6px rgba(34,197,94,0.3)',
  },
  conector: {
    position: 'relative' as const,
    flex: 1,
    height: '2px',
    background: 'rgba(255,255,255,0.06)',
    minWidth: '20px',
    marginTop: '1.375rem',
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
