-- DB-2 Fase 6 — bid-cambio: rename Prisma fields tenant_id -> id_organizacao
-- Renomeia coluna em todas as tabelas do produto bid-cambio + indexes correspondentes.

-- 1. cambio_parcelas
ALTER TABLE "cambio_parcelas" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_parcelas_tenant_id_idx" RENAME TO "cambio_parcelas_id_organizacao_idx";
ALTER INDEX "cambio_parcelas_tenant_id_product_id_idx" RENAME TO "cambio_parcelas_id_organizacao_product_id_idx";
ALTER INDEX "cambio_parcelas_tenant_id_user_id_idx" RENAME TO "cambio_parcelas_id_organizacao_user_id_idx";
ALTER INDEX "cambio_parcelas_tenant_id_status_idx" RENAME TO "cambio_parcelas_id_organizacao_status_idx";
ALTER INDEX "cambio_parcelas_tenant_id_data_vencimento_idx" RENAME TO "cambio_parcelas_id_organizacao_data_vencimento_idx";

-- 2. cambio_anexos
ALTER TABLE "cambio_anexos" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_anexos_tenant_id_idx" RENAME TO "cambio_anexos_id_organizacao_idx";
ALTER INDEX "cambio_anexos_tenant_id_parcela_id_idx" RENAME TO "cambio_anexos_id_organizacao_parcela_id_idx";

-- 3. cambio_formas_pagamento
ALTER TABLE "cambio_formas_pagamento" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_formas_pagamento_tenant_id_idx" RENAME TO "cambio_formas_pagamento_id_organizacao_idx";
ALTER INDEX "cambio_formas_pagamento_tenant_id_product_id_idx" RENAME TO "cambio_formas_pagamento_id_organizacao_product_id_idx";
ALTER INDEX "cambio_formas_pagamento_tenant_id_user_id_idx" RENAME TO "cambio_formas_pagamento_id_organizacao_user_id_idx";

-- 4. cambio_config_parcelas
ALTER TABLE "cambio_config_parcelas" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_config_parcelas_tenant_id_idx" RENAME TO "cambio_config_parcelas_id_organizacao_idx";
ALTER INDEX "cambio_config_parcelas_tenant_id_forma_pagamento_id_idx" RENAME TO "cambio_config_parcelas_id_organizacao_forma_pagamento_id_idx";

-- 5. cambio_cotacoes
ALTER TABLE "cambio_cotacoes" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_cotacoes_tenant_id_idx" RENAME TO "cambio_cotacoes_id_organizacao_idx";
ALTER INDEX "cambio_cotacoes_tenant_id_product_id_idx" RENAME TO "cambio_cotacoes_id_organizacao_product_id_idx";
ALTER INDEX "cambio_cotacoes_tenant_id_user_id_idx" RENAME TO "cambio_cotacoes_id_organizacao_user_id_idx";
ALTER INDEX "cambio_cotacoes_tenant_id_status_idx" RENAME TO "cambio_cotacoes_id_organizacao_status_idx";

-- 6. cambio_bid_requests
ALTER TABLE "cambio_bid_requests" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_bid_requests_tenant_id_idx" RENAME TO "cambio_bid_requests_id_organizacao_idx";
ALTER INDEX "cambio_bid_requests_tenant_id_cotacao_id_idx" RENAME TO "cambio_bid_requests_id_organizacao_cotacao_id_idx";

-- 7. cambio_bid_responses
ALTER TABLE "cambio_bid_responses" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_bid_responses_tenant_id_idx" RENAME TO "cambio_bid_responses_id_organizacao_idx";
ALTER INDEX "cambio_bid_responses_tenant_id_cotacao_id_idx" RENAME TO "cambio_bid_responses_id_organizacao_cotacao_id_idx";
ALTER INDEX "cambio_bid_responses_tenant_id_corretora_id_idx" RENAME TO "cambio_bid_responses_id_organizacao_corretora_id_idx";

-- 8. cambio_corretoras
ALTER TABLE "cambio_corretoras" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_corretoras_tenant_id_idx" RENAME TO "cambio_corretoras_id_organizacao_idx";
ALTER INDEX "cambio_corretoras_tenant_id_product_id_idx" RENAME TO "cambio_corretoras_id_organizacao_product_id_idx";
ALTER INDEX "cambio_corretoras_tenant_id_user_id_idx" RENAME TO "cambio_corretoras_id_organizacao_user_id_idx";
ALTER INDEX "cambio_corretoras_tenant_id_status_idx" RENAME TO "cambio_corretoras_id_organizacao_status_idx";

-- 9. cambio_avaliacoes
ALTER TABLE "cambio_avaliacoes" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_avaliacoes_tenant_id_idx" RENAME TO "cambio_avaliacoes_id_organizacao_idx";
ALTER INDEX "cambio_avaliacoes_tenant_id_corretora_id_idx" RENAME TO "cambio_avaliacoes_id_organizacao_corretora_id_idx";

-- 10. cambio_savings
ALTER TABLE "cambio_savings" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_savings_tenant_id_idx" RENAME TO "cambio_savings_id_organizacao_idx";
ALTER INDEX "cambio_savings_tenant_id_cotacao_id_idx" RENAME TO "cambio_savings_id_organizacao_cotacao_id_idx";

-- 11. cambio_preferencias
ALTER TABLE "cambio_preferencias" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_preferencias_tenant_id_key" RENAME TO "cambio_preferencias_id_organizacao_key";
ALTER INDEX "cambio_preferencias_tenant_id_idx" RENAME TO "cambio_preferencias_id_organizacao_idx";

-- 12. cambio_preferencias_grid
ALTER TABLE "cambio_preferencias_grid" RENAME COLUMN "tenant_id" TO "id_organizacao";
ALTER INDEX "cambio_preferencias_grid_tenant_id_idx" RENAME TO "cambio_preferencias_grid_id_organizacao_idx";
ALTER INDEX "cambio_preferencias_grid_tenant_id_user_id_key" RENAME TO "cambio_preferencias_grid_id_organizacao_user_id_key";
