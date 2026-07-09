-- HS Code (padrão DDD, ao lado do NCM) + dimensões detalhadas de cubagem na cotação

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "hs_code_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "codigo_unidade_cubagem_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "comprimento_cubagem_cotacao_bid_frete_internacional" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "largura_cubagem_cotacao_bid_frete_internacional" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "altura_cubagem_cotacao_bid_frete_internacional" DOUBLE PRECISION;
