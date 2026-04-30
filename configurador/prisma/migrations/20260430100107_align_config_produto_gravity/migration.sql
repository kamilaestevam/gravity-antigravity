-- Migration: align_config_produto_gravity
-- Alinha tabela config_produto_gravity ao schema DDD (Configurador, Onda 15).
-- Aplicada manualmente em transação em 2026-04-30 (6 rows preservadas via RENAME).

-- 1. RENAME COLUMNs
ALTER TABLE "config_produto_gravity" RENAME COLUMN "id"          TO "id_config_produto_gravity";
ALTER TABLE "config_produto_gravity" RENAME COLUMN "tenant_id"   TO "id_organizacao_config_produto_gravity";
ALTER TABLE "config_produto_gravity" RENAME COLUMN "product_key" TO "chave_produto_config_produto_gravity";
ALTER TABLE "config_produto_gravity" RENAME COLUMN "config"      TO "configuracao_config_produto_gravity";
ALTER TABLE "config_produto_gravity" RENAME COLUMN "is_active"   TO "ativo_config_produto_gravity";
ALTER TABLE "config_produto_gravity" RENAME COLUMN "created_at"  TO "data_criacao_config_produto_gravity";
ALTER TABLE "config_produto_gravity" RENAME COLUMN "updated_at"  TO "data_atualizacao_config_produto_gravity";

-- 2. RENAME INDEXes (mapeados no schema com cpg_*)
ALTER INDEX "config_produto_gravity_tenant_id_product_key_key" RENAME TO "cpg_org_chave_unq";
ALTER INDEX "config_produto_gravity_tenant_id_idx"             RENAME TO "cpg_org_idx";
ALTER INDEX "config_produto_gravity_tenant_id_product_key_idx" RENAME TO "cpg_org_chave_idx";
ALTER INDEX "config_produto_gravity_tenant_id_is_active_idx"   RENAME TO "cpg_org_ativo_idx";

-- 3. RENAME FK CONSTRAINT
ALTER TABLE "config_produto_gravity"
  RENAME CONSTRAINT "config_produto_gravity_tenant_id_fkey"
  TO "config_produto_gravity_id_organizacao_config_produto_gravit_fkey";
