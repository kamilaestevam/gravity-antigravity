/**
 * Store global de formato de data — BID Frete Internacional (padrão Pedido).
 */

export type FormatoDataBidFrete =
  | 'DD/MM/AAAA'
  | 'MM/DD/AAAA'
  | 'AAAA-MM-DD'
  | 'DD.MM.AAAA'
  | 'DD/MM/AA'

export const FORMATOS_DATA_BID_FRETE: Array<{
  valor: FormatoDataBidFrete
  label: string
  exemplo: string
  regiao: string
}> = [
  { valor: 'DD/MM/AAAA', label: 'DD/MM/AAAA', exemplo: '13/04/2026', regiao: 'Brasil, Europa' },
  { valor: 'MM/DD/AAAA', label: 'MM/DD/AAAA', exemplo: '04/13/2026', regiao: 'EUA' },
  { valor: 'AAAA-MM-DD', label: 'AAAA-MM-DD', exemplo: '2026-04-13', regiao: 'ISO 8601, Ásia' },
  { valor: 'DD.MM.AAAA', label: 'DD.MM.AAAA', exemplo: '13.04.2026', regiao: 'Alemanha, Rússia' },
  { valor: 'DD/MM/AA', label: 'DD/MM/AA', exemplo: '13/04/26', regiao: 'Compacto' },
]

export const STORAGE_KEY_FORMATO_DATA_BID_FRETE = 'bid-frete:config:formato-data'
export const SYNC_EVENT_FORMATO_DATA_BID_FRETE = 'bid-frete:formato-data-updated'

const DEFAULT_FORMATO: FormatoDataBidFrete = 'DD/MM/AAAA'

function isFormatoValido(valor: unknown): valor is FormatoDataBidFrete {
  return typeof valor === 'string' && FORMATOS_DATA_BID_FRETE.some(f => f.valor === valor)
}

let _formatoAtual: FormatoDataBidFrete = DEFAULT_FORMATO
let _formatoInicializado = false

function garantirFormatoCarregado(): void {
  if (_formatoInicializado) return
  _formatoInicializado = true
  if (typeof localStorage === 'undefined') return
  _formatoAtual = carregarFormatoDataBidFrete()
}

export function carregarFormatoDataBidFrete(): FormatoDataBidFrete {
  if (typeof localStorage === 'undefined') return DEFAULT_FORMATO
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FORMATO_DATA_BID_FRETE)
    if (!raw) return DEFAULT_FORMATO
    const parsed: unknown = JSON.parse(raw)
    if (isFormatoValido(parsed)) return parsed
    if (isFormatoValido(raw)) return raw
  } catch {
    const raw = localStorage.getItem(STORAGE_KEY_FORMATO_DATA_BID_FRETE)
    if (isFormatoValido(raw)) return raw
  }
  return DEFAULT_FORMATO
}

export function getFormatoDataBidFrete(): FormatoDataBidFrete {
  garantirFormatoCarregado()
  return _formatoAtual
}

export function setFormatoDataBidFrete(formato: FormatoDataBidFrete): void {
  _formatoAtual = formato
  _formatoInicializado = true
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_FORMATO_DATA_BID_FRETE, JSON.stringify(formato))
  } catch {
    /* ignore */
  }
}

export function salvarFormatoDataBidFrete(formato: FormatoDataBidFrete): void {
  setFormatoDataBidFrete(formato)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_FORMATO_DATA_BID_FRETE))
  }
}

export function formatarDataBidFrete(iso: string | Date | null | undefined): string {
  garantirFormatoCarregado()
  if (!iso) return '—'
  const str = iso instanceof Date ? iso.toISOString() : String(iso)
  const dateOnly = str.substring(0, 10)
  const parts = dateOnly.split('-')
  if (parts.length !== 3) return '—'
  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const d = parseInt(parts[2], 10)
  if (!y || !m || !d) return '—'

  const fmt = _formatoAtual
  const dd = String(d).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  const aaaa = String(y)
  const aa = aaaa.slice(2)

  switch (fmt) {
    case 'DD/MM/AAAA':
      return `${dd}/${mm}/${aaaa}`
    case 'MM/DD/AAAA':
      return `${mm}/${dd}/${aaaa}`
    case 'AAAA-MM-DD':
      return `${aaaa}-${mm}-${dd}`
    case 'DD.MM.AAAA':
      return `${dd}.${mm}.${aaaa}`
    case 'DD/MM/AA':
      return `${dd}/${mm}/${aa}`
    default:
      return `${dd}/${mm}/${aaaa}`
  }
}

export function previewFormatoDataBidFrete(formato: FormatoDataBidFrete, data = new Date()): string {
  const d = String(data.getDate()).padStart(2, '0')
  const m = String(data.getMonth() + 1).padStart(2, '0')
  const aaaa = String(data.getFullYear())
  const aa = aaaa.slice(2)
  switch (formato) {
    case 'DD/MM/AAAA':
      return `${d}/${m}/${aaaa}`
    case 'MM/DD/AAAA':
      return `${m}/${d}/${aaaa}`
    case 'AAAA-MM-DD':
      return `${aaaa}-${m}-${d}`
    case 'DD.MM.AAAA':
      return `${d}.${m}.${aaaa}`
    case 'DD/MM/AA':
      return `${d}/${m}/${aa}`
    default:
      return `${d}/${m}/${aaaa}`
  }
}
