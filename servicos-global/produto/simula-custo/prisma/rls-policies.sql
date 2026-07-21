-- ============================================================
-- rls-policies.sql — Row-Level Security para o banco Simula Custo
-- Executar APOS prisma migrate deploy no ambiente Railway.
--
-- Segunda camada de defesa de isolamento de tenant.
-- A primeira camada e o middleware Prisma (withTenantIsolation).
-- ============================================================

-- ============================================================
-- Ativar RLS nas tabelas com id_organizacao
-- ============================================================

ALTER TABLE "simula_custo"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "taxa_origem_simula_custo"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "taxa_destino_simula_custo"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documento_simula_custo"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "anexo_documento_simula_custo"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prazo_pagamento_simula_custo"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sequencia_simula_custo"         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Politicas de Isolamento
-- ============================================================

CREATE POLICY tenant_isolation_policy ON "simula_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "taxa_origem_simula_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "taxa_destino_simula_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "documento_simula_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "anexo_documento_simula_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "prazo_pagamento_simula_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "sequencia_simula_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));
