-- ─────────────────────────────────────────────────────────────────────────────
-- DROP dos models NCM da plataforma (movidos para o Cadastros)
-- ─────────────────────────────────────────────────────────────────────────────
-- Decisão arquitetural (2026-05-03): NCM é catálogo global da Receita Federal.
-- Toda a stack de NCM (catálogo + log de sync + agendamento) agora vive no
-- banco do Cadastros (gravity-cadastros-teste). A plataforma não acessa NCM
-- diretamente — quem precisa consulta o Cadastros via REST.
--
-- Tabelas a remover:
--   - ncm_item            (catálogo duplicado, agora `ncm_sync` no cadastros)
--   - ncm_log             (histórico, agora `ncm_sync_log` no cadastros)
--   - ncm_agendamento     (singleton de cron, agora `ncm_sync_agendamento` no cadastros)
--
-- Enums a remover:
--   - NcmSyncStatus       (substituído por NcmSyncStatusSincronizacao no cadastros)
--   - NcmSyncOrigem       (substituído por NcmSyncOrigemSincronizacao no cadastros)
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS "ncm_item"        CASCADE;
DROP TABLE IF EXISTS "ncm_log"         CASCADE;
DROP TABLE IF EXISTS "ncm_agendamento" CASCADE;

DROP TYPE IF EXISTS "NcmSyncStatus";
DROP TYPE IF EXISTS "NcmSyncOrigem";
