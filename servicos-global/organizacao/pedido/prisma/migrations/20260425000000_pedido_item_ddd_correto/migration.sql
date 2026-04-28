-- FASE 07 DDD / Onda 3 Pedido / Sub-onda 7a — Correção dos sufixos do PedidoItem
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
--
-- Esta migration corrige a anterior 20260424240000_rename_columns_pedido_item_ddd que aplicou
-- sufixos errados (_pedido_item) onde a planilha definia _item. Também renomeia a PK
-- (id_pedido_item → id_item) e aplica casos especiais:
--   • sequencia_item_pedido_item → sequencia_item_pedido (sufixo _pedido único)
--   • campos_custom_pedido_item  → dados_extras_importacao_item (renome semântico)
--   • descricao_item_pedido_item → descricao_item (sem sufixo duplo)

-- 1) Rename PK e colunas (35 colunas + PK)
ALTER TABLE "pedido_itens" RENAME COLUMN "id_pedido_item"                            TO "id_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "sequencia_item_pedido_item"                TO "sequencia_item_pedido";
ALTER TABLE "pedido_itens" RENAME COLUMN "part_number_pedido_item"                   TO "part_number_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "ncm_pedido_item"                           TO "ncm_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "descricao_item_pedido_item"                TO "descricao_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "unidade_comercializada_item_pedido_item"   TO "unidade_comercializada_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_inicial_pedido_pedido_item"     TO "quantidade_inicial_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_atual_pedido_pedido_item"       TO "quantidade_atual_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_pronta_pedido_pedido_item"      TO "quantidade_pronta_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_transferida_pedido_pedido_item" TO "quantidade_transferida_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_cancelada_pedido_pedido_item"   TO "quantidade_cancelada_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "casas_decimais_quantidade_item_pedido_item" TO "casas_decimais_quantidade_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "moeda_item_pedido_item"                    TO "moeda_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "valor_total_item_pedido_item"              TO "valor_total_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "valor_por_unidade_item_pedido_item"        TO "valor_por_unidade_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "casas_decimais_valor_item_pedido_item"     TO "casas_decimais_valor_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "cobertura_cambial_pedido_item"             TO "cobertura_cambial_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "nome_exportador_pedido_item"               TO "nome_exportador_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "nome_importador_pedido_item"               TO "nome_importador_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "nome_fabricante_pedido_item"               TO "nome_fabricante_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "referencia_importador_pedido_item"         TO "referencia_importador_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "referencia_exportador_pedido_item"         TO "referencia_exportador_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "referencia_fabricante_pedido_item"         TO "referencia_fabricante_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "incoterm_pedido_item"                      TO "incoterm_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "condicao_pagamento_pedido_pedido_item"     TO "condicao_pagamento_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "data_emissao_pedido_pedido_item"           TO "data_emissao_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "peso_liquido_unitario_pedido_item"         TO "peso_liquido_unitario_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "peso_bruto_unitario_pedido_item"           TO "peso_bruto_unitario_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "cubagem_unitaria_pedido_item"              TO "cubagem_unitaria_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "casas_decimais_peso_item_pedido_item"      TO "casas_decimais_peso_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "casas_decimais_cubagem_item_pedido_item"   TO "casas_decimais_cubagem_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "campos_custom_pedido_item"                 TO "dados_extras_importacao_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "data_criacao_pedido_item"                  TO "data_criacao_item";
ALTER TABLE "pedido_itens" RENAME COLUMN "data_atualizacao_pedido_item"              TO "data_atualizacao_item";

-- 2) FK inbound (logistica_processo.pedido_item_id → pedido_itens.id_item)
-- PostgreSQL acompanha o rename da coluna alvo automaticamente; nenhum ALTER necessário.
