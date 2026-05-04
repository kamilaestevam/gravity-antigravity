-- Migration: API Cockpit — criação inicial dos 5 models DDD
-- Data: 2026-05-03
-- Escopo: ApiToken, WebhookConfiguracao, WebhookLog, LogConsumo, ApiIntegracaoErp
-- Refatoração: nomenclatura DDD final (id_organizacao, id_produto_gravity, id_usuario)

-- CreateEnum
CREATE TYPE "EscopoApiToken" AS ENUM ('LEITURA', 'ESCRITA', 'EXCLUSAO');

-- CreateEnum
CREATE TYPE "ValidadeApiToken" AS ENUM ('NUNCA', 'DIAS_30', 'DIAS_90', 'CUSTOMIZADO');

-- CreateEnum
CREATE TYPE "ProtocoloApiIntegracaoErp" AS ENUM ('ODATA', 'SAP_HANA', 'REST', 'JDBC');

-- CreateTable
CREATE TABLE "api_token" (
    "id_api_token" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_usuario" TEXT,
    "nome_api_token" TEXT NOT NULL,
    "hash_api_token" TEXT NOT NULL,
    "prefixo_api_token" TEXT NOT NULL,
    "escopo_api_token" "EscopoApiToken" NOT NULL DEFAULT 'LEITURA',
    "validade_api_token" "ValidadeApiToken" NOT NULL DEFAULT 'NUNCA',
    "data_expiracao_api_token" TIMESTAMP(3),
    "limite_requisicoes_minuto_api_token" INTEGER NOT NULL DEFAULT 60,
    "revogado_api_token" BOOLEAN NOT NULL DEFAULT false,
    "data_revogacao_api_token" TIMESTAMP(3),
    "data_criacao_api_token" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_api_token" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_token_pkey" PRIMARY KEY ("id_api_token")
);

-- CreateTable
CREATE TABLE "webhook_configuracao" (
    "id_webhook_configuracao" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_usuario" TEXT,
    "url_webhook_configuracao" TEXT NOT NULL,
    "segredo_webhook_configuracao" TEXT NOT NULL,
    "eventos_webhook_configuracao" TEXT[],
    "ativo_webhook_configuracao" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao_webhook_configuracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_webhook_configuracao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_configuracao_pkey" PRIMARY KEY ("id_webhook_configuracao")
);

-- CreateTable
CREATE TABLE "webhook_log" (
    "id_webhook_log" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_usuario" TEXT,
    "id_webhook_configuracao" TEXT NOT NULL,
    "evento_webhook_log" TEXT NOT NULL,
    "codigo_resposta_http_webhook_log" INTEGER NOT NULL,
    "latencia_ms_webhook_log" INTEGER NOT NULL,
    "quantidade_tentativas_webhook_log" INTEGER NOT NULL,
    "payload_webhook_log" JSONB,
    "erro_webhook_log" TEXT,
    "data_criacao_webhook_log" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_webhook_log" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_log_pkey" PRIMARY KEY ("id_webhook_log")
);

-- CreateTable
CREATE TABLE "log_consumo" (
    "id_log_consumo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_usuario" TEXT,
    "id_api_token" TEXT NOT NULL,
    "endpoint_log_consumo" TEXT NOT NULL,
    "metodo_http_log_consumo" TEXT NOT NULL,
    "codigo_resposta_http_log_consumo" INTEGER NOT NULL,
    "latencia_ms_log_consumo" INTEGER NOT NULL,
    "data_criacao_log_consumo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_log_consumo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "log_consumo_pkey" PRIMARY KEY ("id_log_consumo")
);

-- CreateTable
CREATE TABLE "api_integracao_erp" (
    "id_api_integracao_erp" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_usuario" TEXT,
    "credenciais_criptografadas_api_integracao_erp" TEXT NOT NULL,
    "protocolo_api_integracao_erp" "ProtocoloApiIntegracaoErp" NOT NULL DEFAULT 'ODATA',
    "data_criacao_api_integracao_erp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_api_integracao_erp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_integracao_erp_pkey" PRIMARY KEY ("id_api_integracao_erp")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_token_hash_api_token_key" ON "api_token"("hash_api_token");

-- CreateIndex
CREATE INDEX "apitk_org_idx" ON "api_token"("id_organizacao");

-- CreateIndex
CREATE INDEX "apitk_org_prd_idx" ON "api_token"("id_organizacao", "id_produto_gravity");

-- CreateIndex
CREATE INDEX "apitk_org_usr_idx" ON "api_token"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "whkc_org_idx" ON "webhook_configuracao"("id_organizacao");

-- CreateIndex
CREATE INDEX "whkc_org_prd_idx" ON "webhook_configuracao"("id_organizacao", "id_produto_gravity");

-- CreateIndex
CREATE INDEX "whkc_org_usr_idx" ON "webhook_configuracao"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "whkl_org_idx" ON "webhook_log"("id_organizacao");

-- CreateIndex
CREATE INDEX "whkl_org_prd_idx" ON "webhook_log"("id_organizacao", "id_produto_gravity");

-- CreateIndex
CREATE INDEX "whkl_org_usr_idx" ON "webhook_log"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "whkl_whkc_idx" ON "webhook_log"("id_webhook_configuracao");

-- CreateIndex
CREATE INDEX "lcon_org_idx" ON "log_consumo"("id_organizacao");

-- CreateIndex
CREATE INDEX "lcon_org_prd_idx" ON "log_consumo"("id_organizacao", "id_produto_gravity");

-- CreateIndex
CREATE INDEX "lcon_org_usr_idx" ON "log_consumo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "lcon_apitk_idx" ON "log_consumo"("id_api_token");

-- CreateIndex
CREATE UNIQUE INDEX "api_integracao_erp_id_organizacao_key" ON "api_integracao_erp"("id_organizacao");

-- CreateIndex
CREATE INDEX "aierp_org_idx" ON "api_integracao_erp"("id_organizacao");

-- CreateIndex
CREATE INDEX "aierp_org_prd_idx" ON "api_integracao_erp"("id_organizacao", "id_produto_gravity");

-- CreateIndex
CREATE INDEX "aierp_org_usr_idx" ON "api_integracao_erp"("id_organizacao", "id_usuario");
