import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoProcesso({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      {/* Step 1 */}
      <rect x={1.5}  y={8.5} width={6} height={7} rx={1.5} fill="currentColor" opacity={0.3}  stroke="currentColor" strokeWidth={1.25} />
      {/* Arrow 1→2 */}
      <path d="M7.5 12H10"    stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M8.75 10.5L10.5 12L8.75 13.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Step 2 */}
      <rect x={10}   y={8.5} width={6} height={7} rx={1.5} fill="currentColor" opacity={0.55} stroke="currentColor" strokeWidth={1.25} />
      {/* Arrow 2→3 */}
      <path d="M16 12H18"     stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M17.25 10.5L19 12L17.25 13.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Step 3 */}
      <rect x={18.5} y={8.5} width={6} height={7} rx={1.5} fill="currentColor" opacity={0.9}  stroke="currentColor" strokeWidth={1.25} />
      {/* Progress bar */}
      <rect x={1.5} y={18} width={22} height={2.5} rx={1.25} fill="currentColor" opacity={0.08} />
      <rect x={1.5} y={18} width={14} height={2.5} rx={1.25} fill="currentColor" opacity={0.4} />
      {/* Start node */}
      <circle cx={4.5} cy={5} r={1.5} fill="currentColor" opacity={0.5} />
      <line x1={4.5} y1={6.5} x2={4.5} y2={8.5} stroke="currentColor" strokeWidth={1} opacity={0.4} />
    </svg>
  )
}
