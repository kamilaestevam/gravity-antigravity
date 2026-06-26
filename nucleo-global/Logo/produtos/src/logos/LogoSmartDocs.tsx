import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
  /** `card` — traços e preenchimentos mais fortes para fundos escuros (Hub puzzle). */
  variant?: 'default' | 'card'
}

/** Logo Smart Docs — pilha de documentos (rebrand Smart Read). */
export function LogoSmartDocs({
  size = 24,
  color = 'currentColor',
  className,
  variant = 'default',
}: LogoProps) {
  const card = variant === 'card'
  const strokeBack = card ? 1.5 : 1.25
  const strokeFront = card ? 1.85 : 1.75
  const fillBack = card ? 0.18 : 0.08
  const fillMid = card ? 0.24 : 0.14
  const fillFront = card ? 0.2 : 0.12

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
        x={3}
        y={6}
        width={10}
        height={13}
        rx={1.5}
        fill="currentColor"
        opacity={fillBack}
        stroke="currentColor"
        strokeWidth={strokeBack}
      />
      <rect
        x={6}
        y={3}
        width={10}
        height={13}
        rx={1.5}
        fill="currentColor"
        opacity={fillMid}
        stroke="currentColor"
        strokeWidth={strokeBack + 0.25}
      />
      <rect
        x={9}
        y={5}
        width={10}
        height={13}
        rx={1.75}
        fill="currentColor"
        opacity={fillFront}
        stroke="currentColor"
        strokeWidth={strokeFront}
      />
      <line
        x1={11.5}
        y1={9}
        x2={16.5}
        y2={9}
        stroke="currentColor"
        strokeWidth={card ? 1.5 : 1.25}
        strokeLinecap="round"
        opacity={card ? 1 : 0.55}
      />
      <line
        x1={11.5}
        y1={12}
        x2={15}
        y2={12}
        stroke="currentColor"
        strokeWidth={card ? 1.5 : 1.25}
        strokeLinecap="round"
        opacity={card ? 0.85 : 0.4}
      />
      <line
        x1={11.5}
        y1={15}
        x2={14}
        y2={15}
        stroke="currentColor"
        strokeWidth={card ? 1.5 : 1.25}
        strokeLinecap="round"
        opacity={card ? 0.75 : 0.35}
      />
    </svg>
  )
}
