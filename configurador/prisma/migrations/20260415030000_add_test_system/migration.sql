-- Migration: 20260415030000_add_test_system
-- Adiciona as 3 tabelas do sistema de testes automatizado:
--   TestLog       — resultados de execuções (substitui o fallback em data/test-logs/*.json)
--   TestSchedule  — agendamento de runs (cron diário, alertas, tipos ativos)
--   TestPlan      — planos de teste em JSON (gerados pelo agente-plano-teste)
--
-- Convenção de IDs: TST-{TIPO}-{ESCOPO}-{NNNNNN}
-- Documentação: documentos-tecnicos/testes/

-- ─── TestLog ──────────────────────────────────────────────────────────────────
CREATE TABLE "TestLog" (
  "id"           TEXT NOT NULL,
  "tenant_id"    TEXT NOT NULL DEFAULT 'platform',
  "type"         TEXT NOT NULL,
  "escopo"       TEXT NOT NULL,
  "sublocal"     TEXT,
  "module"       TEXT NOT NULL,
  "test_name"    TEXT NOT NULL,
  "test_id"      TEXT,
  "result"       TEXT NOT NULL,
  "duration"     TEXT NOT NULL,
  "error_log"    TEXT,
  "ai_analysis"  JSONB,
  "screenshot"   TEXT,
  "ambiente"     TEXT NOT NULL DEFAULT 'Local',
  "run_id"       TEXT,
  "triggered_by" TEXT,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TestLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TestLog_tenant_id_idx"           ON "TestLog"("tenant_id");
CREATE INDEX "TestLog_created_at_idx"          ON "TestLog"("created_at");
CREATE INDEX "TestLog_type_escopo_idx"         ON "TestLog"("type", "escopo");
CREATE INDEX "TestLog_result_idx"              ON "TestLog"("result");
CREATE INDEX "TestLog_run_id_idx"              ON "TestLog"("run_id");
CREATE INDEX "TestLog_test_id_idx"             ON "TestLog"("test_id");

-- ─── TestSchedule ─────────────────────────────────────────────────────────────
CREATE TABLE "TestSchedule" (
  "id"           TEXT NOT NULL,
  "tenant_id"    TEXT NOT NULL DEFAULT 'platform',
  "ativo"        BOOLEAN NOT NULL DEFAULT false,
  "frequencia"   TEXT NOT NULL DEFAULT 'Manual',
  "hora"         INTEGER NOT NULL DEFAULT 0,
  "minuto"       INTEGER NOT NULL DEFAULT 0,
  "tipos"        JSONB NOT NULL,
  "escopos"      TEXT[] NOT NULL,
  "ambiente"     TEXT NOT NULL DEFAULT 'Local',
  "alertas"      JSONB NOT NULL DEFAULT '[]',
  "ultima_exec"  TIMESTAMP(3),
  "proxima_exec" TIMESTAMP(3),
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TestSchedule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TestSchedule_tenant_id_idx"     ON "TestSchedule"("tenant_id");
CREATE INDEX "TestSchedule_ativo_idx"          ON "TestSchedule"("ativo");
CREATE INDEX "TestSchedule_proxima_exec_idx"   ON "TestSchedule"("proxima_exec");

-- ─── TestPlan ─────────────────────────────────────────────────────────────────
CREATE TABLE "TestPlan" (
  "id"                TEXT NOT NULL,
  "tenant_id"         TEXT NOT NULL DEFAULT 'platform',
  "versao"            TEXT NOT NULL DEFAULT '1.0',
  "tipo"              TEXT NOT NULL,
  "escopo"            TEXT NOT NULL,
  "sublocal"          TEXT NOT NULL,
  "tela"              TEXT NOT NULL,
  "rota"              TEXT NOT NULL,
  "criticidade"       TEXT NOT NULL DEFAULT 'media',
  "ambientes"         TEXT[] NOT NULL,
  "componente_path"   TEXT NOT NULL,
  "spec_path"         TEXT,
  "mapeamento_path"   TEXT NOT NULL,
  "cobertura_pct"     INTEGER NOT NULL DEFAULT 0,
  "passos_total"      INTEGER NOT NULL DEFAULT 0,
  "resumo_executivo"  TEXT NOT NULL,
  "plano_completo"    JSONB NOT NULL,
  "status"            TEXT NOT NULL DEFAULT 'pendente_validacao',
  "ultima_execucao"   TIMESTAMP(3),
  "ultimo_resultado"  TEXT,
  "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"        TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TestPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TestPlan_tenant_id_idx"  ON "TestPlan"("tenant_id");
CREATE INDEX "TestPlan_tipo_escopo_idx" ON "TestPlan"("tipo", "escopo");
CREATE INDEX "TestPlan_status_idx"      ON "TestPlan"("status");
CREATE INDEX "TestPlan_sublocal_idx"    ON "TestPlan"("sublocal");
