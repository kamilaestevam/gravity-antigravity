-- Migration: rename_negociacao_especial_to_preco_produto_gravity
-- Renomeia tabela negociacao_especial_produto_gravity → negociacao_especial_preco_produto_gravity
-- Aplica DDD pleno + REGRA 3 (id_organizacao literal) + REGRA 4 (id_produto_gravity literal).
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

-- 1. RENAME TABLE
ALTER TABLE "negociacao_especial_produto_gravity" RENAME TO "negociacao_especial_preco_produto_gravity";

-- 2. RENAME COLUMNs
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME COLUMN "id"            TO "id_negociacao_especial_preco_produto_gravity";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME COLUMN "product_id"    TO "id_produto_gravity";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME COLUMN "tenant_id"     TO "id_organizacao";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME COLUMN "tenant_name"   TO "nome_organizacao_negociacao_especial_preco_produto_gravity";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME COLUMN "agreement"     TO "acordo_negociacao_especial_preco_produto_gravity";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME COLUMN "starts_at"     TO "data_inicio_negociacao_especial_preco_produto_gravity";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME COLUMN "ends_at"       TO "data_fim_negociacao_especial_preco_produto_gravity";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME COLUMN "is_unlimited"  TO "ilimitado_negociacao_especial_preco_produto_gravity";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME COLUMN "created_at"    TO "data_criacao_negociacao_especial_preco_produto_gravity";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME COLUMN "updated_at"    TO "data_atualizacao_negociacao_especial_preco_produto_gravity";

-- 3. RENAME INDEXes
ALTER INDEX "negociacao_especial_produto_gravity_pkey"                            RENAME TO "negociacao_especial_preco_produto_gravity_pkey";
ALTER INDEX "negociacao_especial_produto_gravity_product_id_idx"                  RENAME TO "negociacao_especial_preco_produto_gravity_idx";
ALTER INDEX "negociacao_especial_produto_gravity_tenant_id_idx"                   RENAME TO "negociacao_especial_preco_produto_gravity_organizacao_idx";
-- Composite index dropado (redundante — Postgres faz bitmap AND com os 2 índices simples)
DROP INDEX "negociacao_especial_produto_gravity_product_id_tenant_id_idx";

-- 4. RENAME FK CONSTRAINT
ALTER TABLE "negociacao_especial_preco_produto_gravity"
  RENAME CONSTRAINT "negociacao_especial_produto_gravity_product_id_fkey"
  TO "negociacao_especial_preco_produto_gravity_fkey";

-- 5. RENAME NOT NULL CONSTRAINTs
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME CONSTRAINT "negociacao_especial_produto_gravity_id_not_null"           TO "negociacao_especial_preco_produto_gravity_id_not_null";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME CONSTRAINT "negociacao_especial_produto_gravity_product_id_not_null"   TO "negociacao_especial_preco_produto_gravity_produto_not_null";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME CONSTRAINT "negociacao_especial_produto_gravity_tenant_id_not_null"    TO "negociacao_especial_preco_produto_gravity_organizacao_not_null";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME CONSTRAINT "negociacao_especial_produto_gravity_tenant_name_not_null"  TO "negociacao_especial_preco_produto_gravity_nome_organizacao_not_null";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME CONSTRAINT "negociacao_especial_produto_gravity_agreement_not_null"    TO "negociacao_especial_preco_produto_gravity_acordo_not_null";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME CONSTRAINT "negociacao_especial_produto_gravity_is_unlimited_not_null" TO "negociacao_especial_preco_produto_gravity_ilimitado_not_null";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME CONSTRAINT "negociacao_especial_produto_gravity_created_at_not_null"   TO "negociacao_especial_preco_produto_gravity_data_criacao_not_null";
ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME CONSTRAINT "negociacao_especial_produto_gravity_updated_at_not_null"   TO "negociacao_especial_preco_produto_gravity_data_atualizacao_not_null";
