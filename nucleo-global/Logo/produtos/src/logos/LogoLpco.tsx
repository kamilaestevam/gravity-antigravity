import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoLpco({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      {/* Document page */}
      <path
        d="M4 2H15.5L20 6.5V22H4V2Z"
        fill="currentColor"
        opacity={0.1}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Corner fold */}
      <path d="M15.5 2V6.5H20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      {/* Text lines */}
      <line x1={7}    y1={10} x2={17}   y2={10} stroke="currentColor" strokeWidth={1.5}  strokeLinecap="round" />
      <line x1={7}    y1={13} x2={14.5} y2={13} stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" opacity={0.5} />
      {/* Official seal */}
      <circle cx={15.5} cy={18.5} r={4}    fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={1.25} />
      <circle cx={15.5} cy={18.5} r={2.25} fill="currentColor" opacity={0.55} />
    </svg>
  )
}
