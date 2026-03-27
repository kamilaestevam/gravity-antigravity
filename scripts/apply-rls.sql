-- ============================================================
-- apply-rls.sql — Row-Level Security para o Tenant DB
-- Executar APÓS prisma migrate deploy no ambiente Railway.
-- Resolve GAP 2 da auditoria de infraestrutura.
--
-- IMPORTANTE: Este script ativa a segunda camada de defesa
-- de isolamento de tenant conforme skill antigravity-tenant-isolation.
-- A primeira camada é o middleware Prisma (withTenantIsolation).
-- ============================================================

-- Ativar a configuração de tenant no PostgreSQL
-- O middleware Prisma define esta variável antes de cada query:
-- SET app.current_tenant_id = '<tenant_id>'

-- ============================================================
-- Tabelas críticas do Tenant DB — Ativar RLS
-- ============================================================

-- atividades
ALTER TABLE "Empresa"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contato"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Atividade"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pipeline"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KanbanCard"  ENABLE ROW LEVEL SECURITY;

-- cronometro
ALTER TABLE "TimerSession"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TimerActive"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RelatorioTempoCache" ENABLE ROW LEVEL SECURITY;

-- email
ALTER TABLE "EmailThread"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailMessage"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailEnviado"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Template"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FilaEmail"     ENABLE ROW LEVEL SECURITY;

-- whatsapp
ALTER TABLE "WhatsAppConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppMessage"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppUsageLog"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppAutomation"   ENABLE ROW LEVEL SECURITY;

-- dashboard
ALTER TABLE "ConfigDashboard"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MetricaSnapshot"  ENABLE ROW LEVEL SECURITY;

-- relatorios
ALTER TABLE "Relatorio"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConfigRelatorio"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExportJob"        ENABLE ROW LEVEL SECURITY;

-- historico-global
ALTER TABLE "HistoryLog" ENABLE ROW LEVEL SECURITY;

-- agendamento
ALTER TABLE "Agenda"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Slot"                 ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Políticas de Isolamento — tenant_id deve corresponder ao
-- valor definido pela aplicação via SET app.current_tenant_id
-- ============================================================

-- Padrão: aplicar para todas as tabelas com tenant_id

CREATE POLICY tenant_isolation_policy ON "Empresa"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "Contato"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "Atividade"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "Pipeline"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "KanbanCard"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "TimerSession"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "TimerActive"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "RelatorioTempoCache"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "EmailThread"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "EmailMessage"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "EmailEnviado"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "Template"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "FilaEmail"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "WhatsAppConversation"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "WhatsAppMessage"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "WhatsAppUsageLog"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "WhatsAppAutomation"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "ConfigDashboard"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "MetricaSnapshot"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "Relatorio"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "ConfigRelatorio"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "ExportJob"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "HistoryLog"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "Agenda"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "Slot"
  USING (tenant_id = current_setting('app.current_tenant_id', true));

-- ============================================================
-- ATENÇÃO: O usuário da aplicação (prisma) deve ter permissão
-- de SET para app.current_tenant_id.
-- Se usar superuser no Railway, já está habilitado por padrão.
-- ============================================================
