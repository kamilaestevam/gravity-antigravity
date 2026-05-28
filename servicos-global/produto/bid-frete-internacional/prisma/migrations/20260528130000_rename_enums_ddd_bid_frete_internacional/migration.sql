-- Renomeia tipos enum legados (BidFrete*) → nomes DDD SSOT (bid_frete_internacional_*)
-- Idempotente via checagem em pg_type.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFreteTipoOperacao') THEN
    ALTER TYPE "BidFreteTipoOperacao" RENAME TO "bid_frete_internacional_tipo_operacao";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFreteModalidade') THEN
    ALTER TYPE "BidFreteModalidade" RENAME TO "bid_frete_internacional_modalidade";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFreteCargaModalidade') THEN
    ALTER TYPE "BidFreteCargaModalidade" RENAME TO "bid_frete_internacional_modalidade_carga";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFreteCotacaoStatus') THEN
    ALTER TYPE "BidFreteCotacaoStatus" RENAME TO "bid_frete_internacional_status_cotacao";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFreteCotacaoVisibilidade') THEN
    ALTER TYPE "BidFreteCotacaoVisibilidade" RENAME TO "bid_frete_internacional_visibilidade";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFreteCotacaoFreteIntCanal') THEN
    ALTER TYPE "BidFreteCotacaoFreteIntCanal" RENAME TO "bid_frete_internacional_canal_disparo";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFreteCotacao') THEN
    ALTER TYPE "BidFreteCotacao" RENAME TO "bid_frete_internacional_status_pedido_cotacao";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFretePropostaStatus') THEN
    ALTER TYPE "BidFretePropostaStatus" RENAME TO "bid_frete_internacional_status_proposta";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFreteTipoFornecedor') THEN
    ALTER TYPE "BidFreteTipoFornecedor" RENAME TO "bid_frete_internacional_tipo_fornecedor";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFreteStatusFornecedor') THEN
    ALTER TYPE "BidFreteStatusFornecedor" RENAME TO "bid_frete_internacional_status_fornecedor";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidFreteIntegracao') THEN
    ALTER TYPE "BidFreteIntegracao" RENAME TO "bid_frete_internacional_tipo_integracao";
  END IF;
END $$;
