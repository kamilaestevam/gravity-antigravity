export type EcosystemNodeType   = 'hub' | 'core' | 'hub-store' | 'configurador' | 'admin' | 'produto'
export type EcosystemNodeStatus = 'current' | 'accessible' | 'locked'

export interface EcosystemNode {
  id: string
  label: string
  sublabel: string
  color: string
  type: EcosystemNodeType
  status: EcosystemNodeStatus
}

export interface LocalizadorEntry {
  productId: string
  productLabel: string
  productColor: string
  pageLabel: string
  pagePath: string
  timestamp: number
}

export interface LocalizadorGlobalProps {
  /** Nome do workspace (empresa) */
  workspaceName: string
  /** Exibe apenas o ícone no trigger (sem label de texto) */
  iconOnly?: boolean
  /** ID do nó atual — 'hub' | 'core' | 'hub-store' | slug do produto */
  currentProductId: string
  /** Label visível do nó atual */
  currentProductLabel: string
  /** Cor do nó atual */
  currentProductColor: string
  /** Página atual dentro do nó */
  currentPageLabel: string
  /** Histórico de navegação (gerenciado pelo hook useLocalizadorHistory) */
  history: LocalizadorEntry[]
  /** Nós do ecossistema a exibir no mapa */
  nodes: EcosystemNode[]
  /**
   * IDs dos nós visitados nessa sessão (além do atual).
   * Usado para renderizar o rastro de navegação no mapa.
   */
  visitedNodeIds?: string[]
  /** Callback de navegação ao clicar em um nó */
  onNavigate: (node: EcosystemNode) => void
}
