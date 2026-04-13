-- Migration: add_ncm_sync_service
-- Cria as tabelas NcmItem e NcmSyncLog para o serviço de sincronização NCM
-- com o Portal Único Siscomex.

-- Enums
CREATE TYPE "NcmSyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'ERROR');
CREATE TYPE "NcmSyncOrigem" AS ENUM ('JOB', 'MANUAL');

-- Tabela: NcmSyncLog
CREATE TABLE "NcmSyncLog" (
    "id"            TEXT NOT NULL,
    "tenant_id"     TEXT NOT NULL,
    "product_id"    TEXT,
    "user_id"       TEXT,
    "iniciado_em"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido_em"  TIMESTAMP(3),
    "status"        "NcmSyncStatus" NOT NULL DEFAULT 'RUNNING',
    "total"         INTEGER NOT NULL DEFAULT 0,
    "adicionados"   INTEGER NOT NULL DEFAULT 0,
    "alterados"     INTEGER NOT NULL DEFAULT 0,
    "removidos"     INTEGER NOT NULL DEFAULT 0,
    "origem"        "NcmSyncOrigem" NOT NULL DEFAULT 'JOB',
    "disparado_por" TEXT,
    "erro_msg"      TEXT,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NcmSyncLog_pkey" PRIMARY KEY ("id")
);

-- Tabela: NcmItem
CREATE TABLE "NcmItem" (
    "id"          TEXT NOT NULL,
    "tenant_id"   TEXT NOT NULL,
    "product_id"  TEXT,
    "user_id"     TEXT,
    "codigo"      TEXT NOT NULL,
    "descricao"   TEXT NOT NULL,
    "ativo"       BOOLEAN NOT NULL DEFAULT true,
    "data_inicio" TIMESTAMP(3),
    "data_fim"    TIMESTAMP(3),
    "sync_id"     TEXT NOT NULL,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NcmItem_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: um NCM por tenant
CREATE UNIQUE INDEX "NcmItem_tenant_id_codigo_key" ON "NcmItem"("tenant_id", "codigo");

-- Índices NcmItem
CREATE INDEX "NcmItem_tenant_id_idx"        ON "NcmItem"("tenant_id");
CREATE INDEX "NcmItem_tenant_id_product_id_idx" ON "NcmItem"("tenant_id", "product_id");
CREATE INDEX "NcmItem_tenant_id_user_id_idx" ON "NcmItem"("tenant_id", "user_id");
CREATE INDEX "NcmItem_tenant_id_ativo_idx"   ON "NcmItem"("tenant_id", "ativo");
CREATE INDEX "NcmItem_tenant_id_codigo_idx"  ON "NcmItem"("tenant_id", "codigo");

-- Índices NcmSyncLog
CREATE INDEX "NcmSyncLog_tenant_id_idx"             ON "NcmSyncLog"("tenant_id");
CREATE INDEX "NcmSyncLog_tenant_id_product_id_idx"  ON "NcmSyncLog"("tenant_id", "product_id");
CREATE INDEX "NcmSyncLog_tenant_id_user_id_idx"     ON "NcmSyncLog"("tenant_id", "user_id");
CREATE INDEX "NcmSyncLog_tenant_id_status_idx"      ON "NcmSyncLog"("tenant_id", "status");
CREATE INDEX "NcmSyncLog_tenant_id_iniciado_em_idx" ON "NcmSyncLog"("tenant_id", "iniciado_em");
