/**
 * types.ts — Tipos do domínio SimulaCusto
 * Skill: antigravity-criar-produto (Passo 1 — shared/types.ts)
 * Skill: antigravity-simulacusto (Payloads e Engine)
 */

// ─── Inputs ───────────────────────────────────────────────────────────────────

export interface TaxaExtra {
  nome: string
  valor: number
  moeda: string // ISO 4217 — ex: "USD", "EUR", "BRL"
}

export interface SimulacaoInput {
  ncm: string            // 8 dígitos sem pontuação
  paisOrigem: string     // ISO 3166-1 alpha-2 — ex: "US", "CN"
  dataFatoGerador: string // ISO date — ex: "2026-03-27"
  valorProduto: number
  moedaProduto: string
  ptaxVenda?: number     // Opcional — buscado via BACEN se omitido
  freteInter: number
  moedaFrete: string
  seguroInter: number
  moedaSeguro: string
  taxasOrigem: TaxaExtra[]
  taxasDestino: TaxaExtra[]
  ufDesembaraco: string  // UF de 2 letras — ex: "SP", "RJ"
  aliquotaII: number     // 0.0 a 1.0 — ex: 0.16 = 16%
  aliquotaIPI: number
  aliquotaPIS: number
  aliquotaCOFINS: number
  aliquotaICMS: number
  reducaoII?: number     // Benefício fiscal — 0.0 a 1.0
}

// ─── Resultados ───────────────────────────────────────────────────────────────

export interface TributoDetalhamento {
  aliquota: number
  baseCalculo: number
  valor: number
}

export interface ResultadoFiscal {
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
  ptaxUtilizada: number
  source: 'siscomex' | 'local_engine'
}

// ─── Entidade Banco ───────────────────────────────────────────────────────────

export type StatusEstimativa = 'rascunho' | 'criada' | 'arquivada'

export interface Estimativa {
  id: string
  tenant_id: string
  user_id: string
  ncm: string
  pais_origem: string
  data_simulacao: string
  valor_produto: number
  moeda_produto: string
  ptax_utilizada: number
  landed_cost_brl: number
  total_tributos: number
  status: StatusEstimativa
  created_at: string
  updated_at: string
}

// ─── Master Data ──────────────────────────────────────────────────────────────

export interface NcmItem {
  codigo: string
  descricao: string
}

export interface UfItem {
  uf: string
  nome: string
  icms: number
}

export interface PaisItem {
  codigo: string
  nome: string
}
