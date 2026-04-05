import React from 'react'
import './gabi-field-icon.css'
import type { GabiTokenBadgeProps } from './tipos'

function calcVariante(percentual: number): string {
  if (percentual >= 100) return 'vermelho'
  if (percentual >= 90)  return 'laranja'
  if (percentual >= 70)  return 'amarelo'
  return 'verde'
}

export function GabiTokenBadge({ tokensUsados, quotaMensal, className = '' }: GabiTokenBadgeProps) {
  const percentual = quotaMensal > 0 ? Math.round((tokensUsados / quotaMensal) * 100) : 0
  const variante   = calcVariante(percentual)

  return (
    <span
      className={`gabi-token-badge gabi-token-badge--${variante} ${className}`}
      title={`${percentual}% da quota GABI usada este mês`}
      aria-label={`GABI: ${tokensUsados} de ${quotaMensal} tokens usados`}
    >
      ✦ {tokensUsados.toLocaleString('pt-BR')} / {quotaMensal.toLocaleString('pt-BR')}
    </span>
  )
}
