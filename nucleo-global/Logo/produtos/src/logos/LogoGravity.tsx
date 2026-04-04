import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoGravity({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      <polygon
        points="12,2 21.5,7.5 21.5,16.5 12,22 2.5,16.5 2.5,7.5"
        fill="currentColor"
        opacity={0.1}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <polygon
        points="12,5.5 18.5,9.25 18.5,15.25 12,19 5.5,15.25 5.5,9.25"
        fill="currentColor"
        opacity={0.08}
      />
      <circle cx={12} cy={12} r={3} fill="currentColor" />
    </svg>
  )
}
