-- Migration: add_deploy_log
-- Cria tabela DeployLog para histórico manual de deploys da plataforma Gravity.
-- Global (não tenant-scoped) — apenas gravity_admin acessa.

-- CreateEnum
CREATE TYPE "DeployEnvironment" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION', 'ALL');

-- CreateEnum
CREATE TYPE "DeployStatus" AS ENUM ('SUCCESS', 'FAILED', 'ROLLBACK', 'IN_PROGRESS');

-- CreateTable
CREATE TABLE "DeployLog" (
    "id" TEXT NOT NULL,
    "deploy_number" SERIAL NOT NULL,
    "area" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "environment" "DeployEnvironment" NOT NULL DEFAULT 'PRODUCTION',
    "status" "DeployStatus" NOT NULL DEFAULT 'SUCCESS',
    "deployed_by" TEXT NOT NULL,
    "deployed_by_user_id" TEXT,
    "deployed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeployLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeployLog_deployed_at_idx" ON "DeployLog"("deployed_at");

-- CreateIndex
CREATE INDEX "DeployLog_area_idx" ON "DeployLog"("area");

-- CreateIndex
CREATE INDEX "DeployLog_environment_idx" ON "DeployLog"("environment");

-- CreateIndex
CREATE INDEX "DeployLog_status_idx" ON "DeployLog"("status");

-- CreateIndex
CREATE INDEX "DeployLog_area_deployed_at_idx" ON "DeployLog"("area", "deployed_at");
