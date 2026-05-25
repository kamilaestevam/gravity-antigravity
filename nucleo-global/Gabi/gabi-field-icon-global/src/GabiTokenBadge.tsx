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
  const contratados = quotaMensal
  const saldo = Math.max(0, contratados - tokensUsados)
  const percentual = contratados > 0 ? Math.round((tokensUsados / contratados) * 100) : 0
  const variante   = calcVariante(percentual)

  return (
    <span
      className={`gabi-token-badge gabi-token-badge--${variante} ${className}`}
      title={`Organizacao: ${tokensUsados.toLocaleString('pt-BR')} consumidos · ${saldo.toLocaleString('pt-BR')} saldo · ${contratados.toLocaleString('pt-BR')} contratados no mes (${percentual}%)`}
      aria-label={`GABI tokens: ${tokensUsados} usados, ${saldo} saldo, ${contratados} contratados`}
    >
      ✦ {tokensUsados.toLocaleString('pt-BR')} usados · {saldo.toLocaleString('pt-BR')} saldo · {contratados.toLocaleString('pt-BR')} contratados
    </span>
  )
}
