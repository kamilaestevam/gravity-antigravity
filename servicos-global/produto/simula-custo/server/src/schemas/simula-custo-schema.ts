/**
 * simula-custo-schema.ts — Contratos Zod do backend (Simula Custo)
 * Mandamento 06: validação Zod antes do banco.
 * Mandamento 09: schema espelhado no client em shared/schemas-simula-custo.ts —
 * qualquer mudança aqui exige atualização lá NO MESMO COMMIT.
 */
import { z } from 'zod'

export const TIPOS_OPERACAO_SIMULA_CUSTO = ['IMPORTACAO', 'EXPORTACAO'] as const
export const DETALHES_OPERACAO_SIMULA_CUSTO = ['DIRETA', 'CONTA_ORDEM', 'ENCOMENDA', 'COMERCIAL_EXPORTADORA'] as const
export const STATUS_SIMULA_CUSTO = ['EM_CRIACAO', 'CRIADA', 'ARQUIVADA'] as const
export const TIPOS_COBRANCA_SIMULA_CUSTO = ['PROCESSO', 'CONTAINER', 'AWB', 'BL', 'CRT', 'KGS', 'TON', 'CAIXA', 'M3'] as const
export const TIPOS_DOCUMENTO_SIMULA_CUSTO = ['PEDIDO_COMPRA', 'PEDIDO_VENDA', 'PROFORMA', 'INVOICE', 'OUTRO'] as const
export const TIPOS_VALOR_PRAZO_PAGAMENTO_SIMULA_CUSTO = ['VALOR', 'PERCENTUAL'] as const
export const MOMENTOS_PRAZO_PAGAMENTO_SIMULA_CUSTO = ['NO_DIA', 'ANTES', 'DEPOIS'] as const
export const FATOS_GERADOR_PRAZO_PAGAMENTO_SIMULA_CUSTO = [
  'PRODUCAO',
  'ENTREGA_NA_ORIGEM',
  'ENTREGA_NO_PORTO_DE_ORIGEM',
  'ENTREGA_NO_LOCAL_DE_ORIGEM',
  'ENTREGA_NO_DESTINO',
  'NO_BL',
  'ENTREGA_NO_PORTO_DE_DESTINO',
  'ENTREGA_NO_LOCAL_DE_DESTINO',
  'EMBARQUE_NO_DESTINO',
  'CHEGADA_NO_DESTINO',
] as const
export const MODALIDADES_RECOLHIMENTO_ICMS_SIMULA_CUSTO = [
  'INTEGRAL',
  'REDUCAO',
  'ISENTO',
  'DIFERIDO',
] as const

const TaxaOrigemEntradaSimulaCustoSchema = z.object({
  id_taxa_origem_destino: z.string().optional().nullable(),
  nome_taxa_origem_simula_custo: z.string().min(1).max(100),
  moeda_taxa_origem_simula_custo: z.string().length(3),
  tipo_cobranca_taxa_origem_simula_custo: z.enum(TIPOS_COBRANCA_SIMULA_CUSTO).default('PROCESSO'),
  valor_minimo_taxa_origem_simula_custo: z.number().nonnegative().default(0),
  valor_total_taxa_origem_simula_custo: z.number().nonnegative(),
})

const TaxaDestinoEntradaSimulaCustoSchema = z.object({
  id_taxa_origem_destino: z.string().optional().nullable(),
  nome_taxa_destino_simula_custo: z.string().min(1).max(100),
  moeda_taxa_destino_simula_custo: z.string().length(3),
  tipo_cobranca_taxa_destino_simula_custo: z.enum(TIPOS_COBRANCA_SIMULA_CUSTO).default('PROCESSO'),
  valor_minimo_taxa_destino_simula_custo: z.number().nonnegative().default(0),
  valor_total_taxa_destino_simula_custo: z.number().nonnegative(),
})

const DocumentoEntradaSchema = z.object({
  tipo_documento_simula_custo: z.enum(TIPOS_DOCUMENTO_SIMULA_CUSTO),
  numero_documento_simula_custo: z.string().min(1).max(30),
})

const PrazoPagamentoEntradaSchema = z.object({
  valor_prazo_pagamento_simula_custo: z.number().nonnegative(),
  tipo_valor_prazo_pagamento_simula_custo: z.enum(TIPOS_VALOR_PRAZO_PAGAMENTO_SIMULA_CUSTO).default('PERCENTUAL'),
  momento_prazo_pagamento_simula_custo: z.enum(MOMENTOS_PRAZO_PAGAMENTO_SIMULA_CUSTO).default('NO_DIA'),
  dias_prazo_pagamento_simula_custo: z.number().int().nonnegative().default(0),
  fato_gerador_prazo_pagamento_simula_custo: z.enum(FATOS_GERADOR_PRAZO_PAGAMENTO_SIMULA_CUSTO),
})

export const CriarSimulaCustoSchema = z.object({
  referencia_simula_custo: z.string().max(30).optional(),
  numero_manual_simula_custo: z.string().max(30).optional(), // se ausente, gera EST-IMP-00001/26
  tipo_operacao_simula_custo: z.enum(TIPOS_OPERACAO_SIMULA_CUSTO).default('IMPORTACAO'),
  detalhe_operacao_simula_custo: z.enum(DETALHES_OPERACAO_SIMULA_CUSTO).default('DIRETA'),

  ncm_simula_custo: z.string().min(8).max(10),
  descricao_ncm_simula_custo: z.string().max(500).optional(),
  incoterm_simula_custo: z.string().min(3).max(5).default('FOB'),
  quantidade_simula_custo: z.number().positive().default(1),
  moeda_produto_simula_custo: z.string().length(3).default('USD'),
  valor_produto_simula_custo: z.number().nonnegative(),

  moeda_frete_simula_custo: z.string().length(3).default('USD'),
  valor_frete_simula_custo: z.number().nonnegative().default(0),
  enviar_solicitacao_cotacao_frete_simula_custo: z.boolean().default(false),
  moeda_seguro_simula_custo: z.string().length(3).default('USD'),
  valor_seguro_simula_custo: z.number().nonnegative().default(0),

  uf_desembaraco_simula_custo: z.string().length(2).default('SP'),
  modalidade_recolhimento_icms_simula_custo: z.enum(MODALIDADES_RECOLHIMENTO_ICMS_SIMULA_CUSTO).default('INTEGRAL'),
  aliquota_icms_simula_custo: z.number().min(0).max(1).default(0),
  usa_beneficio_simula_custo: z.boolean().default(false),

  aliquota_ii_simula_custo: z.number().min(0).max(1).default(0),
  aliquota_ipi_simula_custo: z.number().min(0).max(1).default(0),
  aliquota_pis_simula_custo: z.number().min(0).max(1).default(0),
  aliquota_cofins_simula_custo: z.number().min(0).max(1).default(0),
  reducao_ii_simula_custo: z.number().min(0).max(1).default(0),

  taxas_origem: z.array(TaxaOrigemEntradaSimulaCustoSchema).default([]),
  taxas_destino: z.array(TaxaDestinoEntradaSimulaCustoSchema).default([]),
  documentos: z.array(DocumentoEntradaSchema).default([]),
  prazos_pagamento: z.array(PrazoPagamentoEntradaSchema).default([]),
})

export const AtualizarSimulaCustoSchema = CriarSimulaCustoSchema.partial()

export const AtualizarStatusSimulaCustoSchema = z.object({
  status_simula_custo: z.enum(STATUS_SIMULA_CUSTO),
})

export const ListarSimulasCustoQuerySchema = z.object({
  busca: z.string().max(100).optional(),
  status: z.enum(STATUS_SIMULA_CUSTO).optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(20),
  ordenar_por: z.enum([
    'numero_simula_custo',
    'status_simula_custo',
    'ncm_simula_custo',
    'custo_nacionalizado_brl_simula_custo',
    'total_tributos_simula_custo',
    'data_criacao_simula_custo',
  ]).default('data_criacao_simula_custo'),
  direcao: z.enum(['asc', 'desc']).default('desc'),
})

export const SimularSimulaCustoSchema = z.object({
  ncm_simula_custo: z.string().length(8),
  valor_produto_simula_custo: z.number().positive(),
  moeda_produto_simula_custo: z.string().length(3),
  ptax_venda: z.number().positive().optional(),
  valor_frete_simula_custo: z.number().nonnegative().default(0),
  moeda_frete_simula_custo: z.string().length(3).default('USD'),
  valor_seguro_simula_custo: z.number().nonnegative().default(0),
  moeda_seguro_simula_custo: z.string().length(3).default('USD'),
  taxas_origem: z.array(z.object({ nome: z.string().min(1), valor: z.number().nonnegative(), moeda: z.string().length(3) })).default([]),
  taxas_destino: z.array(z.object({ nome: z.string().min(1), valor: z.number().nonnegative(), moeda: z.string().length(3) })).default([]),
  uf_desembaraco_simula_custo: z.string().length(2).default('SP'),
  aliquota_ii_simula_custo: z.number().min(0).max(1),
  aliquota_ipi_simula_custo: z.number().min(0).max(1),
  aliquota_pis_simula_custo: z.number().min(0).max(1),
  aliquota_cofins_simula_custo: z.number().min(0).max(1),
  aliquota_icms_simula_custo: z.number().min(0).max(1),
  aliquota_icms_interna_uf_simula_custo: z.number().min(0).max(1).optional(),
  modalidade_recolhimento_icms_simula_custo: z.enum(MODALIDADES_RECOLHIMENTO_ICMS_SIMULA_CUSTO).default('INTEGRAL'),
  reducao_ii_simula_custo: z.number().min(0).max(1).optional(),
})

export type CriarSimulaCustoInput = z.infer<typeof CriarSimulaCustoSchema>
export type AtualizarSimulaCustoInput = z.infer<typeof AtualizarSimulaCustoSchema>
export type SimularSimulaCustoInput = z.infer<typeof SimularSimulaCustoSchema>
