-- Renomear campos do PedidoItem (pedido_itens)
ALTER TABLE "pedido"."pedido_itens" RENAME COLUMN "quantidade_inicial"        TO "quantidade_inicial_pedido";
ALTER TABLE "pedido"."pedido_itens" RENAME COLUMN "quantidade_atual"          TO "quantidade_atual_pedido";
ALTER TABLE "pedido"."pedido_itens" RENAME COLUMN "quantidade_pronta"         TO "quantidade_pronta_pedido";
ALTER TABLE "pedido"."pedido_itens" RENAME COLUMN "quantidade_transferida"    TO "quantidade_transferida_pedido";
ALTER TABLE "pedido"."pedido_itens" RENAME COLUMN "quantidade_cancelada"      TO "quantidade_cancelada_pedido";
ALTER TABLE "pedido"."pedido_itens" RENAME COLUMN "casas_decimais_quantidade" TO "casas_decimais_quantidade_item";
ALTER TABLE "pedido"."pedido_itens" RENAME COLUMN "descricao"                 TO "descricao_item";
ALTER TABLE "pedido"."pedido_itens" RENAME COLUMN "valor_unitario"            TO "valor_por_unidade_item";
ALTER TABLE "pedido"."pedido_itens" RENAME COLUMN "valor_item"                TO "valor_total_item";

-- Renomear campo do TransferHistorico (transfer_historico)
ALTER TABLE "pedido"."transfer_historico" RENAME COLUMN "quantidade" TO "quantidade_item_transferida";
