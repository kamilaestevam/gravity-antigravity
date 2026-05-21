import { memo } from 'react'
import './gravity-loader.css'

export interface GravityLoaderProps {
  texto?: string
  tamanho?: 'sm' | 'md' | 'lg'
}

/* Dados das estrelas de fundo */
const ESTRELAS = [
  { top: '8%', left: '12%', size: '2px', dur: '2.5s', delay: '0s' },
  { top: '15%', left: '78%', size: '1.5px', dur: '3.5s', delay: '0.8s' },
  { top: '82%', left: '22%', size: '2px', dur: '4s', delay: '1.2s' },
  { top: '70%', left: '88%', size: '1px', dur: '3s', delay: '0.4s' },
  { top: '40%', left: '5%', size: '1.5px', dur: '5s', delay: '2s' },
  { top: '25%', left: '92%', size: '2px', dur: '3s', delay: '1.5s' },
  { top: '90%', left: '60%', size: '1px', dur: '4.5s', delay: '0.6s' },
  { top: '5%', left: '45%', size: '1.5px', dur: '2.8s', delay: '1s' },
] as const

export const GravityLoader = memo(function GravityLoader({
  texto,
  tamanho = 'md',
}: GravityLoaderProps) {
  return (
    <div
      className={`gl-container gl-container--${tamanho}`}
      aria-busy="true"
      aria-label={texto ?? 'Carregando...'}
    >
      <div className="gl-cena">
        {/* Constelacao de fundo */}
        <svg className="gl-constellation" viewBox="0 0 420 420">
          <line x1="60" y1="30" x2="140" y2="80" />
          <line x1="140" y1="80" x2="200" y2="50" />
          <line x1="200" y1="50" x2="310" y2="90" />
          <line x1="50" y1="350" x2="120" y2="310" />
          <line x1="120" y1="310" x2="190" y2="360" />
          <line x1="280" y1="340" x2="350" y2="300" />
          <circle cx="60" cy="30" r="2" />
          <circle cx="140" cy="80" r="1.5" />
          <circle cx="200" cy="50" r="2" />
          <circle cx="310" cy="90" r="1.5" />
          <circle cx="50" cy="350" r="1.5" />
          <circle cx="120" cy="310" r="2" />
          <circle cx="280" cy="340" r="1.5" />
          <circle cx="350" cy="300" r="2" />
        </svg>

        {/* Estrelas cintilantes */}
        {ESTRELAS.map((e, i) => (
          <div
            key={i}
            className="gl-star"
            style={{
              top: e.top,
              left: e.left,
              width: e.size,
              height: e.size,
              '--dur': e.dur,
              '--delay': e.delay,
            } as React.CSSProperties}
          />
        ))}

        {/* Nucleo central — hexagono Gravity com aura */}
        <div className="gl-nucleo-wrap">
          <div className="gl-aura-outer" />
          <div className="gl-aura-inner" />
          <svg className="gl-logo-svg" viewBox="0 0 32 32" fill="none">
            <polygon
              points="16,2 28.5,9.25 28.5,22.75 16,30 3.5,22.75 3.5,9.25"
              fill="rgba(67,56,202,0.21)"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Brilho horizontal do disco */}
        <div className="gl-disc-glow" />

        {/* Orbita 1 — interna, rapida */}
        <div className="gl-orbit-tilt gl-tilt-1">
          <div className="gl-orbit gl-orbit-1">
            <div className="gl-orbit-ring" />
            <div className="gl-planet gl-planet-1" />
          </div>
        </div>

        {/* Orbita 2 — media */}
        <div className="gl-orbit-tilt gl-tilt-2">
          <div className="gl-orbit gl-orbit-2">
            <div className="gl-orbit-ring" />
            <div className="gl-planet gl-planet-2" />
          </div>
        </div>

        {/* Orbita 3 — grande */}
        <div className="gl-orbit-tilt gl-tilt-3">
          <div className="gl-orbit gl-orbit-3">
            <div className="gl-orbit-ring" />
            <div className="gl-planet gl-planet-3" />
          </div>
        </div>

        {/* Orbita 4 — externa, lenta */}
        <div className="gl-orbit-tilt gl-tilt-4">
          <div className="gl-orbit gl-orbit-4">
            <div className="gl-orbit-ring" />
            <div className="gl-planet gl-planet-4" />
            <div className="gl-planet gl-planet-5" />
          </div>
        </div>
      </div>

      {texto && (
        <span className="gl-texto" aria-hidden="true">
          <span className="gl-texto-principal">
            <span>{texto}</span>
            <span className="gl-dots">
              <span className="gl-dot gl-dot--1">.</span>
              <span className="gl-dot gl-dot--2">.</span>
              <span className="gl-dot gl-dot--3">.</span>
            </span>
          </span>
        </span>
      )}
    </div>
  )
})
