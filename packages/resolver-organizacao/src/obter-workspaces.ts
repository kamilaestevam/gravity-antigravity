/**
 * obter-workspaces.ts
 *
 * Helper público para batch lookup de workspaces por IDs. Consumido por
 * produtos que precisam snapshot de nome+CNPJ do workspace (ex: Pedido
 * auto-fill ao trocar tipo_operacao em massa).
 *
 * Padrão de uso (dentro de uma rota Express, após `resolverOrganizacao`):
 *
 *   const workspaces = await obterWorkspaces({
 *     configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
 *     chaveInterna:        process.env.CHAVE_INTERNA_SERVICO!,
 *     ids: ['ws-A', 'ws-B', 'ws-C'],
 *   });
 *
 * IDs ausentes (workspace órfão) NÃO geram erro — apenas não aparecem na
 * resposta. Caller decide tratamento (Mand. 08).
 */

import { createConfiguradorClient } from './configurador-client.js';

export interface ObterWorkspacesInput {
  /** URL base do Configurador (ex: http://localhost:8000) */
  configuradorBaseUrl: string;
  /** Chave interna S2S (process.env.CHAVE_INTERNA_SERVICO) */
  chaveInterna: string;
  /** Timeout por tentativa em ms — padrão 5000 */
  timeoutMs?: number;
  /** Retries para 5xx — padrão 3 */
  retries?: number;
  /** IDs dos workspaces a buscar (batch). Strings vazias filtradas. */
  ids: string[];
  /** Correlation ID para trace (gerado se omitido) */
  idCorrelacao?: string;
}

export interface WorkspaceLookupItem {
  idWorkspace: string;
  idOrganizacao: string;
  nomeWorkspace: string;
  /** CNPJ pode ser null (workspace ainda não preencheu fiscal) */
  cnpjWorkspace: string | null;
}

export async function obterWorkspaces(
  input: ObterWorkspacesInput,
): Promise<WorkspaceLookupItem[]> {
  const ids = input.ids.filter((id) => id && id.length > 0);
  if (ids.length === 0) return [];

  const client = createConfiguradorClient({
    baseUrl:      input.configuradorBaseUrl,
    chaveInterna: input.chaveInterna,
    timeoutMs:    input.timeoutMs,
    retries:      input.retries,
  });
  return client.obterWorkspaces({
    ids,
    idCorrelacao: input.idCorrelacao,
  });
}
