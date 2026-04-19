
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
} = require('./runtime/edge.js')


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





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.OrganizacaoScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  status: 'status',
  clerk_org_id: 'clerk_org_id',
  stripe_customer_id: 'stripe_customer_id',
  cnpj: 'cnpj',
  state: 'state',
  city: 'city',
  segment: 'segment',
  tipo_empresa: 'tipo_empresa',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UsuarioScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  clerk_user_id: 'clerk_user_id',
  email: 'email',
  name: 'name',
  role: 'role',
  preferred_company_id: 'preferred_company_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AssinaturaProdutoGravityScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  status: 'status',
  stripe_subscription_id: 'stripe_subscription_id',
  stripe_price_id: 'stripe_price_id',
  trial_ends_at: 'trial_ends_at',
  current_period_start: 'current_period_start',
  current_period_end: 'current_period_end',
  cancelled_at: 'cancelled_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UsuarioPermissaoScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  user_id: 'user_id',
  product_id: 'product_id',
  permission: 'permission',
  granted_by: 'granted_by',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.GravityAdminPermissionScalarFieldEnum = {
  id: 'id',
  admin_id: 'admin_id',
  resource: 'resource',
  action: 'action',
  granted_by: 'granted_by',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.WorkspaceScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  name: 'name',
  subdomain: 'subdomain',
  cnpj: 'cnpj',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UsuarioWorkspaceScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  user_id: 'user_id',
  company_id: 'company_id',
  role: 'role',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProductConfigScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  product_key: 'product_key',
  config: 'config',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProdutoGravityWorkspaceScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  product_key: 'product_key',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProdutoGravityScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  status: 'status',
  launch_date: 'launch_date',
  has_setup: 'has_setup',
  setup_price: 'setup_price',
  setup_currency: 'setup_currency',
  billing_type: 'billing_type',
  unit_price: 'unit_price',
  unit_currency: 'unit_currency',
  minimum_price: 'minimum_price',
  minimum_currency: 'minimum_currency',
  total_price: 'total_price',
  total_currency: 'total_currency',
  user_limit_type: 'user_limit_type',
  base_users_qty: 'base_users_qty',
  extra_user_price: 'extra_user_price',
  extra_user_currency: 'extra_user_currency',
  helpdesk_hours: 'helpdesk_hours',
  extra_hour_price: 'extra_hour_price',
  extra_hour_currency: 'extra_hour_currency',
  gabi_quota_mensal: 'gabi_quota_mensal',
  backend_module: 'backend_module',
  target_audience: 'target_audience',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.PriceTierScalarFieldEnum = {
  id: 'id',
  product_id: 'product_id',
  range_from: 'range_from',
  range_to: 'range_to',
  price: 'price',
  currency: 'currency',
  created_at: 'created_at'
};

exports.Prisma.SpecialNegotiationScalarFieldEnum = {
  id: 'id',
  product_id: 'product_id',
  tenant_id: 'tenant_id',
  tenant_name: 'tenant_name',
  agreement: 'agreement',
  starts_at: 'starts_at',
  ends_at: 'ends_at',
  is_unlimited: 'is_unlimited',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.DeployScalarFieldEnum = {
  id: 'id',
  deploy_number: 'deploy_number',
  area: 'area',
  version: 'version',
  description: 'description',
  environment: 'environment',
  status: 'status',
  deployed_by: 'deployed_by',
  deployed_by_user_id: 'deployed_by_user_id',
  deployed_at: 'deployed_at',
  created_at: 'created_at'
};

exports.Prisma.FornecedorOrganizacaoScalarFieldEnum = {
  id: 'id',
  clerk_user_id: 'clerk_user_id',
  tenant_id: 'tenant_id',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SegurancaScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  actor_id: 'actor_id',
  actor_type: 'actor_type',
  action: 'action',
  severity: 'severity',
  status: 'status',
  description: 'description',
  ip: 'ip',
  endpoint: 'endpoint',
  user_id: 'user_id',
  product_id: 'product_id',
  correlation_id: 'correlation_id',
  metadata: 'metadata',
  created_at: 'created_at'
};

exports.Prisma.RequisicoesScalarFieldEnum = {
  id: 'id',
  key: 'key',
  tenant_id: 'tenant_id',
  ip: 'ip',
  endpoint: 'endpoint',
  count: 'count',
  limit_max: 'limit_max',
  blocked: 'blocked',
  window_start: 'window_start',
  created_at: 'created_at'
};

exports.Prisma.ServicosScalarFieldEnum = {
  id: 'id',
  service: 'service',
  url: 'url',
  status: 'status',
  latency_ms: 'latency_ms',
  last_error: 'last_error',
  checked_at: 'checked_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CambioScalarFieldEnum = {
  id: 'id',
  moeda: 'moeda',
  compra: 'compra',
  venda: 'venda',
  data_cotacao: 'data_cotacao',
  hora_cotacao: 'hora_cotacao',
  boletim: 'boletim',
  fonte: 'fonte',
  criado_em: 'criado_em'
};

exports.Prisma.TestesScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  type: 'type',
  escopo: 'escopo',
  sublocal: 'sublocal',
  module: 'module',
  test_name: 'test_name',
  test_id: 'test_id',
  result: 'result',
  duration: 'duration',
  error_log: 'error_log',
  ai_analysis: 'ai_analysis',
  screenshot: 'screenshot',
  ambiente: 'ambiente',
  run_id: 'run_id',
  triggered_by: 'triggered_by',
  created_at: 'created_at'
};

exports.Prisma.TestScheduleScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  ativo: 'ativo',
  frequencia: 'frequencia',
  hora: 'hora',
  minuto: 'minuto',
  tipos: 'tipos',
  escopos: 'escopos',
  ambiente: 'ambiente',
  alertas: 'alertas',
  ultima_exec: 'ultima_exec',
  proxima_exec: 'proxima_exec',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.TestPlanScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  versao: 'versao',
  tipo: 'tipo',
  escopo: 'escopo',
  sublocal: 'sublocal',
  tela: 'tela',
  rota: 'rota',
  criticidade: 'criticidade',
  ambientes: 'ambientes',
  componente_path: 'componente_path',
  spec_path: 'spec_path',
  mapeamento_path: 'mapeamento_path',
  cobertura_pct: 'cobertura_pct',
  passos_total: 'passos_total',
  resumo_executivo: 'resumo_executivo',
  plano_completo: 'plano_completo',
  status: 'status',
  ultima_execucao: 'ultima_execucao',
  ultimo_resultado: 'ultimo_resultado',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.FaturaProdutosGravityScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  numero_fatura_servicos_gravity: 'numero_fatura_servicos_gravity',
  status_fatura_servicos_gravity: 'status_fatura_servicos_gravity',
  organizacao_fatura_servicos_gravity: 'organizacao_fatura_servicos_gravity',
  email_organizacao_fatura_servicos_gravity: 'email_organizacao_fatura_servicos_gravity',
  valor_total_fatura_servicos_gravity: 'valor_total_fatura_servicos_gravity',
  moeda_fatura_servicos_gravity: 'moeda_fatura_servicos_gravity',
  competencia_fatura_servicos_gravity: 'competencia_fatura_servicos_gravity',
  data_fatura_servicos_gravity: 'data_fatura_servicos_gravity',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MetricasGeminiScalarFieldEnum = {
  id: 'id',
  nome_llm: 'nome_llm',
  data_analise_llm: 'data_analise_llm',
  total_analise_llm: 'total_analise_llm',
  total_token_llm: 'total_token_llm',
  custo_llm: 'custo_llm',
  latencia_llm: 'latencia_llm',
  confianca_alta_llm: 'confianca_alta_llm',
  confianca_media_llm: 'confianca_media_llm',
  confianca_baixa_llm: 'confianca_baixa_llm',
  quantidade_codigo_validado_llm: 'quantidade_codigo_validado_llm',
  created_at: 'created_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
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
exports.TenantStatus = exports.$Enums.TenantStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED',
  PENDING_SETUP: 'PENDING_SETUP'
};

exports.UserRole = exports.$Enums.UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MASTER: 'MASTER',
  STANDARD: 'STANDARD',
  SUPPLIER: 'SUPPLIER'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELLED: 'CANCELLED',
  TRIALING: 'TRIALING',
  INCOMPLETE: 'INCOMPLETE'
};

exports.CompanyStatus = exports.$Enums.CompanyStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

exports.UserMembershipRole = exports.$Enums.UserMembershipRole = {
  MASTER: 'MASTER',
  STANDARD: 'STANDARD',
  SUPPLIER: 'SUPPLIER'
};

exports.ProductStatus = exports.$Enums.ProductStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  COMING_SOON: 'COMING_SOON',
  LEGACY: 'LEGACY',
  INACTIVE: 'INACTIVE'
};

exports.BillingType = exports.$Enums.BillingType = {
  MONTHLY: 'MONTHLY',
  PER_PROCESS: 'PER_PROCESS',
  PER_DOCUMENT: 'PER_DOCUMENT',
  PER_ESTIMATE: 'PER_ESTIMATE',
  PER_DI_DUIMP: 'PER_DI_DUIMP',
  PER_DUE: 'PER_DUE',
  PER_PRODUCT: 'PER_PRODUCT',
  PER_FLOW: 'PER_FLOW',
  PER_LPCO: 'PER_LPCO'
};

exports.UserLimitType = exports.$Enums.UserLimitType = {
  UNLIMITED: 'UNLIMITED',
  LIMITED: 'LIMITED'
};

exports.DeployEnvironment = exports.$Enums.DeployEnvironment = {
  DEVELOPMENT: 'DEVELOPMENT',
  STAGING: 'STAGING',
  PRODUCTION: 'PRODUCTION',
  ALL: 'ALL'
};

exports.DeployStatus = exports.$Enums.DeployStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  ROLLBACK: 'ROLLBACK',
  IN_PROGRESS: 'IN_PROGRESS'
};

exports.FaturaStatus = exports.$Enums.FaturaStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  PAID: 'PAID',
  VOID: 'VOID',
  OVERDUE: 'OVERDUE',
  UNCOLLECTIBLE: 'UNCOLLECTIBLE'
};

exports.Prisma.ModelName = {
  Organizacao: 'Organizacao',
  Usuario: 'Usuario',
  AssinaturaProdutoGravity: 'AssinaturaProdutoGravity',
  UsuarioPermissao: 'UsuarioPermissao',
  GravityAdminPermission: 'GravityAdminPermission',
  Workspace: 'Workspace',
  UsuarioWorkspace: 'UsuarioWorkspace',
  ProductConfig: 'ProductConfig',
  ProdutoGravityWorkspace: 'ProdutoGravityWorkspace',
  ProdutoGravity: 'ProdutoGravity',
  PriceTier: 'PriceTier',
  SpecialNegotiation: 'SpecialNegotiation',
  Deploy: 'Deploy',
  FornecedorOrganizacao: 'FornecedorOrganizacao',
  Seguranca: 'Seguranca',
  Requisicoes: 'Requisicoes',
  Servicos: 'Servicos',
  Cambio: 'Cambio',
  Testes: 'Testes',
  TestSchedule: 'TestSchedule',
  TestPlan: 'TestPlan',
  FaturaProdutosGravity: 'FaturaProdutosGravity',
  MetricasGemini: 'MetricasGemini'
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
      "value": "C:\\Users\\danie\\gravity-antigravity\\configurador\\generated",
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
    "sourceFilePath": "C:\\Users\\danie\\gravity-antigravity\\configurador\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../.env"
  },
  "relativePath": "../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "CONFIGURADOR_DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// configurador/prisma/schema.prisma\n// GERADO PELO AGENTE 0B — BANCO DE DADOS\n// Este arquivo é gerenciado diretamente pelo Configurador.\n// NÃO usar como base para fragments de tenant.\n\ngenerator client {\n  provider      = \"prisma-client-js\"\n  output        = \"../generated\"\n  binaryTargets = [\"native\", \"debian-openssl-1.1.x\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"CONFIGURADOR_DATABASE_URL\")\n}\n\n// ---------------------------------------------------------------------------\n// ENUMS\n// ---------------------------------------------------------------------------\n\nenum TenantStatus {\n  ACTIVE\n  SUSPENDED\n  CANCELLED\n  PENDING_SETUP\n}\n\nenum SubscriptionStatus {\n  ACTIVE\n  PAST_DUE\n  CANCELLED\n  TRIALING\n  INCOMPLETE\n}\n\n// Roles canônicos do sistema — alinhados com skill antigravity-permissoes\nenum UserRole {\n  SUPER_ADMIN // Equipe Gravity — acesso total irrestrito\n  ADMIN // Equipe Gravity — acesso com permissões explícitas\n  MASTER // Cliente — acesso total na organização\n  STANDARD // Cliente — acesso conforme permissões do Master\n  SUPPLIER // Fornecedor — permissões explícitas obrigatórias (cross-tenant)\n}\n\nenum CompanyStatus {\n  ACTIVE\n  INACTIVE\n}\n\nenum UserMembershipRole {\n  MASTER // Acesso implícito a todos os workspaces da organização\n  STANDARD // Acesso apenas aos workspaces onde foi habilitado\n  SUPPLIER // Acesso externo — permissões granulares obrigatórias\n}\n\nenum ServiceTokenScope {\n  SERVICE\n  WEBHOOK\n  CRON\n}\n\n// ---------------------------------------------------------------------------\n// TENANT\n// Cada empresa que assina a plataforma Gravity é um Organizacao.\n// tenant_id = id do próprio registro (self-referencing por convenção).\n// ---------------------------------------------------------------------------\n\nmodel Organizacao {\n  id                 String       @id @default(cuid()) @map(\"id_organizacao\")\n  name               String       @map(\"nome_organizacao\")\n  slug               String       @unique @map(\"subdominio_organizacao\")\n  status             TenantStatus @default(PENDING_SETUP) @map(\"status_organizacao\")\n  clerk_org_id       String?      @unique\n  stripe_customer_id String?      @unique\n\n  // Dados cadastrais da organização\n  cnpj         String? @map(\"cnpj_organizacao\")\n  state        String? @map(\"estado_organizacao\")\n  city         String? @map(\"cidade_organizacao\")\n  segment      String? @map(\"segmento_organizacao\")\n  tipo_empresa String? @map(\"tipo_organizacao\")\n\n  // Metadata\n  created_at DateTime @default(now()) @map(\"data_criacao_organizacao\")\n  updated_at DateTime @updatedAt\n\n  // Relações\n  users                   Usuario[]\n  subscriptions           AssinaturaProdutoGravity[]\n  user_permissions        UsuarioPermissao[]\n  companies               Workspace[]\n  product_configs         ProductConfig[]\n  ProdutoGravityWorkspace ProdutoGravityWorkspace[]\n\n  @@index([status])\n  @@index([slug])\n  @@map(\"organizacao\")\n}\n\n// ---------------------------------------------------------------------------\n// USER\n// Usuário vinculado a um tenant. Autenticado via Clerk.\n// tenant_id é obrigatório — nunca nullable.\n// ---------------------------------------------------------------------------\n\nmodel Usuario {\n  id            String   @id @default(cuid()) @map(\"id_usuario\")\n  tenant_id     String   @map(\"id_organizacao_usuario\")\n  clerk_user_id String   @unique\n  email         String   @map(\"email_usuario\")\n  name          String   @map(\"nome_usuario\")\n  role          UserRole @default(STANDARD) @map(\"tipo_usuario\")\n\n  // Workspace preferido — skip pós-login para Master/Standard\n  // Supplier ignora este campo (fornecedor cross-tenant sempre vê tela de seleção)\n  preferred_company_id String?\n\n  // Timestamps\n  created_at DateTime @default(now()) @map(\"data_criacao_usuario\")\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant            Organizacao        @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  preferred_company Workspace?         @relation(\"UserPreferredCompany\", fields: [preferred_company_id], references: [id], onDelete: SetNull)\n  user_permissions  UsuarioPermissao[]\n  memberships       UsuarioWorkspace[]\n\n  // Email único por tenant\n  @@unique([tenant_id, email])\n  // Índices obrigatórios (tenant_id base + compostos)\n  @@index([tenant_id])\n  @@index([tenant_id, created_at])\n  @@index([tenant_id, role])\n  @@index([preferred_company_id])\n  @@map(\"usuario\")\n}\n\n// ---------------------------------------------------------------------------\n// SUBSCRIPTION\n// Uma assinatura por tenant. Gerenciada via Stripe.\n// tenant_id é obrigatório — nunca nullable.\n// ---------------------------------------------------------------------------\n\nmodel AssinaturaProdutoGravity {\n  id        String             @id @default(cuid())\n  tenant_id String\n  status    SubscriptionStatus @default(TRIALING)\n\n  stripe_subscription_id String? @unique\n  stripe_price_id        String?\n\n  trial_ends_at        DateTime?\n  current_period_start DateTime?\n  current_period_end   DateTime?\n  cancelled_at         DateTime?\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant Organizacao @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, created_at])\n  @@index([tenant_id, status])\n  @@map(\"assinatura_produto_gravity\")\n}\n\n// ---------------------------------------------------------------------------\n// USER PERMISSION (Cadeia 2 — Permissões Granulares por Produto)\n// Permissão granular de um usuário em um produto/workspace específico.\n// Ex: permission = 'email:write', 'simulacusto:read'\n// Alinhado com skill antigravity-permissoes.\n// ---------------------------------------------------------------------------\n\nmodel UsuarioPermissao {\n  id         String @id @default(cuid())\n  tenant_id  String\n  company_id String // workspace onde se aplica (obrigatório)\n  user_id    String\n  product_id String // produto ao qual a permissão pertence\n  permission String // ex: 'email:write', 'simulacusto:read', 'atividades:read'\n  granted_by String // clerk_id do Master que concedeu a permissão\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant Organizacao @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  user   Usuario     @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  // Um usuário não pode ter permissão duplicada no mesmo produto/workspace\n  @@unique([tenant_id, company_id, user_id, product_id, permission])\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, user_id])\n  @@index([tenant_id, company_id, user_id])\n  @@map(\"usuario_permissao\")\n}\n\n// ---------------------------------------------------------------------------\n// GRAVITY ADMIN PERMISSION (Cadeia 1 — Permissões de Edição para Admin Gravity)\n// Controla o que um Admin interno da Gravity pode editar.\n// Super Admin não usa esta tabela — tem acesso irrestrito.\n// ---------------------------------------------------------------------------\n\nmodel GravityAdminPermission {\n  id         String @id @default(cuid())\n  admin_id   String // clerk_id do Admin Gravity\n  resource   String // ex: 'tenants', 'billing', 'deploy', 'usuarios'\n  action     String // 'READ' | 'WRITE' | 'DELETE' | 'MANAGE'\n  granted_by String // clerk_id do Super Admin que concedeu\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Admin não pode ter permissão duplicada no mesmo recurso+ação\n  @@unique([admin_id, resource, action])\n  // Índices obrigatórios\n  @@index([admin_id])\n  @@index([admin_id, resource])\n  @@map(\"permissao_admin_gravity\")\n}\n\n// ---------------------------------------------------------------------------\n// COMPANY\n// Empresa filha (unidade de negócio) dentro de um tenant.\n// Um tenant pode ter até 50 empresas filhas.\n// ---------------------------------------------------------------------------\n\nmodel Workspace {\n  id        String        @id @default(cuid())\n  tenant_id String\n  name      String\n  subdomain String?       @unique\n  cnpj      String?\n  status    CompanyStatus @default(ACTIVE)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant             Organizacao               @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  memberships        UsuarioWorkspace[]\n  company_products   ProdutoGravityWorkspace[]\n  preferred_by_users Usuario[]                 @relation(\"UserPreferredCompany\")\n\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, status])\n  @@index([tenant_id, created_at])\n  @@map(\"workspace\")\n}\n\n// ---------------------------------------------------------------------------\n// USER MEMBERSHIP\n// Habilitação de um usuário do tenant em uma empresa filha.\n// Define o papel (Master/Standard/Supplier) e o acesso a produtos.\n// ---------------------------------------------------------------------------\n\nmodel UsuarioWorkspace {\n  id         String             @id @default(cuid())\n  tenant_id  String\n  user_id    String\n  company_id String\n  role       UserMembershipRole @default(STANDARD)\n  is_active  Boolean            @default(true)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  user    Usuario   @relation(fields: [user_id], references: [id], onDelete: Cascade)\n  company Workspace @relation(fields: [company_id], references: [id], onDelete: Cascade)\n\n  // Usuário não pode ter duplicata de habilitação na mesma empresa\n  @@unique([tenant_id, user_id, company_id])\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, user_id])\n  @@index([tenant_id, company_id])\n  @@map(\"usuario_workspace\")\n}\n\n// ---------------------------------------------------------------------------\n// PRODUCT CONFIG\n// Configurações de produto por tenant. Persistência do PRODUCT_CONFIG.\n// product_key identifica o produto (ex: \"simulacusto\", \"nf-importacao\")\n// ---------------------------------------------------------------------------\n\nmodel ProductConfig {\n  id          String  @id @default(cuid())\n  tenant_id   String\n  product_key String\n  config      Json    @default(\"{}\")\n  is_active   Boolean @default(true)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant Organizacao @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n\n  // Apenas uma config por produto por tenant\n  @@unique([tenant_id, product_key])\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, product_key])\n  @@index([tenant_id, is_active])\n  @@map(\"config_produto_gravity\")\n}\n\n// ---------------------------------------------------------------------------\n// COMPANY PRODUCT (Cadeia 1.5 — Ativação por Workspace)\n// Habilita um produto que o Organizacao já possui para um Workspace específico.\n// ---------------------------------------------------------------------------\n\nmodel ProdutoGravityWorkspace {\n  id          String  @id @default(cuid())\n  tenant_id   String\n  company_id  String\n  product_key String // ex: \"simulacusto\", \"gestao-atividades\"\n  is_active   Boolean @default(true)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant  Organizacao @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  company Workspace   @relation(fields: [company_id], references: [id], onDelete: Cascade)\n\n  // Apenas uma ativação por produto por workspace\n  @@unique([company_id, product_key])\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([company_id])\n  @@index([company_id, is_active])\n  @@map(\"produto_gravity_workspace\")\n}\n\n// ---------------------------------------------------------------------------\n// PRODUCT (Catálogo Master da Plataforma)\n// Representa cada produto disponível no portfólio Gravity.\n// Gerenciado exclusivamente por gravity_admin via /api/admin/products.\n// NÃO confundir com ProductConfig (que é a ativação por tenant).\n// ---------------------------------------------------------------------------\n\nenum ProductStatus {\n  ACTIVE\n  SUSPENDED\n  COMING_SOON\n  LEGACY\n  INACTIVE\n}\n\nenum BillingType {\n  MONTHLY\n  PER_PROCESS\n  PER_DOCUMENT\n  PER_ESTIMATE\n  PER_DI_DUIMP\n  PER_DUE\n  PER_PRODUCT\n  PER_FLOW\n  PER_LPCO\n}\n\nenum UserLimitType {\n  UNLIMITED\n  LIMITED\n}\n\nmodel ProdutoGravity {\n  id          String        @id @default(cuid())\n  name        String\n  slug        String        @unique\n  description String\n  status      ProductStatus @default(ACTIVE)\n  launch_date DateTime?\n\n  // Setup\n  has_setup      Boolean  @default(false)\n  setup_price    Decimal? @db.Decimal(15, 2)\n  setup_currency String   @default(\"BRL\")\n\n  // Billing\n  billing_type     BillingType @default(MONTHLY)\n  unit_price       Decimal     @db.Decimal(15, 2)\n  unit_currency    String      @default(\"BRL\")\n  minimum_price    Decimal     @default(0) @db.Decimal(15, 2)\n  minimum_currency String      @default(\"BRL\")\n  total_price      Decimal?    @db.Decimal(15, 2)\n  total_currency   String      @default(\"BRL\")\n\n  // Users\n  user_limit_type     UserLimitType @default(UNLIMITED)\n  base_users_qty      Int?\n  extra_user_price    Decimal?      @db.Decimal(15, 2)\n  extra_user_currency String        @default(\"BRL\")\n\n  // Support\n  helpdesk_hours      Int      @default(0)\n  extra_hour_price    Decimal? @db.Decimal(15, 2)\n  extra_hour_currency String   @default(\"BRL\")\n\n  // GABI On-Demand — quota padrão de tokens por tenant/mês\n  gabi_quota_mensal Int @default(0)\n\n  // Metadata\n  backend_module  String? // ex: \"simula-custo\", \"bid-frete\"\n  target_audience String?\n\n  // Timestamps\n  created_at DateTime  @default(now())\n  updated_at DateTime  @updatedAt\n  deleted_at DateTime? // soft-delete — preserva negociações especiais\n\n  // Relations\n  price_tiers  PriceTier[]\n  negotiations SpecialNegotiation[]\n\n  @@index([status])\n  @@index([slug])\n  @@index([deleted_at])\n  @@map(\"produtos_gravity\")\n}\n\n// ---------------------------------------------------------------------------\n// PRICE TIER (Faixas de Preço por Volume)\n// Precificação escalonada — preço varia conforme quantidade.\n// ---------------------------------------------------------------------------\n\nmodel PriceTier {\n  id         String  @id @default(cuid())\n  product_id String\n  range_from Int\n  range_to   Int?\n  price      Decimal @db.Decimal(15, 2)\n  currency   String  @default(\"BRL\")\n\n  // Timestamps\n  created_at DateTime @default(now())\n\n  // Relations\n  product ProdutoGravity @relation(fields: [product_id], references: [id], onDelete: Cascade)\n\n  @@index([product_id])\n  @@index([product_id, range_from])\n  @@map(\"faixa_preco_produto_gravity\")\n}\n\n// ---------------------------------------------------------------------------\n// SPECIAL NEGOTIATION (Negociação Especial por Organizacao)\n// Condições comerciais personalizadas para tenants específicos.\n// ---------------------------------------------------------------------------\n\nmodel SpecialNegotiation {\n  id           String    @id @default(cuid())\n  product_id   String\n  tenant_id    String\n  tenant_name  String\n  agreement    String // Descrição: \"Desconto 20%\", \"Preço fixo R$ 5/proc\"\n  starts_at    DateTime?\n  ends_at      DateTime?\n  is_unlimited Boolean   @default(false)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relations\n  product ProdutoGravity @relation(fields: [product_id], references: [id], onDelete: Cascade)\n\n  @@index([product_id])\n  @@index([tenant_id])\n  @@index([product_id, tenant_id])\n  @@map(\"negociacao_especial_produto_gravity\")\n}\n\n// ---------------------------------------------------------------------------\n// DEPLOY LOG (Histórico de Deploys da Plataforma Gravity)\n// Registro manual de cada deploy feito pelo time (hotfix, migration, release).\n// Global — não é tenant-scoped. Apenas gravity_admin grava/lê.\n// ---------------------------------------------------------------------------\n\nenum DeployEnvironment {\n  DEVELOPMENT\n  STAGING\n  PRODUCTION\n  ALL\n}\n\nenum DeployStatus {\n  SUCCESS\n  FAILED\n  ROLLBACK\n  IN_PROGRESS\n}\n\nmodel Deploy {\n  id                  String            @id @default(cuid()) @map(\"id_deploy\")\n  deploy_number       Int               @default(autoincrement())\n  area                String            @map(\"area_deploy\") // ex: 'configurador', 'pedido', 'bid-frete', 'nucleo-global', 'devops'\n  version             String            @map(\"versao_deploy\") // semver (v1.2.3) ou git sha (8f3a1c2)\n  description         String            @map(\"descricao_deploy\") // resumo das alterações (changelog curto)\n  environment         DeployEnvironment @default(PRODUCTION) @map(\"ambiente_deploy\")\n  status              DeployStatus      @default(SUCCESS) @map(\"status_deploy\")\n  deployed_by         String            @map(\"quem_deploy\") // nome legível do responsável (snapshot no momento do deploy)\n  deployed_by_user_id String?           @map(\"id_usuario_deploy\") // FK opcional para Usuario (pode ser null se deploy veio de CI)\n  deployed_at         DateTime          @default(now()) @map(\"data_execucao_deploy\")\n\n  created_at DateTime @default(now()) @map(\"data_criacao_deploy\")\n\n  @@index([deployed_at])\n  @@index([area])\n  @@index([environment])\n  @@index([status])\n  @@index([area, deployed_at])\n  @@map(\"deploy\")\n}\n\n// ---------------------------------------------------------------------------\n// SUPPLIER TENANT ACCESS\n// Fornecedor cross-tenant — pode prestar serviços para múltiplos tenants.\n// clerk_user_id único no Clerk, múltiplos vínculos aqui.\n// ---------------------------------------------------------------------------\n\nmodel FornecedorOrganizacao {\n  id            String @id @default(cuid())\n  clerk_user_id String\n  tenant_id     String\n  status        String @default(\"active\")\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Unique: um clerk_user_id não pode ter dois acessos ao mesmo tenant\n  @@unique([clerk_user_id, tenant_id])\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([clerk_user_id])\n  @@index([tenant_id, clerk_user_id])\n  @@map(\"fornecedor_organizacao\")\n}\n\n// ---------------------------------------------------------------------------\n// SECURITY EVENT\n// Eventos de segurança registrados pelo securityAuditLogger.\n// Alimenta o painel /admin/seguranca em tempo real.\n// ---------------------------------------------------------------------------\n\nmodel Seguranca {\n  id             String   @id @default(cuid())\n  tenant_id      String\n  actor_id       String\n  actor_type     String // USER | SYSTEM | GABI_IA | ADMIN\n  action         String // AUTH_FAILURE, CROSS_TENANT_ATTEMPT, ROLE_CHANGED, etc.\n  severity       String // CRITICAL | WARNING | INFO\n  status         String   @default(\"DETECTED\") // BLOCKED | ALLOWED | DETECTED\n  description    String?\n  ip             String?\n  endpoint       String?\n  user_id        String?\n  product_id     String?\n  correlation_id String?\n  metadata       Json?    @default(\"{}\")\n  created_at     DateTime @default(now())\n\n  @@index([created_at])\n  @@index([severity])\n  @@index([action])\n  @@index([tenant_id, created_at])\n  @@index([severity, created_at])\n  @@map(\"seguranca\")\n}\n\n// ---------------------------------------------------------------------------\n// RATE LIMIT METRIC\n// Metricas agregadas do rate limiter para monitoramento no painel.\n// ---------------------------------------------------------------------------\n\nmodel Requisicoes {\n  id           String   @id @default(cuid())\n  key          String // tenant:ip combo\n  tenant_id    String?\n  ip           String?\n  endpoint     String\n  count        Int\n  limit_max    Int\n  blocked      Boolean  @default(false)\n  window_start DateTime\n  created_at   DateTime @default(now())\n\n  @@index([created_at])\n  @@index([blocked, created_at])\n  @@index([tenant_id])\n  @@map(\"requisicoes\")\n}\n\n// ---------------------------------------------------------------------------\n// SERVICE HEALTH\n// Snapshot do ultimo health check de cada servico.\n// ---------------------------------------------------------------------------\n\nmodel Servicos {\n  id         String   @id @default(cuid())\n  service    String   @unique // ex: \"configurador\", \"bid-frete\"\n  url        String // health check URL\n  status     String   @default(\"UNKNOWN\") // OK | DEGRADED | DOWN | UNKNOWN\n  latency_ms Int?\n  last_error String?\n  checked_at DateTime @default(now())\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([status])\n  @@index([checked_at])\n  @@map(\"servicos\")\n}\n\n// ---------------------------------------------------------------------------\n// TAXA CAMBIO\n// Cotações PTAX oficiais do BCB armazenadas para consulta centralizada.\n// Tabela global — sem tenant_id (rates são públicas, iguais para todos).\n// Alimentada via POST /api/v1/taxa-cambio/sync (busca do bid-cambio/BCB).\n// ---------------------------------------------------------------------------\n\nmodel Cambio {\n  id           String   @id @default(cuid())\n  moeda        String // USD, EUR, GBP, CHF, CNY, JPY\n  compra       Decimal  @db.Decimal(15, 6)\n  venda        Decimal  @db.Decimal(15, 6)\n  data_cotacao DateTime // data da cotação (dia, meia-noite UTC)\n  hora_cotacao String? // ex: \"13:02\"\n  boletim      String   @default(\"Fechamento\") // \"1º Boletim\" | \"2º Boletim\" | \"3º Boletim\" | \"Fechamento\"\n  fonte        String   @default(\"BCB/PTAX\")\n  criado_em    DateTime @default(now())\n\n  // Garante 1 registro por moeda × dia × boletim (upsert idempotente)\n  @@unique([moeda, data_cotacao, boletim])\n  @@index([moeda])\n  @@index([moeda, data_cotacao])\n  @@index([data_cotacao])\n  @@index([criado_em])\n  @@map(\"cambio\")\n}\n\n// ---------------------------------------------------------------------------\n// SISTEMA DE TESTES — Testes, TestSchedule, TestPlan\n// ---------------------------------------------------------------------------\n// Tabelas que suportam o sistema de testes automatizado do Admin/Testes.\n// Documentação completa em documentos-tecnicos/testes/tecnico/.\n// Convenção de IDs: TST-{TIPO}-{ESCOPO}-{NNNNNN}\n\nmodel Testes {\n  id           String   @id @default(cuid())\n  tenant_id    String   @default(\"platform\") // sempre \"platform\" — logs globais\n  type         String // UNI | CON | FUN | CRO | E2E | PEN\n  escopo       String // LOGIN | CONFIG | ADMIN | HUB | CORE | MARKET | TENANT | DBASE | PEDIDO | NFIMP | LPCO | BIDFRT | BIDCAM | SIMCUS | FINCOM | PROCSO\n  sublocal     String?\n  module       String\n  test_name    String\n  test_id      String? // TST-E2E-CONFIG-000001 (quando vinculado a um plano)\n  result       String // APROVADO | REPROVADO | ERRO\n  duration     String\n  error_log    String?  @db.Text\n  ai_analysis  Json? // AiAnalysis schema do gemini-test-analyzer\n  screenshot   String? // path do PNG capturado pela fixture\n  ambiente     String   @default(\"Local\") // Local | Staging | Producao\n  run_id       String? // agrupa logs do mesmo run\n  triggered_by String? // userId que disparou (manual) ou \"cron\" (automático)\n  created_at   DateTime @default(now())\n\n  @@index([tenant_id])\n  @@index([created_at])\n  @@index([type, escopo])\n  @@index([result])\n  @@index([run_id])\n  @@index([test_id])\n  @@map(\"testes\")\n}\n\nmodel TestSchedule {\n  id           String    @id @default(cuid())\n  tenant_id    String    @default(\"platform\")\n  ativo        Boolean   @default(false)\n  frequencia   String    @default(\"Manual\") // Manual | Diario | Semanal\n  hora         Int       @default(0) // 0-23\n  minuto       Int       @default(0) // 0-59\n  tipos        Json // { uni: bool, con: bool, fun: bool, cro: bool, e2e: bool, pen: bool }\n  escopos      String[] // ['CONFIG','PEDIDO','ADMIN',...]\n  ambiente     String    @default(\"Local\") // Local | Staging | Producao\n  alertas      Json      @default(\"[]\") // [{ nome, contato, condicao, canal }]\n  ultima_exec  DateTime?\n  proxima_exec DateTime?\n  created_at   DateTime  @default(now())\n  updated_at   DateTime  @updatedAt\n\n  @@index([tenant_id])\n  @@index([ativo])\n  @@index([proxima_exec])\n  @@map(\"agendamento_teste\")\n}\n\nmodel TestPlan {\n  id               String    @id // TST-E2E-CONFIG-000001\n  tenant_id        String    @default(\"platform\")\n  versao           String    @default(\"1.0\")\n  tipo             String // UNI | CON | FUN | CRO | E2E | PEN\n  escopo           String // LOGIN | CONFIG | ...\n  sublocal         String\n  tela             String\n  rota             String\n  criticidade      String    @default(\"media\") // baixa | media | alta | critica\n  ambientes        String[]\n  componente_path  String\n  spec_path        String?\n  mapeamento_path  String\n  cobertura_pct    Int       @default(0)\n  passos_total     Int       @default(0)\n  resumo_executivo String    @db.Text\n  plano_completo   Json // o JSON inteiro do plano (formato do agente-plano-teste)\n  status           String    @default(\"pendente_validacao\") // pendente_validacao | aprovado | obsoleto\n  ultima_execucao  DateTime?\n  ultimo_resultado String? // APROVADO | REPROVADO | ERRO | NAO_EXECUTADO\n  created_at       DateTime  @default(now())\n  updated_at       DateTime  @updatedAt\n\n  @@index([tenant_id])\n  @@index([tipo, escopo])\n  @@index([status])\n  @@index([sublocal])\n  @@map(\"plano_teste\")\n}\n\n// ---------------------------------------------------------------------------\n// FATURA PRODUTOS GRAVITY (nova — fatura de serviços internos Gravity)\n// ---------------------------------------------------------------------------\n\nenum FaturaStatus {\n  DRAFT\n  OPEN\n  PAID\n  VOID\n  OVERDUE\n  UNCOLLECTIBLE\n}\n\nmodel FaturaProdutosGravity {\n  id                                        String       @id @default(cuid())\n  tenant_id                                 String\n  numero_fatura_servicos_gravity            String\n  status_fatura_servicos_gravity            FaturaStatus @default(DRAFT)\n  organizacao_fatura_servicos_gravity       String\n  email_organizacao_fatura_servicos_gravity String?\n  valor_total_fatura_servicos_gravity       Decimal      @db.Decimal(18, 2)\n  moeda_fatura_servicos_gravity             String       @default(\"brl\")\n  competencia_fatura_servicos_gravity       String?\n  data_fatura_servicos_gravity              DateTime     @default(now())\n  created_at                                DateTime     @default(now())\n  updated_at                                DateTime     @updatedAt\n\n  @@index([tenant_id])\n  @@index([status_fatura_servicos_gravity])\n  @@map(\"fatura_produtos_gravity\")\n}\n\n// ---------------------------------------------------------------------------\n// METRICAS GEMINI (nova — dados de LLM/teste AI)\n// ---------------------------------------------------------------------------\n\nmodel MetricasGemini {\n  id                             String   @id @default(cuid())\n  nome_llm                       String[]\n  data_analise_llm               DateTime\n  total_analise_llm              Int      @default(0)\n  total_token_llm                Int      @default(0)\n  custo_llm                      Decimal  @db.Decimal(10, 4)\n  latencia_llm                   Int      @default(0)\n  confianca_alta_llm             Int      @default(0)\n  confianca_media_llm            Int      @default(0)\n  confianca_baixa_llm            Int      @default(0)\n  quantidade_codigo_validado_llm Int      @default(0)\n  created_at                     DateTime @default(now())\n\n  @@index([data_analise_llm])\n  @@map(\"metricas_gemini\")\n}\n",
  "inlineSchemaHash": "27f0989852af8557045325f5946442da016d2ec3bd614ced4f3d060ff61e3e3c",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Organizacao\":{\"dbName\":\"organizacao\",\"fields\":[{\"name\":\"id\",\"dbName\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"dbName\":\"nome_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"dbName\":\"subdominio_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"dbName\":\"status_organizacao\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"TenantStatus\",\"default\":\"PENDING_SETUP\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clerk_org_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripe_customer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cnpj\",\"dbName\":\"cnpj_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"state\",\"dbName\":\"estado_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"dbName\":\"cidade_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"segment\",\"dbName\":\"segmento_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_empresa\",\"dbName\":\"tipo_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"dbName\":\"data_criacao_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"users\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Usuario\",\"relationName\":\"OrganizacaoToUsuario\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subscriptions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AssinaturaProdutoGravity\",\"relationName\":\"AssinaturaProdutoGravityToOrganizacao\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_permissions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UsuarioPermissao\",\"relationName\":\"OrganizacaoToUsuarioPermissao\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companies\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Workspace\",\"relationName\":\"OrganizacaoToWorkspace\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_configs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProductConfig\",\"relationName\":\"OrganizacaoToProductConfig\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ProdutoGravityWorkspace\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProdutoGravityWorkspace\",\"relationName\":\"OrganizacaoToProdutoGravityWorkspace\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Usuario\":{\"dbName\":\"usuario\",\"fields\":[{\"name\":\"id\",\"dbName\":\"id_usuario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"dbName\":\"id_organizacao_usuario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clerk_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"dbName\":\"email_usuario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"dbName\":\"nome_usuario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"dbName\":\"tipo_usuario\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserRole\",\"default\":\"STANDARD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferred_company_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"dbName\":\"data_criacao_usuario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Organizacao\",\"relationName\":\"OrganizacaoToUsuario\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferred_company\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Workspace\",\"relationName\":\"UserPreferredCompany\",\"relationFromFields\":[\"preferred_company_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_permissions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UsuarioPermissao\",\"relationName\":\"UsuarioToUsuarioPermissao\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"memberships\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UsuarioWorkspace\",\"relationName\":\"UsuarioToUsuarioWorkspace\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"email\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"email\"]}],\"isGenerated\":false},\"AssinaturaProdutoGravity\":{\"dbName\":\"assinatura_produto_gravity\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"SubscriptionStatus\",\"default\":\"TRIALING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripe_subscription_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripe_price_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trial_ends_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"current_period_start\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"current_period_end\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cancelled_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Organizacao\",\"relationName\":\"AssinaturaProdutoGravityToOrganizacao\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UsuarioPermissao\":{\"dbName\":\"usuario_permissao\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"permission\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"granted_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Organizacao\",\"relationName\":\"OrganizacaoToUsuarioPermissao\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Usuario\",\"relationName\":\"UsuarioToUsuarioPermissao\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"company_id\",\"user_id\",\"product_id\",\"permission\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"company_id\",\"user_id\",\"product_id\",\"permission\"]}],\"isGenerated\":false},\"GravityAdminPermission\":{\"dbName\":\"permissao_admin_gravity\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"admin_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resource\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"granted_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"admin_id\",\"resource\",\"action\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"admin_id\",\"resource\",\"action\"]}],\"isGenerated\":false},\"Workspace\":{\"dbName\":\"workspace\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subdomain\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cnpj\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"CompanyStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Organizacao\",\"relationName\":\"OrganizacaoToWorkspace\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"memberships\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UsuarioWorkspace\",\"relationName\":\"UsuarioWorkspaceToWorkspace\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_products\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProdutoGravityWorkspace\",\"relationName\":\"ProdutoGravityWorkspaceToWorkspace\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferred_by_users\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Usuario\",\"relationName\":\"UserPreferredCompany\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UsuarioWorkspace\":{\"dbName\":\"usuario_workspace\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserMembershipRole\",\"default\":\"STANDARD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Usuario\",\"relationName\":\"UsuarioToUsuarioWorkspace\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Workspace\",\"relationName\":\"UsuarioWorkspaceToWorkspace\",\"relationFromFields\":[\"company_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"user_id\",\"company_id\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"user_id\",\"company_id\"]}],\"isGenerated\":false},\"ProductConfig\":{\"dbName\":\"config_produto_gravity\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"config\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Organizacao\",\"relationName\":\"OrganizacaoToProductConfig\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"product_key\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"product_key\"]}],\"isGenerated\":false},\"ProdutoGravityWorkspace\":{\"dbName\":\"produto_gravity_workspace\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Organizacao\",\"relationName\":\"OrganizacaoToProdutoGravityWorkspace\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Workspace\",\"relationName\":\"ProdutoGravityWorkspaceToWorkspace\",\"relationFromFields\":[\"company_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"company_id\",\"product_key\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"company_id\",\"product_key\"]}],\"isGenerated\":false},\"ProdutoGravity\":{\"dbName\":\"produtos_gravity\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ProductStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"launch_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"has_setup\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"setup_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"setup_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"billing_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BillingType\",\"default\":\"MONTHLY\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minimum_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minimum_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_limit_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserLimitType\",\"default\":\"UNLIMITED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"base_users_qty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extra_user_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extra_user_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"helpdesk_hours\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extra_hour_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extra_hour_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gabi_quota_mensal\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"backend_module\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"target_audience\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"deleted_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price_tiers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PriceTier\",\"relationName\":\"PriceTierToProdutoGravity\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"negotiations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SpecialNegotiation\",\"relationName\":\"ProdutoGravityToSpecialNegotiation\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PriceTier\":{\"dbName\":\"faixa_preco_produto_gravity\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"range_from\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"range_to\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProdutoGravity\",\"relationName\":\"PriceTierToProdutoGravity\",\"relationFromFields\":[\"product_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SpecialNegotiation\":{\"dbName\":\"negociacao_especial_produto_gravity\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agreement\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"starts_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ends_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_unlimited\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"product\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProdutoGravity\",\"relationName\":\"ProdutoGravityToSpecialNegotiation\",\"relationFromFields\":[\"product_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Deploy\":{\"dbName\":\"deploy\",\"fields\":[{\"name\":\"id\",\"dbName\":\"id_deploy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deploy_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"area\",\"dbName\":\"area_deploy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"dbName\":\"versao_deploy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"dbName\":\"descricao_deploy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"environment\",\"dbName\":\"ambiente_deploy\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DeployEnvironment\",\"default\":\"PRODUCTION\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"dbName\":\"status_deploy\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DeployStatus\",\"default\":\"SUCCESS\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deployed_by\",\"dbName\":\"quem_deploy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deployed_by_user_id\",\"dbName\":\"id_usuario_deploy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deployed_at\",\"dbName\":\"data_execucao_deploy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"dbName\":\"data_criacao_deploy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"FornecedorOrganizacao\":{\"dbName\":\"fornecedor_organizacao\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clerk_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"active\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"clerk_user_id\",\"tenant_id\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"clerk_user_id\",\"tenant_id\"]}],\"isGenerated\":false},\"Seguranca\":{\"dbName\":\"seguranca\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"severity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"DETECTED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ip\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endpoint\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"correlation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Requisicoes\":{\"dbName\":\"requisicoes\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ip\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endpoint\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"limit_max\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"blocked\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"window_start\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Servicos\":{\"dbName\":\"servicos\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"UNKNOWN\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latency_ms\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_error\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"checked_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Cambio\":{\"dbName\":\"cambio\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moeda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compra\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"venda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_cotacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hora_cotacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"boletim\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"Fechamento\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fonte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BCB/PTAX\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criado_em\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"moeda\",\"data_cotacao\",\"boletim\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"moeda\",\"data_cotacao\",\"boletim\"]}],\"isGenerated\":false},\"Testes\":{\"dbName\":\"testes\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"platform\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escopo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sublocal\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"module\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"test_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"test_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"result\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duration\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"error_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ai_analysis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"screenshot\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ambiente\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"Local\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"run_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"triggered_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TestSchedule\":{\"dbName\":\"agendamento_teste\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"platform\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frequencia\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"Manual\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hora\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minuto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escopos\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ambiente\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"Local\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alertas\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ultima_exec\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proxima_exec\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TestPlan\":{\"dbName\":\"plano_teste\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"platform\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"versao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"1.0\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escopo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sublocal\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tela\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rota\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criticidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"media\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ambientes\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"componente_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"spec_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mapeamento_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cobertura_pct\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passos_total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resumo_executivo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"plano_completo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"pendente_validacao\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ultima_execucao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ultimo_resultado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"FaturaProdutosGravity\":{\"dbName\":\"fatura_produtos_gravity\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_fatura_servicos_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_fatura_servicos_gravity\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"FaturaStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"organizacao_fatura_servicos_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email_organizacao_fatura_servicos_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"valor_total_fatura_servicos_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moeda_fatura_servicos_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"brl\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"competencia_fatura_servicos_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_fatura_servicos_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"MetricasGemini\":{\"dbName\":\"metricas_gemini\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_llm\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_analise_llm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_analise_llm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_token_llm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"custo_llm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latencia_llm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confianca_alta_llm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confianca_media_llm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confianca_baixa_llm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantidade_codigo_validado_llm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"TenantStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"SUSPENDED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"PENDING_SETUP\",\"dbName\":null}],\"dbName\":null},\"SubscriptionStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"PAST_DUE\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"TRIALING\",\"dbName\":null},{\"name\":\"INCOMPLETE\",\"dbName\":null}],\"dbName\":null},\"UserRole\":{\"values\":[{\"name\":\"SUPER_ADMIN\",\"dbName\":null},{\"name\":\"ADMIN\",\"dbName\":null},{\"name\":\"MASTER\",\"dbName\":null},{\"name\":\"STANDARD\",\"dbName\":null},{\"name\":\"SUPPLIER\",\"dbName\":null}],\"dbName\":null},\"CompanyStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null}],\"dbName\":null},\"UserMembershipRole\":{\"values\":[{\"name\":\"MASTER\",\"dbName\":null},{\"name\":\"STANDARD\",\"dbName\":null},{\"name\":\"SUPPLIER\",\"dbName\":null}],\"dbName\":null},\"ServiceTokenScope\":{\"values\":[{\"name\":\"SERVICE\",\"dbName\":null},{\"name\":\"WEBHOOK\",\"dbName\":null},{\"name\":\"CRON\",\"dbName\":null}],\"dbName\":null},\"ProductStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"SUSPENDED\",\"dbName\":null},{\"name\":\"COMING_SOON\",\"dbName\":null},{\"name\":\"LEGACY\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null}],\"dbName\":null},\"BillingType\":{\"values\":[{\"name\":\"MONTHLY\",\"dbName\":null},{\"name\":\"PER_PROCESS\",\"dbName\":null},{\"name\":\"PER_DOCUMENT\",\"dbName\":null},{\"name\":\"PER_ESTIMATE\",\"dbName\":null},{\"name\":\"PER_DI_DUIMP\",\"dbName\":null},{\"name\":\"PER_DUE\",\"dbName\":null},{\"name\":\"PER_PRODUCT\",\"dbName\":null},{\"name\":\"PER_FLOW\",\"dbName\":null},{\"name\":\"PER_LPCO\",\"dbName\":null}],\"dbName\":null},\"UserLimitType\":{\"values\":[{\"name\":\"UNLIMITED\",\"dbName\":null},{\"name\":\"LIMITED\",\"dbName\":null}],\"dbName\":null},\"DeployEnvironment\":{\"values\":[{\"name\":\"DEVELOPMENT\",\"dbName\":null},{\"name\":\"STAGING\",\"dbName\":null},{\"name\":\"PRODUCTION\",\"dbName\":null},{\"name\":\"ALL\",\"dbName\":null}],\"dbName\":null},\"DeployStatus\":{\"values\":[{\"name\":\"SUCCESS\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"ROLLBACK\",\"dbName\":null},{\"name\":\"IN_PROGRESS\",\"dbName\":null}],\"dbName\":null},\"FaturaStatus\":{\"values\":[{\"name\":\"DRAFT\",\"dbName\":null},{\"name\":\"OPEN\",\"dbName\":null},{\"name\":\"PAID\",\"dbName\":null},{\"name\":\"VOID\",\"dbName\":null},{\"name\":\"OVERDUE\",\"dbName\":null},{\"name\":\"UNCOLLECTIBLE\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    CONFIGURADOR_DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['CONFIGURADOR_DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.CONFIGURADOR_DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

