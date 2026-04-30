-- Migration: align_usuario_workspace
-- 8 RENAME COLUMN + 4 RENAME INDEX + 2 RENAME FK
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

-- 1. RENAME COLUMNs
ALTER TABLE "usuario_workspace" RENAME COLUMN "id"          TO "id_usuario_workspace";
ALTER TABLE "usuario_workspace" RENAME COLUMN "tenant_id"   TO "id_organizacao";
ALTER TABLE "usuario_workspace" RENAME COLUMN "user_id"     TO "id_usuario";
ALTER TABLE "usuario_workspace" RENAME COLUMN "company_id"  TO "id_workspace";
ALTER TABLE "usuario_workspace" RENAME COLUMN "role"        TO "tipo_usuario_workspace";
ALTER TABLE "usuario_workspace" RENAME COLUMN "is_active"   TO "ativo_usuario_workspace";
ALTER TABLE "usuario_workspace" RENAME COLUMN "created_at"  TO "data_criacao_usuario_workspace";
ALTER TABLE "usuario_workspace" RENAME COLUMN "updated_at"  TO "data_atualizacao_usuario_workspace";

-- 2. RENAME INDEXes
ALTER INDEX "usuario_workspace_tenant_id_user_id_company_id_key" RENAME TO "usuario_workspace_id_organizacao_id_usuario_id_workspace_key";
ALTER INDEX "usuario_workspace_tenant_id_idx"                    RENAME TO "usuario_workspace_id_organizacao_idx";
ALTER INDEX "usuario_workspace_tenant_id_user_id_idx"            RENAME TO "usuario_workspace_id_organizacao_id_usuario_idx";
ALTER INDEX "usuario_workspace_tenant_id_company_id_idx"         RENAME TO "usuario_workspace_id_organizacao_id_workspace_idx";

-- 3. RENAME FK CONSTRAINTs
ALTER TABLE "usuario_workspace" RENAME CONSTRAINT "usuario_workspace_user_id_fkey"     TO "usuario_workspace_id_usuario_fkey";
ALTER TABLE "usuario_workspace" RENAME CONSTRAINT "usuario_workspace_company_id_fkey"  TO "usuario_workspace_id_workspace_fkey";
