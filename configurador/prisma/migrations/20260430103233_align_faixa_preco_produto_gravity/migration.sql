-- Migration: align_faixa_preco_produto_gravity
-- Alinha tabela faixa_preco_produto_gravity ao schema DDD (Configurador, Onda 25).
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

-- 1. RENAME COLUMNs
ALTER TABLE "faixa_preco_produto_gravity" RENAME COLUMN "id"          TO "id_faixa_preco_produto_gravity";
ALTER TABLE "faixa_preco_produto_gravity" RENAME COLUMN "product_id"  TO "id_produto_gravity_faixa_preco";
ALTER TABLE "faixa_preco_produto_gravity" RENAME COLUMN "range_from"  TO "faixa_de_faixa_preco_produto_gravity";
ALTER TABLE "faixa_preco_produto_gravity" RENAME COLUMN "range_to"    TO "faixa_ate_faixa_preco_produto_gravity";
ALTER TABLE "faixa_preco_produto_gravity" RENAME COLUMN "price"       TO "preco_faixa_preco_produto_gravity";
ALTER TABLE "faixa_preco_produto_gravity" RENAME COLUMN "currency"    TO "moeda_faixa_preco_produto_gravity";
ALTER TABLE "faixa_preco_produto_gravity" RENAME COLUMN "created_at"  TO "data_criacao_faixa_preco_produto_gravity";

-- 2. RENAME INDEXes
ALTER INDEX "faixa_preco_produto_gravity_product_id_idx"                RENAME TO "faixa_preco_produto_gravity_produto_id_idx";
ALTER INDEX "faixa_preco_produto_gravity_product_id_range_from_idx"     RENAME TO "faixa_preco_produto_gravity_produto_id_faixa_de_idx";

-- 3. RENAME FK CONSTRAINT
ALTER TABLE "faixa_preco_produto_gravity"
  RENAME CONSTRAINT "faixa_preco_produto_gravity_product_id_fkey"
  TO "faixa_preco_produto_gravity_produto_id_fkey";
