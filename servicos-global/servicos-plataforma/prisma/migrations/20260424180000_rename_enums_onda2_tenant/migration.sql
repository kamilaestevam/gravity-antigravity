-- FASE 06 DDD / Onda 2 Tenant — rename de tipos + valores de enum
-- Fonte: planilha_geral_gravity (20).xlsx, aba '4. mapa-enums'
-- Overrides (Tech Lead aprovado):
--   TokenScope → TokenEscopo (colisão com TokenValidade)
--   DirecaoEmail → EmailDirecao (semântica)
--   StatusThreadEmail → EmailThreadStatus (semântica)
-- Escopo DB: enums ativos no schema Tenant (api-cockpit orphan fora).

ALTER TYPE "DirecaoEmail" RENAME VALUE 'INBOUND' TO 'RECEBIDO';
ALTER TYPE "DirecaoEmail" RENAME VALUE 'OUTBOUND' TO 'ENVIADO';
ALTER TYPE "DirecaoEmail" RENAME TO "EmailDirecao";

ALTER TYPE "FilaEmailPrioridade" RENAME TO "EmailFilaPrioridade";

ALTER TYPE "ModoDashboard" RENAME VALUE 'PRODUCT' TO 'PRODUTO';
ALTER TYPE "ModoDashboard" RENAME VALUE 'GENERAL' TO 'GERAL';
ALTER TYPE "ModoDashboard" RENAME TO "DashboardModo";

ALTER TYPE "NcmSyncOrigem" RENAME TO "NCMOrigemSincronizacao";

ALTER TYPE "NivelSentimentoEmail" RENAME TO "EmailSentimento";

ALTER TYPE "StatusAlerta" RENAME VALUE 'PENDING' TO 'PENDENTE';
ALTER TYPE "StatusAlerta" RENAME VALUE 'REVIEWED' TO 'REVISADO';
ALTER TYPE "StatusAlerta" RENAME VALUE 'ESCALATED' TO 'ESCALADO';
ALTER TYPE "StatusAlerta" RENAME TO "AlertaStatus";

ALTER TYPE "StatusEmail" RENAME TO "EmailStatus";

ALTER TYPE "StatusEvento" RENAME VALUE 'SUCCESS' TO 'SUCESSO';
ALTER TYPE "StatusEvento" RENAME VALUE 'FAILURE' TO 'FALHA';
ALTER TYPE "StatusEvento" RENAME VALUE 'PARTIAL' TO 'PARCIAL';
ALTER TYPE "StatusEvento" RENAME TO "EventoStatus";

ALTER TYPE "StatusNcmSync" RENAME VALUE 'RUNNING' TO 'EXECUTANDO';
ALTER TYPE "StatusNcmSync" RENAME VALUE 'SUCCESS' TO 'SUCESSO';
ALTER TYPE "StatusNcmSync" RENAME VALUE 'ERROR' TO 'ERRO';
ALTER TYPE "StatusNcmSync" RENAME TO "NCMStatusSincronizacao";

ALTER TYPE "StatusThreadEmail" RENAME TO "EmailThreadStatus";

ALTER TYPE "TipoAtor" RENAME VALUE 'USER' TO 'USUARIO';
ALTER TYPE "TipoAtor" RENAME VALUE 'AI' TO 'IA';
ALTER TYPE "TipoAtor" RENAME VALUE 'INTEGRATION' TO 'INTEGRACAO';
ALTER TYPE "TipoAtor" RENAME TO "AcaoExecutadaPor";

ALTER TYPE "TipoGrafico" RENAME VALUE 'LINE' TO 'LINHA';
ALTER TYPE "TipoGrafico" RENAME VALUE 'BAR' TO 'BARRA';
ALTER TYPE "TipoGrafico" RENAME VALUE 'BAR_HORIZONTAL' TO 'BARRA_HORIZONTAL';
ALTER TYPE "TipoGrafico" RENAME VALUE 'DONUT' TO 'ROSCA';
ALTER TYPE "TipoGrafico" RENAME VALUE 'HISTOGRAM' TO 'HISTOGRAMA';
ALTER TYPE "TipoGrafico" RENAME VALUE 'FUNNEL' TO 'FUNIL';
ALTER TYPE "TipoGrafico" RENAME VALUE 'GAUGE' TO 'MEDIDOR';
ALTER TYPE "TipoGrafico" RENAME VALUE 'MAP' TO 'MAPA';
ALTER TYPE "TipoGrafico" RENAME VALUE 'TABLE' TO 'TABELA';
ALTER TYPE "TipoGrafico" RENAME TO "GraficoTipo";

ALTER TYPE "TipoWidget" RENAME VALUE 'CATALOG' TO 'CATALOGO';
ALTER TYPE "TipoWidget" RENAME VALUE 'CUSTOM' TO 'CUSTOMIZADO';
ALTER TYPE "TipoWidget" RENAME TO "DashboardTipo";
