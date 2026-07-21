/**
 * Mapeia resultado do motor de cálculo para colunas de imposto em simula_custo.
 */
import type { ResultadoCalculoSimulaCusto } from '../lib/motor-calculo-simula-custo.js'

export function camposImpostosDeResultado(resultado: ResultadoCalculoSimulaCusto) {
  const { tributos } = resultado
  return {
    base_calculo_ii_simula_custo: tributos.ii.base_calculo,
    valor_ii_simula_custo: tributos.ii.valor,
    base_calculo_ipi_simula_custo: tributos.ipi.base_calculo,
    valor_ipi_simula_custo: tributos.ipi.valor,
    base_calculo_pis_simula_custo: tributos.pis.base_calculo,
    valor_pis_simula_custo: tributos.pis.valor,
    base_calculo_cofins_simula_custo: tributos.cofins.base_calculo,
    valor_cofins_simula_custo: tributos.cofins.valor,
    base_calculo_icms_simula_custo: tributos.icms.base_calculo,
    valor_icms_simula_custo: tributos.icms.valor,
  }
}

export function serializarImpostosSimulaCusto(linha: Record<string, unknown>) {
  const n = (k: string) => {
    const v = linha[k]
    if (v === null || v === undefined) return null
    return typeof v === 'number' ? v : Number(v)
  }
  return {
    aliquota_ii_simula_custo: n('aliquota_ii_simula_custo') ?? 0,
    base_calculo_ii_simula_custo: n('base_calculo_ii_simula_custo'),
    valor_ii_simula_custo: n('valor_ii_simula_custo'),
    reducao_ii_simula_custo: n('reducao_ii_simula_custo') ?? 0,
    aliquota_ipi_simula_custo: n('aliquota_ipi_simula_custo') ?? 0,
    base_calculo_ipi_simula_custo: n('base_calculo_ipi_simula_custo'),
    valor_ipi_simula_custo: n('valor_ipi_simula_custo'),
    aliquota_pis_simula_custo: n('aliquota_pis_simula_custo') ?? 0,
    base_calculo_pis_simula_custo: n('base_calculo_pis_simula_custo'),
    valor_pis_simula_custo: n('valor_pis_simula_custo'),
    aliquota_cofins_simula_custo: n('aliquota_cofins_simula_custo') ?? 0,
    base_calculo_cofins_simula_custo: n('base_calculo_cofins_simula_custo'),
    valor_cofins_simula_custo: n('valor_cofins_simula_custo'),
    aliquota_icms_simula_custo: n('aliquota_icms_simula_custo') ?? 0,
    base_calculo_icms_simula_custo: n('base_calculo_icms_simula_custo'),
    valor_icms_simula_custo: n('valor_icms_simula_custo'),
  }
}
