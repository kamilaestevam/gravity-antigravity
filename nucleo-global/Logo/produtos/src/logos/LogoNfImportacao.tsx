import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  className?: string
}

export function LogoNfImportacao({ size = 24, color = 'currentColor', className }: LogoProps) {
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
        d="M5 2H15L19 6V22H5V2Z"
        fill="currentColor"
        opacity={0.1}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Corner fold */}
      <path d="M15 2V6H19" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      {/* Text lines */}
      <line x1={8} y1={10} x2={16} y2={10} stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" />
      <line x1={8} y1={13} x2={16} y2={13} stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" />
      {/* Barcode */}
      <line x1={7.5}  y1={17} x2={7.5}  y2={20.5} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1={9.5}  y1={17} x2={9.5}  y2={20.5} stroke="currentColor" strokeWidth={1}   strokeLinecap="round" opacity={0.5} />
      <line x1={11}   y1={17} x2={11}   y2={20.5} stroke="currentColor" strokeWidth={2}   strokeLinecap="round" />
      <line x1={13}   y1={17} x2={13}   y2={20.5} stroke="currentColor" strokeWidth={1}   strokeLinecap="round" opacity={0.5} />
      <line x1={14.5} y1={17} x2={14.5} y2={20.5} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1={16}   y1={17} x2={16}   y2={20.5} stroke="currentColor" strokeWidth={1}   strokeLinecap="round" opacity={0.7} />
    </svg>
  )
}
