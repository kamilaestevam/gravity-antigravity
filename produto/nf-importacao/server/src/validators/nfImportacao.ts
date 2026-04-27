import { z } from 'zod'

// ============================================
// Shared Enums (Zod)
// ============================================

export const statusNfEnum = z.enum([
  'rascunho',
  'em_composicao',
  'pronta',
  'exportada',
  'cancelada',
])

export const metodoRateioEnum = z.enum([
  'PESO_LIQUIDO',
  'PESO_BRUTO',
  'VALOR_CIF',
  'VALOR_FOB',
  'QUANTIDADE',
  'VALOR_II',
  'IGUALITARIO',
  'MANUAL',
  'CUSTOMIZADO',
])

export const canalEntradaEnum = z.enum([
  'MANUAL',
  'XML',
  'SMART_READ',
  'PORTAL_UNICO',
  'ERP',
  'PROCESSO',
])

export const origemDespesaEnum = z.enum([
  'MANUAL',
  'TEMPLATE',
  'SMART_READ',
  'PLANILHA',
])

export const formatoExportEnum = z.enum([
  'XML',
  'TXT',
  'CSV',
  'EXCEL',
  'JSON',
  'PDF',
])

export const tipoDadoEnum = z.enum([
  'TEXTO',
  'NUMERO',
  'DATA',
  'DECIMAL',
])

export const alinhamentoEnum = z.enum([
  'ESQUERDA',
  'DIREITA',
  'CENTRO',
])

// ============================================
// Shared Field Schemas
// ============================================

const decimalString = z.string().regex(
  /^-?\d+(\.\d+)?$/,
  'Deve ser um valor decimal válido (ex: "123.45")'
)

const ncmField = z.string().regex(
  /^\d{8}$/,
  'NCM deve conter exatamente 8 dígitos'
)

const ufField = z.string().length(2, 'UF deve conter 2 caracteres').toUpperCase()

const cnpjField = z.string().regex(
  /^\d{14}$/,
  'CNPJ deve conter exatamente 14 dígitos (sem formatação)'
)

const cfopField = z.string().regex(
  /^\d{4}$/,
  'CFOP deve conter exatamente 4 dígitos'
)

const cstField = z.string().regex(
  /^\d{2,3}$/,
  'CST deve conter 2 ou 3 dígitos'
)

// ============================================
// NFImportacao — Create / Update
// ============================================

export const createNfSchema = z.object({
  company_id: z.string().min(1, 'company_id é obrigatório'),
  duimp_numero: z.string().max(50).optional(),
  duimp_data_registro: z.string().datetime().optional(),
  processo_id: z.string().optional(),
  tipo_operacao: z.string().max(30).default('IMPORTACAO'),
  uf_destino: ufField,
  local_desembaraco: z.string().max(200).optional(),
  via_transporte: z.string().max(50).optional(),
  moeda_negociada: z.string().length(3).default('USD'),
  canal_entrada: canalEntradaEnum.default('MANUAL'),
  casas_decimais_valor: z.number().int().min(0).max(6).default(2),
  casas_decimais_qtd: z.number().int().min(0).max(8).default(4),
})

export const updateNfSchema = z.object({
  duimp_numero: z.string().max(50).nullable().optional(),
  duimp_data_registro: z.string().datetime().nullable().optional(),
  processo_id: z.string().nullable().optional(),
  tipo_operacao: z.string().max(30).optional(),
  uf_destino: ufField.optional(),
  local_desembaraco: z.string().max(200).nullable().optional(),
  via_transporte: z.string().max(50).nullable().optional(),
  moeda_negociada: z.string().length(3).optional(),
  casas_decimais_valor: z.number().int().min(0).max(6).optional(),
  casas_decimais_qtd: z.number().int().min(0).max(8).optional(),
}).strict()

// ============================================
// NFImportacaoItens — Create / Update
// ============================================

export const createItemSchema = z.object({
  nf_importacao_id: z.string().min(1, 'nf_importacao_id é obrigatório'),
  numero_adicao: z.string().max(10).optional(),
  ncm: ncmField,
  descricao: z.string().min(1, 'Descrição é obrigatória').max(500),
  fabricante: z.string().max(200).optional(),
  pais_origem: z.string().max(5).optional(),
  quantidade_estatistica: decimalString,
  unidade_medida: z.string().min(1).max(10),
  quantidade_comercial: decimalString.optional(),
  unidade_medida_comercial: z.string().max(10).optional(),
  peso_liquido: decimalString,
  peso_bruto: decimalString.optional(),
  valor_fob: decimalString,
  valor_frete: decimalString,
  valor_seguro: decimalString,
  ii_aliquota: decimalString,
  ipi_aliquota: decimalString,
  pis_aliquota: decimalString,
  cofins_aliquota: decimalString,
  icms_aliquota: decimalString,
  icms_base: decimalString.optional(),
  cfop: cfopField.optional(),
  cst_icms: cstField.optional(),
  cst_ipi: cstField.optional(),
  cst_pis: cstField.optional(),
  cst_cofins: cstField.optional(),
  beneficio_fiscal: z.string().max(50).optional(),
  beneficio_descricao: z.string().max(500).optional(),
})

export const updateItemSchema = z.object({
  numero_adicao: z.string().max(10).nullable().optional(),
  ncm: ncmField.optional(),
  descricao: z.string().min(1).max(500).optional(),
  fabricante: z.string().max(200).nullable().optional(),
  pais_origem: z.string().max(5).nullable().optional(),
  quantidade_estatistica: decimalString.optional(),
  unidade_medida: z.string().min(1).max(10).optional(),
  quantidade_comercial: decimalString.nullable().optional(),
  unidade_medida_comercial: z.string().max(10).nullable().optional(),
  peso_liquido: decimalString.optional(),
  peso_bruto: decimalString.nullable().optional(),
  valor_fob: decimalString.optional(),
  valor_frete: decimalString.optional(),
  valor_seguro: decimalString.optional(),
  ii_aliquota: decimalString.optional(),
  ipi_aliquota: decimalString.optional(),
  pis_aliquota: decimalString.optional(),
  cofins_aliquota: decimalString.optional(),
  icms_aliquota: decimalString.optional(),
  icms_base: decimalString.nullable().optional(),
  cfop: cfopField.nullable().optional(),
  cst_icms: cstField.nullable().optional(),
  cst_ipi: cstField.nullable().optional(),
  cst_pis: cstField.nullable().optional(),
  cst_cofins: cstField.nullable().optional(),
  beneficio_fiscal: z.string().max(50).nullable().optional(),
  beneficio_descricao: z.string().max(500).nullable().optional(),
}).strict()

// ============================================
// NFImportacaoDespesas — Create / Update
// ============================================

export const createDespesaSchema = z.object({
  nf_importacao_id: z.string().min(1, 'nf_importacao_id é obrigatório'),
  catalogo_despesa_id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  descricao: z.string().max(500).optional(),
  valor_total: decimalString,
  cnpj_prestador: cnpjField.optional(),
  data_despesa: z.string().datetime().optional(),
  metodo_rateio: metodoRateioEnum.default('VALOR_CIF'),
  formula_customizada: z.string().max(500).optional(),
  origem: origemDespesaEnum.default('MANUAL'),
  documento_id: z.string().optional(),
  conta_contabil: z.string().max(30).optional(),
  centro_custo: z.string().max(30).optional(),
})

export const updateDespesaSchema = z.object({
  catalogo_despesa_id: z.string().nullable().optional(),
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(500).nullable().optional(),
  valor_total: decimalString.optional(),
  cnpj_prestador: cnpjField.nullable().optional(),
  data_despesa: z.string().datetime().nullable().optional(),
  metodo_rateio: metodoRateioEnum.optional(),
  formula_customizada: z.string().max(500).nullable().optional(),
  conta_contabil: z.string().max(30).nullable().optional(),
  centro_custo: z.string().max(30).nullable().optional(),
}).strict()

// ============================================
// Rateio — Preview / Override
// ============================================

export const rateioPreviewSchema = z.object({
  nf_importacao_id: z.string().min(1, 'nf_importacao_id é obrigatório'),
  despesa_id: z.string().min(1, 'despesa_id é obrigatório'),
  metodo_rateio: metodoRateioEnum,
  formula_customizada: z.string().max(500).optional(),
})

export const rateioOverrideSchema = z.object({
  despesa_id: z.string().min(1, 'despesa_id é obrigatório'),
  overrides: z.array(
    z.object({
      item_id: z.string().min(1, 'item_id é obrigatório'),
      valor_rateado: decimalString,
    })
  ).min(1, 'Pelo menos um override é necessário'),
})

// ============================================
// Exportar NF
// ============================================

export const exportarSchema = z.object({
  nf_importacao_id: z.string().min(1, 'nf_importacao_id é obrigatório'),
  formato: formatoExportEnum,
  layout_id: z.string().optional(),
})

// ============================================
// NFImportacaoTipoDespesa — Create
// ============================================

export const createCatalogoSchema = z.object({
  company_id: z.string().min(1, 'company_id é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  descricao: z.string().max(500).optional(),
  metodo_rateio_padrao: metodoRateioEnum.default('VALOR_CIF'),
  conta_contabil: z.string().max(30).optional(),
  centro_custo: z.string().max(30).optional(),
})

export const updateCatalogoSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(500).nullable().optional(),
  metodo_rateio_padrao: metodoRateioEnum.optional(),
  conta_contabil: z.string().max(30).nullable().optional(),
  centro_custo: z.string().max(30).nullable().optional(),
  ativo: z.boolean().optional(),
}).strict()

// ============================================
// NFImportacaoTemplates — Create
// ============================================

export const createTemplateSchema = z.object({
  company_id: z.string().min(1, 'company_id é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  descricao: z.string().max(500).optional(),
  is_padrao: z.boolean().default(false),
  itens: z.array(
    z.object({
      catalogo_despesa_id: z.string().optional(),
      nome: z.string().min(1, 'Nome do item é obrigatório').max(200),
      valor_padrao: decimalString.optional(),
      metodo_rateio: metodoRateioEnum.default('VALOR_CIF'),
      ordem: z.number().int().min(0).default(0),
    })
  ).min(1, 'Template deve ter pelo menos 1 item'),
})

export const updateTemplateSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(500).nullable().optional(),
  is_padrao: z.boolean().optional(),
  ativo: z.boolean().optional(),
  itens: z.array(
    z.object({
      id: z.string().optional(),
      catalogo_despesa_id: z.string().nullable().optional(),
      nome: z.string().min(1).max(200),
      valor_padrao: decimalString.nullable().optional(),
      metodo_rateio: metodoRateioEnum.default('VALOR_CIF'),
      ordem: z.number().int().min(0).default(0),
    })
  ).min(1).optional(),
}).strict()

// ============================================
// NFImportacaoExportarLayout — Create
// ============================================

export const createLayoutSchema = z.object({
  company_id: z.string().min(1, 'company_id é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  descricao: z.string().max(500).optional(),
  formato: formatoExportEnum,
  separador: z.string().max(5).optional(),
  codificacao: z.string().max(20).default('UTF-8'),
  has_header: z.boolean().default(true),
  has_footer: z.boolean().default(false),
  header_template: z.string().max(2000).optional(),
  footer_template: z.string().max(2000).optional(),
  is_padrao: z.boolean().default(false),
  campos: z.array(
    z.object({
      campo_origem: z.string().min(1, 'campo_origem é obrigatório').max(100),
      label: z.string().min(1, 'label é obrigatório').max(100),
      ordem: z.number().int().min(0),
      tipo_dado: tipoDadoEnum.default('TEXTO'),
      formato: z.string().max(50).optional(),
      tamanho_fixo: z.number().int().min(1).optional(),
      posicao_inicio: z.number().int().min(0).optional(),
      alinhamento: alinhamentoEnum.default('ESQUERDA'),
      preenchimento: z.string().max(5).optional(),
      valor_padrao: z.string().max(200).optional(),
      transformacao: z.string().max(500).optional(),
    })
  ).min(1, 'Layout deve ter pelo menos 1 campo'),
})

export const updateLayoutSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(500).nullable().optional(),
  formato: formatoExportEnum.optional(),
  separador: z.string().max(5).nullable().optional(),
  codificacao: z.string().max(20).optional(),
  has_header: z.boolean().optional(),
  has_footer: z.boolean().optional(),
  header_template: z.string().max(2000).nullable().optional(),
  footer_template: z.string().max(2000).nullable().optional(),
  is_padrao: z.boolean().optional(),
  ativo: z.boolean().optional(),
  campos: z.array(
    z.object({
      id: z.string().optional(),
      campo_origem: z.string().min(1).max(100),
      label: z.string().min(1).max(100),
      ordem: z.number().int().min(0),
      tipo_dado: tipoDadoEnum.default('TEXTO'),
      formato: z.string().max(50).nullable().optional(),
      tamanho_fixo: z.number().int().min(1).nullable().optional(),
      posicao_inicio: z.number().int().min(0).nullable().optional(),
      alinhamento: alinhamentoEnum.default('ESQUERDA'),
      preenchimento: z.string().max(5).nullable().optional(),
      valor_padrao: z.string().max(200).nullable().optional(),
      transformacao: z.string().max(500).nullable().optional(),
    })
  ).min(1).optional(),
}).strict()

// ============================================
// NFImportacaoFiscaisFavoritos — Create
// ============================================

export const createFavoritoSchema = z.object({
  company_id: z.string().min(1, 'company_id é obrigatório'),
  ncm: ncmField,
  uf_destino: ufField.optional(),
  tipo_operacao: z.string().max(30).default('IMPORTACAO'),
  cfop: cfopField,
  cst_icms: cstField,
  cst_ipi: cstField,
  cst_pis: cstField,
  cst_cofins: cstField,
  beneficio_fiscal: z.string().max(50).optional(),
  descricao: z.string().max(500).optional(),
})

export const updateFavoritoSchema = z.object({
  ncm: ncmField.optional(),
  uf_destino: ufField.nullable().optional(),
  tipo_operacao: z.string().max(30).optional(),
  cfop: cfopField.optional(),
  cst_icms: cstField.optional(),
  cst_ipi: cstField.optional(),
  cst_pis: cstField.optional(),
  cst_cofins: cstField.optional(),
  beneficio_fiscal: z.string().max(50).nullable().optional(),
  descricao: z.string().max(500).nullable().optional(),
}).strict()

// ============================================
// Import — XML / Smart Read
// ============================================

export const importarXmlSchema = z.object({
  company_id: z.string().min(1, 'company_id é obrigatório'),
  xml_content: z.string().min(1, 'Conteúdo XML é obrigatório'),
  criar_nf: z.boolean().default(true),
  nf_importacao_id: z.string().optional(),
})

export const importarSmartReadSchema = z.object({
  company_id: z.string().min(1, 'company_id é obrigatório'),
  documento_id: z.string().min(1, 'documento_id é obrigatório'),
  nf_importacao_id: z.string().optional(),
  campos_mapeados: z.record(z.string(), z.string()).optional(),
})

// ============================================
// List / Filter schemas
// ============================================

export const listNfSchema = z.object({
  status: statusNfEnum.optional(),
  company_id: z.string().optional(),
  canal_entrada: canalEntradaEnum.optional(),
  duimp_numero: z.string().optional(),
  processo_id: z.string().optional(),
  data_inicio: z.string().datetime().optional(),
  data_fim: z.string().datetime().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
})

// ============================================
// Inferred Types
// ============================================

export type CreateNfInput = z.infer<typeof createNfSchema>
export type UpdateNfInput = z.infer<typeof updateNfSchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type CreateDespesaInput = z.infer<typeof createDespesaSchema>
export type UpdateDespesaInput = z.infer<typeof updateDespesaSchema>
export type RateioPreviewInput = z.infer<typeof rateioPreviewSchema>
export type RateioOverrideInput = z.infer<typeof rateioOverrideSchema>
export type ExportarInput = z.infer<typeof exportarSchema>
export type CreateCatalogoInput = z.infer<typeof createCatalogoSchema>
export type UpdateCatalogoInput = z.infer<typeof updateCatalogoSchema>
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
export type CreateLayoutInput = z.infer<typeof createLayoutSchema>
export type UpdateLayoutInput = z.infer<typeof updateLayoutSchema>
export type CreateFavoritoInput = z.infer<typeof createFavoritoSchema>
export type UpdateFavoritoInput = z.infer<typeof updateFavoritoSchema>
export type ImportarXmlInput = z.infer<typeof importarXmlSchema>
export type ImportarSmartReadInput = z.infer<typeof importarSmartReadSchema>
export type ListNfInput = z.infer<typeof listNfSchema>
