-- CreateEnum
CREATE TYPE "TipoOperacaoCambio" AS ENUM ('IMPORTACAO', 'EXPORTACAO');

-- CreateEnum
CREATE TYPE "ModalidadeCambio" AS ENUM ('PRONTO', 'FUTURO');

-- CreateEnum
CREATE TYPE "LiquidacaoCambio" AS ENUM ('D0', 'D1', 'D2');

-- CreateEnum
CREATE TYPE "MoedaCambio" AS ENUM ('USD', 'EUR', 'GBP', 'CHF', 'BRL', 'CNY', 'JPY');

-- CreateEnum
CREATE TYPE "StatusParcela" AS ENUM ('PENDENTE', 'AGENDADO', 'PAGO');

-- CreateEnum
CREATE TYPE "StatusCotacaoCambio" AS ENUM ('RASCUNHO', 'ENVIADA_CORRETORAS', 'EM_COTACAO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'REPROVADA', 'CANCELADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "CanalDisparoCambio" AS ENUM ('EMAIL', 'PORTAL');

-- CreateEnum
CREATE TYPE "StatusBidRequestCambio" AS ENUM ('PENDENTE', 'ENVIADO', 'VISUALIZADO', 'RESPONDIDO', 'EXPIRADO', 'ERRO_ENVIO');

-- CreateEnum
CREATE TYPE "StatusBidResponseCambio" AS ENUM ('RECEBIDA', 'EM_ANALISE', 'MELHOR_TAXA', 'MELHOR_SPREAD', 'MELHOR_AVALIACAO', 'APROVADA', 'REPROVADA');

-- CreateEnum
CREATE TYPE "TipoCorretora" AS ENUM ('CORRETORA_CAMBIO', 'BANCO_COMERCIAL', 'BANCO_CAMBIO', 'FINTECH');

-- CreateEnum
CREATE TYPE "StatusCorretora" AS ENUM ('ATIVA', 'INATIVA', 'BLOQUEADA');

-- CreateEnum
CREATE TYPE "MetodoVencimento" AS ENUM ('DATA_EMBARQUE', 'DATA_CHEGADA', 'DATA_REGISTRO_DI', 'DATA_DESEMBARACO', 'DATA_ENTREGA', 'PRONTIDAO_CARGA', 'DATA_FIXA');

-- CreateTable
CREATE TABLE "cambio_parcelas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL DEFAULT 'bid-cambio',
    "user_id" TEXT NOT NULL,
    "referencia_processo" TEXT,
    "numero_pedido" TEXT,
    "exportador" TEXT,
    "numero_di" TEXT,
    "numero_invoice" TEXT,
    "numero_bl" TEXT,
    "numero_contrato_cambio" TEXT,
    "numero_transmissao_di" TEXT,
    "referencia_cliente" TEXT,
    "moeda" "MoedaCambio" NOT NULL DEFAULT 'USD',
    "cambio_total" DECIMAL(18,4) NOT NULL,
    "porcentagem_parcela" DECIMAL(5,2) NOT NULL,
    "valor_a_pagar" DECIMAL(18,2) NOT NULL,
    "valor_a_pagar_brl" DECIMAL(18,2) NOT NULL,
    "valor_pago" DECIMAL(18,2),
    "valor_pago_brl" DECIMAL(18,2),
    "numero_parcela" INTEGER NOT NULL,
    "total_parcelas" INTEGER NOT NULL,
    "status" "StatusParcela" NOT NULL DEFAULT 'PENDENTE',
    "data_vencimento" TIMESTAMP(3),
    "data_agendamento" TIMESTAMP(3),
    "data_pagamento" TIMESTAMP(3),
    "data_vencimento_original" TIMESTAMP(3),
    "metodo_vencimento" "MetodoVencimento",
    "prazo_dias" INTEGER,
    "data_carga_pronta" TIMESTAMP(3),
    "data_esperada_prontidao" TIMESTAMP(3),
    "data_embarque_final" TIMESTAMP(3),
    "data_chegada_final" TIMESTAMP(3),
    "data_registro_di" TIMESTAMP(3),
    "data_desembaraco" TIMESTAMP(3),
    "data_entrega" TIMESTAMP(3),
    "data_abertura_pedido" TIMESTAMP(3),
    "taxa_fechamento" DECIMAL(10,4),
    "banco_corretora" TEXT,
    "condicao_pagamento" TEXT,
    "endereco_desembaraco" TEXT,
    "endereco_entrega" TEXT,
    "cotacao_cambio_id" TEXT,
    "bid_response_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambio_parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_anexos" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "parcela_id" TEXT NOT NULL,
    "nome_arquivo" TEXT,
    "nome_original" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'Contrato de Cambio',
    "tamanho_bytes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cambio_anexos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_formas_pagamento" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL DEFAULT 'bid-cambio',
    "user_id" TEXT NOT NULL,
    "referencia_processo" TEXT,
    "numero_pedido" TEXT,
    "descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambio_formas_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_config_parcelas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "forma_pagamento_id" TEXT NOT NULL,
    "a_partir_de" "MetodoVencimento" NOT NULL,
    "prazo_dias" INTEGER NOT NULL,
    "porcentagem" DECIMAL(5,2) NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "cambio_config_parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_cotacoes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL DEFAULT 'bid-cambio',
    "user_id" TEXT NOT NULL,
    "moeda" "MoedaCambio" NOT NULL DEFAULT 'USD',
    "valor" DECIMAL(18,2) NOT NULL,
    "tipo_operacao" "TipoOperacaoCambio" NOT NULL DEFAULT 'IMPORTACAO',
    "modalidade" "ModalidadeCambio" NOT NULL DEFAULT 'PRONTO',
    "liquidacao" "LiquidacaoCambio" NOT NULL DEFAULT 'D2',
    "referencia_processo" TEXT,
    "numero_pedido" TEXT,
    "exportador" TEXT,
    "status" "StatusCotacaoCambio" NOT NULL DEFAULT 'RASCUNHO',
    "ptax_referencia" DECIMAL(10,4),
    "ptax_data" TIMESTAMP(3),
    "data_expiracao" TIMESTAMP(3),
    "economia_brl" DECIMAL(18,2),
    "economia_percentual" DECIMAL(5,2),
    "corretora_aprovada_id" TEXT,
    "taxa_aprovada" DECIMAL(10,4),
    "aprovado_por" TEXT,
    "aprovado_em" TIMESTAMP(3),
    "observacao_aprovacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambio_cotacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_bid_requests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "cotacao_id" TEXT NOT NULL,
    "corretora_id" TEXT NOT NULL,
    "canal" "CanalDisparoCambio" NOT NULL DEFAULT 'EMAIL',
    "status" "StatusBidRequestCambio" NOT NULL DEFAULT 'PENDENTE',
    "token_publico" TEXT,
    "token_expiracao" TIMESTAMP(3),
    "enviado_em" TIMESTAMP(3),
    "visualizado_em" TIMESTAMP(3),
    "respondido_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambio_bid_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_bid_responses" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "cotacao_id" TEXT NOT NULL,
    "corretora_id" TEXT NOT NULL,
    "bid_request_id" TEXT NOT NULL,
    "taxa_oferecida" DECIMAL(10,4) NOT NULL,
    "spread" DECIMAL(10,4) NOT NULL,
    "valor_total_brl" DECIMAL(18,2) NOT NULL,
    "iof_percentual" DECIMAL(5,2) NOT NULL,
    "iof_valor" DECIMAL(18,2) NOT NULL,
    "liquidacao_proposta" "LiquidacaoCambio" NOT NULL,
    "validade_minutos" INTEGER NOT NULL,
    "validade_ate" TIMESTAMP(3) NOT NULL,
    "condicoes" TEXT,
    "status" "StatusBidResponseCambio" NOT NULL DEFAULT 'RECEBIDA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambio_bid_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_corretoras" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL DEFAULT 'bid-cambio',
    "user_id" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "cnpj" TEXT,
    "tipo" "TipoCorretora" NOT NULL DEFAULT 'CORRETORA_CAMBIO',
    "status" "StatusCorretora" NOT NULL DEFAULT 'ATIVA',
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "contato_nome" TEXT,
    "contato_cargo" TEXT,
    "portal_habilitado" BOOLEAN NOT NULL DEFAULT false,
    "moedas_operadas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambio_corretoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_avaliacoes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "corretora_id" TEXT NOT NULL,
    "cotacao_id" TEXT,
    "nota_taxa" INTEGER NOT NULL,
    "nota_agilidade" INTEGER NOT NULL,
    "nota_atendimento" INTEGER NOT NULL,
    "nota_confiabilidade" INTEGER NOT NULL,
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cambio_avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_rating_corretora_global" (
    "id" TEXT NOT NULL,
    "corretora_email" TEXT NOT NULL,
    "taxa_resposta" DECIMAL(5,2) NOT NULL,
    "taxa_aprovacao" DECIMAL(5,2) NOT NULL,
    "tempo_medio_resposta" INTEGER NOT NULL,
    "total_cotacoes" INTEGER NOT NULL DEFAULT 0,
    "total_aprovacoes" INTEGER NOT NULL DEFAULT 0,
    "nota_media_taxa" DECIMAL(3,2) NOT NULL,
    "nota_media_agilidade" DECIMAL(3,2) NOT NULL,
    "nota_media_atendimento" DECIMAL(3,2) NOT NULL,
    "nota_media_confiabilidade" DECIMAL(3,2) NOT NULL,
    "total_avaliacoes" INTEGER NOT NULL DEFAULT 0,
    "score_global" DECIMAL(3,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambio_rating_corretora_global_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_savings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "cotacao_id" TEXT NOT NULL,
    "corretora_id" TEXT NOT NULL,
    "valor_operacao" DECIMAL(18,2) NOT NULL,
    "moeda" "MoedaCambio" NOT NULL,
    "taxa_aprovada" DECIMAL(10,4) NOT NULL,
    "taxa_media_respostas" DECIMAL(10,4) NOT NULL,
    "ptax_referencia" DECIMAL(10,4) NOT NULL,
    "economia_brl" DECIMAL(18,2) NOT NULL,
    "economia_percentual" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cambio_savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_preferencias" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL DEFAULT 'bid-cambio',
    "mostrar_no_financeiro" BOOLEAN NOT NULL DEFAULT false,
    "alerta_email_vencimento" BOOLEAN NOT NULL DEFAULT false,
    "dias_antecedencia_alerta" INTEGER,
    "enviar_email_exportador" BOOLEAN NOT NULL DEFAULT false,
    "enviar_email_fim_de_semana" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambio_preferencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambio_preferencias_grid" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "colunas_visiveis" TEXT NOT NULL,
    "ordem_colunas" TEXT NOT NULL,
    "filtros_salvos" TEXT,
    "ordenacao" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambio_preferencias_grid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cambio_parcelas_tenant_id_idx" ON "cambio_parcelas"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_parcelas_tenant_id_product_id_idx" ON "cambio_parcelas"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "cambio_parcelas_tenant_id_user_id_idx" ON "cambio_parcelas"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "cambio_parcelas_tenant_id_status_idx" ON "cambio_parcelas"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "cambio_parcelas_tenant_id_data_vencimento_idx" ON "cambio_parcelas"("tenant_id", "data_vencimento");

-- CreateIndex
CREATE INDEX "cambio_anexos_tenant_id_idx" ON "cambio_anexos"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_anexos_tenant_id_parcela_id_idx" ON "cambio_anexos"("tenant_id", "parcela_id");

-- CreateIndex
CREATE INDEX "cambio_formas_pagamento_tenant_id_idx" ON "cambio_formas_pagamento"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_formas_pagamento_tenant_id_product_id_idx" ON "cambio_formas_pagamento"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "cambio_formas_pagamento_tenant_id_user_id_idx" ON "cambio_formas_pagamento"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "cambio_config_parcelas_tenant_id_idx" ON "cambio_config_parcelas"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_config_parcelas_tenant_id_forma_pagamento_id_idx" ON "cambio_config_parcelas"("tenant_id", "forma_pagamento_id");

-- CreateIndex
CREATE INDEX "cambio_cotacoes_tenant_id_idx" ON "cambio_cotacoes"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_cotacoes_tenant_id_product_id_idx" ON "cambio_cotacoes"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "cambio_cotacoes_tenant_id_user_id_idx" ON "cambio_cotacoes"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "cambio_cotacoes_tenant_id_status_idx" ON "cambio_cotacoes"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cambio_bid_requests_token_publico_key" ON "cambio_bid_requests"("token_publico");

-- CreateIndex
CREATE INDEX "cambio_bid_requests_tenant_id_idx" ON "cambio_bid_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_bid_requests_tenant_id_cotacao_id_idx" ON "cambio_bid_requests"("tenant_id", "cotacao_id");

-- CreateIndex
CREATE INDEX "cambio_bid_requests_token_publico_idx" ON "cambio_bid_requests"("token_publico");

-- CreateIndex
CREATE UNIQUE INDEX "cambio_bid_responses_bid_request_id_key" ON "cambio_bid_responses"("bid_request_id");

-- CreateIndex
CREATE INDEX "cambio_bid_responses_tenant_id_idx" ON "cambio_bid_responses"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_bid_responses_tenant_id_cotacao_id_idx" ON "cambio_bid_responses"("tenant_id", "cotacao_id");

-- CreateIndex
CREATE INDEX "cambio_bid_responses_tenant_id_corretora_id_idx" ON "cambio_bid_responses"("tenant_id", "corretora_id");

-- CreateIndex
CREATE INDEX "cambio_corretoras_tenant_id_idx" ON "cambio_corretoras"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_corretoras_tenant_id_product_id_idx" ON "cambio_corretoras"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "cambio_corretoras_tenant_id_user_id_idx" ON "cambio_corretoras"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "cambio_corretoras_tenant_id_status_idx" ON "cambio_corretoras"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "cambio_corretoras_email_idx" ON "cambio_corretoras"("email");

-- CreateIndex
CREATE INDEX "cambio_avaliacoes_tenant_id_idx" ON "cambio_avaliacoes"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_avaliacoes_tenant_id_corretora_id_idx" ON "cambio_avaliacoes"("tenant_id", "corretora_id");

-- CreateIndex
CREATE UNIQUE INDEX "cambio_rating_corretora_global_corretora_email_key" ON "cambio_rating_corretora_global"("corretora_email");

-- CreateIndex
CREATE INDEX "cambio_savings_tenant_id_idx" ON "cambio_savings"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_savings_tenant_id_cotacao_id_idx" ON "cambio_savings"("tenant_id", "cotacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "cambio_preferencias_tenant_id_key" ON "cambio_preferencias"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_preferencias_tenant_id_idx" ON "cambio_preferencias"("tenant_id");

-- CreateIndex
CREATE INDEX "cambio_preferencias_grid_tenant_id_idx" ON "cambio_preferencias_grid"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "cambio_preferencias_grid_tenant_id_user_id_key" ON "cambio_preferencias_grid"("tenant_id", "user_id");

-- AddForeignKey
ALTER TABLE "cambio_anexos" ADD CONSTRAINT "cambio_anexos_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "cambio_parcelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambio_config_parcelas" ADD CONSTRAINT "cambio_config_parcelas_forma_pagamento_id_fkey" FOREIGN KEY ("forma_pagamento_id") REFERENCES "cambio_formas_pagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambio_bid_requests" ADD CONSTRAINT "cambio_bid_requests_cotacao_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "cambio_cotacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambio_bid_requests" ADD CONSTRAINT "cambio_bid_requests_corretora_id_fkey" FOREIGN KEY ("corretora_id") REFERENCES "cambio_corretoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambio_bid_responses" ADD CONSTRAINT "cambio_bid_responses_cotacao_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "cambio_cotacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambio_bid_responses" ADD CONSTRAINT "cambio_bid_responses_corretora_id_fkey" FOREIGN KEY ("corretora_id") REFERENCES "cambio_corretoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambio_bid_responses" ADD CONSTRAINT "cambio_bid_responses_bid_request_id_fkey" FOREIGN KEY ("bid_request_id") REFERENCES "cambio_bid_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambio_avaliacoes" ADD CONSTRAINT "cambio_avaliacoes_corretora_id_fkey" FOREIGN KEY ("corretora_id") REFERENCES "cambio_corretoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
