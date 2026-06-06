/**
 * TST-UNI-PEDIDO-EDITAR-SALVAR — columnBehaviorConfig
 *
 * Testa TODAS as funcoes publicas do SSOT de editabilidade:
 * getEditavel, getEditavelItem, isSomavel, hasAlerta, getTipoCampo.
 *
 * Plano: editar-salvar-unitario.md (secoes 1-10)
 */

import { describe, it, expect } from 'vitest'
import {
  getEditavel,
  getEditavelItem,
  isSomavel,
  hasAlerta,
  getTipoCampo,
} from '@produto/pedido/client/src/shared/columnBehaviorConfig'

// ── 1. getEditavel — alfanumericos base ──────────────────────────────────────

describe('getEditavel — campos alfanumericos', () => {
  const ALFANUMERICOS = [
    'numero_pedido',
    'tipo_operacao',
    'nome_fabricante',
    'referencia_importador',
    'referencia_exportador',
    'ncm',
    'numero_proforma',
    'numero_invoice',
    'incoterm',
    'data_emissao_pedido',
    'referencia_fabricante',
    'cobertura_cambial',
    'condicao_pagamento',
  ] as const

  for (const campo of ALFANUMERICOS) {
    it(`U-EDT: ${campo} retorna true`, () => {
      expect(getEditavel(campo)).toBe(true)
    })
  }

  it('U-EDT-14: nome_exportador retorna funcao (editavelFn)', () => {
    expect(typeof getEditavel('nome_exportador')).toBe('function')
  })

  it('U-EDT-15: nome_importador retorna funcao (editavelFn)', () => {
    expect(typeof getEditavel('nome_importador')).toBe('function')
  })
})

// ── 2. getEditavel — 47 campos de data ───────────────────────────────────────

describe('getEditavel — 47 campos de data', () => {
  const DATAS = [
    'data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto', 'data_meta_pedido_pronto',
    'data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido', 'data_meta_inspecao_pedido',
    'data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido', 'data_meta_coleta_pedido',
    'data_consolidacao_pedido', 'data_transferencia_saldo_pedido',
    'data_prevista_recebimento_rascunho_pedido', 'data_confirmada_recebimento_rascunho_pedido', 'data_meta_recebimento_rascunho_pedido',
    'data_prevista_aprovacao_rascunho_pedido', 'data_confirmada_aprovacao_rascunho_pedido', 'data_meta_aprovacao_rascunho_pedido',
    'data_documento_pedido',
    'data_prevista_recebimento_rascunho_proforma', 'data_confirmada_recebimento_rascunho_proforma', 'data_meta_recebimento_rascunho_proforma',
    'data_prevista_aprovacao_rascunho_proforma', 'data_confirmada_aprovacao_rascunho_proforma', 'data_meta_aprovacao_rascunho_proforma',
    'data_prevista_envio_original_proforma', 'data_confirmada_envio_original_proforma', 'data_meta_envio_original_proforma',
    'data_prevista_recebimento_original_proforma', 'data_confirmada_recebimento_original_proforma', 'data_meta_recebimento_original_proforma',
    'data_proforma_invoice',
    'data_prevista_recebimento_rascunho_invoice', 'data_confirmada_recebimento_rascunho_invoice', 'data_meta_recebimento_rascunho_invoice',
    'data_prevista_aprovacao_rascunho_invoice', 'data_confirmada_aprovacao_rascunho_invoice', 'data_meta_aprovacao_rascunho_invoice',
    'data_prevista_envio_original_invoice', 'data_confirmada_envio_original_invoice', 'data_meta_envio_original_invoice',
    'data_prevista_recebimento_original_invoice', 'data_confirmada_recebimento_original_invoice', 'data_meta_recebimento_original_invoice',
    'data_invoice',
  ] as const

  it(`cobre exatamente 47 datas`, () => {
    expect(DATAS.length).toBe(47)
  })

  for (const campo of DATAS) {
    it(`U-EDT: ${campo} retorna true`, () => {
      expect(getEditavel(campo)).toBe(true)
    })
  }
})

// ── 3. getEditavel — calculados retornam false ───────────────────────────────

describe('getEditavel — campos calculados', () => {
  const CALCULADOS = [
    'valor_total_pedido',
    'valor_item',
    'quantidade_total_pedido',
    'quantidade_pronta_itens_pedido_total',
    'quantidade_transferida_total',
    'quantidade_cancelada_total_pedido',
    'peso_liquido_total_pedido',
    'peso_bruto_total_pedido',
    'cubagem_total_pedido',
  ] as const

  for (const campo of CALCULADOS) {
    it(`U-EDT: ${campo} retorna false`, () => {
      expect(getEditavel(campo)).toBe(false)
    })
  }
})

// ── 4. getEditavel — saldo e somente_leitura retornam false ──────────────────

describe('getEditavel — saldo e somente_leitura', () => {
  it('U-EDT-40: saldo_itens_do_pedido (saldo) retorna false', () => {
    expect(getEditavel('saldo_itens_do_pedido')).toBe(false)
  })

  const SOMENTE_LEITURA = [
    'status', 'pais_exportador', 'estado_exportador',
    'cidade_exportador', 'endereco_exportador', 'zip_code_exportador',
  ] as const

  for (const campo of SOMENTE_LEITURA) {
    it(`U-EDT: ${campo} (somente_leitura) retorna false`, () => {
      expect(getEditavel(campo)).toBe(false)
    })
  }
})

// ── 5. Campo nao registrado ──────────────────────────────────────────────────

describe('Campo nao registrado', () => {
  it('U-EDT-50: getEditavel retorna false', () => {
    expect(getEditavel('campo_inexistente')).toBe(false)
  })
  it('U-EDT-51: isSomavel retorna false', () => {
    expect(isSomavel('campo_inexistente')).toBe(false)
  })
  it('U-EDT-52: hasAlerta retorna false', () => {
    expect(hasAlerta('campo_inexistente')).toBe(false)
  })
  it('U-EDT-53: getTipoCampo retorna null', () => {
    expect(getTipoCampo('campo_inexistente')).toBeNull()
  })
})

// ── 6. editavelFn — condicionais por tipo_operacao ───────────────────────────

describe('editavelFn — condicionais', () => {
  it('U-EDT-60: nome_exportador true quando importacao', () => {
    const fn = getEditavel('nome_exportador') as (row: { tipo_operacao: string }) => boolean
    expect(fn({ tipo_operacao: 'importacao' })).toBe(true)
  })
  it('U-EDT-61: nome_exportador false quando exportacao', () => {
    const fn = getEditavel('nome_exportador') as (row: { tipo_operacao: string }) => boolean
    expect(fn({ tipo_operacao: 'exportacao' })).toBe(false)
  })
  it('U-EDT-62: nome_importador true quando exportacao', () => {
    const fn = getEditavel('nome_importador') as (row: { tipo_operacao: string }) => boolean
    expect(fn({ tipo_operacao: 'exportacao' })).toBe(true)
  })
  it('U-EDT-63: nome_importador false quando importacao', () => {
    const fn = getEditavel('nome_importador') as (row: { tipo_operacao: string }) => boolean
    expect(fn({ tipo_operacao: 'importacao' })).toBe(false)
  })
})

// ── 7. isSomavel ─────────────────────────────────────────────────────────────

describe('isSomavel', () => {
  it('calculados retornam true', () => {
    expect(isSomavel('valor_total_pedido')).toBe(true)
    expect(isSomavel('quantidade_total_pedido')).toBe(true)
  })
  it('saldo retorna true', () => {
    expect(isSomavel('saldo_itens_do_pedido')).toBe(true)
  })
  it('alfanumericos retornam false', () => {
    expect(isSomavel('numero_pedido')).toBe(false)
    expect(isSomavel('tipo_operacao')).toBe(false)
  })
  it('somente_leitura retorna false', () => {
    expect(isSomavel('status')).toBe(false)
  })
})

// ── 8. hasAlerta ─────────────────────────────────────────────────────────────

describe('hasAlerta', () => {
  it('alfanumericos retornam true', () => {
    expect(hasAlerta('ncm')).toBe(true)
    expect(hasAlerta('incoterm')).toBe(true)
    expect(hasAlerta('referencia_importador')).toBe(true)
    expect(hasAlerta('data_prevista_pedido_pronto')).toBe(true)
  })
  it('calculados retornam false', () => {
    expect(hasAlerta('valor_total_pedido')).toBe(false)
  })
  it('saldo retorna false', () => {
    expect(hasAlerta('saldo_itens_do_pedido')).toBe(false)
  })
  it('somente_leitura retorna false', () => {
    expect(hasAlerta('status')).toBe(false)
  })
})

// ── 9. getEditavelItem — nivel ITEM ──────────────────────────────────────────

describe('getEditavelItem — nivel item', () => {
  it('alfanumerico: true', () => {
    expect(getEditavelItem('numero_pedido')).toBe(true)
  })
  it('calculado no item: true (item tem valor proprio)', () => {
    expect(getEditavelItem('valor_total_pedido')).toBe(true)
    expect(getEditavelItem('valor_item')).toBe(true)
    expect(getEditavelItem('quantidade_total_pedido')).toBe(true)
    expect(getEditavelItem('peso_liquido_total_pedido')).toBe(true)
  })
  it('saldo: false (nunca editavel)', () => {
    expect(getEditavelItem('saldo_itens_do_pedido')).toBe(false)
  })
  it('somente_leitura: false', () => {
    expect(getEditavelItem('pais_exportador')).toBe(false)
  })
  it('override status: true', () => {
    expect(getEditavelItem('status')).toBe(true)
  })
  it('override quantidade_transferida_total: false', () => {
    expect(getEditavelItem('quantidade_transferida_total')).toBe(false)
  })
  it('override quantidade_cancelada_total_pedido: false', () => {
    expect(getEditavelItem('quantidade_cancelada_total_pedido')).toBe(false)
  })
})

// ── 10. getTipoCampo ─────────────────────────────────────────────────────────

describe('getTipoCampo', () => {
  it('alfanumerico', () => expect(getTipoCampo('numero_pedido')).toBe('alfanumerico'))
  it('calculado', () => expect(getTipoCampo('valor_total_pedido')).toBe('calculado'))
  it('saldo', () => expect(getTipoCampo('saldo_itens_do_pedido')).toBe('saldo'))
  it('somente_leitura', () => expect(getTipoCampo('status')).toBe('somente_leitura'))
  it('inexistente retorna null', () => expect(getTipoCampo('nao_existe')).toBeNull())
})
