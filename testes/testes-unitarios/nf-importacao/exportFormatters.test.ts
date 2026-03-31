import { describe, it, expect } from 'vitest'
import { formatJson } from '../../../produto/nf-importacao/server/src/lib/exportFormatters/jsonFormatter'
import { formatCsv } from '../../../produto/nf-importacao/server/src/lib/exportFormatters/csvFormatter'
import { formatTxtFixed } from '../../../produto/nf-importacao/server/src/lib/exportFormatters/txtFixedFormatter'
import { formatXml } from '../../../produto/nf-importacao/server/src/lib/exportFormatters/xmlFormatter'
import { formatExcel } from '../../../produto/nf-importacao/server/src/lib/exportFormatters/excelFormatter'
import {
  aplicarTransformacao,
  formatarNumero,
  resolverValorCelula,
  type ExportRow,
  type LayoutConfig,
  type LayoutCampo,
  type FormatOptions,
} from '../../../produto/nf-importacao/server/src/lib/exportFormatters/index'

// --- Test data ---

const sampleRows: ExportRow[] = [
  { ncm: '84714100', descricao: 'Servidor Dell', valor_fob: 5000.5, peso_liquido: 12.3 },
  { ncm: '84713012', descricao: 'Notebook HP', valor_fob: 3200.0, peso_liquido: 2.1 },
]

function makeLayout(overrides: Partial<LayoutConfig> = {}): LayoutConfig {
  return {
    formato: 'CSV',
    separador: ';',
    codificacao: 'UTF-8',
    has_header: true,
    has_footer: false,
    campos: [
      { campo_origem: 'ncm', label: 'NCM', ordem: 1, tipo_dado: 'STRING', alinhamento: 'LEFT' },
      { campo_origem: 'descricao', label: 'Descricao', ordem: 2, tipo_dado: 'STRING', alinhamento: 'LEFT' },
      { campo_origem: 'valor_fob', label: 'Valor FOB', ordem: 3, tipo_dado: 'NUMBER', alinhamento: 'RIGHT' },
    ],
    ...overrides,
  }
}

const defaultOptions: FormatOptions = { casas_decimais_valor: 2, casas_decimais_qtd: 4 }

// ============================================
// Utility functions
// ============================================
describe('aplicarTransformacao', () => {
  it('UPPERCASE', () => {
    expect(aplicarTransformacao('hello', 'UPPERCASE')).toBe('HELLO')
  })

  it('LOWERCASE', () => {
    expect(aplicarTransformacao('HELLO', 'LOWERCASE')).toBe('hello')
  })

  it('TRIM', () => {
    expect(aplicarTransformacao('  hello  ', 'TRIM')).toBe('hello')
  })

  it('NONE retorna inalterado', () => {
    expect(aplicarTransformacao('Hello', 'NONE')).toBe('Hello')
  })

  it('undefined retorna inalterado', () => {
    expect(aplicarTransformacao('Hello', undefined)).toBe('Hello')
  })
})

describe('formatarNumero', () => {
  it('formata com 2 casas', () => {
    expect(formatarNumero(123.456, 2)).toBe('123.46')
  })

  it('formata com 0 casas', () => {
    expect(formatarNumero(123.5, 0)).toBe('124')
  })
})

describe('resolverValorCelula', () => {
  it('retorna valor_padrao quando campo e null', () => {
    const row: ExportRow = { campo: null }
    const campo: LayoutCampo = {
      campo_origem: 'campo',
      label: 'Campo',
      ordem: 1,
      tipo_dado: 'STRING',
      alinhamento: 'LEFT',
      valor_padrao: 'N/A',
    }
    expect(resolverValorCelula(row, campo, defaultOptions)).toBe('N/A')
  })

  it('formata numero com casas decimais', () => {
    const row: ExportRow = { valor: 1234.5678 }
    const campo: LayoutCampo = {
      campo_origem: 'valor',
      label: 'Valor',
      ordem: 1,
      tipo_dado: 'NUMBER',
      alinhamento: 'RIGHT',
    }
    expect(resolverValorCelula(row, campo, { casas_decimais_valor: 2 })).toBe('1234.57')
  })
})

// ============================================
// JSON Formatter
// ============================================
describe('formatJson', () => {
  it('retorna array vazio para rows vazios', () => {
    expect(formatJson([], null, defaultOptions)).toBe('[]')
  })

  it('sem layout exporta todas as colunas', () => {
    const result = JSON.parse(formatJson(sampleRows, null, defaultOptions))
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('ncm')
    expect(result[0]).toHaveProperty('valor_fob')
  })

  it('com layout mapeia apenas campos do layout', () => {
    const layout = makeLayout({ formato: 'JSON' })
    const result = JSON.parse(formatJson(sampleRows, layout, defaultOptions))
    expect(result[0]).toHaveProperty('NCM')
    expect(result[0]).toHaveProperty('Valor FOB')
    expect(result[0]).not.toHaveProperty('peso_liquido')
  })

  it('preserva tipos numericos em JSON', () => {
    const layout = makeLayout({ formato: 'JSON' })
    const result = JSON.parse(formatJson(sampleRows, layout, defaultOptions))
    expect(typeof result[0]['Valor FOB']).toBe('number')
  })
})

// ============================================
// CSV Formatter
// ============================================
describe('formatCsv', () => {
  it('retorna string vazia para rows vazios', () => {
    expect(formatCsv([], null, defaultOptions)).toBe('')
  })

  it('separador ponto-e-virgula por padrao', () => {
    const layout = makeLayout({ separador: ';' })
    const result = formatCsv(sampleRows, layout, defaultOptions)
    const lines = result.split('\r\n')
    expect(lines[0]).toBe('NCM;Descricao;Valor FOB')
  })

  it('separador pipe', () => {
    const layout = makeLayout({ separador: '|' })
    const result = formatCsv(sampleRows, layout, defaultOptions)
    expect(result).toContain('|')
  })

  it('separador virgula', () => {
    const layout = makeLayout({ separador: ',' })
    const result = formatCsv(sampleRows, layout, defaultOptions)
    const firstLine = result.split('\r\n')[0]
    expect(firstLine).toContain(',')
  })

  it('separador TAB', () => {
    const layout = makeLayout({ separador: 'TAB' })
    const result = formatCsv(sampleRows, layout, defaultOptions)
    expect(result).toContain('\t')
  })

  it('com header', () => {
    const layout = makeLayout({ has_header: true })
    const result = formatCsv(sampleRows, layout, defaultOptions)
    const lines = result.split('\r\n')
    expect(lines[0]).toContain('NCM')
    expect(lines.length).toBe(3) // header + 2 data rows
  })

  it('sem header (mas has_header false)', () => {
    const layout = makeLayout({ has_header: false })
    const result = formatCsv(sampleRows, layout, defaultOptions)
    const lines = result.split('\r\n')
    expect(lines.length).toBe(2) // 2 data rows only
  })

  it('escapa valores com separador dentro', () => {
    const rows: ExportRow[] = [{ descricao: 'Valor;com;ponto' }]
    const layout = makeLayout({
      separador: ';',
      campos: [{ campo_origem: 'descricao', label: 'Desc', ordem: 1, tipo_dado: 'STRING', alinhamento: 'LEFT' }],
      has_header: false,
    })
    const result = formatCsv(rows, layout, defaultOptions)
    expect(result).toContain('"Valor;com;ponto"')
  })

  it('sem layout usa chaves da primeira row', () => {
    const result = formatCsv(sampleRows, null, defaultOptions)
    const lines = result.split('\r\n')
    expect(lines[0]).toContain('ncm')
    expect(lines.length).toBe(3) // header + 2 rows
  })
})

// ============================================
// TXT Fixed Formatter
// ============================================
describe('formatTxtFixed', () => {
  it('retorna vazio para rows vazios', () => {
    expect(formatTxtFixed([], null, defaultOptions)).toBe('')
  })

  it('campos sequenciais com tamanho fixo', () => {
    const layout: LayoutConfig = {
      formato: 'TXT',
      codificacao: 'UTF-8',
      has_header: false,
      has_footer: false,
      campos: [
        { campo_origem: 'ncm', label: 'NCM', ordem: 1, tipo_dado: 'STRING', tamanho_fixo: 10, alinhamento: 'LEFT' },
        { campo_origem: 'valor_fob', label: 'Valor', ordem: 2, tipo_dado: 'NUMBER', tamanho_fixo: 15, alinhamento: 'RIGHT', preenchimento: '0' },
      ],
    }
    const result = formatTxtFixed(sampleRows, layout, defaultOptions)
    const lines = result.split('\r\n')
    expect(lines[0].length).toBe(25) // 10 + 15
  })

  it('alinhamento LEFT pad right com espacos', () => {
    const layout: LayoutConfig = {
      formato: 'TXT',
      codificacao: 'UTF-8',
      has_header: false,
      has_footer: false,
      campos: [
        { campo_origem: 'ncm', label: 'NCM', ordem: 1, tipo_dado: 'STRING', tamanho_fixo: 12, alinhamento: 'LEFT' },
      ],
    }
    const result = formatTxtFixed([sampleRows[0]], layout, defaultOptions)
    expect(result).toBe('84714100    ')
  })

  it('alinhamento RIGHT pad left com zeros', () => {
    const layout: LayoutConfig = {
      formato: 'TXT',
      codificacao: 'UTF-8',
      has_header: false,
      has_footer: false,
      campos: [
        { campo_origem: 'ncm', label: 'NCM', ordem: 1, tipo_dado: 'STRING', tamanho_fixo: 12, alinhamento: 'RIGHT', preenchimento: '0' },
      ],
    }
    const result = formatTxtFixed([sampleRows[0]], layout, defaultOptions)
    expect(result).toBe('000084714100')
  })

  it('trunca valor que excede tamanho fixo', () => {
    const layout: LayoutConfig = {
      formato: 'TXT',
      codificacao: 'UTF-8',
      has_header: false,
      has_footer: false,
      campos: [
        { campo_origem: 'descricao', label: 'Desc', ordem: 1, tipo_dado: 'STRING', tamanho_fixo: 5, alinhamento: 'LEFT' },
      ],
    }
    const result = formatTxtFixed([sampleRows[0]], layout, defaultOptions)
    expect(result).toBe('Servi') // truncated 'Servidor Dell'
  })

  it('sem layout fallback para pipe-separated', () => {
    const result = formatTxtFixed(sampleRows, null, defaultOptions)
    expect(result).toContain('|')
  })
})

// ============================================
// XML Formatter
// ============================================
describe('formatXml', () => {
  it('retorna XML vazio para rows vazios', () => {
    const result = formatXml([], null, defaultOptions)
    expect(result).toContain('<?xml')
    expect(result).toContain('<Itens/>')
  })

  it('gera XML bem-formado sem layout', () => {
    const result = formatXml(sampleRows, null, defaultOptions)
    expect(result).toContain('<?xml version="1.0"')
    expect(result).toContain('<NfImportacao>')
    expect(result).toContain('</NfImportacao>')
    expect(result).toContain('<Item seq="1">')
    expect(result).toContain('<Item seq="2">')
  })

  it('escapa caracteres especiais', () => {
    const rows: ExportRow[] = [{ descricao: 'Item <test> & "quotes"' }]
    const result = formatXml(rows, null, defaultOptions)
    expect(result).toContain('&lt;test&gt;')
    expect(result).toContain('&amp;')
    expect(result).toContain('&quot;quotes&quot;')
  })

  it('com layout usa tags dos labels', () => {
    const layout = makeLayout({ formato: 'XML' })
    const result = formatXml(sampleRows, layout, defaultOptions)
    expect(result).toContain('<NCM>')
    expect(result).toContain('<Descricao>')
    expect(result).toContain('<Valor_FOB>')
  })

  it('null values geram tag auto-fechante sem layout', () => {
    const rows: ExportRow[] = [{ campo: null }]
    const result = formatXml(rows, null, defaultOptions)
    expect(result).toContain('<campo/>')
  })
})

// ============================================
// Excel Formatter
// ============================================
describe('formatExcel', () => {
  it('retorna XML Spreadsheet vazio para rows vazios', () => {
    const result = formatExcel([], null, defaultOptions)
    expect(result).toContain('<?xml')
    expect(result).toContain('Workbook')
    expect(result).toContain('</Workbook>')
  })

  it('gera header em negrito', () => {
    const layout = makeLayout({ formato: 'EXCEL' })
    const result = formatExcel(sampleRows, layout, defaultOptions)
    expect(result).toContain('ss:StyleID="Header"')
    expect(result).toContain('NCM')
  })

  it('numeros como tipo Number', () => {
    const layout = makeLayout({ formato: 'EXCEL' })
    const result = formatExcel(sampleRows, layout, defaultOptions)
    expect(result).toContain('ss:Type="Number"')
    expect(result).toContain('ss:StyleID="Number"')
  })

  it('strings como tipo String', () => {
    const layout = makeLayout({ formato: 'EXCEL' })
    const result = formatExcel(sampleRows, layout, defaultOptions)
    expect(result).toContain('ss:Type="String"')
  })

  it('sem layout usa todas as colunas', () => {
    const result = formatExcel(sampleRows, null, defaultOptions)
    expect(result).toContain('ncm')
    expect(result).toContain('descricao')
    expect(result).toContain('valor_fob')
  })
})
