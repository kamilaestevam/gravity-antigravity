-- Migration: pedido_status_draft_para_rascunho
--
-- Alinha o valor 'draft' (legado, inglês) ao DDD ('rascunho', PT-BR) — princípio
-- fundamental da skill ddd-nomenclatura: nomeação em PT-BR sem acentos. Inglês
-- só quando forçado (ID externo, keyword de linguagem, padrão técnico universal).
--
-- Contexto:
--   - O atlas DDD (04-enums.md) já lista PedidoStatusRascunho como o conceito
--     canônico; só o valor de banco continuava em inglês ('draft'), causando
--     mismatch com STATUS_PADRAO seedado pelo Configurador, que usa 'rascunho'.
--   - O kanban (PedidosKanban.tsx) deixava de exibir cards porque a coluna
--     gerada via STATUS_PADRAO tem key='rascunho' enquanto pedidos no banco
--     guardavam 'draft' — getColumnItems não casava.
--   - Os outros 6 valores já estão em PT-BR (aberto, em_andamento, aprovado,
--     transferencia, consolidado, cancelado). 'draft' era o único outlier.
--
-- Ações:
--   1. UPDATE retroativo: 'draft' → 'rascunho' em todos os registros.
--   2. ALTER DEFAULT da coluna status_pedido para 'rascunho'.
--
-- Pré-condição: nenhum código novo após esta migration deve referenciar 'draft'
-- como valor de status_pedido (auditado em 25 arquivos antes da merge).
--
-- Schema Prisma (fragment.prisma, schema.prisma) deve ser atualizado em PR
-- separado pelo Coordenador (Mandamento 02), trocando @default("draft") por
-- @default("rascunho").

BEGIN;

-- 1. Atualiza dados retroativamente (todos os pedidos com 'draft' viram 'rascunho').
UPDATE "pedido"
   SET "status_pedido" = 'rascunho'
 WHERE "status_pedido" = 'draft';

-- 2. Troca o default da coluna no PostgreSQL.
ALTER TABLE "pedido"
  ALTER COLUMN "status_pedido" SET DEFAULT 'rascunho';

COMMIT;

-- ─── ROLLBACK ────────────────────────────────────────────────────────────────
-- Em caso de necessidade de reverter (NÃO recomendado — código novo já assume
-- 'rascunho'; reverter o banco sem reverter o código causa ruptura imediata):
--
-- BEGIN;
-- ALTER TABLE "pedido" ALTER COLUMN "status_pedido" SET DEFAULT 'draft';
-- UPDATE "pedido" SET "status_pedido" = 'draft' WHERE "status_pedido" = 'rascunho';
-- COMMIT;
--
-- Pré-requisito do rollback: também reverter os 21 arquivos de código + atlas.
-- O caminho seguro de retorno é forward-fix, não rollback.
