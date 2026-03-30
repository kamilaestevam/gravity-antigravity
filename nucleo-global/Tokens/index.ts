/**
 * @nucleo/tokens — Design Tokens do Gravity Design System
 *
 * Importar este módulo injeta todas as variáveis CSS globais.
 * Uso: import '@nucleo/tokens' no entry point da aplicação.
 */
import './tokens.css'

/* ─── Tokens como constantes TypeScript (para uso em JS quando necessário) ─── */

export const cores = {
  bgBody:       '#0f172a',
  bgBase:       '#1e293b',
  bgSurface:    '#334155',
  bgElevated:   '#475569',
  accent:       '#818cf8',
  accentHover:  '#6366f1',
  textPrimary:  '#f1f5f9',
  textSecondary:'#94a3b8',
  textMuted:    '#64748b',
  success:      '#22c55e',
  warning:      '#f59e0b',
  danger:       '#ef4444',
} as const

export const coresLight = {
  bgBody:       '#f1f5f9',
  bgBase:       '#f8fafc',
  bgSurface:    '#ffffff',
  bgElevated:   '#e2e8f0',
  accent:       '#4f46e5',
  accentHover:  '#4338ca',
  accentDim:    '#e0e7ff',
  accentSoft:   '#eef2ff',
  textPrimary:  '#1e293b',
  textSecondary:'#334155',
  textMuted:    '#475569',
  success:      '#16a34a',
  successSoft:  '#dcfce7',
  warning:      '#b45309',
  warningSoft:  '#fef3c7',
  danger:       '#dc2626',
  dangerSoft:   '#fee2e2',
  borderDefault:'#cbd5e1',
  borderAccent: '#a5b4fc',
} as const

export const espacamento = {
  1:  '0.25rem',
  2:  '0.5rem',
  3:  '0.75rem',
  4:  '1rem',
  5:  '1.25rem',
  6:  '1.5rem',
  8:  '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
} as const

export const raios = {
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  pill: '9999px',
} as const
