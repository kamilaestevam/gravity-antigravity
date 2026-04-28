-- Sub-onda 7l.2 — TrackingItemsTransferidos restantes (4 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("tracking_items_transferidos") permanece (preserva dados).

ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "revertido_por"          TO "revertido_por_tracking_items_transferidos";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "created_at"             TO "data_criacao_tracking_items_transferidos";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "created_by"             TO "criado_por_tracking_items_transferidos";
ALTER TABLE "tracking_items_transferidos" RENAME COLUMN "data_transferencia_qtd" TO "data_transferencia_quantidade_tracking_items_transferidos";
