
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
  clerk_organizacao_id: 'clerk_organizacao_id',
  suid_empresa_organizacao: 'suid_empresa_organizacao',
  cnpj_organizacao: 'cnpj_organizacao',
  estado_organizacao: 'estado_organizacao',
  cidade_organizacao: 'cidade_organizacao',
  segmento_organizacao: 'segmento_organizacao',
  tipo_organizacao: 'tipo_organizacao',
  data_criacao_organizacao: 'data_criacao_organizacao',
  data_atualizacao_organizacao: 'data_atualizacao_organizacao'
};

exports.Prisma.UsuarioScalarFieldEnum = {
  id_usuario: 'id_usuario',
  id_organizacao: 'id_organizacao',
  id_clerk_usuario: 'id_clerk_usuario',
  email_usuario: 'email_usuario',
  nome_usuario: 'nome_usuario',
  tipo_usuario: 'tipo_usuario',
  id_workspace_preferido_usuario: 'id_workspace_preferido_usuario',
  data_criacao_usuario: 'data_criacao_usuario',
  data_atualizacao_usuario: 'data_atualizacao_usuario'
};

exports.Prisma.ProdutoGravityAssinaturaScalarFieldEnum = {
  id_assinatura_produto_gravity: 'id_assinatura_produto_gravity',
  id_organizacao: 'id_organizacao',
  status_assinatura_produto_gravity: 'status_assinatura_produto_gravity',
  data_fim_teste_assinatura_produto_gravity: 'data_fim_teste_assinatura_produto_gravity',
  data_inicio_periodo_assinatura_produto_gravity: 'data_inicio_periodo_assinatura_produto_gravity',
  data_fim_periodo_assinatura_produto_gravity: 'data_fim_periodo_assinatura_produto_gravity',
  data_cancelamento_assinatura_produto_gravity: 'data_cancelamento_assinatura_produto_gravity',
  data_criacao_assinatura_produto_gravity: 'data_criacao_assinatura_produto_gravity',
  data_atualizacao_assinatura_produto_gravity: 'data_atualizacao_assinatura_produto_gravity'
};

exports.Prisma.UsuarioPermissaoScalarFieldEnum = {
  id_usuario_permissao: 'id_usuario_permissao',
  id_organizacao: 'id_organizacao',
  id_workspace: 'id_workspace',
  id_usuario: 'id_usuario',
  id_produto_gravity: 'id_produto_gravity',
  permissao_usuario: 'permissao_usuario',
  permissao_usuario_concedido_por: 'permissao_usuario_concedido_por',
  data_criacao_permissao_usuario: 'data_criacao_permissao_usuario',
  data_atualizacao_permissao_usuario: 'data_atualizacao_permissao_usuario'
};

exports.Prisma.AdminGravityPermissaoScalarFieldEnum = {
  id_permissao_usuario_admin: 'id_permissao_usuario_admin',
  id_clerk_usuario: 'id_clerk_usuario',
  permissao_usuario_admin: 'permissao_usuario_admin',
  concedido_por_permissao_usuario_admin: 'concedido_por_permissao_usuario_admin',
  data_criacao_permissao_usuario_admin: 'data_criacao_permissao_usuario_admin',
  data_atualizacao_permissao_usuario_admin: 'data_atualizacao_permissao_usuario_admin'
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
  id_organizacao: 'id_organizacao',
  id_usuario: 'id_usuario',
  id_workspace: 'id_workspace',
  tipo_usuario_workspace: 'tipo_usuario_workspace',
  ativo_usuario_workspace: 'ativo_usuario_workspace',
  data_criacao_usuario_workspace: 'data_criacao_usuario_workspace',
  data_atualizacao_usuario_workspace: 'data_atualizacao_usuario_workspace'
};

exports.Prisma.ProdutoGravityConfiguracaoScalarFieldEnum = {
  id_configuracao_produto_gravity: 'id_configuracao_produto_gravity',
  id_organizacao_configuracao_produto_gravity: 'id_organizacao_configuracao_produto_gravity',
  chave_produto_configuracao_produto_gravity: 'chave_produto_configuracao_produto_gravity',
  configuracao_config_produto_gravity: 'configuracao_config_produto_gravity',
  ativo_configuracao_produto_gravity: 'ativo_configuracao_produto_gravity',
  data_criacao_configuracao_produto_gravity: 'data_criacao_configuracao_produto_gravity',
  data_atualizacao_configuracao_produto_gravity: 'data_atualizacao_configuracao_produto_gravity'
};

exports.Prisma.ProdutoGravityWorkspaceScalarFieldEnum = {
  id_produto_gravity_workspace: 'id_produto_gravity_workspace',
  id_organizacao: 'id_organizacao',
  id_workspace: 'id_workspace',
  id_produto_gravity: 'id_produto_gravity',
  ativo_produto_gravity_workspace: 'ativo_produto_gravity_workspace',
  data_contratacao_produto_gravity_workspace: 'data_contratacao_produto_gravity_workspace',
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
  id_faixa_preco_produto_gravity: 'id_faixa_preco_produto_gravity',
  id_produto_gravity_faixa_preco: 'id_produto_gravity_faixa_preco',
  faixa_de_faixa_preco_produto_gravity: 'faixa_de_faixa_preco_produto_gravity',
  faixa_ate_faixa_preco_produto_gravity: 'faixa_ate_faixa_preco_produto_gravity',
  preco_faixa_preco_produto_gravity: 'preco_faixa_preco_produto_gravity',
  moeda_faixa_preco_produto_gravity: 'moeda_faixa_preco_produto_gravity',
  data_criacao_faixa_preco_produto_gravity: 'data_criacao_faixa_preco_produto_gravity'
};

exports.Prisma.ProdutoGravityNegociacaoEspecialScalarFieldEnum = {
  id_negociacao_especial_preco_produto_gravity: 'id_negociacao_especial_preco_produto_gravity',
  id_produto_gravity: 'id_produto_gravity',
  id_organizacao: 'id_organizacao',
  nome_organizacao_negociacao_especial_preco_produto_gravity: 'nome_organizacao_negociacao_especial_preco_produto_gravity',
  acordo_negociacao_especial_preco_produto_gravity: 'acordo_negociacao_especial_preco_produto_gravity',
  data_inicio_negociacao_especial_preco_produto_gravity: 'data_inicio_negociacao_especial_preco_produto_gravity',
  data_fim_negociacao_especial_preco_produto_gravity: 'data_fim_negociacao_especial_preco_produto_gravity',
  ilimitado_negociacao_especial_preco_produto_gravity: 'ilimitado_negociacao_especial_preco_produto_gravity',
  data_criacao_negociacao_especial_preco_produto_gravity: 'data_criacao_negociacao_especial_preco_produto_gravity',
  data_atualizacao_negociacao_especial_preco_produto_gravity: 'data_atualizacao_negociacao_especial_preco_produto_gravity'
};

exports.Prisma.DeployScalarFieldEnum = {
  id_deploy: 'id_deploy',
  numero_deploy: 'numero_deploy',
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

exports.Prisma.OrganizacaoFornecedorScalarFieldEnum = {
  id_fornecedor_organizacao: 'id_fornecedor_organizacao',
  id_clerk_usuario: 'id_clerk_usuario',
  id_organizacao_fornecedor_organizacao: 'id_organizacao_fornecedor_organizacao',
  status_fornecedor_organizacao: 'status_fornecedor_organizacao',
  data_criacao_fornecedor_organizacao: 'data_criacao_fornecedor_organizacao',
  data_atualizacao_fornecedor_organizacao: 'data_atualizacao_fornecedor_organizacao'
};

exports.Prisma.SegurancaScalarFieldEnum = {
  id_seguranca: 'id_seguranca',
  id_organizacao: 'id_organizacao',
  id_ator_seguranca: 'id_ator_seguranca',
  tipo_ator_seguranca: 'tipo_ator_seguranca',
  acao_seguranca: 'acao_seguranca',
  severidade_seguranca: 'severidade_seguranca',
  status_seguranca: 'status_seguranca',
  descricao_seguranca: 'descricao_seguranca',
  ip_seguranca: 'ip_seguranca',
  endpoint_seguranca: 'endpoint_seguranca',
  id_usuario: 'id_usuario',
  id_workspace: 'id_workspace',
  id_produto_gravity: 'id_produto_gravity',
  id_correlacao_seguranca: 'id_correlacao_seguranca',
  id_clerk_sessao: 'id_clerk_sessao',
  usuario_agente_seguranca: 'usuario_agente_seguranca',
  geo_pais_seguranca: 'geo_pais_seguranca',
  payload_request_seguranca: 'payload_request_seguranca',
  acoes_tomadas_seguranca: 'acoes_tomadas_seguranca',
  resolvido_por_seguranca: 'resolvido_por_seguranca',
  data_resolucao_seguranca: 'data_resolucao_seguranca',
  metadata_seguranca: 'metadata_seguranca',
  data_criacao_seguranca: 'data_criacao_seguranca'
};

exports.Prisma.RequisicoesScalarFieldEnum = {
  id_requisicoes: 'id_requisicoes',
  chave_requisicoes: 'chave_requisicoes',
  id_organizacao: 'id_organizacao',
  ip_requisicoes: 'ip_requisicoes',
  endpoint_requisicoes: 'endpoint_requisicoes',
  metodo_requisicoes: 'metodo_requisicoes',
  status_code_requisicoes: 'status_code_requisicoes',
  contagem_requisicoes: 'contagem_requisicoes',
  limite_maximo_requisicoes: 'limite_maximo_requisicoes',
  bloqueado_requisicoes: 'bloqueado_requisicoes',
  razao_bloqueio_requisicoes: 'razao_bloqueio_requisicoes',
  user_agent_requisicoes: 'user_agent_requisicoes',
  id_usuario: 'id_usuario',
  tempo_resposta_ms_requisicoes: 'tempo_resposta_ms_requisicoes',
  inicio_janela_requisicoes: 'inicio_janela_requisicoes',
  data_criacao_requisicoes: 'data_criacao_requisicoes'
};

exports.Prisma.ServicoGravityScalarFieldEnum = {
  id_servico_gravity: 'id_servico_gravity',
  nome_servico_gravity: 'nome_servico_gravity',
  url_servico_gravity: 'url_servico_gravity',
  status_servico_gravity: 'status_servico_gravity',
  latencia_ms_servico_gravity: 'latencia_ms_servico_gravity',
  ultimo_erro_servico_gravity: 'ultimo_erro_servico_gravity',
  data_verificacao_servico_gravity: 'data_verificacao_servico_gravity',
  versao_atual_servico_gravity: 'versao_atual_servico_gravity',
  ambiente_servico_gravity: 'ambiente_servico_gravity',
  tipo_servico_gravity: 'tipo_servico_gravity',
  falhas_consecutivas_servico_gravity: 'falhas_consecutivas_servico_gravity',
  data_ultima_falha_servico_gravity: 'data_ultima_falha_servico_gravity',
  data_recuperacao_servico_gravity: 'data_recuperacao_servico_gravity',
  tempo_uptime_pct_servico_gravity: 'tempo_uptime_pct_servico_gravity',
  regiao_servico_gravity: 'regiao_servico_gravity',
  responsavel_servico_gravity: 'responsavel_servico_gravity',
  data_criacao_servico_gravity: 'data_criacao_servico_gravity',
  data_atualizacao_servico_gravity: 'data_atualizacao_servico_gravity'
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

exports.Prisma.TesteScalarFieldEnum = {
  id_teste: 'id_teste',
  id_organizacao: 'id_organizacao',
  tipo_teste: 'tipo_teste',
  escopo_teste: 'escopo_teste',
  sublocal_teste: 'sublocal_teste',
  modulo_teste: 'modulo_teste',
  nome_teste: 'nome_teste',
  id_plano_teste: 'id_plano_teste',
  id_agendamento_teste: 'id_agendamento_teste',
  resultado_teste: 'resultado_teste',
  duracao_teste: 'duracao_teste',
  log_erro_teste: 'log_erro_teste',
  analise_ia_teste: 'analise_ia_teste',
  screenshot_teste: 'screenshot_teste',
  ambiente_teste: 'ambiente_teste',
  id_execucao_teste: 'id_execucao_teste',
  disparado_por_teste: 'disparado_por_teste',
  gatilho_teste: 'gatilho_teste',
  data_criacao_teste: 'data_criacao_teste',
  data_atualizacao_teste: 'data_atualizacao_teste'
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
  nome_plano_teste: 'nome_plano_teste',
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
  id_metricas_llm: 'id_metricas_llm',
  nome_metricas_llm: 'nome_metricas_llm',
  data_analise_metricas_llm: 'data_analise_metricas_llm',
  total_analise_metricas_llm: 'total_analise_metricas_llm',
  total_token_metricas_llm: 'total_token_metricas_llm',
  custo_metricas_llm: 'custo_metricas_llm',
  latencia_metricas_llm: 'latencia_metricas_llm',
  confianca_alta_metricas_llm: 'confianca_alta_metricas_llm',
  confianca_media_metricas_llm: 'confianca_media_metricas_llm',
  confianca_baixa_metricas_llm: 'confianca_baixa_metricas_llm',
  quantidade_codigo_validado_metricas_llm: 'quantidade_codigo_validado_metricas_llm',
  data_criacao_metricas_llm: 'data_criacao_metricas_llm'
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

exports.WorkspaceStatus = exports.$Enums.WorkspaceStatus = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO'
};

exports.TipoUsuarioWorkspace = exports.$Enums.TipoUsuarioWorkspace = {
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
  OrganizacaoFornecedor: 'OrganizacaoFornecedor',
  Seguranca: 'Seguranca',
  Requisicoes: 'Requisicoes',
  ServicoGravity: 'ServicoGravity',
  Cambio: 'Cambio',
  Teste: 'Teste',
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
