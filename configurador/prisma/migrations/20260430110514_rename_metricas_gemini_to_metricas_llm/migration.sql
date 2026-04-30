-- Migration: rename_metricas_gemini_to_metricas_llm
-- Renomeia tabela e colunas de "gemini" → "llm" (genérico, qualquer provedor LLM).
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

-- 1. RENAME TABLE
ALTER TABLE "metricas_gemini" RENAME TO "metricas_llm";

-- 2. RENAME COLUMNs
ALTER TABLE "metricas_llm" RENAME COLUMN "id"                              TO "id_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "nome_llm"                        TO "nome_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "data_analise_llm"                TO "data_analise_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "total_analise_llm"               TO "total_analise_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "total_token_llm"                 TO "total_token_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "custo_llm"                       TO "custo_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "latencia_llm"                    TO "latencia_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "confianca_alta_llm"              TO "confianca_alta_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "confianca_media_llm"             TO "confianca_media_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "confianca_baixa_llm"             TO "confianca_baixa_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "quantidade_codigo_validado_llm"  TO "quantidade_codigo_validado_metricas_llm";
ALTER TABLE "metricas_llm" RENAME COLUMN "created_at"                      TO "data_criacao_metricas_llm";

-- 3. RENAME INDEX
ALTER INDEX "metricas_gemini_data_analise_llm_idx" RENAME TO "metricas_llm_data_analise_idx";

-- 4. RENAME PK CONSTRAINT
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_pkey" TO "metricas_llm_pkey";

-- 5. RENAME NOT NULL CONSTRAINTs (limpeza de nomes legados)
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_id_not_null"                              TO "metricas_llm_id_not_null";
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_data_analise_llm_not_null"               TO "metricas_llm_data_analise_not_null";
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_total_analise_llm_not_null"              TO "metricas_llm_total_analise_not_null";
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_total_token_llm_not_null"                TO "metricas_llm_total_token_not_null";
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_custo_llm_not_null"                      TO "metricas_llm_custo_not_null";
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_latencia_llm_not_null"                   TO "metricas_llm_latencia_not_null";
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_confianca_alta_llm_not_null"             TO "metricas_llm_confianca_alta_not_null";
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_confianca_media_llm_not_null"            TO "metricas_llm_confianca_media_not_null";
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_confianca_baixa_llm_not_null"            TO "metricas_llm_confianca_baixa_not_null";
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_quantidade_codigo_validado_llm_not_null" TO "metricas_llm_quantidade_codigo_validado_not_null";
ALTER TABLE "metricas_llm" RENAME CONSTRAINT "metricas_gemini_created_at_not_null"                     TO "metricas_llm_data_criacao_not_null";
