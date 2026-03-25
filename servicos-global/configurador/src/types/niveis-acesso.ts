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
 *    - Tem permissão automática em todos os Espaços de Trabalho (Workspaces) daquela organização.
 *    - Gerencia usuários Standard e Fornecedores da sua organização.
 * 
 * 4. Standard:
 *    - Usuário operacional vinculado a uma Organização.
 *    - Só visualiza e acessa os Espaços de Trabalho explicitamente habilitados pelo Master.
 *    - Acesso limitado pelas permissões granulares do seu perfil.
 * 
 * 5. Fornecedor (Supplier):
 *    - Usuário externo vinculado a uma Organização para fins consultivos ou de suporte.
 *    - Similar ao Standard: só vê espaços habilitados e permissões específicas.
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
