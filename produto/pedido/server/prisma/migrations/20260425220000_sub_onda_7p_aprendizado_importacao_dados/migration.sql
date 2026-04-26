-- Sub-onda 7p — AprendizadoImportacaoDados (9 col renames + 4 index renames)
-- Fonte: planilha_geral_gravity (22).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("aprendizado_importacao_dados") permanece (preserva dados).

ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "id"           TO "id_aprendizado_importacao_dados";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "tenant_id"    TO "id_organizacao";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "product_id"   TO "id_produto_gravity";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "user_id"      TO "id_usuario";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "hash_colunas" TO "hash_colunas_aprendizado_importacao_dados";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "mapeamento"   TO "mapeamento_aprendizado_importacao_dados";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "uso_count"    TO "contagem_uso_aprendizado_importacao_dados";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "created_at"   TO "data_criacao_aprendizado_importacao_dados";
ALTER TABLE "aprendizado_importacao_dados" RENAME COLUMN "updated_at"   TO "data_atualizacao_aprendizado_importacao_dados";

-- Renomear índices
ALTER INDEX "aprendizado_importacao_dados_tenant_id_hash_colunas_key" RENAME TO "aprendizado_importacao_dados_id_organizacao_hash_colunas_apr_key";
ALTER INDEX "aprendizado_importacao_dados_tenant_id_idx"               RENAME TO "aprendizado_importacao_dados_id_organizacao_idx";
ALTER INDEX "aprendizado_importacao_dados_tenant_id_product_id_idx"    RENAME TO "aprendizado_importacao_dados_id_organizacao_id_produto_gravi_idx";
ALTER INDEX "aprendizado_importacao_dados_tenant_id_user_id_idx"       RENAME TO "aprendizado_importacao_dados_id_organizacao_id_usuario_idx";
