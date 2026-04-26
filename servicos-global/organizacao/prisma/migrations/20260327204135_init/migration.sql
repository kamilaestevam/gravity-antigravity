-- CreateEnum
CREATE TYPE "EmpresaStatus" AS ENUM ('ATIVA', 'INATIVA', 'PROSPECTO', 'CLIENTE', 'CHURNED');

-- CreateEnum
CREATE TYPE "AtividadeStatus" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "AtividadePrioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "AtividadeTipo" AS ENUM ('TAREFA', 'REUNIAO', 'LIGACAO', 'EMAIL', 'FOLLOW_UP', 'VISITA', 'OUTRO');

-- CreateEnum
CREATE TYPE "PipelineEtapa" AS ENUM ('PROSPECCAO', 'QUALIFICACAO', 'PROPOSTA', 'NEGOCIACAO', 'FECHAMENTO', 'POS_VENDA');

-- CreateEnum
CREATE TYPE "KanbanCardStatus" AS ENUM ('ABERTO', 'EM_PROGRESSO', 'BLOQUEADO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDENTE', 'PROCESSANDO', 'ENVIADO', 'FALHOU', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EmailDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "EmailThreadStatus" AS ENUM ('ABERTA', 'ARQUIVADA', 'RESOLVIDA');

-- CreateEnum
CREATE TYPE "EmailSentimentLevel" AS ENUM ('MUITO_POSITIVO', 'POSITIVO', 'NEUTRO', 'NEGATIVO', 'MUITO_NEGATIVO');

-- CreateEnum
CREATE TYPE "FilaEmailPrioridade" AS ENUM ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'SYSTEM', 'GABI_IA', 'ADMIN');

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "site" TEXT,
    "segmento" TEXT,
    "status" "EmpresaStatus" NOT NULL DEFAULT 'PROSPECTO',
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contato" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "empresa_id" TEXT,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "linkedin" TEXT,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atividade" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "AtividadeTipo" NOT NULL DEFAULT 'TAREFA',
    "status" "AtividadeStatus" NOT NULL DEFAULT 'PENDENTE',
    "prioridade" "AtividadePrioridade" NOT NULL DEFAULT 'MEDIA',
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "data_venc" TIMESTAMP(3),
    "empresa_id" TEXT,
    "contato_id" TEXT,
    "pipeline_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "titulo" TEXT NOT NULL,
    "etapa" "PipelineEtapa" NOT NULL DEFAULT 'PROSPECCAO',
    "valor" DOUBLE PRECISION,
    "empresa_id" TEXT,
    "contato_id" TEXT,
    "probabilidade" INTEGER,
    "data_fechamento" TIMESTAMP(3),
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanCard" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "KanbanCardStatus" NOT NULL DEFAULT 'ABERTO',
    "posicao" INTEGER NOT NULL DEFAULT 0,
    "cor" TEXT,
    "etiquetas" TEXT[],
    "data_venc" TIMESTAMP(3),
    "atividade_id" TEXT,
    "empresa_id" TEXT,
    "contato_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimerSession" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "subject" TEXT,
    "linked_type" TEXT,
    "linked_id" TEXT,
    "linked_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimerActive" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "paused_at" TIMESTAMP(3),
    "accumulated_seconds" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimerActive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatorioTempoCache" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "product_id" TEXT,
    "periodo_inicio" TIMESTAMP(3) NOT NULL,
    "periodo_fim" TIMESTAMP(3) NOT NULL,
    "total_minutos" INTEGER NOT NULL,
    "payload" TEXT NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelatorioTempoCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailThread" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "subject" TEXT NOT NULL,
    "status" "EmailThreadStatus" NOT NULL DEFAULT 'ABERTA',
    "sentiment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sentiment_label" "EmailSentimentLevel" NOT NULL DEFAULT 'NEUTRO',
    "mensagens_count" INTEGER NOT NULL DEFAULT 0,
    "ultimo_contato" TIMESTAMP(3),
    "deep_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "thread_id" TEXT NOT NULL,
    "resend_id" TEXT,
    "direction" "EmailDirection" NOT NULL DEFAULT 'OUTBOUND',
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "body_html" TEXT,
    "dedup_key" TEXT,
    "parent_message_id" TEXT,
    "gabi_response" TEXT,
    "gabi_confidence" DOUBLE PRECISION,
    "gabi_action" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailEnviado" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "reply_to" TEXT,
    "subject" TEXT NOT NULL,
    "template_id" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDENTE',
    "resend_id" TEXT,
    "dedup_key" TEXT NOT NULL,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "max_tentativas" INTEGER NOT NULL DEFAULT 5,
    "next_retry_at" TIMESTAMP(3),
    "error_message" TEXT,
    "enviado_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailEnviado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "corpo_html" TEXT NOT NULL,
    "corpo_texto" TEXT,
    "variaveis" TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilaEmail" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDENTE',
    "prioridade" "FilaEmailPrioridade" NOT NULL DEFAULT 'NORMAL',
    "payload" TEXT NOT NULL,
    "template_id" TEXT,
    "email_enviado_id" TEXT,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "max_tentativas" INTEGER NOT NULL DEFAULT 5,
    "next_retry_at" TIMESTAMP(3),
    "processado_at" TIMESTAMP(3),
    "erro" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilaEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppConversation" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "wa_phone_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "contact_id" TEXT,
    "company_id" TEXT,
    "contact_nome" TEXT,
    "company_nome" TEXT,
    "activity_id" TEXT,
    "ai_enabled" BOOLEAN NOT NULL DEFAULT false,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "gabi_temperatura" TEXT,
    "gabi_temperatura_score" INTEGER,
    "gabi_resumo" TEXT,
    "gabi_acoes_sugeridas" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "conversation_id" TEXT NOT NULL,
    "wa_message_id" TEXT,
    "direction" TEXT NOT NULL,
    "content_type" TEXT NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'agent',
    "sent_by" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppUsageLog" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "conversation_id" TEXT,
    "company_id" TEXT,
    "conversation_category" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "cost_usd" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppAutomation" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "conditions" JSONB,
    "template_id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigDashboard" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "widgets_layout" JSONB,
    "refresh_rate" INTEGER NOT NULL DEFAULT 300000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricaSnapshot" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "metric_name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricaSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relatorio" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "nome" TEXT NOT NULL,
    "tabelas" JSONB NOT NULL DEFAULT '[]',
    "colunas" JSONB NOT NULL DEFAULT '[]',
    "filtros" JSONB NOT NULL DEFAULT '{}',
    "join_type" TEXT NOT NULL DEFAULT 'left',
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigRelatorio" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "relatorio_id" TEXT NOT NULL,
    "frequencia" TEXT NOT NULL,
    "canais" JSONB NOT NULL,
    "formato" TEXT NOT NULL DEFAULT 'csv',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigRelatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "relatorio_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "formato" TEXT NOT NULL DEFAULT 'csv',
    "url_arquivo" TEXT,
    "erro" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryLog" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_type" "ActorType" NOT NULL,
    "action" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "agenda_id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "capacidade" INTEGER NOT NULL DEFAULT 1,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nome" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmado',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisponibilidadeConfig" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "agenda_id" TEXT NOT NULL,
    "horarioInicio" TEXT NOT NULL,
    "horarioFim" TEXT NOT NULL,
    "duracaoSlot" INTEGER NOT NULL,
    "intervalo" INTEGER NOT NULL DEFAULT 0,
    "diasSemana" INTEGER[],
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisponibilidadeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GabiConversation" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GabiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GabiMessage" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GabiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GabiUsageLog" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "action_taken" TEXT NOT NULL,
    "conversation_snapshot" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL DEFAULT 'gabi',
    "triggered_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GabiUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tooltips_disabled" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "sidebar_open" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Empresa_tenant_id_idx" ON "Empresa"("tenant_id");

-- CreateIndex
CREATE INDEX "Empresa_tenant_id_product_id_idx" ON "Empresa"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "Empresa_tenant_id_user_id_idx" ON "Empresa"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "Contato_tenant_id_idx" ON "Contato"("tenant_id");

-- CreateIndex
CREATE INDEX "Contato_tenant_id_product_id_idx" ON "Contato"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "Contato_tenant_id_user_id_idx" ON "Contato"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "Atividade_tenant_id_idx" ON "Atividade"("tenant_id");

-- CreateIndex
CREATE INDEX "Atividade_tenant_id_product_id_idx" ON "Atividade"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "Atividade_tenant_id_user_id_idx" ON "Atividade"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "Pipeline_tenant_id_idx" ON "Pipeline"("tenant_id");

-- CreateIndex
CREATE INDEX "Pipeline_tenant_id_product_id_idx" ON "Pipeline"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "Pipeline_tenant_id_user_id_idx" ON "Pipeline"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "KanbanCard_tenant_id_idx" ON "KanbanCard"("tenant_id");

-- CreateIndex
CREATE INDEX "KanbanCard_tenant_id_product_id_idx" ON "KanbanCard"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "KanbanCard_tenant_id_user_id_idx" ON "KanbanCard"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "TimerSession_tenant_id_idx" ON "TimerSession"("tenant_id");

-- CreateIndex
CREATE INDEX "TimerSession_tenant_id_product_id_idx" ON "TimerSession"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "TimerSession_tenant_id_user_id_idx" ON "TimerSession"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "TimerSession_tenant_id_user_id_started_at_idx" ON "TimerSession"("tenant_id", "user_id", "started_at");

-- CreateIndex
CREATE INDEX "TimerSession_tenant_id_activity_id_idx" ON "TimerSession"("tenant_id", "activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "TimerActive_user_id_key" ON "TimerActive"("user_id");

-- CreateIndex
CREATE INDEX "TimerActive_tenant_id_idx" ON "TimerActive"("tenant_id");

-- CreateIndex
CREATE INDEX "TimerActive_tenant_id_user_id_idx" ON "TimerActive"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "TimerActive_user_id_idx" ON "TimerActive"("user_id");

-- CreateIndex
CREATE INDEX "RelatorioTempoCache_tenant_id_idx" ON "RelatorioTempoCache"("tenant_id");

-- CreateIndex
CREATE INDEX "RelatorioTempoCache_tenant_id_product_id_idx" ON "RelatorioTempoCache"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "RelatorioTempoCache_tenant_id_user_id_idx" ON "RelatorioTempoCache"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "RelatorioTempoCache_tenant_id_periodo_inicio_periodo_fim_idx" ON "RelatorioTempoCache"("tenant_id", "periodo_inicio", "periodo_fim");

-- CreateIndex
CREATE INDEX "EmailThread_tenant_id_idx" ON "EmailThread"("tenant_id");

-- CreateIndex
CREATE INDEX "EmailThread_tenant_id_product_id_idx" ON "EmailThread"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "EmailThread_tenant_id_user_id_idx" ON "EmailThread"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_resend_id_key" ON "EmailMessage"("resend_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_dedup_key_key" ON "EmailMessage"("dedup_key");

-- CreateIndex
CREATE INDEX "EmailMessage_tenant_id_idx" ON "EmailMessage"("tenant_id");

-- CreateIndex
CREATE INDEX "EmailMessage_tenant_id_product_id_idx" ON "EmailMessage"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "EmailMessage_tenant_id_user_id_idx" ON "EmailMessage"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "EmailMessage_thread_id_idx" ON "EmailMessage"("thread_id");

-- CreateIndex
CREATE INDEX "EmailMessage_dedup_key_idx" ON "EmailMessage"("dedup_key");

-- CreateIndex
CREATE UNIQUE INDEX "EmailEnviado_resend_id_key" ON "EmailEnviado"("resend_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmailEnviado_dedup_key_key" ON "EmailEnviado"("dedup_key");

-- CreateIndex
CREATE INDEX "EmailEnviado_tenant_id_idx" ON "EmailEnviado"("tenant_id");

-- CreateIndex
CREATE INDEX "EmailEnviado_tenant_id_product_id_idx" ON "EmailEnviado"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "EmailEnviado_tenant_id_user_id_idx" ON "EmailEnviado"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "EmailEnviado_status_idx" ON "EmailEnviado"("status");

-- CreateIndex
CREATE INDEX "EmailEnviado_dedup_key_idx" ON "EmailEnviado"("dedup_key");

-- CreateIndex
CREATE INDEX "Template_tenant_id_idx" ON "Template"("tenant_id");

-- CreateIndex
CREATE INDEX "Template_tenant_id_product_id_idx" ON "Template"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "Template_tenant_id_user_id_idx" ON "Template"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Template_tenant_id_slug_key" ON "Template"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "FilaEmail_tenant_id_idx" ON "FilaEmail"("tenant_id");

-- CreateIndex
CREATE INDEX "FilaEmail_tenant_id_product_id_idx" ON "FilaEmail"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "FilaEmail_tenant_id_user_id_idx" ON "FilaEmail"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "FilaEmail_status_next_retry_at_idx" ON "FilaEmail"("status", "next_retry_at");

-- CreateIndex
CREATE INDEX "FilaEmail_tenant_id_status_idx" ON "FilaEmail"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_tenant_id_idx" ON "WhatsAppConversation"("tenant_id");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_tenant_id_product_id_idx" ON "WhatsAppConversation"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_tenant_id_user_id_idx" ON "WhatsAppConversation"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_tenant_id_status_idx" ON "WhatsAppConversation"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "WhatsAppConversation_tenant_id_wa_phone_number_idx" ON "WhatsAppConversation"("tenant_id", "wa_phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppMessage_wa_message_id_key" ON "WhatsAppMessage"("wa_message_id");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_tenant_id_idx" ON "WhatsAppMessage"("tenant_id");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_tenant_id_product_id_idx" ON "WhatsAppMessage"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_tenant_id_user_id_idx" ON "WhatsAppMessage"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_tenant_id_conversation_id_idx" ON "WhatsAppMessage"("tenant_id", "conversation_id");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_wa_message_id_idx" ON "WhatsAppMessage"("wa_message_id");

-- CreateIndex
CREATE INDEX "WhatsAppUsageLog_tenant_id_idx" ON "WhatsAppUsageLog"("tenant_id");

-- CreateIndex
CREATE INDEX "WhatsAppUsageLog_tenant_id_product_id_idx" ON "WhatsAppUsageLog"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "WhatsAppUsageLog_tenant_id_user_id_idx" ON "WhatsAppUsageLog"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "WhatsAppAutomation_tenant_id_idx" ON "WhatsAppAutomation"("tenant_id");

-- CreateIndex
CREATE INDEX "WhatsAppAutomation_tenant_id_product_id_idx" ON "WhatsAppAutomation"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "WhatsAppAutomation_tenant_id_user_id_idx" ON "WhatsAppAutomation"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "WhatsAppAutomation_tenant_id_active_idx" ON "WhatsAppAutomation"("tenant_id", "active");

-- CreateIndex
CREATE INDEX "ConfigDashboard_tenant_id_idx" ON "ConfigDashboard"("tenant_id");

-- CreateIndex
CREATE INDEX "ConfigDashboard_tenant_id_product_id_idx" ON "ConfigDashboard"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "ConfigDashboard_tenant_id_user_id_idx" ON "ConfigDashboard"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "MetricaSnapshot_tenant_id_idx" ON "MetricaSnapshot"("tenant_id");

-- CreateIndex
CREATE INDEX "MetricaSnapshot_tenant_id_product_id_idx" ON "MetricaSnapshot"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "MetricaSnapshot_tenant_id_metric_name_snapshot_date_idx" ON "MetricaSnapshot"("tenant_id", "metric_name", "snapshot_date");

-- CreateIndex
CREATE INDEX "Relatorio_tenant_id_idx" ON "Relatorio"("tenant_id");

-- CreateIndex
CREATE INDEX "Relatorio_tenant_id_product_id_idx" ON "Relatorio"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "Relatorio_tenant_id_user_id_idx" ON "Relatorio"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "ConfigRelatorio_tenant_id_idx" ON "ConfigRelatorio"("tenant_id");

-- CreateIndex
CREATE INDEX "ConfigRelatorio_tenant_id_product_id_idx" ON "ConfigRelatorio"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "ConfigRelatorio_tenant_id_user_id_idx" ON "ConfigRelatorio"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "ExportJob_tenant_id_idx" ON "ExportJob"("tenant_id");

-- CreateIndex
CREATE INDEX "ExportJob_tenant_id_product_id_idx" ON "ExportJob"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "ExportJob_tenant_id_user_id_idx" ON "ExportJob"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "HistoryLog_tenant_id_idx" ON "HistoryLog"("tenant_id");

-- CreateIndex
CREATE INDEX "HistoryLog_tenant_id_product_id_idx" ON "HistoryLog"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "HistoryLog_tenant_id_user_id_idx" ON "HistoryLog"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "HistoryLog_tenant_id_created_at_idx" ON "HistoryLog"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "Agenda_tenant_id_idx" ON "Agenda"("tenant_id");

-- CreateIndex
CREATE INDEX "Slot_tenant_id_idx" ON "Slot"("tenant_id");

-- CreateIndex
CREATE INDEX "Slot_agenda_id_idx" ON "Slot"("agenda_id");

-- CreateIndex
CREATE INDEX "Reserva_tenant_id_idx" ON "Reserva"("tenant_id");

-- CreateIndex
CREATE INDEX "Reserva_slot_id_idx" ON "Reserva"("slot_id");

-- CreateIndex
CREATE INDEX "Reserva_usuario_id_idx" ON "Reserva"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "DisponibilidadeConfig_agenda_id_key" ON "DisponibilidadeConfig"("agenda_id");

-- CreateIndex
CREATE INDEX "DisponibilidadeConfig_tenant_id_idx" ON "DisponibilidadeConfig"("tenant_id");

-- CreateIndex
CREATE INDEX "GabiConversation_tenant_id_idx" ON "GabiConversation"("tenant_id");

-- CreateIndex
CREATE INDEX "GabiConversation_tenant_id_product_id_idx" ON "GabiConversation"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "GabiConversation_tenant_id_user_id_idx" ON "GabiConversation"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "GabiMessage_tenant_id_idx" ON "GabiMessage"("tenant_id");

-- CreateIndex
CREATE INDEX "GabiMessage_tenant_id_product_id_idx" ON "GabiMessage"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "GabiMessage_tenant_id_user_id_idx" ON "GabiMessage"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "GabiMessage_conversation_id_idx" ON "GabiMessage"("conversation_id");

-- CreateIndex
CREATE INDEX "GabiUsageLog_tenant_id_idx" ON "GabiUsageLog"("tenant_id");

-- CreateIndex
CREATE INDEX "GabiUsageLog_tenant_id_product_id_idx" ON "GabiUsageLog"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "GabiUsageLog_tenant_id_user_id_idx" ON "GabiUsageLog"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_user_id_key" ON "UserPreferences"("user_id");

-- CreateIndex
CREATE INDEX "UserPreferences_user_id_idx" ON "UserPreferences"("user_id");

-- CreateIndex
CREATE INDEX "UserPreferences_tenant_id_idx" ON "UserPreferences"("tenant_id");

-- CreateIndex
CREATE INDEX "UserPreferences_tenant_id_user_id_idx" ON "UserPreferences"("tenant_id", "user_id");

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "EmailThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "Agenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "Slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisponibilidadeConfig" ADD CONSTRAINT "DisponibilidadeConfig_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "Agenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GabiMessage" ADD CONSTRAINT "GabiMessage_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "GabiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
