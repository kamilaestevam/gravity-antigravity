-- Migration: rename_servicos_to_servico_gravity_add_audit
-- Renomeia tabela servicos → servico_gravity (singular DDD + sufixo gravity)
-- + 9 RENAME COLUMN
-- + 9 ADD COLUMN (auditoria estendida + workflow de incidente)
-- + 4 RENAME INDEX + 4 CREATE INDEX
-- + 7 RENAME NOT NULL constraint
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

-- 1. RENAME TABLE
ALTER TABLE "servicos" RENAME TO "servico_gravity";

-- 2. RENAME COLUMNs (9)
ALTER TABLE "servico_gravity" RENAME COLUMN "id"          TO "id_servico_gravity";
ALTER TABLE "servico_gravity" RENAME COLUMN "service"     TO "nome_servico_gravity";
ALTER TABLE "servico_gravity" RENAME COLUMN "url"         TO "url_servico_gravity";
ALTER TABLE "servico_gravity" RENAME COLUMN "status"      TO "status_servico_gravity";
ALTER TABLE "servico_gravity" RENAME COLUMN "latency_ms"  TO "latencia_ms_servico_gravity";
ALTER TABLE "servico_gravity" RENAME COLUMN "last_error"  TO "ultimo_erro_servico_gravity";
ALTER TABLE "servico_gravity" RENAME COLUMN "checked_at"  TO "data_verificacao_servico_gravity";
ALTER TABLE "servico_gravity" RENAME COLUMN "created_at"  TO "data_criacao_servico_gravity";
ALTER TABLE "servico_gravity" RENAME COLUMN "updated_at"  TO "data_atualizacao_servico_gravity";

-- 3. ADD COLUMNs (9)
ALTER TABLE "servico_gravity" ADD COLUMN "versao_atual_servico_gravity"        TEXT;
ALTER TABLE "servico_gravity" ADD COLUMN "ambiente_servico_gravity"            TEXT;
ALTER TABLE "servico_gravity" ADD COLUMN "tipo_servico_gravity"                TEXT;
ALTER TABLE "servico_gravity" ADD COLUMN "falhas_consecutivas_servico_gravity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "servico_gravity" ADD COLUMN "data_ultima_falha_servico_gravity"   TIMESTAMP;
ALTER TABLE "servico_gravity" ADD COLUMN "data_recuperacao_servico_gravity"    TIMESTAMP;
ALTER TABLE "servico_gravity" ADD COLUMN "tempo_uptime_pct_servico_gravity"    NUMERIC(5,2);
ALTER TABLE "servico_gravity" ADD COLUMN "regiao_servico_gravity"              TEXT;
ALTER TABLE "servico_gravity" ADD COLUMN "responsavel_servico_gravity"         TEXT;

-- 4. RENAME INDEXes (4)
ALTER INDEX "servicos_pkey"             RENAME TO "servico_gravity_pkey";
ALTER INDEX "servicos_service_key"      RENAME TO "servico_gravity_service_key";
ALTER INDEX "servicos_status_idx"       RENAME TO "servico_gravity_status_idx";
ALTER INDEX "servicos_checked_at_idx"   RENAME TO "servico_gravity_verificado_em_idx";

-- 5. CREATE INDEXes (4 novos)
CREATE INDEX "servico_gravity_ambiente_status_idx" ON "servico_gravity" ("ambiente_servico_gravity", "status_servico_gravity");
CREATE INDEX "servico_gravity_falhas_idx"          ON "servico_gravity" ("falhas_consecutivas_servico_gravity");
CREATE INDEX "servico_gravity_responsavel_idx"     ON "servico_gravity" ("responsavel_servico_gravity");
CREATE INDEX "servico_gravity_tipo_idx"            ON "servico_gravity" ("tipo_servico_gravity");

-- 6. RENAME NOT NULL constraints (7)
ALTER TABLE "servico_gravity" RENAME CONSTRAINT "servicos_id_not_null"           TO "servico_gravity_id_not_null";
ALTER TABLE "servico_gravity" RENAME CONSTRAINT "servicos_service_not_null"      TO "servico_gravity_nome_not_null";
ALTER TABLE "servico_gravity" RENAME CONSTRAINT "servicos_url_not_null"          TO "servico_gravity_url_not_null";
ALTER TABLE "servico_gravity" RENAME CONSTRAINT "servicos_status_not_null"       TO "servico_gravity_status_not_null";
ALTER TABLE "servico_gravity" RENAME CONSTRAINT "servicos_checked_at_not_null"   TO "servico_gravity_data_verificacao_not_null";
ALTER TABLE "servico_gravity" RENAME CONSTRAINT "servicos_created_at_not_null"   TO "servico_gravity_data_criacao_not_null";
ALTER TABLE "servico_gravity" RENAME CONSTRAINT "servicos_updated_at_not_null"   TO "servico_gravity_data_atualizacao_not_null";
