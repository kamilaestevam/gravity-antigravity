// shared/permissao-bypass.ts
//
// Função pura — Mandamento 04 (LIMBO).
// Importada por backend (middleware + service) e frontend (hook usePermissao).
// MESMA fonte para os 3 lados — duplicação = bug em produção (Mand. 07).
//
// Conceito "gravity_admin" = tipo_usuario IN (SUPER_ADMIN, ADMIN). Não existe coluna
// `gravity_admin` no schema (Mand. 02) — é derivado de `tipo_usuario`.

export type TipoUsuarioBypass = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR' | string

/**
 * Determina se o usuário tem acesso global irrestrito (bypass de permissões granulares).
 * Retorna true para SUPER_ADMIN, ADMIN e MASTER. Demais retornam false.
 *
 * Esquecer qualquer um dos 3 casos prende o usuário em "sem acesso" (regressão Mand. 04).
 */
export function temBypassPermissao(usuario: { tipo_usuario: TipoUsuarioBypass | null | undefined }): boolean {
  return (
    usuario.tipo_usuario === 'SUPER_ADMIN' ||
    usuario.tipo_usuario === 'ADMIN' ||
    usuario.tipo_usuario === 'MASTER'
  )
}
