-- Migration: create_snapshot_leitura_smart_read
-- Snapshot congelado da leitura (extração + métricas denormalizadas) para Lista e Insights.

CREATE TABLE "snapshot_leitura_smart_read" (
    "id_snapshot_leitura_smart_read" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT NOT NULL DEFAULT 'smart-read',
    "id_usuario" TEXT NOT NULL,
    "id_workspace" TEXT,
    "id_leitura_legado_snapshot_leitura_smart_read" TEXT NOT NULL,
    "nome_leitura_snapshot_leitura_smart_read" TEXT,
    "status_leitura_snapshot_leitura_smart_read" TEXT NOT NULL,
    "origem_leitura_snapshot_leitura_smart_read" TEXT NOT NULL,
    "total_arquivos_snapshot_leitura_smart_read" INTEGER NOT NULL DEFAULT 0,
    "arquivos_processados_snapshot_leitura_smart_read" INTEGER NOT NULL DEFAULT 0,
    "nome_arquivo_snapshot_leitura_smart_read" TEXT,
    "media_acertos_snapshot_leitura_smart_read" DOUBLE PRECISION,
    "total_campos_snapshot_leitura_smart_read" INTEGER NOT NULL DEFAULT 0,
    "campos_corretos_snapshot_leitura_smart_read" INTEGER NOT NULL DEFAULT 0,
    "campos_errados_snapshot_leitura_smart_read" INTEGER NOT NULL DEFAULT 0,
    "data_envio_snapshot_leitura_smart_read" TIMESTAMP(3),
    "mensagem_erro_snapshot_leitura_smart_read" TEXT,
    "dados_extracao_snapshot_leitura_smart_read" JSONB NOT NULL,
    "motivo_congelamento_snapshot_leitura_smart_read" TEXT NOT NULL,
    "data_congelamento_snapshot_leitura_smart_read" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "versao_contrato_snapshot_leitura_smart_read" INTEGER NOT NULL DEFAULT 1,
    "data_criacao_snapshot_leitura_smart_read" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_snapshot_leitura_smart_read" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "snapshot_leitura_smart_read_pkey" PRIMARY KEY ("id_snapshot_leitura_smart_read")
);

CREATE UNIQUE INDEX "snapshot_leitura_smart_read_id_organizacao_id_leitura_legado_key"
    ON "snapshot_leitura_smart_read"(
        "id_organizacao",
        "id_leitura_legado_snapshot_leitura_smart_read"
    );

CREATE INDEX "snapshot_leitura_smart_read_id_organizacao_idx"
    ON "snapshot_leitura_smart_read"("id_organizacao");

CREATE INDEX "snapshot_leitura_smart_read_id_organizacao_id_produto_gravity_idx"
    ON "snapshot_leitura_smart_read"("id_organizacao", "id_produto_gravity");

CREATE INDEX "snapshot_leitura_smart_read_id_organizacao_id_usuario_idx"
    ON "snapshot_leitura_smart_read"("id_organizacao", "id_usuario");

CREATE INDEX "snapshot_leitura_smart_read_id_organizacao_data_envio_idx"
    ON "snapshot_leitura_smart_read"(
        "id_organizacao",
        "data_envio_snapshot_leitura_smart_read"
    );
