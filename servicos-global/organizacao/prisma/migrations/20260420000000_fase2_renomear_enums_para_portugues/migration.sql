-- Fase 2 — Renomear tipos de enum para português (schema tenant)
-- APENAS ALTER TYPE ... RENAME TO — zero alteração de dados ou valores
-- Os VALUES dos enums são INTOCÁVEIS

ALTER TYPE "EmailStatus"       RENAME TO "StatusEmail";
ALTER TYPE "EmailDirection"    RENAME TO "DirecaoEmail";
ALTER TYPE "EmailThreadStatus" RENAME TO "StatusThreadEmail";
ALTER TYPE "EmailSentimentLevel" RENAME TO "NivelSentimentoEmail";
ALTER TYPE "DashboardMode"     RENAME TO "ModoDashboard";
ALTER TYPE "WidgetType"        RENAME TO "TipoWidget";
ALTER TYPE "ChartType"         RENAME TO "TipoGrafico";
ALTER TYPE "ActorType"         RENAME TO "TipoAtor";
ALTER TYPE "EventStatus"       RENAME TO "StatusEvento";
ALTER TYPE "AlertStatus"       RENAME TO "StatusAlerta";
ALTER TYPE "NcmSyncStatus"     RENAME TO "StatusNcmSync";
