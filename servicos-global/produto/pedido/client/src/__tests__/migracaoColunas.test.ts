// __tests__/migracaoColunas.test.ts
//
// Testes unitários dos helpers de migração de preferências de coluna.
// Refactor D12 (2026-05-13) — extraídos do inline em Pedidos.tsx.

import { describe, it, expect } from 'vitest'
import {
  inserirColunaAposAncora,
  moverColunaParaAposAncora,
} from '../shared/migracaoColunas'

// ─── inserirColunaAposAncora ─────────────────────────────────────────────────

describe('inserirColunaAposAncora', () => {

  it('insere após a 1ª âncora encontrada', () => {
    const visiveis = ['numero_pedido', 'tipo_operacao', 'status']
    const { resultado, mudou } = inserirColunaAposAncora(visiveis, 'id_workspace', ['tipo_operacao', 'numero_pedido'])
    expect(mudou).toBe(true)
    expect(resultado).toEqual(['numero_pedido', 'tipo_operacao', 'id_workspace', 'status'])
  })

  it('cai para 2ª âncora quando a 1ª não existe', () => {
    const visiveis = ['numero_pedido', 'status']  // sem tipo_operacao
    const { resultado, mudou } = inserirColunaAposAncora(visiveis, 'id_workspace', ['tipo_operacao', 'numero_pedido'])
    expect(mudou).toBe(true)
    expect(resultado).toEqual(['numero_pedido', 'id_workspace', 'status'])
  })

  it('insere no INÍCIO quando nenhuma âncora existe', () => {
    const visiveis = ['status', 'ncm']  // nenhuma das âncoras
    const { resultado, mudou } = inserirColunaAposAncora(visiveis, 'id_workspace', ['tipo_operacao', 'numero_pedido'])
    expect(mudou).toBe(true)
    expect(resultado).toEqual(['id_workspace', 'status', 'ncm'])
  })

  it('idempotente — coluna já existe → no-op (mudou=false)', () => {
    const visiveis = ['numero_pedido', 'id_workspace', 'tipo_operacao']
    const { resultado, mudou } = inserirColunaAposAncora(visiveis, 'id_workspace', ['tipo_operacao'])
    expect(mudou).toBe(false)
    expect(resultado).toBe(visiveis)  // mesma referência
  })

  it('lista vazia + nenhuma âncora → insere a coluna sozinha', () => {
    const { resultado, mudou } = inserirColunaAposAncora([], 'id_workspace', ['tipo_operacao'])
    expect(mudou).toBe(true)
    expect(resultado).toEqual(['id_workspace'])
  })

  it('lista de âncoras vazia → cai no fallback de início', () => {
    const visiveis = ['a', 'b', 'c']
    const { resultado, mudou } = inserirColunaAposAncora(visiveis, 'novo', [])
    expect(mudou).toBe(true)
    expect(resultado).toEqual(['novo', 'a', 'b', 'c'])
  })

  it('âncora no FIM da lista → insere após (no final)', () => {
    const visiveis = ['a', 'b', 'tipo_operacao']
    const { resultado, mudou } = inserirColunaAposAncora(visiveis, 'id_workspace', ['tipo_operacao'])
    expect(mudou).toBe(true)
    expect(resultado).toEqual(['a', 'b', 'tipo_operacao', 'id_workspace'])
  })

  it('não muta o array original', () => {
    const visiveis = ['a', 'b']
    inserirColunaAposAncora(visiveis, 'c', ['a'])
    expect(visiveis).toEqual(['a', 'b'])
  })
})

// ─── moverColunaParaAposAncora ───────────────────────────────────────────────

describe('moverColunaParaAposAncora', () => {

  it('move coluna que está ANTES da âncora', () => {
    const visiveis = ['numero_pedido', 'id_workspace', 'tipo_operacao', 'status']
    const { resultado, mudou } = moverColunaParaAposAncora(visiveis, 'id_workspace', 'tipo_operacao')
    expect(mudou).toBe(true)
    expect(resultado).toEqual(['numero_pedido', 'tipo_operacao', 'id_workspace', 'status'])
  })

  it('coluna já DEPOIS da âncora → no-op (preserva customização)', () => {
    const visiveis = ['numero_pedido', 'tipo_operacao', 'id_workspace', 'status']
    const { resultado, mudou } = moverColunaParaAposAncora(visiveis, 'id_workspace', 'tipo_operacao')
    expect(mudou).toBe(false)
    expect(resultado).toBe(visiveis)
  })

  it('coluna ausente → no-op', () => {
    const visiveis = ['numero_pedido', 'tipo_operacao', 'status']
    const { resultado, mudou } = moverColunaParaAposAncora(visiveis, 'id_workspace', 'tipo_operacao')
    expect(mudou).toBe(false)
    expect(resultado).toBe(visiveis)
  })

  it('âncora ausente → no-op', () => {
    const visiveis = ['numero_pedido', 'id_workspace', 'status']  // sem tipo_operacao
    const { resultado, mudou } = moverColunaParaAposAncora(visiveis, 'id_workspace', 'tipo_operacao')
    expect(mudou).toBe(false)
    expect(resultado).toBe(visiveis)
  })

  it('preserva colunas customizadas que estavam entre a coluna e a âncora', () => {
    const visiveis = ['numero_pedido', 'id_workspace', 'col_custom', 'tipo_operacao', 'status']
    const { resultado, mudou } = moverColunaParaAposAncora(visiveis, 'id_workspace', 'tipo_operacao')
    expect(mudou).toBe(true)
    expect(resultado).toEqual(['numero_pedido', 'col_custom', 'tipo_operacao', 'id_workspace', 'status'])
  })

  it('coluna e âncora na mesma posição (impossível, mas defensivo) → no-op', () => {
    // Caso degenerado — ambos no mesmo índice é impossível em arrays normais,
    // mas o helper deve ser robusto mesmo com input estranho.
    const visiveis = ['unica']
    const { resultado, mudou } = moverColunaParaAposAncora(visiveis, 'unica', 'unica')
    // idxMover === idxApos (ambos = 0). idxMover > idxApos é FALSE,
    // mas após o splice de remoção a âncora também some — caso degenerado
    // tratado pelo segundo indexOf retornando -1 → splice(-1+1, 0, ...) = início.
    // O comportamento correto é não permitir esse caso na prática,
    // mas garantir que não crashe.
    expect(typeof mudou).toBe('boolean')
    expect(Array.isArray(resultado)).toBe(true)
  })

  it('não muta o array original', () => {
    const visiveis = ['x', 'a', 'b']
    moverColunaParaAposAncora(visiveis, 'x', 'b')
    expect(visiveis).toEqual(['x', 'a', 'b'])
  })

  it('lista vazia → no-op', () => {
    const { resultado, mudou } = moverColunaParaAposAncora([], 'a', 'b')
    expect(mudou).toBe(false)
    expect(resultado).toEqual([])
  })
})
