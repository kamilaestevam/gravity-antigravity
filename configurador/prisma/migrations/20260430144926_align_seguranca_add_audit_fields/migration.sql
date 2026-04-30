-- Migration: align_seguranca_add_audit_fields
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).
--
-- 1. RENAME COLUMN (15) — alinhamento DDD + REGRA 3 (id_organizacao) + REGRA 4 (id_usuario, id_produto_gravity)
-- 2. ADD COLUMN (8 nullable) — campos de auditoria forense + resolução de incidente
-- 3. RENAME INDEX (5) + CREATE INDEX (3 novos)

-- 1. RENAME COLUMNs (15)
ALTER TABLE "seguranca" RENAME COLUMN "id"             TO "id_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "tenant_id"      TO "id_organizacao";
ALTER TABLE "seguranca" RENAME COLUMN "actor_id"       TO "id_ator_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "actor_type"     TO "tipo_ator_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "action"         TO "acao_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "severity"       TO "severidade_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "status"         TO "status_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "description"    TO "descricao_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "ip"             TO "ip_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "endpoint"       TO "endpoint_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "user_id"        TO "id_usuario";
ALTER TABLE "seguranca" RENAME COLUMN "product_id"     TO "id_produto_gravity";
ALTER TABLE "seguranca" RENAME COLUMN "correlation_id" TO "id_correlacao_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "metadata"       TO "metadata_seguranca";
ALTER TABLE "seguranca" RENAME COLUMN "created_at"     TO "data_criacao_seguranca";

-- 2. ADD COLUMNs (8 nullable)
ALTER TABLE "seguranca" ADD COLUMN "id_workspace"               TEXT;
ALTER TABLE "seguranca" ADD COLUMN "usuario_agente_seguranca"   TEXT;
ALTER TABLE "seguranca" ADD COLUMN "geo_pais_seguranca"         TEXT;
ALTER TABLE "seguranca" ADD COLUMN "id_clerk_sessao"            TEXT;
ALTER TABLE "seguranca" ADD COLUMN "payload_request_seguranca"  JSONB;
ALTER TABLE "seguranca" ADD COLUMN "data_resolucao_seguranca"   TIMESTAMP;
ALTER TABLE "seguranca" ADD COLUMN "resolvido_por_seguranca"    TEXT;
ALTER TABLE "seguranca" ADD COLUMN "acoes_tomadas_seguranca"    JSONB;

-- 3. RENAME INDEXes (5)
ALTER INDEX "seguranca_action_idx"                 RENAME TO "seguranca_acao_idx";
ALTER INDEX "seguranca_created_at_idx"             RENAME TO "seguranca_data_criacao_idx";
ALTER INDEX "seguranca_severity_idx"               RENAME TO "seguranca_severidade_idx";
ALTER INDEX "seguranca_severity_created_at_idx"    RENAME TO "seguranca_severidade_data_criacao_idx";
ALTER INDEX "seguranca_tenant_id_created_at_idx"   RENAME TO "seguranca_id_organizacao_data_criacao_idx";

-- 4. CREATE INDEXes novos (3)
CREATE INDEX "seguranca_id_workspace_idx"     ON "seguranca" ("id_workspace");
CREATE INDEX "seguranca_id_usuario_idx"       ON "seguranca" ("id_usuario");
CREATE INDEX "seguranca_data_resolucao_idx"   ON "seguranca" ("data_resolucao_seguranca");
