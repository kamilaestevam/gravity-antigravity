-- Registro append-only de alterações em proposta (rastreabilidade fornecedor)
-- Idempotente: safe re-run após falha parcial (índice/tabela já existente).

DO $$ BEGIN
  CREATE TYPE "BidFreteInternacionalTipoRegistroAlteracaoProposta" AS ENUM ('CRIAR', 'ATUALIZAR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BidFreteInternacionalOrigemRegistroAlteracaoProposta" AS ENUM ('PORTAL', 'LINK_PUBLICO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "registro_alteracao_proposta_bid_frete_internacional" (
    "id_registro_alteracao_proposta_bid_frete_internacional" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_proposta_bid_frete_internacional" TEXT NOT NULL,
    "id_cotacao_bid_frete_internacional" TEXT NOT NULL,
    "tipo_registro_alteracao_proposta_bid_frete_internacional" "BidFreteInternacionalTipoRegistroAlteracaoProposta" NOT NULL,
    "origem_registro_alteracao_proposta_bid_frete_internacional" "BidFreteInternacionalOrigemRegistroAlteracaoProposta" NOT NULL,
    "snapshot_antes_registro_alteracao_proposta_bid_frete_internacional" JSONB,
    "snapshot_depois_registro_alteracao_proposta_bid_frete_internacional" JSONB NOT NULL,
    "alteracoes_registro_alteracao_proposta_bid_frete_internacional" JSONB NOT NULL,
    "data_registro_alteracao_proposta_bid_frete_internacional" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registro_alteracao_proposta_bid_frete_internacional_pkey" PRIMARY KEY ("id_registro_alteracao_proposta_bid_frete_internacional")
);

CREATE INDEX IF NOT EXISTS "registro_alteracao_proposta_bid_frete_internacional_id_organizacao_idx" ON "registro_alteracao_proposta_bid_frete_internacional"("id_organizacao");
CREATE INDEX IF NOT EXISTS "registro_alteracao_proposta_bid_frete_internacional_id_organizacao_id_produto_gravity_idx" ON "registro_alteracao_proposta_bid_frete_internacional"("id_organizacao", "id_produto_gravity");
CREATE INDEX IF NOT EXISTS "registro_alteracao_proposta_bid_frete_internacional_id_organizacao_id_cotacao_bid_frete_internacional_idx" ON "registro_alteracao_proposta_bid_frete_internacional"("id_organizacao", "id_cotacao_bid_frete_internacional");
CREATE INDEX IF NOT EXISTS "registro_alteracao_proposta_bid_frete_internacional_id_organizacao_id_proposta_bid_frete_internacional_idx" ON "registro_alteracao_proposta_bid_frete_internacional"("id_organizacao", "id_proposta_bid_frete_internacional");

DO $$ BEGIN
  ALTER TABLE "registro_alteracao_proposta_bid_frete_internacional" ADD CONSTRAINT "registro_alteracao_proposta_bid_frete_internacional_id_proposta_bid_frete_internacional_fkey" FOREIGN KEY ("id_proposta_bid_frete_internacional") REFERENCES "proposta_bid_frete_internacional"("id_proposta_bid_frete_internacional") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "registro_alteracao_proposta_bid_frete_internacional" ADD CONSTRAINT "registro_alteracao_proposta_bid_frete_internacional_id_cotacao_bid_frete_internacional_fkey" FOREIGN KEY ("id_cotacao_bid_frete_internacional") REFERENCES "cotacao_bid_frete_internacional"("id_cotacao_bid_frete_internacional") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
