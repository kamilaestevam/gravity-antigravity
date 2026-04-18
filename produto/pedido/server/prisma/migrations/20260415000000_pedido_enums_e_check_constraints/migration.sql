-- ─── 1. Criar tipos enum (Postgres CREATE TYPE) ──────────────────────────────
-- Esses tipos são definidos no schema.prisma mas ainda NÃO são usados pelos
-- campos. Após limpar dados sujos com seed --clean, uma segunda migration
-- vai trocar os tipos String dos campos do model Pedido para esses enums.

DO $$ BEGIN
  CREATE TYPE "StatusPedido" AS ENUM ('draft', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "TipoOperacao" AS ENUM ('importacao', 'exportacao');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "MoedaPedido" AS ENUM ('USD', 'EUR', 'CNY', 'JPY', 'GBP', 'BRL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "IncotermPedido" AS ENUM ('FOB', 'CIF', 'EXW', 'CFR', 'FCA', 'DDP', 'DAP', 'CPT', 'CIP', 'DPU', 'FAS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "UnidadeComercializada" AS ENUM ('UNID', 'KG', 'TON', 'M', 'M2', 'M3', 'LT', 'PARES', 'DUZIA', 'JOGO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 2. CHECK constraints de invariantes do PedidoItem ──────────────────────
-- Defesa em profundidade: mesmo se o código tiver bug, o banco rejeita.

ALTER TABLE "pedido_itens"
  ADD CONSTRAINT "pedido_itens_saldo_nao_negativo"
    CHECK ("saldo_item_pedido" >= 0);

ALTER TABLE "pedido_itens"
  ADD CONSTRAINT "pedido_itens_cancelada_lt_inicial"
    CHECK ("quantidade_cancelada_item_pedido" <= "quantidade_inicial_item_pedido");

ALTER TABLE "pedido_itens"
  ADD CONSTRAINT "pedido_itens_transferida_lt_inicial"
    CHECK ("quantidade_transferida_item_pedido" <= "quantidade_inicial_item_pedido");

ALTER TABLE "pedido_itens"
  ADD CONSTRAINT "pedido_itens_pronta_nao_negativa"
    CHECK ("quantidade_pronta_total_item_pedido" >= 0);

ALTER TABLE "pedido_itens"
  ADD CONSTRAINT "pedido_itens_inicial_nao_negativa"
    CHECK ("quantidade_inicial_item_pedido" >= 0);
