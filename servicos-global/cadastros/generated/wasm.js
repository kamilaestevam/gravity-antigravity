
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
  id_empresa: 'id_empresa',
  id_organizacao_empresa: 'id_organizacao_empresa',
  nome_empresa: 'nome_empresa',
  cnpj_empresa: 'cnpj_empresa',
  tin_empresa: 'tin_empresa',
  pais_empresa: 'pais_empresa',
  estado_provincia_empresa: 'estado_provincia_empresa',
  cidade_empresa: 'cidade_empresa',
  endereco_empresa: 'endereco_empresa',
  cep_zipcode_empresa: 'cep_zipcode_empresa',
  email_principal_empresa: 'email_principal_empresa',
  telefone_principal_empresa: 'telefone_principal_empresa',
  whatsapp_principal_empresa: 'whatsapp_principal_empresa',
  pode_ser_importador_empresa: 'pode_ser_importador_empresa',
  pode_ser_exportador_empresa: 'pode_ser_exportador_empresa',
  pode_ser_fabricante_empresa: 'pode_ser_fabricante_empresa',
  pode_ser_agente_empresa: 'pode_ser_agente_empresa',
  pode_ser_despachante_empresa: 'pode_ser_despachante_empresa',
  pode_ser_armador_empresa: 'pode_ser_armador_empresa',
  pode_ser_cia_aerea_empresa: 'pode_ser_cia_aerea_empresa',
  pode_ser_transportadora_rodoviaria_nacional_empresa: 'pode_ser_transportadora_rodoviaria_nacional_empresa',
  pode_ser_transportadora_rodoviaria_internacional_empresa: 'pode_ser_transportadora_rodoviaria_internacional_empresa',
  pode_ser_armazem_alfandegado_empresa: 'pode_ser_armazem_alfandegado_empresa',
  pode_ser_armazem_nacional_empresa: 'pode_ser_armazem_nacional_empresa',
  pode_ser_banco_empresa: 'pode_ser_banco_empresa',
  pode_ser_seguradora_internacional_empresa: 'pode_ser_seguradora_internacional_empresa',
  pode_ser_seguradora_corretora_cambio_empresa: 'pode_ser_seguradora_corretora_cambio_empresa',
  ativo_empresa: 'ativo_empresa',
  criado_em_empresa: 'criado_em_empresa',
  atualizado_em_empresa: 'atualizado_em_empresa'
};

exports.Prisma.FornecedorScalarFieldEnum = {
  id_fornecedor: 'id_fornecedor',
  id_organizacao_cadastro_fornecedor: 'id_organizacao_cadastro_fornecedor',
  id_produto_fornecedor: 'id_produto_fornecedor',
  id_usuario_cadastro_fornecedor: 'id_usuario_cadastro_fornecedor',
  nome_fornecedor: 'nome_fornecedor',
  cnpj_fornecedor: 'cnpj_fornecedor',
  tin_fornecedor: 'tin_fornecedor',
  pais_fornecedor: 'pais_fornecedor',
  estado_provincia_fornecedor: 'estado_provincia_fornecedor',
  cidade_fornecedor: 'cidade_fornecedor',
  endereco_fornecedor: 'endereco_fornecedor',
  cep_zipcode_fornecedor: 'cep_zipcode_fornecedor',
  email_principal_fornecedor: 'email_principal_fornecedor',
  telefone_principal_fornecedor: 'telefone_principal_fornecedor',
  whatsapp_principal_fornecedor: 'whatsapp_principal_fornecedor',
  pode_ser_importador_fornecedor: 'pode_ser_importador_fornecedor',
  pode_ser_exportador_fornecedor: 'pode_ser_exportador_fornecedor',
  pode_ser_fabricante_fornecedor: 'pode_ser_fabricante_fornecedor',
  pode_ser_agente_fornecedor: 'pode_ser_agente_fornecedor',
  pode_ser_despachante_fornecedor: 'pode_ser_despachante_fornecedor',
  pode_ser_armador_fornecedor: 'pode_ser_armador_fornecedor',
  pode_ser_armazem_alfandegado_fornecedor: 'pode_ser_armazem_alfandegado_fornecedor',
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: 'pode_ser_transportadora_rodoviaria_nacional_fornecedor',
  pode_ser_cia_aerea_fornecedor: 'pode_ser_cia_aerea_fornecedor',
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: 'pode_ser_transportadora_rodoviaria_internacional_fornecedor',
  pode_ser_seguradora_internacional_fornecedor: 'pode_ser_seguradora_internacional_fornecedor',
  pode_ser_seguradora_corretora_cambio_fornecedor: 'pode_ser_seguradora_corretora_cambio_fornecedor',
  pode_ser_banco_fornecedor: 'pode_ser_banco_fornecedor',
  pode_ser_armazem_nacional_fornecedor: 'pode_ser_armazem_nacional_fornecedor',
  ativo_fornecedor: 'ativo_fornecedor',
  criado_em_fornecedor: 'criado_em_fornecedor',
  atualizado_em_fornecedor: 'atualizado_em_fornecedor'
};

exports.Prisma.FornecedorOrganizacaoScalarFieldEnum = {
  id_fornecedor_organizacao: 'id_fornecedor_organizacao',
  id_fornecedor: 'id_fornecedor',
  id_organizacao: 'id_organizacao',
  tipo_fornecedor_organizacao: 'tipo_fornecedor_organizacao',
  status_fornecedor_organizacao: 'status_fornecedor_organizacao',
  id_usuario: 'id_usuario',
  data_criacao_fornecedor_organizacao: 'data_criacao_fornecedor_organizacao',
  data_atualizacao_fornecedor_organizacao: 'data_atualizacao_fornecedor_organizacao'
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

exports.Prisma.PortoScalarFieldEnum = {
  id_porto: 'id_porto',
  codigo_unlocode_porto: 'codigo_unlocode_porto',
  codigo_pais_porto: 'codigo_pais_porto',
  codigo_local_porto: 'codigo_local_porto',
  nome_porto: 'nome_porto',
  nome_ascii_porto: 'nome_ascii_porto',
  subdivisao_porto: 'subdivisao_porto',
  latitude_porto: 'latitude_porto',
  longitude_porto: 'longitude_porto',
  codigo_iata_porto: 'codigo_iata_porto',
  ativo_porto: 'ativo_porto'
};

exports.Prisma.AeroportoScalarFieldEnum = {
  id_aeroporto: 'id_aeroporto',
  codigo_unlocode_aeroporto: 'codigo_unlocode_aeroporto',
  codigo_pais_aeroporto: 'codigo_pais_aeroporto',
  codigo_local_aeroporto: 'codigo_local_aeroporto',
  nome_aeroporto: 'nome_aeroporto',
  nome_ascii_aeroporto: 'nome_ascii_aeroporto',
  subdivisao_aeroporto: 'subdivisao_aeroporto',
  latitude_aeroporto: 'latitude_aeroporto',
  longitude_aeroporto: 'longitude_aeroporto',
  codigo_iata_aeroporto: 'codigo_iata_aeroporto',
  ativo_aeroporto: 'ativo_aeroporto'
};

exports.Prisma.ContainerScalarFieldEnum = {
  id_container: 'id_container',
  tipo_container: 'tipo_container',
  tamanho_container: 'tamanho_container',
  codigo_iso_container: 'codigo_iso_container',
  armador_dono_container: 'armador_dono_container',
  ativo_container: 'ativo_container'
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
exports.TipoFornecedorOrganizacao = exports.$Enums.TipoFornecedorOrganizacao = {
  AGENTE_CARGA: 'AGENTE_CARGA',
  DESPACHANTE_ADUANEIRO: 'DESPACHANTE_ADUANEIRO',
  ARMADOR: 'ARMADOR',
  CIA_AEREA: 'CIA_AEREA',
  TRANSPORTADORA_RODOVIARIA_NACIONAL: 'TRANSPORTADORA_RODOVIARIA_NACIONAL',
  TRANSPORTADORA_RODOVIARIA_INTERNACIONAL: 'TRANSPORTADORA_RODOVIARIA_INTERNACIONAL',
  ARMAZEM_ALFANDEGADO: 'ARMAZEM_ALFANDEGADO',
  ARMAZEM_NACIONAL: 'ARMAZEM_NACIONAL',
  BANCO: 'BANCO',
  SEGURADORA_INTERNACIONAL: 'SEGURADORA_INTERNACIONAL',
  CORRETORA_CAMBIO: 'CORRETORA_CAMBIO',
  FABRICANTE: 'FABRICANTE'
};

exports.StatusFornecedorOrganizacao = exports.$Enums.StatusFornecedorOrganizacao = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
  PENDENTE_APROVACAO: 'PENDENTE_APROVACAO'
};

exports.ContainerTipo = exports.$Enums.ContainerTipo = {
  DRY: 'DRY',
  REEFER: 'REEFER',
  OPEN_TOP: 'OPEN_TOP',
  FLAT_RACK: 'FLAT_RACK',
  TANK: 'TANK',
  BULK: 'BULK',
  PLATAFORMA: 'PLATAFORMA'
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
  Fornecedor: 'Fornecedor',
  FornecedorOrganizacao: 'FornecedorOrganizacao',
  Pais: 'Pais',
  Moeda: 'Moeda',
  Unidade: 'Unidade',
  Incoterm: 'Incoterm',
  Porto: 'Porto',
  Aeroporto: 'Aeroporto',
  Container: 'Container',
  NcmSync: 'NcmSync',
  NcmSyncLog: 'NcmSyncLog',
  NcmSyncAgendamento: 'NcmSyncAgendamento',
  Ope: 'Ope',
  OPEHistoricoStatus: 'OPEHistoricoStatus'
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
