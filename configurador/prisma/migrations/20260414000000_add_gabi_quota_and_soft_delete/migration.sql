-- Migration: add_gabi_quota_and_soft_delete
-- 1. Adiciona coluna gabi_quota_mensal (Int, default 0) à tabela Product
--    (já presente no schema.prisma mas sem migration correspondente).
-- 2. Adiciona coluna deleted_at (DateTime?) à tabela Product para suportar
--    soft-delete — evita perda silenciosa de SpecialNegotiations via cascade.

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "gabi_quota_mensal" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Índice parcial: consultas de listagem filtram por produtos não-deletados
CREATE INDEX IF NOT EXISTS "Product_deleted_at_idx" ON "Product" ("deleted_at")
  WHERE "deleted_at" IS NULL;
