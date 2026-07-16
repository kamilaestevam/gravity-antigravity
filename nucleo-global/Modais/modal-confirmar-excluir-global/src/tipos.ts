import type { ReactNode } from 'react'

export interface SelecaoExcluirProps {
  aberto: boolean
  titulo: string
  descricao: string | ReactNode
  nomeItem?: string
  aoConfirmar: () => void | Promise<void>
  aoCancelar: () => void
  /** data-sds-tutorial-alvo — demo marketing Pedido */
  dataTutorialAlvoResumo?: string
  dataTutorialAlvoAviso?: string
  dataTutorialAlvoConfirmar?: string
}
