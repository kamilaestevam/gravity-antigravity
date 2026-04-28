-- AddColumn: condicao_pagamento_pedido no PedidoItem
-- Permite que cada item tenha sua própria condição de pagamento.
ALTER TABLE "pedido_itens" ADD COLUMN IF NOT EXISTS "condicao_pagamento_pedido" TEXT;
