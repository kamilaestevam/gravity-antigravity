-- Moeda câmbio por item — habilita edição independente Pedido/Item (mirror cobertura_cambial)
-- Coluna nullable, aditiva e idempotente (Fase A retrocompatível — sem backfill).
-- A lógica de divergência trata item NULL graciosamente (não gera alerta falso).

ALTER TABLE "pedido_item" ADD COLUMN IF NOT EXISTS "moeda_cambio_item" TEXT;
