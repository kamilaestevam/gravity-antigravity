-- Remove a tabela `Empresa` órfã do banco organizacao-shared
-- (gravity-servicos-teste / gravity-servicos-prod).
--
-- Histórico: a tabela existia no banco mas:
--   1. Não estava referenciada em nenhum schema.prisma atual
--   2. Tinha 0 rows em teste (provável o mesmo em produção)
--   3. Naming pré-DDD (PascalCase sem @@map; colunas tenant_id/product_id/user_id
--      sem sufixo _empresa, sem id_organizacao canonical)
--   4. Era resquício de quando "Servicos" tinha um modelo Empresa próprio,
--      antes do serviço Cadastros nascer como home dedicado.
--
-- Empresa canônica vive em servicos-global/cadastros (DB próprio,
-- CADASTROS_DATABASE_URL). Snapshots históricos para emissão de documento
-- ficam nos produtos que emitem (ex: pedido_snapshot_empresa).
--
-- Idempotente — IF EXISTS evita falha em ambientes onde já foi removida.

DROP TABLE IF EXISTS "Empresa";
