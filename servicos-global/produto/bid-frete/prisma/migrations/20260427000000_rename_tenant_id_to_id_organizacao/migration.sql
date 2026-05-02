-- Migration: rename tenant_id -> id_organizacao (DB-2 Fase 6 — bid-frete)
-- Renomeia coluna `tenant_id` para `id_organizacao` em todas as tabelas tenant-scoped.
-- bid_rating_fornecedor_global e bid_portos sao tabelas globais (sem tenant_id) e nao sao alteradas.

ALTER TABLE "bid_fornecedores" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "bid_cotacoes" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "bid_requests" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "bid_responses" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "bid_detalhe_taxas" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "bid_tabelas_preco" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "bid_avaliacoes" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "bid_savings" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "bid_connector_configs" RENAME COLUMN "tenant_id" TO "id_organizacao";
