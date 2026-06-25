import { describe, expect, it } from 'vitest'
import {
  calcularEstatisticasConferencia,
  extrairSecoesConferenciaLeitura,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/extrair-secoes-conferencia-leitura-smart-read.ts'

describe('Smart Read — extrair seções conferência', () => {
  it('agrupa campos legado por seção com labels DDD', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      exporter: {
        name: 'Acme Corp',
        country: 'US',
      },
      observations: '',
    })

    const exportador = secoes.find((s) => s.titulo === 'Exportador')
    expect(exportador?.campos).toHaveLength(2)
    expect(exportador?.campos.find((c) => c.chave === 'exporter.name')?.rotulo).toBe('Nome do exportador')
    expect(exportador?.campos.filter((c) => c.preenchido)).toHaveLength(2)
  })

  it('agrupa BL com seções PT paridade DATI', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      document: {
        documentType: 'BILL OF LADING',
        documentDate: '2024-10-24',
        shippedOnBoardDate: '2024-10-24',
        documentNumber: 'GWW-375555',
        billOfLadingNumber: 'GWW-375555',
        masterBillOfLadingNumber: '',
        bookingReference: 'GWW-375555',
      },
      containerNumbers: 'HLBU2358024',
      lcl_cargo: '',
      observations: 'S/S BOOKING NO. 67643677',
      carrier: { name: 'LANDSTAR GLOBAL LOGISTICS' },
      exporter: { name: 'Exporter SA', country: 'US' },
      importer: { name: 'Importador BR', city: 'São Paulo' },
      notify_party: { name: 'Notify Co' },
      shipment: { port_of_origin: 'Shanghai', port_of_destination: 'Santos' },
      goods: { total_packages: 10, shipment_gross_weight: 1000 },
      payment: { terms: 'PREPAID' },
    })

    expect(secoes.map((s) => s.titulo)).toEqual([
      'Dados gerais',
      'Nome do transportador',
      'Exportador',
      'Importador',
      'Notify',
      'Origem e destino',
      'Mercadoria',
      'Frete',
    ])
    const dadosGerais = secoes.find((s) => s.titulo === 'Dados gerais')
    expect(dadosGerais?.campos.find((c) => c.chave === 'document.documentType')?.rotulo).toBe('Tipo de documento')
    expect(dadosGerais?.campos.find((c) => c.chave === 'containerNumbers')?.rotulo).toBe('Números dos Containers')
    expect(secoes.find((s) => s.titulo === 'Nome do transportador')?.campos[0]?.rotulo).toBe('Nome do transportador')
  })

  it('mapeia campos top-level invoice', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      items_quantity: 2,
      observations: 'Texto livre',
      isSigned: false,
    })

    const dadosGerais = secoes.find((s) => s.titulo === 'Dados gerais')
    expect(dadosGerais).toBeDefined()

    const obs = secoes.flatMap((s) => s.campos).find((c) => c.chave === 'observations')
    expect(obs?.rotulo).toBe('Observações')
    expect(obs?.preenchido).toBe(true)

    const assinado = secoes.flatMap((s) => s.campos).find((c) => c.chave === 'isSigned')
    expect(assinado?.rotulo).toBe('Documento assinado')
    expect(assinado?.valor).toBe('Não')
  })

  it('calcula estatísticas de preenchimento', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      campo_a: 'valor',
      campo_b: '',
    })
    const stats = calcularEstatisticasConferencia(secoes)
    expect(stats.total).toBeGreaterThan(0)
    expect(stats.preenchidos + stats.vazios).toBe(stats.total)
  })

  it('interpreta lista fields com section do legado', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      fields: [
        { section: 'Importador', label: 'Nome do importador', value: 'Cliente BR' },
        { section: 'Importador', label: 'Cidade', value: '' },
      ],
    })
    const importador = secoes.find((s) => s.titulo === 'Importador')
    expect(importador?.campos).toHaveLength(2)
    expect(importador?.campos.filter((c) => c.preenchido)).toHaveLength(1)
  })
})
