-- Migration: align_workspace_add_contato
-- 8 RENAME COLUMN + 5 ADD COLUMN + 4 RENAME INDEX + 1 RENAME FK
-- Aplicada manualmente em transação em 2026-04-30 (5 rows preservadas).

-- 1. RENAME COLUMNs (8)
ALTER TABLE "workspace" RENAME COLUMN "id"          TO "id_workspace";
ALTER TABLE "workspace" RENAME COLUMN "tenant_id"   TO "id_organizacao";
ALTER TABLE "workspace" RENAME COLUMN "name"        TO "nome_workspace";
ALTER TABLE "workspace" RENAME COLUMN "subdomain"   TO "subdominio_workspace";
ALTER TABLE "workspace" RENAME COLUMN "cnpj"        TO "cnpj_workspace";
ALTER TABLE "workspace" RENAME COLUMN "status"      TO "status_workspace";
ALTER TABLE "workspace" RENAME COLUMN "created_at"  TO "data_criacao_workspace";
ALTER TABLE "workspace" RENAME COLUMN "updated_at"  TO "data_atualizacao_workspace";

-- 2. ADD COLUMNs (5 NULLABLE — endereço/contato)
ALTER TABLE "workspace" ADD COLUMN "cidade_workspace"            TEXT;
ALTER TABLE "workspace" ADD COLUMN "estado_workspace"            TEXT;
ALTER TABLE "workspace" ADD COLUMN "endereco_workspace"          TEXT;
ALTER TABLE "workspace" ADD COLUMN "email_contato_workspace"     TEXT;
ALTER TABLE "workspace" ADD COLUMN "telefone_contato_workspace"  TEXT;

-- 3. RENAME INDEXes (4)
ALTER INDEX "workspace_subdomain_key"               RENAME TO "workspace_subdominio_key";
ALTER INDEX "workspace_tenant_id_idx"               RENAME TO "workspace_id_organizacao_idx";
ALTER INDEX "workspace_tenant_id_status_idx"        RENAME TO "workspace_id_organizacao_status_idx";
ALTER INDEX "workspace_tenant_id_created_at_idx"    RENAME TO "workspace_id_organizacao_data_criacao_idx";

-- 4. RENAME FK CONSTRAINT (1)
ALTER TABLE "workspace" RENAME CONSTRAINT "workspace_tenant_id_fkey" TO "workspace_id_organizacao_fkey";
