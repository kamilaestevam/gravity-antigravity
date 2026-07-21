-- CreateEnum
CREATE TYPE "TipoOperacaoSimulaCusto" AS ENUM ('IMPORTACAO', 'EXPORTACAO');

-- CreateEnum
CREATE TYPE "DetalheOperacaoSimulaCusto" AS ENUM ('DIRETA', 'CONTA_ORDEM', 'ENCOMENDA', 'COMERCIAL_EXPORTADORA');

-- CreateEnum
CREATE TYPE "StatusSimulaCusto" AS ENUM ('EM_CRIACAO', 'CRIADA', 'ARQUIVADA');

-- CreateEnum
CREATE TYPE "TipoCobrancaSimulaCusto" AS ENUM ('PROCESSO', 'CONTAINER', 'AWB', 'BL', 'CRT', 'KGS', 'TON', 'CAIXA', 'M3');

-- CreateEnum
CREATE TYPE "TipoTributoSimulaCusto" AS ENUM ('II', 'IPI', 'PIS', 'COFINS', 'ICMS');

-- CreateEnum
CREATE TYPE "TipoDocumentoSimulaCusto" AS ENUM ('PEDIDO_COMPRA', 'PEDIDO_VENDA', 'PROFORMA', 'INVOICE', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoValorPrazoPagamentoSimulaCusto" AS ENUM ('VALOR', 'PERCENTUAL');

-- CreateEnum
CREATE TYPE "MomentoPrazoPagamentoSimulaCusto" AS ENUM ('NO_DIA', 'ANTES', 'DEPOIS');

-- CreateEnum
CREATE TYPE "FatoGeradorPrazoPagamentoSimulaCusto" AS ENUM ('PRODUCAO', 'ENTREGA_NA_ORIGEM', 'ENTREGA_NO_PORTO_DE_ORIGEM', 'ENTREGA_NO_LOCAL_DE_ORIGEM', 'ENTREGA_NO_DESTINO', 'NO_BL', 'ENTREGA_NO_PORTO_DE_DESTINO', 'ENTREGA_NO_LOCAL_DE_DESTINO', 'EMBARQUE_NO_DESTINO', 'CHEGADA_NO_DESTINO');

-- CreateEnum
CREATE TYPE "ModalidadeRecolhimentoIcmsSimulaCusto" AS ENUM ('INTEGRAL', 'REDUCAO', 'ISENTO', 'DIFERIDO');

-- CreateTable
CREATE TABLE "simula_custo" (
    "id_simula_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT NOT NULL,
    "id_processo" TEXT,
    "numero_simula_custo" TEXT NOT NULL,
    "referencia_simula_custo" TEXT,
    "tipo_operacao_simula_custo" "TipoOperacaoSimulaCusto" NOT NULL DEFAULT 'IMPORTACAO',
    "detalhe_operacao_simula_custo" "DetalheOperacaoSimulaCusto" NOT NULL DEFAULT 'DIRETA',
    "status_simula_custo" "StatusSimulaCusto" NOT NULL DEFAULT 'EM_CRIACAO',
    "ncm_simula_custo" TEXT NOT NULL,
    "descricao_ncm_simula_custo" TEXT,
    "incoterm_simula_custo" TEXT NOT NULL DEFAULT 'FOB',
    "quantidade_simula_custo" DECIMAL(15,5) NOT NULL DEFAULT 0,
    "moeda_produto_simula_custo" TEXT NOT NULL DEFAULT 'USD',
    "valor_produto_simula_custo" DECIMAL(15,2) NOT NULL,
    "moeda_frete_simula_custo" TEXT NOT NULL DEFAULT 'USD',
    "valor_frete_simula_custo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "enviar_solicitacao_cotacao_frete_simula_custo" BOOLEAN NOT NULL DEFAULT false,
    "moeda_seguro_simula_custo" TEXT NOT NULL DEFAULT 'USD',
    "valor_seguro_simula_custo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "uf_desembaraco_simula_custo" TEXT NOT NULL DEFAULT 'SP',
    "modalidade_recolhimento_icms_simula_custo" "ModalidadeRecolhimentoIcmsSimulaCusto" NOT NULL DEFAULT 'INTEGRAL',
    "aliquota_icms_simula_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "usa_beneficio_simula_custo" BOOLEAN NOT NULL DEFAULT false,
    "icms_entrada_simula_custo" DECIMAL(15,2),
    "icms_saida_simula_custo" DECIMAL(15,2),
    "aliquota_ii_simula_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "aliquota_ipi_simula_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "aliquota_pis_simula_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "aliquota_cofins_simula_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "reducao_ii_simula_custo" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "ptax_utilizada_simula_custo" DECIMAL(10,4),
    "valor_aduaneiro_simula_custo" DECIMAL(15,2),
    "total_tributos_simula_custo" DECIMAL(15,2),
    "custo_nacionalizado_brl_simula_custo" DECIMAL(15,2),
    "fonte_calculo_simula_custo" TEXT,
    "data_criacao_simula_custo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_simula_custo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simula_custo_pkey" PRIMARY KEY ("id_simula_custo")
);

-- CreateTable
CREATE TABLE "taxa_origem_simula_custo" (
    "id_taxa_origem_simula_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT,
    "id_simula_custo" TEXT NOT NULL,
    "id_taxa_origem_destino" TEXT,
    "nome_taxa_origem_simula_custo" TEXT NOT NULL,
    "moeda_taxa_origem_simula_custo" TEXT NOT NULL DEFAULT 'USD',
    "tipo_cobranca_taxa_origem_simula_custo" "TipoCobrancaSimulaCusto" NOT NULL DEFAULT 'PROCESSO',
    "valor_minimo_taxa_origem_simula_custo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_total_taxa_origem_simula_custo" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "taxa_origem_simula_custo_pkey" PRIMARY KEY ("id_taxa_origem_simula_custo")
);

-- CreateTable
CREATE TABLE "taxa_destino_simula_custo" (
    "id_taxa_destino_simula_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT,
    "id_simula_custo" TEXT NOT NULL,
    "id_taxa_origem_destino" TEXT,
    "nome_taxa_destino_simula_custo" TEXT NOT NULL,
    "moeda_taxa_destino_simula_custo" TEXT NOT NULL DEFAULT 'USD',
    "tipo_cobranca_taxa_destino_simula_custo" "TipoCobrancaSimulaCusto" NOT NULL DEFAULT 'PROCESSO',
    "valor_minimo_taxa_destino_simula_custo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_total_taxa_destino_simula_custo" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "taxa_destino_simula_custo_pkey" PRIMARY KEY ("id_taxa_destino_simula_custo")
);

-- CreateTable
CREATE TABLE "tributo_simula_custo" (
    "id_tributo_simula_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT,
    "id_simula_custo" TEXT NOT NULL,
    "tipo_tributo_simula_custo" "TipoTributoSimulaCusto" NOT NULL,
    "aliquota_tributo_simula_custo" DECIMAL(5,4) NOT NULL,
    "base_calculo_tributo_simula_custo" DECIMAL(15,2) NOT NULL,
    "valor_tributo_simula_custo" DECIMAL(15,2) NOT NULL,
    "reducao_tributo_simula_custo" DECIMAL(5,4),
    "acordo_tributo_simula_custo" TEXT,

    CONSTRAINT "tributo_simula_custo_pkey" PRIMARY KEY ("id_tributo_simula_custo")
);

-- CreateTable
CREATE TABLE "documento_simula_custo" (
    "id_documento_simula_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT,
    "id_simula_custo" TEXT NOT NULL,
    "tipo_documento_simula_custo" "TipoDocumentoSimulaCusto" NOT NULL,
    "numero_documento_simula_custo" TEXT NOT NULL,
    "data_criacao_documento_simula_custo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_simula_custo_pkey" PRIMARY KEY ("id_documento_simula_custo")
);

-- CreateTable
CREATE TABLE "prazo_pagamento_simula_custo" (
    "id_prazo_pagamento_simula_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL DEFAULT 'simula-custo',
    "id_usuario" TEXT,
    "id_simula_custo" TEXT NOT NULL,
    "valor_prazo_pagamento_simula_custo" DECIMAL(15,4) NOT NULL,
    "tipo_valor_prazo_pagamento_simula_custo" "TipoValorPrazoPagamentoSimulaCusto" NOT NULL DEFAULT 'PERCENTUAL',
    "momento_prazo_pagamento_simula_custo" "MomentoPrazoPagamentoSimulaCusto" NOT NULL DEFAULT 'NO_DIA',
    "dias_prazo_pagamento_simula_custo" INTEGER NOT NULL DEFAULT 0,
    "fato_gerador_prazo_pagamento_simula_custo" "FatoGeradorPrazoPagamentoSimulaCusto" NOT NULL,
    "ordem_prazo_pagamento_simula_custo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "prazo_pagamento_simula_custo_pkey" PRIMARY KEY ("id_prazo_pagamento_simula_custo")
);

-- CreateTable
CREATE TABLE "sequencia_simula_custo" (
    "id_sequencia_simula_custo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "ano_sequencia_simula_custo" INTEGER NOT NULL,
    "ultimo_numero_sequencia_simula_custo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sequencia_simula_custo_pkey" PRIMARY KEY ("id_sequencia_simula_custo")
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
CREATE INDEX "simula_custo_id_organizacao_idx" ON "simula_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "simula_custo_id_workspace_idx" ON "simula_custo"("id_workspace");

-- CreateIndex
CREATE INDEX "simula_custo_id_organizacao_id_workspace_idx" ON "simula_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "simula_custo_id_organizacao_id_produto_idx" ON "simula_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "simula_custo_id_organizacao_id_usuario_idx" ON "simula_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "simula_custo_id_organizacao_numero_simula_custo_idx" ON "simula_custo"("id_organizacao", "numero_simula_custo");

-- CreateIndex
CREATE INDEX "simula_custo_id_organizacao_status_simula_custo_idx" ON "simula_custo"("id_organizacao", "status_simula_custo");

-- CreateIndex
CREATE INDEX "simula_custo_id_organizacao_ncm_simula_custo_idx" ON "simula_custo"("id_organizacao", "ncm_simula_custo");

-- CreateIndex
CREATE INDEX "simula_custo_id_processo_idx" ON "simula_custo"("id_processo");

-- CreateIndex
CREATE INDEX "taxa_origem_simula_custo_id_organizacao_idx" ON "taxa_origem_simula_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "taxa_origem_simula_custo_id_organizacao_id_workspace_idx" ON "taxa_origem_simula_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "taxa_origem_simula_custo_id_organizacao_id_produto_idx" ON "taxa_origem_simula_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "taxa_origem_simula_custo_id_organizacao_id_usuario_idx" ON "taxa_origem_simula_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "taxa_origem_simula_custo_id_organizacao_id_simula_custo_idx" ON "taxa_origem_simula_custo"("id_organizacao", "id_simula_custo");

-- CreateIndex
CREATE INDEX "taxa_destino_simula_custo_id_organizacao_idx" ON "taxa_destino_simula_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "taxa_destino_simula_custo_id_organizacao_id_workspace_idx" ON "taxa_destino_simula_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "taxa_destino_simula_custo_id_organizacao_id_produto_idx" ON "taxa_destino_simula_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "taxa_destino_simula_custo_id_organizacao_id_usuario_idx" ON "taxa_destino_simula_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "taxa_destino_simula_custo_id_organizacao_id_simula_custo_idx" ON "taxa_destino_simula_custo"("id_organizacao", "id_simula_custo");

-- CreateIndex
CREATE INDEX "tributo_simula_custo_id_organizacao_idx" ON "tributo_simula_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "tributo_simula_custo_id_organizacao_id_workspace_idx" ON "tributo_simula_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "tributo_simula_custo_id_organizacao_id_produto_idx" ON "tributo_simula_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "tributo_simula_custo_id_organizacao_id_usuario_idx" ON "tributo_simula_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "tributo_simula_custo_id_organizacao_id_simula_custo_idx" ON "tributo_simula_custo"("id_organizacao", "id_simula_custo");

-- CreateIndex
CREATE INDEX "documento_simula_custo_id_organizacao_idx" ON "documento_simula_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "documento_simula_custo_id_organizacao_id_workspace_idx" ON "documento_simula_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "documento_simula_custo_id_organizacao_id_produto_idx" ON "documento_simula_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "documento_simula_custo_id_organizacao_id_usuario_idx" ON "documento_simula_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "documento_simula_custo_id_organizacao_id_simula_custo_idx" ON "documento_simula_custo"("id_organizacao", "id_simula_custo");

-- CreateIndex
CREATE INDEX "prazo_pagamento_simula_custo_id_organizacao_idx" ON "prazo_pagamento_simula_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "prazo_pagamento_simula_custo_id_organizacao_id_workspace_idx" ON "prazo_pagamento_simula_custo"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "prazo_pagamento_simula_custo_id_organizacao_id_produto_idx" ON "prazo_pagamento_simula_custo"("id_organizacao", "id_produto");

-- CreateIndex
CREATE INDEX "prazo_pagamento_simula_custo_id_organizacao_id_usuario_idx" ON "prazo_pagamento_simula_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE INDEX "prazo_pagamento_simula_custo_id_organizacao_id_simula_custo_idx" ON "prazo_pagamento_simula_custo"("id_organizacao", "id_simula_custo");

-- CreateIndex
CREATE INDEX "sequencia_simula_custo_id_organizacao_idx" ON "sequencia_simula_custo"("id_organizacao");

-- CreateIndex
CREATE INDEX "sequencia_simula_custo_id_organizacao_id_usuario_idx" ON "sequencia_simula_custo"("id_organizacao", "id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "sequencia_simula_custo_id_organizacao_id_usuario_ano_sequen_key" ON "sequencia_simula_custo"("id_organizacao", "id_usuario", "ano_sequencia_simula_custo");

-- CreateIndex
CREATE INDEX "cache_cambio_bacen_moeda_cache_cambio_bacen_idx" ON "cache_cambio_bacen"("moeda_cache_cambio_bacen");

-- CreateIndex
CREATE UNIQUE INDEX "cache_cambio_bacen_moeda_cache_cambio_bacen_data_referencia_key" ON "cache_cambio_bacen"("moeda_cache_cambio_bacen", "data_referencia_cache_cambio_bacen");

-- AddForeignKey
ALTER TABLE "taxa_origem_simula_custo" ADD CONSTRAINT "taxa_origem_simula_custo_id_simula_custo_fkey" FOREIGN KEY ("id_simula_custo") REFERENCES "simula_custo"("id_simula_custo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxa_destino_simula_custo" ADD CONSTRAINT "taxa_destino_simula_custo_id_simula_custo_fkey" FOREIGN KEY ("id_simula_custo") REFERENCES "simula_custo"("id_simula_custo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tributo_simula_custo" ADD CONSTRAINT "tributo_simula_custo_id_simula_custo_fkey" FOREIGN KEY ("id_simula_custo") REFERENCES "simula_custo"("id_simula_custo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento_simula_custo" ADD CONSTRAINT "documento_simula_custo_id_simula_custo_fkey" FOREIGN KEY ("id_simula_custo") REFERENCES "simula_custo"("id_simula_custo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prazo_pagamento_simula_custo" ADD CONSTRAINT "prazo_pagamento_simula_custo_id_simula_custo_fkey" FOREIGN KEY ("id_simula_custo") REFERENCES "simula_custo"("id_simula_custo") ON DELETE CASCADE ON UPDATE CASCADE;

