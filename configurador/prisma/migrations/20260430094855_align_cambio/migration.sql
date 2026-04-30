-- Migration: align_cambio
-- Alinha tabela cambio ao schema DDD (Configurador, Onda 22).
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia, sem backfill).

-- 1. RENAME COLUMNs
ALTER TABLE "cambio" RENAME COLUMN "id"           TO "id_cambio";
ALTER TABLE "cambio" RENAME COLUMN "moeda"        TO "moeda_cambio";
ALTER TABLE "cambio" RENAME COLUMN "compra"       TO "compra_cambio";
ALTER TABLE "cambio" RENAME COLUMN "venda"        TO "venda_cambio";
ALTER TABLE "cambio" RENAME COLUMN "data_cotacao" TO "data_cotacao_cambio";
ALTER TABLE "cambio" RENAME COLUMN "hora_cotacao" TO "hora_cotacao_cambio";
ALTER TABLE "cambio" RENAME COLUMN "boletim"      TO "boletim_cambio";
ALTER TABLE "cambio" RENAME COLUMN "fonte"        TO "fonte_cambio";
ALTER TABLE "cambio" RENAME COLUMN "criado_em"    TO "data_criacao_cambio";

-- 2. RENAME INDEXes (mapeados no schema com cmb_*)
ALTER INDEX "cambio_moeda_data_cotacao_boletim_key" RENAME TO "cmb_moeda_data_boletim_unq";
ALTER INDEX "cambio_moeda_idx"                      RENAME TO "cmb_moeda_idx";
ALTER INDEX "cambio_moeda_data_cotacao_idx"         RENAME TO "cmb_moeda_data_idx";
ALTER INDEX "cambio_data_cotacao_idx"               RENAME TO "cmb_data_idx";
ALTER INDEX "cambio_criado_em_idx"                  RENAME TO "cmb_criacao_idx";
