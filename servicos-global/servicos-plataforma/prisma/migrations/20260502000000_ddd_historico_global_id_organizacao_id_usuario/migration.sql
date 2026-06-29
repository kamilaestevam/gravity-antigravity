-- Migration: DDD historico-global — REGRA 3 ddd-nomenclatura
-- Idempotente (2026-06-29): produção tinha colunas legado (tenant_id) e migrate
-- falhava ao assumir id_organizacao_historico_log inexistente.

-- ============================================================================
-- 1. historico_log — legado inglês → DDD
-- ============================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "id" TO "id_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='tenant_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id_organizacao') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "tenant_id" TO "id_organizacao";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id_organizacao_historico_log')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id_organizacao') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "id_organizacao_historico_log" TO "id_organizacao";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='user_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id_usuario') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "user_id" TO "id_usuario";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id_usuario_historico_log')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id_usuario') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "id_usuario_historico_log" TO "id_usuario";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='product_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id_produto_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "product_id" TO "id_produto_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='actor_type')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='tipo_ator_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "actor_type" TO "tipo_ator_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='actor_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id_ator_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "actor_id" TO "id_ator_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='actor_name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='nome_ator_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "actor_name" TO "nome_ator_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='actor_ip')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='ip_ator_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "actor_ip" TO "ip_ator_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='actor_metadata')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='metadata_ator_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "actor_metadata" TO "metadata_ator_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='module')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='modulo_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "module" TO "modulo_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='resource_type')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='tipo_recurso_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "resource_type" TO "tipo_recurso_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='resource_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='id_recurso_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "resource_id" TO "id_recurso_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='action')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='acao_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "action" TO "acao_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='action_detail')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='detalhe_acao_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "action_detail" TO "detalhe_acao_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='before')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='estado_anterior_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "before" TO "estado_anterior_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='after')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='estado_posterior_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "after" TO "estado_posterior_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='status')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='status_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "status" TO "status_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='error_message')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='mensagem_erro_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "error_message" TO "mensagem_erro_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='integrity_hash')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='hash_integridade_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "integrity_hash" TO "hash_integridade_historico_log";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='created_at')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='historico_log' AND column_name='data_criacao_historico_log') THEN
    ALTER TABLE "historico_log" RENAME COLUMN "created_at" TO "data_criacao_historico_log";
  END IF;
END $$;

DROP INDEX IF EXISTS "hl_org_idx";
DROP INDEX IF EXISTS "hl_org_prd_idx";
DROP INDEX IF EXISTS "hl_org_usr_idx";
DROP INDEX IF EXISTS "hl_org_dt_idx";
DROP INDEX IF EXISTS "hl_org_mod_dt_idx";
DROP INDEX IF EXISTS "historico_log_tenant_id_idx";
DROP INDEX IF EXISTS "historico_log_tenant_id_product_id_idx";
DROP INDEX IF EXISTS "historico_log_tenant_id_user_id_idx";
DROP INDEX IF EXISTS "historico_log_tenant_id_created_at_idx";
DROP INDEX IF EXISTS "historico_log_tenant_id_module_created_at_idx";
DROP INDEX IF EXISTS "historico_log_actor_id_created_at_idx";

CREATE INDEX IF NOT EXISTS "hl_org_idx" ON "historico_log" ("id_organizacao");
CREATE INDEX IF NOT EXISTS "hl_org_prd_idx" ON "historico_log" ("id_organizacao", "id_produto_historico_log");
CREATE INDEX IF NOT EXISTS "hl_org_usr_idx" ON "historico_log" ("id_organizacao", "id_usuario");
CREATE INDEX IF NOT EXISTS "hl_org_dt_idx" ON "historico_log" ("id_organizacao", "data_criacao_historico_log");
CREATE INDEX IF NOT EXISTS "hl_org_mod_dt_idx" ON "historico_log" ("id_organizacao", "modulo_historico_log", "data_criacao_historico_log");

-- ============================================================================
-- 2. regra_alerta
-- ============================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='regra_alerta' AND column_name='id_organizacao_regra_alerta')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='regra_alerta' AND column_name='id_organizacao') THEN
    ALTER TABLE "regra_alerta" RENAME COLUMN "id_organizacao_regra_alerta" TO "id_organizacao";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='regra_alerta' AND column_name='id_usuario_regra_alerta')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='regra_alerta' AND column_name='id_usuario') THEN
    ALTER TABLE "regra_alerta" RENAME COLUMN "id_usuario_regra_alerta" TO "id_usuario";
  END IF;
END $$;

DROP INDEX IF EXISTS "ra_org_idx";
DROP INDEX IF EXISTS "ra_org_prd_idx";
DROP INDEX IF EXISTS "ra_org_usr_idx";
DROP INDEX IF EXISTS "ra_org_hab_idx";

CREATE INDEX IF NOT EXISTS "ra_org_idx" ON "regra_alerta" ("id_organizacao");
CREATE INDEX IF NOT EXISTS "ra_org_prd_idx" ON "regra_alerta" ("id_organizacao", "id_produto_regra_alerta");
CREATE INDEX IF NOT EXISTS "ra_org_usr_idx" ON "regra_alerta" ("id_organizacao", "id_usuario");
CREATE INDEX IF NOT EXISTS "ra_org_hab_idx" ON "regra_alerta" ("id_organizacao", "habilitada_regra_alerta");

-- ============================================================================
-- 3. evento_alerta
-- ============================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='evento_alerta' AND column_name='id_organizacao_evento_alerta')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='evento_alerta' AND column_name='id_organizacao') THEN
    ALTER TABLE "evento_alerta" RENAME COLUMN "id_organizacao_evento_alerta" TO "id_organizacao";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='evento_alerta' AND column_name='id_usuario_evento_alerta')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='evento_alerta' AND column_name='id_usuario') THEN
    ALTER TABLE "evento_alerta" RENAME COLUMN "id_usuario_evento_alerta" TO "id_usuario";
  END IF;
END $$;

DROP INDEX IF EXISTS "ea_org_idx";
DROP INDEX IF EXISTS "ea_org_prd_idx";
DROP INDEX IF EXISTS "ea_org_usr_idx";
DROP INDEX IF EXISTS "ea_org_st_idx";
DROP INDEX IF EXISTS "ea_org_dt_idx";

CREATE INDEX IF NOT EXISTS "ea_org_idx" ON "evento_alerta" ("id_organizacao");
CREATE INDEX IF NOT EXISTS "ea_org_prd_idx" ON "evento_alerta" ("id_organizacao", "id_produto_evento_alerta");
CREATE INDEX IF NOT EXISTS "ea_org_usr_idx" ON "evento_alerta" ("id_organizacao", "id_usuario");
CREATE INDEX IF NOT EXISTS "ea_org_st_idx" ON "evento_alerta" ("id_organizacao", "status_evento_alerta");
CREATE INDEX IF NOT EXISTS "ea_org_dt_idx" ON "evento_alerta" ("id_organizacao", "data_criacao_evento_alerta");

-- ============================================================================
-- 4. notificacao_alerta
-- ============================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notificacao_alerta' AND column_name='id_organizacao_notificacao_alerta')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notificacao_alerta' AND column_name='id_organizacao') THEN
    ALTER TABLE "notificacao_alerta" RENAME COLUMN "id_organizacao_notificacao_alerta" TO "id_organizacao";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notificacao_alerta' AND column_name='id_usuario_notificacao_alerta')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notificacao_alerta' AND column_name='id_usuario') THEN
    ALTER TABLE "notificacao_alerta" RENAME COLUMN "id_usuario_notificacao_alerta" TO "id_usuario";
  END IF;
END $$;

DROP INDEX IF EXISTS "na_org_idx";
DROP INDEX IF EXISTS "na_org_prd_idx";
DROP INDEX IF EXISTS "na_org_usr_idx";

CREATE INDEX IF NOT EXISTS "na_org_idx" ON "notificacao_alerta" ("id_organizacao");
CREATE INDEX IF NOT EXISTS "na_org_prd_idx" ON "notificacao_alerta" ("id_organizacao", "id_produto_notificacao_alerta");
CREATE INDEX IF NOT EXISTS "na_org_usr_idx" ON "notificacao_alerta" ("id_organizacao", "id_usuario");

-- ============================================================================
-- 5. exportar_resultado
-- ============================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='exportar_resultado' AND column_name='id_organizacao_exportar_resultado')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='exportar_resultado' AND column_name='id_organizacao') THEN
    ALTER TABLE "exportar_resultado" RENAME COLUMN "id_organizacao_exportar_resultado" TO "id_organizacao";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='exportar_resultado' AND column_name='id_usuario_exportar_resultado')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='exportar_resultado' AND column_name='id_usuario') THEN
    ALTER TABLE "exportar_resultado" RENAME COLUMN "id_usuario_exportar_resultado" TO "id_usuario";
  END IF;
END $$;

DROP INDEX IF EXISTS "er_org_idx";
DROP INDEX IF EXISTS "er_org_prd_idx";
DROP INDEX IF EXISTS "er_org_usr_idx";
DROP INDEX IF EXISTS "er_org_st_idx";

CREATE INDEX IF NOT EXISTS "er_org_idx" ON "exportar_resultado" ("id_organizacao");
CREATE INDEX IF NOT EXISTS "er_org_prd_idx" ON "exportar_resultado" ("id_organizacao", "id_produto_exportar_resultado");
CREATE INDEX IF NOT EXISTS "er_org_usr_idx" ON "exportar_resultado" ("id_organizacao", "id_usuario");
CREATE INDEX IF NOT EXISTS "er_org_st_idx" ON "exportar_resultado" ("id_organizacao", "status_exportar_resultado");
