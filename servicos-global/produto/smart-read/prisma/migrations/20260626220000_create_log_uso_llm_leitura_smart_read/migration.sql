-- Migration: create_log_uso_llm_leitura_smart_read
-- Auditoria de tokens LLM (Gemini) por organização, usuário e leitura.

CREATE TABLE "log_uso_llm_leitura_smart_read" (
    "id_log_uso_llm_leitura_smart_read" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT NOT NULL DEFAULT 'smart-read',
    "id_usuario" TEXT NOT NULL,
    "id_workspace" TEXT,
    "id_leitura_legado_log_uso_llm_leitura_smart_read" TEXT,
    "acao_log_uso_llm_leitura_smart_read" TEXT NOT NULL,
    "modelo_log_uso_llm_leitura_smart_read" TEXT NOT NULL,
    "tokens_entrada_log_uso_llm_leitura_smart_read" INTEGER NOT NULL DEFAULT 0,
    "tokens_saida_log_uso_llm_leitura_smart_read" INTEGER NOT NULL DEFAULT 0,
    "tokens_total_log_uso_llm_leitura_smart_read" INTEGER NOT NULL DEFAULT 0,
    "custo_usd_log_uso_llm_leitura_smart_read" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data_criacao_log_uso_llm_leitura_smart_read" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_uso_llm_leitura_smart_read_pkey" PRIMARY KEY ("id_log_uso_llm_leitura_smart_read")
);

CREATE INDEX "log_uso_llm_leitura_smart_read_id_organizacao_idx"
    ON "log_uso_llm_leitura_smart_read"("id_organizacao");

CREATE INDEX "log_uso_llm_leitura_smart_read_id_organizacao_id_produto_gravity_idx"
    ON "log_uso_llm_leitura_smart_read"("id_organizacao", "id_produto_gravity");

CREATE INDEX "log_uso_llm_leitura_smart_read_id_organizacao_id_usuario_idx"
    ON "log_uso_llm_leitura_smart_read"("id_organizacao", "id_usuario");

CREATE INDEX "log_uso_llm_leitura_smart_read_id_organizacao_id_leitura_legado_idx"
    ON "log_uso_llm_leitura_smart_read"(
        "id_organizacao",
        "id_leitura_legado_log_uso_llm_leitura_smart_read"
    );

CREATE INDEX "log_uso_llm_leitura_smart_read_id_organizacao_id_usuario_data_idx"
    ON "log_uso_llm_leitura_smart_read"(
        "id_organizacao",
        "id_usuario",
        "data_criacao_log_uso_llm_leitura_smart_read"
    );
