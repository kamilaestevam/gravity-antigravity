-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('draft', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado');

-- CreateEnum
CREATE TYPE "TipoOperacao" AS ENUM ('importacao', 'exportacao');

-- CreateEnum
CREATE TYPE "MoedaPedido" AS ENUM ('USD', 'EUR', 'CNY', 'JPY', 'GBP', 'BRL');

-- CreateEnum
CREATE TYPE "IncotermPedido" AS ENUM ('FOB', 'CIF', 'EXW', 'CFR', 'FCA', 'DDP', 'DAP', 'CPT', 'CIP', 'DPU', 'FAS');

-- CreateEnum
CREATE TYPE "UnidadeComercializada" AS ENUM ('UNID', 'KG', 'TON', 'M', 'M2', 'M3', 'LT', 'PARES', 'DUZIA', 'JOGO');

-- CreateTable
CREATE TABLE "pedido_produto_gravity" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "tipo_operacao" TEXT NOT NULL,
    "numero_pedido" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "status_id" TEXT,
    "importacao_exportador_id" TEXT,
    "exportacao_importador_id" TEXT,
    "fabricante_id" TEXT,
    "incoterm" TEXT,
    "moeda_pedido" TEXT NOT NULL DEFAULT 'USD',
    "valor_total_pedido" DECIMAL(18,6),
    "casas_decimais_valor_pedido" INTEGER NOT NULL DEFAULT 2,
    "quantidade_total_pedido" DECIMAL(18,6),
    "casas_decimais_quantidade_pedido" INTEGER NOT NULL DEFAULT 2,
    "unidade_comercializada_pedido" TEXT,
    "condicao_pagamento" TEXT,
    "numero_proforma" TEXT,
    "numero_invoice" TEXT,
    "referencia_importador" TEXT,
    "referencia_exportador" TEXT,
    "referencia_fabricante" TEXT,
    "valor_total_cambio_pedido" DECIMAL(18,6),
    "moeda_cambio_pedido" TEXT,
    "taxa_cambio_estimada" DECIMAL(18,6),
    "contrato_cambio_id_pedido" TEXT,
    "data_emissao_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalhes_operacionais" JSONB,
    "campos_custom" JSONB,
    "pedidos_origem_id" JSONB,
    "cnpj_importador" TEXT,
    "data_consolidacao_pedido" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "peso_liquido_total_pedido" DECIMAL(18,6),
    "peso_bruto_total_pedido" DECIMAL(18,6),
    "cubagem_total_pedido" DECIMAL(18,6),
    "casas_decimais_peso_pedido" INTEGER NOT NULL DEFAULT 3,
    "casas_decimais_cubagem_pedido" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_produto_gravity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "sequencia_item" INTEGER,
    "part_number" TEXT NOT NULL,
    "ncm" TEXT NOT NULL,
    "descricao_item" TEXT NOT NULL,
    "unidade_comercializada_item" TEXT,
    "quantidade_inicial_pedido" DECIMAL(18,6) NOT NULL,
    "quantidade_atual_pedido" DECIMAL(18,6) NOT NULL,
    "quantidade_pronta_pedido" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "quantidade_transferida_pedido" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "quantidade_cancelada_pedido" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "casas_decimais_quantidade_item" INTEGER NOT NULL DEFAULT 2,
    "moeda_item" TEXT NOT NULL DEFAULT 'USD',
    "valor_total_item" DECIMAL(18,6),
    "valor_por_unidade_item" DECIMAL(18,6),
    "casas_decimais_valor_item" INTEGER NOT NULL DEFAULT 2,
    "cobertura_cambial" TEXT NOT NULL DEFAULT 'com_cobertura',
    "nome_exportador" TEXT,
    "nome_importador" TEXT,
    "nome_fabricante" TEXT,
    "referencia_importador" TEXT,
    "referencia_exportador" TEXT,
    "referencia_fabricante" TEXT,
    "incoterm" TEXT,
    "condicao_pagamento_pedido" TEXT,
    "data_emissao_pedido" TIMESTAMP(3),
    "peso_liquido_unitario" DECIMAL(18,6),
    "peso_bruto_unitario" DECIMAL(18,6),
    "cubagem_unitaria" DECIMAL(18,6),
    "casas_decimais_peso_item" INTEGER NOT NULL DEFAULT 3,
    "casas_decimais_cubagem_item" INTEGER NOT NULL DEFAULT 3,
    "campos_custom" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tabela_processos" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "estimativa_custo_id" TEXT,
    "cotacao_frete_id" TEXT,
    "status_embarque" TEXT NOT NULL DEFAULT 'aberto',
    "tipo_operacao" TEXT NOT NULL,
    "referencia_processo" TEXT,
    "id_processo" TEXT,
    "responsavel_processo" TEXT,
    "responsavel_rotina" TEXT,
    "setor_responsavel" TEXT,
    "vendedor_responsavel" TEXT,
    "canal_parametrizacao" TEXT,
    "importacao_exportador_id" TEXT,
    "exportacao_importador_id" TEXT,
    "agente_carga_id" TEXT,
    "armador_id" TEXT,
    "cia_aerea_id" TEXT,
    "transportador_rodo_internacional_id" TEXT,
    "transportador_rodo_nacional_id" TEXT,
    "transportador_ferroviario_id" TEXT,
    "despachante_id" TEXT,
    "armazem_alfandegado_id" TEXT,
    "securadora_internacional_id" TEXT,
    "banco_id" TEXT,
    "corretora_cambio_id" TEXT,
    "moeda_pedido" TEXT NOT NULL DEFAULT 'USD',
    "valor_total_pedido" DOUBLE PRECISION,
    "incoterm" TEXT,
    "premio_seguro_internacional" DECIMAL(18,6),
    "modal_frete_internacional" TEXT,
    "porto_origem" TEXT,
    "porto_transbordo" TEXT,
    "porto_destino" TEXT,
    "aeroporto_origem" TEXT,
    "aeroporto_escala" TEXT,
    "aeroporto_destino" TEXT,
    "transit_time_previsto_frete_internacional" INTEGER,
    "moeda_frete_internacional" TEXT DEFAULT 'USD',
    "tipo_frete_internacional" TEXT,
    "proposta_frete_internacional" TEXT,
    "valor_frete_internacional_estimado" DECIMAL(18,6),
    "valor_total_frete_internacional" DECIMAL(18,6),
    "valor_total_taxas_origem_frete_internacional" DECIMAL(18,6),
    "valor_total_taxas_destino_frete_internacional" DECIMAL(18,6),
    "tipo_volume" TEXT,
    "quantidade_total_volumes" INTEGER DEFAULT 0,
    "peso_bruto_total" DECIMAL(18,6) DEFAULT 0,
    "peso_liquido_total" DECIMAL(18,6) DEFAULT 0,
    "data_pedido" TIMESTAMP(3),
    "data_pedido_aberto" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "data_previsao_pedido" TIMESTAMP(3),
    "data_pedido_pronto" TIMESTAMP(3),
    "data_pedido_consolidado" TIMESTAMP(3),
    "data_previsao_coleta_pedido_origem" TIMESTAMP(3),
    "data_coleta_pedido_origem" TIMESTAMP(3),
    "data_previsao_entrega_pedido_origem" TIMESTAMP(3),
    "data_entrega_pedido_origem" TIMESTAMP(3),
    "data_previsao_carregamento_container" TIMESTAMP(3),
    "data_carregamento_container" TIMESTAMP(3),
    "data_previsao_coleta_embarque_origem" TIMESTAMP(3),
    "data_coleta_embarque_origem" TIMESTAMP(3),
    "data_previsao_entrega_embarque_origem" TIMESTAMP(3),
    "data_entrega_embarque_origem" TIMESTAMP(3),
    "data_previsao_coleta_container_origem" TIMESTAMP(3),
    "data_coleta_container_origem" TIMESTAMP(3),
    "data_previsao_entrega_container_origem" TIMESTAMP(3),
    "data_entrega_container_origem" TIMESTAMP(3),
    "data_previsao_embarque_origem_etd" TIMESTAMP(3),
    "data_embarque_origem" TIMESTAMP(3),
    "data_previsao_transbordo_embarque" TIMESTAMP(3),
    "data_transbordo_embarque" TIMESTAMP(3),
    "data_previsao_chegada_destino_eta" TIMESTAMP(3),
    "data_chegada_destino_eta" TIMESTAMP(3),
    "data_previsao_presenca_carga_destino" TIMESTAMP(3),
    "data_presenca_carga_destino" TIMESTAMP(3),
    "data_previsao_registro_duimp" TIMESTAMP(3),
    "data_registro_duimp" TIMESTAMP(3),
    "data_previsao_liberacao_duimp" TIMESTAMP(3),
    "data_liberacao_duimp" TIMESTAMP(3),
    "data_consulta_liberacao_duimp" TIMESTAMP(3),
    "data_previsao_registro_lpco" TIMESTAMP(3),
    "data_registro_lpco" TIMESTAMP(3),
    "data_deferimento_lpco" TIMESTAMP(3),
    "data_indeferimento_lpco" TIMESTAMP(3),
    "data_pendencia_lpco" TIMESTAMP(3),
    "data_consulta_liberacao_lpco" TIMESTAMP(3),
    "numero_certificado_origem" TEXT,
    "numero_bl" TEXT,
    "numero_mbl" TEXT,
    "numero_hbl" TEXT,
    "numero_awb" TEXT,
    "numero_mawb" TEXT,
    "numero_hawb" TEXT,
    "numero_crt" TEXT,
    "numero_cim" TEXT,
    "numero_ce_mercante" TEXT,
    "numero_presenca_carga_destino" TEXT,
    "numero_duimp" TEXT,
    "numero_nfe" TEXT,
    "chave_acesso_nfe" TEXT,
    "total_imposto_ii" DECIMAL(18,6) DEFAULT 0,
    "total_imposto_ipi" DECIMAL(18,6) DEFAULT 0,
    "total_imposto_pis" DECIMAL(18,6) DEFAULT 0,
    "total_imposto_cofins" DECIMAL(18,6) DEFAULT 0,
    "total_imposto_icms" DECIMAL(18,6) DEFAULT 0,
    "detalhes_fiscais" JSONB,
    "detalhes_logisticos" JSONB,
    "detalhes_financeiros" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tabela_processos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fatura_processo" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "tipo_fatura" TEXT NOT NULL,
    "numero_fatura" TEXT NOT NULL,
    "moeda_fatura" TEXT NOT NULL DEFAULT 'USD',
    "valor_total" DECIMAL(18,6) NOT NULL,
    "valor_pago" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "data_vencimento" TIMESTAMP(3),
    "status_pagamento" TEXT NOT NULL DEFAULT 'pendente',

    CONSTRAINT "fatura_processo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logistica_processo" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "pedido_item_id" TEXT,
    "sequencia_item" INTEGER,
    "part_number" TEXT NOT NULL,
    "ncm" TEXT NOT NULL,
    "descricao_po" TEXT NOT NULL,
    "descricao_en" TEXT,
    "quantidade" DECIMAL(18,6) NOT NULL,
    "unidade_comercializada_item" TEXT,
    "valor_unitario" DECIMAL(18,6) NOT NULL,
    "valor_total" DECIMAL(18,6) NOT NULL,
    "peso_liquido_unitario" DECIMAL(18,6),
    "peso_bruto_unitario" DECIMAL(18,6),
    "detalhes_do_produto" JSONB,

    CONSTRAINT "logistica_processo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_processo" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "container_numero" TEXT NOT NULL,
    "container_lacre" TEXT,
    "container_tipo" TEXT NOT NULL,
    "container_tara" DECIMAL(18,6),
    "container_peso_bruto" DECIMAL(18,6),
    "container_peso_liquido" DECIMAL(18,6),
    "container_metragem_cubica" DECIMAL(18,6),
    "data_devolucao_prevista" TIMESTAMP(3),
    "data_devolucao_real" TIMESTAMP(3),
    "local_devolucao" TEXT,

    CONSTRAINT "container_processo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_pedido" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT,
    "nome" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "icone" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "is_padrao" BOOLEAN NOT NULL DEFAULT false,
    "is_sistema" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_colunas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT,
    "nome" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "casas_decimais" INTEGER NOT NULL DEFAULT 2,
    "opcoes" JSONB,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "filtravel" BOOLEAN NOT NULL DEFAULT true,
    "exibida_padrao" BOOLEAN NOT NULL DEFAULT false,
    "index_criado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_colunas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferencia_coluna_pedido" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT,
    "user_id" TEXT NOT NULL,
    "colunas_visiveis" TEXT[],
    "colunas_largura" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferencia_coluna_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferencia_padrao_pedido" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT,
    "colunas_visiveis" TEXT[],
    "colunas_largura" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferencia_padrao_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aprendizado_importacao_dados" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "hash_colunas" TEXT NOT NULL,
    "mapeamento" TEXT NOT NULL,
    "uso_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aprendizado_importacao_dados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anexo_pedido" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "vinculo" TEXT NOT NULL,
    "vinculo_id" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "tipo_arquivo" TEXT NOT NULL,
    "tamanho_bytes" INTEGER NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "storage_key" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anexo_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_pedido_pdf" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "conteudo_html" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_pedido_pdf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_items_transferidos" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "pedido_origem_id" TEXT NOT NULL,
    "item_origem_id" TEXT NOT NULL,
    "cenario" TEXT NOT NULL,
    "quantidade_item_transferida" DOUBLE PRECISION NOT NULL,
    "destinos_json" TEXT NOT NULL,
    "revertido" BOOLEAN NOT NULL DEFAULT false,
    "revertido_em" TIMESTAMP(3),
    "revertido_por" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "tracking_items_transferidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coluna_usuario_pedido" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "nome" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "escopo" TEXT NOT NULL,
    "visibilidade" TEXT NOT NULL,
    "roles_permitidas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "opcoes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "descricao" TEXT,
    "valor_padrao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coluna_usuario_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valor_coluna_usuario_pedido" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "coluna_id" TEXT NOT NULL,
    "vinculo" TEXT NOT NULL,
    "vinculo_id" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "valor_coluna_usuario_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_preferencias" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "preferencias" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_preferencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_preferencias" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "widgets_json" TEXT NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_preferencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_casas_decimais" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "valor_total_pedido" INTEGER NOT NULL DEFAULT 2,
    "valor_unitario_item" INTEGER NOT NULL DEFAULT 2,
    "quantidade_total_inicial_pedido" INTEGER NOT NULL DEFAULT 2,
    "quantidade_pronta_pedido_total" INTEGER NOT NULL DEFAULT 2,
    "saldo_itens_do_pedido" INTEGER NOT NULL DEFAULT 2,
    "quantidade_transferida_total" INTEGER NOT NULL DEFAULT 2,
    "quantidade_cancelada_total_pedido" INTEGER NOT NULL DEFAULT 2,
    "peso_liquido_total_pedido" INTEGER NOT NULL DEFAULT 3,
    "peso_bruto_total_pedido" INTEGER NOT NULL DEFAULT 3,
    "cubagem_total_pedido" INTEGER NOT NULL DEFAULT 3,
    "formato_data" TEXT NOT NULL DEFAULT 'DD/MM/AAAA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_casas_decimais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_saldo_formula" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "formula_expressao" TEXT NOT NULL DEFAULT 'quantidade_total_inicial_pedido - quantidade_transferida_total - quantidade_cancelada_total_pedido',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_saldo_formula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_painel" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "is_visivel" BOOLEAN NOT NULL DEFAULT true,
    "widgets_json" TEXT NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_painel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pedido_produto_gravity_tenant_id_idx" ON "pedido_produto_gravity"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_produto_gravity_tenant_id_company_id_idx" ON "pedido_produto_gravity"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "pedido_produto_gravity_tenant_id_status_idx" ON "pedido_produto_gravity"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "pedido_produto_gravity_tenant_id_status_id_idx" ON "pedido_produto_gravity"("tenant_id", "status_id");

-- CreateIndex
CREATE INDEX "pedido_produto_gravity_tenant_id_tipo_operacao_idx" ON "pedido_produto_gravity"("tenant_id", "tipo_operacao");

-- CreateIndex
CREATE INDEX "pedido_produto_gravity_tenant_id_data_emissao_pedido_idx" ON "pedido_produto_gravity"("tenant_id", "data_emissao_pedido");

-- CreateIndex
CREATE INDEX "pedido_produto_gravity_tenant_id_deleted_at_idx" ON "pedido_produto_gravity"("tenant_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_produto_gravity_tenant_id_numero_pedido_key" ON "pedido_produto_gravity"("tenant_id", "numero_pedido");

-- CreateIndex
CREATE INDEX "pedido_itens_tenant_id_idx" ON "pedido_itens"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_itens_tenant_id_company_id_idx" ON "pedido_itens"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "pedido_itens_pedido_id_idx" ON "pedido_itens"("pedido_id");

-- CreateIndex
CREATE INDEX "tabela_processos_tenant_id_idx" ON "tabela_processos"("tenant_id");

-- CreateIndex
CREATE INDEX "tabela_processos_company_id_idx" ON "tabela_processos"("company_id");

-- CreateIndex
CREATE INDEX "tabela_processos_tenant_id_company_id_idx" ON "tabela_processos"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "fatura_processo_tenant_id_company_id_idx" ON "fatura_processo"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "fatura_processo_tenant_id_processo_id_idx" ON "fatura_processo"("tenant_id", "processo_id");

-- CreateIndex
CREATE INDEX "logistica_processo_tenant_id_company_id_idx" ON "logistica_processo"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "logistica_processo_processo_id_idx" ON "logistica_processo"("processo_id");

-- CreateIndex
CREATE INDEX "logistica_processo_pedido_item_id_idx" ON "logistica_processo"("pedido_item_id");

-- CreateIndex
CREATE INDEX "container_processo_tenant_id_company_id_idx" ON "container_processo"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "container_processo_processo_id_idx" ON "container_processo"("processo_id");

-- CreateIndex
CREATE INDEX "status_pedido_tenant_id_idx" ON "status_pedido"("tenant_id");

-- CreateIndex
CREATE INDEX "status_pedido_tenant_id_company_id_idx" ON "status_pedido"("tenant_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "status_pedido_tenant_id_nome_key" ON "status_pedido"("tenant_id", "nome");

-- CreateIndex
CREATE INDEX "pedido_colunas_tenant_id_idx" ON "pedido_colunas"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_colunas_tenant_id_company_id_idx" ON "pedido_colunas"("tenant_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_colunas_tenant_id_nome_key" ON "pedido_colunas"("tenant_id", "nome");

-- CreateIndex
CREATE INDEX "preferencia_coluna_pedido_tenant_id_idx" ON "preferencia_coluna_pedido"("tenant_id");

-- CreateIndex
CREATE INDEX "preferencia_coluna_pedido_tenant_id_user_id_idx" ON "preferencia_coluna_pedido"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "preferencia_coluna_pedido_tenant_id_user_id_key" ON "preferencia_coluna_pedido"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "preferencia_padrao_pedido_tenant_id_key" ON "preferencia_padrao_pedido"("tenant_id");

-- CreateIndex
CREATE INDEX "preferencia_padrao_pedido_tenant_id_idx" ON "preferencia_padrao_pedido"("tenant_id");

-- CreateIndex
CREATE INDEX "aprendizado_importacao_dados_tenant_id_idx" ON "aprendizado_importacao_dados"("tenant_id");

-- CreateIndex
CREATE INDEX "aprendizado_importacao_dados_tenant_id_product_id_idx" ON "aprendizado_importacao_dados"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "aprendizado_importacao_dados_tenant_id_user_id_idx" ON "aprendizado_importacao_dados"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "aprendizado_importacao_dados_tenant_id_hash_colunas_key" ON "aprendizado_importacao_dados"("tenant_id", "hash_colunas");

-- CreateIndex
CREATE INDEX "anexo_pedido_tenant_id_idx" ON "anexo_pedido"("tenant_id");

-- CreateIndex
CREATE INDEX "anexo_pedido_tenant_id_product_id_idx" ON "anexo_pedido"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "anexo_pedido_tenant_id_vinculo_id_idx" ON "anexo_pedido"("tenant_id", "vinculo_id");

-- CreateIndex
CREATE INDEX "template_pedido_pdf_tenant_id_idx" ON "template_pedido_pdf"("tenant_id");

-- CreateIndex
CREATE INDEX "template_pedido_pdf_tenant_id_product_id_idx" ON "template_pedido_pdf"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "tracking_items_transferidos_tenant_id_idx" ON "tracking_items_transferidos"("tenant_id");

-- CreateIndex
CREATE INDEX "tracking_items_transferidos_tenant_id_product_id_idx" ON "tracking_items_transferidos"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "tracking_items_transferidos_tenant_id_pedido_origem_id_idx" ON "tracking_items_transferidos"("tenant_id", "pedido_origem_id");

-- CreateIndex
CREATE INDEX "coluna_usuario_pedido_tenant_id_idx" ON "coluna_usuario_pedido"("tenant_id");

-- CreateIndex
CREATE INDEX "coluna_usuario_pedido_tenant_id_product_id_idx" ON "coluna_usuario_pedido"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "coluna_usuario_pedido_tenant_id_ativo_idx" ON "coluna_usuario_pedido"("tenant_id", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "coluna_usuario_pedido_tenant_id_chave_key" ON "coluna_usuario_pedido"("tenant_id", "chave");

-- CreateIndex
CREATE INDEX "valor_coluna_usuario_pedido_tenant_id_idx" ON "valor_coluna_usuario_pedido"("tenant_id");

-- CreateIndex
CREATE INDEX "valor_coluna_usuario_pedido_tenant_id_product_id_idx" ON "valor_coluna_usuario_pedido"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "valor_coluna_usuario_pedido_tenant_id_vinculo_id_idx" ON "valor_coluna_usuario_pedido"("tenant_id", "vinculo_id");

-- CreateIndex
CREATE UNIQUE INDEX "valor_coluna_usuario_pedido_tenant_id_coluna_id_vinculo_id_key" ON "valor_coluna_usuario_pedido"("tenant_id", "coluna_id", "vinculo_id");

-- CreateIndex
CREATE INDEX "kanban_preferencias_tenant_id_idx" ON "kanban_preferencias"("tenant_id");

-- CreateIndex
CREATE INDEX "kanban_preferencias_tenant_id_user_id_idx" ON "kanban_preferencias"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "kanban_preferencias_tenant_id_user_id_key" ON "kanban_preferencias"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "dashboard_preferencias_tenant_id_idx" ON "dashboard_preferencias"("tenant_id");

-- CreateIndex
CREATE INDEX "dashboard_preferencias_tenant_id_product_id_idx" ON "dashboard_preferencias"("tenant_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_preferencias_tenant_id_product_id_key" ON "dashboard_preferencias"("tenant_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_casas_decimais_tenant_id_key" ON "pedido_casas_decimais"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_casas_decimais_tenant_id_idx" ON "pedido_casas_decimais"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_casas_decimais_tenant_id_product_id_idx" ON "pedido_casas_decimais"("tenant_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_saldo_formula_tenant_id_key" ON "pedido_saldo_formula"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_saldo_formula_tenant_id_idx" ON "pedido_saldo_formula"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_saldo_formula_tenant_id_product_id_idx" ON "pedido_saldo_formula"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "dashboard_painel_tenant_id_idx" ON "dashboard_painel"("tenant_id");

-- CreateIndex
CREATE INDEX "dashboard_painel_tenant_id_user_id_idx" ON "dashboard_painel"("tenant_id", "user_id");

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido_produto_gravity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_processo" ADD CONSTRAINT "fatura_processo_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "tabela_processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistica_processo" ADD CONSTRAINT "logistica_processo_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_itens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistica_processo" ADD CONSTRAINT "logistica_processo_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "tabela_processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_processo" ADD CONSTRAINT "container_processo_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "tabela_processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_items_transferidos" ADD CONSTRAINT "tracking_items_transferidos_pedido_origem_id_fkey" FOREIGN KEY ("pedido_origem_id") REFERENCES "pedido_produto_gravity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valor_coluna_usuario_pedido" ADD CONSTRAINT "valor_coluna_usuario_pedido_coluna_id_fkey" FOREIGN KEY ("coluna_id") REFERENCES "coluna_usuario_pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

