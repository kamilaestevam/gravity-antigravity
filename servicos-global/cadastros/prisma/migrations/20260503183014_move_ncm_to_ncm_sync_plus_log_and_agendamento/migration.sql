-- ─────────────────────────────────────────────────────────────────────────────
-- NCM Sync mudou para o domínio Cadastros
-- ─────────────────────────────────────────────────────────────────────────────
-- Decisão arquitetural (2026-05-03):
--   - NCM é catálogo global da Receita Federal — fonte da verdade UNIQUE.
--   - Os models de log/agendamento de sincronização vivem JUNTO do catálogo.
--   - Antes esses models estavam no banco da plataforma (gravity-servicos-teste);
--     agora ficam no cadastros (gravity-cadastros-teste). O backend admin no
--     configurador passa a chamar o cadastros via REST.
--   - Renomeada a tabela `ncm` para `ncm_sync` para evitar confusão com a coluna
--     `ncm_item` das tabelas de produto (pedido_itens, etc.).
--   - Sem `id_organizacao` em nenhuma das 3 tabelas (catálogo é global).
--
-- Esta migration:
--   1. Renomeia tabela `ncm` para `ncm_sync` e seus campos para sufixo `_ncm_sync`
--   2. Adiciona 3 colunas novas em `ncm_sync` (data_inicio, data_fim, id_ncm_sync_log)
--   3. Cria tabela `ncm_sync_log` (movida da plataforma, sem tenant_id)
--   4. Cria tabela `ncm_sync_agendamento` (movida da plataforma, sem tenant_id)
--   5. Cria 2 enums em PT-BR
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Enums NCM Sync (PT-BR)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE "NcmSyncStatusSincronizacao" AS ENUM ('EXECUTANDO', 'SUCESSO', 'ERRO');
CREATE TYPE "NcmSyncOrigemSincronizacao" AS ENUM ('JOB', 'MANUAL');

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Renomear tabela `ncm` -> `ncm_sync` e seus campos
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "ncm" RENAME TO "ncm_sync";

ALTER TABLE "ncm_sync" RENAME COLUMN "codigo_ncm"    TO "codigo_ncm_sync";
ALTER TABLE "ncm_sync" RENAME COLUMN "descricao_ncm" TO "descricao_ncm_sync";
ALTER TABLE "ncm_sync" RENAME COLUMN "ipi_ncm"       TO "ipi_ncm_sync";
ALTER TABLE "ncm_sync" RENAME COLUMN "ii_ncm"        TO "ii_ncm_sync";
ALTER TABLE "ncm_sync" RENAME COLUMN "pis_ncm"       TO "pis_ncm_sync";
ALTER TABLE "ncm_sync" RENAME COLUMN "cofins_ncm"    TO "cofins_ncm_sync";
ALTER TABLE "ncm_sync" RENAME COLUMN "ativo_ncm"     TO "ativo_ncm_sync";

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Adicionar colunas novas em `ncm_sync` (metadados do sync)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "ncm_sync" ADD COLUMN "data_inicio_ncm_sync"      TIMESTAMP(3);
ALTER TABLE "ncm_sync" ADD COLUMN "data_fim_ncm_sync"         TIMESTAMP(3);
ALTER TABLE "ncm_sync" ADD COLUMN "id_ncm_sync_log"           TEXT;
ALTER TABLE "ncm_sync" ADD COLUMN "data_criacao_ncm_sync"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ncm_sync" ADD COLUMN "data_atualizacao_ncm_sync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Renomear constraint da PK para refletir novo nome
ALTER TABLE "ncm_sync" RENAME CONSTRAINT "ncm_pkey" TO "ncm_sync_pkey";

-- Índices novos
CREATE INDEX "nsy_ativo_idx" ON "ncm_sync"("ativo_ncm_sync");
CREATE INDEX "nsy_log_idx"   ON "ncm_sync"("id_ncm_sync_log");

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. Criar tabela `ncm_sync_log`
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE "ncm_sync_log" (
    "id_ncm_sync_log"             TEXT NOT NULL,
    "data_inicio_ncm_sync_log"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_conclusao_ncm_sync_log" TIMESTAMP(3),
    "status_ncm_sync_log"         "NcmSyncStatusSincronizacao" NOT NULL DEFAULT 'EXECUTANDO',
    "total_ncm_sync_log"          INTEGER NOT NULL DEFAULT 0,
    "adicionados_ncm_sync_log"    INTEGER NOT NULL DEFAULT 0,
    "alterados_ncm_sync_log"      INTEGER NOT NULL DEFAULT 0,
    "removidos_ncm_sync_log"      INTEGER NOT NULL DEFAULT 0,
    "origem_ncm_sync_log"         "NcmSyncOrigemSincronizacao" NOT NULL DEFAULT 'JOB',
    "disparado_por_ncm_sync_log"  TEXT,
    "mensagem_erro_ncm_sync_log"  TEXT,
    "data_criacao_ncm_sync_log"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_ncm_sync_log" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ncm_sync_log_pkey" PRIMARY KEY ("id_ncm_sync_log")
);

CREATE INDEX "nsl_status_idx" ON "ncm_sync_log"("status_ncm_sync_log");
CREATE INDEX "nsl_inicio_idx" ON "ncm_sync_log"("data_inicio_ncm_sync_log");

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. Criar tabela `ncm_sync_agendamento` (singleton — id='default')
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE "ncm_sync_agendamento" (
    "id_ncm_sync_agendamento"             TEXT NOT NULL DEFAULT 'default',
    "ativo_ncm_sync_agendamento"          BOOLEAN NOT NULL DEFAULT false,
    "cron_expressao_ncm_sync_agendamento" TEXT NOT NULL DEFAULT '0 2 * * *',
    "notificadores_ncm_sync_agendamento"  JSONB NOT NULL DEFAULT '[]',
    "data_criacao_ncm_sync_agendamento"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_ncm_sync_agendamento" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ncm_sync_agendamento_pkey" PRIMARY KEY ("id_ncm_sync_agendamento")
);
