-- Modal Aéreo — tipo de valor do frete na proposta:
-- TOTAL = frete total em valor_frete_proposta_bid_frete_internacional
-- FAIXA_PESO = lista JSON em faixas_valor_frete_kgs_proposta_bid_frete_internacional (fornecedor define faixas)

CREATE TYPE "bid_frete_internacional_tipo_valor_frete_proposta" AS ENUM ('TOTAL', 'FAIXA_PESO');

CREATE TYPE "bid_frete_internacional_unidade_faixa_valor_frete_kgs_proposta" AS ENUM ('KG', 'M3');

ALTER TABLE "proposta_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "tipo_valor_frete_proposta_bid_frete_internacional" "bid_frete_internacional_tipo_valor_frete_proposta" NOT NULL DEFAULT 'TOTAL';

ALTER TABLE "proposta_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "faixas_valor_frete_kgs_proposta_bid_frete_internacional" JSONB;
