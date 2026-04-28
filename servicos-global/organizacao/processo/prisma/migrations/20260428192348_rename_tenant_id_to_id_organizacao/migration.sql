-- ============================================================
-- DB-2 Fase 6 — Rename tenant_id -> id_organizacao (processo)
-- ============================================================
-- Renomeia a coluna `tenant_id` para `id_organizacao` em todas as
-- tabelas tenant-aware do produto Processo, e recria as politicas
-- RLS apontando para a nova coluna.
--
-- Tabelas afetadas (12):
--   processos
--   processo_etapas
--   pedidos
--   pedido_itens
--   follow_ups
--   documentos
--   estimativas_custo
--   dados_tecnicos
--   pedido_status
--   pedido_colunas
--   pedido_preferencias_usuario
--   pedido_preferencias_padrao
--
-- O GUC `app.current_tenant_id` permanece com o mesmo nome para
-- compatibilidade com o middleware Prisma (`tenantIsolation`).
-- ============================================================

-- ─── 1. Drop RLS policies antigas (dependem da coluna tenant_id) ─────────────
DROP POLICY IF EXISTS tenant_isolation_policy ON "processos";
DROP POLICY IF EXISTS tenant_isolation_policy ON "processo_etapas";
DROP POLICY IF EXISTS tenant_isolation_policy ON "pedidos";
DROP POLICY IF EXISTS tenant_isolation_policy ON "pedido_itens";
DROP POLICY IF EXISTS tenant_isolation_policy ON "follow_ups";
DROP POLICY IF EXISTS tenant_isolation_policy ON "documentos";
DROP POLICY IF EXISTS tenant_isolation_policy ON "estimativas_custo";
DROP POLICY IF EXISTS tenant_isolation_policy ON "dados_tecnicos";
DROP POLICY IF EXISTS tenant_isolation_policy ON "pedido_status";
DROP POLICY IF EXISTS tenant_isolation_policy ON "pedido_colunas";
DROP POLICY IF EXISTS tenant_isolation_policy ON "pedido_preferencias_usuario";
DROP POLICY IF EXISTS tenant_isolation_policy ON "pedido_preferencias_padrao";

-- ─── 2. Rename column tenant_id -> id_organizacao ────────────────────────────
ALTER TABLE "processos"                   RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "processo_etapas"             RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "pedidos"                     RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "pedido_itens"                RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "follow_ups"                  RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "documentos"                  RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "estimativas_custo"           RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "dados_tecnicos"              RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "pedido_status"               RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "pedido_colunas"              RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "pedido_preferencias_usuario" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "pedido_preferencias_padrao"  RENAME COLUMN "tenant_id" TO "id_organizacao";

-- ─── 3. Recriar RLS policies com a nova coluna ───────────────────────────────
-- Mantemos o nome `app.current_tenant_id` no GUC para compatibilidade com o
-- middleware Prisma atual; apenas a coluna referenciada muda.
CREATE POLICY tenant_isolation_policy ON "processos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "processo_etapas"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "pedidos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "pedido_itens"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "follow_ups"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "documentos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "estimativas_custo"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "dados_tecnicos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "pedido_status"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "pedido_colunas"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "pedido_preferencias_usuario"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "pedido_preferencias_padrao"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

-- ─── 4. Renomear indices que carregam o nome `tenant_id` ─────────────────────
-- Indices criados pelo Prisma seguem o padrao
-- "<tabela>_<col1>_<col2>_idx" / "<tabela>_<col>_idx"
-- e nao se renomeiam automaticamente quando a coluna muda.

-- processos
ALTER INDEX IF EXISTS "processos_tenant_id_idx"             RENAME TO "processos_id_organizacao_idx";
ALTER INDEX IF EXISTS "processos_tenant_id_product_id_idx"  RENAME TO "processos_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "processos_tenant_id_user_id_idx"     RENAME TO "processos_id_organizacao_user_id_idx";
ALTER INDEX IF EXISTS "processos_tenant_id_numero_idx"      RENAME TO "processos_id_organizacao_numero_idx";

-- processo_etapas
ALTER INDEX IF EXISTS "processo_etapas_tenant_id_idx"             RENAME TO "processo_etapas_id_organizacao_idx";
ALTER INDEX IF EXISTS "processo_etapas_tenant_id_product_id_idx"  RENAME TO "processo_etapas_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "processo_etapas_tenant_id_processo_id_idx" RENAME TO "processo_etapas_id_organizacao_processo_id_idx";

-- pedidos
ALTER INDEX IF EXISTS "pedidos_tenant_id_idx"             RENAME TO "pedidos_id_organizacao_idx";
ALTER INDEX IF EXISTS "pedidos_tenant_id_product_id_idx"  RENAME TO "pedidos_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "pedidos_tenant_id_processo_id_idx" RENAME TO "pedidos_id_organizacao_processo_id_idx";
ALTER INDEX IF EXISTS "pedidos_tenant_id_status_idx"      RENAME TO "pedidos_id_organizacao_status_idx";
ALTER INDEX IF EXISTS "pedidos_tenant_id_status_id_idx"   RENAME TO "pedidos_id_organizacao_status_id_idx";

-- pedido_itens
ALTER INDEX IF EXISTS "pedido_itens_tenant_id_idx"             RENAME TO "pedido_itens_id_organizacao_idx";
ALTER INDEX IF EXISTS "pedido_itens_tenant_id_product_id_idx"  RENAME TO "pedido_itens_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "pedido_itens_tenant_id_pedido_id_idx"   RENAME TO "pedido_itens_id_organizacao_pedido_id_idx";

-- follow_ups
ALTER INDEX IF EXISTS "follow_ups_tenant_id_idx"             RENAME TO "follow_ups_id_organizacao_idx";
ALTER INDEX IF EXISTS "follow_ups_tenant_id_product_id_idx"  RENAME TO "follow_ups_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "follow_ups_tenant_id_processo_id_idx" RENAME TO "follow_ups_id_organizacao_processo_id_idx";

-- documentos
ALTER INDEX IF EXISTS "documentos_tenant_id_idx"             RENAME TO "documentos_id_organizacao_idx";
ALTER INDEX IF EXISTS "documentos_tenant_id_product_id_idx"  RENAME TO "documentos_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "documentos_tenant_id_processo_id_idx" RENAME TO "documentos_id_organizacao_processo_id_idx";

-- estimativas_custo
ALTER INDEX IF EXISTS "estimativas_custo_tenant_id_idx"            RENAME TO "estimativas_custo_id_organizacao_idx";
ALTER INDEX IF EXISTS "estimativas_custo_tenant_id_product_id_idx" RENAME TO "estimativas_custo_id_organizacao_product_id_idx";

-- dados_tecnicos
ALTER INDEX IF EXISTS "dados_tecnicos_tenant_id_idx"            RENAME TO "dados_tecnicos_id_organizacao_idx";
ALTER INDEX IF EXISTS "dados_tecnicos_tenant_id_product_id_idx" RENAME TO "dados_tecnicos_id_organizacao_product_id_idx";

-- pedido_status
ALTER INDEX IF EXISTS "pedido_status_tenant_id_nome_key"       RENAME TO "pedido_status_id_organizacao_nome_key";
ALTER INDEX IF EXISTS "pedido_status_tenant_id_idx"            RENAME TO "pedido_status_id_organizacao_idx";
ALTER INDEX IF EXISTS "pedido_status_tenant_id_product_id_idx" RENAME TO "pedido_status_id_organizacao_product_id_idx";

-- pedido_colunas
ALTER INDEX IF EXISTS "pedido_colunas_tenant_id_nome_key"       RENAME TO "pedido_colunas_id_organizacao_nome_key";
ALTER INDEX IF EXISTS "pedido_colunas_tenant_id_idx"            RENAME TO "pedido_colunas_id_organizacao_idx";
ALTER INDEX IF EXISTS "pedido_colunas_tenant_id_product_id_idx" RENAME TO "pedido_colunas_id_organizacao_product_id_idx";

-- pedido_preferencias_usuario
ALTER INDEX IF EXISTS "pedido_preferencias_usuario_tenant_id_user_id_key" RENAME TO "pedido_preferencias_usuario_id_organizacao_user_id_key";
ALTER INDEX IF EXISTS "pedido_preferencias_usuario_tenant_id_idx"         RENAME TO "pedido_preferencias_usuario_id_organizacao_idx";
ALTER INDEX IF EXISTS "pedido_preferencias_usuario_tenant_id_user_id_idx" RENAME TO "pedido_preferencias_usuario_id_organizacao_user_id_idx";

-- pedido_preferencias_padrao
ALTER INDEX IF EXISTS "pedido_preferencias_padrao_tenant_id_key"            RENAME TO "pedido_preferencias_padrao_id_organizacao_key";
ALTER INDEX IF EXISTS "pedido_preferencias_padrao_tenant_id_idx"            RENAME TO "pedido_preferencias_padrao_id_organizacao_idx";
ALTER INDEX IF EXISTS "pedido_preferencias_padrao_tenant_id_product_id_idx" RENAME TO "pedido_preferencias_padrao_id_organizacao_product_id_idx";
