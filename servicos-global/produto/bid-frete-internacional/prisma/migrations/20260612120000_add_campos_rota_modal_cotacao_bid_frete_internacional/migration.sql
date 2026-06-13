-- Campos explícitos por modal (porto/aeroporto/rodoviário) + peso em toneladas

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "porto_origem_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "porto_destino_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "aeroporto_origem_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "aeroporto_destino_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "pais_origem_rodoviario_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "pais_destino_rodoviario_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "cidade_origem_rodoviario_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "cidade_destino_rodoviario_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "peso_ton_cotacao_bid_frete_internacional" DOUBLE PRECISION;

-- Backfill a partir do snapshot legado
UPDATE "cotacao_bid_frete_internacional"
SET "porto_origem_cotacao_bid_frete_internacional" = "origem_codigo_cotacao_bid_frete_internacional"
WHERE "modal_cotacao_bid_frete_internacional" = 'MARITIMO'
  AND "porto_origem_cotacao_bid_frete_internacional" IS NULL
  AND "origem_codigo_cotacao_bid_frete_internacional" IS NOT NULL
  AND TRIM("origem_codigo_cotacao_bid_frete_internacional") <> '';

UPDATE "cotacao_bid_frete_internacional"
SET "porto_destino_cotacao_bid_frete_internacional" = "destino_codigo_cotacao_bid_frete_internacional"
WHERE "modal_cotacao_bid_frete_internacional" = 'MARITIMO'
  AND "porto_destino_cotacao_bid_frete_internacional" IS NULL
  AND "destino_codigo_cotacao_bid_frete_internacional" IS NOT NULL
  AND TRIM("destino_codigo_cotacao_bid_frete_internacional") <> '';

UPDATE "cotacao_bid_frete_internacional"
SET "aeroporto_origem_cotacao_bid_frete_internacional" = "origem_codigo_cotacao_bid_frete_internacional"
WHERE "modal_cotacao_bid_frete_internacional" = 'AEREO'
  AND "aeroporto_origem_cotacao_bid_frete_internacional" IS NULL
  AND "origem_codigo_cotacao_bid_frete_internacional" IS NOT NULL
  AND TRIM("origem_codigo_cotacao_bid_frete_internacional") <> '';

UPDATE "cotacao_bid_frete_internacional"
SET "aeroporto_destino_cotacao_bid_frete_internacional" = "destino_codigo_cotacao_bid_frete_internacional"
WHERE "modal_cotacao_bid_frete_internacional" = 'AEREO'
  AND "aeroporto_destino_cotacao_bid_frete_internacional" IS NULL
  AND "destino_codigo_cotacao_bid_frete_internacional" IS NOT NULL
  AND TRIM("destino_codigo_cotacao_bid_frete_internacional") <> '';
