-- Sub-onda 7k.2 — PedidoCasasDecimais restantes (6 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("pedido_casas_decimais") permanece (preserva dados).

ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "peso_liquido_total_pedido" TO "peso_liquido_total_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "peso_bruto_total_pedido"   TO "peso_bruto_total_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "cubagem_total_pedido"      TO "cubagem_total_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "formato_data"              TO "formato_data_pedido";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "created_at"                TO "data_criacao_casas_decimais_pedido";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "updated_at"                TO "data_atualizacao_pedido_casas_decimais";
