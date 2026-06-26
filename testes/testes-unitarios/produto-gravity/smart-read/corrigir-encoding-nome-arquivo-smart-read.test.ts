import { describe, expect, it } from 'vitest'
import { corrigirEncodingNomeArquivoSmartRead } from '../../../../servicos-global/produto/smart-read/shared/corrigir-encoding-nome-arquivo-smart-read.ts'

/** Simula o que Multer/busboy faz ao ler filename UTF-8 como Latin-1. */
function simularMojibakeMulter(nomeUtf8: string): string {
  const bytes = new TextEncoder().encode(nomeUtf8)
  return Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
}

describe('corrigir-encoding-nome-arquivo-smart-read (shared)', () => {
  it('mantém nomes ASCII sem alteração', () => {
    expect(corrigirEncodingNomeArquivoSmartRead('INVOICE77.pdf')).toBe('INVOICE77.pdf')
    expect(corrigirEncodingNomeArquivoSmartRead('BL-2024-001.PDF')).toBe('BL-2024-001.PDF')
  })

  it('repara cópia corrompida pelo Multer', () => {
    const corrompido = simularMojibakeMulter('INVOICE77 - cópia.pdf')
    expect(corrompido).toContain('Ã')
    expect(corrigirEncodingNomeArquivoSmartRead(corrompido)).toBe('INVOICE77 - cópia.pdf')
  })

  it('repara outros acentos comuns em PT-BR', () => {
    expect(corrigirEncodingNomeArquivoSmartRead(simularMojibakeMulter('nota fiscal - ação.pdf'))).toBe(
      'nota fiscal - ação.pdf',
    )
    expect(corrigirEncodingNomeArquivoSmartRead(simularMojibakeMulter('relatório ção.xlsx'))).toBe(
      'relatório ção.xlsx',
    )
  })

  it('repara double-encoding quando ainda há indícios de mojibake', () => {
    const umaVez = simularMojibakeMulter('cópia.pdf')
    const duasVezes = simularMojibakeMulter(umaVez)
    expect(corrigirEncodingNomeArquivoSmartRead(duasVezes)).toBe('cópia.pdf')
  })

  it('retorna null para entrada null', () => {
    expect(corrigirEncodingNomeArquivoSmartRead(null)).toBeNull()
  })

  it('não altera nomes já corretos com acentos', () => {
    expect(corrigirEncodingNomeArquivoSmartRead('INVOICE77 - cópia.pdf')).toBe('INVOICE77 - cópia.pdf')
  })
})
