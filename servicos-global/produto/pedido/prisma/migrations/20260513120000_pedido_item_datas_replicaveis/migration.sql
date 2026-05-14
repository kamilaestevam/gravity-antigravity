-- Migration: pedido_item_datas_replicaveis (2026-05-13)
--
-- Contexto: a feature "Replicar valor do Pai em todos os Itens" (entregue
-- em 2026-05-13, ver REPLICAR-PAI-EM-ITENS-TECNICO.md) tinha whitelist de
-- apenas 22 campos por limitacao do schema do item — datas de proforma/
-- invoice/rascunho_pedido nao existiam no PedidoItem.
--
-- Decisao do dono em 2026-05-13: TODAS as datas do Pedido devem poder ser
-- replicadas para os itens (registro de quando o item ficou pronto, foi
-- aprovado, etc.). Sobem +35 colunas no PedidoItem.
--
-- Coordenador + Lider Tecnico + dono autorizaram (Mandamento 02). Todas
-- nullable, sem default, sem indice (premature indexing — adicionar
-- quando GABI Insights/Dashboard precisar).

-- Rascunho Pedido — Recebimento (3)
ALTER TABLE "pedido_item" ADD COLUMN "data_previsao_recebimento_rascunho_item"    TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_confirmacao_recebimento_rascunho_item" TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_meta_recebimento_rascunho_item"        TIMESTAMP(3);

-- Rascunho Pedido — Aprovação (3)
ALTER TABLE "pedido_item" ADD COLUMN "data_previsao_aprovacao_rascunho_item"      TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_confirmacao_aprovacao_rascunho_item"   TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_meta_aprovacao_rascunho_item"          TIMESTAMP(3);

-- Documento Pedido (1)
ALTER TABLE "pedido_item" ADD COLUMN "data_documento_item"                        TIMESTAMP(3);

-- Proforma — Recebimento Rascunho (3)
ALTER TABLE "pedido_item" ADD COLUMN "data_previsao_recebimento_rascunho_proforma_item"    TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_confirmacao_recebimento_rascunho_proforma_item" TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_meta_recebimento_rascunho_proforma_item"        TIMESTAMP(3);

-- Proforma — Aprovação Rascunho (3)
ALTER TABLE "pedido_item" ADD COLUMN "data_previsao_aprovacao_rascunho_proforma_item"      TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_confirmacao_aprovacao_rascunho_proforma_item"   TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_meta_aprovacao_rascunho_proforma_item"          TIMESTAMP(3);

-- Proforma — Envio Original (3)
ALTER TABLE "pedido_item" ADD COLUMN "data_previsao_envio_original_proforma_item"          TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_confirmacao_envio_original_proforma_item"       TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_meta_envio_original_proforma_item"              TIMESTAMP(3);

-- Proforma — Recebimento Original (3)
ALTER TABLE "pedido_item" ADD COLUMN "data_previsao_recebimento_original_proforma_item"    TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_confirmacao_recebimento_original_proforma_item" TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_meta_recebimento_original_proforma_item"        TIMESTAMP(3);

-- Documento Proforma (1)
ALTER TABLE "pedido_item" ADD COLUMN "data_documento_proforma_item"                        TIMESTAMP(3);

-- Invoice — Recebimento Rascunho (3)
ALTER TABLE "pedido_item" ADD COLUMN "data_previsao_recebimento_rascunho_invoice_item"    TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_confirmacao_recebimento_rascunho_invoice_item" TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_meta_recebimento_rascunho_invoice_item"        TIMESTAMP(3);

-- Invoice — Aprovação Rascunho (3)
ALTER TABLE "pedido_item" ADD COLUMN "data_previsao_aprovacao_rascunho_invoice_item"      TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_confirmacao_aprovacao_rascunho_invoice_item"   TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_meta_aprovacao_rascunho_invoice_item"          TIMESTAMP(3);

-- Invoice — Envio Original (3)
ALTER TABLE "pedido_item" ADD COLUMN "data_previsao_envio_original_invoice_item"          TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_confirmacao_envio_original_invoice_item"       TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_meta_envio_original_invoice_item"              TIMESTAMP(3);

-- Invoice — Recebimento Original (3)
ALTER TABLE "pedido_item" ADD COLUMN "data_previsao_recebimento_original_invoice_item"    TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_confirmacao_recebimento_original_invoice_item" TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_meta_recebimento_original_invoice_item"        TIMESTAMP(3);

-- Documento Invoice (1)
ALTER TABLE "pedido_item" ADD COLUMN "data_documento_invoice_item"                        TIMESTAMP(3);

-- Outras (2)
ALTER TABLE "pedido_item" ADD COLUMN "data_consolidacao_pedido_replicada_item"            TIMESTAMP(3);
ALTER TABLE "pedido_item" ADD COLUMN "data_transferencia_saldo_item"                      TIMESTAMP(3);
