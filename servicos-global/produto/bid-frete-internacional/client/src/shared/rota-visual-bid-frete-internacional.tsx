/**
 * Rota visual — bandeira do país + trilha com ícone do modal (Visão Geral / nova cotação).
 */

import React, { useMemo, useState } from 'react'
import { Anchor, AirplaneTilt, MapPin, MapPinLine, Truck } from '@phosphor-icons/react'
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
        src={`https://flagcdn.com/w80/${slug}.webp`}
        srcSet={`https://flagcdn.com/w160/${slug}.webp 2x`}
        width={48}
        height={36}
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

function IconeModalRota({ modal, size = 18 }: { modal: ModalFrete; size?: number }) {
  if (modal === 'MARITIMO') return <Anchor weight="duotone" size={size} />
  if (modal === 'AEREO') return <AirplaneTilt weight="duotone" size={size} />
  return <Truck weight="duotone" size={size} />
}

/** Setas apontam da origem (esquerda) → destino (direita). */
function TrilhaRotaModal({ modal }: { modal: ModalFrete }) {
  const { cor, duracaoAnimacao } = estiloModalRota(modal)
  const markerId = `dc-rota-arrow-${modal.toLowerCase()}`

  return (
    <div className="dc-rota-trilha" aria-hidden>
      <svg className="dc-rota-trilha-svg" viewBox="0 0 140 32" preserveAspectRatio="none">
        <defs>
          <marker
            id={markerId}
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill={cor} opacity="0.9" />
          </marker>
        </defs>
        <line
          x1="6"
          y1="16"
          x2="134"
          y2="16"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="2"
          strokeDasharray="5 6"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="6"
          y1="16"
          x2="134"
          y2="16"
          stroke={cor}
          strokeWidth="2"
          strokeDasharray="18 122"
          opacity="0.92"
          vectorEffect="non-scaling-stroke"
          markerEnd={`url(#${markerId})`}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="140"
            to="0"
            dur={duracaoAnimacao}
            repeatCount="indefinite"
          />
        </line>
        {/* Chevrons intermediários → direita (sentido origem → destino) */}
        <polygon points="52,16 46,12 46,20" fill={cor} opacity="0.35" />
        <polygon points="78,16 72,12 72,20" fill={cor} opacity="0.55" />
        <polygon points="104,16 98,12 98,20" fill={cor} opacity="0.75" />
      </svg>
      <div
        className="dc-rota-trilha-icon-wrap"
        style={{
          color: cor,
          borderColor: `${cor}66`,
          boxShadow: `0 0 18px ${cor}55`,
        }}
      >
        <IconeModalRota modal={modal} size={18} />
      </div>
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
      <div className={`dc-rota-ponto-badge dc-rota-ponto-badge--${tipo}`}>
        <span className="dc-rota-ponto-badge-icon" aria-hidden>
          <IconePonto weight="duotone" size={14} />
        </span>
        <span className="dc-rota-ponto-badge-label">{rotulo}</span>
      </div>
      <div className="dc-rota-ponto-corpo">
        <BandeiraPaisBidFrete pais={pais} codigoLocal={codigoLocal} />
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
