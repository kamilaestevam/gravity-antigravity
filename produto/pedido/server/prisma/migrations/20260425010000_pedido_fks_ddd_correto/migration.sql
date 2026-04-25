-- FASE 07 DDD / Onda 3 Pedido / Sub-onda 7b — Refatora FKs e IDs do PedidoGeral
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
--
-- Renomes desta sub-onda (6 colunas + 1 índice):
--   • id_status                 → id_status_pedido
--   • id_importacao_exportador  → id_importacao_exportador_pedido
--   • id_exportacao_importador  → id_exportacao_importador_pedido
--   • id_fabricante             → id_fabricante_pedido
--   • campos_custom_pedido      → dados_extras_importacao_pedido
--   • id_pedidos_origem         → ids_origem_consolidacao_pedido
--
-- Índice composto associado segue o rename automaticamente no PostgreSQL,
-- mas o Prisma exige consistência nominal — então o @@index foi atualizado
-- no fragment.prisma e a composição refletida no schema.prisma.

ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "id_status"                TO "id_status_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "id_importacao_exportador" TO "id_importacao_exportador_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "id_exportacao_importador" TO "id_exportacao_importador_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "id_fabricante"            TO "id_fabricante_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "campos_custom_pedido"     TO "dados_extras_importacao_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "id_pedidos_origem"        TO "ids_origem_consolidacao_pedido";
