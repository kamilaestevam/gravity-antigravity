-- Armazéns alfandegados de preferência da desova (Marítimo LCL + incluir armazenagem)

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "nomes_armazem_alfandegado_cotacao_bid_frete_internacional" JSONB;
