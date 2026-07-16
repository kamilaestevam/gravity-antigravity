import type { StatusLeituraSimulador } from './dados-lista-simulador-smart-doc'

export const ROTULO_STATUS_LEITURA_SIMULADOR: Record<StatusLeituraSimulador, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluída',
  FAILED: 'Falhou',
}

export function formatarDataLeituraSimulador(iso: string | null): string {
  if (!iso) return '—'
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function formatarPercentualLeituraSimulador(valor: number | null): string {
  if (valor == null) return '—'
  const normalizado = valor <= 1 ? valor * 100 : valor
  return `${normalizado.toFixed(1)}%`
}

export function formatarDuracaoMsLeituraSimulador(valor: number | null): string {
  if (valor == null || valor < 0) return '—'
  const totalSegundos = Math.round(valor / 1000)
  if (totalSegundos < 60) return `${totalSegundos}s`
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  if (minutos < 60) return segundos > 0 ? `${minutos}min ${segundos}s` : `${minutos}min`
  const horas = Math.floor(minutos / 60)
  const restoMin = minutos % 60
  return restoMin > 0 ? `${horas}h ${restoMin}min` : `${horas}h`
}

export function formatarSavingHorasLeituraSimulador(minutos: number | null): string {
  if (minutos == null || minutos <= 0) return '—'
  if (minutos < 60) return `${Math.round(minutos)} min`
  const horas = Math.floor(minutos / 60)
  const resto = Math.round(minutos % 60)
  return resto > 0 ? `${horas}h ${resto}min` : `${horas}h`
}

export function formatarSavingValorLeituraSimulador(valor: number | null): string {
  if (valor == null || valor <= 0) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor)
}
