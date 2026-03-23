-- configurador/prisma/rls-policies.sql
-- RLS POLICIES — BANCO CONFIGURADOR
-- Agente 0B — Banco de Dados
--
-- Executar APÓS as migrations do Prisma.
-- Garante a Camada 2 de isolamento de tenant no nível do banco de dados.
-- A Camada 1 (Prisma Extension) está em servicos-global/tenant/middleware/withTenantIsolation.ts
--
-- ATENÇÃO: O configurador usa tenant_id como referência ao id do próprio Tenant.
-- As policies de User, Subscription e Permission filtram pelo campo tenant_id.
-- A tabela Tenant em si é controlada apenas pela aplicação (sem RLS por tenant_id,
-- pois o Configurador tem acesso administrativo global como serviço central).
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- TABELA: User
-- Usuários vinculados a um tenant — isolamento obrigatório.
-- ===========================================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Block todos os acessos por padrão
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_user ON "User"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

-- ===========================================================================
-- TABELA: Subscription
-- Assinaturas vinculadas a um tenant — isolamento obrigatório.
-- ===========================================================================

ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_subscription ON "Subscription"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

-- ===========================================================================
-- TABELA: Permission
-- Permissões por tenant + usuário — isolamento obrigatório.
-- ===========================================================================

ALTER TABLE "Permission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Permission" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_permission ON "Permission"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));

-- ===========================================================================
-- FUNÇÃO AUXILIAR: set_tenant_context
-- Chamada no início de cada transação para configurar o contexto de tenant.
-- O middleware da aplicação deve chamar esta função via:
--   await prisma.$executeRaw`SELECT set_tenant_context(${tenantId})`
-- ===========================================================================

CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', p_tenant_id, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================================
-- ÍNDICES ADICIONAIS — além dos gerados pelo Prisma
-- Garante performance em buscas filtradas por tenant_id + campos comuns.
-- ===========================================================================

-- User: busca por tenant + data de criação
CREATE INDEX IF NOT EXISTS idx_user_tenant_created
  ON "User" (tenant_id, created_at DESC);

-- User: busca por tenant + role
CREATE INDEX IF NOT EXISTS idx_user_tenant_role
  ON "User" (tenant_id, role);

-- Subscription: busca por tenant + status da assinatura
CREATE INDEX IF NOT EXISTS idx_subscription_tenant_status
  ON "Subscription" (tenant_id, status);

-- Subscription: busca por tenant + data de criação
CREATE INDEX IF NOT EXISTS idx_subscription_tenant_created
  ON "Subscription" (tenant_id, created_at DESC);

-- Permission: busca por tenant + usuário + recurso
CREATE INDEX IF NOT EXISTS idx_permission_tenant_user_resource
  ON "Permission" (tenant_id, user_id, resource);
