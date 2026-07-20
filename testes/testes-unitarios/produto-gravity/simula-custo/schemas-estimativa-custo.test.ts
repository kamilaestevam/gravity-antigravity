/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * schemas-estimativa-custo.test.ts — Contratos Zod do backend (Mandamento 06).
 * Valida defaults, enums PT-BR e rejeição de payloads inválidos.
 */
import { describe, expect, it } from 'vitest'
import {
  CriarEstimativaCustoSchema,
  AtualizarStatusEstimativaCustoSchema,
  ListarEstimativasCustoQuerySchema,
  SimularEstimativaCustoSchema,
} from '../../../../servicos-global/produto/simula-custo/server/src/schemas/estimativa-custo-schema'

const PAYLOAD_MINIMO = {
  ncm_estimativa_custo: '84713012',
  valor_produto_estimativa_custo: 1000,
}

describe('CriarEstimativaCustoSchema', () => {
  it('aceita payload mínimo e aplica defaults DDD', () => {
    const r = CriarEstimativaCustoSchema.parse(PAYLOAD_MINIMO)
    expect(r.tipo_operacao_estimativa_custo).toBe('IMPORTACAO')
    expect(r.detalhe_operacao_estimativa_custo).toBe('DIRETA')
    expect(r.incoterm_estimativa_custo).toBe('FOB')
    expect(r.moeda_produto_estimativa_custo).toBe('USD')
    expect(r.uf_desembaraco_estimativa_custo).toBe('SP')
    expect(r.quantidade_estimativa_custo).toBe(1)
    expect(r.taxas_origem).toEqual([])
    expect(r.taxas_destino).toEqual([])
    expect(r.documentos).toEqual([])
  })

  it('rejeita NCM curto e valor negativo', () => {
    expect(CriarEstimativaCustoSchema.safeParse({ ...PAYLOAD_MINIMO, ncm_estimativa_custo: '123' }).success).toBe(false)
    expect(CriarEstimativaCustoSchema.safeParse({ ...PAYLOAD_MINIMO, valor_produto_estimativa_custo: -1 }).success).toBe(false)
  })

  it('rejeita enum fora do catálogo (valores PT-BR do DDD)', () => {
    expect(CriarEstimativaCustoSchema.safeParse({
      ...PAYLOAD_MINIMO,
      tipo_operacao_estimativa_custo: 'IMPORT',
    }).success).toBe(false)
    expect(CriarEstimativaCustoSchema.safeParse({
      ...PAYLOAD_MINIMO,
      detalhe_operacao_estimativa_custo: 'CONTA_ORDEM',
    }).success).toBe(true)
  })

  it('rejeita alíquota acima de 1 (fração, não percentual)', () => {
    expect(CriarEstimativaCustoSchema.safeParse({
      ...PAYLOAD_MINIMO,
      aliquota_ii_estimativa_custo: 16,
    }).success).toBe(false)
  })

  it('valida taxas e documentos aninhados', () => {
    const r = CriarEstimativaCustoSchema.parse({
      ...PAYLOAD_MINIMO,
      taxas_origem: [{ nome: 'THC', moeda: 'USD', valor_total: 120 }],
      documentos: [{ tipo_documento_estimativa_custo: 'INVOICE', numero_documento_estimativa_custo: 'INV-1' }],
    })
    expect(r.taxas_origem[0].tipo_cobranca).toBe('PROCESSO')
    expect(r.taxas_origem[0].valor_minimo).toBe(0)
    expect(CriarEstimativaCustoSchema.safeParse({
      ...PAYLOAD_MINIMO,
      documentos: [{ tipo_documento_estimativa_custo: 'NOTA_FISCAL', numero_documento_estimativa_custo: 'X' }],
    }).success).toBe(false)
  })
})

describe('AtualizarStatusEstimativaCustoSchema', () => {
  it('aceita apenas os 3 status do enum', () => {
    for (const status of ['EM_CRIACAO', 'CRIADA', 'ARQUIVADA']) {
      expect(AtualizarStatusEstimativaCustoSchema.safeParse({ status_estimativa_custo: status }).success).toBe(true)
    }
    expect(AtualizarStatusEstimativaCustoSchema.safeParse({ status_estimativa_custo: 'CANCELADA' }).success).toBe(false)
  })
})

describe('ListarEstimativasCustoQuerySchema', () => {
  it('coage paginação de string e aplica limites', () => {
    const r = ListarEstimativasCustoQuerySchema.parse({ pagina: '2', limite: '50' })
    expect(r.pagina).toBe(2)
    expect(r.limite).toBe(50)
    expect(r.ordenar_por).toBe('data_criacao_estimativa_custo')
    expect(r.direcao).toBe('desc')
    expect(ListarEstimativasCustoQuerySchema.safeParse({ limite: '500' }).success).toBe(false)
  })

  it('rejeita ordenação por coluna fora da whitelist', () => {
    expect(ListarEstimativasCustoQuerySchema.safeParse({ ordenar_por: 'id_organizacao' }).success).toBe(false)
  })
})

describe('SimularEstimativaCustoSchema', () => {
  it('exige alíquotas e NCM de 8 dígitos', () => {
    const ok = SimularEstimativaCustoSchema.safeParse({
      ncm_estimativa_custo: '84713012',
      valor_produto_estimativa_custo: 100,
      moeda_produto_estimativa_custo: 'USD',
      aliquota_ii_estimativa_custo: 0.16,
      aliquota_ipi_estimativa_custo: 0,
      aliquota_pis_estimativa_custo: 0.021,
      aliquota_cofins_estimativa_custo: 0.0965,
      aliquota_icms_estimativa_custo: 0.18,
    })
    expect(ok.success).toBe(true)
    const semAliquota = SimularEstimativaCustoSchema.safeParse({
      ncm_estimativa_custo: '84713012',
      valor_produto_estimativa_custo: 100,
      moeda_produto_estimativa_custo: 'USD',
    })
    expect(semAliquota.success).toBe(false)
  })
})
