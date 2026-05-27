-- Migration DDD — BID Frete Internacional (renomeação tabelas legadas bid_*)

ALTER TABLE IF EXISTS "bid_fornecedores" RENAME TO "fornecedor_bid_frete_internacional";
ALTER TABLE IF EXISTS "bid_cotacoes" RENAME TO "cotacao_bid_frete_internacional";
ALTER TABLE IF EXISTS "bid_requests" RENAME TO "disparo_cotacao_bid_frete_internacional";
ALTER TABLE IF EXISTS "bid_responses" RENAME TO "proposta_bid_frete_internacional";
ALTER TABLE IF EXISTS "bid_tabelas_preco" RENAME TO "tabela_bid_frete_internacional";
ALTER TABLE IF EXISTS "bid_avaliacoes" RENAME TO "avaliacao_bid_frete_internacional";
ALTER TABLE IF EXISTS "bid_rating_fornecedor_global" RENAME TO "classificacao_bid_frete_internacional";
ALTER TABLE IF EXISTS "bid_savings" RENAME TO "ganho_bid_frete_internacional";
ALTER TABLE IF EXISTS "bid_connector_configs" RENAME TO "integracao_bid_frete_internacional";
ALTER TABLE IF EXISTS "status_cotacao_bid_frete" RENAME TO "status_cotacao_config_bid_frete_internacional";
ALTER TABLE IF EXISTS "bid_portos" RENAME TO "local_origem_bid_frete_internacional";

-- Colunas disparo (pedido → disparo), quando ainda legadas
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'id_pedido_cotacao_bid_frete_internacional') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "id_pedido_cotacao_bid_frete_internacional" TO "id_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'id_pedido_cotacao_bid_frete_internacional') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "id_pedido_cotacao_bid_frete_internacional" TO "id_disparo_cotacao_bid_frete_internacional";
  END IF;
END $$;

-- Novas tabelas (criadas vazias se não existirem — Prisma migrate deploy alinha com fragment)
CREATE TABLE IF NOT EXISTS "local_destino_bid_frete_internacional" (
  "id_local_destino_bid_frete_internacional" TEXT NOT NULL,
  "codigo_local_destino_bid_frete_internacional" TEXT NOT NULL,
  "nome_local_destino_bid_frete_internacional" TEXT NOT NULL,
  "pais_local_destino_bid_frete_internacional" TEXT NOT NULL,
  "pais_codigo_local_destino_bid_frete_internacional" TEXT NOT NULL,
  "tipo_local_destino_bid_frete_internacional" TEXT NOT NULL,
  "latitude_local_destino_bid_frete_internacional" DOUBLE PRECISION,
  "longitude_local_destino_bid_frete_internacional" DOUBLE PRECISION,
  "ativo_local_destino_bid_frete_internacional" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "local_destino_bid_frete_internacional_pkey" PRIMARY KEY ("id_local_destino_bid_frete_internacional")
);

CREATE TABLE IF NOT EXISTS "taxa_origem_bid_frete_internacional" (
  "id_taxa_origem_bid_frete_internacional" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_proposta_bid_frete_internacional" TEXT NOT NULL,
  "nome_taxa_origem_bid_frete_internacional" TEXT NOT NULL,
  "valor_taxa_origem_bid_frete_internacional" DOUBLE PRECISION NOT NULL,
  "moeda_taxa_origem_bid_frete_internacional" TEXT NOT NULL DEFAULT 'USD',
  CONSTRAINT "taxa_origem_bid_frete_internacional_pkey" PRIMARY KEY ("id_taxa_origem_bid_frete_internacional")
);

CREATE TABLE IF NOT EXISTS "taxa_destino_bid_frete_internacional" (
  "id_taxa_destino_bid_frete_internacional" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_proposta_bid_frete_internacional" TEXT NOT NULL,
  "nome_taxa_destino_bid_frete_internacional" TEXT NOT NULL,
  "valor_taxa_destino_bid_frete_internacional" DOUBLE PRECISION NOT NULL,
  "moeda_taxa_destino_bid_frete_internacional" TEXT NOT NULL DEFAULT 'USD',
  CONSTRAINT "taxa_destino_bid_frete_internacional_pkey" PRIMARY KEY ("id_taxa_destino_bid_frete_internacional")
);

CREATE TABLE IF NOT EXISTS "disparo_proposta_bid_frete_internacional" (
  "id_disparo_proposta_bid_frete_internacional" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_proposta_bid_frete_internacional" TEXT NOT NULL,
  "canal_disparo_proposta_bid_frete_internacional" TEXT NOT NULL DEFAULT 'EMAIL',
  "status_disparo_proposta_bid_frete_internacional" TEXT NOT NULL DEFAULT 'PENDENTE',
  "data_criacao_disparo_proposta_bid_frete_internacional" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_disparo_proposta_bid_frete_internacional" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "disparo_proposta_bid_frete_internacional_pkey" PRIMARY KEY ("id_disparo_proposta_bid_frete_internacional")
);
