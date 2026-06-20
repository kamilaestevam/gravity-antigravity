import type { StatusLeitura } from './schemas'

export const ROTULO_STATUS_LEITURA: Record<StatusLeitura, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluída',
  FAILED: 'Falhou',
}

export function formatarDataLeitura(iso: string | null): string {
  if (!iso) return '—'
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function formatarPercentualLeitura(valor: number | null): string {
  if (valor == null) return '—'
  const normalizado = valor <= 1 ? valor * 100 : valor
  return `${normalizado.toFixed(1)}%`
}
