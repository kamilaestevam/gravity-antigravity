-- ─────────────────────────────────────────────────────────────────────────────
-- DDD final — FKs canônicas em Notificações (escopo reduzido)
-- ─────────────────────────────────────────────────────────────────────────────
-- ESCOPO ATUALIZADO em 2026-05-03:
--   Originalmente esta migration cobria 6 tabelas (3 NCM + 3 Notificações).
--   As 3 NCM foram MOVIDAS para o serviço Cadastros — então DROPamos a parte de
--   NCM (a próxima migration `20260503183803_drop_ncm_models_moved_to_cadastros`
--   faz o cleanup). Aqui ficou apenas a parte das tabelas de notificações:
--   `notificacoes_titulo_corpo`, `contato_externo`, `configuracao_canal_tenant`.
--
-- Alinhamento com REGRA 03/04 da skill ddd-nomenclatura:
--   - FKs canônicas (Organizacao, Usuario, ProdutoGravity) sem sufixo de entidade
--   - Tabela `configuracao_canal_tenant` renomeada para `configuracao_canal_organizacao`
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. notificacoes_titulo_corpo
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "id"              TO "id_notificacoes_titulo_corpo";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "tenant_id"       TO "id_organizacao";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "product_id"      TO "id_produto_gravity";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "user_id"         TO "id_usuario";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "type"            TO "tipo_notificacoes_titulo_corpo";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "title"           TO "titulo_notificacoes_titulo_corpo";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "message"         TO "mensagem_notificacoes_titulo_corpo";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "read"            TO "lida_notificacoes_titulo_corpo";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "target_entity"   TO "entidade_alvo_notificacoes_titulo_corpo";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "target_id"       TO "id_alvo_notificacoes_titulo_corpo";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "delivery_status" TO "status_entrega_notificacoes_titulo_corpo";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "external_id"     TO "id_externo_notificacoes_titulo_corpo";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "created_at"      TO "data_criacao_notificacoes_titulo_corpo";
ALTER TABLE "notificacoes_titulo_corpo" RENAME COLUMN "updated_at"      TO "data_atualizacao_notificacoes_titulo_corpo";

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. contato_externo
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "contato_externo" RENAME COLUMN "id"                 TO "id_contato_externo";
ALTER TABLE "contato_externo" RENAME COLUMN "tenant_id"          TO "id_organizacao";
ALTER TABLE "contato_externo" RENAME COLUMN "created_by"         TO "id_usuario";
-- contato_externo não tinha product_id na tabela original; adicionar coluna nullable
-- (o schema Prisma define id_produto_gravity como String?). Sem dados → safe.
ALTER TABLE "contato_externo" ADD COLUMN "id_produto_gravity" TEXT;

ALTER TABLE "contato_externo" RENAME COLUMN "name"               TO "nome_contato_externo";
ALTER TABLE "contato_externo" RENAME COLUMN "email"              TO "email_contato_externo";
ALTER TABLE "contato_externo" RENAME COLUMN "whatsapp_phone"     TO "whatsapp_telefone_contato_externo";
ALTER TABLE "contato_externo" RENAME COLUMN "whatsapp_opt_in_at" TO "whatsapp_opt_in_em_contato_externo";
ALTER TABLE "contato_externo" RENAME COLUMN "notes"              TO "observacoes_contato_externo";
ALTER TABLE "contato_externo" RENAME COLUMN "created_at"         TO "data_criacao_contato_externo";
ALTER TABLE "contato_externo" RENAME COLUMN "updated_at"         TO "data_atualizacao_contato_externo";

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. configuracao_canal_tenant → configuracao_canal_organizacao
--    Renomear tabela inteira + colunas
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "configuracao_canal_tenant" RENAME TO "configuracao_canal_organizacao";

ALTER TABLE "configuracao_canal_organizacao" RENAME COLUMN "id"               TO "id_configuracao_canal_organizacao";
ALTER TABLE "configuracao_canal_organizacao" RENAME COLUMN "tenant_id"        TO "id_organizacao";
ALTER TABLE "configuracao_canal_organizacao" RENAME COLUMN "updated_by"       TO "id_usuario";
-- configuracao_canal_tenant não tinha product_id; adicionar coluna nullable
ALTER TABLE "configuracao_canal_organizacao" ADD COLUMN "id_produto_gravity" TEXT;

ALTER TABLE "configuracao_canal_organizacao" RENAME COLUMN "email_enabled"    TO "email_habilitado_configuracao_canal_organizacao";
ALTER TABLE "configuracao_canal_organizacao" RENAME COLUMN "whatsapp_enabled" TO "whatsapp_habilitado_configuracao_canal_organizacao";
ALTER TABLE "configuracao_canal_organizacao" RENAME COLUMN "created_at"       TO "data_criacao_configuracao_canal_organizacao";
ALTER TABLE "configuracao_canal_organizacao" RENAME COLUMN "updated_at"       TO "data_atualizacao_configuracao_canal_organizacao";
