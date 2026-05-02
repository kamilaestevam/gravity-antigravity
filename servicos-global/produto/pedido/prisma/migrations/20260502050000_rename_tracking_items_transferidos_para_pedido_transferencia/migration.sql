-- Migration: rename_tracking_items_transferidos_para_pedido_transferencia
-- RENAME TABLE + 14 RENAME COLUMN + 4 RENAME INDEX
-- Aplicada manualmente em transacao em 2026-05-02 (tabela vazia, 0 rows).
--
-- Contexto:
-- O nome "tracking_items_transferidos" misturava ingles ("tracking", "items")
-- e portugues ("transferidos") + tinha sufixos de coluna gigantes
-- (ex: data_transferencia_quantidade_tracking_items_transferidos = 56 chars).
-- Model Prisma "PedidoListaItensTransfericosRastreio" tinha typo
-- ("Transfericos" em vez de "Transferidos") e palavras redundantes
-- ("Lista", "Rastreio").
--
-- Renomeacoes:
-- - Tabela: tracking_items_transferidos → pedido_transferencia
-- - Model Prisma: PedidoListaItensTransfericosRastreio → PedidoTransferencia
-- - 14 colunas com sufixo _pedido_transferencia (mais curto e PT-BR puro)
-- - revertido_em → data_reversao_pedido_transferencia (rename semantico)
-- - 4 indexes alinhados ao novo nome
--
-- BUGS corrigidos no caminho (auditoria detectou):
-- - transferirService.ts: 4 chamadas a (db as any).transferHistorico.* —
--   model orfao com comentario "ORPHAN MODEL: nao existe no fragment.prisma".
--   Agora usa db.pedidoTransferencia (model novo, alinhado).
-- - transferencias-pedido.ts: 4 chamadas db.pedido.findFirst com colunas legacy
--   (id, tenant_id, tipo_operacao). Agora id_pedido, id_organizacao, tipo_operacao_pedido.
-- - transferirService.test.ts: mocks de transferHistorico atualizados, fixture
--   criarPedidoPrisma alinhada ao schema atual (id_pedido, id_organizacao, etc.).
--
-- Tabela duplicata em gravity-servicos-teste.public foi DROPada (legacy 13 cols).

ALTER TABLE "tracking_items_transferidos" RENAME TO "pedido_transferencia";

ALTER TABLE "pedido_transferencia" RENAME COLUMN "id"                          TO "id_pedido_transferencia";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "tenant_id"                   TO "id_organizacao";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "product_id"                  TO "id_produto_gravity";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "pedido_origem_id"            TO "id_pedido_origem";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "item_origem_id"              TO "id_item_origem";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "cenario"                     TO "cenario_pedido_transferencia";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "quantidade_item_transferida" TO "quantidade_pedido_transferencia";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "destinos_json"               TO "destinos_pedido_transferencia";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "revertido"                   TO "revertido_pedido_transferencia";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "revertido_em"                TO "data_reversao_pedido_transferencia";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "revertido_por"               TO "revertido_por_pedido_transferencia";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "created_at"                  TO "data_criacao_pedido_transferencia";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "created_by"                  TO "criado_por_pedido_transferencia";
ALTER TABLE "pedido_transferencia" RENAME COLUMN "data_transferencia_qtd"      TO "data_transferencia_pedido_transferencia";

ALTER INDEX "tracking_items_transferidos_pkey"                            RENAME TO "pedido_transferencia_pkey";
ALTER INDEX "tracking_items_transferidos_tenant_id_idx"                   RENAME TO "pedido_transferencia_id_organizacao_idx";
ALTER INDEX "tracking_items_transferidos_tenant_id_pedido_origem_id_idx"  RENAME TO "pedido_transferencia_id_organizacao_id_pedido_origem_idx";
ALTER INDEX "tracking_items_transferidos_tenant_id_product_id_idx"        RENAME TO "pedido_transferencia_id_organizacao_id_produto_gravity_idx";
