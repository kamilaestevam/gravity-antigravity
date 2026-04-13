-- AddColumn: incoterm no PedidoItem
-- Permite que cada item tenha seu próprio Incoterm (FOB, CIF, EXW, etc.)
-- independente do incoterm do pedido pai.
ALTER TABLE "pedido"."pedido_itens" ADD COLUMN IF NOT EXISTS "incoterm" TEXT;
