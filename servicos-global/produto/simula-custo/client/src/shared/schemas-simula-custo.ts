/**
 * schemas-simula-custo.ts — Contratos Zod do client (Simula Custo).
 * Mandamento 09: espelho bilateral do backend
 * (server/src/schemas/simula-custo-schema.ts + serializadores).
 * Qualquer mudança de payload no backend exige atualização aqui NO MESMO COMMIT.
 */
import { z } from 'zod'

// ─── Enums ────────────────────────────────────────────────────────────────────
export const TipoOperacaoSimulaCustoSchema = z.enum(['IMPORTACAO', 'EXPORTACAO'])
export const DetalheOperacaoSimulaCustoSchema = z.enum(['DIRETA', 'CONTA_ORDEM', 'ENCOMENDA', 'COMERCIAL_EXPORTADORA'])
export const StatusSimulaCustoSchema = z.enum(['EM_CRIACAO', 'CRIADA', 'ARQUIVADA'])
export const TipoCobrancaSimulaCustoSchema = z.enum(['PROCESSO', 'CONTAINER', 'AWB', 'BL', 'CRT', 'KGS', 'TON', 'CAIXA', 'M3'])
export const TipoDocumentoSimulaCustoSchema = z.enum(['PEDIDO_COMPRA', 'PEDIDO_VENDA', 'PROFORMA', 'INVOICE', 'OUTRO'])
export const TipoValorPrazoPagamentoSimulaCustoSchema = z.enum(['VALOR', 'PERCENTUAL'])
export const MomentoPrazoPagamentoSimulaCustoSchema = z.enum(['NO_DIA', 'ANTES', 'DEPOIS'])
export const FatoGeradorPrazoPagamentoSimulaCustoSchema = z.enum([
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
])
export const ModalidadeRecolhimentoIcmsSimulaCustoSchema = z.enum([
  'INTEGRAL',
  'REDUCAO',
  'ISENTO',
  'DIFERIDO',
])

export type TipoOperacaoSimulaCusto = z.infer<typeof TipoOperacaoSimulaCustoSchema>
export type DetalheOperacaoSimulaCusto = z.infer<typeof DetalheOperacaoSimulaCustoSchema>
export type StatusSimulaCusto = z.infer<typeof StatusSimulaCustoSchema>
export type TipoCobrancaSimulaCusto = z.infer<typeof TipoCobrancaSimulaCustoSchema>
export type TipoDocumentoSimulaCusto = z.infer<typeof TipoDocumentoSimulaCustoSchema>
export type TipoValorPrazoPagamentoSimulaCusto = z.infer<typeof TipoValorPrazoPagamentoSimulaCustoSchema>
export type MomentoPrazoPagamentoSimulaCusto = z.infer<typeof MomentoPrazoPagamentoSimulaCustoSchema>
export type FatoGeradorPrazoPagamentoSimulaCusto = z.infer<typeof FatoGeradorPrazoPagamentoSimulaCustoSchema>
export type ModalidadeRecolhimentoIcmsSimulaCusto = z.infer<typeof ModalidadeRecolhimentoIcmsSimulaCustoSchema>

// ─── Entidade (payload da lista/detalhe) ─────────────────────────────────────
export const SimulaCustoSchema = z.object({
  id_simula_custo: z.string(),
  numero_simula_custo: z.string(),
  referencia_simula_custo: z.string().nullable(),
  tipo_operacao_simula_custo: TipoOperacaoSimulaCustoSchema,
  detalhe_operacao_simula_custo: DetalheOperacaoSimulaCustoSchema,
  status_simula_custo: StatusSimulaCustoSchema,
  ncm_simula_custo: z.string(),
  descricao_ncm_simula_custo: z.string().nullable(),
  incoterm_simula_custo: z.string(),
  quantidade_simula_custo: z.number().nullable(),
  moeda_produto_simula_custo: z.string(),
  valor_produto_simula_custo: z.number().nullable(),
  moeda_frete_simula_custo: z.string(),
  valor_frete_simula_custo: z.number().nullable(),
  moeda_seguro_simula_custo: z.string(),
  valor_seguro_simula_custo: z.number().nullable(),
  uf_desembaraco_simula_custo: z.string(),
  ptax_utilizada_simula_custo: z.number().nullable(),
  valor_aduaneiro_simula_custo: z.number().nullable(),
  total_tributos_simula_custo: z.number().nullable(),
  custo_nacionalizado_brl_simula_custo: z.number().nullable(),
  fonte_calculo_simula_custo: z.string().nullable(),
  id_usuario: z.string().nullable(),
  data_criacao_simula_custo: z.string().nullable(),
  data_atualizacao_simula_custo: z.string().nullable(),
})
export type SimulaCusto = z.infer<typeof SimulaCustoSchema>

export const TaxaOrigemSimulaCustoSchema = z.object({
  id_taxa_origem_simula_custo: z.string(),
  id_taxa_origem_destino: z.string().nullable(),
  nome_taxa_origem_simula_custo: z.string(),
  moeda_taxa_origem_simula_custo: z.string(),
  tipo_cobranca_taxa_origem_simula_custo: TipoCobrancaSimulaCustoSchema,
  valor_minimo_taxa_origem_simula_custo: z.number(),
  valor_total_taxa_origem_simula_custo: z.number(),
})

export const TaxaDestinoSimulaCustoSchema = z.object({
  id_taxa_destino_simula_custo: z.string(),
  id_taxa_origem_destino: z.string().nullable(),
  nome_taxa_destino_simula_custo: z.string(),
  moeda_taxa_destino_simula_custo: z.string(),
  tipo_cobranca_taxa_destino_simula_custo: TipoCobrancaSimulaCustoSchema,
  valor_minimo_taxa_destino_simula_custo: z.number(),
  valor_total_taxa_destino_simula_custo: z.number(),
})

export const AnexoDocumentoSimulaCustoSchema = z.object({
  id_anexo_documento_simula_custo: z.string(),
  nome_arquivo_anexo_documento_simula_custo: z.string(),
  nome_original_anexo_documento_simula_custo: z.string(),
  tipo_arquivo_anexo_documento_simula_custo: z.string(),
  tamanho_bytes_anexo_documento_simula_custo: z.number(),
  categoria_anexo_documento_simula_custo: z.string().nullable(),
  enviado_por_anexo_documento_simula_custo: z.string(),
  data_criacao_anexo_documento_simula_custo: z.string(),
})

export const DocumentoSimulaCustoSchema = z.object({
  id_documento_simula_custo: z.string(),
  tipo_documento_simula_custo: TipoDocumentoSimulaCustoSchema,
  numero_documento_simula_custo: z.string(),
  anexos: z.array(AnexoDocumentoSimulaCustoSchema).default([]),
})

export const PrazoPagamentoSimulaCustoSchema = z.object({
  id_prazo_pagamento_simula_custo: z.string(),
  valor_prazo_pagamento_simula_custo: z.number(),
  tipo_valor_prazo_pagamento_simula_custo: TipoValorPrazoPagamentoSimulaCustoSchema,
  momento_prazo_pagamento_simula_custo: MomentoPrazoPagamentoSimulaCustoSchema,
  dias_prazo_pagamento_simula_custo: z.number(),
  fato_gerador_prazo_pagamento_simula_custo: FatoGeradorPrazoPagamentoSimulaCustoSchema,
  ordem_prazo_pagamento_simula_custo: z.number(),
})

export const SimulaCustoDetalheSchema = SimulaCustoSchema.extend({
  aliquota_ii_simula_custo: z.number(),
  base_calculo_ii_simula_custo: z.number().nullable(),
  valor_ii_simula_custo: z.number().nullable(),
  reducao_ii_simula_custo: z.number(),
  aliquota_ipi_simula_custo: z.number(),
  base_calculo_ipi_simula_custo: z.number().nullable(),
  valor_ipi_simula_custo: z.number().nullable(),
  aliquota_pis_simula_custo: z.number(),
  base_calculo_pis_simula_custo: z.number().nullable(),
  valor_pis_simula_custo: z.number().nullable(),
  aliquota_cofins_simula_custo: z.number(),
  base_calculo_cofins_simula_custo: z.number().nullable(),
  valor_cofins_simula_custo: z.number().nullable(),
  aliquota_icms_simula_custo: z.number(),
  base_calculo_icms_simula_custo: z.number().nullable(),
  valor_icms_simula_custo: z.number().nullable(),
  modalidade_recolhimento_icms_simula_custo: ModalidadeRecolhimentoIcmsSimulaCustoSchema,
  usa_beneficio_simula_custo: z.boolean(),
  enviar_solicitacao_cotacao_frete_simula_custo: z.boolean(),
  taxas_origem: z.array(TaxaOrigemSimulaCustoSchema),
  taxas_destino: z.array(TaxaDestinoSimulaCustoSchema),
  documentos: z.array(DocumentoSimulaCustoSchema),
  prazos_pagamento: z.array(PrazoPagamentoSimulaCustoSchema).default([]),
})
export type SimulaCustoDetalhe = z.infer<typeof SimulaCustoDetalheSchema>

// ─── Respostas ────────────────────────────────────────────────────────────────
export const RespostaSimulaCustoSchema = z.object({ simula_custo: SimulaCustoSchema })
export const RespostaDetalheSimulaCustoSchema = z.object({ simula_custo: SimulaCustoDetalheSchema })

export const RespostaListaSimulasCustoSchema = z.object({
  simulas_custo: z.array(SimulaCustoSchema),
  paginacao: z.object({
    pagina: z.number(),
    limite: z.number(),
    total: z.number(),
    paginas: z.number(),
  }),
})
export type RespostaListaSimulasCusto = z.infer<typeof RespostaListaSimulasCustoSchema>

export const KpisSimulaCustoSchema = z.object({
  total: z.number(),
  em_criacao: z.number(),
  criadas: z.number(),
  arquivadas: z.number(),
  custo_nacionalizado_medio_brl: z.number(),
  total_tributos_acumulado_brl: z.number(),
})
export type KpisSimulaCusto = z.infer<typeof KpisSimulaCustoSchema>

export const KpisDashboardSimulaCustoSchema = z.object({
  fonte: z.enum(['db', 'cache']),
  kpis: z.object({
    total_simulas: z.number(),
    em_criacao: z.number(),
    criadas: z.number(),
    arquivadas: z.number(),
    custo_nacionalizado_medio_brl: z.number().nullable(),
    custo_nacionalizado_maior_brl: z.number().nullable(),
    custo_nacionalizado_menor_brl: z.number().nullable(),
    total_tributos_acumulado_brl: z.number().nullable(),
  }),
})
export type KpisDashboardSimulaCusto = z.infer<typeof KpisDashboardSimulaCustoSchema>['kpis']

export const RecentesSimulaCustoSchema = z.object({
  fonte: z.enum(['db', 'cache']),
  recentes: z.array(z.object({
    id_simula_custo: z.string(),
    numero_simula_custo: z.string(),
    ncm_simula_custo: z.string(),
    status_simula_custo: StatusSimulaCustoSchema,
    valor_produto_simula_custo: z.number().nullable(),
    moeda_produto_simula_custo: z.string(),
    custo_nacionalizado_brl_simula_custo: z.number().nullable(),
    data_criacao_simula_custo: z.string(),
  })),
})
export type SimulaCustoRecente = z.infer<typeof RecentesSimulaCustoSchema>['recentes'][number]

export const NcmsRecentesSimulaCustoSchema = z.object({
  ncms: z.array(z.object({
    codigo: z.string(),
    descricao: z.string().optional(),
  })),
})
export type NcmRecenteServidorSimulaCusto = z.infer<typeof NcmsRecentesSimulaCustoSchema>['ncms'][number]

export const ConfigStatusSimulaCustoSchema = z.object({
  status_simula_custo: z.array(z.object({
    nome_status_simula_custo: StatusSimulaCustoSchema,
    cor_status_simula_custo: z.string(),
    icone_status_simula_custo: z.string(),
    ordem_status_simula_custo: z.number(),
  })),
})
export type ConfigStatusSimulaCusto = z.infer<typeof ConfigStatusSimulaCustoSchema>['status_simula_custo'][number]

// ─── Simulação ────────────────────────────────────────────────────────────────
export const DetalhamentoTributoSchema = z.object({
  aliquota: z.number(),
  base_calculo: z.number(),
  valor: z.number(),
})

export const RespostaSimulacaoSimulaCustoSchema = z.object({
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
  fonte_calculo_simula_custo: z.string(),
  ptax_utilizada_simula_custo: z.number(),
})
export type ResultadoSimulacaoSimulaCusto = z.infer<typeof RespostaSimulacaoSimulaCustoSchema>

// ─── Master data ──────────────────────────────────────────────────────────────
export const BuscaNcmSimulaCustoSchema = z.object({
  itens: z.array(z.object({ codigo: z.string(), descricao: z.string() })),
  ultima_sync: z.string().nullable(),
  fuzzy: z.boolean(),
})

export const ValidarNcmSimulaCustoSchema = z.object({
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
export type ValidarNcmSimulaCusto = z.infer<typeof ValidarNcmSimulaCustoSchema>

export const UfsSimulaCustoSchema = z.array(z.object({
  uf: z.string(),
  nome: z.string(),
  icms: z.number(),
  base_legal: z.string().optional(),
}))
export type UfSimulaCusto = z.infer<typeof UfsSimulaCustoSchema>[number]

export const OpcoesIcmsSimulaCustoSchema = z.array(z.object({
  codigo: z.string(),
  uf: z.string().nullable(),
  nome: z.string(),
  icms: z.number(),
  tipo: z.enum(['UF', 'ESPECIAL']),
  base_legal: z.string(),
}))
export type OpcaoIcmsSimulaCusto = z.infer<typeof OpcoesIcmsSimulaCustoSchema>[number]

export const TipoTaxaOrigemDestinoSchema = z.enum(['ORIGEM', 'DESTINO', 'FRETE'])
export type TipoTaxaOrigemDestino = z.infer<typeof TipoTaxaOrigemDestinoSchema>

export const TaxaOrigemDestinoCadastroSchema = z.object({
  id_taxa_origem_destino: z.string(),
  nome_taxa_origem_destino: z.string(),
  tipo_taxa_origem_destino: z.string(),
  codigo_taxa_origem_destino: z.string().nullable().optional(),
  ativo_taxa_origem_destino: z.boolean(),
  legado_taxa_origem_destino: z.boolean().optional(),
})
export type TaxaOrigemDestinoCadastro = z.infer<typeof TaxaOrigemDestinoCadastroSchema>

export const ListaTaxasOrigemDestinoCadastroSchema = z.object({
  itens: z.array(TaxaOrigemDestinoCadastroSchema),
  total: z.number(),
})

// ─── Entrada (criação/edição) ────────────────────────────────────────────────
export interface TaxaEntradaSimulaCusto {
  id_taxa_origem_destino?: string | null
  nome: string
  moeda: string
  tipo_cobranca: TipoCobrancaSimulaCusto
  valor_minimo: number
  valor_total: number
}

export interface DocumentoEntradaSimulaCusto {
  tipo_documento_simula_custo: TipoDocumentoSimulaCusto
  numero_documento_simula_custo: string
}

export interface PrazoPagamentoEntradaSimulaCusto {
  valor_prazo_pagamento_simula_custo: number
  tipo_valor_prazo_pagamento_simula_custo: TipoValorPrazoPagamentoSimulaCusto
  momento_prazo_pagamento_simula_custo: MomentoPrazoPagamentoSimulaCusto
  dias_prazo_pagamento_simula_custo: number
  fato_gerador_prazo_pagamento_simula_custo: FatoGeradorPrazoPagamentoSimulaCusto
}

export interface EntradaSimulaCusto {
  referencia_simula_custo?: string
  numero_manual_simula_custo?: string
  tipo_operacao_simula_custo: TipoOperacaoSimulaCusto
  detalhe_operacao_simula_custo: DetalheOperacaoSimulaCusto
  ncm_simula_custo: string
  descricao_ncm_simula_custo?: string
  incoterm_simula_custo: string
  quantidade_simula_custo: number
  moeda_produto_simula_custo: string
  valor_produto_simula_custo: number
  moeda_frete_simula_custo: string
  valor_frete_simula_custo: number
  enviar_solicitacao_cotacao_frete_simula_custo?: boolean
  moeda_seguro_simula_custo: string
  valor_seguro_simula_custo: number
  uf_desembaraco_simula_custo: string
  aliquota_icms_simula_custo: number
  modalidade_recolhimento_icms_simula_custo: ModalidadeRecolhimentoIcmsSimulaCusto
  usa_beneficio_simula_custo?: boolean
  aliquota_ii_simula_custo: number
  aliquota_ipi_simula_custo: number
  aliquota_pis_simula_custo: number
  aliquota_cofins_simula_custo: number
  reducao_ii_simula_custo?: number
  reducao_icms_base_simula_custo?: number
  taxas_origem: TaxaEntradaSimulaCusto[]
  taxas_destino: TaxaEntradaSimulaCusto[]
  documentos: DocumentoEntradaSimulaCusto[]
  prazos_pagamento: PrazoPagamentoEntradaSimulaCusto[]
  /** Multi-itens (UI) — agregado nos campos legados antes de simular/salvar. */
  itens_produto_simula_custo?: ItemProdutoEntradaSimulaCusto[]
}

export interface ItemProdutoEntradaSimulaCusto {
  ncm_item_produto_simula_custo: string
  descricao_ncm_item_produto_simula_custo?: string
  moeda_item_produto_simula_custo: string
  valor_unitario_item_produto_simula_custo: number
  quantidade_item_produto_simula_custo: number
}

export interface EntradaSimulacaoSimulaCusto {
  ncm_simula_custo: string
  valor_produto_simula_custo: number
  moeda_produto_simula_custo: string
  ptax_venda?: number
  valor_frete_simula_custo: number
  moeda_frete_simula_custo: string
  valor_seguro_simula_custo: number
  moeda_seguro_simula_custo: string
  taxas_origem: Array<{ nome: string; valor: number; moeda: string }>
  taxas_destino: Array<{ nome: string; valor: number; moeda: string }>
  uf_desembaraco_simula_custo: string
  aliquota_ii_simula_custo: number
  aliquota_ipi_simula_custo: number
  aliquota_pis_simula_custo: number
  aliquota_cofins_simula_custo: number
  aliquota_icms_simula_custo: number
  aliquota_icms_interna_uf_simula_custo?: number
  modalidade_recolhimento_icms_simula_custo?: ModalidadeRecolhimentoIcmsSimulaCusto
  reducao_ii_simula_custo?: number
}
