import { describe, it, expect } from 'vitest'
import {
  createNfSchema,
  createItemSchema,
  createDespesaSchema,
  exportarSchema,
  createCatalogoSchema,
  createFavoritoSchema,
  metodoRateioEnum,
  formatoExportEnum,
  statusNfEnum,
  canalEntradaEnum,
  origemDespesaEnum,
  rateioOverrideSchema,
} from '../../../produto/nf-importacao/server/src/validators/nfImportacao'

// ============================================
// createNfSchema
// ============================================
describe('createNfSchema', () => {
  const validNf = {
    company_id: 'comp_123',
    uf_destino: 'SP',
  }

  it('aceita input valido minimo', () => {
    const result = createNfSchema.safeParse(validNf)
    expect(result.success).toBe(true)
  })

  it('aceita input valido completo', () => {
    const result = createNfSchema.safeParse({
      ...validNf,
      duimp_numero: 'DU-2026-001',
      duimp_data_registro: '2026-03-30T00:00:00.000Z',
      processo_id: 'proc_abc',
      tipo_operacao: 'IMPORTACAO',
      moeda_negociada: 'EUR',
      canal_entrada: 'XML',
      casas_decimais_valor: 4,
      casas_decimais_qtd: 6,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita company_id vazio', () => {
    const result = createNfSchema.safeParse({ ...validNf, company_id: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita uf_destino com 3 caracteres', () => {
    const result = createNfSchema.safeParse({ ...validNf, uf_destino: 'SPP' })
    expect(result.success).toBe(false)
  })

  it('rejeita uf_destino com 1 caractere', () => {
    const result = createNfSchema.safeParse({ ...validNf, uf_destino: 'S' })
    expect(result.success).toBe(false)
  })

  it('rejeita casas_decimais_valor > 6', () => {
    const result = createNfSchema.safeParse({ ...validNf, casas_decimais_valor: 7 })
    expect(result.success).toBe(false)
  })

  it('rejeita canal_entrada invalido', () => {
    const result = createNfSchema.safeParse({ ...validNf, canal_entrada: 'INVALIDO' })
    expect(result.success).toBe(false)
  })
})

// ============================================
// createItemSchema
// ============================================
describe('createItemSchema', () => {
  const validItem = {
    nf_importacao_id: 'nf_123',
    ncm: '84714100',
    descricao: 'Servidor Dell PowerEdge',
    quantidade_estatistica: '10.0000',
    unidade_medida: 'UN',
    peso_liquido: '120.50',
    valor_fob: '50000.00',
    valor_frete: '1000.00',
    valor_seguro: '500.00',
    ii_aliquota: '14.00',
    ipi_aliquota: '5.00',
    pis_aliquota: '2.10',
    cofins_aliquota: '9.65',
    icms_aliquota: '18.00',
  }

  it('aceita input valido', () => {
    const result = createItemSchema.safeParse(validItem)
    expect(result.success).toBe(true)
  })

  it('rejeita NCM com menos de 8 digitos', () => {
    const result = createItemSchema.safeParse({ ...validItem, ncm: '8471410' })
    expect(result.success).toBe(false)
  })

  it('rejeita NCM com letras', () => {
    const result = createItemSchema.safeParse({ ...validItem, ncm: '8471410A' })
    expect(result.success).toBe(false)
  })

  it('rejeita NCM com 9 digitos', () => {
    const result = createItemSchema.safeParse({ ...validItem, ncm: '847141001' })
    expect(result.success).toBe(false)
  })

  it('rejeita descricao vazia', () => {
    const result = createItemSchema.safeParse({ ...validItem, descricao: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita valor decimal invalido', () => {
    const result = createItemSchema.safeParse({ ...validItem, valor_fob: 'abc' })
    expect(result.success).toBe(false)
  })

  it('aceita CFOP com 4 digitos', () => {
    const result = createItemSchema.safeParse({ ...validItem, cfop: '3101' })
    expect(result.success).toBe(true)
  })

  it('rejeita CFOP com 3 digitos', () => {
    const result = createItemSchema.safeParse({ ...validItem, cfop: '310' })
    expect(result.success).toBe(false)
  })

  it('aceita CST com 2 digitos', () => {
    const result = createItemSchema.safeParse({ ...validItem, cst_icms: '00' })
    expect(result.success).toBe(true)
  })

  it('aceita CST com 3 digitos', () => {
    const result = createItemSchema.safeParse({ ...validItem, cst_icms: '010' })
    expect(result.success).toBe(true)
  })

  it('rejeita CST com 1 digito', () => {
    const result = createItemSchema.safeParse({ ...validItem, cst_icms: '0' })
    expect(result.success).toBe(false)
  })
})

// ============================================
// createDespesaSchema
// ============================================
describe('createDespesaSchema', () => {
  const validDespesa = {
    nf_importacao_id: 'nf_123',
    nome: 'Frete Internacional',
    valor_total: '5000.00',
  }

  it('aceita input valido minimo', () => {
    const result = createDespesaSchema.safeParse(validDespesa)
    expect(result.success).toBe(true)
  })

  it('aceita todos os metodos de rateio validos', () => {
    const metodos = [
      'PESO_LIQUIDO', 'PESO_BRUTO', 'VALOR_CIF', 'VALOR_FOB',
      'QUANTIDADE', 'VALOR_II', 'IGUALITARIO', 'MANUAL', 'CUSTOMIZADO',
    ]
    for (const metodo of metodos) {
      const result = createDespesaSchema.safeParse({ ...validDespesa, metodo_rateio: metodo })
      expect(result.success).toBe(true)
    }
  })

  it('rejeita metodo de rateio invalido', () => {
    const result = createDespesaSchema.safeParse({ ...validDespesa, metodo_rateio: 'INVALIDO' })
    expect(result.success).toBe(false)
  })

  it('rejeita CNPJ com menos de 14 digitos', () => {
    const result = createDespesaSchema.safeParse({ ...validDespesa, cnpj_prestador: '1234567890' })
    expect(result.success).toBe(false)
  })

  it('rejeita CNPJ formatado', () => {
    const result = createDespesaSchema.safeParse({ ...validDespesa, cnpj_prestador: '12.345.678/0001-90' })
    expect(result.success).toBe(false)
  })

  it('aceita CNPJ com 14 digitos', () => {
    const result = createDespesaSchema.safeParse({ ...validDespesa, cnpj_prestador: '12345678000190' })
    expect(result.success).toBe(true)
  })
})

// ============================================
// exportarSchema
// ============================================
describe('exportarSchema', () => {
  it('aceita todos os formatos validos', () => {
    const formatos = ['XML', 'TXT', 'CSV', 'EXCEL', 'JSON', 'PDF']
    for (const formato of formatos) {
      const result = exportarSchema.safeParse({
        nf_importacao_id: 'nf_123',
        formato,
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejeita formato invalido', () => {
    const result = exportarSchema.safeParse({
      nf_importacao_id: 'nf_123',
      formato: 'DOCX',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita nf_importacao_id vazio', () => {
    const result = exportarSchema.safeParse({
      nf_importacao_id: '',
      formato: 'CSV',
    })
    expect(result.success).toBe(false)
  })
})

// ============================================
// createCatalogoSchema
// ============================================
describe('createCatalogoSchema', () => {
  it('aceita input valido', () => {
    const result = createCatalogoSchema.safeParse({
      company_id: 'comp_123',
      nome: 'Despesas Portuarias',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = createCatalogoSchema.safeParse({
      company_id: 'comp_123',
      nome: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita nome com mais de 200 caracteres', () => {
    const result = createCatalogoSchema.safeParse({
      company_id: 'comp_123',
      nome: 'A'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it('default metodo_rateio_padrao e VALOR_CIF', () => {
    const result = createCatalogoSchema.safeParse({
      company_id: 'comp_123',
      nome: 'Teste',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.metodo_rateio_padrao).toBe('VALOR_CIF')
    }
  })
})

// ============================================
// createFavoritoSchema
// ============================================
describe('createFavoritoSchema', () => {
  const validFavorito = {
    company_id: 'comp_123',
    ncm: '84714100',
    cfop: '3101',
    cst_icms: '00',
    cst_ipi: '50',
    cst_pis: '01',
    cst_cofins: '01',
  }

  it('aceita input valido', () => {
    const result = createFavoritoSchema.safeParse(validFavorito)
    expect(result.success).toBe(true)
  })

  it('rejeita NCM invalido', () => {
    const result = createFavoritoSchema.safeParse({ ...validFavorito, ncm: '123' })
    expect(result.success).toBe(false)
  })

  it('rejeita CFOP invalido', () => {
    const result = createFavoritoSchema.safeParse({ ...validFavorito, cfop: '31' })
    expect(result.success).toBe(false)
  })

  it('rejeita CST com 4 digitos', () => {
    const result = createFavoritoSchema.safeParse({ ...validFavorito, cst_icms: '0000' })
    expect(result.success).toBe(false)
  })
})

// ============================================
// Edge cases
// ============================================
describe('Edge cases', () => {
  it('decimalString aceita negativo', () => {
    const result = createItemSchema.safeParse({
      nf_importacao_id: 'nf_123',
      ncm: '84714100',
      descricao: 'Teste',
      quantidade_estatistica: '-10.5',
      unidade_medida: 'UN',
      peso_liquido: '10.0',
      valor_fob: '100.00',
      valor_frete: '10.00',
      valor_seguro: '5.00',
      ii_aliquota: '14.00',
      ipi_aliquota: '5.00',
      pis_aliquota: '2.10',
      cofins_aliquota: '9.65',
      icms_aliquota: '18.00',
    })
    expect(result.success).toBe(true)
  })

  it('rateioOverrideSchema rejeita array vazio', () => {
    const result = rateioOverrideSchema.safeParse({
      despesa_id: 'desp_123',
      overrides: [],
    })
    expect(result.success).toBe(false)
  })

  it('enums rejeitam strings vazias', () => {
    expect(metodoRateioEnum.safeParse('').success).toBe(false)
    expect(formatoExportEnum.safeParse('').success).toBe(false)
    expect(statusNfEnum.safeParse('').success).toBe(false)
    expect(canalEntradaEnum.safeParse('').success).toBe(false)
    expect(origemDespesaEnum.safeParse('').success).toBe(false)
  })
})
