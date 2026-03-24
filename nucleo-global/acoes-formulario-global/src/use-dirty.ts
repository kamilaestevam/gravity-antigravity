/**
 * useDirty — Hook de detecção de alterações em formulário.
 *
 * Compara o estado inicial com o estado atual usando JSON.stringify.
 * Retorna { dirty, resetDirty } onde:
 *   - dirty: true quando houver diferença entre inicial e atual
 *   - resetDirty: chama ao salvar/cancelar para marcar o estado atual como "limpo"
 *
 * @example
 * const [dados, setDados] = useState(dadosIniciais)
 * const { dirty, resetDirty } = useDirty(dadosIniciais, dados)
 *
 * async function handleSalvar() {
 *   await salvarNaApi(dados)
 *   resetDirty(dados)  // passa o novo "base" após salvar
 * }
 *
 * function handleCancelar() {
 *   setDados(base)
 *   resetDirty()       // sem argumento: reseta para o valor original
 * }
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export function useDirty<T>(valorInicial: T, valorAtual: T) {
  // Guardamos o "snapshot limpo" — o que estava salvo por último
  const baseRef = useRef<string>(JSON.stringify(valorInicial))
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const atual = JSON.stringify(valorAtual)
    setDirty(atual !== baseRef.current)
  }, [valorAtual])

  /**
   * Redefine o baseline.
   * @param novoBase - se passado, usa este como nova referência; senão usa valorInicial
   */
  const resetDirty = useCallback((novoBase?: T) => {
    baseRef.current = JSON.stringify(novoBase ?? valorInicial)
    setDirty(false)
  }, [valorInicial])

  return { dirty, resetDirty }
}
