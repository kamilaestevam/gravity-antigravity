-- Modal Aéreo — tipo de valor do frete (cotação + proposta):
-- TOTAL = valor único; FAIXA_PESO = lista JSON (fornecedor/comprador define faixas livremente)

CREATE TYPE "bid_frete_internacional_tipo_valor_frete" AS ENUM ('TOTAL', 'FAIXA_PESO');

CREATE TYPE "bid_frete_internacional_unidade_faixa_valor_frete_kgs" AS ENUM ('KG', 'M3');

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "tipo_valor_frete_cotacao_bid_frete_internacional" "bid_frete_internacional_tipo_valor_frete" NOT NULL DEFAULT 'TOTAL';

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "faixas_valor_frete_kgs_cotacao_bid_frete_internacional" JSONB;

ALTER TABLE "proposta_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "tipo_valor_frete_proposta_bid_frete_internacional" "bid_frete_internacional_tipo_valor_frete" NOT NULL DEFAULT 'TOTAL';

ALTER TABLE "proposta_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "faixas_valor_frete_kgs_proposta_bid_frete_internacional" JSONB;
