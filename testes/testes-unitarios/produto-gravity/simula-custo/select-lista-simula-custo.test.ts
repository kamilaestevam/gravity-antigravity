/// <reference types="vitest/globals" />
// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { serializarSimulaCusto } from '../../../../servicos-global/produto/simula-custo/server/src/shared/select-lista-simula-custo.js'

describe('serializarSimulaCusto', () => {
  it('expõe impostos e campos ICMS/cotação frete no contrato da lista', () => {
    const linha = {
      id_simula_custo: 'sim-1',
      numero_simula_custo: 'EST-IMP-00001/26',
      referencia_simula_custo: null,
      tipo_operacao_simula_custo: 'IMPORTACAO',
      detalhe_operacao_simula_custo: 'DIRETA',
      status_simula_custo: 'EM_CRIACAO',
      ncm_simula_custo: '84713012',
      descricao_ncm_simula_custo: null,
      incoterm_simula_custo: 'FOB',
      quantidade_simula_custo: { toNumber: () => 1 },
      moeda_produto_simula_custo: 'USD',
      valor_produto_simula_custo: { toNumber: () => 10_000 },
      moeda_frete_simula_custo: 'USD',
      valor_frete_simula_custo: { toNumber: () => 0 },
      enviar_solicitacao_cotacao_frete_simula_custo: true,
      moeda_seguro_simula_custo: 'USD',
      valor_seguro_simula_custo: { toNumber: () => 0 },
      uf_desembaraco_simula_custo: 'SP',
      modalidade_recolhimento_icms_simula_custo: 'INTEGRAL',
      usa_beneficio_simula_custo: false,
      ptax_utilizada_simula_custo: { toNumber: () => 5.5 },
      valor_aduaneiro_simula_custo: { toNumber: () => 55_000 },
      total_tributos_simula_custo: { toNumber: () => 12_000 },
      custo_nacionalizado_brl_simula_custo: { toNumber: () => 67_000 },
      fonte_calculo_simula_custo: 'gravity-engine',
      aliquota_ii_simula_custo: { toNumber: () => 0.16 },
      base_calculo_ii_simula_custo: { toNumber: () => 55_000 },
      valor_ii_simula_custo: { toNumber: () => 8_800 },
      reducao_ii_simula_custo: { toNumber: () => 0 },
      aliquota_ipi_simula_custo: { toNumber: () => 0 },
      base_calculo_ipi_simula_custo: null,
      valor_ipi_simula_custo: null,
      aliquota_pis_simula_custo: { toNumber: () => 0.021 },
      base_calculo_pis_simula_custo: { toNumber: () => 55_000 },
      valor_pis_simula_custo: { toNumber: () => 1_155 },
      aliquota_cofins_simula_custo: { toNumber: () => 0.0965 },
      base_calculo_cofins_simula_custo: { toNumber: () => 55_000 },
      valor_cofins_simula_custo: { toNumber: () => 5_307.5 },
      aliquota_icms_simula_custo: { toNumber: () => 0.18 },
      base_calculo_icms_simula_custo: { toNumber: () => 60_000 },
      valor_icms_simula_custo: { toNumber: () => 10_800 },
      id_usuario: 'user-1',
      data_criacao_simula_custo: new Date('2026-07-21T12:00:00.000Z'),
      data_atualizacao_simula_custo: new Date('2026-07-21T12:00:00.000Z'),
    }

    const serializada = serializarSimulaCusto(linha)

    expect(serializada.enviar_solicitacao_cotacao_frete_simula_custo).toBe(true)
    expect(serializada.modalidade_recolhimento_icms_simula_custo).toBe('INTEGRAL')
    expect(serializada.valor_ii_simula_custo).toBe(8_800)
    expect(serializada.base_calculo_icms_simula_custo).toBe(60_000)
    expect(serializada.reducao_ii_simula_custo).toBe(0)
  })
})
