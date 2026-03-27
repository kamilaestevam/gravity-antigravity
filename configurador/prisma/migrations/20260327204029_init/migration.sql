-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'PENDING_SETUP');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MASTER', 'STANDARD', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "UserMembershipRole" AS ENUM ('MASTER', 'STANDARD', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "ServiceTokenScope" AS ENUM ('SERVICE', 'WEBHOOK', 'CRON');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'PENDING_SETUP',
    "clerk_org_id" TEXT,
    "stripe_customer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STANDARD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'STARTER',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "trial_ends_at" TIMESTAMP(3),
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "granted_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GravityAdminPermission" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "granted_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GravityAdminPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT,
    "cnpj" TEXT,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMembership" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role" "UserMembershipRole" NOT NULL DEFAULT 'STANDARD',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductConfig" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_key" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierTenantAccess" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierTenantAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceToken" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "scope" "ServiceTokenScope" NOT NULL DEFAULT 'SERVICE',
    "expires_at" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_clerk_org_id_key" ON "Tenant"("clerk_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_stripe_customer_id_key" ON "Tenant"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerk_user_id_key" ON "User"("clerk_user_id");

-- CreateIndex
CREATE INDEX "User_tenant_id_idx" ON "User"("tenant_id");

-- CreateIndex
CREATE INDEX "User_tenant_id_created_at_idx" ON "User"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "User_tenant_id_role_idx" ON "User"("tenant_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenant_id_email_key" ON "User"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripe_subscription_id_key" ON "Subscription"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "Subscription_tenant_id_idx" ON "Subscription"("tenant_id");

-- CreateIndex
CREATE INDEX "Subscription_tenant_id_created_at_idx" ON "Subscription"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "Subscription_tenant_id_status_idx" ON "Subscription"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "UserPermission_tenant_id_idx" ON "UserPermission"("tenant_id");

-- CreateIndex
CREATE INDEX "UserPermission_tenant_id_user_id_idx" ON "UserPermission"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "UserPermission_tenant_id_company_id_user_id_idx" ON "UserPermission"("tenant_id", "company_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_tenant_id_company_id_user_id_product_id_perm_key" ON "UserPermission"("tenant_id", "company_id", "user_id", "product_id", "permission");

-- CreateIndex
CREATE INDEX "GravityAdminPermission_admin_id_idx" ON "GravityAdminPermission"("admin_id");

-- CreateIndex
CREATE INDEX "GravityAdminPermission_admin_id_resource_idx" ON "GravityAdminPermission"("admin_id", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "GravityAdminPermission_admin_id_resource_action_key" ON "GravityAdminPermission"("admin_id", "resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "Company_subdomain_key" ON "Company"("subdomain");

-- CreateIndex
CREATE INDEX "Company_tenant_id_idx" ON "Company"("tenant_id");

-- CreateIndex
CREATE INDEX "Company_tenant_id_status_idx" ON "Company"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "Company_tenant_id_created_at_idx" ON "Company"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "UserMembership_tenant_id_idx" ON "UserMembership"("tenant_id");

-- CreateIndex
CREATE INDEX "UserMembership_tenant_id_user_id_idx" ON "UserMembership"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "UserMembership_tenant_id_company_id_idx" ON "UserMembership"("tenant_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserMembership_tenant_id_user_id_company_id_key" ON "UserMembership"("tenant_id", "user_id", "company_id");

-- CreateIndex
CREATE INDEX "ProductConfig_tenant_id_idx" ON "ProductConfig"("tenant_id");

-- CreateIndex
CREATE INDEX "ProductConfig_tenant_id_product_key_idx" ON "ProductConfig"("tenant_id", "product_key");

-- CreateIndex
CREATE INDEX "ProductConfig_tenant_id_is_active_idx" ON "ProductConfig"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "ProductConfig_tenant_id_product_key_key" ON "ProductConfig"("tenant_id", "product_key");

-- CreateIndex
CREATE INDEX "StripeEvent_type_idx" ON "StripeEvent"("type");

-- CreateIndex
CREATE INDEX "StripeEvent_processed_at_idx" ON "StripeEvent"("processed_at");

-- CreateIndex
CREATE INDEX "SupplierTenantAccess_tenant_id_idx" ON "SupplierTenantAccess"("tenant_id");

-- CreateIndex
CREATE INDEX "SupplierTenantAccess_clerk_user_id_idx" ON "SupplierTenantAccess"("clerk_user_id");

-- CreateIndex
CREATE INDEX "SupplierTenantAccess_tenant_id_clerk_user_id_idx" ON "SupplierTenantAccess"("tenant_id", "clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierTenantAccess_clerk_user_id_tenant_id_key" ON "SupplierTenantAccess"("clerk_user_id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceToken_token_hash_key" ON "ServiceToken"("token_hash");

-- CreateIndex
CREATE INDEX "ServiceToken_tenant_id_idx" ON "ServiceToken"("tenant_id");

-- CreateIndex
CREATE INDEX "ServiceToken_tenant_id_user_id_idx" ON "ServiceToken"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "ServiceToken_token_hash_idx" ON "ServiceToken"("token_hash");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMembership" ADD CONSTRAINT "UserMembership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMembership" ADD CONSTRAINT "UserMembership_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductConfig" ADD CONSTRAINT "ProductConfig_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
