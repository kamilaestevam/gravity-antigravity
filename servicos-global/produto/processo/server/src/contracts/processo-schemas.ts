/**
 * Contratos Zod — Processo (bilateral front/back)
 * Skill: Mandamento 06 + 09
 */
import { z } from 'zod'

export const tipoOperacaoProcessoSchema = z.enum(['importacao', 'exportacao'])

export const processoSchema = z.object({
  id_processo: z.string(),
  id_organizacao: z.string(),
  id_workspace: z.string(),
  id_produto_gravity: z.string().nullable(),
  id_usuario: z.string().nullable(),
  numero_processo: z.string(),
  tipo_operacao_processo: tipoOperacaoProcessoSchema,
  referencia_interna_processo: z.string().nullable(),
  referencia_importador_processo: z.string().nullable(),
  referencia_exportador_processo: z.string().nullable(),
  id_status_atual_processo: z.string().nullable(),
  id_importacao_exportador_processo: z.string().nullable(),
  id_exportacao_importador_processo: z.string().nullable(),
  id_cotacao_bid_frete_internacional: z.string().nullable(),
  id_proposta_bid_frete_internacional: z.string().nullable(),
  id_transito_processo: z.string().nullable(),
  id_operacao_cambio_processo: z.string().nullable(),
  id_responsavel_processo: z.string().nullable(),
  responsavel_rotina_processo: z.string().nullable(),
  setor_responsavel_processo: z.string().nullable(),
  vendedor_responsavel_processo: z.string().nullable(),
  data_criacao_processo: z.coerce.date(),
  data_atualizacao_processo: z.coerce.date(),
})

export const createProcessoBodySchema = z.object({
  id_workspace: z.string().min(1),
  numero_processo: z.string().min(1).optional(),
  tipo_operacao_processo: tipoOperacaoProcessoSchema,
  referencia_interna_processo: z.string().optional(),
  referencia_importador_processo: z.string().optional(),
  referencia_exportador_processo: z.string().optional(),
  id_status_atual_processo: z.string().optional(),
  id_importacao_exportador_processo: z.string().optional(),
  id_exportacao_importador_processo: z.string().optional(),
  id_cotacao_bid_frete_internacional: z.string().optional(),
  id_proposta_bid_frete_internacional: z.string().optional(),
  id_responsavel_processo: z.string().optional(),
  responsavel_rotina_processo: z.string().optional(),
  setor_responsavel_processo: z.string().optional(),
  vendedor_responsavel_processo: z.string().optional(),
})

export const updateProcessoBodySchema = createProcessoBodySchema
  .omit({ id_workspace: true })
  .partial()
  .extend({
    id_transito_processo: z.string().nullable().optional(),
    id_operacao_cambio_processo: z.string().nullable().optional(),
  })

export const processoListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(processoSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export const processoDetailResponseSchema = z.object({
  success: z.literal(true),
  data: processoSchema.extend({
    logistica: z.record(z.unknown()).nullable().optional(),
    dados: z.record(z.unknown()).nullable().optional(),
    cambio: z.record(z.unknown()).nullable().optional(),
    estimativa: z.record(z.unknown()).nullable().optional(),
    status_atual: z.record(z.unknown()).nullable().optional(),
    documentos: z.array(z.record(z.unknown())).optional(),
    follow_ups: z.array(z.record(z.unknown())).optional(),
    containers: z.array(z.record(z.unknown())).optional(),
  }),
})

export const processoStatusSchema = z.object({
  id_processo_status: z.string(),
  id_organizacao: z.string(),
  tipo_status_processo: z.string(),
  rotulo_status_processo: z.string(),
  cor_status_processo: z.string(),
  ordem_status_processo: z.number(),
  eh_padrao_status_processo: z.boolean(),
  eh_sistema_status_processo: z.boolean(),
})

export const createProcessoStatusBodySchema = z.object({
  tipo_status_processo: z.string().min(1),
  rotulo_status_processo: z.string().min(1),
  cor_status_processo: z.string().optional(),
  ordem_status_processo: z.number().int().optional(),
  regras_status_processo: z.record(z.unknown()).optional(),
  eh_padrao_status_processo: z.boolean().optional(),
})

export const mudarStatusProcessoBodySchema = z.object({
  id_status_novo_processo: z.string().min(1),
  observacao_mudanca_status_processo: z.string().optional(),
})

export const createFollowUpBodySchema = z.object({
  id_processo: z.string().min(1),
  titulo_follow_up_processo: z.string().min(1),
  descricao_follow_up_processo: z.string().optional(),
  tipo_follow_up_processo: z.enum(['info', 'desvio', 'atualizacao', 'documento']).optional(),
  categoria_follow_up_processo: z
    .enum(['exportador', 'logistica', 'despachante', 'financeiro', 'sistema'])
    .optional(),
  nome_usuario_registro_follow_up_processo: z.string().optional(),
})

export const createDocumentoBodySchema = z.object({
  id_processo: z.string().min(1),
  nome_documento_processo: z.string().min(1),
  tipo_arquivo_documento_processo: z.enum(['pdf', 'xlsx', 'xml', 'img']),
  tamanho_bytes_documento_processo: z.number().int().nonnegative().optional(),
  url_documento_processo: z.string().url(),
  categoria_documento_processo: z.enum(['bl', 'po', 'di', 'li', 'nfe', 'outro']).optional(),
})

export type ProcessoDTO = z.infer<typeof processoSchema>
