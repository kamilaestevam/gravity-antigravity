-- Sub-onda 7e — PedidoTemplate (model rename TemplatePedidoPdf → PedidoTemplate + 7 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("template_pedido_pdf") permanece (preserva dados).

ALTER TABLE "template_pedido_pdf" RENAME COLUMN "id_template_pedido_pdf"               TO "id_template_pedido";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "id_produto"                           TO "id_produto_gravity";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "nome_template_pedido_pdf"             TO "nome_template_pedido";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "descricao_template_pedido_pdf"        TO "descricao_template_pedido";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "conteudo_html_template_pedido_pdf"    TO "conteudo_html_template_pedido";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "data_criacao_template_pedido_pdf"     TO "data_criacao_template_pedido";
ALTER TABLE "template_pedido_pdf" RENAME COLUMN "data_atualizacao_template_pedido_pdf" TO "data_atualizacao_template_pedido";
