-- Migration: align_usuario_permissao
-- 9 RENAME COLUMN + 4 RENAME INDEX + 2 RENAME FK
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

-- 1. RENAME COLUMNs
ALTER TABLE "usuario_permissao" RENAME COLUMN "id"          TO "id_usuario_permissao";
ALTER TABLE "usuario_permissao" RENAME COLUMN "tenant_id"   TO "id_organizacao";
ALTER TABLE "usuario_permissao" RENAME COLUMN "company_id"  TO "id_workspace";
ALTER TABLE "usuario_permissao" RENAME COLUMN "user_id"     TO "id_usuario";
ALTER TABLE "usuario_permissao" RENAME COLUMN "product_id"  TO "id_produto_gravity";
ALTER TABLE "usuario_permissao" RENAME COLUMN "permission"  TO "permissao_usuario";
ALTER TABLE "usuario_permissao" RENAME COLUMN "granted_by"  TO "permissao_usuario_concedido_por";
ALTER TABLE "usuario_permissao" RENAME COLUMN "created_at"  TO "data_criacao_permissao_usuario";
ALTER TABLE "usuario_permissao" RENAME COLUMN "updated_at"  TO "data_atualizacao_permissao_usuario";

-- 2. RENAME INDEXes
ALTER INDEX "usuario_permissao_tenant_id_idx"                          RENAME TO "usuario_permissao_id_organizacao_idx";
ALTER INDEX "usuario_permissao_tenant_id_user_id_idx"                  RENAME TO "usuario_permissao_id_organizacao_usuario_idx";
ALTER INDEX "usuario_permissao_tenant_id_company_id_user_id_idx"       RENAME TO "usuario_permissao_id_organizacao_workspace_usuario_idx";
ALTER INDEX "usuario_permissao_tenant_id_company_id_user_id_product_id_p_key" RENAME TO "usuario_permissao_org_ws_usu_prod_perm_unq";

-- 3. RENAME FK CONSTRAINTs
ALTER TABLE "usuario_permissao" RENAME CONSTRAINT "usuario_permissao_tenant_id_fkey"  TO "usuario_permissao_id_organizacao_fkey";
ALTER TABLE "usuario_permissao" RENAME CONSTRAINT "usuario_permissao_user_id_fkey"    TO "usuario_permissao_id_usuario_fkey";
