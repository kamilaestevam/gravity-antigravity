-- Migration: pedido_item_unidades_peso_cubagem (2026-05-12)
--
-- Contexto: até agora o produto Pedido armazenava peso e cubagem sem
-- a unidade associada (assumia-se KG para peso e m³ para cubagem).
-- Front mostrava dropdown de unidade mas o backend descartava silenciosamente
-- o campo na ACL — violação Mandamento 09 (Zod contrato bilateral) com
-- bug visível ("troca unidade mas não troca").
--
-- Estas 3 colunas habilitam o produto Pedido a usar `cadastros.unidade`
-- como fonte da verdade da unidade de cada item (peso líquido, peso bruto,
-- cubagem). Sem FK rígida — Cadastros é serviço separado; validação
-- cruzada é feita na aplicação (Zod + cadastrosClient) via categoria:
--   peso_liquido_unidade_item, peso_bruto_unidade_item  → categoria=peso (KG/G/TON)
--   cubagem_unidade_item                                 → categorias=comprimento|area|volume
--                                                           (CM, M, CM2, M2, ML, LT, M3)
--
-- Defaults populam o histórico (todo registro existente assumia KG/M3).
-- Sem necessidade de backfill explícito.

ALTER TABLE "pedido_item" ADD COLUMN "peso_liquido_unidade_item" TEXT DEFAULT 'KG';
ALTER TABLE "pedido_item" ADD COLUMN "peso_bruto_unidade_item"   TEXT DEFAULT 'KG';
ALTER TABLE "pedido_item" ADD COLUMN "cubagem_unidade_item"      TEXT DEFAULT 'M3';
