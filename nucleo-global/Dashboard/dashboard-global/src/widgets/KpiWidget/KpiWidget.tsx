/**
 * KpiWidget — Renderiza um KPI simples usando CardBasicoGlobal
 *
 * Extrai o valor da chave especificada, formata conforme tipo do campo
 * e delega a renderização ao CardBasicoGlobal do design system.
 */

import React from 'react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import type { WidgetDataValue } from '../../tipos.js'

export interface KpiWidgetProps {
  title: string
  data: Record<string, WidgetDataValue>
  fieldKey: string
  fieldType?: 'number' | 'currency' | 'percentage'
  period?: string
}

function extractNumericValue(
  data: Record<string, WidgetDataValue>,
  fieldKey: string,
): number | null {
  const raw = data[fieldKey]
  if (typeof raw === 'number') return raw

  // Tenta pegar o primeiro valor numérico disponível
  const firstValue = Object.values(data)[0]
  if (typeof firstValue === 'number') return firstValue

  return null
}

function formatValue(value: number, fieldType: KpiWidgetProps['fieldType']): string {
  if (fieldType === 'currency') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }
  if (fieldType === 'percentage') {
    return `${value.toFixed(1)}%`
  }
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function KpiWidget({
  title,
  data,
  fieldKey,
  fieldType = 'number',
}: KpiWidgetProps) {
  const numericValue = extractNumericValue(data, fieldKey)
  const isEmpty = numericValue === null || numericValue === 0

  const displayValue = isEmpty ? '--' : formatValue(numericValue, fieldType)

  return (
    <CardBasicoGlobal
      titulo={title}
      valor={displayValue}
      variante="padrao"
      alinhamento="esquerda"
    />
  )
}
