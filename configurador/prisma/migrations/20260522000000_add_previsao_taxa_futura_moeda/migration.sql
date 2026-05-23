-- Migration: add_previsao_taxa_futura_moeda
-- Cria tabela global de projecoes do BACEN Focus (Expectativas de Mercado).
-- Tabela aditiva (CREATE TABLE / CREATE INDEX) — sem ALTER, sem DROP.
-- Idempotente via IF NOT EXISTS — segura para re-execucao.
-- Aplicada em 2026-05-22: gravity-configurador-teste primeiro, gravity-configurador-producao
-- depois via fluxo /deploy com backup pre-migration obrigatorio (backup-policy).

CREATE TABLE IF NOT EXISTS "previsao_taxa_futura_moeda" (
  "id_previsao_taxa_futura_moeda"               TEXT NOT NULL,
  "moeda_previsao_taxa_futura_moeda"            TEXT NOT NULL,
  "mes_previsao_taxa_futura_moeda"              TIMESTAMP(3) NOT NULL,
  "valor_mediano_previsao_taxa_futura_moeda"    DECIMAL(15,6) NOT NULL,
  "valor_medio_previsao_taxa_futura_moeda"      DECIMAL(15,6) NOT NULL,
  "valor_minimo_previsao_taxa_futura_moeda"     DECIMAL(15,6) NOT NULL,
  "valor_maximo_previsao_taxa_futura_moeda"     DECIMAL(15,6) NOT NULL,
  "fonte_previsao_taxa_futura_moeda"            TEXT NOT NULL DEFAULT 'BACEN/Focus',
  "data_previsao_taxa_futura_moeda"             TIMESTAMP(3) NOT NULL,
  "data_criacao_previsao_taxa_futura_moeda"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_previsao_taxa_futura_moeda" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "previsao_taxa_futura_moeda_pkey" PRIMARY KEY ("id_previsao_taxa_futura_moeda")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ptfm_moeda_mes_unq"
  ON "previsao_taxa_futura_moeda" ("moeda_previsao_taxa_futura_moeda", "mes_previsao_taxa_futura_moeda");

CREATE INDEX IF NOT EXISTS "ptfm_moeda_idx"
  ON "previsao_taxa_futura_moeda" ("moeda_previsao_taxa_futura_moeda");

CREATE INDEX IF NOT EXISTS "ptfm_moeda_mes_idx"
  ON "previsao_taxa_futura_moeda" ("moeda_previsao_taxa_futura_moeda", "mes_previsao_taxa_futura_moeda");

CREATE INDEX IF NOT EXISTS "ptfm_mes_idx"
  ON "previsao_taxa_futura_moeda" ("mes_previsao_taxa_futura_moeda");

CREATE INDEX IF NOT EXISTS "ptfm_criacao_idx"
  ON "previsao_taxa_futura_moeda" ("data_criacao_previsao_taxa_futura_moeda");

-- ROLLBACK SQL (manual, NAO incluir em migrations futuras):
-- DROP TABLE IF EXISTS "previsao_taxa_futura_moeda";
-- (Perde dados de sync. Backup pre-migration obrigatorio cobre.)
