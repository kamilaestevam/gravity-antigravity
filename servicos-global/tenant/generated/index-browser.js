
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
  id_atividades_dados: 'id_atividades_dados',
  id_organizacao_atividades_dados: 'id_organizacao_atividades_dados',
  id_usuario_atividades_dados: 'id_usuario_atividades_dados',
  titulo_atividades_dados: 'titulo_atividades_dados',
  descricao_atividades_dados: 'descricao_atividades_dados',
  tipo_atividades_dados: 'tipo_atividades_dados',
  status_atividades_dados: 'status_atividades_dados',
  prioridade_atividades_dados: 'prioridade_atividades_dados',
  data_atividade_atividades_dados: 'data_atividade_atividades_dados',
  data_vencimento_atividades_dados: 'data_vencimento_atividades_dados',
  tempo_gasto_minutos_atividades_dados: 'tempo_gasto_minutos_atividades_dados',
  proximo_passo_titulo_atividades_dados: 'proximo_passo_titulo_atividades_dados',
  proximo_passo_data_atividades_dados: 'proximo_passo_data_atividades_dados',
  lembrete_em_atividades_dados: 'lembrete_em_atividades_dados',
  lembrete_email_atividades_dados: 'lembrete_email_atividades_dados',
  lembrete_whatsapp_atividades_dados: 'lembrete_whatsapp_atividades_dados',
  notificar_ao_atribuir_atividades_dados: 'notificar_ao_atribuir_atividades_dados',
  id_processo_atividades_dados: 'id_processo_atividades_dados',
  data_criacao_atividades_dados: 'data_criacao_atividades_dados',
  data_atualizacao_atividades_dados: 'data_atualizacao_atividades_dados'
};

exports.Prisma.AtividadesParticipantesScalarFieldEnum = {
  id_atividades_participantes: 'id_atividades_participantes',
  id_atividades_dados_atividades_participantes: 'id_atividades_dados_atividades_participantes',
  id_usuario_atividades_participantes: 'id_usuario_atividades_participantes',
  nome_usuario_atividades_participantes: 'nome_usuario_atividades_participantes'
};

exports.Prisma.AtividadesTempoScalarFieldEnum = {
  id_atividades_tempo: 'id_atividades_tempo',
  id_atividades_dados_atividades_tempo: 'id_atividades_dados_atividades_tempo',
  iniciado_em_atividades_tempo: 'iniciado_em_atividades_tempo',
  duracao_min_atividades_tempo: 'duracao_min_atividades_tempo',
  assunto_atividades_tempo: 'assunto_atividades_tempo'
};

exports.Prisma.AtividadesCronometroScalarFieldEnum = {
  id_atividades_cronometro: 'id_atividades_cronometro',
  id_organizacao_atividades_cronometro: 'id_organizacao_atividades_cronometro',
  id_produto_atividades_cronometro: 'id_produto_atividades_cronometro',
  id_usuario_atividades_cronometro: 'id_usuario_atividades_cronometro',
  id_atividade_atividades_cronometro: 'id_atividade_atividades_cronometro',
  data_inicio_atividades_cronometro: 'data_inicio_atividades_cronometro',
  data_fim_atividades_cronometro: 'data_fim_atividades_cronometro',
  duracao_minutos_atividades_cronometro: 'duracao_minutos_atividades_cronometro',
  manual_atividades_cronometro: 'manual_atividades_cronometro',
  assunto_atividades_cronometro: 'assunto_atividades_cronometro',
  tipo_vinculo_atividades_cronometro: 'tipo_vinculo_atividades_cronometro',
  id_vinculo_atividades_cronometro: 'id_vinculo_atividades_cronometro',
  rotulo_vinculo_atividades_cronometro: 'rotulo_vinculo_atividades_cronometro',
  data_criacao_atividades_cronometro: 'data_criacao_atividades_cronometro',
  data_atualizacao_atividades_cronometro: 'data_atualizacao_atividades_cronometro'
};

exports.Prisma.AtividadesTimerScalarFieldEnum = {
  id_atividades_timer: 'id_atividades_timer',
  id_organizacao_atividades_timer: 'id_organizacao_atividades_timer',
  id_usuario_atividades_timer: 'id_usuario_atividades_timer',
  id_atividade_atividades_timer: 'id_atividade_atividades_timer',
  data_inicio_atividades_timer: 'data_inicio_atividades_timer',
  data_pausa_atividades_timer: 'data_pausa_atividades_timer',
  segundos_acumulados_atividades_timer: 'segundos_acumulados_atividades_timer',
  data_criacao_atividades_timer: 'data_criacao_atividades_timer',
  data_atualizacao_atividades_timer: 'data_atualizacao_atividades_timer'
};

exports.Prisma.TempoCriacaoRelatorioScalarFieldEnum = {
  id_tempo_criacao_relatorio: 'id_tempo_criacao_relatorio',
  id_organizacao_tempo_criacao_relatorio: 'id_organizacao_tempo_criacao_relatorio',
  id_usuario_tempo_criacao_relatorio: 'id_usuario_tempo_criacao_relatorio',
  id_produto_tempo_criacao_relatorio: 'id_produto_tempo_criacao_relatorio',
  periodo_inicio_tempo_criacao_relatorio: 'periodo_inicio_tempo_criacao_relatorio',
  periodo_fim_tempo_criacao_relatorio: 'periodo_fim_tempo_criacao_relatorio',
  total_minutos_tempo_criacao_relatorio: 'total_minutos_tempo_criacao_relatorio',
  payload_tempo_criacao_relatorio: 'payload_tempo_criacao_relatorio',
  data_computacao_tempo_criacao_relatorio: 'data_computacao_tempo_criacao_relatorio',
  data_expiracao_tempo_criacao_relatorio: 'data_expiracao_tempo_criacao_relatorio'
};

exports.Prisma.EmailAssuntosParticipantesScalarFieldEnum = {
  id_email_assuntos_participantes: 'id_email_assuntos_participantes',
  id_organizacao_email_assuntos_participantes: 'id_organizacao_email_assuntos_participantes',
  id_produto_email_assuntos_participantes: 'id_produto_email_assuntos_participantes',
  id_usuario_email_assuntos_participantes: 'id_usuario_email_assuntos_participantes',
  assunto_email_assuntos_participantes: 'assunto_email_assuntos_participantes',
  status_email_assuntos_participantes: 'status_email_assuntos_participantes',
  sentimento_email_assuntos_participantes: 'sentimento_email_assuntos_participantes',
  rotulo_sentimento_email_assuntos_participantes: 'rotulo_sentimento_email_assuntos_participantes',
  contagem_mensagens_email_assuntos_participantes: 'contagem_mensagens_email_assuntos_participantes',
  ultimo_contato_email_assuntos_participantes: 'ultimo_contato_email_assuntos_participantes',
  deep_link_email_assuntos_participantes: 'deep_link_email_assuntos_participantes',
  data_criacao_email_assuntos_participantes: 'data_criacao_email_assuntos_participantes',
  data_atualizacao_email_assuntos_participantes: 'data_atualizacao_email_assuntos_participantes'
};

exports.Prisma.EmailMensagemScalarFieldEnum = {
  id_email_mensagem: 'id_email_mensagem',
  id_organizacao_email_mensagem: 'id_organizacao_email_mensagem',
  id_produto_email_mensagem: 'id_produto_email_mensagem',
  id_usuario_email_mensagem: 'id_usuario_email_mensagem',
  id_thread_email_mensagem: 'id_thread_email_mensagem',
  id_resend_email_mensagem: 'id_resend_email_mensagem',
  direcao_email_mensagem: 'direcao_email_mensagem',
  remetente_email_mensagem: 'remetente_email_mensagem',
  destinatario_email_mensagem: 'destinatario_email_mensagem',
  assunto_email_mensagem: 'assunto_email_mensagem',
  corpo_email_mensagem: 'corpo_email_mensagem',
  corpo_html_email_mensagem: 'corpo_html_email_mensagem',
  chave_dedup_email_mensagem: 'chave_dedup_email_mensagem',
  id_mensagem_pai_email_mensagem: 'id_mensagem_pai_email_mensagem',
  resposta_gabi_email_mensagem: 'resposta_gabi_email_mensagem',
  confianca_gabi_email_mensagem: 'confianca_gabi_email_mensagem',
  acao_gabi_email_mensagem: 'acao_gabi_email_mensagem',
  data_envio_email_mensagem: 'data_envio_email_mensagem',
  data_criacao_email_mensagem: 'data_criacao_email_mensagem',
  data_atualizacao_email_mensagem: 'data_atualizacao_email_mensagem'
};

exports.Prisma.EmailRegistroEnvioScalarFieldEnum = {
  id_email_registro_envio: 'id_email_registro_envio',
  id_organizacao_email_registro_envio: 'id_organizacao_email_registro_envio',
  id_produto_email_registro_envio: 'id_produto_email_registro_envio',
  id_usuario_email_registro_envio: 'id_usuario_email_registro_envio',
  destinatario_email_registro_envio: 'destinatario_email_registro_envio',
  remetente_email_registro_envio: 'remetente_email_registro_envio',
  reply_to_email_registro_envio: 'reply_to_email_registro_envio',
  assunto_email_registro_envio: 'assunto_email_registro_envio',
  id_template_email_registro_envio: 'id_template_email_registro_envio',
  status_email_registro_envio: 'status_email_registro_envio',
  id_resend_email_registro_envio: 'id_resend_email_registro_envio',
  chave_dedup_email_registro_envio: 'chave_dedup_email_registro_envio',
  tentativas_email_registro_envio: 'tentativas_email_registro_envio',
  max_tentativas_email_registro_envio: 'max_tentativas_email_registro_envio',
  proxima_tentativa_em_email_registro_envio: 'proxima_tentativa_em_email_registro_envio',
  mensagem_erro_email_registro_envio: 'mensagem_erro_email_registro_envio',
  data_envio_email_registro_envio: 'data_envio_email_registro_envio',
  data_criacao_email_registro_envio: 'data_criacao_email_registro_envio',
  data_atualizacao_email_registro_envio: 'data_atualizacao_email_registro_envio'
};

exports.Prisma.TemplateEmailScalarFieldEnum = {
  id_template_email: 'id_template_email',
  id_organizacao_template_email: 'id_organizacao_template_email',
  id_produto_template_email: 'id_produto_template_email',
  id_usuario_template_email: 'id_usuario_template_email',
  nome_template_email: 'nome_template_email',
  slug_template_email: 'slug_template_email',
  assunto_template_email: 'assunto_template_email',
  corpo_html_template_email: 'corpo_html_template_email',
  corpo_texto_template_email: 'corpo_texto_template_email',
  variaveis_template_email: 'variaveis_template_email',
  ativo_template_email: 'ativo_template_email',
  descricao_template_email: 'descricao_template_email',
  data_criacao_template_email: 'data_criacao_template_email',
  data_atualizacao_template_email: 'data_atualizacao_template_email'
};

exports.Prisma.EmailFilaEnvioScalarFieldEnum = {
  id_email_fila_envio: 'id_email_fila_envio',
  id_organizacao_email_fila_envio: 'id_organizacao_email_fila_envio',
  id_produto_email_fila_envio: 'id_produto_email_fila_envio',
  id_usuario_email_fila_envio: 'id_usuario_email_fila_envio',
  status_email_fila_envio: 'status_email_fila_envio',
  prioridade_email_fila_envio: 'prioridade_email_fila_envio',
  payload_email_fila_envio: 'payload_email_fila_envio',
  id_template_email_fila_envio: 'id_template_email_fila_envio',
  id_email_enviado_email_fila_envio: 'id_email_enviado_email_fila_envio',
  tentativas_email_fila_envio: 'tentativas_email_fila_envio',
  max_tentativas_email_fila_envio: 'max_tentativas_email_fila_envio',
  proxima_tentativa_em_email_fila_envio: 'proxima_tentativa_em_email_fila_envio',
  processado_em_email_fila_envio: 'processado_em_email_fila_envio',
  erro_email_fila_envio: 'erro_email_fila_envio',
  data_criacao_email_fila_envio: 'data_criacao_email_fila_envio',
  data_atualizacao_email_fila_envio: 'data_atualizacao_email_fila_envio'
};

exports.Prisma.WhatsappConversaScalarFieldEnum = {
  id_whatsapp_conversa: 'id_whatsapp_conversa',
  id_organizacao_whatsapp_conversa: 'id_organizacao_whatsapp_conversa',
  id_produto_whatsapp_conversa: 'id_produto_whatsapp_conversa',
  id_usuario_whatsapp_conversa: 'id_usuario_whatsapp_conversa',
  telefone_wa_whatsapp_conversa: 'telefone_wa_whatsapp_conversa',
  status_whatsapp_conversa: 'status_whatsapp_conversa',
  id_contato_whatsapp_conversa: 'id_contato_whatsapp_conversa',
  id_empresa_whatsapp_conversa: 'id_empresa_whatsapp_conversa',
  nome_contato_whatsapp_conversa: 'nome_contato_whatsapp_conversa',
  nome_empresa_whatsapp_conversa: 'nome_empresa_whatsapp_conversa',
  id_atividade_whatsapp_conversa: 'id_atividade_whatsapp_conversa',
  ia_habilitada_whatsapp_conversa: 'ia_habilitada_whatsapp_conversa',
  aberta_em_whatsapp_conversa: 'aberta_em_whatsapp_conversa',
  fechada_em_whatsapp_conversa: 'fechada_em_whatsapp_conversa',
  gabi_temperatura_whatsapp_conversa: 'gabi_temperatura_whatsapp_conversa',
  gabi_temperatura_score_whatsapp_conversa: 'gabi_temperatura_score_whatsapp_conversa',
  gabi_resumo_whatsapp_conversa: 'gabi_resumo_whatsapp_conversa',
  gabi_acoes_sugeridas_whatsapp_conversa: 'gabi_acoes_sugeridas_whatsapp_conversa',
  data_criacao_whatsapp_conversa: 'data_criacao_whatsapp_conversa',
  data_atualizacao_whatsapp_conversa: 'data_atualizacao_whatsapp_conversa'
};

exports.Prisma.WhatsappMensagemScalarFieldEnum = {
  id_whatsapp_mensagem: 'id_whatsapp_mensagem',
  id_organizacao_whatsapp_mensagem: 'id_organizacao_whatsapp_mensagem',
  id_produto_whatsapp_mensagem: 'id_produto_whatsapp_mensagem',
  id_usuario_whatsapp_mensagem: 'id_usuario_whatsapp_mensagem',
  id_conversa_whatsapp_mensagem: 'id_conversa_whatsapp_mensagem',
  id_wa_mensagem_whatsapp_mensagem: 'id_wa_mensagem_whatsapp_mensagem',
  direcao_whatsapp_mensagem: 'direcao_whatsapp_mensagem',
  tipo_conteudo_whatsapp_mensagem: 'tipo_conteudo_whatsapp_mensagem',
  conteudo_whatsapp_mensagem: 'conteudo_whatsapp_mensagem',
  origem_whatsapp_mensagem: 'origem_whatsapp_mensagem',
  enviado_por_whatsapp_mensagem: 'enviado_por_whatsapp_mensagem',
  status_whatsapp_mensagem: 'status_whatsapp_mensagem',
  data_criacao_whatsapp_mensagem: 'data_criacao_whatsapp_mensagem',
  data_atualizacao_whatsapp_mensagem: 'data_atualizacao_whatsapp_mensagem'
};

exports.Prisma.WhatsappLogScalarFieldEnum = {
  id_whatsapp_log: 'id_whatsapp_log',
  id_organizacao_whatsapp_log: 'id_organizacao_whatsapp_log',
  id_produto_whatsapp_log: 'id_produto_whatsapp_log',
  id_usuario_whatsapp_log: 'id_usuario_whatsapp_log',
  id_conversa_whatsapp_log: 'id_conversa_whatsapp_log',
  id_empresa_whatsapp_log: 'id_empresa_whatsapp_log',
  categoria_conversa_whatsapp_log: 'categoria_conversa_whatsapp_log',
  origem_whatsapp_log: 'origem_whatsapp_log',
  custo_usd_whatsapp_log: 'custo_usd_whatsapp_log',
  data_criacao_whatsapp_log: 'data_criacao_whatsapp_log',
  data_atualizacao_whatsapp_log: 'data_atualizacao_whatsapp_log'
};

exports.Prisma.WhatsappRegraScalarFieldEnum = {
  id_whatsapp_regra: 'id_whatsapp_regra',
  id_organizacao_whatsapp_regra: 'id_organizacao_whatsapp_regra',
  id_produto_whatsapp_regra: 'id_produto_whatsapp_regra',
  id_usuario_whatsapp_regra: 'id_usuario_whatsapp_regra',
  nome_whatsapp_regra: 'nome_whatsapp_regra',
  gatilho_whatsapp_regra: 'gatilho_whatsapp_regra',
  condicoes_whatsapp_regra: 'condicoes_whatsapp_regra',
  id_template_whatsapp_regra: 'id_template_whatsapp_regra',
  destinatario_whatsapp_regra: 'destinatario_whatsapp_regra',
  ativa_whatsapp_regra: 'ativa_whatsapp_regra',
  data_criacao_whatsapp_regra: 'data_criacao_whatsapp_regra',
  data_atualizacao_whatsapp_regra: 'data_atualizacao_whatsapp_regra'
};

exports.Prisma.DashboardConfiguracaoScalarFieldEnum = {
  id_dashboard_configuracao: 'id_dashboard_configuracao',
  id_organizacao_dashboard_configuracao: 'id_organizacao_dashboard_configuracao',
  id_produto_dashboard_configuracao: 'id_produto_dashboard_configuracao',
  id_usuario_dashboard_configuracao: 'id_usuario_dashboard_configuracao',
  nome_dashboard_configuracao: 'nome_dashboard_configuracao',
  modo_dashboard_configuracao: 'modo_dashboard_configuracao',
  layout_dashboard_configuracao: 'layout_dashboard_configuracao',
  filtros_dashboard_configuracao: 'filtros_dashboard_configuracao',
  padrao_dashboard_configuracao: 'padrao_dashboard_configuracao',
  data_criacao_dashboard_configuracao: 'data_criacao_dashboard_configuracao',
  data_atualizacao_dashboard_configuracao: 'data_atualizacao_dashboard_configuracao'
};

exports.Prisma.DashboardCriarScalarFieldEnum = {
  id_dashboard_criar: 'id_dashboard_criar',
  id_organizacao_dashboard_criar: 'id_organizacao_dashboard_criar',
  id_produto_dashboard_criar: 'id_produto_dashboard_criar',
  id_usuario_dashboard_criar: 'id_usuario_dashboard_criar',
  id_dashboard_dashboard_criar: 'id_dashboard_dashboard_criar',
  chave_widget_dashboard_criar: 'chave_widget_dashboard_criar',
  tipo_widget_dashboard_criar: 'tipo_widget_dashboard_criar',
  tipo_grafico_dashboard_criar: 'tipo_grafico_dashboard_criar',
  titulo_dashboard_criar: 'titulo_dashboard_criar',
  query_spec_dashboard_criar: 'query_spec_dashboard_criar',
  posicao_dashboard_criar: 'posicao_dashboard_criar',
  config_dashboard_criar: 'config_dashboard_criar',
  data_criacao_dashboard_criar: 'data_criacao_dashboard_criar',
  data_atualizacao_dashboard_criar: 'data_atualizacao_dashboard_criar'
};

exports.Prisma.DashboardMetricasScalarFieldEnum = {
  id_dashboard_metricas: 'id_dashboard_metricas',
  id_organizacao_dashboard_metricas: 'id_organizacao_dashboard_metricas',
  id_produto_dashboard_metricas: 'id_produto_dashboard_metricas',
  id_usuario_dashboard_metricas: 'id_usuario_dashboard_metricas',
  chave_metrica_dashboard_metricas: 'chave_metrica_dashboard_metricas',
  dimensoes_dashboard_metricas: 'dimensoes_dashboard_metricas',
  valor_dashboard_metricas: 'valor_dashboard_metricas',
  periodo_inicio_dashboard_metricas: 'periodo_inicio_dashboard_metricas',
  periodo_fim_dashboard_metricas: 'periodo_fim_dashboard_metricas',
  capturado_em_dashboard_metricas: 'capturado_em_dashboard_metricas'
};

exports.Prisma.DashboardAlertasScalarFieldEnum = {
  id_dashboard_alertas: 'id_dashboard_alertas',
  id_organizacao_dashboard_alertas: 'id_organizacao_dashboard_alertas',
  id_produto_dashboard_alertas: 'id_produto_dashboard_alertas',
  id_usuario_dashboard_alertas: 'id_usuario_dashboard_alertas',
  id_dashboard_dashboard_alertas: 'id_dashboard_dashboard_alertas',
  id_widget_dashboard_alertas: 'id_widget_dashboard_alertas',
  chave_metrica_dashboard_alertas: 'chave_metrica_dashboard_alertas',
  condicao_dashboard_alertas: 'condicao_dashboard_alertas',
  limiar_dashboard_alertas: 'limiar_dashboard_alertas',
  canais_dashboard_alertas: 'canais_dashboard_alertas',
  ativa_dashboard_alertas: 'ativa_dashboard_alertas',
  ultimo_disparo_dashboard_alertas: 'ultimo_disparo_dashboard_alertas',
  data_criacao_dashboard_alertas: 'data_criacao_dashboard_alertas',
  data_atualizacao_dashboard_alertas: 'data_atualizacao_dashboard_alertas'
};

exports.Prisma.DashboardCompartilharScalarFieldEnum = {
  id_dashboard_compartilhar: 'id_dashboard_compartilhar',
  id_organizacao_dashboard_compartilhar: 'id_organizacao_dashboard_compartilhar',
  id_produto_dashboard_compartilhar: 'id_produto_dashboard_compartilhar',
  id_usuario_dashboard_compartilhar: 'id_usuario_dashboard_compartilhar',
  id_dashboard_dashboard_compartilhar: 'id_dashboard_dashboard_compartilhar',
  token_share_dashboard_compartilhar: 'token_share_dashboard_compartilhar',
  canal_dashboard_compartilhar: 'canal_dashboard_compartilhar',
  email_destinatario_dashboard_compartilhar: 'email_destinatario_dashboard_compartilhar',
  telefone_destinatario_dashboard_compartilhar: 'telefone_destinatario_dashboard_compartilhar',
  snapshot_dashboard_compartilhar: 'snapshot_dashboard_compartilhar',
  expira_em_dashboard_compartilhar: 'expira_em_dashboard_compartilhar',
  data_criacao_dashboard_compartilhar: 'data_criacao_dashboard_compartilhar'
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
