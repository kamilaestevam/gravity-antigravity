
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

exports.Prisma.ProdutoGravityAssinaturaScalarFieldEnum = {
  id_assinatura_produto_gravity: 'id_assinatura_produto_gravity',
  id_organizacao_assinatura_produto_gravity: 'id_organizacao_assinatura_produto_gravity',
  status_assinatura_produto_gravity: 'status_assinatura_produto_gravity',
  stripe_subscription_id: 'stripe_subscription_id',
  stripe_price_id: 'stripe_price_id',
  data_fim_teste_assinatura_produto_gravity: 'data_fim_teste_assinatura_produto_gravity',
  data_inicio_periodo_assinatura_produto_gravity: 'data_inicio_periodo_assinatura_produto_gravity',
  data_fim_periodo_assinatura_produto_gravity: 'data_fim_periodo_assinatura_produto_gravity',
  data_cancelamento_assinatura_produto_gravity: 'data_cancelamento_assinatura_produto_gravity',
  data_criacao_assinatura_produto_gravity: 'data_criacao_assinatura_produto_gravity',
  data_atualizacao_assinatura_produto_gravity: 'data_atualizacao_assinatura_produto_gravity'
};

exports.Prisma.UsuarioPermissaoScalarFieldEnum = {
  id_usuario_permissao: 'id_usuario_permissao',
  id_organizacao_usuario_permissao: 'id_organizacao_usuario_permissao',
  id_workspace_usuario_permissao: 'id_workspace_usuario_permissao',
  id_usuario_usuario_permissao: 'id_usuario_usuario_permissao',
  id_produto_usuario_permissao: 'id_produto_usuario_permissao',
  permissao_usuario_permissao: 'permissao_usuario_permissao',
  concedido_por_usuario_permissao: 'concedido_por_usuario_permissao',
  data_criacao_usuario_permissao: 'data_criacao_usuario_permissao',
  data_atualizacao_usuario_permissao: 'data_atualizacao_usuario_permissao'
};

exports.Prisma.AdminGravityPermissaoScalarFieldEnum = {
  id_permissao_admin_gravity: 'id_permissao_admin_gravity',
  id_admin_permissao_admin_gravity: 'id_admin_permissao_admin_gravity',
  recurso_permissao_admin_gravity: 'recurso_permissao_admin_gravity',
  acao_permissao_admin_gravity: 'acao_permissao_admin_gravity',
  concedido_por_permissao_admin_gravity: 'concedido_por_permissao_admin_gravity',
  data_criacao_permissao_admin_gravity: 'data_criacao_permissao_admin_gravity',
  data_atualizacao_permissao_admin_gravity: 'data_atualizacao_permissao_admin_gravity'
};

exports.Prisma.WorkspaceScalarFieldEnum = {
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
  id_usuario_workspace: 'id_usuario_workspace',
  id_organizacao_usuario_workspace: 'id_organizacao_usuario_workspace',
  id_usuario_usuario_workspace: 'id_usuario_usuario_workspace',
  id_workspace_usuario_workspace: 'id_workspace_usuario_workspace',
  tipo_usuario_workspace: 'tipo_usuario_workspace',
  ativo_usuario_workspace: 'ativo_usuario_workspace',
  data_criacao_usuario_workspace: 'data_criacao_usuario_workspace',
  data_atualizacao_usuario_workspace: 'data_atualizacao_usuario_workspace'
};

exports.Prisma.ProdutoGravityConfiguracaoScalarFieldEnum = {
  id_config_produto_gravity: 'id_config_produto_gravity',
  id_organizacao_config_produto_gravity: 'id_organizacao_config_produto_gravity',
  chave_produto_config_produto_gravity: 'chave_produto_config_produto_gravity',
  configuracao_config_produto_gravity: 'configuracao_config_produto_gravity',
  ativo_config_produto_gravity: 'ativo_config_produto_gravity',
  data_criacao_config_produto_gravity: 'data_criacao_config_produto_gravity',
  data_atualizacao_config_produto_gravity: 'data_atualizacao_config_produto_gravity'
};

exports.Prisma.ProdutoGravityWorkspaceScalarFieldEnum = {
  id_produto_gravity_workspace: 'id_produto_gravity_workspace',
  id_organizacao_produto_gravity_workspace: 'id_organizacao_produto_gravity_workspace',
  id_workspace_produto_gravity_workspace: 'id_workspace_produto_gravity_workspace',
  chave_produto_produto_gravity_workspace: 'chave_produto_produto_gravity_workspace',
  ativo_produto_gravity_workspace: 'ativo_produto_gravity_workspace',
  data_criacao_produto_gravity_workspace: 'data_criacao_produto_gravity_workspace',
  data_atualizacao_produto_gravity_workspace: 'data_atualizacao_produto_gravity_workspace'
};

exports.Prisma.ProdutoGravityScalarFieldEnum = {
  id_produto_gravity: 'id_produto_gravity',
  nome_produto_gravity: 'nome_produto_gravity',
  slug_produto_gravity: 'slug_produto_gravity',
  descricao_produto_gravity: 'descricao_produto_gravity',
  status_produto_gravity: 'status_produto_gravity',
  data_lancamento_produto_gravity: 'data_lancamento_produto_gravity',
  possui_setup_produto_gravity: 'possui_setup_produto_gravity',
  preco_setup_produto_gravity: 'preco_setup_produto_gravity',
  moeda_setup_produto_gravity: 'moeda_setup_produto_gravity',
  tipo_cobranca_produto_gravity: 'tipo_cobranca_produto_gravity',
  preco_unitario_produto_gravity: 'preco_unitario_produto_gravity',
  moeda_unitario_produto_gravity: 'moeda_unitario_produto_gravity',
  preco_minimo_produto_gravity: 'preco_minimo_produto_gravity',
  moeda_minimo_produto_gravity: 'moeda_minimo_produto_gravity',
  preco_total_produto_gravity: 'preco_total_produto_gravity',
  moeda_total_produto_gravity: 'moeda_total_produto_gravity',
  tipo_limite_usuario_produto_gravity: 'tipo_limite_usuario_produto_gravity',
  qtd_usuarios_base_produto_gravity: 'qtd_usuarios_base_produto_gravity',
  preco_usuario_extra_produto_gravity: 'preco_usuario_extra_produto_gravity',
  moeda_usuario_extra_produto_gravity: 'moeda_usuario_extra_produto_gravity',
  horas_helpdesk_produto_gravity: 'horas_helpdesk_produto_gravity',
  preco_hora_extra_produto_gravity: 'preco_hora_extra_produto_gravity',
  moeda_hora_extra_produto_gravity: 'moeda_hora_extra_produto_gravity',
  quota_gabi_mensal_produto_gravity: 'quota_gabi_mensal_produto_gravity',
  modulo_backend_produto_gravity: 'modulo_backend_produto_gravity',
  publico_alvo_produto_gravity: 'publico_alvo_produto_gravity',
  data_criacao_produto_gravity: 'data_criacao_produto_gravity',
  data_atualizacao_produto_gravity: 'data_atualizacao_produto_gravity',
  data_remocao_produto_gravity: 'data_remocao_produto_gravity'
};

exports.Prisma.ProdutoGravityFaixaPrecoScalarFieldEnum = {
  id_faixa_preco: 'id_faixa_preco',
  id_produto_gravity_faixa_preco: 'id_produto_gravity_faixa_preco',
  faixa_de_faixa_preco: 'faixa_de_faixa_preco',
  faixa_ate_faixa_preco: 'faixa_ate_faixa_preco',
  preco_faixa_preco: 'preco_faixa_preco',
  moeda_faixa_preco: 'moeda_faixa_preco',
  data_criacao_faixa_preco: 'data_criacao_faixa_preco'
};

exports.Prisma.ProdutoGravityNegociacaoEspecialScalarFieldEnum = {
  id_negociacao_especial: 'id_negociacao_especial',
  id_produto_gravity_negociacao_especial: 'id_produto_gravity_negociacao_especial',
  id_organizacao_negociacao_especial: 'id_organizacao_negociacao_especial',
  nome_organizacao_negociacao_especial: 'nome_organizacao_negociacao_especial',
  acordo_negociacao_especial: 'acordo_negociacao_especial',
  data_inicio_negociacao_especial: 'data_inicio_negociacao_especial',
  data_fim_negociacao_especial: 'data_fim_negociacao_especial',
  ilimitado_negociacao_especial: 'ilimitado_negociacao_especial',
  data_criacao_negociacao_especial: 'data_criacao_negociacao_especial',
  data_atualizacao_negociacao_especial: 'data_atualizacao_negociacao_especial'
};

exports.Prisma.DeployScalarFieldEnum = {
  id_deploy: 'id_deploy',
  deploy_number: 'deploy_number',
  area_deploy: 'area_deploy',
  versao_deploy: 'versao_deploy',
  descricao_deploy: 'descricao_deploy',
  ambiente_deploy: 'ambiente_deploy',
  status_deploy: 'status_deploy',
  quem_deploy: 'quem_deploy',
  id_usuario_deploy: 'id_usuario_deploy',
  data_execucao_deploy: 'data_execucao_deploy',
  data_criacao_deploy: 'data_criacao_deploy'
};

exports.Prisma.FornecedorOrganizacaoScalarFieldEnum = {
  id_fornecedor_organizacao: 'id_fornecedor_organizacao',
  clerk_user_id: 'clerk_user_id',
  id_organizacao_fornecedor_organizacao: 'id_organizacao_fornecedor_organizacao',
  status_fornecedor_organizacao: 'status_fornecedor_organizacao',
  data_criacao_fornecedor_organizacao: 'data_criacao_fornecedor_organizacao',
  data_atualizacao_fornecedor_organizacao: 'data_atualizacao_fornecedor_organizacao'
};

exports.Prisma.SegurancaScalarFieldEnum = {
  id_seguranca: 'id_seguranca',
  id_organizacao_seguranca: 'id_organizacao_seguranca',
  id_ator_seguranca: 'id_ator_seguranca',
  tipo_ator_seguranca: 'tipo_ator_seguranca',
  acao_seguranca: 'acao_seguranca',
  severidade_seguranca: 'severidade_seguranca',
  status_seguranca: 'status_seguranca',
  descricao_seguranca: 'descricao_seguranca',
  ip_seguranca: 'ip_seguranca',
  endpoint_seguranca: 'endpoint_seguranca',
  id_usuario_seguranca: 'id_usuario_seguranca',
  id_produto_seguranca: 'id_produto_seguranca',
  id_correlacao_seguranca: 'id_correlacao_seguranca',
  metadata_seguranca: 'metadata_seguranca',
  data_criacao_seguranca: 'data_criacao_seguranca'
};

exports.Prisma.RequisicoesScalarFieldEnum = {
  id_requisicoes: 'id_requisicoes',
  chave_requisicoes: 'chave_requisicoes',
  id_organizacao_requisicoes: 'id_organizacao_requisicoes',
  ip_requisicoes: 'ip_requisicoes',
  endpoint_requisicoes: 'endpoint_requisicoes',
  contagem_requisicoes: 'contagem_requisicoes',
  limite_maximo_requisicoes: 'limite_maximo_requisicoes',
  bloqueado_requisicoes: 'bloqueado_requisicoes',
  inicio_janela_requisicoes: 'inicio_janela_requisicoes',
  data_criacao_requisicoes: 'data_criacao_requisicoes'
};

exports.Prisma.ServicosScalarFieldEnum = {
  id_servicos: 'id_servicos',
  servico_servicos: 'servico_servicos',
  url_servicos: 'url_servicos',
  status_servicos: 'status_servicos',
  latencia_ms_servicos: 'latencia_ms_servicos',
  ultimo_erro_servicos: 'ultimo_erro_servicos',
  data_verificacao_servicos: 'data_verificacao_servicos',
  data_criacao_servicos: 'data_criacao_servicos',
  data_atualizacao_servicos: 'data_atualizacao_servicos'
};

exports.Prisma.CambioScalarFieldEnum = {
  id_cambio: 'id_cambio',
  moeda_cambio: 'moeda_cambio',
  compra_cambio: 'compra_cambio',
  venda_cambio: 'venda_cambio',
  data_cotacao_cambio: 'data_cotacao_cambio',
  hora_cotacao_cambio: 'hora_cotacao_cambio',
  boletim_cambio: 'boletim_cambio',
  fonte_cambio: 'fonte_cambio',
  data_criacao_cambio: 'data_criacao_cambio'
};

exports.Prisma.TestesScalarFieldEnum = {
  id_testes: 'id_testes',
  id_organizacao_testes: 'id_organizacao_testes',
  tipo_testes: 'tipo_testes',
  escopo_testes: 'escopo_testes',
  sublocal_testes: 'sublocal_testes',
  modulo_testes: 'modulo_testes',
  nome_testes: 'nome_testes',
  id_plano_testes: 'id_plano_testes',
  resultado_testes: 'resultado_testes',
  duracao_testes: 'duracao_testes',
  log_erro_testes: 'log_erro_testes',
  analise_ia_testes: 'analise_ia_testes',
  screenshot_testes: 'screenshot_testes',
  ambiente_testes: 'ambiente_testes',
  id_execucao_testes: 'id_execucao_testes',
  disparado_por_testes: 'disparado_por_testes',
  data_criacao_testes: 'data_criacao_testes'
};

exports.Prisma.TesteAgendamentoScalarFieldEnum = {
  id_agendamento_teste: 'id_agendamento_teste',
  id_organizacao_agendamento_teste: 'id_organizacao_agendamento_teste',
  ativo_agendamento_teste: 'ativo_agendamento_teste',
  frequencia_agendamento_teste: 'frequencia_agendamento_teste',
  hora_agendamento_teste: 'hora_agendamento_teste',
  minuto_agendamento_teste: 'minuto_agendamento_teste',
  tipos_agendamento_teste: 'tipos_agendamento_teste',
  escopos_agendamento_teste: 'escopos_agendamento_teste',
  ambiente_agendamento_teste: 'ambiente_agendamento_teste',
  alertas_agendamento_teste: 'alertas_agendamento_teste',
  ultima_execucao_agendamento_teste: 'ultima_execucao_agendamento_teste',
  proxima_execucao_agendamento_teste: 'proxima_execucao_agendamento_teste',
  data_criacao_agendamento_teste: 'data_criacao_agendamento_teste',
  data_atualizacao_agendamento_teste: 'data_atualizacao_agendamento_teste'
};

exports.Prisma.TestePlanoScalarFieldEnum = {
  id_plano_teste: 'id_plano_teste',
  id_organizacao_plano_teste: 'id_organizacao_plano_teste',
  versao_plano_teste: 'versao_plano_teste',
  tipo_plano_teste: 'tipo_plano_teste',
  escopo_plano_teste: 'escopo_plano_teste',
  sublocal_plano_teste: 'sublocal_plano_teste',
  tela_plano_teste: 'tela_plano_teste',
  rota_plano_teste: 'rota_plano_teste',
  criticidade_plano_teste: 'criticidade_plano_teste',
  ambientes_plano_teste: 'ambientes_plano_teste',
  caminho_componente_plano_teste: 'caminho_componente_plano_teste',
  caminho_spec_plano_teste: 'caminho_spec_plano_teste',
  caminho_mapeamento_plano_teste: 'caminho_mapeamento_plano_teste',
  cobertura_pct_plano_teste: 'cobertura_pct_plano_teste',
  passos_total_plano_teste: 'passos_total_plano_teste',
  resumo_executivo_plano_teste: 'resumo_executivo_plano_teste',
  plano_completo_plano_teste: 'plano_completo_plano_teste',
  status_plano_teste: 'status_plano_teste',
  ultima_execucao_plano_teste: 'ultima_execucao_plano_teste',
  ultimo_resultado_plano_teste: 'ultimo_resultado_plano_teste',
  data_criacao_plano_teste: 'data_criacao_plano_teste',
  data_atualizacao_plano_teste: 'data_atualizacao_plano_teste'
};

exports.Prisma.ProdutoGravityFaturaScalarFieldEnum = {
  id_fatura_produtos_gravity: 'id_fatura_produtos_gravity',
  id_organizacao_fatura_produtos_gravity: 'id_organizacao_fatura_produtos_gravity',
  numero_fatura_produtos_gravity: 'numero_fatura_produtos_gravity',
  status_fatura_produtos_gravity: 'status_fatura_produtos_gravity',
  nome_organizacao_fatura_produtos_gravity: 'nome_organizacao_fatura_produtos_gravity',
  email_organizacao_fatura_produtos_gravity: 'email_organizacao_fatura_produtos_gravity',
  valor_total_fatura_produtos_gravity: 'valor_total_fatura_produtos_gravity',
  moeda_fatura_produtos_gravity: 'moeda_fatura_produtos_gravity',
  competencia_fatura_produtos_gravity: 'competencia_fatura_produtos_gravity',
  data_fatura_produtos_gravity: 'data_fatura_produtos_gravity',
  data_criacao_fatura_produtos_gravity: 'data_criacao_fatura_produtos_gravity',
  data_atualizacao_fatura_produtos_gravity: 'data_atualizacao_fatura_produtos_gravity'
};

exports.Prisma.LLMMetricasScalarFieldEnum = {
  id_metricas_gemini: 'id_metricas_gemini',
  nome_metricas_gemini: 'nome_metricas_gemini',
  data_analise_metricas_gemini: 'data_analise_metricas_gemini',
  total_analise_metricas_gemini: 'total_analise_metricas_gemini',
  total_token_metricas_gemini: 'total_token_metricas_gemini',
  custo_metricas_gemini: 'custo_metricas_gemini',
  latencia_metricas_gemini: 'latencia_metricas_gemini',
  confianca_alta_metricas_gemini: 'confianca_alta_metricas_gemini',
  confianca_media_metricas_gemini: 'confianca_media_metricas_gemini',
  confianca_baixa_metricas_gemini: 'confianca_baixa_metricas_gemini',
  quantidade_codigo_validado_metricas_gemini: 'quantidade_codigo_validado_metricas_gemini',
  data_criacao_metricas_gemini: 'data_criacao_metricas_gemini'
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
  ProdutoGravityAssinatura: 'ProdutoGravityAssinatura',
  UsuarioPermissao: 'UsuarioPermissao',
  AdminGravityPermissao: 'AdminGravityPermissao',
  Workspace: 'Workspace',
  UsuarioWorkspace: 'UsuarioWorkspace',
  ProdutoGravityConfiguracao: 'ProdutoGravityConfiguracao',
  ProdutoGravityWorkspace: 'ProdutoGravityWorkspace',
  ProdutoGravity: 'ProdutoGravity',
  ProdutoGravityFaixaPreco: 'ProdutoGravityFaixaPreco',
  ProdutoGravityNegociacaoEspecial: 'ProdutoGravityNegociacaoEspecial',
  Deploy: 'Deploy',
  FornecedorOrganizacao: 'FornecedorOrganizacao',
  Seguranca: 'Seguranca',
  Requisicoes: 'Requisicoes',
  Servicos: 'Servicos',
  Cambio: 'Cambio',
  Testes: 'Testes',
  TesteAgendamento: 'TesteAgendamento',
  TestePlano: 'TestePlano',
  ProdutoGravityFatura: 'ProdutoGravityFatura',
  LLMMetricas: 'LLMMetricas'
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
