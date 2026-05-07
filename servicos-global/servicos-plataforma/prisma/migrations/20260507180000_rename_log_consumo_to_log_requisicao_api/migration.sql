-- Migration: rename log_consumo → log_requisicao_api
--
-- Renomeia tabela `log_consumo` para `log_requisicao_api` e todos os campos
-- com sufixo `_log_consumo` para `_log_requisicao_api`. Adiciona campo
-- `id_correlacao` para rastreamento distribuido entre serviços.
--
-- Justificativa: o nome anterior era genérico demais — "consumo" pode parecer
-- consumo financeiro/produto, quando na verdade é log de requisição HTTP à
-- API pública. Renomeação aprovada pelo Coordenador e Líder Técnico em
-- 2026-05-07. Tabela está vazia em produção (persistência ainda não foi
-- ativada — segue em memória), então o rename é seguro.
--
-- Esta migration aplica em CADA schema tenant_<cuid> via migrate-all-tenants.

-- 1. Renomear tabela
ALTER TABLE "log_consumo" RENAME TO "log_requisicao_api";

-- 2. Renomear colunas (sufixo _log_consumo → _log_requisicao_api)
ALTER TABLE "log_requisicao_api" RENAME COLUMN "id_log_consumo"                   TO "id_log_requisicao_api";
ALTER TABLE "log_requisicao_api" RENAME COLUMN "endpoint_log_consumo"             TO "endpoint_log_requisicao_api";
ALTER TABLE "log_requisicao_api" RENAME COLUMN "metodo_http_log_consumo"          TO "metodo_http_log_requisicao_api";
ALTER TABLE "log_requisicao_api" RENAME COLUMN "codigo_resposta_http_log_consumo" TO "codigo_resposta_http_log_requisicao_api";
ALTER TABLE "log_requisicao_api" RENAME COLUMN "latencia_ms_log_consumo"          TO "latencia_ms_log_requisicao_api";
ALTER TABLE "log_requisicao_api" RENAME COLUMN "data_criacao_log_consumo"         TO "data_criacao_log_requisicao_api";
ALTER TABLE "log_requisicao_api" RENAME COLUMN "data_atualizacao_log_consumo"     TO "data_atualizacao_log_requisicao_api";

-- 3. Adicionar coluna id_correlacao (rastreamento distribuido)
ALTER TABLE "log_requisicao_api" ADD COLUMN "id_correlacao" TEXT;

-- 4. Renomear índices (lcon_* → lreqapi_*)
ALTER INDEX "lcon_org_idx"      RENAME TO "lreqapi_org_idx";
ALTER INDEX "lcon_org_prd_idx"  RENAME TO "lreqapi_org_prd_idx";
ALTER INDEX "lcon_org_usr_idx"  RENAME TO "lreqapi_org_usr_idx";
ALTER INDEX "lcon_apitk_idx"    RENAME TO "lreqapi_apitk_idx";

-- 5. Criar índice novo para id_correlacao
CREATE INDEX "lreqapi_corr_idx" ON "log_requisicao_api"("id_correlacao");
