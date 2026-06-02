/** SLA e ciclos do seletor universal — sem dependência de Playwright (unit + E2E). */

export const SLA_MS = 1000

export type AbaSeletor = 'insights' | 'lista' | 'dashboard' | 'kanban'

export const CICLO_ABAS_4: AbaSeletor[] = ['insights', 'lista', 'dashboard', 'kanban']

export const CICLO_ABAS_PROCESSO: AbaSeletor[] = ['lista', 'kanban']

export function assertSla1s(elapsed: number, contexto: string): void {
  if (elapsed > SLA_MS) {
    throw new Error(`${contexto} deve ser <= ${SLA_MS}ms`)
  }
}
