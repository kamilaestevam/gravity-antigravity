/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * motor-calculo-estimativa-custo.test.ts — Motor fiscal do Estimativa Custo.
 * Valida valor aduaneiro, cascata de tributos (II→IPI→PIS/COFINS→ICMS por dentro),
 * conversão cambial e redução de II por acordo.
 */
import { describe, expect, it } from 'vitest'
import {
  executarCalculoEstimativaCusto,
  type EntradaCalculoEstimativaCusto,
} from '../../../../servicos-global/produto/simula-custo/server/src/lib/motor-calculo-estimativa-custo'

function entradaBase(overrides: Partial<EntradaCalculoEstimativaCusto> = {}): EntradaCalculoEstimativaCusto {
  return {
    ncm_estimativa_custo: '84713012',
    valor_produto_estimativa_custo: 10000,
    moeda_produto_estimativa_custo: 'USD',
    ptax_venda: 5,
    valor_frete_estimativa_custo: 0,
    moeda_frete_estimativa_custo: 'USD',
    valor_seguro_estimativa_custo: 0,
    moeda_seguro_estimativa_custo: 'USD',
    taxas_origem: [],
    taxas_destino: [],
    uf_desembaraco_estimativa_custo: 'SP',
    aliquota_ii_estimativa_custo: 0,
    aliquota_ipi_estimativa_custo: 0,
    aliquota_pis_estimativa_custo: 0,
    aliquota_cofins_estimativa_custo: 0,
    aliquota_icms_estimativa_custo: 0,
    ...overrides,
  }
}

describe('executarCalculoEstimativaCusto', () => {
  it('converte o valor aduaneiro para BRL via PTAX (10.000 USD × 5 = 50.000 BRL)', () => {
    const r = executarCalculoEstimativaCusto(entradaBase())
    expect(r.valor_aduaneiro_brl).toBe(50_000)
    expect(r.total_tributos_brl).toBe(0)
    expect(r.custo_nacionalizado_brl).toBe(50_000)
  })

  it('não converte valores já em BRL', () => {
    const r = executarCalculoEstimativaCusto(entradaBase({
      valor_produto_estimativa_custo: 1000,
      moeda_produto_estimativa_custo: 'BRL',
    }))
    expect(r.valor_aduaneiro_brl).toBe(1000)
  })

  it('soma frete, seguro e taxas de origem no valor aduaneiro', () => {
    const r = executarCalculoEstimativaCusto(entradaBase({
      valor_frete_estimativa_custo: 500,   // USD → 2.500 BRL
      valor_seguro_estimativa_custo: 100,  // USD → 500 BRL
      taxas_origem: [{ nome: 'THC', valor: 200, moeda: 'USD' }], // → 1.000 BRL
    }))
    expect(r.valor_aduaneiro_brl).toBe(50_000 + 2_500 + 500 + 1_000)
    expect(r.taxas_origem_brl).toBe(1_000)
  })

  it('II incide sobre o valor aduaneiro', () => {
    const r = executarCalculoEstimativaCusto(entradaBase({ aliquota_ii_estimativa_custo: 0.16 }))
    expect(r.tributos.ii.base_calculo).toBe(50_000)
    expect(r.tributos.ii.valor).toBeCloseTo(8_000, 2)
  })

  it('redução de II por acordo (16% com redução de 50% → 8% efetivo)', () => {
    const r = executarCalculoEstimativaCusto(entradaBase({
      aliquota_ii_estimativa_custo: 0.16,
      reducao_ii_estimativa_custo: 0.5,
    }))
    expect(r.tributos.ii.aliquota).toBeCloseTo(0.08, 6)
    expect(r.tributos.ii.valor).toBeCloseTo(4_000, 2)
  })

  it('IPI incide sobre VA + II', () => {
    const r = executarCalculoEstimativaCusto(entradaBase({
      aliquota_ii_estimativa_custo: 0.16,
      aliquota_ipi_estimativa_custo: 0.10,
    }))
    expect(r.tributos.ipi.base_calculo).toBeCloseTo(58_000, 2)
    expect(r.tributos.ipi.valor).toBeCloseTo(5_800, 2)
  })

  it('PIS e COFINS incidem sobre o valor aduaneiro', () => {
    const r = executarCalculoEstimativaCusto(entradaBase({
      aliquota_pis_estimativa_custo: 0.021,
      aliquota_cofins_estimativa_custo: 0.0965,
    }))
    expect(r.tributos.pis.valor).toBeCloseTo(1_050, 2)
    expect(r.tributos.cofins.valor).toBeCloseTo(4_825, 2)
  })

  it('ICMS é calculado por dentro (gross-up)', () => {
    const r = executarCalculoEstimativaCusto(entradaBase({ aliquota_icms_estimativa_custo: 0.18 }))
    // base = 50.000 / (1 - 0.18) = 60.975,61 → ICMS = 10.975,61
    expect(r.tributos.icms.base_calculo).toBeCloseTo(60_975.61, 2)
    expect(r.tributos.icms.valor).toBeCloseTo(10_975.61, 2)
  })

  it('taxas de destino entram na base do ICMS e no custo final, sem compor o VA', () => {
    const r = executarCalculoEstimativaCusto(entradaBase({
      aliquota_icms_estimativa_custo: 0.18,
      taxas_destino: [{ nome: 'Armazenagem', valor: 8_200, moeda: 'BRL' }],
    }))
    expect(r.valor_aduaneiro_brl).toBe(50_000)
    expect(r.taxas_destino_brl).toBe(8_200)
    // base ICMS = (50.000 + 8.200) / 0.82
    expect(r.tributos.icms.base_calculo).toBeCloseTo(58_200 / 0.82, 2)
    expect(r.custo_nacionalizado_brl).toBeCloseTo(50_000 + r.total_tributos_brl + 8_200, 2)
  })

  it('cenário completo fecha a soma: VA + tributos + taxas destino = custo nacionalizado', () => {
    const r = executarCalculoEstimativaCusto(entradaBase({
      valor_frete_estimativa_custo: 500,
      valor_seguro_estimativa_custo: 50,
      aliquota_ii_estimativa_custo: 0.16,
      aliquota_ipi_estimativa_custo: 0.0325,
      aliquota_pis_estimativa_custo: 0.021,
      aliquota_cofins_estimativa_custo: 0.0965,
      aliquota_icms_estimativa_custo: 0.18,
      taxas_origem: [{ nome: 'THC', valor: 120, moeda: 'USD' }],
      taxas_destino: [{ nome: 'Armazenagem', valor: 800, moeda: 'BRL' }],
    }))
    const soma = r.valor_aduaneiro_brl + r.total_tributos_brl + r.taxas_destino_brl
    expect(r.custo_nacionalizado_brl).toBeCloseTo(soma, 6)
    const somaTributos =
      r.tributos.ii.valor + r.tributos.ipi.valor + r.tributos.pis.valor +
      r.tributos.cofins.valor + r.tributos.icms.valor
    expect(r.total_tributos_brl).toBeCloseTo(somaTributos, 6)
  })

  it('registra o timestamp do cálculo em ISO 8601', () => {
    const r = executarCalculoEstimativaCusto(entradaBase())
    expect(new Date(r.calculado_em).toString()).not.toBe('Invalid Date')
  })
})
