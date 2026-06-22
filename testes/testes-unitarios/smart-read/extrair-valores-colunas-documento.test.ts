import { describe, expect, it } from 'vitest'
import {
  CATALOGO_COLUNAS_DOCUMENTO_SMART_READ,
} from '../../../servicos-global/produto/smart-read/client/src/shared/catalogo-colunas-documento-smart-read.ts'
import {
  extrairValoresColunasDocumento,
} from '../../../servicos-global/produto/smart-read/client/src/shared/extrair-valores-colunas-documento-smart-read.ts'

const DADOS_BL = {
  document: { type: 'BILL OF LADING', number: 'GWW-375555', billOfLadingNumber: 'GWW-375555' },
  exporter: { name: 'AMSTED RAIL INTERNATIONAL, INC', country: 'UNITED STATES', city: 'PETERSBURG' },
  importer: { name: 'DMM-IE IMPORTACAO & EXPORTACAO LTDA', cnpj: '08.973.387/0002-55' },
  shipment: { vessel_name: 'Monte Pascoal', port_of_destination: 'ITAPOA' },
  containers: [
    { container_number: 'HLBU2358024', container_type: '20 STANDARD DRY', container_seal: 'UL-4200593' },
  ],
  goods: { ncm_code: '8607', shipment_gross_weight: '19587.809' },
  freight: { currency: 'USD', total_value: '4941.19' },
  accuracy: 0.97,
}

describe('Smart Read — catálogo de colunas', () => {
  it('catálogo tem colunas e chaves únicas', () => {
    expect(CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.length).toBeGreaterThan(100)
    const keys = CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('toda coluna tem ao menos um caminho e um tipo', () => {
    for (const col of CATALOGO_COLUNAS_DOCUMENTO_SMART_READ) {
      expect(col.caminhos.length).toBeGreaterThan(0)
      expect(col.tipos.length).toBeGreaterThan(0)
    }
  })
})

describe('Smart Read — extrair valores de colunas (BL)', () => {
  const valores = extrairValoresColunasDocumento(DADOS_BL)

  function valorPorCaminho(caminho: string): string | undefined {
    const col = CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.find((c) => c.caminhos.includes(caminho))
    return col ? valores[col.key] : undefined
  }

  it('resolve nome do exportador', () => {
    expect(valorPorCaminho('exporter.name')).toBe('AMSTED RAIL INTERNATIONAL, INC')
  })

  it('resolve número do container dentro de array', () => {
    expect(valorPorCaminho('containers[].container_number')).toBe('HLBU2358024')
  })

  it('resolve CNPJ do importador', () => {
    expect(valorPorCaminho('importer.cnpj')).toBe('08.973.387/0002-55')
  })

  it('ignora metadados (accuracy não vira coluna)', () => {
    expect(Object.values(valores)).not.toContain('0.97')
  })

  it('campos ausentes não aparecem', () => {
    expect(valorPorCaminho('exporter.email')).toBeUndefined()
  })
})
