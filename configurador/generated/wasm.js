
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

exports.Prisma.OrganizacaoScalarFieldEnum = {
  id_organizacao: 'id_organizacao',
  nome_organizacao: 'nome_organizacao',
  subdominio_organizacao: 'subdominio_organizacao',
  status_organizacao: 'status_organizacao',
  clerk_org_id: 'clerk_org_id',
  stripe_customer_id: 'stripe_customer_id',
  suid_empresa_organizacao: 'suid_empresa_organizacao',
  cnpj_organizacao: 'cnpj_organizacao',
  estado_organizacao: 'estado_organizacao',
  cidade_organizacao: 'cidade_organizacao',
  segmento_organizacao: 'segmento_organizacao',
  tipo_empresa_organizacao: 'tipo_empresa_organizacao',
  data_criacao_organizacao: 'data_criacao_organizacao',
  data_atualizacao_organizacao: 'data_atualizacao_organizacao'
};

exports.Prisma.UsuarioScalarFieldEnum = {
  id_usuario: 'id_usuario',
  id_organizacao_usuario: 'id_organizacao_usuario',
  clerk_user_id: 'clerk_user_id',
  email_usuario: 'email_usuario',
  nome_usuario: 'nome_usuario',
  tipo_usuario: 'tipo_usuario',
  preferred_company_id: 'preferred_company_id',
  data_criacao_usuario: 'data_criacao_usuario',
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

exports.Prisma.PermissaoAdminGravityScalarFieldEnum = {
  id: 'id',
  admin_id: 'admin_id',
  resource: 'resource',
  action: 'action',
  granted_by: 'granted_by',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.EmpresaScalarFieldEnum = {
  id_workspace: 'id_workspace',
  id_organizacao_workspace: 'id_organizacao_workspace',
  nome_workspace: 'nome_workspace',
  subdominio_workspace: 'subdominio_workspace',
  cnpj_workspace: 'cnpj_workspace',
  status_workspace: 'status_workspace',
  data_criacao_workspace: 'data_criacao_workspace',
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

exports.Prisma.ConfiguracaoProdutoScalarFieldEnum = {
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

exports.Prisma.FaixaPrecoScalarFieldEnum = {
  id: 'id',
  product_id: 'product_id',
  range_from: 'range_from',
  range_to: 'range_to',
  price: 'price',
  currency: 'currency',
  created_at: 'created_at'
};

exports.Prisma.NegociacaoEspecialScalarFieldEnum = {
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

exports.Prisma.AgendamentoTesteScalarFieldEnum = {
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

exports.Prisma.PlanoTesteScalarFieldEnum = {
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
exports.OrganizacaoStatus = exports.$Enums.OrganizacaoStatus = {
  ATIVO: 'ATIVO',
  SUSPENSO: 'SUSPENSO',
  CANCELADO: 'CANCELADO',
  CONFIGURACAO_PENDENTE: 'CONFIGURACAO_PENDENTE'
};

exports.UsuarioTipo = exports.$Enums.UsuarioTipo = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MASTER: 'MASTER',
  PADRAO: 'PADRAO',
  FORNECEDOR: 'FORNECEDOR'
};

exports.StatusAssinaturaProdutoGravity = exports.$Enums.StatusAssinaturaProdutoGravity = {
  ATIVA: 'ATIVA',
  VENCIDA: 'VENCIDA',
  CANCELADA: 'CANCELADA',
  EM_TESTE: 'EM_TESTE',
  INCOMPLETA: 'INCOMPLETA'
};

exports.EmpresaStatus = exports.$Enums.EmpresaStatus = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO'
};

exports.TipoUsuarioEmpresa = exports.$Enums.TipoUsuarioEmpresa = {
  MASTER: 'MASTER',
  PADRAO: 'PADRAO',
  FORNECEDOR: 'FORNECEDOR'
};

exports.StatusProdutoGravity = exports.$Enums.StatusProdutoGravity = {
  ATIVO: 'ATIVO',
  SUSPENSO: 'SUSPENSO',
  EM_BREVE: 'EM_BREVE',
  LEGADO: 'LEGADO',
  INATIVO: 'INATIVO'
};

exports.TipoCobrancaGravity = exports.$Enums.TipoCobrancaGravity = {
  MENSAL: 'MENSAL',
  POR_PROCESSO: 'POR_PROCESSO',
  POR_DOCUMENTO: 'POR_DOCUMENTO',
  POR_ESTIMATIVA: 'POR_ESTIMATIVA',
  POR_DI_DUIMP: 'POR_DI_DUIMP',
  POR_DUE: 'POR_DUE',
  POR_PRODUTO: 'POR_PRODUTO',
  POR_FLUXO: 'POR_FLUXO',
  POR_LPCO: 'POR_LPCO'
};

exports.ProdutoGravityLimiteUsuario = exports.$Enums.ProdutoGravityLimiteUsuario = {
  ILIMITADO: 'ILIMITADO',
  LIMITADO: 'LIMITADO'
};

exports.DeployAmbiente = exports.$Enums.DeployAmbiente = {
  DESENVOLVIMENTO: 'DESENVOLVIMENTO',
  HOMOLOGACAO: 'HOMOLOGACAO',
  PRODUCAO: 'PRODUCAO',
  TODOS: 'TODOS'
};

exports.DeployStatus = exports.$Enums.DeployStatus = {
  SUCESSO: 'SUCESSO',
  FALHOU: 'FALHOU',
  REVERTIDO: 'REVERTIDO',
  EM_ANDAMENTO: 'EM_ANDAMENTO'
};

exports.FaturaStatusGravity = exports.$Enums.FaturaStatusGravity = {
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
  PermissaoAdminGravity: 'PermissaoAdminGravity',
  Empresa: 'Empresa',
  UsuarioWorkspace: 'UsuarioWorkspace',
  ConfiguracaoProduto: 'ConfiguracaoProduto',
  ProdutoGravityWorkspace: 'ProdutoGravityWorkspace',
  ProdutoGravity: 'ProdutoGravity',
  FaixaPreco: 'FaixaPreco',
  NegociacaoEspecial: 'NegociacaoEspecial',
  Deploy: 'Deploy',
  FornecedorOrganizacao: 'FornecedorOrganizacao',
  Seguranca: 'Seguranca',
  Requisicoes: 'Requisicoes',
  Servicos: 'Servicos',
  Cambio: 'Cambio',
  Testes: 'Testes',
  AgendamentoTeste: 'AgendamentoTeste',
  PlanoTeste: 'PlanoTeste',
  FaturaProdutosGravity: 'FaturaProdutosGravity',
  MetricasGemini: 'MetricasGemini'
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
