/**
 * importEngine.pdf.test.ts — Testes do parser PDF e branch pdf em parseArquivo
 *
 * Cobre:
 *   - parsePdfText: tab, multi-espaco, escaneado, sem colunas
 *   - parseArquivo case 'pdf': Gemini ok, pdf-parse ok, pdf-parse falha
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parsePdfText } from './importEngine.js'

// ── Mocks dos módulos importados dinamicamente ─────────────────────────────────

vi.mock('./geminiPdfExtractor.js', () => ({
  extrairPdfComGemini: vi.fn(),
}))

vi.mock('pdf-parse', () => {
  const PDFParse = vi.fn()
  return { PDFParse }
})

// ── parsePdfText ───────────────────────────────────────────────────────────────

describe('parsePdfText', () => {
  it('parseia texto tabulado (separador tab)', () => {
    const texto = 'PO Number\tSupplier\tQty\nPO-001\tACME\t100\nPO-002\tFoo\t200'
    const resultado = parsePdfText(texto)
    expect(resultado).toHaveLength(2)
    expect(resultado[0]['PO Number']).toBe('PO-001')
    expect(resultado[0]['Supplier']).toBe('ACME')
    expect(resultado[0]['Qty']).toBe('100')
  })

  it('parseia texto com multiplos espacos como separador', () => {
    const texto = 'Part Number  Description  Qty\nPART-001  Widget A  50\nPART-002  Widget B  75'
    const resultado = parsePdfText(texto)
    expect(resultado).toHaveLength(2)
    expect(resultado[0]['Part Number']).toBe('PART-001')
    expect(resultado[0]['Description']).toBe('Widget A')
  })

  it('retorna aviso para PDF escaneado (texto vazio ou muito curto)', () => {
    const resultado = parsePdfText('')
    expect(resultado).toHaveLength(1)
    expect(resultado[0]).toHaveProperty('_aviso')
    expect(resultado[0]['_aviso']).toMatch(/sem texto estruturado/i)
  })

  it('retorna aviso quando texto tem apenas uma linha', () => {
    const resultado = parsePdfText('Linha única sem estrutura')
    expect(resultado).toHaveLength(1)
    expect(resultado[0]).toHaveProperty('_aviso')
  })

  it('retorna linhas brutas quando nao detecta colunas suficientes', () => {
    // Uma palavra por linha → splitPdf retorna array com 1 elemento → < 2 colunas
    const texto = 'UmaColuna\nvalor1\nvalor2\nvalor3'
    const resultado = parsePdfText(texto)
    // Sem colunas suficientes, retorna linhas brutas com "linha" e "conteudo"
    expect(resultado[0]).toHaveProperty('conteudo')
  })

  it('ignora linhas vazias no texto', () => {
    const texto = 'Code\tQty\n\nPART-001\t10\n\nPART-002\t20\n'
    const resultado = parsePdfText(texto)
    expect(resultado).toHaveLength(2)
  })

  it('preenche com string vazia quando linha tem menos colunas que o cabecalho', () => {
    const texto = 'A\tB\tC\nval1\tval2'
    const resultado = parsePdfText(texto)
    expect(resultado[0]['C']).toBe('')
  })
})

// ── parseArquivo — branch PDF ──────────────────────────────────────────────────

describe('parseArquivo — pdf', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('retorna extrator_usado=gemini quando Gemini extrai com sucesso', async () => {
    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    vi.mocked(extrairPdfComGemini).mockResolvedValueOnce({
      linhas: [{ part_number: 'P001', descricao_item: 'Widget', quantidade_inicial_item_pedido: '10' }],
      tokensUsados: 1000,
      custoUsd: 0.001,
    })

    const { parseArquivo } = await import('./importEngine.js')
    const buffer = Buffer.from('%PDF-fake-content')
    const resultado = await parseArquivo(buffer, 'invoice.pdf')

    expect(resultado.extrator_usado).toBe('gemini')
    expect(resultado.linhas).toHaveLength(1)
    expect(resultado.linhas[0]['part_number']).toBe('P001')
  })

  it('retorna extrator_usado=pdf-parse quando Gemini retorna null e pdf-parse funciona', async () => {
    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    vi.mocked(extrairPdfComGemini).mockResolvedValueOnce(null)

    const pdfParseMod = await import('pdf-parse')
    const mockParser = {
      load: vi.fn().mockResolvedValue(undefined),
      getText: vi.fn().mockResolvedValue({ text: 'Code\tQty\nPART-001\t10' }),
    }
    vi.mocked(pdfParseMod.PDFParse).mockImplementation(() => mockParser as unknown as InstanceType<typeof pdfParseMod.PDFParse>)

    const { parseArquivo } = await import('./importEngine.js')
    const buffer = Buffer.from('%PDF-fake-content')
    const resultado = await parseArquivo(buffer, 'invoice.pdf')

    expect(resultado.extrator_usado).toBe('pdf-parse')
    expect(resultado.linhas[0]['Code']).toBe('PART-001')
  })

  it('retorna extrator_usado=pdf-erro quando pdf-parse lanca excecao', async () => {
    const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
    vi.mocked(extrairPdfComGemini).mockResolvedValueOnce(null)

    const pdfParseMod = await import('pdf-parse')
    vi.mocked(pdfParseMod.PDFParse).mockImplementation(() => {
      throw new Error('Cannot read PDF')
    })

    const { parseArquivo } = await import('./importEngine.js')
    const buffer = Buffer.from('%PDF-fake-content')
    const resultado = await parseArquivo(buffer, 'invoice.pdf')

    expect(resultado.extrator_usado).toBe('pdf-erro')
    expect(resultado.linhas[0]).toHaveProperty('_aviso')
    expect(resultado.linhas[0]).toHaveProperty('_conteudo')
    expect(resultado.linhas[0]['_conteudo']).toMatch(/Cannot read PDF/)
  })
})
