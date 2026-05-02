-- Migration: align_pedido_snapshot_atualizacao
-- RENAME TABLE + 13 RENAME COLUMN + 3 RENAME INDEX
-- Renomeia pedido_config_atualizacao_cadastros → pedido_snapshot_atualizacao
-- e elimina o booleano descartado matriz_snapshot_politica_snapshot_cadastros
-- (que existia apenas no fragment.prisma, nao foi para o banco) consolidando
-- a nomenclatura DDD ubiqua (todas as colunas com sufixo _pedido_snapshot_atualizacao).
--
-- Aplicada manualmente em transacao em 2026-04-30 (tabela vazia, 0 rows em
-- gravity-pedido-teste; gravity-servicos-teste sem duplicata).

-- 1. RENAME TABLE
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME TO "pedido_snapshot_atualizacao";

-- 2. RENAME COLUMNs (13)
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "id"                   TO "id_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "atualiza_importador"  TO "atualiza_importador_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "atualiza_exportador"  TO "atualiza_exportador_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "atualiza_fabricante"  TO "atualiza_fabricante_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "atualiza_agente"      TO "atualiza_agente_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "atualiza_despachante" TO "atualiza_despachante_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "atualiza_armador"     TO "atualiza_armador_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "atualiza_ope"         TO "atualiza_ope_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "resnap_em_emissao"    TO "gatilho_emissao_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "resnap_em_embarque"   TO "gatilho_embarque_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "resnap_em_desembaraco" TO "gatilho_desembaraco_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "created_at"           TO "data_criacao_pedido_snapshot_atualizacao";
ALTER TABLE "pedido_snapshot_atualizacao" RENAME COLUMN "updated_at"           TO "data_atualizacao_pedido_snapshot_atualizacao";

-- 3. RENAME INDEXes (3)
ALTER INDEX "pedido_config_atualizacao_cadastros_pkey"
  RENAME TO "pedido_snapshot_atualizacao_pkey";
ALTER INDEX "pedido_config_atualizacao_cadastros_id_organizacao_idx"
  RENAME TO "pedido_snapshot_atualizacao_id_organizacao_idx";
ALTER INDEX "pedido_config_atualizacao_cadastros_id_organizacao_id_works_key"
  RENAME TO "pedido_snapshot_atualizacao_id_organizacao_id_workspace_key";
