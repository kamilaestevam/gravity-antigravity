
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

exports.Prisma.ProcessoScalarFieldEnum = {
  id_processo: 'id_processo',
  id_organizacao: 'id_organizacao',
  id_workspace: 'id_workspace',
  id_produto_gravity: 'id_produto_gravity',
  id_usuario: 'id_usuario',
  numero_processo: 'numero_processo',
  tipo_operacao_processo: 'tipo_operacao_processo',
  referencia_interna_processo: 'referencia_interna_processo',
  referencia_importador_processo: 'referencia_importador_processo',
  referencia_exportador_processo: 'referencia_exportador_processo',
  id_status_atual_processo: 'id_status_atual_processo',
  id_importacao_exportador_processo: 'id_importacao_exportador_processo',
  id_exportacao_importador_processo: 'id_exportacao_importador_processo',
  id_cotacao_bid_frete_internacional: 'id_cotacao_bid_frete_internacional',
  id_proposta_bid_frete_internacional: 'id_proposta_bid_frete_internacional',
  id_transito_processo: 'id_transito_processo',
  id_operacao_cambio_processo: 'id_operacao_cambio_processo',
  id_responsavel_processo: 'id_responsavel_processo',
  responsavel_rotina_processo: 'responsavel_rotina_processo',
  setor_responsavel_processo: 'setor_responsavel_processo',
  vendedor_responsavel_processo: 'vendedor_responsavel_processo',
  data_criacao_processo: 'data_criacao_processo',
  data_atualizacao_processo: 'data_atualizacao_processo'
};

exports.Prisma.ProcessoStatusScalarFieldEnum = {
  id_processo_status: 'id_processo_status',
  id_organizacao: 'id_organizacao',
  id_produto_gravity: 'id_produto_gravity',
  tipo_status_processo: 'tipo_status_processo',
  rotulo_status_processo: 'rotulo_status_processo',
  cor_status_processo: 'cor_status_processo',
  ordem_status_processo: 'ordem_status_processo',
  regras_status_processo: 'regras_status_processo',
  eh_padrao_status_processo: 'eh_padrao_status_processo',
  eh_sistema_status_processo: 'eh_sistema_status_processo',
  data_criacao_processo_status: 'data_criacao_processo_status',
  data_atualizacao_processo_status: 'data_atualizacao_processo_status'
};

exports.Prisma.HistoricoStatusProcessoScalarFieldEnum = {
  id_historico_status_processo: 'id_historico_status_processo',
  id_organizacao: 'id_organizacao',
  id_produto_gravity: 'id_produto_gravity',
  id_processo: 'id_processo',
  id_status_anterior_processo: 'id_status_anterior_processo',
  id_status_novo_processo: 'id_status_novo_processo',
  id_usuario_mudanca_status_processo: 'id_usuario_mudanca_status_processo',
  data_mudanca_status_processo: 'data_mudanca_status_processo',
  observacao_mudanca_status_processo: 'observacao_mudanca_status_processo'
};

exports.Prisma.LogisticaInternacionalProcessoScalarFieldEnum = {
  id_logistica_internacional_processo: 'id_logistica_internacional_processo',
  id_organizacao: 'id_organizacao',
  id_produto_gravity: 'id_produto_gravity',
  id_processo: 'id_processo',
  modal_frete_internacional_processo: 'modal_frete_internacional_processo',
  tipo_frete_internacional_processo: 'tipo_frete_internacional_processo',
  tipo_volume_processo: 'tipo_volume_processo',
  incoterm_processo: 'incoterm_processo',
  porto_origem_processo: 'porto_origem_processo',
  porto_destino_processo: 'porto_destino_processo',
  porto_transbordo_processo: 'porto_transbordo_processo',
  aeroporto_origem_processo: 'aeroporto_origem_processo',
  aeroporto_destino_processo: 'aeroporto_destino_processo',
  aeroporto_escala_processo: 'aeroporto_escala_processo',
  id_agente_carga: 'id_agente_carga',
  id_armador: 'id_armador',
  id_cia_aerea: 'id_cia_aerea',
  id_transportador_rodo_internacional: 'id_transportador_rodo_internacional',
  id_transportador_rodo_nacional: 'id_transportador_rodo_nacional',
  id_transportador_ferroviario: 'id_transportador_ferroviario',
  id_despachante: 'id_despachante',
  id_armazem_alfandegado: 'id_armazem_alfandegado',
  id_seguradora_internacional: 'id_seguradora_internacional',
  data_criacao_logistica_internacional_processo: 'data_criacao_logistica_internacional_processo',
  data_atualizacao_logistica_internacional_processo: 'data_atualizacao_logistica_internacional_processo'
};

exports.Prisma.DadosProcessoScalarFieldEnum = {
  id_dados_processo: 'id_dados_processo',
  id_organizacao: 'id_organizacao',
  id_produto_gravity: 'id_produto_gravity',
  id_processo: 'id_processo',
  canal_parametrizacao_processo: 'canal_parametrizacao_processo',
  numero_duimp_processo: 'numero_duimp_processo',
  numero_nfe_processo: 'numero_nfe_processo',
  chave_acesso_nfe_processo: 'chave_acesso_nfe_processo',
  data_registro_duimp_processo: 'data_registro_duimp_processo',
  data_liberacao_duimp_processo: 'data_liberacao_duimp_processo',
  data_consulta_liberacao_duimp_processo: 'data_consulta_liberacao_duimp_processo',
  data_previsao_registro_duimp_processo: 'data_previsao_registro_duimp_processo',
  data_previsao_liberacao_duimp_processo: 'data_previsao_liberacao_duimp_processo',
  data_registro_lpco_processo: 'data_registro_lpco_processo',
  data_deferimento_lpco_processo: 'data_deferimento_lpco_processo',
  data_indeferimento_lpco_processo: 'data_indeferimento_lpco_processo',
  data_pendencia_lpco_processo: 'data_pendencia_lpco_processo',
  data_consulta_liberacao_lpco_processo: 'data_consulta_liberacao_lpco_processo',
  data_previsao_registro_lpco_processo: 'data_previsao_registro_lpco_processo',
  data_criacao_dados_processo: 'data_criacao_dados_processo',
  data_atualizacao_dados_processo: 'data_atualizacao_dados_processo'
};

exports.Prisma.CambioProcessoScalarFieldEnum = {
  id_cambio_processo: 'id_cambio_processo',
  id_organizacao: 'id_organizacao',
  id_produto_gravity: 'id_produto_gravity',
  id_processo: 'id_processo',
  id_banco_processo: 'id_banco_processo',
  id_corretora_cambio_processo: 'id_corretora_cambio_processo',
  data_criacao_cambio_processo: 'data_criacao_cambio_processo',
  data_atualizacao_cambio_processo: 'data_atualizacao_cambio_processo'
};

exports.Prisma.EstimativaProcessoScalarFieldEnum = {
  id_estimativa_processo: 'id_estimativa_processo',
  id_organizacao: 'id_organizacao',
  id_produto_gravity: 'id_produto_gravity',
  id_processo: 'id_processo',
  total_imposto_ii_processo: 'total_imposto_ii_processo',
  total_imposto_ipi_processo: 'total_imposto_ipi_processo',
  total_imposto_pis_processo: 'total_imposto_pis_processo',
  total_imposto_cofins_processo: 'total_imposto_cofins_processo',
  total_imposto_icms_processo: 'total_imposto_icms_processo',
  valor_frete_estimado_processo: 'valor_frete_estimado_processo',
  valor_despacho_estimado_processo: 'valor_despacho_estimado_processo',
  valor_outros_estimado_processo: 'valor_outros_estimado_processo',
  valor_total_estimado_processo: 'valor_total_estimado_processo',
  moeda_estimativa_processo: 'moeda_estimativa_processo',
  data_criacao_estimativa_processo: 'data_criacao_estimativa_processo',
  data_atualizacao_estimativa_processo: 'data_atualizacao_estimativa_processo'
};

exports.Prisma.DocumentoProcessoScalarFieldEnum = {
  id_documento_processo: 'id_documento_processo',
  id_organizacao: 'id_organizacao',
  id_produto_gravity: 'id_produto_gravity',
  id_usuario: 'id_usuario',
  id_processo: 'id_processo',
  nome_documento_processo: 'nome_documento_processo',
  tipo_arquivo_documento_processo: 'tipo_arquivo_documento_processo',
  tamanho_bytes_documento_processo: 'tamanho_bytes_documento_processo',
  url_documento_processo: 'url_documento_processo',
  categoria_documento_processo: 'categoria_documento_processo',
  numero_bl_processo: 'numero_bl_processo',
  numero_hawb_processo: 'numero_hawb_processo',
  numero_mawb_processo: 'numero_mawb_processo',
  numero_awb_processo: 'numero_awb_processo',
  numero_hbl_processo: 'numero_hbl_processo',
  numero_mbl_processo: 'numero_mbl_processo',
  numero_ce_mercante_processo: 'numero_ce_mercante_processo',
  numero_certificado_origem_processo: 'numero_certificado_origem_processo',
  numero_cim_processo: 'numero_cim_processo',
  numero_crt_processo: 'numero_crt_processo',
  numero_presenca_carga_destino_processo: 'numero_presenca_carga_destino_processo',
  data_criacao_documento_processo: 'data_criacao_documento_processo'
};

exports.Prisma.ContainerProcessoScalarFieldEnum = {
  id_processo_container: 'id_processo_container',
  id_organizacao: 'id_organizacao',
  id_produto_gravity: 'id_produto_gravity',
  id_processo: 'id_processo',
  container_numero_processo_container: 'container_numero_processo_container',
  container_tipo_processo_container: 'container_tipo_processo_container',
  container_lacre_processo_container: 'container_lacre_processo_container',
  container_tara_processo_container: 'container_tara_processo_container',
  container_peso_bruto_processo_container: 'container_peso_bruto_processo_container',
  container_peso_liquido_processo_container: 'container_peso_liquido_processo_container',
  container_metragem_cubica_processo_container: 'container_metragem_cubica_processo_container',
  local_devolucao_processo_container: 'local_devolucao_processo_container',
  data_devolucao_prevista_processo_container: 'data_devolucao_prevista_processo_container',
  data_devolucao_real_processo_container: 'data_devolucao_real_processo_container',
  data_criacao_container_processo: 'data_criacao_container_processo',
  data_atualizacao_container_processo: 'data_atualizacao_container_processo'
};

exports.Prisma.FollowUpProcessoScalarFieldEnum = {
  id_follow_up_processo: 'id_follow_up_processo',
  id_organizacao: 'id_organizacao',
  id_produto_gravity: 'id_produto_gravity',
  id_usuario: 'id_usuario',
  id_processo: 'id_processo',
  titulo_follow_up_processo: 'titulo_follow_up_processo',
  descricao_follow_up_processo: 'descricao_follow_up_processo',
  tipo_follow_up_processo: 'tipo_follow_up_processo',
  categoria_follow_up_processo: 'categoria_follow_up_processo',
  id_usuario_registro_follow_up_processo: 'id_usuario_registro_follow_up_processo',
  nome_usuario_registro_follow_up_processo: 'nome_usuario_registro_follow_up_processo',
  data_criacao_follow_up_processo: 'data_criacao_follow_up_processo'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
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


exports.Prisma.ModelName = {
  Processo: 'Processo',
  ProcessoStatus: 'ProcessoStatus',
  HistoricoStatusProcesso: 'HistoricoStatusProcesso',
  LogisticaInternacionalProcesso: 'LogisticaInternacionalProcesso',
  DadosProcesso: 'DadosProcesso',
  CambioProcesso: 'CambioProcesso',
  EstimativaProcesso: 'EstimativaProcesso',
  DocumentoProcesso: 'DocumentoProcesso',
  ContainerProcesso: 'ContainerProcesso',
  FollowUpProcesso: 'FollowUpProcesso'
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
