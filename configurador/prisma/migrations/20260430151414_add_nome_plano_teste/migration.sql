-- Migration: add_nome_plano_teste
-- Adiciona coluna nome_plano_teste (NOT NULL) à tabela plano_teste.
-- Tabela vazia no momento da aplicação, sem backfill.

ALTER TABLE "plano_teste" ADD COLUMN "nome_plano_teste" TEXT NOT NULL DEFAULT '';
ALTER TABLE "plano_teste" ALTER COLUMN "nome_plano_teste" DROP DEFAULT;
