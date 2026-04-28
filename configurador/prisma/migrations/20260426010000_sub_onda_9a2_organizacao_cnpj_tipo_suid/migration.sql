-- Sub-onda 9a.2 — Configurador.Organizacao
-- Renames físicos para alinhar com a Planilha (Erradicação do @map):
--   tipo_organizacao -> tipo_empresa_organizacao
--   suid_empresa     -> suid_empresa_organizacao
-- Observação: cnpj_organizacao já é o nome físico atual (apenas drop do @map no schema, sem DDL).

-- Rename column tipo_organizacao -> tipo_empresa_organizacao
ALTER TABLE "organizacao" RENAME COLUMN "tipo_organizacao" TO "tipo_empresa_organizacao";

-- Rename column suid_empresa -> suid_empresa_organizacao + índice
ALTER TABLE "organizacao" RENAME COLUMN "suid_empresa" TO "suid_empresa_organizacao";
ALTER INDEX "organizacao_suid_empresa_key" RENAME TO "organizacao_suid_empresa_organizacao_key";
