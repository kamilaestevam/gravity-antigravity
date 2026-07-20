-- CreateEnum
CREATE TYPE "TipoOperacaoEstimativaCusto" AS ENUM ('IMPORTACAO', 'EXPORTACAO');

-- CreateEnum
CREATE TYPE "DetalheOperacaoEstimativaCusto" AS ENUM ('DIRETA', 'CONTA_ORDEM', 'ENCOMENDA', 'COMERCIAL_EXPORTADORA');

-- CreateEnum
CREATE TYPE "StatusEstimativaCusto" AS ENUM ('EM_CRIACAO', 'CRIADA', 'ARQUIVADA');

-- CreateEnum
CREATE TYPE "TipoCobrancaEstimativaCusto" AS ENUM ('PROCESSO', 'CONTAINER', 'AWB', 'BL', 'CRT', 'KGS', 'TON', 'CAIXA', 'M3');

-- CreateEnum
CREATE TYPE "TipoTributoEstimativaCusto" AS ENUM ('II', 'IPI', 'PIS', 'COFINS', 'ICMS');

-- CreateEnum
CREATE TYPE "TipoDocumentoEstimativaCusto" AS ENUM ('PEDIDO_COMPRA', 'PEDIDO_VENDA', 'PROFORMA', 'INVOICE', 'OUTRO');

-- CreateTable
CREATE TABLE "estimativa_custo" (
    "id_estimativa_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT NOT NULL,
    "id_processo" TEXT,
    "numero_estimativa_custo" TEXT NOT NULL,
    "referencia_estimativa_custo" TEXT,
    "tipo_operacao_estimativa_custo" "TipoOperacaoEstimativaCusto" NOT NULL DEFAULT 'IMPORTACAO',
    "detalhe_operacao_estimativa_custo" "DetalheOperacaoEstimativaCusto" NOT NULL DEFAULT 'DIRETA',
    "status_estimativa_custo" "StatusEstimativaCusto" NOT NULL DEFAULT 'EM_CRIACAO',
    "ncm_estimativa_custo" TEXT NOT NULL,
    "descricao_ncm_estimativa_custo" TEXT,
    "incoterm_estimativa_custo" TEXT NOT NULL DEFAULT 'FOB',
    "quantidade_estimativa_custo" DECIMAL(15,5) NOT NULL DEFAULT 0,
    "moeda_produto_estimativa_custo" TEXT NOT NULL DEFAULT 'USD',
    "valor_produto_estimativa_custo" DECIMAL(15,2) NOT NULL,
    "moeda_frete_estimativa_custo" TEXT NOT NULL DEFAULT 'USD',
    "valor_frete_estimativa_custo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "moeda_seguro_estimativa_custo" TEXT NOT NULL DEFAULT 'USD',
    "valor_seguro_estimativa_custo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "uf_desembaraco_estimativa_custo" TEXT NOT NULL DEFAULT 'SP',
    "aliquota_icms_estimativa_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "usa_beneficio_estimativa_custo" BOOLEAN NOT NULL DEFAULT false,
    "icms_entrada_estimativa_custo" DECIMAL(15,2),
    "icms_saida_estimativa_custo" DECIMAL(15,2),
    "aliquota_ii_estimativa_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "aliquota_ipi_estimativa_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "aliquota_pis_estimativa_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "aliquota_cofins_estimativa_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "reducao_ii_estimativa_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "ptax_utilizada_estimativa_custo" DECIMAL(10,4),
    "valor_aduaneiro_estimativa_custo" DECIMAL(15,2),
    "total_tributos_estimativa_custo" DECIMAL(15,2),
    "custo_nacionalizado_brl_estimativa_custo" DECIMAL(15,2),
    "fonte_calculo_estimativa_custo" TEXT,
    "data_criacao_estimativa_custo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_estimativa_custo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimativa_custo_pkey" PRIMARY KEY ("id_estimativa_custo")
);

-- CreateTable
CREATE TABLE "taxa_origem_estimativa_custo" (
    "id_taxa_origem_estimativa_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT,
    "id_estimativa_custo" TEXT NOT NULL,
    "id_taxa_origem_destino" TEXT,
    "nome_taxa_origem_estimativa_custo" TEXT NOT NULL,
    "moeda_taxa_origem_estimativa_custo" TEXT NOT NULL DEFAULT 'USD',
    "tipo_cobranca_taxa_origem_estimativa_custo" "TipoCobrancaEstimativaCusto" NOT NULL DEFAULT 'PROCESSO',
    "valor_minimo_taxa_origem_estimativa_custo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_total_taxa_origem_estimativa_custo" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "taxa_origem_estimativa_custo_pkey" PRIMARY KEY ("id_taxa_origem_estimativa_custo")
);

-- CreateTable
CREATE TABLE "taxa_destino_estimativa_custo" (
    "id_taxa_destino_estimativa_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT,
    "id_estimativa_custo" TEXT NOT NULL,
    "id_taxa_origem_destino" TEXT,
    "nome_taxa_destino_estimativa_custo" TEXT NOT NULL,
    "moeda_taxa_destino_estimativa_custo" TEXT NOT NULL DEFAULT 'USD',
    "tipo_cobranca_taxa_destino_estimativa_custo" "TipoCobrancaEstimativaCusto" NOT NULL DEFAULT 'PROCESSO',
    "valor_minimo_taxa_destino_estimativa_custo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_total_taxa_destino_estimativa_custo" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "taxa_destino_estimativa_custo_pkey" PRIMARY KEY ("id_taxa_destino_estimativa_custo")
);

-- CreateTable
CREATE TABLE "tributo_estimativa_custo" (
    "id_tributo_estimativa_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT,
    "id_estimativa_custo" TEXT NOT NULL,
    "tipo_tributo_estimativa_custo" "TipoTributoEstimativaCusto" NOT NULL,
    "aliquota_tributo_estimativa_custo" DECIMAL(5,4) NOT NULL,
    "base_calculo_tributo_estimativa_custo" DECIMAL(15,2) NOT NULL,
    "valor_tributo_estimativa_custo" DECIMAL(15,2) NOT NULL,
    "reducao_tributo_estimativa_custo" DECIMAL(5,4),
    "acordo_tributo_estimativa_custo" TEXT,

    CONSTRAINT "tributo_estimativa_custo_pkey" PRIMARY KEY ("id_tributo_estimativa_custo")
);

-- CreateTable
CREATE TABLE "documento_estimativa_custo" (
    "id_documento_estimativa_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT,
    "id_estimativa_custo" TEXT NOT NULL,
    "tipo_documento_estimativa_custo" "TipoDocumentoEstimativaCusto" NOT NULL,
    "numero_documento_estimativa_custo" TEXT NOT NULL,
    "data_criacao_documento_estimativa_custo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_estimativa_custo_pkey" PRIMARY KEY ("id_documento_estimativa_custo")
);

-- CreateTable
CREATE TABLE "sequencia_estimativa_custo" (
    "id_sequencia_estimativa_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "ano_sequencia_estimativa_custo" INTEGER NOT NULL,
    "ultimo_numero_sequencia_estimativa_custo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sequencia_estimativa_custo_pkey" PRIMARY KEY ("id_sequencia_estimativa_custo")
);

-- CreateTable
CREATE TABLE "cache_cambio_bacen" (
    "id_cache_cambio_bacen" TEXT NOT NULL,
    "moeda_cache_cambio_bacen" TEXT NOT NULL,
    "data_referencia_cache_cambio_bacen" TIMESTAMP(3) NOT NULL,
    "ptax_compra_cache_cambio_bacen" DECIMAL(10,4) NOT NULL,
    "ptax_venda_cache_cambio_bacen" DECIMAL(10,4) NOT NULL,
    "data_consulta_cache_cambio_bacen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cache_cambio_bacen_pkey" PRIMARY KEY ("id_cache_cambio_bacen")
);

-- CreateIndex
CREATE INDEX "estimativa_custo_id_organizacao_idx" ON "estimativa_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "estimativa_custo_id_workspace_idx" ON "estimativa_custo"("id_workspace");

-- CreateIndex
CREATE INDEX "estimativa_custo_id_organizacao_id_workspace_idx" ON "estimativa_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "estimativa_custo_id_organizacao_id_produto_idx" ON "estimativa_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "estimativa_custo_id_organizacao_id_usuario_idx" ON "estimativa_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "estimativa_custo_id_organizacao_numero_estimativa_custo_idx" ON "estimativa_custo"("id_organizacao", "numero_estimativa_custo");

-- CreateIndex
CREATE INDEX "estimativa_custo_id_organizacao_status_estimativa_custo_idx" ON "estimativa_custo"("id_organizacao", "status_estimativa_custo");

-- CreateIndex
CREATE INDEX "estimativa_custo_id_organizacao_ncm_estimativa_custo_idx" ON "estimativa_custo"("id_organizacao", "ncm_estimativa_custo");

-- CreateIndex
CREATE INDEX "estimativa_custo_id_processo_idx" ON "estimativa_custo"("id_processo");

-- CreateIndex
CREATE INDEX "taxa_origem_estimativa_custo_id_organizacao_idx" ON "taxa_origem_estimativa_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "taxa_origem_estimativa_custo_id_organizacao_id_workspace_idx" ON "taxa_origem_estimativa_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "taxa_origem_estimativa_custo_id_organizacao_id_produto_idx" ON "taxa_origem_estimativa_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "taxa_origem_estimativa_custo_id_organizacao_id_usuario_idx" ON "taxa_origem_estimativa_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "taxa_origem_estimativa_custo_id_organizacao_id_estimativa_c_idx" ON "taxa_origem_estimativa_custo"("id_organizacao", "id_estimativa_custo");

-- CreateIndex
CREATE INDEX "taxa_destino_estimativa_custo_id_organizacao_idx" ON "taxa_destino_estimativa_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "taxa_destino_estimativa_custo_id_organizacao_id_workspace_idx" ON "taxa_destino_estimativa_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "taxa_destino_estimativa_custo_id_organizacao_id_produto_idx" ON "taxa_destino_estimativa_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "taxa_destino_estimativa_custo_id_organizacao_id_usuario_idx" ON "taxa_destino_estimativa_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "taxa_destino_estimativa_custo_id_organizacao_id_estimativa__idx" ON "taxa_destino_estimativa_custo"("id_organizacao", "id_estimativa_custo");

-- CreateIndex
CREATE INDEX "tributo_estimativa_custo_id_organizacao_idx" ON "tributo_estimativa_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "tributo_estimativa_custo_id_organizacao_id_workspace_idx" ON "tributo_estimativa_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "tributo_estimativa_custo_id_organizacao_id_produto_idx" ON "tributo_estimativa_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "tributo_estimativa_custo_id_organizacao_id_usuario_idx" ON "tributo_estimativa_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "tributo_estimativa_custo_id_organizacao_id_estimativa_custo_idx" ON "tributo_estimativa_custo"("id_organizacao", "id_estimativa_custo");

-- CreateIndex
CREATE INDEX "documento_estimativa_custo_id_organizacao_idx" ON "documento_estimativa_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "documento_estimativa_custo_id_organizacao_id_workspace_idx" ON "documento_estimativa_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "documento_estimativa_custo_id_organizacao_id_produto_idx" ON "documento_estimativa_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "documento_estimativa_custo_id_organizacao_id_usuario_idx" ON "documento_estimativa_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "documento_estimativa_custo_id_organizacao_id_estimativa_cus_idx" ON "documento_estimativa_custo"("id_organizacao", "id_estimativa_custo");

-- CreateIndex
CREATE INDEX "sequencia_estimativa_custo_id_organizacao_idx" ON "sequencia_estimativa_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "sequencia_estimativa_custo_id_organizacao_id_usuario_idx" ON "sequencia_estimativa_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "sequencia_estimativa_custo_id_organizacao_id_usuario_ano_se_key" ON "sequencia_estimativa_custo"("id_organizacao", "id_usuario", "ano_sequencia_estimativa_custo");

-- CreateIndex
CREATE INDEX "cache_cambio_bacen_moeda_cache_cambio_bacen_idx" ON "cache_cambio_bacen"("moeda_cache_cambio_bacen");

-- CreateIndex
CREATE UNIQUE INDEX "cache_cambio_bacen_moeda_cache_cambio_bacen_data_referencia_key" ON "cache_cambio_bacen"("moeda_cache_cambio_bacen", "data_referencia_cache_cambio_bacen");

-- AddForeignKey
ALTER TABLE "taxa_origem_estimativa_custo" ADD CONSTRAINT "taxa_origem_estimativa_custo_id_estimativa_custo_fkey" FOREIGN KEY ("id_estimativa_custo") REFERENCES "estimativa_custo"("id_estimativa_custo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxa_destino_estimativa_custo" ADD CONSTRAINT "taxa_destino_estimativa_custo_id_estimativa_custo_fkey" FOREIGN KEY ("id_estimativa_custo") REFERENCES "estimativa_custo"("id_estimativa_custo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tributo_estimativa_custo" ADD CONSTRAINT "tributo_estimativa_custo_id_estimativa_custo_fkey" FOREIGN KEY ("id_estimativa_custo") REFERENCES "estimativa_custo"("id_estimativa_custo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento_estimativa_custo" ADD CONSTRAINT "documento_estimativa_custo_id_estimativa_custo_fkey" FOREIGN KEY ("id_estimativa_custo") REFERENCES "estimativa_custo"("id_estimativa_custo") ON DELETE CASCADE ON UPDATE CASCADE;
