-- Alinha coluna proposta ao fragment.prisma (via_tabela_proposta_bid_frete_internacional).
-- Migration 20260528120000 renomeou para via_tabela_valor_* por engano.

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposta_bid_frete_internacional'
      AND column_name = 'via_tabela_valor_proposta_bid_frete_internacional'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposta_bid_frete_internacional'
      AND column_name = 'via_tabela_proposta_bid_frete_internacional'
  ) THEN
    ALTER TABLE "proposta_bid_frete_internacional"
      RENAME COLUMN "via_tabela_valor_proposta_bid_frete_internacional"
      TO "via_tabela_proposta_bid_frete_internacional";
  END IF;
END $$;
