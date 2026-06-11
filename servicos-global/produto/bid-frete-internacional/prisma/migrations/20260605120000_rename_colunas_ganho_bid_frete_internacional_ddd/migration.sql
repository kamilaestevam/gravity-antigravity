-- Renomeia colunas legadas (curtas) → DDD na tabela ganho_bid_frete_internacional.
-- Idempotente: só renomeia se a coluna antiga existir.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'id_ganho_bid_frete_internacional') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "id" TO "id_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'valor_target') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "valor_target" TO "valor_meta_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'valor_aprovado') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "valor_aprovado" TO "valor_aprovado_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'valor_medio') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "valor_medio" TO "valor_medio_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'saving_vs_target') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "saving_vs_target" TO "ganho_vs_meta_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'saving_vs_media') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "saving_vs_media" TO "ganho_vs_media_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'saving_percentual') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "saving_percentual" TO "ganho_percentual_ganho_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional' AND column_name = 'moeda') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "moeda" TO "moeda_ganho_bid_frete_internacional";
  END IF;
END $$;
