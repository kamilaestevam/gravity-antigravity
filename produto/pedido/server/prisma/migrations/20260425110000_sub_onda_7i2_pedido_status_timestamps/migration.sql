-- Sub-onda 7i.2 — PedidoStatus timestamps (2 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("status_pedido") permanece (preserva dados).

ALTER TABLE "status_pedido" RENAME COLUMN "created_at" TO "data_criacao_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "updated_at" TO "data_atualizacao_pedido_status";
