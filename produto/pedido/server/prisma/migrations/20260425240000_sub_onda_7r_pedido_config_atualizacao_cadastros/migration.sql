-- Sub-onda 7r — PedidoConfigAtualizacaoCadastros (4 col renames, sem drops destrutivos)
-- Fonte: planilha_geral_gravity (22).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("pedido_config_atualizacao_cadastros") permanece.
-- 9 drops VERMELHOS (resnap_*, atualiza_ope/fabricante/exportador/despachante/armador/agente)
-- foram intencionalmente PULADOS — preservação de dados (decisão arquitetural separada).

ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "id"                  TO "id_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "atualiza_importador" TO "matriz_snapshot_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "created_at"          TO "data_criacao_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "updated_at"          TO "data_atualizacao_politica_snapshot_cadastros";
