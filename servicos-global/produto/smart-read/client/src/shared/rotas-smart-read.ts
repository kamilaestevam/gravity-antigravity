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

/** Nova aba — SPA busca o arquivo com headers de org (BFF exige x-id-organizacao). */
export function rotaVisualizarArquivoLeituraSmartRead(
  idLeitura: string,
  idArquivo: string,
  nomeArquivo?: string,
): string {
  const base = `/smart-read/visualizar-arquivo/${encodeURIComponent(idLeitura)}/${encodeURIComponent(idArquivo)}`
  const nome = nomeArquivo?.trim()
  return nome ? `${base}?nome=${encodeURIComponent(nome)}` : base
}
