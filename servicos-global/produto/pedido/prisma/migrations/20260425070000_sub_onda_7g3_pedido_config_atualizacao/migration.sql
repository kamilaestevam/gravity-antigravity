-- Sub-onda 7g.3 — PedidoConfigAtualizacaoCadastros (9 col renames)
-- Fonte: planilha_geral_gravity (1).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Nota: tabela física @@map("pedido_config_atualizacao_cadastros") permanece (preserva dados).

ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "atualiza_exportador"   TO "atualiza_exportador_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "atualiza_fabricante"   TO "atualiza_fabricante_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "atualiza_agente"       TO "atualiza_agente_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "atualiza_despachante"  TO "atualiza_despachante_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "atualiza_armador"      TO "atualiza_armador_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "atualiza_ope"          TO "atualiza_ope_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "resnap_em_emissao"     TO "gatilho_emissao_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "resnap_em_embarque"    TO "gatilho_embarque_politica_snapshot_cadastros";
ALTER TABLE "pedido_config_atualizacao_cadastros" RENAME COLUMN "resnap_em_desembaraco" TO "gatilho_desembaraco_politica_snapshot_cadastros";
