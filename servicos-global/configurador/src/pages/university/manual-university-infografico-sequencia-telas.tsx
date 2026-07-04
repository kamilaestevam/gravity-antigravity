import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowsOut, CaretLeft, CaretRight } from '@phosphor-icons/react'
import type { TelaSequenciaInfografico } from './manual-lista-leitura-smart-read-infografico-integracao-api-cockpit-telas'
import { IMAGEM_PREVIEW_PADRAO_INFOGRAFICO } from './manual-lista-leitura-smart-read-infografico-integracao-api-cockpit-telas'

/** Sincronizar com `MANUAL_SCREENSHOT_CACHE_KEY` em manual-configurador-ui.tsx */
const CACHE_SCREENSHOT = '147'

const ESTILO_AMPLIAR_MINI: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 3,
  borderRadius: 5,
  background: 'rgba(99,102,241,.88)',
  border: 'none',
  color: '#f8fafc',
  backdropFilter: 'blur(6px)',
  boxShadow: '0 2px 8px rgba(0,0,0,.35)',
  lineHeight: 1,
  pointerEvents: 'none',
}

function urlScreenshotManual(src: string): string {
  const sep = src.includes('?') ? '&' : '?'
  return `${src}${sep}ssv=${CACHE_SCREENSHOT}`
}

function ImagemModalManual({ src, alt, maxHeight = '92vh' }: { src: string; alt: string; maxHeight?: string }) {
  const [srcAtual, setSrcAtual] = useState(() => urlScreenshotManual(src))
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    setSrcAtual(urlScreenshotManual(src))
    setFalhou(false)
  }, [src])

  if (falhou) {
    return (
      <div style={{
        padding: 48,
        textAlign: 'center',
        color: '#475569',
        fontSize: '.8rem',
        background: 'rgba(148,163,184,.04)',
        borderRadius: 10,
        maxWidth: 'min(96vw, 1920px)',
      }}>
        Print indisponível
      </div>
    )
  }

  return (
    <img
      src={srcAtual}
      alt={alt}
      onClick={(e) => e.stopPropagation()}
      onError={() => {
        const fallback = urlScreenshotManual(IMAGEM_PREVIEW_PADRAO_INFOGRAFICO)
        if (srcAtual !== fallback) {
          setSrcAtual(fallback)
          return
        }
        setFalhou(true)
      }}
      style={{
        maxWidth: 'min(96vw, 1920px)',
        maxHeight,
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
        borderRadius: 10,
        boxShadow: '0 24px 80px rgba(0,0,0,.55)',
        display: 'block',
      }}
    />
  )
}

function ImagemSequenciaManual({
  src,
  alt,
  altura = 46,
  objectFit = 'cover' as const,
}: {
  src: string
  alt: string
  altura?: number
  objectFit?: 'cover' | 'contain'
}) {
  const [srcAtual, setSrcAtual] = useState(() => urlScreenshotManual(src))
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    setSrcAtual(urlScreenshotManual(src))
    setFalhou(false)
  }, [src])

  if (falhou) {
    return (
      <div style={{
        width: '100%',
        height: altura,
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#475569',
        fontSize: '.55rem',
        fontWeight: 600,
      }}>
        Print
      </div>
    )
  }

  return (
    <img
      src={srcAtual}
      alt={alt}
      onError={() => {
        const fallback = urlScreenshotManual(IMAGEM_PREVIEW_PADRAO_INFOGRAFICO)
        if (srcAtual !== fallback) {
          setSrcAtual(fallback)
          return
        }
        setFalhou(true)
      }}
      style={{
        width: '100%',
        height: altura,
        objectFit,
        objectPosition: 'top center',
        display: 'block',
        border: 0,
        outline: 'none',
        background: '#0f172a',
        verticalAlign: 'top',
      }}
    />
  )
}

function ModalSequenciaTelas({
  telas,
  indiceInicial,
  onFechar,
}: {
  telas: TelaSequenciaInfografico[]
  indiceInicial: number
  onFechar: () => void
}) {
  const [indice, setIndice] = useState(indiceInicial)
  const tela = telas[indice]
  const total = telas.length

  const anterior = useCallback(() => setIndice((i) => Math.max(0, i - 1)), [])
  const proximo = useCallback(() => setIndice((i) => Math.min(total - 1, i + 1)), [total])

  useEffect(() => {
    const onTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
      if (e.key === 'ArrowLeft') anterior()
      if (e.key === 'ArrowRight') proximo()
    }
    document.addEventListener('keydown', onTecla)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onTecla)
      document.body.style.overflow = overflowAnterior
    }
  }, [anterior, proximo, onFechar])

  if (!tela) return null

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Sequência de telas — ${tela.titulo}`}
      onClick={onFechar}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(2,6,23,.92)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <button
        type="button"
        onClick={onFechar}
        aria-label="Fechar visualização em tela cheia"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(148,163,184,.12)',
          border: '1px solid rgba(148,163,184,.25)',
          color: '#f1f5f9',
          borderRadius: 8,
          padding: '8px 14px',
          fontSize: '.78rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Fechar ✕
      </button>

      {total > 1 ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '8px 14px',
            borderRadius: 12,
            background: 'linear-gradient(165deg, rgba(99,102,241,.32) 0%, rgba(67,56,202,.28) 100%)',
            border: '1px solid rgba(165,180,252,.55)',
            boxShadow: '0 4px 24px rgba(99,102,241,.35), 0 0 0 1px rgba(255,255,255,.08)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            type="button"
            onClick={anterior}
            disabled={indice === 0}
            aria-label="Tela anterior"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 12px',
              borderRadius: 8,
              border: '1px solid rgba(165,180,252,.45)',
              background: indice === 0 ? 'rgba(15,23,42,.35)' : 'rgba(99,102,241,.55)',
              color: indice === 0 ? '#64748b' : '#f8fafc',
              fontSize: '.78rem',
              fontWeight: 700,
              cursor: indice === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <CaretLeft size={15} weight="bold" aria-hidden />
            Anterior
          </button>
          <span style={{
            fontSize: '.82rem',
            fontWeight: 800,
            color: '#e0e7ff',
            letterSpacing: '.06em',
            minWidth: 48,
            textAlign: 'center',
          }}>
            {indice + 1} / {total}
          </span>
          <button
            type="button"
            onClick={proximo}
            disabled={indice >= total - 1}
            aria-label="Próxima tela"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 12px',
              borderRadius: 8,
              border: '1px solid rgba(165,180,252,.45)',
              background: indice >= total - 1 ? 'rgba(15,23,42,.35)' : 'rgba(99,102,241,.55)',
              color: indice >= total - 1 ? '#64748b' : '#f8fafc',
              fontSize: '.78rem',
              fontWeight: 700,
              cursor: indice >= total - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Próximo
            <CaretRight size={15} weight="bold" aria-hidden />
          </button>
        </div>
      ) : null}

      <ImagemModalManual
        key={tela.imagem}
        src={tela.imagem}
        alt={tela.titulo}
        maxHeight={total > 1 ? 'calc(92vh - 80px)' : '92vh'}
      />
    </div>
  )

  return createPortal(modal, document.body)
}

const MINI_LARGURA = 94
const MINI_ALTURA = 56

export function ManualInfograficoMiniaturaSequenciaTelas({
  telas,
  rotulo,
}: {
  telas: TelaSequenciaInfografico[]
  rotulo: string
}) {
  const [aberto, setAberto] = useState(false)

  if (telas.length === 0) return null

  const preview = telas[0]

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setAberto(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setAberto(true)
          }
        }}
        aria-label={`${rotulo}: abrir sequência de ${telas.length} telas`}
        title={`Ampliar — ${telas.length} telas`}
        style={{
          margin: 0,
          width: MINI_LARGURA,
          borderRadius: 8,
          overflow: 'hidden',
          cursor: 'zoom-in',
          border: 'none',
          outline: 'none',
          boxShadow: '0 0 0 1px rgba(255,255,255,.07), 0 2px 6px rgba(255,255,255,.04), 0 3px 10px rgba(226,232,240,.05)',
          background: '#0f172a',
          position: 'relative',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <ImagemSequenciaManual src={preview.imagem} alt="" altura={MINI_ALTURA} />
        <span style={{ ...ESTILO_AMPLIAR_MINI, position: 'absolute', top: 4, right: 4 }}>
          <ArrowsOut size={10} weight="duotone" aria-hidden />
        </span>
        {telas.length > 1 ? (
          <span style={{
            position: 'absolute',
            left: 3,
            bottom: 3,
            padding: '1px 4px',
            borderRadius: 4,
            background: 'rgba(2,6,23,.85)',
            border: 'none',
            color: '#cbd5e1',
            fontSize: '6px',
            fontWeight: 800,
            lineHeight: 1.2,
          }}>
            {telas.length} telas
          </span>
        ) : null}
      </div>
      {aberto ? (
        <ModalSequenciaTelas telas={telas} indiceInicial={0} onFechar={() => setAberto(false)} />
      ) : null}
    </>
  )
}
