-- Migration: cria tabela pedido_snapshot_ncm — snapshot congelado de NCM por pedido.
-- Nomenclatura DDD: id, id_organizacao, id_workspace, id_pedido + colunas do catálogo Cadastros.

CREATE TABLE "pedido_snapshot_ncm" (
  "id" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_workspace" TEXT,
  "id_pedido" TEXT NOT NULL,
  "codigo_ncm" TEXT NOT NULL,
  "descricao_ncm" TEXT NOT NULL,
  "ipi_ncm" DOUBLE PRECISION,
  "ii_ncm" DOUBLE PRECISION,
  "pis_ncm" DOUBLE PRECISION,
  "cofins_ncm" DOUBLE PRECISION,
  "congelado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "motivo_congelamento" TEXT NOT NULL,
  CONSTRAINT "pedido_snapshot_ncm_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pedido_snapshot_ncm_id_organizacao_idx" ON "pedido_snapshot_ncm"("id_organizacao");
CREATE INDEX "pedido_snapshot_ncm_id_organizacao_id_pedido_idx" ON "pedido_snapshot_ncm"("id_organizacao", "id_pedido");
CREATE INDEX "pedido_snapshot_ncm_id_organizacao_codigo_ncm_idx" ON "pedido_snapshot_ncm"("id_organizacao", "codigo_ncm");

ALTER TABLE "pedido_snapshot_ncm"
  ADD CONSTRAINT "pedido_snapshot_ncm_id_pedido_fkey"
  FOREIGN KEY ("id_pedido") REFERENCES "pedido_produto_gravity"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;
