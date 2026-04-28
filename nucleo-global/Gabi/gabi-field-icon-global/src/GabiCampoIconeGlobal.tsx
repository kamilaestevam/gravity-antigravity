import React, { useState, useRef, useEffect, useCallback } from 'react'
import './gabi-field-icon.css'
import type { GabiFieldIconProps } from './tipos'

interface GabiFieldIconInternalProps extends GabiFieldIconProps {
  onConsultar: () => Promise<string>
  carregando:  boolean
  esgotado:    boolean
}

export function GabiCampoIconeGlobal({
  label,
  onConsultar,
  carregando,
  esgotado,
  className = '',
}: GabiFieldIconInternalProps) {
  const [aberto, setAberto]     = useState(false)
  const [resposta, setResposta] = useState<string | null>(null)
  const wrapperRef              = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(async () => {
    if (esgotado || carregando) return
    setAberto(true)
    setResposta(null)
    const res = await onConsultar()
    setResposta(res)
  }, [esgotado, carregando, onConsultar])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    if (aberto) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [aberto])

  const estado = esgotado ? 'esgotado' : carregando ? 'carregando' : 'disponivel'

  const title = esgotado
    ? 'Tokens esgotados este mês'
    : carregando
    ? 'GABI analisando...'
    : `Perguntar à GABI sobre "${label}"`

  return (
    <div className={`gabi-field-icon-wrapper ${className}`} ref={wrapperRef}>
      <span
        className={`gabi-field-icon gabi-field-icon--${estado}`}
        title={title}
        role="button"
        tabIndex={esgotado ? -1 : 0}
        aria-label={title}
        onClick={handleClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
      >
        ✦
      </span>

      {aberto && (
        <div className="gabi-popover" role="dialog" aria-label="GABI">
          <div className="gabi-popover__header">
            <span className="gabi-popover__titulo">✦ GABI</span>
            <button
              className="gabi-popover__fechar"
              onClick={() => setAberto(false)}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
          <div className="gabi-popover__body">
            {!resposta ? (
              <>
                <div className="gabi-skeleton gabi-skeleton--longa" />
                <div className="gabi-skeleton gabi-skeleton--media" />
              </>
            ) : (
              <p className="gabi-resposta">{resposta}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
