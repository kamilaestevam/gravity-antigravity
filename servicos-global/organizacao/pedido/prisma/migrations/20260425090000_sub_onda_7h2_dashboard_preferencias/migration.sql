-- Sub-onda 7h.2 — DashboardPreferencias → PedidoDashboardPreferencias (model rename + 6 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("dashboard_preferencias") permanece (preserva dados).
-- Model Prisma renomeado de DashboardPreferencias para PedidoDashboardPreferencias
-- (afeta apenas o nome do client Prisma).

ALTER TABLE "dashboard_preferencias" RENAME COLUMN "id"           TO "id_dashboard_preferencias";
ALTER TABLE "dashboard_preferencias" RENAME COLUMN "tenant_id"    TO "id_organizacao";
ALTER TABLE "dashboard_preferencias" RENAME COLUMN "product_id"   TO "chave_produto_gravity_dashboard_preferencias";
ALTER TABLE "dashboard_preferencias" RENAME COLUMN "widgets_json" TO "widgets_json_dashboard_preferencias";
ALTER TABLE "dashboard_preferencias" RENAME COLUMN "created_at"   TO "data_criacao_dashboard_preferencias";
ALTER TABLE "dashboard_preferencias" RENAME COLUMN "updated_at"   TO "data_atualizacao_dashboard_preferencias";

-- Renomear índices/constraints para refletir nova nomenclatura
ALTER INDEX "dashboard_preferencias_tenant_id_idx"                RENAME TO "dashboard_preferencias_id_organizacao_idx";
ALTER INDEX "dashboard_preferencias_tenant_id_product_id_idx"     RENAME TO "dashboard_preferencias_id_organizacao_chave_produto_idx";
ALTER INDEX "dashboard_preferencias_tenant_id_product_id_key"     RENAME TO "dashboard_preferencias_id_organizacao_chave_produto_key";
