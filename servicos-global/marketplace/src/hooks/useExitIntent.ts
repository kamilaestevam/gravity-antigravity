import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook que detecta intenção de saída do usuário
 * Gatilho: mouseleave com cursor saindo pelo topo da tela (navbar area)
 */
export function useExitIntent(onExit: () => void, delay = 500) {
  const hasTriggered = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Só dispara se o cursor sair pelo topo da tela
    if (e.clientY > 20) return
    if (hasTriggered.current) return

    timeoutRef.current = setTimeout(() => {
      hasTriggered.current = true
      onExit()
    }, delay)
  }, [onExit, delay])

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [handleMouseLeave, handleMouseEnter])

  // Resetar para permitir novo disparo (ex: quando o drawer é fechado)
  const reset = useCallback(() => {
    hasTriggered.current = false
  }, [])

  return { reset }
}
