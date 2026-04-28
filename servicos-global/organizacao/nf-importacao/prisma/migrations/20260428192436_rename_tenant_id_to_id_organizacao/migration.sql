-- ============================================================
-- DB-2 Fase 6 — Rename tenant_id -> id_organizacao (nf-importacao)
-- ============================================================
-- Renomeia a coluna `tenant_id` para `id_organizacao` em todas as
-- tabelas tenant-aware do produto NF Importacao, e recria as
-- politicas RLS apontando para a nova coluna.
--
-- Tabelas afetadas (12 — todas tenant-aware):
--   nf_importacoes
--   nf_importacao_itens
--   nf_importacao_despesas
--   nf_importacao_rateios
--   nf_importacao_documentos
--   nf_importacao_historico
--   despesa_catalogos
--   despesa_templates
--   despesa_template_itens
--   export_layouts
--   export_layout_campos
--   favoritos_fiscais
-- ============================================================

-- ─── 1. Drop RLS policies antigas (dependem da coluna tenant_id) ─────────────
DROP POLICY IF EXISTS tenant_isolation_policy ON "nf_importacoes";
DROP POLICY IF EXISTS tenant_isolation_policy ON "nf_importacao_itens";
DROP POLICY IF EXISTS tenant_isolation_policy ON "nf_importacao_despesas";
DROP POLICY IF EXISTS tenant_isolation_policy ON "nf_importacao_rateios";
DROP POLICY IF EXISTS tenant_isolation_policy ON "nf_importacao_documentos";
DROP POLICY IF EXISTS tenant_isolation_policy ON "nf_importacao_historico";
DROP POLICY IF EXISTS tenant_isolation_policy ON "despesa_catalogos";
DROP POLICY IF EXISTS tenant_isolation_policy ON "despesa_templates";
DROP POLICY IF EXISTS tenant_isolation_policy ON "despesa_template_itens";
DROP POLICY IF EXISTS tenant_isolation_policy ON "export_layouts";
DROP POLICY IF EXISTS tenant_isolation_policy ON "export_layout_campos";
DROP POLICY IF EXISTS tenant_isolation_policy ON "favoritos_fiscais";

-- ─── 2. Rename column tenant_id -> id_organizacao ────────────────────────────
ALTER TABLE "nf_importacoes"           RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "nf_importacao_itens"      RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "nf_importacao_despesas"   RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "nf_importacao_rateios"    RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "nf_importacao_documentos" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "nf_importacao_historico"  RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "despesa_catalogos"        RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "despesa_templates"        RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "despesa_template_itens"   RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "export_layouts"           RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "export_layout_campos"     RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER TABLE "favoritos_fiscais"        RENAME COLUMN "tenant_id" TO "id_organizacao";

-- ─── 3. Recriar RLS policies com a nova coluna ───────────────────────────────
-- Mantemos o nome `app.current_tenant_id` no GUC para compatibilidade com o
-- middleware Prisma atual; apenas a coluna referenciada muda.
CREATE POLICY tenant_isolation_policy ON "nf_importacoes"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "nf_importacao_itens"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "nf_importacao_despesas"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "nf_importacao_rateios"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "nf_importacao_documentos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "nf_importacao_historico"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "despesa_catalogos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "despesa_templates"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "despesa_template_itens"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "export_layouts"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "export_layout_campos"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_policy ON "favoritos_fiscais"
  USING (id_organizacao = current_setting('app.current_tenant_id', true));

-- ─── 4. Renomear indices que carregam o nome `tenant_id` ─────────────────────
-- Indices criados pelo Prisma seguem o padrao
-- "<tabela>_<col1>_<col2>_idx" / "<tabela>_<col>_idx"
-- e nao se renomeiam automaticamente quando a coluna muda.

-- nf_importacoes
ALTER INDEX IF EXISTS "nf_importacoes_tenant_id_idx"                         RENAME TO "nf_importacoes_id_organizacao_idx";
ALTER INDEX IF EXISTS "nf_importacoes_tenant_id_product_id_idx"              RENAME TO "nf_importacoes_id_organizacao_product_id_idx";
ALTER INDEX IF EXISTS "nf_importacoes_tenant_id_user_id_idx"                 RENAME TO "nf_importacoes_id_organizacao_user_id_idx";
ALTER INDEX IF EXISTS "nf_importacoes_tenant_id_company_id_idx"              RENAME TO "nf_importacoes_id_organizacao_company_id_idx";
ALTER INDEX IF EXISTS "nf_importacoes_tenant_id_company_id_status_idx"       RENAME TO "nf_importacoes_id_organizacao_company_id_status_idx";

-- nf_importacao_itens
ALTER INDEX IF EXISTS "nf_importacao_itens_tenant_id_idx"                    RENAME TO "nf_importacao_itens_id_organizacao_idx";
ALTER INDEX IF EXISTS "nf_importacao_itens_tenant_id_company_id_idx"         RENAME TO "nf_importacao_itens_id_organizacao_company_id_idx";

-- nf_importacao_despesas
ALTER INDEX IF EXISTS "nf_importacao_despesas_tenant_id_idx"                 RENAME TO "nf_importacao_despesas_id_organizacao_idx";
ALTER INDEX IF EXISTS "nf_importacao_despesas_tenant_id_company_id_idx"      RENAME TO "nf_importacao_despesas_id_organizacao_company_id_idx";

-- nf_importacao_rateios
ALTER INDEX IF EXISTS "nf_importacao_rateios_tenant_id_idx"                  RENAME TO "nf_importacao_rateios_id_organizacao_idx";
ALTER INDEX IF EXISTS "nf_importacao_rateios_tenant_id_company_id_idx"       RENAME TO "nf_importacao_rateios_id_organizacao_company_id_idx";

-- nf_importacao_documentos
ALTER INDEX IF EXISTS "nf_importacao_documentos_tenant_id_idx"               RENAME TO "nf_importacao_documentos_id_organizacao_idx";
ALTER INDEX IF EXISTS "nf_importacao_documentos_tenant_id_company_id_idx"    RENAME TO "nf_importacao_documentos_id_organizacao_company_id_idx";

-- nf_importacao_historico
ALTER INDEX IF EXISTS "nf_importacao_historico_tenant_id_idx"                RENAME TO "nf_importacao_historico_id_organizacao_idx";
ALTER INDEX IF EXISTS "nf_importacao_historico_tenant_id_company_id_idx"     RENAME TO "nf_importacao_historico_id_organizacao_company_id_idx";

-- despesa_catalogos
ALTER INDEX IF EXISTS "despesa_catalogos_tenant_id_idx"                      RENAME TO "despesa_catalogos_id_organizacao_idx";
ALTER INDEX IF EXISTS "despesa_catalogos_tenant_id_company_id_idx"           RENAME TO "despesa_catalogos_id_organizacao_company_id_idx";
ALTER INDEX IF EXISTS "despesa_catalogos_tenant_id_company_id_nome_key"      RENAME TO "despesa_catalogos_id_organizacao_company_id_nome_key";

-- despesa_templates
ALTER INDEX IF EXISTS "despesa_templates_tenant_id_idx"                      RENAME TO "despesa_templates_id_organizacao_idx";
ALTER INDEX IF EXISTS "despesa_templates_tenant_id_company_id_idx"           RENAME TO "despesa_templates_id_organizacao_company_id_idx";
ALTER INDEX IF EXISTS "despesa_templates_tenant_id_company_id_nome_key"      RENAME TO "despesa_templates_id_organizacao_company_id_nome_key";

-- despesa_template_itens
ALTER INDEX IF EXISTS "despesa_template_itens_tenant_id_idx"                 RENAME TO "despesa_template_itens_id_organizacao_idx";

-- export_layouts
ALTER INDEX IF EXISTS "export_layouts_tenant_id_idx"                         RENAME TO "export_layouts_id_organizacao_idx";
ALTER INDEX IF EXISTS "export_layouts_tenant_id_company_id_idx"              RENAME TO "export_layouts_id_organizacao_company_id_idx";
ALTER INDEX IF EXISTS "export_layouts_tenant_id_company_id_nome_key"         RENAME TO "export_layouts_id_organizacao_company_id_nome_key";

-- export_layout_campos
ALTER INDEX IF EXISTS "export_layout_campos_tenant_id_idx"                   RENAME TO "export_layout_campos_id_organizacao_idx";

-- favoritos_fiscais
ALTER INDEX IF EXISTS "favoritos_fiscais_tenant_id_idx"                                                  RENAME TO "favoritos_fiscais_id_organizacao_idx";
ALTER INDEX IF EXISTS "favoritos_fiscais_tenant_id_company_id_idx"                                       RENAME TO "favoritos_fiscais_id_organizacao_company_id_idx";
ALTER INDEX IF EXISTS "favoritos_fiscais_tenant_id_company_id_ncm_idx"                                   RENAME TO "favoritos_fiscais_id_organizacao_company_id_ncm_idx";
ALTER INDEX IF EXISTS "favoritos_fiscais_tenant_id_company_id_ncm_uf_destino_tipo_oper_key"              RENAME TO "favoritos_fiscais_id_organizacao_company_id_ncm_uf_destino_t_key";
