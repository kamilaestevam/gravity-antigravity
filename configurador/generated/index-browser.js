
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
  tipo_empresa: 'tipo_empresa',
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
