-- Empresa 1:1 da organização — SSOT Cadastros (cadastros-arquitetura.md §4.1).
-- Fornecedor permanece para parceiros/contrapartes (sem alteração).

CREATE TABLE "empresa" (
    "id_empresa" TEXT NOT NULL,
    "id_organizacao_empresa" TEXT NOT NULL,
    "nome_empresa" TEXT NOT NULL,
    "cnpj_empresa" TEXT,
    "tin_empresa" TEXT,
    "pais_empresa" TEXT NOT NULL,
    "estado_provincia_empresa" TEXT,
    "cidade_empresa" TEXT,
    "endereco_empresa" TEXT,
    "cep_zipcode_empresa" TEXT,
    "email_principal_empresa" TEXT,
    "telefone_principal_empresa" TEXT,
    "whatsapp_principal_empresa" TEXT,
    "pode_ser_importador_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_exportador_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_fabricante_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_agente_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_despachante_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_armador_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_cia_aerea_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_transportadora_rodoviaria_nacional_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_transportadora_rodoviaria_internacional_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_armazem_alfandegado_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_armazem_nacional_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_banco_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_seguradora_internacional_empresa" BOOLEAN NOT NULL DEFAULT false,
    "pode_ser_seguradora_corretora_cambio_empresa" BOOLEAN NOT NULL DEFAULT false,
    "ativo_empresa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em_empresa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em_empresa" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id_empresa")
);

CREATE UNIQUE INDEX "empresa_id_organizacao_empresa_key" ON "empresa"("id_organizacao_empresa");
CREATE UNIQUE INDEX "emp_unq_org_cnpj" ON "empresa"("id_organizacao_empresa", "cnpj_empresa");
CREATE UNIQUE INDEX "emp_unq_org_tin_pais" ON "empresa"("id_organizacao_empresa", "tin_empresa", "pais_empresa");
CREATE INDEX "emp_org_idx" ON "empresa"("id_organizacao_empresa");
CREATE INDEX "emp_org_nome_idx" ON "empresa"("id_organizacao_empresa", "nome_empresa");
