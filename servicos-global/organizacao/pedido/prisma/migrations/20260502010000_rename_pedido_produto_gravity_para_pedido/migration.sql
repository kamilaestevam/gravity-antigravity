-- Migration: rename_pedido_produto_gravity_para_pedido
-- RENAME TABLE pedido_produto_gravity → pedido + 9 RENAME INDEX
-- Aplicada manualmente em transacao em 2026-05-02 (tabela vazia, 0 rows).
--
-- Contexto:
-- Toda a arquitetura do produto Pedido gira em torno de 2 entidades:
-- - Pedido (mestre)
-- - PedidoItem / pedido_itens (filhos)
-- O nome "pedido_produto_gravity" era taut tautologia e residuo da epoca em
-- que a tabela vivia em DB compartilhada entre produtos. No DB dedicado do
-- Pedido, "produto_gravity" no sufixo nao agrega informacao.
--
-- Renomes:
-- - Tabela: pedido_produto_gravity → pedido
-- - Model Prisma: PedidoColunasGerais → Pedido
-- - 9 indexes (pkey + 8 secundarios)
-- - 7 FKs apontando pra ela (pedido_itens, pedido_snapshot_*, tracking_items_transferidos)
--   sao atualizadas automaticamente pelo PG ao renomear a tabela.
--
-- Codigo TS atualizado em 6 arquivos (8 arquivos com fragment+schema):
-- - prisma/fragment.prisma + schema.prisma
-- - server/src/services/transferirService.ts (5 refs)
-- - server/src/services/duplicarExcluirService.ts (5 refs)
-- - server/src/services/edicaoEmMassaService.ts (2 refs)
-- - server/src/services/edicaoEmMassaService.integration.test.ts (4 refs)
-- - prisma/seed.ts (4 refs)
-- - server/scripts/backupAntesDeClean.ts (1 ref)
-- - scripts/ativamente/migrate-tenants/_shared.ts (1 ref na lista de tabelas)
--
-- Tabela duplicata em gravity-servicos-teste.public (41 cols legacy) foi DROPada.
--
-- Tier 3 docs (atualizados):
-- - documentos-tecnicos/ddd-atlas/03-models.md (1 ref)
--
-- Tier 3 docs (deferidos como debito — historicos contextuais):
-- - documentos-tecnicos/governanca/lei/ddd-nomenclatura/auditorias-execucao/auditoria-execucao-pedido-banco.md
-- - scripts/refatoracao-ddd/plano.json
-- - servicos-global/organizacao/gabi/server/knowledge/gravity-knowledge-base.txt

-- 1. RENAME TABLE
ALTER TABLE "pedido_produto_gravity" RENAME TO "pedido";

-- 2. RENAME INDEXes (9)
ALTER INDEX "pedido_produto_gravity_pkey"                                       RENAME TO "pedido_pkey";
ALTER INDEX "pedido_produto_gravity_id_organizacao_idx"                         RENAME TO "pedido_id_organizacao_idx";
ALTER INDEX "pedido_produto_gravity_id_organizacao_id_workspace_idx"            RENAME TO "pedido_id_organizacao_id_workspace_idx";
ALTER INDEX "pedido_produto_gravity_id_organizacao_id_status_idx"               RENAME TO "pedido_id_organizacao_id_status_idx";
ALTER INDEX "pedido_produto_gravity_id_organizacao_status_pedido_idx"           RENAME TO "pedido_id_organizacao_status_pedido_idx";
ALTER INDEX "pedido_produto_gravity_id_organizacao_tipo_operacao_pedido_idx"    RENAME TO "pedido_id_organizacao_tipo_operacao_pedido_idx";
ALTER INDEX "pedido_produto_gravity_id_organizacao_data_emissao_pedido_idx"     RENAME TO "pedido_id_organizacao_data_emissao_pedido_idx";
ALTER INDEX "pedido_produto_gravity_id_organizacao_data_exclusao_pedido_idx"    RENAME TO "pedido_id_organizacao_data_exclusao_pedido_idx";
ALTER INDEX "pedido_produto_gravity_id_organizacao_numero_pedido_key"           RENAME TO "pedido_id_organizacao_numero_pedido_key";

-- 3. FKs (constraint names) sao mantidos com prefixo legacy. Nao afeta runtime.
--    PG ja atualizou as referencias automaticamente ao renomear a tabela.
