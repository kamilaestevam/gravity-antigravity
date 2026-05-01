-- Migration: cria tabela pedido_snapshot_unidade — snapshot congelado de Unidade por pedido.
-- Nomenclatura DDD: id, id_organizacao, id_workspace, id_pedido + colunas do catálogo Cadastros.

CREATE TABLE "pedido_snapshot_unidade" (
  "id" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_workspace" TEXT,
  "id_pedido" TEXT NOT NULL,
  "codigo_unidade" TEXT NOT NULL,
  "nome_unidade" TEXT NOT NULL,
  "tipo_unidade" TEXT NOT NULL,
  "congelado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "motivo_congelamento" TEXT NOT NULL,
  CONSTRAINT "pedido_snapshot_unidade_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pedido_snapshot_unidade_id_organizacao_idx" ON "pedido_snapshot_unidade"("id_organizacao");
CREATE INDEX "pedido_snapshot_unidade_id_organizacao_id_pedido_idx" ON "pedido_snapshot_unidade"("id_organizacao", "id_pedido");
CREATE INDEX "pedido_snapshot_unidade_id_organizacao_codigo_unidade_idx" ON "pedido_snapshot_unidade"("id_organizacao", "codigo_unidade");

ALTER TABLE "pedido_snapshot_unidade"
  ADD CONSTRAINT "pedido_snapshot_unidade_id_pedido_fkey"
  FOREIGN KEY ("id_pedido") REFERENCES "pedido_produto_gravity"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;
