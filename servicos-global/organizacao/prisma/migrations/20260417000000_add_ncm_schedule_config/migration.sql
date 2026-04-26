-- CreateTable: NcmScheduleConfig
-- Singleton global (id = 'default') para configuração do job de sync NCM.
-- tenant_id = '__system__' satisfaz os índices obrigatórios do padrão Gravity.

CREATE TABLE "NcmScheduleConfig" (
    "id"             TEXT         NOT NULL DEFAULT 'default',
    "tenant_id"      TEXT         NOT NULL DEFAULT '__system__',
    "product_id"     TEXT,
    "user_id"        TEXT,
    "ativo"          BOOLEAN      NOT NULL DEFAULT false,
    "cron_expressao" TEXT         NOT NULL DEFAULT '0 2 * * *',
    "notificadores"  JSONB        NOT NULL DEFAULT '[]',
    "criado_em"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NcmScheduleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NcmScheduleConfig_tenant_id_idx" ON "NcmScheduleConfig"("tenant_id");
CREATE INDEX "NcmScheduleConfig_tenant_id_product_id_idx" ON "NcmScheduleConfig"("tenant_id", "product_id");
CREATE INDEX "NcmScheduleConfig_tenant_id_user_id_idx" ON "NcmScheduleConfig"("tenant_id", "user_id");
