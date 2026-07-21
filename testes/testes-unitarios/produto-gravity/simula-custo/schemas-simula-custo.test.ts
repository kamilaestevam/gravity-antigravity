/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * schemas-simula-custo.test.ts — Contratos Zod do backend (Mandamento 06).
 * Valida defaults, enums PT-BR e rejeição de payloads inválidos.
 */
import { describe, expect, it } from 'vitest'
import {
  CriarSimulaCustoSchema,
  AtualizarStatusSimulaCustoSchema,
  ListarSimulasCustoQuerySchema,
  SimularSimulaCustoSchema,
} from '../../../../servicos-global/produto/simula-custo/server/src/schemas/simula-custo-schema'

const PAYLOAD_MINIMO = {
  ncm_simula_custo: '84713012',
  valor_produto_simula_custo: 1000,
}

describe('CriarSimulaCustoSchema', () => {
  it('aceita payload mínimo e aplica defaults DDD', () => {
    const r = CriarSimulaCustoSchema.parse(PAYLOAD_MINIMO)
    expect(r.tipo_operacao_simula_custo).toBe('IMPORTACAO')
    expect(r.detalhe_operacao_simula_custo).toBe('DIRETA')
    expect(r.incoterm_simula_custo).toBe('FOB')
    expect(r.moeda_produto_simula_custo).toBe('USD')
    expect(r.uf_desembaraco_simula_custo).toBe('SP')
    expect(r.quantidade_simula_custo).toBe(1)
    expect(r.taxas_origem_simula_custo).toEqual([])
    expect(r.taxas_destino_simula_custo).toEqual([])
    expect(r.documentos_simula_custo).toEqual([])
  })

  it('rejeita NCM curto e valor negativo', () => {
    expect(CriarSimulaCustoSchema.safeParse({ ...PAYLOAD_MINIMO, ncm_simula_custo: '123' }).success).toBe(false)
    expect(CriarSimulaCustoSchema.safeParse({ ...PAYLOAD_MINIMO, valor_produto_simula_custo: -1 }).success).toBe(false)
  })

  it('rejeita enum fora do catálogo (valores PT-BR do DDD)', () => {
    expect(CriarSimulaCustoSchema.safeParse({
      ...PAYLOAD_MINIMO,
      tipo_operacao_simula_custo: 'IMPORT',
    }).success).toBe(false)
    expect(CriarSimulaCustoSchema.safeParse({
      ...PAYLOAD_MINIMO,
      detalhe_operacao_simula_custo: 'CONTA_ORDEM',
    }).success).toBe(true)
  })

  it('rejeita alíquota acima de 1 (fração, não percentual)', () => {
    expect(CriarSimulaCustoSchema.safeParse({
      ...PAYLOAD_MINIMO,
      aliquota_ii_simula_custo: 16,
    }).success).toBe(false)
  })

  it('aceita campos só-UI com sufixo _simula_custo (não persistem)', () => {
    const r = CriarSimulaCustoSchema.parse({
      ...PAYLOAD_MINIMO,
      numero_manual_simula_custo: 'EST-IMP-00099/26',
      reducao_icms_base_simula_custo: 0.4,
      itens_produto_simula_custo: [{
        ncm_item_produto_simula_custo: '84713012',
        moeda_item_produto_simula_custo: 'USD',
        valor_unitario_item_produto_simula_custo: 500,
        quantidade_item_produto_simula_custo: 2,
      }],
    })
    expect(r.numero_manual_simula_custo).toBe('EST-IMP-00099/26')
    expect(r.reducao_icms_base_simula_custo).toBe(0.4)
    expect(r.itens_produto_simula_custo).toHaveLength(1)
    expect(r.itens_produto_simula_custo![0].ncm_item_produto_simula_custo).toBe('84713012')
  })

  it('valida taxas e documentos aninhados', () => {
    const r = CriarSimulaCustoSchema.parse({
      ...PAYLOAD_MINIMO,
      taxas_origem_simula_custo: [{
        nome_taxa_origem_simula_custo: 'THC',
        moeda_taxa_origem_simula_custo: 'USD',
        valor_total_taxa_origem_simula_custo: 120,
      }],
      documentos_simula_custo: [{ tipo_documento_simula_custo: 'INVOICE', numero_documento_simula_custo: 'INV-1' }],
    })
    expect(r.taxas_origem_simula_custo[0].tipo_cobranca_taxa_origem_simula_custo).toBe('PROCESSO')
    expect(r.taxas_origem_simula_custo[0].valor_minimo_taxa_origem_simula_custo).toBe(0)
    expect(CriarSimulaCustoSchema.safeParse({
      ...PAYLOAD_MINIMO,
      documentos_simula_custo: [{ tipo_documento_simula_custo: 'NOTA_FISCAL', numero_documento_simula_custo: 'X' }],
    }).success).toBe(false)
  })
})

describe('AtualizarStatusSimulaCustoSchema', () => {
  it('aceita apenas os 3 status do enum', () => {
    for (const status of ['EM_CRIACAO', 'CRIADA', 'ARQUIVADA']) {
      expect(AtualizarStatusSimulaCustoSchema.safeParse({ status_simula_custo: status }).success).toBe(true)
    }
    expect(AtualizarStatusSimulaCustoSchema.safeParse({ status_simula_custo: 'CANCELADA' }).success).toBe(false)
  })
})

describe('ListarSimulasCustoQuerySchema', () => {
  it('coage paginação de string e aplica limites', () => {
    const r = ListarSimulasCustoQuerySchema.parse({ pagina: '2', limite: '50' })
    expect(r.pagina).toBe(2)
    expect(r.limite).toBe(50)
    expect(r.ordenar_por).toBe('data_criacao_simula_custo')
    expect(r.direcao).toBe('desc')
    expect(ListarSimulasCustoQuerySchema.safeParse({ limite: '500' }).success).toBe(false)
  })

  it('rejeita ordenação por coluna fora da whitelist', () => {
    expect(ListarSimulasCustoQuerySchema.safeParse({ ordenar_por: 'id_organizacao' }).success).toBe(false)
  })
})

describe('SimularSimulaCustoSchema', () => {
  it('exige alíquotas e NCM de 8 dígitos', () => {
    const ok = SimularSimulaCustoSchema.safeParse({
      ncm_simula_custo: '84713012',
      valor_produto_simula_custo: 100,
      moeda_produto_simula_custo: 'USD',
      aliquota_ii_simula_custo: 0.16,
      aliquota_ipi_simula_custo: 0,
      aliquota_pis_simula_custo: 0.021,
      aliquota_cofins_simula_custo: 0.0965,
      aliquota_icms_simula_custo: 0.18,
    })
    expect(ok.success).toBe(true)
    const semAliquota = SimularSimulaCustoSchema.safeParse({
      ncm_simula_custo: '84713012',
      valor_produto_simula_custo: 100,
      moeda_produto_simula_custo: 'USD',
    })
    expect(semAliquota.success).toBe(false)
  })
})
