import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'

/** Paridade com escopoWorkspaces em pedido/client/src/App.tsx */
export function resolverEscopoWorkspacesPedidoSimulador(empresas: PerfilEmpresaSimulador[]) {
  if (empresas.length === 0) {
    return { tenantName: 'Minha Empresa', tenantPlan: '' }
  }
  if (empresas.length === 1) {
    return { tenantName: empresas[0].nome, tenantPlan: empresas[0].plano }
  }
  const nomes = empresas.map((empresa) => empresa.nome)
  const preview = nomes.slice(0, 2).join(', ')
  const suffix = nomes.length > 2 ? '…' : ''
  return {
    tenantName: `${empresas.length} workspaces`,
    tenantPlan: `${preview}${suffix}`,
  }
}
