-- FASE 07 DDD / Onda 3 Pedido — rename de colunas fisicas da tabela "template_pedido_pdf"
-- Fonte: planilha_geral_gravity (20).xlsx, aba "1.ddd_campos" (Produto Gravity = Pedido)
-- Estrategia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Escopo: 8 colunas + 2 indices reconstruidos.

-- 1) Rename colunas (8)
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "id"            TO "id_template_pedido_pdf";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "tenant_id"     TO "id_organizacao";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "product_id"    TO "id_produto";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "nome"          TO "nome_template_pedido_pdf";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "descricao"     TO "descricao_template_pedido_pdf";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "conteudo_html" TO "conteudo_html_template_pedido_pdf";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "created_at"    TO "data_criacao_template_pedido_pdf";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "updated_at"    TO "data_atualizacao_template_pedido_pdf";

-- 2) Reconstruir indices com nomes auto-gerados pelo Prisma (convencao <tabela>_<col>..._idx)
DROP INDEX IF EXISTS "template_pedido_pdf_tenant_id_idx";
DROP INDEX IF EXISTS "template_pedido_pdf_tenant_id_product_id_idx";

CREATE INDEX "template_pedido_pdf_id_organizacao_idx"
    ON "template_pedido_pdf"("id_organizacao");
CREATE INDEX "template_pedido_pdf_id_organizacao_id_produto_idx"
    ON "template_pedido_pdf"("id_organizacao", "id_produto");
