-- Sub-onda 7n.1 — ColunaUsuarioPedido (10 col renames + 4 index renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("coluna_usuario_pedido") permanece (preserva dados).
-- Restantes 8 cols (opcoes/descricao/valor_padrao/ordem/ativo/created_by/created_at/updated_at) em 7n.2.

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

-- Renomear índices para refletir nova nomenclatura
ALTER INDEX "coluna_usuario_pedido_tenant_id_chave_key"        RENAME TO "coluna_usuario_pedido_id_organizacao_chave_coluna_usuario_pe_key";
ALTER INDEX "coluna_usuario_pedido_tenant_id_idx"              RENAME TO "coluna_usuario_pedido_id_organizacao_idx";
ALTER INDEX "coluna_usuario_pedido_tenant_id_product_id_idx"   RENAME TO "coluna_usuario_pedido_id_organizacao_id_produto_gravity_idx";
ALTER INDEX "coluna_usuario_pedido_tenant_id_ativo_idx"        RENAME TO "coluna_usuario_pedido_id_organizacao_ativo_idx";
