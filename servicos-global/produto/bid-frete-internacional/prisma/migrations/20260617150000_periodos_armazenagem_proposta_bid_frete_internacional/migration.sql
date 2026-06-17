-- Períodos de armazenagem na proposta (lista JSON) — substitui colunas escalares únicas

ALTER TABLE "proposta_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "periodos_armazenagem_proposta_bid_frete_internacional" JSONB;

ALTER TABLE "proposta_bid_frete_internacional"
  DROP COLUMN IF EXISTS "valor_armazenagem_reais_proposta_bid_frete_internacional",
  DROP COLUMN IF EXISTS "dias_periodo_armazenagem_proposta_bid_frete_internacional";
