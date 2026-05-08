-- Configurador-db migration — F2 do API Cockpit Monitor LLM
-- Adiciona limites monetarios GLOBAIS (cross-organizacao) e tabela de
-- idempotencia de e-mails do worker.
--
-- Bilancia com a migracao espelho aplicada em cada tenant_<cuid> via
-- migrate-all-tenants.ts (arquivo:
--   servicos-global/servicos-plataforma/prisma/migrations/
--   20260508120100_gabi_limites_monetarios/migration.sql).

-- ---------------------------------------------------------------------------
-- Limite monetario GLOBAL (cross-org)
-- ---------------------------------------------------------------------------
CREATE TABLE "gabi_limite_monetario_global" (
    "id_gabi_limite_monetario_global"                  TEXT          NOT NULL,
    "modelo_gabi_limite_monetario_global"              TEXT,
    "limite_aviso_usd_gabi_limite_monetario_global"    DECIMAL(12,2) NOT NULL,
    "limite_bloqueio_usd_gabi_limite_monetario_global" DECIMAL(12,2) NOT NULL,
    "destinatarios_email_gabi_limite_monetario_global" TEXT[],
    "ativo_gabi_limite_monetario_global"               BOOLEAN       NOT NULL DEFAULT true,
    "data_criacao_gabi_limite_monetario_global"        TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_gabi_limite_monetario_global"    TIMESTAMP(3)  NOT NULL,

    CONSTRAINT "gabi_limite_monetario_global_pkey"
        PRIMARY KEY ("id_gabi_limite_monetario_global")
);

-- 1 limite por modelo. Como modelo pode ser NULL ("todos os modelos") e
-- NULL <> NULL no Postgres pre-15, usamos COALESCE com sentinela para
-- garantir unicidade portatil.
CREATE UNIQUE INDEX "gabi_limite_monetario_global_unq_modelo"
    ON "gabi_limite_monetario_global" (
        COALESCE("modelo_gabi_limite_monetario_global", '__ALL__')
    );

-- ---------------------------------------------------------------------------
-- Alerta emitido GLOBAL (idempotencia para nao spammar e-mail)
-- ---------------------------------------------------------------------------
CREATE TABLE "gabi_alerta_emitido_global" (
    "id_gabi_alerta_emitido_global"           TEXT          NOT NULL,
    "id_limite_gabi_alerta_emitido_global"    TEXT          NOT NULL,
    "mes_ref_gabi_alerta_emitido_global"      TEXT          NOT NULL,
    "nivel_gabi_alerta_emitido_global"        TEXT          NOT NULL,
    "gasto_usd_gabi_alerta_emitido_global"    DECIMAL(12,2) NOT NULL,
    "data_criacao_gabi_alerta_emitido_global" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gabi_alerta_emitido_global_pkey"
        PRIMARY KEY ("id_gabi_alerta_emitido_global")
);

-- Idempotencia: 1 e-mail por (limite, mes_ref, nivel)
CREATE UNIQUE INDEX "gabi_alerta_emitido_global_unq"
    ON "gabi_alerta_emitido_global" (
        "id_limite_gabi_alerta_emitido_global",
        "mes_ref_gabi_alerta_emitido_global",
        "nivel_gabi_alerta_emitido_global"
    );

CREATE INDEX "gabi_alerta_emitido_global_mes_idx"
    ON "gabi_alerta_emitido_global" ("mes_ref_gabi_alerta_emitido_global");
