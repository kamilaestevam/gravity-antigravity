-- ============================================================
-- apply-rls-user.sql — Row-Level Security por user_id
-- Executar APOS apply-rls.sql (que faz isolamento por tenant).
--
-- Secao 13.17.2 do documento de projeto:
-- "E obrigatorio configurar regras de seguranca no banco de dados
-- para garantir que um usuario so possa visualizar, inserir ou
-- deletar as suas proprias informacoes e arquivos."
--
-- NOTA: Estas policies sao ADICIONAIS as de tenant_id.
-- Um registro so e visivel se AMBAS as policies forem satisfeitas:
--   1. tenant_id = app.current_tenant_id (existente)
--   2. user_id = app.current_user_id (esta policy)
--
-- Tabelas com dados pessoais vinculados ao usuario:
--   - TimerSession (sessoes de cronometro do usuario)
--   - TimerActive (timer ativo do usuario)
--   - RelatorioTempoCache (cache de relatorio do usuario)
--
-- Tabelas onde user_id FILTRA mas ADMIN/MASTER podem ver tudo:
-- Nao aplicamos RLS por user nesses casos — a logica fica na aplicacao.
-- Exemplos: Atividade (pode ser delegada), EmailThread (compartilhada).
--
-- IMPORTANTE: O middleware deve setar app.current_user_id antes de queries.
-- Usuarios com papel MASTER/ADMIN/SUPER_ADMIN devem bypassar esta policy.
-- ============================================================

-- ============================================================
-- Tabelas com dados estritamente pessoais
-- ============================================================

-- Cronometro: sessoes sao pessoais do usuario
CREATE POLICY user_isolation_policy ON "TimerSession"
  USING (
    user_id = current_setting('app.current_user_id', true)
    OR current_setting('app.current_user_role', true) IN ('MASTER', 'ADMIN', 'SUPER_ADMIN')
    OR current_setting('app.current_user_id', true) IS NULL
    OR current_setting('app.current_user_id', true) = ''
  );

CREATE POLICY user_isolation_policy ON "TimerActive"
  USING (
    user_id = current_setting('app.current_user_id', true)
    OR current_setting('app.current_user_role', true) IN ('MASTER', 'ADMIN', 'SUPER_ADMIN')
    OR current_setting('app.current_user_id', true) IS NULL
    OR current_setting('app.current_user_id', true) = ''
  );

CREATE POLICY user_isolation_policy ON "RelatorioTempoCache"
  USING (
    user_id = current_setting('app.current_user_id', true)
    OR current_setting('app.current_user_role', true) IN ('MASTER', 'ADMIN', 'SUPER_ADMIN')
    OR current_setting('app.current_user_id', true) IS NULL
    OR current_setting('app.current_user_id', true) = ''
  );

-- ============================================================
-- NOTA: Para ativar plenamente, o middleware Prisma deve executar:
--
--   await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
--   await tx.$executeRaw`SELECT set_config('app.current_user_role', ${userRole}, true)`
--
-- antes de cada transacao, similar ao set_config de tenant_id.
-- ============================================================
