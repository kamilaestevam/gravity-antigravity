import { describe, expect, it } from 'vitest'
import {
  listarCaminhosCamposDados,
  montarCatalogoCampos,
  agregarEntradasCatalogo,
} from '../../../servicos-global/produto/smart-read/server/src/lib/agregar-caminhos-campos-dados-smart-read.ts'

describe('Smart Read — agregar caminhos de campos', () => {
  it('achata objetos aninhados em caminhos com ponto', () => {
    const caminhos = listarCaminhosCamposDados({
      Document: { documentType: 'BL', documentDate: '2024-01-01' },
      OBSERVATIONS: '',
    })
    expect(caminhos.some((c) => c.caminho_campo === 'Document.documentType' && c.preenchido)).toBe(true)
    expect(caminhos.some((c) => c.caminho_campo === 'OBSERVATIONS' && !c.preenchido)).toBe(true)
  })

  it('monta catálogo agregado por tipo de documento', () => {
    const mapa = new Map()
    agregarEntradasCatalogo(mapa, {
      tipoDocumento: 'BL',
      caminhoCampo: 'Exporter.name',
      nomeArquivo: 'a.pdf',
      preenchido: true,
      tipoValor: 'string',
      valorExemplo: 'Acme',
    })
    agregarEntradasCatalogo(mapa, {
      tipoDocumento: 'BL',
      caminhoCampo: 'Exporter.name',
      nomeArquivo: 'b.pdf',
      preenchido: true,
      tipoValor: 'string',
      valorExemplo: 'Beta',
    })
    const catalogo = montarCatalogoCampos(mapa, { totalDocumentos: 2, totalArquivos: 2 })
    expect(catalogo.campos).toHaveLength(1)
    expect(catalogo.campos[0]?.ocorrencias).toBe(2)
  })
})
