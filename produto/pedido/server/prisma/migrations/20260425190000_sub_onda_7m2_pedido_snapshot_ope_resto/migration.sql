-- Sub-onda 7m.2 — PedidoSnapshotOpe restantes (9 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("pedido_snapshot_ope") permanece (preserva dados).
-- Relação Prisma `pedido` → `acesso_pedido_snapshot_ope` é mudança apenas no client (sem DDL).

ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "estado_ope"           TO "estado_ope_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "cidade_ope"           TO "cidade_ope_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "endereco_ope"         TO "endereco_ope_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "zip_ope"              TO "zip_ope_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "tin_ope"              TO "tin_ope_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "email_ope"            TO "email_ope_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "congelado_em"         TO "congelado_em_pedido_snapshot_ope";
ALTER TABLE "pedido_snapshot_ope" RENAME COLUMN "motivo_congelamento"  TO "motivo_congelamento_pedido_snapshot_ope";
