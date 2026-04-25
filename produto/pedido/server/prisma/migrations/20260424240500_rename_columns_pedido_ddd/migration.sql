-- FASE 07 DDD / Onda 3 Pedido — rename de colunas fisicas da tabela "pedido_produto_gravity"
-- (model Prisma: Pedido)
-- Fonte: planilha_geral_gravity (Produto Gravity = Pedido).
-- Estrategia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Escopo: 53 colunas fisicas + indices reconstruidos.
-- Relacoes Prisma `itens` → `itens_pedido`, `transferencias` → `transferencias_pedido`,
-- `snapshots_empresa` → `snapshots_empresa_pedido`, `snapshots_ope` → `snapshots_ope_pedido`
-- somente no schema; sem impacto em DDL.
-- FKs inbound (de pedido_itens, pedido_snapshot_empresa, pedido_snapshot_ope, tracking_items_transferidos)
-- permanecem intactas — PostgreSQL rastreia FKs no catalogo e acompanha o rename da coluna alvo "id" → "id_pedido" automaticamente.

-- 1) Rename colunas (53 fisicas)
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "id"                                      TO "id_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "tenant_id"                               TO "id_organizacao";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "company_id"                              TO "id_workspace";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "tipo_operacao"                           TO "tipo_operacao_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "status"                                  TO "status_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "status_id"                               TO "id_status";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "importacao_exportador_id"                TO "id_importacao_exportador";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "exportacao_importador_id"                TO "id_exportacao_importador";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "fabricante_id"                           TO "id_fabricante";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "incoterm"                                TO "incoterm_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "condicao_pagamento"                      TO "condicao_pagamento_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "numero_proforma"                         TO "numero_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "numero_invoice"                          TO "numero_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "referencia_importador"                   TO "referencia_importador_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "referencia_exportador"                   TO "referencia_exportador_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "referencia_fabricante"                   TO "referencia_fabricante_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "taxa_cambio_estimada"                    TO "taxa_cambio_estimada_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "detalhes_operacionais"                   TO "detalhes_operacionais_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "campos_custom"                           TO "campos_custom_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "pedidos_origem_id"                       TO "id_pedidos_origem";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "cnpj_importador"                         TO "cnpj_importador_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "deleted_at"                              TO "data_exclusao_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "created_at"                              TO "data_criacao_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "updated_at"                              TO "data_atualizacao_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_documento_proforma"                 TO "data_documento_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_documento_invoice"                  TO "data_documento_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prevista_pedido_pronto"             TO "data_prevista_pedido_pronto_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_confirmada_pedido_pronto"           TO "data_confirmada_pedido_pronto_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_meta_pedido_pronto"                 TO "data_meta_pedido_pronto_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prev_recebimento_draft_proforma"    TO "data_previsao_recebimento_draft_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_conf_recebimento_draft_proforma"    TO "data_confirmacao_recebimento_draft_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_meta_recebimento_draft_proforma"    TO "data_meta_recebimento_draft_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prev_aprovacao_draft_proforma"      TO "data_previsao_aprovacao_draft_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_conf_aprovacao_draft_proforma"      TO "data_confirmacao_aprovacao_draft_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_meta_aprovacao_draft_proforma"      TO "data_meta_aprovacao_draft_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prev_envio_original_proforma"       TO "data_previsao_envio_original_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_conf_envio_original_proforma"       TO "data_confirmacao_envio_original_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_meta_envio_original_proforma"       TO "data_meta_envio_original_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prev_recebimento_original_proforma" TO "data_previsao_recebimento_original_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_conf_recebimento_original_proforma" TO "data_confirmacao_recebimento_original_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_meta_recebimento_original_proforma" TO "data_meta_recebimento_original_proforma_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prev_recebimento_draft_invoice"     TO "data_previsao_recebimento_draft_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_conf_recebimento_draft_invoice"     TO "data_confirmacao_recebimento_draft_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_meta_recebimento_draft_invoice"     TO "data_meta_recebimento_draft_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prev_aprovacao_draft_invoice"       TO "data_previsao_aprovacao_draft_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_conf_aprovacao_draft_invoice"       TO "data_confirmacao_aprovacao_draft_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_meta_aprovacao_draft_invoice"       TO "data_meta_aprovacao_draft_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prev_envio_original_invoice"        TO "data_previsao_envio_original_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_conf_envio_original_invoice"        TO "data_confirmacao_envio_original_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_meta_envio_original_invoice"        TO "data_meta_envio_original_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prev_recebimento_original_invoice"  TO "data_previsao_recebimento_original_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_conf_recebimento_original_invoice"  TO "data_confirmacao_recebimento_original_invoice_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_meta_recebimento_original_invoice"  TO "data_meta_recebimento_original_invoice_pedido";

-- 2) Reconstruir indices (1 unique + 7 regulares)
DROP INDEX IF EXISTS "pedido_produto_gravity_tenant_id_numero_pedido_key";
DROP INDEX IF EXISTS "pedido_produto_gravity_tenant_id_idx";
DROP INDEX IF EXISTS "pedido_produto_gravity_tenant_id_company_id_idx";
DROP INDEX IF EXISTS "pedido_produto_gravity_tenant_id_status_idx";
DROP INDEX IF EXISTS "pedido_produto_gravity_tenant_id_status_id_idx";
DROP INDEX IF EXISTS "pedido_produto_gravity_tenant_id_tipo_operacao_idx";
DROP INDEX IF EXISTS "pedido_produto_gravity_tenant_id_data_emissao_pedido_idx";
DROP INDEX IF EXISTS "pedido_produto_gravity_tenant_id_deleted_at_idx";

CREATE UNIQUE INDEX "pedido_produto_gravity_id_organizacao_numero_pedido_key"
    ON "pedido_produto_gravity"("id_organizacao", "numero_pedido");
CREATE INDEX "pedido_produto_gravity_id_organizacao_idx"
    ON "pedido_produto_gravity"("id_organizacao");
CREATE INDEX "pedido_produto_gravity_id_organizacao_id_workspace_idx"
    ON "pedido_produto_gravity"("id_organizacao", "id_workspace");
CREATE INDEX "pedido_produto_gravity_id_organizacao_status_pedido_idx"
    ON "pedido_produto_gravity"("id_organizacao", "status_pedido");
CREATE INDEX "pedido_produto_gravity_id_organizacao_id_status_idx"
    ON "pedido_produto_gravity"("id_organizacao", "id_status");
CREATE INDEX "pedido_produto_gravity_id_organizacao_tipo_operacao_pedido_idx"
    ON "pedido_produto_gravity"("id_organizacao", "tipo_operacao_pedido");
CREATE INDEX "pedido_produto_gravity_id_organizacao_data_emissao_pedido_idx"
    ON "pedido_produto_gravity"("id_organizacao", "data_emissao_pedido");
CREATE INDEX "pedido_produto_gravity_id_organizacao_data_exclusao_pedido_idx"
    ON "pedido_produto_gravity"("id_organizacao", "data_exclusao_pedido");
