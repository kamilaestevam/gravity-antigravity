/**
 * calculator.ts — SimulaCusto (Gravity Cloud Engine)
 * Engine de cálculo fiscal para Importação (Landed Cost).
 * Ordem de cálculo conforme legislação aduaneira brasileira e PRD oficial.
 * Skill: antigravity-simulacusto (Engine de Cálculo Fiscal)
 */

export interface TaxaExtra {
  nome: string
  valor: number
  moeda: string
}

export interface SimulacaoInput {
  ncm: string
  paisOrigem: string
  dataFatoGerador: string
  valorProduto: number
  moedaProduto: string
  ptaxVenda: number
  freteInter: number
  moedaFrete: string
  seguroInter: number
  moedaSeguro: string
  taxasOrigem: TaxaExtra[]
  taxasDestino: TaxaExtra[]
  ufDesembaraco: string
  aliquotaII: number
  aliquotaIPI: number
  aliquotaPIS: number
  aliquotaCOFINS: number
  aliquotaICMS: number
  reducaoII?: number // Acordos comerciais — 0.0 a 1.0
}

export interface TributoDetalhamento {
  aliquota: number
  baseCalculo: number
  valor: number
}

export interface SimulacaoResult {
  vAduaneiroBRL: number
  tributos: {
    ii: TributoDetalhamento
    ipi: TributoDetalhamento
    pis: TributoDetalhamento
    cofins: TributoDetalhamento
    icms: TributoDetalhamento
  }
  totalTributos: number
  taxasOrigemBRL: number
  taxasDestinoBRL: number
  landedCostBRL: number
  criadoEm: string
}

/**
 * Converte valor para BRL usando PTAX fornecida.
 */
function converterParaBRL(valor: number, moeda: string, ptax: number): number {
  if (moeda === 'BRL') return valor
  return valor * ptax
}

/**
 * executarCalculoFiscal — Engine de 7 passos
 *
 * Passo 1: Valor Aduaneiro (VA) = (Produto + Frete + Seguro + Taxas Origem) × PTAX
 * Passo 2: II  = VA × Alíquota II × (1 − ReducaoII)
 * Passo 3: IPI = (VA + II) × Alíquota IPI
 * Passo 4: PIS = VA × Alíquota PIS
 * Passo 5: COFINS = VA × Alíquota COFINS
 * Passo 6: Base ICMS (Por Dentro) = (VA + II + IPI + PIS + COFINS + Taxas Destino) / (1 − Alíquota ICMS)
 * Passo 7: ICMS = Base ICMS × Alíquota ICMS
 */
export function executarCalculoFiscal(input: SimulacaoInput): SimulacaoResult {
  const { ptaxVenda } = input

  // Passo 1 — Taxas de Origem & Valor Aduaneiro
  const taxasOrigemBRL = input.taxasOrigem.reduce(
    (acc, t) => acc + converterParaBRL(t.valor, t.moeda, ptaxVenda), 0
  )
  const produtoBRL = converterParaBRL(input.valorProduto, input.moedaProduto, ptaxVenda)
  const freteBRL   = converterParaBRL(input.freteInter, input.moedaFrete, ptaxVenda)
  const seguroBRL  = converterParaBRL(input.seguroInter, input.moedaSeguro, ptaxVenda)
  const vAduaneiroBRL = produtoBRL + freteBRL + seguroBRL + taxasOrigemBRL

  // Passo 2 — Imposto de Importação (II)
  const aliqIIEfetiva = input.aliquotaII * (1 - (input.reducaoII ?? 0))
  const valorII = vAduaneiroBRL * aliqIIEfetiva

  // Passo 3 — IPI (Base = VA + II)
  const baseIPI = vAduaneiroBRL + valorII
  const valorIPI = baseIPI * input.aliquotaIPI

  // Passo 4 — PIS (Base = VA)
  const valorPIS = vAduaneiroBRL * input.aliquotaPIS

  // Passo 5 — COFINS (Base = VA)
  const valorCOFINS = vAduaneiroBRL * input.aliquotaCOFINS

  // Taxas de Destino
  const taxasDestinoBRL = input.taxasDestino.reduce(
    (acc, t) => acc + converterParaBRL(t.valor, t.moeda, ptaxVenda), 0
  )

  // Passo 6 & 7 — ICMS "Por Dentro"
  const somaBasesPrevias = vAduaneiroBRL + valorII + valorIPI + valorPIS + valorCOFINS + taxasDestinoBRL
  const baseICMS = somaBasesPrevias / (1 - input.aliquotaICMS)
  const valorICMS = baseICMS * input.aliquotaICMS

  const totalTributos = valorII + valorIPI + valorPIS + valorCOFINS + valorICMS
  const landedCostBRL = vAduaneiroBRL + totalTributos + taxasDestinoBRL

  return {
    vAduaneiroBRL,
    tributos: {
      ii:     { aliquota: aliqIIEfetiva,     baseCalculo: vAduaneiroBRL, valor: valorII     },
      ipi:    { aliquota: input.aliquotaIPI,  baseCalculo: baseIPI,       valor: valorIPI    },
      pis:    { aliquota: input.aliquotaPIS,  baseCalculo: vAduaneiroBRL, valor: valorPIS    },
      cofins: { aliquota: input.aliquotaCOFINS, baseCalculo: vAduaneiroBRL, valor: valorCOFINS },
      icms:   { aliquota: input.aliquotaICMS, baseCalculo: baseICMS,      valor: valorICMS   },
    },
    totalTributos,
    taxasOrigemBRL,
    taxasDestinoBRL,
    landedCostBRL,
    criadoEm: new Date().toISOString()
  }
}
