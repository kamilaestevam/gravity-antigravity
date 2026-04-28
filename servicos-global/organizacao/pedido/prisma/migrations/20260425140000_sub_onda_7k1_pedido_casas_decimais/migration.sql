-- Sub-onda 7k.1 — PedidoCasasDecimais (10 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("pedido_casas_decimais") permanece (preserva dados).
-- Restantes 6 cols (peso_liquido/peso_bruto/cubagem/formato_data/created_at/updated_at) em 7k.2.

ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "id"                                TO "id_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "tenant_id"                         TO "id_organizacao";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "product_id"                        TO "id_produto_gravity";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "valor_total_pedido"                TO "valor_total_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "valor_unitario_item"               TO "valor_unitario_item_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "quantidade_total_inicial_pedido"   TO "quantidade_total_inicial_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "quantidade_pronta_pedido_total"    TO "quantidade_pronta_pedido_total_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "saldo_itens_do_pedido"             TO "saldo_itens_do_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "quantidade_transferida_total"      TO "quantidade_transferida_total_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "quantidade_cancelada_total_pedido" TO "quantidade_cancelada_total_pedido_casas_decimais";

-- Renomear índices para refletir nova nomenclatura
ALTER INDEX "pedido_casas_decimais_tenant_id_key"             RENAME TO "pedido_casas_decimais_id_organizacao_key";
ALTER INDEX "pedido_casas_decimais_tenant_id_idx"             RENAME TO "pedido_casas_decimais_id_organizacao_idx";
ALTER INDEX "pedido_casas_decimais_tenant_id_product_id_idx"  RENAME TO "pedido_casas_decimais_id_organizacao_id_produto_gravity_idx";
