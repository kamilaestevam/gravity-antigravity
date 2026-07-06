-- Status APROVACAO_RECEBIDA + token público de aceite do ganhador (e-mail pós-aprovação)

ALTER TYPE "bid_frete_internacional_status_proposta" ADD VALUE IF NOT EXISTS 'APROVACAO_RECEBIDA';

ALTER TABLE "proposta_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "token_aceite_aprovacao_proposta_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "data_aceite_aprovacao_proposta_bid_frete_internacional" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_token_aceite_aprovacao_proposta_bid_frete_internacional_key"
  ON "proposta_bid_frete_internacional"("token_aceite_aprovacao_proposta_bid_frete_internacional");

CREATE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_token_aceite_aprovacao_proposta_bid_frete_internacional_idx"
  ON "proposta_bid_frete_internacional"("token_aceite_aprovacao_proposta_bid_frete_internacional");
