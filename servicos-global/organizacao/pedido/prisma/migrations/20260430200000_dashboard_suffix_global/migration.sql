-- Migration: dashboard_suffix_global
-- Adiciona o sufixo "_global" nos 2 dashboards para deixar explicito que sao
-- tabelas poliformes (servem qualquer produto Gravity) e nao especificas do Pedido.
-- Aplicada manualmente em transacao em 2026-04-30 (todas as tabelas vazias, 0 rows).
--
-- Renames:
--   dashboard_modelo_produto       → dashboard_modelo_global       (template do admin por produto)
--   dashboard_painel_usuario       → dashboard_painel_usuario_global (paineis pessoais do usuario)
--
-- Razao do "global":
-- - dashboard_modelo_*: ja tinha id_produto_gravity → poliforme cross-produto. "produto" no
--   sufixo era redundante e confuso (pareciam ter rel direta).
-- - dashboard_painel_usuario_*: nao tem id_produto_gravity hoje → product-agnostic
--   (um usuario com paineis serve qualquer produto). Marcacao "_global" deixa explicito.
--
-- Codigo TS atualizado nas duas rotas (dashboard-pedido-widgets.ts e
-- dashboard-pedido-paineis.ts) — frontend intocado (ACL preserva contrato JSON).

-- 1. dashboard_modelo_produto → dashboard_modelo_global
ALTER TABLE "dashboard_modelo_produto" RENAME TO "dashboard_modelo_global";
ALTER TABLE "dashboard_modelo_global" RENAME COLUMN "id_dashboard_modelo_produto"               TO "id_dashboard_modelo_global";
ALTER TABLE "dashboard_modelo_global" RENAME COLUMN "widgets_json_dashboard_modelo_produto"     TO "widgets_json_dashboard_modelo_global";
ALTER TABLE "dashboard_modelo_global" RENAME COLUMN "data_criacao_dashboard_modelo_produto"     TO "data_criacao_dashboard_modelo_global";
ALTER TABLE "dashboard_modelo_global" RENAME COLUMN "data_atualizacao_dashboard_modelo_produto" TO "data_atualizacao_dashboard_modelo_global";
ALTER INDEX "dashboard_modelo_produto_pkey"                                  RENAME TO "dashboard_modelo_global_pkey";
ALTER INDEX "dashboard_modelo_produto_id_organizacao_idx"                    RENAME TO "dashboard_modelo_global_id_organizacao_idx";
ALTER INDEX "dashboard_modelo_produto_id_organizacao_id_produto_gravity_idx" RENAME TO "dashboard_modelo_global_id_organizacao_id_produto_gravity_idx";
ALTER INDEX "dashboard_modelo_produto_id_organizacao_id_produto_gravity_key" RENAME TO "dashboard_modelo_global_id_organizacao_id_produto_gravity_key";

-- 2. dashboard_painel_usuario → dashboard_painel_usuario_global
ALTER TABLE "dashboard_painel_usuario" RENAME TO "dashboard_painel_usuario_global";
ALTER TABLE "dashboard_painel_usuario_global" RENAME COLUMN "id_dashboard_painel_usuario"               TO "id_dashboard_painel_usuario_global";
ALTER TABLE "dashboard_painel_usuario_global" RENAME COLUMN "nome_dashboard_painel_usuario"             TO "nome_dashboard_painel_usuario_global";
ALTER TABLE "dashboard_painel_usuario_global" RENAME COLUMN "ordem_dashboard_painel_usuario"            TO "ordem_dashboard_painel_usuario_global";
ALTER TABLE "dashboard_painel_usuario_global" RENAME COLUMN "visivel_dashboard_painel_usuario"          TO "visivel_dashboard_painel_usuario_global";
ALTER TABLE "dashboard_painel_usuario_global" RENAME COLUMN "widgets_json_dashboard_painel_usuario"     TO "widgets_json_dashboard_painel_usuario_global";
ALTER TABLE "dashboard_painel_usuario_global" RENAME COLUMN "data_criacao_dashboard_painel_usuario"     TO "data_criacao_dashboard_painel_usuario_global";
ALTER TABLE "dashboard_painel_usuario_global" RENAME COLUMN "data_atualizacao_dashboard_painel_usuario" TO "data_atualizacao_dashboard_painel_usuario_global";
ALTER INDEX "dashboard_painel_usuario_pkey"                          RENAME TO "dashboard_painel_usuario_global_pkey";
ALTER INDEX "dashboard_painel_usuario_id_organizacao_idx"            RENAME TO "dashboard_painel_usuario_global_id_organizacao_idx";
ALTER INDEX "dashboard_painel_usuario_id_organizacao_id_usuario_idx" RENAME TO "dashboard_painel_usuario_global_id_organizacao_id_usuario_idx";
