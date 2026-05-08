-- Migration: pedido_status_fk_real_e_backfill
--
-- Promove a coluna pedido.id_status_pedido (até hoje "soft FK", String? sem
-- @relation, nunca populada) a uma FK real referenciando status_pedido.id_pedido_status.
-- Faz backfill retroativo: para cada pedido, encontra a linha de status_pedido
-- da mesma organização cujo nome_pedido_status bate com pedido.status_pedido,
-- e seta id_status_pedido com o id correspondente.
--
-- Contexto:
--   - O atlas DDD (03-models.md) já documenta o relacionamento Pedido ↔ StatusPedido.
--   - O Configurador auto-seeda 7 linhas de status_pedido por organização ao criar
--     o catálogo de status (rascunho, aberto, em_andamento, aprovado, transferencia,
--     consolidado, cancelado), unique por (id_organizacao, nome_pedido_status).
--   - Hoje qualquer rota pode escrever pedido.status_pedido = 'qualquercoisa' e o
--     banco aceita — lixo silencioso entrando. Com a FK real, INSERT/UPDATE com
--     status inexistente falha alto (Mandamento 08).
--
-- Ações:
--   1. Backfill: UPDATE pedido SET id_status_pedido = (lookup por nome+org).
--   2. Adiciona FK constraint pedido.id_status_pedido → status_pedido.id_pedido_status
--      com ON DELETE RESTRICT (status em uso não pode ser deletado por engano)
--      e ON UPDATE CASCADE (rename de id propaga, embora cuid não mude).
--
-- Pré-requisito: migration 20260508000000_pedido_status_draft_para_rascunho
-- já aplicada (todos os pedidos têm status_pedido em PT-BR coerente com o seed).
--
-- Schema Prisma já atualizado em PR conjunto com esta migration:
--   - fragment.prisma: Pedido recebe `status StatusPedido? @relation(...)`
--                      StatusPedido recebe back-relation `pedidos Pedido[]`
--   - schema.prisma: regenerado pelo compose-pedido-schema.ts

BEGIN;

-- 1. Backfill: liga cada pedido ao seu status no catálogo (mesma org, mesmo nome).
UPDATE "pedido" p
   SET "id_status_pedido" = sp."id_pedido_status"
  FROM "status_pedido" sp
 WHERE p."id_organizacao"  = sp."id_organizacao"
   AND p."status_pedido"   = sp."nome_pedido_status"
   AND p."id_status_pedido" IS NULL;

-- 2. Cria a FK constraint.
ALTER TABLE "pedido"
  ADD CONSTRAINT "pedido_id_status_pedido_fkey"
  FOREIGN KEY ("id_status_pedido")
  REFERENCES "status_pedido"("id_pedido_status")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

COMMIT;

-- ─── VALIDAÇÃO PÓS-DEPLOY ────────────────────────────────────────────────────
-- Em cada schema de organização, rodar:
--
--   SELECT COUNT(*) AS pedidos_sem_status_fk
--     FROM "pedido"
--    WHERE "id_status_pedido" IS NULL
--      AND "data_exclusao_pedido" IS NULL;
--
-- Esperado: 0 (todos os pedidos ativos têm FK setada).
-- Se > 0 → investigar: provavelmente status_pedido com valor que não existe
-- em status_pedido.nome_pedido_status (corrigir antes de exigir NOT NULL).

-- ─── ROLLBACK ────────────────────────────────────────────────────────────────
-- Em caso de necessidade de reverter:
--
--   BEGIN;
--   ALTER TABLE "pedido" DROP CONSTRAINT "pedido_id_status_pedido_fkey";
--   -- Backfill não precisa ser revertido — o valor de id_status_pedido fica
--   -- preenchido mas sem constraint, voltando ao estado "soft FK" anterior.
--   COMMIT;
--
-- Pré-requisito do rollback: também reverter as alterações de schema (Pedido.status
-- e StatusPedido.pedidos). Caminho seguro de retorno é forward-fix.
