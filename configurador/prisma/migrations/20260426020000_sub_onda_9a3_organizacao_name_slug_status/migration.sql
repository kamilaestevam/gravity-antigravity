-- Sub-onda 9a.3 — Configurador.Organizacao
-- Renames lógicos (TS) para alinhar com a Planilha (Erradicação do @map):
--   name   (TS) -> nome_organizacao         (físico já era nome_organizacao)
--   slug   (TS) -> subdominio_organizacao   (físico já era subdominio_organizacao)
--   status (TS) -> status_organizacao       (físico já era status_organizacao)
-- Observação: NENHUMA mudança de DDL — apenas drop dos @map no schema Prisma.
-- Os índices @@index também tiveram seus nomes lógicos renomeados; Prisma usa
-- os nomes físicos (já corretos) — sem efeito em SQL.

SELECT 1;
