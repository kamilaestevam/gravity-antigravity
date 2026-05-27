-- ============================================================
-- rls-policies.sql — Row-Level Security para o banco BID Frete Internacional
-- Executar APOS prisma migrate deploy no ambiente Railway.
--
-- Segunda camada de defesa de isolamento de organizacao.
-- A primeira camada e o middleware Prisma (withTenantIsolation).
--
-- NOTA: Porto NAO tem id_organizacao (dados globais/publicos).
-- ============================================================

-- ============================================================
-- Ativar RLS nas tabelas com id_organizacao
-- ============================================================

ALTER TABLE "bid_frete_internacional_fornecedores"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_frete_internacional_cotacoes"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_frete_internacional_pedidos_cotacao"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_frete_internacional_propostas"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_frete_internacional_taxas"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_frete_internacional_tabelas_valor"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_frete_internacional_avaliacoes"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_frete_internacional_ganhos"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bid_frete_internacional_integracoes"       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Politicas de Isolamento
-- id_organizacao deve corresponder ao valor definido pela aplicacao
-- via SET app.current_tenant_id
-- ============================================================

CREATE POLICY tenant_isolation_policy ON "bid_frete_internacional_fornecedores"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_frete_internacional_cotacoes"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_frete_internacional_pedidos_cotacao"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_frete_internacional_propostas"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_frete_internacional_taxas"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_frete_internacional_tabelas_valor"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_frete_internacional_avaliacoes"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_frete_internacional_ganhos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "bid_frete_internacional_integracoes"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));
