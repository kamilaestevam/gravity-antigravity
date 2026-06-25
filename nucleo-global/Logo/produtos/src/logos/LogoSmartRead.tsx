import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
  /** `card` — traços e preenchimentos mais fortes para fundos escuros (Hub puzzle). */
  variant?: 'default' | 'card'
}

export function LogoSmartRead({
  size = 24,
  color = 'currentColor',
  className,
  variant = 'default',
}: LogoProps) {
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
      shapeRendering="geometricPrecision"
    >
      <rect
        x={4}
        y={4}
        width={10}
        height={13}
        rx={1.75}
        fill="currentColor"
        opacity={card ? 0.32 : 0.12}
        stroke="currentColor"
        strokeWidth={card ? 1.75 : 1.5}
      />
      <line
        x1={6.5}
        y1={8}
        x2={11.5}
        y2={8}
        stroke="currentColor"
        strokeWidth={card ? 1.5 : 1.25}
        strokeLinecap="round"
        opacity={card ? 1 : 0.5}
      />
      <line
        x1={6.5}
        y1={11}
        x2={10}
        y2={11}
        stroke="currentColor"
        strokeWidth={card ? 1.5 : 1.25}
        strokeLinecap="round"
        opacity={card ? 0.85 : 0.35}
      />
      <circle
        cx={16}
        cy={16}
        r={card ? 3.75 : 4}
        fill="currentColor"
        opacity={card ? 0.22 : 0.1}
        stroke="currentColor"
        strokeWidth={card ? 2 : 1.5}
      />
      <line
        x1={18.75}
        y1={18.75}
        x2={21.25}
        y2={21.25}
        stroke="currentColor"
        strokeWidth={card ? 2.25 : 1.75}
        strokeLinecap="round"
      />
    </svg>
  )
}
