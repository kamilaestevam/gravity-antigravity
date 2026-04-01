
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

exports.Prisma.TenantScalarFieldEnum = {
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
  website: 'website',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  clerk_user_id: 'clerk_user_id',
  email: 'email',
  name: 'name',
  role: 'role',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  plan: 'plan',
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

exports.Prisma.UserPermissionScalarFieldEnum = {
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

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  name: 'name',
  subdomain: 'subdomain',
  cnpj: 'cnpj',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UserMembershipScalarFieldEnum = {
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

exports.Prisma.CompanyProductScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  company_id: 'company_id',
  product_key: 'product_key',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProductScalarFieldEnum = {
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
  backend_module: 'backend_module',
  target_audience: 'target_audience',
  created_at: 'created_at',
  updated_at: 'updated_at'
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

exports.Prisma.StripeEventScalarFieldEnum = {
  id: 'id',
  type: 'type',
  processed_at: 'processed_at',
  payload: 'payload'
};

exports.Prisma.SupplierTenantAccessScalarFieldEnum = {
  id: 'id',
  clerk_user_id: 'clerk_user_id',
  tenant_id: 'tenant_id',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SecurityEventScalarFieldEnum = {
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

exports.Prisma.RateLimitMetricScalarFieldEnum = {
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

exports.Prisma.ServiceHealthScalarFieldEnum = {
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

exports.Prisma.GlobalProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  status: 'status',
  type_billing: 'type_billing',
  setup_price: 'setup_price',
  unit_price: 'unit_price',
  min_price: 'min_price',
  total_price: 'total_price',
  currency: 'currency',
  limit_users: 'limit_users',
  base_users: 'base_users',
  help_desk_hours: 'help_desk_hours',
  backend_module: 'backend_module',
  target_audience: 'target_audience',
  features: 'features',
  pricing_tiers: 'pricing_tiers',
  created_at: 'created_at',
  updated_at: 'updated_at'
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

exports.SubscriptionPlan = exports.$Enums.SubscriptionPlan = {
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE'
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

exports.Prisma.ModelName = {
  Tenant: 'Tenant',
  User: 'User',
  Subscription: 'Subscription',
  UserPermission: 'UserPermission',
  GravityAdminPermission: 'GravityAdminPermission',
  Company: 'Company',
  UserMembership: 'UserMembership',
  ProductConfig: 'ProductConfig',
  CompanyProduct: 'CompanyProduct',
  Product: 'Product',
  PriceTier: 'PriceTier',
  SpecialNegotiation: 'SpecialNegotiation',
  StripeEvent: 'StripeEvent',
  SupplierTenantAccess: 'SupplierTenantAccess',
  SecurityEvent: 'SecurityEvent',
  RateLimitMetric: 'RateLimitMetric',
  ServiceHealth: 'ServiceHealth',
  GlobalProduct: 'GlobalProduct'
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
    "rootEnvPath": null
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
  "inlineSchema": "// configurador/prisma/schema.prisma\n// GERADO PELO AGENTE 0B — BANCO DE DADOS\n// Este arquivo é gerenciado diretamente pelo Configurador.\n// NÃO usar como base para fragments de tenant.\n\ngenerator client {\n  provider      = \"prisma-client-js\"\n  output        = \"../generated\"\n  binaryTargets = [\"native\", \"debian-openssl-1.1.x\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"CONFIGURADOR_DATABASE_URL\")\n}\n\n// ---------------------------------------------------------------------------\n// ENUMS\n// ---------------------------------------------------------------------------\n\nenum TenantStatus {\n  ACTIVE\n  SUSPENDED\n  CANCELLED\n  PENDING_SETUP\n}\n\nenum SubscriptionStatus {\n  ACTIVE\n  PAST_DUE\n  CANCELLED\n  TRIALING\n  INCOMPLETE\n}\n\nenum SubscriptionPlan {\n  STARTER\n  PROFESSIONAL\n  ENTERPRISE\n}\n\n// Roles canônicos do sistema — alinhados com skill antigravity-permissoes\nenum UserRole {\n  SUPER_ADMIN // Equipe Gravity — acesso total irrestrito\n  ADMIN // Equipe Gravity — acesso com permissões explícitas\n  MASTER // Cliente — acesso total na organização\n  STANDARD // Cliente — acesso conforme permissões do Master\n  SUPPLIER // Fornecedor — permissões explícitas obrigatórias (cross-tenant)\n}\n\nenum CompanyStatus {\n  ACTIVE\n  INACTIVE\n}\n\nenum UserMembershipRole {\n  MASTER // Acesso implícito a todos os workspaces da organização\n  STANDARD // Acesso apenas aos workspaces onde foi habilitado\n  SUPPLIER // Acesso externo — permissões granulares obrigatórias\n}\n\nenum ServiceTokenScope {\n  SERVICE\n  WEBHOOK\n  CRON\n}\n\n// ---------------------------------------------------------------------------\n// TENANT\n// Cada empresa que assina a plataforma Gravity é um Tenant.\n// tenant_id = id do próprio registro (self-referencing por convenção).\n// ---------------------------------------------------------------------------\n\nmodel Tenant {\n  id                 String       @id @default(cuid())\n  name               String\n  slug               String       @unique\n  status             TenantStatus @default(PENDING_SETUP)\n  clerk_org_id       String?      @unique\n  stripe_customer_id String?      @unique\n\n  // Dados cadastrais da organização\n  cnpj    String?\n  state   String?\n  city    String?\n  segment String?\n  website String?\n\n  // Metadata\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  users            User[]\n  subscriptions    Subscription[]\n  user_permissions UserPermission[]\n  companies        Company[]\n  product_configs  ProductConfig[]\n  CompanyProduct   CompanyProduct[]\n\n  @@index([status])\n  @@index([slug])\n}\n\n// ---------------------------------------------------------------------------\n// USER\n// Usuário vinculado a um tenant. Autenticado via Clerk.\n// tenant_id é obrigatório — nunca nullable.\n// ---------------------------------------------------------------------------\n\nmodel User {\n  id            String   @id @default(cuid())\n  tenant_id     String\n  clerk_user_id String   @unique\n  email         String\n  name          String\n  role          UserRole @default(STANDARD)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant           Tenant           @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  user_permissions UserPermission[]\n  memberships      UserMembership[]\n\n  // Email único por tenant\n  @@unique([tenant_id, email])\n  // Índices obrigatórios (tenant_id base + compostos)\n  @@index([tenant_id])\n  @@index([tenant_id, created_at])\n  @@index([tenant_id, role])\n}\n\n// ---------------------------------------------------------------------------\n// SUBSCRIPTION\n// Uma assinatura por tenant. Gerenciada via Stripe.\n// tenant_id é obrigatório — nunca nullable.\n// ---------------------------------------------------------------------------\n\nmodel Subscription {\n  id        String             @id @default(cuid())\n  tenant_id String\n  plan      SubscriptionPlan   @default(STARTER)\n  status    SubscriptionStatus @default(TRIALING)\n\n  stripe_subscription_id String? @unique\n  stripe_price_id        String?\n\n  trial_ends_at        DateTime?\n  current_period_start DateTime?\n  current_period_end   DateTime?\n  cancelled_at         DateTime?\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant Tenant @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, created_at])\n  @@index([tenant_id, status])\n}\n\n// ---------------------------------------------------------------------------\n// USER PERMISSION (Cadeia 2 — Permissões Granulares por Produto)\n// Permissão granular de um usuário em um produto/workspace específico.\n// Ex: permission = 'email:write', 'simulacusto:read'\n// Alinhado com skill antigravity-permissoes.\n// ---------------------------------------------------------------------------\n\nmodel UserPermission {\n  id         String @id @default(cuid())\n  tenant_id  String\n  company_id String // workspace onde se aplica (obrigatório)\n  user_id    String\n  product_id String // produto ao qual a permissão pertence\n  permission String // ex: 'email:write', 'simulacusto:read', 'atividades:read'\n  granted_by String // clerk_id do Master que concedeu a permissão\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant Tenant @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  user   User   @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  // Um usuário não pode ter permissão duplicada no mesmo produto/workspace\n  @@unique([tenant_id, company_id, user_id, product_id, permission])\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, user_id])\n  @@index([tenant_id, company_id, user_id])\n}\n\n// ---------------------------------------------------------------------------\n// GRAVITY ADMIN PERMISSION (Cadeia 1 — Permissões de Edição para Admin Gravity)\n// Controla o que um Admin interno da Gravity pode editar.\n// Super Admin não usa esta tabela — tem acesso irrestrito.\n// ---------------------------------------------------------------------------\n\nmodel GravityAdminPermission {\n  id         String @id @default(cuid())\n  admin_id   String // clerk_id do Admin Gravity\n  resource   String // ex: 'tenants', 'billing', 'deploy', 'usuarios'\n  action     String // 'READ' | 'WRITE' | 'DELETE' | 'MANAGE'\n  granted_by String // clerk_id do Super Admin que concedeu\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Admin não pode ter permissão duplicada no mesmo recurso+ação\n  @@unique([admin_id, resource, action])\n  // Índices obrigatórios\n  @@index([admin_id])\n  @@index([admin_id, resource])\n}\n\n// ---------------------------------------------------------------------------\n// COMPANY\n// Empresa filha (unidade de negócio) dentro de um tenant.\n// Um tenant pode ter até 50 empresas filhas.\n// ---------------------------------------------------------------------------\n\nmodel Company {\n  id        String        @id @default(cuid())\n  tenant_id String\n  name      String\n  subdomain String?       @unique\n  cnpj      String?\n  status    CompanyStatus @default(ACTIVE)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant           Tenant           @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  memberships      UserMembership[]\n  company_products CompanyProduct[]\n\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, status])\n  @@index([tenant_id, created_at])\n}\n\n// ---------------------------------------------------------------------------\n// USER MEMBERSHIP\n// Habilitação de um usuário do tenant em uma empresa filha.\n// Define o papel (Master/Standard/Supplier) e o acesso a produtos.\n// ---------------------------------------------------------------------------\n\nmodel UserMembership {\n  id         String             @id @default(cuid())\n  tenant_id  String\n  user_id    String\n  company_id String\n  role       UserMembershipRole @default(STANDARD)\n  is_active  Boolean            @default(true)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  user    User    @relation(fields: [user_id], references: [id], onDelete: Cascade)\n  company Company @relation(fields: [company_id], references: [id], onDelete: Cascade)\n\n  // Usuário não pode ter duplicata de habilitação na mesma empresa\n  @@unique([tenant_id, user_id, company_id])\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, user_id])\n  @@index([tenant_id, company_id])\n}\n\n// ---------------------------------------------------------------------------\n// PRODUCT CONFIG\n// Configurações de produto por tenant. Persistência do PRODUCT_CONFIG.\n// product_key identifica o produto (ex: \"simulacusto\", \"nf-importacao\")\n// ---------------------------------------------------------------------------\n\nmodel ProductConfig {\n  id          String  @id @default(cuid())\n  tenant_id   String\n  product_key String\n  config      Json    @default(\"{}\")\n  is_active   Boolean @default(true)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant Tenant @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n\n  // Apenas uma config por produto por tenant\n  @@unique([tenant_id, product_key])\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([tenant_id, product_key])\n  @@index([tenant_id, is_active])\n}\n\n// ---------------------------------------------------------------------------\n// COMPANY PRODUCT (Cadeia 1.5 — Ativação por Workspace)\n// Habilita um produto que o Tenant já possui para um Workspace específico.\n// ---------------------------------------------------------------------------\n\nmodel CompanyProduct {\n  id          String  @id @default(cuid())\n  tenant_id   String\n  company_id  String\n  product_key String // ex: \"simulacusto\", \"gestao-atividades\"\n  is_active   Boolean @default(true)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relações\n  tenant  Tenant  @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  company Company @relation(fields: [company_id], references: [id], onDelete: Cascade)\n\n  // Apenas uma ativação por produto por workspace\n  @@unique([company_id, product_key])\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([company_id])\n  @@index([company_id, is_active])\n}\n\n// ---------------------------------------------------------------------------\n// PRODUCT (Catálogo Master da Plataforma)\n// Representa cada produto disponível no portfólio Gravity.\n// Gerenciado exclusivamente por gravity_admin via /api/admin/products.\n// NÃO confundir com ProductConfig (que é a ativação por tenant).\n// ---------------------------------------------------------------------------\n\nenum ProductStatus {\n  ACTIVE\n  SUSPENDED\n  COMING_SOON\n  LEGACY\n  INACTIVE\n}\n\nenum BillingType {\n  MONTHLY\n  PER_PROCESS\n  PER_DOCUMENT\n  PER_ESTIMATE\n  PER_DI_DUIMP\n  PER_DUE\n  PER_PRODUCT\n  PER_FLOW\n  PER_LPCO\n}\n\nenum UserLimitType {\n  UNLIMITED\n  LIMITED\n}\n\nmodel Product {\n  id          String        @id @default(cuid())\n  name        String\n  slug        String        @unique\n  description String\n  status      ProductStatus @default(ACTIVE)\n  launch_date DateTime?\n\n  // Setup\n  has_setup      Boolean  @default(false)\n  setup_price    Decimal? @db.Decimal(15, 2)\n  setup_currency String   @default(\"BRL\")\n\n  // Billing\n  billing_type     BillingType @default(MONTHLY)\n  unit_price       Decimal     @db.Decimal(15, 2)\n  unit_currency    String      @default(\"BRL\")\n  minimum_price    Decimal     @default(0) @db.Decimal(15, 2)\n  minimum_currency String      @default(\"BRL\")\n  total_price      Decimal?    @db.Decimal(15, 2)\n  total_currency   String      @default(\"BRL\")\n\n  // Users\n  user_limit_type     UserLimitType @default(UNLIMITED)\n  base_users_qty      Int?\n  extra_user_price    Decimal?      @db.Decimal(15, 2)\n  extra_user_currency String        @default(\"BRL\")\n\n  // Support\n  helpdesk_hours      Int      @default(0)\n  extra_hour_price    Decimal? @db.Decimal(15, 2)\n  extra_hour_currency String   @default(\"BRL\")\n\n  // Metadata\n  backend_module  String? // ex: \"simula-custo\", \"bid-frete\"\n  target_audience String?\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relations\n  price_tiers  PriceTier[]\n  negotiations SpecialNegotiation[]\n\n  @@index([status])\n  @@index([slug])\n}\n\n// ---------------------------------------------------------------------------\n// PRICE TIER (Faixas de Preço por Volume)\n// Precificação escalonada — preço varia conforme quantidade.\n// ---------------------------------------------------------------------------\n\nmodel PriceTier {\n  id         String  @id @default(cuid())\n  product_id String\n  range_from Int\n  range_to   Int?\n  price      Decimal @db.Decimal(15, 2)\n  currency   String  @default(\"BRL\")\n\n  // Timestamps\n  created_at DateTime @default(now())\n\n  // Relations\n  product Product @relation(fields: [product_id], references: [id], onDelete: Cascade)\n\n  @@index([product_id])\n  @@index([product_id, range_from])\n}\n\n// ---------------------------------------------------------------------------\n// SPECIAL NEGOTIATION (Negociação Especial por Tenant)\n// Condições comerciais personalizadas para tenants específicos.\n// ---------------------------------------------------------------------------\n\nmodel SpecialNegotiation {\n  id           String    @id @default(cuid())\n  product_id   String\n  tenant_id    String\n  tenant_name  String\n  agreement    String // Descrição: \"Desconto 20%\", \"Preço fixo R$ 5/proc\"\n  starts_at    DateTime?\n  ends_at      DateTime?\n  is_unlimited Boolean   @default(false)\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Relations\n  product Product @relation(fields: [product_id], references: [id], onDelete: Cascade)\n\n  @@index([product_id])\n  @@index([tenant_id])\n  @@index([product_id, tenant_id])\n}\n\n// ---------------------------------------------------------------------------\n// STRIPE EVENT\n// Registro de eventos recebidos do Stripe para garantir idempotência.\n// Evita processar o mesmo webhook duas vezes.\n// ---------------------------------------------------------------------------\n\nmodel StripeEvent {\n  id           String   @id\n  type         String\n  processed_at DateTime @default(now())\n  payload      Json\n\n  @@index([type])\n  @@index([processed_at])\n}\n\n// ---------------------------------------------------------------------------\n// SUPPLIER TENANT ACCESS\n// Fornecedor cross-tenant — pode prestar serviços para múltiplos tenants.\n// clerk_user_id único no Clerk, múltiplos vínculos aqui.\n// ---------------------------------------------------------------------------\n\nmodel SupplierTenantAccess {\n  id            String @id @default(cuid())\n  clerk_user_id String\n  tenant_id     String\n  status        String @default(\"active\")\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  // Unique: um clerk_user_id não pode ter dois acessos ao mesmo tenant\n  @@unique([clerk_user_id, tenant_id])\n  // Índices obrigatórios\n  @@index([tenant_id])\n  @@index([clerk_user_id])\n  @@index([tenant_id, clerk_user_id])\n}\n\n// ---------------------------------------------------------------------------\n// SECURITY EVENT\n// Eventos de segurança registrados pelo securityAuditLogger.\n// Alimenta o painel /admin/seguranca em tempo real.\n// ---------------------------------------------------------------------------\n\nmodel SecurityEvent {\n  id             String   @id @default(cuid())\n  tenant_id      String\n  actor_id       String\n  actor_type     String // USER | SYSTEM | GABI_IA | ADMIN\n  action         String // AUTH_FAILURE, CROSS_TENANT_ATTEMPT, ROLE_CHANGED, etc.\n  severity       String // CRITICAL | WARNING | INFO\n  status         String   @default(\"DETECTED\") // BLOCKED | ALLOWED | DETECTED\n  description    String?\n  ip             String?\n  endpoint       String?\n  user_id        String?\n  product_id     String?\n  correlation_id String?\n  metadata       Json?    @default(\"{}\")\n  created_at     DateTime @default(now())\n\n  @@index([created_at])\n  @@index([severity])\n  @@index([action])\n  @@index([tenant_id, created_at])\n  @@index([severity, created_at])\n}\n\n// ---------------------------------------------------------------------------\n// RATE LIMIT METRIC\n// Metricas agregadas do rate limiter para monitoramento no painel.\n// ---------------------------------------------------------------------------\n\nmodel RateLimitMetric {\n  id           String   @id @default(cuid())\n  key          String // tenant:ip combo\n  tenant_id    String?\n  ip           String?\n  endpoint     String\n  count        Int\n  limit_max    Int\n  blocked      Boolean  @default(false)\n  window_start DateTime\n  created_at   DateTime @default(now())\n\n  @@index([created_at])\n  @@index([blocked, created_at])\n  @@index([tenant_id])\n}\n\n// ---------------------------------------------------------------------------\n// SERVICE HEALTH\n// Snapshot do ultimo health check de cada servico.\n// ---------------------------------------------------------------------------\n\nmodel ServiceHealth {\n  id         String   @id @default(cuid())\n  service    String   @unique // ex: \"configurador\", \"bid-frete\"\n  url        String // health check URL\n  status     String   @default(\"UNKNOWN\") // OK | DEGRADED | DOWN | UNKNOWN\n  latency_ms Int?\n  last_error String?\n  checked_at DateTime @default(now())\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([status])\n  @@index([checked_at])\n}\n\n// ---------------------------------------------------------------------------\n// GLOBAL PRODUCT\n// Catálogo oficial de produtos da plataforma Gravity.\n// ---------------------------------------------------------------------------\n\nmodel GlobalProduct {\n  id              String   @id @default(cuid())\n  name            String\n  slug            String   @unique\n  description     String?\n  status          String   @default(\"Ativo\") // Ativo, Em Breve, Legado, Suspenso\n  type_billing    String? // Mensalidade, Por Processo, etc.\n  setup_price     Decimal? @default(0)\n  unit_price      Decimal? @default(0)\n  min_price       Decimal? @default(0)\n  total_price     Decimal? @default(0)\n  currency        String   @default(\"BRL\")\n  limit_users     String   @default(\"limitada\")\n  base_users      Int      @default(0)\n  help_desk_hours Int      @default(0)\n  backend_module  String? // Identificador para ativação técnica (ex: \"simula-custo\")\n  target_audience String?\n  features        Json?    @default(\"[]\")\n  pricing_tiers   Json?    @default(\"[]\")\n\n  // Timestamps\n  created_at DateTime @default(now())\n  updated_at DateTime @updatedAt\n\n  @@index([status])\n  @@index([slug])\n}\n",
  "inlineSchemaHash": "516508b0a3e3231512c9b8f1eb76d8c5cf2e2faa0f203f44b41668c7c43bc87d",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "configurador/generated",
    "generated",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Tenant\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"TenantStatus\",\"default\":\"PENDING_SETUP\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clerk_org_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripe_customer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cnpj\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"state\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"segment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"website\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"users\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"TenantToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subscriptions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Subscription\",\"relationName\":\"SubscriptionToTenant\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_permissions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserPermission\",\"relationName\":\"TenantToUserPermission\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"companies\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Company\",\"relationName\":\"CompanyToTenant\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_configs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProductConfig\",\"relationName\":\"ProductConfigToTenant\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"CompanyProduct\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CompanyProduct\",\"relationName\":\"CompanyProductToTenant\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"User\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clerk_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserRole\",\"default\":\"STANDARD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Tenant\",\"relationName\":\"TenantToUser\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_permissions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserPermission\",\"relationName\":\"UserToUserPermission\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"memberships\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMembership\",\"relationName\":\"UserToUserMembership\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"email\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"email\"]}],\"isGenerated\":false},\"Subscription\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"plan\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"SubscriptionPlan\",\"default\":\"STARTER\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"SubscriptionStatus\",\"default\":\"TRIALING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripe_subscription_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stripe_price_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"trial_ends_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"current_period_start\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"current_period_end\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cancelled_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Tenant\",\"relationName\":\"SubscriptionToTenant\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserPermission\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"permission\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"granted_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Tenant\",\"relationName\":\"TenantToUserPermission\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserPermission\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"company_id\",\"user_id\",\"product_id\",\"permission\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"company_id\",\"user_id\",\"product_id\",\"permission\"]}],\"isGenerated\":false},\"GravityAdminPermission\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"admin_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resource\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"granted_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"admin_id\",\"resource\",\"action\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"admin_id\",\"resource\",\"action\"]}],\"isGenerated\":false},\"Company\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subdomain\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cnpj\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"CompanyStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Tenant\",\"relationName\":\"CompanyToTenant\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"memberships\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMembership\",\"relationName\":\"CompanyToUserMembership\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_products\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CompanyProduct\",\"relationName\":\"CompanyToCompanyProduct\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserMembership\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserMembershipRole\",\"default\":\"STANDARD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserMembership\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Company\",\"relationName\":\"CompanyToUserMembership\",\"relationFromFields\":[\"company_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"user_id\",\"company_id\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"user_id\",\"company_id\"]}],\"isGenerated\":false},\"ProductConfig\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"config\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Tenant\",\"relationName\":\"ProductConfigToTenant\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"tenant_id\",\"product_key\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tenant_id\",\"product_key\"]}],\"isGenerated\":false},\"CompanyProduct\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Tenant\",\"relationName\":\"CompanyProductToTenant\",\"relationFromFields\":[\"tenant_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Company\",\"relationName\":\"CompanyToCompanyProduct\",\"relationFromFields\":[\"company_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"company_id\",\"product_key\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"company_id\",\"product_key\"]}],\"isGenerated\":false},\"Product\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ProductStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"launch_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"has_setup\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"setup_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"setup_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"billing_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BillingType\",\"default\":\"MONTHLY\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minimum_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minimum_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_limit_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserLimitType\",\"default\":\"UNLIMITED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"base_users_qty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extra_user_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extra_user_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"helpdesk_hours\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extra_hour_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"extra_hour_currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"backend_module\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"target_audience\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"price_tiers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PriceTier\",\"relationName\":\"PriceTierToProduct\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"negotiations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SpecialNegotiation\",\"relationName\":\"ProductToSpecialNegotiation\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PriceTier\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"range_from\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"range_to\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Product\",\"relationName\":\"PriceTierToProduct\",\"relationFromFields\":[\"product_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SpecialNegotiation\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agreement\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"starts_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ends_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_unlimited\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"product\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Product\",\"relationName\":\"ProductToSpecialNegotiation\",\"relationFromFields\":[\"product_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"StripeEvent\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SupplierTenantAccess\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clerk_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"active\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"clerk_user_id\",\"tenant_id\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"clerk_user_id\",\"tenant_id\"]}],\"isGenerated\":false},\"SecurityEvent\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"severity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"DETECTED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ip\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endpoint\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"correlation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"{}\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RateLimitMetric\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ip\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endpoint\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"limit_max\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"blocked\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"window_start\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ServiceHealth\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"UNKNOWN\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latency_ms\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_error\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"checked_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GlobalProduct\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"Ativo\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type_billing\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"setup_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"min_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"limit_users\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"limitada\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"base_users\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"help_desk_hours\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"backend_module\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"target_audience\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"features\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pricing_tiers\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"TenantStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"SUSPENDED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"PENDING_SETUP\",\"dbName\":null}],\"dbName\":null},\"SubscriptionStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"PAST_DUE\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null},{\"name\":\"TRIALING\",\"dbName\":null},{\"name\":\"INCOMPLETE\",\"dbName\":null}],\"dbName\":null},\"SubscriptionPlan\":{\"values\":[{\"name\":\"STARTER\",\"dbName\":null},{\"name\":\"PROFESSIONAL\",\"dbName\":null},{\"name\":\"ENTERPRISE\",\"dbName\":null}],\"dbName\":null},\"UserRole\":{\"values\":[{\"name\":\"SUPER_ADMIN\",\"dbName\":null},{\"name\":\"ADMIN\",\"dbName\":null},{\"name\":\"MASTER\",\"dbName\":null},{\"name\":\"STANDARD\",\"dbName\":null},{\"name\":\"SUPPLIER\",\"dbName\":null}],\"dbName\":null},\"CompanyStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null}],\"dbName\":null},\"UserMembershipRole\":{\"values\":[{\"name\":\"MASTER\",\"dbName\":null},{\"name\":\"STANDARD\",\"dbName\":null},{\"name\":\"SUPPLIER\",\"dbName\":null}],\"dbName\":null},\"ServiceTokenScope\":{\"values\":[{\"name\":\"SERVICE\",\"dbName\":null},{\"name\":\"WEBHOOK\",\"dbName\":null},{\"name\":\"CRON\",\"dbName\":null}],\"dbName\":null},\"ProductStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"SUSPENDED\",\"dbName\":null},{\"name\":\"COMING_SOON\",\"dbName\":null},{\"name\":\"LEGACY\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null}],\"dbName\":null},\"BillingType\":{\"values\":[{\"name\":\"MONTHLY\",\"dbName\":null},{\"name\":\"PER_PROCESS\",\"dbName\":null},{\"name\":\"PER_DOCUMENT\",\"dbName\":null},{\"name\":\"PER_ESTIMATE\",\"dbName\":null},{\"name\":\"PER_DI_DUIMP\",\"dbName\":null},{\"name\":\"PER_DUE\",\"dbName\":null},{\"name\":\"PER_PRODUCT\",\"dbName\":null},{\"name\":\"PER_FLOW\",\"dbName\":null},{\"name\":\"PER_LPCO\",\"dbName\":null}],\"dbName\":null},\"UserLimitType\":{\"values\":[{\"name\":\"UNLIMITED\",\"dbName\":null},{\"name\":\"LIMITED\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
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
path.join(process.cwd(), "configurador/generated/query_engine-windows.dll.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-1.1.x.so.node");
path.join(process.cwd(), "configurador/generated/libquery_engine-debian-openssl-1.1.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "configurador/generated/schema.prisma")
