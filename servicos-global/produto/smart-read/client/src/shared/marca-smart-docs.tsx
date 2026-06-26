/**
 * Marca de exibição Smart Docs — SSOT do nome no client do produto.
 * Logo: reexport do núcleo (Hub/Store/produto compartilham o mesmo SVG).
 */
import React from 'react'
import { LogoSmartDocs } from '@nucleo/logo-produtos'

export const NOME_PRODUTO_EXIBICAO = 'Smart Docs' as const

export { LogoSmartDocs }

export function iconeMarcaSmartDocs(size = 22): React.ReactElement {
  return <LogoSmartDocs size={size} />
}
