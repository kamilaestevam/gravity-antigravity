
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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




  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.EmpresaScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  nome: 'nome',
  cnpj: 'cnpj',
  email: 'email',
  telefone: 'telefone',
  site: 'site',
  segmento: 'segmento',
  status: 'status',
  observacao: 'observacao',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ContatoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  empresa_id: 'empresa_id',
  nome: 'nome',
  cargo: 'cargo',
  email: 'email',
  telefone: 'telefone',
  whatsapp: 'whatsapp',
  linkedin: 'linkedin',
  observacao: 'observacao',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AtividadeScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  titulo: 'titulo',
  descricao: 'descricao',
  tipo: 'tipo',
  status: 'status',
  prioridade: 'prioridade',
  data_inicio: 'data_inicio',
  data_fim: 'data_fim',
  data_venc: 'data_venc',
  empresa_id: 'empresa_id',
  contato_id: 'contato_id',
  pipeline_id: 'pipeline_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PipelineScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  titulo: 'titulo',
  etapa: 'etapa',
  valor: 'valor',
  empresa_id: 'empresa_id',
  contato_id: 'contato_id',
  probabilidade: 'probabilidade',
  data_fechamento: 'data_fechamento',
  observacao: 'observacao',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.KanbanCardScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_id: 'product_id',
  user_id: 'user_id',
  titulo: 'titulo',
  descricao: 'descricao',
  status: 'status',
  posicao: 'posicao',
  cor: 'cor',
  etiquetas: 'etiquetas',
  data_venc: 'data_venc',
  atividade_id: 'atividade_id',
  empresa_id: 'empresa_id',
  contato_id: 'contato_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
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
exports.EmpresaStatus = exports.$Enums.EmpresaStatus = {
  ATIVA: 'ATIVA',
  INATIVA: 'INATIVA',
  PROSPECTO: 'PROSPECTO',
  CLIENTE: 'CLIENTE',
  CHURNED: 'CHURNED'
};

exports.AtividadeTipo = exports.$Enums.AtividadeTipo = {
  TAREFA: 'TAREFA',
  REUNIAO: 'REUNIAO',
  LIGACAO: 'LIGACAO',
  EMAIL: 'EMAIL',
  FOLLOW_UP: 'FOLLOW_UP',
  VISITA: 'VISITA',
  OUTRO: 'OUTRO'
};

exports.AtividadeStatus = exports.$Enums.AtividadeStatus = {
  PENDENTE: 'PENDENTE',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  CONCLUIDA: 'CONCLUIDA',
  CANCELADA: 'CANCELADA'
};

exports.AtividadePrioridade = exports.$Enums.AtividadePrioridade = {
  BAIXA: 'BAIXA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  URGENTE: 'URGENTE'
};

exports.PipelineEtapa = exports.$Enums.PipelineEtapa = {
  PROSPECCAO: 'PROSPECCAO',
  QUALIFICACAO: 'QUALIFICACAO',
  PROPOSTA: 'PROPOSTA',
  NEGOCIACAO: 'NEGOCIACAO',
  FECHAMENTO: 'FECHAMENTO',
  POS_VENDA: 'POS_VENDA'
};

exports.KanbanCardStatus = exports.$Enums.KanbanCardStatus = {
  ABERTO: 'ABERTO',
  EM_PROGRESSO: 'EM_PROGRESSO',
  BLOQUEADO: 'BLOQUEADO',
  CONCLUIDO: 'CONCLUIDO'
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
  Empresa: 'Empresa',
  Contato: 'Contato',
  Atividade: 'Atividade',
  Pipeline: 'Pipeline',
  KanbanCard: 'KanbanCard',
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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\danie\\OneDrive\\Documents\\Antigravity\\2. Gravity\\servicos-global\\tenant\\generated",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-1.1.x"
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\danie\\OneDrive\\Documents\\Antigravity\\2. Gravity\\servicos-global\\tenant\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null
  },
  "relativePath": "../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "TENANT_DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// ============================================================================\n// schema.prisma — GERADO AUTOMATICAMENTE\n// NÃO EDITAR MANUALMENTE — será sobrescrito na próxima execução de compose.\n// Gerado em: 2026-03-28T22:25:58.494Z\n// Serviços incluídos: atividades, cronometro, email, whatsapp, dashboard, relatorios, historico-global, agendamento, gabi, preferencias-usuario\n// Todos os fragments encontrados.\n// ============================================================================\n\n// servicos-global/tenant/prisma/schema.base.prisma\n// ARQUIVO BASE — NÃO MODIFICAR DIRETAMENTE\n// Contém apenas datasource e generator.\n// O Coordenador compõe o schema.prisma final via scripts/compose-tenant-schema.ts\n// adicionando todos os fragment.prisma dos serviços de tenant.\n\ngenerator client {\n  provider      = \"prisma-client-js\"\n  output        = \"../generated\"\n  binaryTargets = [\"native\", \"debian-openssl-1.1.x\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"TENANT_DATABASE_URL\")\n}\n\n// --- Fragment: atividades ---\n// servicos-global/tenant/atividades/prisma/fragment.prisma\n// AGENTE ATIVIDADES — ONDA 3\n//\n// Fragment Prisma para o serviço de Atividades (CRM).\n// Não editar o schema.prisma final — apenas este fragment.\n// O Coordenador compõe o schema via scripts/compose-tenant-schema.ts.\n\n// ---------------------------------------------------------------------------\n// Enums\n// ---------------------------------------------------------------------------\n\nenum EmpresaStatus {\n  ATIVA\n  INATIVA\n  PROSPECTO\n  CLIENTE\n  CHURNED\n}\n\nenum AtividadeStatus {\n  PENDENTE\n  EM_ANDAMENTO\n  CONCLUIDA\n  CANCELADA\n}\n\nenum AtividadePrioridade {\n  BAIXA\n  MEDIA\n  ALTA\n  URGENTE\n}\n\nenum AtividadeTipo {\n  TAREFA\n  REUNIAO\n  LIGACAO\n  EMAIL\n  FOLLOW_UP\n  VISITA\n  OUTRO\n}\n\nenum PipelineEtapa {\n  PROSPECCAO\n  QUALIFICACAO\n  PROPOSTA\n  NEGOCIACAO\n  FECHAMENTO\n  POS_VENDA\n}\n\nenum KanbanCardStatus {\n  ABERTO\n  EM_PROGRESSO\n  BLOQUEADO\n  CONCLUIDO\n}\n\n// ---------------------------------------------------------------------------\n// Empresa — cadastro de empresas do CRM\n// ---------------------------------------------------------------------------\n\nmodel Empresa {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  nome       String\n  cnpj       String?\n  email      String?\n  telefone   String?\n  site       String?\n  segmento   String?\n  status     EmpresaStatus @default(PROSPECTO)\n  observacao String?\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\n// ---------------------------------------------------------------------------\n// Contato — pessoas vinculadas a empresas\n// ---------------------------------------------------------------------------\n\nmodel Contato {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  empresa_id String?\n  nome       String\n  cargo      String?\n  email      String?\n  telefone   String?\n  whatsapp   String?\n  linkedin   String?\n  observacao String?\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\n// ---------------------------------------------------------------------------\n// Atividade — tarefas e interações de CRM\n// ---------------------------------------------------------------------------\n\nmodel Atividade {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  titulo      String\n  descricao   String?\n  tipo        AtividadeTipo       @default(TAREFA)\n  status      AtividadeStatus     @default(PENDENTE)\n  prioridade  AtividadePrioridade @default(MEDIA)\n  data_inicio DateTime?\n  data_fim    DateTime?\n  data_venc   DateTime?\n\n  empresa_id  String?\n  contato_id  String?\n  pipeline_id String?\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\n// ---------------------------------------------------------------------------\n// Pipeline — funil de vendas\n// ---------------------------------------------------------------------------\n\nmodel Pipeline {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  titulo          String\n  etapa           PipelineEtapa @default(PROSPECCAO)\n  valor           Float?\n  empresa_id      String?\n  contato_id      String?\n  probabilidade   Int?\n  data_fechamento DateTime?\n  observacao      String?\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\n// ---------------------------------------------------------------------------\n// KanbanCard — cards para visão kanban de atividades\n// ---------------------------------------------------------------------------\n\nmodel KanbanCard {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  titulo    String\n  descricao String?\n  status    KanbanCardStatus @default(ABERTO)\n  posicao   Int              @default(0)\n  cor       String?\n  etiquetas String[]\n  data_venc DateTime?\n\n  atividade_id String?\n  empresa_id   String?\n  contato_id   String?\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\n// --- Fragment: cronometro ---\n// servicos-global/tenant/cronometro/prisma/fragment.prisma\n// AGENTE CRONÔMETRO — ONDA 3 | 2/13\n//\n// Fragment Prisma do serviço de Cronômetro.\n// Não editar schema.prisma diretamente — apenas este fragment.\n// O Coordenador compõe o schema final via scripts/compose-tenant-schema.ts\n\n// ---------------------------------------------------------------------------\n// TimerSession\n// Sessão de tempo registrada (concluída ou manual).\n// ---------------------------------------------------------------------------\n\nmodel TimerSession {\n  id String @id @default(cuid())\n\n  // Campos de isolamento — obrigatórios\n  tenant_id  String\n  product_id String?\n  user_id    String\n\n  // Relacionamento\n  activity_id String\n\n  // Dados da sessão\n  started_at       DateTime\n  ended_at         DateTime?\n  duration_minutes Int? // null = timer ainda ativo (em progresso)\n  is_manual        Boolean   @default(false)\n\n  // Assunto e vínculo\n  subject      String? // texto livre do assunto\n  linked_type  String? // nf | meeting | process | custom\n  linked_id    String? // ID do item vinculado\n  linked_label String? // label de exibição do item vinculado\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Índices obrigatórios — padrão do projeto\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n  // Índice extra para queries de relatório por data\n  @@index([tenant_id, user_id, started_at])\n  // Índice extra para queries por atividade\n  @@index([tenant_id, activity_id])\n}\n\n// ---------------------------------------------------------------------------\n// TimerActive\n// Estado do timer em execução (um por usuário).\n// Removido quando a sessão é finalizada — o histórico fica em TimerSession.\n// ---------------------------------------------------------------------------\n\nmodel TimerActive {\n  id String @id @default(cuid())\n\n  // Campos de isolamento\n  tenant_id String\n  user_id   String @unique // um timer ativo por usuário\n\n  // Relacionamento\n  activity_id String\n\n  // Estado do timer\n  started_at          DateTime\n  paused_at           DateTime?\n  accumulated_seconds Int       @default(0) // segundos acumulados antes de pausas\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, user_id])\n  @@index([user_id])\n}\n\n// ---------------------------------------------------------------------------\n// RelatorioTempoCache\n// Cache de relatórios de tempo pré-computados para performance.\n// ---------------------------------------------------------------------------\n\nmodel RelatorioTempoCache {\n  id String @id @default(cuid())\n\n  tenant_id  String\n  user_id    String?\n  product_id String?\n\n  periodo_inicio DateTime\n  periodo_fim    DateTime\n  total_minutos  Int\n  payload        String // JSON serializado com breakdown por atividade\n\n  computed_at DateTime @default(now())\n  expires_at  DateTime\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n  @@index([tenant_id, periodo_inicio, periodo_fim])\n}\n\n// --- Fragment: email ---\n// servicos-global/tenant/email/prisma/fragment.prisma\n// AGENTE EMAIL — ONDA 3 | 3/13\n//\n// Fragment Prisma para o serviço de Email (envio Resend, templates, histórico).\n// Não editar o schema.prisma final — apenas este fragment.\n// O Coordenador compõe o schema via scripts/compose-tenant-schema.ts.\n\n// ---------------------------------------------------------------------------\n// Enums\n// ---------------------------------------------------------------------------\n\nenum EmailStatus {\n  PENDENTE\n  PROCESSANDO\n  ENVIADO\n  FALHOU\n  CANCELADO\n}\n\nenum EmailDirection {\n  INBOUND\n  OUTBOUND\n}\n\nenum EmailThreadStatus {\n  ABERTA\n  ARQUIVADA\n  RESOLVIDA\n}\n\nenum EmailSentimentLevel {\n  MUITO_POSITIVO\n  POSITIVO\n  NEUTRO\n  NEGATIVO\n  MUITO_NEGATIVO\n}\n\nenum FilaEmailPrioridade {\n  BAIXA\n  NORMAL\n  ALTA\n  URGENTE\n}\n\n// ---------------------------------------------------------------------------\n// EmailThread — thread de conversa (agrupa mensagens de ida e volta)\n// ---------------------------------------------------------------------------\n\nmodel EmailThread {\n  id         String  @id @default(uuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  subject         String\n  status          EmailThreadStatus   @default(ABERTA)\n  sentiment       Float               @default(0) // -1 a 1\n  sentiment_label EmailSentimentLevel @default(NEUTRO)\n  mensagens_count Int                 @default(0)\n  ultimo_contato  DateTime?\n  deep_link       String? // ex: /email/thread/{id}\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  mensagens EmailMessage[]\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\n// ---------------------------------------------------------------------------\n// EmailMessage — mensagem individual (inbound ou outbound)\n// ---------------------------------------------------------------------------\n\nmodel EmailMessage {\n  id         String  @id @default(uuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  thread_id String\n  thread    EmailThread @relation(fields: [thread_id], references: [id])\n\n  resend_id         String?        @unique // ID retornado pelo Resend\n  direction         EmailDirection @default(OUTBOUND)\n  from              String\n  to                String\n  subject           String?\n  body              String         @db.Text\n  body_html         String?        @db.Text\n  dedup_key         String?        @unique // UUID para Reply-To dinâmico\n  parent_message_id String? // UUID do email pai (threading)\n\n  // Análise Gabi\n  gabi_response   String? @db.Text\n  gabi_confidence Float?\n  gabi_action     String? // auto_replied | escalated_to_human | none\n\n  sent_at    DateTime @default(now())\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n  @@index([thread_id])\n  @@index([dedup_key])\n}\n\n// ---------------------------------------------------------------------------\n// EmailEnviado — log de todos os envios realizados (auditoria completa)\n// ---------------------------------------------------------------------------\n\nmodel EmailEnviado {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  to          String\n  from        String\n  reply_to    String?\n  subject     String\n  template_id String?\n  status      EmailStatus @default(PENDENTE)\n  resend_id   String?     @unique\n  dedup_key   String      @unique // UUID do Reply-To dinâmico\n\n  tentativas     Int       @default(0)\n  max_tentativas Int       @default(5)\n  next_retry_at  DateTime?\n  error_message  String?   @db.Text\n  enviado_at     DateTime?\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n  @@index([status])\n  @@index([dedup_key])\n}\n\n// ---------------------------------------------------------------------------\n// Template — templates de email editáveis por tenant\n// ---------------------------------------------------------------------------\n\nmodel Template {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  nome        String\n  slug        String // ex: boas-vindas, recuperacao-senha\n  assunto     String\n  corpo_html  String   @db.Text\n  corpo_texto String?  @db.Text\n  variaveis   String[] // ex: [\"nome\", \"plano\", \"url\"]\n  ativo       Boolean  @default(true)\n  descricao   String?\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@unique([tenant_id, slug])\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\n// ---------------------------------------------------------------------------\n// FilaEmail — fila de envio com controle de retry e backoff exponencial\n// ---------------------------------------------------------------------------\n\nmodel FilaEmail {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  status           EmailStatus         @default(PENDENTE)\n  prioridade       FilaEmailPrioridade @default(NORMAL)\n  payload          String              @db.Text // JSON: { to, subject, body, ... }\n  template_id      String?\n  email_enviado_id String?\n\n  tentativas     Int       @default(0)\n  max_tentativas Int       @default(5)\n  next_retry_at  DateTime?\n  processado_at  DateTime?\n  erro           String?   @db.Text\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n  @@index([status, next_retry_at])\n  @@index([tenant_id, status])\n}\n\n// --- Fragment: whatsapp ---\nmodel WhatsAppConversation {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  wa_phone_number        String\n  status                 String    @default(\"open\")\n  contact_id             String?\n  company_id             String?\n  contact_nome           String?\n  company_nome           String?\n  activity_id            String?\n  ai_enabled             Boolean   @default(false)\n  opened_at              DateTime  @default(now())\n  closed_at              DateTime?\n  gabi_temperatura       String?\n  gabi_temperatura_score Int?\n  gabi_resumo            String?\n  gabi_acoes_sugeridas   Json?\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n  @@index([tenant_id, status])\n  @@index([tenant_id, wa_phone_number])\n}\n\nmodel WhatsAppMessage {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  conversation_id String\n  wa_message_id   String? @unique\n  direction       String\n  content_type    String  @default(\"text\")\n  content         String\n  origin          String  @default(\"agent\")\n  sent_by         String?\n  status          String  @default(\"sent\")\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n  @@index([tenant_id, conversation_id])\n  @@index([wa_message_id])\n}\n\nmodel WhatsAppUsageLog {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  conversation_id       String?\n  company_id            String?\n  conversation_category String\n  origin                String\n  cost_usd              Decimal\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\nmodel WhatsAppAutomation {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  name        String\n  trigger     String\n  conditions  Json?\n  template_id String\n  recipient   String\n  active      Boolean @default(true)\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n  @@index([tenant_id, active])\n}\n\n// --- Fragment: dashboard ---\n// servicos-global/tenant/dashboard/prisma/fragment.prisma\n\nmodel ConfigDashboard {\n  id             String  @id @default(cuid())\n  tenant_id      String\n  product_id     String?\n  user_id        String?\n  widgets_layout Json? // Layout grid state\n  refresh_rate   Int     @default(300000) // Default 5 min polling\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\nmodel MetricaSnapshot {\n  id            String   @id @default(cuid())\n  tenant_id     String\n  product_id    String?\n  metric_name   String\n  value         Float\n  unit          String?\n  snapshot_date DateTime @default(now())\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  // Extra index heavily used for aggregation\n  @@index([tenant_id, metric_name, snapshot_date])\n}\n\n// --- Fragment: relatorios ---\n// servicos-global/tenant/relatorios/prisma/fragment.prisma\n\nmodel Relatorio {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  nome       String\n  tabelas    Json     @default(\"[]\") // [{\"productId\":\"simulador-comex\", \"tableId\":\"simulacoes\"}]\n  colunas    Json     @default(\"[]\") // Colunas visíveis\n  filtros    Json     @default(\"{}\") // Filtros salvos\n  join_type  String   @default(\"left\")\n  is_shared  Boolean  @default(false)\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\nmodel ConfigRelatorio {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  relatorio_id String\n  frequencia   String // once | daily | weekly | monthly\n  canais       Json // { email:[], whatsapp:[] }\n  formato      String   @default(\"csv\") // csv | excel | pdf\n  ativo        Boolean  @default(true)\n  created_at   DateTime @default(now())\n  updated_at   DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\nmodel ExportJob {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  relatorio_id String\n  status       String    @default(\"PENDING\") // PENDING, PROCESSING, DONE, FAILED\n  formato      String    @default(\"csv\")\n  url_arquivo  String?\n  erro         String?\n  started_at   DateTime?\n  completed_at DateTime?\n  created_at   DateTime  @default(now())\n  updated_at   DateTime  @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\n// --- Fragment: historico-global ---\nmodel HistoryLog {\n  id         String    @id @default(uuid())\n  tenant_id  String\n  actor_id   String\n  actor_type ActorType\n  action     String\n\n  product_id String?\n  user_id    String?\n\n  // Multiaxial details\n  metadata Json?\n\n  created_at DateTime @default(now())\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n  @@index([tenant_id, created_at])\n}\n\nenum ActorType {\n  USER\n  SYSTEM\n  GABI_IA\n  ADMIN\n}\n\n// --- Fragment: agendamento ---\nmodel Agenda {\n  id           String   @id @default(uuid())\n  tenant_id    String\n  nome         String\n  descricao    String?\n  tipo         String // e.g., reuniao, consulta\n  criadoEm     DateTime @default(now())\n  atualizadoEm DateTime @updatedAt\n\n  slots  Slot[]\n  config DisponibilidadeConfig?\n\n  @@index([tenant_id])\n}\n\nmodel Slot {\n  id           String   @id @default(uuid())\n  tenant_id    String\n  agenda_id    String\n  inicio       DateTime\n  fim          DateTime\n  capacidade   Int      @default(1)\n  criadoEm     DateTime @default(now())\n  atualizadoEm DateTime @updatedAt\n\n  agenda   Agenda    @relation(fields: [agenda_id], references: [id], onDelete: Cascade)\n  reservas Reserva[]\n\n  @@index([tenant_id])\n  @@index([agenda_id])\n}\n\nmodel Reserva {\n  id           String   @id @default(uuid())\n  tenant_id    String\n  slot_id      String\n  usuario_id   String // ID do usuário ou contato\n  nome         String? // Nome se não tiver usuário cadastrado no sistema\n  email        String? // Email para notificação\n  status       String   @default(\"confirmado\") // confirmado, cancelado, pendente\n  criadoEm     DateTime @default(now())\n  atualizadoEm DateTime @updatedAt\n\n  slot Slot @relation(fields: [slot_id], references: [id], onDelete: Cascade)\n\n  @@index([tenant_id])\n  @@index([slot_id])\n  @@index([usuario_id])\n}\n\nmodel DisponibilidadeConfig {\n  id            String   @id @default(uuid())\n  tenant_id     String\n  agenda_id     String   @unique\n  horarioInicio String // Formato \"HH:mm\" (e.g., \"09:00\")\n  horarioFim    String // Formato \"HH:mm\" (e.g., \"18:00\")\n  duracaoSlot   Int // em minutos\n  intervalo     Int      @default(0) // tempo entre slots em minutos\n  diasSemana    Int[] // [1,2,3,4,5] (1=Segunda, 5=Sexta)\n  criadoEm      DateTime @default(now())\n  atualizadoEm  DateTime @updatedAt\n\n  agenda Agenda @relation(fields: [agenda_id], references: [id], onDelete: Cascade)\n\n  @@index([tenant_id])\n}\n\n// --- Fragment: gabi ---\n// servicos-global/tenant/gabi/prisma/fragment.prisma\n// AGENTE GABI — ONDA 3 | 10/13\n//\n// Fragment Prisma para o serviço da Gabi AI (agente autônomo).\n// Não editar o schema.prisma final — apenas este fragment.\n// O Coordenador compõe o schema via scripts/compose-tenant-schema.ts.\n\n// ---------------------------------------------------------------------------\n// GabiConversation — conversa principal da Gabi com o usuário no tenant\n// ---------------------------------------------------------------------------\n\nmodel GabiConversation {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  title String?\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  messages GabiMessage[]\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\n// ---------------------------------------------------------------------------\n// GabiMessage — mensagem individual da conversa\n// ---------------------------------------------------------------------------\n\nmodel GabiMessage {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  conversation_id String\n  conversation    GabiConversation @relation(fields: [conversation_id], references: [id], onDelete: Cascade)\n\n  role        String // 'user' | 'assistant' | 'system'\n  content     String  @db.Text\n  attachments String? // JSON encodado com links/detalhes de arquivos\n\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n  @@index([conversation_id])\n}\n\n// ---------------------------------------------------------------------------\n// GabiUsageLog (SnapshotAuditoria) — auditoria obrigatória de toda execução\n// ---------------------------------------------------------------------------\n\nmodel GabiUsageLog {\n  id         String  @id @default(cuid())\n  tenant_id  String\n  product_id String?\n  user_id    String?\n\n  action_taken          String\n  conversation_snapshot String @db.Text // JSON com contexto da conversa obrigatório\n  actor_type            String @default(\"gabi\") // sempre 'gabi'\n  triggered_by          String // ID do usuário original\n\n  created_at DateTime @default(now())\n\n  @@index([tenant_id])\n  @@index([tenant_id, product_id])\n  @@index([tenant_id, user_id])\n}\n\n// --- Fragment: preferencias-usuario ---\n// servicos-global/tenant/preferencias-usuario/prisma/fragment.prisma\n// SERVIÇO PREFERÊNCIAS DO USUÁRIO\n//\n// Fragment Prisma para persistência cross-device de preferências de UI.\n// IDs de usuário vêm do Clerk (user.id).\n// Não editar o schema.prisma final — apenas este fragment.\n// O Coordenador compõe o schema via scripts/compose-tenant-schema.ts.\n\n// ---------------------------------------------------------------------------\n// UserPreferences — preferências de UI persitidas por usuário (cross-device)\n// ---------------------------------------------------------------------------\n\nmodel UserPreferences {\n  id String @id @default(cuid())\n\n  // Identificação — obrigatórios\n  // user_id = Clerk user ID (ex: user_2abc...)\n  user_id   String @unique\n  tenant_id String\n\n  // ── Preferências de UI ──────────────────────────────────────────────────\n  // Visibilidade global das tooltips/dicas\n  tooltips_disabled Boolean @default(false)\n\n  // Tema preferido ('dark' | 'light')\n  theme String @default(\"dark\")\n\n  // Sidebar aberta ou fechada\n  sidebar_open Boolean @default(true)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([user_id])\n  @@index([tenant_id])\n  @@index([tenant_id, user_id])\n}\n",
  "inlineSchemaHash": "7d2092dd8cb9e301324916a396fd0bfd182ea75bd64b8c59ed9fc8d3517078f3",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "servicos-global/tenant/generated",
    "tenant/generated",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Empresa\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cnpj\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"telefone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"site\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"segmento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EmpresaStatus\",\"default\":\"PROSPECTO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"observacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Contato\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empresa_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cargo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"telefone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"whatsapp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"linkedin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"observacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Atividade\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"titulo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descricao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"AtividadeTipo\",\"default\":\"TAREFA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"AtividadeStatus\",\"default\":\"PENDENTE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prioridade\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"AtividadePrioridade\",\"default\":\"MEDIA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_inicio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_fim\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_venc\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empresa_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contato_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pipeline_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Pipeline\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"titulo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"etapa\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"PipelineEtapa\",\"default\":\"PROSPECCAO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"valor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empresa_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contato_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"probabilidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_fechamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"observacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"KanbanCard\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"titulo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descricao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"KanbanCardStatus\",\"default\":\"ABERTO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"posicao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"etiquetas\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_venc\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atividade_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"empresa_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contato_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TimerSession\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activity_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"started_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ended_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duration_minutes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_manual\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subject\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"linked_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"linked_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"linked_label\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TimerActive\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activity_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"started_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paused_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"accumulated_seconds\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RelatorioTempoCache\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodo_inicio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"periodo_fim\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_minutos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"computed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"EmailThread\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subject\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EmailThreadStatus\",\"default\":\"ABERTA\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sentiment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sentiment_label\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EmailSentimentLevel\",\"default\":\"NEUTRO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mensagens_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ultimo_contato\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deep_link\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"mensagens\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EmailMessage\",\"relationName\":\"EmailMessageToEmailThread\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"EmailMessage\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thread_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thread\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EmailThread\",\"relationName\":\"EmailMessageToEmailThread\",\"relationFromFields\":[\"thread_id\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resend_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"direction\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EmailDirection\",\"default\":\"OUTBOUND\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"from\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"to\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subject\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"body\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"body_html\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dedup_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parent_message_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gabi_response\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gabi_confidence\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gabi_action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sent_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"EmailEnviado\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"to\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"from\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reply_to\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subject\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"template_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EmailStatus\",\"default\":\"PENDENTE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resend_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dedup_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tentativas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"max_tentativas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":5,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"next_retry_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"error_message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enviado_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Template\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"assunto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"corpo_html\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"corpo_texto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"variaveis\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descricao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"slug\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"slug\"]}],\"isGenerated\":false},\"FilaEmail\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EmailStatus\",\"default\":\"PENDENTE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prioridade\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"FilaEmailPrioridade\",\"default\":\"NORMAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"template_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email_enviado_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tentativas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"max_tentativas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":5,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"next_retry_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processado_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"erro\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"WhatsAppConversation\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"wa_phone_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"open\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contact_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contact_nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activity_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ai_enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"opened_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"closed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gabi_temperatura\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gabi_temperatura_score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gabi_resumo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gabi_acoes_sugeridas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"WhatsAppMessage\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"wa_message_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"direction\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"text\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"agent\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sent_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"sent\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"WhatsAppUsageLog\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversation_category\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cost_usd\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"WhatsAppAutomation\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trigger\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conditions\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"template_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recipient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ConfigDashboard\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"widgets_layout\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"refresh_rate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":300000,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"MetricaSnapshot\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metric_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"snapshot_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Relatorio\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tabelas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"colunas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"filtros\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"join_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"left\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_shared\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ConfigRelatorio\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"relatorio_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frequencia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"canais\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"formato\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"csv\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ExportJob\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"relatorio_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"formato\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"csv\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url_arquivo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"erro\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"started_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"HistoryLog\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ActorType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Agenda\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descricao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadoEm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atualizadoEm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"slots\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Slot\",\"relationName\":\"AgendaToSlot\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"config\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DisponibilidadeConfig\",\"relationName\":\"AgendaToDisponibilidadeConfig\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Slot\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agenda_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inicio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fim\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"capacidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadoEm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atualizadoEm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"agenda\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agenda\",\"relationName\":\"AgendaToSlot\",\"relationFromFields\":[\"agenda_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reservas\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Reserva\",\"relationName\":\"ReservaToSlot\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Reserva\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slot_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usuario_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"confirmado\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadoEm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atualizadoEm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"slot\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Slot\",\"relationName\":\"ReservaToSlot\",\"relationFromFields\":[\"slot_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DisponibilidadeConfig\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agenda_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"horarioInicio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"horarioFim\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duracaoSlot\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"intervalo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"diasSemana\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criadoEm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atualizadoEm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"agenda\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agenda\",\"relationName\":\"AgendaToDisponibilidadeConfig\",\"relationFromFields\":[\"agenda_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GabiConversation\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"messages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"GabiMessage\",\"relationName\":\"GabiConversationToGabiMessage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GabiMessage\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversation\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"GabiConversation\",\"relationName\":\"GabiConversationToGabiMessage\",\"relationFromFields\":[\"conversation_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GabiUsageLog\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action_taken\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversation_snapshot\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"gabi\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"triggered_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserPreferences\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tooltips_disabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"theme\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"dark\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sidebar_open\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"EmpresaStatus\":{\"values\":[{\"name\":\"ATIVA\",\"dbName\":null},{\"name\":\"INATIVA\",\"dbName\":null},{\"name\":\"PROSPECTO\",\"dbName\":null},{\"name\":\"CLIENTE\",\"dbName\":null},{\"name\":\"CHURNED\",\"dbName\":null}],\"dbName\":null},\"AtividadeStatus\":{\"values\":[{\"name\":\"PENDENTE\",\"dbName\":null},{\"name\":\"EM_ANDAMENTO\",\"dbName\":null},{\"name\":\"CONCLUIDA\",\"dbName\":null},{\"name\":\"CANCELADA\",\"dbName\":null}],\"dbName\":null},\"AtividadePrioridade\":{\"values\":[{\"name\":\"BAIXA\",\"dbName\":null},{\"name\":\"MEDIA\",\"dbName\":null},{\"name\":\"ALTA\",\"dbName\":null},{\"name\":\"URGENTE\",\"dbName\":null}],\"dbName\":null},\"AtividadeTipo\":{\"values\":[{\"name\":\"TAREFA\",\"dbName\":null},{\"name\":\"REUNIAO\",\"dbName\":null},{\"name\":\"LIGACAO\",\"dbName\":null},{\"name\":\"EMAIL\",\"dbName\":null},{\"name\":\"FOLLOW_UP\",\"dbName\":null},{\"name\":\"VISITA\",\"dbName\":null},{\"name\":\"OUTRO\",\"dbName\":null}],\"dbName\":null},\"PipelineEtapa\":{\"values\":[{\"name\":\"PROSPECCAO\",\"dbName\":null},{\"name\":\"QUALIFICACAO\",\"dbName\":null},{\"name\":\"PROPOSTA\",\"dbName\":null},{\"name\":\"NEGOCIACAO\",\"dbName\":null},{\"name\":\"FECHAMENTO\",\"dbName\":null},{\"name\":\"POS_VENDA\",\"dbName\":null}],\"dbName\":null},\"KanbanCardStatus\":{\"values\":[{\"name\":\"ABERTO\",\"dbName\":null},{\"name\":\"EM_PROGRESSO\",\"dbName\":null},{\"name\":\"BLOQUEADO\",\"dbName\":null},{\"name\":\"CONCLUIDO\",\"dbName\":null}],\"dbName\":null},\"EmailStatus\":{\"values\":[{\"name\":\"PENDENTE\",\"dbName\":null},{\"name\":\"PROCESSANDO\",\"dbName\":null},{\"name\":\"ENVIADO\",\"dbName\":null},{\"name\":\"FALHOU\",\"dbName\":null},{\"name\":\"CANCELADO\",\"dbName\":null}],\"dbName\":null},\"EmailDirection\":{\"values\":[{\"name\":\"INBOUND\",\"dbName\":null},{\"name\":\"OUTBOUND\",\"dbName\":null}],\"dbName\":null},\"EmailThreadStatus\":{\"values\":[{\"name\":\"ABERTA\",\"dbName\":null},{\"name\":\"ARQUIVADA\",\"dbName\":null},{\"name\":\"RESOLVIDA\",\"dbName\":null}],\"dbName\":null},\"EmailSentimentLevel\":{\"values\":[{\"name\":\"MUITO_POSITIVO\",\"dbName\":null},{\"name\":\"POSITIVO\",\"dbName\":null},{\"name\":\"NEUTRO\",\"dbName\":null},{\"name\":\"NEGATIVO\",\"dbName\":null},{\"name\":\"MUITO_NEGATIVO\",\"dbName\":null}],\"dbName\":null},\"FilaEmailPrioridade\":{\"values\":[{\"name\":\"BAIXA\",\"dbName\":null},{\"name\":\"NORMAL\",\"dbName\":null},{\"name\":\"ALTA\",\"dbName\":null},{\"name\":\"URGENTE\",\"dbName\":null}],\"dbName\":null},\"ActorType\":{\"values\":[{\"name\":\"USER\",\"dbName\":null},{\"name\":\"SYSTEM\",\"dbName\":null},{\"name\":\"GABI_IA\",\"dbName\":null},{\"name\":\"ADMIN\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "servicos-global/tenant/generated/query_engine-windows.dll.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-1.1.x.so.node");
path.join(process.cwd(), "servicos-global/tenant/generated/libquery_engine-debian-openssl-1.1.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "servicos-global/tenant/generated/schema.prisma")
