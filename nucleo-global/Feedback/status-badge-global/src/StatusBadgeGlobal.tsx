/**
 * ═══════════════════════════════════════════════════════════════════════
 * @nucleo/status-badge-global — StatusBadgeGlobal
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Componente GLOBAL de etiqueta de status (badge/pill) da plataforma
 * Gravity. Exibe estados como "Ativa", "Suspensa", "Pendente" etc. em
 * formato de pílula colorida dentro de tabelas, cards e modais.
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  HISTÓRICO                                                        │
 * ├────────────────────────────────────────────────────────────────────┤
 * │  2026-03-26  Criação — extraído de 3 cópias locais:               │
 * │              • AdminPanel.tsx (linha 62)                           │
 * │              • TenantDetail.tsx (linha 231)                        │
 * │              • ModalEditarUsuario.tsx (linha 153)                  │
 * │                                                                    │
 * │  Motivo: as cópias divergiram (cor "Suspensa" era amarela em 2    │
 * │  e vermelha em 1). Um componente centralizado previne isso.       │
 * └────────────────────────────────────────────────────────────────────┘
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  DESIGN SYSTEM — UX 10                                            │
 * ├────────────────────────────────────────────────────────────────────┤
 * │  • Ativa/Ativo:     Verde (#34d399) — rgba(52,211,153,0.12)       │
 * │  • Suspensa/Suspenso: Vermelha (#f87171) — rgba(248,113,113,0.12) │
 * │  • Fallback:        Cinza (#64748b) — rgba(100,116,139,0.12)      │
 * │                                                                    │
 * │  Tipografia: 0.6875rem (11px), font-weight: 700, uppercase        │
 * │  Forma: pill (border-radius: 9999px)                               │
 * │  Borda: 1px solid — mesma cor do bg quando ativo, vermelha quando │
 * │         suspenso para reforçar o alerta visual.                   │
 * └────────────────────────────────────────────────────────────────────┘
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  USO                                                               │
 * ├────────────────────────────────────────────────────────────────────┤
 * │                                                                    │
 * │  import { StatusBadgeGlobal } from '@nucleo/status-badge-global'  │
 * │                                                                    │
 * │  // Básico                                                         │
 * │  <StatusBadgeGlobal valor="Ativa" />                               │
 * │  <StatusBadgeGlobal valor="Suspensa" />                            │
 * │                                                                    │
 * │  // Aceita variações de casing do servidor:                        │
 * │  <StatusBadgeGlobal valor="ACTIVE" />    → exibe "ATIVA"          │
 * │  <StatusBadgeGlobal valor="SUSPENDED" /> → exibe "SUSPENSA"       │
 * │  <StatusBadgeGlobal valor="PAST_DUE" />  → exibe "SUSPENSA"       │
 * │                                                                    │
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @module @nucleo/status-badge-global
 * @version 1.0.0
 */

import React from 'react'

/* ── Tipos ────────────────────────────────────────────────────────── */

/**
 * Props do componente StatusBadgeGlobal.
 *
 * @property valor - String de status vinda do servidor ou do estado local.
 *                   Aceita variações de casing: "Ativa", "ATIVA", "ACTIVE",
 *                   "Suspensa", "SUSPENDED", "PAST_DUE", "Ativo", etc.
 *
 * @property genero - Define se o label fica masculino ("ATIVO"/"SUSPENSO")
 *                    ou feminino ("ATIVA"/"SUSPENSA"). Padrão: 'feminino'.
 *                    Use 'masculino' quando o badge está em contexto de
 *                    usuário ou produto; 'feminino' para organização ou conta.
 *
 * @property style  - Estilos inline adicionais (opcionais).
 */
export interface StatusBadgeGlobalProps {
  valor: string
  genero?: 'masculino' | 'feminino'
  style?: React.CSSProperties
}

/* ── Constantes de cor (UX 10) ───────────────────────────────────── */

/** Verde — estado saudável / ativo */
const COR_ATIVO = '#34d399'
const BG_ATIVO = 'rgba(52,211,153,0.12)'

/** Vermelho — estado de alerta / suspenso / bloqueado */
const COR_SUSPENSO = '#f87171'
const BG_SUSPENSO = 'rgba(248,113,113,0.12)'
const BORDA_SUSPENSO = 'rgba(248,113,113,0.2)'

/** Cinza — estado desconhecido / fallback */
const COR_FALLBACK = '#64748b'
const BG_FALLBACK = 'rgba(100,116,139,0.12)'

/* ── Helpers de identificação ────────────────────────────────────── */

/**
 * Valores aceitos como "ativo". Cobre:
 * - pt-BR: Ativa, Ativo, ATIVA, ATIVO
 * - en-US: ACTIVE (retorno de API)
 */
const VALORES_ATIVOS = new Set([
  'ativa', 'ativo', 'active',
])

/**
 * Valores aceitos como "suspenso". Cobre:
 * - pt-BR: Suspensa, Suspenso, SUSPENSA, SUSPENSO
 * - en-US: SUSPENDED, PAST_DUE (retorno de API de billing)
 */
const VALORES_SUSPENSOS = new Set([
  'suspensa', 'suspenso', 'suspended', 'past_due',
])

/* ── Componente ──────────────────────────────────────────────────── */

/**
 * Renderiza uma pílula (badge) colorida representando o status
 * de uma entidade. A cor é determinada automaticamente pelo
 * valor recebido.
 *
 * @example
 * ```tsx
 * // Em uma tabela de organizações (feminino = padrão)
 * <StatusBadgeGlobal valor={org.status} />
 * // → "ATIVA" (verde) ou "SUSPENSA" (vermelho)
 *
 * // Em uma tabela de usuários (masculino)
 * <StatusBadgeGlobal valor={user.status} genero="masculino" />
 * // → "ATIVO" (verde) ou "SUSPENSO" (vermelho)
 * ```
 */
export function StatusBadgeGlobal({
  valor,
  genero = 'feminino',
  style,
}: StatusBadgeGlobalProps) {
  const valorNorm = valor.toLowerCase().trim()

  const isAtivo = VALORES_ATIVOS.has(valorNorm)
  const isSuspenso = VALORES_SUSPENSOS.has(valorNorm)

  /* ── Cores ── */
  const cor = isAtivo ? COR_ATIVO : isSuspenso ? COR_SUSPENSO : COR_FALLBACK
  const bg = isAtivo ? BG_ATIVO : isSuspenso ? BG_SUSPENSO : BG_FALLBACK
  const borda = isSuspenso ? BORDA_SUSPENSO : bg

  /* ── Label ── */
  let label: string
  if (isAtivo) {
    label = genero === 'masculino' ? 'ATIVO' : 'ATIVA'
  } else if (isSuspenso) {
    label = genero === 'masculino' ? 'SUSPENSO' : 'SUSPENSA'
  } else {
    label = valor.toUpperCase()
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '0.2rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.6875rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: bg,
        color: cor,
        border: `1px solid ${borda}`,
        ...style,
      }}
    >
      {label}
    </span>
  )
}
