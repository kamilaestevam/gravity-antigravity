-- Migration: tipo_volume_pedido / tipo_volume_item (2026-06-08)
--
-- Contexto: colunas declaradas em fragment.prisma para armazenar codigo_volume
-- do catálogo cadastros.volume (SSOT). Sem elas, PATCH /campo retorna 500
-- (Prisma: coluna inexistente).

ALTER TABLE "pedido" ADD COLUMN IF NOT EXISTS "tipo_volume_pedido" TEXT;
ALTER TABLE "pedido_item" ADD COLUMN IF NOT EXISTS "tipo_volume_item" TEXT;
