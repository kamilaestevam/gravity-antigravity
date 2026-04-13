-- AddColumn: data_emissao_pedido no PedidoItem
-- Permite que cada item tenha sua própria data P.O., independente do pedido pai.
ALTER TABLE "pedido"."pedido_itens" ADD COLUMN IF NOT EXISTS "data_emissao_pedido" TIMESTAMP(3);
