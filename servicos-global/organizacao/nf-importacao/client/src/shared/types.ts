// ============================================
// NF Importacao — Types & Interfaces
// ============================================

// ============================================
// Enums
// ============================================

export const NFImportacaoStatus = {
  RASCUNHO: 'rascunho',
  EM_COMPOSICAO: 'em_composicao',
  PRONTA: 'pronta',
  EXPORTADA: 'exportada',
  CANCELADA: 'cancelada',
} as const

export type NFImportacaoStatus = (typeof NFImportacaoStatus)[keyof typeof NFImportacaoStatus]

export const STATUS_LABELS: Record<NFImportacaoStatus, string> = {
  [NFImportacaoStatus.RASCUNHO]: 'Rascunho',
  [NFImportacaoStatus.EM_COMPOSICAO]: 'Em Composição',
  [NFImportacaoStatus.PRONTA]: 'Pronta',
  [NFImportacaoStatus.EXPORTADA]: 'Exportada',
  [NFImportacaoStatus.CANCELADA]: 'Cancelada',
}

export const STATUS_COLORS: Record<NFImportacaoStatus, string> = {
  [NFImportacaoStatus.RASCUNHO]: 'gray',
  [NFImportacaoStatus.EM_COMPOSICAO]: 'blue',
  [NFImportacaoStatus.PRONTA]: 'green',
  [NFImportacaoStatus.EXPORTADA]: 'purple',
  [NFImportacaoStatus.CANCELADA]: 'red',
}

export const NfImportacaoMetodoRateio = {
  PESO_LIQUIDO: 'PESO_LIQUIDO',
  PESO_BRUTO: 'PESO_BRUTO',
  VALOR_CIF: 'VALOR_CIF',
  VALOR_FOB: 'VALOR_FOB',
  QUANTIDADE: 'QUANTIDADE',
  VALOR_II: 'VALOR_II',
  IGUALITARIO: 'IGUALITARIO',
  MANUAL: 'MANUAL',
  CUSTOMIZADO: 'CUSTOMIZADO',
} as const

export type NfImportacaoMetodoRateio = (typeof NfImportacaoMetodoRateio)[keyof typeof NfImportacaoMetodoRateio]

export const METODO_LABELS: Record<NfImportacaoMetodoRateio, string> = {
  [NfImportacaoMetodoRateio.PESO_LIQUIDO]: 'Peso Líquido',
  [NfImportacaoMetodoRateio.PESO_BRUTO]: 'Peso Bruto',
  [NfImportacaoMetodoRateio.VALOR_CIF]: 'Valor CIF',
  [NfImportacaoMetodoRateio.VALOR_FOB]: 'Valor FOB',
  [NfImportacaoMetodoRateio.QUANTIDADE]: 'Quantidade',
  [NfImportacaoMetodoRateio.VALOR_II]: 'Valor II',
  [NfImportacaoMetodoRateio.IGUALITARIO]: 'Igualitário',
  [NfImportacaoMetodoRateio.MANUAL]: 'Manual',
  [NfImportacaoMetodoRateio.CUSTOMIZADO]: 'Customizado',
}

export const NfImportacaoTipoCanalEntrada = {
  MANUAL: 'MANUAL',
  XML: 'XML',
  SMART_READ: 'SMART_READ',
  PORTAL_UNICO: 'PORTAL_UNICO',
  ERP: 'ERP',
  PROCESSO: 'PROCESSO',
} as const

export type NfImportacaoTipoCanalEntrada = (typeof NfImportacaoTipoCanalEntrada)[keyof typeof NfImportacaoTipoCanalEntrada]

export const CANAL_LABELS: Record<NfImportacaoTipoCanalEntrada, string> = {
  [NfImportacaoTipoCanalEntrada.MANUAL]: 'Manual',
  [NfImportacaoTipoCanalEntrada.XML]: 'XML',
  [NfImportacaoTipoCanalEntrada.SMART_READ]: 'Smart Read',
  [NfImportacaoTipoCanalEntrada.PORTAL_UNICO]: 'Portal Único',
  [NfImportacaoTipoCanalEntrada.ERP]: 'ERP',
  [NfImportacaoTipoCanalEntrada.PROCESSO]: 'Processo',
}

export const NfImportacaoOrigemDespesa = {
  MANUAL: 'MANUAL',
  TEMPLATE: 'TEMPLATE',
  SMART_READ: 'SMART_READ',
  PLANILHA: 'PLANILHA',
} as const

export type NfImportacaoOrigemDespesa = (typeof NfImportacaoOrigemDespesa)[keyof typeof NfImportacaoOrigemDespesa]

export const ORIGEM_LABELS: Record<NfImportacaoOrigemDespesa, string> = {
  [NfImportacaoOrigemDespesa.MANUAL]: 'Manual',
  [NfImportacaoOrigemDespesa.TEMPLATE]: 'Template',
  [NfImportacaoOrigemDespesa.SMART_READ]: 'Smart Read',
  [NfImportacaoOrigemDespesa.PLANILHA]: 'Planilha',
}

export const NfImportacaoTipoFormato = {
  XML: 'XML',
  TXT: 'TXT',
  CSV: 'CSV',
  EXCEL: 'EXCEL',
  JSON: 'JSON',
  PDF: 'PDF',
} as const

export type NfImportacaoTipoFormato = (typeof NfImportacaoTipoFormato)[keyof typeof NfImportacaoTipoFormato]

export const FORMATO_LABELS: Record<NfImportacaoTipoFormato, string> = {
  [NfImportacaoTipoFormato.XML]: 'XML',
  [NfImportacaoTipoFormato.TXT]: 'TXT',
  [NfImportacaoTipoFormato.CSV]: 'CSV',
  [NfImportacaoTipoFormato.EXCEL]: 'Excel',
  [NfImportacaoTipoFormato.JSON]: 'JSON',
  [NfImportacaoTipoFormato.PDF]: 'PDF',
}

export const NfImportacaoTipoDado = {
  TEXTO: 'TEXTO',
  NUMERO: 'NUMERO',
  DATA: 'DATA',
  DECIMAL: 'DECIMAL',
} as const

export type NfImportacaoTipoDado = (typeof NfImportacaoTipoDado)[keyof typeof NfImportacaoTipoDado]

export const NfImportacaoTipoAlinhamento = {
  ESQUERDA: 'ESQUERDA',
  DIREITA: 'DIREITA',
  CENTRO: 'CENTRO',
} as const

export type NfImportacaoTipoAlinhamento = (typeof NfImportacaoTipoAlinhamento)[keyof typeof NfImportacaoTipoAlinhamento]

// ============================================
// Model Interfaces
// ============================================

export interface NFImportacao {
  id: string
  tenant_id: string
  company_id: string
  product_id: string
  user_id: string

  duimp_numero: string | null
  duimp_data_registro: string | null
  processo_id: string | null

  tipo_operacao: string
  uf_destino: string
  local_desembaraco: string | null
  via_transporte: string | null
  moeda_negociada: string

  total_fob: string
  total_frete: string
  total_seguro: string
  total_cif: string
  total_ii: string
  total_ipi: string
  total_pis: string
  total_cofins: string
  total_icms: string
  total_despesas: string
  total_nf: string

  canal_entrada: NfImportacaoTipoCanalEntrada
  casas_decimais_valor: number
  casas_decimais_qtd: number

  status: NFImportacaoStatus
  data_exportacao: string | null
  formato_exportado: NfImportacaoTipoFormato | null

  created_by: string
  updated_by: string | null
  is_demo: boolean
  created_at: string
  updated_at: string

  itens?: NFImportacaoItens[]
  despesas?: NFImportacaoDespesas[]
  documentos?: NFImportacaoAnexo[]
  historico?: NFImportacaoHistorico[]
}

export interface NFImportacaoItens {
  id: string
  tenant_id: string
  company_id: string
  nf_importacao_id: string

  numero_adicao: string | null
  ncm: string
  descricao: string
  fabricante: string | null
  pais_origem: string | null

  quantidade_estatistica: string
  unidade_medida: string
  quantidade_comercial: string | null
  unidade_medida_comercial: string | null
  peso_liquido: string
  peso_bruto: string | null

  valor_fob: string
  valor_frete: string
  valor_seguro: string
  valor_cif: string

  ii_aliquota: string
  ii_valor: string
  ipi_aliquota: string
  ipi_valor: string
  pis_aliquota: string
  pis_valor: string
  cofins_aliquota: string
  cofins_valor: string
  icms_aliquota: string
  icms_valor: string
  icms_base: string | null

  cfop: string | null
  cst_icms: string | null
  cst_ipi: string | null
  cst_pis: string | null
  cst_cofins: string | null

  beneficio_fiscal: string | null
  beneficio_descricao: string | null

  total_despesas_rateadas: string
  total_item: string

  created_at: string
  updated_at: string

  rateios?: NFImportacaoRateio[]
}

export interface NFImportacaoDespesas {
  id: string
  tenant_id: string
  company_id: string
  nf_importacao_id: string

  catalogo_despesa_id: string | null
  nome: string
  descricao: string | null
  valor_total: string
  cnpj_prestador: string | null
  data_despesa: string | null

  metodo_rateio: NfImportacaoMetodoRateio
  formula_customizada: string | null

  origem: NfImportacaoOrigemDespesa
  documento_id: string | null

  conta_contabil: string | null
  centro_custo: string | null

  created_at: string
  updated_at: string

  rateios?: NFImportacaoRateio[]
}

export interface NFImportacaoRateio {
  id: string
  tenant_id: string
  company_id: string
  despesa_id: string
  item_id: string

  valor_rateado: string
  percentual_rateio: string
  metodo_usado: NfImportacaoMetodoRateio

  is_override_manual: boolean
  is_centavo_restante: boolean

  created_at: string
  updated_at: string
}

export interface NFImportacaoAnexo {
  id: string
  tenant_id: string
  company_id: string
  nf_importacao_id: string

  tipo: string
  nome_arquivo: string
  mime_type: string
  tamanho_bytes: number
  storage_key: string
  descricao: string | null

  smart_read_processado: boolean
  smart_read_resultado: Record<string, unknown> | null

  created_by: string
  created_at: string
}

export interface NFImportacaoHistorico {
  id: string
  tenant_id: string
  company_id: string
  nf_importacao_id: string

  acao: string
  descricao: string
  dados_anteriores: Record<string, unknown> | null
  dados_novos: Record<string, unknown> | null

  user_id: string
  user_nome: string | null

  created_at: string
}

export interface NFImportacaoTipoDespesa {
  id: string
  tenant_id: string
  company_id: string

  nome: string
  descricao: string | null
  metodo_rateio_padrao: NfImportacaoMetodoRateio
  conta_contabil: string | null
  centro_custo: string | null
  ativo: boolean

  created_by: string
  created_at: string
  updated_at: string
}

export interface NFImportacaoTemplates {
  id: string
  tenant_id: string
  company_id: string

  nome: string
  descricao: string | null
  is_padrao: boolean
  ativo: boolean

  created_by: string
  created_at: string
  updated_at: string

  itens?: NFImportacaoTemplatesItens[]
}

export interface NFImportacaoTemplatesItens {
  id: string
  tenant_id: string
  company_id: string
  template_id: string

  catalogo_despesa_id: string | null
  nome: string
  valor_padrao: string | null
  metodo_rateio: NfImportacaoMetodoRateio
  ordem: number
}

export interface NFImportacaoExportarLayout {
  id: string
  tenant_id: string
  company_id: string

  nome: string
  descricao: string | null
  formato: NfImportacaoTipoFormato
  separador: string | null
  codificacao: string

  has_header: boolean
  has_footer: boolean
  header_template: string | null
  footer_template: string | null

  is_padrao: boolean
  ativo: boolean

  created_by: string
  created_at: string
  updated_at: string

  campos?: NFImportacaoLayoutCampos[]
}

export interface NFImportacaoLayoutCampos {
  id: string
  tenant_id: string
  company_id: string
  layout_id: string

  campo_origem: string
  label: string
  ordem: number
  tipo_dado: NfImportacaoTipoDado
  formato: string | null
  tamanho_fixo: number | null
  posicao_inicio: number | null
  alinhamento: NfImportacaoTipoAlinhamento
  preenchimento: string | null
  valor_padrao: string | null
  transformacao: string | null
}

export interface NFImportacaoFiscaisFavoritos {
  id: string
  tenant_id: string
  company_id: string

  ncm: string
  uf_destino: string | null
  tipo_operacao: string

  cfop: string
  cst_icms: string
  cst_ipi: string
  cst_pis: string
  cst_cofins: string

  beneficio_fiscal: string | null
  descricao: string | null

  created_by: string
  created_at: string
  updated_at: string
}

// ============================================
// Input Types — Create / Update
// ============================================

export interface CreateNfInput {
  company_id: string
  duimp_numero?: string
  duimp_data_registro?: string
  processo_id?: string
  tipo_operacao?: string
  uf_destino: string
  local_desembaraco?: string
  via_transporte?: string
  moeda_negociada?: string
  canal_entrada?: NfImportacaoTipoCanalEntrada
  casas_decimais_valor?: number
  casas_decimais_qtd?: number
}

export interface UpdateNfInput {
  duimp_numero?: string | null
  duimp_data_registro?: string | null
  processo_id?: string | null
  tipo_operacao?: string
  uf_destino?: string
  local_desembaraco?: string | null
  via_transporte?: string | null
  moeda_negociada?: string
  casas_decimais_valor?: number
  casas_decimais_qtd?: number
}

export interface CreateItemInput {
  nf_importacao_id: string
  numero_adicao?: string
  ncm: string
  descricao: string
  fabricante?: string
  pais_origem?: string
  quantidade_estatistica: string
  unidade_medida: string
  quantidade_comercial?: string
  unidade_medida_comercial?: string
  peso_liquido: string
  peso_bruto?: string
  valor_fob: string
  valor_frete: string
  valor_seguro: string
  ii_aliquota: string
  ipi_aliquota: string
  pis_aliquota: string
  cofins_aliquota: string
  icms_aliquota: string
  icms_base?: string
  cfop?: string
  cst_icms?: string
  cst_ipi?: string
  cst_pis?: string
  cst_cofins?: string
  beneficio_fiscal?: string
  beneficio_descricao?: string
}

export interface UpdateItemInput {
  numero_adicao?: string | null
  ncm?: string
  descricao?: string
  fabricante?: string | null
  pais_origem?: string | null
  quantidade_estatistica?: string
  unidade_medida?: string
  quantidade_comercial?: string | null
  unidade_medida_comercial?: string | null
  peso_liquido?: string
  peso_bruto?: string | null
  valor_fob?: string
  valor_frete?: string
  valor_seguro?: string
  ii_aliquota?: string
  ipi_aliquota?: string
  pis_aliquota?: string
  cofins_aliquota?: string
  icms_aliquota?: string
  icms_base?: string | null
  cfop?: string | null
  cst_icms?: string | null
  cst_ipi?: string | null
  cst_pis?: string | null
  cst_cofins?: string | null
  beneficio_fiscal?: string | null
  beneficio_descricao?: string | null
}

export interface CreateDespesaInput {
  nf_importacao_id: string
  catalogo_despesa_id?: string
  nome: string
  descricao?: string
  valor_total: string
  cnpj_prestador?: string
  data_despesa?: string
  metodo_rateio?: NfImportacaoMetodoRateio
  formula_customizada?: string
  origem?: NfImportacaoOrigemDespesa
  documento_id?: string
  conta_contabil?: string
  centro_custo?: string
}

export interface UpdateDespesaInput {
  catalogo_despesa_id?: string | null
  nome?: string
  descricao?: string | null
  valor_total?: string
  cnpj_prestador?: string | null
  data_despesa?: string | null
  metodo_rateio?: NfImportacaoMetodoRateio
  formula_customizada?: string | null
  conta_contabil?: string | null
  centro_custo?: string | null
}

export interface RateioOverrideInput {
  despesa_id: string
  overrides: Array<{
    item_id: string
    valor_rateado: string
  }>
}

export interface RateioPreviewResult {
  despesa_id: string
  metodo: NfImportacaoMetodoRateio
  itens: Array<{
    item_id: string
    valor_rateado: string
    percentual_rateio: string
  }>
  total_rateado: string
  diferenca_centavos: string
}

export interface ExportarNfInput {
  nf_importacao_id: string
  formato: NfImportacaoTipoFormato
  layout_id?: string
}

export interface CreateCatalogoInput {
  company_id: string
  nome: string
  descricao?: string
  metodo_rateio_padrao?: NfImportacaoMetodoRateio
  conta_contabil?: string
  centro_custo?: string
}

export interface CreateTemplateInput {
  company_id: string
  nome: string
  descricao?: string
  is_padrao?: boolean
  itens: Array<{
    catalogo_despesa_id?: string
    nome: string
    valor_padrao?: string
    metodo_rateio?: NfImportacaoMetodoRateio
    ordem?: number
  }>
}

export interface CreateLayoutInput {
  company_id: string
  nome: string
  descricao?: string
  formato: NfImportacaoTipoFormato
  separador?: string
  codificacao?: string
  has_header?: boolean
  has_footer?: boolean
  header_template?: string
  footer_template?: string
  is_padrao?: boolean
  campos: Array<{
    campo_origem: string
    label: string
    ordem: number
    tipo_dado?: NfImportacaoTipoDado
    formato?: string
    tamanho_fixo?: number
    posicao_inicio?: number
    alinhamento?: NfImportacaoTipoAlinhamento
    preenchimento?: string
    valor_padrao?: string
    transformacao?: string
  }>
}

export interface CreateFavoritoInput {
  company_id: string
  ncm: string
  uf_destino?: string
  tipo_operacao?: string
  cfop: string
  cst_icms: string
  cst_ipi: string
  cst_pis: string
  cst_cofins: string
  beneficio_fiscal?: string
  descricao?: string
}

// ============================================
// List / Filter types
// ============================================

export interface NFImportacaoFilters {
  status?: NFImportacaoStatus
  company_id?: string
  canal_entrada?: NfImportacaoTipoCanalEntrada
  duimp_numero?: string
  processo_id?: string
  data_inicio?: string
  data_fim?: string
  search?: string
  page?: number
  per_page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
