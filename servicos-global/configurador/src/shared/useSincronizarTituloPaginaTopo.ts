import { useEffect } from 'react'
import {
  useDefinirTituloPaginaTopo,
  type TituloPaginaTopoOverride,
} from '@nucleo/menu-topo-global'

/** Sincroniza override dinâmico no topo da página; limpa ao desmontar. */
export function useSincronizarTituloPaginaTopo(override: TituloPaginaTopoOverride | null) {
  const definirTitulo = useDefinirTituloPaginaTopo()

  useEffect(() => {
    definirTitulo(override)
    return () => definirTitulo(null)
  }, [definirTitulo, override])
}
