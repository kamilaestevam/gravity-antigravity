-- Migration: align_fornecedor_organizacao
-- Alinha tabela fornecedor_organizacao ao schema DDD.
-- NOTA: clerk_user_id renomeado para id_clerk_usuario por decisão explícita
-- do dono — viola REGRA 4 (IDs externos ficam em inglês), mas adotado por
-- consistência PT-BR.

-- 1. RENAME COLUMNs
ALTER TABLE "fornecedor_organizacao" RENAME COLUMN "id"            TO "id_fornecedor_organizacao";
ALTER TABLE "fornecedor_organizacao" RENAME COLUMN "clerk_user_id" TO "id_clerk_usuario";
ALTER TABLE "fornecedor_organizacao" RENAME COLUMN "tenant_id"     TO "id_organizacao_fornecedor_organizacao";
ALTER TABLE "fornecedor_organizacao" RENAME COLUMN "status"        TO "status_fornecedor_organizacao";
ALTER TABLE "fornecedor_organizacao" RENAME COLUMN "created_at"    TO "data_criacao_fornecedor_organizacao";
ALTER TABLE "fornecedor_organizacao" RENAME COLUMN "updated_at"    TO "data_atualizacao_fornecedor_organizacao";

-- 2. RENAME INDEXes
ALTER INDEX "fornecedor_organizacao_clerk_user_id_tenant_id_key"     RENAME TO "fornecedor_organizacao_clerk_usuario_id_organizacao_id_key";
ALTER INDEX "fornecedor_organizacao_tenant_id_idx"                   RENAME TO "fornecedor_organizacao_id_idx";
ALTER INDEX "fornecedor_organizacao_clerk_user_id_idx"               RENAME TO "fornecedor_organizacao_clerk_usuario_id_idx";
ALTER INDEX "fornecedor_organizacao_tenant_id_clerk_user_id_idx"     RENAME TO "fornecedor_organizacao_id_clerk_usuario_id_idx";
