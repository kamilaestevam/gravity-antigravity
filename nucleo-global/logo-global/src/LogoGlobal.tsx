import React from 'react'

export interface LogoGlobalProps {
  iconOnly?: boolean
  iconSize?: number
  iconColor?: string
}

export function LogoGlobal({ iconOnly, iconSize = 24, iconColor = '#818cf8' }: LogoGlobalProps) {
  const svg = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" stroke={iconColor} strokeWidth="2.5" />
      <ellipse cx="16" cy="16" rx="6" ry="14" stroke={iconColor} strokeWidth="2" />
      <line x1="2" y1="16" x2="30" y2="16" stroke={iconColor} strokeWidth="1.5" />
    </svg>
  )

  if (iconOnly) return svg

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {svg}
      <span style={{ fontWeight: 700, fontSize: iconSize * 0.7, color: iconColor }}>Gravity</span>
    </span>
  )
}
