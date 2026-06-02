-- Migration: schema DDD Processo híbrido
-- Substitui schema legado (monólito + mini-pedido) pelo modelo acordado em 2026-06-01.
-- Banco dedicado gravity-processo-* — sem dados produtivos no legado.

-- ─── Remover legado ───────────────────────────────────────────────────────────
DROP TABLE IF EXISTS "pedido_item" CASCADE;
DROP TABLE IF EXISTS "pedidos" CASCADE;
DROP TABLE IF EXISTS "pedido_preferencias_padrao" CASCADE;
DROP TABLE IF EXISTS "pedido_preferencias_usuario" CASCADE;
DROP TABLE IF EXISTS "pedido_colunas" CASCADE;
DROP TABLE IF EXISTS "pedido_status" CASCADE;
DROP TABLE IF EXISTS "processo_etapas" CASCADE;
DROP TABLE IF EXISTS "dados_tecnicos" CASCADE;
DROP TABLE IF EXISTS "estimativas_custo" CASCADE;
DROP TABLE IF EXISTS "documentos" CASCADE;
DROP TABLE IF EXISTS "follow_ups" CASCADE;
DROP TABLE IF EXISTS "processos" CASCADE;

-- ─── processo_status ────────────────────────────────────────────────────────
CREATE TABLE "processo_status" (
    "id_processo_status" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "tipo_status_processo" TEXT NOT NULL,
    "rotulo_status_processo" TEXT NOT NULL,
    "cor_status_processo" TEXT NOT NULL DEFAULT '#6366F1',
    "ordem_status_processo" INTEGER NOT NULL DEFAULT 0,
    "regras_status_processo" JSONB,
    "eh_padrao_status_processo" BOOLEAN NOT NULL DEFAULT false,
    "eh_sistema_status_processo" BOOLEAN NOT NULL DEFAULT false,
    "data_criacao_processo_status" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_processo_status" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processo_status_pkey" PRIMARY KEY ("id_processo_status")
);

CREATE UNIQUE INDEX "processo_status_id_organizacao_tipo_status_processo_key" ON "processo_status"("id_organizacao", "tipo_status_processo");
CREATE INDEX "processo_status_id_organizacao_idx" ON "processo_status"("id_organizacao");
CREATE INDEX "processo_status_id_organizacao_id_produto_gravity_idx" ON "processo_status"("id_organizacao", "id_produto_gravity");
CREATE INDEX "processo_status_id_organizacao_ordem_status_processo_idx" ON "processo_status"("id_organizacao", "ordem_status_processo");

-- ─── processo ───────────────────────────────────────────────────────────────
CREATE TABLE "processo" (
    "id_processo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_usuario" TEXT,
    "numero_processo" TEXT NOT NULL,
    "tipo_operacao_processo" TEXT NOT NULL,
    "referencia_interna_processo" TEXT,
    "referencia_importador_processo" TEXT,
    "referencia_exportador_processo" TEXT,
    "id_status_atual_processo" TEXT,
    "id_importacao_exportador_processo" TEXT,
    "id_exportacao_importador_processo" TEXT,
    "id_cotacao_bid_frete_internacional" TEXT,
    "id_proposta_bid_frete_internacional" TEXT,
    "id_transito_processo" TEXT,
    "id_operacao_cambio_processo" TEXT,
    "id_responsavel_processo" TEXT,
    "responsavel_rotina_processo" TEXT,
    "setor_responsavel_processo" TEXT,
    "vendedor_responsavel_processo" TEXT,
    "data_criacao_processo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_processo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processo_pkey" PRIMARY KEY ("id_processo")
);

CREATE INDEX "processo_id_organizacao_idx" ON "processo"("id_organizacao");
CREATE INDEX "processo_id_organizacao_id_produto_gravity_idx" ON "processo"("id_organizacao", "id_produto_gravity");
CREATE INDEX "processo_id_organizacao_id_usuario_idx" ON "processo"("id_organizacao", "id_usuario");
CREATE INDEX "processo_id_organizacao_id_workspace_idx" ON "processo"("id_organizacao", "id_workspace");
CREATE INDEX "processo_id_organizacao_numero_processo_idx" ON "processo"("id_organizacao", "numero_processo");
CREATE INDEX "processo_id_organizacao_id_status_atual_processo_idx" ON "processo"("id_organizacao", "id_status_atual_processo");
CREATE INDEX "processo_id_organizacao_tipo_operacao_processo_idx" ON "processo"("id_organizacao", "tipo_operacao_processo");

ALTER TABLE "processo" ADD CONSTRAINT "processo_id_status_atual_processo_fkey" FOREIGN KEY ("id_status_atual_processo") REFERENCES "processo_status"("id_processo_status") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── historico_status_processo ──────────────────────────────────────────────
CREATE TABLE "historico_status_processo" (
    "id_historico_status_processo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_processo" TEXT NOT NULL,
    "id_status_anterior_processo" TEXT,
    "id_status_novo_processo" TEXT NOT NULL,
    "id_usuario_mudanca_status_processo" TEXT,
    "data_mudanca_status_processo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao_mudanca_status_processo" TEXT,

    CONSTRAINT "historico_status_processo_pkey" PRIMARY KEY ("id_historico_status_processo")
);

CREATE INDEX "historico_status_processo_id_organizacao_idx" ON "historico_status_processo"("id_organizacao");
CREATE INDEX "historico_status_processo_id_organizacao_id_produto_gravity_idx" ON "historico_status_processo"("id_organizacao", "id_produto_gravity");
CREATE INDEX "historico_status_processo_id_organizacao_id_processo_idx" ON "historico_status_processo"("id_organizacao", "id_processo");
CREATE INDEX "historico_status_processo_id_organizacao_data_mudanca_status_processo_idx" ON "historico_status_processo"("id_organizacao", "data_mudanca_status_processo");

ALTER TABLE "historico_status_processo" ADD CONSTRAINT "historico_status_processo_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "processo"("id_processo") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "historico_status_processo" ADD CONSTRAINT "historico_status_processo_id_status_anterior_processo_fkey" FOREIGN KEY ("id_status_anterior_processo") REFERENCES "processo_status"("id_processo_status") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "historico_status_processo" ADD CONSTRAINT "historico_status_processo_id_status_novo_processo_fkey" FOREIGN KEY ("id_status_novo_processo") REFERENCES "processo_status"("id_processo_status") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── logistica_internacional_processo ─────────────────────────────────────────
CREATE TABLE "logistica_internacional_processo" (
    "id_logistica_internacional_processo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_processo" TEXT NOT NULL,
    "modal_frete_internacional_processo" TEXT,
    "tipo_frete_internacional_processo" TEXT,
    "tipo_volume_processo" TEXT,
    "incoterm_processo" TEXT,
    "porto_origem_processo" TEXT,
    "porto_destino_processo" TEXT,
    "porto_transbordo_processo" TEXT,
    "aeroporto_origem_processo" TEXT,
    "aeroporto_destino_processo" TEXT,
    "aeroporto_escala_processo" TEXT,
    "id_agente_carga" TEXT,
    "id_armador" TEXT,
    "id_cia_aerea" TEXT,
    "id_transportador_rodo_internacional" TEXT,
    "id_transportador_rodo_nacional" TEXT,
    "id_transportador_ferroviario" TEXT,
    "id_despachante" TEXT,
    "id_armazem_alfandegado" TEXT,
    "id_seguradora_internacional" TEXT,
    "data_criacao_logistica_internacional_processo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_logistica_internacional_processo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logistica_internacional_processo_pkey" PRIMARY KEY ("id_logistica_internacional_processo")
);

CREATE UNIQUE INDEX "logistica_internacional_processo_id_processo_key" ON "logistica_internacional_processo"("id_processo");
CREATE INDEX "logistica_internacional_processo_id_organizacao_idx" ON "logistica_internacional_processo"("id_organizacao");
CREATE INDEX "logistica_internacional_processo_id_organizacao_id_produto_gravity_idx" ON "logistica_internacional_processo"("id_organizacao", "id_produto_gravity");
CREATE INDEX "logistica_internacional_processo_id_organizacao_id_processo_idx" ON "logistica_internacional_processo"("id_organizacao", "id_processo");

ALTER TABLE "logistica_internacional_processo" ADD CONSTRAINT "logistica_internacional_processo_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "processo"("id_processo") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── dados_processo ─────────────────────────────────────────────────────────
CREATE TABLE "dados_processo" (
    "id_dados_processo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_processo" TEXT NOT NULL,
    "canal_parametrizacao_processo" TEXT,
    "numero_duimp_processo" TEXT,
    "numero_nfe_processo" TEXT,
    "chave_acesso_nfe_processo" TEXT,
    "data_registro_duimp_processo" TIMESTAMP(3),
    "data_liberacao_duimp_processo" TIMESTAMP(3),
    "data_consulta_liberacao_duimp_processo" TIMESTAMP(3),
    "data_previsao_registro_duimp_processo" TIMESTAMP(3),
    "data_previsao_liberacao_duimp_processo" TIMESTAMP(3),
    "data_registro_lpco_processo" TIMESTAMP(3),
    "data_deferimento_lpco_processo" TIMESTAMP(3),
    "data_indeferimento_lpco_processo" TIMESTAMP(3),
    "data_pendencia_lpco_processo" TIMESTAMP(3),
    "data_consulta_liberacao_lpco_processo" TIMESTAMP(3),
    "data_previsao_registro_lpco_processo" TIMESTAMP(3),
    "data_criacao_dados_processo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_dados_processo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dados_processo_pkey" PRIMARY KEY ("id_dados_processo")
);

CREATE UNIQUE INDEX "dados_processo_id_processo_key" ON "dados_processo"("id_processo");
CREATE INDEX "dados_processo_id_organizacao_idx" ON "dados_processo"("id_organizacao");
CREATE INDEX "dados_processo_id_organizacao_id_produto_gravity_idx" ON "dados_processo"("id_organizacao", "id_produto_gravity");
CREATE INDEX "dados_processo_id_organizacao_id_processo_idx" ON "dados_processo"("id_organizacao", "id_processo");

ALTER TABLE "dados_processo" ADD CONSTRAINT "dados_processo_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "processo"("id_processo") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── cambio_processo ─────────────────────────────────────────────────────────
CREATE TABLE "cambio_processo" (
    "id_cambio_processo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_processo" TEXT NOT NULL,
    "id_banco_processo" TEXT,
    "id_corretora_cambio_processo" TEXT,
    "data_criacao_cambio_processo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_cambio_processo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambio_processo_pkey" PRIMARY KEY ("id_cambio_processo")
);

CREATE UNIQUE INDEX "cambio_processo_id_processo_key" ON "cambio_processo"("id_processo");
CREATE INDEX "cambio_processo_id_organizacao_idx" ON "cambio_processo"("id_organizacao");
CREATE INDEX "cambio_processo_id_organizacao_id_produto_gravity_idx" ON "cambio_processo"("id_organizacao", "id_produto_gravity");
CREATE INDEX "cambio_processo_id_organizacao_id_processo_idx" ON "cambio_processo"("id_organizacao", "id_processo");

ALTER TABLE "cambio_processo" ADD CONSTRAINT "cambio_processo_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "processo"("id_processo") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── estimativa_processo ─────────────────────────────────────────────────────
CREATE TABLE "estimativa_processo" (
    "id_estimativa_processo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_processo" TEXT NOT NULL,
    "total_imposto_ii_processo" DECIMAL(18,6),
    "total_imposto_ipi_processo" DECIMAL(18,6),
    "total_imposto_pis_processo" DECIMAL(18,6),
    "total_imposto_cofins_processo" DECIMAL(18,6),
    "total_imposto_icms_processo" DECIMAL(18,6),
    "valor_frete_estimado_processo" DECIMAL(18,6),
    "valor_despacho_estimado_processo" DECIMAL(18,6),
    "valor_outros_estimado_processo" DECIMAL(18,6),
    "valor_total_estimado_processo" DECIMAL(18,6),
    "moeda_estimativa_processo" TEXT NOT NULL DEFAULT 'BRL',
    "data_criacao_estimativa_processo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_estimativa_processo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimativa_processo_pkey" PRIMARY KEY ("id_estimativa_processo")
);

CREATE UNIQUE INDEX "estimativa_processo_id_processo_key" ON "estimativa_processo"("id_processo");
CREATE INDEX "estimativa_processo_id_organizacao_idx" ON "estimativa_processo"("id_organizacao");
CREATE INDEX "estimativa_processo_id_organizacao_id_produto_gravity_idx" ON "estimativa_processo"("id_organizacao", "id_produto_gravity");
CREATE INDEX "estimativa_processo_id_organizacao_id_processo_idx" ON "estimativa_processo"("id_organizacao", "id_processo");

ALTER TABLE "estimativa_processo" ADD CONSTRAINT "estimativa_processo_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "processo"("id_processo") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── documento_processo ────────────────────────────────────────────────────────
CREATE TABLE "documento_processo" (
    "id_documento_processo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_usuario" TEXT,
    "id_processo" TEXT NOT NULL,
    "nome_documento_processo" TEXT NOT NULL,
    "tipo_arquivo_documento_processo" TEXT NOT NULL,
    "tamanho_bytes_documento_processo" INTEGER NOT NULL DEFAULT 0,
    "url_documento_processo" TEXT NOT NULL,
    "categoria_documento_processo" TEXT NOT NULL DEFAULT 'outro',
    "numero_bl_processo" TEXT,
    "numero_hawb_processo" TEXT,
    "numero_mawb_processo" TEXT,
    "numero_awb_processo" TEXT,
    "numero_hbl_processo" TEXT,
    "numero_mbl_processo" TEXT,
    "numero_ce_mercante_processo" TEXT,
    "numero_certificado_origem_processo" TEXT,
    "numero_cim_processo" TEXT,
    "numero_crt_processo" TEXT,
    "numero_presenca_carga_destino_processo" TEXT,
    "data_criacao_documento_processo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_processo_pkey" PRIMARY KEY ("id_documento_processo")
);

CREATE INDEX "documento_processo_id_organizacao_idx" ON "documento_processo"("id_organizacao");
CREATE INDEX "documento_processo_id_organizacao_id_produto_gravity_idx" ON "documento_processo"("id_organizacao", "id_produto_gravity");
CREATE INDEX "documento_processo_id_organizacao_id_processo_idx" ON "documento_processo"("id_organizacao", "id_processo");
CREATE INDEX "documento_processo_id_organizacao_categoria_documento_processo_idx" ON "documento_processo"("id_organizacao", "categoria_documento_processo");

ALTER TABLE "documento_processo" ADD CONSTRAINT "documento_processo_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "processo"("id_processo") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── container_processo ───────────────────────────────────────────────────────
CREATE TABLE "container_processo" (
    "id_processo_container" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_processo" TEXT NOT NULL,
    "container_numero_processo_container" TEXT NOT NULL,
    "container_tipo_processo_container" TEXT,
    "container_lacre_processo_container" TEXT,
    "container_tara_processo_container" DECIMAL(18,6),
    "container_peso_bruto_processo_container" DECIMAL(18,6),
    "container_peso_liquido_processo_container" DECIMAL(18,6),
    "container_metragem_cubica_processo_container" DECIMAL(18,6),
    "local_devolucao_processo_container" TEXT,
    "data_devolucao_prevista_processo_container" TIMESTAMP(3),
    "data_devolucao_real_processo_container" TIMESTAMP(3),
    "data_criacao_container_processo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_container_processo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "container_processo_pkey" PRIMARY KEY ("id_processo_container")
);

CREATE INDEX "container_processo_id_organizacao_idx" ON "container_processo"("id_organizacao");
CREATE INDEX "container_processo_id_organizacao_id_produto_gravity_idx" ON "container_processo"("id_organizacao", "id_produto_gravity");
CREATE INDEX "container_processo_id_organizacao_id_processo_idx" ON "container_processo"("id_organizacao", "id_processo");

ALTER TABLE "container_processo" ADD CONSTRAINT "container_processo_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "processo"("id_processo") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── follow_up_processo ───────────────────────────────────────────────────────
CREATE TABLE "follow_up_processo" (
    "id_follow_up_processo" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT,
    "id_usuario" TEXT,
    "id_processo" TEXT NOT NULL,
    "titulo_follow_up_processo" TEXT NOT NULL,
    "descricao_follow_up_processo" TEXT,
    "tipo_follow_up_processo" TEXT NOT NULL DEFAULT 'info',
    "categoria_follow_up_processo" TEXT NOT NULL DEFAULT 'sistema',
    "id_usuario_registro_follow_up_processo" TEXT,
    "nome_usuario_registro_follow_up_processo" TEXT,
    "data_criacao_follow_up_processo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_up_processo_pkey" PRIMARY KEY ("id_follow_up_processo")
);

CREATE INDEX "follow_up_processo_id_organizacao_idx" ON "follow_up_processo"("id_organizacao");
CREATE INDEX "follow_up_processo_id_organizacao_id_produto_gravity_idx" ON "follow_up_processo"("id_organizacao", "id_produto_gravity");
CREATE INDEX "follow_up_processo_id_organizacao_id_processo_idx" ON "follow_up_processo"("id_organizacao", "id_processo");

ALTER TABLE "follow_up_processo" ADD CONSTRAINT "follow_up_processo_id_processo_fkey" FOREIGN KEY ("id_processo") REFERENCES "processo"("id_processo") ON DELETE CASCADE ON UPDATE CASCADE;
