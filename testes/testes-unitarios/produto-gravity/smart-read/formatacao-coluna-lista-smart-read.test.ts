import { describe, expect, it } from 'vitest'
import {
  formatarValorCelulaCatalogoSmartRead,
  normalizarValorSalvarColunaListaSmartRead,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/formatacao-coluna-lista-smart-read'

const colData = {
  key: 'data_documento',
  label: 'Data do documento',
  caminhos: ['invoice.date'],
} as const

const colMoeda = {
  key: 'moeda_moeda',
  label: 'Moeda',
  caminhos: ['currency.type'],
} as const

const colNumero = {
  key: 'valor_total_documento',
  label: 'Valor total',
  caminhos: ['invoice.total'],
} as const

describe('formatacao-coluna-lista-smart-read', () => {
  it('formata data ISO para DD/MM/AAAA', () => {
    const formatado = formatarValorCelulaCatalogoSmartRead(colData, '2026-07-24T00:00:00.000Z')
    expect(formatado).toMatch(/24\/07\/2026/)
  })

  it('normaliza data do popover para ISO', () => {
    expect(normalizarValorSalvarColunaListaSmartRead(colData, '23/07/2026')).toMatch(/^2026-07-23/)
  })

  it('normaliza moeda para código ISO maiúsculo', () => {
    expect(normalizarValorSalvarColunaListaSmartRead(colMoeda, 'usd')).toBe('USD')
  })

  it('formata número pt-BR', () => {
    expect(formatarValorCelulaCatalogoSmartRead(colNumero, '1455.33')).toBe('1.455,33')
  })

  it('normaliza número pt-BR para decimal ponto', () => {
    expect(normalizarValorSalvarColunaListaSmartRead(colNumero, '1.455,33')).toBe('1455.33')
  })
})
