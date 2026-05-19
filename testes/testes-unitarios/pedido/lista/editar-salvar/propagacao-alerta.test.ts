/**
 * TST-UNI-PEDIDO-EDITAR-SALVAR — isPropagavel + isAlertavel
 *
 * Testa as funcoes de verificacao de propagacao (MAPA_PROPAGACAO_PEDIDO_ITEM)
 * e alertas de divergencia (CAMPOS_ALERTAVEIS).
 *
 * Plano: editar-salvar-unitario.md (secao 14)
 */

import { describe, it, expect } from 'vitest'
import { isPropagavel } from '@produto/pedido/shared/mapaPropagacaoPedidoItem'
import { isAlertavel } from '@produto/pedido/shared/columnAlertConfig'

// ── 14a. isPropagavel ────────────────────────────────────────────────────────

describe('isPropagavel — campos com par no MAPA_PROPAGACAO_PEDIDO_ITEM', () => {
  it('U-PROP-01: incoterm_pedido → true', () => {
    expect(isPropagavel('incoterm_pedido')).toBe(true)
  })

  it('U-PROP-02: moeda_pedido → true', () => {
    expect(isPropagavel('moeda_pedido')).toBe(true)
  })

  it('U-PROP-03: condicao_pagamento_pedido → true', () => {
    expect(isPropagavel('condicao_pagamento_pedido')).toBe(true)
  })

  it('U-PROP-04: data_prevista_pedido_pronto → true', () => {
    expect(isPropagavel('data_prevista_pedido_pronto')).toBe(true)
  })

  it('U-PROP-05: numero_pedido → false (sem par no mapa)', () => {
    expect(isPropagavel('numero_pedido')).toBe(false)
  })

  it('U-PROP-06: valor_total_pedido → false (calculado)', () => {
    expect(isPropagavel('valor_total_pedido')).toBe(false)
  })
})

// ── 14b. isAlertavel ─────────────────────────────────────────────────────────

describe('isAlertavel — campos em CAMPOS_ALERTAVEIS', () => {
  it('U-ALRT-01: tipo_operacao → true', () => {
    expect(isAlertavel('tipo_operacao')).toBe(true)
  })

  it('U-ALRT-02: incoterm → true', () => {
    expect(isAlertavel('incoterm')).toBe(true)
  })

  it('U-ALRT-03: moeda_item → true', () => {
    expect(isAlertavel('moeda_item')).toBe(true)
  })

  it('U-ALRT-04: valor_total_pedido → false (calculado, nao alertavel)', () => {
    expect(isAlertavel('valor_total_pedido')).toBe(false)
  })
})
