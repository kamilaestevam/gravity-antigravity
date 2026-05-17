-- CreateTable: certificado_digital_siscomex
-- Certificado digital e-CNPJ para autenticação mTLS com Portal Único Siscomex.
-- Catálogo global (sem id_organizacao) — certificado por CNPJ raiz.
-- PFX armazenado criptografado (AES-256-GCM).

CREATE TABLE "certificado_digital_siscomex" (
    "id_certificado_digital_siscomex" TEXT NOT NULL,
    "nome_certificado_digital_siscomex" TEXT NOT NULL,
    "cnpj_certificado_digital_siscomex" TEXT NOT NULL,
    "cn_certificado_digital_siscomex" TEXT NOT NULL,
    "serial_number_certificado_digital_siscomex" TEXT NOT NULL,
    "emissor_certificado_digital_siscomex" TEXT NOT NULL,
    "validade_inicio_certificado_digital_siscomex" TIMESTAMP(3) NOT NULL,
    "validade_fim_certificado_digital_siscomex" TIMESTAMP(3) NOT NULL,
    "pfx_criptografado_certificado_digital_siscomex" TEXT NOT NULL,
    "senha_hash_certificado_digital_siscomex" TEXT NOT NULL,
    "ativo_certificado_digital_siscomex" BOOLEAN NOT NULL DEFAULT false,
    "data_criacao_certificado_digital_siscomex" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_certificado_digital_siscomex" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificado_digital_siscomex_pkey" PRIMARY KEY ("id_certificado_digital_siscomex")
);

-- CreateIndex
CREATE INDEX "cds_ativo_idx" ON "certificado_digital_siscomex"("ativo_certificado_digital_siscomex");

-- CreateIndex
CREATE INDEX "cds_cnpj_idx" ON "certificado_digital_siscomex"("cnpj_certificado_digital_siscomex");
