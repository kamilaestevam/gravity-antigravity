-- Status COTACAO_ALTERADA + flag fornecedor_pode_alterar_proposta na cotação

DO $$ BEGIN
  ALTER TYPE "bid_frete_internacional_status_cotacao" ADD VALUE 'COTACAO_ALTERADA';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "fornecedor_pode_alterar_proposta_cotacao_bid_frete_internacional" BOOLEAN NOT NULL DEFAULT true;
