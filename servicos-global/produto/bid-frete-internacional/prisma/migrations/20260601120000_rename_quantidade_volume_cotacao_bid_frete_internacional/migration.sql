-- Renomeia quantidade_cotacao_bid_frete_internacional → quantidade_volume_cotacao_bid_frete_internacional
-- Idempotente: só renomeia se a coluna antiga existir e a nova ainda não existir.

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cotacao_bid_frete_internacional'
      AND column_name = 'quantidade_cotacao_bid_frete_internacional'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cotacao_bid_frete_internacional'
      AND column_name = 'quantidade_volume_cotacao_bid_frete_internacional'
  ) THEN
    ALTER TABLE "cotacao_bid_frete_internacional"
      RENAME COLUMN "quantidade_cotacao_bid_frete_internacional"
      TO "quantidade_volume_cotacao_bid_frete_internacional";
  END IF;
END $$;
