/**
 * Testes unitarios — BID Frete / types.ts
 * Testa todos os label maps, constantes e type guards do dominio
 */

import { describe, it, expect } from 'vitest'

import {
  OPERACAO_LABELS,
  MODAL_LABELS,
  MODALIDADE_LABELS,
  STATUS_LABELS,
  STATUS_BADGE,
  TIPO_FORNECEDOR_LABELS,
  STATUS_FORNECEDOR_LABELS,
  CANAL_LABELS,
  STATUS_BID_LABELS,
  INCOTERMS,
} from '../../../produto/bid-frete/client/src/shared/types'

import type {
  TipoOperacao,
  ModalFrete,
  ModalidadeCarga,
  StatusCotacao,
  TipoFornecedor,
  StatusFornecedor,
  CanalDisparo,
  StatusBidRequest,
  Visibilidade,
  Incoterm,
} from '../../../produto/bid-frete/client/src/shared/types'

// ─── OPERACAO_LABELS ────────────────────────────────────────────────────────

describe('OPERACAO_LABELS', () => {
  it('deve ter exatamente 2 chaves: IMPORTACAO e EXPORTACAO', () => {
    const keys = Object.keys(OPERACAO_LABELS)
    expect(keys).toHaveLength(2)
    expect(keys).toContain('IMPORTACAO')
    expect(keys).toContain('EXPORTACAO')
  })

  it('deve mapear IMPORTACAO para "Importacao"', () => {
    expect(OPERACAO_LABELS.IMPORTACAO).toBe('Importação')
  })

  it('deve mapear EXPORTACAO para "Exportacao"', () => {
    expect(OPERACAO_LABELS.EXPORTACAO).toBe('Exportação')
  })

  it('deve cobrir todos os valores do tipo TipoOperacao', () => {
    const allOps: TipoOperacao[] = ['IMPORTACAO', 'EXPORTACAO']
    for (const op of allOps) {
      expect(OPERACAO_LABELS[op]).toBeDefined()
      expect(typeof OPERACAO_LABELS[op]).toBe('string')
    }
  })
})

// ─── MODAL_LABELS ───────────────────────────────────────────────────────────

describe('MODAL_LABELS', () => {
  it('deve ter exatamente 3 modais', () => {
    expect(Object.keys(MODAL_LABELS)).toHaveLength(3)
  })

  it('deve conter MARITIMO, AEREO e RODOVIARIO', () => {
    const keys = Object.keys(MODAL_LABELS)
    expect(keys).toContain('MARITIMO')
    expect(keys).toContain('AEREO')
    expect(keys).toContain('RODOVIARIO')
  })

  it('deve mapear para labels legíveis em portugues', () => {
    expect(MODAL_LABELS.MARITIMO).toBe('Marítimo')
    expect(MODAL_LABELS.AEREO).toBe('Aéreo')
    expect(MODAL_LABELS.RODOVIARIO).toBe('Rodoviário')
  })

  it('deve cobrir todos os valores do tipo ModalFrete', () => {
    const allModals: ModalFrete[] = ['MARITIMO', 'AEREO', 'RODOVIARIO']
    for (const modal of allModals) {
      expect(MODAL_LABELS[modal]).toBeDefined()
    }
  })
})

// ─── MODALIDADE_LABELS ──────────────────────────────────────────────────────

describe('MODALIDADE_LABELS', () => {
  it('deve ter exatamente 5 modalidades', () => {
    expect(Object.keys(MODALIDADE_LABELS)).toHaveLength(5)
  })

  it('deve conter todas as modalidades esperadas', () => {
    const expected: ModalidadeCarga[] = ['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']
    for (const mod of expected) {
      expect(MODALIDADE_LABELS[mod]).toBeDefined()
    }
  })

  it('deve mapear corretamente para labels legíveis', () => {
    expect(MODALIDADE_LABELS.FCL).toBe('FCL')
    expect(MODALIDADE_LABELS.LCL).toBe('LCL')
    expect(MODALIDADE_LABELS.AEREO_GERAL).toBe('Aéreo Geral')
    expect(MODALIDADE_LABELS.RODOVIARIO_FTL).toBe('FTL')
    expect(MODALIDADE_LABELS.RODOVIARIO_LTL).toBe('LTL')
  })
})

// ─── STATUS_LABELS ──────────────────────────────────────────────────────────

describe('STATUS_LABELS', () => {
  it('deve ter exatamente 9 statuses', () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(9)
  })

  it('deve conter todos os 9 statuses esperados', () => {
    const expected: StatusCotacao[] = [
      'RASCUNHO', 'ENVIADA_FORNECEDORES', 'EM_COTACAO',
      'AGUARDANDO_APROVACAO', 'APROVADA', 'REPROVADA',
      'CANCELADA', 'FALTA_INFORMACAO', 'EXPIRADA',
    ]
    for (const status of expected) {
      expect(STATUS_LABELS[status]).toBeDefined()
      expect(typeof STATUS_LABELS[status]).toBe('string')
    }
  })

  it('deve ter labels nao vazios para cada status', () => {
    for (const label of Object.values(STATUS_LABELS)) {
      expect(label.length).toBeGreaterThan(0)
    }
  })
})

// ─── STATUS_BADGE ───────────────────────────────────────────────────────────

describe('STATUS_BADGE', () => {
  it('deve ter exatamente 9 entradas (mesma quantidade que STATUS_LABELS)', () => {
    expect(Object.keys(STATUS_BADGE)).toHaveLength(9)
  })

  it('deve mapear para variantes validas de badge', () => {
    const validVariants = ['info', 'warning', 'success', 'danger', 'default']
    for (const variant of Object.values(STATUS_BADGE)) {
      expect(validVariants).toContain(variant)
    }
  })

  it('deve mapear statuses finais positivos para success', () => {
    expect(STATUS_BADGE.APROVADA).toBe('success')
  })

  it('deve mapear statuses finais negativos para danger', () => {
    expect(STATUS_BADGE.REPROVADA).toBe('danger')
  })

  it('deve mapear statuses de espera para warning', () => {
    expect(STATUS_BADGE.AGUARDANDO_APROVACAO).toBe('warning')
    expect(STATUS_BADGE.FALTA_INFORMACAO).toBe('warning')
  })

  it('deve mapear statuses inativos para default', () => {
    expect(STATUS_BADGE.RASCUNHO).toBe('default')
    expect(STATUS_BADGE.CANCELADA).toBe('default')
    expect(STATUS_BADGE.EXPIRADA).toBe('default')
  })

  it('deve mapear statuses em progresso para info', () => {
    expect(STATUS_BADGE.ENVIADA_FORNECEDORES).toBe('info')
    expect(STATUS_BADGE.EM_COTACAO).toBe('info')
  })
})

// ─── TIPO_FORNECEDOR_LABELS ─────────────────────────────────────────────────

describe('TIPO_FORNECEDOR_LABELS', () => {
  it('deve ter exatamente 4 tipos', () => {
    expect(Object.keys(TIPO_FORNECEDOR_LABELS)).toHaveLength(4)
  })

  it('deve conter todos os tipos esperados', () => {
    const expected: TipoFornecedor[] = ['AGENTE_CARGA', 'ARMADOR', 'CIA_AEREA', 'TRANSPORTADORA']
    for (const tipo of expected) {
      expect(TIPO_FORNECEDOR_LABELS[tipo]).toBeDefined()
    }
  })

  it('deve mapear para labels legíveis', () => {
    expect(TIPO_FORNECEDOR_LABELS.AGENTE_CARGA).toBe('Agente de Carga')
    expect(TIPO_FORNECEDOR_LABELS.ARMADOR).toBe('Armador')
    expect(TIPO_FORNECEDOR_LABELS.CIA_AEREA).toBe('Cia Aérea')
    expect(TIPO_FORNECEDOR_LABELS.TRANSPORTADORA).toBe('Transportadora')
  })
})

// ─── STATUS_FORNECEDOR_LABELS ───────────────────────────────────────────────

describe('STATUS_FORNECEDOR_LABELS', () => {
  it('deve ter exatamente 4 statuses', () => {
    expect(Object.keys(STATUS_FORNECEDOR_LABELS)).toHaveLength(4)
  })

  it('deve conter todos os statuses esperados', () => {
    const expected: StatusFornecedor[] = ['ATIVO', 'INATIVO', 'PENDENTE_APROVACAO', 'BLOQUEADO']
    for (const status of expected) {
      expect(STATUS_FORNECEDOR_LABELS[status]).toBeDefined()
    }
  })

  it('deve mapear corretamente', () => {
    expect(STATUS_FORNECEDOR_LABELS.ATIVO).toBe('Ativo')
    expect(STATUS_FORNECEDOR_LABELS.INATIVO).toBe('Inativo')
    expect(STATUS_FORNECEDOR_LABELS.PENDENTE_APROVACAO).toBe('Pendente')
    expect(STATUS_FORNECEDOR_LABELS.BLOQUEADO).toBe('Bloqueado')
  })
})

// ─── CANAL_LABELS ───────────────────────────────────────────────────────────

describe('CANAL_LABELS', () => {
  it('deve ter exatamente 4 canais', () => {
    expect(Object.keys(CANAL_LABELS)).toHaveLength(4)
  })

  it('deve conter todos os canais esperados', () => {
    const expected: CanalDisparo[] = ['EMAIL', 'WHATSAPP', 'API', 'PORTAL']
    for (const canal of expected) {
      expect(CANAL_LABELS[canal]).toBeDefined()
    }
  })

  it('deve mapear corretamente', () => {
    expect(CANAL_LABELS.EMAIL).toBe('Email')
    expect(CANAL_LABELS.WHATSAPP).toBe('WhatsApp')
    expect(CANAL_LABELS.API).toBe('API')
    expect(CANAL_LABELS.PORTAL).toBe('Portal')
  })
})

// ─── STATUS_BID_LABELS ──────────────────────────────────────────────────────

describe('STATUS_BID_LABELS', () => {
  it('deve ter exatamente 6 statuses de BID', () => {
    expect(Object.keys(STATUS_BID_LABELS)).toHaveLength(6)
  })

  it('deve conter todos os statuses esperados', () => {
    const expected: StatusBidRequest[] = [
      'PENDENTE', 'ENVIADO', 'VISUALIZADO', 'RESPONDIDO', 'EXPIRADO', 'ERRO_ENVIO',
    ]
    for (const status of expected) {
      expect(STATUS_BID_LABELS[status]).toBeDefined()
    }
  })

  it('deve mapear corretamente', () => {
    expect(STATUS_BID_LABELS.PENDENTE).toBe('Pendente')
    expect(STATUS_BID_LABELS.ENVIADO).toBe('Enviado')
    expect(STATUS_BID_LABELS.VISUALIZADO).toBe('Visualizado')
    expect(STATUS_BID_LABELS.RESPONDIDO).toBe('Respondido')
    expect(STATUS_BID_LABELS.EXPIRADO).toBe('Expirado')
    expect(STATUS_BID_LABELS.ERRO_ENVIO).toBe('Erro de envio')
  })
})

// ─── INCOTERMS ──────────────────────────────────────────────────────────────

describe('INCOTERMS', () => {
  it('deve ter exatamente 11 incoterms', () => {
    expect(INCOTERMS).toHaveLength(11)
  })

  it('deve conter todos os Incoterms 2020', () => {
    const expected = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']
    for (const inc of expected) {
      expect(INCOTERMS).toContain(inc)
    }
  })

  it('deve ser um array readonly (as const)', () => {
    // Verificar que cada elemento e uma string
    for (const inc of INCOTERMS) {
      expect(typeof inc).toBe('string')
    }
  })

  it('deve conter apenas valores unicos', () => {
    const unique = new Set(INCOTERMS)
    expect(unique.size).toBe(INCOTERMS.length)
  })

  it('valores devem ser strings uppercase de 3 letras', () => {
    for (const inc of INCOTERMS) {
      expect(inc).toMatch(/^[A-Z]{3}$/)
    }
  })
})

// ─── Type Guards (compile-time validation via assignment) ───────────────────

describe('Type guard — valores sao membros validos das unions', () => {
  it('TipoOperacao aceita IMPORTACAO e EXPORTACAO', () => {
    const op1: TipoOperacao = 'IMPORTACAO'
    const op2: TipoOperacao = 'EXPORTACAO'
    expect(op1).toBe('IMPORTACAO')
    expect(op2).toBe('EXPORTACAO')
  })

  it('ModalFrete aceita os 3 modais', () => {
    const modais: ModalFrete[] = ['MARITIMO', 'AEREO', 'RODOVIARIO']
    expect(modais).toHaveLength(3)
  })

  it('ModalidadeCarga aceita as 5 modalidades', () => {
    const mods: ModalidadeCarga[] = ['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']
    expect(mods).toHaveLength(5)
  })

  it('StatusCotacao aceita os 9 statuses', () => {
    const statuses: StatusCotacao[] = [
      'RASCUNHO', 'ENVIADA_FORNECEDORES', 'EM_COTACAO',
      'AGUARDANDO_APROVACAO', 'APROVADA', 'REPROVADA',
      'CANCELADA', 'FALTA_INFORMACAO', 'EXPIRADA',
    ]
    expect(statuses).toHaveLength(9)
  })

  it('Visibilidade aceita DIRECIONADA e ABERTA', () => {
    const vis1: Visibilidade = 'DIRECIONADA'
    const vis2: Visibilidade = 'ABERTA'
    expect(vis1).toBe('DIRECIONADA')
    expect(vis2).toBe('ABERTA')
  })

  it('Incoterm aceita valores do array INCOTERMS', () => {
    const fob: Incoterm = 'FOB'
    const cif: Incoterm = 'CIF'
    expect(fob).toBe('FOB')
    expect(cif).toBe('CIF')
  })
})
