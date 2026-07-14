-- Kit integracao Gravity-SAP: correlacao ERP/SAP no pedido
ALTER TABLE "pedido"
  ADD COLUMN IF NOT EXISTS "referencia_externa_erp_pedido" TEXT;

CREATE INDEX IF NOT EXISTS "pedido_org_ref_ext_erp_idx"
  ON "pedido" ("id_organizacao", "referencia_externa_erp_pedido");
