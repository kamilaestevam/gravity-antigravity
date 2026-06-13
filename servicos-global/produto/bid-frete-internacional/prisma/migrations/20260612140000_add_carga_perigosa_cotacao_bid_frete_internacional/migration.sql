-- Carga perigosa na cotação (espelho catálogo ONU)

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "eh_carga_perigosa_cotacao_bid_frete_internacional" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "numero_onu_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "nome_tecnico_embarque_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "classe_carga_perigosa_cotacao_bid_frete_internacional" INTEGER,
  ADD COLUMN IF NOT EXISTS "divisao_carga_perigosa_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional" TEXT,
  ADD COLUMN IF NOT EXISTS "observacoes_carga_perigosa_cotacao_bid_frete_internacional" TEXT;
