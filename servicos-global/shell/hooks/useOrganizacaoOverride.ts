/**
 * Hook de override de organização para admin Gravity (SUPER_ADMIN/ADMIN).
 *
 * Encapsula a lógica de:
 *  - Saber se o usuário logado PODE ativar override (`podeAtivarOverride`).
 *  - Saber se há override ativo agora (`override !== null`).
 *  - Ativar/desativar override de forma segura (defesa cliente — backend é
 *    a fonte da verdade, valida via JWT em `packages/resolver-organizacao`).
 *
 * Mandamento 04 (LIMBO) + database-governance Regra de Ouro:
 *   "Master/Super Admin são ignorados — acesso global automático."
 *
 * Mandamento 08 — sem fallback silencioso: se `currentUser.tipoUsuario`
 * estiver ausente, `podeAtivarOverride` é `false` (não assume admin).
 *
 * Mandamento 01 — autorização vem do Prisma via `/api/v1/me` (que
 * popula `currentUser.tipoUsuario`), nunca do Clerk publicMetadata.
 */

import { useShellStore } from '../store'
import type { OrganizacaoOverride } from '../store'

const TIPOS_ADMIN_OVERRIDE = new Set(['SUPER_ADMIN', 'ADMIN'])

export interface UsoOrganizacaoOverride {
  /** Override ativo agora (org alvo que o admin está visualizando), ou `null`. */
  override: OrganizacaoOverride | null
  /**
   * `true` quando o usuário logado é SUPER_ADMIN ou ADMIN — pode girar a chave.
   * Lê `currentUser.tipoUsuario` (raw — Mandamento 08).
   */
  podeAtivarOverride: boolean
  /** `true` quando há override ativo (atalho conveniente). */
  overrideAtivo: boolean
  /** Ativa override apontando para org alvo (admin deve ter `podeAtivarOverride`). */
  definirOverride: (override: OrganizacaoOverride) => void
  /** Desativa override — admin volta a operar na própria org. */
  limparOverride: () => void
}

export function useOrganizacaoOverride(): UsoOrganizacaoOverride {
  const override = useShellStore((s) => s.organizacaoOverride)
  const tipoUsuario = useShellStore((s) => s.currentUser.tipoUsuario)
  const definirOrganizacaoOverride = useShellStore((s) => s.definirOrganizacaoOverride)
  const limparOrganizacaoOverride = useShellStore((s) => s.limparOrganizacaoOverride)

  const podeAtivarOverride = typeof tipoUsuario === 'string' && TIPOS_ADMIN_OVERRIDE.has(tipoUsuario)

  return {
    override,
    podeAtivarOverride,
    overrideAtivo: override !== null,
    definirOverride: (nova) => {
      // Defesa cliente — se não-admin tentar chamar (ex: dev confuso), avisa
      // ruidosamente em dev e não persiste. Backend é a defesa real.
      if (!podeAtivarOverride) {
        if (typeof console !== 'undefined') {
          console.warn(
            '[useOrganizacaoOverride] Tentativa de ativar override por usuário não-admin — bloqueada',
            { tipoUsuario },
          )
        }
        return
      }
      definirOrganizacaoOverride(nova)
    },
    limparOverride: limparOrganizacaoOverride,
  }
}
