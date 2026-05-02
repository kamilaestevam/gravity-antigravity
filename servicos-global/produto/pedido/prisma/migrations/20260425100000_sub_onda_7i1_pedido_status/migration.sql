-- Sub-onda 7i.1 — PedidoStatus (10 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("status_pedido") permanece (preserva dados).
-- Timestamps (created_at/updated_at) serão tratados em sub-onda 7i.2.

ALTER TABLE "status_pedido" RENAME COLUMN "id"           TO "id_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "tenant_id"    TO "id_organizacao";
ALTER TABLE "status_pedido" RENAME COLUMN "company_id"   TO "id_workspace";
ALTER TABLE "status_pedido" RENAME COLUMN "nome"         TO "nome_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "rotulo"       TO "rotulo_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "cor"          TO "cor_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "icone"        TO "icone_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "ordem"        TO "ordem_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "is_padrao"    TO "padrao_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "is_sistema"   TO "gerenciado_sistema_pedido_status";

-- Renomear índices/constraints para refletir nova nomenclatura
ALTER INDEX "status_pedido_tenant_id_idx"                  RENAME TO "status_pedido_id_organizacao_idx";
ALTER INDEX "status_pedido_tenant_id_company_id_idx"       RENAME TO "status_pedido_id_organizacao_id_workspace_idx";
ALTER INDEX "status_pedido_tenant_id_nome_key"             RENAME TO "status_pedido_id_organizacao_nome_pedido_status_key";
