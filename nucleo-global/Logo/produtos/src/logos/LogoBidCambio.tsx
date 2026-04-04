import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoBidCambio({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      {/* Coin outer */}
      <circle cx={12} cy={12} r={6.5} fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={1.5} />
      {/* Coin inner */}
      <circle cx={12} cy={12} r={3.5} fill="currentColor" opacity={0.25} />
      {/* Top arc arrow — left to right (primary, full opacity) */}
      <path d="M6.5 8C8 5.5 10.5 4 13.5 4.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" fill="none" />
      <path d="M13.5 4.5L15.5 3L15 5.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom arc arrow — right to left (secondary, softer) */}
      <path d="M17.5 16C16 18.5 13.5 20 10.5 19.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" fill="none" opacity={0.5} />
      <path d="M10.5 19.5L8.5 21L9 18.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
    </svg>
  )
}
