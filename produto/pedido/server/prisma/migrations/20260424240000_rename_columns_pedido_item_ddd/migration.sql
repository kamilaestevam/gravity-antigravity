-- FASE 07 DDD / Onda 3 Pedido — rename de colunas fisicas da tabela "pedido_itens"
-- (model Prisma: PedidoItem)
-- Fonte: planilha_geral_gravity (20).xlsx, aba "1.ddd_campos" (Produto Gravity = Pedido)
-- Estrategia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Escopo: 36 colunas fisicas + 3 indices regulares reconstruidos + 1 FK constraint renomeada (outbound → pedido_produto_gravity).
-- Relacoes Prisma `pedido` → `pedido_pedido_item` e `embarques_efetivos` → `embarques_efetivos_pedido_item` somente no schema; sem impacto em DDL.
-- A FK inbound `logistica_processo_pedido_item_id_fkey` permanece intacta — PostgreSQL rastreia FKs no catalogo e acompanha o rename da coluna alvo `id` → `id_pedido_item` automaticamente.

-- 1) Rename colunas (36 fisicas)
ALTER TABLE "pedido_itens" RENAME COLUMN "id"                             TO "id_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "tenant_id"                      TO "id_organizacao";
ALTER TABLE "pedido_itens" RENAME COLUMN "company_id"                     TO "id_workspace";
ALTER TABLE "pedido_itens" RENAME COLUMN "pedido_id"                      TO "id_pedido";
ALTER TABLE "pedido_itens" RENAME COLUMN "sequencia_item"                 TO "sequencia_item_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "part_number"                    TO "part_number_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "ncm"                            TO "ncm_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "descricao_item"                 TO "descricao_item_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "unidade_comercializada_item"    TO "unidade_comercializada_item_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_inicial_pedido"      TO "quantidade_inicial_pedido_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_atual_pedido"        TO "quantidade_atual_pedido_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_pronta_pedido"       TO "quantidade_pronta_pedido_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_transferida_pedido"  TO "quantidade_transferida_pedido_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_cancelada_pedido"    TO "quantidade_cancelada_pedido_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "casas_decimais_quantidade_item" TO "casas_decimais_quantidade_item_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "moeda_item"                     TO "moeda_item_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "valor_total_item"               TO "valor_total_item_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "valor_por_unidade_item"         TO "valor_por_unidade_item_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "casas_decimais_valor_item"      TO "casas_decimais_valor_item_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "cobertura_cambial"              TO "cobertura_cambial_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "nome_exportador"                TO "nome_exportador_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "nome_importador"                TO "nome_importador_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "nome_fabricante"                TO "nome_fabricante_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "referencia_importador"          TO "referencia_importador_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "referencia_exportador"          TO "referencia_exportador_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "referencia_fabricante"          TO "referencia_fabricante_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "incoterm"                       TO "incoterm_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "condicao_pagamento_pedido"      TO "condicao_pagamento_pedido_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "data_emissao_pedido"            TO "data_emissao_pedido_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "peso_liquido_unitario"          TO "peso_liquido_unitario_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "peso_bruto_unitario"            TO "peso_bruto_unitario_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "cubagem_unitaria"               TO "cubagem_unitaria_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "casas_decimais_peso_item"       TO "casas_decimais_peso_item_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "casas_decimais_cubagem_item"    TO "casas_decimais_cubagem_item_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "campos_custom"                  TO "campos_custom_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "created_at"                     TO "data_criacao_pedido_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "updated_at"                     TO "data_atualizacao_pedido_item";

-- 2) Reconstruir indices (3 regulares)
DROP INDEX IF EXISTS "pedido_itens_tenant_id_idx";
DROP INDEX IF EXISTS "pedido_itens_tenant_id_company_id_idx";
DROP INDEX IF EXISTS "pedido_itens_pedido_id_idx";

CREATE INDEX "pedido_itens_id_organizacao_idx"
    ON "pedido_itens"("id_organizacao");
CREATE INDEX "pedido_itens_id_organizacao_id_workspace_idx"
    ON "pedido_itens"("id_organizacao", "id_workspace");
CREATE INDEX "pedido_itens_id_pedido_idx"
    ON "pedido_itens"("id_pedido");

-- 3) Renomear FK constraint outbound (pedido_itens.id_pedido → pedido_produto_gravity.id) para alinhar com convencao Prisma "<tabela>_<coluna>_fkey"
ALTER TABLE "pedido_itens"
    RENAME CONSTRAINT "pedido_itens_pedido_id_fkey"
    TO "pedido_itens_id_pedido_fkey";
