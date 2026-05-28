CREATE TABLE "taxa_origem_destino" (
    "id_taxa_origem_destino" TEXT NOT NULL,
    "nome_taxa_origem_destino" TEXT NOT NULL,
    "descricao_taxa_origem_destino" TEXT,
    "tipo_taxa_origem_destino" TEXT NOT NULL,
    "codigo_taxa_origem_destino" TEXT,
    "ativo_taxa_origem_destino" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao_taxa_origem_destino" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_taxa_origem_destino" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxa_origem_destino_pkey" PRIMARY KEY ("id_taxa_origem_destino")
);

CREATE UNIQUE INDEX "taxa_origem_destino_codigo_taxa_origem_destino_key" ON "taxa_origem_destino"("codigo_taxa_origem_destino");
CREATE INDEX "taxa_origem_destino_tipo_idx" ON "taxa_origem_destino"("tipo_taxa_origem_destino");
CREATE INDEX "taxa_origem_destino_ativo_idx" ON "taxa_origem_destino"("ativo_taxa_origem_destino");
CREATE INDEX "taxa_origem_destino_nome_idx" ON "taxa_origem_destino"("nome_taxa_origem_destino");
