-- Migration: rename_config_to_configuracao_produto_gravity
-- Renomeia tabela config_produto_gravity → configuracao_produto_gravity
-- e troca prefixo "_config_" por "_configuracao_" em todas as colunas
-- exceto na coluna Json `configuracao_config_produto_gravity` (mantida por
-- decisão do dono — evita duplicação `configuracao_configuracao_*`).
-- Aplicada manualmente em transação em 2026-04-30 (6 rows preservadas).

-- 1. RENAME TABLE
ALTER TABLE "config_produto_gravity" RENAME TO "configuracao_produto_gravity";

-- 2. RENAME COLUMNs (6, exceto a coluna Json)
ALTER TABLE "configuracao_produto_gravity" RENAME COLUMN "id_config_produto_gravity"               TO "id_configuracao_produto_gravity";
ALTER TABLE "configuracao_produto_gravity" RENAME COLUMN "id_organizacao_config_produto_gravity"   TO "id_organizacao_configuracao_produto_gravity";
ALTER TABLE "configuracao_produto_gravity" RENAME COLUMN "chave_produto_config_produto_gravity"    TO "chave_produto_configuracao_produto_gravity";
ALTER TABLE "configuracao_produto_gravity" RENAME COLUMN "ativo_config_produto_gravity"            TO "ativo_configuracao_produto_gravity";
ALTER TABLE "configuracao_produto_gravity" RENAME COLUMN "data_criacao_config_produto_gravity"     TO "data_criacao_configuracao_produto_gravity";
ALTER TABLE "configuracao_produto_gravity" RENAME COLUMN "data_atualizacao_config_produto_gravity" TO "data_atualizacao_configuracao_produto_gravity";

-- 3. RENAME PK CONSTRAINT
ALTER TABLE "configuracao_produto_gravity" RENAME CONSTRAINT "config_produto_gravity_pkey" TO "configuracao_produto_gravity_pkey";

-- 4. RENAME FK CONSTRAINT (nome curto via map: para evitar truncamento)
ALTER TABLE "configuracao_produto_gravity"
  RENAME CONSTRAINT "config_produto_gravity_id_organizacao_config_produto_gravit_fkey"
  TO "cpg_org_fkey";
