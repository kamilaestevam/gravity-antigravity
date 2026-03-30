/**
 * Testes unitarios — BID Cambio / types.ts + labels
 * Valida que enums, labels e badges estao completos e alinhados
 */

import { describe, it, expect } from 'vitest'
import {
  OPERACAO_CAMBIO_LABELS,
  MODALIDADE_CAMBIO_LABELS,
  LIQUIDACAO_LABELS,
  MOEDA_CAMBIO_LABELS,
  MOEDA_SIMBOLO,
  STATUS_PARCELA_LABELS,
  STATUS_COTACAO_LABELS,
  CANAL_CAMBIO_LABELS,
  STATUS_BID_REQUEST_LABELS,
  STATUS_BID_RESPONSE_LABELS,
  TIPO_CORRETORA_LABELS,
  STATUS_CORRETORA_LABELS,
  METODO_VENCIMENTO_LABELS,
  STATUS_PARCELA_BADGE,
  STATUS_COTACAO_BADGE,
  STATUS_CORRETORA_BADGE,
  STATUS_BID_RESPONSE_BADGE,
} from '../../../produto/bid-cambio/client/src/shared/types'

describe('Enums alinhados com fragment.prisma', () => {
  it('TipoOperacaoCambio tem 2 valores', () => {
    const keys = Object.keys(OPERACAO_CAMBIO_LABELS)
    expect(keys).toEqual(['IMPORTACAO', 'EXPORTACAO'])
  })

  it('ModalidadeCambio tem 2 valores', () => {
    const keys = Object.keys(MODALIDADE_CAMBIO_LABELS)
    expect(keys).toEqual(['PRONTO', 'FUTURO'])
  })

  it('LiquidacaoCambio tem 3 valores', () => {
    const keys = Object.keys(LIQUIDACAO_LABELS)
    expect(keys).toEqual(['D0', 'D1', 'D2'])
  })

  it('MoedaCambio tem 7 valores', () => {
    const keys = Object.keys(MOEDA_CAMBIO_LABELS)
    expect(keys).toHaveLength(7)
    expect(keys).toContain('USD')
    expect(keys).toContain('EUR')
    expect(keys).toContain('BRL')
  })

  it('MOEDA_SIMBOLO cobre todas as moedas', () => {
    const moedas = Object.keys(MOEDA_CAMBIO_LABELS)
    const simbolos = Object.keys(MOEDA_SIMBOLO)
    expect(simbolos).toEqual(moedas)
  })

  it('StatusParcela tem 3 valores (masculino)', () => {
    const keys = Object.keys(STATUS_PARCELA_LABELS)
    expect(keys).toEqual(['PENDENTE', 'AGENDADO', 'PAGO'])
  })

  it('StatusCotacaoCambio tem 8 valores', () => {
    const keys = Object.keys(STATUS_COTACAO_LABELS)
    expect(keys).toHaveLength(8)
    expect(keys).toContain('RASCUNHO')
    expect(keys).toContain('APROVADA')
    expect(keys).toContain('EXPIRADA')
  })

  it('CanalDisparoCambio tem 2 valores', () => {
    const keys = Object.keys(CANAL_CAMBIO_LABELS)
    expect(keys).toEqual(['EMAIL', 'PORTAL'])
  })

  it('StatusBidRequestCambio tem 6 valores', () => {
    const keys = Object.keys(STATUS_BID_REQUEST_LABELS)
    expect(keys).toHaveLength(6)
  })

  it('StatusBidResponseCambio tem 7 valores (inclui tags)', () => {
    const keys = Object.keys(STATUS_BID_RESPONSE_LABELS)
    expect(keys).toHaveLength(7)
    expect(keys).toContain('RECEBIDA')
    expect(keys).toContain('MELHOR_TAXA')
    expect(keys).toContain('APROVADA')
  })

  it('TipoCorretora tem 4 valores', () => {
    const keys = Object.keys(TIPO_CORRETORA_LABELS)
    expect(keys).toEqual(['CORRETORA_CAMBIO', 'BANCO_COMERCIAL', 'BANCO_CAMBIO', 'FINTECH'])
  })

  it('StatusCorretora tem 3 valores (feminino)', () => {
    const keys = Object.keys(STATUS_CORRETORA_LABELS)
    expect(keys).toEqual(['ATIVA', 'INATIVA', 'BLOQUEADA'])
  })

  it('MetodoVencimento tem 7 valores', () => {
    const keys = Object.keys(METODO_VENCIMENTO_LABELS)
    expect(keys).toHaveLength(7)
    expect(keys).toContain('DATA_EMBARQUE')
    expect(keys).toContain('PRONTIDAO_CARGA')
    expect(keys).toContain('DATA_FIXA')
  })
})

describe('Badge maps cobrem todos os valores', () => {
  it('STATUS_PARCELA_BADGE cobre todos os status', () => {
    const labels = Object.keys(STATUS_PARCELA_LABELS)
    const badges = Object.keys(STATUS_PARCELA_BADGE)
    expect(badges).toEqual(labels)
  })

  it('STATUS_COTACAO_BADGE cobre todos os status', () => {
    const labels = Object.keys(STATUS_COTACAO_LABELS)
    const badges = Object.keys(STATUS_COTACAO_BADGE)
    expect(badges).toEqual(labels)
  })

  it('STATUS_CORRETORA_BADGE cobre todos os status', () => {
    const labels = Object.keys(STATUS_CORRETORA_LABELS)
    const badges = Object.keys(STATUS_CORRETORA_BADGE)
    expect(badges).toEqual(labels)
  })

  it('STATUS_BID_RESPONSE_BADGE cobre todos os status', () => {
    const labels = Object.keys(STATUS_BID_RESPONSE_LABELS)
    const badges = Object.keys(STATUS_BID_RESPONSE_BADGE)
    expect(badges).toEqual(labels)
  })
})

describe('Nenhum label vazio', () => {
  const allLabels = {
    ...OPERACAO_CAMBIO_LABELS,
    ...MODALIDADE_CAMBIO_LABELS,
    ...LIQUIDACAO_LABELS,
    ...MOEDA_CAMBIO_LABELS,
    ...STATUS_PARCELA_LABELS,
    ...STATUS_COTACAO_LABELS,
    ...CANAL_CAMBIO_LABELS,
    ...STATUS_BID_REQUEST_LABELS,
    ...STATUS_BID_RESPONSE_LABELS,
    ...TIPO_CORRETORA_LABELS,
    ...STATUS_CORRETORA_LABELS,
    ...METODO_VENCIMENTO_LABELS,
  }

  it('todos os labels sao strings nao-vazias', () => {
    for (const [key, label] of Object.entries(allLabels)) {
      expect(label, `Label vazio para ${key}`).toBeTruthy()
      expect(typeof label, `Label de ${key} nao e string`).toBe('string')
      expect(label.length, `Label de ${key} esta vazio`).toBeGreaterThan(0)
    }
  })
})
