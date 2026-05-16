-- Corrige ordem das colunas: PK deve ser a primeira coluna (padrão Gravity).
-- Tabelas estão vazias — DROP + CREATE é seguro e garante a ordem.

-- Drop tabelas existentes (vazias)
DROP TABLE IF EXISTS "exportador_quando_importacao";
DROP TABLE IF EXISTS "importador_quando_exportacao";

-- Recria exportador_quando_importacao com PK na primeira posição
CREATE TABLE "exportador_quando_importacao" (
    "id_exportador_quando_importacao" TEXT NOT NULL,
    "id_organizacao_exportador" TEXT NOT NULL,
    "id_workspace_exportador" TEXT NOT NULL,
    "nome_exportador" TEXT NOT NULL,
    "endereco_exportador" TEXT,
    "cidade_exportador" TEXT,
    "estado_provincia_exportador" TEXT,
    "pais_exportador" TEXT NOT NULL,
    "zipcode_exportador" TEXT,
    "criado_em_exportador" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em_exportador" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exportador_quando_importacao_pkey" PRIMARY KEY ("id_exportador_quando_importacao")
);

-- Recria importador_quando_exportacao com PK na primeira posição
CREATE TABLE "importador_quando_exportacao" (
    "id_importador_quando_exportacao" TEXT NOT NULL,
    "id_organizacao_importador" TEXT NOT NULL,
    "id_workspace_importador" TEXT NOT NULL,
    "nome_importador" TEXT NOT NULL,
    "endereco_importador" TEXT,
    "cidade_importador" TEXT,
    "estado_provincia_importador" TEXT,
    "pais_importador" TEXT NOT NULL,
    "zipcode_importador" TEXT,
    "criado_em_importador" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em_importador" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "importador_quando_exportacao_pkey" PRIMARY KEY ("id_importador_quando_exportacao")
);

-- Recria índices
CREATE INDEX "eqi_org_idx" ON "exportador_quando_importacao"("id_organizacao_exportador");
CREATE INDEX "eqi_org_ws_idx" ON "exportador_quando_importacao"("id_organizacao_exportador", "id_workspace_exportador");
CREATE INDEX "eqi_org_nome_idx" ON "exportador_quando_importacao"("id_organizacao_exportador", "nome_exportador");

CREATE INDEX "iqe_org_idx" ON "importador_quando_exportacao"("id_organizacao_importador");
CREATE INDEX "iqe_org_ws_idx" ON "importador_quando_exportacao"("id_organizacao_importador", "id_workspace_importador");
CREATE INDEX "iqe_org_nome_idx" ON "importador_quando_exportacao"("id_organizacao_importador", "nome_importador");
