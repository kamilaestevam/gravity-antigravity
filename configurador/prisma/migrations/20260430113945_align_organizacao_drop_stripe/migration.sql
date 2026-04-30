-- Migration: align_organizacao_drop_stripe
-- 1. Remove stripe_customer_id (Stripe descontinuado)
-- 2. Renomeia colunas: clerk_org_id, updated_at, suid_empresa
-- 3. Renomeia índices para padrão limpo
-- NOTA: tipo_organizacao MANTÉM (não vira tipo_empresa_organizacao);
-- schema é ajustado para refletir o nome do banco.
-- Aplicada manualmente em transação em 2026-04-30 (3 rows preservadas via RENAME).

-- 1. DROP COLUMN (Stripe deprecated)
ALTER TABLE "organizacao" DROP COLUMN "stripe_customer_id";

-- 2. RENAME COLUMNs
ALTER TABLE "organizacao" RENAME COLUMN "clerk_org_id"    TO "clerk_organizacao_id";
ALTER TABLE "organizacao" RENAME COLUMN "updated_at"      TO "data_atualizacao_organizacao";
ALTER TABLE "organizacao" RENAME COLUMN "suid_empresa"    TO "suid_empresa_organizacao";

-- 3. RENAME INDEXes
ALTER INDEX "organizacao_clerk_org_id_key"           RENAME TO "organizacao_clerk_organizacao_id_key";
ALTER INDEX "organizacao_suid_empresa_key"           RENAME TO "organizacao_suid_empresa_organizacao_key";
ALTER INDEX "organizacao_status_organizacao_idx"     RENAME TO "status_organizacao_idx";
ALTER INDEX "organizacao_subdominio_organizacao_idx" RENAME TO "subdominio_organizacao_idx";
