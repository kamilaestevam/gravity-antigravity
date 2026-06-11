/**
 * Contexto do detalhe do processo — arquivo isolado para evitar import circular
 * ProcessoLayout → ProcessoDetalheRotas → Workflow → ProcessoLayout.
 */
import { createContext, useContext } from 'react'
import type { ProcessoDetail } from '../shared/types'

export interface ProcessoContextValue {
  processo: ProcessoDetail | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const ProcessoContext = createContext<ProcessoContextValue>({
  processo: null,
  loading: true,
  error: null,
  refetch: () => {},
})

export function useProcesso() {
  return useContext(ProcessoContext)
}
