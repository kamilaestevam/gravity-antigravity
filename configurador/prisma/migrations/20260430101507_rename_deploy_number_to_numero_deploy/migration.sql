-- Migration: rename_deploy_number_to_numero_deploy
-- Renomeia coluna deploy_number → numero_deploy + sequência associada.
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

ALTER TABLE "deploy" RENAME COLUMN "deploy_number" TO "numero_deploy";
ALTER SEQUENCE "deploy_deploy_number_seq" RENAME TO "deploy_numero_deploy_seq";
