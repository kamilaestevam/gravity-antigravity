/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * Testes unitários — regra de bloqueio de exclusão (lista BID Frete Internacional)
 *
 * Regra aprovada (2026-06-11): exclusão definitiva só para cotações em RASCUNHO
 * ou nunca enviadas a fornecedor e sem propostas recebidas.
 */

import { motivoBloqueioExclusaoCotacao } from '../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/exclusoes-bid-frete-internacional'

describe('motivoBloqueioExclusaoCotacao', () => {
  it('RASCUNHO sem propostas e sem disparos → permitida', () => {
    expect(motivoBloqueioExclusaoCotacao({
      status_cotacao_bid_frete_internacional: 'RASCUNHO',
      total_propostas: 0,
      total_disparos: 0,
    })).toBeNull()
  })

  it('RASCUNHO com disparos (edge: disparo registrado antes do envio) → permitida', () => {
    expect(motivoBloqueioExclusaoCotacao({
      status_cotacao_bid_frete_internacional: 'RASCUNHO',
      total_propostas: 0,
      total_disparos: 1,
    })).toBeNull()
  })

  it('qualquer status com propostas recebidas → COM_PROPOSTAS', () => {
    for (const status of ['RASCUNHO', 'EM_COTACAO', 'APROVADA', 'CANCELADA', 'EXPIRADA']) {
      expect(motivoBloqueioExclusaoCotacao({
        status_cotacao_bid_frete_internacional: status,
        total_propostas: 1,
        total_disparos: 0,
      })).toBe('COM_PROPOSTAS')
    }
  })

  it('fora de RASCUNHO com disparos e sem propostas → ENVIADA_FORNECEDOR', () => {
    for (const status of ['ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO', 'EXPIRADA']) {
      expect(motivoBloqueioExclusaoCotacao({
        status_cotacao_bid_frete_internacional: status,
        total_propostas: 0,
        total_disparos: 2,
      })).toBe('ENVIADA_FORNECEDOR')
    }
  })

  it('fora de RASCUNHO sem disparos e sem propostas (nunca enviada) → permitida', () => {
    expect(motivoBloqueioExclusaoCotacao({
      status_cotacao_bid_frete_internacional: 'FALTA_INFORMACAO',
      total_propostas: 0,
      total_disparos: 0,
    })).toBeNull()
  })

  it('propostas tem precedencia sobre disparos no motivo', () => {
    expect(motivoBloqueioExclusaoCotacao({
      status_cotacao_bid_frete_internacional: 'EM_COTACAO',
      total_propostas: 2,
      total_disparos: 5,
    })).toBe('COM_PROPOSTAS')
  })
})
