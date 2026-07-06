-- Fechamento na plataforma + registro de taxa para admin/boleto

ALTER TYPE "bid_frete_internacional_status_cotacao" ADD VALUE IF NOT EXISTS 'FECHADA';

CREATE TYPE "bid_frete_internacional_status_cobranca_taxa_fechamento" AS ENUM ('PENDENTE', 'ISENTA', 'PAGA');

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "data_fechamento_cotacao_bid_frete_internacional" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "id_usuario_fechamento_cotacao_bid_frete_internacional" TEXT;

CREATE TABLE IF NOT EXISTS "taxa_fechamento_plataforma_bid_frete_internacional" (
  "id_taxa_fechamento_plataforma_bid_frete_internacional" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_produto_gravity" TEXT,
  "id_usuario" TEXT,
  "id_cotacao_bid_frete_internacional" TEXT NOT NULL,
  "id_fornecedor_bid_frete_internacional" TEXT NOT NULL,
  "numero_cotacao_bid_frete_internacional" TEXT NOT NULL,
  "valor_taxa_fechamento_plataforma_bid_frete_internacional" DOUBLE PRECISION NOT NULL,
  "moeda_taxa_fechamento_plataforma_bid_frete_internacional" TEXT NOT NULL DEFAULT 'USD',
  "empresa_pagadora_taxa_fechamento_plataforma_gravity" TEXT NOT NULL,
  "status_cobranca_taxa_fechamento_plataforma_bid_frete_internacional" "bid_frete_internacional_status_cobranca_taxa_fechamento" NOT NULL DEFAULT 'PENDENTE',
  "motivo_isencao_taxa_fechamento_plataforma_bid_frete_internacional" TEXT,
  "data_criacao_taxa_fechamento_plataforma_bid_frete_internacional" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "taxa_fechamento_plataforma_bid_frete_internacional_pkey" PRIMARY KEY ("id_taxa_fechamento_plataforma_bid_frete_internacional")
);

CREATE INDEX IF NOT EXISTS "taxa_fechamento_plataforma_bid_frete_internacional_id_organizacao_idx"
  ON "taxa_fechamento_plataforma_bid_frete_internacional"("id_organizacao");

CREATE INDEX IF NOT EXISTS "taxa_fechamento_plataforma_bid_frete_internacional_id_organizacao_id_produto_gravity_idx"
  ON "taxa_fechamento_plataforma_bid_frete_internacional"("id_organizacao", "id_produto_gravity");

CREATE INDEX IF NOT EXISTS "taxa_fechamento_plataforma_bid_frete_internacional_id_organizacao_id_usuario_idx"
  ON "taxa_fechamento_plataforma_bid_frete_internacional"("id_organizacao", "id_usuario");

CREATE INDEX IF NOT EXISTS "taxa_fechamento_plataforma_bid_frete_internacional_id_organizacao_id_cotacao_bid_frete_internacional_idx"
  ON "taxa_fechamento_plataforma_bid_frete_internacional"("id_organizacao", "id_cotacao_bid_frete_internacional");

CREATE INDEX IF NOT EXISTS "taxa_fechamento_plataforma_bid_frete_internacional_id_organizacao_status_cobranca_taxa_fechamento_plataforma_bid_frete_internacional_idx"
  ON "taxa_fechamento_plataforma_bid_frete_internacional"("id_organizacao", "status_cobranca_taxa_fechamento_plataforma_bid_frete_internacional");
