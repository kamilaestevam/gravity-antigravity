/// <reference types="vitest/globals" />

import {
  somaPrefixosAlturas,
  indicePorOffset,
  calcularJanelaVirtual,
} from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/hooks/useGTJanelaVirtual'

const ALTURA = 45

describe('somaPrefixosAlturas', () => {
  it('gera offsets acumulados com length = linhas + 1', () => {
    expect(somaPrefixosAlturas([])).toEqual([0])
    expect(somaPrefixosAlturas([45, 45, 51])).toEqual([0, 45, 90, 141])
  })
})

describe('indicePorOffset', () => {
  const offsets = somaPrefixosAlturas(Array.from({ length: 10 }, () => ALTURA))

  it('retorna o índice da linha que contém o offset', () => {
    expect(indicePorOffset(offsets, 0)).toBe(0)
    expect(indicePorOffset(offsets, 44)).toBe(0)
    expect(indicePorOffset(offsets, 45)).toBe(1)
    expect(indicePorOffset(offsets, 100)).toBe(2)
  })

  it('clampa no fim para offsets além da altura total', () => {
    expect(indicePorOffset(offsets, 99999)).toBe(10)
  })
})

describe('calcularJanelaVirtual', () => {
  // 900 linhas uniformes de 45px — cenário "Expandir todos" da Lista de Pedidos
  const alturas = Array.from({ length: 900 }, () => ALTURA)
  const offsets = somaPrefixosAlturas(alturas)

  it('no topo (scrollTop=0) inicia na linha 0 sem spacer superior', () => {
    const j = calcularJanelaVirtual(offsets, 0, 600, 12)
    expect(j.inicio).toBe(0)
    expect(j.alturaTopo).toBe(0)
    // viewport 600/45 ≈ 14 linhas + 1 parcial + overscan 12
    expect(j.fim).toBeGreaterThanOrEqual(14)
    expect(j.fim).toBeLessThanOrEqual(14 + 1 + 12 + 1)
  })

  it('fatia central tem spacers cuja soma fecha a altura total', () => {
    const j = calcularJanelaVirtual(offsets, 10_000, 600, 12)
    const alturaFatia = offsets[j.fim] - offsets[j.inicio]
    expect(j.alturaTopo + alturaFatia + j.alturaFundo).toBe(offsets[900])
    expect(j.inicio).toBeGreaterThan(0)
    expect(j.fim).toBeLessThan(900)
  })

  it('no fim do scroll inclui a última linha sem spacer inferior', () => {
    const alturaTotal = offsets[900]
    const j = calcularJanelaVirtual(offsets, alturaTotal - 600, 600, 12)
    expect(j.fim).toBe(900)
    expect(j.alturaFundo).toBe(0)
  })

  it('renderiza só o necessário: fatia proporcional ao viewport, não à página', () => {
    const j = calcularJanelaVirtual(offsets, 5_000, 600, 12)
    const linhasRenderizadas = j.fim - j.inicio
    // ~14 visíveis + 24 overscan + 2 bordas — nunca as 900 da página
    expect(linhasRenderizadas).toBeLessThanOrEqual(45)
  })

  it('alturas heterogêneas (último filho +6px) mantêm soma exata', () => {
    const mistas = [45, 45, 51, 45, 51, 45, 45, 45, 51, 45]
    const offs = somaPrefixosAlturas(mistas)
    for (let scroll = 0; scroll <= offs[10]; scroll += 37) {
      const j = calcularJanelaVirtual(offs, scroll, 90, 1)
      const alturaFatia = offs[j.fim] - offs[j.inicio]
      expect(j.alturaTopo + alturaFatia + j.alturaFundo).toBe(offs[10])
      expect(j.inicio).toBeGreaterThanOrEqual(0)
      expect(j.fim).toBeLessThanOrEqual(10)
      expect(j.fim).toBeGreaterThan(j.inicio)
    }
  })

  it('viewport não medido (0) usa fallback e não devolve janela vazia', () => {
    const j = calcularJanelaVirtual(offsets, 0, 0, 12)
    expect(j.fim - j.inicio).toBeGreaterThan(14)
  })
})
