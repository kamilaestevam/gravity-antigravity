/**
 * Rota visual — bandeira do país + trilha com ícone do modal (Visão Geral / nova cotação).
 */

import React, { useMemo, useState } from 'react'
import { MapPin, MapPinLine } from '@phosphor-icons/react'
import type { ModalFrete } from './types'

export function resolverIsoAlpha2Pais(pais: string, codigoLocal?: string | null): string {
  const raw = (pais ?? '').trim().toUpperCase()
  if (/^[A-Z]{2}$/.test(raw)) return raw

  const codigo = (codigoLocal ?? '').trim().toUpperCase()
  if (codigo.length >= 2 && /^[A-Z]{2}/.test(codigo)) {
    return codigo.slice(0, 2)
  }

  return ''
}

function emojiBandeiraFallback(iso2: string): string {
  if (!/^[A-Z]{2}$/.test(iso2)) return ''
  return String.fromCodePoint(
    ...[...iso2].map((letra) => 0x1f1e6 + letra.charCodeAt(0) - 65),
  )
}

export function BandeiraPaisBidFrete({
  pais,
  codigoLocal,
  className = '',
}: {
  pais: string
  codigoLocal?: string | null
  className?: string
}) {
  const iso2 = useMemo(() => resolverIsoAlpha2Pais(pais, codigoLocal), [pais, codigoLocal])
  const [imagemFalhou, setImagemFalhou] = useState(false)

  if (!iso2) {
    return (
      <span className={`dc-rota-flag-modern dc-rota-flag-modern--vazio ${className}`} aria-hidden>
        —
      </span>
    )
  }

  if (imagemFalhou) {
    return (
      <span
        className={`dc-rota-flag-modern dc-rota-flag-modern--emoji ${className}`}
        aria-hidden
        title={iso2}
      >
        {emojiBandeiraFallback(iso2)}
      </span>
    )
  }

  const slug = iso2.toLowerCase()
  return (
    <span className={`dc-rota-flag-modern ${className}`} title={iso2}>
      <img
        className="dc-rota-flag-modern__img"
      src={`https://flagcdn.com/w40/${slug}.webp`}
      srcSet={`https://flagcdn.com/w80/${slug}.webp 2x`}
      width={24}
      height={18}
        alt=""
        role="presentation"
        loading="lazy"
        decoding="async"
        onError={() => setImagemFalhou(true)}
      />
      <span className="dc-rota-flag-modern__shine" aria-hidden />
    </span>
  )
}

function estiloModalRota(modal: ModalFrete): { cor: string; duracaoAnimacao: string } {
  if (modal === 'AEREO') return { cor: '#a78bfa', duracaoAnimacao: '3.2s' }
  if (modal === 'MARITIMO') return { cor: '#34d399', duracaoAnimacao: '6.5s' }
  return { cor: '#fbbf24', duracaoAnimacao: '5s' }
}

/** Linha tracejada termina antes da seta direcional (origem → destino). */
const TRILHA_PATH = 'M 8,18 L 126,18'
const TRILHA_SETA_PONTOS = '132,18 126,14 126,22'

function FormaTransporteAnimada({ modal, cor }: { modal: ModalFrete; cor: string }) {
  const sombra = { filter: `drop-shadow(0 0 4px ${cor}99)` }

  if (modal === 'AEREO') {
    return (
      <path
        d="M-7,-2 L-2,-2 L1,-6 L3,-6 L2,-2 L6,-1 L8,0 L6,1 L2,2 L3,6 L1,6 L-2,2 L-7,2 Z"
        fill={cor}
        style={sombra}
      />
    )
  }
  if (modal === 'MARITIMO') {
    return (
      <path
        d="M-8,-2 L4,-2 L8,0 L4,2 L-8,2 Z M-5,-2 L-5,-4 L-2,-4 L-2,-2 Z"
        fill={cor}
        style={sombra}
      />
    )
  }
  return (
    <path
      d="M-9,-2 L3,-2 L6,-3 L8,-3 L8.5,-1 L10,-1 L10,2 L8,2 L8,0.5 L3,0.5 L3,2 L-9,2 Z M-6,-2 L-6,-4 L-3,-4 L-3,-2 Z"
      fill={cor}
      style={sombra}
    />
  )
}

/** Trilha com navio, avião ou caminhão animado (mesmo padrão da Visão Geral). */
function TrilhaRotaModal({ modal }: { modal: ModalFrete }) {
  const { cor, duracaoAnimacao } = estiloModalRota(modal)
  const pathId = `dc-rota-path-${modal.toLowerCase()}`

  return (
    <div className="dc-rota-trilha" aria-hidden>
      <svg className="dc-rota-trilha-svg" viewBox="0 0 140 36" preserveAspectRatio="none">
        <path
          id={pathId}
          d={TRILHA_PATH}
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="2"
          strokeDasharray="4 5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={TRILHA_PATH}
          fill="none"
          stroke={cor}
          strokeWidth="1.75"
          strokeDasharray="20 108"
          opacity="0.85"
          vectorEffect="non-scaling-stroke"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="128;0"
            dur={duracaoAnimacao}
            repeatCount="indefinite"
          />
        </path>
        <g>
          <FormaTransporteAnimada modal={modal} cor={cor} />
          <animateMotion
            path={TRILHA_PATH}
            dur={duracaoAnimacao}
            repeatCount="indefinite"
            rotate="auto"
          />
        </g>
        <g className="dc-rota-trilha-seta">
          <polygon
            points={TRILHA_SETA_PONTOS}
            fill={cor}
            style={{ filter: `drop-shadow(0 0 2px ${cor}aa)` }}
          />
        </g>
      </svg>
    </div>
  )
}

function PontoRotaCard({
  tipo,
  rotulo,
  pais,
  codigoLocal,
  nome,
  codigo,
}: {
  tipo: 'origem' | 'destino'
  rotulo: string
  pais: string
  codigoLocal: string
  nome: string
  codigo: string
}) {
  const ehOrigem = tipo === 'origem'
  const IconePonto = ehOrigem ? MapPin : MapPinLine

  return (
    <div className={`dc-rota-ponto dc-rota-ponto--${tipo}`}>
      <BandeiraPaisBidFrete
        pais={pais}
        codigoLocal={codigoLocal}
        className="dc-rota-ponto-bandeira"
      />
      <div className={`dc-rota-ponto-badge dc-rota-ponto-badge--${tipo}`}>
        <span className="dc-rota-ponto-badge-icon" aria-hidden>
          <IconePonto weight="duotone" size={14} />
        </span>
        <span className="dc-rota-ponto-badge-label">{rotulo}</span>
      </div>
      <div className="dc-rota-ponto-corpo">
        <div className="dc-rota-ponto-text">
          <span className="dc-rota-ponto-nome">{nome}</span>
          <span className="dc-rota-ponto-codigo dc-info-mono">{codigo}</span>
        </div>
      </div>
    </div>
  )
}

export interface RotaVisualBidFreteProps {
  modal: ModalFrete
  origemPais: string
  origemCodigo: string
  origemNome: string
  destinoPais: string
  destinoCodigo: string
  destinoNome: string
  rotuloOrigem: string
  rotuloDestino: string
}

export function RotaVisualBidFrete({
  modal,
  origemPais,
  origemCodigo,
  origemNome,
  destinoPais,
  destinoCodigo,
  destinoNome,
  rotuloOrigem,
  rotuloDestino,
}: RotaVisualBidFreteProps) {
  return (
    <div className="dc-rota-visual">
      <PontoRotaCard
        tipo="origem"
        rotulo={rotuloOrigem}
        pais={origemPais}
        codigoLocal={origemCodigo}
        nome={origemNome}
        codigo={origemCodigo}
      />

      <TrilhaRotaModal modal={modal} />

      <PontoRotaCard
        tipo="destino"
        rotulo={rotuloDestino}
        pais={destinoPais}
        codigoLocal={destinoCodigo}
        nome={destinoNome}
        codigo={destinoCodigo}
      />
    </div>
  )
}
