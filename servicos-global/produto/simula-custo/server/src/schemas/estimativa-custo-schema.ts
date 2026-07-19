/**
 * estimativa-custo-schema.ts — Contratos Zod do backend (Estimativa Custo)
 * Mandamento 06: validação Zod antes do banco.
 * Mandamento 09: schema espelhado no client em shared/schemas-estimativa-custo.ts —
 * qualquer mudança aqui exige atualização lá NO MESMO COMMIT.
 */
import { z } from 'zod'

export const TIPOS_OPERACAO_ESTIMATIVA_CUSTO = ['IMPORTACAO', 'EXPORTACAO'] as const
export const DETALHES_OPERACAO_ESTIMATIVA_CUSTO = ['DIRETA', 'CONTA_ORDEM', 'ENCOMENDA', 'COMERCIAL_EXPORTADORA'] as const
export const STATUS_ESTIMATIVA_CUSTO = ['EM_CRIACAO', 'CRIADA', 'ARQUIVADA'] as const
export const TIPOS_COBRANCA_ESTIMATIVA_CUSTO = ['PROCESSO', 'CONTAINER', 'AWB', 'BL', 'CRT', 'KGS', 'TON', 'CAIXA', 'M3'] as const
export const TIPOS_DOCUMENTO_ESTIMATIVA_CUSTO = ['PEDIDO_COMPRA', 'PEDIDO_VENDA', 'PROFORMA', 'INVOICE', 'OUTRO'] as const

const TaxaEntradaSchema = z.object({
  id_taxa_origem_destino: z.string().optional().nullable(),
  nome: z.string().min(1).max(100),
  moeda: z.string().length(3),
  tipo_cobranca: z.enum(TIPOS_COBRANCA_ESTIMATIVA_CUSTO).default('PROCESSO'),
  valor_minimo: z.number().nonnegative().default(0),
  valor_total: z.number().nonnegative(),
})

const DocumentoEntradaSchema = z.object({
  tipo_documento_estimativa_custo: z.enum(TIPOS_DOCUMENTO_ESTIMATIVA_CUSTO),
  numero_documento_estimativa_custo: z.string().min(1).max(30),
})

export const CriarEstimativaCustoSchema = z.object({
  referencia_estimativa_custo: z.string().max(30).optional(),
  numero_manual_estimativa_custo: z.string().max(30).optional(), // se ausente, gera EST-IMP-00001/26
  tipo_operacao_estimativa_custo: z.enum(TIPOS_OPERACAO_ESTIMATIVA_CUSTO).default('IMPORTACAO'),
  detalhe_operacao_estimativa_custo: z.enum(DETALHES_OPERACAO_ESTIMATIVA_CUSTO).default('DIRETA'),

  ncm_estimativa_custo: z.string().min(8).max(10),
  descricao_ncm_estimativa_custo: z.string().max(500).optional(),
  incoterm_estimativa_custo: z.string().min(3).max(5).default('FOB'),
  quantidade_estimativa_custo: z.number().positive().default(1),
  moeda_produto_estimativa_custo: z.string().length(3).default('USD'),
  valor_produto_estimativa_custo: z.number().nonnegative(),

  moeda_frete_estimativa_custo: z.string().length(3).default('USD'),
  valor_frete_estimativa_custo: z.number().nonnegative().default(0),
  moeda_seguro_estimativa_custo: z.string().length(3).default('USD'),
  valor_seguro_estimativa_custo: z.number().nonnegative().default(0),

  uf_desembaraco_estimativa_custo: z.string().length(2).default('SP'),
  aliquota_icms_estimativa_custo: z.number().min(0).max(1).default(0),
  usa_beneficio_estimativa_custo: z.boolean().default(false),

  aliquota_ii_estimativa_custo: z.number().min(0).max(1).default(0),
  aliquota_ipi_estimativa_custo: z.number().min(0).max(1).default(0),
  aliquota_pis_estimativa_custo: z.number().min(0).max(1).default(0),
  aliquota_cofins_estimativa_custo: z.number().min(0).max(1).default(0),
  reducao_ii_estimativa_custo: z.number().min(0).max(1).default(0),

  taxas_origem: z.array(TaxaEntradaSchema).default([]),
  taxas_destino: z.array(TaxaEntradaSchema).default([]),
  documentos: z.array(DocumentoEntradaSchema).default([]),
})

export const AtualizarEstimativaCustoSchema = CriarEstimativaCustoSchema.partial()

export const AtualizarStatusEstimativaCustoSchema = z.object({
  status_estimativa_custo: z.enum(STATUS_ESTIMATIVA_CUSTO),
})

export const ListarEstimativasCustoQuerySchema = z.object({
  busca: z.string().max(100).optional(),
  status: z.enum(STATUS_ESTIMATIVA_CUSTO).optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(20),
  ordenar_por: z.enum([
    'numero_estimativa_custo',
    'status_estimativa_custo',
    'ncm_estimativa_custo',
    'custo_nacionalizado_brl_estimativa_custo',
    'total_tributos_estimativa_custo',
    'data_criacao_estimativa_custo',
  ]).default('data_criacao_estimativa_custo'),
  direcao: z.enum(['asc', 'desc']).default('desc'),
})

export const SimularEstimativaCustoSchema = z.object({
  ncm_estimativa_custo: z.string().length(8),
  valor_produto_estimativa_custo: z.number().positive(),
  moeda_produto_estimativa_custo: z.string().length(3),
  ptax_venda: z.number().positive().optional(),
  valor_frete_estimativa_custo: z.number().nonnegative().default(0),
  moeda_frete_estimativa_custo: z.string().length(3).default('USD'),
  valor_seguro_estimativa_custo: z.number().nonnegative().default(0),
  moeda_seguro_estimativa_custo: z.string().length(3).default('USD'),
  taxas_origem: z.array(z.object({ nome: z.string().min(1), valor: z.number().nonnegative(), moeda: z.string().length(3) })).default([]),
  taxas_destino: z.array(z.object({ nome: z.string().min(1), valor: z.number().nonnegative(), moeda: z.string().length(3) })).default([]),
  uf_desembaraco_estimativa_custo: z.string().length(2).default('SP'),
  aliquota_ii_estimativa_custo: z.number().min(0).max(1),
  aliquota_ipi_estimativa_custo: z.number().min(0).max(1),
  aliquota_pis_estimativa_custo: z.number().min(0).max(1),
  aliquota_cofins_estimativa_custo: z.number().min(0).max(1),
  aliquota_icms_estimativa_custo: z.number().min(0).max(1),
  reducao_ii_estimativa_custo: z.number().min(0).max(1).optional(),
})

export type CriarEstimativaCustoInput = z.infer<typeof CriarEstimativaCustoSchema>
export type AtualizarEstimativaCustoInput = z.infer<typeof AtualizarEstimativaCustoSchema>
export type SimularEstimativaCustoInput = z.infer<typeof SimularEstimativaCustoSchema>
