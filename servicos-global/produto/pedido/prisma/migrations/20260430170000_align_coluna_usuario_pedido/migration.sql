-- Migration: align_coluna_usuario_pedido
-- 18 RENAME COLUMN + 4 RENAME INDEX
-- Aplicada manualmente em transacao em 2026-04-30 (tabela vazia).
-- Tabelas duplicadas em gravity-servicos-teste (coluna_usuario_pedido + valor_coluna_usuario_pedido) foram DROPadas — schemas vivem em pedido.
-- NOTA: rename de "roles_permitidas" eh semantico (Role -> tipo_usuario_workspace), nao apenas sufixo DDD.

-- 1. RENAME COLUMNs (18)
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "id"               TO "id_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "tenant_id"        TO "id_organizacao";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "product_id"       TO "id_produto_gravity";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "nome"             TO "nome_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "chave"            TO "chave_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "tipo"             TO "tipo_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "escopo"           TO "escopo_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "visibilidade"     TO "visibilidade_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "roles_permitidas" TO "tipos_usuario_workspace_permitidos_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "obrigatorio"      TO "obrigatorio_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "opcoes"           TO "opcoes_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "descricao"        TO "descricao_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "valor_padrao"     TO "valor_padrao_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "ordem"            TO "ordem_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "ativo"            TO "ativo_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "created_by"       TO "criado_por_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "created_at"       TO "data_criacao_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "updated_at"       TO "data_atualizacao_coluna_usuario_pedido";

-- 2. RENAME INDEXes (4) — Postgres trunca a 63 chars
ALTER INDEX "coluna_usuario_pedido_tenant_id_idx"             RENAME TO "coluna_usuario_pedido_id_organizacao_idx";
ALTER INDEX "coluna_usuario_pedido_tenant_id_product_id_idx"  RENAME TO "coluna_usuario_pedido_id_organizacao_id_produto_gravity_idx";
ALTER INDEX "coluna_usuario_pedido_tenant_id_chave_key"       RENAME TO "coluna_usuario_pedido_id_organizacao_chave_coluna_usuario_pedido_key";
ALTER INDEX "coluna_usuario_pedido_tenant_id_ativo_idx"       RENAME TO "coluna_usuario_pedido_id_organizacao_ativo_coluna_usuario_pedido_idx";
