import type { ReactNode } from 'react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import type { TituloPaginaTopoOverride } from '@nucleo/menu-topo-global'
import type { TFunction } from 'i18next'

/** Spinner central padrão do BID Frete Internacional — GravityLoader orbital. */
export function ConteudoCarregandoBidFreteInternacional() {
  return (
    <div className="bf-pagina-carregando" role="status" aria-live="polite" aria-busy="true">
      <GravityLoader tamanho="md" />
    </div>
  )
}

interface PaginaCarregandoBidFreteInternacionalProps {
  /** Classes adicionais para PaginaGlobal (ex: bid-frete-page-shell). */
  className?: string
}

/** Página inteira em carregamento — PaginaGlobal + GravityLoader central. */
export function PaginaCarregandoBidFreteInternacional({ className }: PaginaCarregandoBidFreteInternacionalProps) {
  return (
    <PaginaGlobal className={className}>
      <ConteudoCarregandoBidFreteInternacional />
    </PaginaGlobal>
  )
}

/** Override de título para MenuTopoGlobal durante carregamento. */
export function criarTituloCarregandoTopo(icone: ReactNode, t: TFunction): TituloPaginaTopoOverride {
  return {
    label: t('comum.carregando'),
    icone,
  }
}
