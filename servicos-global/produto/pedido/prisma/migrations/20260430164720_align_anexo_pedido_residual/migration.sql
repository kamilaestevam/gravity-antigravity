-- Migration: align_anexo_pedido_residual
-- Aplicação dos renames residuais de anexo_pedido + ADD tipo_documento.
-- Tabelas anteriores cuidaram de outras colunas, mas restavam estas em inglês legado.
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

-- 1. RENAME COLUMNs (13)
ALTER TABLE "anexo_pedido" RENAME COLUMN "id"             TO "id_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "tenant_id"      TO "id_organizacao";
ALTER TABLE "anexo_pedido" RENAME COLUMN "product_id"     TO "id_produto_gravity";
ALTER TABLE "anexo_pedido" RENAME COLUMN "vinculo"        TO "vinculo_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "vinculo_id"     TO "id_vinculo_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "nome_arquivo"   TO "nome_arquivo_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "tipo_arquivo"   TO "tipo_arquivo_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "tamanho_bytes"  TO "tamanho_bytes_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "descricao"      TO "descricao_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "categoria"      TO "categoria_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "storage_key"    TO "chave_storage_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "uploaded_by"    TO "enviado_por_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "created_at"     TO "data_criacao_anexo_pedido";

-- 2. ADD COLUMN tipo_documento_anexo_pedido (NULLABLE)
ALTER TABLE "anexo_pedido" ADD COLUMN "tipo_documento_anexo_pedido" TEXT;

-- 3. RENAME INDEXes (3)
ALTER INDEX "anexo_pedido_tenant_id_idx"                RENAME TO "anexo_pedido_id_organizacao_idx";
ALTER INDEX "anexo_pedido_tenant_id_product_id_idx"     RENAME TO "anexo_pedido_id_organizacao_id_produto_gravity_idx";
ALTER INDEX "anexo_pedido_tenant_id_vinculo_id_idx"     RENAME TO "anexo_pedido_id_organizacao_id_vinculo_idx";

-- 4. CREATE INDEX (novo)
CREATE INDEX "anexo_pedido_id_organizacao_tipo_documento_idx" ON "anexo_pedido" ("id_organizacao", "tipo_documento_anexo_pedido");
