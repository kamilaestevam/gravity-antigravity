-- Migration: align_kanban_preferencias_global
-- Renomeia kanban_preferencias → kanban_preferencias_global
-- + alinha colunas legadas (tenant_id, user_id, preferencias, created_at, updated_at) ao DDD.
-- Aplicada manualmente em transacao em 2026-04-30 (tabela vazia, 0 rows).
--
-- Contexto:
-- - Estado anterior tinha drift entre schema (DDD-aligned) e DB (legacy).
--   A rota kanban-pedido-preferencias.ts falhava em runtime ao chamar
--   db.kanbanPreferencias.upsert({ create: { id_organizacao: ... } }) porque
--   o DB ainda tinha colunas tenant_id/user_id (Prisma client gerado a partir
--   do schema esperava as DDD-aligned).
-- - Sufixo "_global" indica que a tabela serve QUALQUER produto Gravity
--   (product-agnostic — um set de preferencias por usuario vale para qualquer Kanban).
--
-- Tabela duplicada em gravity-servicos-teste.public foi DROPada.

-- 1. RENAME TABLE
ALTER TABLE "kanban_preferencias" RENAME TO "kanban_preferencias_global";

-- 2. RENAME COLUMNs (6)
ALTER TABLE "kanban_preferencias_global" RENAME COLUMN "id"           TO "id_kanban_preferencias_global";
ALTER TABLE "kanban_preferencias_global" RENAME COLUMN "tenant_id"    TO "id_organizacao";
ALTER TABLE "kanban_preferencias_global" RENAME COLUMN "user_id"      TO "id_usuario";
ALTER TABLE "kanban_preferencias_global" RENAME COLUMN "preferencias" TO "preferencias_kanban_preferencias_global";
ALTER TABLE "kanban_preferencias_global" RENAME COLUMN "created_at"   TO "data_criacao_kanban_preferencias_global";
ALTER TABLE "kanban_preferencias_global" RENAME COLUMN "updated_at"   TO "data_atualizacao_kanban_preferencias_global";

-- 3. RENAME INDEXes (4)
ALTER INDEX "kanban_preferencias_pkey"                  RENAME TO "kanban_preferencias_global_pkey";
ALTER INDEX "kanban_preferencias_tenant_id_idx"         RENAME TO "kanban_preferencias_global_id_organizacao_idx";
ALTER INDEX "kanban_preferencias_tenant_id_user_id_idx" RENAME TO "kanban_preferencias_global_id_organizacao_id_usuario_idx";
ALTER INDEX "kanban_preferencias_tenant_id_user_id_key" RENAME TO "kanban_preferencias_global_id_organizacao_id_usuario_key";
