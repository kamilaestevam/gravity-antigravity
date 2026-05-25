
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
      "value": "C:\\Users\\danie\\gravity-antigravity\\servicos-global\\cadastros\\generated",
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
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x"
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\danie\\gravity-antigravity\\servicos-global\\cadastros\\prisma\\schema.prisma",
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
        "fromEnvVar": "CADASTROS_DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// ============================================================================\n// schema.prisma — GERADO AUTOMATICAMENTE\n// NÃO EDITAR MANUALMENTE — será sobrescrito na próxima execução de compose.\n// Gerado em: 2026-05-25T22:27:40.504Z\n// Banco: gravity-cadastros-* (Railway)\n// Serviço: @gravity/cadastros\n// Documento técnico: documentos-tecnicos/banco-dados/cadastros-arquitetura.md\n// ============================================================================\n\n// servicos-global/tenant/cadastros/prisma/schema.base.prisma\n// ARQUIVO BASE — NÃO MODIFICAR DIRETAMENTE\n// Contém apenas datasource e generator.\n// O Coordenador compõe o schema.prisma final via scripts/ativamente/compose-cadastros-schema.ts\n// adicionando o fragment.prisma do serviço cadastros.\n//\n// Banco: gravity-cadastros-* (Railway) — 4º banco do ecossistema Gravity\n// Documento técnico: documentos-tecnicos/banco-dados/cadastros-arquitetura.md\n// Padrão: Database-per-Service, schema único `public`\n\ngenerator client {\n  provider      = \"prisma-client-js\"\n  output        = \"../generated\"\n  binaryTargets = [\"native\", \"debian-openssl-1.1.x\", \"debian-openssl-3.0.x\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"CADASTROS_DATABASE_URL\")\n}\n\n// --- Fragment: cadastros ---\n\n// =====================================================================\n// Fragment Prisma — Serviço @tenant/cadastros — ONDA 38 (DDD Cadastros)\n// =====================================================================\n// Fonte da verdade: documentos-tecnicos/banco-dados/cadastros-arquitetura.md\n//\n// Onda 38 — DDD: erradicação de @map de coluna; todos os fields físicos\n// usam sufixo completo casando com @@map; modelos em PascalCase.\n// Catálogos globais (Moeda, Unidade, Ncm) preservados sem id_organizacao\n// por decisão arquitetural (seção 4.2 do documento técnico).\n//\n// IMPORTANTE:\n// - Este fragment NÃO deve ser editado diretamente em schema.prisma.\n// - O Coordenador é o único autorizado a rodar a composição do schema\n//   consolidado (Mandamento 02).\n// - Booleans usam o adjetivo (ativo, pode_ser_*), sem prefixo is_/has_.\n// - DTO/ACL nas rotas: API expõe `id_organizacao` (sem sufixo); banco usa\n//   `id_organizacao_cadastro_fornecedor`.\n// =====================================================================\n\n// ---------------------------------------------------------------------\n// Empresa — identidade 1:1 da organização (Cadastros §4.1)\n// Separada de Fornecedor (parceiros/contrapartes).\n// ---------------------------------------------------------------------\nmodel Empresa {\n  id_empresa String @id\n\n  id_organizacao_empresa String @unique(map: \"empresa_id_organizacao_empresa_key\")\n\n  nome_empresa               String\n  cnpj_empresa               String?\n  tin_empresa                String?\n  pais_empresa               String\n  estado_provincia_empresa   String?\n  cidade_empresa             String?\n  endereco_empresa           String?\n  cep_zipcode_empresa        String?\n  email_principal_empresa    String?\n  telefone_principal_empresa String?\n  whatsapp_principal_empresa String?\n\n  pode_ser_importador_empresa                              Boolean @default(false)\n  pode_ser_exportador_empresa                              Boolean @default(false)\n  pode_ser_fabricante_empresa                              Boolean @default(false)\n  pode_ser_agente_empresa                                  Boolean @default(false)\n  pode_ser_despachante_empresa                             Boolean @default(false)\n  pode_ser_armador_empresa                                 Boolean @default(false)\n  pode_ser_cia_aerea_empresa                               Boolean @default(false)\n  pode_ser_transportadora_rodoviaria_nacional_empresa      Boolean @default(false)\n  pode_ser_transportadora_rodoviaria_internacional_empresa Boolean @default(false)\n  pode_ser_armazem_alfandegado_empresa                     Boolean @default(false)\n  pode_ser_armazem_nacional_empresa                        Boolean @default(false)\n  pode_ser_banco_empresa                                   Boolean @default(false)\n  pode_ser_seguradora_internacional_empresa                Boolean @default(false)\n  pode_ser_seguradora_corretora_cambio_empresa             Boolean @default(false)\n\n  ativo_empresa         Boolean  @default(true)\n  criado_em_empresa     DateTime @default(now())\n  atualizado_em_empresa DateTime @updatedAt\n\n  @@unique([id_organizacao_empresa, cnpj_empresa], map: \"emp_unq_org_cnpj\")\n  @@unique([id_organizacao_empresa, tin_empresa, pais_empresa], map: \"emp_unq_org_tin_pais\")\n  @@index([id_organizacao_empresa], map: \"emp_org_idx\")\n  @@index([id_organizacao_empresa, nome_empresa], map: \"emp_org_nome_idx\")\n  @@map(\"empresa\")\n}\n\n// ---------------------------------------------------------------------\n// Fornecedor — cartório de identidades COMEX (per-tenant)\n// ---------------------------------------------------------------------\n// Dois regimes:\n// - Parceiro pedido (exportador Shenzhen): id_fornecedor por org cadastro.\n// - Prestador portal (agente CNPJ): um id_fornecedor, várias fornecedor_organizacao.\n//\n// Tipo visual DERIVADO das flags pode_ser_*, NÃO enum único no master.\n// ---------------------------------------------------------------------\nmodel Fornecedor {\n  id_fornecedor String @id\n\n  id_organizacao_cadastro_fornecedor String\n  id_produto_fornecedor              String?\n  id_usuario_cadastro_fornecedor     String?\n\n  nome_fornecedor               String\n  cnpj_fornecedor               String?\n  tin_fornecedor                String?\n  pais_fornecedor               String\n  estado_provincia_fornecedor   String?\n  cidade_fornecedor             String?\n  endereco_fornecedor           String?\n  cep_zipcode_fornecedor        String?\n  email_principal_fornecedor    String?\n  telefone_principal_fornecedor String?\n  whatsapp_principal_fornecedor String?\n\n  pode_ser_importador_fornecedor                              Boolean @default(false)\n  pode_ser_exportador_fornecedor                              Boolean @default(false)\n  pode_ser_fabricante_fornecedor                              Boolean @default(false)\n  pode_ser_agente_fornecedor                                  Boolean @default(false)\n  pode_ser_despachante_fornecedor                             Boolean @default(false)\n  pode_ser_armador_fornecedor                                 Boolean @default(false)\n  pode_ser_armazem_alfandegado_fornecedor                     Boolean @default(false)\n  pode_ser_transportadora_rodoviaria_nacional_fornecedor      Boolean @default(false)\n  pode_ser_cia_aerea_fornecedor                               Boolean @default(false)\n  pode_ser_transportadora_rodoviaria_internacional_fornecedor Boolean @default(false)\n  pode_ser_seguradora_internacional_fornecedor                Boolean @default(false)\n  pode_ser_seguradora_corretora_cambio_fornecedor             Boolean @default(false)\n  pode_ser_banco_fornecedor                                   Boolean @default(false)\n  pode_ser_armazem_nacional_fornecedor                        Boolean @default(false)\n\n  ativo_fornecedor         Boolean  @default(true)\n  criado_em_fornecedor     DateTime @default(now())\n  atualizado_em_fornecedor DateTime @updatedAt\n\n  fornecedores_organizacao FornecedorOrganizacao[]\n\n  @@unique([id_organizacao_cadastro_fornecedor, cnpj_fornecedor], map: \"forn_unq_org_cnpj\")\n  @@unique([id_organizacao_cadastro_fornecedor, tin_fornecedor, pais_fornecedor], map: \"forn_unq_org_tin_pais\")\n  @@index([id_organizacao_cadastro_fornecedor], map: \"forn_org_idx\")\n  @@index([id_organizacao_cadastro_fornecedor, id_produto_fornecedor], map: \"forn_org_prd_idx\")\n  @@index([id_organizacao_cadastro_fornecedor, id_usuario_cadastro_fornecedor], map: \"forn_org_usr_idx\")\n  @@index([id_organizacao_cadastro_fornecedor, nome_fornecedor], map: \"forn_org_nome_idx\")\n  @@map(\"fornecedor\")\n}\n\n// ---------------------------------------------------------------------\n// FornecedorOrganizacao — vínculo fornecedor ↔ organização cliente (SSOT)\n// ---------------------------------------------------------------------\n// SSOT Cadastros para todos os produtos Gravity. Substitui\n// configurador.fornecedor_organizacao (remoção no Configurador = passo 02).\n//\n// id_fornecedor → fornecedor.id_fornecedor (cartório).\n// id_usuario    = Configurador.usuario.id_usuario (FK lógica). NÃO há id_fornecedor em usuario.\n// Sem snapshot nesta tabela — dados vivos via FK; snapshot δ no Pedido/contrato.\n// Mesmo id_fornecedor pode ter várias id_organizacao (troca de crachá portal).\n// ---------------------------------------------------------------------\n\nenum TipoFornecedorOrganizacao {\n  AGENTE_CARGA\n  DESPACHANTE_ADUANEIRO\n  ARMADOR\n  CIA_AEREA\n  TRANSPORTADORA_RODOVIARIA_NACIONAL\n  TRANSPORTADORA_RODOVIARIA_INTERNACIONAL\n  ARMAZEM_ALFANDEGADO\n  ARMAZEM_NACIONAL\n  BANCO\n  SEGURADORA_INTERNACIONAL\n  CORRETORA_CAMBIO\n  FABRICANTE\n}\n\nenum StatusFornecedorOrganizacao {\n  ATIVO\n  INATIVO\n  PENDENTE_APROVACAO\n}\n\nmodel FornecedorOrganizacao {\n  id_fornecedor_organizacao String @id @default(cuid())\n\n  id_fornecedor  String\n  // Organização Gravity cliente que habilita/contrata o fornecedor\n  id_organizacao String\n\n  tipo_fornecedor_organizacao   TipoFornecedorOrganizacao\n  status_fornecedor_organizacao StatusFornecedorOrganizacao @default(ATIVO)\n\n  // Usuário FORNECEDOR habilitado (Configurador.usuario.id_usuario) — cross-DB\n  id_usuario String?\n\n  data_criacao_fornecedor_organizacao     DateTime @default(now())\n  data_atualizacao_fornecedor_organizacao DateTime @updatedAt\n\n  fornecedor Fornecedor @relation(fields: [id_fornecedor], references: [id_fornecedor], onDelete: Restrict)\n\n  @@unique([id_fornecedor, id_organizacao, tipo_fornecedor_organizacao], map: \"fornecedor_organizacao_forn_org_tipo_unq\")\n  @@index([id_organizacao], map: \"fornecedor_organizacao_org_idx\")\n  @@index([id_organizacao, id_fornecedor], map: \"fornecedor_organizacao_org_forn_idx\")\n  @@index([id_organizacao, id_usuario], map: \"fornecedor_organizacao_org_usr_idx\")\n  @@index([id_fornecedor], map: \"fornecedor_organizacao_forn_idx\")\n  @@map(\"fornecedor_organizacao\")\n}\n\n// ---------------------------------------------------------------------\n// Catálogos globais (Moeda, Unidade, Ncm, Pais) — sem id_organizacao\n// Decisão arquitetural: catálogos compartilhados entre todos os tenants.\n// ---------------------------------------------------------------------\n\n/// Pais — fonte única da verdade para país no monorepo Gravity.\n/// 252 países seedeados de planilha consolidada (RFB + BACEN + SPED + ISO).\n/// Toda entidade que referencia país (Empresa, Workspace, Organizacao,\n/// AgenteCarga, Seguradora, etc.) deve apontar para id_pais (lookup lógico\n/// cross-banco — sem FK física pois entidades vivem em DBs distintos).\n/// Lei: skills/governanca/lei/cadastros-snapshot-policy/SKILL.md\nmodel Pais {\n  id_pais String @id @default(cuid())\n\n  // Nomes (RFB / referência internacional)\n  nome_pais_portugues String @unique\n  nome_pais_ingles    String\n\n  // Códigos brasileiros (COMEX, fiscal, contábil)\n  // NÃO UNIQUE: planilha consolidada tem 4 duplicatas legítimas em\n  // codigo_pais_portal_unico_siscomex (Receita Federal usa o mesmo código\n  // para grupos de territórios — ex: 359 cobre Antártida e Ilha de Man).\n  codigo_pais_portal_unico_siscomex String?\n  codigo_pais_bacen_4               String?\n  codigo_pais_bacen_5               String?\n  codigo_pais_sped_nfe              String?\n  codigo_pais_sped_efd              String?\n\n  // Códigos ISO 3166-1 (integrações internacionais)\n  codigo_pais_iso_alpha2   String? @unique\n  codigo_pais_iso_alpha3   String? @unique\n  codigo_pais_iso_numerico String?\n\n  ativo_pais Boolean @default(true)\n\n  @@index([nome_pais_portugues])\n  @@map(\"pais\")\n}\n\nmodel Moeda {\n  codigo_moeda  String  @id // BRL, USD, EUR, CNY\n  nome_moeda    String // Real Brasileiro, Dólar Americano, Euro, Yuan\n  simbolo_moeda String\n  ativo_moeda   Boolean @default(true)\n\n  @@map(\"moeda\")\n}\n\nmodel Unidade {\n  codigo_unidade String  @id // KG, UN, M, L\n  nome_unidade   String\n  tipo_unidade   String // peso, quantidade, comprimento, volume\n  ativo_unidade  Boolean @default(true)\n\n  @@map(\"unidade\")\n}\n\n// ---------------------------------------------------------------------\n// Incoterm — catálogo global dos termos da ICC (Incoterms 2020).\n// Padrão internacional fixo. Quando a ICC publicar Incoterms 2030,\n// criar nova versao_incoterm e manter compatibilidade.\n// ---------------------------------------------------------------------\nmodel Incoterm {\n  codigo_incoterm    String  @id // FOB, CIF, EXW, CFR, DDP, DAP, FCA, CPT, CIP, DPU, FAS\n  nome_incoterm      String // \"Free On Board\", \"Cost Insurance and Freight\"\n  descricao_incoterm String?\n  modal_transporte   String // \"maritimo\" | \"qualquer\"\n  versao_incoterm    String  @default(\"2020\")\n  ativo_incoterm     Boolean @default(true)\n\n  @@map(\"incoterm\")\n}\n\n// ---------------------------------------------------------------------\n// Porto — catálogo global de portos marítimos/fluviais (UN/LOCODE).\n// Fonte: UNECE UN/LOCODE (datahub.io), ~6.000 portos ativos.\n// Critério de inclusão: Function contém \"1\" (port) ou \"8\" (inland water).\n// Atualizado 2x/ano pelo UN (via seed script manual).\n// Catálogo global — sem id_organizacao.\n// Lei: skills/governanca/lei/cadastros-snapshot-policy/SKILL.md\n// ---------------------------------------------------------------------\n\nmodel Porto {\n  id_porto String @id @default(cuid())\n\n  // UN/LOCODE — identificação única internacional\n  codigo_unlocode_porto String @unique // ex: \"BRSSZ\", \"USNYC\", \"CNSHA\"\n  codigo_pais_porto     String // ISO alpha-2 (BR, US, CN)\n  codigo_local_porto    String // 3 chars UNLOCODE (SSZ, NYC, SHA)\n\n  // Nomes\n  nome_porto       String // Santos, New York, Shanghai\n  nome_ascii_porto String // sem diacríticos (busca)\n\n  // Localização\n  subdivisao_porto String? // UF/estado/província (SP, NY, SH)\n  latitude_porto   Float?\n  longitude_porto  Float?\n\n  // IATA (quando porto coincide com localidade de aeroporto)\n  codigo_iata_porto String?\n\n  // Estado\n  ativo_porto Boolean @default(true)\n\n  @@index([codigo_pais_porto], map: \"porto_pais_idx\")\n  @@index([nome_porto], map: \"porto_nome_idx\")\n  @@index([nome_ascii_porto], map: \"porto_nome_ascii_idx\")\n  @@index([ativo_porto], map: \"porto_ativo_idx\")\n  @@map(\"porto\")\n}\n\n// ---------------------------------------------------------------------\n// Aeroporto — catálogo global de aeroportos (UN/LOCODE + IATA).\n// Fonte: UNECE UN/LOCODE (datahub.io), ~4.000 aeroportos ativos.\n// Critério de inclusão: Function contém \"4\" (airport).\n// Atualizado 2x/ano pelo UN (via seed script manual).\n// Catálogo global — sem id_organizacao.\n// Lei: skills/governanca/lei/cadastros-snapshot-policy/SKILL.md\n// ---------------------------------------------------------------------\n\nmodel Aeroporto {\n  id_aeroporto String @id @default(cuid())\n\n  // UN/LOCODE — identificação única internacional\n  codigo_unlocode_aeroporto String @unique // ex: \"BRGRU\", \"USJFK\", \"CNPVG\"\n  codigo_pais_aeroporto     String // ISO alpha-2 (BR, US, CN)\n  codigo_local_aeroporto    String // 3 chars UNLOCODE (GRU, JFK, PVG)\n\n  // Nomes\n  nome_aeroporto       String // Guarulhos, John F. Kennedy, Pudong\n  nome_ascii_aeroporto String // sem diacríticos (busca)\n\n  // Localização\n  subdivisao_aeroporto String? // UF/estado/província (SP, NY, SH)\n  latitude_aeroporto   Float?\n  longitude_aeroporto  Float?\n\n  // IATA — código de 3 letras do aeroporto (fundamental para aéreo)\n  codigo_iata_aeroporto String? @unique // GRU, JFK, PVG\n\n  // Estado\n  ativo_aeroporto Boolean @default(true)\n\n  @@index([codigo_pais_aeroporto], map: \"aeroporto_pais_idx\")\n  @@index([nome_aeroporto], map: \"aeroporto_nome_idx\")\n  @@index([nome_ascii_aeroporto], map: \"aeroporto_nome_ascii_idx\")\n  @@index([ativo_aeroporto], map: \"aeroporto_ativo_idx\")\n  @@map(\"aeroporto\")\n}\n\n// ---------------------------------------------------------------------\n// Container — catálogo global / fonte única da verdade (ISO 6346).\n// Cada registro = um tipo+tamanho de container existente no mundo.\n// ~25 tipos práticos. Catálogo global — sem id_organizacao.\n// Produtos fazem snapshot deste catálogo nas suas tabelas filhas:\n//   - BID Frete:     container_dados_bid_frete   (snapshot catálogo)\n//   - Processo:      container_processo           (snapshot + operacional)\n//   - NF Importação: container_nf_importacao      (snapshot + operacional)\n// Lei: skills/governanca/lei/cadastros-snapshot-policy/SKILL.md\n// ---------------------------------------------------------------------\n\nmodel Container {\n  id_container String @id @default(cuid())\n\n  // Tipo funcional (enum)\n  tipo_container ContainerTipo\n\n  // Tamanho\n  tamanho_container String // \"20'\" | \"40'\" | \"40'HC\" | \"45'\"\n\n  // ISO 6346 — código de 4 caracteres\n  codigo_iso_container String? @unique // ex: \"22G0\", \"45R1\", \"42U1\"\n\n  // Armador proprietário do container\n  armador_dono_container String? // ex: \"MSC\", \"Maersk\", \"Hapag-Lloyd\", \"CMA CGM\"\n\n  // Estado\n  ativo_container Boolean @default(true)\n\n  @@index([tipo_container], map: \"container_tipo_idx\")\n  @@index([tamanho_container], map: \"container_tamanho_idx\")\n  @@index([ativo_container], map: \"container_ativo_idx\")\n  @@map(\"container\")\n}\n\n// ---------------------------------------------------------------------\n// Enum ContainerTipo — tipos funcionais ISO 6346 + Siscomex Tabela EF.\n// Cobre 99% do frete marítimo prático.\n// ---------------------------------------------------------------------\nenum ContainerTipo {\n  DRY\n  REEFER\n  OPEN_TOP\n  FLAT_RACK\n  TANK\n  BULK\n  PLATAFORMA\n}\n\n// ---------------------------------------------------------------------\n// NcmSync — catálogo NCM sincronizado do Portal Único Siscomex\n// (renomeado de \"Ncm\" para evitar confusão com a coluna \"ncm_item\" das\n// tabelas de produto. O job diário de sync mora aqui no Cadastros).\n// Catálogo global — sem id_organizacao (alíquotas vêm da Receita Federal,\n// iguais para todas as organizações).\n// ---------------------------------------------------------------------\n\nmodel NcmSync {\n  codigo_ncm_sync String @id // 8 dígitos — chave natural\n\n  descricao_ncm_sync String\n  ipi_ncm_sync       Float?\n  ii_ncm_sync        Float?\n  pis_ncm_sync       Float?\n  cofins_ncm_sync    Float?\n  ativo_ncm_sync     Boolean @default(true)\n\n  // Metadados do Portal Único\n  data_inicio_ncm_sync DateTime?\n  data_fim_ncm_sync    DateTime?\n\n  // Referência ao NcmSyncLog que inseriu/atualizou este código\n  id_ncm_sync_log String?\n\n  // Timestamps\n  data_criacao_ncm_sync     DateTime @default(now())\n  data_atualizacao_ncm_sync DateTime @updatedAt\n\n  @@index([ativo_ncm_sync], map: \"nsy_ativo_idx\")\n  @@index([id_ncm_sync_log], map: \"nsy_log_idx\")\n  @@map(\"ncm_sync\")\n}\n\n// ---------------------------------------------------------------------\n// NcmSyncLog — histórico de cada sincronização com o Portal Único.\n// Catálogo global — sem id_organizacao (sync é universal).\n// ---------------------------------------------------------------------\n\nmodel NcmSyncLog {\n  id_ncm_sync_log String @id @default(cuid())\n\n  // Timestamps de execução\n  data_inicio_ncm_sync_log    DateTime  @default(now())\n  data_conclusao_ncm_sync_log DateTime?\n\n  // Status (enum PT)\n  status_ncm_sync_log NcmSyncStatusSincronizacao @default(EXECUTANDO)\n\n  // Totais do diff\n  total_ncm_sync_log       Int @default(0)\n  adicionados_ncm_sync_log Int @default(0)\n  alterados_ncm_sync_log   Int @default(0)\n  removidos_ncm_sync_log   Int @default(0)\n\n  // Origem do trigger\n  origem_ncm_sync_log        NcmSyncOrigemSincronizacao @default(JOB)\n  disparado_por_ncm_sync_log String? // id_usuario que disparou se MANUAL\n\n  // Erro (apenas em caso de falha)\n  mensagem_erro_ncm_sync_log String?\n\n  // Timestamps\n  data_criacao_ncm_sync_log     DateTime @default(now())\n  data_atualizacao_ncm_sync_log DateTime @updatedAt\n\n  @@index([status_ncm_sync_log], map: \"nsl_status_idx\")\n  @@index([data_inicio_ncm_sync_log], map: \"nsl_inicio_idx\")\n  @@map(\"ncm_sync_log\")\n}\n\n// ---------------------------------------------------------------------\n// NcmSyncAgendamento — configuração singleton do job de sincronização.\n// id_ncm_sync_agendamento = 'default' — registro único.\n// ---------------------------------------------------------------------\n\nmodel NcmSyncAgendamento {\n  id_ncm_sync_agendamento String @id @default(\"default\")\n\n  ativo_ncm_sync_agendamento          Boolean @default(false)\n  cron_expressao_ncm_sync_agendamento String  @default(\"0 2 * * *\") // 2am diário (America/Sao_Paulo)\n  notificadores_ncm_sync_agendamento  Json    @default(\"[]\") // Array<NcmNotificador>\n\n  data_criacao_ncm_sync_agendamento     DateTime @default(now())\n  data_atualizacao_ncm_sync_agendamento DateTime @updatedAt\n\n  @@map(\"ncm_sync_agendamento\")\n}\n\n// ---------------------------------------------------------------------\n// Enums NCM Sync (valores em PT-BR)\n// ---------------------------------------------------------------------\n\nenum NcmSyncStatusSincronizacao {\n  EXECUTANDO\n  SUCESSO\n  ERRO\n}\n\nenum NcmSyncOrigemSincronizacao {\n  JOB\n  MANUAL\n}\n\n// ---------------------------------------------------------------------\n// Ope — sincronizado de Portal Único (fonte da verdade SISCOMEX)\n// ---------------------------------------------------------------------\nmodel Ope {\n  suid_ope String @id\n\n  // Identificação tenant — TODO field termina em _ope (DDD ONDA 38)\n  id_organizacao_ope String\n  id_produto_ope     String?\n  id_usuario_ope     String?\n\n  codigo_portal_unico_ope  String   @unique(map: \"ope_unq_codigo_portal_unico\")\n  situacao_ope             String // espelho do status SISCOMEX\n  versao_ope               String\n  nome_ope                 String\n  cnpj_raiz_empresa_ope    String\n  pais_ope                 String\n  estado_ope               String?\n  cidade_ope               String?\n  endereco_ope             String?\n  zip_ope                  String?\n  tin_ope                  String?\n  email_ope                String?\n  ultima_sincronizacao_ope DateTime\n  origem_ope               String   @default(\"portal_unico\")\n\n  @@index([id_organizacao_ope], map: \"ope_org_idx\")\n  @@index([id_organizacao_ope, id_produto_ope], map: \"ope_org_prd_idx\")\n  @@index([id_organizacao_ope, id_usuario_ope], map: \"ope_org_usr_idx\")\n  @@map(\"ope\")\n}\n\n// ---------------------------------------------------------------------\n// OPEHistoricoStatus — log de transições de status do OPE\n// Onda 38: corrigido sufixo (era _historico_status_ope; correto é\n// _ope_historico_status casando com @@map \"ope_historico_status\").\n// Onda DB-1 (DDD): renomeado de OpeHistoricoStatus para OPEHistoricoStatus.\n// ---------------------------------------------------------------------\nmodel OPEHistoricoStatus {\n  id_ope_historico_status String @id @default(cuid())\n\n  // Identificação tenant\n  id_organizacao_ope_historico_status String?\n  id_produto_ope_historico_status     String?\n  id_usuario_ope_historico_status     String?\n\n  suid_ope_historico_status            String\n  status_anterior_ope_historico_status String?\n  status_novo_ope_historico_status     String\n  origem_ope_historico_status          String // portal_unico, manual, sistema\n  payload_ope_historico_status         Json\n  registrado_em_ope_historico_status   DateTime @default(now())\n\n  @@index([suid_ope_historico_status], map: \"ohs_suid_idx\")\n  @@index([registrado_em_ope_historico_status], map: \"ohs_data_idx\")\n  @@index([id_organizacao_ope_historico_status], map: \"ohs_org_idx\")\n  @@index([id_organizacao_ope_historico_status, id_produto_ope_historico_status], map: \"ohs_org_prd_idx\")\n  @@index([id_organizacao_ope_historico_status, id_usuario_ope_historico_status], map: \"ohs_org_usr_idx\")\n  @@map(\"ope_historico_status\")\n}\n",
  "inlineSchemaHash": "8f4f8a5139a7b7e62fa080b05ca7137bfa158997b4df1ebd315ab8a91682f884",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Empresa\":{\"dbName\":\"empresa\",\"fields\":[{\"name\":\"id_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cnpj_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tin_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pais_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado_provincia_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cidade_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endereco_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cep_zipcode_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email_principal_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"telefone_principal_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"whatsapp_principal_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_importador_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_exportador_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_fabricante_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_agente_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_despachante_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_armador_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_cia_aerea_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_transportadora_rodoviaria_nacional_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_transportadora_rodoviaria_internacional_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_armazem_alfandegado_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_armazem_nacional_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_banco_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_seguradora_internacional_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_seguradora_corretora_cambio_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criado_em_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atualizado_em_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"id_organizacao_empresa\",\"cnpj_empresa\"],[\"id_organizacao_empresa\",\"tin_empresa\",\"pais_empresa\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"id_organizacao_empresa\",\"cnpj_empresa\"]},{\"name\":null,\"fields\":[\"id_organizacao_empresa\",\"tin_empresa\",\"pais_empresa\"]}],\"isGenerated\":false},\"Fornecedor\":{\"dbName\":\"fornecedor\",\"fields\":[{\"name\":\"id_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao_cadastro_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario_cadastro_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cnpj_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tin_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pais_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado_provincia_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cidade_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endereco_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cep_zipcode_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email_principal_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"telefone_principal_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"whatsapp_principal_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_importador_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_exportador_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_fabricante_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_agente_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_despachante_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_armador_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_armazem_alfandegado_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_transportadora_rodoviaria_nacional_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_cia_aerea_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_transportadora_rodoviaria_internacional_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_seguradora_internacional_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_seguradora_corretora_cambio_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_banco_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_armazem_nacional_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criado_em_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atualizado_em_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"fornecedores_organizacao\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FornecedorOrganizacao\",\"relationName\":\"FornecedorToFornecedorOrganizacao\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"id_organizacao_cadastro_fornecedor\",\"cnpj_fornecedor\"],[\"id_organizacao_cadastro_fornecedor\",\"tin_fornecedor\",\"pais_fornecedor\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"id_organizacao_cadastro_fornecedor\",\"cnpj_fornecedor\"]},{\"name\":null,\"fields\":[\"id_organizacao_cadastro_fornecedor\",\"tin_fornecedor\",\"pais_fornecedor\"]}],\"isGenerated\":false},\"FornecedorOrganizacao\":{\"dbName\":\"fornecedor_organizacao\",\"fields\":[{\"name\":\"id_fornecedor_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_fornecedor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_fornecedor_organizacao\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TipoFornecedorOrganizacao\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_fornecedor_organizacao\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"StatusFornecedorOrganizacao\",\"default\":\"ATIVO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_fornecedor_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_fornecedor_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"fornecedor\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Fornecedor\",\"relationName\":\"FornecedorToFornecedorOrganizacao\",\"relationFromFields\":[\"id_fornecedor\"],\"relationToFields\":[\"id_fornecedor\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"id_fornecedor\",\"id_organizacao\",\"tipo_fornecedor_organizacao\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"id_fornecedor\",\"id_organizacao\",\"tipo_fornecedor_organizacao\"]}],\"isGenerated\":false},\"Pais\":{\"dbName\":\"pais\",\"fields\":[{\"name\":\"id_pais\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_pais_portugues\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_pais_ingles\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_pais_portal_unico_siscomex\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_pais_bacen_4\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_pais_bacen_5\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_pais_sped_nfe\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_pais_sped_efd\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_pais_iso_alpha2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_pais_iso_alpha3\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_pais_iso_numerico\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_pais\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false,\"documentation\":\"Pais — fonte única da verdade para país no monorepo Gravity.\\\\n252 países seedeados de planilha consolidada (RFB + BACEN + SPED + ISO).\\\\nToda entidade que referencia país (Empresa, Workspace, Organizacao,\\\\nAgenteCarga, Seguradora, etc.) deve apontar para id_pais (lookup lógico\\\\ncross-banco — sem FK física pois entidades vivem em DBs distintos).\\\\nLei: skills/governanca/lei/cadastros-snapshot-policy/SKILL.md\"},\"Moeda\":{\"dbName\":\"moeda\",\"fields\":[{\"name\":\"codigo_moeda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_moeda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"simbolo_moeda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_moeda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Unidade\":{\"dbName\":\"unidade\",\"fields\":[{\"name\":\"codigo_unidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_unidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_unidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_unidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Incoterm\":{\"dbName\":\"incoterm\",\"fields\":[{\"name\":\"codigo_incoterm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_incoterm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descricao_incoterm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"modal_transporte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"versao_incoterm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"2020\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_incoterm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Porto\":{\"dbName\":\"porto\",\"fields\":[{\"name\":\"id_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_unlocode_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_pais_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_local_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_ascii_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subdivisao_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latitude_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"longitude_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_iata_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_porto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Aeroporto\":{\"dbName\":\"aeroporto\",\"fields\":[{\"name\":\"id_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_unlocode_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_pais_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_local_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_ascii_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subdivisao_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latitude_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"longitude_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_iata_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_aeroporto\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Container\":{\"dbName\":\"container\",\"fields\":[{\"name\":\"id_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_container\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ContainerTipo\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tamanho_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_iso_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"armador_dono_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NcmSync\":{\"dbName\":\"ncm_sync\",\"fields\":[{\"name\":\"codigo_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descricao_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipi_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ii_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pis_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cofins_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_inicio_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_fim_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NcmSyncLog\":{\"dbName\":\"ncm_sync_log\",\"fields\":[{\"name\":\"id_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_inicio_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_conclusao_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_ncm_sync_log\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NcmSyncStatusSincronizacao\",\"default\":\"EXECUTANDO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"adicionados_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alterados_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"removidos_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origem_ncm_sync_log\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NcmSyncOrigemSincronizacao\",\"default\":\"JOB\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"disparado_por_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mensagem_erro_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NcmSyncAgendamento\":{\"dbName\":\"ncm_sync_agendamento\",\"fields\":[{\"name\":\"id_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"default\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cron_expressao_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"0 2 * * *\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notificadores_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Ope\":{\"dbName\":\"ope\",\"fields\":[{\"name\":\"suid_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_portal_unico_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"situacao_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"versao_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cnpj_raiz_empresa_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pais_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cidade_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endereco_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"zip_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tin_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ultima_sincronizacao_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origem_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"portal_unico\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"OPEHistoricoStatus\":{\"dbName\":\"ope_historico_status\",\"fields\":[{\"name\":\"id_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"suid_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_anterior_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_novo_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origem_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"registrado_em_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"TipoFornecedorOrganizacao\":{\"values\":[{\"name\":\"AGENTE_CARGA\",\"dbName\":null},{\"name\":\"DESPACHANTE_ADUANEIRO\",\"dbName\":null},{\"name\":\"ARMADOR\",\"dbName\":null},{\"name\":\"CIA_AEREA\",\"dbName\":null},{\"name\":\"TRANSPORTADORA_RODOVIARIA_NACIONAL\",\"dbName\":null},{\"name\":\"TRANSPORTADORA_RODOVIARIA_INTERNACIONAL\",\"dbName\":null},{\"name\":\"ARMAZEM_ALFANDEGADO\",\"dbName\":null},{\"name\":\"ARMAZEM_NACIONAL\",\"dbName\":null},{\"name\":\"BANCO\",\"dbName\":null},{\"name\":\"SEGURADORA_INTERNACIONAL\",\"dbName\":null},{\"name\":\"CORRETORA_CAMBIO\",\"dbName\":null},{\"name\":\"FABRICANTE\",\"dbName\":null}],\"dbName\":null},\"StatusFornecedorOrganizacao\":{\"values\":[{\"name\":\"ATIVO\",\"dbName\":null},{\"name\":\"INATIVO\",\"dbName\":null},{\"name\":\"PENDENTE_APROVACAO\",\"dbName\":null}],\"dbName\":null},\"ContainerTipo\":{\"values\":[{\"name\":\"DRY\",\"dbName\":null},{\"name\":\"REEFER\",\"dbName\":null},{\"name\":\"OPEN_TOP\",\"dbName\":null},{\"name\":\"FLAT_RACK\",\"dbName\":null},{\"name\":\"TANK\",\"dbName\":null},{\"name\":\"BULK\",\"dbName\":null},{\"name\":\"PLATAFORMA\",\"dbName\":null}],\"dbName\":null},\"NcmSyncStatusSincronizacao\":{\"values\":[{\"name\":\"EXECUTANDO\",\"dbName\":null},{\"name\":\"SUCESSO\",\"dbName\":null},{\"name\":\"ERRO\",\"dbName\":null}],\"dbName\":null},\"NcmSyncOrigemSincronizacao\":{\"values\":[{\"name\":\"JOB\",\"dbName\":null},{\"name\":\"MANUAL\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    CADASTROS_DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['CADASTROS_DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.CADASTROS_DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

