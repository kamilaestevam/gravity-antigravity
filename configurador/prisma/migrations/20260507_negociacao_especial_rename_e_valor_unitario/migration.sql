-- Migration: rename DDD da tabela negociacao_especial_preco_produto_gravity -> negociacao_especial
-- + adicao de campos valor_unitario_negociacao_especial e moeda_negociacao_especial
--
-- Pre-condicao verificada (2026-05-07): SELECT COUNT(*) na tabela retornou 0.
-- Migration e atomica (BEGIN/COMMIT) e idempotente (IF EXISTS) onde possivel.
--
-- Aprovado pelo dono + Coordenador + Lider Tecnico em 2026-05-07.

BEGIN;

ALTER TABLE "negociacao_especial_preco_produto_gravity" RENAME TO "negociacao_especial";

ALTER TABLE "negociacao_especial" RENAME COLUMN "id_negociacao_especial_preco_produto_gravity" TO "id_negociacao_especial";
ALTER TABLE "negociacao_especial" RENAME COLUMN "nome_organizacao_negociacao_especial_preco_produto_gravity" TO "nome_organizacao_negociacao_especial";
ALTER TABLE "negociacao_especial" RENAME COLUMN "acordo_negociacao_especial_preco_produto_gravity" TO "acordo_negociacao_especial";
ALTER TABLE "negociacao_especial" RENAME COLUMN "data_inicio_negociacao_especial_preco_produto_gravity" TO "data_inicio_negociacao_especial";
ALTER TABLE "negociacao_especial" RENAME COLUMN "data_fim_negociacao_especial_preco_produto_gravity" TO "data_fim_negociacao_especial";
ALTER TABLE "negociacao_especial" RENAME COLUMN "ilimitado_negociacao_especial_preco_produto_gravity" TO "ilimitado_prazo_negociacao_especial";
ALTER TABLE "negociacao_especial" RENAME COLUMN "data_criacao_negociacao_especial_preco_produto_gravity" TO "data_criacao_negociacao_especial";
ALTER TABLE "negociacao_especial" RENAME COLUMN "data_atualizacao_negociacao_especial_preco_produto_gravity" TO "data_atualizacao_negociacao_especial";

ALTER INDEX IF EXISTS "negociacao_especial_preco_produto_gravity_idx" RENAME TO "negociacao_especial_idx";
ALTER INDEX IF EXISTS "negociacao_especial_preco_produto_gravity_organizacao_idx" RENAME TO "negociacao_especial_organizacao_idx";

ALTER TABLE "negociacao_especial" RENAME CONSTRAINT "negociacao_especial_preco_produto_gravity_fkey" TO "negociacao_especial_fkey";

ALTER TABLE "negociacao_especial" ADD COLUMN "valor_unitario_negociacao_especial" DECIMAL(15,2);
ALTER TABLE "negociacao_especial" ADD COLUMN "moeda_negociacao_especial" TEXT NOT NULL DEFAULT 'BRL';

COMMIT;
