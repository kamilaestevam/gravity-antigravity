// Testa o contrato Zod de /api/v1/faturas* — Mandamentos 06 + 09.
// Garante que payloads válidos passam, payloads inválidos falham,
// e que TODOS os 6 valores do enum StatusFaturaProdutoGravity são aceitos.

import { describe, it, expect } from 'vitest'
import {
  faturaProdutoGravitySchema,
  listaFaturasProdutoGravitySchema,
  itensFaturaProdutoGravitySchema,
  statusFaturaProdutoGravitySchema,
  tipoDocumentoFaturaProdutoGravitySchema,
  documentoAnexoFaturaProdutoGravitySchema,
  listaDocumentosFaturaProdutoGravitySchema,
  atualizarFaturaProdutoGravitySchema,
} from '../../../servicos-global/configurador/src/schemas/fatura-produto-gravity'

const faturaValida = {
  id_fatura_produto_gravity:                'cuid_fatura_001',
  numero_fatura_produto_gravity:            '2026-000042',
  status_fatura_produto_gravity:            'OPEN',
  id_organizacao:                           'org_abc',
  nome_organizacao_fatura_produto_gravity:  'Importas SA',
  email_organizacao_fatura_produto_gravity: 'financeiro@importas.com',
  valor_total_fatura_produto_gravity:       3247.00,
  valor_pago_fatura_produto_gravity:        0,
  moeda_fatura_produto_gravity:             'brl',
  data_vencimento_fatura_produto_gravity:   '2026-04-05T00:00:00Z',
  competencia_fatura_produto_gravity:       '2026-03',
  descricao_fatura_produto_gravity:         'Mensalidade Plano Enterprise',
  url_externa_fatura_produto_gravity:       null,
  data_criacao_fatura_produto_gravity:      '2026-03-25T10:00:00Z',
  documentos_fatura_produto_gravity:        [],
  provider_fatura_produto_gravity:          'gravity',
}

describe('faturaProdutoGravitySchema', () => {
  it('aceita payload válido', () => {
    expect(faturaProdutoGravitySchema.parse(faturaValida)).toEqual(faturaValida)
  })

  it('aceita os 6 valores do enum StatusFaturaProdutoGravity', () => {
    const valores = ['DRAFT', 'OPEN', 'PAID', 'VOID', 'OVERDUE', 'UNCOLLECTIBLE'] as const
    for (const v of valores) {
      expect(statusFaturaProdutoGravitySchema.parse(v)).toBe(v)
    }
  })

  it('rejeita status legado em PT-BR (Pago/Pendente/Atrasado)', () => {
    expect(statusFaturaProdutoGravitySchema.safeParse('Pago').success).toBe(false)
    expect(statusFaturaProdutoGravitySchema.safeParse('Pendente').success).toBe(false)
    expect(statusFaturaProdutoGravitySchema.safeParse('Atrasado').success).toBe(false)
  })

  it('rejeita campos faltando', () => {
    const { id_fatura_produto_gravity, ...semId } = faturaValida
    expect(faturaProdutoGravitySchema.safeParse(semId).success).toBe(false)
  })

  it('rejeita valor_total como string (deve ser number)', () => {
    const ruim = { ...faturaValida, valor_total_fatura_produto_gravity: 'R$ 3247,00' }
    expect(faturaProdutoGravitySchema.safeParse(ruim).success).toBe(false)
  })

  it('aceita due_date null e competencia null', () => {
    const semDatas = {
      ...faturaValida,
      data_vencimento_fatura_produto_gravity: null,
      competencia_fatura_produto_gravity:     null,
    }
    expect(faturaProdutoGravitySchema.safeParse(semDatas).success).toBe(true)
  })
})

describe('listaFaturasProdutoGravitySchema', () => {
  it('aceita resposta GET /api/v1/faturas válida', () => {
    const payload = {
      faturas: [faturaValida],
      provider: 'gravity',
      paginacao: {
        cursor_proxima_fatura_produto_gravity: null,
        existem_mais_faturas_produto_gravity:  false,
      },
    }
    expect(listaFaturasProdutoGravitySchema.parse(payload).faturas).toHaveLength(1)
  })

  it('rejeita resposta sem paginacao', () => {
    const payload = { faturas: [], provider: 'gravity' }
    expect(listaFaturasProdutoGravitySchema.safeParse(payload).success).toBe(false)
  })
})

describe('itensFaturaProdutoGravitySchema', () => {
  it('aceita lista de itens', () => {
    const payload = {
      itens_fatura_produto_gravity: [
        {
          posicao_fatura_item_produto_gravity:        0,
          descricao_fatura_item_produto_gravity:      'Plano Enterprise',
          quantidade_fatura_item_produto_gravity:     1,
          valor_unitario_fatura_item_produto_gravity: 2499,
          valor_total_fatura_item_produto_gravity:    2499,
          moeda_fatura_item_produto_gravity:          'brl',
        },
      ],
    }
    expect(itensFaturaProdutoGravitySchema.parse(payload).itens_fatura_produto_gravity).toHaveLength(1)
  })

  it('aceita lista vazia', () => {
    expect(itensFaturaProdutoGravitySchema.parse({ itens_fatura_produto_gravity: [] }).itens_fatura_produto_gravity).toEqual([])
  })
})

describe('tipoDocumentoFaturaProdutoGravitySchema', () => {
  it('aceita os 5 valores canônicos', () => {
    const valores = ['BOLETO', 'NFE', 'RECIBO', 'PDF_GENERICO', 'OUTRO'] as const
    for (const v of valores) {
      expect(tipoDocumentoFaturaProdutoGravitySchema.parse(v)).toBe(v)
    }
  })

  it('rejeita valores legados (PDF, boleto lowercase, etc.)', () => {
    expect(tipoDocumentoFaturaProdutoGravitySchema.safeParse('PDF').success).toBe(false)
    expect(tipoDocumentoFaturaProdutoGravitySchema.safeParse('boleto').success).toBe(false)
    expect(tipoDocumentoFaturaProdutoGravitySchema.safeParse('nfse').success).toBe(false)
  })
})

describe('documentoAnexoFaturaProdutoGravitySchema', () => {
  const docValido = {
    id_documento_fatura_produto_gravity:           'doc_001',
    tipo_documento_fatura_produto_gravity:         'BOLETO' as const,
    nome_documento_fatura_produto_gravity:         'boleto-2026-04.pdf',
    url_documento_fatura_produto_gravity:          '/api/v1/faturas/x/documentos/doc_001/download',
    tamanho_documento_fatura_produto_gravity:      52341,
    mime_documento_fatura_produto_gravity:         'application/pdf',
    data_criacao_documento_fatura_produto_gravity: '2026-05-04T10:00:00Z',
  }

  it('aceita documento válido', () => {
    expect(documentoAnexoFaturaProdutoGravitySchema.parse(docValido)).toEqual(docValido)
  })

  it('aceita tamanho e mime null', () => {
    expect(documentoAnexoFaturaProdutoGravitySchema.parse({
      ...docValido,
      tamanho_documento_fatura_produto_gravity: null,
      mime_documento_fatura_produto_gravity:    null,
    }).tamanho_documento_fatura_produto_gravity).toBeNull()
  })

  it('lista de documentos aceita vazio', () => {
    expect(listaDocumentosFaturaProdutoGravitySchema.parse({ documentos_fatura_produto_gravity: [] }).documentos_fatura_produto_gravity).toEqual([])
  })

  it('rejeita tipo legado em snake_case', () => {
    const ruim = { ...docValido, tipo_documento_fatura_produto_gravity: 'pdf_generico' as unknown as 'BOLETO' }
    expect(documentoAnexoFaturaProdutoGravitySchema.safeParse(ruim).success).toBe(false)
  })
})

describe('atualizarFaturaProdutoGravitySchema (PATCH body)', () => {
  it('aceita payload mínimo (todos os campos opcionais)', () => {
    expect(atualizarFaturaProdutoGravitySchema.parse({}).itens_fatura_produto_gravity).toBeUndefined()
  })

  it('aceita payload completo com itens', () => {
    const body = {
      competencia_fatura_produto_gravity:       '2026-04',
      data_vencimento_fatura_produto_gravity:   '2026-05-05T00:00:00Z',
      email_organizacao_fatura_produto_gravity: 'fin@cliente.com',
      moeda_fatura_produto_gravity:             'brl',
      itens_fatura_produto_gravity: [{
        descricao_fatura_item_produto_gravity:      'Mensalidade',
        quantidade_fatura_item_produto_gravity:     1,
        valor_unitario_fatura_item_produto_gravity: 2499,
      }],
    }
    const parsed = atualizarFaturaProdutoGravitySchema.parse(body)
    expect(parsed.itens_fatura_produto_gravity).toHaveLength(1)
  })

  it('rejeita item com quantidade zero ou negativa', () => {
    const ruim = {
      itens_fatura_produto_gravity: [{
        descricao_fatura_item_produto_gravity:      'X',
        quantidade_fatura_item_produto_gravity:     0,
        valor_unitario_fatura_item_produto_gravity: 100,
      }],
    }
    expect(atualizarFaturaProdutoGravitySchema.safeParse(ruim).success).toBe(false)
  })

  it('rejeita item com valor unitário negativo', () => {
    const ruim = {
      itens_fatura_produto_gravity: [{
        descricao_fatura_item_produto_gravity:      'X',
        quantidade_fatura_item_produto_gravity:     1,
        valor_unitario_fatura_item_produto_gravity: -10,
      }],
    }
    expect(atualizarFaturaProdutoGravitySchema.safeParse(ruim).success).toBe(false)
  })

  it('rejeita email inválido', () => {
    const ruim = { email_organizacao_fatura_produto_gravity: 'sem-arroba' }
    expect(atualizarFaturaProdutoGravitySchema.safeParse(ruim).success).toBe(false)
  })

  it('aceita email null (limpar campo)', () => {
    expect(atualizarFaturaProdutoGravitySchema.parse({ email_organizacao_fatura_produto_gravity: null }).email_organizacao_fatura_produto_gravity).toBeNull()
  })
})
