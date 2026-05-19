-- Migration: DDD historico-global — REGRA 3 ddd-nomenclatura
-- Renomeia FKs de glossário (id_organizacao, id_usuario)

-- ============================================================================
-- 1. historico_log
-- ============================================================================
ALTER TABLE "historico_log" RENAME COLUMN "id_organizacao_historico_log" TO "id_organizacao";
ALTER TABLE "historico_log" RENAME COLUMN "id_usuario_historico_log" TO "id_usuario";

DROP INDEX IF EXISTS "hl_org_idx";
DROP INDEX IF EXISTS "hl_org_prd_idx";
DROP INDEX IF EXISTS "hl_org_usr_idx";
DROP INDEX IF EXISTS "hl_org_dt_idx";
DROP INDEX IF EXISTS "hl_org_mod_dt_idx";

CREATE INDEX "hl_org_idx" ON "historico_log" ("id_organizacao");
CREATE INDEX "hl_org_prd_idx" ON "historico_log" ("id_organizacao", "id_produto_historico_log");
CREATE INDEX "hl_org_usr_idx" ON "historico_log" ("id_organizacao", "id_usuario");
CREATE INDEX "hl_org_dt_idx" ON "historico_log" ("id_organizacao", "data_criacao_historico_log");
CREATE INDEX "hl_org_mod_dt_idx" ON "historico_log" ("id_organizacao", "modulo_historico_log", "data_criacao_historico_log");

-- ============================================================================
-- 2. regra_alerta
-- ============================================================================
ALTER TABLE "regra_alerta" RENAME COLUMN "id_organizacao_regra_alerta" TO "id_organizacao";
ALTER TABLE "regra_alerta" RENAME COLUMN "id_usuario_regra_alerta" TO "id_usuario";

DROP INDEX IF EXISTS "ra_org_idx";
DROP INDEX IF EXISTS "ra_org_prd_idx";
DROP INDEX IF EXISTS "ra_org_usr_idx";
DROP INDEX IF EXISTS "ra_org_hab_idx";

CREATE INDEX "ra_org_idx" ON "regra_alerta" ("id_organizacao");
CREATE INDEX "ra_org_prd_idx" ON "regra_alerta" ("id_organizacao", "id_produto_regra_alerta");
CREATE INDEX "ra_org_usr_idx" ON "regra_alerta" ("id_organizacao", "id_usuario");
CREATE INDEX "ra_org_hab_idx" ON "regra_alerta" ("id_organizacao", "habilitada_regra_alerta");

-- ============================================================================
-- 3. evento_alerta
-- ============================================================================
ALTER TABLE "evento_alerta" RENAME COLUMN "id_organizacao_evento_alerta" TO "id_organizacao";
ALTER TABLE "evento_alerta" RENAME COLUMN "id_usuario_evento_alerta" TO "id_usuario";

DROP INDEX IF EXISTS "ea_org_idx";
DROP INDEX IF EXISTS "ea_org_prd_idx";
DROP INDEX IF EXISTS "ea_org_usr_idx";
DROP INDEX IF EXISTS "ea_org_st_idx";
DROP INDEX IF EXISTS "ea_org_dt_idx";

CREATE INDEX "ea_org_idx" ON "evento_alerta" ("id_organizacao");
CREATE INDEX "ea_org_prd_idx" ON "evento_alerta" ("id_organizacao", "id_produto_evento_alerta");
CREATE INDEX "ea_org_usr_idx" ON "evento_alerta" ("id_organizacao", "id_usuario");
CREATE INDEX "ea_org_st_idx" ON "evento_alerta" ("id_organizacao", "status_evento_alerta");
CREATE INDEX "ea_org_dt_idx" ON "evento_alerta" ("id_organizacao", "data_criacao_evento_alerta");

-- ============================================================================
-- 4. notificacao_alerta
-- ============================================================================
ALTER TABLE "notificacao_alerta" RENAME COLUMN "id_organizacao_notificacao_alerta" TO "id_organizacao";
ALTER TABLE "notificacao_alerta" RENAME COLUMN "id_usuario_notificacao_alerta" TO "id_usuario";

DROP INDEX IF EXISTS "na_org_idx";
DROP INDEX IF EXISTS "na_org_prd_idx";
DROP INDEX IF EXISTS "na_org_usr_idx";

CREATE INDEX "na_org_idx" ON "notificacao_alerta" ("id_organizacao");
CREATE INDEX "na_org_prd_idx" ON "notificacao_alerta" ("id_organizacao", "id_produto_notificacao_alerta");
CREATE INDEX "na_org_usr_idx" ON "notificacao_alerta" ("id_organizacao", "id_usuario");

-- ============================================================================
-- 5. exportar_resultado
-- ============================================================================
ALTER TABLE "exportar_resultado" RENAME COLUMN "id_organizacao_exportar_resultado" TO "id_organizacao";
ALTER TABLE "exportar_resultado" RENAME COLUMN "id_usuario_exportar_resultado" TO "id_usuario";

DROP INDEX IF EXISTS "er_org_idx";
DROP INDEX IF EXISTS "er_org_prd_idx";
DROP INDEX IF EXISTS "er_org_usr_idx";
DROP INDEX IF EXISTS "er_org_st_idx";

CREATE INDEX "er_org_idx" ON "exportar_resultado" ("id_organizacao");
CREATE INDEX "er_org_prd_idx" ON "exportar_resultado" ("id_organizacao", "id_produto_exportar_resultado");
CREATE INDEX "er_org_usr_idx" ON "exportar_resultado" ("id_organizacao", "id_usuario");
CREATE INDEX "er_org_st_idx" ON "exportar_resultado" ("id_organizacao", "status_exportar_resultado");