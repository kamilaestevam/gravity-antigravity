// src/hooks/use-pode-editar-usuario.ts
//
// Hook de gating UI — replica server-side rules de PATCH /api/v1/usuarios/:id/patente
// e PUT /api/v1/usuarios/:id/workspaces para esconder controles de edição quando
// o ator não tem permissão. **Defesa em profundidade**: backend é a fonte da
// verdade — esse hook serve para UX (esconder botões, desabilitar selects).
//
// Documentação central: skills/seguranca/permissoes/SKILL.md
//
// Regra condicional (decisão dono 2026-05-11):
//   - SUPER_ADMIN: pode atribuir QUALQUER tipo se alvo está em org com
//     hospeda_colaboradores_gravity = true; senão só MASTER/PADRAO/FORNECEDOR.
//   - ADMIN: read-only global (não atribui tipo nenhum).
//   - MASTER: regra existente — só MASTER/PADRAO/FORNECEDOR dentro da própria org.

import { useCarregarTipoUsuario, type TipoUsuario } from './use-carregar-tipo-usuario'

export type TipoUsuarioBackend = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR'

interface AlvoUsuario {
  id_usuario: string
  tipo_usuario: TipoUsuarioBackend
  /** Flag da organização do alvo (vem do backend via /api/v1/me ou /admin/usuarios).
   *  Determina se SAdmin pode atribuir SUPER_ADMIN/ADMIN ao alvo. */
  organizacao_hospeda_colaboradores_gravity: boolean
}

interface PodeEditarUsuario {
  /** Pode abrir o modal de edição (lápis aparece). */
  podeEditar: boolean
  /** Pode alterar `tipo_usuario` do alvo (select habilitado). */
  podeAlterarPatente: boolean
  /** Pode substituir vínculos de workspace (PUT /:id/workspaces). */
  podeAlterarVinculosWorkspace: boolean
  /** Lista de tipos que o ator pode atribuir ao alvo (whitelist). */
  tiposPermitidosParaPatente: TipoUsuarioBackend[]
  /** Razão do bloqueio quando podeEditar=false (exibir em tooltip). */
  motivoBloqueio: string | null
}

const DENY: PodeEditarUsuario = {
  podeEditar: false,
  podeAlterarPatente: false,
  podeAlterarVinculosWorkspace: false,
  tiposPermitidosParaPatente: [],
  motivoBloqueio: null,
}

function tiposParaPatente(
  ator: TipoUsuario,
  alvo: AlvoUsuario,
): TipoUsuarioBackend[] {
  // SUPER_ADMIN: pode atribuir SAdmin/ADMIN APENAS se alvo está em org
  // que hospeda colaboradores Gravity. Senão só os 3 tipos cliente.
  if (ator === 'SUPER_ADMIN') {
    if (alvo.organizacao_hospeda_colaboradores_gravity) {
      return ['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR']
    }
    return ['MASTER', 'PADRAO', 'FORNECEDOR']
  }
  // ADMIN: read-only global — não atribui nada
  if (ator === 'ADMIN') {
    return []
  }
  // MASTER: só intra-org, só os 3 tipos cliente
  if (ator === 'MASTER') {
    if (alvo.tipo_usuario === 'MASTER' || alvo.tipo_usuario === 'SUPER_ADMIN' || alvo.tipo_usuario === 'ADMIN') return []
    return ['MASTER', 'PADRAO', 'FORNECEDOR']
  }
  return []
}

export function usePodeEditarUsuario(alvo: AlvoUsuario | null | undefined): PodeEditarUsuario {
  const { tipoUsuario: ator, pronto: isReady } = useCarregarTipoUsuario()

  if (!isReady || !alvo || !ator) return DENY

  // PADRAO/FORNECEDOR não podem gerir ninguém
  if (ator === 'PADRAO' || ator === 'FORNECEDOR') {
    return { ...DENY, motivoBloqueio: 'Apenas Master ou Super Admin podem editar usuários' }
  }

  // ADMIN é read-only global (decisão dono 2026-05-11 — skill seguranca/permissoes)
  if (ator === 'ADMIN') {
    return { ...DENY, motivoBloqueio: 'ADMIN é read-only global — visualiza tudo mas não edita' }
  }

  // MASTER: só edita dentro da própria org, e nunca outro MASTER/SAdmin/ADMIN
  if (ator === 'MASTER') {
    if (alvo.tipo_usuario === 'MASTER') {
      return { ...DENY, motivoBloqueio: 'Master não pode editar outro Master' }
    }
    if (alvo.tipo_usuario === 'SUPER_ADMIN' || alvo.tipo_usuario === 'ADMIN') {
      return { ...DENY, motivoBloqueio: 'Master não pode editar usuários Gravity' }
    }
  }

  // SUPER_ADMIN: passa direto (incluindo self-edit — Interpretação B do dono 2026-05-11).
  // Anti-bricking último SAdmin fica como defesa final no backend.

  const tipos = tiposParaPatente(ator, alvo)
  const podeAlterarVinculos =
    alvo.tipo_usuario === 'PADRAO' || alvo.tipo_usuario === 'FORNECEDOR'

  return {
    podeEditar: true,
    podeAlterarPatente: tipos.length > 0,
    podeAlterarVinculosWorkspace: podeAlterarVinculos,
    tiposPermitidosParaPatente: tipos,
    motivoBloqueio: null,
  }
}
