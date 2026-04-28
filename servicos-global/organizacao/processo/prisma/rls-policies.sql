-- ============================================================
-- rls-policies.sql — Row-Level Security para o banco Processo
-- Executar APOS prisma migrate deploy no ambiente Railway.
--
-- Segunda camada de defesa de isolamento de tenant.
-- A primeira camada e o middleware Prisma (withTenantIsolation).
-- ============================================================

-- ============================================================
-- Ativar RLS em todas as tabelas com id_organizacao
-- ============================================================

ALTER TABLE "processos"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "processo_etapas"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pedidos"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pedido_itens"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "follow_ups"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documentos"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "estimativas_custo"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dados_tecnicos"     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Politicas de Isolamento
-- ============================================================

CREATE POLICY tenant_isolation_policy ON "processos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "processo_etapas"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "pedidos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "pedido_itens"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "follow_ups"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "documentos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "estimativas_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "dados_tecnicos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));
