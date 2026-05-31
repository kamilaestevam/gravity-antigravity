/** Helpers de data — popover de edição (paridade lista Pedido). */

export function dateToIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function isoToBR(iso: unknown): string {
  if (!iso || typeof iso !== 'string') return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

export function aplicarMascaraData(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function brToIso(text: string): string | null {
  const parts = text.split('/')
  if (parts.length !== 3) return null
  const dd = parseInt(parts[0], 10)
  const mm = parseInt(parts[1], 10)
  const yyyy = parseInt(parts[2], 10)
  if (Number.isNaN(dd) || Number.isNaN(mm) || Number.isNaN(yyyy) || yyyy < 1000) return null
  const d = new Date(yyyy, mm - 1, dd)
  if (Number.isNaN(d.getTime()) || d.getDate() !== dd) return null
  return dateToIso(d)
}

export function parseDateValor(val: unknown): { inicio: Date | null; fim: null } {
  if (!val || typeof val !== 'string') return { inicio: null, fim: null }
  const d = new Date(val)
  return { inicio: Number.isNaN(d.getTime()) ? null : d, fim: null }
}

export function isoParaHoraInput(iso: string | null | undefined): string {
  if (!iso) return '23:59'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '23:59'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function mesclarDataHoraIso(dataIso: string | null, hora: string): string | null {
  if (!dataIso) return null
  const base = new Date(dataIso)
  if (Number.isNaN(base.getTime())) return null
  const partes = hora.trim().split(':')
  const h = parseInt(partes[0] ?? '0', 10)
  const m = parseInt(partes[1] ?? '0', 10)
  if (Number.isFinite(h) && Number.isFinite(m)) {
    base.setHours(h, m, 0, 0)
  }
  return base.toISOString()
}
