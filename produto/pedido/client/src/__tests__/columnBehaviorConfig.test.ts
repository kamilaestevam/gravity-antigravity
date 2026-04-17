import { describe, it, expect } from 'vitest'
import {
  getEditavel,
  isSomavel,
  hasAlerta,
  isPropagavel,
  isRecalculavel,
  getEditavelItem,
  getTipoCampo,
  getAllKeys,
  getAlertaKeys,
  getPropagavelKeys,
} from '../shared/columnBehaviorConfig'

// ── getAllKeys — integridade do registro ──────────────────────────────────────

describe('getAllKeys', () => {
  it('retorna pelo menos 103 campos registrados', () => {
    expect(getAllKeys().length).toBeGreaterThanOrEqual(90)
  })

  it('inclui campos-chave de cada tipo', () => {
    const keys = getAllKeys()
    expect(keys).toContain('numero_pedido')       // alfanumerico
    expect(keys).toContain('valor_total_pedido')   // calculado
    expect(keys).toContain('saldo_itens_do_pedido') // saldo
    expect(keys).toContain('status')               // somente_leitura
  })
})

// ── getTipoCampo ─────────────────────────────────────────────────────────────

describe('getTipoCampo', () => {
  it('retorna alfanumerico para numero_pedido', () => {
    expect(getTipoCampo('numero_pedido')).toBe('alfanumerico')
  })

  it('retorna calculado para valor_total_pedido', () => {
    expect(getTipoCampo('valor_total_pedido')).toBe('calculado')
  })

  it('retorna saldo para saldo_itens_do_pedido', () => {
    expect(getTipoCampo('saldo_itens_do_pedido')).toBe('saldo')
  })

  it('retorna somente_leitura para status', () => {
    expect(getTipoCampo('status')).toBe('somente_leitura')
  })

  it('retorna null para campo inexistente', () => {
    expect(getTipoCampo('campo_inventado')).toBeNull()
  })
})

// ── getEditavel — defaults do tipo + overrides ───────────────────────────────

describe('getEditavel', () => {
  it('alfanumerico é editável por padrão', () => {
    expect(getEditavel('ncm')).toBe(true)
  })

  it('calculado NÃO é editável', () => {
    expect(getEditavel('valor_total_pedido')).toBe(false)
  })

  it('saldo NÃO é editável', () => {
    expect(getEditavel('saldo_itens_do_pedido')).toBe(false)
  })

  it('somente_leitura NÃO é editável', () => {
    expect(getEditavel('pais_exportador')).toBe(false)
  })

  it('nome_exportador retorna função (editavelFn)', () => {
    const result = getEditavel('nome_exportador')
    expect(typeof result).toBe('function')
  })

  it('nome_exportador editável somente em importação', () => {
    const fn = getEditavel('nome_exportador') as (row: { tipo_operacao: string }) => boolean
    expect(fn({ tipo_operacao: 'importacao' })).toBe(true)
    expect(fn({ tipo_operacao: 'exportacao' })).toBe(false)
  })

  it('nome_importador editável somente em exportação', () => {
    const fn = getEditavel('nome_importador') as (row: { tipo_operacao: string }) => boolean
    expect(fn({ tipo_operacao: 'exportacao' })).toBe(true)
    expect(fn({ tipo_operacao: 'importacao' })).toBe(false)
  })

  it('retorna false para campo inexistente', () => {
    expect(getEditavel('xyz_inexistente')).toBe(false)
  })
})

// ── isSomavel — tipo calculado/saldo soma, alfanumerico não ──────────────────

describe('isSomavel', () => {
  it('calculado soma por padrão', () => {
    expect(isSomavel('quantidade_total_inicial_pedido')).toBe(true)
  })

  it('saldo soma por padrão', () => {
    expect(isSomavel('saldo_itens_do_pedido')).toBe(true)
  })

  it('alfanumerico NÃO soma', () => {
    expect(isSomavel('ncm')).toBe(false)
  })

  it('somente_leitura NÃO soma', () => {
    expect(isSomavel('status')).toBe(false)
  })

  it('valor_item tem override somar=false', () => {
    expect(isSomavel('valor_item')).toBe(false)
  })
})

// ── hasAlerta — divergência entre itens ──────────────────────────────────────

describe('hasAlerta', () => {
  it('alfanumerico tem alerta por padrão', () => {
    expect(hasAlerta('ncm')).toBe(true)
    expect(hasAlerta('incoterm')).toBe(true)
  })

  it('numero_pedido NÃO tem alerta (override alerta=false)', () => {
    expect(hasAlerta('numero_pedido')).toBe(false)
  })

  it('tipo_operacao NÃO tem alerta (override alerta=false)', () => {
    expect(hasAlerta('tipo_operacao')).toBe(false)
  })

  it('status NÃO tem alerta (override alerta=false)', () => {
    expect(hasAlerta('status')).toBe(false)
  })

  it('tin_ope e email_ope NÃO têm alerta (override alerta=false)', () => {
    expect(hasAlerta('tin_ope')).toBe(false)
    expect(hasAlerta('email_ope')).toBe(false)
  })

  it('calculado NÃO tem alerta por padrão', () => {
    expect(hasAlerta('quantidade_total_inicial_pedido')).toBe(false)
  })

  it('valor_total_pedido tem override alerta=true', () => {
    expect(hasAlerta('valor_total_pedido')).toBe(true)
  })

  it('peso_liquido_total_pedido tem override alerta=true', () => {
    expect(hasAlerta('peso_liquido_total_pedido')).toBe(true)
  })

  it('contatos exportador NÃO têm alerta (override alerta=false)', () => {
    expect(hasAlerta('nome_contato_exportador')).toBe(false)
    expect(hasAlerta('email_contato_exportador')).toBe(false)
  })

  it('anexos NÃO têm alerta (override alerta=false)', () => {
    expect(hasAlerta('anexo_pedido')).toBe(false)
    expect(hasAlerta('anexo_proforma')).toBe(false)
  })

  it('somente_leitura tem alerta por padrão (exceto overrides)', () => {
    expect(hasAlerta('pais_exportador')).toBe(true)
  })

  it('saldo_itens_do_pedido recalcula=true (override)', () => {
    expect(isRecalculavel('saldo_itens_do_pedido')).toBe(true)
  })
})

// ── isPropagavel — propaga pai→item ──────────────────────────────────────────

describe('isPropagavel', () => {
  it('alfanumerico propaga por padrão', () => {
    expect(isPropagavel('ncm')).toBe(true)
    expect(isPropagavel('incoterm')).toBe(true)
    expect(isPropagavel('condicao_pagamento_pedido')).toBe(true)
  })

  it('numero_pedido NÃO propaga (override propaga=false)', () => {
    expect(isPropagavel('numero_pedido')).toBe(false)
  })

  it('calculado NÃO propaga', () => {
    expect(isPropagavel('valor_total_pedido')).toBe(false)
  })

  it('saldo NÃO propaga', () => {
    expect(isPropagavel('saldo_itens_do_pedido')).toBe(false)
  })

  it('somente_leitura propaga por padrão', () => {
    expect(isPropagavel('pais_exportador')).toBe(true)
  })
})

// ── isRecalculavel — editar item recalcula pai ───────────────────────────────

describe('isRecalculavel', () => {
  it('calculado recalcula por padrão', () => {
    expect(isRecalculavel('quantidade_total_inicial_pedido')).toBe(true)
  })

  it('alfanumerico NÃO recalcula por padrão', () => {
    expect(isRecalculavel('ncm')).toBe(false)
  })

  it('tipo_operacao tem override recalcula=true', () => {
    expect(isRecalculavel('tipo_operacao')).toBe(true)
  })

  it('status tem override recalcula=true', () => {
    expect(isRecalculavel('status')).toBe(true)
  })

  it('valor_item tem override recalcula=false', () => {
    expect(isRecalculavel('valor_item')).toBe(false)
  })
})

// ── getEditavelItem — editabilidade no nível do item ─────────────────────────

describe('getEditavelItem', () => {
  it('alfanumerico é editável no item', () => {
    expect(getEditavelItem('ncm')).toBe(true)
  })

  it('calculado é editável no item', () => {
    expect(getEditavelItem('valor_total_pedido')).toBe(true)
  })

  it('saldo NÃO é editável no item', () => {
    expect(getEditavelItem('saldo_itens_do_pedido')).toBe(false)
  })

  it('somente_leitura NÃO é editável no item', () => {
    expect(getEditavelItem('pais_exportador')).toBe(false)
  })

  it('status tem override = true no item', () => {
    expect(getEditavelItem('status')).toBe(true)
  })

  it('quantidade_transferida_total tem override = false no item', () => {
    expect(getEditavelItem('quantidade_transferida_total')).toBe(false)
  })
})

// ── getAlertaKeys / getPropagavelKeys — listas derivadas ─────────────────────

describe('listas derivadas', () => {
  it('getAlertaKeys retorna apenas campos com alerta=true', () => {
    const keys = getAlertaKeys()
    for (const key of keys) {
      expect(hasAlerta(key)).toBe(true)
    }
    expect(keys.length).toBeGreaterThan(0)
  })

  it('getPropagavelKeys retorna apenas campos com propaga=true', () => {
    const keys = getPropagavelKeys()
    for (const key of keys) {
      expect(isPropagavel(key)).toBe(true)
    }
    expect(keys.length).toBeGreaterThan(0)
  })

  it('contatos exportador NÃO aparecem em getAlertaKeys', () => {
    const keys = getAlertaKeys()
    expect(keys).not.toContain('nome_contato_exportador')
    expect(keys).not.toContain('email_contato_exportador')
  })

  it('numero_pedido NÃO aparece em getPropagavelKeys', () => {
    expect(getPropagavelKeys()).not.toContain('numero_pedido')
  })
})
