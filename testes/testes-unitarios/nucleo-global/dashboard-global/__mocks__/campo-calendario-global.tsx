import React from 'react'

export function CalendarioCampoGlobal(_props: {
  valor?: { inicio: Date | null; fim: Date | null }
  aoMudarValor?: (val: { inicio: Date | null; fim: Date | null }) => void
  initialOpen?: boolean
  semTrigger?: boolean
}) {
  return <div data-testid="calendario-campo-global" />
}

export function CalendarioPainelGlobal(_props: {
  valor?: { inicio: Date | null; fim: Date | null }
  aoMudarValor?: (val: { inicio: Date | null; fim: Date | null }) => void
  onFechar?: () => void
}) {
  return <div data-testid="calendario-painel-global" />
}
