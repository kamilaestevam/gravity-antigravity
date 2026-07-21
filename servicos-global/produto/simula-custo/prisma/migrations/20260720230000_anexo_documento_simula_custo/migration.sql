-- Anexos de arquivo vinculados a documento_simula_custo (PDF, invoice escaneada, etc.)

CREATE TABLE "anexo_documento_simula_custo" (
    "id_anexo_documento_simula_custo"           TEXT NOT NULL,
    "id_organizacao"                            TEXT NOT NULL,
    "id_workspace"                              TEXT NOT NULL,
    "id_produto"                                TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario"                                TEXT,
    "id_documento_simula_custo"                 TEXT NOT NULL,
    "nome_arquivo_anexo_documento_simula_custo" TEXT NOT NULL,
    "nome_original_anexo_documento_simula_custo" TEXT NOT NULL,
    "tipo_arquivo_anexo_documento_simula_custo" TEXT NOT NULL,
    "tamanho_bytes_anexo_documento_simula_custo" INTEGER NOT NULL,
    "categoria_anexo_documento_simula_custo"    TEXT,
    "chave_storage_anexo_documento_simula_custo" TEXT NOT NULL,
    "enviado_por_anexo_documento_simula_custo"  TEXT NOT NULL,
    "data_criacao_anexo_documento_simula_custo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anexo_documento_simula_custo_pkey" PRIMARY KEY ("id_anexo_documento_simula_custo")
);

ALTER TABLE "anexo_documento_simula_custo" ADD CONSTRAINT "anexo_documento_simula_custo_id_documento_simula_custo_fkey" FOREIGN KEY ("id_documento_simula_custo") REFERENCES "documento_simula_custo"("id_documento_simula_custo") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "anexo_documento_simula_custo_id_organizacao_idx" ON "anexo_documento_simula_custo"("id_organizacao");
CREATE INDEX "anexo_documento_simula_custo_id_organizacao_id_workspace_idx" ON "anexo_documento_simula_custo"("id_organizacao", "id_workspace");
CREATE INDEX "anexo_documento_simula_custo_id_organizacao_id_produto_idx" ON "anexo_documento_simula_custo"("id_organizacao", "id_produto");
CREATE INDEX "anexo_documento_simula_custo_id_organizacao_id_usuario_idx" ON "anexo_documento_simula_custo"("id_organizacao", "id_usuario");
CREATE INDEX "anexo_documento_simula_custo_id_organizacao_id_documento_si_idx" ON "anexo_documento_simula_custo"("id_organizacao", "id_documento_simula_custo");
