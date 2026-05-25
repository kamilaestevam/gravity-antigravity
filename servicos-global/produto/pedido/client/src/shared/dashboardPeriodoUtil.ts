/**
 * Helpers compartilhados de período do Dashboard Pedido — labels e chips de filtro.
 */

const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export interface PeriodoOpcao {
  value: string
  label: string
}

export function rotuloPeriodoDashboard(
  period: string,
  opcoes: PeriodoOpcao[],
  fallbackPersonalizado: string,
): string {
  if (period.startsWith('custom:')) {
    const [, start, end] = period.split(':')
    if (!start || !end) return fallbackPersonalizado
    const fmt = (d: string) => {
      const [y, m, day] = d.split('-')
      return `${parseInt(day, 10)} ${MESES_CURTOS[parseInt(m, 10) - 1]} ${y}`
    }
    return `${fmt(start)} – ${fmt(end)}`
  }
  return opcoes.find(o => o.value === period)?.label ?? period
}

export function periodoEhPadrao(period: string, padrao = '30d'): boolean {
  return period === padrao
}

export function widgetUsaPeriodoProprio(
  widgetPeriod: string | undefined,
  globalPeriod: string,
  periodLocked: boolean | undefined,
): boolean {
  if (!widgetPeriod) return false
  if (periodLocked) return widgetPeriod !== globalPeriod
  // Gráficos de tendência mantêm 12m por padrão — conta como período próprio
  return widgetPeriod !== globalPeriod
}
