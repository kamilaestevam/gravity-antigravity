// server/__tests__/gemini-test-analyzer.test.ts
// Testes unitários para o analyzer — foca no fallback heurístico e cache

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @google/generative-ai ANTES do import
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(),
}))

// Mock fs para o prompt mestre
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn().mockReturnValue(''),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  }
})

// Mock do playwright-parser fallback
vi.mock('../utils/playwright-parser.js', () => ({
  generateAiAnalysis: vi.fn().mockImplementation((errMsg: string | null) => {
    if (!errMsg) return null
    return {
      erroResumo: 'Elemento não encontrado na página',
      motivo: 'O seletor usado pelo teste não casa mais com nenhum elemento no DOM da página renderizada.',
      sugestaoCorrecao: 'Verifique se o data-testid ainda existe no componente atual',
      arquivo: 'test.spec.ts',
      codigoDiff: undefined,
    }
  }),
}))

describe('gemini-test-analyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Limpa cache de módulos para reset do GEMINI_API_KEY
    vi.resetModules()
  })

  it('usa fallback heurístico quando GEMINI_API_KEY não está definida', async () => {
    // Sem API key, o módulo cai direto no fallback
    delete process.env.GEMINI_API_KEY

    const { analyzeTestFailure } = await import('../lib/gemini-test-analyzer.js')

    const result = await analyzeTestFailure({
      errorLog: 'Error: element not visible',
      testName: 'teste-basico',
      specFilePath: 'test.spec.ts',
      specFileContent: 'test("x", async ({ page }) => {})',
    })

    expect(result).toBeDefined()
    expect(result.erroResumo).toBeTruthy()
    expect(result.motivo).toBeTruthy()
    expect(result.sugestaoCorrecao).toBeTruthy()
    expect(result.confianca).toBe('baixa')
    expect(result.categoria).toBe('NAO_CLASSIFICAVEL')
  })

  it('retorna análise genérica quando fallback retorna null', async () => {
    delete process.env.GEMINI_API_KEY

    const { generateAiAnalysis } = await import('../utils/playwright-parser.js')
    vi.mocked(generateAiAnalysis).mockReturnValueOnce(null)

    const { analyzeTestFailure } = await import('../lib/gemini-test-analyzer.js')

    const result = await analyzeTestFailure({
      errorLog: '',
      testName: 'teste-vazio',
      specFilePath: 'test.spec.ts',
      specFileContent: '',
    })

    expect(result.erroResumo).toContain('nao classificada')
    expect(result.confianca).toBe('baixa')
  })

  it('getMetrics retorna estrutura correta', async () => {
    delete process.env.GEMINI_API_KEY

    const { getMetrics } = await import('../lib/gemini-test-analyzer.js')

    const metrics = getMetrics()
    expect(metrics).toHaveProperty('cacheSize')
    expect(metrics).toHaveProperty('cacheHits')
    expect(metrics).toHaveProperty('cacheMisses')
    expect(metrics).toHaveProperty('hitRate')
    expect(typeof metrics.hitRate).toBe('number')
  })
})
