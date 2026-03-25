import { useState, useEffect, useCallback, useRef } from 'react'

export function useDirty<T>(valorInicial: T, valorAtual: T) {
  const baseRef = useRef<string>(JSON.stringify(valorInicial))
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const atual = JSON.stringify(valorAtual)
    setDirty(atual !== baseRef.current)
  }, [valorAtual])

  const resetDirty = useCallback((novoBase?: T) => {
    baseRef.current = JSON.stringify(novoBase ?? valorInicial)
    setDirty(false)
  }, [valorInicial])

  return { dirty, resetDirty }
}
