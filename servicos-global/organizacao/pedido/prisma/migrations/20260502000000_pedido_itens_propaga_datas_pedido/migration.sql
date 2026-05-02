-- Migration: pedido_itens_propaga_datas_pedido
-- Propaga 11 datas do pedido_produto_gravity para granularidade de item.
-- Aplicada manualmente em transacao em 2026-05-02 (tabela vazia, 0 rows).
--
-- Contexto:
-- pedido_itens ja estava DDD-aligned (nao precisou rename). Adicao das 11 datas
-- atende casos onde itens tem timing diferente do pedido como um todo:
-- - data_consolidacao_item: itens consolidados em momentos diferentes
-- - data_exclusao_item: soft-delete por item
-- - 3 datas pedido_pronto: cada item fica pronto em data propria
-- - 3 datas inspecao: inspecao por item
-- - 3 datas coleta: coleta por item (fornecedores diferentes)
--
-- Datas do pedido_produto_gravity NAO replicadas (continuam so no pedido):
-- - data_emissao/criacao/atualizacao_pedido (ja existem como _item)
-- - data_documento_pedido + proforma + invoice (documentos sao nivel pedido)
-- - data_*_draft_pedido (proposta e nivel pedido)
-- - data_*_draft_proforma + original_proforma (proforma e nivel pedido)
-- - data_*_draft_invoice + original_invoice (invoice e nivel pedido)
--
-- Tabela duplicata em gravity-servicos-teste.public foi DROPada (legacy 100%).
--
-- Cleanup de variaveis legacy (`tenant_id` em transferirService.ts etc.) NAO
-- foi feito neste commit — essas refs apontam para ORPHAN models
-- (transferHistorico, pedidoHistorico) que precisam ser endereçados em
-- ciclo separado. Fica como debito tecnico.

ALTER TABLE "pedido_itens" ADD COLUMN "data_consolidacao_item"      TIMESTAMP;
ALTER TABLE "pedido_itens" ADD COLUMN "data_exclusao_item"           TIMESTAMP;
ALTER TABLE "pedido_itens" ADD COLUMN "data_prevista_item_pronto"    TIMESTAMP;
ALTER TABLE "pedido_itens" ADD COLUMN "data_confirmada_item_pronto"  TIMESTAMP;
ALTER TABLE "pedido_itens" ADD COLUMN "data_meta_item_pronto"        TIMESTAMP;
ALTER TABLE "pedido_itens" ADD COLUMN "data_prevista_inspecao_item"  TIMESTAMP;
ALTER TABLE "pedido_itens" ADD COLUMN "data_confirmada_inspecao_item" TIMESTAMP;
ALTER TABLE "pedido_itens" ADD COLUMN "data_meta_inspecao_item"      TIMESTAMP;
ALTER TABLE "pedido_itens" ADD COLUMN "data_prevista_coleta_item"    TIMESTAMP;
ALTER TABLE "pedido_itens" ADD COLUMN "data_confirmada_coleta_item"  TIMESTAMP;
ALTER TABLE "pedido_itens" ADD COLUMN "data_meta_coleta_item"        TIMESTAMP;
