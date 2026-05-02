-- FASE 07 DDD / Onda 3 Pedido — rename de colunas fisicas da tabela "valor_coluna_usuario_pedido"
-- (model Prisma: ValorColunaUsuarioPedido)
-- Fonte: planilha_geral_gravity (20).xlsx, aba "1.ddd_campos" (Produto Gravity = Pedido)
-- Estrategia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Escopo: 7 colunas fisicas + 4 indices reconstruidos (3 regulares + 1 unique composto 3-cols) + 1 FK constraint renomeada.
-- Relacao Prisma `coluna` → `coluna_valor_coluna_usuario_pedido` e somente no schema.prisma; sem impacto em DDL.

-- 1) Rename colunas (7 fisicas)
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "id"         TO "id_valor_coluna_usuario_pedido";
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "tenant_id"  TO "id_organizacao";
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "product_id" TO "id_produto";
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "coluna_id"  TO "id_coluna";
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "vinculo"    TO "vinculo_valor_coluna_usuario_pedido";
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "vinculo_id" TO "id_vinculo";
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "valor"      TO "valor_valor_coluna_usuario_pedido";

-- 2) Reconstruir indices (3 regulares + 1 unique composto 3-cols)
DROP INDEX IF EXISTS "valor_coluna_usuario_pedido_tenant_id_idx";
DROP INDEX IF EXISTS "valor_coluna_usuario_pedido_tenant_id_product_id_idx";
DROP INDEX IF EXISTS "valor_coluna_usuario_pedido_tenant_id_vinculo_id_idx";
DROP INDEX IF EXISTS "valor_coluna_usuario_pedido_tenant_id_coluna_id_vinculo_id_key";

CREATE INDEX "valor_coluna_usuario_pedido_id_organizacao_idx"
    ON "valor_coluna_usuario_pedido"("id_organizacao");
CREATE INDEX "valor_coluna_usuario_pedido_id_organizacao_id_produto_idx"
    ON "valor_coluna_usuario_pedido"("id_organizacao", "id_produto");
CREATE INDEX "valor_coluna_usuario_pedido_id_organizacao_id_vinculo_idx"
    ON "valor_coluna_usuario_pedido"("id_organizacao", "id_vinculo");
CREATE UNIQUE INDEX "valor_coluna_usuario_pedido_id_organizacao_id_coluna_id_vinculo_key"
    ON "valor_coluna_usuario_pedido"("id_organizacao", "id_coluna", "id_vinculo");

-- 3) Renomear FK constraint para alinhar com convencao Prisma "<tabela>_<coluna>_fkey"
ALTER TABLE "valor_coluna_usuario_pedido"
    RENAME CONSTRAINT "valor_coluna_usuario_pedido_coluna_id_fkey"
    TO "valor_coluna_usuario_pedido_id_coluna_fkey";
