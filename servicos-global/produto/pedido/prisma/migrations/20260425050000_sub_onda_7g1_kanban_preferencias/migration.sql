-- Sub-onda 7g.1 — KanbanPreferencias (6 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("kanban_preferencias") permanece (preserva dados).

ALTER TABLE "kanban_preferencias" RENAME COLUMN "id"           TO "id_kanban_preferencias";
ALTER TABLE "kanban_preferencias" RENAME COLUMN "tenant_id"    TO "id_organizacao";
ALTER TABLE "kanban_preferencias" RENAME COLUMN "user_id"      TO "id_usuario";
ALTER TABLE "kanban_preferencias" RENAME COLUMN "preferencias" TO "preferencias_kanban_preferencias";
ALTER TABLE "kanban_preferencias" RENAME COLUMN "created_at"   TO "data_criacao_kanban_preferencias";
ALTER TABLE "kanban_preferencias" RENAME COLUMN "updated_at"   TO "data_atualizacao_kanban_preferencias";

-- Renomear índices para refletir nova nomenclatura
ALTER INDEX "kanban_preferencias_tenant_id_idx"             RENAME TO "kanban_preferencias_id_organizacao_idx";
ALTER INDEX "kanban_preferencias_tenant_id_user_id_idx"     RENAME TO "kanban_preferencias_id_organizacao_id_usuario_idx";
ALTER INDEX "kanban_preferencias_tenant_id_user_id_key"     RENAME TO "kanban_preferencias_id_organizacao_id_usuario_key";
