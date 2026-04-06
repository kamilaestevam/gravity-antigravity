-- Migration: add_consolidacao_fields
-- Adiciona campos de consolidação ao model Pedido (pedidos_comerciais)

ALTER TABLE "pedidos_comerciais" ADD COLUMN IF NOT EXISTS "pedidos_origem" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "pedidos_comerciais" ADD COLUMN IF NOT EXISTS "data_consolidacao_pedido" TIMESTAMP(3);
ALTER TABLE "pedidos_comerciais" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Índice para filtrar pedidos ativos (deleted_at IS NULL) por tenant
CREATE INDEX IF NOT EXISTS "pedidos_comerciais_tenant_id_deleted_at_idx" ON "pedidos_comerciais"("tenant_id", "deleted_at");
