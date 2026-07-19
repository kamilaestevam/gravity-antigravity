/**
 * motor-calculo-estimativa-custo.ts — Gravity Cloud Engine (Estimativa Custo)
 * Engine de cálculo fiscal para Importação (custo nacionalizado / landed cost).
 * Ordem de cálculo conforme legislação aduaneira brasileira e PRD oficial.
 */

export interface TaxaExtraEstimativaCusto {
  nome: string
  valor: number
  moeda: string
}

export interface EntradaCalculoEstimativaCusto {
  ncm_estimativa_custo: string
  valor_produto_estimativa_custo: number
  moeda_produto_estimativa_custo: string
  ptax_venda: number
  valor_frete_estimativa_custo: number
  moeda_frete_estimativa_custo: string
  valor_seguro_estimativa_custo: number
  moeda_seguro_estimativa_custo: string
  taxas_origem: TaxaExtraEstimativaCusto[]
  taxas_destino: TaxaExtraEstimativaCusto[]
  uf_desembaraco_estimativa_custo: string
  aliquota_ii_estimativa_custo: number
  aliquota_ipi_estimativa_custo: number
  aliquota_pis_estimativa_custo: number
  aliquota_cofins_estimativa_custo: number
  aliquota_icms_estimativa_custo: number
  reducao_ii_estimativa_custo?: number // acordos comerciais — 0.0 a 1.0
}

export interface DetalhamentoTributoEstimativaCusto {
  aliquota: number
  base_calculo: number
  valor: number
}

export interface ResultadoCalculoEstimativaCusto {
  valor_aduaneiro_brl: number
  tributos: {
    ii: DetalhamentoTributoEstimativaCusto
    ipi: DetalhamentoTributoEstimativaCusto
    pis: DetalhamentoTributoEstimativaCusto
    cofins: DetalhamentoTributoEstimativaCusto
    icms: DetalhamentoTributoEstimativaCusto
  }
  total_tributos_brl: number
  taxas_origem_brl: number
  taxas_destino_brl: number
  custo_nacionalizado_brl: number
  calculado_em: string
}

/** Converte valor para BRL usando PTAX fornecida. */
function converterParaBRL(valor: number, moeda: string, ptax: number): number {
  if (moeda === 'BRL') return valor
  return valor * ptax
}

/**
 * executarCalculoEstimativaCusto — Engine de 7 passos
 *
 * Passo 1: Valor Aduaneiro (VA) = (Produto + Frete + Seguro + Taxas Origem) × PTAX
 * Passo 2: II  = VA × Alíquota II × (1 − Redução II)
 * Passo 3: IPI = (VA + II) × Alíquota IPI
 * Passo 4: PIS = VA × Alíquota PIS
 * Passo 5: COFINS = VA × Alíquota COFINS
 * Passo 6: Base ICMS (Por Dentro) = (VA + II + IPI + PIS + COFINS + Taxas Destino) / (1 − Alíquota ICMS)
 * Passo 7: ICMS = Base ICMS × Alíquota ICMS
 */
export function executarCalculoEstimativaCusto(
  entrada: EntradaCalculoEstimativaCusto
): ResultadoCalculoEstimativaCusto {
  const ptax = entrada.ptax_venda

  // Passo 1 — Taxas de Origem & Valor Aduaneiro
  const taxasOrigemBrl = entrada.taxas_origem.reduce(
    (acc, t) => acc + converterParaBRL(t.valor, t.moeda, ptax), 0
  )
  const produtoBrl = converterParaBRL(entrada.valor_produto_estimativa_custo, entrada.moeda_produto_estimativa_custo, ptax)
  const freteBrl = converterParaBRL(entrada.valor_frete_estimativa_custo, entrada.moeda_frete_estimativa_custo, ptax)
  const seguroBrl = converterParaBRL(entrada.valor_seguro_estimativa_custo, entrada.moeda_seguro_estimativa_custo, ptax)
  const valorAduaneiroBrl = produtoBrl + freteBrl + seguroBrl + taxasOrigemBrl

  // Passo 2 — Imposto de Importação (II)
  const aliquotaIiEfetiva = entrada.aliquota_ii_estimativa_custo * (1 - (entrada.reducao_ii_estimativa_custo ?? 0))
  const valorIi = valorAduaneiroBrl * aliquotaIiEfetiva

  // Passo 3 — IPI (Base = VA + II)
  const baseIpi = valorAduaneiroBrl + valorIi
  const valorIpi = baseIpi * entrada.aliquota_ipi_estimativa_custo

  // Passo 4 — PIS (Base = VA)
  const valorPis = valorAduaneiroBrl * entrada.aliquota_pis_estimativa_custo

  // Passo 5 — COFINS (Base = VA)
  const valorCofins = valorAduaneiroBrl * entrada.aliquota_cofins_estimativa_custo

  // Taxas de Destino
  const taxasDestinoBrl = entrada.taxas_destino.reduce(
    (acc, t) => acc + converterParaBRL(t.valor, t.moeda, ptax), 0
  )

  // Passos 6 e 7 — ICMS "Por Dentro"
  const somaBasesPrevias = valorAduaneiroBrl + valorIi + valorIpi + valorPis + valorCofins + taxasDestinoBrl
  const baseIcms = somaBasesPrevias / (1 - entrada.aliquota_icms_estimativa_custo)
  const valorIcms = baseIcms * entrada.aliquota_icms_estimativa_custo

  const totalTributos = valorIi + valorIpi + valorPis + valorCofins + valorIcms
  const custoNacionalizadoBrl = valorAduaneiroBrl + totalTributos + taxasDestinoBrl

  return {
    valor_aduaneiro_brl: valorAduaneiroBrl,
    tributos: {
      ii:     { aliquota: aliquotaIiEfetiva,                        base_calculo: valorAduaneiroBrl, valor: valorIi },
      ipi:    { aliquota: entrada.aliquota_ipi_estimativa_custo,    base_calculo: baseIpi,           valor: valorIpi },
      pis:    { aliquota: entrada.aliquota_pis_estimativa_custo,    base_calculo: valorAduaneiroBrl, valor: valorPis },
      cofins: { aliquota: entrada.aliquota_cofins_estimativa_custo, base_calculo: valorAduaneiroBrl, valor: valorCofins },
      icms:   { aliquota: entrada.aliquota_icms_estimativa_custo,   base_calculo: baseIcms,          valor: valorIcms },
    },
    total_tributos_brl: totalTributos,
    taxas_origem_brl: taxasOrigemBrl,
    taxas_destino_brl: taxasDestinoBrl,
    custo_nacionalizado_brl: custoNacionalizadoBrl,
    calculado_em: new Date().toISOString(),
  }
}
