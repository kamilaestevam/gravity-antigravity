/**
 * formatadores.ts — Helpers de formatacao para campos do Pedido.
 *
 * Modulo puro: zero dependencias de cliente ou servidor. Usado tanto pelo
 * server (template generator, mapeamento) quanto pelo client (preview do
 * Smart Import, modal de criacao manual).
 *
 * Decisao 11/05/2026: centralizar formatadores no shared evita drift entre
 * `ModalPedidoNovo.formatarNcmInput` e a UI do Smart Import (que mostrava
 * "22222222" cru em vez de "2222.22.22").
 */

/**
 * Formata NCM para o padrao brasileiro "XXXX.XX.XX" (8 digitos com pontos).
 *
 * Aceita qualquer entrada e extrai ate 8 digitos:
 *   "22021000"     -> "2202.10.00"
 *   "2202.10.00"   -> "2202.10.00"  (idempotente)
 *   "2202-10-00"   -> "2202.10.00"
 *   "2202 10 00"   -> "2202.10.00"
 *   "abc 220 def"  -> "220"          (so 3 digitos)
 *   ""             -> ""
 *
 * Para NCM com menos de 8 digitos, formata o quanto tiver:
 *   "2202"     -> "2202"
 *   "220210"   -> "2202.10"
 *   "2202100"  -> "2202.10.0"
 */
export function formatarNcm(raw: string | null | undefined): string {
  if (!raw) return ''
  const digits = String(raw).replace(/\D/g, '').slice(0, 8)
  if (digits.length === 0)      return ''
  if (digits.length <= 4)       return digits
  if (digits.length <= 6)       return `${digits.slice(0, 4)}.${digits.slice(4)}`
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`
}

/**
 * Conjunto de nomes de campos NCM no SSOT. Use para decidir se um valor
 * deve ser formatado via `formatarNcm()` ao exibir.
 *
 * Mantido aqui em vez de inferir por substring porque "ncm_duimp",
 * "ncm_item" etc. tem semanticas distintas mas todos sao NCM.
 */
export const CAMPOS_NCM = new Set([
  'ncm_item',
  'ncm_duimp',
])

/** Retorna true se o campo deve ser formatado como NCM ao exibir. */
export function ehCampoNcm(campoSistema: string | null | undefined): boolean {
  if (!campoSistema) return false
  return CAMPOS_NCM.has(campoSistema)
}

/**
 * Converte numero BR (1.234,56 / 848,30) ou EN (848.30) para number.
 * Usado no Smart Import confirmar e validacao de preview.
 */
export function parseNumeroBr(valor: unknown, fallback = 0): number {
  if (valor === undefined || valor === null || valor === '') return fallback
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : fallback
  const s = String(valor).trim()
  if (!s) return fallback
  const normalizado = s.includes(',') && s.includes('.')
    ? s.replace(/\./g, '').replace(',', '.')
    : s.replace(',', '.')
  const n = Number(normalizado)
  return Number.isFinite(n) ? n : fallback
}

/** Como parseNumeroBr, mas retorna null quando vazio ou invalido (campos opcionais). */
export function parseNumeroBrOpcional(valor: unknown): number | null {
  if (valor === undefined || valor === null || valor === '') return null
  const n = parseNumeroBr(valor, NaN)
  return Number.isFinite(n) ? n : null
}
