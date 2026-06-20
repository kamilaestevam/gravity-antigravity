/** rotas-smart-read.ts — rotas canônicas da SPA Smart Read */

export const ROTAS_SMART_READ = {
  insights: '/smart-read/insights',
  lista: '/smart-read/lista',
  dashboard: '/smart-read/dashboard',
  kanban: '/smart-read/kanban',
  leiturasNova: '/smart-read/leituras/nova',
} as const

export type SmartReadVisualizacaoId = 'insights' | 'lista' | 'dashboard' | 'kanban'

export function rotaSmartRead(segmento: SmartReadVisualizacaoId): string {
  return `/smart-read/${segmento}`
}
