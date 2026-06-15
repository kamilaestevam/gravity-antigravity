/**
 * Helpers de período do Dashboard BID Frete — paridade client getPrevDateRange.
 */

export function intervaloPeriodoAnteriorDashboard(period: string): { from: string; to: string } {
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

  return { from: prevFrom.toISOString(), to: prevTo.toISOString() }
}

/** Período anterior com mesma duração de um intervalo customizado (from/to). */
export function intervaloPeriodoAnteriorPorDatas(from: string, to: string): { from: string; to: string } {
  const start = new Date(from).getTime()
  const end = new Date(to).getTime()
  const duration = Math.max(end - start, 0)
  return {
    from: new Date(start - duration).toISOString(),
    to: new Date(start).toISOString(),
  }
}
