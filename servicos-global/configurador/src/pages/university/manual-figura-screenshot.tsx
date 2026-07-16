import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowsOut } from '@phosphor-icons/react'

const ESTILO_BOTAO_AMPLIAR: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 11px', borderRadius: 9,
  background: 'rgba(99,102,241,.88)', border: '1px solid rgba(165,180,252,.45)',
  color: '#f8fafc', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.03em',
  backdropFilter: 'blur(8px)', boxShadow: '0 4px 14px rgba(0,0,0,.28)',
  cursor: 'pointer',
}

/** Acima do MenuLateralGlobal / shell University (evita sidebar transparente por cima do Ampliar). */
const Z_INDEX_AMPLIAR_TELA_CHEIA = 200000

const MANUAL_SCREENSHOT_CACHE_KEY = '196'

function urlScreenshotManual(src: string): string {
  const sep = src.includes('?') ? '&' : '?'
  return `${src}${sep}ssv=${MANUAL_SCREENSHOT_CACHE_KEY}`
}

/** Screenshot de manual/Guia com botão Ampliar e tela cheia — SSOT visual University. */
export function ManualFiguraScreenshot({
  src,
  alt,
  larguraMaxima,
  larguraTotal = true,
  ampliarInferiorDireito,
  className,
  semSombraExterna,
}: {
  src: string
  alt: string
  larguraMaxima?: number
  larguraTotal?: boolean
  ampliarInferiorDireito?: boolean
  /** Ex.: `uni-player-aula__figura` no Guia Gravity (sem sombra que infla o gap visual). */
  className?: string
  semSombraExterna?: boolean
}) {
  const [telaCheia, setTelaCheia] = useState(false)
  const [erroCarregamento, setErroCarregamento] = useState(false)
  const srcEfetivo = urlScreenshotManual(src)
  const compacta = larguraMaxima != null
  const larguraCheia = compacta || larguraTotal

  useEffect(() => {
    setErroCarregamento(false)
  }, [srcEfetivo])

  useEffect(() => {
    if (!telaCheia) return
    const onTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTelaCheia(false)
    }
    document.addEventListener('keydown', onTecla)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onTecla)
      document.body.style.overflow = overflowAnterior
    }
  }, [telaCheia])

  const abrirTelaCheia = () => setTelaCheia(true)

  return (
    <>
      <div
        className={className}
        style={
        compacta || larguraTotal
          ? { maxWidth: larguraMaxima, width: '100%' }
          : undefined
      }>
        <figure
          role={erroCarregamento ? undefined : 'button'}
          tabIndex={erroCarregamento ? undefined : 0}
          aria-label={erroCarregamento ? undefined : `${alt}: abrir em tela cheia`}
          onClick={erroCarregamento ? undefined : abrirTelaCheia}
          onKeyDown={erroCarregamento ? undefined : (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              abrirTelaCheia()
            }
          }}
          style={{
            margin: 0, borderRadius: 14, overflow: 'hidden',
            cursor: erroCarregamento ? 'default' : 'zoom-in',
            border: '1px solid rgba(148,163,184,.15)',
            boxShadow: semSombraExterna
              ? 'inset 0 1px 0 rgba(255,255,255,.04)'
              : '0 8px 32px rgba(0,0,0,.28)',
            background: '#0b0f1a', position: 'relative',
            width: larguraCheia ? '100%' : undefined,
            maxWidth: larguraMaxima,
          }}
        >
          {erroCarregamento ? (
            <div style={{
              padding: 48, textAlign: 'center', color: '#475569', fontSize: '.8rem',
              background: 'rgba(148,163,184,.04)',
            }}>
              📸 Salve o screenshot em
              <br />
              <code style={{ color: '#818cf8', fontSize: '.75rem' }}>{src}</code>
            </div>
          ) : (
            <img
              key={srcEfetivo}
              src={srcEfetivo}
              alt={alt}
              style={{ width: '100%', display: 'block', verticalAlign: 'top', objectFit: 'contain' }}
              onError={() => setErroCarregamento(true)}
            />
          )}
          {!erroCarregamento && (
            <span style={{
              position: 'absolute',
              ...(ampliarInferiorDireito ? { bottom: 10, right: 10 } : { top: 10, right: 10 }),
              ...ESTILO_BOTAO_AMPLIAR,
              pointerEvents: 'none',
            }}>
              <ArrowsOut size={15} weight="duotone" aria-hidden />
              Ampliar
            </span>
          )}
        </figure>
      </div>

      {telaCheia && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setTelaCheia(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: Z_INDEX_AMPLIAR_TELA_CHEIA,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            background: '#020617',
          }}
        >
          <button
            type="button"
            onClick={() => setTelaCheia(false)}
            aria-label="Fechar visualização em tela cheia"
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(148,163,184,.12)', border: '1px solid rgba(148,163,184,.25)',
              color: '#f1f5f9', borderRadius: 8, padding: '8px 14px',
              fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Fechar ✕
          </button>
          {erroCarregamento ? (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: '.85rem',
                background: 'rgba(148,163,184,.06)', borderRadius: 10,
                border: '1px solid rgba(148,163,184,.15)',
              }}
            >
              Não foi possível carregar a imagem.
              <br />
              <code style={{ color: '#818cf8', fontSize: '.75rem' }}>{src}</code>
            </div>
          ) : (
            <img
              src={srcEfetivo}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              onError={() => setErroCarregamento(true)}
              style={{
                maxWidth: 'min(96vw, 1920px)', maxHeight: '92vh',
                width: 'auto', height: 'auto', objectFit: 'contain',
                borderRadius: 10, boxShadow: '0 24px 80px rgba(0,0,0,.55)',
                background: '#0b0f1a',
              }}
            />
          )}
        </div>,
        document.body,
      )}
    </>
  )
}
