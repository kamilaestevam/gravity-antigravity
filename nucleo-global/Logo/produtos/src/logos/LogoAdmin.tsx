import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoAdmin({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      <path
        d="M12 2.5L3.5 7V12C3.5 16.8 7.2 21.3 12 22.5C16.8 21.3 20.5 16.8 20.5 12V7L12 2.5Z"
        fill="currentColor"
        opacity={0.12}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <circle cx={12} cy={10} r={2.5} fill="currentColor" opacity={0.6} stroke="currentColor" strokeWidth={1} />
      <path
        d="M7 18C7 15.2 9.2 13 12 13C14.8 13 17 15.2 17 18"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  )
}
