import { describe, expect, it } from 'vitest'
import {
  formatarRotaMapa,
  formatarTerminalMapa,
  rotuloContagemMapaInsights,
  rotuloDocumentoMapaInsights,
  rotuloMelhorPrecoMapa,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/formatar-terminal-mapa-bid-frete-internacional'

describe('formatar-terminal-mapa-bid-frete-internacional', () => {
  it('remove código duplicado no nome do terminal', () => {
    expect(formatarTerminalMapa('Buenos Aires (ARBUE)', 'ARBUE')).toBe('Buenos Aires (ARBUE)')
    expect(formatarTerminalMapa('DYS — Abilene (DYS)', 'DYS')).toBe('Abilene (DYS)')
  })

  it('monta rota origem → destino sem repetição', () => {
    expect(
      formatarRotaMapa('Buenos Aires (ARBUE)', 'ARBUE', 'Sydney (AUSYD)', 'AUSYD'),
    ).toBe('Buenos Aires (ARBUE) → Sydney (AUSYD)')
  })

  it('diferencia cotação e BID na contagem', () => {
    expect(
      rotuloContagemMapaInsights({ quantidadeCotacoes: 2, quantidadeBids: 1 }),
    ).toBe('2 cotações · 1 BID')
    expect(rotuloContagemMapaInsights({ quantidadeCotacoes: 0, quantidadeBids: 0 })).toBe(
      'Nenhuma resposta',
    )
  })

  it('mostra nenhuma resposta quando preço é zero', () => {
    expect(rotuloMelhorPrecoMapa(0)).toBe('Nenhuma resposta')
    expect(rotuloMelhorPrecoMapa(1002)).toBe('USD 1.002')
  })

  it('não duplica prefixo BID ou Cotação no rótulo do documento', () => {
    expect(
      rotuloDocumentoMapaInsights({ numeroBid: 'BID-20260618-4102' }),
    ).toBe('BID-20260618-4102')
    expect(
      rotuloDocumentoMapaInsights({ numeroCotacao: 'COT-20260618-0001' }),
    ).toBe('COT-20260618-0001')
    expect(rotuloDocumentoMapaInsights({ numeroBid: '4102' })).toBe('BID 4102')
  })
})
