/**
 * Contrato Zod — resposta de fornecedor BID Frete Internacional (GET /fornecedores).
 * Mandamento 06/09 — flags Cadastros opcionais (espelho sync vs fallback Prisma).
 */
import { z } from 'zod'

export const flagsParceiroFreteCadastrosFornecedorSchema = z.object({
  pode_ser_agente_fornecedor: z.boolean().optional(),
  pode_ser_armador_fornecedor: z.boolean().optional(),
  pode_ser_cia_aerea_fornecedor: z.boolean().optional(),
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: z.boolean().optional(),
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: z.boolean().optional(),
})

export const fornecedorBidFreteInternacionalResponseSchema = z
  .object({
    id_fornecedor_bid_frete_internacional: z.string(),
    id_organizacao: z.string(),
    nome_fornecedor_bid_frete_internacional: z.string(),
    nome_fantasia_fornecedor_bid_frete_internacional: z.string().nullable(),
    tipo_fornecedor_bid_frete_internacional: z.enum(['AGENTE_CARGA', 'ARMADOR', 'CIA_AEREA', 'TRANSPORTADORA']),
    status_fornecedor_bid_frete_internacional: z.enum(['ATIVO', 'INATIVO', 'PENDENTE_APROVACAO', 'BLOQUEADO']),
    cnpj_fornecedor_bid_frete_internacional: z.string().nullable(),
    email_fornecedor_bid_frete_internacional: z.string(),
    telefone_fornecedor_bid_frete_internacional: z.string().nullable(),
    whatsapp_fornecedor_bid_frete_internacional: z.string().nullable(),
    website_fornecedor_bid_frete_internacional: z.string().nullable(),
    pais_fornecedor_bid_frete_internacional: z.string().nullable(),
    cidade_fornecedor_bid_frete_internacional: z.string().nullable(),
    aceita_cotacao_aberta_fornecedor_bid_frete_internacional: z.boolean(),
    cotacao_automatica_fornecedor_bid_frete_internacional: z.boolean(),
    data_criacao_fornecedor_bid_frete_internacional: z.string(),
    data_atualizacao_fornecedor_bid_frete_internacional: z.string(),
    nota_global_classificacao_bid_frete_internacional: z.number().nullable().optional(),
    total_cotacoes: z.number().optional(),
    taxa_resposta: z.number().nullable().optional(),
    taxa_aprovacao: z.number().nullable().optional(),
    tempo_medio_resposta: z.number().nullable().optional(),
  })
  .merge(flagsParceiroFreteCadastrosFornecedorSchema)

export const fornecedoresListResponseSchema = z.object({
  fornecedores: z.array(fornecedorBidFreteInternacionalResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
})

export const fornecedorDetalheResponseSchema = z.object({
  fornecedor: fornecedorBidFreteInternacionalResponseSchema,
})

export type FornecedorBidFreteInternacionalResponse = z.infer<typeof fornecedorBidFreteInternacionalResponseSchema>
