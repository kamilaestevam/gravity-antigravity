-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'PENDING_SETUP');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MASTER', 'STANDARD', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "UserMembershipRole" AS ENUM ('MASTER', 'STANDARD', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "ServiceTokenScope" AS ENUM ('SERVICE', 'WEBHOOK', 'CRON');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'COMING_SOON', 'LEGACY', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('MONTHLY', 'PER_PROCESS', 'PER_DOCUMENT', 'PER_ESTIMATE', 'PER_DI_DUIMP', 'PER_DUE', 'PER_PRODUCT', 'PER_FLOW', 'PER_LPCO');

-- CreateEnum
CREATE TYPE "UserLimitType" AS ENUM ('UNLIMITED', 'LIMITED');

-- CreateEnum
CREATE TYPE "DeployEnvironment" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION', 'ALL');

-- CreateEnum
CREATE TYPE "DeployStatus" AS ENUM ('SUCCESS', 'FAILED', 'ROLLBACK', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "FaturaStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'OVERDUE', 'UNCOLLECTIBLE');

-- CreateTable
CREATE TABLE "organizacao" (
    "id_organizacao" TEXT NOT NULL,
    "nome_organizacao" TEXT NOT NULL,
    "subdominio_organizacao" TEXT NOT NULL,
    "status_organizacao" "TenantStatus" NOT NULL DEFAULT 'PENDING_SETUP',
    "clerk_org_id" TEXT,
    "stripe_customer_id" TEXT,
    "cnpj_organizacao" TEXT,
    "estado_organizacao" TEXT,
    "cidade_organizacao" TEXT,
    "segmento_organizacao" TEXT,
    "tipo_organizacao" TEXT,
    "data_criacao_organizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizacao_pkey" PRIMARY KEY ("id_organizacao")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" TEXT NOT NULL,
    "id_organizacao_usuario" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email_usuario" TEXT NOT NULL,
    "nome_usuario" TEXT NOT NULL,
    "tipo_usuario" "UserRole" NOT NULL DEFAULT 'STANDARD',
    "preferred_company_id" TEXT,
    "data_criacao_usuario" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "assinatura_produto_gravity" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "trial_ends_at" TIMESTAMP(3),
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinatura_produto_gravity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_permissao" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "granted_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissao_admin_gravity" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "granted_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissao_admin_gravity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT,
    "cnpj" TEXT,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_workspace" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role" "UserMembershipRole" NOT NULL DEFAULT 'STANDARD',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_produto_gravity" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_key" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_produto_gravity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto_gravity_workspace" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "product_key" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produto_gravity_workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos_gravity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "launch_date" TIMESTAMP(3),
    "has_setup" BOOLEAN NOT NULL DEFAULT false,
    "setup_price" DECIMAL(15,2),
    "setup_currency" TEXT NOT NULL DEFAULT 'BRL',
    "billing_type" "BillingType" NOT NULL DEFAULT 'MONTHLY',
    "unit_price" DECIMAL(15,2) NOT NULL,
    "unit_currency" TEXT NOT NULL DEFAULT 'BRL',
    "minimum_price" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "minimum_currency" TEXT NOT NULL DEFAULT 'BRL',
    "total_price" DECIMAL(15,2),
    "total_currency" TEXT NOT NULL DEFAULT 'BRL',
    "user_limit_type" "UserLimitType" NOT NULL DEFAULT 'UNLIMITED',
    "base_users_qty" INTEGER,
    "extra_user_price" DECIMAL(15,2),
    "extra_user_currency" TEXT NOT NULL DEFAULT 'BRL',
    "helpdesk_hours" INTEGER NOT NULL DEFAULT 0,
    "extra_hour_price" DECIMAL(15,2),
    "extra_hour_currency" TEXT NOT NULL DEFAULT 'BRL',
    "gabi_quota_mensal" INTEGER NOT NULL DEFAULT 0,
    "backend_module" TEXT,
    "target_audience" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "produtos_gravity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faixa_preco_produto_gravity" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "range_from" INTEGER NOT NULL,
    "range_to" INTEGER,
    "price" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faixa_preco_produto_gravity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negociacao_especial_produto_gravity" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tenant_name" TEXT NOT NULL,
    "agreement" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "is_unlimited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "negociacao_especial_produto_gravity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deploy" (
    "id_deploy" TEXT NOT NULL,
    "deploy_number" SERIAL NOT NULL,
    "area_deploy" TEXT NOT NULL,
    "versao_deploy" TEXT NOT NULL,
    "descricao_deploy" TEXT NOT NULL,
    "ambiente_deploy" "DeployEnvironment" NOT NULL DEFAULT 'PRODUCTION',
    "status_deploy" "DeployStatus" NOT NULL DEFAULT 'SUCCESS',
    "quem_deploy" TEXT NOT NULL,
    "id_usuario_deploy" TEXT,
    "data_execucao_deploy" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_criacao_deploy" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deploy_pkey" PRIMARY KEY ("id_deploy")
);

-- CreateTable
CREATE TABLE "fornecedor_organizacao" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedor_organizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguranca" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DETECTED',
    "description" TEXT,
    "ip" TEXT,
    "endpoint" TEXT,
    "user_id" TEXT,
    "product_id" TEXT,
    "correlation_id" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisicoes" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tenant_id" TEXT,
    "ip" TEXT,
    "endpoint" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "limit_max" INTEGER NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "window_start" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requisicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "latency_ms" INTEGER,
    "last_error" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio" (
    "id" TEXT NOT NULL,
    "moeda" TEXT NOT NULL,
    "compra" DECIMAL(15,6) NOT NULL,
    "venda" DECIMAL(15,6) NOT NULL,
    "data_cotacao" TIMESTAMP(3) NOT NULL,
    "hora_cotacao" TEXT,
    "boletim" TEXT NOT NULL DEFAULT 'Fechamento',
    "fonte" TEXT NOT NULL DEFAULT 'BCB/PTAX',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cambio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT 'platform',
    "type" TEXT NOT NULL,
    "escopo" TEXT NOT NULL,
    "sublocal" TEXT,
    "module" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "test_id" TEXT,
    "result" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "error_log" TEXT,
    "ai_analysis" JSONB,
    "screenshot" TEXT,
    "ambiente" TEXT NOT NULL DEFAULT 'Local',
    "run_id" TEXT,
    "triggered_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamento_teste" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT 'platform',
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "frequencia" TEXT NOT NULL DEFAULT 'Manual',
    "hora" INTEGER NOT NULL DEFAULT 0,
    "minuto" INTEGER NOT NULL DEFAULT 0,
    "tipos" JSONB NOT NULL,
    "escopos" TEXT[],
    "ambiente" TEXT NOT NULL DEFAULT 'Local',
    "alertas" JSONB NOT NULL DEFAULT '[]',
    "ultima_exec" TIMESTAMP(3),
    "proxima_exec" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamento_teste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plano_teste" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT 'platform',
    "versao" TEXT NOT NULL DEFAULT '1.0',
    "tipo" TEXT NOT NULL,
    "escopo" TEXT NOT NULL,
    "sublocal" TEXT NOT NULL,
    "tela" TEXT NOT NULL,
    "rota" TEXT NOT NULL,
    "criticidade" TEXT NOT NULL DEFAULT 'media',
    "ambientes" TEXT[],
    "componente_path" TEXT NOT NULL,
    "spec_path" TEXT,
    "mapeamento_path" TEXT NOT NULL,
    "cobertura_pct" INTEGER NOT NULL DEFAULT 0,
    "passos_total" INTEGER NOT NULL DEFAULT 0,
    "resumo_executivo" TEXT NOT NULL,
    "plano_completo" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente_validacao',
    "ultima_execucao" TIMESTAMP(3),
    "ultimo_resultado" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plano_teste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fatura_produtos_gravity" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "numero_fatura_servicos_gravity" TEXT NOT NULL,
    "status_fatura_servicos_gravity" "FaturaStatus" NOT NULL DEFAULT 'DRAFT',
    "organizacao_fatura_servicos_gravity" TEXT NOT NULL,
    "email_organizacao_fatura_servicos_gravity" TEXT,
    "valor_total_fatura_servicos_gravity" DECIMAL(18,2) NOT NULL,
    "moeda_fatura_servicos_gravity" TEXT NOT NULL DEFAULT 'brl',
    "competencia_fatura_servicos_gravity" TEXT,
    "data_fatura_servicos_gravity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fatura_produtos_gravity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metricas_gemini" (
    "id" TEXT NOT NULL,
    "nome_llm" TEXT[],
    "data_analise_llm" TIMESTAMP(3) NOT NULL,
    "total_analise_llm" INTEGER NOT NULL DEFAULT 0,
    "total_token_llm" INTEGER NOT NULL DEFAULT 0,
    "custo_llm" DECIMAL(10,4) NOT NULL,
    "latencia_llm" INTEGER NOT NULL DEFAULT 0,
    "confianca_alta_llm" INTEGER NOT NULL DEFAULT 0,
    "confianca_media_llm" INTEGER NOT NULL DEFAULT 0,
    "confianca_baixa_llm" INTEGER NOT NULL DEFAULT 0,
    "quantidade_codigo_validado_llm" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metricas_gemini_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizacao_subdominio_organizacao_key" ON "organizacao"("subdominio_organizacao");

-- CreateIndex
CREATE UNIQUE INDEX "organizacao_clerk_org_id_key" ON "organizacao"("clerk_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizacao_stripe_customer_id_key" ON "organizacao"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "organizacao_status_organizacao_idx" ON "organizacao"("status_organizacao");

-- CreateIndex
CREATE INDEX "organizacao_subdominio_organizacao_idx" ON "organizacao"("subdominio_organizacao");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_clerk_user_id_key" ON "usuario"("clerk_user_id");

-- CreateIndex
CREATE INDEX "usuario_id_organizacao_usuario_idx" ON "usuario"("id_organizacao_usuario");

-- CreateIndex
CREATE INDEX "usuario_id_organizacao_usuario_data_criacao_usuario_idx" ON "usuario"("id_organizacao_usuario", "data_criacao_usuario");

-- CreateIndex
CREATE INDEX "usuario_id_organizacao_usuario_tipo_usuario_idx" ON "usuario"("id_organizacao_usuario", "tipo_usuario");

-- CreateIndex
CREATE INDEX "usuario_preferred_company_id_idx" ON "usuario"("preferred_company_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_id_organizacao_usuario_email_usuario_key" ON "usuario"("id_organizacao_usuario", "email_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "assinatura_produto_gravity_stripe_subscription_id_key" ON "assinatura_produto_gravity"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "assinatura_produto_gravity_tenant_id_idx" ON "assinatura_produto_gravity"("tenant_id");

-- CreateIndex
CREATE INDEX "assinatura_produto_gravity_tenant_id_created_at_idx" ON "assinatura_produto_gravity"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "assinatura_produto_gravity_tenant_id_status_idx" ON "assinatura_produto_gravity"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "usuario_permissao_tenant_id_idx" ON "usuario_permissao"("tenant_id");

-- CreateIndex
CREATE INDEX "usuario_permissao_tenant_id_user_id_idx" ON "usuario_permissao"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "usuario_permissao_tenant_id_company_id_user_id_idx" ON "usuario_permissao"("tenant_id", "company_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_permissao_tenant_id_company_id_user_id_product_id_p_key" ON "usuario_permissao"("tenant_id", "company_id", "user_id", "product_id", "permission");

-- CreateIndex
CREATE INDEX "permissao_admin_gravity_admin_id_idx" ON "permissao_admin_gravity"("admin_id");

-- CreateIndex
CREATE INDEX "permissao_admin_gravity_admin_id_resource_idx" ON "permissao_admin_gravity"("admin_id", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "permissao_admin_gravity_admin_id_resource_action_key" ON "permissao_admin_gravity"("admin_id", "resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_subdomain_key" ON "workspace"("subdomain");

-- CreateIndex
CREATE INDEX "workspace_tenant_id_idx" ON "workspace"("tenant_id");

-- CreateIndex
CREATE INDEX "workspace_tenant_id_status_idx" ON "workspace"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "workspace_tenant_id_created_at_idx" ON "workspace"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "usuario_workspace_tenant_id_idx" ON "usuario_workspace"("tenant_id");

-- CreateIndex
CREATE INDEX "usuario_workspace_tenant_id_user_id_idx" ON "usuario_workspace"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "usuario_workspace_tenant_id_company_id_idx" ON "usuario_workspace"("tenant_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_workspace_tenant_id_user_id_company_id_key" ON "usuario_workspace"("tenant_id", "user_id", "company_id");

-- CreateIndex
CREATE INDEX "config_produto_gravity_tenant_id_idx" ON "config_produto_gravity"("tenant_id");

-- CreateIndex
CREATE INDEX "config_produto_gravity_tenant_id_product_key_idx" ON "config_produto_gravity"("tenant_id", "product_key");

-- CreateIndex
CREATE INDEX "config_produto_gravity_tenant_id_is_active_idx" ON "config_produto_gravity"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "config_produto_gravity_tenant_id_product_key_key" ON "config_produto_gravity"("tenant_id", "product_key");

-- CreateIndex
CREATE INDEX "produto_gravity_workspace_tenant_id_idx" ON "produto_gravity_workspace"("tenant_id");

-- CreateIndex
CREATE INDEX "produto_gravity_workspace_company_id_idx" ON "produto_gravity_workspace"("company_id");

-- CreateIndex
CREATE INDEX "produto_gravity_workspace_company_id_is_active_idx" ON "produto_gravity_workspace"("company_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "produto_gravity_workspace_company_id_product_key_key" ON "produto_gravity_workspace"("company_id", "product_key");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_gravity_slug_key" ON "produtos_gravity"("slug");

-- CreateIndex
CREATE INDEX "produtos_gravity_status_idx" ON "produtos_gravity"("status");

-- CreateIndex
CREATE INDEX "produtos_gravity_slug_idx" ON "produtos_gravity"("slug");

-- CreateIndex
CREATE INDEX "produtos_gravity_deleted_at_idx" ON "produtos_gravity"("deleted_at");

-- CreateIndex
CREATE INDEX "faixa_preco_produto_gravity_product_id_idx" ON "faixa_preco_produto_gravity"("product_id");

-- CreateIndex
CREATE INDEX "faixa_preco_produto_gravity_product_id_range_from_idx" ON "faixa_preco_produto_gravity"("product_id", "range_from");

-- CreateIndex
CREATE INDEX "negociacao_especial_produto_gravity_product_id_idx" ON "negociacao_especial_produto_gravity"("product_id");

-- CreateIndex
CREATE INDEX "negociacao_especial_produto_gravity_tenant_id_idx" ON "negociacao_especial_produto_gravity"("tenant_id");

-- CreateIndex
CREATE INDEX "negociacao_especial_produto_gravity_product_id_tenant_id_idx" ON "negociacao_especial_produto_gravity"("product_id", "tenant_id");

-- CreateIndex
CREATE INDEX "deploy_data_execucao_deploy_idx" ON "deploy"("data_execucao_deploy");

-- CreateIndex
CREATE INDEX "deploy_area_deploy_idx" ON "deploy"("area_deploy");

-- CreateIndex
CREATE INDEX "deploy_ambiente_deploy_idx" ON "deploy"("ambiente_deploy");

-- CreateIndex
CREATE INDEX "deploy_status_deploy_idx" ON "deploy"("status_deploy");

-- CreateIndex
CREATE INDEX "deploy_area_deploy_data_execucao_deploy_idx" ON "deploy"("area_deploy", "data_execucao_deploy");

-- CreateIndex
CREATE INDEX "fornecedor_organizacao_tenant_id_idx" ON "fornecedor_organizacao"("tenant_id");

-- CreateIndex
CREATE INDEX "fornecedor_organizacao_clerk_user_id_idx" ON "fornecedor_organizacao"("clerk_user_id");

-- CreateIndex
CREATE INDEX "fornecedor_organizacao_tenant_id_clerk_user_id_idx" ON "fornecedor_organizacao"("tenant_id", "clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_organizacao_clerk_user_id_tenant_id_key" ON "fornecedor_organizacao"("clerk_user_id", "tenant_id");

-- CreateIndex
CREATE INDEX "seguranca_created_at_idx" ON "seguranca"("created_at");

-- CreateIndex
CREATE INDEX "seguranca_severity_idx" ON "seguranca"("severity");

-- CreateIndex
CREATE INDEX "seguranca_action_idx" ON "seguranca"("action");

-- CreateIndex
CREATE INDEX "seguranca_tenant_id_created_at_idx" ON "seguranca"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "seguranca_severity_created_at_idx" ON "seguranca"("severity", "created_at");

-- CreateIndex
CREATE INDEX "requisicoes_created_at_idx" ON "requisicoes"("created_at");

-- CreateIndex
CREATE INDEX "requisicoes_blocked_created_at_idx" ON "requisicoes"("blocked", "created_at");

-- CreateIndex
CREATE INDEX "requisicoes_tenant_id_idx" ON "requisicoes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "servicos_service_key" ON "servicos"("service");

-- CreateIndex
CREATE INDEX "servicos_status_idx" ON "servicos"("status");

-- CreateIndex
CREATE INDEX "servicos_checked_at_idx" ON "servicos"("checked_at");

-- CreateIndex
CREATE INDEX "cambio_moeda_idx" ON "cambio"("moeda");

-- CreateIndex
CREATE INDEX "cambio_moeda_data_cotacao_idx" ON "cambio"("moeda", "data_cotacao");

-- CreateIndex
CREATE INDEX "cambio_data_cotacao_idx" ON "cambio"("data_cotacao");

-- CreateIndex
CREATE INDEX "cambio_criado_em_idx" ON "cambio"("criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "cambio_moeda_data_cotacao_boletim_key" ON "cambio"("moeda", "data_cotacao", "boletim");

-- CreateIndex
CREATE INDEX "testes_tenant_id_idx" ON "testes"("tenant_id");

-- CreateIndex
CREATE INDEX "testes_created_at_idx" ON "testes"("created_at");

-- CreateIndex
CREATE INDEX "testes_type_escopo_idx" ON "testes"("type", "escopo");

-- CreateIndex
CREATE INDEX "testes_result_idx" ON "testes"("result");

-- CreateIndex
CREATE INDEX "testes_run_id_idx" ON "testes"("run_id");

-- CreateIndex
CREATE INDEX "testes_test_id_idx" ON "testes"("test_id");

-- CreateIndex
CREATE INDEX "agendamento_teste_tenant_id_idx" ON "agendamento_teste"("tenant_id");

-- CreateIndex
CREATE INDEX "agendamento_teste_ativo_idx" ON "agendamento_teste"("ativo");

-- CreateIndex
CREATE INDEX "agendamento_teste_proxima_exec_idx" ON "agendamento_teste"("proxima_exec");

-- CreateIndex
CREATE INDEX "plano_teste_tenant_id_idx" ON "plano_teste"("tenant_id");

-- CreateIndex
CREATE INDEX "plano_teste_tipo_escopo_idx" ON "plano_teste"("tipo", "escopo");

-- CreateIndex
CREATE INDEX "plano_teste_status_idx" ON "plano_teste"("status");

-- CreateIndex
CREATE INDEX "plano_teste_sublocal_idx" ON "plano_teste"("sublocal");

-- CreateIndex
CREATE INDEX "fatura_produtos_gravity_tenant_id_idx" ON "fatura_produtos_gravity"("tenant_id");

-- CreateIndex
CREATE INDEX "fatura_produtos_gravity_status_fatura_servicos_gravity_idx" ON "fatura_produtos_gravity"("status_fatura_servicos_gravity");

-- CreateIndex
CREATE INDEX "metricas_gemini_data_analise_llm_idx" ON "metricas_gemini"("data_analise_llm");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_organizacao_usuario_fkey" FOREIGN KEY ("id_organizacao_usuario") REFERENCES "organizacao"("id_organizacao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_preferred_company_id_fkey" FOREIGN KEY ("preferred_company_id") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinatura_produto_gravity" ADD CONSTRAINT "assinatura_produto_gravity_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizacao"("id_organizacao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permissao" ADD CONSTRAINT "usuario_permissao_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizacao"("id_organizacao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permissao" ADD CONSTRAINT "usuario_permissao_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizacao"("id_organizacao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_workspace" ADD CONSTRAINT "usuario_workspace_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_workspace" ADD CONSTRAINT "usuario_workspace_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_produto_gravity" ADD CONSTRAINT "config_produto_gravity_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizacao"("id_organizacao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_gravity_workspace" ADD CONSTRAINT "produto_gravity_workspace_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizacao"("id_organizacao") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_gravity_workspace" ADD CONSTRAINT "produto_gravity_workspace_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faixa_preco_produto_gravity" ADD CONSTRAINT "faixa_preco_produto_gravity_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "produtos_gravity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negociacao_especial_produto_gravity" ADD CONSTRAINT "negociacao_especial_produto_gravity_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "produtos_gravity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

