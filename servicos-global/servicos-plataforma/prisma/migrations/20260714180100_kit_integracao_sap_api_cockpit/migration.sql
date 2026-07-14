-- Kit integracao Gravity-ERP: OAuth, idempotencia e fila de webhooks (nomes DDD)

CREATE TYPE "AmbienteIntegracaoApi" AS ENUM ('SANDBOX', 'PRODUCAO');
CREATE TYPE "StatusWebhookEventoEnfileirado" AS ENUM ('PENDENTE', 'ENTREGUE', 'FALHA_PERMANENTE');

CREATE TABLE "api_credencial_oauth" (
  "id_api_credencial_oauth" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_usuario" TEXT,
  "client_id_api_credencial_oauth" TEXT NOT NULL,
  "hash_client_secret_api_credencial_oauth" TEXT NOT NULL,
  "ambiente_api_credencial_oauth" "AmbienteIntegracaoApi" NOT NULL DEFAULT 'SANDBOX',
  "escopo_api_credencial_oauth" "EscopoApiToken" NOT NULL DEFAULT 'LEITURA',
  "revogado_api_credencial_oauth" BOOLEAN NOT NULL DEFAULT false,
  "data_revogacao_api_credencial_oauth" TIMESTAMP(3),
  "data_criacao_api_credencial_oauth" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_api_credencial_oauth" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "api_credencial_oauth_pkey" PRIMARY KEY ("id_api_credencial_oauth")
);

CREATE UNIQUE INDEX "api_credencial_oauth_client_id_api_credencial_oauth_key"
  ON "api_credencial_oauth"("client_id_api_credencial_oauth");
CREATE INDEX "aco_org_idx" ON "api_credencial_oauth"("id_organizacao");
CREATE INDEX "aco_org_usr_idx" ON "api_credencial_oauth"("id_organizacao", "id_usuario");

CREATE TABLE "api_registro_idempotencia" (
  "id_api_registro_idempotencia" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "chave_api_registro_idempotencia" TEXT NOT NULL,
  "hash_corpo_api_registro_idempotencia" TEXT NOT NULL,
  "codigo_resposta_http_api_registro_idempotencia" INTEGER NOT NULL,
  "corpo_resposta_api_registro_idempotencia" JSONB NOT NULL,
  "data_expiracao_api_registro_idempotencia" TIMESTAMP(3) NOT NULL,
  "data_criacao_api_registro_idempotencia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "api_registro_idempotencia_pkey" PRIMARY KEY ("id_api_registro_idempotencia")
);

CREATE UNIQUE INDEX "arid_org_chave_uq"
  ON "api_registro_idempotencia"("id_organizacao", "chave_api_registro_idempotencia");
CREATE INDEX "arid_org_idx" ON "api_registro_idempotencia"("id_organizacao");
CREATE INDEX "arid_exp_idx" ON "api_registro_idempotencia"("data_expiracao_api_registro_idempotencia");

CREATE TABLE "webhook_evento_enfileirado" (
  "id_webhook_evento_enfileirado" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_produto_gravity" TEXT,
  "id_evento_webhook_enfileirado" TEXT NOT NULL,
  "tipo_evento_webhook_enfileirado" TEXT NOT NULL,
  "payload_evento_webhook_enfileirado" JSONB NOT NULL,
  "status_webhook_evento_enfileirado" "StatusWebhookEventoEnfileirado" NOT NULL DEFAULT 'PENDENTE',
  "quantidade_tentativas_webhook_evento_enfileirado" INTEGER NOT NULL DEFAULT 0,
  "proxima_tentativa_webhook_evento_enfileirado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ultimo_erro_webhook_evento_enfileirado" TEXT,
  "data_criacao_webhook_evento_enfileirado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_webhook_evento_enfileirado" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "webhook_evento_enfileirado_pkey" PRIMARY KEY ("id_webhook_evento_enfileirado")
);

CREATE UNIQUE INDEX "webhook_evento_enfileirado_id_evento_webhook_enfileirado_key"
  ON "webhook_evento_enfileirado"("id_evento_webhook_enfileirado");
CREATE INDEX "whee_org_idx" ON "webhook_evento_enfileirado"("id_organizacao");
CREATE INDEX "whee_status_prox_idx"
  ON "webhook_evento_enfileirado"("status_webhook_evento_enfileirado", "proxima_tentativa_webhook_evento_enfileirado");
