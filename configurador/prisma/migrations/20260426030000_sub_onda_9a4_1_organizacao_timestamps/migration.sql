-- Sub-onda 9a.4.1 — Configurador.Organizacao timestamps
--
-- created_at já está fisicamente mapeado para data_criacao_organizacao.
-- Apenas dropamos o @map em Prisma (rename lógico — sem DDL).
--
-- updated_at: rename físico de DDL.
ALTER TABLE "organizacao" RENAME COLUMN "updated_at" TO "data_atualizacao_organizacao";
