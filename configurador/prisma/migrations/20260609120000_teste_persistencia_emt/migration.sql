-- Migration: teste_persistencia_emt
-- Colunas para persistir histórico Admin/Testes no Postgres (sobrevive redeploy Railway).
-- Aprovado pelo Coordenador em 2026-06-09.

ALTER TABLE "teste" ADD COLUMN "log_sucesso_teste"        TEXT;
ALTER TABLE "teste" ADD COLUMN "pasta_emt_teste"          TEXT;
ALTER TABLE "teste" ADD COLUMN "lista_prints_emt_teste"   JSONB;
ALTER TABLE "teste" ADD COLUMN "quantidade_passos_teste"  INTEGER NOT NULL DEFAULT 1;
