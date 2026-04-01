// ── Enums ────────────────────────────────────────────────────────────────────

export type TipoOperacao = 'IMPORTACAO' | 'EXPORTACAO'
export type Moeda = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'CHF' | 'CNY' | 'ARS' | 'UYU'
export type StatusPagamento = 'PENDENTE' | 'AGENDADO' | 'PAGO'
export type GrupoCusto = 'IMPOSTOS_FEDERAIS' | 'CUSTO_OPERACIONAL'
export type CanalEntrada = 'MANUAL' | 'XML_DUIMP' | 'PORTAL_UNICO' | 'SMART_READ' | 'PLANILHA' | 'EMAIL'

export type TipoDocumento =
  | 'BOLETO'
  | 'NOTA_FISCAL'
  | 'DEMONSTRATIVO'
  | 'FATURA'
  | 'FATURAMENTO'
  | 'OUTRO'

export type TipoFornecedor =
  | 'AGENTE_DE_CARGA'
  | 'ARMADOR'
  | 'CIA_AEREA'
  | 'ARMAZEM_ALFANDEGADO'
  | 'ARMAZEM'
  | 'TRANSPORTADORA_RODOVIARIA'
  | 'SEGURADORA'
  | 'CORRETORA_DE_CAMBIO'
  | 'EXPORTADOR'
  | 'FABRICANTE'
  | 'TRADING'
  | 'DESPACHANTE'
  | 'RECEITA_FEDERAL'
  | 'OUTRO'

// ── Display maps ─────────────────────────────────────────────────────────────

export const MOEDA_LABEL: Record<Moeda, string> = {
  BRL: 'R$ (BRL)',
  USD: 'US$ (USD)',
  EUR: '€ (EUR)',
  GBP: '£ (GBP)',
  CHF: 'Fr (CHF)',
  CNY: '¥ (CNY)',
  ARS: 'AR$ (ARS)',
  UYU: 'UY$ (UYU)',
}

export const STATUS_LABEL: Record<StatusPagamento, string> = {
  PENDENTE: 'Pendente',
  AGENDADO: 'Agendado',
  PAGO: 'Pago',
}

export const TIPO_DOCUMENTO_LABEL: Record<TipoDocumento, string> = {
  BOLETO: 'Boleto',
  NOTA_FISCAL: 'Nota Fiscal',
  DEMONSTRATIVO: 'Demonstrativo',
  FATURA: 'Fatura',
  FATURAMENTO: 'Faturamento',
  OUTRO: 'Outro',
}

export const TIPO_FORNECEDOR_LABEL: Record<TipoFornecedor, string> = {
  AGENTE_DE_CARGA: 'Agente de carga',
  ARMADOR: 'Armador',
  CIA_AEREA: 'Cia aerea',
  ARMAZEM_ALFANDEGADO: 'Armazem alfandegado',
  ARMAZEM: 'Armazem',
  TRANSPORTADORA_RODOVIARIA: 'Transportadora rodoviaria',
  SEGURADORA: 'Seguradora',
  CORRETORA_DE_CAMBIO: 'Corretora de cambio',
  EXPORTADOR: 'Exportador',
  FABRICANTE: 'Fabricante',
  TRADING: 'Trading',
  DESPACHANTE: 'Despachante aduaneiro',
  RECEITA_FEDERAL: 'Receita Federal',
  OUTRO: 'Outro',
}

// ── Domain types ─────────────────────────────────────────────────────────────

export interface FinanceiroProcesso {
  id: string
  tenant_id: string
  company_id: string
  processo_id: string
  tipo_operacao: TipoOperacao
  referencia?: string
  total_brl: number
  total_usd: number
  total_eur: number
  total_outros: number
  saldo: number
  adiantado: number
  pagos: number
  agendados: number
  pendente: number
  created_at: string
  updated_at: string
  _count?: { lancamentos: number; numerarios: number; rateios: number }
}

export interface FinanceiroLancamento {
  id: string
  tenant_id: string
  company_id: string
  financeiro_id: string
  categoria_id: string
  categoria_nome: string
  grupo_custo: GrupoCusto
  moeda: Moeda
  taxa_cambio: number
  valor: number
  valor_brl: number
  fornecedor_id?: string
  fornecedor_nome?: string
  tipo_fornecedor?: TipoFornecedor
  condicao_id?: string
  condicao_descricao?: string
  data_pagamento?: string
  data_vencimento?: string
  status_pagamento: StatusPagamento
  observacao?: string
  despesa_aduaneira: boolean
  despesa_nf: boolean
  espelho_nf: boolean
  tipo_documento?: TipoDocumento
  numero_documento?: string
  canal_entrada: CanalEntrada
  icms_origem_portal: boolean
  created_at: string
  updated_at: string
  created_by: string
}

export interface FinanceiroCategorias {
  id: string
  tenant_id: string
  company_id: string
  codigo: string
  nome: string
  grupo_custo: GrupoCusto
  tipo_operacao?: TipoOperacao
  conta_contabil?: string
  centro_custo?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface FinanceiroCondicaoPagamento {
  id: string
  tenant_id: string
  company_id: string
  codigo: string
  descricao: string
  dias_prazo?: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface FinanceiroNumerario {
  id: string
  tenant_id: string
  company_id: string
  financeiro_id: string
  descricao: string
  is_principal: boolean
  data: string
  valor_total: number
  documento_storage_key?: string
  documento_nome?: string
  documento_mime_type?: string
  created_at: string
  updated_at: string
  created_by: string
  despesas: FinanceiroNumerarioDespesa[]
}

export interface FinanceiroNumerarioDespesa {
  id: string
  tenant_id: string
  numerario_id: string
  descricao: string
  moeda: Moeda
  taxa_cambio: number
  valor: number
  valor_brl: number
  responsavel?: string
  created_at: string
}

export interface FinanceiroRateio {
  id: string
  tenant_id: string
  company_id: string
  financeiro_id: string
  storage_key: string
  nome_arquivo: string
  gerado_em: string
  gerado_por: string
}

export interface PaginaMeta {
  total: number
  page: number
  limit: number
  pages: number
}
