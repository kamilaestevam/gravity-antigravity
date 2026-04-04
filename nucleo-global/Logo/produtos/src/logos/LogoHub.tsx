import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoHub({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      <circle cx={12} cy={12} r={3} fill="currentColor" opacity={0.2} stroke="currentColor" strokeWidth={1.5} />
      <circle cx={4.5} cy={4.5}   r={1.8} fill="currentColor" opacity={0.5} />
      <circle cx={19.5} cy={4.5}  r={1.8} fill="currentColor" opacity={0.5} />
      <circle cx={4.5} cy={19.5}  r={1.8} fill="currentColor" opacity={0.5} />
      <circle cx={19.5} cy={19.5} r={1.8} fill="currentColor" opacity={0.5} />
      <path
        d="M7 7L10 10M14 10L17 7M10 14L7 17M14 14L17 17"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        opacity={0.7}
      />
    </svg>
  )
}
