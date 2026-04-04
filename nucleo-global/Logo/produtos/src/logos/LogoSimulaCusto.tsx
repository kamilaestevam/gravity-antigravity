import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoSimulaCusto({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      <rect x={5} y={2.5} width={14} height={19} rx={2.5} fill="currentColor" opacity={0.1} stroke="currentColor" strokeWidth={1.5} />
      <rect x={8} y={5.5} width={8}  height={4.5} rx={1} fill="currentColor" opacity={0.25} />
      <line x1={10.5} y1={7.5} x2={14.5} y2={7.5} stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" />
      <circle cx={9}  cy={14}   r={1.1} fill="currentColor" />
      <circle cx={12} cy={14}   r={1.1} fill="currentColor" />
      <circle cx={15} cy={14}   r={1.1} fill="currentColor" />
      <circle cx={9}  cy={17.5} r={1.1} fill="currentColor" opacity={0.4} />
      <circle cx={12} cy={17.5} r={1.1} fill="currentColor" opacity={0.4} />
      <circle cx={15} cy={17.5} r={1.1} fill="currentColor" opacity={0.8} />
    </svg>
  )
}
