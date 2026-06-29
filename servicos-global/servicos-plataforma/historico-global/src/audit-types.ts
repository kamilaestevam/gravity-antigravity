/**
 * Tipos compartilhados do pipeline de auditoria (audit-client, persist-audit-event, plugin).
 */

export type TipoAtorHistoricoLog = 'USUARIO' | 'API' | 'IA' | 'JOB' | 'INTEGRACAO'
export type StatusHistoricoLog = 'SUCESSO' | 'FALHA' | 'PARCIAL'

export interface AuditLogPayload {
  id_organizacao: string

  tipo_ator_historico_log: TipoAtorHistoricoLog
  id_ator_historico_log: string
  nome_ator_historico_log: string
  ip_ator_historico_log?: string
  metadata_ator_historico_log?: Record<string, unknown>

  modulo_historico_log: string
  tipo_recurso_historico_log: string
  id_recurso_historico_log?: string

  acao_historico_log: string
  detalhe_acao_historico_log: string

  estado_anterior_historico_log?: unknown
  estado_posterior_historico_log?: unknown

  status_historico_log?: StatusHistoricoLog
  mensagem_erro_historico_log?: string

  id_produto_historico_log?: string
  id_usuario?: string
}
