-- Sub-onda 7q — PedidoSnapshotEmpresa (4 col renames, sem drops destrutivos)
-- Fonte: planilha_geral_gravity (22).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("pedido_snapshot_empresa") permanece. 14 drops VERMELHOS
-- na planilha foram intencionalmente PULADOS (preserva dados — decisão arquitetural).

ALTER TABLE "pedido_snapshot_empresa" RENAME COLUMN "id"                  TO "id_pedido_snapshot_empresa";
ALTER TABLE "pedido_snapshot_empresa" RENAME COLUMN "tipo_documento"      TO "tipo_documento_pedido_snapshot_empresa";
ALTER TABLE "pedido_snapshot_empresa" RENAME COLUMN "documento_principal" TO "documento_principal_pedido_snapshot_empresa";
ALTER TABLE "pedido_snapshot_empresa" RENAME COLUMN "cnpj_raiz"           TO "cnpj_raiz_pedido_snapshot_empresa";
