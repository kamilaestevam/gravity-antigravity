-- ============================================================
-- Migration: rename_fields_final_names
-- Alinha todos os nomes de coluna do banco com os nomes do PDF.
-- Remove dependência de @map() no schema.prisma.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. pedidos_comerciais — RENAME
-- ────────────────────────────────────────────────────────────

ALTER TABLE "pedidos_comerciais" RENAME COLUMN "casas_decimais_total_pedido"            TO "casas_decimais_valor_pedido";
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "casas_decimais_quantidade_total_pedido" TO "casas_decimais_quantidade_pedido";
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "cobertura_cambial"                      TO "cobertura_cambial_pedido";
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "condicao_pagamento"                     TO "condicao_pagamento_pedido";
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "valor_total_cambio"                     TO "valor_total_cambio_pedido";
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "moeda_cambio"                           TO "moeda_cambio_pedido";
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "taxa_cambio_estimada"                   TO "taxa_cambio_estimada_pedido";
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "contrato_cambio_id"                     TO "contrato_cambio_id_pedido";
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "created_at"                             TO "pedido_criado_em";
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "updated_at"                             TO "pedido_atualizado_em";

-- quantidade_total_pedido: DOUBLE PRECISION → DECIMAL(18,6) + rename
ALTER TABLE "pedidos_comerciais"
  ALTER COLUMN "quantidade_total_pedido" TYPE DECIMAL(18,6)
  USING "quantidade_total_pedido"::DECIMAL(18,6);
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "quantidade_total_pedido" TO "quantidade_total_inicial_pedido";

-- pedidos_origem: TEXT[] → JSONB + rename
ALTER TABLE "pedidos_comerciais"
  ALTER COLUMN "pedidos_origem" TYPE JSONB
  USING to_jsonb("pedidos_origem");
ALTER TABLE "pedidos_comerciais" RENAME COLUMN "pedidos_origem" TO "pedidos_origem_id";

-- ────────────────────────────────────────────────────────────
-- 2. pedidos_comerciais — ADD colunas físicas faltando
-- ────────────────────────────────────────────────────────────

ALTER TABLE "pedidos_comerciais" ADD COLUMN IF NOT EXISTS "cnpj_importador"           TEXT;
ALTER TABLE "pedidos_comerciais" ADD COLUMN IF NOT EXISTS "peso_liquido_total_pedido" DECIMAL(18,6);
ALTER TABLE "pedidos_comerciais" ADD COLUMN IF NOT EXISTS "peso_bruto_total_pedido"   DECIMAL(18,6);
ALTER TABLE "pedidos_comerciais" ADD COLUMN IF NOT EXISTS "cubagem_total_pedido"      DECIMAL(18,6);
ALTER TABLE "pedidos_comerciais" ADD COLUMN IF NOT EXISTS "casas_decimais_peso_pedido"    INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "pedidos_comerciais" ADD COLUMN IF NOT EXISTS "casas_decimais_cubagem_pedido" INTEGER NOT NULL DEFAULT 3;

-- ────────────────────────────────────────────────────────────
-- 3. pedido_itens — RENAME
-- ────────────────────────────────────────────────────────────

ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_inicial_pedido"    TO "quantidade_inicial_item_pedido";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_atual_pedido"      TO "saldo_item_pedido";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_pronta_pedido"     TO "quantidade_pronta_total_item_pedido";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_transferida_pedido" TO "quantidade_transferida_item_pedido";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_cancelada_pedido"  TO "quantidade_cancelada_item_pedido";
ALTER TABLE "pedido_itens" RENAME COLUMN "valor_total_item"             TO "valor_total_itens";
ALTER TABLE "pedido_itens" RENAME COLUMN "valor_por_unidade_item"       TO "valor_unitario_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "casas_decimais_total_item"    TO "casas_decimais_valor_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "created_at"                   TO "item_criado_em";
ALTER TABLE "pedido_itens" RENAME COLUMN "updated_at"                   TO "item_atualizado_em";

-- ────────────────────────────────────────────────────────────
-- 4. pedido_itens — ADD colunas físicas faltando
-- ────────────────────────────────────────────────────────────

ALTER TABLE "pedido_itens" ADD COLUMN IF NOT EXISTS "peso_liquido_unitario_item"   DECIMAL(18,6);
ALTER TABLE "pedido_itens" ADD COLUMN IF NOT EXISTS "peso_bruto_unitario_item"     DECIMAL(18,6);
ALTER TABLE "pedido_itens" ADD COLUMN IF NOT EXISTS "cubagem_unitaria_item"        DECIMAL(18,6);
ALTER TABLE "pedido_itens" ADD COLUMN IF NOT EXISTS "casas_decimais_peso_item"     INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "pedido_itens" ADD COLUMN IF NOT EXISTS "casas_decimais_cubagem_item"  INTEGER NOT NULL DEFAULT 3;
