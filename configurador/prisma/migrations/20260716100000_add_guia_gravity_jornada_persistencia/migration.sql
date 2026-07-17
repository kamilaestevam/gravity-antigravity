-- Migration: add_guia_gravity_jornada_persistencia
-- Persiste jornada, conclusões de aula e certificados do Guia Gravity (University)
-- no gravity-configurador.public — substitui sessionStorage.
-- Aprovado pelo Coordenador em 2026-07-16.

CREATE TYPE "TipoCertificadoGuiaGravity" AS ENUM (
  'MODULO_BASICO',
  'PEDIDO',
  'BID_FRETE',
  'SMART_READ'
);

CREATE TABLE "guia_gravity_jornada_usuario" (
    "id_guia_gravity_jornada_usuario"               TEXT NOT NULL,
    "id_organizacao"                               TEXT NOT NULL,
    "id_usuario"                                   TEXT NOT NULL,
    "data_inicio_jornada_guia_gravity"             TIMESTAMP(3) NOT NULL,
    "dias_ofensiva_guia_gravity"                   INTEGER NOT NULL DEFAULT 0,
    "data_ultima_atividade_jornada_guia_gravity"   TIMESTAMP(3),
    "data_criacao_guia_gravity_jornada_usuario"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_guia_gravity_jornada_usuario" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guia_gravity_jornada_usuario_pkey" PRIMARY KEY ("id_guia_gravity_jornada_usuario")
);

CREATE TABLE "guia_gravity_aula_conclusao" (
    "id_guia_gravity_aula_conclusao"               TEXT NOT NULL,
    "id_organizacao"                               TEXT NOT NULL,
    "id_usuario"                                   TEXT NOT NULL,
    "slug_aula_guia_gravity"                       TEXT NOT NULL,
    "slug_produto_guia_gravity"                    TEXT NOT NULL,
    "xp_conquistado_aula_guia_gravity"             DECIMAL(10,2) NOT NULL,
    "data_conclusao_aula_guia_gravity"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_criacao_guia_gravity_aula_conclusao"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_guia_gravity_aula_conclusao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guia_gravity_aula_conclusao_pkey" PRIMARY KEY ("id_guia_gravity_aula_conclusao")
);

CREATE TABLE "guia_gravity_certificado_emitido" (
    "id_guia_gravity_certificado_emitido"               TEXT NOT NULL,
    "id_organizacao"                                   TEXT NOT NULL,
    "id_usuario"                                       TEXT NOT NULL,
    "tipo_certificado_guia_gravity"                    "TipoCertificadoGuiaGravity" NOT NULL,
    "numero_certificado_guia_gravity"                  TEXT NOT NULL,
    "codigo_verificacao_certificado_guia_gravity"      TEXT NOT NULL,
    "data_emissao_certificado_guia_gravity"            TIMESTAMP(3) NOT NULL,
    "xp_modulo_certificado_guia_gravity"               INTEGER NOT NULL,
    "nivel_certificado_guia_gravity"                   INTEGER NOT NULL,
    "data_criacao_guia_gravity_certificado_emitido"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_guia_gravity_certificado_emitido" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guia_gravity_certificado_emitido_pkey" PRIMARY KEY ("id_guia_gravity_certificado_emitido")
);

CREATE UNIQUE INDEX "ggju_org_usuario_key" ON "guia_gravity_jornada_usuario"("id_organizacao", "id_usuario");
CREATE INDEX "ggju_org_idx" ON "guia_gravity_jornada_usuario"("id_organizacao");
CREATE INDEX "ggju_org_usuario_idx" ON "guia_gravity_jornada_usuario"("id_organizacao", "id_usuario");

CREATE UNIQUE INDEX "ggac_org_usuario_aula_key" ON "guia_gravity_aula_conclusao"("id_organizacao", "id_usuario", "slug_aula_guia_gravity");
CREATE INDEX "ggac_org_idx" ON "guia_gravity_aula_conclusao"("id_organizacao");
CREATE INDEX "ggac_org_usuario_idx" ON "guia_gravity_aula_conclusao"("id_organizacao", "id_usuario");
CREATE INDEX "ggac_org_produto_idx" ON "guia_gravity_aula_conclusao"("id_organizacao", "slug_produto_guia_gravity");

CREATE UNIQUE INDEX "ggce_codigo_verificacao_key" ON "guia_gravity_certificado_emitido"("codigo_verificacao_certificado_guia_gravity");
CREATE UNIQUE INDEX "ggce_org_usuario_tipo_key" ON "guia_gravity_certificado_emitido"("id_organizacao", "id_usuario", "tipo_certificado_guia_gravity");
CREATE INDEX "ggce_org_idx" ON "guia_gravity_certificado_emitido"("id_organizacao");
CREATE INDEX "ggce_org_usuario_idx" ON "guia_gravity_certificado_emitido"("id_organizacao", "id_usuario");

ALTER TABLE "guia_gravity_jornada_usuario"
    ADD CONSTRAINT "ggju_id_organizacao_fkey"
    FOREIGN KEY ("id_organizacao") REFERENCES "organizacao"("id_organizacao")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "guia_gravity_jornada_usuario"
    ADD CONSTRAINT "ggju_id_usuario_fkey"
    FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "guia_gravity_aula_conclusao"
    ADD CONSTRAINT "ggac_id_organizacao_fkey"
    FOREIGN KEY ("id_organizacao") REFERENCES "organizacao"("id_organizacao")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "guia_gravity_aula_conclusao"
    ADD CONSTRAINT "ggac_id_usuario_fkey"
    FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "guia_gravity_certificado_emitido"
    ADD CONSTRAINT "ggce_id_organizacao_fkey"
    FOREIGN KEY ("id_organizacao") REFERENCES "organizacao"("id_organizacao")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "guia_gravity_certificado_emitido"
    ADD CONSTRAINT "ggce_id_usuario_fkey"
    FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario")
    ON DELETE CASCADE ON UPDATE CASCADE;
