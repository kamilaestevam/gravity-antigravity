-- Migration: align_agendamento_teste
-- Alinha tabela agendamento_teste ao schema DDD (Configurador, Onda 23 — Sistema Testes).
-- Aplicada manualmente em transação em 2026-04-29 (tabela vazia, sem backfill necessário).
-- Esta migration é registrada em _prisma_migrations via `prisma migrate resolve --applied`.
--
-- Mudanças:
--   1. RENAME COLUMN x14 — toda a tabela em nomenclatura legada → DDD (sufixo _agendamento_teste)
--   2. RENAME INDEX x3   — nomes auto-gerados do Prisma → nomes mapeados agt_*

-- 1. RENAME COLUMNs
ALTER TABLE "agendamento_teste" RENAME COLUMN "id"            TO "id_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "tenant_id"     TO "id_organizacao_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "ativo"         TO "ativo_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "frequencia"    TO "frequencia_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "hora"          TO "hora_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "minuto"        TO "minuto_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "tipos"         TO "tipos_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "escopos"       TO "escopos_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "ambiente"      TO "ambiente_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "alertas"       TO "alertas_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "ultima_exec"   TO "ultima_execucao_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "proxima_exec"  TO "proxima_execucao_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "created_at"    TO "data_criacao_agendamento_teste";
ALTER TABLE "agendamento_teste" RENAME COLUMN "updated_at"    TO "data_atualizacao_agendamento_teste";

-- 2. RENAME INDEXes (mapeados no schema com agt_*)
ALTER INDEX "agendamento_teste_tenant_id_idx"    RENAME TO "agt_org_idx";
ALTER INDEX "agendamento_teste_ativo_idx"        RENAME TO "agt_ativo_idx";
ALTER INDEX "agendamento_teste_proxima_exec_idx" RENAME TO "agt_proxima_idx";
