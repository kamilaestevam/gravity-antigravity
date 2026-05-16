import { memo } from 'react'
import './gravity-loader.css'

export interface GravityLoaderProps {
  texto?: string
  tamanho?: 'sm' | 'md' | 'lg'
}

export const GravityLoader = memo(function GravityLoader({
  texto,
  tamanho = 'md',
}: GravityLoaderProps) {
  return (
    <div className={`gl-container gl-container--${tamanho}`} aria-busy="true" aria-label={texto ?? 'Carregando...'}>
      <div className="gl-cena">
        {/* Núcleo central — hexágono Gravity com pulso */}
        <div className="gl-nucleo">
          <svg viewBox="0 0 24 24" fill="none" className="gl-nucleo-svg">
            <polygon
              points="12,2 21.5,7.5 21.5,16.5 12,22 2.5,16.5 2.5,7.5"
              fill="currentColor"
              opacity={0.12}
              stroke="currentColor"
              strokeWidth={1}
              strokeLinejoin="round"
            />
            <polygon
              points="12,5.5 18.5,9.25 18.5,15.25 12,19 5.5,15.25 5.5,9.25"
              fill="currentColor"
              opacity={0.08}
            />
            <circle cx={12} cy={12} r={3} fill="currentColor" />
          </svg>
          <div className="gl-nucleo-glow" />
        </div>

        {/* Órbita 1 — plano horizontal (ligeiramente inclinado) */}
        <div className="gl-orbita gl-orbita--1">
          <div className="gl-anel" />
          <div className="gl-eletron gl-eletron--1" />
        </div>

        {/* Órbita 2 — plano inclinado 60° */}
        <div className="gl-orbita gl-orbita--2">
          <div className="gl-anel" />
          <div className="gl-eletron gl-eletron--2" />
        </div>

        {/* Órbita 3 — plano inclinado -60° */}
        <div className="gl-orbita gl-orbita--3">
          <div className="gl-anel" />
          <div className="gl-eletron gl-eletron--3" />
        </div>

        {/* Partículas ambientais flutuando */}
        <div className="gl-particula gl-particula--1" />
        <div className="gl-particula gl-particula--2" />
        <div className="gl-particula gl-particula--3" />
        <div className="gl-particula gl-particula--4" />
        <div className="gl-particula gl-particula--5" />
        <div className="gl-particula gl-particula--6" />
      </div>

      {texto && (
        <span className="gl-texto" aria-hidden="true">
          <span className="gl-texto-inner">{texto}</span>
          <span className="gl-dots">
            <span className="gl-dot gl-dot--1">.</span>
            <span className="gl-dot gl-dot--2">.</span>
            <span className="gl-dot gl-dot--3">.</span>
          </span>
        </span>
      )}
    </div>
  )
})
