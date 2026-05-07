// src/hooks/use-pode-editar-usuario.ts
//
// Hook de gating UI — replica server-side rules de PATCH /api/v1/usuarios/:id/patente
// e PUT /api/v1/usuarios/:id/workspaces para esconder controles de edição quando
// o ator não tem permissão. **Defesa em profundidade**: backend é a fonte da
// verdade — esse hook serve para UX (esconder botões, desabilitar selects).
//
// Documentação central: skills/seguranca/permissoes/SKILL.md

import { useCarregarTipoUsuario, type TipoUsuario } from './use-carregar-tipo-usuario'

export type TipoUsuarioBackend = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR'

interface AlvoUsuario {
  id_usuario: string
  tipo_usuario: TipoUsuarioBackend
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
  alvo: TipoUsuarioBackend,
): TipoUsuarioBackend[] {
  if (ator === 'SUPER_ADMIN') {
    return ['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR']
  }
  if (ator === 'ADMIN') {
    if (alvo === 'SUPER_ADMIN') return []
    return ['ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR']
  }
  if (ator === 'MASTER') {
    if (alvo === 'MASTER' || alvo === 'SUPER_ADMIN' || alvo === 'ADMIN') return []
    return ['MASTER', 'PADRAO', 'FORNECEDOR']
  }
  return []
}

export function usePodeEditarUsuario(alvo: AlvoUsuario | null | undefined): PodeEditarUsuario {
  const { tipoUsuario: ator, pronto: isReady } = useCarregarTipoUsuario()

  if (!isReady || !alvo || !ator) return DENY

  // Anti-escalada: ator nunca edita o próprio registro
  // Comparação é por id_usuario; o hook não tem acesso ao id do ator,
  // então o caller deve passar `alvo` somente quando alvo.id_usuario !== ator.id.
  // Aqui só checamos por tipo_usuario.

  // PADRAO/FORNECEDOR não podem gerir ninguém
  if (ator === 'PADRAO' || ator === 'FORNECEDOR') {
    return { ...DENY, motivoBloqueio: 'Apenas Master, Admin ou Super Admin podem editar usuários' }
  }

  // ADMIN/MASTER/SUPER_ADMIN — derivar permissões por relação ator×alvo
  if (ator === 'MASTER') {
    if (alvo.tipo_usuario === 'MASTER') {
      return { ...DENY, motivoBloqueio: 'Master não pode editar outro Master' }
    }
    if (alvo.tipo_usuario === 'SUPER_ADMIN' || alvo.tipo_usuario === 'ADMIN') {
      return { ...DENY, motivoBloqueio: 'Master não pode editar usuários Gravity' }
    }
  }

  if (ator === 'ADMIN' && alvo.tipo_usuario === 'SUPER_ADMIN') {
    return { ...DENY, motivoBloqueio: 'Admin não pode editar Super Admin' }
  }

  const tipos = tiposParaPatente(ator, alvo.tipo_usuario)
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
