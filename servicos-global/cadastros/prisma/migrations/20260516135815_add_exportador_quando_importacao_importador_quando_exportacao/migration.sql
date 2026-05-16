-- CreateTable
CREATE TABLE "exportador_quando_importacao" (
    "id_exportador" TEXT NOT NULL,
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

    CONSTRAINT "exportador_quando_importacao_pkey" PRIMARY KEY ("id_exportador")
);

-- CreateTable
CREATE TABLE "importador_quando_exportacao" (
    "id_importador" TEXT NOT NULL,
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

    CONSTRAINT "importador_quando_exportacao_pkey" PRIMARY KEY ("id_importador")
);

-- CreateIndex
CREATE INDEX "eqi_org_idx" ON "exportador_quando_importacao"("id_organizacao_exportador");

-- CreateIndex
CREATE INDEX "eqi_org_ws_idx" ON "exportador_quando_importacao"("id_organizacao_exportador", "id_workspace_exportador");

-- CreateIndex
CREATE INDEX "eqi_org_nome_idx" ON "exportador_quando_importacao"("id_organizacao_exportador", "nome_exportador");

-- CreateIndex
CREATE INDEX "iqe_org_idx" ON "importador_quando_exportacao"("id_organizacao_importador");

-- CreateIndex
CREATE INDEX "iqe_org_ws_idx" ON "importador_quando_exportacao"("id_organizacao_importador", "id_workspace_importador");

-- CreateIndex
CREATE INDEX "iqe_org_nome_idx" ON "importador_quando_exportacao"("id_organizacao_importador", "nome_importador");
