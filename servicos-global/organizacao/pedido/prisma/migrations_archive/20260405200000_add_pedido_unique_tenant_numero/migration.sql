-- DeduplicatePedidos: keep only the most recent record per (tenant_id, numero_pedido)
DELETE FROM "pedidos_comerciais"
WHERE id NOT IN (
  SELECT DISTINCT ON (tenant_id, numero_pedido) id
  FROM "pedidos_comerciais"
  ORDER BY tenant_id, numero_pedido, created_at DESC
);

-- AddUniqueConstraint
ALTER TABLE "pedidos_comerciais" ADD CONSTRAINT "pedidos_comerciais_tenant_id_numero_pedido_key" UNIQUE ("tenant_id", "numero_pedido");
