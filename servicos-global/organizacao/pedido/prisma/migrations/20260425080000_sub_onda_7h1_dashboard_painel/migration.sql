-- Sub-onda 7h.1 — DashboardPainel → PedidoDashboardPainel (model rename + 9 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("dashboard_painel") permanece (preserva dados).
-- Model Prisma renomeado de DashboardPainel para PedidoDashboardPainel
-- (afeta apenas o nome do client Prisma — db.dashboardPainel → db.pedidoDashboardPainel).

ALTER TABLE "dashboard_painel" RENAME COLUMN "id"           TO "id_dashboard_painel";
ALTER TABLE "dashboard_painel" RENAME COLUMN "tenant_id"    TO "id_organizacao";
ALTER TABLE "dashboard_painel" RENAME COLUMN "user_id"      TO "id_usuario";
ALTER TABLE "dashboard_painel" RENAME COLUMN "nome"         TO "nome_dashboard_painel";
ALTER TABLE "dashboard_painel" RENAME COLUMN "ordem"        TO "ordem_dashboard_painel";
ALTER TABLE "dashboard_painel" RENAME COLUMN "is_visivel"   TO "is_visivel_dashboard_painel";
ALTER TABLE "dashboard_painel" RENAME COLUMN "widgets_json" TO "widgets_json_dashboard_painel";
ALTER TABLE "dashboard_painel" RENAME COLUMN "created_at"   TO "data_criacao_dashboard_painel";
ALTER TABLE "dashboard_painel" RENAME COLUMN "updated_at"   TO "data_atualizacao_dashboard_painel";

-- Renomear índices para refletir nova nomenclatura
ALTER INDEX "dashboard_painel_tenant_id_idx"             RENAME TO "dashboard_painel_id_organizacao_idx";
ALTER INDEX "dashboard_painel_tenant_id_user_id_idx"     RENAME TO "dashboard_painel_id_organizacao_id_usuario_idx";
