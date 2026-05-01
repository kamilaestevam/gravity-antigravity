-- Migration: cria tabela pedido_snapshot_moeda — snapshot congelado de Moeda por pedido.
-- Nomenclatura DDD: id, id_organizacao, id_workspace, id_pedido + colunas do catálogo Cadastros.

CREATE TABLE "pedido_snapshot_moeda" (
  "id" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_workspace" TEXT,
  "id_pedido" TEXT NOT NULL,
  "codigo_moeda" TEXT NOT NULL,
  "nome_moeda" TEXT NOT NULL,
  "simbolo_moeda" TEXT NOT NULL,
  "congelado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "motivo_congelamento" TEXT NOT NULL,
  CONSTRAINT "pedido_snapshot_moeda_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pedido_snapshot_moeda_id_organizacao_idx" ON "pedido_snapshot_moeda"("id_organizacao");
CREATE INDEX "pedido_snapshot_moeda_id_organizacao_id_pedido_idx" ON "pedido_snapshot_moeda"("id_organizacao", "id_pedido");
CREATE INDEX "pedido_snapshot_moeda_id_organizacao_codigo_moeda_idx" ON "pedido_snapshot_moeda"("id_organizacao", "codigo_moeda");

ALTER TABLE "pedido_snapshot_moeda"
  ADD CONSTRAINT "pedido_snapshot_moeda_id_pedido_fkey"
  FOREIGN KEY ("id_pedido") REFERENCES "pedido_produto_gravity"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;
