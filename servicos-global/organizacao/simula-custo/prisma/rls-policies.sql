-- ============================================================
-- rls-policies.sql — Row-Level Security para o banco SimulaCusto
-- Executar APOS prisma migrate deploy no ambiente Railway.
--
-- Segunda camada de defesa de isolamento de tenant.
-- A primeira camada e o middleware Prisma (withTenantIsolation).
--
-- NOTA: SimulaCustoNcm e SimulaCustoCambio NAO tem id_organizacao (dados publicos).
-- ============================================================

-- ============================================================
-- Ativar RLS nas tabelas com id_organizacao
-- ============================================================

ALTER TABLE "estimativas_trade"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "taxas_estimativa_trade"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tributos_estimativa_trade"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documentos_estimativa_trade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sequencia_estimativa_trade"  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Politicas de Isolamento
-- ============================================================

CREATE POLICY tenant_isolation_policy ON "estimativas_trade"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "taxas_estimativa_trade"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "tributos_estimativa_trade"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "documentos_estimativa_trade"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "sequencia_estimativa_trade"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Tabelas SEM RLS (dados publicos):
-- cache_aliquotas_ncm — dados NCM publicos do Siscomex
-- cache_cambio_bacen — taxas de cambio publicas do BACEN
-- ============================================================
