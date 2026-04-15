/**
 * nodes.ts — Fonte única de verdade para os nós estáticos do ecossistema Gravity.
 *
 * Este arquivo vive dentro do @nucleo/localizador-global para que tanto o shell
 * (usado por produtos) quanto o configurador (Hub/Core/Admin/Workspaces) possam
 * importar os mesmos objetos e o mesmo builder — evitando duplicação de cores,
 * labels e sublabels.
 */
import type { EcosystemNode } from './types'

// ── Nós estáticos ─────────────────────────────────────────────────────────────

export const HUB_NODE: EcosystemNode = {
  id: 'hub', label: 'Hub', sublabel: 'workspaces',
  color: '#818cf8', type: 'hub', status: 'accessible',
}

export const CORE_NODE: EcosystemNode = {
  id: 'core', label: 'Core', sublabel: 'workspace',
  color: '#a78bfa', type: 'core', status: 'accessible',
}

export const CONFIGURADOR_NODE: EcosystemNode = {
  id: 'configurador', label: 'Configurador', sublabel: 'auth · billing',
  color: '#f472b6', type: 'configurador', status: 'accessible',
}

export const ADMIN_NODE: EcosystemNode = {
  id: 'admin', label: 'Admin', sublabel: 'gravity hq',
  color: '#10b981', type: 'admin', status: 'accessible',
}

export const HUB_STORE_NODE: EcosystemNode = {
  id: 'hub-store', label: 'Store', sublabel: 'marketplace',
  color: '#fbbf24', type: 'hub-store', status: 'accessible',
}

// ── Builder unificado ─────────────────────────────────────────────────────────

export interface BuildEcosystemNodesOptions {
  /** ID do nó atual — usado para marcar `status: 'current'` */
  currentProductId: string
  /** Produtos do usuário (com seus status já resolvidos pelo consumidor) */
  produtoNodes?: EcosystemNode[]
  /** Se true, inclui o nó ADMIN (somente para SUPER_ADMIN / ADMIN Gravity) */
  includeAdmin?: boolean
  /** Se true, inclui o nó HUB Store (marketplace) */
  includeStore?: boolean
}

/**
 * Fonte única de verdade para montar o array de nós do ecossistema.
 * Todas as telas que renderizam o LocalizadorGlobal DEVEM usar este builder.
 *
 * Retorna: [HUB, CORE, CONFIGURADOR, (ADMIN?), (STORE?), ...produtos]
 * com status 'current' aplicado ao nó cujo id bate com currentProductId.
 */
export function buildEcosystemNodes(opts: BuildEcosystemNodesOptions): EcosystemNode[] {
  const { currentProductId, produtoNodes = [], includeAdmin = false, includeStore = false } = opts

  const apply = (node: EcosystemNode): EcosystemNode =>
    node.id === currentProductId ? { ...node, status: 'current' } : node

  const nodes: EcosystemNode[] = [
    apply(HUB_NODE),
    apply(CORE_NODE),
    apply(CONFIGURADOR_NODE),
  ]

  if (includeAdmin) nodes.push(apply(ADMIN_NODE))
  if (includeStore) nodes.push(apply(HUB_STORE_NODE))

  nodes.push(...produtoNodes.map(p =>
    p.id === currentProductId ? { ...p, status: 'current' as const } : p
  ))

  return nodes
}
