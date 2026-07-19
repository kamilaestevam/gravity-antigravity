-- ============================================================
-- rls-policies.sql — Row-Level Security para o banco Estimativa Custo
-- Executar APOS prisma migrate deploy no ambiente Railway.
--
-- Segunda camada de defesa de isolamento de tenant.
-- A primeira camada e o middleware Prisma (withTenantIsolation).
--
-- NOTA: cache_cambio_bacen NAO tem id_organizacao (dado publico BACEN).
-- ============================================================

-- ============================================================
-- Ativar RLS nas tabelas com id_organizacao
-- ============================================================

ALTER TABLE "estimativa_custo"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "taxa_origem_estimativa_custo"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "taxa_destino_estimativa_custo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tributo_estimativa_custo"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documento_estimativa_custo"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sequencia_estimativa_custo"    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Politicas de Isolamento
-- ============================================================

CREATE POLICY tenant_isolation_policy ON "estimativa_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "taxa_origem_estimativa_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "taxa_destino_estimativa_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "tributo_estimativa_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "documento_estimativa_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "sequencia_estimativa_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

-- ============================================================
-- Tabelas SEM RLS (dados publicos):
-- cache_cambio_bacen — taxas de cambio publicas do BACEN
-- ============================================================
