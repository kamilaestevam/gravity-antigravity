// @vitest-environment node
// TST-UNIT-PEDIDO-FORMATARNCM — formatarNcm()
// Cobre: normalizacao de NCM para formato XXXX.XX.XX (8 digitos com pontos).
// Tipo de modulo: funcao pura (Tipo 1/8 — utilitario de formatacao).

import { describe, it, expect, vi } from 'vitest'

// ─── Mocks hoisted ──────────────────────────────────────────────────────────
const { mockRecalcularAgregados } = vi.hoisted(() => ({
  mockRecalcularAgregados: vi.fn().mockResolvedValue(undefined),
}))

vi.mock(
  '../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js',
  () => ({ recalcularAgregadosPedido: mockRecalcularAgregados }),
)

vi.mock('../../../servicos-global/produto/pedido/server/src/services/importEngine.js', () => ({
  parseArquivo: vi.fn(),
  ALIASES_CAMPOS: {},
  calcularHashColunas: vi.fn(() => 'hash-test'),
}))

vi.mock('../../../servicos-global/produto/pedido/server/src/services/mapeamentoMemoriaService.js', () => ({
  MapeamentoMemoriaService: vi.fn().mockImplementation(() => ({
    salvar: vi.fn().mockResolvedValue(undefined),
    buscar: vi.fn().mockResolvedValue(null),
  })),
}))

vi.mock('../../../servicos-global/produto/pedido/server/src/errors/AppError.js', () => ({
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode: number, code: string) {
      super(message)
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

import { formatarNcm, extrairCodigoDropdown } from '../../../servicos-global/produto/pedido/server/src/services/smartImportService.js'

describe('formatarNcm — normalizacao de NCM para XXXX.XX.XX', () => {
  // ── Happy path ──────────────────────────────────────────────────────────────

  it('formata 8 digitos puros no padrao XXXX.XX.XX', () => {
    expect(formatarNcm('84713019')).toBe('8471.30.19')
  })

  it('formata NCM ja com pontos corretamente (remove e reformata)', () => {
    expect(formatarNcm('8471.30.19')).toBe('8471.30.19')
  })

  it('formata NCM com espacos entre blocos', () => {
    expect(formatarNcm('8471 30 19')).toBe('8471.30.19')
  })

  it('formata NCM com tracos como separadores', () => {
    expect(formatarNcm('8471-30-19')).toBe('8471.30.19')
  })

  it('formata NCM com mistura de separadores (pontos, espacos, tracos)', () => {
    expect(formatarNcm('84.71-30 19')).toBe('8471.30.19')
  })

  it('formata NCM numerico (number em vez de string)', () => {
    expect(formatarNcm(84713019)).toBe('8471.30.19')
  })

  // ── Sad path ────────────────────────────────────────────────────────────────

  it('retorna string vazia para valor null', () => {
    expect(formatarNcm(null)).toBe('')
  })

  it('retorna string vazia para valor undefined', () => {
    expect(formatarNcm(undefined)).toBe('')
  })

  it('retorna string vazia para string vazia', () => {
    expect(formatarNcm('')).toBe('')
  })

  it('retorna string vazia para zero (falsy)', () => {
    expect(formatarNcm(0)).toBe('')
  })

  it('retorna valor original quando NCM tem menos de 8 digitos', () => {
    expect(formatarNcm('8471301')).toBe('8471301')
  })

  it('retorna valor original quando NCM tem mais de 8 digitos', () => {
    expect(formatarNcm('847130199')).toBe('847130199')
  })

  it('retorna valor original quando NCM contem letras (nao e 8 digitos puros)', () => {
    expect(formatarNcm('8471AB19')).toBe('8471AB19')
  })

  // ── Edge cases ──────────────────────────────────────────────────────────────

  it('formata corretamente NCM com zeros a esquerda (00000001)', () => {
    expect(formatarNcm('00000001')).toBe('0000.00.01')
  })

  it('formata corretamente NCM todo zeros (00000000)', () => {
    expect(formatarNcm('00000000')).toBe('0000.00.00')
  })

  it('formata corretamente NCM todo noves (99999999)', () => {
    expect(formatarNcm('99999999')).toBe('9999.99.99')
  })

  it('retorna valor original para boolean true (converte para "true" — nao 8 digitos)', () => {
    expect(formatarNcm(true)).toBe('true')
  })

  it('retorna valor original para string so com separadores (nenhum digito)', () => {
    expect(formatarNcm('...---   ')).toBe('...---   ')
  })

  // ── Adversarial ─────────────────────────────────────────────────────────────

  it('retorna valor original para tentativa de XSS', () => {
    const xss = '<script>alert(1)</script>'
    expect(formatarNcm(xss)).toBe(xss)
  })

  it('retorna valor original para tentativa de SQL injection', () => {
    const sqli = "' OR 1=1--"
    expect(formatarNcm(sqli)).toBe(sqli)
  })
})

describe('extrairCodigoDropdown — extrai codigo de "CODIGO — Nome"', () => {
  // ── Happy path ──────────────────────────────────────────────────────────────

  it('extrai codigo de moeda no formato "USD — Dolar dos Estados Unidos"', () => {
    expect(extrairCodigoDropdown('USD — Dólar dos Estados Unidos')).toBe('USD')
  })

  it('extrai codigo de unidade no formato "KG — Quilograma"', () => {
    expect(extrairCodigoDropdown('KG — Quilograma')).toBe('KG')
  })

  it('extrai codigo de moeda com espaco ao redor "EUR — Euro"', () => {
    expect(extrairCodigoDropdown('  EUR — Euro  ')).toBe('EUR')
  })

  it('retorna valor original quando nao contem separador " — " (planilha antiga)', () => {
    expect(extrairCodigoDropdown('USD')).toBe('USD')
  })

  it('retorna valor original para codigo sem nome (planilha antiga)', () => {
    expect(extrairCodigoDropdown('BRL')).toBe('BRL')
  })

  // ── Sad path ────────────────────────────────────────────────────────────────

  it('retorna string vazia para null', () => {
    expect(extrairCodigoDropdown(null)).toBe('')
  })

  it('retorna string vazia para undefined', () => {
    expect(extrairCodigoDropdown(undefined)).toBe('')
  })

  it('retorna string vazia para string vazia', () => {
    expect(extrairCodigoDropdown('')).toBe('')
  })

  // ── Edge cases ──────────────────────────────────────────────────────────────

  it('trata valor com " — " no meio de nome longo corretamente', () => {
    expect(extrairCodigoDropdown('AED — Dirham dos Emirados Árabes')).toBe('AED')
  })

  it('trata valor com multiplos " — " — extrai apenas o primeiro bloco', () => {
    expect(extrairCodigoDropdown('M3 — Metro cúbico — Volume')).toBe('M3')
  })

  it('retorna string completa (trimada) quando " — " esta no inicio (sem codigo)', () => {
    expect(extrairCodigoDropdown(' — SemCodigo')).toBe('— SemCodigo')
  })

  it('converte numero para string antes de processar', () => {
    expect(extrairCodigoDropdown(42)).toBe('42')
  })
})
