-- Migration: align_requisicoes_add_audit_fields
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).
--
-- 1. RENAME COLUMNs (10): alinhamento DDD + REGRA 3 (id_organizacao literal)
-- 2. ADD COLUMNs (6): campos de auditoria que faltavam
--    - metodo_requisicoes, status_code_requisicoes (NOT NULL — sempre preenchidos)
--    - user_agent, id_usuario (REGRA 4), tempo_resposta_ms, razao_bloqueio (NULLABLE)
-- 3. RENAME INDEX (3) + CREATE INDEX (2)

-- 1. RENAME COLUMNs
ALTER TABLE "requisicoes" RENAME COLUMN "id"           TO "id_requisicoes";
ALTER TABLE "requisicoes" RENAME COLUMN "key"          TO "chave_requisicoes";
ALTER TABLE "requisicoes" RENAME COLUMN "tenant_id"    TO "id_organizacao";
ALTER TABLE "requisicoes" RENAME COLUMN "ip"           TO "ip_requisicoes";
ALTER TABLE "requisicoes" RENAME COLUMN "endpoint"     TO "endpoint_requisicoes";
ALTER TABLE "requisicoes" RENAME COLUMN "count"        TO "contagem_requisicoes";
ALTER TABLE "requisicoes" RENAME COLUMN "limit_max"    TO "limite_maximo_requisicoes";
ALTER TABLE "requisicoes" RENAME COLUMN "blocked"      TO "bloqueado_requisicoes";
ALTER TABLE "requisicoes" RENAME COLUMN "window_start" TO "inicio_janela_requisicoes";
ALTER TABLE "requisicoes" RENAME COLUMN "created_at"   TO "data_criacao_requisicoes";

-- 2. ADD COLUMNs (NOT NULL com default temporário, depois remove default)
ALTER TABLE "requisicoes" ADD COLUMN "metodo_requisicoes"      TEXT    NOT NULL DEFAULT 'GET';
ALTER TABLE "requisicoes" ALTER COLUMN "metodo_requisicoes"    DROP DEFAULT;
ALTER TABLE "requisicoes" ADD COLUMN "status_code_requisicoes" INTEGER NOT NULL DEFAULT 200;
ALTER TABLE "requisicoes" ALTER COLUMN "status_code_requisicoes" DROP DEFAULT;
ALTER TABLE "requisicoes" ADD COLUMN "user_agent_requisicoes"        TEXT;
ALTER TABLE "requisicoes" ADD COLUMN "id_usuario"                    TEXT;
ALTER TABLE "requisicoes" ADD COLUMN "tempo_resposta_ms_requisicoes" INTEGER;
ALTER TABLE "requisicoes" ADD COLUMN "razao_bloqueio_requisicoes"    TEXT;

-- 3. RENAME INDEXes existentes
ALTER INDEX "requisicoes_tenant_id_idx"           RENAME TO "requisicoes_id_organizacao_idx";
ALTER INDEX "requisicoes_created_at_idx"          RENAME TO "requisicoes_data_criacao_idx";
ALTER INDEX "requisicoes_blocked_created_at_idx"  RENAME TO "requisicoes_bloqueado_data_criacao_idx";

-- 4. CREATE INDEXes novos
CREATE INDEX "requisicoes_endpoint_data_criacao_idx" ON "requisicoes" ("endpoint_requisicoes", "data_criacao_requisicoes");
CREATE INDEX "requisicoes_id_usuario_idx" ON "requisicoes" ("id_usuario");
