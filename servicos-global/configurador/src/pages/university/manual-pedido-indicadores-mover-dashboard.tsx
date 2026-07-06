import React from 'react'
import { ArrowsOutCardinal } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const estiloLinha: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid rgba(148,163,184,.14)',
  background: 'rgba(8,12,24,.28)',
}

/** Manual Pedido §06 — dicas visuais ao mover widget na grade */
export function ManualPedidoIndicadoresMoverDashboard() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginTop: 16,
      }}
    >
      <div style={estiloLinha}>
        <ArrowsOutCardinal size={32} weight="bold" color="#c4b5fd" aria-hidden />
        <p style={{ margin: 0, fontSize: '.78rem', lineHeight: 1.55, color: CORPO_70 }}>
          Sobre a linha roxa, o cursor vira{' '}
          <span style={{ display: 'inline-flex', verticalAlign: '-3px', margin: '0 3px' }} aria-hidden>
            <ArrowsOutCardinal size={16} weight="bold" color="#c4b5fd" />
          </span>{' '}
          <strong style={{ color: '#e2e8f0' }}>mão aberta</strong> —{' '}
          <strong style={{ color: '#e2e8f0' }}>arraste</strong> o card até a posição desejada.
        </p>
      </div>
      <div style={estiloLinha}>
        <div
          role="img"
          aria-label="Área vermelha de guia na grade"
          style={{
            flexShrink: 0,
            width: 52,
            height: 36,
            borderRadius: 8,
            border: '2px dashed #ef4444',
            background: 'rgba(239,68,68,.22)',
            boxShadow: 'inset 0 0 0 1px rgba(239,68,68,.35)',
          }}
        />
        <p style={{ margin: 0, fontSize: '.78rem', lineHeight: 1.55, color: CORPO_70 }}>
          Enquanto arrasta, a grade exibe uma área em{' '}
          <strong style={{ color: '#fca5a5' }}>vermelho</strong> — é a guia do local onde o card vai
          ficar ao soltar.
        </p>
      </div>
    </div>
  )
}
