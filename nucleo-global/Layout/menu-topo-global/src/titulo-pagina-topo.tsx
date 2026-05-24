import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/** Override dinâmico do título de página no MenuTopoGlobal (ex: detalhe com nome da entidade). */
export interface TituloPaginaTopoOverride {
  label?: string
  icone?: ReactNode
  subtitulo?: string
}

interface TituloPaginaTopoContextValue {
  override: TituloPaginaTopoOverride | null
  definirTitulo: (value: TituloPaginaTopoOverride | null) => void
}

const TituloPaginaTopoContext = createContext<TituloPaginaTopoContextValue | null>(null)

export function TituloPaginaTopoProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<TituloPaginaTopoOverride | null>(null)
  const definirTitulo = useCallback((value: TituloPaginaTopoOverride | null) => {
    setOverride(value)
  }, [])
  const value = useMemo(
    () => ({ override, definirTitulo }),
    [override, definirTitulo],
  )
  return (
    <TituloPaginaTopoContext.Provider value={value}>
      {children}
    </TituloPaginaTopoContext.Provider>
  )
}

export function useTituloPaginaTopoOverride(): TituloPaginaTopoOverride | null {
  return useContext(TituloPaginaTopoContext)?.override ?? null
}

/** Define título dinâmico no top bar; limpa automaticamente ao desmontar. */
export function useDefinirTituloPaginaTopo(): (value: TituloPaginaTopoOverride | null) => void {
  return useContext(TituloPaginaTopoContext)?.definirTitulo ?? (() => {})
}

export function mesclarTituloPaginaTopo(
  base: { label: string; icone?: ReactNode; subtitulo?: string },
  override: TituloPaginaTopoOverride | null,
): { label: string; icone?: ReactNode; subtitulo?: string } {
  if (!override) return base
  return {
    label:     override.label     ?? base.label,
    icone:     override.icone     ?? base.icone,
    subtitulo: override.subtitulo ?? base.subtitulo,
  }
}
