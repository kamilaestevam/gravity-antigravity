-- CreateTable
CREATE TABLE "pedidos_comerciais" (
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
    "casas_decimais_total_pedido" INTEGER NOT NULL DEFAULT 2,
    "quantidade_total_pedido" DOUBLE PRECISION,
    "casas_decimais_quantidade_total_pedido" INTEGER NOT NULL DEFAULT 2,
    "unidade_comercializada_pedido" TEXT,
    "cobertura_cambial" TEXT NOT NULL DEFAULT 'com_cobertura',
    "condicao_pagamento" TEXT,
    "numero_proforma" TEXT,
    "numero_invoice" TEXT,
    "referencia_importador" TEXT,
    "referencia_exportador" TEXT,
    "referencia_fabricante" TEXT,
    "valor_total_cambio" DECIMAL(18,6),
    "moeda_cambio" TEXT,
    "taxa_cambio_estimada" DECIMAL(18,6),
    "contrato_cambio_id" TEXT,
    "data_emissao_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalhes_operacionais" JSONB,
    "campos_custom" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_comerciais_pkey" PRIMARY KEY ("id")
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
    "casas_decimais_total_item" INTEGER NOT NULL DEFAULT 2,
    "campos_custom" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processos_logisticos" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "estimativa_custo_id" TEXT,
    "cotacao_frete_id" TEXT,
    "status_embarque" TEXT NOT NULL DEFAULT 'aberto',
    "tipo_operacao" TEXT NOT NULL,
    "referencia_processo" TEXT,
    "numero_processo" TEXT,
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

    CONSTRAINT "processos_logisticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processo_faturas" (
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

    CONSTRAINT "processo_faturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processo_itens" (
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

    CONSTRAINT "processo_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processo_containers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "numero_container" TEXT NOT NULL,
    "numero_lacre" TEXT,
    "tipo_container" TEXT NOT NULL,
    "tara" DECIMAL(18,6),
    "peso_bruto" DECIMAL(18,6),
    "data_devolucao_prevista" TIMESTAMP(3),
    "data_devolucao_real" TIMESTAMP(3),
    "local_devolucao" TEXT,

    CONSTRAINT "processo_containers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_status" (
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

    CONSTRAINT "pedido_status_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "pedido_preferencias_usuario" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT,
    "user_id" TEXT NOT NULL,
    "colunas_visiveis" TEXT[],
    "colunas_largura" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_preferencias_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_preferencias_padrao" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT,
    "colunas_visiveis" TEXT[],
    "colunas_largura" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_preferencias_padrao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mapeamento_import" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "hash_colunas" TEXT NOT NULL,
    "mapeamento" TEXT NOT NULL,
    "uso_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mapeamento_import_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_anexos" (
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

    CONSTRAINT "pedido_anexos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_templates_pdf" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "conteudo_html" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_templates_pdf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_historico" (
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

    CONSTRAINT "transfer_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colunas_usuario_pedido" (
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

    CONSTRAINT "colunas_usuario_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valores_colunas_usuario_pedido" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT,
    "coluna_id" TEXT NOT NULL,
    "vinculo" TEXT NOT NULL,
    "vinculo_id" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "valores_colunas_usuario_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pedidos_comerciais_tenant_id_idx" ON "pedidos_comerciais"("tenant_id");

-- CreateIndex
CREATE INDEX "pedidos_comerciais_tenant_id_company_id_idx" ON "pedidos_comerciais"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "pedidos_comerciais_tenant_id_status_idx" ON "pedidos_comerciais"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "pedidos_comerciais_tenant_id_status_id_idx" ON "pedidos_comerciais"("tenant_id", "status_id");

-- CreateIndex
CREATE INDEX "pedidos_comerciais_tenant_id_tipo_operacao_idx" ON "pedidos_comerciais"("tenant_id", "tipo_operacao");

-- CreateIndex
CREATE INDEX "pedidos_comerciais_tenant_id_data_emissao_pedido_idx" ON "pedidos_comerciais"("tenant_id", "data_emissao_pedido");

-- CreateIndex
CREATE INDEX "pedido_itens_tenant_id_idx" ON "pedido_itens"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_itens_tenant_id_company_id_idx" ON "pedido_itens"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "pedido_itens_pedido_id_idx" ON "pedido_itens"("pedido_id");

-- CreateIndex
CREATE INDEX "processos_logisticos_tenant_id_idx" ON "processos_logisticos"("tenant_id");

-- CreateIndex
CREATE INDEX "processos_logisticos_company_id_idx" ON "processos_logisticos"("company_id");

-- CreateIndex
CREATE INDEX "processos_logisticos_tenant_id_company_id_idx" ON "processos_logisticos"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "processo_faturas_tenant_id_company_id_idx" ON "processo_faturas"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "processo_faturas_tenant_id_processo_id_idx" ON "processo_faturas"("tenant_id", "processo_id");

-- CreateIndex
CREATE INDEX "processo_itens_tenant_id_company_id_idx" ON "processo_itens"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "processo_itens_processo_id_idx" ON "processo_itens"("processo_id");

-- CreateIndex
CREATE INDEX "processo_itens_pedido_item_id_idx" ON "processo_itens"("pedido_item_id");

-- CreateIndex
CREATE INDEX "processo_containers_tenant_id_company_id_idx" ON "processo_containers"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "processo_containers_processo_id_idx" ON "processo_containers"("processo_id");

-- CreateIndex
CREATE INDEX "pedido_status_tenant_id_idx" ON "pedido_status"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_status_tenant_id_company_id_idx" ON "pedido_status"("tenant_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_status_tenant_id_nome_key" ON "pedido_status"("tenant_id", "nome");

-- CreateIndex
CREATE INDEX "pedido_colunas_tenant_id_idx" ON "pedido_colunas"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_colunas_tenant_id_company_id_idx" ON "pedido_colunas"("tenant_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_colunas_tenant_id_nome_key" ON "pedido_colunas"("tenant_id", "nome");

-- CreateIndex
CREATE INDEX "pedido_preferencias_usuario_tenant_id_idx" ON "pedido_preferencias_usuario"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_preferencias_usuario_tenant_id_user_id_idx" ON "pedido_preferencias_usuario"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_preferencias_usuario_tenant_id_user_id_key" ON "pedido_preferencias_usuario"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "pedido_preferencias_padrao_tenant_id_idx" ON "pedido_preferencias_padrao"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_preferencias_padrao_tenant_id_key" ON "pedido_preferencias_padrao"("tenant_id");

-- CreateIndex
CREATE INDEX "mapeamento_import_tenant_id_idx" ON "mapeamento_import"("tenant_id");

-- CreateIndex
CREATE INDEX "mapeamento_import_tenant_id_product_id_idx" ON "mapeamento_import"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "mapeamento_import_tenant_id_user_id_idx" ON "mapeamento_import"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mapeamento_import_tenant_id_hash_colunas_key" ON "mapeamento_import"("tenant_id", "hash_colunas");

-- CreateIndex
CREATE INDEX "pedido_anexos_tenant_id_idx" ON "pedido_anexos"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_anexos_tenant_id_product_id_idx" ON "pedido_anexos"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "pedido_anexos_tenant_id_vinculo_id_idx" ON "pedido_anexos"("tenant_id", "vinculo_id");

-- CreateIndex
CREATE INDEX "pedido_templates_pdf_tenant_id_idx" ON "pedido_templates_pdf"("tenant_id");

-- CreateIndex
CREATE INDEX "pedido_templates_pdf_tenant_id_product_id_idx" ON "pedido_templates_pdf"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "transfer_historico_tenant_id_idx" ON "transfer_historico"("tenant_id");

-- CreateIndex
CREATE INDEX "transfer_historico_tenant_id_product_id_idx" ON "transfer_historico"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "transfer_historico_tenant_id_pedido_origem_id_idx" ON "transfer_historico"("tenant_id", "pedido_origem_id");

-- CreateIndex
CREATE INDEX "colunas_usuario_pedido_tenant_id_idx" ON "colunas_usuario_pedido"("tenant_id");

-- CreateIndex
CREATE INDEX "colunas_usuario_pedido_tenant_id_product_id_idx" ON "colunas_usuario_pedido"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "colunas_usuario_pedido_tenant_id_ativo_idx" ON "colunas_usuario_pedido"("tenant_id", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "colunas_usuario_pedido_tenant_id_chave_key" ON "colunas_usuario_pedido"("tenant_id", "chave");

-- CreateIndex
CREATE INDEX "valores_colunas_usuario_pedido_tenant_id_idx" ON "valores_colunas_usuario_pedido"("tenant_id");

-- CreateIndex
CREATE INDEX "valores_colunas_usuario_pedido_tenant_id_product_id_idx" ON "valores_colunas_usuario_pedido"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "valores_colunas_usuario_pedido_tenant_id_vinculo_id_idx" ON "valores_colunas_usuario_pedido"("tenant_id", "vinculo_id");

-- CreateIndex
CREATE UNIQUE INDEX "valores_colunas_usuario_pedido_tenant_id_coluna_id_vinculo__key" ON "valores_colunas_usuario_pedido"("tenant_id", "coluna_id", "vinculo_id");

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos_comerciais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processo_faturas" ADD CONSTRAINT "processo_faturas_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos_logisticos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processo_itens" ADD CONSTRAINT "processo_itens_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos_logisticos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processo_itens" ADD CONSTRAINT "processo_itens_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_itens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processo_containers" ADD CONSTRAINT "processo_containers_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos_logisticos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_historico" ADD CONSTRAINT "transfer_historico_pedido_origem_id_fkey" FOREIGN KEY ("pedido_origem_id") REFERENCES "pedidos_comerciais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valores_colunas_usuario_pedido" ADD CONSTRAINT "valores_colunas_usuario_pedido_coluna_id_fkey" FOREIGN KEY ("coluna_id") REFERENCES "colunas_usuario_pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
