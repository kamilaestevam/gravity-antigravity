/**
 * Testes unitarios — BID Frete / validators (Zod schemas)
 * Testa schemas de validacao definidos nas rotas do servidor.
 * Como os schemas estao inline nas rotas, recriamos eles aqui
 * para testar a validacao independentemente da rota.
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// ─── Reproduzindo os schemas do servidor para teste isolado ─────────────────
// Estes schemas sao identicos aos definidos nas rotas do servidor.

const CriarCotacaoSchema = z.object({
  referencia_interna: z.string().optional(),
  tipo_operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modal: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
  origem_codigo: z.string().min(1),
  origem_nome: z.string().min(1),
  origem_pais: z.string().min(1),
  destino_codigo: z.string().min(1),
  destino_nome: z.string().min(1),
  destino_pais: z.string().min(1),
  descricao_mercadoria: z.string().min(1),
  ncm: z.string().optional(),
  quantidade: z.number().int().positive().default(1),
  tipo_container: z.string().optional(),
  peso_kg: z.number().positive().optional(),
  cubagem_m3: z.number().positive().optional(),
  incoterm: z.string().min(1),
  zip_code_origem: z.string().optional(),
  zip_code_destino: z.string().optional(),
  valor_alvo: z.number().positive().optional(),
  moeda_target: z.string().default('USD'),
  visibilidade: z.enum(['DIRECIONADA', 'ABERTA']).default('DIRECIONADA'),
  anonima: z.boolean().default(false),
  data_limite_resposta: z.string().datetime().optional(),
  fornecedor_ids: z.array(z.string()).optional(),
})

const CriarFornecedorSchema = z.object({
  nome: z.string().min(1),
  nome_fantasia: z.string().optional(),
  tipo: z.enum(['AGENTE_CARGA', 'ARMADOR', 'CIA_AEREA', 'TRANSPORTADORA']),
  cnpj: z.string().optional(),
  email: z.string().email(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
  pais: z.string().optional(),
  cidade: z.string().optional(),
  clerk_user_id: z.string().optional(),
})

const DispararSchema = z.object({
  cotacao_id: z.string().min(1),
  fornecedor_ids: z.array(z.string()).min(1),
  canais: z.array(z.enum(['EMAIL', 'WHATSAPP'])).min(1),
})

const ResponderSchema = z.object({
  moeda: z.string().default('USD'),
  valor_frete: z.number().positive(),
  taxas_origem: z.number().min(0),
  taxas_destino: z.number().min(0),
  valor_total: z.number().positive(),
  transit_time_dias: z.number().int().positive(),
  free_time_dias: z.number().int().optional(),
  transbordos: z.number().int().min(0).default(0),
  escalas: z.string().optional(),
  observacoes: z.string().optional(),
  validade_cotacao: z.string().datetime(),
  detalhes_taxas: z.array(z.object({
    tipo: z.enum(['origem', 'destino', 'frete']),
    nome: z.string(),
    valor: z.number(),
    moeda: z.string().default('USD'),
  })).optional(),
})

const AvaliarSchema = z.object({
  fornecedor_id: z.string().min(1),
  cotacao_id: z.string().optional(),
  nota_frete: z.number().min(1).max(5),
  nota_atendimento: z.number().min(1).max(5),
  nota_prazo: z.number().min(1).max(5),
  nota_confiabilidade: z.number().min(1).max(5),
  comentario: z.string().optional(),
})

const AtualizarStatusSchema = z.object({
  status: z.enum(['APROVADA', 'REPROVADA', 'CANCELADA']),
  fornecedor_vencedor_id: z.string().optional(),
  motivo_reprovacao: z.string().optional(),
  motivo_cancelamento: z.string().optional(),
})

// ─── Testes ─────────────────────────────────────────────────────────────────

describe('CriarCotacaoSchema', () => {
  const validCotacao = {
    tipo_operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    modalidade: 'FCL',
    origem_codigo: 'CNSHA',
    origem_nome: 'Shanghai',
    origem_pais: 'China',
    destino_codigo: 'BRSSZ',
    destino_nome: 'Santos',
    destino_pais: 'Brasil',
    descricao_mercadoria: 'Auto Parts',
    incoterm: 'FOB',
  }

  it('deve aceitar cotacao valida com campos obrigatorios', () => {
    const result = CriarCotacaoSchema.safeParse(validCotacao)
    expect(result.success).toBe(true)
  })

  it('deve aceitar cotacao com todos os campos opcionais', () => {
    const full = {
      ...validCotacao,
      referencia_interna: 'PO-001',
      ncm: '8703.22.10',
      quantidade: 2,
      tipo_container: '40HC',
      peso_kg: 15000,
      cubagem_m3: 60,
      zip_code_origem: '201100',
      zip_code_destino: '11010-100',
      valor_alvo: 5000,
      moeda_target: 'USD',
      visibilidade: 'ABERTA',
      anonima: true,
      data_limite_resposta: '2026-04-30T23:59:59Z',
      fornecedor_ids: ['f1', 'f2'],
    }
    const result = CriarCotacaoSchema.safeParse(full)
    expect(result.success).toBe(true)
  })

  it('deve aplicar defaults corretamente', () => {
    const result = CriarCotacaoSchema.parse(validCotacao)
    expect(result.moeda_target).toBe('USD')
    expect(result.visibilidade).toBe('DIRECIONADA')
  })

  it('deve rejeitar tipo_operacao invalido', () => {
    const result = CriarCotacaoSchema.safeParse({ ...validCotacao, tipo_operacao: 'TRANSITO' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar modal invalido', () => {
    const result = CriarCotacaoSchema.safeParse({ ...validCotacao, modal: 'FERROVIARIO' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar modalidade invalida', () => {
    const result = CriarCotacaoSchema.safeParse({ ...validCotacao, modalidade: 'BREAKBULK' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar quando campos obrigatorios estao ausentes', () => {
    const result = CriarCotacaoSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map(i => i.path[0])
      expect(fields).toContain('tipo_operacao')
      expect(fields).toContain('modal')
      expect(fields).toContain('origem_codigo')
    }
  })

  it('deve rejeitar origem_codigo vazio', () => {
    const result = CriarCotacaoSchema.safeParse({ ...validCotacao, origem_codigo: '' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar descricao_mercadoria vazio', () => {
    const result = CriarCotacaoSchema.safeParse({ ...validCotacao, descricao_mercadoria: '' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar peso_kg negativo', () => {
    const result = CriarCotacaoSchema.safeParse({ ...validCotacao, peso_kg: -100 })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar valor_alvo zero', () => {
    const result = CriarCotacaoSchema.safeParse({ ...validCotacao, valor_alvo: 0 })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar data_limite_resposta com formato invalido', () => {
    const result = CriarCotacaoSchema.safeParse({ ...validCotacao, data_limite_resposta: '30/04/2026' })
    expect(result.success).toBe(false)
  })

  it('deve aceitar visibilidade ABERTA', () => {
    const result = CriarCotacaoSchema.safeParse({ ...validCotacao, visibilidade: 'ABERTA' })
    expect(result.success).toBe(true)
  })
})

describe('CriarFornecedorSchema', () => {
  const validFornecedor = {
    nome: 'Agente Teste',
    tipo: 'AGENTE_CARGA',
    email: 'agente@test.com',
  }

  it('deve aceitar fornecedor valido com campos obrigatorios', () => {
    const result = CriarFornecedorSchema.safeParse(validFornecedor)
    expect(result.success).toBe(true)
  })

  it('deve aceitar fornecedor com todos os campos opcionais', () => {
    const full = {
      ...validFornecedor,
      nome_fantasia: 'AT Freight',
      cnpj: '12.345.678/0001-00',
      telefone: '+5511999999999',
      whatsapp: '+5511999999999',
      website: 'https://agente.com',
      pais: 'Brasil',
      cidade: 'Sao Paulo',
      clerk_user_id: 'user_abc123',
    }
    const result = CriarFornecedorSchema.safeParse(full)
    expect(result.success).toBe(true)
  })

  it('deve rejeitar nome vazio', () => {
    const result = CriarFornecedorSchema.safeParse({ ...validFornecedor, nome: '' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar tipo invalido', () => {
    const result = CriarFornecedorSchema.safeParse({ ...validFornecedor, tipo: 'NVOCC' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar email invalido', () => {
    const result = CriarFornecedorSchema.safeParse({ ...validFornecedor, email: 'not-email' })
    expect(result.success).toBe(false)
  })

  it('deve aceitar todos os 4 tipos de fornecedor', () => {
    for (const tipo of ['AGENTE_CARGA', 'ARMADOR', 'CIA_AEREA', 'TRANSPORTADORA']) {
      const result = CriarFornecedorSchema.safeParse({ ...validFornecedor, tipo })
      expect(result.success).toBe(true)
    }
  })

  it('deve rejeitar sem campos obrigatorios', () => {
    const result = CriarFornecedorSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('DispararSchema', () => {
  it('deve aceitar disparo valido', () => {
    const result = DispararSchema.safeParse({
      cotacao_id: 'cot-1',
      fornecedor_ids: ['f1'],
      canais: ['EMAIL'],
    })
    expect(result.success).toBe(true)
  })

  it('deve aceitar multiplos fornecedores e canais', () => {
    const result = DispararSchema.safeParse({
      cotacao_id: 'cot-1',
      fornecedor_ids: ['f1', 'f2', 'f3'],
      canais: ['EMAIL', 'WHATSAPP'],
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar cotacao_id vazio', () => {
    const result = DispararSchema.safeParse({
      cotacao_id: '',
      fornecedor_ids: ['f1'],
      canais: ['EMAIL'],
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar fornecedor_ids vazio', () => {
    const result = DispararSchema.safeParse({
      cotacao_id: 'cot-1',
      fornecedor_ids: [],
      canais: ['EMAIL'],
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar canais vazio', () => {
    const result = DispararSchema.safeParse({
      cotacao_id: 'cot-1',
      fornecedor_ids: ['f1'],
      canais: [],
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar canal invalido', () => {
    const result = DispararSchema.safeParse({
      cotacao_id: 'cot-1',
      fornecedor_ids: ['f1'],
      canais: ['SMS'],
    })
    expect(result.success).toBe(false)
  })
})

describe('ResponderSchema', () => {
  const validResposta = {
    valor_frete: 2000,
    taxas_origem: 200,
    taxas_destino: 300,
    valor_total: 2500,
    transit_time_dias: 30,
    validade_cotacao: '2026-04-30T23:59:59Z',
  }

  it('deve aceitar resposta valida', () => {
    const result = ResponderSchema.safeParse(validResposta)
    expect(result.success).toBe(true)
  })

  it('deve aplicar default de moeda USD', () => {
    const result = ResponderSchema.parse(validResposta)
    expect(result.moeda).toBe('USD')
  })

  it('deve aplicar default de transbordos 0', () => {
    const result = ResponderSchema.parse(validResposta)
    expect(result.transbordos).toBe(0)
  })

  it('deve aceitar com detalhes_taxas', () => {
    const result = ResponderSchema.safeParse({
      ...validResposta,
      detalhes_taxas: [
        { tipo: 'origem', nome: 'THC', valor: 150, moeda: 'USD' },
        { tipo: 'destino', nome: 'Handling', valor: 100 },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar valor_frete negativo', () => {
    const result = ResponderSchema.safeParse({ ...validResposta, valor_frete: -100 })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar valor_frete zero', () => {
    const result = ResponderSchema.safeParse({ ...validResposta, valor_frete: 0 })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar transit_time_dias nao inteiro', () => {
    const result = ResponderSchema.safeParse({ ...validResposta, transit_time_dias: 30.5 })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar validade_cotacao com formato invalido', () => {
    const result = ResponderSchema.safeParse({ ...validResposta, validade_cotacao: '30/04/2026' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar tipo de taxa invalido em detalhes_taxas', () => {
    const result = ResponderSchema.safeParse({
      ...validResposta,
      detalhes_taxas: [{ tipo: 'extra', nome: 'Fee', valor: 50 }],
    })
    expect(result.success).toBe(false)
  })

  it('deve aceitar taxas_origem zero', () => {
    const result = ResponderSchema.safeParse({ ...validResposta, taxas_origem: 0 })
    expect(result.success).toBe(true)
  })
})

describe('AvaliarSchema', () => {
  const validAvaliacao = {
    fornecedor_id: 'f1',
    nota_frete: 4,
    nota_atendimento: 5,
    nota_prazo: 3,
    nota_confiabilidade: 4,
  }

  it('deve aceitar avaliacao valida', () => {
    const result = AvaliarSchema.safeParse(validAvaliacao)
    expect(result.success).toBe(true)
  })

  it('deve aceitar com cotacao_id e comentario', () => {
    const result = AvaliarSchema.safeParse({
      ...validAvaliacao,
      cotacao_id: 'cot-1',
      comentario: 'Excelente atendimento',
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar nota abaixo de 1', () => {
    const result = AvaliarSchema.safeParse({ ...validAvaliacao, nota_frete: 0 })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar nota acima de 5', () => {
    const result = AvaliarSchema.safeParse({ ...validAvaliacao, nota_atendimento: 6 })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar fornecedor_id vazio', () => {
    const result = AvaliarSchema.safeParse({ ...validAvaliacao, fornecedor_id: '' })
    expect(result.success).toBe(false)
  })

  it('deve aceitar notas de 1 a 5 (limites)', () => {
    const result1 = AvaliarSchema.safeParse({ ...validAvaliacao, nota_frete: 1, nota_prazo: 5 })
    expect(result1.success).toBe(true)
  })
})

describe('AtualizarStatusSchema', () => {
  it('deve aceitar status APROVADA', () => {
    const result = AtualizarStatusSchema.safeParse({ status: 'APROVADA' })
    expect(result.success).toBe(true)
  })

  it('deve aceitar status REPROVADA', () => {
    const result = AtualizarStatusSchema.safeParse({ status: 'REPROVADA', motivo_reprovacao: 'Preco alto' })
    expect(result.success).toBe(true)
  })

  it('deve aceitar status CANCELADA', () => {
    const result = AtualizarStatusSchema.safeParse({ status: 'CANCELADA', motivo_cancelamento: 'Desistencia' })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar status nao permitido', () => {
    const result = AtualizarStatusSchema.safeParse({ status: 'EM_COTACAO' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar status RASCUNHO (nao e transicao manual)', () => {
    const result = AtualizarStatusSchema.safeParse({ status: 'RASCUNHO' })
    expect(result.success).toBe(false)
  })

  it('deve aceitar APROVADA com fornecedor_vencedor_id', () => {
    const result = AtualizarStatusSchema.safeParse({
      status: 'APROVADA',
      fornecedor_vencedor_id: 'f1',
    })
    expect(result.success).toBe(true)
  })
})
