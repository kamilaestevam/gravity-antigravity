
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
  Moeda: 'Moeda',
  Unidade: 'Unidade',
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
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\danie\\gravity-antigravity\\servicos-global\\cadastros\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../.env"
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
  "inlineSchema": "// ============================================================================\n// schema.prisma — GERADO AUTOMATICAMENTE\n// NÃO EDITAR MANUALMENTE — será sobrescrito na próxima execução de compose.\n// Gerado em: 2026-04-26T22:03:23.934Z\n// Banco: gravity-cadastros-* (Railway)\n// Serviço: @tenant/cadastros\n// Documento técnico: documentos-tecnicos/banco-dados/cadastros-arquitetura.md\n// ============================================================================\n\n// servicos-global/tenant/cadastros/prisma/schema.base.prisma\n// ARQUIVO BASE — NÃO MODIFICAR DIRETAMENTE\n// Contém apenas datasource e generator.\n// O Coordenador compõe o schema.prisma final via scripts/ativamente/compose-cadastros-schema.ts\n// adicionando o fragment.prisma do serviço cadastros.\n//\n// Banco: gravity-cadastros-* (Railway) — 4º banco do ecossistema Gravity\n// Documento técnico: documentos-tecnicos/banco-dados/cadastros-arquitetura.md\n// Padrão: Database-per-Service, schema único `public`\n\ngenerator client {\n  provider      = \"prisma-client-js\"\n  output        = \"../generated\"\n  binaryTargets = [\"native\", \"debian-openssl-1.1.x\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"CADASTROS_DATABASE_URL\")\n}\n\n// --- Fragment: cadastros ---\n\n// =====================================================================\n// Fragment Prisma — Serviço @tenant/cadastros — ONDA 38 (DDD Cadastros)\n// =====================================================================\n// Fonte da verdade: documentos-tecnicos/banco-dados/cadastros-arquitetura.md\n//\n// Onda 38 — DDD: erradicação de @map de coluna; todos os fields físicos\n// usam sufixo completo casando com @@map; modelos em PascalCase.\n// Catálogos globais (Moeda, Unidade, Ncm) preservados sem id_organizacao\n// por decisão arquitetural (seção 4.2 do documento técnico).\n//\n// IMPORTANTE:\n// - Este fragment NÃO deve ser editado diretamente em schema.prisma.\n// - O Coordenador é o único autorizado a rodar a composição do schema\n//   consolidado (Mandamento 02).\n// - Booleans usam o adjetivo (ativo, pode_ser_*), sem prefixo is_/has_.\n// - DTO/ACL nas rotas preserva contrato público das schemas Zod\n//   (`shared/schemas/`) — `id_organizacao` continua sendo o nome\n//   exposto na API, mesmo que internamente seja `id_organizacao_empresa`.\n// =====================================================================\n\n// ---------------------------------------------------------------------\n// Empresa — cartório de identidades COMEX (per-tenant)\n// ---------------------------------------------------------------------\n// Tipo da empresa é DERIVADO das flags pode_ser_*, NÃO é campo persistido.\n// Função utilitária: derivarTipoVisual(empresa) em server/src/utils.\n// ---------------------------------------------------------------------\nmodel Empresa {\n  suid_empresa String @id\n\n  // Identificação tenant — TODO field termina em _empresa (DDD ONDA 38)\n  id_organizacao_empresa String\n  id_produto_empresa     String?\n  id_usuario_empresa     String? // criador (Clerk user_id)\n\n  // Identificação fiscal/legal\n  nome_empresa     String\n  cnpj_empresa     String? // obrigatório se pais_empresa = BR\n  tin_empresa      String? // estrangeiros (opcional)\n  pais_empresa     String // ISO-2\n  estado_empresa   String?\n  cidade_empresa   String?\n  endereco_empresa String?\n  zipcode_empresa  String?\n  email_empresa    String?\n  telefone_empresa String?\n  whatsapp_empresa String?\n\n  // Flags de papel (REGRA 5: sem is_/has_)\n  pode_ser_importador_empresa                              Boolean @default(false)\n  pode_ser_exportador_empresa                              Boolean @default(false)\n  pode_ser_fabricante_empresa                              Boolean @default(false)\n  pode_ser_agente_empresa                                  Boolean @default(false)\n  pode_ser_despachante_empresa                             Boolean @default(false)\n  pode_ser_armador_empresa                                 Boolean @default(false)\n  pode_ser_armazem_alfandegado_empresa                     Boolean @default(false)\n  pode_ser_transportadora_rodoviaria_nacional_empresa      Boolean @default(false)\n  pode_ser_cia_aerea_empresa                               Boolean @default(false)\n  pode_ser_transportadora_rodoviaria_internacional_empresa Boolean @default(false)\n  pode_ser_seguradora_internacional_empresa                Boolean @default(false)\n  pode_ser_seguradora_corretora_cambio_empresa             Boolean @default(false)\n  pode_ser_banco_empresa                                   Boolean @default(false)\n  pode_ser_armazem_nacional_empresa                        Boolean @default(false)\n\n  // Estado (REGRA 5)\n  ativo_empresa Boolean @default(true)\n\n  // Timestamps\n  criado_em_empresa     DateTime @default(now())\n  atualizado_em_empresa DateTime @updatedAt\n\n  @@unique([id_organizacao_empresa, cnpj_empresa], map: \"emp_unq_org_cnpj\")\n  @@unique([id_organizacao_empresa, tin_empresa, pais_empresa], map: \"emp_unq_org_tin_pais\")\n  @@index([id_organizacao_empresa], map: \"emp_org_idx\")\n  @@index([id_organizacao_empresa, id_produto_empresa], map: \"emp_org_prd_idx\")\n  @@index([id_organizacao_empresa, id_usuario_empresa], map: \"emp_org_usr_idx\")\n  @@index([id_organizacao_empresa, nome_empresa], map: \"emp_org_nome_idx\")\n  @@map(\"empresa\")\n}\n\n// ---------------------------------------------------------------------\n// Catálogos globais (Moeda, Unidade, Ncm) — sem id_organizacao\n// Decisão arquitetural: catálogos compartilhados entre todos os tenants.\n// ---------------------------------------------------------------------\n\nmodel Moeda {\n  codigo_moeda  String  @id // BRL, USD, EUR, CNY\n  nome_moeda    String // Real Brasileiro, Dólar Americano, Euro, Yuan\n  simbolo_moeda String\n  ativo_moeda   Boolean @default(true)\n\n  @@map(\"moeda\")\n}\n\nmodel Unidade {\n  codigo_unidade String  @id // KG, UN, M, L\n  nome_unidade   String\n  tipo_unidade   String // peso, quantidade, comprimento, volume\n  ativo_unidade  Boolean @default(true)\n\n  @@map(\"unidade\")\n}\n\n// ---------------------------------------------------------------------\n// NcmSync — catálogo NCM sincronizado do Portal Único Siscomex\n// (renomeado de \"Ncm\" para evitar confusão com a coluna \"ncm_item\" das\n// tabelas de produto. O job diário de sync mora aqui no Cadastros).\n// Catálogo global — sem id_organizacao (alíquotas vêm da Receita Federal,\n// iguais para todas as organizações).\n// ---------------------------------------------------------------------\n\nmodel NcmSync {\n  codigo_ncm_sync String @id // 8 dígitos — chave natural\n\n  descricao_ncm_sync String\n  ipi_ncm_sync       Float?\n  ii_ncm_sync        Float?\n  pis_ncm_sync       Float?\n  cofins_ncm_sync    Float?\n  ativo_ncm_sync     Boolean @default(true)\n\n  // Metadados do Portal Único\n  data_inicio_ncm_sync DateTime?\n  data_fim_ncm_sync    DateTime?\n\n  // Referência ao NcmSyncLog que inseriu/atualizou este código\n  id_ncm_sync_log String?\n\n  // Timestamps\n  data_criacao_ncm_sync     DateTime @default(now())\n  data_atualizacao_ncm_sync DateTime @updatedAt\n\n  @@index([ativo_ncm_sync], map: \"nsy_ativo_idx\")\n  @@index([id_ncm_sync_log], map: \"nsy_log_idx\")\n  @@map(\"ncm_sync\")\n}\n\n// ---------------------------------------------------------------------\n// NcmSyncLog — histórico de cada sincronização com o Portal Único.\n// Catálogo global — sem id_organizacao (sync é universal).\n// ---------------------------------------------------------------------\n\nmodel NcmSyncLog {\n  id_ncm_sync_log String @id @default(cuid())\n\n  // Timestamps de execução\n  data_inicio_ncm_sync_log    DateTime  @default(now())\n  data_conclusao_ncm_sync_log DateTime?\n\n  // Status (enum PT)\n  status_ncm_sync_log NcmSyncStatusSincronizacao @default(EXECUTANDO)\n\n  // Totais do diff\n  total_ncm_sync_log       Int @default(0)\n  adicionados_ncm_sync_log Int @default(0)\n  alterados_ncm_sync_log   Int @default(0)\n  removidos_ncm_sync_log   Int @default(0)\n\n  // Origem do trigger\n  origem_ncm_sync_log        NcmSyncOrigemSincronizacao @default(JOB)\n  disparado_por_ncm_sync_log String? // id_usuario que disparou se MANUAL\n\n  // Erro (apenas em caso de falha)\n  mensagem_erro_ncm_sync_log String?\n\n  // Timestamps\n  data_criacao_ncm_sync_log     DateTime @default(now())\n  data_atualizacao_ncm_sync_log DateTime @updatedAt\n\n  @@index([status_ncm_sync_log], map: \"nsl_status_idx\")\n  @@index([data_inicio_ncm_sync_log], map: \"nsl_inicio_idx\")\n  @@map(\"ncm_sync_log\")\n}\n\n// ---------------------------------------------------------------------\n// NcmSyncAgendamento — configuração singleton do job de sincronização.\n// id_ncm_sync_agendamento = 'default' — registro único.\n// ---------------------------------------------------------------------\n\nmodel NcmSyncAgendamento {\n  id_ncm_sync_agendamento String @id @default(\"default\")\n\n  ativo_ncm_sync_agendamento          Boolean @default(false)\n  cron_expressao_ncm_sync_agendamento String  @default(\"0 2 * * *\") // 2am diário (America/Sao_Paulo)\n  notificadores_ncm_sync_agendamento  Json    @default(\"[]\") // Array<NcmNotificador>\n\n  data_criacao_ncm_sync_agendamento     DateTime @default(now())\n  data_atualizacao_ncm_sync_agendamento DateTime @updatedAt\n\n  @@map(\"ncm_sync_agendamento\")\n}\n\n// ---------------------------------------------------------------------\n// Enums NCM Sync (valores em PT-BR)\n// ---------------------------------------------------------------------\n\nenum NcmSyncStatusSincronizacao {\n  EXECUTANDO\n  SUCESSO\n  ERRO\n}\n\nenum NcmSyncOrigemSincronizacao {\n  JOB\n  MANUAL\n}\n\n// ---------------------------------------------------------------------\n// Ope — sincronizado de Portal Único (fonte da verdade SISCOMEX)\n// ---------------------------------------------------------------------\nmodel Ope {\n  suid_ope String @id\n\n  // Identificação tenant — TODO field termina em _ope (DDD ONDA 38)\n  id_organizacao_ope String\n  id_produto_ope     String?\n  id_usuario_ope     String?\n\n  codigo_portal_unico_ope  String   @unique(map: \"ope_unq_codigo_portal_unico\")\n  situacao_ope             String // espelho do status SISCOMEX\n  versao_ope               String\n  nome_ope                 String\n  cnpj_raiz_empresa_ope    String\n  pais_ope                 String\n  estado_ope               String?\n  cidade_ope               String?\n  endereco_ope             String?\n  zip_ope                  String?\n  tin_ope                  String?\n  email_ope                String?\n  ultima_sincronizacao_ope DateTime\n  origem_ope               String   @default(\"portal_unico\")\n\n  @@index([id_organizacao_ope], map: \"ope_org_idx\")\n  @@index([id_organizacao_ope, id_produto_ope], map: \"ope_org_prd_idx\")\n  @@index([id_organizacao_ope, id_usuario_ope], map: \"ope_org_usr_idx\")\n  @@map(\"ope\")\n}\n\n// ---------------------------------------------------------------------\n// OPEHistoricoStatus — log de transições de status do OPE\n// Onda 38: corrigido sufixo (era _historico_status_ope; correto é\n// _ope_historico_status casando com @@map \"ope_historico_status\").\n// Onda DB-1 (DDD): renomeado de OpeHistoricoStatus para OPEHistoricoStatus.\n// ---------------------------------------------------------------------\nmodel OPEHistoricoStatus {\n  id_ope_historico_status String @id @default(cuid())\n\n  // Identificação tenant\n  id_organizacao_ope_historico_status String?\n  id_produto_ope_historico_status     String?\n  id_usuario_ope_historico_status     String?\n\n  suid_ope_historico_status            String\n  status_anterior_ope_historico_status String?\n  status_novo_ope_historico_status     String\n  origem_ope_historico_status          String // portal_unico, manual, sistema\n  payload_ope_historico_status         Json\n  registrado_em_ope_historico_status   DateTime @default(now())\n\n  @@index([suid_ope_historico_status], map: \"ohs_suid_idx\")\n  @@index([registrado_em_ope_historico_status], map: \"ohs_data_idx\")\n  @@index([id_organizacao_ope_historico_status], map: \"ohs_org_idx\")\n  @@index([id_organizacao_ope_historico_status, id_produto_ope_historico_status], map: \"ohs_org_prd_idx\")\n  @@index([id_organizacao_ope_historico_status, id_usuario_ope_historico_status], map: \"ohs_org_usr_idx\")\n  @@map(\"ope_historico_status\")\n}\n",
  "inlineSchemaHash": "24f2222824e6c08d022f81ded080cd37ae9a76760429c8bccb3804c912716f1b",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Empresa\":{\"dbName\":\"empresa\",\"fields\":[{\"name\":\"suid_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cnpj_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tin_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pais_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cidade_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endereco_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"zipcode_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"telefone_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"whatsapp_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_importador_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_exportador_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_fabricante_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_agente_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_despachante_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_armador_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_armazem_alfandegado_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_transportadora_rodoviaria_nacional_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_cia_aerea_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_transportadora_rodoviaria_internacional_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_seguradora_internacional_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_seguradora_corretora_cambio_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_banco_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pode_ser_armazem_nacional_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criado_em_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"atualizado_em_empresa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"id_organizacao_empresa\",\"cnpj_empresa\"],[\"id_organizacao_empresa\",\"tin_empresa\",\"pais_empresa\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"id_organizacao_empresa\",\"cnpj_empresa\"]},{\"name\":null,\"fields\":[\"id_organizacao_empresa\",\"tin_empresa\",\"pais_empresa\"]}],\"isGenerated\":false},\"Moeda\":{\"dbName\":\"moeda\",\"fields\":[{\"name\":\"codigo_moeda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_moeda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"simbolo_moeda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_moeda\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Unidade\":{\"dbName\":\"unidade\",\"fields\":[{\"name\":\"codigo_unidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_unidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_unidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_unidade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NcmSync\":{\"dbName\":\"ncm_sync\",\"fields\":[{\"name\":\"codigo_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descricao_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipi_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ii_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pis_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cofins_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_inicio_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_fim_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_ncm_sync\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NcmSyncLog\":{\"dbName\":\"ncm_sync_log\",\"fields\":[{\"name\":\"id_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_inicio_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_conclusao_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_ncm_sync_log\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NcmSyncStatusSincronizacao\",\"default\":\"EXECUTANDO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"adicionados_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alterados_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"removidos_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origem_ncm_sync_log\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"NcmSyncOrigemSincronizacao\",\"default\":\"JOB\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"disparado_por_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mensagem_erro_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_ncm_sync_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NcmSyncAgendamento\":{\"dbName\":\"ncm_sync_agendamento\",\"fields\":[{\"name\":\"id_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"default\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ativo_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cron_expressao_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"0 2 * * *\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notificadores_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_ncm_sync_agendamento\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Ope\":{\"dbName\":\"ope\",\"fields\":[{\"name\":\"suid_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codigo_portal_unico_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"situacao_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"versao_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cnpj_raiz_empresa_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pais_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estado_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cidade_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endereco_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"zip_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tin_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ultima_sincronizacao_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origem_ope\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"portal_unico\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"OPEHistoricoStatus\":{\"dbName\":\"ope_historico_status\",\"fields\":[{\"name\":\"id_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"suid_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_anterior_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_novo_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origem_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"registrado_em_ope_historico_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"NcmSyncStatusSincronizacao\":{\"values\":[{\"name\":\"EXECUTANDO\",\"dbName\":null},{\"name\":\"SUCESSO\",\"dbName\":null},{\"name\":\"ERRO\",\"dbName\":null}],\"dbName\":null},\"NcmSyncOrigemSincronizacao\":{\"values\":[{\"name\":\"JOB\",\"dbName\":null},{\"name\":\"MANUAL\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
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

