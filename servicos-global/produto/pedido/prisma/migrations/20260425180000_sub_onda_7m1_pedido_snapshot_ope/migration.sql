-- Sub-onda 7m.1 — PedidoSnapshotOpe (10 col renames + 3 index renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("pedido_snapshot_ope") permanece (preserva dados).
-- Restantes 8 cols + relação `pedido` em 7m.2.

ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "id"                 TO "id_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "id_organizacao"     TO "id_organizacao_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "id_workspace"       TO "id_workspace_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "id_pedido"          TO "id_pedido_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "codigo_ope"         TO "codigo_ope_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "versao_ope"         TO "versao_ope_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "situacao_ope"       TO "situacao_ope_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "nome_ope"           TO "nome_ope_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "cnpj_raiz_empresa"  TO "cnpj_raiz_empresa_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "pais_ope"           TO "pais_ope_pedido_snapshot_ope";

-- Renomear índices para refletir nova nomenclatura
ALTER INDEX "pedido_snapshot_ope_id_organizacao_idx"             RENAME TO "pedido_snapshot_ope_id_organizacao_pedido_snapshot_ope_idx";
ALTER INDEX "pedido_snapshot_ope_id_organizacao_id_pedido_idx"   RENAME TO "pedido_snapshot_ope_id_organizacao_pedido_snapshot_ope_id_pedi_idx";
ALTER INDEX "pedido_snapshot_ope_id_organizacao_codigo_ope_idx"  RENAME TO "pedido_snapshot_ope_id_organizacao_pedido_snapshot_ope_codig_idx";
