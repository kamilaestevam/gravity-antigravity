-- Migration: create_progresso_leitura_smart_read
-- Progresso do wizard Nova Leitura (passo 2–4 + edições) por usuário/leitura legada.

CREATE TABLE "progresso_leitura_smart_read" (
    "id_progresso_leitura_smart_read" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT NOT NULL DEFAULT 'smart-read',
    "id_usuario" TEXT NOT NULL,
    "id_workspace" TEXT,
    "id_leitura_legado_progresso_leitura_smart_read" TEXT NOT NULL,
    "passo_atual_progresso_leitura_smart_read" INTEGER NOT NULL,
    "dados_sessao_progresso_leitura_smart_read" JSONB NOT NULL,
    "data_criacao_progresso_leitura_smart_read" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_progresso_leitura_smart_read" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progresso_leitura_smart_read_pkey" PRIMARY KEY ("id_progresso_leitura_smart_read")
);

CREATE UNIQUE INDEX "progresso_leitura_smart_read_id_organizacao_id_usuario_id_le_key"
    ON "progresso_leitura_smart_read"(
        "id_organizacao",
        "id_usuario",
        "id_leitura_legado_progresso_leitura_smart_read"
    );

CREATE INDEX "progresso_leitura_smart_read_id_organizacao_idx"
    ON "progresso_leitura_smart_read"("id_organizacao");

CREATE INDEX "progresso_leitura_smart_read_id_organizacao_id_produto_gravity_idx"
    ON "progresso_leitura_smart_read"("id_organizacao", "id_produto_gravity");

CREATE INDEX "progresso_leitura_smart_read_id_organizacao_id_usuario_idx"
    ON "progresso_leitura_smart_read"("id_organizacao", "id_usuario");

CREATE INDEX "progresso_leitura_smart_read_id_organizacao_id_leitura_legado_idx"
    ON "progresso_leitura_smart_read"(
        "id_organizacao",
        "id_leitura_legado_progresso_leitura_smart_read"
    );
