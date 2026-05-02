-- Migration: align_status_pedido
-- 12 RENAME COLUMN + 3 RENAME INDEX em status_pedido.
-- Aplicada manualmente em transacao em 2026-05-02 (tabela vazia, 0 rows).
--
-- Contexto:
-- Tabela tinha drift gigante: schema declarava nomes DDD (id_pedido_status,
-- nome_pedido_status, etc.) mas DB ainda tinha nomes legacy (id, nome, etc.).
-- Tres bugs silenciosos descobertos pelo alinhamento:
-- 1. Drift schema↔DB quebraria queries Prisma em runtime
-- 2. inicializacao-pedido.ts:69 chamava db.pedidoStatus (model inexistente,
--    o real era PedidoStatusConfig) — outra rota quebrada
-- 3. is_padrao/is_sistema violavam REGRA 5 (sem prefixo "is_")
--
-- Solucao: 12 RENAME COLUMN + 4 RENAME INDEX (3 efetivos pois pkey nao precisa).
-- Rename semantico: is_sistema → gerenciado_sistema_pedido_status.
-- Rename Prisma: model PedidoStatusConfig → StatusPedido (alinha tabela ↔ model).
-- Bug fix: db.pedidoStatus → db.statusPedido na rota inicializacao.
--
-- Tabela duplicata em gravity-servicos-teste.public foi DROPada.

ALTER TABLE "status_pedido" RENAME COLUMN "id"          TO "id_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "tenant_id"   TO "id_organizacao";
ALTER TABLE "status_pedido" RENAME COLUMN "company_id"  TO "id_workspace";
ALTER TABLE "status_pedido" RENAME COLUMN "nome"        TO "nome_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "rotulo"      TO "rotulo_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "cor"         TO "cor_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "icone"       TO "icone_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "ordem"       TO "ordem_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "is_padrao"   TO "padrao_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "is_sistema"  TO "gerenciado_sistema_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "created_at"  TO "data_criacao_pedido_status";
ALTER TABLE "status_pedido" RENAME COLUMN "updated_at"  TO "data_atualizacao_pedido_status";

ALTER INDEX "status_pedido_tenant_id_idx"            RENAME TO "status_pedido_id_organizacao_idx";
ALTER INDEX "status_pedido_tenant_id_company_id_idx" RENAME TO "status_pedido_id_organizacao_id_workspace_idx";
ALTER INDEX "status_pedido_tenant_id_nome_key"       RENAME TO "status_pedido_id_organizacao_nome_pedido_status_key";
