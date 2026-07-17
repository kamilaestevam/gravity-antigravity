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

/** Data sem hora (yyyy-mm-dd) — parse local, sem deslocamento UTC (paridade Pedido › formatarData). */
export function formatarDataSomenteDiaLeitura(valor: string | null | undefined): string {
  if (!valor?.trim()) return '—'
  const br = parsearDataSomenteDiaLeituraParaPartes(valor.trim())
  if (br) {
    return `${String(br.d).padStart(2, '0')}/${String(br.m).padStart(2, '0')}/${br.y}`
  }
  return valor.trim()
}

function parsearDataSomenteDiaLeituraParaPartes(
  valor: string,
): { y: number; m: number; d: number } | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (iso) {
    const y = Number(iso[1])
    const m = Number(iso[2])
    const d = Number(iso[3])
    if (y >= 1000 && m >= 1 && m <= 12 && d >= 1 && d <= 31) return { y, m, d }
  }
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor)
  if (br) {
    const d = Number(br[1])
    const m = Number(br[2])
    const y = Number(br[3])
    if (y >= 1000 && m >= 1 && m <= 12 && d >= 1 && d <= 31) return { y, m, d }
  }
  return null
}

/** Normaliza entrada do editor de data para yyyy-mm-dd (local, sem UTC). */
export function normalizarDataSomenteDiaLeitura(valor: unknown): string {
  if (valor == null) return ''
  const bruto = String(valor).trim()
  if (!bruto) return ''
  const partes = parsearDataSomenteDiaLeituraParaPartes(bruto)
  if (partes) {
    return `${partes.y}-${String(partes.m).padStart(2, '0')}-${String(partes.d).padStart(2, '0')}`
  }
  const soData = bruto.substring(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(soData)) return soData
  return bruto
}

export function formatarPercentualLeitura(valor: number | null): string {
  if (valor == null) return '—'
  const normalizado = valor <= 1 ? valor * 100 : valor
  return `${normalizado.toFixed(1)}%`
}

export function formatarDuracaoMsLeitura(valor: number | null): string {
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

export function formatarSavingHorasLeitura(minutos: number | null): string {
  if (minutos == null || minutos <= 0) return '—'
  if (minutos < 60) return `${Math.round(minutos)} min`
  const horas = Math.floor(minutos / 60)
  const resto = Math.round(minutos % 60)
  return resto > 0 ? `${horas}h ${resto}min` : `${horas}h`
}

export function formatarSavingValorLeitura(valor: number | null): string {
  if (valor == null || valor <= 0) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor)
}
