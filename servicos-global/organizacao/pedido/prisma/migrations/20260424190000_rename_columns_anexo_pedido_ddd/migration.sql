-- FASE 07 DDD / Onda 3 Pedido — rename de colunas fisicas da tabela "anexo_pedido"
-- Fonte: planilha_geral_gravity (20).xlsx, aba "1.ddd_campos" (Produto Gravity = Pedido)
-- Estrategia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Escopo: 14 colunas + 4 indices reconstruidos (nomes auto-gerados pelo Prisma).

-- 1) Rename colunas (14)
ALTER TABLE "anexo_pedido" RENAME COLUMN "id"             TO "id_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "tenant_id"      TO "id_organizacao";
ALTER TABLE "anexo_pedido" RENAME COLUMN "product_id"     TO "id_produto";
ALTER TABLE "anexo_pedido" RENAME COLUMN "vinculo"        TO "vinculo_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "vinculo_id"     TO "id_vinculo";
ALTER TABLE "anexo_pedido" RENAME COLUMN "nome_arquivo"   TO "nome_arquivo_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "tipo_arquivo"   TO "tipo_arquivo_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "tamanho_bytes"  TO "tamanho_bytes_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "descricao"      TO "descricao_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "categoria"      TO "categoria_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "storage_key"    TO "storage_key_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "uploaded_by"    TO "uploaded_by_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "created_at"     TO "data_criacao_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "tipo_documento" TO "tipo_documento_anexo_pedido";

-- 2) Reconstruir indices com nomes auto-gerados pelo Prisma (convenção <tabela>_<col>..._idx)
DROP INDEX IF EXISTS "anexo_pedido_tenant_id_idx";
DROP INDEX IF EXISTS "anexo_pedido_tenant_id_product_id_idx";
DROP INDEX IF EXISTS "anexo_pedido_tenant_id_vinculo_id_idx";
DROP INDEX IF EXISTS "anexo_pedido_tenant_id_tipo_documento_idx";

CREATE INDEX "anexo_pedido_id_organizacao_idx"
    ON "anexo_pedido"("id_organizacao");
CREATE INDEX "anexo_pedido_id_organizacao_id_produto_idx"
    ON "anexo_pedido"("id_organizacao", "id_produto");
CREATE INDEX "anexo_pedido_id_organizacao_id_vinculo_idx"
    ON "anexo_pedido"("id_organizacao", "id_vinculo");
CREATE INDEX "anexo_pedido_id_organizacao_tipo_documento_anexo_pedido_idx"
    ON "anexo_pedido"("id_organizacao", "tipo_documento_anexo_pedido");
