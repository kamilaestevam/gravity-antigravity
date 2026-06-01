import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
  /** `card` — preenchimentos mais fortes para fundos escuros (Hub, vitrine). */
  variant?: 'default' | 'card'
}

export function LogoBidFrete({ size = 24, color = 'currentColor', className, variant = 'default' }: LogoProps) {
  const card = variant === 'card'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ color }}
      className={className}
      aria-hidden="true"
    >
      {/* Ship hull */}
      <path
        d="M2 15H22L20 19H4L2 15Z"
        fill="currentColor"
        opacity={card ? 0.5 : 0.15}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Container on deck */}
      <rect
        x={3.5}
        y={9}
        width={10}
        height={6}
        rx={1}
        fill="currentColor"
        opacity={card ? 0.65 : 0.25}
        stroke="currentColor"
        strokeWidth={1.25}
      />
      {/* Wave */}
      <path
        d="M1 21.5C3 20 5 21.5 7 21.5S11 20 13 20S17 21.5 19 21.5S23 20 23 20"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        opacity={card ? 0.7 : 0.3}
      />
      {/* Airplane — dart shape top-right */}
      <path d="M23 2L14 7.5L16 9.5L21.5 8L23 2Z" fill="currentColor" opacity={card ? 1 : 0.75} />
      <path d="M16 9.5L15 12.5L18 11.5L21.5 8" fill="currentColor" opacity={card ? 0.85 : 0.4} />
    </svg>
  )
}
