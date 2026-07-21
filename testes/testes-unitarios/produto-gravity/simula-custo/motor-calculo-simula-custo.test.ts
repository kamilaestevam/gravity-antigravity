/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * motor-calculo-simula-custo.test.ts — Motor fiscal do Simula Custo.
 * Valida valor aduaneiro, cascata de tributos (II→IPI→PIS/COFINS→ICMS por dentro),
 * conversão cambial e redução de II por acordo.
 */
import { describe, expect, it } from 'vitest'
import {
  executarCalculoSimulaCusto,
  type EntradaCalculoSimulaCusto,
} from '../../../../servicos-global/produto/simula-custo/server/src/lib/motor-calculo-simula-custo'

function entradaBase(overrides: Partial<EntradaCalculoSimulaCusto> = {}): EntradaCalculoSimulaCusto {
  return {
    ncm_simula_custo: '84713012',
    valor_produto_simula_custo: 10000,
    moeda_produto_simula_custo: 'USD',
    ptax_venda: 5,
    valor_frete_simula_custo: 0,
    moeda_frete_simula_custo: 'USD',
    valor_seguro_simula_custo: 0,
    moeda_seguro_simula_custo: 'USD',
    taxas_origem: [],
    taxas_destino: [],
    uf_desembaraco_simula_custo: 'SP',
    aliquota_ii_simula_custo: 0,
    aliquota_ipi_simula_custo: 0,
    aliquota_pis_simula_custo: 0,
    aliquota_cofins_simula_custo: 0,
    aliquota_icms_simula_custo: 0,
    ...overrides,
  }
}

describe('executarCalculoSimulaCusto', () => {
  it('converte o valor aduaneiro para BRL via PTAX (10.000 USD × 5 = 50.000 BRL)', () => {
    const r = executarCalculoSimulaCusto(entradaBase())
    expect(r.valor_aduaneiro_brl).toBe(50_000)
    expect(r.total_tributos_brl).toBe(0)
    expect(r.custo_nacionalizado_brl).toBe(50_000)
  })

  it('não converte valores já em BRL', () => {
    const r = executarCalculoSimulaCusto(entradaBase({
      valor_produto_simula_custo: 1000,
      moeda_produto_simula_custo: 'BRL',
    }))
    expect(r.valor_aduaneiro_brl).toBe(1000)
  })

  it('soma frete, seguro e taxas de origem no valor aduaneiro', () => {
    const r = executarCalculoSimulaCusto(entradaBase({
      valor_frete_simula_custo: 500,   // USD → 2.500 BRL
      valor_seguro_simula_custo: 100,  // USD → 500 BRL
      taxas_origem: [{ nome: 'THC', valor: 200, moeda: 'USD' }], // → 1.000 BRL
    }))
    expect(r.valor_aduaneiro_brl).toBe(50_000 + 2_500 + 500 + 1_000)
    expect(r.taxas_origem_brl).toBe(1_000)
  })

  it('II incide sobre o valor aduaneiro', () => {
    const r = executarCalculoSimulaCusto(entradaBase({ aliquota_ii_simula_custo: 0.16 }))
    expect(r.tributos.ii.base_calculo).toBe(50_000)
    expect(r.tributos.ii.valor).toBeCloseTo(8_000, 2)
  })

  it('redução de II por acordo (16% com redução de 50% → 8% efetivo)', () => {
    const r = executarCalculoSimulaCusto(entradaBase({
      aliquota_ii_simula_custo: 0.16,
      reducao_ii_simula_custo: 0.5,
    }))
    expect(r.tributos.ii.aliquota).toBeCloseTo(0.08, 6)
    expect(r.tributos.ii.valor).toBeCloseTo(4_000, 2)
  })

  it('IPI incide sobre VA + II', () => {
    const r = executarCalculoSimulaCusto(entradaBase({
      aliquota_ii_simula_custo: 0.16,
      aliquota_ipi_simula_custo: 0.10,
    }))
    expect(r.tributos.ipi.base_calculo).toBeCloseTo(58_000, 2)
    expect(r.tributos.ipi.valor).toBeCloseTo(5_800, 2)
  })

  it('PIS e COFINS incidem sobre o valor aduaneiro', () => {
    const r = executarCalculoSimulaCusto(entradaBase({
      aliquota_pis_simula_custo: 0.021,
      aliquota_cofins_simula_custo: 0.0965,
    }))
    expect(r.tributos.pis.valor).toBeCloseTo(1_050, 2)
    expect(r.tributos.cofins.valor).toBeCloseTo(4_825, 2)
  })

  it('ICMS é calculado por dentro (gross-up)', () => {
    const r = executarCalculoSimulaCusto(entradaBase({ aliquota_icms_simula_custo: 0.18 }))
    // base = 50.000 / (1 - 0.18) = 60.975,61 → ICMS = 10.975,61
    expect(r.tributos.icms.base_calculo).toBeCloseTo(60_975.61, 2)
    expect(r.tributos.icms.valor).toBeCloseTo(10_975.61, 2)
  })

  it('taxas de destino entram na base do ICMS e no custo final, sem compor o VA', () => {
    const r = executarCalculoSimulaCusto(entradaBase({
      aliquota_icms_simula_custo: 0.18,
      taxas_destino: [{ nome: 'Armazenagem', valor: 8_200, moeda: 'BRL' }],
    }))
    expect(r.valor_aduaneiro_brl).toBe(50_000)
    expect(r.taxas_destino_brl).toBe(8_200)
    // base ICMS = (50.000 + 8.200) / 0.82
    expect(r.tributos.icms.base_calculo).toBeCloseTo(58_200 / 0.82, 2)
    expect(r.custo_nacionalizado_brl).toBeCloseTo(50_000 + r.total_tributos_brl + 8_200, 2)
  })

  it('cenário completo fecha a soma: VA + tributos + taxas destino = custo nacionalizado', () => {
    const r = executarCalculoSimulaCusto(entradaBase({
      valor_frete_simula_custo: 500,
      valor_seguro_simula_custo: 50,
      aliquota_ii_simula_custo: 0.16,
      aliquota_ipi_simula_custo: 0.0325,
      aliquota_pis_simula_custo: 0.021,
      aliquota_cofins_simula_custo: 0.0965,
      aliquota_icms_simula_custo: 0.18,
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

  it('ICMS isento zera valor e mantém alíquota efetiva 0% no detalhamento', () => {
    const r = executarCalculoSimulaCusto(entradaBase({
      aliquota_icms_simula_custo: 0.18,
      aliquota_icms_interna_uf_simula_custo: 0.18,
      modalidade_recolhimento_icms_simula_custo: 'ISENTO',
    }))
    expect(r.tributos.icms.aliquota).toBe(0)
    expect(r.tributos.icms.valor).toBe(0)
    expect(r.total_tributos_brl).toBeCloseTo(
      r.tributos.ii.valor + r.tributos.ipi.valor + r.tributos.pis.valor + r.tributos.cofins.valor,
      6,
    )
  })

  it('ICMS redução usa alíquota interna no gross-up e efetiva no imposto (50% de redução → 9% efetivo em SP)', () => {
    const integral = executarCalculoSimulaCusto(entradaBase({
      aliquota_icms_simula_custo: 0.18,
      aliquota_icms_interna_uf_simula_custo: 0.18,
      modalidade_recolhimento_icms_simula_custo: 'INTEGRAL',
    }))
    const reducao = executarCalculoSimulaCusto(entradaBase({
      aliquota_icms_simula_custo: 0.09,
      aliquota_icms_interna_uf_simula_custo: 0.18,
      modalidade_recolhimento_icms_simula_custo: 'REDUCAO',
    }))
    // Mesma base de cálculo (gross-up com 18%)
    expect(reducao.tributos.icms.base_calculo).toBeCloseTo(integral.tributos.icms.base_calculo, 2)
    // Imposto devido pela metade
    expect(reducao.tributos.icms.valor).toBeCloseTo(integral.tributos.icms.valor / 2, 2)
    expect(reducao.tributos.icms.reducao).toBeCloseTo(0.5, 6)
    expect(reducao.tributos.icms.aliquota).toBeCloseTo(0.09, 6)
    expect(reducao.custo_nacionalizado_brl).toBeLessThan(integral.custo_nacionalizado_brl)
  })

  it('ICMS diferido não compõe custo nacionalizado imediato', () => {
    const integral = executarCalculoSimulaCusto(entradaBase({
      aliquota_icms_simula_custo: 0.18,
      modalidade_recolhimento_icms_simula_custo: 'INTEGRAL',
    }))
    const diferido = executarCalculoSimulaCusto(entradaBase({
      aliquota_icms_simula_custo: 0.18,
      modalidade_recolhimento_icms_simula_custo: 'DIFERIDO',
    }))
    expect(diferido.tributos.icms.valor).toBe(0)
    expect(diferido.custo_nacionalizado_brl).toBeLessThan(integral.custo_nacionalizado_brl)
  })

  it('registra o timestamp do cálculo em ISO 8601', () => {
    const r = executarCalculoSimulaCusto(entradaBase())
    expect(new Date(r.calculado_em).toString()).not.toBe('Invalid Date')
  })
})
