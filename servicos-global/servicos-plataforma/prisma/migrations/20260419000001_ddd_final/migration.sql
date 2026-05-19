-- CreateEnum
DROP TYPE IF EXISTS "EmailStatus" CASCADE;
CREATE TYPE "EmailStatus" AS ENUM ('PENDENTE', 'PROCESSANDO', 'ENVIADO', 'FALHOU', 'CANCELADO');

DROP TYPE IF EXISTS "EmailDirection" CASCADE;
CREATE TYPE "EmailDirection" AS ENUM ('INBOUND', 'OUTBOUND');

DROP TYPE IF EXISTS "EmailThreadStatus" CASCADE;
CREATE TYPE "EmailThreadStatus" AS ENUM ('ABERTA', 'ARQUIVADA', 'RESOLVIDA');

DROP TYPE IF EXISTS "EmailSentimentLevel" CASCADE;
CREATE TYPE "EmailSentimentLevel" AS ENUM ('MUITO_POSITIVO', 'POSITIVO', 'NEUTRO', 'NEGATIVO', 'MUITO_NEGATIVO');

DROP TYPE IF EXISTS "FilaEmailPrioridade" CASCADE;-- CreateEnum
CREATE TYPE "FilaEmailPrioridade" AS ENUM ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE');

-- CreateEnum
DROP TYPE IF EXISTS "DashboardMode" CASCADE;
CREATE TYPE "DashboardMode" AS ENUM ('PRODUCT', 'GENERAL');

-- CreateEnum
DROP TYPE IF EXISTS "WidgetType" CASCADE;
CREATE TYPE "WidgetType" AS ENUM ('CATALOG', 'CUSTOM', 'GABI');

DROP TYPE IF EXISTS "ChartType" CASCADE;-- CreateEnum
CREATE TYPE "ChartType" AS ENUM ('KPI_CARD', 'LINE', 'BAR', 'BAR_HORIZONTAL', 'DONUT', 'HISTOGRAM', 'FUNNEL', 'GAUGE', 'MAP', 'TABLE', 'AREA');

DROP TYPE IF EXISTS "ActorType" CASCADE;-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'API', 'AI', 'JOB', 'INTEGRATION');

DROP TYPE IF EXISTS "EventStatus" CASCADE;-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SUCCESS', 'FAILURE', 'PARTIAL');

DROP TYPE IF EXISTS "AlertStatus" CASCADE;-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'REVIEWED', 'ESCALATED');

DROP TYPE IF EXISTS "NcmSyncStatus" CASCADE;-- CreateEnum
CREATE TYPE "NcmSyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'ERROR');

DROP TYPE IF EXISTS "NcmSyncOrigem" CASCADE;-- CreateEnum
CREATE TYPE "NcmSyncOrigem" AS ENUM ('JOB', 'MANUAL');

-- CreateTable
CREATE TABLE "atividades_dados" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'Tarefa',
    "status" TEXT NOT NULL DEFAULT 'A Fazer',
    "prioridade" TEXT,
    "data_atividade" TIMESTAMP(3),
    "data_vencimento" TIMESTAMP(3),
    "tempo_gasto_minutos" INTEGER NOT NULL DEFAULT 0,
    "proximo_passo_titulo" TEXT,
    "proximo_passo_data" TIMESTAMP(3),
    "lembrete_em" TIMESTAMP(3),
    "lembrete_email" BOOLEAN NOT NULL DEFAULT false,
    "lembrete_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "notificar_ao_atribuir" BOOLEAN NOT NULL DEFAULT false,
    "processo_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atividades_dados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades_participantes" (
    "id" TEXT NOT NULL,
    "atividade_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_nome" TEXT,

    CONSTRAINT "atividades_participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades_tempo" (
    "id" TEXT NOT NULL,
    "atividade_id" TEXT NOT NULL,
    "iniciado_em" TIMESTAMP(3) NOT NULL,
    "duracao_min" INTEGER NOT NULL,
    "assunto" TEXT,

    CONSTRAINT "atividades_tempo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades_cronometro" (
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

    CONSTRAINT "atividades_cronometro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades_timer" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "paused_at" TIMESTAMP(3),
    "accumulated_seconds" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atividades_timer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tempo_criacao_relatorio" (
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

    CONSTRAINT "tempo_criacao_relatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_assuntos_participantes" (
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

    CONSTRAINT "email_assuntos_participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_mensagem" (
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

    CONSTRAINT "email_mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_registro_envio" (
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

    CONSTRAINT "email_registro_envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_email" (
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

    CONSTRAINT "template_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_fila_envio" (
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

    CONSTRAINT "email_fila_envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_conversa" (
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

    CONSTRAINT "whatsapp_conversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_mensagem" (
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

    CONSTRAINT "whatsapp_mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_log" (
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

    CONSTRAINT "whatsapp_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_regra" (
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

    CONSTRAINT "whatsapp_regra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_configuracao" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Meu Dashboard',
    "mode" "DashboardMode" NOT NULL DEFAULT 'PRODUCT',
    "layout" JSONB NOT NULL DEFAULT '[]',
    "filters" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_criar" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT NOT NULL,
    "dashboard_id" TEXT NOT NULL,
    "widget_key" TEXT NOT NULL,
    "widget_type" "WidgetType" NOT NULL DEFAULT 'CATALOG',
    "chart_type" "ChartType" NOT NULL DEFAULT 'KPI_CARD',
    "title" TEXT NOT NULL,
    "query_spec" JSONB NOT NULL,
    "position" JSONB NOT NULL DEFAULT '{"x":0,"y":0,"w":2,"h":2}',
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_criar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_metricas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT,
    "metric_key" TEXT NOT NULL,
    "dimensions" JSONB,
    "value" JSONB NOT NULL,
    "period_from" TIMESTAMP(3) NOT NULL,
    "period_to" TIMESTAMP(3) NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dashboard_metricas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_alertas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT NOT NULL,
    "dashboard_id" TEXT NOT NULL,
    "widget_id" TEXT,
    "metric_key" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" JSONB NOT NULL,
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_compartilhar" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT NOT NULL,
    "dashboard_id" TEXT NOT NULL,
    "share_token" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient_email" TEXT,
    "recipient_phone" TEXT,
    "snapshot_data" JSONB,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dashboard_compartilhar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorios_salvos" (
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

    CONSTRAINT "relatorios_salvos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorios_configuracao" (
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

    CONSTRAINT "relatorios_configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exportar_job" (
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

    CONSTRAINT "exportar_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_log" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "actor_type" "ActorType" NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "actor_ip" TEXT,
    "actor_metadata" JSONB,
    "module" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "action" TEXT NOT NULL,
    "action_detail" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "status" "EventStatus" NOT NULL DEFAULT 'SUCCESS',
    "error_message" TEXT,
    "integrity_hash" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerta_regra" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "actor_type" "ActorType",
    "action" TEXT,
    "module" TEXT,
    "status_filter" "EventStatus",
    "threshold_count" INTEGER,
    "threshold_window_seconds" INTEGER,
    "channel_inapp" BOOLEAN NOT NULL DEFAULT true,
    "channel_email" BOOLEAN NOT NULL DEFAULT false,
    "channel_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "recipients_email" TEXT[],
    "recipients_whatsapp" TEXT[],
    "recipients_user_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerta_regra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerta_data" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "actor_type" "ActorType" NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "event_count" INTEGER NOT NULL,
    "window_seconds" INTEGER NOT NULL,
    "audit_log_ids" TEXT[],
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerta_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerta_registro" (
    "id" TEXT NOT NULL,
    "alert_event_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerta_registro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exportar_resultado" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "filters" JSONB,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exportar_resultado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_usuario" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horario_disponivel" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "agenda_id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "capacidade" INTEGER NOT NULL DEFAULT 1,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horario_disponivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_agenda" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nome" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmado',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserva_agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_disponibilidade_agenda" (
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

    CONSTRAINT "config_disponibilidade_agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversa_completa_gabi" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversa_completa_gabi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagem_individual_gabiai" (
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

    CONSTRAINT "mensagem_individual_gabiai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gabiai_log_uso" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "action_taken" TEXT NOT NULL,
    "conversation_snapshot" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL DEFAULT 'gabi',
    "triggered_by" TEXT NOT NULL,
    "model_used" TEXT,
    "tokens_input" INTEGER NOT NULL DEFAULT 0,
    "tokens_output" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gabiai_log_uso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gabiai_token_consumidos" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "tokens_input" INTEGER NOT NULL,
    "tokens_output" INTEGER NOT NULL,
    "tokens_total" INTEGER NOT NULL,
    "mes_ref" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gabiai_token_consumidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gabiai_token_workspace" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quota_mensal" INTEGER NOT NULL,
    "mes_ref" TEXT NOT NULL,
    "tokens_usados" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gabiai_token_workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personalizacao_organizacao_gabiai" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "system_prompt" TEXT,
    "tom_voz" TEXT,
    "limitacoes" TEXT,
    "instrucoes_extras" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personalizacao_organizacao_gabiai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferencia_workspace" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tooltips_disabled" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "sidebar_open" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferencia_workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ncm_item" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "sync_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ncm_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ncm_log" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "iniciado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido_em" TIMESTAMP(3),
    "status" "NcmSyncStatus" NOT NULL DEFAULT 'RUNNING',
    "total" INTEGER NOT NULL DEFAULT 0,
    "adicionados" INTEGER NOT NULL DEFAULT 0,
    "alterados" INTEGER NOT NULL DEFAULT 0,
    "removidos" INTEGER NOT NULL DEFAULT 0,
    "origem" "NcmSyncOrigem" NOT NULL DEFAULT 'JOB',
    "disparado_por" TEXT,
    "erro_msg" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ncm_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ncm_agendamento" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "tenant_id" TEXT NOT NULL DEFAULT '__system__',
    "product_id" TEXT,
    "user_id" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "cron_expressao" TEXT NOT NULL DEFAULT '0 2 * * *',
    "notificadores" JSONB NOT NULL DEFAULT '[]',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ncm_agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes_titulo_corpo" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "target_entity" TEXT,
    "target_id" TEXT,
    "delivery_status" TEXT NOT NULL DEFAULT 'pending',
    "external_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificacoes_titulo_corpo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contato_externo" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255),
    "whatsapp_phone" VARCHAR(20),
    "whatsapp_opt_in_at" TIMESTAMP(3),
    "notes" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contato_externo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_canal_tenant" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "whatsapp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_canal_tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "atividades_dados_tenant_id_idx" ON "atividades_dados"("tenant_id");

-- CreateIndex
CREATE INDEX "atividades_dados_tenant_id_user_id_idx" ON "atividades_dados"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "atividades_dados_tenant_id_status_idx" ON "atividades_dados"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "atividades_participantes_atividade_id_idx" ON "atividades_participantes"("atividade_id");

-- CreateIndex
CREATE UNIQUE INDEX "atividades_participantes_atividade_id_user_id_key" ON "atividades_participantes"("atividade_id", "user_id");

-- CreateIndex
CREATE INDEX "atividades_tempo_atividade_id_idx" ON "atividades_tempo"("atividade_id");

-- CreateIndex
CREATE INDEX "atividades_cronometro_tenant_id_idx" ON "atividades_cronometro"("tenant_id");

-- CreateIndex
CREATE INDEX "atividades_cronometro_tenant_id_product_id_idx" ON "atividades_cronometro"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "atividades_cronometro_tenant_id_user_id_idx" ON "atividades_cronometro"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "atividades_cronometro_tenant_id_user_id_started_at_idx" ON "atividades_cronometro"("tenant_id", "user_id", "started_at");

-- CreateIndex
CREATE INDEX "atividades_cronometro_tenant_id_activity_id_idx" ON "atividades_cronometro"("tenant_id", "activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "atividades_timer_user_id_key" ON "atividades_timer"("user_id");

-- CreateIndex
CREATE INDEX "atividades_timer_tenant_id_idx" ON "atividades_timer"("tenant_id");

-- CreateIndex
CREATE INDEX "atividades_timer_tenant_id_user_id_idx" ON "atividades_timer"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "atividades_timer_user_id_idx" ON "atividades_timer"("user_id");

-- CreateIndex
CREATE INDEX "tempo_criacao_relatorio_tenant_id_idx" ON "tempo_criacao_relatorio"("tenant_id");

-- CreateIndex
CREATE INDEX "tempo_criacao_relatorio_tenant_id_product_id_idx" ON "tempo_criacao_relatorio"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "tempo_criacao_relatorio_tenant_id_user_id_idx" ON "tempo_criacao_relatorio"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "tempo_criacao_relatorio_tenant_id_periodo_inicio_periodo_fi_idx" ON "tempo_criacao_relatorio"("tenant_id", "periodo_inicio", "periodo_fim");

-- CreateIndex
CREATE INDEX "email_assuntos_participantes_tenant_id_idx" ON "email_assuntos_participantes"("tenant_id");

-- CreateIndex
CREATE INDEX "email_assuntos_participantes_tenant_id_product_id_idx" ON "email_assuntos_participantes"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "email_assuntos_participantes_tenant_id_user_id_idx" ON "email_assuntos_participantes"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_mensagem_resend_id_key" ON "email_mensagem"("resend_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_mensagem_dedup_key_key" ON "email_mensagem"("dedup_key");

-- CreateIndex
CREATE INDEX "email_mensagem_tenant_id_idx" ON "email_mensagem"("tenant_id");

-- CreateIndex
CREATE INDEX "email_mensagem_tenant_id_product_id_idx" ON "email_mensagem"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "email_mensagem_tenant_id_user_id_idx" ON "email_mensagem"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "email_mensagem_thread_id_idx" ON "email_mensagem"("thread_id");

-- CreateIndex
CREATE INDEX "email_mensagem_dedup_key_idx" ON "email_mensagem"("dedup_key");

-- CreateIndex
CREATE UNIQUE INDEX "email_registro_envio_resend_id_key" ON "email_registro_envio"("resend_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_registro_envio_dedup_key_key" ON "email_registro_envio"("dedup_key");

-- CreateIndex
CREATE INDEX "email_registro_envio_tenant_id_idx" ON "email_registro_envio"("tenant_id");

-- CreateIndex
CREATE INDEX "email_registro_envio_tenant_id_product_id_idx" ON "email_registro_envio"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "email_registro_envio_tenant_id_user_id_idx" ON "email_registro_envio"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "email_registro_envio_status_idx" ON "email_registro_envio"("status");

-- CreateIndex
CREATE INDEX "email_registro_envio_dedup_key_idx" ON "email_registro_envio"("dedup_key");

-- CreateIndex
CREATE INDEX "template_email_tenant_id_idx" ON "template_email"("tenant_id");

-- CreateIndex
CREATE INDEX "template_email_tenant_id_product_id_idx" ON "template_email"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "template_email_tenant_id_user_id_idx" ON "template_email"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_email_tenant_id_slug_key" ON "template_email"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "email_fila_envio_tenant_id_idx" ON "email_fila_envio"("tenant_id");

-- CreateIndex
CREATE INDEX "email_fila_envio_tenant_id_product_id_idx" ON "email_fila_envio"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "email_fila_envio_tenant_id_user_id_idx" ON "email_fila_envio"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "email_fila_envio_status_next_retry_at_idx" ON "email_fila_envio"("status", "next_retry_at");

-- CreateIndex
CREATE INDEX "email_fila_envio_tenant_id_status_idx" ON "email_fila_envio"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "whatsapp_conversa_tenant_id_idx" ON "whatsapp_conversa"("tenant_id");

-- CreateIndex
CREATE INDEX "whatsapp_conversa_tenant_id_product_id_idx" ON "whatsapp_conversa"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "whatsapp_conversa_tenant_id_user_id_idx" ON "whatsapp_conversa"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "whatsapp_conversa_tenant_id_status_idx" ON "whatsapp_conversa"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "whatsapp_conversa_tenant_id_wa_phone_number_idx" ON "whatsapp_conversa"("tenant_id", "wa_phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_mensagem_wa_message_id_key" ON "whatsapp_mensagem"("wa_message_id");

-- CreateIndex
CREATE INDEX "whatsapp_mensagem_tenant_id_idx" ON "whatsapp_mensagem"("tenant_id");

-- CreateIndex
CREATE INDEX "whatsapp_mensagem_tenant_id_product_id_idx" ON "whatsapp_mensagem"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "whatsapp_mensagem_tenant_id_user_id_idx" ON "whatsapp_mensagem"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "whatsapp_mensagem_tenant_id_conversation_id_idx" ON "whatsapp_mensagem"("tenant_id", "conversation_id");

-- CreateIndex
CREATE INDEX "whatsapp_mensagem_wa_message_id_idx" ON "whatsapp_mensagem"("wa_message_id");

-- CreateIndex
CREATE INDEX "whatsapp_log_tenant_id_idx" ON "whatsapp_log"("tenant_id");

-- CreateIndex
CREATE INDEX "whatsapp_log_tenant_id_product_id_idx" ON "whatsapp_log"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "whatsapp_log_tenant_id_user_id_idx" ON "whatsapp_log"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "whatsapp_regra_tenant_id_idx" ON "whatsapp_regra"("tenant_id");

-- CreateIndex
CREATE INDEX "whatsapp_regra_tenant_id_product_id_idx" ON "whatsapp_regra"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "whatsapp_regra_tenant_id_user_id_idx" ON "whatsapp_regra"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "whatsapp_regra_tenant_id_active_idx" ON "whatsapp_regra"("tenant_id", "active");

-- CreateIndex
CREATE INDEX "dashboard_configuracao_tenant_id_idx" ON "dashboard_configuracao"("tenant_id");

-- CreateIndex
CREATE INDEX "dashboard_configuracao_tenant_id_product_id_idx" ON "dashboard_configuracao"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "dashboard_configuracao_tenant_id_user_id_idx" ON "dashboard_configuracao"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "dashboard_criar_tenant_id_idx" ON "dashboard_criar"("tenant_id");

-- CreateIndex
CREATE INDEX "dashboard_criar_tenant_id_product_id_idx" ON "dashboard_criar"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "dashboard_criar_tenant_id_user_id_idx" ON "dashboard_criar"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "dashboard_metricas_tenant_id_idx" ON "dashboard_metricas"("tenant_id");

-- CreateIndex
CREATE INDEX "dashboard_metricas_tenant_id_product_id_idx" ON "dashboard_metricas"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "dashboard_metricas_tenant_id_user_id_idx" ON "dashboard_metricas"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_metricas_tenant_id_product_id_metric_key_period_f_key" ON "dashboard_metricas"("tenant_id", "product_id", "metric_key", "period_from", "period_to");

-- CreateIndex
CREATE INDEX "dashboard_alertas_tenant_id_idx" ON "dashboard_alertas"("tenant_id");

-- CreateIndex
CREATE INDEX "dashboard_alertas_tenant_id_product_id_idx" ON "dashboard_alertas"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "dashboard_alertas_tenant_id_user_id_idx" ON "dashboard_alertas"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_compartilhar_share_token_key" ON "dashboard_compartilhar"("share_token");

-- CreateIndex
CREATE INDEX "dashboard_compartilhar_tenant_id_idx" ON "dashboard_compartilhar"("tenant_id");

-- CreateIndex
CREATE INDEX "dashboard_compartilhar_tenant_id_product_id_idx" ON "dashboard_compartilhar"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "dashboard_compartilhar_share_token_idx" ON "dashboard_compartilhar"("share_token");

-- CreateIndex
CREATE INDEX "dashboard_compartilhar_tenant_id_user_id_idx" ON "dashboard_compartilhar"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "relatorios_salvos_tenant_id_idx" ON "relatorios_salvos"("tenant_id");

-- CreateIndex
CREATE INDEX "relatorios_salvos_tenant_id_product_id_idx" ON "relatorios_salvos"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "relatorios_salvos_tenant_id_user_id_idx" ON "relatorios_salvos"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "relatorios_configuracao_tenant_id_idx" ON "relatorios_configuracao"("tenant_id");

-- CreateIndex
CREATE INDEX "relatorios_configuracao_tenant_id_product_id_idx" ON "relatorios_configuracao"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "relatorios_configuracao_tenant_id_user_id_idx" ON "relatorios_configuracao"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "exportar_job_tenant_id_idx" ON "exportar_job"("tenant_id");

-- CreateIndex
CREATE INDEX "exportar_job_tenant_id_product_id_idx" ON "exportar_job"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "exportar_job_tenant_id_user_id_idx" ON "exportar_job"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "historico_log_tenant_id_idx" ON "historico_log"("tenant_id");

-- CreateIndex
CREATE INDEX "historico_log_tenant_id_product_id_idx" ON "historico_log"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "historico_log_tenant_id_user_id_idx" ON "historico_log"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "historico_log_tenant_id_created_at_idx" ON "historico_log"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "historico_log_tenant_id_module_created_at_idx" ON "historico_log"("tenant_id", "module", "created_at");

-- CreateIndex
CREATE INDEX "historico_log_actor_id_created_at_idx" ON "historico_log"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "alerta_regra_tenant_id_enabled_idx" ON "alerta_regra"("tenant_id", "enabled");

-- CreateIndex
CREATE INDEX "alerta_data_tenant_id_status_idx" ON "alerta_data"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "alerta_data_tenant_id_created_at_idx" ON "alerta_data"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "alerta_registro_alert_event_id_idx" ON "alerta_registro"("alert_event_id");

-- CreateIndex
CREATE INDEX "exportar_resultado_tenant_id_status_idx" ON "exportar_resultado"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "exportar_resultado_expires_at_idx" ON "exportar_resultado"("expires_at");

-- CreateIndex
CREATE INDEX "agenda_usuario_tenant_id_idx" ON "agenda_usuario"("tenant_id");

-- CreateIndex
CREATE INDEX "horario_disponivel_tenant_id_idx" ON "horario_disponivel"("tenant_id");

-- CreateIndex
CREATE INDEX "horario_disponivel_agenda_id_idx" ON "horario_disponivel"("agenda_id");

-- CreateIndex
CREATE INDEX "reserva_agenda_tenant_id_idx" ON "reserva_agenda"("tenant_id");

-- CreateIndex
CREATE INDEX "reserva_agenda_slot_id_idx" ON "reserva_agenda"("slot_id");

-- CreateIndex
CREATE INDEX "reserva_agenda_usuario_id_idx" ON "reserva_agenda"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "config_disponibilidade_agenda_agenda_id_key" ON "config_disponibilidade_agenda"("agenda_id");

-- CreateIndex
CREATE INDEX "config_disponibilidade_agenda_tenant_id_idx" ON "config_disponibilidade_agenda"("tenant_id");

-- CreateIndex
CREATE INDEX "conversa_completa_gabi_tenant_id_idx" ON "conversa_completa_gabi"("tenant_id");

-- CreateIndex
CREATE INDEX "conversa_completa_gabi_tenant_id_product_id_idx" ON "conversa_completa_gabi"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "conversa_completa_gabi_tenant_id_user_id_idx" ON "conversa_completa_gabi"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "mensagem_individual_gabiai_tenant_id_idx" ON "mensagem_individual_gabiai"("tenant_id");

-- CreateIndex
CREATE INDEX "mensagem_individual_gabiai_tenant_id_product_id_idx" ON "mensagem_individual_gabiai"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "mensagem_individual_gabiai_tenant_id_user_id_idx" ON "mensagem_individual_gabiai"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "mensagem_individual_gabiai_conversation_id_idx" ON "mensagem_individual_gabiai"("conversation_id");

-- CreateIndex
CREATE INDEX "gabiai_log_uso_tenant_id_idx" ON "gabiai_log_uso"("tenant_id");

-- CreateIndex
CREATE INDEX "gabiai_log_uso_tenant_id_product_id_idx" ON "gabiai_log_uso"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "gabiai_log_uso_tenant_id_user_id_idx" ON "gabiai_log_uso"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "gabiai_token_consumidos_tenant_id_idx" ON "gabiai_token_consumidos"("tenant_id");

-- CreateIndex
CREATE INDEX "gabiai_token_consumidos_tenant_id_product_id_idx" ON "gabiai_token_consumidos"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "gabiai_token_consumidos_tenant_id_mes_ref_idx" ON "gabiai_token_consumidos"("tenant_id", "mes_ref");

-- CreateIndex
CREATE INDEX "gabiai_token_workspace_tenant_id_idx" ON "gabiai_token_workspace"("tenant_id");

-- CreateIndex
CREATE INDEX "gabiai_token_workspace_tenant_id_product_id_idx" ON "gabiai_token_workspace"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "gabiai_token_workspace_tenant_id_mes_ref_idx" ON "gabiai_token_workspace"("tenant_id", "mes_ref");

-- CreateIndex
CREATE UNIQUE INDEX "gabiai_token_workspace_tenant_id_product_id_mes_ref_key" ON "gabiai_token_workspace"("tenant_id", "product_id", "mes_ref");

-- CreateIndex
CREATE UNIQUE INDEX "personalizacao_organizacao_gabiai_tenant_id_key" ON "personalizacao_organizacao_gabiai"("tenant_id");

-- CreateIndex
CREATE INDEX "personalizacao_organizacao_gabiai_tenant_id_idx" ON "personalizacao_organizacao_gabiai"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "preferencia_workspace_user_id_key" ON "preferencia_workspace"("user_id");

-- CreateIndex
CREATE INDEX "preferencia_workspace_user_id_idx" ON "preferencia_workspace"("user_id");

-- CreateIndex
CREATE INDEX "preferencia_workspace_tenant_id_idx" ON "preferencia_workspace"("tenant_id");

-- CreateIndex
CREATE INDEX "preferencia_workspace_tenant_id_user_id_idx" ON "preferencia_workspace"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "ncm_item_tenant_id_idx" ON "ncm_item"("tenant_id");

-- CreateIndex
CREATE INDEX "ncm_item_tenant_id_product_id_idx" ON "ncm_item"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "ncm_item_tenant_id_user_id_idx" ON "ncm_item"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "ncm_item_tenant_id_ativo_idx" ON "ncm_item"("tenant_id", "ativo");

-- CreateIndex
CREATE INDEX "ncm_item_tenant_id_codigo_idx" ON "ncm_item"("tenant_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ncm_item_tenant_id_codigo_key" ON "ncm_item"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "ncm_log_tenant_id_idx" ON "ncm_log"("tenant_id");

-- CreateIndex
CREATE INDEX "ncm_log_tenant_id_product_id_idx" ON "ncm_log"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "ncm_log_tenant_id_user_id_idx" ON "ncm_log"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "ncm_log_tenant_id_status_idx" ON "ncm_log"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "ncm_log_tenant_id_iniciado_em_idx" ON "ncm_log"("tenant_id", "iniciado_em");

-- CreateIndex
CREATE INDEX "ncm_agendamento_tenant_id_idx" ON "ncm_agendamento"("tenant_id");

-- CreateIndex
CREATE INDEX "ncm_agendamento_tenant_id_product_id_idx" ON "ncm_agendamento"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "ncm_agendamento_tenant_id_user_id_idx" ON "ncm_agendamento"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "notificacoes_titulo_corpo_tenant_id_idx" ON "notificacoes_titulo_corpo"("tenant_id");

-- CreateIndex
CREATE INDEX "notificacoes_titulo_corpo_tenant_id_product_id_idx" ON "notificacoes_titulo_corpo"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "notificacoes_titulo_corpo_tenant_id_user_id_idx" ON "notificacoes_titulo_corpo"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "notificacoes_titulo_corpo_tenant_id_user_id_read_idx" ON "notificacoes_titulo_corpo"("tenant_id", "user_id", "read");

-- CreateIndex
CREATE INDEX "notificacoes_titulo_corpo_tenant_id_created_at_idx" ON "notificacoes_titulo_corpo"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "notificacoes_titulo_corpo_tenant_id_delivery_status_idx" ON "notificacoes_titulo_corpo"("tenant_id", "delivery_status");

-- CreateIndex
CREATE INDEX "notificacoes_titulo_corpo_external_id_idx" ON "notificacoes_titulo_corpo"("external_id");

-- CreateIndex
CREATE INDEX "contato_externo_tenant_id_idx" ON "contato_externo"("tenant_id");

-- CreateIndex
CREATE INDEX "contato_externo_tenant_id_created_by_idx" ON "contato_externo"("tenant_id", "created_by");

-- CreateIndex
CREATE INDEX "contato_externo_tenant_id_email_idx" ON "contato_externo"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "contato_externo_tenant_id_whatsapp_phone_idx" ON "contato_externo"("tenant_id", "whatsapp_phone");

-- CreateIndex
CREATE UNIQUE INDEX "configuracao_canal_tenant_tenant_id_key" ON "configuracao_canal_tenant"("tenant_id");

-- CreateIndex
CREATE INDEX "configuracao_canal_tenant_tenant_id_idx" ON "configuracao_canal_tenant"("tenant_id");

-- AddForeignKey
ALTER TABLE "atividades_participantes" ADD CONSTRAINT "atividades_participantes_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividades_dados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividades_tempo" ADD CONSTRAINT "atividades_tempo_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividades_dados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_mensagem" ADD CONSTRAINT "email_mensagem_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "email_assuntos_participantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_criar" ADD CONSTRAINT "dashboard_criar_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboard_configuracao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_alertas" ADD CONSTRAINT "dashboard_alertas_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboard_configuracao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_compartilhar" ADD CONSTRAINT "dashboard_compartilhar_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboard_configuracao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_data" ADD CONSTRAINT "alerta_data_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "alerta_regra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_registro" ADD CONSTRAINT "alerta_registro_alert_event_id_fkey" FOREIGN KEY ("alert_event_id") REFERENCES "alerta_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_disponivel" ADD CONSTRAINT "horario_disponivel_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "agenda_usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_agenda" ADD CONSTRAINT "reserva_agenda_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "horario_disponivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_disponibilidade_agenda" ADD CONSTRAINT "config_disponibilidade_agenda_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "agenda_usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagem_individual_gabiai" ADD CONSTRAINT "mensagem_individual_gabiai_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversa_completa_gabi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

