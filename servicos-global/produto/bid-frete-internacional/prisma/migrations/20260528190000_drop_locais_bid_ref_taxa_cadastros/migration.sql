DROP TABLE IF EXISTS "local_destino_bid_frete_internacional";
DROP TABLE IF EXISTS "local_origem_bid_frete_internacional";

ALTER TABLE "taxa_origem_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "id_taxa_origem_destino" TEXT;

ALTER TABLE "taxa_destino_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "id_taxa_origem_destino" TEXT;
