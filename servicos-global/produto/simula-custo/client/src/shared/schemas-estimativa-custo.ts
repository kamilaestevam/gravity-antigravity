/**
 * schemas-estimativa-custo.ts — Contratos Zod do client (Estimativa Custo).
 * Mandamento 09: espelho bilateral do backend
 * (server/src/schemas/estimativa-custo-schema.ts + serializadores).
 * Qualquer mudança de payload no backend exige atualização aqui NO MESMO COMMIT.
 */
import { z } from 'zod'

// ─── Enums ────────────────────────────────────────────────────────────────────
export const TipoOperacaoEstimativaCustoSchema = z.enum(['IMPORTACAO', 'EXPORTACAO'])
export const DetalheOperacaoEstimativaCustoSchema = z.enum(['DIRETA', 'CONTA_ORDEM', 'ENCOMENDA', 'COMERCIAL_EXPORTADORA'])
export const StatusEstimativaCustoSchema = z.enum(['EM_CRIACAO', 'CRIADA', 'ARQUIVADA'])
export const TipoCobrancaEstimativaCustoSchema = z.enum(['PROCESSO', 'CONTAINER', 'AWB', 'BL', 'CRT', 'KGS', 'TON', 'CAIXA', 'M3'])
export const TipoDocumentoEstimativaCustoSchema = z.enum(['PEDIDO_COMPRA', 'PEDIDO_VENDA', 'PROFORMA', 'INVOICE', 'OUTRO'])

export type TipoOperacaoEstimativaCusto = z.infer<typeof TipoOperacaoEstimativaCustoSchema>
export type DetalheOperacaoEstimativaCusto = z.infer<typeof DetalheOperacaoEstimativaCustoSchema>
export type StatusEstimativaCusto = z.infer<typeof StatusEstimativaCustoSchema>
export type TipoCobrancaEstimativaCusto = z.infer<typeof TipoCobrancaEstimativaCustoSchema>
export type TipoDocumentoEstimativaCusto = z.infer<typeof TipoDocumentoEstimativaCustoSchema>

// ─── Entidade (payload da lista/detalhe) ─────────────────────────────────────
export const EstimativaCustoSchema = z.object({
  id_estimativa_custo: z.string(),
  numero_estimativa_custo: z.string(),
  referencia_estimativa_custo: z.string().nullable(),
  tipo_operacao_estimativa_custo: TipoOperacaoEstimativaCustoSchema,
  detalhe_operacao_estimativa_custo: DetalheOperacaoEstimativaCustoSchema,
  status_estimativa_custo: StatusEstimativaCustoSchema,
  ncm_estimativa_custo: z.string(),
  descricao_ncm_estimativa_custo: z.string().nullable(),
  incoterm_estimativa_custo: z.string(),
  quantidade_estimativa_custo: z.number().nullable(),
  moeda_produto_estimativa_custo: z.string(),
  valor_produto_estimativa_custo: z.number().nullable(),
  moeda_frete_estimativa_custo: z.string(),
  valor_frete_estimativa_custo: z.number().nullable(),
  moeda_seguro_estimativa_custo: z.string(),
  valor_seguro_estimativa_custo: z.number().nullable(),
  uf_desembaraco_estimativa_custo: z.string(),
  ptax_utilizada_estimativa_custo: z.number().nullable(),
  valor_aduaneiro_estimativa_custo: z.number().nullable(),
  total_tributos_estimativa_custo: z.number().nullable(),
  custo_nacionalizado_brl_estimativa_custo: z.number().nullable(),
  fonte_calculo_estimativa_custo: z.string().nullable(),
  id_usuario: z.string().nullable(),
  data_criacao_estimativa_custo: z.string().nullable(),
  data_atualizacao_estimativa_custo: z.string().nullable(),
})
export type EstimativaCusto = z.infer<typeof EstimativaCustoSchema>

export const TaxaOrigemEstimativaCustoSchema = z.object({
  id_taxa_origem_estimativa_custo: z.string(),
  id_taxa_origem_destino: z.string().nullable(),
  nome_taxa_origem_estimativa_custo: z.string(),
  moeda_taxa_origem_estimativa_custo: z.string(),
  tipo_cobranca_taxa_origem_estimativa_custo: TipoCobrancaEstimativaCustoSchema,
  valor_minimo_taxa_origem_estimativa_custo: z.number(),
  valor_total_taxa_origem_estimativa_custo: z.number(),
})

export const TaxaDestinoEstimativaCustoSchema = z.object({
  id_taxa_destino_estimativa_custo: z.string(),
  id_taxa_origem_destino: z.string().nullable(),
  nome_taxa_destino_estimativa_custo: z.string(),
  moeda_taxa_destino_estimativa_custo: z.string(),
  tipo_cobranca_taxa_destino_estimativa_custo: TipoCobrancaEstimativaCustoSchema,
  valor_minimo_taxa_destino_estimativa_custo: z.number(),
  valor_total_taxa_destino_estimativa_custo: z.number(),
})

export const TributoEstimativaCustoSchema = z.object({
  id_tributo_estimativa_custo: z.string(),
  tipo_tributo_estimativa_custo: z.enum(['II', 'IPI', 'PIS', 'COFINS', 'ICMS']),
  aliquota_tributo_estimativa_custo: z.number(),
  base_calculo_tributo_estimativa_custo: z.number(),
  valor_tributo_estimativa_custo: z.number(),
  reducao_tributo_estimativa_custo: z.number().nullable(),
  acordo_tributo_estimativa_custo: z.string().nullable(),
})

export const DocumentoEstimativaCustoSchema = z.object({
  id_documento_estimativa_custo: z.string(),
  tipo_documento_estimativa_custo: TipoDocumentoEstimativaCustoSchema,
  numero_documento_estimativa_custo: z.string(),
})

export const EstimativaCustoDetalheSchema = EstimativaCustoSchema.extend({
  aliquota_ii_estimativa_custo: z.number(),
  aliquota_ipi_estimativa_custo: z.number(),
  aliquota_pis_estimativa_custo: z.number(),
  aliquota_cofins_estimativa_custo: z.number(),
  aliquota_icms_estimativa_custo: z.number(),
  reducao_ii_estimativa_custo: z.number(),
  usa_beneficio_estimativa_custo: z.boolean(),
  taxas_origem: z.array(TaxaOrigemEstimativaCustoSchema),
  taxas_destino: z.array(TaxaDestinoEstimativaCustoSchema),
  tributos: z.array(TributoEstimativaCustoSchema),
  documentos: z.array(DocumentoEstimativaCustoSchema),
})
export type EstimativaCustoDetalhe = z.infer<typeof EstimativaCustoDetalheSchema>

// ─── Respostas ────────────────────────────────────────────────────────────────
export const RespostaEstimativaCustoSchema = z.object({ estimativa_custo: EstimativaCustoSchema })
export const RespostaDetalheEstimativaCustoSchema = z.object({ estimativa_custo: EstimativaCustoDetalheSchema })

export const RespostaListaEstimativasCustoSchema = z.object({
  estimativas_custo: z.array(EstimativaCustoSchema),
  paginacao: z.object({
    pagina: z.number(),
    limite: z.number(),
    total: z.number(),
    paginas: z.number(),
  }),
})
export type RespostaListaEstimativasCusto = z.infer<typeof RespostaListaEstimativasCustoSchema>

export const KpisEstimativaCustoSchema = z.object({
  total: z.number(),
  em_criacao: z.number(),
  criadas: z.number(),
  arquivadas: z.number(),
  custo_nacionalizado_medio_brl: z.number(),
  total_tributos_acumulado_brl: z.number(),
})
export type KpisEstimativaCusto = z.infer<typeof KpisEstimativaCustoSchema>

export const KpisDashboardEstimativaCustoSchema = z.object({
  fonte: z.enum(['db', 'cache']),
  kpis: z.object({
    total_estimativas: z.number(),
    em_criacao: z.number(),
    criadas: z.number(),
    arquivadas: z.number(),
    custo_nacionalizado_medio_brl: z.number().nullable(),
    custo_nacionalizado_maior_brl: z.number().nullable(),
    custo_nacionalizado_menor_brl: z.number().nullable(),
    total_tributos_acumulado_brl: z.number().nullable(),
  }),
})
export type KpisDashboardEstimativaCusto = z.infer<typeof KpisDashboardEstimativaCustoSchema>['kpis']

export const RecentesEstimativaCustoSchema = z.object({
  fonte: z.enum(['db', 'cache']),
  recentes: z.array(z.object({
    id_estimativa_custo: z.string(),
    numero_estimativa_custo: z.string(),
    ncm_estimativa_custo: z.string(),
    status_estimativa_custo: StatusEstimativaCustoSchema,
    valor_produto_estimativa_custo: z.number().nullable(),
    moeda_produto_estimativa_custo: z.string(),
    custo_nacionalizado_brl_estimativa_custo: z.number().nullable(),
    data_criacao_estimativa_custo: z.string(),
  })),
})
export type EstimativaCustoRecente = z.infer<typeof RecentesEstimativaCustoSchema>['recentes'][number]

export const ConfigStatusEstimativaCustoSchema = z.object({
  status_estimativa_custo: z.array(z.object({
    nome_status_estimativa_custo: StatusEstimativaCustoSchema,
    cor_status_estimativa_custo: z.string(),
    icone_status_estimativa_custo: z.string(),
    ordem_status_estimativa_custo: z.number(),
  })),
})
export type ConfigStatusEstimativaCusto = z.infer<typeof ConfigStatusEstimativaCustoSchema>['status_estimativa_custo'][number]

// ─── Simulação ────────────────────────────────────────────────────────────────
export const DetalhamentoTributoSchema = z.object({
  aliquota: z.number(),
  base_calculo: z.number(),
  valor: z.number(),
})

export const RespostaSimulacaoEstimativaCustoSchema = z.object({
  resultado: z.object({
    valor_aduaneiro_brl: z.number(),
    tributos: z.object({
      ii: DetalhamentoTributoSchema,
      ipi: DetalhamentoTributoSchema,
      pis: DetalhamentoTributoSchema,
      cofins: DetalhamentoTributoSchema,
      icms: DetalhamentoTributoSchema,
    }),
    total_tributos_brl: z.number(),
    taxas_origem_brl: z.number(),
    taxas_destino_brl: z.number(),
    custo_nacionalizado_brl: z.number(),
    calculado_em: z.string(),
  }),
  fonte_calculo_estimativa_custo: z.string(),
  ptax_utilizada_estimativa_custo: z.number(),
})
export type ResultadoSimulacaoEstimativaCusto = z.infer<typeof RespostaSimulacaoEstimativaCustoSchema>

// ─── Master data ──────────────────────────────────────────────────────────────
export const BuscaNcmEstimativaCustoSchema = z.object({
  itens: z.array(z.object({ codigo: z.string(), descricao: z.string() })),
  ultima_sync: z.string().nullable(),
  fuzzy: z.boolean(),
})

export const ValidarNcmEstimativaCustoSchema = z.object({
  valido: z.boolean(),
  descricao: z.string().nullable(),
  fonte: z.string().nullable(),
  ultima_sync: z.string().nullable(),
  motivo: z.string().nullable(),
  ii: z.number().nullable(),
  ipi: z.number().nullable(),
  pis: z.number().nullable(),
  cofins: z.number().nullable(),
})
export type ValidarNcmEstimativaCusto = z.infer<typeof ValidarNcmEstimativaCustoSchema>

export const UfsEstimativaCustoSchema = z.array(z.object({
  uf: z.string(),
  nome: z.string(),
  icms: z.number(),
}))
export type UfEstimativaCusto = z.infer<typeof UfsEstimativaCustoSchema>[number]

// ─── Entrada (criação/edição) ────────────────────────────────────────────────
export interface TaxaEntradaEstimativaCusto {
  id_taxa_origem_destino?: string | null
  nome: string
  moeda: string
  tipo_cobranca: TipoCobrancaEstimativaCusto
  valor_minimo: number
  valor_total: number
}

export interface DocumentoEntradaEstimativaCusto {
  tipo_documento_estimativa_custo: TipoDocumentoEstimativaCusto
  numero_documento_estimativa_custo: string
}

export interface EntradaEstimativaCusto {
  referencia_estimativa_custo?: string
  numero_manual_estimativa_custo?: string
  tipo_operacao_estimativa_custo: TipoOperacaoEstimativaCusto
  detalhe_operacao_estimativa_custo: DetalheOperacaoEstimativaCusto
  ncm_estimativa_custo: string
  descricao_ncm_estimativa_custo?: string
  incoterm_estimativa_custo: string
  quantidade_estimativa_custo: number
  moeda_produto_estimativa_custo: string
  valor_produto_estimativa_custo: number
  moeda_frete_estimativa_custo: string
  valor_frete_estimativa_custo: number
  moeda_seguro_estimativa_custo: string
  valor_seguro_estimativa_custo: number
  uf_desembaraco_estimativa_custo: string
  aliquota_icms_estimativa_custo: number
  usa_beneficio_estimativa_custo?: boolean
  aliquota_ii_estimativa_custo: number
  aliquota_ipi_estimativa_custo: number
  aliquota_pis_estimativa_custo: number
  aliquota_cofins_estimativa_custo: number
  reducao_ii_estimativa_custo?: number
  taxas_origem: TaxaEntradaEstimativaCusto[]
  taxas_destino: TaxaEntradaEstimativaCusto[]
  documentos: DocumentoEntradaEstimativaCusto[]
}

export interface EntradaSimulacaoEstimativaCusto {
  ncm_estimativa_custo: string
  valor_produto_estimativa_custo: number
  moeda_produto_estimativa_custo: string
  ptax_venda?: number
  valor_frete_estimativa_custo: number
  moeda_frete_estimativa_custo: string
  valor_seguro_estimativa_custo: number
  moeda_seguro_estimativa_custo: string
  taxas_origem: Array<{ nome: string; valor: number; moeda: string }>
  taxas_destino: Array<{ nome: string; valor: number; moeda: string }>
  uf_desembaraco_estimativa_custo: string
  aliquota_ii_estimativa_custo: number
  aliquota_ipi_estimativa_custo: number
  aliquota_pis_estimativa_custo: number
  aliquota_cofins_estimativa_custo: number
  aliquota_icms_estimativa_custo: number
  reducao_ii_estimativa_custo?: number
}
