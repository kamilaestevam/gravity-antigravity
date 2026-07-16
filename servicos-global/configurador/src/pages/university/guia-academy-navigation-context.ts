import { createContext } from 'react'

export interface GuiaAcademyNavigationValue {
  produtoSlug: string
  navegarLinkInterno: (href: string) => void
}

export const GuiaAcademyNavigationContext = createContext<GuiaAcademyNavigationValue | null>(null)
