/**
 * Identidade COMEX — união tipada Empresa (1:1 org) × Fornecedor (parceiro).
 * SSOT §4.1 — snapshots e resolução por SUID no Pedido.
 */
import type { Empresa } from './empresa.schema.js'
import type { Fornecedor } from './fornecedor.schema.js'

export type IdentidadeComex = Empresa | Fornecedor

export function ehEmpresaCadastros(identidade: IdentidadeComex): identidade is Empresa {
  return 'id_empresa' in identidade && typeof identidade.id_empresa === 'string'
}

export function suidIdentidadeComex(identidade: IdentidadeComex): string {
  return ehEmpresaCadastros(identidade) ? identidade.id_empresa : identidade.id_fornecedor
}
