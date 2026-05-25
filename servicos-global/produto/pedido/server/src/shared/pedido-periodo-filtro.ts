/**
 * SSOT de período para agregações Pedido (Lista cards + Dashboard).
 * Alinhado com cardPeriodToDateRange da Lista — inclui `tudo` sem filtro de data.
 */

export interface PeriodoPedidoResolvido {
  from: Date | null
  to: Date
  period: string
}

/** Monta cláusula Prisma opcional de data_emissao_pedido. */
export function clausulaDataEmissaoPedido(from: Date | null, to: Date): Record<string, unknown> {
  if (!from) return {}
  return { data_emissao_pedido: { gte: from, lte: to } }
}

export function resolverPeriodoPedido(
  period: string,
  fromParam?: string,
  toParam?: string,
): PeriodoPedidoResolvido {
  if (fromParam && toParam) {
    return {
      from: new Date(fromParam),
      to: new Date(toParam),
      period,
    }
  }

  if (period.startsWith('custom:')) {
    const [, startStr, endStr] = period.split(':')
    if (startStr && endStr) {
      return {
        from: new Date(`${startStr}T00:00:00.000Z`),
        to: new Date(`${endStr}T23:59:59.999Z`),
        period,
      }
    }
  }

  const to = new Date()
  if (period === 'tudo') {
    return { from: null, to, period }
  }

  const from = new Date()
  switch (period) {
    case '7d':
      from.setDate(to.getDate() - 7)
      break
    case '30d':
      from.setDate(to.getDate() - 30)
      break
    case '90d':
      from.setDate(to.getDate() - 90)
      break
    case '6m':
      from.setMonth(to.getMonth() - 6)
      break
    case '1a':
    case '12m':
      from.setFullYear(to.getFullYear() - 1)
      break
    case 'ytd':
      from.setMonth(0, 1)
      from.setHours(0, 0, 0, 0)
      break
    case 'current_month':
      from.setDate(1)
      from.setHours(0, 0, 0, 0)
      break
    case 'current_year':
      from.setMonth(0, 1)
      from.setHours(0, 0, 0, 0)
      break
    default:
      from.setDate(to.getDate() - 30)
  }

  return { from, to, period }
}

/** Período anterior para Δ% — null quando `tudo` (sem comparável). */
export function resolverPeriodoAnterior(period: string): { from: Date; to: Date } | null {
  if (period === 'tudo') return null

  const now = new Date()
  const prevTo = new Date(now)
  const prevFrom = new Date(now)

  switch (period) {
    case '7d':
      prevTo.setDate(now.getDate() - 7)
      prevFrom.setDate(now.getDate() - 14)
      break
    case '30d':
      prevTo.setDate(now.getDate() - 30)
      prevFrom.setDate(now.getDate() - 60)
      break
    case '90d':
      prevTo.setDate(now.getDate() - 90)
      prevFrom.setDate(now.getDate() - 180)
      break
    case '6m':
      prevTo.setMonth(now.getMonth() - 6)
      prevFrom.setMonth(now.getMonth() - 12)
      break
    case '1a':
    case '12m':
    case 'current_year':
    case 'ytd':
      prevTo.setFullYear(now.getFullYear() - 1)
      prevFrom.setFullYear(now.getFullYear() - 2)
      break
    default:
      prevTo.setDate(now.getDate() - 30)
      prevFrom.setDate(now.getDate() - 60)
  }

  return { from: prevFrom, to: prevTo }
}
