-- ============================================================
-- rls-policies.sql — Row-Level Security para o banco BID Frete
-- Executar APOS prisma migrate deploy no ambiente Railway.
--
-- Segunda camada de defesa de isolamento de tenant.
-- A primeira camada e o middleware Prisma (withTenantIsolation).
--
-- NOTA: RatingFornecedor e Porto NAO tem id_organizacao (dados globais/publicos).
-- ============================================================

-- ============================================================
-- Ativar RLS nas tabelas com id_organizacao
-- ============================================================

ALTER TABLE "bid_fornecedores"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_cotacoes"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_requests"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_responses"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_detalhe_taxas"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_tabelas_preco"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_avaliacoes"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_savings"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_connector_configs" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Politicas de Isolamento
-- id_organizacao deve corresponder ao valor definido pela aplicacao
-- via SET app.current_tenant_id
-- ============================================================

CREATE POLICY tenant_isolation_policy ON "bid_fornecedores"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_cotacoes"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_requests"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_responses"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_detalhe_taxas"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_tabelas_preco"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_avaliacoes"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_savings"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_connector_configs"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Tabelas SEM RLS (dados globais/publicos):
-- bid_rating_fornecedor_global — cross-tenant por design
-- bid_portos — dados publicos de referencia
-- ============================================================
