-- Migration: rename_produtos_gravity_to_produto_gravity
-- Renomeia tabela produtos_gravity (plural inglês) → produto_gravity (singular DDD)
-- + 29 RENAME COLUMN (toda a tabela em inglês legado → DDD)
-- + 5 RENAME INDEX (alinhar com map: do schema)
-- + 20 RENAME NOT NULL CONSTRAINT (limpeza de nomes legados)
-- 5 rows preservadas (Simula Custo, Bid Frete, Bid Cambio, Pedido, NF Import).
-- Aplicada manualmente em transação em 2026-04-30.

-- 1. RENAME TABLE
ALTER TABLE "produtos_gravity" RENAME TO "produto_gravity";

-- 2. RENAME COLUMNs (29)
ALTER TABLE "produto_gravity" RENAME COLUMN "id"                  TO "id_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "name"                TO "nome_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "slug"                TO "slug_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "description"         TO "descricao_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "status"              TO "status_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "launch_date"         TO "data_lancamento_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "has_setup"           TO "possui_setup_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "setup_price"         TO "preco_setup_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "setup_currency"      TO "moeda_setup_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "billing_type"        TO "tipo_cobranca_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "unit_price"          TO "preco_unitario_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "unit_currency"       TO "moeda_unitario_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "minimum_price"       TO "preco_minimo_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "minimum_currency"    TO "moeda_minimo_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "total_price"         TO "preco_total_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "total_currency"      TO "moeda_total_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "user_limit_type"     TO "tipo_limite_usuario_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "base_users_qty"      TO "qtd_usuarios_base_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "extra_user_price"    TO "preco_usuario_extra_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "extra_user_currency" TO "moeda_usuario_extra_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "helpdesk_hours"      TO "horas_helpdesk_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "extra_hour_price"    TO "preco_hora_extra_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "extra_hour_currency" TO "moeda_hora_extra_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "gabi_quota_mensal"   TO "quota_gabi_mensal_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "backend_module"      TO "modulo_backend_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "target_audience"     TO "publico_alvo_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "created_at"          TO "data_criacao_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "updated_at"          TO "data_atualizacao_produto_gravity";
ALTER TABLE "produto_gravity" RENAME COLUMN "deleted_at"          TO "data_remocao_produto_gravity";

-- 3. RENAME INDEXes (5)
ALTER INDEX "produtos_gravity_pkey"            RENAME TO "produto_gravity_pkey";
ALTER INDEX "produtos_gravity_slug_key"        RENAME TO "pg_slug_unq";
ALTER INDEX "produtos_gravity_slug_idx"        RENAME TO "pg_slug_idx";
ALTER INDEX "produtos_gravity_status_idx"      RENAME TO "pg_status_idx";
ALTER INDEX "produtos_gravity_deleted_at_idx"  RENAME TO "pg_remocao_idx";

-- 4. RENAME NOT NULL CONSTRAINTs (20)
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_id_not_null"                  TO "produto_gravity_id_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_name_not_null"                TO "produto_gravity_nome_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_slug_not_null"                TO "produto_gravity_slug_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_description_not_null"         TO "produto_gravity_descricao_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_status_not_null"              TO "produto_gravity_status_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_has_setup_not_null"           TO "produto_gravity_possui_setup_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_setup_currency_not_null"      TO "produto_gravity_moeda_setup_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_billing_type_not_null"        TO "produto_gravity_tipo_cobranca_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_unit_price_not_null"          TO "produto_gravity_preco_unitario_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_unit_currency_not_null"       TO "produto_gravity_moeda_unitario_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_minimum_price_not_null"       TO "produto_gravity_preco_minimo_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_minimum_currency_not_null"    TO "produto_gravity_moeda_minimo_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_total_currency_not_null"      TO "produto_gravity_moeda_total_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_user_limit_type_not_null"     TO "produto_gravity_tipo_limite_usuario_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_extra_user_currency_not_null" TO "produto_gravity_moeda_usuario_extra_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_helpdesk_hours_not_null"      TO "produto_gravity_horas_helpdesk_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_extra_hour_currency_not_null" TO "produto_gravity_moeda_hora_extra_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_gabi_quota_mensal_not_null"   TO "produto_gravity_quota_gabi_mensal_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_created_at_not_null"          TO "produto_gravity_data_criacao_not_null";
ALTER TABLE "produto_gravity" RENAME CONSTRAINT "produtos_gravity_updated_at_not_null"          TO "produto_gravity_data_atualizacao_not_null";
