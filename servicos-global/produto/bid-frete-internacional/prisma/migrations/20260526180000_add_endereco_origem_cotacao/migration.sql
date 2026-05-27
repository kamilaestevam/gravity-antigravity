-- Endereço completo de origem (opcional) — complementa zipcode_origem na cotação
ALTER TABLE "cotacao_bid_frete_internacional"
ADD COLUMN IF NOT EXISTS "endereco_origem_cotacao_bid_frete_internacional" TEXT;
