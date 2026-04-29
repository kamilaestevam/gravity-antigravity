-- Migration: align_ope_historico_status
-- Alinha tabela ope_historico_status ao schema DDD (Onda 38).
-- Aplicada manualmente em transação via psql em 2026-04-29 (tabela vazia, sem backfill necessário).
-- Esta migration é registrada em _prisma_migrations via `prisma migrate resolve --applied`.
--
-- Mudanças:
--   1. RENAME COLUMN x7 — corrige sufixo _historico_status_ope → _ope_historico_status
--   2. ADD COLUMN x3   — id_organizacao_ope_historico_status, id_produto_ope_historico_status, id_usuario_ope_historico_status (todos nullable)
--   3. RENAME INDEX x2 — nomes longos auto-gerados pelo Prisma → nomes mapeados ohs_*
--   4. CREATE INDEX x3 — índices novos sobre as colunas adicionadas

-- 1. RENAME COLUMNs
ALTER TABLE "ope_historico_status" RENAME COLUMN "id_historico_status_ope"            TO "id_ope_historico_status";
ALTER TABLE "ope_historico_status" RENAME COLUMN "suid_ope_historico_status_ope"      TO "suid_ope_historico_status";
ALTER TABLE "ope_historico_status" RENAME COLUMN "status_anterior_historico_status_ope" TO "status_anterior_ope_historico_status";
ALTER TABLE "ope_historico_status" RENAME COLUMN "status_novo_historico_status_ope"   TO "status_novo_ope_historico_status";
ALTER TABLE "ope_historico_status" RENAME COLUMN "origem_historico_status_ope"        TO "origem_ope_historico_status";
ALTER TABLE "ope_historico_status" RENAME COLUMN "payload_historico_status_ope"       TO "payload_ope_historico_status";
ALTER TABLE "ope_historico_status" RENAME COLUMN "registrado_em_historico_status_ope" TO "registrado_em_ope_historico_status";

-- 2. ADD COLUMNs (nullable, conforme schema)
ALTER TABLE "ope_historico_status" ADD COLUMN "id_organizacao_ope_historico_status" TEXT;
ALTER TABLE "ope_historico_status" ADD COLUMN "id_produto_ope_historico_status"     TEXT;
ALTER TABLE "ope_historico_status" ADD COLUMN "id_usuario_ope_historico_status"     TEXT;

-- 3. RENAME INDEXes
ALTER INDEX "ope_historico_status_registrado_em_historico_status_ope_idx" RENAME TO "ohs_data_idx";
ALTER INDEX "ope_historico_status_suid_ope_historico_status_ope_idx"      RENAME TO "ohs_suid_idx";

-- 4. CREATE INDEXes novos
CREATE INDEX "ohs_org_idx"     ON "ope_historico_status" ("id_organizacao_ope_historico_status");
CREATE INDEX "ohs_org_prd_idx" ON "ope_historico_status" ("id_organizacao_ope_historico_status", "id_produto_ope_historico_status");
CREATE INDEX "ohs_org_usr_idx" ON "ope_historico_status" ("id_organizacao_ope_historico_status", "id_usuario_ope_historico_status");
