-- Migration: align_dashboard_painel_modelo
-- Renomeia 2 tabelas + 15 RENAME COLUMN + 7 RENAME INDEX para nomes mais claros e DDD-aligned.
-- Aplicada manualmente em transacao em 2026-04-30 (todas as tabelas vazias, 0 rows).
--
-- Contexto:
-- Os nomes antigos eram confusos:
--  - "dashboard_painel" (singular) → na verdade tem N por usuario
--  - "dashboard_preferencias" → na verdade eh template padrao definido pelo admin do produto
--
-- Renome para nomes que comunicam o proposito real:
--  - dashboard_painel        → dashboard_painel_usuario (paineis pessoais por usuario)
--  - dashboard_preferencias  → dashboard_modelo_produto (template padrao por produto)
--
-- Tambem aproveitado para:
--  - Remover prefixo "is_" da coluna boolean (regra DDD: "visivel" em vez de "is_visivel")
--  - Renomear product_id para id_produto_gravity (consistencia DDD)
--
-- Bug colateral corrigido no codigo TS:
--  - Rota dashboard-pedido-widgets.ts referenciava db.dashboardConfig (model inexistente).
--    Agora aponta para db.dashboardModeloProduto + adiciona scoping por id_organizacao
--    (estava sem tenant scope — security bug silencioso).
--
-- Tabelas duplicadas em gravity-servicos-teste.public.* foram DROPadas.

-- 1. RENAME TABLES (2)
ALTER TABLE "dashboard_painel"        RENAME TO "dashboard_painel_usuario";
ALTER TABLE "dashboard_preferencias"  RENAME TO "dashboard_modelo_produto";

-- 2. RENAME COLUMNs em dashboard_painel_usuario (9)
ALTER TABLE "dashboard_painel_usuario" RENAME COLUMN "id"           TO "id_dashboard_painel_usuario";
ALTER TABLE "dashboard_painel_usuario" RENAME COLUMN "tenant_id"    TO "id_organizacao";
ALTER TABLE "dashboard_painel_usuario" RENAME COLUMN "user_id"      TO "id_usuario";
ALTER TABLE "dashboard_painel_usuario" RENAME COLUMN "nome"         TO "nome_dashboard_painel_usuario";
ALTER TABLE "dashboard_painel_usuario" RENAME COLUMN "ordem"        TO "ordem_dashboard_painel_usuario";
ALTER TABLE "dashboard_painel_usuario" RENAME COLUMN "is_visivel"   TO "visivel_dashboard_painel_usuario";
ALTER TABLE "dashboard_painel_usuario" RENAME COLUMN "widgets_json" TO "widgets_json_dashboard_painel_usuario";
ALTER TABLE "dashboard_painel_usuario" RENAME COLUMN "created_at"   TO "data_criacao_dashboard_painel_usuario";
ALTER TABLE "dashboard_painel_usuario" RENAME COLUMN "updated_at"   TO "data_atualizacao_dashboard_painel_usuario";

-- 3. RENAME COLUMNs em dashboard_modelo_produto (6)
ALTER TABLE "dashboard_modelo_produto" RENAME COLUMN "id"           TO "id_dashboard_modelo_produto";
ALTER TABLE "dashboard_modelo_produto" RENAME COLUMN "tenant_id"    TO "id_organizacao";
ALTER TABLE "dashboard_modelo_produto" RENAME COLUMN "product_id"   TO "id_produto_gravity";
ALTER TABLE "dashboard_modelo_produto" RENAME COLUMN "widgets_json" TO "widgets_json_dashboard_modelo_produto";
ALTER TABLE "dashboard_modelo_produto" RENAME COLUMN "created_at"   TO "data_criacao_dashboard_modelo_produto";
ALTER TABLE "dashboard_modelo_produto" RENAME COLUMN "updated_at"   TO "data_atualizacao_dashboard_modelo_produto";

-- 4. RENAME INDEXes (7)
ALTER INDEX "dashboard_painel_pkey"                  RENAME TO "dashboard_painel_usuario_pkey";
ALTER INDEX "dashboard_painel_tenant_id_idx"         RENAME TO "dashboard_painel_usuario_id_organizacao_idx";
ALTER INDEX "dashboard_painel_tenant_id_user_id_idx" RENAME TO "dashboard_painel_usuario_id_organizacao_id_usuario_idx";
ALTER INDEX "dashboard_preferencias_pkey"                     RENAME TO "dashboard_modelo_produto_pkey";
ALTER INDEX "dashboard_preferencias_tenant_id_idx"            RENAME TO "dashboard_modelo_produto_id_organizacao_idx";
ALTER INDEX "dashboard_preferencias_tenant_id_product_id_idx" RENAME TO "dashboard_modelo_produto_id_organizacao_id_produto_gravity_idx";
ALTER INDEX "dashboard_preferencias_tenant_id_product_id_key" RENAME TO "dashboard_modelo_produto_id_organizacao_id_produto_gravity_key";
