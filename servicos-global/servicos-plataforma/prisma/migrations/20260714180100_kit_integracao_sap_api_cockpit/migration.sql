-- Kit integracao Gravity-SAP: OAuth, idempotencia e fila de webhooks

CREATE TYPE "AmbienteIntegracaoApi" AS ENUM ('SANDBOX', 'PRODUCAO');
CREATE TYPE "StatusWebhookEventoEnfileirado" AS ENUM ('PENDENTE', 'ENTREGUE', 'FALHA_PERMANENTE');

CREATE TABLE "credencial_oauth_api" (
  "id_credencial_oauth_api" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_usuario" TEXT,
  "client_id_credencial_oauth_api" TEXT NOT NULL,
  "hash_client_secret_credencial_oauth_api" TEXT NOT NULL,
  "ambiente_credencial_oauth_api" "AmbienteIntegracaoApi" NOT NULL DEFAULT 'SANDBOX',
  "escopo_credencial_oauth_api" "EscopoApiToken" NOT NULL DEFAULT 'LEITURA',
  "revogado_credencial_oauth_api" BOOLEAN NOT NULL DEFAULT false,
  "data_revogacao_credencial_oauth_api" TIMESTAMP(3),
  "data_criacao_credencial_oauth_api" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_credencial_oauth_api" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "credencial_oauth_api_pkey" PRIMARY KEY ("id_credencial_oauth_api")
);

CREATE UNIQUE INDEX "credencial_oauth_api_client_id_credencial_oauth_api_key"
  ON "credencial_oauth_api"("client_id_credencial_oauth_api");
CREATE INDEX "coa_org_idx" ON "credencial_oauth_api"("id_organizacao");
CREATE INDEX "coa_org_usr_idx" ON "credencial_oauth_api"("id_organizacao", "id_usuario");

CREATE TABLE "registro_idempotencia_api" (
  "id_registro_idempotencia_api" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "chave_idempotencia_api" TEXT NOT NULL,
  "hash_corpo_requisicao_api" TEXT NOT NULL,
  "codigo_resposta_http_idempotencia_api" INTEGER NOT NULL,
  "corpo_resposta_idempotencia_api" JSONB NOT NULL,
  "data_expiracao_idempotencia_api" TIMESTAMP(3) NOT NULL,
  "data_criacao_idempotencia_api" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "registro_idempotencia_api_pkey" PRIMARY KEY ("id_registro_idempotencia_api")
);

CREATE UNIQUE INDEX "ridem_org_chave_uq"
  ON "registro_idempotencia_api"("id_organizacao", "chave_idempotencia_api");
CREATE INDEX "ridem_org_idx" ON "registro_idempotencia_api"("id_organizacao");
CREATE INDEX "ridem_exp_idx" ON "registro_idempotencia_api"("data_expiracao_idempotencia_api");

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
