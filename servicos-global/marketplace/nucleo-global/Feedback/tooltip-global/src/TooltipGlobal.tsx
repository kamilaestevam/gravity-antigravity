import React, { useState, useRef } from 'react'

interface TooltipGlobalProps {
  descricao: string
  children: React.ReactNode
}

export function TooltipGlobal({ descricao, children }: TooltipGlobalProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            padding: '6px 12px',
            borderRadius: 6,
            background: 'var(--bg-elevated, #1a1a2e)',
            color: 'var(--text-secondary, #ccc)',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {descricao}
        </div>
      )}
    </div>
  )
}
