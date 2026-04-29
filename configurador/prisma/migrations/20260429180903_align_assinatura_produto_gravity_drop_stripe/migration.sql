-- Migration: align_assinatura_produto_gravity_drop_stripe
-- 1. Remove integração Stripe (descontinuada)
-- 2. Alinha tabela ao schema DDD (REGRA 3: id_organizacao literal, sem sufixo)
-- Aplicada manualmente em transação em 2026-04-29 (2 rows preservadas via RENAME).

-- 1. DROP COLUMNs (Stripe deprecation)
ALTER TABLE "assinatura_produto_gravity" DROP COLUMN "stripe_subscription_id";
ALTER TABLE "assinatura_produto_gravity" DROP COLUMN "stripe_price_id";

-- 2. RENAME COLUMNs
ALTER TABLE "assinatura_produto_gravity" RENAME COLUMN "id"                   TO "id_assinatura_produto_gravity";
ALTER TABLE "assinatura_produto_gravity" RENAME COLUMN "tenant_id"            TO "id_organizacao";
ALTER TABLE "assinatura_produto_gravity" RENAME COLUMN "status"               TO "status_assinatura_produto_gravity";
ALTER TABLE "assinatura_produto_gravity" RENAME COLUMN "trial_ends_at"        TO "data_fim_teste_assinatura_produto_gravity";
ALTER TABLE "assinatura_produto_gravity" RENAME COLUMN "current_period_start" TO "data_inicio_periodo_assinatura_produto_gravity";
ALTER TABLE "assinatura_produto_gravity" RENAME COLUMN "current_period_end"   TO "data_fim_periodo_assinatura_produto_gravity";
ALTER TABLE "assinatura_produto_gravity" RENAME COLUMN "cancelled_at"         TO "data_cancelamento_assinatura_produto_gravity";
ALTER TABLE "assinatura_produto_gravity" RENAME COLUMN "created_at"           TO "data_criacao_assinatura_produto_gravity";
ALTER TABLE "assinatura_produto_gravity" RENAME COLUMN "updated_at"           TO "data_atualizacao_assinatura_produto_gravity";

-- 3. RENAME INDEXes
ALTER INDEX "assinatura_produto_gravity_tenant_id_idx"            RENAME TO "apg_org_idx";
ALTER INDEX "assinatura_produto_gravity_tenant_id_created_at_idx" RENAME TO "apg_org_criacao_idx";
ALTER INDEX "assinatura_produto_gravity_tenant_id_status_idx"     RENAME TO "apg_org_status_idx";

-- 4. RENAME FK CONSTRAINT
ALTER TABLE "assinatura_produto_gravity"
  RENAME CONSTRAINT "assinatura_produto_gravity_tenant_id_fkey"
  TO "assinatura_produto_gravity_id_organizacao_fkey";
