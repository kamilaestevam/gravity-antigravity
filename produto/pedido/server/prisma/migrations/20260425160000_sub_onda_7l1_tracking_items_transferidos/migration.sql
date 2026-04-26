-- Sub-onda 7l.1 — TrackingItemsTransferidos (10 col renames + 3 index renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("tracking_items_transferidos") permanece (preserva dados).
-- Restantes 4 cols (revertido_por/created_at/created_by/data_transferencia_qtd) em 7l.2.

ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "id"                          TO "id_tracking_items_transferidos";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "tenant_id"                   TO "id_organizacao";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "product_id"                  TO "id_produto_gravity";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "pedido_origem_id"            TO "id_pedido_origem";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "item_origem_id"              TO "id_item_origem";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "cenario"                     TO "cenario_tracking_items_transferidos";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "quantidade_item_transferida" TO "quantidade_item_transferido_tracking";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "destinos_json"               TO "destinos_items_transferidos";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "revertido"                   TO "revertido_tracking_items_transferidos";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "revertido_em"                TO "revertido_em_tracking_items_transferidos";

-- Renomear índices para refletir nova nomenclatura
ALTER INDEX "tracking_items_transferidos_tenant_id_idx"                       RENAME TO "tracking_items_transferidos_id_organizacao_idx";
ALTER INDEX "tracking_items_transferidos_tenant_id_product_id_idx"            RENAME TO "tracking_items_transferidos_id_organizacao_id_produto_gravity_idx";
ALTER INDEX "tracking_items_transferidos_tenant_id_pedido_origem_id_idx"      RENAME TO "tracking_items_transferidos_id_organizacao_id_pedido_origem_idx";
