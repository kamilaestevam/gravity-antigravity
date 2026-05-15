// src/routing/route-policy.ts
//
// Matriz declarativa de autorização de ROTA por tipo_usuario (Cadeia 1).
//
// Esta é a fonte ÚNICA de verdade para:
//   - Wrappers de rota (<AuthorizedRoute>, <ConfiguradorRoute>, <AdminRoute>)
//   - Componentes condicionais (botão "Criar workspace" no Hub, menu lateral)
//   - Hook usePodeAcessar(area)
//
// Granularidade: bloco (área), não sub-rota. Granularidade fina (ação/campo
// dentro da tela) é responsabilidade da Cadeia 2 — ver skill
// `seguranca/permissoes`.
//
// Mandamentos:
//   01 — tipo_usuario vem do banco (via /api/v1/me), nunca de Clerk
//   04 — Master/SuperAdmin nunca são bloqueados (REGRA LIMBO)
//   08 — fail-closed: tipo_usuario indefinido => negar

import type { TipoUsuario } from '../hooks/use-carregar-tipo-usuario'

/** Tipos válidos não-nulos. */
export type TipoUsuarioValido = Exclude<TipoUsuario, null>

/** Áreas de alto nível do app — granularidade da matriz Cadeia 1. */
export type AreaApp =
  | 'admin'          // /admin/* — administração Gravity interna
  | 'configurador'   // /workspace/* — gestão da organização do cliente
  | 'hub'            // /hub — seleção de workspace
  | 'store'          // /store — marketplace de produtos
  | 'core'           // /core/* — área dentro do workspace selecionado
  | 'produto'        // /produto/* — produtos contratados (gating fino é Cadeia 2)

/**
 * Matriz Cadeia 1 — quem pode ABRIR cada área.
 *
 * Convenção do array:
 *   - lista de tipos autorizados a abrir a área (sem importar leitura/escrita)
 *   - Cadeia 2 (granularidade fina) restringe AÇÕES dentro da área
 *   - mutações sensíveis têm middleware backend complementar
 *
 * Decisões travadas com dono em 2026-05-12:
 *   - /workspace/* é bloco único (não granular rota-a-rota)
 *   - ADMIN entra em /workspace mas é read-only (mutação bloqueada no backend)
 *   - PADRAO/FORNECEDOR não entram em /workspace nem em /admin
 *   - PADRAO/FORNECEDOR entram em /hub, /store, /core, /produto com filtros internos
 *   - Botão "Comprar" no /store: SEMPRE bloqueado para PADRAO/FORNECEDOR
 */
export const MATRIZ_ACESSO_AREA: Record<AreaApp, readonly TipoUsuarioValido[]> = {
  admin:        ['SUPER_ADMIN', 'ADMIN'],
  configurador: ['SUPER_ADMIN', 'ADMIN', 'MASTER'],
  hub:          ['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR'],
  store:        ['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR'],
  core:         ['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR'],
  produto:      ['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR'],
} as const

/**
 * Pode o tipo de usuário abrir a área?
 *
 * Mand. 08 — fail-closed: tipoUsuario === null retorna false. Wrappers que
 * chamam esta função devem aguardar `pronto === true` antes de consultar.
 */
export function podeAcessarArea(
  tipoUsuario: TipoUsuario,
  area: AreaApp,
): boolean {
  if (!tipoUsuario) return false
  return (MATRIZ_ACESSO_AREA[area] as readonly string[]).includes(tipoUsuario)
}

/**
 * Pode o tipo de usuário MUTAR (criar/editar/excluir) na área Configurador?
 *
 * Diferente de podeAcessarArea('configurador'): aqui ADMIN é negado
 * (ADMIN é read-only global — pode ver, não pode mexer).
 *
 * Frontend usa esta função para desabilitar botões; backend complementa com
 * middleware `requireConfiguradorMutation`.
 */
export function podeMutarConfigurador(tipoUsuario: TipoUsuario): boolean {
  if (!tipoUsuario) return false
  return tipoUsuario === 'SUPER_ADMIN' || tipoUsuario === 'MASTER'
}

/**
 * Pode o tipo de usuário COMPRAR produtos no /store?
 *
 * Decisão dono 2026-05-12: PADRAO e FORNECEDOR nunca compram (são consumidores
 * do que a org já contratou; Fornecedor é potencial cliente, visualiza mas não
 * adquire).
 */
export function podeComprarNoStore(tipoUsuario: TipoUsuario): boolean {
  if (!tipoUsuario) return false
  return tipoUsuario === 'SUPER_ADMIN'
      || tipoUsuario === 'ADMIN'
      || tipoUsuario === 'MASTER'
}
