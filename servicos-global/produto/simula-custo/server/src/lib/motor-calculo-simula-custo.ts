/**
 * motor-calculo-simula-custo.ts — Gravity Cloud Engine (Simula Custo)
 * Engine de cálculo fiscal para Importação (custo nacionalizado / landed cost).
 * Ordem de cálculo conforme legislação aduaneira brasileira e PRD oficial.
 */
import { calcularIcmsImportacaoSimulaCusto } from '../shared/calculo-icms-importacao-simula-custo.js'
import { resolverAliquotaIcmsInternaUfSimulaCusto } from '../shared/aliquotas-icms-interna-uf.js'
import type { ModalidadeRecolhimentoIcmsSimulaCusto } from '../shared/modalidade-recolhimento-icms-simula-custo.js'

export interface TaxaOrigemCalculoSimulaCusto {
  nome_taxa_origem_simula_custo: string
  valor_total_taxa_origem_simula_custo: number
  moeda_taxa_origem_simula_custo: string
}

export interface TaxaDestinoCalculoSimulaCusto {
  nome_taxa_destino_simula_custo: string
  valor_total_taxa_destino_simula_custo: number
  moeda_taxa_destino_simula_custo: string
}

export interface EntradaCalculoSimulaCusto {
  ncm_simula_custo: string
  valor_produto_simula_custo: number
  moeda_produto_simula_custo: string
  ptax_venda: number
  valor_frete_simula_custo: number
  moeda_frete_simula_custo: string
  valor_seguro_simula_custo: number
  moeda_seguro_simula_custo: string
  taxas_origem_simula_custo: TaxaOrigemCalculoSimulaCusto[]
  taxas_destino_simula_custo: TaxaDestinoCalculoSimulaCusto[]
  uf_desembaraco_simula_custo: string
  aliquota_ii_simula_custo: number
  aliquota_ipi_simula_custo: number
  aliquota_pis_simula_custo: number
  aliquota_cofins_simula_custo: number
  aliquota_icms_simula_custo: number
  /** Alíquota interna da UF — gross-up. Se omitida, usa catálogo ou alíquota efetiva. */
  aliquota_icms_interna_uf_simula_custo?: number
  modalidade_recolhimento_icms_simula_custo?: ModalidadeRecolhimentoIcmsSimulaCusto
  reducao_ii_simula_custo?: number // acordos comerciais — 0.0 a 1.0
}

export interface DetalhamentoTributoSimulaCusto {
  aliquota: number
  base_calculo: number
  valor: number
  reducao?: number | null
  aliquota_interna_uf?: number | null
}

export interface ResultadoCalculoSimulaCusto {
  valor_aduaneiro_brl: number
  tributos: {
    ii: DetalhamentoTributoSimulaCusto
    ipi: DetalhamentoTributoSimulaCusto
    pis: DetalhamentoTributoSimulaCusto
    cofins: DetalhamentoTributoSimulaCusto
    icms: DetalhamentoTributoSimulaCusto
  }
  total_tributos_brl: number
  taxas_origem_brl_simula_custo: number
  taxas_destino_brl_simula_custo: number
  custo_nacionalizado_brl: number
  calculado_em: string
}

/** Converte valor para BRL usando PTAX fornecida. */
function converterParaBRL(valor: number, moeda: string, ptax: number): number {
  if (moeda === 'BRL') return valor
  return valor * ptax
}

/**
 * executarCalculoSimulaCusto — Engine de 7 passos
 *
 * Passo 1: Valor Aduaneiro (VA) = (Produto + Frete + Seguro + Taxas Origem) × PTAX
 * Passo 2: II  = VA × Alíquota II × (1 − Redução II)
 * Passo 3: IPI = (VA + II) × Alíquota IPI
 * Passo 4: PIS = VA × Alíquota PIS
 * Passo 5: COFINS = VA × Alíquota COFINS
 * Passo 6: Base ICMS (Por Dentro) = (VA + II + IPI + PIS + COFINS + Taxas Destino) / (1 − Alíquota Interna UF)
 * Passo 7: ICMS = Base ICMS × Alíquota Efetiva (redução TTD/convênio mantém alíquota interna no divisor)
 */
export function executarCalculoSimulaCusto(
  entrada: EntradaCalculoSimulaCusto
): ResultadoCalculoSimulaCusto {
  const ptax = entrada.ptax_venda

  // Passo 1 — Taxas de Origem & Valor Aduaneiro
  const taxasOrigemBrl = entrada.taxas_origem_simula_custo.reduce(
    (acc, t) => acc + converterParaBRL(
      t.valor_total_taxa_origem_simula_custo,
      t.moeda_taxa_origem_simula_custo,
      ptax,
    ), 0
  )
  const produtoBrl = converterParaBRL(entrada.valor_produto_simula_custo, entrada.moeda_produto_simula_custo, ptax)
  const freteBrl = converterParaBRL(entrada.valor_frete_simula_custo, entrada.moeda_frete_simula_custo, ptax)
  const seguroBrl = converterParaBRL(entrada.valor_seguro_simula_custo, entrada.moeda_seguro_simula_custo, ptax)
  const valorAduaneiroBrl = produtoBrl + freteBrl + seguroBrl + taxasOrigemBrl

  // Passo 2 — Imposto de Importação (II)
  const aliquotaIiEfetiva = entrada.aliquota_ii_simula_custo * (1 - (entrada.reducao_ii_simula_custo ?? 0))
  const valorIi = valorAduaneiroBrl * aliquotaIiEfetiva

  // Passo 3 — IPI (Base = VA + II)
  const baseIpi = valorAduaneiroBrl + valorIi
  const valorIpi = baseIpi * entrada.aliquota_ipi_simula_custo

  // Passo 4 — PIS (Base = VA)
  const valorPis = valorAduaneiroBrl * entrada.aliquota_pis_simula_custo

  // Passo 5 — COFINS (Base = VA)
  const valorCofins = valorAduaneiroBrl * entrada.aliquota_cofins_simula_custo

  // Taxas de Destino
  const taxasDestinoBrl = entrada.taxas_destino_simula_custo.reduce(
    (acc, t) => acc + converterParaBRL(
      t.valor_total_taxa_destino_simula_custo,
      t.moeda_taxa_destino_simula_custo,
      ptax,
    ), 0
  )

  // Passos 6 e 7 — ICMS "Por Dentro" (alíquota interna no gross-up; efetiva no imposto devido)
  const modalidadeIcms = entrada.modalidade_recolhimento_icms_simula_custo ?? 'INTEGRAL'
  const aliquotaIcmsEfetiva = entrada.aliquota_icms_simula_custo
  const aliquotaIcmsInternaUf = resolverAliquotaIcmsInternaUfSimulaCusto(
    entrada.uf_desembaraco_simula_custo,
  )
  const aliquotaIcmsInterna = entrada.aliquota_icms_interna_uf_simula_custo
    ?? (modalidadeIcms === 'REDUCAO'
      ? (aliquotaIcmsInternaUf ?? aliquotaIcmsEfetiva)
      : aliquotaIcmsEfetiva)
  const somaBasesPrevias = valorAduaneiroBrl + valorIi + valorIpi + valorPis + valorCofins + taxasDestinoBrl
  const icms = calcularIcmsImportacaoSimulaCusto({
    modalidade: modalidadeIcms,
    somaBasesPrevias,
    aliquotaInternaUf: aliquotaIcmsInterna,
    aliquotaEfetiva: aliquotaIcmsEfetiva,
  })
  const valorIcms = icms.valor

  const totalTributos = valorIi + valorIpi + valorPis + valorCofins + valorIcms
  const custoNacionalizadoBrl = valorAduaneiroBrl + totalTributos + taxasDestinoBrl

  return {
    valor_aduaneiro_brl: valorAduaneiroBrl,
    tributos: {
      ii:     { aliquota: aliquotaIiEfetiva,                        base_calculo: valorAduaneiroBrl, valor: valorIi },
      ipi:    { aliquota: entrada.aliquota_ipi_simula_custo,    base_calculo: baseIpi,           valor: valorIpi },
      pis:    { aliquota: entrada.aliquota_pis_simula_custo,    base_calculo: valorAduaneiroBrl, valor: valorPis },
      cofins: { aliquota: entrada.aliquota_cofins_simula_custo, base_calculo: valorAduaneiroBrl, valor: valorCofins },
      icms:   {
        aliquota: icms.aliquota_efetiva,
        base_calculo: icms.base_calculo,
        valor: valorIcms,
        reducao: icms.reducao_base,
        aliquota_interna_uf: icms.aliquota_interna_uf,
      },
    },
    total_tributos_brl: totalTributos,
    taxas_origem_brl_simula_custo: taxasOrigemBrl,
    taxas_destino_brl_simula_custo: taxasDestinoBrl,
    custo_nacionalizado_brl: custoNacionalizadoBrl,
    calculado_em: new Date().toISOString(),
  }
}
