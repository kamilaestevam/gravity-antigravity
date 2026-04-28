-- Sub-onda 7j.1 — PedidoColuna (10 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("pedido_colunas") permanece (preserva dados).
-- Restantes 4 cols (exibida_padrao, index_criado, created_at, updated_at) em 7j.2.

ALTER TABLE "pedido_colunas" RENAME COLUMN "id"             TO "id_pedido_coluna";
ALTER TABLE "pedido_colunas" RENAME COLUMN "tenant_id"      TO "id_organizacao";
ALTER TABLE "pedido_colunas" RENAME COLUMN "company_id"     TO "id_workspace";
ALTER TABLE "pedido_colunas" RENAME COLUMN "nome"           TO "nome_pedido_coluna";
ALTER TABLE "pedido_colunas" RENAME COLUMN "rotulo"         TO "rotulo_pedido_coluna";
ALTER TABLE "pedido_colunas" RENAME COLUMN "tipo"           TO "tipo_pedido_coluna";
ALTER TABLE "pedido_colunas" RENAME COLUMN "casas_decimais" TO "casas_decimais_pedido_coluna";
ALTER TABLE "pedido_colunas" RENAME COLUMN "opcoes"         TO "opcoes_pedido_coluna";
ALTER TABLE "pedido_colunas" RENAME COLUMN "ordem"          TO "ordem_pedido_coluna";
ALTER TABLE "pedido_colunas" RENAME COLUMN "filtravel"      TO "filtravel_pedido_coluna";

-- Renomear índices/constraints para refletir nova nomenclatura
ALTER INDEX "pedido_colunas_tenant_id_idx"                  RENAME TO "pedido_colunas_id_organizacao_idx";
ALTER INDEX "pedido_colunas_tenant_id_company_id_idx"       RENAME TO "pedido_colunas_id_organizacao_id_workspace_idx";
ALTER INDEX "pedido_colunas_tenant_id_nome_key"             RENAME TO "pedido_colunas_id_organizacao_nome_pedido_coluna_key";
