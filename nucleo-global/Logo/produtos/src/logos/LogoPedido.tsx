import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoPedido({ size = 24, color = 'currentColor', className }: LogoProps) {
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
      {/* Top face */}
      <path
        d="M12 3L21.5 8.5L12 14L2.5 8.5Z"
        fill="currentColor"
        opacity={0.18}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Left face */}
      <path
        d="M2.5 8.5V15.5L12 21V14Z"
        fill="currentColor"
        opacity={0.08}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Right face */}
      <path
        d="M21.5 8.5V15.5L12 21V14Z"
        fill="currentColor"
        opacity={0.25}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <line x1={12} y1={14} x2={12} y2={21} stroke="currentColor" strokeWidth={1} opacity={0.4} />
      <path
        d="M8 5.75L12 3L16 5.75"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
    </svg>
  )
}
