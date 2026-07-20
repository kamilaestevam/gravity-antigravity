-- Migration: add_guia_gravity_manual_lido
-- Persiste manuais lidos fora da Academy (Guia Gravity /docs).
-- Aprovado Coordenador 2026-07-16.

CREATE TABLE "guia_gravity_manual_lido" (
    "id_guia_gravity_manual_lido"               TEXT NOT NULL,
    "id_organizacao"                           TEXT NOT NULL,
    "id_usuario"                               TEXT NOT NULL,
    "slug_manual_guia_gravity"                 TEXT NOT NULL,
    "data_leitura_manual_guia_gravity"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_criacao_guia_gravity_manual_lido"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_guia_gravity_manual_lido" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guia_gravity_manual_lido_pkey" PRIMARY KEY ("id_guia_gravity_manual_lido")
);

CREATE UNIQUE INDEX "ggml_org_usuario_manual_key" ON "guia_gravity_manual_lido"("id_organizacao", "id_usuario", "slug_manual_guia_gravity");
CREATE INDEX "ggml_org_idx" ON "guia_gravity_manual_lido"("id_organizacao");
CREATE INDEX "ggml_org_usuario_idx" ON "guia_gravity_manual_lido"("id_organizacao", "id_usuario");

ALTER TABLE "guia_gravity_manual_lido"
    ADD CONSTRAINT "ggml_id_organizacao_fkey"
    FOREIGN KEY ("id_organizacao") REFERENCES "organizacao"("id_organizacao")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "guia_gravity_manual_lido"
    ADD CONSTRAINT "ggml_id_usuario_fkey"
    FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario")
    ON DELETE CASCADE ON UPDATE CASCADE;
