/**
 * types.ts — Tipos do domínio SimulaCusto
 * Skill: antigravity-criar-produto (Passo 1 — shared/types.ts)
 * Skill: antigravity-simulacusto (Payloads e Engine)
 * Alinhado com fragment.prisma — enums e campos novos.
 */

// ─── Enums (espelham fragment.prisma) ────────────────────────────────────────

export type OperacaoTipo = 'IMPORTACAO' | 'EXPORTACAO'

export type TipoOperacaoDetalhe = 'DIRETA' | 'CONTA_ORDEM' | 'ENCOMENDA' | 'COMERCIAL_EXPORTADORA'

export type EstimativaStatus = 'EM_CRIACAO' | 'CRIADA' | 'ARQUIVADA'

export type TaxaTipo = 'ORIGEM' | 'DESTINO'

export type CobrancaTipo = 'PROCESSO' | 'CONTAINER' | 'AWB' | 'BL' | 'CRT' | 'KGS' | 'TON' | 'CAIXA' | 'M3'

export type TributoTipo = 'II' | 'IPI' | 'PIS' | 'COFINS' | 'ICMS'

export type DocumentoTipo = 'PEDIDO_COMPRA' | 'PEDIDO_VENDA' | 'PROFORMA' | 'INVOICE' | 'OUTRO'

// ─── Labels para UI ──────────────────────────────────────────────────────────

export const OPERACAO_LABELS: Record<OperacaoTipo, string> = {
  IMPORTACAO: 'Importação',
  EXPORTACAO: 'Exportação',
}

export const TIPO_OPERACAO_LABELS: Record<TipoOperacaoDetalhe, string> = {
  DIRETA: 'Direta',
  CONTA_ORDEM: 'Conta e Ordem',
  ENCOMENDA: 'Encomenda',
  COMERCIAL_EXPORTADORA: 'Comercial Exportadora',
}

export const STATUS_LABELS: Record<EstimativaStatus, string> = {
  EM_CRIACAO: 'Em Criação',
  CRIADA: 'Criada',
  ARQUIVADA: 'Arquivada',
}

export const STATUS_BADGE: Record<EstimativaStatus, 'warning' | 'success' | 'default'> = {
  EM_CRIACAO: 'warning',
  CRIADA: 'success',
  ARQUIVADA: 'default',
}

export const DOCUMENTO_LABELS: Record<DocumentoTipo, string> = {
  PEDIDO_COMPRA: 'Pedido de Compra',
  PEDIDO_VENDA: 'Pedido de Venda',
  PROFORMA: 'Proforma Invoice',
  INVOICE: 'Commercial Invoice',
  OUTRO: 'Outro',
}

export const COBRANCA_LABELS: Record<CobrancaTipo, string> = {
  PROCESSO: 'Por Processo',
  CONTAINER: 'Por Container',
  AWB: 'Por AWB',
  BL: 'Por BL',
  CRT: 'Por CRT',
  KGS: 'Por Kg',
  TON: 'Por Tonelada',
  CAIXA: 'Por Caixa',
  M3: 'Por m³',
}

// ─── Inputs ───────────────────────────────────────────────────────────────────

export interface TaxaExtra {
  nome: string
  valor: number
  moeda: string
  cobranca_por: CobrancaTipo
  valor_minimo: number
}

export interface SimulacaoInput {
  ncm: string
  paisOrigem: string
  dataFatoGerador: string
  operacao: OperacaoTipo
  tipo_operacao: TipoOperacaoDetalhe
  incoterm: string
  quantidade: number
  referencia: string
  valorProduto: number
  moedaProduto: string
  ptaxVenda?: number
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
  reducaoII?: number
  documentos: DocumentoRef[]
}

export interface DocumentoRef {
  tipo: DocumentoTipo
  numero: string
}

// ─── Resultados ───────────────────────────────────────────────────────────────

export interface TributoDetalhamento {
  aliquota: number
  baseCalculo: number
  valor: number
  reducao?: number
  acordo?: string
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
  source: 'siscomex' | 'gravity-engine' | 'fallback'
}

// ─── Entidade Banco (alinhada com Estimativa do fragment.prisma) ─────────────

export interface Estimativa {
  id: string
  tenant_id: string
  user_id: string
  numero: string
  referencia: string | null
  operacao: OperacaoTipo
  tipo_operacao: TipoOperacaoDetalhe
  status: EstimativaStatus
  data_geracao: string
  ncm: string
  ncm_descricao: string | null
  incoterm: string
  quantidade: number
  moeda_produto: string
  valor_produto: number
  moeda_frete: string
  valor_frete: number
  moeda_seguro: string
  valor_seguro: number
  uf_desembaraco: string
  aliquota_icms: number
  aliquota_ii: number
  aliquota_ipi: number
  aliquota_pis: number
  aliquota_cofins: number
  reducao_ii: number
  ptax_utilizada: number | null
  valor_aduaneiro: number | null
  total_tributos: number | null
  landed_cost_brl: number | null
  source: string | null
  created_at: string
  updated_at: string
}

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────

export interface EstimativasKpis {
  total: number
  em_criacao: number
  criadas: number
  arquivadas: number
  landed_cost_medio: number
  total_tributos_acumulado: number
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
