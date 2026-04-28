-- CreateTable
CREATE TABLE "Empresa" (
    "suid" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "nome_empresa" TEXT NOT NULL,
    "cnpj" TEXT,
    "tin" TEXT,
    "pais" TEXT NOT NULL,
    "estado" TEXT,
    "cidade" TEXT,
    "endereco" TEXT,
    "zipcode" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "pode_ser_importador" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_exportador" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_fabricante" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_agente" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_despachante" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_armador" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("suid")
);

-- CreateTable
CREATE TABLE "Moeda" (
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "simbolo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Moeda_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "Unidade" (
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Unidade_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "NCM" (
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ipi" DOUBLE PRECISION,
    "ii" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NCM_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "OPE" (
    "suid" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "codigo_portal_unico" TEXT NOT NULL,
    "situacao" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "nome_ope" TEXT NOT NULL,
    "cnpj_raiz_empresa" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "estado" TEXT,
    "cidade" TEXT,
    "endereco" TEXT,
    "zip" TEXT,
    "tin" TEXT,
    "email" TEXT,
    "ultima_sincronizacao" TIMESTAMP(3) NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'portal_unico',

    CONSTRAINT "OPE_pkey" PRIMARY KEY ("suid")
);

-- CreateTable
CREATE TABLE "HistoricoStatusOPE" (
    "id" TEXT NOT NULL,
    "suid_ope" TEXT NOT NULL,
    "status_anterior" TEXT,
    "status_novo" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "registrado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoStatusOPE_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Empresa_id_organizacao_idx" ON "Empresa"("id_organizacao");

-- CreateIndex
CREATE INDEX "Empresa_id_organizacao_nome_empresa_idx" ON "Empresa"("id_organizacao", "nome_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_id_organizacao_cnpj_key" ON "Empresa"("id_organizacao", "cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_id_organizacao_tin_pais_key" ON "Empresa"("id_organizacao", "tin", "pais");

-- CreateIndex
CREATE UNIQUE INDEX "OPE_codigo_portal_unico_key" ON "OPE"("codigo_portal_unico");

-- CreateIndex
CREATE INDEX "OPE_id_organizacao_idx" ON "OPE"("id_organizacao");

-- CreateIndex
CREATE INDEX "HistoricoStatusOPE_suid_ope_idx" ON "HistoricoStatusOPE"("suid_ope");

-- CreateIndex
CREATE INDEX "HistoricoStatusOPE_registrado_em_idx" ON "HistoricoStatusOPE"("registrado_em");
