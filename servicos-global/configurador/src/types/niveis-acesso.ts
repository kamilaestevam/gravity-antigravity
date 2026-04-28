/**
 * @niveis-acesso.ts
 * 
 * Documentação e Tipagem Central dos Níveis de Acesso - Sistema Gravity
 * 
 * 1. Super Admin:
 *    - Acesso total e irrestrito a todo o sistema (Configurador, Admin Global, API Cockpit).
 *    - Gerencia organizações (tenants), produtos globais e outros Super Admins.
 * 
 * 2. Admin:
 *    - Acesso administrativo global, porém com permissões específicas delegadas pelo Super Admin.
 *    - Geralmente focado em módulos específicos (ex: apenas Financeiro ou apenas Suporte).
 * 
 * 3. Master:
 *    - Nível máximo dentro de uma Organização (Tenant).
 *    - Tem permissão automática em todos os Workspaces daquela organização.
 *    - Gerencia usuários Standard e Fornecedores da sua organização.
 * 
 * 4. Standard:
 *    - Usuário operacional vinculado a uma Organização.
 *    - Só visualiza e acessa os Workspaces explicitamente habilitados pelo Master.
 *    - Acesso limitado pelas permissões granulares do seu perfil.
 * 
 * 5. Fornecedor (Supplier):
 *    - Usuário externo vinculado a uma Organização para fins consultivos ou de suporte.
 *    - Similar ao Standard: só vê workspaces habilitados e permissões específicas.
 */

export type NivelAcesso = 'Super Admin' | 'Admin' | 'Master' | 'Standard' | 'Fornecedor'

export type UserStatus = 'Ativo' | 'Inativo'

export interface UserBase {
  id: string
  nome: string
  email: string
  tipo: NivelAcesso
  status: UserStatus
  organizacao?: string // Nome ou ID da organização
}

/**
 * Role canônico do backend (UserRole enum em schema.prisma).
 */
export type BackendUserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR'

/**
 * Converte role do backend (SUPER_ADMIN, ADMIN, ...) para o NivelAcesso
 * do frontend (Super Admin, Admin, ...). Default: Standard.
 */
export function mapRole(role: string | null | undefined): NivelAcesso {
  switch (role) {
    case 'SUPER_ADMIN': return 'Super Admin'
    case 'ADMIN':       return 'Admin'
    case 'MASTER':      return 'Master'
    case 'PADRAO':      return 'Standard'
    case 'FORNECEDOR':  return 'Fornecedor'
    default:            return 'Standard'
  }
}

/**
 * Converte NivelAcesso do frontend para o role canônico do backend.
 */
export function nivelToRole(nivel: NivelAcesso): BackendUserRole {
  switch (nivel) {
    case 'Super Admin': return 'SUPER_ADMIN'
    case 'Admin':       return 'ADMIN'
    case 'Master':      return 'MASTER'
    case 'Standard':    return 'PADRAO'
    case 'Fornecedor':  return 'FORNECEDOR'
  }
}
