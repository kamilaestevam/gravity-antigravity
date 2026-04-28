-- Sub-onda 7d — Fechamento dos PARCIAIS leves do Módulo Pedido
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
--
-- Tabelas afetadas (3):
--   • PedidoAnexo (model rename: AnexoPedido → PedidoAnexo + 4 column renames)
--   • PedidoPreferenciaUsuario (1 PK rename)
--   • PedidoValorColunaUsuario (model rename: ValorColunaUsuarioPedido → PedidoValorColunaUsuario + 4 column renames)

-- ─────────────────────────────────────────────────────────────────────────────
-- PedidoAnexo (tabela física: anexo_pedido)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "anexo_pedido" RENAME COLUMN "id_produto"               TO "id_produto_gravity";
ALTER TABLE "anexo_pedido" RENAME COLUMN "id_vinculo"               TO "id_vinculo_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "storage_key_anexo_pedido" TO "chave_storage_anexo_pedido";
ALTER TABLE "anexo_pedido" RENAME COLUMN "uploaded_by_anexo_pedido" TO "enviado_por_anexo_pedido";

-- ─────────────────────────────────────────────────────────────────────────────
-- PedidoPreferenciaUsuario (tabela física: preferencia_coluna_pedido)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "preferencia_coluna_pedido" RENAME COLUMN "id_pedido_preferencia_usuario" TO "id_pedido_colunas_preferencia_usuario";

-- ─────────────────────────────────────────────────────────────────────────────
-- PedidoValorColunaUsuario (tabela física: valor_coluna_usuario_pedido)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "id_produto"                        TO "id_produto_gravity";
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "id_coluna"                         TO "id_coluna_usuario_pedido";
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "id_vinculo"                        TO "id_vinculo_valor_coluna_usuario_pedido";
ALTER TABLE "valor_coluna_usuario_pedido" RENAME COLUMN "valor_valor_coluna_usuario_pedido" TO "valor_coluna_usuario_pedido";
