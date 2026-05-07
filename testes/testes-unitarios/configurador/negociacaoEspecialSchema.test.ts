// Testa o contrato Zod de /api/v1/admin/produtos-gravity/:id/negociacao-especial
// e /api/v1/organizacoes/me/negociacao-especial — Mandamentos 06 + 09.

import { describe, it, expect } from 'vitest'
import {
  negociacaoEspecialProdutoGravitySchema,
} from '../../../servicos-global/configurador/src/schemas/produto-gravity-completo'
import {
  criarNegociacaoEspecialRequestSchema,
  atualizarNegociacaoEspecialRequestSchema,
  listaNegociacaoEspecialProdutoGravitySchema,
} from '../../../servicos-global/configurador/src/schemas/negociacao-especial'

const negociacaoValida = {
  id_negociacao_especial:               'cuid_neg_001',
  id_produto_gravity:                   'cuid_produto_pedido',
  id_organizacao:                       'cuid_org_cde',
  nome_organizacao_negociacao_especial: 'CDE',
  acordo_negociacao_especial:           'Preco fixo R$ 1500/mes',
  valor_unitario_negociacao_especial:   '1500.00',
  moeda_negociacao_especial:            'BRL',
  data_inicio_negociacao_especial:      '2026-05-01T00:00:00.000Z',
  data_fim_negociacao_especial:         null,
  ilimitado_prazo_negociacao_especial:  true,
  data_criacao_negociacao_especial:     '2026-05-07T18:00:00.000Z',
  data_atualizacao_negociacao_especial: '2026-05-07T18:00:00.000Z',
}

describe('negociacaoEspecialProdutoGravitySchema (response)', () => {
  it('aceita payload completo valido', () => {
    expect(() => negociacaoEspecialProdutoGravitySchema.parse(negociacaoValida)).not.toThrow()
  })

  it('aceita valor_unitario null (acordo so descritivo)', () => {
    expect(() => negociacaoEspecialProdutoGravitySchema.parse({
      ...negociacaoValida,
      valor_unitario_negociacao_especial: null,
    })).not.toThrow()
  })

  it('aceita data_inicio e data_fim null (vigencia indeterminada)', () => {
    expect(() => negociacaoEspecialProdutoGravitySchema.parse({
      ...negociacaoValida,
      data_inicio_negociacao_especial: null,
      data_fim_negociacao_especial:    null,
    })).not.toThrow()
  })

  it('rejeita ilimitado nao-boolean', () => {
    expect(() => negociacaoEspecialProdutoGravitySchema.parse({
      ...negociacaoValida,
      ilimitado_prazo_negociacao_especial: 'sim',
    })).toThrow()
  })

  it('rejeita id ausente', () => {
    const semId = { ...negociacaoValida } as Record<string, unknown>
    delete semId.id_negociacao_especial
    expect(() => negociacaoEspecialProdutoGravitySchema.parse(semId)).toThrow()
  })

  it('rejeita data_criacao em formato invalido', () => {
    expect(() => negociacaoEspecialProdutoGravitySchema.parse({
      ...negociacaoValida,
      data_criacao_negociacao_especial: '07/05/2026',
    })).toThrow()
  })
})

describe('criarNegociacaoEspecialRequestSchema', () => {
  const bodyValido = {
    id_organizacao:                       'cuid_org_cde',
    nome_organizacao_negociacao_especial: 'CDE',
    acordo_negociacao_especial:           'Preco fixo R$ 1500/mes',
    valor_unitario_negociacao_especial:   '1500.00',
    moeda_negociacao_especial:            'BRL',
    ilimitado_prazo_negociacao_especial:  true,
  }

  it('aceita body completo', () => {
    expect(() => criarNegociacaoEspecialRequestSchema.parse(bodyValido)).not.toThrow()
  })

  it('aceita valor numerico em vez de string', () => {
    expect(() => criarNegociacaoEspecialRequestSchema.parse({
      ...bodyValido,
      valor_unitario_negociacao_especial: 1500,
    })).not.toThrow()
  })

  it('aceita valor null e moeda omitida', () => {
    expect(() => criarNegociacaoEspecialRequestSchema.parse({
      id_organizacao:                       'org_x',
      nome_organizacao_negociacao_especial: 'X',
      acordo_negociacao_especial:           'Desconto 20%',
      valor_unitario_negociacao_especial:   null,
    })).not.toThrow()
  })

  it('rejeita id_organizacao vazio', () => {
    expect(() => criarNegociacaoEspecialRequestSchema.parse({
      ...bodyValido,
      id_organizacao: '',
    })).toThrow()
  })

  it('rejeita acordo vazio', () => {
    expect(() => criarNegociacaoEspecialRequestSchema.parse({
      ...bodyValido,
      acordo_negociacao_especial: '',
    })).toThrow()
  })

  it('rejeita acordo > 2000 chars', () => {
    expect(() => criarNegociacaoEspecialRequestSchema.parse({
      ...bodyValido,
      acordo_negociacao_especial: 'a'.repeat(2001),
    })).toThrow()
  })

  it('rejeita moeda com tamanho diferente de 3', () => {
    expect(() => criarNegociacaoEspecialRequestSchema.parse({
      ...bodyValido,
      moeda_negociacao_especial: 'BR',
    })).toThrow()
  })
})

describe('atualizarNegociacaoEspecialRequestSchema', () => {
  it('aceita body parcial (so acordo)', () => {
    expect(() => atualizarNegociacaoEspecialRequestSchema.parse({
      acordo_negociacao_especial: 'Novo texto',
    })).not.toThrow()
  })

  it('aceita body vazio (no-op valido)', () => {
    expect(() => atualizarNegociacaoEspecialRequestSchema.parse({})).not.toThrow()
  })

  it('rejeita id_organizacao no body (campo imutavel)', () => {
    // Schema nao tem id_organizacao — qualquer outro campo passa pra ser ignorado pelo Zod
    // mas atualizar com id_organizacao no body NAO altera nada (campo nao mapeado).
    // Este teste documenta o comportamento esperado.
    const result = atualizarNegociacaoEspecialRequestSchema.parse({
      acordo_negociacao_especial: 'X',
      id_organizacao: 'tentativa-de-trocar', // ignorado pelo Zod (passthrough OFF por padrao)
    } as unknown as { acordo_negociacao_especial: string })
    expect(result).not.toHaveProperty('id_organizacao')
  })
})

describe('listaNegociacaoEspecialProdutoGravitySchema (response)', () => {
  it('aceita lista vazia', () => {
    expect(() => listaNegociacaoEspecialProdutoGravitySchema.parse({
      negociacao_especial: [],
    })).not.toThrow()
  })

  it('aceita lista com 2 negociacoes', () => {
    expect(() => listaNegociacaoEspecialProdutoGravitySchema.parse({
      negociacao_especial: [negociacaoValida, negociacaoValida],
    })).not.toThrow()
  })

  it('rejeita campo errado de lista', () => {
    expect(() => listaNegociacaoEspecialProdutoGravitySchema.parse({
      negociacoes_produto_gravity: [negociacaoValida],
    })).toThrow()
  })
})
