-- ─────────────────────────────────────────────────────────────────────────────
-- DDD final — FKs canônicas em NCM Sync e Notificações
-- ─────────────────────────────────────────────────────────────────────────────
-- Alinhamento com REGRA 03/04 da skill ddd-nomenclatura: as FKs do glossário
-- canônico (Organizacao, Usuario, ProdutoGravity) NÃO têm sufixo de entidade.
-- Renomeia também a tabela `configuracao_canal_tenant` para
-- `configuracao_canal_organizacao` (Tenant abandonado), e os enums
-- `NcmSyncStatus`/`NcmSyncOrigem` para versão DDD em PT.
--
-- Escopo: 6 tabelas (ncm_item, ncm_log, ncm_agendamento, notificacoes_titulo_corpo,
-- contato_externo, configuracao_canal_tenant) + 2 enums.
-- Todas as outras tabelas da plataforma (atividades, dashboard, gabi, email,
-- whatsapp, relatórios, agendamento, etc.) ficam para próxima onda.
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. ncm_item
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "ncm_item" RENAME COLUMN "id"          TO "id_ncm_item";
ALTER TABLE "ncm_item" RENAME COLUMN "tenant_id"   TO "id_organizacao";
ALTER TABLE "ncm_item" RENAME COLUMN "product_id"  TO "id_produto_gravity";
ALTER TABLE "ncm_item" RENAME COLUMN "user_id"     TO "id_usuario";
ALTER TABLE "ncm_item" RENAME COLUMN "codigo"      TO "codigo_ncm_item";
ALTER TABLE "ncm_item" RENAME COLUMN "descricao"   TO "descricao_ncm_item";
ALTER TABLE "ncm_item" RENAME COLUMN "ativo"       TO "ativo_ncm_item";
ALTER TABLE "ncm_item" RENAME COLUMN "data_inicio" TO "data_inicio_ncm_item";
ALTER TABLE "ncm_item" RENAME COLUMN "data_fim"    TO "data_fim_ncm_item";
ALTER TABLE "ncm_item" RENAME COLUMN "sync_id"     TO "id_ncm_log";
ALTER TABLE "ncm_item" RENAME COLUMN "created_at"  TO "data_criacao_ncm_item";
ALTER TABLE "ncm_item" RENAME COLUMN "updated_at"  TO "data_atualizacao_ncm_item";

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. ncm_log
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "ncm_log" RENAME COLUMN "id"            TO "id_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "tenant_id"     TO "id_organizacao";
ALTER TABLE "ncm_log" RENAME COLUMN "product_id"    TO "id_produto_gravity";
ALTER TABLE "ncm_log" RENAME COLUMN "user_id"       TO "id_usuario";
ALTER TABLE "ncm_log" RENAME COLUMN "iniciado_em"   TO "data_inicio_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "concluido_em"  TO "data_conclusao_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "status"        TO "status_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "total"         TO "total_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "adicionados"   TO "adicionados_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "alterados"     TO "alterados_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "removidos"     TO "removidos_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "origem"        TO "origem_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "disparado_por" TO "disparado_por_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "erro_msg"      TO "mensagem_erro_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "created_at"    TO "data_criacao_ncm_log";
ALTER TABLE "ncm_log" RENAME COLUMN "updated_at"    TO "data_atualizacao_ncm_log";

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ncm_agendamento
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "ncm_agendamento" RENAME COLUMN "id"             TO "id_ncm_agendamento";
ALTER TABLE "ncm_agendamento" RENAME COLUMN "tenant_id"      TO "id_organizacao";
ALTER TABLE "ncm_agendamento" RENAME COLUMN "product_id"     TO "id_produto_gravity";
ALTER TABLE "ncm_agendamento" RENAME COLUMN "user_id"        TO "id_usuario";
ALTER TABLE "ncm_agendamento" RENAME COLUMN "ativo"          TO "ativo_ncm_agendamento";
ALTER TABLE "ncm_agendamento" RENAME COLUMN "cron_expressao" TO "cron_expressao_ncm_agendamento";
ALTER TABLE "ncm_agendamento" RENAME COLUMN "notificadores"  TO "notificadores_ncm_agendamento";
ALTER TABLE "ncm_agendamento" RENAME COLUMN "criado_em"      TO "data_criacao_ncm_agendamento";
ALTER TABLE "ncm_agendamento" RENAME COLUMN "atualizado_em"  TO "data_atualizacao_ncm_agendamento";

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. notificacoes_titulo_corpo
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
-- 5. contato_externo
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
-- 6. configuracao_canal_tenant → configuracao_canal_organizacao
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

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. Enums NCM — renomear tipos e valores para DDD PT
-- ═══════════════════════════════════════════════════════════════════════════

-- NcmSyncStatus → NCMStatusSincronizacao
ALTER TYPE "NcmSyncStatus" RENAME TO "NCMStatusSincronizacao";
ALTER TYPE "NCMStatusSincronizacao" RENAME VALUE 'RUNNING' TO 'EXECUTANDO';
ALTER TYPE "NCMStatusSincronizacao" RENAME VALUE 'SUCCESS' TO 'SUCESSO';
ALTER TYPE "NCMStatusSincronizacao" RENAME VALUE 'ERROR'   TO 'ERRO';

-- NcmSyncOrigem → NCMOrigemSincronizacao (valores não mudam: JOB, MANUAL)
ALTER TYPE "NcmSyncOrigem" RENAME TO "NCMOrigemSincronizacao";

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. Renomear default do enum em ncm_log (Prisma escreve o default literal)
--    Sem isso, o ALTER TABLE preserva o default antigo se o nome do enum mudou.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "ncm_log" ALTER COLUMN "status_ncm_log" SET DEFAULT 'EXECUTANDO'::"NCMStatusSincronizacao";
ALTER TABLE "ncm_log" ALTER COLUMN "origem_ncm_log" SET DEFAULT 'JOB'::"NCMOrigemSincronizacao";
