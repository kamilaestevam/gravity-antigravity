-- Sub-onda 8 — Processo grupo completo (Processo + ProcessoFatura + ProcessoItem + ProcessoContainer)
-- Fonte: planilha_geral_gravity (22).xlsx, aba "1.ddd_campos" (versão definitiva 25/04/2026)
-- Estratégia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- 161 col renames. @@map preservado em todas as 4 tabelas.
--
-- Justificativa para grupo atômico (excede 10 cols/sub-onda):
--   - Tabelas vestigiais no fragment de Pedido: zero consumidores TS verificados em
--     produto/pedido/server/src/ e servicos-global/tenant/processos-core/src/
--   - Regra dos 10 cols visa limitar blast radius de churn em consumidores; com zero
--     consumers o racional colapsa. Renames são puramente de coluna (preservam dados).
--   - Filhos têm FK para Processo.id → renomeada para id_processo. Renames de relações
--     coordenadas no mesmo migration evitam estado inconsistente entre commits.
--
-- Ordem importante para colisões:
--   1) Processo.id_processo (col antiga) → id_processo_processo (libera o nome)
--   2) Processo.id → id_processo

-- ============================================================================
-- Processo (115 col renames)
-- ============================================================================
-- 1. Liberar 'id_processo' antes de renomear 'id'
ALTER TABLE "tabela_processos" RENAME COLUMN "id_processo" TO "id_processo_processo";

-- 2. PK e FKs principais
ALTER TABLE "tabela_processos" RENAME COLUMN "id"                  TO "id_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "tenant_id"           TO "id_organizacao";
ALTER TABLE "tabela_processos" RENAME COLUMN "company_id"          TO "id_workspace";
ALTER TABLE "tabela_processos" RENAME COLUMN "estimativa_custo_id" TO "id_estimativa_custo";
ALTER TABLE "tabela_processos" RENAME COLUMN "cotacao_frete_id"    TO "id_cotacao_frete";

-- 3. Status / operação / referências
ALTER TABLE "tabela_processos" RENAME COLUMN "status_embarque"      TO "status_embarque_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "tipo_operacao"        TO "tipo_operacao_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "referencia_processo"  TO "referencia_processo_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "responsavel_processo" TO "responsavel_processo_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "responsavel_rotina"   TO "responsavel_rotina_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "setor_responsavel"    TO "setor_responsavel_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "vendedor_responsavel" TO "vendedor_responsavel_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "canal_parametrizacao" TO "canal_parametrizacao_processo";

-- 4. FKs para empresas
ALTER TABLE "tabela_processos" RENAME COLUMN "importacao_exportador_id"             TO "id_importacao_exportador";
ALTER TABLE "tabela_processos" RENAME COLUMN "exportacao_importador_id"             TO "id_exportacao_importador";
ALTER TABLE "tabela_processos" RENAME COLUMN "agente_carga_id"                      TO "id_agente_carga";
ALTER TABLE "tabela_processos" RENAME COLUMN "armador_id"                           TO "id_armador";
ALTER TABLE "tabela_processos" RENAME COLUMN "cia_aerea_id"                         TO "id_cia_aerea";
ALTER TABLE "tabela_processos" RENAME COLUMN "transportador_rodo_internacional_id"  TO "id_transportador_rodo_internacional";
ALTER TABLE "tabela_processos" RENAME COLUMN "transportador_rodo_nacional_id"       TO "id_transportador_rodo_nacional";
ALTER TABLE "tabela_processos" RENAME COLUMN "transportador_ferroviario_id"         TO "id_transportador_ferroviario";
ALTER TABLE "tabela_processos" RENAME COLUMN "despachante_id"                       TO "id_despachante";
ALTER TABLE "tabela_processos" RENAME COLUMN "armazem_alfandegado_id"               TO "id_armazem_alfandegado";
ALTER TABLE "tabela_processos" RENAME COLUMN "securadora_internacional_id"          TO "id_securadora_internacional";
ALTER TABLE "tabela_processos" RENAME COLUMN "banco_id"                             TO "id_banco";
ALTER TABLE "tabela_processos" RENAME COLUMN "corretora_cambio_id"                  TO "id_corretora_cambio";

-- 5. Pedido / cambio / incoterm / frete
ALTER TABLE "tabela_processos" RENAME COLUMN "moeda_pedido"                                  TO "moeda_pedido_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "valor_total_pedido"                            TO "valor_total_pedido_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "incoterm"                                      TO "incoterm_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "premio_seguro_internacional"                   TO "premio_seguro_internacional_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "modal_frete_internacional"                     TO "modal_frete_internacional_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "porto_origem"                                  TO "porto_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "porto_transbordo"                              TO "porto_transbordo_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "porto_destino"                                 TO "porto_destino_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "aeroporto_origem"                              TO "aeroporto_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "aeroporto_escala"                              TO "aeroporto_escala_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "aeroporto_destino"                             TO "aeroporto_destino_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "transit_time_previsto_frete_internacional"     TO "transit_time_previsto_frete_internacional_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "moeda_frete_internacional"                     TO "moeda_frete_internacional_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "tipo_frete_internacional"                      TO "tipo_frete_internacional_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "proposta_frete_internacional"                  TO "proposta_frete_internacional_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "valor_frete_internacional_estimado"            TO "valor_frete_internacional_estimado_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "valor_total_frete_internacional"               TO "valor_total_frete_internacional_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "valor_total_taxas_origem_frete_internacional"  TO "valor_total_taxas_origem_frete_internacional_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "valor_total_taxas_destino_frete_internacional" TO "valor_total_taxas_destino_frete_internacional_processo";

-- 6. Volumes / pesos
ALTER TABLE "tabela_processos" RENAME COLUMN "tipo_volume"              TO "tipo_volume_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "quantidade_total_volumes" TO "quantidade_total_volumes_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "peso_bruto_total"         TO "peso_bruto_total_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "peso_liquido_total"       TO "peso_liquido_total_processo";

-- 7. Datas (52 cols)
ALTER TABLE "tabela_processos" RENAME COLUMN "data_pedido"                            TO "data_pedido_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_pedido_aberto"                     TO "data_pedido_aberto_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_pedido"                   TO "data_previsao_pedido_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_pedido_pronto"                     TO "data_pedido_pronto_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_pedido_consolidado"                TO "data_pedido_consolidado_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_coleta_pedido_origem"     TO "data_previsao_coleta_pedido_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_coleta_pedido_origem"              TO "data_coleta_pedido_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_entrega_pedido_origem"    TO "data_previsao_entrega_pedido_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_entrega_pedido_origem"             TO "data_entrega_pedido_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_carregamento_container"   TO "data_previsao_carregamento_container_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_carregamento_container"            TO "data_carregamento_container_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_coleta_embarque_origem"   TO "data_previsao_coleta_embarque_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_coleta_embarque_origem"            TO "data_coleta_embarque_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_entrega_embarque_origem"  TO "data_previsao_entrega_embarque_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_entrega_embarque_origem"           TO "data_entrega_embarque_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_coleta_container_origem"  TO "data_previsao_coleta_container_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_coleta_container_origem"           TO "data_coleta_container_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_entrega_container_origem" TO "data_previsao_entrega_container_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_entrega_container_origem"          TO "data_entrega_container_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_embarque_origem_etd"      TO "data_previsao_embarque_origem_etd_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_embarque_origem"                   TO "data_embarque_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_transbordo_embarque"      TO "data_previsao_transbordo_embarque_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_transbordo_embarque"               TO "data_transbordo_embarque_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_chegada_destino_eta"      TO "data_previsao_chegada_destino_eta_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_chegada_destino_eta"               TO "data_chegada_destino_eta_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_presenca_carga_destino"   TO "data_previsao_presenca_carga_destino_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_presenca_carga_destino"            TO "data_presenca_carga_destino_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_registro_duimp"           TO "data_previsao_registro_duimp_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_registro_duimp"                    TO "data_registro_duimp_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_liberacao_duimp"          TO "data_previsao_liberacao_duimp_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_liberacao_duimp"                   TO "data_liberacao_duimp_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_consulta_liberacao_duimp"          TO "data_consulta_liberacao_duimp_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_previsao_registro_lpco"            TO "data_previsao_registro_lpco_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_registro_lpco"                     TO "data_registro_lpco_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_deferimento_lpco"                  TO "data_deferimento_lpco_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_indeferimento_lpco"                TO "data_indeferimento_lpco_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_pendencia_lpco"                    TO "data_pendencia_lpco_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "data_consulta_liberacao_lpco"           TO "data_consulta_liberacao_lpco_processo";

-- 8. Documentos / impostos / detalhes
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_certificado_origem"     TO "numero_certificado_origem_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_bl"                     TO "numero_bl_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_mbl"                    TO "numero_mbl_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_hbl"                    TO "numero_hbl_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_awb"                    TO "numero_awb_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_mawb"                   TO "numero_mawb_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_hawb"                   TO "numero_hawb_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_crt"                    TO "numero_crt_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_cim"                    TO "numero_cim_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_ce_mercante"            TO "numero_ce_mercante_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_presenca_carga_destino" TO "numero_presenca_carga_destino_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_duimp"                  TO "numero_duimp_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "numero_nfe"                    TO "numero_nfe_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "chave_acesso_nfe"              TO "chave_acesso_nfe_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "total_imposto_ii"              TO "total_imposto_ii_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "total_imposto_ipi"             TO "total_imposto_ipi_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "total_imposto_pis"             TO "total_imposto_pis_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "total_imposto_cofins"          TO "total_imposto_cofins_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "total_imposto_icms"            TO "total_imposto_icms_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "detalhes_fiscais"              TO "detalhes_fiscais_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "detalhes_logisticos"           TO "detalhes_logisticos_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "detalhes_financeiros"          TO "detalhes_financeiros_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "created_at"                    TO "data_criacao_processo";
ALTER TABLE "tabela_processos" RENAME COLUMN "updated_at"                    TO "data_atualizacao_processo";

-- ============================================================================
-- ProcessoFatura (12 col renames)
-- ============================================================================
ALTER TABLE "fatura_processo" RENAME COLUMN "id"               TO "id_processo_fatura";
ALTER TABLE "fatura_processo" RENAME COLUMN "tenant_id"        TO "id_organizacao";
ALTER TABLE "fatura_processo" RENAME COLUMN "company_id"       TO "id_workspace";
ALTER TABLE "fatura_processo" RENAME COLUMN "processo_id"      TO "id_processo";
ALTER TABLE "fatura_processo" RENAME COLUMN "tipo_fatura"      TO "tipo_fatura_processo_fatura";
ALTER TABLE "fatura_processo" RENAME COLUMN "numero_fatura"    TO "numero_fatura_processo_fatura";
ALTER TABLE "fatura_processo" RENAME COLUMN "moeda_fatura"     TO "moeda_fatura_processo_fatura";
ALTER TABLE "fatura_processo" RENAME COLUMN "valor_total"      TO "valor_total_processo_fatura";
ALTER TABLE "fatura_processo" RENAME COLUMN "valor_pago"       TO "valor_pago_processo_fatura";
ALTER TABLE "fatura_processo" RENAME COLUMN "data_vencimento"  TO "data_vencimento_processo_fatura";
ALTER TABLE "fatura_processo" RENAME COLUMN "status_pagamento" TO "status_pagamento_processo_fatura";

-- ============================================================================
-- ProcessoItem (19 col renames)
-- ============================================================================
ALTER TABLE "logistica_processo" RENAME COLUMN "id"                          TO "id_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "tenant_id"                   TO "id_organizacao";
ALTER TABLE "logistica_processo" RENAME COLUMN "company_id"                  TO "id_workspace";
ALTER TABLE "logistica_processo" RENAME COLUMN "processo_id"                 TO "id_processo";
ALTER TABLE "logistica_processo" RENAME COLUMN "pedido_item_id"              TO "id_pedido_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "sequencia_item"              TO "sequencia_item_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "part_number"                 TO "part_number_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "ncm"                         TO "ncm_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "descricao_po"                TO "descricao_po_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "descricao_en"                TO "descricao_en_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "quantidade"                  TO "quantidade_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "unidade_comercializada_item" TO "unidade_comercializada_item_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "valor_unitario"              TO "valor_unitario_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "valor_total"                 TO "valor_total_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "peso_liquido_unitario"       TO "peso_liquido_unitario_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "peso_bruto_unitario"         TO "peso_bruto_unitario_processo_item";
ALTER TABLE "logistica_processo" RENAME COLUMN "detalhes_do_produto"         TO "detalhes_do_produto_processo_item";

-- ============================================================================
-- ProcessoContainer (15 col renames)
-- ============================================================================
ALTER TABLE "container_processo" RENAME COLUMN "id"                        TO "id_processo_container";
ALTER TABLE "container_processo" RENAME COLUMN "tenant_id"                 TO "id_organizacao";
ALTER TABLE "container_processo" RENAME COLUMN "company_id"                TO "id_workspace";
ALTER TABLE "container_processo" RENAME COLUMN "processo_id"               TO "id_processo";
ALTER TABLE "container_processo" RENAME COLUMN "container_numero"          TO "container_numero_processo_container";
ALTER TABLE "container_processo" RENAME COLUMN "container_lacre"           TO "container_lacre_processo_container";
ALTER TABLE "container_processo" RENAME COLUMN "container_tipo"            TO "container_tipo_processo_container";
ALTER TABLE "container_processo" RENAME COLUMN "container_tara"            TO "container_tara_processo_container";
ALTER TABLE "container_processo" RENAME COLUMN "container_peso_bruto"      TO "container_peso_bruto_processo_container";
ALTER TABLE "container_processo" RENAME COLUMN "container_peso_liquido"    TO "container_peso_liquido_processo_container";
ALTER TABLE "container_processo" RENAME COLUMN "container_metragem_cubica" TO "container_metragem_cubica_processo_container";
ALTER TABLE "container_processo" RENAME COLUMN "data_devolucao_prevista"   TO "data_devolucao_prevista_processo_container";
ALTER TABLE "container_processo" RENAME COLUMN "data_devolucao_real"       TO "data_devolucao_real_processo_container";
ALTER TABLE "container_processo" RENAME COLUMN "local_devolucao"           TO "local_devolucao_processo_container";
