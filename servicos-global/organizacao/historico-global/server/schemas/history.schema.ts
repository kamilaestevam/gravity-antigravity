import { z } from 'zod'

export const TipoAtorHistoricoLogEnum = z.enum(['USUARIO', 'API', 'IA', 'JOB', 'INTEGRACAO'])
export const StatusHistoricoLogEnum = z.enum(['SUCESSO', 'FALHA', 'PARCIAL'])

export const IngestHistorySchema = z.object({
  tipo_ator_historico_log: TipoAtorHistoricoLogEnum,
  id_ator_historico_log: z.string().min(1),
  nome_ator_historico_log: z.string().min(1),
  ip_ator_historico_log: z.string().optional(),
  metadata_ator_historico_log: z.record(z.unknown()).optional(),

  modulo_historico_log: z.string().min(1),
  tipo_recurso_historico_log: z.string().min(1),
  id_recurso_historico_log: z.string().optional(),

  acao_historico_log: z.string().min(1),
  detalhe_acao_historico_log: z.string().min(1),

  estado_anterior_historico_log: z.unknown().optional(),
  estado_posterior_historico_log: z.unknown().optional(),

  status_historico_log: StatusHistoricoLogEnum.optional(),
  mensagem_erro_historico_log: z.string().optional(),

  id_produto_historico_log: z.string().optional(),
  id_usuario: z.string().optional(),
})

export const ListHistoryQuerySchema = z.object({
  // Visibilidade — preenchido pelo middleware, nunca pelo cliente
  id_organizacao: z.string().optional(),
  id_usuario_filter: z.string().optional(),

  // Filtros
  tipo_ator_historico_log: TipoAtorHistoricoLogEnum.optional(),
  id_ator_historico_log: z.string().optional(),
  modulo_historico_log: z.string().optional(),
  tipo_recurso_historico_log: z.string().optional(),
  id_recurso_historico_log: z.string().optional(),
  acao_historico_log: z.string().optional(),
  status_historico_log: StatusHistoricoLogEnum.optional(),
  id_produto_historico_log: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),

  // Paginação cursor-based
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export const ExportHistoryQuerySchema = z.object({
  id_organizacao: z.string().optional(),
  id_usuario_filter: z.string().optional(),
  tipo_ator_historico_log: TipoAtorHistoricoLogEnum.optional(),
  modulo_historico_log: z.string().optional(),
  acao_historico_log: z.string().optional(),
  status_historico_log: StatusHistoricoLogEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  formato_exportar_resultado: z.enum(['csv', 'json']).default('csv'),
})

export const AlertRuleSchema = z.object({
  nome_regra_alerta: z.string().min(1),
  descricao_regra_alerta: z.string().optional(),
  habilitada_regra_alerta: z.boolean().default(true),

  tipo_ator_regra_alerta: TipoAtorHistoricoLogEnum.optional(),
  acao_regra_alerta: z.string().optional(),
  modulo_regra_alerta: z.string().optional(),

  limiar_contagem_regra_alerta: z.number().int().positive().optional(),
  limiar_janela_segundos_regra_alerta: z.number().int().positive().optional(),

  canal_inapp_regra_alerta: z.boolean().default(true),
  canal_email_regra_alerta: z.boolean().default(false),
  canal_whatsapp_regra_alerta: z.boolean().default(false),

  destinatarios_email_regra_alerta: z.array(z.string().email()).default([]),
  destinatarios_whatsapp_regra_alerta: z.array(z.string()).default([]),
  destinatarios_usuarios_regra_alerta: z.array(z.string()).default([]),
})

export const AlertEventUpdateSchema = z.object({
  status_evento_alerta: z.enum(['REVISADO', 'ESCALADO']),
  notas_evento_alerta: z.string().optional(),
})
