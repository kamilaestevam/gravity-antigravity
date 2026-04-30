-- Migration: align_pedido_casas_decimais
-- 16 RENAME COLUMN + 3 RENAME INDEX em pedido_casas_decimais.
-- Aplicada manualmente em transacao em 2026-04-30 (tabela vazia, 0 rows).
--
-- Contexto:
-- O DB tinha colunas legacy (sem sufixo _casas_decimais). Schema/fragment ja estava
-- DDD-aligned. Drift entre os 2 quebrava a rota casas-decimais-pedido.ts em runtime
-- (3 bugs corrigidos no mesmo commit:
--   1. Model name errado: db.pedidoCasasDecimaisConfig → db.pedidoCasasDecimais
--   2. tenant_id direto na query → id_organizacao
--   3. Variaveis tenant_id legacy → idOrganizacao (REGRA 03 DDD)).
-- Adicionada camada ACL Zod↔Prisma para preservar contrato JSON do frontend.
-- Tambem corrigida inconsistencia no fragment: data_criacao_casas_decimais_pedido
-- → data_criacao_pedido_casas_decimais (consistente com data_atualizacao_*).
-- Tabela duplicada em gravity-servicos-teste.public foi DROPada.

-- 1. RENAME COLUMNs (16)
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
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "peso_liquido_total_pedido"         TO "peso_liquido_total_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "peso_bruto_total_pedido"           TO "peso_bruto_total_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "cubagem_total_pedido"              TO "cubagem_total_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "formato_data"                      TO "formato_data_pedido";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "created_at"                        TO "data_criacao_pedido_casas_decimais";
ALTER TABLE "pedido_casas_decimais" RENAME COLUMN "updated_at"                        TO "data_atualizacao_pedido_casas_decimais";

-- 2. RENAME INDEXes (3)
ALTER INDEX "pedido_casas_decimais_tenant_id_key"            RENAME TO "pedido_casas_decimais_id_organizacao_key";
ALTER INDEX "pedido_casas_decimais_tenant_id_idx"            RENAME TO "pedido_casas_decimais_id_organizacao_idx";
ALTER INDEX "pedido_casas_decimais_tenant_id_product_id_idx" RENAME TO "pedido_casas_decimais_id_organizacao_id_produto_gravity_idx";
