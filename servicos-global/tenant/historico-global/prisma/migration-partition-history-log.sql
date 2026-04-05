-- migration-partition-history-log.sql
-- Converte HistoryLog de tabela regular para tabela particionada por RANGE em created_at.
--
-- ATENÇÃO: Esta migração é destrutiva e irreversível.
-- Execute apenas em manutenção programada com backup prévio.
-- Coordenador deve revisar e aprovar antes de rodar em produção.
--
-- Passos:
--   1. Renomeia a tabela atual para backup
--   2. Cria nova tabela particionada com o mesmo schema
--   3. Cria partições para os últimos 12 meses + próximo mês
--   4. Copia os dados da tabela backup para a particionada
--   5. Remove a tabela backup (após validação manual)

BEGIN;

-- 1. Renomear tabela atual para backup
ALTER TABLE "HistoryLog" RENAME TO "HistoryLog_backup";

-- 2. Criar nova tabela particionada
CREATE TABLE "HistoryLog" (
  "id"             TEXT        NOT NULL,
  "tenant_id"      TEXT        NOT NULL,
  "actor_type"     TEXT        NOT NULL,
  "actor_id"       TEXT        NOT NULL,
  "actor_name"     TEXT        NOT NULL,
  "actor_ip"       TEXT,
  "actor_metadata" JSONB,
  "module"         TEXT        NOT NULL,
  "resource_type"  TEXT        NOT NULL,
  "resource_id"    TEXT,
  "action"         TEXT        NOT NULL,
  "action_detail"  TEXT        NOT NULL,
  "before"         JSONB,
  "after"          JSONB,
  "status"         TEXT        NOT NULL DEFAULT 'SUCCESS',
  "error_message"  TEXT,
  "integrity_hash" TEXT        NOT NULL,
  "product_id"     TEXT,
  "user_id"        TEXT,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- 3. Recriar índices na tabela particionada
CREATE INDEX ON "HistoryLog" (tenant_id);
CREATE INDEX ON "HistoryLog" (tenant_id, "product_id");
CREATE INDEX ON "HistoryLog" (tenant_id, "user_id");
CREATE INDEX ON "HistoryLog" (tenant_id, created_at DESC);
CREATE INDEX ON "HistoryLog" (tenant_id, module, created_at DESC);
CREATE INDEX ON "HistoryLog" (actor_id, created_at DESC);

-- 4. Criar partições mensais para os últimos 12 meses + 2 meses futuros
-- (ajustar as datas conforme o mês atual na execução)
DO $$
DECLARE
  start_month DATE := date_trunc('month', now()) - INTERVAL '12 months';
  cur_month   DATE;
  end_month   DATE;
  part_name   TEXT;
BEGIN
  cur_month := start_month;
  WHILE cur_month <= date_trunc('month', now()) + INTERVAL '1 month' LOOP
    end_month := cur_month + INTERVAL '1 month';
    part_name := 'history_log_' || to_char(cur_month, 'YYYY_MM');

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF "HistoryLog" FOR VALUES FROM (%L) TO (%L)',
      part_name,
      cur_month::text,
      end_month::text
    );

    cur_month := end_month;
  END LOOP;
END $$;

-- 5. Copiar dados (pode demorar — executar fora de horário de pico)
INSERT INTO "HistoryLog"
SELECT * FROM "HistoryLog_backup";

-- VALIDAR antes de continuar:
-- SELECT count(*) FROM "HistoryLog";
-- SELECT count(*) FROM "HistoryLog_backup";
-- Os totais devem ser iguais.

-- 6. Após validação manual, remover backup:
-- DROP TABLE "HistoryLog_backup";

COMMIT;
