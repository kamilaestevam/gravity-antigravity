/**
 * StepperPassoPassoGlobal — Indicador de passos standalone (sem modal)
 * Use quando o wizard é uma PÁGINA. Para modal, use ModalPassoPassoGlobal.
 * Design System § 12 — Wizard Timeline (Stepper)
 */

import React from 'react'
import { Check } from '@phosphor-icons/react'
import type { PassoConfig } from './ModalPassoPassoGlobal.js'

export interface StepperPassoPassoGlobalProps {
  passos: PassoConfig[]
  passoAtual: number
}

export function StepperPassoPassoGlobal({ passos, passoAtual }: StepperPassoPassoGlobalProps) {
  return (
    <div style={s.stepper} role="list" aria-label="Passos">
      {passos.map((passo, idx) => {
        const status: 'pendente' | 'ativo' | 'feito' =
          passo.id < passoAtual ? 'feito' :
          passo.id === passoAtual ? 'ativo' : 'pendente'

        const circuloStyle = {
          ...s.circulo,
          ...(status === 'ativo' ? s.circuloAtivo : {}),
          ...(status === 'feito' ? s.circuloFeito : {}),
        }
        const labelStyle = {
          ...s.label,
          ...(status === 'ativo' ? s.labelAtivo : {}),
          ...(status === 'feito' ? s.labelFeito : {}),
        }

        return (
          <React.Fragment key={passo.id}>
            <div style={s.passo} role="listitem" aria-current={status === 'ativo' ? 'step' : undefined}>
              <div style={circuloStyle}>
                {status === 'feito'
                  ? <Check size={14} weight="bold" />
                  : (passo.icone ?? passo.id)
                }
              </div>
              <span style={labelStyle}>{passo.label}</span>
            </div>
            {idx < passos.length - 1 && (
              <div
                style={{ ...s.conector, ...(status === 'feito' ? s.conectorFeito : {}) }}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const s = {
  stepper: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    padding: '1.5rem 0',
    overflowX: 'auto' as const,
  },
  passo: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '80px',
    flexShrink: 0,
  },
  circulo: {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    flexShrink: 0,
    borderRadius: '50%',
    background: 'var(--bg-surface, #334155)',
    border: '2px solid var(--bg-elevated, #475569)',
    color: 'var(--text-muted, #64748b)',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  circuloAtivo: {
    background: 'var(--accent, #6366f1)',
    border: '2px solid var(--accent, #6366f1)',
    color: '#fff',
    boxShadow: '0 0 0 4px rgba(99,102,241,0.2)',
  } as React.CSSProperties,
  circuloFeito: {
    background: 'var(--success, #22c55e)',
    border: '2px solid var(--success, #22c55e)',
    color: '#fff',
  } as React.CSSProperties,
  label: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textAlign: 'center' as const,
    color: 'var(--text-muted, #64748b)',
    whiteSpace: 'nowrap' as const,
  },
  labelAtivo: { color: 'var(--accent, #6366f1)' },
  labelFeito: { color: 'var(--success, #22c55e)' },
  conector: {
    flex: 1,
    height: '2px',
    background: 'var(--bg-elevated, #475569)',
    minWidth: '20px',
    marginTop: '-1.25rem',
  } as React.CSSProperties,
  conectorFeito: {
    background: 'var(--success, #22c55e)',
  } as React.CSSProperties,
} as const
