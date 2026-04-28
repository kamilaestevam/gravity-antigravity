-- Sub-onda 7g.2 — PedidoPreferenciaPadrao (6 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("preferencia_padrao_pedido") permanece (preserva dados).

ALTER TABLE "preferencia_padrao_pedido" RENAME COLUMN "id"               TO "id_pedido_preferencia_padrao";
ALTER TABLE "preferencia_padrao_pedido" RENAME COLUMN "tenant_id"        TO "id_organizacao";
ALTER TABLE "preferencia_padrao_pedido" RENAME COLUMN "company_id"       TO "id_workspace";
ALTER TABLE "preferencia_padrao_pedido" RENAME COLUMN "colunas_visiveis" TO "colunas_visiveis_pedido_preferencia_padrao";
ALTER TABLE "preferencia_padrao_pedido" RENAME COLUMN "colunas_largura"  TO "colunas_largura_pedido_preferencia_padrao";
ALTER TABLE "preferencia_padrao_pedido" RENAME COLUMN "updated_at"       TO "data_atualizacao_pedido_preferencia_padrao";

-- Renomear índices/constraints para refletir nova nomenclatura
ALTER INDEX "preferencia_padrao_pedido_tenant_id_idx"  RENAME TO "preferencia_padrao_pedido_id_organizacao_idx";
ALTER INDEX "preferencia_padrao_pedido_tenant_id_key"  RENAME TO "preferencia_padrao_pedido_id_organizacao_key";
