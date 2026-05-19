// @vitest-environment node
/**
 * TST-UNI-PEDIDO-EDITAR-SALVAR — fmtQuantidade + formatarData + classeMoedaBadge
 *
 * Testa helpers EXPORTADOS de formatacao: numero pt-BR, data por formato tenant,
 * e classe CSS de badge de moeda.
 *
 * NOTA: renderTextoTruncado e renderDescricaoTruncada sao funcoes internas
 * (nao exportadas) de ColunasPai.tsx e ColunasFilho.tsx — testadas via E2E.
 *
 * Plano: editar-salvar-unitario.md (secao 15)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { fmtQuantidade, classeMoedaBadge } from '@produto/pedido/client/src/shared/types'
import { formatarData, setFormatoData } from '@produto/pedido/client/src/shared/useFormatoData'

// ── 15b. fmtQuantidade — formato brasileiro pt-BR ───────────────────────────

describe('fmtQuantidade — formato brasileiro pt-BR', () => {
  it('U-RND-05: 274519.34, 2 → "274.519,34"', () => {
    expect(fmtQuantidade(274519.34, 2)).toBe('274.519,34')
  })

  it('U-RND-06: 0, 2 → "0,00"', () => {
    expect(fmtQuantidade(0, 2)).toBe('0,00')
  })

  it('fmtQuantidade: 1234567.891 com 3 casas', () => {
    expect(fmtQuantidade(1234567.891, 3)).toBe('1.234.567,891')
  })

  it('fmtQuantidade: valor negativo', () => {
    const resultado = fmtQuantidade(-1500.5, 2)
    expect(resultado).toContain('1.500,50')
  })

  it('fmtQuantidade: default 2 casas quando nao informado', () => {
    expect(fmtQuantidade(100)).toBe('100,00')
  })
})

// ── 15c. formatarData (fmtData) ─────────────────────────────────────────────

describe('formatarData (fmtData)', () => {
  beforeEach(() => {
    setFormatoData('DD/MM/AAAA')
  })

  it('U-RND-08: "2026-05-17" → "17/05/2026"', () => {
    expect(formatarData('2026-05-17')).toBe('17/05/2026')
  })

  it('U-RND-09: null → "—" (travessao)', () => {
    expect(formatarData(null)).toBe('—')
  })

  it('undefined → "—"', () => {
    expect(formatarData(undefined)).toBe('—')
  })

  it('string invalida → "—"', () => {
    expect(formatarData('abc')).toBe('—')
  })

  it('formato MM/DD/AAAA', () => {
    setFormatoData('MM/DD/AAAA')
    expect(formatarData('2026-05-17')).toBe('05/17/2026')
  })

  it('formato AAAA-MM-DD', () => {
    setFormatoData('AAAA-MM-DD')
    expect(formatarData('2026-05-17')).toBe('2026-05-17')
  })

  it('formato DD.MM.AAAA', () => {
    setFormatoData('DD.MM.AAAA')
    expect(formatarData('2026-05-17')).toBe('17.05.2026')
  })

  it('formato DD/MM/AA', () => {
    setFormatoData('DD/MM/AA')
    expect(formatarData('2026-05-17')).toBe('17/05/26')
  })

  it('aceita ISO datetime completo', () => {
    expect(formatarData('2026-05-17T14:30:00.000Z')).toBe('17/05/2026')
  })

  it('aceita Date object', () => {
    const d = new Date('2026-05-17T00:00:00Z')
    const resultado = formatarData(d)
    expect(resultado).toContain('17')
    expect(resultado).toContain('05')
    expect(resultado).toContain('2026')
  })
})

// ── 15d. classeMoedaBadge ───────────────────────────────────────────────────

describe('classeMoedaBadge', () => {
  it('U-RND-10: "USD" → classe contem "usd"', () => {
    expect(classeMoedaBadge('USD')).toContain('gtv-celula-moeda-badge--usd')
  })

  it('"EUR" → classe contem "eur"', () => {
    expect(classeMoedaBadge('EUR')).toContain('gtv-celula-moeda-badge--eur')
  })

  it('"BRL" → classe contem "brl"', () => {
    expect(classeMoedaBadge('BRL')).toContain('gtv-celula-moeda-badge--brl')
  })

  it('base class sempre presente', () => {
    expect(classeMoedaBadge('USD')).toContain('gtv-celula-moeda-badge ')
  })

  it('case insensitive: "usd" → mesmo resultado', () => {
    expect(classeMoedaBadge('usd')).toContain('gtv-celula-moeda-badge--usd')
  })

  it('moeda desconhecida: sem classe especifica', () => {
    const resultado = classeMoedaBadge('XYZ')
    expect(resultado).toContain('gtv-celula-moeda-badge')
    expect(resultado).not.toContain('--xyz')
  })
})
