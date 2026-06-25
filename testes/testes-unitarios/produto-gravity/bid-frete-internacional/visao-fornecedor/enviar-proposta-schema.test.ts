import { describe, it, expect } from 'vitest'
import { EnviarPropostaSchema } from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/schemas/enviar-proposta-bid-frete-internacional-schema.js'

describe('EnviarPropostaSchema — portal fornecedor', () => {
  const basePayload = {
    moeda_proposta_bid_frete_internacional: 'USD',
    valor_frete_proposta_bid_frete_internacional: 777,
    taxas_origem_proposta_bid_frete_internacional: 77,
    taxas_destino_proposta_bid_frete_internacional: 77,
    dias_transito_proposta_bid_frete_internacional: 10,
    dias_prazo_pagamento_proposta_bid_frete_internacional: 30,
    transbordos_proposta_bid_frete_internacional: 0,
  }

  it('aceita validade no formato do input type=date (YYYY-MM-DD)', () => {
    const parsed = EnviarPropostaSchema.safeParse({
      ...basePayload,
      validade_proposta_bid_frete_internacional: '2026-07-01',
      dias_free_time_proposta_bid_frete_internacional: null,
      observacoes_proposta_bid_frete_internacional: null,
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.validade_proposta_bid_frete_internacional).toBe('2026-07-01T23:59:59.000Z')
      expect(parsed.data.dias_free_time_proposta_bid_frete_internacional).toBeNull()
    }
  })

  it('aceita validade em ISO datetime', () => {
    const parsed = EnviarPropostaSchema.safeParse({
      ...basePayload,
      validade_proposta_bid_frete_internacional: '2026-07-01T12:00:00.000Z',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.validade_proposta_bid_frete_internacional).toBe('2026-07-01T12:00:00.000Z')
    }
  })

  it('exige dias_prazo_pagamento_proposta_bid_frete_internacional', () => {
    const parsed = EnviarPropostaSchema.safeParse({
      ...basePayload,
      validade_proposta_bid_frete_internacional: '2026-07-01',
      dias_prazo_pagamento_proposta_bid_frete_internacional: undefined,
    })

    expect(parsed.success).toBe(false)
  })

  it('ignora campos extras enviados pelo frontend (ex.: valor_total)', () => {
    const parsed = EnviarPropostaSchema.safeParse({
      ...basePayload,
      validade_proposta_bid_frete_internacional: '2026-07-01',
      valor_total_proposta_bid_frete_internacional: 931,
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect('valor_total_proposta_bid_frete_internacional' in parsed.data).toBe(false)
    }
  })
})
