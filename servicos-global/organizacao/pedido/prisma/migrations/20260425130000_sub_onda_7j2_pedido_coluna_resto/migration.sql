-- Sub-onda 7j.2 — PedidoColuna restantes (4 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("pedido_colunas") permanece (preserva dados).

ALTER TABLE "pedido_colunas" RENAME COLUMN "exibida_padrao" TO "exibida_padrao_pedido_coluna";
ALTER TABLE "pedido_colunas" RENAME COLUMN "index_criado"   TO "index_criado_pedido_coluna";
ALTER TABLE "pedido_colunas" RENAME COLUMN "created_at"     TO "data_criacao_pedido_coluna";
ALTER TABLE "pedido_colunas" RENAME COLUMN "updated_at"     TO "data_atualizacao_pedido_coluna";
