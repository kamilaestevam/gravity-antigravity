import { describe, expect, it } from 'vitest'
import { compararDocumentosConferencia } from '../../../servicos-global/produto/smart-read/client/src/shared/comparar-documentos-conferencia-smart-read.ts'

describe('Smart Read — comparar documentos campo a campo', () => {
  it('marca campos iguais e divergentes alinhando por caminho_campo', () => {
    const resultado = compararDocumentosConferencia(
      { exporter: { name: 'Acme Corp', country: 'US' } },
      { exporter: { name: 'Acme Corp', country: 'BR' } },
    )

    const linhas = resultado.secoes.flatMap((s) => s.linhas)
    const nome = linhas.find((l) => l.chave === 'exporter.name')
    const pais = linhas.find((l) => l.chave === 'exporter.country')

    expect(nome?.status).toBe('igual')
    expect(pais?.status).toBe('divergente')
    expect(resultado.iguais).toBe(1)
    expect(resultado.divergentes).toBe(1)
  })

  it('considera divergência insensível a espaços e caixa', () => {
    const resultado = compararDocumentosConferencia(
      { invoice_number: '  INV-001 ' },
      { invoice_number: 'inv-001' },
    )
    expect(resultado.divergentes).toBe(0)
    expect(resultado.iguais).toBe(1)
  })

  it('classifica campos presentes em apenas um documento', () => {
    const resultado = compararDocumentosConferencia(
      { exporter: { name: 'Acme' } },
      { exporter: { name: 'Acme', tax_id: '123' } },
    )
    const linhas = resultado.secoes.flatMap((s) => s.linhas)
    expect(linhas.find((l) => l.chave === 'exporter.tax_id')?.status).toBe('somente_b')
    expect(resultado.somente_b).toBe(1)
  })

  it('classifica como vazio quando ambos não têm valor (não conta como igual)', () => {
    const resultado = compararDocumentosConferencia(
      { exporter: { name: 'Acme', email: '' } },
      { exporter: { name: 'Acme', email: '' } },
    )
    const email = resultado.secoes.flatMap((s) => s.linhas).find((l) => l.chave === 'exporter.email')
    expect(email?.status).toBe('vazio')
    expect(resultado.iguais).toBe(1)
    expect(resultado.vazios).toBe(1)
  })

  it('classifica só-em-um pelo valor mesmo com a chave presente nos dois', () => {
    const resultado = compararDocumentosConferencia(
      { exporter: { name: 'Acme', tax_id: '' } },
      { exporter: { name: 'Acme', tax_id: '123' } },
    )
    const taxId = resultado.secoes.flatMap((s) => s.linhas).find((l) => l.chave === 'exporter.tax_id')
    expect(taxId?.status).toBe('somente_b')
    expect(resultado.divergentes).toBe(0)
  })

  it('ignora isSigned na comparação', () => {
    const resultado = compararDocumentosConferencia(
      { isSigned: true, exporter: { name: 'Acme' } },
      { isSigned: false, exporter: { name: 'Acme' } },
    )
    const linhas = resultado.secoes.flatMap((s) => s.linhas)
    expect(linhas.some((l) => l.chave === 'isSigned')).toBe(false)
  })
})
