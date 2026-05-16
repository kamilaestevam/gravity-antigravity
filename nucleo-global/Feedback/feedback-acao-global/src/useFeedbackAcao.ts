import { useState, useCallback, useRef } from 'react'

export type EstadoFeedback = 'idle' | 'salvando' | 'sucesso' | 'erro'

export interface FeedbackAcaoOpcoes {
  duracaoSucesso?: number
  duracaoErro?: number
}

export interface FeedbackAcaoRetorno {
  estado: EstadoFeedback
  classe: string
  iniciar: () => void
  sucesso: () => void
  erro: () => void
  resetar: () => void
  executar: <T>(promessa: Promise<T>) => Promise<T>
}

export function useFeedbackAcao(opcoes?: FeedbackAcaoOpcoes): FeedbackAcaoRetorno {
  const duracaoSucesso = opcoes?.duracaoSucesso ?? 800
  const duracaoErro = opcoes?.duracaoErro ?? 1200
  const [estado, setEstado] = useState<EstadoFeedback>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const limparTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const iniciar = useCallback(() => {
    limparTimer()
    setEstado('salvando')
  }, [limparTimer])

  const sucesso = useCallback(() => {
    limparTimer()
    setEstado('sucesso')
    timerRef.current = setTimeout(() => setEstado('idle'), duracaoSucesso)
  }, [limparTimer, duracaoSucesso])

  const erro = useCallback(() => {
    limparTimer()
    setEstado('erro')
    timerRef.current = setTimeout(() => setEstado('idle'), duracaoErro)
  }, [limparTimer, duracaoErro])

  const resetar = useCallback(() => {
    limparTimer()
    setEstado('idle')
  }, [limparTimer])

  const executar = useCallback(async <T>(promessa: Promise<T>): Promise<T> => {
    iniciar()
    try {
      const resultado = await promessa
      sucesso()
      return resultado
    } catch (e) {
      erro()
      throw e
    }
  }, [iniciar, sucesso, erro])

  const classe = estado === 'idle' ? '' : `gfa--${estado}`

  return { estado, classe, iniciar, sucesso, erro, resetar, executar }
}
