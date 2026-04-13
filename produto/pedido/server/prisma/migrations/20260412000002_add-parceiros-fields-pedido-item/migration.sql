-- AddColumns: campos de parceiro e cobertura cambial no PedidoItem
-- Esses campos existem no schema.prisma mas nunca foram aplicados no banco.
-- Cada item pode armazenar nome/referência do fabricante, exportador e importador
-- de forma independente, permitindo propagação do PAI ou edição por item.

ALTER TABLE "pedido"."pedido_itens" ADD COLUMN IF NOT EXISTS "cobertura_cambial"     TEXT NOT NULL DEFAULT 'com_cobertura';
ALTER TABLE "pedido"."pedido_itens" ADD COLUMN IF NOT EXISTS "nome_exportador"       TEXT;
ALTER TABLE "pedido"."pedido_itens" ADD COLUMN IF NOT EXISTS "nome_importador"       TEXT;
ALTER TABLE "pedido"."pedido_itens" ADD COLUMN IF NOT EXISTS "nome_fabricante"       TEXT;
ALTER TABLE "pedido"."pedido_itens" ADD COLUMN IF NOT EXISTS "referencia_importador" TEXT;
ALTER TABLE "pedido"."pedido_itens" ADD COLUMN IF NOT EXISTS "referencia_exportador" TEXT;
ALTER TABLE "pedido"."pedido_itens" ADD COLUMN IF NOT EXISTS "referencia_fabricante" TEXT;
