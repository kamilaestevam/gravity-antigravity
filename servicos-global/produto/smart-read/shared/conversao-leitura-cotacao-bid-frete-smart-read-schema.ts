/**
 * Contrato bilateral Smart Read → BID Frete Internacional (prefill cotação).
 */
import { z } from 'zod'

export const StatusMapeamentoCampoSmartReadCotacaoBidFreteEnum = z.enum([
  'mapeado',
  'sugerido',
  'pendente',
  'rejeitado',
  'ignorado',
])
export type StatusMapeamentoCampoSmartReadCotacaoBidFrete = z.infer<
  typeof StatusMapeamentoCampoSmartReadCotacaoBidFreteEnum
>

export const DetalheMapeamentoCampoSmartReadCotacaoBidFreteSchema = z.object({
  caminho_origem: z.string(),
  campo_destino: z.string().nullable(),
  valor_origem: z.unknown(),
  valor_destino: z.unknown(),
  status_mapeamento: StatusMapeamentoCampoSmartReadCotacaoBidFreteEnum,
  motivo: z.string().nullable().optional(),
})
export type DetalheMapeamentoCampoSmartReadCotacaoBidFrete = z.infer<
  typeof DetalheMapeamentoCampoSmartReadCotacaoBidFreteSchema
>

export const DetalheMapeamentoSmartReadCotacaoBidFreteSchema = z.object({
  campos: z.array(DetalheMapeamentoCampoSmartReadCotacaoBidFreteSchema),
  versao_contrato: z.literal(1),
})
export type DetalheMapeamentoSmartReadCotacaoBidFrete = z.infer<
  typeof DetalheMapeamentoSmartReadCotacaoBidFreteSchema
>

const modalFreteEnum = z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO'])
const modalidadeEnum = z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL'])
const tipoOperacaoEnum = z.enum(['IMPORTACAO', 'EXPORTACAO'])

export const PrefillFormularioCotacaoBidFreteSmartReadSchema = z.object({
  referencia_interna_cotacao_bid_frete_internacional: z.string().optional(),
  tipo_operacao_cotacao_bid_frete_internacional: tipoOperacaoEnum.optional(),
  modal_cotacao_bid_frete_internacional: modalFreteEnum.optional(),
  modalidade_cotacao_bid_frete_internacional: modalidadeEnum.optional(),
  porto_origem_cotacao_bid_frete_internacional: z.string().optional(),
  porto_destino_cotacao_bid_frete_internacional: z.string().optional(),
  aeroporto_origem_cotacao_bid_frete_internacional: z.string().optional(),
  aeroporto_destino_cotacao_bid_frete_internacional: z.string().optional(),
  origem_pais_cotacao_bid_frete_internacional: z.string().optional(),
  destino_pais_cotacao_bid_frete_internacional: z.string().optional(),
  exibir_campos_extras_origem_cotacao: z.boolean().optional(),
  exibir_campos_extras_destino_cotacao: z.boolean().optional(),
  estado_provincia_origem_cotacao_bid_frete_internacional: z.string().optional(),
  estado_provincia_destino_cotacao_bid_frete_internacional: z.string().optional(),
  endereco_origem_cotacao_bid_frete_internacional: z.string().optional(),
  endereco_destino_cotacao_bid_frete_internacional: z.string().optional(),
  pais_origem_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  pais_destino_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  cidade_origem_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  cidade_destino_rodoviario_cotacao_bid_frete_internacional: z.string().optional(),
  eh_carga_perigosa_cotacao_bid_frete_internacional: z.boolean().optional(),
  descricao_mercadoria_cotacao_bid_frete_internacional: z.string().optional(),
  ncm_cotacao_bid_frete_internacional: z.string().optional(),
  hs_code_cotacao_bid_frete_internacional: z.string().optional(),
  quantidade_volume_cotacao_bid_frete_internacional: z.number().int().positive().optional(),
  tipo_container_cotacao_bid_frete_internacional: z.string().optional(),
  peso_kg_cotacao_bid_frete_internacional: z.string().optional(),
  cubagem_m3_cotacao_bid_frete_internacional: z.string().optional(),
  incoterm_cotacao_bid_frete_internacional: z.string().optional(),
  opcao_incluir_armazenagem_cotacao: z.enum(['sim', 'nao', '']).optional(),
})
export type PrefillFormularioCotacaoBidFreteSmartRead = z.infer<
  typeof PrefillFormularioCotacaoBidFreteSmartReadSchema
>

const passoInicialPrefillSmartReadEnum = z.enum([
  'modal',
  'origem',
  'carga',
  'armazenagem',
  'fornecedores',
])

export const PacotePrefillCotacaoBidFreteSmartReadSchema = z.object({
  id_leitura: z.string().min(1),
  id_bid_bid_frete_internacional: z.string().optional(),
  prefill: PrefillFormularioCotacaoBidFreteSmartReadSchema,
  detalhe_mapeamento: DetalheMapeamentoSmartReadCotacaoBidFreteSchema,
  passo_inicial_tipo: passoInicialPrefillSmartReadEnum.optional(),
  iniciar_no_passo_fornecedores: z.boolean(),
  /** ISO-8601; aceita string para não perder handoff se o runtime variar no datetime() estrito. */
  criado_em: z.string().min(1),
})
export type PassoInicialPrefillSmartReadCotacaoBidFrete = z.infer<typeof passoInicialPrefillSmartReadEnum>
export type PacotePrefillCotacaoBidFreteSmartRead = z.infer<
  typeof PacotePrefillCotacaoBidFreteSmartReadSchema
>

export const CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ =
  'gravity:prefill-cotacao-bid-frete-smart-read'
