-- DB-2 Fase 6 — lpco: rename Prisma fields tenant_id -> id_organizacao
-- Renomeia coluna em todas as tabelas tenant-scoped do produto lpco + indexes correspondentes.
-- Audit log payload (cross-service contract via product-audit-plugin) preserva o nome `tenant_id` no JSON enviado ao histórico-global.

-- 1. lpcos
ALTER TABLE "lpcos" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "lpcos_tenant_id_idx" RENAME TO "lpcos_id_organizacao_idx";
ALTER INDEX "lpcos_tenant_id_product_id_idx" RENAME TO "lpcos_id_organizacao_product_id_idx";
ALTER INDEX "lpcos_tenant_id_user_id_idx" RENAME TO "lpcos_id_organizacao_user_id_idx";
ALTER INDEX "lpcos_tenant_id_company_id_idx" RENAME TO "lpcos_id_organizacao_company_id_idx";
ALTER INDEX "lpcos_tenant_id_company_id_status_idx" RENAME TO "lpcos_id_organizacao_company_id_status_idx";
ALTER INDEX "lpcos_tenant_id_company_id_orgao_anuente_idx" RENAME TO "lpcos_id_organizacao_company_id_orgao_anuente_idx";

-- 2. lpco_itens
ALTER TABLE "lpco_itens" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "lpco_itens_tenant_id_idx" RENAME TO "lpco_itens_id_organizacao_idx";
ALTER INDEX "lpco_itens_tenant_id_product_id_idx" RENAME TO "lpco_itens_id_organizacao_product_id_idx";
ALTER INDEX "lpco_itens_tenant_id_user_id_idx" RENAME TO "lpco_itens_id_organizacao_user_id_idx";

-- 3. lpco_exigencias
ALTER TABLE "lpco_exigencias" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "lpco_exigencias_tenant_id_idx" RENAME TO "lpco_exigencias_id_organizacao_idx";
ALTER INDEX "lpco_exigencias_tenant_id_product_id_idx" RENAME TO "lpco_exigencias_id_organizacao_product_id_idx";
ALTER INDEX "lpco_exigencias_tenant_id_user_id_idx" RENAME TO "lpco_exigencias_id_organizacao_user_id_idx";

-- 4. lpco_vinculos
ALTER TABLE "lpco_vinculos" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "lpco_vinculos_tenant_id_idx" RENAME TO "lpco_vinculos_id_organizacao_idx";
ALTER INDEX "lpco_vinculos_tenant_id_product_id_idx" RENAME TO "lpco_vinculos_id_organizacao_product_id_idx";
ALTER INDEX "lpco_vinculos_tenant_id_user_id_idx" RENAME TO "lpco_vinculos_id_organizacao_user_id_idx";

-- 5. lpco_documentos
ALTER TABLE "lpco_documentos" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "lpco_documentos_tenant_id_idx" RENAME TO "lpco_documentos_id_organizacao_idx";
ALTER INDEX "lpco_documentos_tenant_id_product_id_idx" RENAME TO "lpco_documentos_id_organizacao_product_id_idx";
ALTER INDEX "lpco_documentos_tenant_id_user_id_idx" RENAME TO "lpco_documentos_id_organizacao_user_id_idx";

-- 6. lpco_historico
ALTER TABLE "lpco_historico" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "lpco_historico_tenant_id_idx" RENAME TO "lpco_historico_id_organizacao_idx";
ALTER INDEX "lpco_historico_tenant_id_product_id_idx" RENAME TO "lpco_historico_id_organizacao_product_id_idx";
ALTER INDEX "lpco_historico_tenant_id_user_id_idx" RENAME TO "lpco_historico_id_organizacao_user_id_idx";

-- 7. siscomex_credenciais
ALTER TABLE "siscomex_credenciais" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "siscomex_credenciais_tenant_id_idx" RENAME TO "siscomex_credenciais_id_organizacao_idx";
ALTER INDEX "siscomex_credenciais_tenant_id_company_id_idx" RENAME TO "siscomex_credenciais_id_organizacao_company_id_idx";
ALTER INDEX "siscomex_credenciais_tenant_id_company_id_tipo_auth_key" RENAME TO "siscomex_credenciais_id_organizacao_company_id_tipo_auth_key";
