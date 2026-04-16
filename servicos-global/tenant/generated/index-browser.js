
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

exports.Prisma.AtividadeScalarFieldEnum = {
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

exports.Prisma.AtividadeParticipanteScalarFieldEnum = {
  id: 'id',
  atividade_id: 'atividade_id',
  user_id: 'user_id',
  user_nome: 'user_nome'
};

exports.Prisma.AtividadeSessaoTimerScalarFieldEnum = {
  id: 'id',
  atividade_id: 'atividade_id',
  iniciado_em: 'iniciado_em',
  duracao_min: 'duracao_min',
  assunto: 'assunto'
};

exports.Prisma.TimerSessionScalarFieldEnum = {
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

exports.Prisma.TimerActiveScalarFieldEnum = {
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

exports.Prisma.RelatorioTempoCacheScalarFieldEnum = {
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

exports.Prisma.EmailThreadScalarFieldEnum = {
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

exports.Prisma.EmailMessageScalarFieldEnum = {
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

exports.Prisma.EmailEnviadoScalarFieldEnum = {
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

exports.Prisma.TemplateScalarFieldEnum = {
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

exports.Prisma.FilaEmailScalarFieldEnum = {
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

exports.Prisma.WhatsAppConversationScalarFieldEnum = {
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

exports.Prisma.WhatsAppMessageScalarFieldEnum = {
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

exports.Prisma.WhatsAppUsageLogScalarFieldEnum = {
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

exports.Prisma.WhatsAppAutomationScalarFieldEnum = {
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

exports.Prisma.DashboardConfigScalarFieldEnum = {
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

exports.Prisma.DashboardWidgetScalarFieldEnum = {
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

exports.Prisma.DashboardMetricSnapshotScalarFieldEnum = {
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

exports.Prisma.DashboardAlertScalarFieldEnum = {
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

exports.Prisma.DashboardShareScalarFieldEnum = {
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

exports.Prisma.RelatorioScalarFieldEnum = {
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

exports.Prisma.ConfigRelatorioScalarFieldEnum = {
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

exports.Prisma.ExportJobScalarFieldEnum = {
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

exports.Prisma.HistoryLogScalarFieldEnum = {
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

exports.Prisma.ExportResultScalarFieldEnum = {
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

exports.Prisma.GabiConversationScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  title: 'title',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.GabiMessageScalarFieldEnum = {
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

exports.Prisma.GabiUsageLogScalarFieldEnum = {
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

exports.Prisma.GabiTokenLogScalarFieldEnum = {
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

exports.Prisma.GabiTokenQuotaScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  quota_mensal: 'quota_mensal',
  mes_ref: 'mes_ref',
  tokens_usados: 'tokens_usados',
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

exports.Prisma.PedidoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  tipo_operacao: 'tipo_operacao',
  numero_pedido: 'numero_pedido',
  status: 'status',
  status_id: 'status_id',
  importacao_exportador_id: 'importacao_exportador_id',
  exportacao_importador_id: 'exportacao_importador_id',
  fabricante_id: 'fabricante_id',
  incoterm: 'incoterm',
  moeda_pedido: 'moeda_pedido',
  valor_total_pedido: 'valor_total_pedido',
  casas_decimais_valor_pedido: 'casas_decimais_valor_pedido',
  quantidade_total_inicial_pedido: 'quantidade_total_inicial_pedido',
  casas_decimais_quantidade_pedido: 'casas_decimais_quantidade_pedido',
  unidade_comercializada_pedido: 'unidade_comercializada_pedido',
  peso_liquido_total_pedido: 'peso_liquido_total_pedido',
  peso_bruto_total_pedido: 'peso_bruto_total_pedido',
  cubagem_total_pedido: 'cubagem_total_pedido',
  casas_decimais_peso_pedido: 'casas_decimais_peso_pedido',
  casas_decimais_cubagem_pedido: 'casas_decimais_cubagem_pedido',
  condicao_pagamento_pedido: 'condicao_pagamento_pedido',
  numero_proforma: 'numero_proforma',
  numero_invoice: 'numero_invoice',
  referencia_importador: 'referencia_importador',
  referencia_exportador: 'referencia_exportador',
  referencia_fabricante: 'referencia_fabricante',
  valor_total_cambio_pedido: 'valor_total_cambio_pedido',
  moeda_cambio_pedido: 'moeda_cambio_pedido',
  taxa_cambio_estimada_pedido: 'taxa_cambio_estimada_pedido',
  contrato_cambio_id_pedido: 'contrato_cambio_id_pedido',
  data_emissao_pedido: 'data_emissao_pedido',
  cnpj_importador: 'cnpj_importador',
  detalhes_operacionais: 'detalhes_operacionais',
  campos_custom: 'campos_custom',
  pedidos_origem_id: 'pedidos_origem_id',
  data_consolidacao_pedido: 'data_consolidacao_pedido',
  deleted_at: 'deleted_at',
  pedido_criado_em: 'pedido_criado_em',
  pedido_atualizado_em: 'pedido_atualizado_em'
};

exports.Prisma.PedidoItemScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  pedido_id: 'pedido_id',
  sequencia_item: 'sequencia_item',
  part_number: 'part_number',
  ncm: 'ncm',
  descricao_item: 'descricao_item',
  unidade_comercializada_item: 'unidade_comercializada_item',
  quantidade_inicial_item_pedido: 'quantidade_inicial_item_pedido',
  saldo_item_pedido: 'saldo_item_pedido',
  quantidade_pronta_total_item_pedido: 'quantidade_pronta_total_item_pedido',
  quantidade_transferida_item_pedido: 'quantidade_transferida_item_pedido',
  quantidade_cancelada_item_pedido: 'quantidade_cancelada_item_pedido',
  casas_decimais_quantidade_item: 'casas_decimais_quantidade_item',
  moeda_item: 'moeda_item',
  valor_total_itens: 'valor_total_itens',
  valor_unitario_item: 'valor_unitario_item',
  casas_decimais_valor_item: 'casas_decimais_valor_item',
  cobertura_cambial: 'cobertura_cambial',
  peso_liquido_unitario_item: 'peso_liquido_unitario_item',
  peso_bruto_unitario_item: 'peso_bruto_unitario_item',
  cubagem_unitaria_item: 'cubagem_unitaria_item',
  casas_decimais_peso_item: 'casas_decimais_peso_item',
  casas_decimais_cubagem_item: 'casas_decimais_cubagem_item',
  descricao_completa_item_pt: 'descricao_completa_item_pt',
  descricao_completa_item_en: 'descricao_completa_item_en',
  descricao_completa_item_es: 'descricao_completa_item_es',
  descricao_completa_item_nf: 'descricao_completa_item_nf',
  grupo_item: 'grupo_item',
  subgrupo_item: 'subgrupo_item',
  campo_especial_item: 'campo_especial_item',
  campos_custom: 'campos_custom',
  item_criado_em: 'item_criado_em',
  item_atualizado_em: 'item_atualizado_em'
};

exports.Prisma.ProcessoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  estimativa_custo_id: 'estimativa_custo_id',
  cotacao_frete_id: 'cotacao_frete_id',
  status_embarque: 'status_embarque',
  tipo_operacao: 'tipo_operacao',
  referencia_processo: 'referencia_processo',
  numero_processo: 'numero_processo',
  responsavel_processo: 'responsavel_processo',
  responsavel_rotina: 'responsavel_rotina',
  setor_responsavel: 'setor_responsavel',
  vendedor_responsavel: 'vendedor_responsavel',
  canal_parametrizacao: 'canal_parametrizacao',
  importacao_exportador_id: 'importacao_exportador_id',
  exportacao_importador_id: 'exportacao_importador_id',
  agente_carga_id: 'agente_carga_id',
  armador_id: 'armador_id',
  cia_aerea_id: 'cia_aerea_id',
  transportador_rodo_internacional_id: 'transportador_rodo_internacional_id',
  transportador_rodo_nacional_id: 'transportador_rodo_nacional_id',
  transportador_ferroviario_id: 'transportador_ferroviario_id',
  despachante_id: 'despachante_id',
  armazem_alfandegado_id: 'armazem_alfandegado_id',
  securadora_internacional_id: 'securadora_internacional_id',
  banco_id: 'banco_id',
  corretora_cambio_id: 'corretora_cambio_id',
  moeda_pedido: 'moeda_pedido',
  valor_total_pedido: 'valor_total_pedido',
  incoterm: 'incoterm',
  premio_seguro_internacional: 'premio_seguro_internacional',
  modal_frete_internacional: 'modal_frete_internacional',
  porto_origem: 'porto_origem',
  porto_transbordo: 'porto_transbordo',
  porto_destino: 'porto_destino',
  aeroporto_origem: 'aeroporto_origem',
  aeroporto_escala: 'aeroporto_escala',
  aeroporto_destino: 'aeroporto_destino',
  transit_time_previsto_frete_internacional: 'transit_time_previsto_frete_internacional',
  moeda_frete_internacional: 'moeda_frete_internacional',
  tipo_frete_internacional: 'tipo_frete_internacional',
  proposta_frete_internacional: 'proposta_frete_internacional',
  valor_frete_internacional_estimado: 'valor_frete_internacional_estimado',
  valor_total_frete_internacional: 'valor_total_frete_internacional',
  valor_total_taxas_origem_frete_internacional: 'valor_total_taxas_origem_frete_internacional',
  valor_total_taxas_destino_frete_internacional: 'valor_total_taxas_destino_frete_internacional',
  tipo_volume: 'tipo_volume',
  quantidade_total_volumes: 'quantidade_total_volumes',
  peso_bruto_total: 'peso_bruto_total',
  peso_liquido_total: 'peso_liquido_total',
  data_pedido: 'data_pedido',
  data_pedido_aberto: 'data_pedido_aberto',
  data_previsao_pedido: 'data_previsao_pedido',
  data_pedido_pronto: 'data_pedido_pronto',
  data_pedido_consolidado: 'data_pedido_consolidado',
  data_previsao_coleta_pedido_origem: 'data_previsao_coleta_pedido_origem',
  data_coleta_pedido_origem: 'data_coleta_pedido_origem',
  data_previsao_entrega_pedido_origem: 'data_previsao_entrega_pedido_origem',
  data_entrega_pedido_origem: 'data_entrega_pedido_origem',
  data_previsao_carregamento_container: 'data_previsao_carregamento_container',
  data_carregamento_container: 'data_carregamento_container',
  data_previsao_coleta_embarque_origem: 'data_previsao_coleta_embarque_origem',
  data_coleta_embarque_origem: 'data_coleta_embarque_origem',
  data_previsao_entrega_embarque_origem: 'data_previsao_entrega_embarque_origem',
  data_entrega_embarque_origem: 'data_entrega_embarque_origem',
  data_previsao_coleta_container_origem: 'data_previsao_coleta_container_origem',
  data_coleta_container_origem: 'data_coleta_container_origem',
  data_previsao_entrega_container_origem: 'data_previsao_entrega_container_origem',
  data_entrega_container_origem: 'data_entrega_container_origem',
  data_previsao_embarque_origem_etd: 'data_previsao_embarque_origem_etd',
  data_embarque_origem: 'data_embarque_origem',
  data_previsao_transbordo_embarque: 'data_previsao_transbordo_embarque',
  data_transbordo_embarque: 'data_transbordo_embarque',
  data_previsao_chegada_destino_eta: 'data_previsao_chegada_destino_eta',
  data_chegada_destino_eta: 'data_chegada_destino_eta',
  data_previsao_presenca_carga_destino: 'data_previsao_presenca_carga_destino',
  data_presenca_carga_destino: 'data_presenca_carga_destino',
  data_previsao_registro_duimp: 'data_previsao_registro_duimp',
  data_registro_duimp: 'data_registro_duimp',
  data_previsao_liberacao_duimp: 'data_previsao_liberacao_duimp',
  data_liberacao_duimp: 'data_liberacao_duimp',
  data_consulta_liberacao_duimp: 'data_consulta_liberacao_duimp',
  data_previsao_registro_lpco: 'data_previsao_registro_lpco',
  data_registro_lpco: 'data_registro_lpco',
  data_deferimento_lpco: 'data_deferimento_lpco',
  data_indeferimento_lpco: 'data_indeferimento_lpco',
  data_pendencia_lpco: 'data_pendencia_lpco',
  data_consulta_liberacao_lpco: 'data_consulta_liberacao_lpco',
  numero_certificado_origem: 'numero_certificado_origem',
  numero_bl: 'numero_bl',
  numero_mbl: 'numero_mbl',
  numero_hbl: 'numero_hbl',
  numero_awb: 'numero_awb',
  numero_mawb: 'numero_mawb',
  numero_hawb: 'numero_hawb',
  numero_crt: 'numero_crt',
  numero_cim: 'numero_cim',
  numero_ce_mercante: 'numero_ce_mercante',
  numero_presenca_carga_destino: 'numero_presenca_carga_destino',
  numero_duimp: 'numero_duimp',
  numero_nfe: 'numero_nfe',
  chave_acesso_nfe: 'chave_acesso_nfe',
  total_imposto_ii: 'total_imposto_ii',
  total_imposto_ipi: 'total_imposto_ipi',
  total_imposto_pis: 'total_imposto_pis',
  total_imposto_cofins: 'total_imposto_cofins',
  total_imposto_icms: 'total_imposto_icms',
  detalhes_fiscais: 'detalhes_fiscais',
  detalhes_logisticos: 'detalhes_logisticos',
  detalhes_financeiros: 'detalhes_financeiros',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProcessoFaturaScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  processo_id: 'processo_id',
  tipo_fatura: 'tipo_fatura',
  numero_fatura: 'numero_fatura',
  moeda_fatura: 'moeda_fatura',
  valor_total: 'valor_total',
  valor_pago: 'valor_pago',
  data_vencimento: 'data_vencimento',
  status_pagamento: 'status_pagamento'
};

exports.Prisma.ProcessoItemScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  processo_id: 'processo_id',
  pedido_item_id: 'pedido_item_id',
  sequencia_item: 'sequencia_item',
  part_number: 'part_number',
  ncm: 'ncm',
  descricao_po: 'descricao_po',
  descricao_en: 'descricao_en',
  quantidade: 'quantidade',
  unidade_comercializada_item: 'unidade_comercializada_item',
  valor_unitario: 'valor_unitario',
  valor_total: 'valor_total',
  peso_liquido_unitario: 'peso_liquido_unitario',
  peso_bruto_unitario: 'peso_bruto_unitario',
  detalhes_do_produto: 'detalhes_do_produto'
};

exports.Prisma.ProcessoContainerScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  processo_id: 'processo_id',
  numero_container: 'numero_container',
  numero_lacre: 'numero_lacre',
  tipo_container: 'tipo_container',
  tara: 'tara',
  peso_bruto: 'peso_bruto',
  data_devolucao_prevista: 'data_devolucao_prevista',
  data_devolucao_real: 'data_devolucao_real',
  local_devolucao: 'local_devolucao'
};

exports.Prisma.PedidoStatusScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  nome: 'nome',
  rotulo: 'rotulo',
  cor: 'cor',
  icone: 'icone',
  ordem: 'ordem',
  is_padrao: 'is_padrao',
  is_sistema: 'is_sistema',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PedidoColunaScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  nome: 'nome',
  rotulo: 'rotulo',
  tipo: 'tipo',
  casas_decimais: 'casas_decimais',
  opcoes: 'opcoes',
  ordem: 'ordem',
  filtravel: 'filtravel',
  exibida_padrao: 'exibida_padrao',
  index_criado: 'index_criado',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PedidoPreferenciaUsuarioScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  user_id: 'user_id',
  colunas_visiveis: 'colunas_visiveis',
  colunas_largura: 'colunas_largura',
  updated_at: 'updated_at'
};

exports.Prisma.PedidoPreferenciaPadraoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  colunas_visiveis: 'colunas_visiveis',
  colunas_largura: 'colunas_largura',
  updated_at: 'updated_at'
};

exports.Prisma.ConfiguracaoPedidoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  duplicar_numero_auto: 'duplicar_numero_auto',
  duplicar_copiar_datas: 'duplicar_copiar_datas',
  duplicar_status_inicial: 'duplicar_status_inicial',
  excluir_status_permitidos: 'excluir_status_permitidos',
  excluir_pedido_sem_item_permitido: 'excluir_pedido_sem_item_permitido',
  excluir_confirmar_com_preview: 'excluir_confirmar_com_preview',
  alerta_numero_duplicado: 'alerta_numero_duplicado',
  alerta_valor_total_divergente: 'alerta_valor_total_divergente',
  alerta_quantidade_total_divergente: 'alerta_quantidade_total_divergente',
  alerta_quantidade_pronta_divergente: 'alerta_quantidade_pronta_divergente',
  alerta_peso_liquido_divergente: 'alerta_peso_liquido_divergente',
  alerta_peso_bruto_divergente: 'alerta_peso_bruto_divergente',
  alerta_cubagem_divergente: 'alerta_cubagem_divergente',
  updated_at: 'updated_at'
};

exports.Prisma.MapeamentoImportScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  hash_colunas: 'hash_colunas',
  mapeamento: 'mapeamento',
  uso_count: 'uso_count',
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

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  type: 'type',
  title: 'title',
  message: 'message',
  read: 'read',
  activity_id: 'activity_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.NotificationPreferencesScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  email_enabled: 'email_enabled',
  push_enabled: 'push_enabled',
  wa_enabled: 'wa_enabled',
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

exports.EmailSentimentLevel = exports.$Enums.EmailSentimentLevel = {
  MUITO_POSITIVO: 'MUITO_POSITIVO',
  POSITIVO: 'POSITIVO',
  NEUTRO: 'NEUTRO',
  NEGATIVO: 'NEGATIVO',
  MUITO_NEGATIVO: 'MUITO_NEGATIVO'
};

exports.EmailDirection = exports.$Enums.EmailDirection = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND'
};

exports.EmailStatus = exports.$Enums.EmailStatus = {
  PENDENTE: 'PENDENTE',
  PROCESSANDO: 'PROCESSANDO',
  ENVIADO: 'ENVIADO',
  FALHOU: 'FALHOU',
  CANCELADO: 'CANCELADO'
};

exports.FilaEmailPrioridade = exports.$Enums.FilaEmailPrioridade = {
  BAIXA: 'BAIXA',
  NORMAL: 'NORMAL',
  ALTA: 'ALTA',
  URGENTE: 'URGENTE'
};

exports.DashboardMode = exports.$Enums.DashboardMode = {
  PRODUCT: 'PRODUCT',
  GENERAL: 'GENERAL'
};

exports.WidgetType = exports.$Enums.WidgetType = {
  CATALOG: 'CATALOG',
  CUSTOM: 'CUSTOM',
  GABI: 'GABI'
};

exports.ChartType = exports.$Enums.ChartType = {
  KPI_CARD: 'KPI_CARD',
  LINE: 'LINE',
  BAR: 'BAR',
  BAR_HORIZONTAL: 'BAR_HORIZONTAL',
  DONUT: 'DONUT',
  HISTOGRAM: 'HISTOGRAM',
  FUNNEL: 'FUNNEL',
  GAUGE: 'GAUGE',
  MAP: 'MAP',
  TABLE: 'TABLE',
  AREA: 'AREA'
};

exports.ActorType = exports.$Enums.ActorType = {
  USER: 'USER',
  API: 'API',
  AI: 'AI',
  JOB: 'JOB',
  INTEGRATION: 'INTEGRATION'
};

exports.EventStatus = exports.$Enums.EventStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  PARTIAL: 'PARTIAL'
};

exports.AlertStatus = exports.$Enums.AlertStatus = {
  PENDING: 'PENDING',
  REVIEWED: 'REVIEWED',
  ESCALATED: 'ESCALATED'
};

exports.NcmSyncStatus = exports.$Enums.NcmSyncStatus = {
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
};

exports.NcmSyncOrigem = exports.$Enums.NcmSyncOrigem = {
  JOB: 'JOB',
  MANUAL: 'MANUAL'
};

exports.Prisma.ModelName = {
  Atividade: 'Atividade',
  AtividadeParticipante: 'AtividadeParticipante',
  AtividadeSessaoTimer: 'AtividadeSessaoTimer',
  TimerSession: 'TimerSession',
  TimerActive: 'TimerActive',
  RelatorioTempoCache: 'RelatorioTempoCache',
  EmailThread: 'EmailThread',
  EmailMessage: 'EmailMessage',
  EmailEnviado: 'EmailEnviado',
  Template: 'Template',
  FilaEmail: 'FilaEmail',
  WhatsAppConversation: 'WhatsAppConversation',
  WhatsAppMessage: 'WhatsAppMessage',
  WhatsAppUsageLog: 'WhatsAppUsageLog',
  WhatsAppAutomation: 'WhatsAppAutomation',
  DashboardConfig: 'DashboardConfig',
  DashboardWidget: 'DashboardWidget',
  DashboardMetricSnapshot: 'DashboardMetricSnapshot',
  DashboardAlert: 'DashboardAlert',
  DashboardShare: 'DashboardShare',
  Relatorio: 'Relatorio',
  ConfigRelatorio: 'ConfigRelatorio',
  ExportJob: 'ExportJob',
  HistoryLog: 'HistoryLog',
  AlertRule: 'AlertRule',
  AlertEvent: 'AlertEvent',
  AlertNotificationLog: 'AlertNotificationLog',
  ExportResult: 'ExportResult',
  Agenda: 'Agenda',
  Slot: 'Slot',
  Reserva: 'Reserva',
  DisponibilidadeConfig: 'DisponibilidadeConfig',
  GabiConversation: 'GabiConversation',
  GabiMessage: 'GabiMessage',
  GabiUsageLog: 'GabiUsageLog',
  GabiTokenLog: 'GabiTokenLog',
  GabiTokenQuota: 'GabiTokenQuota',
  UserPreferences: 'UserPreferences',
  Pedido: 'Pedido',
  PedidoItem: 'PedidoItem',
  Processo: 'Processo',
  ProcessoFatura: 'ProcessoFatura',
  ProcessoItem: 'ProcessoItem',
  ProcessoContainer: 'ProcessoContainer',
  PedidoStatus: 'PedidoStatus',
  PedidoColuna: 'PedidoColuna',
  PedidoPreferenciaUsuario: 'PedidoPreferenciaUsuario',
  PedidoPreferenciaPadrao: 'PedidoPreferenciaPadrao',
  ConfiguracaoPedido: 'ConfiguracaoPedido',
  MapeamentoImport: 'MapeamentoImport',
  NcmItem: 'NcmItem',
  NcmSyncLog: 'NcmSyncLog',
  NcmScheduleConfig: 'NcmScheduleConfig',
  Notification: 'Notification',
  NotificationPreferences: 'NotificationPreferences'
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
