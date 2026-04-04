import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoConfigurador({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      {/* Track 1 */}
      <line x1={3}  y1={7}  x2={21} y2={7}  stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.22} />
      <line x1={3}  y1={7}  x2={8}  y2={7}  stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.55} />
      <circle cx={8}  cy={7}  r={2.5} fill="currentColor" opacity={0.5} stroke="currentColor" strokeWidth={1.5} />
      {/* Track 2 — active */}
      <line x1={3}  y1={12} x2={21} y2={12} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.22} />
      <line x1={3}  y1={12} x2={14} y2={12} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
      <circle cx={14} cy={12} r={2.5} fill="currentColor" stroke="currentColor" strokeWidth={1.5} />
      {/* Track 3 */}
      <line x1={3}  y1={17} x2={21} y2={17} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.22} />
      <line x1={3}  y1={17} x2={18} y2={17} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
      <circle cx={18} cy={17} r={2.5} fill="currentColor" opacity={0.6} stroke="currentColor" strokeWidth={1.5} />
    </svg>
  )
}
