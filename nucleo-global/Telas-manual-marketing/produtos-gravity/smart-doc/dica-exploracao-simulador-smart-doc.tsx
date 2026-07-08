/**
 * dica-exploracao-simulador-smart-doc.ts — estado da affordance (demo interativa)
 */

import { useCallback, useState } from 'react'

export function useDicaExploracaoSimulador({ habilitado = true }: { habilitado?: boolean }) {
  const [concluido, setConcluido] = useState(false)
  const ativo = habilitado && !concluido

  const registrarInteracao = useCallback(() => {
    if (!habilitado || concluido) return
    setConcluido(true)
  }, [habilitado, concluido])

  return { ativo, registrarInteracao }
}
