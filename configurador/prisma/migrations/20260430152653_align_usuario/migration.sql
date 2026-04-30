-- Migration: align_usuario
-- 4 RENAME COLUMN + 6 RENAME INDEX + 2 RENAME FK
-- Aplicada manualmente em transação em 2026-04-30 (4 rows preservadas).

-- 1. RENAME COLUMNs (4)
ALTER TABLE "usuario" RENAME COLUMN "id_organizacao_usuario" TO "id_organizacao";
ALTER TABLE "usuario" RENAME COLUMN "clerk_user_id"          TO "id_clerk_usuario";
ALTER TABLE "usuario" RENAME COLUMN "preferred_company_id"   TO "id_workspace_preferido_usuario";
ALTER TABLE "usuario" RENAME COLUMN "updated_at"             TO "data_atualizacao_usuario";

-- 2. RENAME INDEXes (6)
ALTER INDEX "usuario_clerk_user_id_key"                                 RENAME TO "usuario_id_clerk_usuario_key";
ALTER INDEX "usuario_id_organizacao_usuario_email_usuario_key"          RENAME TO "usuario_id_organizacao_email_usuario_key";
ALTER INDEX "usuario_id_organizacao_usuario_idx"                        RENAME TO "usuario_id_organizacao_idx";
ALTER INDEX "usuario_id_organizacao_usuario_data_criacao_usuario_idx"   RENAME TO "usuario_id_organizacao_data_criacao_idx";
ALTER INDEX "usuario_id_organizacao_usuario_tipo_usuario_idx"           RENAME TO "usuario_id_organizacao_tipo_usuario_idx";
ALTER INDEX "usuario_preferred_company_id_idx"                          RENAME TO "usuario_id_workspace_preferido_usuario_idx";

-- 3. RENAME FK CONSTRAINTs (2)
ALTER TABLE "usuario" RENAME CONSTRAINT "usuario_id_organizacao_usuario_fkey" TO "usuario_id_organizacao_fkey";
ALTER TABLE "usuario" RENAME CONSTRAINT "usuario_preferred_company_id_fkey"   TO "usuario_id_workspace_preferido_usuario_fkey";
