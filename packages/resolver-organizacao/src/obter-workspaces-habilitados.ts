/**
 * obter-workspaces-habilitados.ts
 *
 * Helper público para consultar a lista de workspaces que um usuário pode
 * acessar dentro de uma organização. Consumido por produtos (ex: Pedido)
 * para validar filtros multi-workspace em listas.
 *
 * Padrão de uso (dentro de uma rota Express, após `resolverOrganizacao`):
 *
 *   const { tipoUsuario, workspacesHabilitados } =
 *     await obterWorkspacesHabilitadosDoUsuario({
 *       configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
 *       chaveInterna:        process.env.CHAVE_INTERNA_SERVICO!,
 *       idOrganizacao,
 *       idUsuario,
 *     });
 *
 * Retorna sempre `string[]` (nunca string mágica como 'TODOS'). Para
 * MASTER/SAdmin/Admin, a lista contém todos os workspaces ATIVOS da org.
 * Para PADRAO/FORNECEDOR, apenas os habilitados (UsuarioWorkspace.ativo).
 */

import { createConfiguradorClient } from './configurador-client.js';

export interface ObterWorkspacesHabilitadosInput {
  /** URL base do Configurador (ex: http://localhost:8000) */
  configuradorBaseUrl: string;
  /** Chave interna S2S (process.env.CHAVE_INTERNA_SERVICO) */
  chaveInterna: string;
  /** Timeout por tentativa em ms — padrão 5000 */
  timeoutMs?: number;
  /** Retries para 5xx — padrão 3 */
  retries?: number;
  /** Organização do usuário */
  idOrganizacao: string;
  /** Usuário cuja lista de workspaces queremos resolver */
  idUsuario: string;
  /** Correlation ID para trace (gerado se omitido) */
  idCorrelacao?: string;
}

export interface ObterWorkspacesHabilitadosOutput {
  /** Tipo do usuário no Configurador */
  tipoUsuario: 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR';
  /**
   * IDs dos workspaces que o usuário pode acessar nesta organização.
   * SUPER_ADMIN/ADMIN/MASTER → todos os ATIVOS da org.
   * PADRAO/FORNECEDOR       → apenas habilitados (UsuarioWorkspace.ativo).
   */
  workspacesHabilitados: string[];
}

export async function obterWorkspacesHabilitadosDoUsuario(
  input: ObterWorkspacesHabilitadosInput,
): Promise<ObterWorkspacesHabilitadosOutput> {
  const client = createConfiguradorClient({
    baseUrl:      input.configuradorBaseUrl,
    chaveInterna: input.chaveInterna,
    timeoutMs:    input.timeoutMs,
    retries:      input.retries,
  });
  return client.obterWorkspacesHabilitadosDoUsuario({
    idOrganizacao: input.idOrganizacao,
    idUsuario:     input.idUsuario,
    idCorrelacao:  input.idCorrelacao,
  });
}
