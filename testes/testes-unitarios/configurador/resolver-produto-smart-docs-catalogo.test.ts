import { describe, expect, it } from 'vitest'
import {
  ehReferenciaProdutoSmartDocsNoCatalogo,
  slugCatalogoExibicaoAssinaturaSmartDocs,
} from '../../../servicos-global/configurador/server/lib/resolver-produto-smart-docs-catalogo.ts'

describe('resolver-produto-smart-docs-catalogo', () => {
  it('reconhece slug typo e arquivado como Smart Docs', () => {
    expect(ehReferenciaProdutoSmartDocsNoCatalogo('smart-read-')).toBe(true)
    expect(ehReferenciaProdutoSmartDocsNoCatalogo('smart-docs__arquivado__abc12345')).toBe(true)
    expect(ehReferenciaProdutoSmartDocsNoCatalogo('pedido')).toBe(false)
  })

  it('normaliza slug de exibição para smart-read', () => {
    expect(
      slugCatalogoExibicaoAssinaturaSmartDocs('smart-docs__arquivado__x', 'Smart Docs'),
    ).toBe('smart-read')
  })
})
