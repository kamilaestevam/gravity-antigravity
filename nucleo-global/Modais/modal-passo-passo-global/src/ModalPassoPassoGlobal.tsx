/**
 * ModalPassoPassoGlobal — Modal com navegação em passos (wizard)
 * Design System § 12 — Wizard Timeline (Stepper)
 * Design System § 14 — Modal (alinhado com ModalOverlay)
 */

import React, { useEffect } from 'react'
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
  /** Subtítulo como ReactNode — alternativa a `subtitulo` para conteúdo dinâmico */
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
  /** Padrão: 'md' (560px). Tamanhos: sm=400, md=560, lg=720, xl=960, 2xl=1200. */
  tamanho?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Altura explícita — opcional */
  altura?: string
  /** Ocultar o stepper (ex: tela de resultado/conclusão) */
  ocultarStepper?: boolean
  /** Ocultar o footer padrão (Voltar/Próximo). Use com `footerCustom` ou para telas sem navegação */
  ocultarFooter?: boolean
  /** Footer custom — substitui completamente o footer padrão (Voltar/Próximo) */
  footerCustom?: React.ReactNode
  children: React.ReactNode
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
  labelProximo = 'Próximo',
  tamanho = 'md',
  altura,
  ocultarStepper = false,
  ocultarFooter = false,
  footerCustom,
  children,
}: ModalPassoPassoProps) {
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

  const largura = LARGURA[tamanho] ?? LARGURA.md

  const content = (
    <>
      {/* Keyframes injetados inline — necessário pois este componente é consumido
          via alias Vite e não pode importar CSS externo */}
      <style>{`
        @keyframes mpg-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mpg-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mpg-btn-fechar:hover {
          color: var(--text-primary) !important;
          background: var(--bg-elevated, rgba(255,255,255,0.07)) !important;
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
          className="mpg-dialog"
          style={{ ...s.dialog, maxWidth: largura, ...(altura ? { height: altura } : {}) }}
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
        >
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
                const circuloStyle = {
                  ...s.circulo,
                  ...(status === 'ativo' ? s.circuloAtivo : {}),
                  ...(status === 'feito' ? s.circuloFeito : {}),
                }
                const labelStyle = {
                  ...s.label,
                  ...(status === 'ativo' ? s.labelAtivo : {}),
                  ...(status === 'feito' ? s.labelFeito : {}),
                }
                const conectorStyle = {
                  ...s.conector,
                  ...(status === 'feito' ? s.conectorFeito : {}),
                }

                return (
                  <React.Fragment key={passo.id}>
                    <div style={s.passo} role="listitem" aria-current={status === 'ativo' ? 'step' : undefined}>
                      <div style={circuloStyle}>
                        {status === 'feito'
                          ? <Check size={14} weight="bold" />
                          : (passo.icone ?? passo.id)
                        }
                      </div>
                      <span style={labelStyle}>{passo.label}</span>
                    </div>
                    {idx < passos.length - 1 && (
                      <div style={conectorStyle} aria-hidden="true" />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>}

          {/* Conteúdo */}
          <div style={s.conteudo}>{children}</div>

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
  // Círculo — OBRIGATÓRIO: min-width e flex-shrink:0 (Design System § 12)
  circulo: {
    width: '2rem',
    height: '2rem',
    minWidth: '2rem',
    flexShrink: 0,
    borderRadius: '50%',
    background: 'var(--bg-elevated)',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  circuloAtivo: {
    background: 'var(--accent)',
    color: '#0f172a',
    boxShadow: '0 0 0 4px rgba(99,102,241,0.2)',
  } as React.CSSProperties,
  circuloFeito: {
    background: 'var(--success, #22c55e)',
    border: '2px solid var(--success, #22c55e)',
    color: '#fff',
  } as React.CSSProperties,
  label: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textAlign: 'center' as const,
    color: 'var(--text-muted, #64748b)',
    whiteSpace: 'nowrap' as const,
  },
  labelAtivo: { color: 'var(--accent, #6366f1)' },
  labelFeito: { color: 'var(--success, #22c55e)' },
  conector: {
    flex: 1,
    height: '2px',
    background: 'var(--bg-elevated)',
    minWidth: '20px',
    marginTop: '1rem',
    transition: 'background 0.25s',
  } as React.CSSProperties,
  conectorFeito: {
    background: 'var(--success, #22c55e)',
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
} as const
