import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoCore({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      <rect x={2.5}  y={2.5}  width={8.5} height={8.5} rx={2} fill="currentColor" opacity={0.25} stroke="currentColor" strokeWidth={1.5} />
      <rect x={13}   y={2.5}  width={8.5} height={8.5} rx={2} fill="currentColor" opacity={0.1}  stroke="currentColor" strokeWidth={1.5} />
      <rect x={2.5}  y={13}   width={8.5} height={8.5} rx={2} fill="currentColor" opacity={0.1}  stroke="currentColor" strokeWidth={1.5} />
      <rect x={13}   y={13}   width={8.5} height={8.5} rx={2} fill="currentColor" opacity={0.4}  stroke="currentColor" strokeWidth={1.5} />
    </svg>
  )
}
