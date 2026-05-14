/**
 * useFormatoData.ts — Store global de formato de data para o produto Pedido
 *
 * Centraliza a escolha de formato de exibição de datas (DD/MM/AAAA, MM/DD/AAAA, etc.)
 * e expõe a função formatarData() usada por fmtData e pelo overlay de edição inline.
 *
 * Fluxo:
 *  1. Configuracoes.tsx salva formato_data via casasDecimaisApi
 *  2. Store é atualizado via setFormatoData()
 *  3. fmtData() lê getFormatoData() — sem re-render, sem Context overhead
 *
 * Por que não Context/useState?
 *  fmtData é chamada em render de tabela com centenas de células — Context causaria
 *  re-render em cascata. Uma variável de módulo + getter síncrono é a solução correta.
 */

export type FormatoData = 'DD/MM/AAAA' | 'MM/DD/AAAA' | 'AAAA-MM-DD' | 'DD.MM.AAAA' | 'DD/MM/AA'

export const FORMATOS_DATA: Array<{ valor: FormatoData; label: string; exemplo: string; regiao: string }> = [
  { valor: 'DD/MM/AAAA', label: 'DD/MM/AAAA', exemplo: '13/04/2026', regiao: 'Brasil, Europa' },
  { valor: 'MM/DD/AAAA', label: 'MM/DD/AAAA', exemplo: '04/13/2026', regiao: 'EUA'            },
  { valor: 'AAAA-MM-DD', label: 'AAAA-MM-DD', exemplo: '2026-04-13', regiao: 'ISO 8601, Ásia' },
  { valor: 'DD.MM.AAAA', label: 'DD.MM.AAAA', exemplo: '13.04.2026', regiao: 'Alemanha, Rússia' },
  { valor: 'DD/MM/AA',   label: 'DD/MM/AA',   exemplo: '13/04/26',   regiao: 'Compacto'       },
]

// ── Store singleton ───────────────────────────────────────────────────────────
// Variável de módulo — leitura síncrona O(1), sem re-render.

const FORMATO_KEY = 'pedido:formato_data'

let _formatoAtual: FormatoData = (() => {
  try {
    const salvo = localStorage.getItem(FORMATO_KEY)
    if (salvo && FORMATOS_DATA.some(f => f.valor === salvo)) return salvo as FormatoData
  } catch { /* ignore */ }
  return 'DD/MM/AAAA'
})()

/** Lê o formato atual. Síncrono — pode ser chamado dentro de render. */
export function getFormatoData(): FormatoData {
  return _formatoAtual
}

/** Atualiza o formato globalmente (chamado ao salvar Configurações). */
export function setFormatoData(formato: FormatoData): void {
  _formatoAtual = formato
  try { localStorage.setItem(FORMATO_KEY, formato) } catch { /* ignore */ }
}

// ── Formatação de data usando o formato do store ──────────────────────────────

/**
 * Formata uma data ISO (ou yyyy-mm-dd) usando o formato configurado pelo tenant.
 * Nunca usa UTC — parseia yyyy-mm-dd com construtor local para evitar off-by-one de fuso.
 */
export function formatarData(iso: string | Date | null | undefined): string {
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
  const dd  = String(d).padStart(2, '0')
  const mm  = String(m).padStart(2, '0')
  const aaaa = String(y)
  const aa   = aaaa.slice(2)

  switch (fmt) {
    case 'DD/MM/AAAA': return `${dd}/${mm}/${aaaa}`
    case 'MM/DD/AAAA': return `${mm}/${dd}/${aaaa}`
    case 'AAAA-MM-DD': return `${aaaa}-${mm}-${dd}`
    case 'DD.MM.AAAA': return `${dd}.${mm}.${aaaa}`
    case 'DD/MM/AA':   return `${dd}/${mm}/${aa}`
    default:           return `${dd}/${mm}/${aaaa}`
  }
}

/**
 * Retorna o placeholder do input de edição inline conforme o formato configurado.
 * Ex: 'DD/MM/AAAA' → 'DD/MM/AAAA', 'AAAA-MM-DD' → 'AAAA-MM-DD'
 */
export function getPlaceholderData(): string {
  return _formatoAtual
}

/**
 * Parseia uma string digitada pelo usuário (no formato configurado) e retorna ISO yyyy-mm-dd.
 * Retorna null se inválida.
 */
export function parsearDataUsuario(input: string): string | null {
  const v = input.trim()
  if (!v) return null
  const fmt = _formatoAtual

  let d: number, m: number, y: number

  if (fmt === 'DD/MM/AAAA' || fmt === 'DD/MM/AA') {
    const sep = v.includes('/') ? '/' : v.includes('-') ? '-' : null
    if (!sep) return null
    const p = v.split(sep)
    if (p.length !== 3) return null
    d = parseInt(p[0], 10); m = parseInt(p[1], 10)
    y = p[2].length === 2 ? 2000 + parseInt(p[2], 10) : parseInt(p[2], 10)
  } else if (fmt === 'MM/DD/AAAA') {
    const p = v.split('/')
    if (p.length !== 3) return null
    m = parseInt(p[0], 10); d = parseInt(p[1], 10); y = parseInt(p[2], 10)
  } else if (fmt === 'AAAA-MM-DD') {
    const p = v.split('-')
    if (p.length !== 3) return null
    y = parseInt(p[0], 10); m = parseInt(p[1], 10); d = parseInt(p[2], 10)
  } else if (fmt === 'DD.MM.AAAA') {
    const p = v.split('.')
    if (p.length !== 3) return null
    d = parseInt(p[0], 10); m = parseInt(p[1], 10); y = parseInt(p[2], 10)
  } else {
    return null
  }

  if (!y || !m || !d || y < 1000) return null
  const date = new Date(y, m - 1, d)
  if (isNaN(date.getTime()) || date.getDate() !== d) return null
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
