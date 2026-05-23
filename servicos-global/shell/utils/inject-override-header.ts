/**
 * inject-override-header — utilitário compartilhado para injetar o header
 * `x-organizacao-override` em chamadas HTTP do frontend quando admin Gravity
 * (SUPER_ADMIN/ADMIN) ativou "Trocar Organização".
 *
 * Fluxo:
 *   - Lê `organizacaoOverride` e `currentUser.tipoUsuario` direto do
 *     `useShellStore` (snapshot via `.getState()` — não cria subscription).
 *   - Sem override OU sem tipo admin → retorna `{}` (no-op).
 *   - Com override + tipo admin → retorna `{ 'x-organizacao-override': <id> }`.
 *
 * Defesa em profundidade — o backend (middleware do SDK
 * `@gravity/resolver-organizacao`) é a fonte da verdade que valida o ator a
 * partir do JWT Clerk. Se um não-admin de alguma forma conseguir enviar o
 * header, o backend rejeita com 403 OVERRIDE_NAO_AUTORIZADO. Este filtro
 * apenas evita ruído desnecessário no servidor (Mand. 08 — falha alta no
 * backend continua sendo a garantia).
 *
 * Por que `tipoUsuario` raw (não label traduzido):
 *   Mand. 08 — autorização deve usar enum bruto do banco, nunca label de UI.
 *   `'SUPER_ADMIN'` e `'ADMIN'` são os valores canônicos persistidos em
 *   `Usuario.tipo_usuario` (enum `TipoUsuario` no schema Prisma).
 */

import { useShellStore } from '../store'

/** Tipos de usuário Gravity autorizados a usar override de organização. */
const TIPOS_ADMIN_OVERRIDE = new Set(['SUPER_ADMIN', 'ADMIN'])

/**
 * Retorna headers adicionais (`x-organizacao-override`) quando admin Gravity
 * tem override ativo. Retorna `{}` em qualquer outro caso (no-op).
 *
 * @example
 *   const res = await fetch(url, {
 *     headers: {
 *       Authorization: `Bearer ${token}`,
 *       ...injetarHeaderOverride(),
 *     },
 *   })
 */
export function injetarHeaderOverride(): Record<string, string> {
  const state = useShellStore.getState()
  const override = state.organizacaoOverride
  const tipo = state.currentUser?.tipoUsuario
  if (override === null) return {}
  if (typeof tipo !== 'string' || !TIPOS_ADMIN_OVERRIDE.has(tipo)) return {}
  return { 'x-organizacao-override': override.idOrganizacao }
}
