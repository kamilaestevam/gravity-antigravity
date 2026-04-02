export type EcosystemNodeType   = 'gravity' | 'configurador' | 'produto' | 'processo'
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
  /** ID do produto atual — ex: 'bid-cambio' */
  currentProductId: string
  /** Label visível do produto atual — ex: 'Bid Câmbio' */
  currentProductLabel: string
  /** Cor do produto atual — ex: '#06b6d4' */
  currentProductColor: string
  /** Página atual — ex: 'Nova Cotação' */
  currentPageLabel: string
  /** Histórico de navegação (gerenciado pelo hook useLocalizadorHistory) */
  history: LocalizadorEntry[]
  /** Nós do ecossistema a exibir no mapa */
  nodes: EcosystemNode[]
  /** Callback de navegação ao clicar em um nó */
  onNavigate: (node: EcosystemNode) => void
}
