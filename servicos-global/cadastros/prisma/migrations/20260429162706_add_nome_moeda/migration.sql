-- Migration: add_nome_moeda
-- Adiciona coluna nome_moeda (NOT NULL) ao catálogo global Moeda.
-- Aplicada manualmente via ALTER TABLE em 2026-04-29 (tabela vazia, sem backfill necessário).
-- Esta migration é registrada em _prisma_migrations via `prisma migrate resolve --applied`.

ALTER TABLE "moeda" ADD COLUMN "nome_moeda" TEXT NOT NULL;
