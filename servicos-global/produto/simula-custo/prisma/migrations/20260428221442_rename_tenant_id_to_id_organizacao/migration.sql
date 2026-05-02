-- ============================================================
-- DB-2 Fase 6 — Rename tenant_id -> id_organizacao (simula-custo)
-- ============================================================
-- Renomeia a coluna `tenant_id` para `id_organizacao` em todas as
-- tabelas tenant-aware do produto SimulaCusto, e recria as
-- politicas RLS apontando para a nova coluna.
--
-- Tabelas afetadas:
--   estimativas_trade
--   taxas_estimativa_trade
--   tributos_estimativa_trade
--   documentos_estimativa_trade
--   sequencia_estimativa_trade
--
-- Tabelas SEM tenant_id (sem alteracao):
--   cache_aliquotas_ncm
--   cache_cambio_bacen
-- ============================================================

-- ─── 1. Drop RLS policies antigas (dependem da coluna tenant_id) ─────────────
DROP POLICY IF EXISTS tenant_isolation_policy ON "estimativas_trade";
DROP POLICY IF EXISTS tenant_isolation_policy ON "taxas_estimativa_trade";
DROP POLICY IF EXISTS tenant_isolation_policy ON "tributos_estimativa_trade";
DROP POLICY IF EXISTS tenant_isolation_policy ON "documentos_estimativa_trade";
DROP POLICY IF EXISTS tenant_isolation_policy ON "sequencia_estimativa_trade";

-- ─── 2. Rename column tenant_id -> id_organizacao ────────────────────────────
ALTER TABLE "estimativas_trade"           RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "taxas_estimativa_trade"      RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "tributos_estimativa_trade"   RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "documentos_estimativa_trade" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "sequencia_estimativa_trade"  RENAME COLUMN "tenant_id" TO "id_organizacao";

-- ─── 3. Recriar RLS policies com a nova coluna ───────────────────────────────
-- Mantemos o nome `app.current_tenant_id` no GUC para compatibilidade com o
-- middleware Prisma atual; apenas a coluna referenciada muda.
CREATE POLICY tenant_isolation_policy ON "estimativas_trade"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "taxas_estimativa_trade"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "tributos_estimativa_trade"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "documentos_estimativa_trade"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "sequencia_estimativa_trade"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

-- ─── 4. Renomear indices que carregam o nome `tenant_id` ─────────────────────
-- Indices criados pelo Prisma seguem o padrao
-- "<tabela>_<col1>_<col2>_idx" / "<tabela>_<col>_idx"
-- e nao se renomeiam automaticamente quando a coluna muda.

-- estimativas_trade
ALTER INDEX IF EXISTS "estimativas_trade_tenant_id_idx"                  RENAME TO "estimativas_trade_id_organizacao_idx";
ALTER INDEX IF EXISTS "estimativas_trade_tenant_id_company_id_idx"       RENAME TO "estimativas_trade_id_organizacao_company_id_idx";
ALTER INDEX IF EXISTS "estimativas_trade_tenant_id_product_id_idx"       RENAME TO "estimativas_trade_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "estimativas_trade_tenant_id_user_id_idx"          RENAME TO "estimativas_trade_id_organizacao_user_id_idx";
ALTER INDEX IF EXISTS "estimativas_trade_tenant_id_numero_idx"           RENAME TO "estimativas_trade_id_organizacao_numero_idx";
ALTER INDEX IF EXISTS "estimativas_trade_tenant_id_status_idx"           RENAME TO "estimativas_trade_id_organizacao_status_idx";
ALTER INDEX IF EXISTS "estimativas_trade_tenant_id_ncm_idx"              RENAME TO "estimativas_trade_id_organizacao_ncm_idx";

-- taxas_estimativa_trade
ALTER INDEX IF EXISTS "taxas_estimativa_trade_tenant_id_idx"                  RENAME TO "taxas_estimativa_trade_id_organizacao_idx";
ALTER INDEX IF EXISTS "taxas_estimativa_trade_tenant_id_company_id_idx"       RENAME TO "taxas_estimativa_trade_id_organizacao_company_id_idx";
ALTER INDEX IF EXISTS "taxas_estimativa_trade_tenant_id_product_id_idx"       RENAME TO "taxas_estimativa_trade_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "taxas_estimativa_trade_tenant_id_user_id_idx"          RENAME TO "taxas_estimativa_trade_id_organizacao_user_id_idx";
ALTER INDEX IF EXISTS "taxas_estimativa_trade_tenant_id_estimativa_id_idx"    RENAME TO "taxas_estimativa_trade_id_organizacao_estimativa_id_idx";

-- tributos_estimativa_trade
ALTER INDEX IF EXISTS "tributos_estimativa_trade_tenant_id_idx"               RENAME TO "tributos_estimativa_trade_id_organizacao_idx";
ALTER INDEX IF EXISTS "tributos_estimativa_trade_tenant_id_product_id_idx"    RENAME TO "tributos_estimativa_trade_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "tributos_estimativa_trade_tenant_id_user_id_idx"       RENAME TO "tributos_estimativa_trade_id_organizacao_user_id_idx";
ALTER INDEX IF EXISTS "tributos_estimativa_trade_tenant_id_estimativa_id_idx" RENAME TO "tributos_estimativa_trade_id_organizacao_estimativa_id_idx";

-- documentos_estimativa_trade
ALTER INDEX IF EXISTS "documentos_estimativa_trade_tenant_id_idx"               RENAME TO "documentos_estimativa_trade_id_organizacao_idx";
ALTER INDEX IF EXISTS "documentos_estimativa_trade_tenant_id_product_id_idx"    RENAME TO "documentos_estimativa_trade_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "documentos_estimativa_trade_tenant_id_user_id_idx"       RENAME TO "documentos_estimativa_trade_id_organizacao_user_id_idx";
ALTER INDEX IF EXISTS "documentos_estimativa_trade_tenant_id_estimativa_id_idx" RENAME TO "documentos_estimativa_trade_id_organizacao_estimativa_id_idx";

-- sequencia_estimativa_trade
ALTER INDEX IF EXISTS "sequencia_estimativa_trade_tenant_id_idx"               RENAME TO "sequencia_estimativa_trade_id_organizacao_idx";
ALTER INDEX IF EXISTS "sequencia_estimativa_trade_tenant_id_user_id_ano_key"   RENAME TO "sequencia_estimativa_trade_id_organizacao_user_id_ano_key";
