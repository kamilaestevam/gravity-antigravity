-- Nº Proforma / Nº Invoice por item (regra padrão: editável independente + replicação opcional do pai)

ALTER TABLE "pedido_item" ADD COLUMN IF NOT EXISTS "numero_proforma_item" TEXT;
ALTER TABLE "pedido_item" ADD COLUMN IF NOT EXISTS "numero_invoice_item" TEXT;

-- Backfill: itens existentes herdam o valor do pedido pai
UPDATE "pedido_item" pi
SET
  "numero_proforma_item" = p."numero_proforma_pedido",
  "numero_invoice_item" = p."numero_invoice_pedido"
FROM "pedido" p
WHERE pi."id_pedido" = p."id_pedido"
  AND pi."id_organizacao" = p."id_organizacao";
