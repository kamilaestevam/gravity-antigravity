import type { ReactNode } from 'react'

export interface SelecaoExcluirProps {
  aberto: boolean
  titulo: string
  descricao: string | ReactNode
  nomeItem?: string
  aoConfirmar: () => void
  aoCancelar: () => void
}
