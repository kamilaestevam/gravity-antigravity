-- DDD: valor_total_cambio_item_pedido — espelho de valor_total_cambio_pedido no item (lista pedido/item)
ALTER TABLE "pedido_item" ADD COLUMN IF NOT EXISTS "valor_total_cambio_item_pedido" DECIMAL(18,6);
