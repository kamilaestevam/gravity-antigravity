import { describe, expect, it } from 'vitest'
import {
  calcularCustoUsdGeminiLeituraSmartRead,
  formatarTokensDiscretoLeituraSmartRead,
  somarUsoLlmChamadasLeituraSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/uso-llm-leitura-smart-read.ts'

describe('uso-llm-leitura-smart-read (shared)', () => {
  it('somarUsoLlmChamadasLeituraSmartRead agrega entrada e saída', () => {
    const total = somarUsoLlmChamadasLeituraSmartRead([
      { tokens_entrada: 100, tokens_saida: 50, tokens_total: 150 },
      { tokens_entrada: 200, tokens_saida: 80, tokens_total: 280 },
    ])
    expect(total).toEqual({
      tokens_entrada: 300,
      tokens_saida: 130,
      tokens_total: 430,
    })
  })

  it('formatarTokensDiscretoLeituraSmartRead usa k e M', () => {
    expect(formatarTokensDiscretoLeituraSmartRead(842)).toBe('842')
    expect(formatarTokensDiscretoLeituraSmartRead(12_400)).toBe('12,4k')
    expect(formatarTokensDiscretoLeituraSmartRead(1_500_000)).toBe('1,5M')
  })

  it('calcularCustoUsdGeminiLeituraSmartRead calcula para gemini-2.5-flash', () => {
    const custo = calcularCustoUsdGeminiLeituraSmartRead('gemini-2.5-flash', 1_000_000, 500_000)
    expect(custo).toBeCloseTo(0.45, 5)
  })
})
