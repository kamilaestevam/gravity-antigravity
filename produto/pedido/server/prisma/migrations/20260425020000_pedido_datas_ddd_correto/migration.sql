-- FASE 07 DDD / Onda 3 Pedido / Sub-onda 7c — Refatora datas e timestamps do PedidoGeral
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
--
-- Renomes desta sub-onda (7 colunas):
--   • data_prevista_pedido_pronto_pedido        → data_prevista_pedido_pronto
--   • data_confirmada_pedido_pronto_pedido      → data_confirmada_pedido_pronto
--   • data_meta_pedido_pronto_pedido            → data_meta_pedido_pronto
--   • data_prev_recebimento_draft_pedido        → data_previsao_recebimento_draft_pedido
--   • data_conf_recebimento_draft_pedido        → data_confirmacao_recebimento_draft_pedido
--   • data_prev_aprovacao_draft_pedido          → data_previsao_aprovacao_draft_pedido
--   • data_conf_aprovacao_draft_pedido          → data_confirmacao_aprovacao_draft_pedido
--
-- As datas de Proforma/Invoice e os timestamps padrão (data_emissao_pedido,
-- data_consolidacao_pedido, data_exclusao_pedido, data_criacao_pedido,
-- data_atualizacao_pedido, data_documento_*_pedido) já estavam alinhados
-- com a planilha em sub-ondas anteriores.

ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prevista_pedido_pronto_pedido"   TO "data_prevista_pedido_pronto";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_confirmada_pedido_pronto_pedido" TO "data_confirmada_pedido_pronto";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_meta_pedido_pronto_pedido"       TO "data_meta_pedido_pronto";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prev_recebimento_draft_pedido"   TO "data_previsao_recebimento_draft_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_conf_recebimento_draft_pedido"   TO "data_confirmacao_recebimento_draft_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_prev_aprovacao_draft_pedido"     TO "data_previsao_aprovacao_draft_pedido";
ALTER TABLE "pedido_produto_gravity" RENAME COLUMN "data_conf_aprovacao_draft_pedido"     TO "data_confirmacao_aprovacao_draft_pedido";
