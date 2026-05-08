-- Plataforma migration — F2 do API Cockpit Monitor LLM
-- Aplicada em CADA schema tenant_<cuid> via migrate-all-tenants.ts.
--
-- Espelho per-org da migracao GLOBAL em
--   configurador/prisma/migrations/20260508120000_gabi_limites_monetarios_global/migration.sql

-- ---------------------------------------------------------------------------
-- Limite monetario por organizacao (e opcionalmente por modelo)
-- ---------------------------------------------------------------------------
CREATE TABLE "gabi_limite_monetario" (
    "id_gabi_limite_monetario"             TEXT          NOT NULL,
    "id_organizacao_gabi_limite_monetario" TEXT          NOT NULL,
    "modelo_gabi_limite_monetario"         TEXT,
    "limite_aviso_usd_gabi_limite_monetario"    DECIMAL(12,2) NOT NULL,
    "limite_bloqueio_usd_gabi_limite_monetario" DECIMAL(12,2) NOT NULL,
    "destinatarios_email_gabi_limite_monetario" TEXT[],
    "ativo_gabi_limite_monetario"          BOOLEAN       NOT NULL DEFAULT true,
    "data_criacao_gabi_limite_monetario"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_gabi_limite_monetario" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gabi_limite_monetario_pkey"
        PRIMARY KEY ("id_gabi_limite_monetario")
);

-- (id_organizacao, modelo) unico. modelo pode ser NULL ("todos os modelos"),
-- entao usamos COALESCE com sentinela para unicidade portatil (PG14+).
CREATE UNIQUE INDEX "glm_unq_org_modelo"
    ON "gabi_limite_monetario" (
        "id_organizacao_gabi_limite_monetario",
        COALESCE("modelo_gabi_limite_monetario", '__ALL__')
    );

CREATE INDEX "glm_org_idx"
    ON "gabi_limite_monetario" ("id_organizacao_gabi_limite_monetario");

CREATE INDEX "glm_org_modelo_idx"
    ON "gabi_limite_monetario" (
        "id_organizacao_gabi_limite_monetario",
        "modelo_gabi_limite_monetario"
    );

-- ---------------------------------------------------------------------------
-- Alerta emitido por organizacao (idempotencia de e-mail)
-- ---------------------------------------------------------------------------
CREATE TABLE "gabi_alerta_emitido" (
    "id_gabi_alerta_emitido"             TEXT          NOT NULL,
    "id_organizacao_gabi_alerta_emitido" TEXT          NOT NULL,
    "id_limite_gabi_alerta_emitido"      TEXT          NOT NULL,
    "mes_ref_gabi_alerta_emitido"        TEXT          NOT NULL,
    "nivel_gabi_alerta_emitido"          TEXT          NOT NULL,
    "gasto_usd_gabi_alerta_emitido"      DECIMAL(12,2) NOT NULL,
    "data_criacao_gabi_alerta_emitido"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gabi_alerta_emitido_pkey"
        PRIMARY KEY ("id_gabi_alerta_emitido")
);

-- Idempotencia: 1 e-mail por (limite, mes_ref, nivel)
CREATE UNIQUE INDEX "gae_unq_limite_mes_nivel"
    ON "gabi_alerta_emitido" (
        "id_limite_gabi_alerta_emitido",
        "mes_ref_gabi_alerta_emitido",
        "nivel_gabi_alerta_emitido"
    );

CREATE INDEX "gae_org_idx"
    ON "gabi_alerta_emitido" ("id_organizacao_gabi_alerta_emitido");

CREATE INDEX "gae_org_mes_idx"
    ON "gabi_alerta_emitido" (
        "id_organizacao_gabi_alerta_emitido",
        "mes_ref_gabi_alerta_emitido"
    );
