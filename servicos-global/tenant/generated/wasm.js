
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

exports.Prisma.ConfigDashboardScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  widgets_layout: 'widgets_layout',
  refresh_rate: 'refresh_rate',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MetricaSnapshotScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  metric_name: 'metric_name',
  value: 'value',
  unit: 'unit',
  snapshot_date: 'snapshot_date',
  created_at: 'created_at',
  updated_at: 'updated_at'
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
  actor_id: 'actor_id',
  actor_type: 'actor_type',
  action: 'action',
  product_id: 'product_id',
  user_id: 'user_id',
  metadata: 'metadata',
  created_at: 'created_at'
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
  created_at: 'created_at'
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

exports.ActorType = exports.$Enums.ActorType = {
  USER: 'USER',
  SYSTEM: 'SYSTEM',
  GABI_IA: 'GABI_IA',
  ADMIN: 'ADMIN'
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
  ConfigDashboard: 'ConfigDashboard',
  MetricaSnapshot: 'MetricaSnapshot',
  Relatorio: 'Relatorio',
  ConfigRelatorio: 'ConfigRelatorio',
  ExportJob: 'ExportJob',
  HistoryLog: 'HistoryLog',
  Agenda: 'Agenda',
  Slot: 'Slot',
  Reserva: 'Reserva',
  DisponibilidadeConfig: 'DisponibilidadeConfig',
  GabiConversation: 'GabiConversation',
  GabiMessage: 'GabiMessage',
  GabiUsageLog: 'GabiUsageLog',
  UserPreferences: 'UserPreferences'
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
