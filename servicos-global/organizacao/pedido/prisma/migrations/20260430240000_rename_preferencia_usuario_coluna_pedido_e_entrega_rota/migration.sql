-- Migration: rename_preferencia_usuario_coluna_pedido_e_entrega_rota
-- RENAME TABLE + 4 RENAME COLUMN + 4 RENAME INDEX para naming consistente
-- nos 3 layers (banco + Prisma + rota).
-- Aplicada manualmente em transacao em 2026-04-30 (tabela vazia, 0 rows).
--
-- Contexto:
-- A tabela preferencia_coluna_pedido (Q3) tinha o DB DDD-aligned mas:
-- - Model name confuso: PedidoListaColunasPreferencia (o "Lista" nao agrega)
-- - Sem rota PUT/GET implementada (frontend fazia chamadas que retornavam 404
--   silenciado por .catch(() => {}))
-- - Referencia broken em inicializacao-pedido.ts (db.pedidoPreferenciaUsuario
--   chamava model name inexistente)
--
-- Solucao: renomear tudo (DB + Prisma + rota) para naming consistente:
--   preferencia_usuario_coluna_pedido / PreferenciaUsuarioColunaPedido /
--   /api/v1/pedidos/config/preferencia-usuario-coluna-pedido
--
-- Tabela duplicata em gravity-servicos-teste.public foi DROPada.

-- 1. RENAME TABLE
ALTER TABLE "preferencia_coluna_pedido" RENAME TO "preferencia_usuario_coluna_pedido";

-- 2. RENAME COLUMNs (4)
ALTER TABLE "preferencia_usuario_coluna_pedido" RENAME COLUMN "id_pedido_colunas_preferencia_usuario"      TO "id_preferencia_usuario_coluna_pedido";
ALTER TABLE "preferencia_usuario_coluna_pedido" RENAME COLUMN "colunas_visiveis_pedido_preferencia_usuario" TO "colunas_visiveis_preferencia_usuario_coluna_pedido";
ALTER TABLE "preferencia_usuario_coluna_pedido" RENAME COLUMN "colunas_largura_pedido_preferencia_usuario"  TO "colunas_largura_preferencia_usuario_coluna_pedido";
ALTER TABLE "preferencia_usuario_coluna_pedido" RENAME COLUMN "data_atualizacao_pedido_preferencia_usuario" TO "data_atualizacao_preferencia_usuario_coluna_pedido";

-- 3. RENAME INDEXes (4)
ALTER INDEX "preferencia_coluna_pedido_pkey"                          RENAME TO "preferencia_usuario_coluna_pedido_pkey";
ALTER INDEX "preferencia_coluna_pedido_id_organizacao_idx"            RENAME TO "preferencia_usuario_coluna_pedido_id_organizacao_idx";
ALTER INDEX "preferencia_coluna_pedido_id_organizacao_id_usuario_idx" RENAME TO "preferencia_usuario_coluna_pedido_id_organizacao_id_usuario_idx";
ALTER INDEX "preferencia_coluna_pedido_id_organizacao_id_usuario_key" RENAME TO "preferencia_usuario_coluna_pedido_id_organizacao_id_usuario_key";
