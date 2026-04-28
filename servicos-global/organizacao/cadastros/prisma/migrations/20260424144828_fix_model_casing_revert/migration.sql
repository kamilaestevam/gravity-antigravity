/*
  Warnings:

  - You are about to drop the `Empresa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistoricoStatusOPE` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Moeda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NCM` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OPE` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Unidade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Empresa";

-- DropTable
DROP TABLE "HistoricoStatusOPE";

-- DropTable
DROP TABLE "Moeda";

-- DropTable
DROP TABLE "NCM";

-- DropTable
DROP TABLE "OPE";

-- DropTable
DROP TABLE "Unidade";

-- CreateTable
CREATE TABLE "empresa" (
    "suid_empresa" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "nome_empresa" TEXT NOT NULL,
    "cnpj_empresa" TEXT,
    "tin_empresa" TEXT,
    "pais_empresa" TEXT NOT NULL,
    "estado_empresa" TEXT,
    "cidade_empresa" TEXT,
    "endereco_empresa" TEXT,
    "zipcode_empresa" TEXT,
    "email_empresa" TEXT,
    "telefone_empresa" TEXT,
    "whatsapp_empresa" TEXT,
    "pode_ser_importador_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_exportador_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_fabricante_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_agente_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_despachante_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_armador_empresa" BOOLEAN NOT NULL DEFAULT false,
    "ativo_empresa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em_empresa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em_empresa" TIMESTAMP(3) NOT NULL,
    "pode_ser_armazem_alfandegado_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_transportadora_rodoviaria_nacional_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_cia_aerea_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_transportadora_rodoviaria_internacional_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_seguradora_internacional_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_seguradora_corretora_cambio_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_banco_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_armazem_nacional_empresa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("suid_empresa")
);

-- CreateTable
CREATE TABLE "moeda" (
    "codigo_moeda" TEXT NOT NULL,
    "simbolo_moeda" TEXT NOT NULL,
    "ativo_moeda" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "moeda_pkey" PRIMARY KEY ("codigo_moeda")
);

-- CreateTable
CREATE TABLE "unidade" (
    "codigo_unidade" TEXT NOT NULL,
    "nome_unidade" TEXT NOT NULL,
    "tipo_unidade" TEXT NOT NULL,
    "ativo_unidade" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unidade_pkey" PRIMARY KEY ("codigo_unidade")
);

-- CreateTable
CREATE TABLE "ncm" (
    "codigo_ncm" TEXT NOT NULL,
    "descricao_ncm" TEXT NOT NULL,
    "ipi_ncm" DOUBLE PRECISION,
    "ii_ncm" DOUBLE PRECISION,
    "ativo_ncm" BOOLEAN NOT NULL DEFAULT true,
    "pis_ncm" DOUBLE PRECISION,
    "cofins_ncm" DOUBLE PRECISION,

    CONSTRAINT "ncm_pkey" PRIMARY KEY ("codigo_ncm")
);

-- CreateTable
CREATE TABLE "ope" (
    "suid_ope" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "codigo_portal_unico_ope" TEXT NOT NULL,
    "situacao_ope" TEXT NOT NULL,
    "versao_ope" TEXT NOT NULL,
    "nome_ope" TEXT NOT NULL,
    "cnpj_raiz_empresa_ope" TEXT NOT NULL,
    "pais_ope" TEXT NOT NULL,
    "estado_ope" TEXT,
    "cidade_ope" TEXT,
    "endereco_ope" TEXT,
    "zip_ope" TEXT,
    "tin_ope" TEXT,
    "email_ope" TEXT,
    "ultima_sincronizacao_ope" TIMESTAMP(3) NOT NULL,
    "origem_ope" TEXT NOT NULL DEFAULT 'portal_unico',

    CONSTRAINT "ope_pkey" PRIMARY KEY ("suid_ope")
);

-- CreateTable
CREATE TABLE "ope_historico_status" (
    "id_historico_status_ope" TEXT NOT NULL,
    "suid_ope_historico_status_ope" TEXT NOT NULL,
    "status_anterior_historico_status_ope" TEXT,
    "status_novo_historico_status_ope" TEXT NOT NULL,
    "origem_historico_status_ope" TEXT NOT NULL,
    "payload_historico_status_ope" JSONB NOT NULL,
    "registrado_em_historico_status_ope" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ope_historico_status_pkey" PRIMARY KEY ("id_historico_status_ope")
);

-- CreateIndex
CREATE INDEX "empresa_id_organizacao_idx" ON "empresa"("id_organizacao");

-- CreateIndex
CREATE INDEX "empresa_id_organizacao_nome_empresa_idx" ON "empresa"("id_organizacao", "nome_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_id_organizacao_cnpj_empresa_key" ON "empresa"("id_organizacao", "cnpj_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_id_organizacao_tin_empresa_pais_empresa_key" ON "empresa"("id_organizacao", "tin_empresa", "pais_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "ope_codigo_portal_unico_ope_key" ON "ope"("codigo_portal_unico_ope");

-- CreateIndex
CREATE INDEX "ope_id_organizacao_idx" ON "ope"("id_organizacao");

-- CreateIndex
CREATE INDEX "ope_historico_status_suid_ope_historico_status_ope_idx" ON "ope_historico_status"("suid_ope_historico_status_ope");

-- CreateIndex
CREATE INDEX "ope_historico_status_registrado_em_historico_status_ope_idx" ON "ope_historico_status"("registrado_em_historico_status_ope");
