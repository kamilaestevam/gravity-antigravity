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

  it('usa titulo da section legado (Item 1) e ignora placeholder ncm', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      sections: [
        {
          title: 'Item 1',
          fields: [
            { key: 'items[0].partNumber', label: 'Part Number', value: '3100N025201DK19' },
            { key: 'items[0].ncm', label: 'NCM', value: '8413.9100' },
          ],
        },
      ],
      items: [{ partNumber: '3100N025201DK19', ncm: 'ncm' }],
    })

    const item1 = secoes.find((s) => s.titulo === 'Item 1')
    expect(item1).toBeDefined()
    expect(item1?.campos.find((c) => c.rotulo === 'NCM')?.valor).toBe('8413.9100')
  })

  it('prioriza valor ao vivo em items quando section legado está vazia', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      sections: [
        {
          title: 'Item 1',
          fields: [
            { key: 'items[0].weights.gross', label: 'Gross', value: '' },
            { key: 'items[0].volume.dimensions', label: 'Dimensions', value: '' },
            { key: 'items[0].weights.unit', label: 'Unit', value: 'PCS' },
          ],
        },
      ],
      items: [
        {
          weights: { gross: '15.2', unit: 'PCS' },
          volume: { dimensions: '10x20x30' },
        },
      ],
    })

    const item1 = secoes.find((s) => s.titulo === 'Item 1')
    expect(item1?.campos.find((c) => c.chave === 'items[0].weights.gross')?.valor).toBe('15.2')
    expect(item1?.campos.find((c) => c.chave === 'items[0].volume.dimensions')?.valor).toBe('10x20x30')
    expect(item1?.campos.find((c) => c.chave === 'items[0].weights.unit')?.valor).toBe('PCS')
  })

  it('exibe NCM a partir de hsCode quando ncm ausente', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      items: [{ partNumber: '3100N025201DK19', hsCode: '8413.9100' }],
    })
    const item1 = secoes.find((s) => s.titulo === 'Item 1')
    expect(item1?.campos.find((c) => c.chave === 'items[0].ncm')?.valor).toBe('8413.9100')
  })

  it('cria seções Item 1 e Item 2 com campos distintos (paridade DATI)', () => {
    const secoes = extrairSecoesConferenciaLeitura({
      document: { documentNumber: '2250090' },
      items: [
        { partNumber: '3100N025201DK19', ncm: '8413.9100', itemQuantity: '3,00' },
        { partNumber: 'GDG000001012A99', ncm: '8413.9100', itemQuantity: '2,00' },
      ],
    })

    const item1 = secoes.find((s) => s.titulo === 'Item 1')
    const item2 = secoes.find((s) => s.titulo === 'Item 2')
    expect(item1).toBeDefined()
    expect(item2).toBeDefined()
    expect(item1?.campos.find((c) => c.chave === 'items[0].partNumber')?.valor).toBe('3100N025201DK19')
    expect(item2?.campos.find((c) => c.chave === 'items[1].partNumber')?.valor).toBe('GDG000001012A99')
    expect(item1?.campos.find((c) => c.chave === 'items[0].ncm')?.valor).toBe('8413.9100')
    expect(item2?.campos.find((c) => c.chave === 'items[1].ncm')?.valor).toBe('8413.9100')

    const camposMercadoria = secoes
      .filter((s) => s.titulo === 'Mercadoria')
      .flatMap((s) => s.campos)
    expect(camposMercadoria.some((c) => c.chave.includes('partNumber'))).toBe(false)
  })
})
