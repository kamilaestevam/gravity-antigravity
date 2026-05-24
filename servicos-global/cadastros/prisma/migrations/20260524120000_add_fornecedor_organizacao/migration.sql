-- Passo 01 — SSOT Cadastros: fornecedor_organizacao
-- Aplicar em gravity-cadastros-teste E gravity-cadastros-producao (mesma migration).
-- Configurador.fornecedor_organizacao: remoção no passo 02 após cutover.

-- CreateEnum
CREATE TYPE "TipoFornecedorOrganizacao" AS ENUM (
  'AGENTE_CARGA',
  'DESPACHANTE_ADUANEIRO',
  'ARMADOR',
  'CIA_AEREA',
  'TRANSPORTADORA_RODOVIARIA_NACIONAL',
  'TRANSPORTADORA_RODOVIARIA_INTERNACIONAL',
  'ARMAZEM_ALFANDEGADO',
  'ARMAZEM_NACIONAL',
  'BANCO',
  'SEGURADORA_INTERNACIONAL',
  'CORRETORA_CAMBIO',
  'FABRICANTE',
  'EXPORTADOR_QUANDO_IMPORTACAO',
  'IMPORTADOR_QUANDO_EXPORTACAO'
);

-- CreateEnum
CREATE TYPE "StatusFornecedorOrganizacao" AS ENUM (
  'ATIVO',
  'INATIVO',
  'PENDENTE_APROVACAO'
);

-- CreateTable
CREATE TABLE "fornecedor_organizacao" (
    "id_fornecedor_organizacao" TEXT NOT NULL,
    "id_fornecedor" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "tipo_fornecedor_organizacao" "TipoFornecedorOrganizacao" NOT NULL,
    "status_fornecedor_organizacao" "StatusFornecedorOrganizacao" NOT NULL DEFAULT 'ATIVO',
    "id_usuario" TEXT,
    "data_criacao_fornecedor_organizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_fornecedor_organizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedor_organizacao_pkey" PRIMARY KEY ("id_fornecedor_organizacao")
);

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_organizacao_forn_org_tipo_unq" ON "fornecedor_organizacao"("id_fornecedor", "id_organizacao", "tipo_fornecedor_organizacao");

-- CreateIndex
CREATE INDEX "fornecedor_organizacao_org_idx" ON "fornecedor_organizacao"("id_organizacao");

-- CreateIndex
CREATE INDEX "fornecedor_organizacao_org_forn_idx" ON "fornecedor_organizacao"("id_organizacao", "id_fornecedor");

-- CreateIndex
CREATE INDEX "fornecedor_organizacao_org_usr_idx" ON "fornecedor_organizacao"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "fornecedor_organizacao_forn_idx" ON "fornecedor_organizacao"("id_fornecedor");

-- AddForeignKey
ALTER TABLE "fornecedor_organizacao" ADD CONSTRAINT "fornecedor_organizacao_id_fornecedor_fkey" FOREIGN KEY ("id_fornecedor") REFERENCES "empresa"("suid_empresa") ON DELETE RESTRICT ON UPDATE CASCADE;
