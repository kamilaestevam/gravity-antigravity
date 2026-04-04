import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoFinanceiroComex({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      {/* Bar 1 — short */}
      <rect x={2}    y={14} width={5} height={7}  rx={1} fill="currentColor" opacity={0.25} />
      {/* Bar 2 — medium */}
      <rect x={9.5}  y={9}  width={5} height={12} rx={1} fill="currentColor" opacity={0.55} />
      {/* Bar 3 — tall */}
      <rect x={17}   y={4}  width={5} height={17} rx={1} fill="currentColor" opacity={0.9} />
      {/* Baseline */}
      <line x1={1} y1={21.5} x2={23} y2={21.5} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      {/* Trend line */}
      <path
        d="M4.5 17L12 12L19.5 7"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
      {/* Globe hint */}
      <circle cx={20} cy={3.5} r={1.5} fill="currentColor" opacity={0.3} />
    </svg>
  )
}
