-- Paridade DDD rota: tabela_bid_frete_internacional ↔ cotacao_bid_frete_internacional
-- Campos canônicos por modal + snapshot país + prazo pagamento

ALTER TABLE "tabela_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "porto_origem_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "porto_destino_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "aeroporto_origem_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "aeroporto_destino_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "endereco_origem_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "endereco_destino_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "pais_origem_rodoviario_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "pais_destino_rodoviario_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "estado_provincia_origem_rodov_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "estado_provincia_destino_rodov_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "cidade_origem_rodoviario_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "cidade_destino_rodoviario_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "origem_pais_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "destino_pais_tabela_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "dias_prazo_pagamento_tabela_bid_frete_internacional" INTEGER;

-- País snapshot: NOT NULL com default para linhas existentes
UPDATE "tabela_bid_frete_internacional"
SET "origem_pais_tabela_bid_frete_internacional" = ''
WHERE "origem_pais_tabela_bid_frete_internacional" IS NULL;

UPDATE "tabela_bid_frete_internacional"
SET "destino_pais_tabela_bid_frete_internacional" = ''
WHERE "destino_pais_tabela_bid_frete_internacional" IS NULL;

ALTER TABLE "tabela_bid_frete_internacional"
  ALTER COLUMN "origem_pais_tabela_bid_frete_internacional" SET DEFAULT '',
  ALTER COLUMN "origem_pais_tabela_bid_frete_internacional" SET NOT NULL,
  ALTER COLUMN "destino_pais_tabela_bid_frete_internacional" SET DEFAULT '',
  ALTER COLUMN "destino_pais_tabela_bid_frete_internacional" SET NOT NULL;

-- Backfill canônicos a partir do snapshot legado
UPDATE "tabela_bid_frete_internacional"
SET "porto_origem_tabela_bid_frete_internacional" = "origem_codigo_tabela_bid_frete_internacional"
WHERE "modal_tabela_bid_frete_internacional" = 'MARITIMO'
  AND "porto_origem_tabela_bid_frete_internacional" IS NULL
  AND TRIM("origem_codigo_tabela_bid_frete_internacional") <> '';

UPDATE "tabela_bid_frete_internacional"
SET "porto_destino_tabela_bid_frete_internacional" = "destino_codigo_tabela_bid_frete_internacional"
WHERE "modal_tabela_bid_frete_internacional" = 'MARITIMO'
  AND "porto_destino_tabela_bid_frete_internacional" IS NULL
  AND TRIM("destino_codigo_tabela_bid_frete_internacional") <> '';

UPDATE "tabela_bid_frete_internacional"
SET "aeroporto_origem_tabela_bid_frete_internacional" = "origem_codigo_tabela_bid_frete_internacional"
WHERE "modal_tabela_bid_frete_internacional" = 'AEREO'
  AND "aeroporto_origem_tabela_bid_frete_internacional" IS NULL
  AND TRIM("origem_codigo_tabela_bid_frete_internacional") <> '';

UPDATE "tabela_bid_frete_internacional"
SET "aeroporto_destino_tabela_bid_frete_internacional" = "destino_codigo_tabela_bid_frete_internacional"
WHERE "modal_tabela_bid_frete_internacional" = 'AEREO'
  AND "aeroporto_destino_tabela_bid_frete_internacional" IS NULL
  AND TRIM("destino_codigo_tabela_bid_frete_internacional") <> '';

-- Índice composto com modalidade (match motor)
DROP INDEX IF EXISTS "tabela_bid_frete_internacional_origem_codigo_tabela_bid_frete_internacional_destino_codigo_tabela_bid_frete_internacional_modal_tabela_bid_frete_internacional_idx";

CREATE INDEX IF NOT EXISTS "tabela_bid_frete_internacional_rota_modal_idx"
  ON "tabela_bid_frete_internacional" (
    "origem_codigo_tabela_bid_frete_internacional",
    "destino_codigo_tabela_bid_frete_internacional",
    "modal_tabela_bid_frete_internacional",
    "modalidade_tabela_bid_frete_internacional"
  );
