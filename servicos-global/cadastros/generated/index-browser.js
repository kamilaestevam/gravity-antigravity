
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

exports.Prisma.EmpresaScalarFieldEnum = {
  suid_empresa: 'suid_empresa',
  id_organizacao_empresa: 'id_organizacao_empresa',
  id_produto_empresa: 'id_produto_empresa',
  id_usuario_empresa: 'id_usuario_empresa',
  nome_empresa: 'nome_empresa',
  cnpj_empresa: 'cnpj_empresa',
  tin_empresa: 'tin_empresa',
  pais_empresa: 'pais_empresa',
  estado_empresa: 'estado_empresa',
  cidade_empresa: 'cidade_empresa',
  endereco_empresa: 'endereco_empresa',
  zipcode_empresa: 'zipcode_empresa',
  email_empresa: 'email_empresa',
  telefone_empresa: 'telefone_empresa',
  whatsapp_empresa: 'whatsapp_empresa',
  pode_ser_importador_empresa: 'pode_ser_importador_empresa',
  pode_ser_exportador_empresa: 'pode_ser_exportador_empresa',
  pode_ser_fabricante_empresa: 'pode_ser_fabricante_empresa',
  pode_ser_agente_empresa: 'pode_ser_agente_empresa',
  pode_ser_despachante_empresa: 'pode_ser_despachante_empresa',
  pode_ser_armador_empresa: 'pode_ser_armador_empresa',
  pode_ser_armazem_alfandegado_empresa: 'pode_ser_armazem_alfandegado_empresa',
  pode_ser_transportadora_rodoviaria_nacional_empresa: 'pode_ser_transportadora_rodoviaria_nacional_empresa',
  pode_ser_cia_aerea_empresa: 'pode_ser_cia_aerea_empresa',
  pode_ser_transportadora_rodoviaria_internacional_empresa: 'pode_ser_transportadora_rodoviaria_internacional_empresa',
  pode_ser_seguradora_internacional_empresa: 'pode_ser_seguradora_internacional_empresa',
  pode_ser_seguradora_corretora_cambio_empresa: 'pode_ser_seguradora_corretora_cambio_empresa',
  pode_ser_banco_empresa: 'pode_ser_banco_empresa',
  pode_ser_armazem_nacional_empresa: 'pode_ser_armazem_nacional_empresa',
  ativo_empresa: 'ativo_empresa',
  criado_em_empresa: 'criado_em_empresa',
  atualizado_em_empresa: 'atualizado_em_empresa'
};

exports.Prisma.PaisScalarFieldEnum = {
  id_pais: 'id_pais',
  nome_pais_portugues: 'nome_pais_portugues',
  nome_pais_ingles: 'nome_pais_ingles',
  codigo_pais_portal_unico_siscomex: 'codigo_pais_portal_unico_siscomex',
  codigo_pais_bacen_4: 'codigo_pais_bacen_4',
  codigo_pais_bacen_5: 'codigo_pais_bacen_5',
  codigo_pais_sped_nfe: 'codigo_pais_sped_nfe',
  codigo_pais_sped_efd: 'codigo_pais_sped_efd',
  codigo_pais_iso_alpha2: 'codigo_pais_iso_alpha2',
  codigo_pais_iso_alpha3: 'codigo_pais_iso_alpha3',
  codigo_pais_iso_numerico: 'codigo_pais_iso_numerico',
  ativo_pais: 'ativo_pais'
};

exports.Prisma.MoedaScalarFieldEnum = {
  codigo_moeda: 'codigo_moeda',
  nome_moeda: 'nome_moeda',
  simbolo_moeda: 'simbolo_moeda',
  ativo_moeda: 'ativo_moeda'
};

exports.Prisma.UnidadeScalarFieldEnum = {
  codigo_unidade: 'codigo_unidade',
  nome_unidade: 'nome_unidade',
  tipo_unidade: 'tipo_unidade',
  ativo_unidade: 'ativo_unidade'
};

exports.Prisma.IncotermScalarFieldEnum = {
  codigo_incoterm: 'codigo_incoterm',
  nome_incoterm: 'nome_incoterm',
  descricao_incoterm: 'descricao_incoterm',
  modal_transporte: 'modal_transporte',
  versao_incoterm: 'versao_incoterm',
  ativo_incoterm: 'ativo_incoterm'
};

exports.Prisma.NcmSyncScalarFieldEnum = {
  codigo_ncm_sync: 'codigo_ncm_sync',
  descricao_ncm_sync: 'descricao_ncm_sync',
  ipi_ncm_sync: 'ipi_ncm_sync',
  ii_ncm_sync: 'ii_ncm_sync',
  pis_ncm_sync: 'pis_ncm_sync',
  cofins_ncm_sync: 'cofins_ncm_sync',
  ativo_ncm_sync: 'ativo_ncm_sync',
  data_inicio_ncm_sync: 'data_inicio_ncm_sync',
  data_fim_ncm_sync: 'data_fim_ncm_sync',
  id_ncm_sync_log: 'id_ncm_sync_log',
  data_criacao_ncm_sync: 'data_criacao_ncm_sync',
  data_atualizacao_ncm_sync: 'data_atualizacao_ncm_sync'
};

exports.Prisma.NcmSyncLogScalarFieldEnum = {
  id_ncm_sync_log: 'id_ncm_sync_log',
  data_inicio_ncm_sync_log: 'data_inicio_ncm_sync_log',
  data_conclusao_ncm_sync_log: 'data_conclusao_ncm_sync_log',
  status_ncm_sync_log: 'status_ncm_sync_log',
  total_ncm_sync_log: 'total_ncm_sync_log',
  adicionados_ncm_sync_log: 'adicionados_ncm_sync_log',
  alterados_ncm_sync_log: 'alterados_ncm_sync_log',
  removidos_ncm_sync_log: 'removidos_ncm_sync_log',
  origem_ncm_sync_log: 'origem_ncm_sync_log',
  disparado_por_ncm_sync_log: 'disparado_por_ncm_sync_log',
  mensagem_erro_ncm_sync_log: 'mensagem_erro_ncm_sync_log',
  data_criacao_ncm_sync_log: 'data_criacao_ncm_sync_log',
  data_atualizacao_ncm_sync_log: 'data_atualizacao_ncm_sync_log'
};

exports.Prisma.NcmSyncAgendamentoScalarFieldEnum = {
  id_ncm_sync_agendamento: 'id_ncm_sync_agendamento',
  ativo_ncm_sync_agendamento: 'ativo_ncm_sync_agendamento',
  cron_expressao_ncm_sync_agendamento: 'cron_expressao_ncm_sync_agendamento',
  notificadores_ncm_sync_agendamento: 'notificadores_ncm_sync_agendamento',
  data_criacao_ncm_sync_agendamento: 'data_criacao_ncm_sync_agendamento',
  data_atualizacao_ncm_sync_agendamento: 'data_atualizacao_ncm_sync_agendamento'
};

exports.Prisma.OpeScalarFieldEnum = {
  suid_ope: 'suid_ope',
  id_organizacao_ope: 'id_organizacao_ope',
  id_produto_ope: 'id_produto_ope',
  id_usuario_ope: 'id_usuario_ope',
  codigo_portal_unico_ope: 'codigo_portal_unico_ope',
  situacao_ope: 'situacao_ope',
  versao_ope: 'versao_ope',
  nome_ope: 'nome_ope',
  cnpj_raiz_empresa_ope: 'cnpj_raiz_empresa_ope',
  pais_ope: 'pais_ope',
  estado_ope: 'estado_ope',
  cidade_ope: 'cidade_ope',
  endereco_ope: 'endereco_ope',
  zip_ope: 'zip_ope',
  tin_ope: 'tin_ope',
  email_ope: 'email_ope',
  ultima_sincronizacao_ope: 'ultima_sincronizacao_ope',
  origem_ope: 'origem_ope'
};

exports.Prisma.OPEHistoricoStatusScalarFieldEnum = {
  id_ope_historico_status: 'id_ope_historico_status',
  id_organizacao_ope_historico_status: 'id_organizacao_ope_historico_status',
  id_produto_ope_historico_status: 'id_produto_ope_historico_status',
  id_usuario_ope_historico_status: 'id_usuario_ope_historico_status',
  suid_ope_historico_status: 'suid_ope_historico_status',
  status_anterior_ope_historico_status: 'status_anterior_ope_historico_status',
  status_novo_ope_historico_status: 'status_novo_ope_historico_status',
  origem_ope_historico_status: 'origem_ope_historico_status',
  payload_ope_historico_status: 'payload_ope_historico_status',
  registrado_em_ope_historico_status: 'registrado_em_ope_historico_status'
};

exports.Prisma.ExportadorQuandoImportacaoScalarFieldEnum = {
  id_exportador_quando_importacao: 'id_exportador_quando_importacao',
  id_organizacao_exportador: 'id_organizacao_exportador',
  id_workspace_exportador: 'id_workspace_exportador',
  nome_exportador: 'nome_exportador',
  endereco_exportador: 'endereco_exportador',
  cidade_exportador: 'cidade_exportador',
  estado_provincia_exportador: 'estado_provincia_exportador',
  pais_exportador: 'pais_exportador',
  zipcode_exportador: 'zipcode_exportador',
  criado_em_exportador: 'criado_em_exportador',
  atualizado_em_exportador: 'atualizado_em_exportador'
};

exports.Prisma.ImportadorQuandoExportacaoScalarFieldEnum = {
  id_importador_quando_exportacao: 'id_importador_quando_exportacao',
  id_organizacao_importador: 'id_organizacao_importador',
  id_workspace_importador: 'id_workspace_importador',
  nome_importador: 'nome_importador',
  endereco_importador: 'endereco_importador',
  cidade_importador: 'cidade_importador',
  estado_provincia_importador: 'estado_provincia_importador',
  pais_importador: 'pais_importador',
  zipcode_importador: 'zipcode_importador',
  criado_em_importador: 'criado_em_importador',
  atualizado_em_importador: 'atualizado_em_importador'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
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
exports.NcmSyncStatusSincronizacao = exports.$Enums.NcmSyncStatusSincronizacao = {
  EXECUTANDO: 'EXECUTANDO',
  SUCESSO: 'SUCESSO',
  ERRO: 'ERRO'
};

exports.NcmSyncOrigemSincronizacao = exports.$Enums.NcmSyncOrigemSincronizacao = {
  JOB: 'JOB',
  MANUAL: 'MANUAL'
};

exports.Prisma.ModelName = {
  Empresa: 'Empresa',
  Pais: 'Pais',
  Moeda: 'Moeda',
  Unidade: 'Unidade',
  Incoterm: 'Incoterm',
  NcmSync: 'NcmSync',
  NcmSyncLog: 'NcmSyncLog',
  NcmSyncAgendamento: 'NcmSyncAgendamento',
  Ope: 'Ope',
  OPEHistoricoStatus: 'OPEHistoricoStatus',
  ExportadorQuandoImportacao: 'ExportadorQuandoImportacao',
  ImportadorQuandoExportacao: 'ImportadorQuandoExportacao'
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
