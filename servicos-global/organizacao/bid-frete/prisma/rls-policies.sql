-- ============================================================
-- rls-policies.sql — Row-Level Security para o banco BID Frete
-- Executar APOS prisma migrate deploy no ambiente Railway.
--
-- Segunda camada de defesa de isolamento de tenant.
-- A primeira camada e o middleware Prisma (withTenantIsolation).
--
-- NOTA: RatingFornecedor e Porto NAO tem tenant_id (dados globais/publicos).
-- ============================================================

-- ============================================================
-- Ativar RLS nas tabelas com tenant_id
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
-- tenant_id deve corresponder ao valor definido pela aplicacao
-- via SET app.current_tenant_id
-- ============================================================

CREATE POLICY tenant_isolation_policy ON "bid_fornecedores"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_cotacoes"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_requests"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_responses"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_detalhe_taxas"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_tabelas_preco"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_avaliacoes"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_savings"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_connector_configs"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Tabelas SEM RLS (dados globais/publicos):
-- bid_rating_fornecedor_global — cross-tenant por design
-- bid_portos — dados publicos de referencia
-- ============================================================
