-- =============================================================================
-- FASE 06B — Cadastros Snapshots + Datas de Etapa + Tipo Documento Anexo
-- =============================================================================
-- Limpeza cirúrgica manual: removidos TODOS os DROP TABLE, DROP TYPE e
-- DROP FOREIGN KEY gerados pelo `prisma migrate diff` por contaminação do
-- banco físico monolítico `gravity-servicos-teste` (que hospeda tabelas de
-- serviços tenant além das tabelas do Pedido). A limpeza mantém apenas os
-- deltas legítimos da Fase 2:
--   1. ALTER TABLE anexo_pedido — novo campo tipo_documento
--   2. ALTER TABLE pedido_produto_gravity — 44 novas colunas (datas + cobertura + volumes)
--   3. ALTER TABLE tracking_items_transferidos — data_transferencia_qtd
--   4. CREATE TABLE pedido_snapshot_empresa
--   5. CREATE TABLE pedido_snapshot_ope (inclui cnpj_raiz_empresa)
--   6. CREATE TABLE pedido_config_atualizacao_cadastros
--   7. CREATE INDEX para as 3 novas tabelas + índice composto em anexo_pedido
--   8. AddForeignKey dos snapshots → pedido_produto_gravity (ON DELETE CASCADE)
-- =============================================================================

-- AlterTable
ALTER TABLE "anexo_pedido" ADD COLUMN     "tipo_documento" TEXT;

-- AlterTable
ALTER TABLE "pedido_produto_gravity" ADD COLUMN     "cobertura_cambial_pedido" TEXT,
ADD COLUMN     "data_conf_aprovacao_draft_invoice" TIMESTAMP(3),
ADD COLUMN     "data_conf_aprovacao_draft_pedido" TIMESTAMP(3),
ADD COLUMN     "data_conf_aprovacao_draft_proforma" TIMESTAMP(3),
ADD COLUMN     "data_conf_envio_original_invoice" TIMESTAMP(3),
ADD COLUMN     "data_conf_envio_original_proforma" TIMESTAMP(3),
ADD COLUMN     "data_conf_recebimento_draft_invoice" TIMESTAMP(3),
ADD COLUMN     "data_conf_recebimento_draft_pedido" TIMESTAMP(3),
ADD COLUMN     "data_conf_recebimento_draft_proforma" TIMESTAMP(3),
ADD COLUMN     "data_conf_recebimento_original_invoice" TIMESTAMP(3),
ADD COLUMN     "data_conf_recebimento_original_proforma" TIMESTAMP(3),
ADD COLUMN     "data_confirmada_coleta_pedido" TIMESTAMP(3),
ADD COLUMN     "data_confirmada_inspecao_pedido" TIMESTAMP(3),
ADD COLUMN     "data_confirmada_pedido_pronto" TIMESTAMP(3),
ADD COLUMN     "data_documento_invoice" TIMESTAMP(3),
ADD COLUMN     "data_documento_pedido" TIMESTAMP(3),
ADD COLUMN     "data_documento_proforma" TIMESTAMP(3),
ADD COLUMN     "data_meta_aprovacao_draft_invoice" TIMESTAMP(3),
ADD COLUMN     "data_meta_aprovacao_draft_pedido" TIMESTAMP(3),
ADD COLUMN     "data_meta_aprovacao_draft_proforma" TIMESTAMP(3),
ADD COLUMN     "data_meta_coleta_pedido" TIMESTAMP(3),
ADD COLUMN     "data_meta_envio_original_invoice" TIMESTAMP(3),
ADD COLUMN     "data_meta_envio_original_proforma" TIMESTAMP(3),
ADD COLUMN     "data_meta_inspecao_pedido" TIMESTAMP(3),
ADD COLUMN     "data_meta_pedido_pronto" TIMESTAMP(3),
ADD COLUMN     "data_meta_recebimento_draft_invoice" TIMESTAMP(3),
ADD COLUMN     "data_meta_recebimento_draft_pedido" TIMESTAMP(3),
ADD COLUMN     "data_meta_recebimento_draft_proforma" TIMESTAMP(3),
ADD COLUMN     "data_meta_recebimento_original_invoice" TIMESTAMP(3),
ADD COLUMN     "data_meta_recebimento_original_proforma" TIMESTAMP(3),
ADD COLUMN     "data_prev_aprovacao_draft_invoice" TIMESTAMP(3),
ADD COLUMN     "data_prev_aprovacao_draft_pedido" TIMESTAMP(3),
ADD COLUMN     "data_prev_aprovacao_draft_proforma" TIMESTAMP(3),
ADD COLUMN     "data_prev_envio_original_invoice" TIMESTAMP(3),
ADD COLUMN     "data_prev_envio_original_proforma" TIMESTAMP(3),
ADD COLUMN     "data_prev_recebimento_draft_invoice" TIMESTAMP(3),
ADD COLUMN     "data_prev_recebimento_draft_pedido" TIMESTAMP(3),
ADD COLUMN     "data_prev_recebimento_draft_proforma" TIMESTAMP(3),
ADD COLUMN     "data_prev_recebimento_original_invoice" TIMESTAMP(3),
ADD COLUMN     "data_prev_recebimento_original_proforma" TIMESTAMP(3),
ADD COLUMN     "data_prevista_coleta_pedido" TIMESTAMP(3),
ADD COLUMN     "data_prevista_inspecao_pedido" TIMESTAMP(3),
ADD COLUMN     "data_prevista_pedido_pronto" TIMESTAMP(3),
ADD COLUMN     "quantidade_volumes_pedido" INTEGER;

-- AlterTable
ALTER TABLE "tracking_items_transferidos" ADD COLUMN     "data_transferencia_qtd" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "pedido_snapshot_empresa" (
    "id" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT,
    "id_pedido" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "suid_empresa" TEXT NOT NULL,
    "nome_empresa" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "documento_principal" TEXT NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "cnpj_raiz" TEXT,
    "endereco_logradouro" TEXT,
    "endereco_numero" TEXT,
    "endereco_complemento" TEXT,
    "endereco_bairro" TEXT,
    "endereco_cidade" TEXT,
    "endereco_uf" TEXT,
    "endereco_cep" TEXT,
    "endereco_pais" TEXT,
    "contato_nome" TEXT,
    "contato_email" TEXT,
    "contato_whatsapp" TEXT,
    "contato_cargo" TEXT,
    "contato_departamento" TEXT,
    "exportador_e_fabricante" BOOLEAN,
    "relacao_exportador_fabricante" TEXT,
    "congelado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo_congelamento" TEXT NOT NULL,

    CONSTRAINT "pedido_snapshot_empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_snapshot_ope" (
    "id" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT,
    "id_pedido" TEXT NOT NULL,
    "codigo_ope" TEXT NOT NULL,
    "versao_ope" TEXT,
    "situacao_ope" TEXT,
    "nome_ope" TEXT,
    "cnpj_raiz_empresa" TEXT,
    "pais_ope" TEXT,
    "estado_ope" TEXT,
    "cidade_ope" TEXT,
    "endereco_ope" TEXT,
    "zip_ope" TEXT,
    "tin_ope" TEXT,
    "email_ope" TEXT,
    "congelado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo_congelamento" TEXT NOT NULL,

    CONSTRAINT "pedido_snapshot_ope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_config_atualizacao_cadastros" (
    "id" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_workspace" TEXT NOT NULL,
    "atualiza_importador" BOOLEAN NOT NULL DEFAULT false,
    "atualiza_exportador" BOOLEAN NOT NULL DEFAULT false,
    "atualiza_fabricante" BOOLEAN NOT NULL DEFAULT false,
    "atualiza_agente" BOOLEAN NOT NULL DEFAULT false,
    "atualiza_despachante" BOOLEAN NOT NULL DEFAULT false,
    "atualiza_armador" BOOLEAN NOT NULL DEFAULT false,
    "atualiza_ope" BOOLEAN NOT NULL DEFAULT false,
    "resnap_em_emissao" BOOLEAN NOT NULL DEFAULT true,
    "resnap_em_embarque" BOOLEAN NOT NULL DEFAULT false,
    "resnap_em_desembaraco" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_config_atualizacao_cadastros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pedido_snapshot_empresa_id_organizacao_idx" ON "pedido_snapshot_empresa"("id_organizacao");

-- CreateIndex
CREATE INDEX "pedido_snapshot_empresa_id_organizacao_id_pedido_idx" ON "pedido_snapshot_empresa"("id_organizacao", "id_pedido");

-- CreateIndex
CREATE INDEX "pedido_snapshot_empresa_id_organizacao_suid_empresa_idx" ON "pedido_snapshot_empresa"("id_organizacao", "suid_empresa");

-- CreateIndex
CREATE INDEX "pedido_snapshot_empresa_id_organizacao_papel_idx" ON "pedido_snapshot_empresa"("id_organizacao", "papel");

-- CreateIndex
CREATE INDEX "pedido_snapshot_ope_id_organizacao_idx" ON "pedido_snapshot_ope"("id_organizacao");

-- CreateIndex
CREATE INDEX "pedido_snapshot_ope_id_organizacao_id_pedido_idx" ON "pedido_snapshot_ope"("id_organizacao", "id_pedido");

-- CreateIndex
CREATE INDEX "pedido_snapshot_ope_id_organizacao_codigo_ope_idx" ON "pedido_snapshot_ope"("id_organizacao", "codigo_ope");

-- CreateIndex
CREATE INDEX "pedido_config_atualizacao_cadastros_id_organizacao_idx" ON "pedido_config_atualizacao_cadastros"("id_organizacao");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_config_atualizacao_cadastros_id_organizacao_id_works_key" ON "pedido_config_atualizacao_cadastros"("id_organizacao", "id_workspace");

-- CreateIndex
CREATE INDEX "anexo_pedido_tenant_id_tipo_documento_idx" ON "anexo_pedido"("tenant_id", "tipo_documento");

-- AddForeignKey
ALTER TABLE "pedido_snapshot_empresa" ADD CONSTRAINT "pedido_snapshot_empresa_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido_produto_gravity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_snapshot_ope" ADD CONSTRAINT "pedido_snapshot_ope_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido_produto_gravity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
