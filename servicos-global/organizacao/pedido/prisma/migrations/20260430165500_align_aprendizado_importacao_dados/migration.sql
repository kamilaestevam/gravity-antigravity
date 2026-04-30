-- Migration: align_aprendizado_importacao_dados
-- 9 RENAME COLUMN + 4 RENAME INDEX
-- Aplicada manualmente em transacao em 2026-04-30 (tabela vazia).
-- Tabela duplicada em gravity-servicos-teste foi DROPada no mesmo momento (nao usada — schema vive em pedido).

-- 1. RENAME COLUMNs (9)
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "id"            TO "id_aprendizado_importacao_dados";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "tenant_id"     TO "id_organizacao";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "product_id"    TO "id_produto_gravity";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "user_id"       TO "id_usuario";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "hash_colunas"  TO "hash_colunas_aprendizado_importacao_dados";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "mapeamento"    TO "mapeamento_aprendizado_importacao_dados";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "uso_count"     TO "contagem_uso_aprendizado_importacao_dados";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "created_at"    TO "data_criacao_aprendizado_importacao_dados";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "updated_at"    TO "data_atualizacao_aprendizado_importacao_dados";

-- 2. RENAME INDEXes (4)
-- NOTA: Postgres trunca nomes a 63 chars (NAMEDATALEN). O ultimo cai a 63.
ALTER INDEX "aprendizado_importacao_dados_tenant_id_hash_colunas_key" RENAME TO "aprendizado_importacao_dados_id_organizacao_hash_colunas_key";
ALTER INDEX "aprendizado_importacao_dados_tenant_id_idx"               RENAME TO "aprendizado_importacao_dados_id_organizacao_idx";
ALTER INDEX "aprendizado_importacao_dados_tenant_id_product_id_idx"    RENAME TO "aprendizado_importacao_dados_id_organizacao_id_produto_gravity_idx";
ALTER INDEX "aprendizado_importacao_dados_tenant_id_user_id_idx"       RENAME TO "aprendizado_importacao_dados_id_organizacao_id_usuario_idx";
