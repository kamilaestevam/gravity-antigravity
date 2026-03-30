/**
 * Testes unitarios — BID Cambio / Zod Schemas
 * Valida que os schemas Zod das rotas aceitam dados validos e rejeitam invalidos
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Re-declarar os schemas aqui (mesmos das rotas) para teste isolado
// Em producao, estes schemas seriam exportados das rotas

const listarSchema = z.object({
  status: z.enum(['PENDENTE', 'AGENDADO', 'PAGO']).optional(),
  moeda: z.string().optional(),
  data_vencimento_inicio: z.string().optional(),
  data_vencimento_fim: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
})

const agendarSchema = z.object({
  parcela_ids: z.array(z.string()).min(1),
  data_agendamento: z.string().refine(d => !isNaN(Date.parse(d)), 'Data invalida'),
})

const pagarSchema = z.object({
  parcela_id: z.string(),
  valor_pago: z.number().positive(),
  taxa_fechamento: z.number().positive(),
  banco_corretora: z.string().min(1),
  numero_contrato: z.string().optional(),
  anexos: z.array(z.object({
    nome_arquivo: z.string().optional(),
    nome_original: z.string(),
    url: z.string().url(),
    categoria: z.string().optional(),
  })).optional(),
})

const criarCotacaoSchema = z.object({
  moeda: z.enum(['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'BRL']),
  valor: z.number().positive(),
  tipo_operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modalidade: z.enum(['PRONTO', 'FUTURO']).default('PRONTO'),
  liquidacao: z.enum(['D0', 'D1', 'D2']).default('D2'),
  referencia_processo: z.string().optional(),
  numero_pedido: z.string().optional(),
  exportador: z.string().optional(),
  data_expiracao: z.string().optional(),
})

const responderSchema = z.object({
  taxa_oferecida: z.number().positive('Taxa deve ser positiva'),
  spread: z.number().min(0, 'Spread deve ser >= 0'),
  validade_minutos: z.number().int().min(1).max(1440).default(60),
  liquidacao_proposta: z.enum(['D0', 'D1', 'D2']).default('D2'),
  condicoes: z.string().optional(),
})

describe('listarSchema (GET /cambios)', () => {
  it('aceita query vazia (defaults)', () => {
    const result = listarSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(50)
    }
  })

  it('aceita status valido', () => {
    const result = listarSchema.safeParse({ status: 'PENDENTE' })
    expect(result.success).toBe(true)
  })

  it('rejeita status invalido', () => {
    const result = listarSchema.safeParse({ status: 'INVALIDO' })
    expect(result.success).toBe(false)
  })

  it('limita pagina a positivo', () => {
    const result = listarSchema.safeParse({ page: '0' })
    expect(result.success).toBe(false)
  })

  it('limita limit a 100', () => {
    const result = listarSchema.safeParse({ limit: '200' })
    expect(result.success).toBe(false)
  })
})

describe('agendarSchema (POST /cambios/agendar)', () => {
  it('aceita input valido', () => {
    const result = agendarSchema.safeParse({
      parcela_ids: ['abc123'],
      data_agendamento: '2026-04-15T00:00:00.000Z',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita parcela_ids vazio', () => {
    const result = agendarSchema.safeParse({
      parcela_ids: [],
      data_agendamento: '2026-04-15',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita data invalida', () => {
    const result = agendarSchema.safeParse({
      parcela_ids: ['abc123'],
      data_agendamento: 'nao-e-data',
    })
    expect(result.success).toBe(false)
  })
})

describe('pagarSchema (POST /cambios/pagar)', () => {
  it('aceita pagamento valido', () => {
    const result = pagarSchema.safeParse({
      parcela_id: 'abc123',
      valor_pago: 10000.50,
      taxa_fechamento: 5.2345,
      banco_corretora: 'Banco XYZ',
    })
    expect(result.success).toBe(true)
  })

  it('RN: valor deve ser positivo', () => {
    const result = pagarSchema.safeParse({
      parcela_id: 'abc123',
      valor_pago: 0,
      taxa_fechamento: 5.23,
      banco_corretora: 'Banco XYZ',
    })
    expect(result.success).toBe(false)
  })

  it('RN: taxa deve ser positiva', () => {
    const result = pagarSchema.safeParse({
      parcela_id: 'abc123',
      valor_pago: 100,
      taxa_fechamento: -1,
      banco_corretora: 'Banco XYZ',
    })
    expect(result.success).toBe(false)
  })

  it('aceita anexos validos', () => {
    const result = pagarSchema.safeParse({
      parcela_id: 'abc123',
      valor_pago: 100,
      taxa_fechamento: 5.23,
      banco_corretora: 'Banco XYZ',
      anexos: [{ nome_original: 'contrato.pdf', url: 'https://storage.example.com/contrato.pdf' }],
    })
    expect(result.success).toBe(true)
  })

  it('rejeita anexo com URL invalida', () => {
    const result = pagarSchema.safeParse({
      parcela_id: 'abc123',
      valor_pago: 100,
      taxa_fechamento: 5.23,
      banco_corretora: 'Banco XYZ',
      anexos: [{ nome_original: 'contrato.pdf', url: 'nao-e-url' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('criarCotacaoSchema (POST /cotacoes)', () => {
  it('aceita cotacao valida', () => {
    const result = criarCotacaoSchema.safeParse({
      moeda: 'USD',
      valor: 50000,
      tipo_operacao: 'IMPORTACAO',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.modalidade).toBe('PRONTO')
      expect(result.data.liquidacao).toBe('D2')
    }
  })

  it('rejeita moeda inexistente', () => {
    const result = criarCotacaoSchema.safeParse({
      moeda: 'ARS',
      valor: 50000,
      tipo_operacao: 'IMPORTACAO',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita valor negativo', () => {
    const result = criarCotacaoSchema.safeParse({
      moeda: 'USD',
      valor: -100,
      tipo_operacao: 'IMPORTACAO',
    })
    expect(result.success).toBe(false)
  })
})

describe('responderSchema (POST /portal/responder)', () => {
  it('aceita resposta valida', () => {
    const result = responderSchema.safeParse({
      taxa_oferecida: 5.2345,
      spread: 0.0150,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.validade_minutos).toBe(60)
      expect(result.data.liquidacao_proposta).toBe('D2')
    }
  })

  it('rejeita taxa negativa', () => {
    const result = responderSchema.safeParse({
      taxa_oferecida: -1,
      spread: 0.01,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita spread negativo', () => {
    const result = responderSchema.safeParse({
      taxa_oferecida: 5.23,
      spread: -0.01,
    })
    expect(result.success).toBe(false)
  })

  it('RN-002: validade maxima 1440 min (24h)', () => {
    const result = responderSchema.safeParse({
      taxa_oferecida: 5.23,
      spread: 0.01,
      validade_minutos: 1441,
    })
    expect(result.success).toBe(false)
  })

  it('aceita todas as liquidacoes', () => {
    for (const liq of ['D0', 'D1', 'D2']) {
      const result = responderSchema.safeParse({
        taxa_oferecida: 5.23,
        spread: 0.01,
        liquidacao_proposta: liq,
      })
      expect(result.success, `Falhou para ${liq}`).toBe(true)
    }
  })
})
