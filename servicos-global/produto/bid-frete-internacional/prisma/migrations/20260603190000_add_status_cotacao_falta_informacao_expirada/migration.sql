-- Bancos legados: enum renomeado (BidFreteCotacaoStatus) sem ADD VALUE dos status novos.
-- Queries do dashboard usam FALTA_INFORMACAO e EXPIRADA → erro 500 no Postgres se ausentes.

DO $$ BEGIN
  ALTER TYPE "bid_frete_internacional_status_cotacao" ADD VALUE 'FALTA_INFORMACAO';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "bid_frete_internacional_status_cotacao" ADD VALUE 'EXPIRADA';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
