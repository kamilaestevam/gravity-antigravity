import React from 'react'

interface LogoGlobalProps {
  iconOnly?: boolean
  iconSize?: number
  iconColor?: string
}

export function LogoGlobal({ iconOnly, iconSize = 24, iconColor }: LogoGlobalProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 700,
        fontSize: iconSize * 0.75,
        color: iconColor ?? 'var(--text-primary)',
      }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke={iconColor ?? 'currentColor'} strokeWidth="2.5" />
        <path
          d="M16 6 L16 26 M8 12 L24 12 M10 20 L22 20"
          stroke={iconColor ?? 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {!iconOnly && <span>Gravity</span>}
    </span>
  )
}
