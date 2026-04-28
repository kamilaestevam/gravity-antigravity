-- Sub-onda 7n.2 — ColunaUsuarioPedido restantes (8 col renames)
-- Fonte: planilha_geral_gravity (22).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("coluna_usuario_pedido") permanece (preserva dados).
-- Relação Prisma `valores` → `valores_coluna_usuario_pedido` é mudança apenas no client (sem DDL).

ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "opcoes"       TO "opcoes_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "descricao"    TO "descricao_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "valor_padrao" TO "valor_padrao_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "ordem"        TO "ordem_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "ativo"        TO "ativo_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "created_by"   TO "criado_por_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "created_at"   TO "data_criacao_coluna_usuario_pedido";
ALTER TABLE "coluna_usuario_pedido" RENAME COLUMN "updated_at"   TO "data_atualizacao_coluna_usuario_pedido";

-- Renomear índice ativo
ALTER INDEX "coluna_usuario_pedido_id_organizacao_ativo_idx" RENAME TO "coluna_usuario_pedido_id_organizacao_ativo_coluna_usuario_p_idx";
