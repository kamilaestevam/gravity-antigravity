-- Renomeia tabelas/colunas legadas do kit (dev) para nomenclatura DDD api_*

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'credencial_oauth_api') THEN
    ALTER TABLE "credencial_oauth_api" RENAME TO "api_credencial_oauth";
    ALTER TABLE "api_credencial_oauth" RENAME COLUMN "id_credencial_oauth_api" TO "id_api_credencial_oauth";
    ALTER TABLE "api_credencial_oauth" RENAME COLUMN "client_id_credencial_oauth_api" TO "client_id_api_credencial_oauth";
    ALTER TABLE "api_credencial_oauth" RENAME COLUMN "hash_client_secret_credencial_oauth_api" TO "hash_client_secret_api_credencial_oauth";
    ALTER TABLE "api_credencial_oauth" RENAME COLUMN "ambiente_credencial_oauth_api" TO "ambiente_api_credencial_oauth";
    ALTER TABLE "api_credencial_oauth" RENAME COLUMN "escopo_credencial_oauth_api" TO "escopo_api_credencial_oauth";
    ALTER TABLE "api_credencial_oauth" RENAME COLUMN "revogado_credencial_oauth_api" TO "revogado_api_credencial_oauth";
    ALTER TABLE "api_credencial_oauth" RENAME COLUMN "data_revogacao_credencial_oauth_api" TO "data_revogacao_api_credencial_oauth";
    ALTER TABLE "api_credencial_oauth" RENAME COLUMN "data_criacao_credencial_oauth_api" TO "data_criacao_api_credencial_oauth";
    ALTER TABLE "api_credencial_oauth" RENAME COLUMN "data_atualizacao_credencial_oauth_api" TO "data_atualizacao_api_credencial_oauth";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registro_idempotencia_api') THEN
    ALTER TABLE "registro_idempotencia_api" RENAME TO "api_registro_idempotencia";
    ALTER TABLE "api_registro_idempotencia" RENAME COLUMN "id_registro_idempotencia_api" TO "id_api_registro_idempotencia";
    ALTER TABLE "api_registro_idempotencia" RENAME COLUMN "chave_idempotencia_api" TO "chave_api_registro_idempotencia";
    ALTER TABLE "api_registro_idempotencia" RENAME COLUMN "hash_corpo_requisicao_api" TO "hash_corpo_api_registro_idempotencia";
    ALTER TABLE "api_registro_idempotencia" RENAME COLUMN "codigo_resposta_http_idempotencia_api" TO "codigo_resposta_http_api_registro_idempotencia";
    ALTER TABLE "api_registro_idempotencia" RENAME COLUMN "corpo_resposta_idempotencia_api" TO "corpo_resposta_api_registro_idempotencia";
    ALTER TABLE "api_registro_idempotencia" RENAME COLUMN "data_expiracao_idempotencia_api" TO "data_expiracao_api_registro_idempotencia";
    ALTER TABLE "api_registro_idempotencia" RENAME COLUMN "data_criacao_idempotencia_api" TO "data_criacao_api_registro_idempotencia";
  END IF;
END $$;
