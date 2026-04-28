-- FASE 07 DDD / Onda 3 Pedido — rename de colunas fisicas da tabela "pedido_saldo_formula"
-- Fonte: planilha_geral_gravity (20).xlsx, aba "1.ddd_campos" (Produto Gravity = Pedido)
-- Estrategia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Escopo: 6 colunas + 3 indices reconstruidos (2 regulares + 1 unique).

-- 1) Rename colunas (6)
ALTER TABLE "pedido_saldo_formula" RENAME COLUMN "id"                TO "id_pedido_saldo_formula";
ALTER TABLE "pedido_saldo_formula" RENAME COLUMN "tenant_id"         TO "id_organizacao";
ALTER TABLE "pedido_saldo_formula" RENAME COLUMN "product_id"        TO "id_produto";
ALTER TABLE "pedido_saldo_formula" RENAME COLUMN "formula_expressao" TO "formula_expressao_pedido_saldo_formula";
ALTER TABLE "pedido_saldo_formula" RENAME COLUMN "created_at"        TO "data_criacao_pedido_saldo_formula";
ALTER TABLE "pedido_saldo_formula" RENAME COLUMN "updated_at"        TO "data_atualizacao_pedido_saldo_formula";

-- 2) Reconstruir indices (2 regulares + 1 unique) com nomes auto-gerados pelo Prisma
DROP INDEX IF EXISTS "pedido_saldo_formula_tenant_id_key";
DROP INDEX IF EXISTS "pedido_saldo_formula_tenant_id_idx";
DROP INDEX IF EXISTS "pedido_saldo_formula_tenant_id_product_id_idx";

CREATE UNIQUE INDEX "pedido_saldo_formula_id_organizacao_key"
    ON "pedido_saldo_formula"("id_organizacao");
CREATE INDEX "pedido_saldo_formula_id_organizacao_idx"
    ON "pedido_saldo_formula"("id_organizacao");
CREATE INDEX "pedido_saldo_formula_id_organizacao_id_produto_idx"
    ON "pedido_saldo_formula"("id_organizacao", "id_produto");
