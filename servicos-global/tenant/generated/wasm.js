
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AtividadesDadosScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  user_id: 'user_id',
  titulo: 'titulo',
  descricao: 'descricao',
  tipo: 'tipo',
  status: 'status',
  prioridade: 'prioridade',
  data_atividade: 'data_atividade',
  data_vencimento: 'data_vencimento',
  tempo_gasto_minutos: 'tempo_gasto_minutos',
  proximo_passo_titulo: 'proximo_passo_titulo',
  proximo_passo_data: 'proximo_passo_data',
  lembrete_em: 'lembrete_em',
  lembrete_email: 'lembrete_email',
  lembrete_whatsapp: 'lembrete_whatsapp',
  notificar_ao_atribuir: 'notificar_ao_atribuir',
  processo_id: 'processo_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AtividadesParticipantesScalarFieldEnum = {
  id: 'id',
  atividade_id: 'atividade_id',
  user_id: 'user_id',
  user_nome: 'user_nome'
};

exports.Prisma.AtividadesTempoScalarFieldEnum = {
  id: 'id',
  atividade_id: 'atividade_id',
  iniciado_em: 'iniciado_em',
  duracao_min: 'duracao_min',
  assunto: 'assunto'
};

exports.Prisma.AtividadesCronometroScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  activity_id: 'activity_id',
  started_at: 'started_at',
  ended_at: 'ended_at',
  duration_minutes: 'duration_minutes',
  is_manual: 'is_manual',
  subject: 'subject',
  linked_type: 'linked_type',
  linked_id: 'linked_id',
  linked_label: 'linked_label',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AtividadesTimerScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  user_id: 'user_id',
  activity_id: 'activity_id',
  started_at: 'started_at',
  paused_at: 'paused_at',
  accumulated_seconds: 'accumulated_seconds',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.TempoCriacaoRelatorioScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  user_id: 'user_id',
  product_id: 'product_id',
  periodo_inicio: 'periodo_inicio',
  periodo_fim: 'periodo_fim',
  total_minutos: 'total_minutos',
  payload: 'payload',
  computed_at: 'computed_at',
  expires_at: 'expires_at'
};

exports.Prisma.EmailAssuntosParticipantesScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  subject: 'subject',
  status: 'status',
  sentiment: 'sentiment',
  sentiment_label: 'sentiment_label',
  mensagens_count: 'mensagens_count',
  ultimo_contato: 'ultimo_contato',
  deep_link: 'deep_link',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.EmailMensagemScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  thread_id: 'thread_id',
  resend_id: 'resend_id',
  direction: 'direction',
  from: 'from',
  to: 'to',
  subject: 'subject',
  body: 'body',
  body_html: 'body_html',
  dedup_key: 'dedup_key',
  parent_message_id: 'parent_message_id',
  gabi_response: 'gabi_response',
  gabi_confidence: 'gabi_confidence',
  gabi_action: 'gabi_action',
  sent_at: 'sent_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.EmailRegistroEnvioScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  to: 'to',
  from: 'from',
  reply_to: 'reply_to',
  subject: 'subject',
  template_id: 'template_id',
  status: 'status',
  resend_id: 'resend_id',
  dedup_key: 'dedup_key',
  tentativas: 'tentativas',
  max_tentativas: 'max_tentativas',
  next_retry_at: 'next_retry_at',
  error_message: 'error_message',
  enviado_at: 'enviado_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.TemplateEmailScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  nome: 'nome',
  slug: 'slug',
  assunto: 'assunto',
  corpo_html: 'corpo_html',
  corpo_texto: 'corpo_texto',
  variaveis: 'variaveis',
  ativo: 'ativo',
  descricao: 'descricao',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.EmailFilaEnvioScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  status: 'status',
  prioridade: 'prioridade',
  payload: 'payload',
  template_id: 'template_id',
  email_enviado_id: 'email_enviado_id',
  tentativas: 'tentativas',
  max_tentativas: 'max_tentativas',
  next_retry_at: 'next_retry_at',
  processado_at: 'processado_at',
  erro: 'erro',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.WhatsappConversaScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  wa_phone_number: 'wa_phone_number',
  status: 'status',
  contact_id: 'contact_id',
  company_id: 'company_id',
  contact_nome: 'contact_nome',
  company_nome: 'company_nome',
  activity_id: 'activity_id',
  ai_enabled: 'ai_enabled',
  opened_at: 'opened_at',
  closed_at: 'closed_at',
  gabi_temperatura: 'gabi_temperatura',
  gabi_temperatura_score: 'gabi_temperatura_score',
  gabi_resumo: 'gabi_resumo',
  gabi_acoes_sugeridas: 'gabi_acoes_sugeridas',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.WhatsappMensagemScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  conversation_id: 'conversation_id',
  wa_message_id: 'wa_message_id',
  direction: 'direction',
  content_type: 'content_type',
  content: 'content',
  origin: 'origin',
  sent_by: 'sent_by',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.WhatsappLogScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  conversation_id: 'conversation_id',
  company_id: 'company_id',
  conversation_category: 'conversation_category',
  origin: 'origin',
  cost_usd: 'cost_usd',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.WhatsappRegraScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  name: 'name',
  trigger: 'trigger',
  conditions: 'conditions',
  template_id: 'template_id',
  recipient: 'recipient',
  active: 'active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.DashboardConfiguracaoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  name: 'name',
  mode: 'mode',
  layout: 'layout',
  filters: 'filters',
  is_default: 'is_default',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.DashboardCriarScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  dashboard_id: 'dashboard_id',
  widget_key: 'widget_key',
  widget_type: 'widget_type',
  chart_type: 'chart_type',
  title: 'title',
  query_spec: 'query_spec',
  position: 'position',
  config: 'config',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.DashboardMetricasScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  metric_key: 'metric_key',
  dimensions: 'dimensions',
  value: 'value',
  period_from: 'period_from',
  period_to: 'period_to',
  captured_at: 'captured_at'
};

exports.Prisma.DashboardAlertasScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  dashboard_id: 'dashboard_id',
  widget_id: 'widget_id',
  metric_key: 'metric_key',
  condition: 'condition',
  threshold: 'threshold',
  channels: 'channels',
  is_active: 'is_active',
  last_triggered: 'last_triggered',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.DashboardCompartilharScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  dashboard_id: 'dashboard_id',
  share_token: 'share_token',
  channel: 'channel',
  recipient_email: 'recipient_email',
  recipient_phone: 'recipient_phone',
  snapshot_data: 'snapshot_data',
  expires_at: 'expires_at',
  created_at: 'created_at'
};

exports.Prisma.RelatoriosSalvosScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  nome: 'nome',
  tabelas: 'tabelas',
  colunas: 'colunas',
  filtros: 'filtros',
  join_type: 'join_type',
  is_shared: 'is_shared',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.RelatoriosConfiguracaoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  relatorio_id: 'relatorio_id',
  frequencia: 'frequencia',
  canais: 'canais',
  formato: 'formato',
  ativo: 'ativo',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ExportarJobScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  relatorio_id: 'relatorio_id',
  status: 'status',
  formato: 'formato',
  url_arquivo: 'url_arquivo',
  erro: 'erro',
  started_at: 'started_at',
  completed_at: 'completed_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.HistoricoLogScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  actor_type: 'actor_type',
  actor_id: 'actor_id',
  actor_name: 'actor_name',
  actor_ip: 'actor_ip',
  actor_metadata: 'actor_metadata',
  module: 'module',
  resource_type: 'resource_type',
  resource_id: 'resource_id',
  action: 'action',
  action_detail: 'action_detail',
  before: 'before',
  after: 'after',
  status: 'status',
  error_message: 'error_message',
  integrity_hash: 'integrity_hash',
  product_id: 'product_id',
  user_id: 'user_id',
  created_at: 'created_at'
};

exports.Prisma.AlertRuleScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  name: 'name',
  description: 'description',
  enabled: 'enabled',
  actor_type: 'actor_type',
  action: 'action',
  module: 'module',
  status_filter: 'status_filter',
  threshold_count: 'threshold_count',
  threshold_window_seconds: 'threshold_window_seconds',
  channel_inapp: 'channel_inapp',
  channel_email: 'channel_email',
  channel_whatsapp: 'channel_whatsapp',
  recipients_email: 'recipients_email',
  recipients_whatsapp: 'recipients_whatsapp',
  recipients_user_ids: 'recipients_user_ids',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AlertEventScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  rule_id: 'rule_id',
  actor_type: 'actor_type',
  actor_id: 'actor_id',
  actor_name: 'actor_name',
  module: 'module',
  action: 'action',
  event_count: 'event_count',
  window_seconds: 'window_seconds',
  audit_log_ids: 'audit_log_ids',
  status: 'status',
  reviewed_by: 'reviewed_by',
  reviewed_at: 'reviewed_at',
  notes: 'notes',
  created_at: 'created_at'
};

exports.Prisma.AlertNotificationLogScalarFieldEnum = {
  id: 'id',
  alert_event_id: 'alert_event_id',
  channel: 'channel',
  recipient: 'recipient',
  status: 'status',
  attempts: 'attempts',
  error_message: 'error_message',
  sent_at: 'sent_at',
  created_at: 'created_at'
};

exports.Prisma.ExportarResultadoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  format: 'format',
  content: 'content',
  status: 'status',
  record_count: 'record_count',
  filters: 'filters',
  error: 'error',
  created_at: 'created_at',
  expires_at: 'expires_at'
};

exports.Prisma.AgendaScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  nome: 'nome',
  descricao: 'descricao',
  tipo: 'tipo',
  criadoEm: 'criadoEm',
  atualizadoEm: 'atualizadoEm'
};

exports.Prisma.SlotScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  agenda_id: 'agenda_id',
  inicio: 'inicio',
  fim: 'fim',
  capacidade: 'capacidade',
  criadoEm: 'criadoEm',
  atualizadoEm: 'atualizadoEm'
};

exports.Prisma.ReservaScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  slot_id: 'slot_id',
  usuario_id: 'usuario_id',
  nome: 'nome',
  email: 'email',
  status: 'status',
  criadoEm: 'criadoEm',
  atualizadoEm: 'atualizadoEm'
};

exports.Prisma.DisponibilidadeConfigScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  agenda_id: 'agenda_id',
  horarioInicio: 'horarioInicio',
  horarioFim: 'horarioFim',
  duracaoSlot: 'duracaoSlot',
  intervalo: 'intervalo',
  diasSemana: 'diasSemana',
  criadoEm: 'criadoEm',
  atualizadoEm: 'atualizadoEm'
};

exports.Prisma.ConversaCompletaGabiScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  title: 'title',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MensagemIndividualGabiaiScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  conversation_id: 'conversation_id',
  role: 'role',
  content: 'content',
  attachments: 'attachments',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.GabiaLogUsoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  action_taken: 'action_taken',
  conversation_snapshot: 'conversation_snapshot',
  actor_type: 'actor_type',
  triggered_by: 'triggered_by',
  model_used: 'model_used',
  tokens_input: 'tokens_input',
  tokens_output: 'tokens_output',
  cost_usd: 'cost_usd',
  created_at: 'created_at'
};

exports.Prisma.GabiaTokenConsumidosScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  campo: 'campo',
  tokens_input: 'tokens_input',
  tokens_output: 'tokens_output',
  tokens_total: 'tokens_total',
  mes_ref: 'mes_ref',
  created_at: 'created_at'
};

exports.Prisma.GabiaTokenWorkspaceScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  quota_mensal: 'quota_mensal',
  mes_ref: 'mes_ref',
  tokens_usados: 'tokens_usados',
  updated_at: 'updated_at'
};

exports.Prisma.PersonalizacaoOrganizacaoGabiaiScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  system_prompt: 'system_prompt',
  tom_voz: 'tom_voz',
  limitacoes: 'limitacoes',
  instrucoes_extras: 'instrucoes_extras',
  ativo: 'ativo',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UserPreferencesScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  tenant_id: 'tenant_id',
  tooltips_disabled: 'tooltips_disabled',
  theme: 'theme',
  sidebar_open: 'sidebar_open',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.NcmItemScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  codigo: 'codigo',
  descricao: 'descricao',
  ativo: 'ativo',
  data_inicio: 'data_inicio',
  data_fim: 'data_fim',
  sync_id: 'sync_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.NcmSyncLogScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  iniciado_em: 'iniciado_em',
  concluido_em: 'concluido_em',
  status: 'status',
  total: 'total',
  adicionados: 'adicionados',
  alterados: 'alterados',
  removidos: 'removidos',
  origem: 'origem',
  disparado_por: 'disparado_por',
  erro_msg: 'erro_msg',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.NcmScheduleConfigScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  ativo: 'ativo',
  cron_expressao: 'cron_expressao',
  notificadores: 'notificadores',
  criado_em: 'criado_em',
  atualizado_em: 'atualizado_em'
};

exports.Prisma.NotificacoesTituloCorpoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  type: 'type',
  title: 'title',
  message: 'message',
  read: 'read',
  target_entity: 'target_entity',
  target_id: 'target_id',
  delivery_status: 'delivery_status',
  external_id: 'external_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ExternalContactScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  created_by: 'created_by',
  name: 'name',
  email: 'email',
  whatsapp_phone: 'whatsapp_phone',
  whatsapp_opt_in_at: 'whatsapp_opt_in_at',
  notes: 'notes',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.TenantChannelConfigScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  email_enabled: 'email_enabled',
  whatsapp_enabled: 'whatsapp_enabled',
  updated_by: 'updated_by',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.EmailThreadStatus = exports.$Enums.EmailThreadStatus = {
  ABERTA: 'ABERTA',
  ARQUIVADA: 'ARQUIVADA',
  RESOLVIDA: 'RESOLVIDA'
};

exports.EmailSentimento = exports.$Enums.EmailSentimento = {
  MUITO_POSITIVO: 'MUITO_POSITIVO',
  POSITIVO: 'POSITIVO',
  NEUTRO: 'NEUTRO',
  NEGATIVO: 'NEGATIVO',
  MUITO_NEGATIVO: 'MUITO_NEGATIVO'
};

exports.EmailDirecao = exports.$Enums.EmailDirecao = {
  RECEBIDO: 'RECEBIDO',
  ENVIADO: 'ENVIADO'
};

exports.EmailStatus = exports.$Enums.EmailStatus = {
  PENDENTE: 'PENDENTE',
  PROCESSANDO: 'PROCESSANDO',
  ENVIADO: 'ENVIADO',
  FALHOU: 'FALHOU',
  CANCELADO: 'CANCELADO'
};

exports.EmailFilaPrioridade = exports.$Enums.EmailFilaPrioridade = {
  BAIXA: 'BAIXA',
  NORMAL: 'NORMAL',
  ALTA: 'ALTA',
  URGENTE: 'URGENTE'
};

exports.DashboardModo = exports.$Enums.DashboardModo = {
  PRODUTO: 'PRODUTO',
  GERAL: 'GERAL'
};

exports.DashboardTipo = exports.$Enums.DashboardTipo = {
  CATALOGO: 'CATALOGO',
  CUSTOMIZADO: 'CUSTOMIZADO',
  GABI: 'GABI'
};

exports.GraficoTipo = exports.$Enums.GraficoTipo = {
  KPI_CARD: 'KPI_CARD',
  LINHA: 'LINHA',
  BARRA: 'BARRA',
  BARRA_HORIZONTAL: 'BARRA_HORIZONTAL',
  ROSCA: 'ROSCA',
  HISTOGRAMA: 'HISTOGRAMA',
  FUNIL: 'FUNIL',
  MEDIDOR: 'MEDIDOR',
  MAPA: 'MAPA',
  TABELA: 'TABELA',
  AREA: 'AREA'
};

exports.AcaoExecutadaPor = exports.$Enums.AcaoExecutadaPor = {
  USUARIO: 'USUARIO',
  API: 'API',
  IA: 'IA',
  JOB: 'JOB',
  INTEGRACAO: 'INTEGRACAO'
};

exports.EventoStatus = exports.$Enums.EventoStatus = {
  SUCESSO: 'SUCESSO',
  FALHA: 'FALHA',
  PARCIAL: 'PARCIAL'
};

exports.AlertaStatus = exports.$Enums.AlertaStatus = {
  PENDENTE: 'PENDENTE',
  REVISADO: 'REVISADO',
  ESCALADO: 'ESCALADO'
};

exports.NCMStatusSincronizacao = exports.$Enums.NCMStatusSincronizacao = {
  EXECUTANDO: 'EXECUTANDO',
  SUCESSO: 'SUCESSO',
  ERRO: 'ERRO'
};

exports.NCMOrigemSincronizacao = exports.$Enums.NCMOrigemSincronizacao = {
  JOB: 'JOB',
  MANUAL: 'MANUAL'
};

exports.Prisma.ModelName = {
  AtividadesDados: 'AtividadesDados',
  AtividadesParticipantes: 'AtividadesParticipantes',
  AtividadesTempo: 'AtividadesTempo',
  AtividadesCronometro: 'AtividadesCronometro',
  AtividadesTimer: 'AtividadesTimer',
  TempoCriacaoRelatorio: 'TempoCriacaoRelatorio',
  EmailAssuntosParticipantes: 'EmailAssuntosParticipantes',
  EmailMensagem: 'EmailMensagem',
  EmailRegistroEnvio: 'EmailRegistroEnvio',
  TemplateEmail: 'TemplateEmail',
  EmailFilaEnvio: 'EmailFilaEnvio',
  WhatsappConversa: 'WhatsappConversa',
  WhatsappMensagem: 'WhatsappMensagem',
  WhatsappLog: 'WhatsappLog',
  WhatsappRegra: 'WhatsappRegra',
  DashboardConfiguracao: 'DashboardConfiguracao',
  DashboardCriar: 'DashboardCriar',
  DashboardMetricas: 'DashboardMetricas',
  DashboardAlertas: 'DashboardAlertas',
  DashboardCompartilhar: 'DashboardCompartilhar',
  RelatoriosSalvos: 'RelatoriosSalvos',
  RelatoriosConfiguracao: 'RelatoriosConfiguracao',
  ExportarJob: 'ExportarJob',
  HistoricoLog: 'HistoricoLog',
  AlertRule: 'AlertRule',
  AlertEvent: 'AlertEvent',
  AlertNotificationLog: 'AlertNotificationLog',
  ExportarResultado: 'ExportarResultado',
  Agenda: 'Agenda',
  Slot: 'Slot',
  Reserva: 'Reserva',
  DisponibilidadeConfig: 'DisponibilidadeConfig',
  ConversaCompletaGabi: 'ConversaCompletaGabi',
  MensagemIndividualGabiai: 'MensagemIndividualGabiai',
  GabiaLogUso: 'GabiaLogUso',
  GabiaTokenConsumidos: 'GabiaTokenConsumidos',
  GabiaTokenWorkspace: 'GabiaTokenWorkspace',
  PersonalizacaoOrganizacaoGabiai: 'PersonalizacaoOrganizacaoGabiai',
  UserPreferences: 'UserPreferences',
  NcmItem: 'NcmItem',
  NcmSyncLog: 'NcmSyncLog',
  NcmScheduleConfig: 'NcmScheduleConfig',
  NotificacoesTituloCorpo: 'NotificacoesTituloCorpo',
  ExternalContact: 'ExternalContact',
  TenantChannelConfig: 'TenantChannelConfig'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
