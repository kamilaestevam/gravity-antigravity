-- Migration: rename_testes_to_teste_add_audit
-- Renomeia tabela testes (plural) → teste (singular DDD, alinha com agendamento_teste/plano_teste)
-- + 17 RENAME COLUMN (sufixo _teste singular)
-- + 3 ADD COLUMN (data_atualizacao_teste, gatilho_teste, id_agendamento_teste)
-- + 7 RENAME INDEX/PK
-- + 1 ADD FK CONSTRAINT (teste → agendamento_teste, opcional)
-- + 1 CREATE INDEX (id_agendamento_teste)
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

-- 1. RENAME TABLE
ALTER TABLE "testes" RENAME TO "teste";

-- 2. RENAME COLUMNs (17)
ALTER TABLE "teste" RENAME COLUMN "id"            TO "id_teste";
ALTER TABLE "teste" RENAME COLUMN "tenant_id"     TO "id_organizacao";
ALTER TABLE "teste" RENAME COLUMN "type"          TO "tipo_teste";
ALTER TABLE "teste" RENAME COLUMN "escopo"        TO "escopo_teste";
ALTER TABLE "teste" RENAME COLUMN "sublocal"      TO "sublocal_teste";
ALTER TABLE "teste" RENAME COLUMN "module"        TO "modulo_teste";
ALTER TABLE "teste" RENAME COLUMN "test_name"     TO "nome_teste";
ALTER TABLE "teste" RENAME COLUMN "test_id"       TO "id_plano_teste";
ALTER TABLE "teste" RENAME COLUMN "result"        TO "resultado_teste";
ALTER TABLE "teste" RENAME COLUMN "duration"      TO "duracao_teste";
ALTER TABLE "teste" RENAME COLUMN "error_log"     TO "log_erro_teste";
ALTER TABLE "teste" RENAME COLUMN "ai_analysis"   TO "analise_ia_teste";
ALTER TABLE "teste" RENAME COLUMN "screenshot"    TO "screenshot_teste";
ALTER TABLE "teste" RENAME COLUMN "ambiente"      TO "ambiente_teste";
ALTER TABLE "teste" RENAME COLUMN "run_id"        TO "id_execucao_teste";
ALTER TABLE "teste" RENAME COLUMN "triggered_by"  TO "disparado_por_teste";
ALTER TABLE "teste" RENAME COLUMN "created_at"    TO "data_criacao_teste";

-- 3. ADD COLUMNs (3)
ALTER TABLE "teste" ADD COLUMN "data_atualizacao_teste" TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE "teste" ADD COLUMN "gatilho_teste"          TEXT; -- manual | cron | ci | post_deploy
ALTER TABLE "teste" ADD COLUMN "id_agendamento_teste"   TEXT; -- FK opcional para agendamento_teste

-- 4. RENAME INDEXes (6) + PK
ALTER INDEX "testes_pkey"             RENAME TO "teste_pkey";
ALTER INDEX "testes_tenant_id_idx"    RENAME TO "tst_org_idx";
ALTER INDEX "testes_created_at_idx"   RENAME TO "tst_criacao_idx";
ALTER INDEX "testes_type_escopo_idx"  RENAME TO "tst_tipo_escopo_idx";
ALTER INDEX "testes_result_idx"       RENAME TO "tst_resultado_idx";
ALTER INDEX "testes_run_id_idx"       RENAME TO "tst_execucao_idx";
ALTER INDEX "testes_test_id_idx"      RENAME TO "tst_plano_idx";

-- 5. ADD FK CONSTRAINT (teste → agendamento_teste, opcional/SetNull)
ALTER TABLE "teste"
  ADD CONSTRAINT "teste_agendamento_fkey"
  FOREIGN KEY ("id_agendamento_teste")
  REFERENCES "agendamento_teste"("id_agendamento_teste")
  ON UPDATE CASCADE ON DELETE SET NULL;

-- 6. CREATE INDEX (id_agendamento_teste)
CREATE INDEX "tst_agendamento_idx" ON "teste" ("id_agendamento_teste");
