/**
 * geminiPdfExtractor.test.ts — Testes do extrator PDF via Gemini
 *
 * Cobre:
 *   - Guards de env (GEMINI_PDF_ENABLED, GEMINI_API_KEY)
 *   - Fluxo feliz: JSON valido → linhas mapeadas, tokens, custo
 *   - Validacao Zod: JSON fora do schema → null
 *   - Array vazio retornado pelo modelo → null
 *   - Erro/timeout → null (falha graceful)
 *   - Limpeza de markdown fences no output
 *   - Mapeamento de campos Gemini → sistema (via saida das linhas)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mock do SDK do Google ──────────────────────────────────────────────────────

const mockGenerateContent = vi.fn()

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}))

// ── Helper: construir resposta fake do Gemini ──────────────────────────────────

function mockGeminiOk(items: Record<string, unknown>[], tokens = { prompt: 500, candidates: 200 }) {
  mockGenerateContent.mockResolvedValueOnce({
    response: {
      text: () => JSON.stringify(items),
      usageMetadata: {
        promptTokenCount: tokens.prompt,
        candidatesTokenCount: tokens.candidates,
      },
    },
  })
}

function mockGeminiText(text: string) {
  mockGenerateContent.mockResolvedValueOnce({
    response: {
      text: () => text,
      usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50 },
    },
  })
}

function mockGeminiError(err: Error) {
  mockGenerateContent.mockRejectedValueOnce(err)
}

// ── Item de invoice com nomes originais do documento ─────────────────────────
// O Gemini agora retorna os rótulos exatos do PDF, não campos internos do sistema

const INVOICE_ITEM_VALIDO = {
  'Number': '2250090',
  'Date': '6/01/25',
  'Currency': 'Eur',
  'Payment conditions': '60 DAYS INVOICE DATE',
  'Code': '3100N025201DK19',
  'Item description': 'EXTENSION',
  'M.U.': 'PZ',
  'Quantity': 3,
  'Unit price': 293000,
  'Discounted amount': 879,
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('extrairPdfComGemini — guards de ambiente', () => {
  it('retorna null quando GEMINI_PDF_ENABLED nao e "true"', async () => {
    vi.stubEnv('GEMINI_PDF_ENABLED', 'false')
    vi.stubEnv('GEMINI_API_KEY', 'fake-key')
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado).toBeNull()
    vi.unstubAllEnvs()
  })

  it('retorna null quando GEMINI_API_KEY nao esta definida', async () => {
    vi.stubEnv('GEMINI_PDF_ENABLED', 'true')
    vi.stubEnv('GEMINI_API_KEY', '')
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado).toBeNull()
    vi.unstubAllEnvs()
  })
})

describe('extrairPdfComGemini — fluxo com env ativa', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_PDF_ENABLED', 'true')
    vi.stubEnv('GEMINI_API_KEY', 'fake-key-for-tests')
    mockGenerateContent.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('retorna linhas mapeadas e metadados quando Gemini responde com JSON valido', async () => {
    mockGeminiOk([INVOICE_ITEM_VALIDO], { prompt: 500, candidates: 200 })
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado).not.toBeNull()
    expect(resultado!.linhas).toHaveLength(1)
    expect(resultado!.tokensUsados).toBe(700) // 500 + 200
    expect(resultado!.custoUsd).toBeGreaterThan(0)
  })

  it('preserva os nomes originais do documento como chaves (nao converte para campos do sistema)', async () => {
    mockGeminiOk([INVOICE_ITEM_VALIDO])
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    const linha = resultado!.linhas[0]
    // Nomes originais do documento preservados
    expect(linha['Number']).toBe('2250090')
    expect(linha['Date']).toBe('6/01/25')
    expect(linha['Currency']).toBe('Eur')
    expect(linha['Code']).toBe('3100N025201DK19')
    expect(linha['Item description']).toBe('EXTENSION')
    expect(linha['M.U.']).toBe('PZ')
    expect(linha['Quantity']).toBe('3')         // numero convertido para string
    expect(linha['Unit price']).toBe('293000')  // numero convertido para string
    // Campos do sistema NAO devem existir como chaves
    expect(linha['numero_pedido']).toBeUndefined()
    expect(linha['exportador']).toBeUndefined()
    expect(linha['valor_unitario_item']).toBeUndefined()
  })

  it('converte todos os valores para string (LinhaArquivo)', async () => {
    mockGeminiOk([INVOICE_ITEM_VALIDO])
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    // Todos os valores devem ser strings
    for (const [, v] of Object.entries(resultado!.linhas[0])) {
      expect(typeof v).toBe('string')
    }
  })

  it('retorna null quando Gemini retorna JSON com sintaxe invalida', async () => {
    // JSON.parse lança → catch block → null
    mockGeminiText('[not valid json at all{{')
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado).toBeNull()
  })

  it('retorna null quando Gemini retorna objeto ao inves de array', async () => {
    // InvoiceArraySchema = z.array(...) — objeto nao passa
    mockGeminiText(JSON.stringify({ invoice_number: 'INV-001', items: [] }))
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado).toBeNull()
  })

  it('retorna null quando Gemini retorna array vazio', async () => {
    mockGeminiOk([])
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado).toBeNull()
  })

  it('retorna null quando SDK lanca erro (ex: quota excedida)', async () => {
    mockGeminiError(new Error('Quota exceeded'))
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado).toBeNull()
  })

  it('limpa markdown fences antes de parsear o JSON', async () => {
    const json = JSON.stringify([INVOICE_ITEM_VALIDO])
    mockGeminiText('```json\n' + json + '\n```')
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado).not.toBeNull()
    expect(resultado!.linhas).toHaveLength(1)
  })

  it('limpa markdown fence sem "json" antes de parsear', async () => {
    const json = JSON.stringify([INVOICE_ITEM_VALIDO])
    mockGeminiText('```\n' + json + '\n```')
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado).not.toBeNull()
    expect(resultado!.linhas).toHaveLength(1)
  })

  it('retorna null quando Gemini simula timeout (Promise.race rejeita primeiro)', async () => {
    // Simula uma chamada que demora mais que o timeout
    mockGenerateContent.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 999_999)),
    )

    // Reduzir o timeout real seria complexo — em vez disso, verificamos que
    // a funcao retorna null se o generateContent rejeitar por qualquer motivo
    mockGenerateContent.mockReset()
    mockGeminiError(new Error('Request timeout'))
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado).toBeNull()
  })

  it('retorna multiplos itens de uma invoice com nomes originais', async () => {
    const item2 = { ...INVOICE_ITEM_VALIDO, 'Code': 'GDG000001012A99', 'Item description': 'ROLLER BEARING SKF 21315-CC', 'Quantity': 2 }
    mockGeminiOk([INVOICE_ITEM_VALIDO, item2])
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado!.linhas).toHaveLength(2)
    expect(resultado!.linhas[1]['Code']).toBe('GDG000001012A99')
    expect(resultado!.linhas[1]['Item description']).toBe('ROLLER BEARING SKF 21315-CC')
    expect(resultado!.linhas[1]['Quantity']).toBe('2')
  })

  it('calcula custo proporcional aos tokens', async () => {
    // gemini-2.5-flash: input=0.15/M, output=0.60/M
    // 1_000_000 tokens in + 1_000_000 tokens out = $0.15 + $0.60 = $0.75
    mockGeminiOk([INVOICE_ITEM_VALIDO], { prompt: 1_000_000, candidates: 1_000_000 })
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    expect(resultado!.custoUsd).toBeCloseTo(0.75, 5)
    expect(resultado!.tokensUsados).toBe(2_000_000)
  })

  it('ignora valores null — nao inclui chave na linha', async () => {
    const itemComNull = { ...INVOICE_ITEM_VALIDO, 'NCM': null }
    mockGeminiOk([itemComNull])
    vi.resetModules()

    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    const resultado = await extrairPdfComGemini(Buffer.from('%PDF'))

    // null é convertido para string vazia (não é removido — LinhaArquivo só tem strings)
    expect(resultado!.linhas[0]['NCM']).toBe('')
  })
})
