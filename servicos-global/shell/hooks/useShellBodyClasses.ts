// Sincroniza as classes globais do <body> com o estado do shell.
//
// Hoje cada página (Hub, Core, AdminLayout, Store, SelecionarWorkspace,
// WorkspaceLayout) tem o próprio useEffect duplicado para aplicar/remover
// `light-theme` e `tooltips-disabled` no document.body. Este hook é o lugar
// único: cada página/layout chama uma vez no nível raiz e o shell cuida do
// resto. Reage a mudanças do store automaticamente.

import { useEffect } from 'react'
import { useShellStore } from '../store'

export function useShellBodyClasses(): void {
  const currentTheme = useShellStore((s) => s.currentTheme)
  const tooltipsDisabled = useShellStore((s) => s.tooltipsDisabled)

  useEffect(() => {
    document.body.classList.toggle('light-theme', currentTheme === 'light')
  }, [currentTheme])

  useEffect(() => {
    document.body.classList.toggle('tooltips-disabled', tooltipsDisabled)
  }, [tooltipsDisabled])
}
