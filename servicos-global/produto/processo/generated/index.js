
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
} = require('./runtime/library.js')


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




  const path = require('path')

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
      "value": "C:\\Users\\danie\\gravity-antigravity\\servicos-global\\produto\\processo\\generated",
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
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\danie\\gravity-antigravity\\servicos-global\\produto\\processo\\prisma\\schema.prisma",
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
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// schema.prisma — GERADO AUTOMATICAMENTE por compose-schema.js\n// NAO EDITAR DIRETAMENTE. Edite schema.base.prisma ou fragment.prisma.\n\n// schema.base.prisma — Processo\n// Composto via scripts/compose-schema.js -> gera schema.prisma final\n// Skill: antigravity-criar-produto (Passo 8)\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../generated\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// Modelos especificos do Processo sao definidos em fragment.prisma\n// e compostos automaticamente pelo script compose-schema.js\n\n// fragment.prisma — Processo (COMEX)\n// Modelo híbrido DDD: cabeçalho + tabelas 1:1/N + links cross-produto (sem duplicar Pedido/BID).\n// Skill: antigravity-database-governance, antigravity-schema-composition\n\n// ─── PROCESSO (cabeçalho) ─────────────────────────────────────────────────────\n\nmodel Processo {\n  id_processo        String  @id @default(cuid())\n  id_organizacao     String\n  id_workspace       String\n  id_produto_gravity String?\n  id_usuario         String?\n\n  numero_processo        String\n  tipo_operacao_processo String\n\n  referencia_interna_processo    String?\n  referencia_importador_processo String?\n  referencia_exportador_processo String?\n\n  id_status_atual_processo          String?\n  id_importacao_exportador_processo String?\n  id_exportacao_importador_processo String?\n\n  id_cotacao_bid_frete_internacional  String?\n  id_proposta_bid_frete_internacional String?\n  id_transito_processo                String?\n  id_operacao_cambio_processo         String?\n\n  id_responsavel_processo       String?\n  responsavel_rotina_processo   String?\n  setor_responsavel_processo    String?\n  vendedor_responsavel_processo String?\n\n  data_criacao_processo     DateTime @default(now())\n  data_atualizacao_processo DateTime @updatedAt\n\n  status_atual     ProcessoStatus?                 @relation(fields: [id_status_atual_processo], references: [id_processo_status], onDelete: SetNull)\n  historico_status HistoricoStatusProcesso[]\n  logistica        LogisticaInternacionalProcesso?\n  dados            DadosProcesso?\n  cambio           CambioProcesso?\n  estimativa       EstimativaProcesso?\n  containers       ContainerProcesso[]\n  documentos       DocumentoProcesso[]\n  follow_ups       FollowUpProcesso[]\n\n  @@index([id_organizacao])\n  @@index([id_organizacao, id_produto_gravity])\n  @@index([id_organizacao, id_usuario])\n  @@index([id_organizacao, id_workspace])\n  @@index([id_organizacao, numero_processo])\n  @@index([id_organizacao, id_status_atual_processo])\n  @@index([id_organizacao, tipo_operacao_processo])\n  @@map(\"processo\")\n}\n\n// ─── STATUS (catálogo tenant) ─────────────────────────────────────────────────\n\nmodel ProcessoStatus {\n  id_processo_status String  @id @default(cuid())\n  id_organizacao     String\n  id_produto_gravity String?\n\n  tipo_status_processo       String\n  rotulo_status_processo     String\n  cor_status_processo        String  @default(\"#6366F1\")\n  ordem_status_processo      Int     @default(0)\n  regras_status_processo     Json?\n  eh_padrao_status_processo  Boolean @default(false)\n  eh_sistema_status_processo Boolean @default(false)\n\n  data_criacao_processo_status     DateTime @default(now())\n  data_atualizacao_processo_status DateTime @updatedAt\n\n  processos          Processo[]\n  historico_anterior HistoricoStatusProcesso[] @relation(\"status_anterior_processo\")\n  historico_novo     HistoricoStatusProcesso[] @relation(\"status_novo_processo\")\n\n  @@unique([id_organizacao, tipo_status_processo])\n  @@index([id_organizacao])\n  @@index([id_organizacao, id_produto_gravity])\n  @@index([id_organizacao, ordem_status_processo])\n  @@map(\"processo_status\")\n}\n\nmodel HistoricoStatusProcesso {\n  id_historico_status_processo       String   @id @default(cuid())\n  id_organizacao                     String\n  id_produto_gravity                 String?\n  id_processo                        String\n  id_status_anterior_processo        String?\n  id_status_novo_processo            String\n  id_usuario_mudanca_status_processo String?\n  data_mudanca_status_processo       DateTime @default(now())\n  observacao_mudanca_status_processo String?\n\n  processo        Processo        @relation(fields: [id_processo], references: [id_processo], onDelete: Cascade)\n  status_anterior ProcessoStatus? @relation(\"status_anterior_processo\", fields: [id_status_anterior_processo], references: [id_processo_status], onDelete: SetNull)\n  status_novo     ProcessoStatus  @relation(\"status_novo_processo\", fields: [id_status_novo_processo], references: [id_processo_status], onDelete: Restrict)\n\n  @@index([id_organizacao])\n  @@index([id_organizacao, id_produto_gravity])\n  @@index([id_organizacao, id_processo])\n  @@index([id_organizacao, data_mudanca_status_processo])\n  @@map(\"historico_status_processo\")\n}\n\n// ─── LOGÍSTICA INTERNACIONAL (Tier A — roteiro planejado) ─────────────────────\n\nmodel LogisticaInternacionalProcesso {\n  id_logistica_internacional_processo String  @id @default(cuid())\n  id_organizacao                      String\n  id_produto_gravity                  String?\n  id_processo                         String  @unique\n\n  modal_frete_internacional_processo String?\n  tipo_frete_internacional_processo  String?\n  tipo_volume_processo               String?\n  incoterm_processo                  String?\n\n  porto_origem_processo      String?\n  porto_destino_processo     String?\n  porto_transbordo_processo  String?\n  aeroporto_origem_processo  String?\n  aeroporto_destino_processo String?\n  aeroporto_escala_processo  String?\n\n  id_agente_carga                     String?\n  id_armador                          String?\n  id_cia_aerea                        String?\n  id_transportador_rodo_internacional String?\n  id_transportador_rodo_nacional      String?\n  id_transportador_ferroviario        String?\n  id_despachante                      String?\n  id_armazem_alfandegado              String?\n  id_seguradora_internacional         String?\n\n  data_criacao_logistica_internacional_processo     DateTime @default(now())\n  data_atualizacao_logistica_internacional_processo DateTime @updatedAt\n\n  processo Processo @relation(fields: [id_processo], references: [id_processo], onDelete: Cascade)\n\n  @@index([id_organizacao])\n  @@index([id_organizacao, id_produto_gravity])\n  @@index([id_organizacao, id_processo])\n  @@map(\"logistica_internacional_processo\")\n}\n\n// ─── DADOS ADUANEIRO / FISCAL ─────────────────────────────────────────────────\n\nmodel DadosProcesso {\n  id_dados_processo  String  @id @default(cuid())\n  id_organizacao     String\n  id_produto_gravity String?\n  id_processo        String  @unique\n\n  canal_parametrizacao_processo String?\n  numero_duimp_processo         String?\n  numero_nfe_processo           String?\n  chave_acesso_nfe_processo     String?\n\n  data_registro_duimp_processo           DateTime?\n  data_liberacao_duimp_processo          DateTime?\n  data_consulta_liberacao_duimp_processo DateTime?\n  data_previsao_registro_duimp_processo  DateTime?\n  data_previsao_liberacao_duimp_processo DateTime?\n\n  data_registro_lpco_processo           DateTime?\n  data_deferimento_lpco_processo        DateTime?\n  data_indeferimento_lpco_processo      DateTime?\n  data_pendencia_lpco_processo          DateTime?\n  data_consulta_liberacao_lpco_processo DateTime?\n  data_previsao_registro_lpco_processo  DateTime?\n\n  data_criacao_dados_processo     DateTime @default(now())\n  data_atualizacao_dados_processo DateTime @updatedAt\n\n  processo Processo @relation(fields: [id_processo], references: [id_processo], onDelete: Cascade)\n\n  @@index([id_organizacao])\n  @@index([id_organizacao, id_produto_gravity])\n  @@index([id_organizacao, id_processo])\n  @@map(\"dados_processo\")\n}\n\n// ─── CÂMBIO (preferências locais — operação via BID-Câmbio link) ─────────────\n\nmodel CambioProcesso {\n  id_cambio_processo String  @id @default(cuid())\n  id_organizacao     String\n  id_produto_gravity String?\n  id_processo        String  @unique\n\n  id_banco_processo            String?\n  id_corretora_cambio_processo String?\n\n  data_criacao_cambio_processo     DateTime @default(now())\n  data_atualizacao_cambio_processo DateTime @updatedAt\n\n  processo Processo @relation(fields: [id_processo], references: [id_processo], onDelete: Cascade)\n\n  @@index([id_organizacao])\n  @@index([id_organizacao, id_produto_gravity])\n  @@index([id_organizacao, id_processo])\n  @@map(\"cambio_processo\")\n}\n\n// ─── ESTIMATIVA DE CUSTO ────────────────────────────────────────────────────\n\nmodel EstimativaProcesso {\n  id_estimativa_processo String  @id @default(cuid())\n  id_organizacao         String\n  id_produto_gravity     String?\n  id_processo            String  @unique\n\n  total_imposto_ii_processo     Decimal? @db.Decimal(18, 6)\n  total_imposto_ipi_processo    Decimal? @db.Decimal(18, 6)\n  total_imposto_pis_processo    Decimal? @db.Decimal(18, 6)\n  total_imposto_cofins_processo Decimal? @db.Decimal(18, 6)\n  total_imposto_icms_processo   Decimal? @db.Decimal(18, 6)\n\n  valor_frete_estimado_processo    Decimal? @db.Decimal(18, 6)\n  valor_despacho_estimado_processo Decimal? @db.Decimal(18, 6)\n  valor_outros_estimado_processo   Decimal? @db.Decimal(18, 6)\n  valor_total_estimado_processo    Decimal? @db.Decimal(18, 6)\n  moeda_estimativa_processo        String   @default(\"BRL\")\n\n  data_criacao_estimativa_processo     DateTime @default(now())\n  data_atualizacao_estimativa_processo DateTime @updatedAt\n\n  processo Processo @relation(fields: [id_processo], references: [id_processo], onDelete: Cascade)\n\n  @@index([id_organizacao])\n  @@index([id_organizacao, id_produto_gravity])\n  @@index([id_organizacao, id_processo])\n  @@map(\"estimativa_processo\")\n}\n\n// ─── DOCUMENTOS ───────────────────────────────────────────────────────────────\n\nmodel DocumentoProcesso {\n  id_documento_processo String  @id @default(cuid())\n  id_organizacao        String\n  id_produto_gravity    String?\n  id_usuario            String?\n  id_processo           String\n\n  nome_documento_processo          String\n  tipo_arquivo_documento_processo  String\n  tamanho_bytes_documento_processo Int    @default(0)\n  url_documento_processo           String\n  categoria_documento_processo     String @default(\"outro\")\n\n  numero_bl_processo                     String?\n  numero_hawb_processo                   String?\n  numero_mawb_processo                   String?\n  numero_awb_processo                    String?\n  numero_hbl_processo                    String?\n  numero_mbl_processo                    String?\n  numero_ce_mercante_processo            String?\n  numero_certificado_origem_processo     String?\n  numero_cim_processo                    String?\n  numero_crt_processo                    String?\n  numero_presenca_carga_destino_processo String?\n\n  data_criacao_documento_processo DateTime @default(now())\n\n  processo Processo @relation(fields: [id_processo], references: [id_processo], onDelete: Cascade)\n\n  @@index([id_organizacao])\n  @@index([id_organizacao, id_produto_gravity])\n  @@index([id_organizacao, id_processo])\n  @@index([id_organizacao, categoria_documento_processo])\n  @@map(\"documento_processo\")\n}\n\n// ─── CONTAINERS ───────────────────────────────────────────────────────────────\n\nmodel ContainerProcesso {\n  id_processo_container String  @id @default(cuid())\n  id_organizacao        String\n  id_produto_gravity    String?\n  id_processo           String\n\n  container_numero_processo_container          String\n  container_tipo_processo_container            String?\n  container_lacre_processo_container           String?\n  container_tara_processo_container            Decimal?  @db.Decimal(18, 6)\n  container_peso_bruto_processo_container      Decimal?  @db.Decimal(18, 6)\n  container_peso_liquido_processo_container    Decimal?  @db.Decimal(18, 6)\n  container_metragem_cubica_processo_container Decimal?  @db.Decimal(18, 6)\n  local_devolucao_processo_container           String?\n  data_devolucao_prevista_processo_container   DateTime?\n  data_devolucao_real_processo_container       DateTime?\n\n  data_criacao_container_processo     DateTime @default(now())\n  data_atualizacao_container_processo DateTime @updatedAt\n\n  processo Processo @relation(fields: [id_processo], references: [id_processo], onDelete: Cascade)\n\n  @@index([id_organizacao])\n  @@index([id_organizacao, id_produto_gravity])\n  @@index([id_organizacao, id_processo])\n  @@map(\"container_processo\")\n}\n\n// ─── FOLLOW-UP ────────────────────────────────────────────────────────────────\n\nmodel FollowUpProcesso {\n  id_follow_up_processo String  @id @default(cuid())\n  id_organizacao        String\n  id_produto_gravity    String?\n  id_usuario            String?\n  id_processo           String\n\n  titulo_follow_up_processo                String\n  descricao_follow_up_processo             String?\n  tipo_follow_up_processo                  String  @default(\"info\")\n  categoria_follow_up_processo             String  @default(\"sistema\")\n  id_usuario_registro_follow_up_processo   String?\n  nome_usuario_registro_follow_up_processo String?\n\n  data_criacao_follow_up_processo DateTime @default(now())\n\n  processo Processo @relation(fields: [id_processo], references: [id_processo], onDelete: Cascade)\n\n  @@index([id_organizacao])\n  @@index([id_organizacao, id_produto_gravity])\n  @@index([id_organizacao, id_processo])\n  @@map(\"follow_up_processo\")\n}\n",
  "inlineSchemaHash": "9e8dd662a151ec8e2bbfc43cda1f8f749262258c72675e568445bf20616d073a",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "generated",
    "",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Processo\":{\"dbName\":\"processo\",\"fields\":[{\"name\":\"id_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_workspace\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_operacao_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_interna_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_importador_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencia_exportador_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_status_atual_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_importacao_exportador_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_exportacao_importador_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_cotacao_bid_frete_internacional\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_proposta_bid_frete_internacional\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_transito_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_operacao_cambio_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_responsavel_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"responsavel_rotina_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"setor_responsavel_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vendedor_responsavel_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"status_atual\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProcessoStatus\",\"relationName\":\"ProcessoToProcessoStatus\",\"relationFromFields\":[\"id_status_atual_processo\"],\"relationToFields\":[\"id_processo_status\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"historico_status\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"HistoricoStatusProcesso\",\"relationName\":\"HistoricoStatusProcessoToProcesso\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logistica\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"LogisticaInternacionalProcesso\",\"relationName\":\"LogisticaInternacionalProcessoToProcesso\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dados\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DadosProcesso\",\"relationName\":\"DadosProcessoToProcesso\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cambio\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CambioProcesso\",\"relationName\":\"CambioProcessoToProcesso\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estimativa\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EstimativaProcesso\",\"relationName\":\"EstimativaProcessoToProcesso\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"containers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ContainerProcesso\",\"relationName\":\"ContainerProcessoToProcesso\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"documentos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DocumentoProcesso\",\"relationName\":\"DocumentoProcessoToProcesso\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"follow_ups\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FollowUpProcesso\",\"relationName\":\"FollowUpProcessoToProcesso\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ProcessoStatus\":{\"dbName\":\"processo_status\",\"fields\":[{\"name\":\"id_processo_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rotulo_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cor_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"#6366F1\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ordem_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"regras_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eh_padrao_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eh_sistema_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_processo_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_processo_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"processos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Processo\",\"relationName\":\"ProcessoToProcessoStatus\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"historico_anterior\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"HistoricoStatusProcesso\",\"relationName\":\"status_anterior_processo\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"historico_novo\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"HistoricoStatusProcesso\",\"relationName\":\"status_novo_processo\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"id_organizacao\",\"tipo_status_processo\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"id_organizacao\",\"tipo_status_processo\"]}],\"isGenerated\":false},\"HistoricoStatusProcesso\":{\"dbName\":\"historico_status_processo\",\"fields\":[{\"name\":\"id_historico_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_status_anterior_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_status_novo_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario_mudanca_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_mudanca_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"observacao_mudanca_status_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Processo\",\"relationName\":\"HistoricoStatusProcessoToProcesso\",\"relationFromFields\":[\"id_processo\"],\"relationToFields\":[\"id_processo\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_anterior\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProcessoStatus\",\"relationName\":\"status_anterior_processo\",\"relationFromFields\":[\"id_status_anterior_processo\"],\"relationToFields\":[\"id_processo_status\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_novo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProcessoStatus\",\"relationName\":\"status_novo_processo\",\"relationFromFields\":[\"id_status_novo_processo\"],\"relationToFields\":[\"id_processo_status\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"LogisticaInternacionalProcesso\":{\"dbName\":\"logistica_internacional_processo\",\"fields\":[{\"name\":\"id_logistica_internacional_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"modal_frete_internacional_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_frete_internacional_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_volume_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"incoterm_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"porto_origem_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"porto_destino_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"porto_transbordo_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aeroporto_origem_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aeroporto_destino_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aeroporto_escala_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_agente_carga\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_armador\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_cia_aerea\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_transportador_rodo_internacional\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_transportador_rodo_nacional\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_transportador_ferroviario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_despachante\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_armazem_alfandegado\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_seguradora_internacional\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_logistica_internacional_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_logistica_internacional_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"processo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Processo\",\"relationName\":\"LogisticaInternacionalProcessoToProcesso\",\"relationFromFields\":[\"id_processo\"],\"relationToFields\":[\"id_processo\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DadosProcesso\":{\"dbName\":\"dados_processo\",\"fields\":[{\"name\":\"id_dados_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"canal_parametrizacao_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_duimp_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_nfe_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"chave_acesso_nfe_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_registro_duimp_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_liberacao_duimp_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_consulta_liberacao_duimp_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_previsao_registro_duimp_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_previsao_liberacao_duimp_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_registro_lpco_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_deferimento_lpco_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_indeferimento_lpco_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_pendencia_lpco_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_consulta_liberacao_lpco_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_previsao_registro_lpco_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_dados_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_dados_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"processo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Processo\",\"relationName\":\"DadosProcessoToProcesso\",\"relationFromFields\":[\"id_processo\"],\"relationToFields\":[\"id_processo\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CambioProcesso\":{\"dbName\":\"cambio_processo\",\"fields\":[{\"name\":\"id_cambio_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_banco_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_corretora_cambio_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_cambio_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_cambio_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"processo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Processo\",\"relationName\":\"CambioProcessoToProcesso\",\"relationFromFields\":[\"id_processo\"],\"relationToFields\":[\"id_processo\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"EstimativaProcesso\":{\"dbName\":\"estimativa_processo\",\"fields\":[{\"name\":\"id_estimativa_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_imposto_ii_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_imposto_ipi_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_imposto_pis_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_imposto_cofins_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total_imposto_icms_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"valor_frete_estimado_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"valor_despacho_estimado_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"valor_outros_estimado_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"valor_total_estimado_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moeda_estimativa_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"BRL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_estimativa_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_estimativa_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"processo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Processo\",\"relationName\":\"EstimativaProcessoToProcesso\",\"relationFromFields\":[\"id_processo\"],\"relationToFields\":[\"id_processo\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DocumentoProcesso\":{\"dbName\":\"documento_processo\",\"fields\":[{\"name\":\"id_documento_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_documento_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_arquivo_documento_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tamanho_bytes_documento_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url_documento_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoria_documento_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"outro\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_bl_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_hawb_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_mawb_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_awb_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_hbl_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_mbl_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_ce_mercante_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_certificado_origem_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_cim_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_crt_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numero_presenca_carga_destino_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_documento_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Processo\",\"relationName\":\"DocumentoProcessoToProcesso\",\"relationFromFields\":[\"id_processo\"],\"relationToFields\":[\"id_processo\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ContainerProcesso\":{\"dbName\":\"container_processo\",\"fields\":[{\"name\":\"id_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"container_numero_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"container_tipo_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"container_lacre_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"container_tara_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"container_peso_bruto_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"container_peso_liquido_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"container_metragem_cubica_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"local_devolucao_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_devolucao_prevista_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_devolucao_real_processo_container\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_container_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_atualizacao_container_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"processo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Processo\",\"relationName\":\"ContainerProcessoToProcesso\",\"relationFromFields\":[\"id_processo\"],\"relationToFields\":[\"id_processo\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"FollowUpProcesso\":{\"dbName\":\"follow_up_processo\",\"fields\":[{\"name\":\"id_follow_up_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_organizacao\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_produto_gravity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"titulo_follow_up_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"descricao_follow_up_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tipo_follow_up_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"info\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoria_follow_up_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"sistema\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id_usuario_registro_follow_up_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nome_usuario_registro_follow_up_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data_criacao_follow_up_processo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processo\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Processo\",\"relationName\":\"FollowUpProcessoToProcesso\",\"relationFromFields\":[\"id_processo\"],\"relationToFields\":[\"id_processo\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "generated/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "generated/schema.prisma")
