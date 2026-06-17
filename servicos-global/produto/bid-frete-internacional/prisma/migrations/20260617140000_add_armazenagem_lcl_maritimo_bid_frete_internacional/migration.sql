-- Armazenagem condicional Marítimo LCL — cotação (comprador) e proposta (fornecedor)

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "incluir_armazenagem_cotacao_bid_frete_internacional" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "proposta_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "valor_armazenagem_reais_proposta_bid_frete_internacional" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "dias_periodo_armazenagem_proposta_bid_frete_internacional" INTEGER;
