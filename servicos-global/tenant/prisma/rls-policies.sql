-- servicos-global/tenant/prisma/rls-policies.sql
-- RLS POLICIES — BANCO TENANT (servicos-tenant)
-- Agente 0B — Banco de Dados
--
-- Executar APÓS as migrations do Prisma no banco tenant-db.
-- CONVENÇÃO: toda tabela com tenant_id DEVE ter RLS ativo — sem exceções.
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- FUNÇÃO AUXILIAR: set_tenant_context
-- Chamada pelo middleware antes de cada query para definir o contexto de tenant.
-- O withTenantIsolation.ts deve executar:
--   await prisma.$executeRaw`SELECT set_tenant_context(${tenantId})`
-- ===========================================================================

CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', p_tenant_id, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================================
-- TEMPLATE ATIVO — COPIE E AJUSTE PARA CADA FRAGMENT ENTREGUE
--
-- INSTRUÇÃO para agentes da Onda 3:
--   1. Substitua "NomeDoModel" pelo nome exato do model Prisma (PascalCase)
--   2. Substitua "nomedomodel" pelo nome em minúsculas para uso nos IDs
--   3. Adicione o bloco completo abaixo da seção correspondente ao seu serviço
--   4. Remova o comentário [PENDENTE] e marque como [ENTREGUE — Agente XX]
--
-- ============================================================
-- [ENTREGUE] atividades → Activity
-- ============================================================
ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Activity" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_activity ON "Activity"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_activity_tenant ON "Activity" (tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_tenant_created ON "Activity" (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_tenant_status ON "Activity" (tenant_id, status);

-- ============================================================
-- [ENTREGUE] cronometro → TimeEntry
-- ============================================================
ALTER TABLE "TimeEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TimeEntry" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_timeentry ON "TimeEntry"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_timeentry_tenant ON "TimeEntry" (tenant_id);
CREATE INDEX IF NOT EXISTS idx_timeentry_tenant_created ON "TimeEntry" (tenant_id, created_at DESC);

-- ============================================================
-- [ENTREGUE] email → EmailMessage
-- ============================================================
ALTER TABLE "EmailMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailMessage" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_emailmessage ON "EmailMessage"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_emailmessage_tenant ON "EmailMessage" (tenant_id);
CREATE INDEX IF NOT EXISTS idx_emailmessage_tenant_created ON "EmailMessage" (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emailmessage_tenant_status ON "EmailMessage" (tenant_id, status);

-- ============================================================
-- [ENTREGUE] whatsapp → WhatsAppMessage
-- ============================================================
ALTER TABLE "WhatsAppMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppMessage" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_whatsappmessage ON "WhatsAppMessage"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_whatsappmessage_tenant ON "WhatsAppMessage" (tenant_id);
CREATE INDEX IF NOT EXISTS idx_whatsappmessage_tenant_created ON "WhatsAppMessage" (tenant_id, created_at DESC);

-- ============================================================
-- [ENTREGUE] whatsapp → WhatsAppConversation
-- ============================================================
ALTER TABLE "WhatsAppConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppConversation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_whatsappconversation ON "WhatsAppConversation"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_whatsappconversation_tenant ON "WhatsAppConversation" (tenant_id);

-- ============================================================
-- [ENTREGUE] whatsapp → WhatsAppUsageLog
-- ============================================================
ALTER TABLE "WhatsAppUsageLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppUsageLog" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_whatsappusagelog ON "WhatsAppUsageLog"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_whatsappusagelog_tenant ON "WhatsAppUsageLog" (tenant_id);

-- ============================================================
-- [ENTREGUE] whatsapp → WhatsAppAutomation
-- ============================================================
ALTER TABLE "WhatsAppAutomation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsAppAutomation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_whatsappautomation ON "WhatsAppAutomation"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_whatsappautomation_tenant ON "WhatsAppAutomation" (tenant_id);

-- ============================================================
-- [ENTREGUE] dashboard → DashboardWidget
-- ============================================================
ALTER TABLE "DashboardWidget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DashboardWidget" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_dashboardwidget ON "DashboardWidget"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_dashboardwidget_tenant ON "DashboardWidget" (tenant_id);
CREATE INDEX IF NOT EXISTS idx_dashboardwidget_tenant_created ON "DashboardWidget" (tenant_id, created_at DESC);

-- ============================================================
-- [ENTREGUE] relatorios → Report
-- ============================================================
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_report ON "Report"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_report_tenant ON "Report" (tenant_id);
CREATE INDEX IF NOT EXISTS idx_report_tenant_created ON "Report" (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_tenant_status ON "Report" (tenant_id, status);

-- ============================================================
-- [ENTREGUE] historico → HistoryEntry
-- ============================================================
ALTER TABLE "HistoryEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HistoryEntry" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_historyentry ON "HistoryEntry"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_historyentry_tenant ON "HistoryEntry" (tenant_id);
CREATE INDEX IF NOT EXISTS idx_historyentry_tenant_created ON "HistoryEntry" (tenant_id, created_at DESC);

-- ============================================================
-- [ENTREGUE] agendamento → ScheduledEvent
-- ============================================================
ALTER TABLE "ScheduledEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScheduledEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_scheduledevent ON "ScheduledEvent"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_scheduledevent_tenant ON "ScheduledEvent" (tenant_id);
CREATE INDEX IF NOT EXISTS idx_scheduledevent_tenant_created ON "ScheduledEvent" (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduledevent_tenant_status ON "ScheduledEvent" (tenant_id, status);

-- ============================================================
-- [ENTREGUE] gabi → GabiConversation
-- ============================================================
ALTER TABLE "GabiConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GabiConversation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_gabiconversation ON "GabiConversation"
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
CREATE INDEX IF NOT EXISTS idx_gabiconversation_tenant ON "GabiConversation" (tenant_id);
CREATE INDEX IF NOT EXISTS idx_gabiconversation_tenant_created ON "GabiConversation" (tenant_id, created_at DESC);

