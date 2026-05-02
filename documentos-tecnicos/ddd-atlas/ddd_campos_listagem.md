# Campos DDD — aba 1.ddd_campos

Total: 1551 campos em 124 tabelas

**Agenda** (10): id_agenda, id_organizacao, nome_agenda, descricao_agenda, tipo_agenda, criadoEm_agenda, atualizadoEm_agenda, slots_agenda, config_agenda, — (não existe no banco)_agenda

**AlertaEvento** (18): id_alert_evento, id_organizacao, id_alerta_regra, regra_alerta_evento, tipo_ator_alerta_evento, id_ator_alerta_evento, nome_ator_alerta_evento, modulo_alerta_evento, acao_alerta_evento, contagem_eventos_alerta_evento, janela_segundos_alerta_evento, ids_log_auditoria_alerta_evento, status_alerta_evento, revisado_por_alerta_evento, data_revisao_alerta_evento, notas_alerta_evento, data_criacao_alerta_evento, logs_alerta_evento

**AlertaLog** (10): id_alerta_log, id_alert_evento, alerta_evento_log, canal_alerta_log, destinatario_alerta_log, status_alerta_log, tentativas_alerta_log, mensagem_erro_alerta_log, data_envio_alerta_log, data_criacao_alerta_log

**AlertaRegra** (20): id_alerta_regra, id_organizacao, nome_alerta_regra, descricao_alerta_regra, ativa_alerta_regra, tipo_ator_alerta_regra, acao_alerta_regra, modulo_alerta_regra, filtro_status_alerta_regra, contagem_limite_alerta_regr, janela_segundos_alerta_regra, channel_inapp_alert_rule, canal_inapp_alerta_regra, canal_whatsapp_alerta_regra, destinatarios_email_alerta_regra, destinatarios_whatsapp_alerta_regra, ids_usuarios_destinatarios_alerta_regra, data_criacao_alerta_regra, data_atualizacao_alerta_regra, eventos_alerta_regra

**AlertEvent** (1): — (não existe no banco)_alert_event

**AmbienteDeploy** (1): nan

**AssinaturaProdutoGravity** (9): nan, nan, teste_encerra_em_assinatura, nan, nan, nan, data_criacao_assinatura, data_atualizacao_assinatura, id_organizacao

**AtividadesCronometro** (18): id_atividades_cronometro, id_organizacao, id_produto, id_usuario, id_activity, started_at_atividades_cronometro, ended_at_atividades_cronometro, duration_minutes_atividades_cronometro, is_manual_atividades_cronometro, subject_atividades_cronometro, linked_type_atividades_cronometro, id_linked, linked_label_atividades_cronometro, data_criacao_atividades_cronometro, data_atualizacao_atividades_cronometro, — (não existe no banco)_atividades_cronometro, — (não existe no banco)_atividades_cronometro, — (não existe no banco)_atividades_cronometro

**AtividadesDados** (31): id_atividades_dados, id_organizacao, id_usuario, titulo_atividades_dados, descricao_atividades_dados, tipo_atividades_dados, status_atividades_dados, prioridade_atividades_dados, data_atividade_atividades_dados, data_vencimento_atividades_dados, tempo_gasto_minutos_atividades_dados, proximo_passo_titulo_atividades_dados, proximo_passo_data_atividades_dados, lembrete_em_atividades_dados, lembrete_email_atividades_dados, lembrete_whatsapp_atividades_dados, notificar_ao_atribuir_atividades_dados, id_processo, data_criacao_atividades_dados, data_atualizacao_atividades_dados, participantes_atividades_dados, sessoes_timer_atividades_dados, — (não existe no banco)_atividades_dados, — (não existe no banco)_atividades_dados, — (não existe no banco)_atividades_dados, — (não existe no banco)_atividades_dados, — (não existe no banco)_atividades_dados, — (não existe no banco)_atividades_dados, — (não existe no banco)_atividades_dados, — (não existe no banco)_atividades_dados, — (não existe no banco)_atividades_dados

**AtividadesParticipantes** (5): id_atividades_participantes, id_atividade, id_usuario, user_nome_atividades_participantes, atividade_atividades_participantes

**AtividadesTempo** (6): id_atividades_tempo, id_atividade, iniciado_em_atividades_tempo, duracao_min_atividades_tempo, assunto_atividades_tempo, atividade_atividades_tempo

**AtividadesTimer** (9): id_atividades_timer, id_organizacao, id_usuario, id_activity, started_at_atividades_timer, paused_at_atividades_timer, accumulated_seconds_atividades_timer, data_criacao_atividades_timer, data_atualizacao_atividades_timer

**Cambio** (9): id_cambio, moeda_cambio, compra_cambio, venda_cambio, data_cotacao_cambio, hora_cotacao_cambio, boletim_cambio, fonte_cambio, criado_em_cambio

**ConexaoErp** (9): — (não existe no banco)_conexao_erp, — (não existe no banco)_conexao_erp, — (não existe no banco)_conexao_erp, — (não existe no banco)_conexao_erp, — (não existe no banco)_conexao_erp, — (não existe no banco)_conexao_erp, — (não existe no banco)_conexao_erp, — (não existe no banco)_conexao_erp, — (não existe no banco)_conexao_erp

**Contato** (3): — (não existe no banco)_contato, — (não existe no banco)_contato, — (não existe no banco)_contato

**ConversaCompletaGabi** (1): — (não existe no banco)_conversa_completa_gabi

**DashboardAlertas** (15): id_dashboard_alertas, id_organizacao, id_produto_gravity, id_usuario, id_dashboard_configuracao, id_dashboard_criar, chave_metrica_dashboard_alertas, condicao_dashboard_alertas, limite_dashboard_alertas, canais_dashboard_alertas, ativo_dashboard_alertas, data_ultimo_disparo_dashboard_alertas, dashboard_configuracao, data_criacao_dashboard_alertas, data_atualizacao_dashboard_alertas

**DashboardCompartilhar** (13): id_dashboard_compartilhar, id_organizacao, id_produto_gravity, id_usuario, id_dashboard_configuracao, token_compartilhamento_dashboard, canal_dashboard_compartilhar, email_destinatario_dashboard_compartilhar, telefone_destinatario_dashboard_compartilhar, dados_snapshot_dashboard_compartilhar, data_expiracao_dashboard_compartilhar, dashboard_configuracao, data_criacao_dashboard_compartilhar

**DashboardConfiguracao** (14): id_dashboard_configuracao, id_organizacao, id_produto_gravity, id_usuario, nome_dashboard_configuracao, modo_dashboard_configuracao, layout_dashboard_configuracao, filtros_dashboard_configuracao, padrao_dashboard_configuracao, dashboard_criar, dashboard_alertas, dashboard_compartilhar, data_criacao_dashboard_configuracao, data_atualizacao_dashboard_configuracao

**DashboardCriar** (19): id_dashboard_criar, id_organizacao, id_produto_gravity, id_usuario, id_dashboard_configuracao, chave_widget_dashboard_criar, tipo_widget_dashboard_criar, tipo_grafico_dashboard_criar, titulo_dashboard_criar, especificacao_query_dashboard_criar, posicao_dashboard_criar, configuracao_dashboard_criar, dashboard_configuracao, data_criacao_dashboard_criar, data_atualizacao_dashboard_criar, — (não existe no banco)_dashboard_criar, — (não existe no banco)_dashboard_criar, — (não existe no banco)_dashboard_criar, — (não existe no banco)_dashboard_criar

**DashboardMetricas** (10): id_dashboard_metricas, id_organizacao, id_produto_gravity, id_usuario, metric_key_dashboard_metricas, dimensions_dashboard_metricas, value_dashboard_metricas, period_from_dashboard_metricas, period_to_dashboard_metricas, captured_at_dashboard_metricas

**Deploy** (13): id_deploy, deploy_number_deploy, area_deploy, versao_deploy, descricao_deploy, ambiente_deploy, status_deploy, deployed_por_deploy, id_deployed_por_usuario, deployed_no_deploy, nan, data_criacao_deploy, nan

**DisponibilidadeConfig** (16): id_disponibilidade_config, id_organizacao, id_agenda, horarioInicio_disponibilidade_config, horarioFim_disponibilidade_config, duracaoSlot_disponibilidade_config, intervalo_disponibilidade_config, diasSemana_disponibilidade_config, criadoEm_disponibilidade_config, atualizadoEm_disponibilidade_config, agenda_disponibilidade_config, — (não existe no banco)_disponibilidade_config, — (não existe no banco)_disponibilidade_config, — (não existe no banco)_disponibilidade_config, — (não existe no banco)_disponibilidade_config, — (não existe no banco)_disponibilidade_config

**EmailAssuntosParticipantes** (14): id_email_assuntos_participantes, id_organizacao, id_produto_gravity, id_usuario, assunto_email_assuntos_participantes, status_email_assuntos_participantes, sentimento_email_assuntos_participantes, rotulo_sentimento_email_assuntos_participantes, quantidade_mensagens_email_assuntos_participantes, data_ultimo_contato_email_assuntos_participantes, deep_link_email_assuntos_participantes, data_criacao_email_assuntos_participantes, data_atualizacao_email_assuntos_participantes, mensagens_email_assuntos_participantes

**EmailDirecao** (1): nan

**EmailFilaEnvio** (16): id_email_fila_envio, id_organizacao, id_produto_gravity, id_usuario, status_email_fila_envio, prioridade_email_fila_envio, payload_email_fila_envio, id_template_email, id_email_enviado, tentativas_email_fila_envio, max_tentativas_email_fila_envio, data_proxima_tentativa_email_fila_envio, data_processamento_email_fila_envio, mensagem_erro_email_fila_envio, data_criacao_email_fila_envio, data_atualizacao_email_fila_envio

**EmailMensagem** (21): id_email_mensagem, id_organizacao, id_produto_gravity, id_usuario, id_email_assuntos_participantes, email_assuntos_participantes, id_resend_email_mensagem, direcao_email_mensagem, remetente_email_mensagem, destinatario_email_mensagem, assunto_email_mensagem, corpo_texto_email_mensagem, corpo_html_email_mensagem, chave_deduplicacao_email_mensagem, id_mensagem_pai_email_mensagem, resposta_gabi_email_mensagem, confianca_gabi_email_mensagem, acao_gabi_email_mensagem, data_envio_email_mensagem, data_criacao_email_mensagem, data_atualizacao_email_mensagem

**PedidoAnexo** (14): vinculo_anexo_pedido, tipo_documento_anexo_pedido, tipo_arquivo_anexo_pedido, tamanho_bytes_anexo_pedido, nome_arquivo_anexo_pedido, id_vinculo_anexo_pedido	, id_produto_gravity, id_organizacao, id_anexo_pedido, enviado_por_anexo_pedido, descricao_anexo_pedido, data_criacao_anexo_pedido, chave_storage_anexo_pedido, categoria_anexo_pedido

**PedidoNovoAprendizado** (9): mapeamento_aprendizado_importacao_dados, id_usuario, id_produto_gravity, id_organizacao, id_aprendizado_importacao_dados, hash_colunas_aprendizado_importacao_dados, data_criacao_aprendizado_importacao_dados, data_atualizacao_aprendizado_importacao_dados, contagem_uso_aprendizado_importacao_dados

**AprendizadoImportacaoDados** (3): — (não existe no banco)_aprendizado_importacao_dados, — (não existe no banco)_aprendizado_importacao_dados, — (não existe no banco)_aprendizado_importacao_dados

**PedidoColunaUsuario** (20): visibilidade_coluna_usuario_pedido, valores_coluna_usuario_pedido, valor_padrao_coluna_usuario_pedido, tipos_usuario_workspace_permitidos_coluna_usuario_pedido, tipo_coluna_usuario_pedido, ordem_coluna_usuario_pedido, opcoes_coluna_usuario_pedido, obrigatorio_coluna_usuario_pedido, nome_coluna_usuario_pedido, id_produto_gravity, id_organizacao, id_coluna_usuario_pedido, escopo_coluna_usuario_pedido, descricao_coluna_usuario_pedido, data_criacao_coluna_usuario_pedido, data_atualizacao_coluna_usuario_pedido, criado_por_coluna_usuario_pedid, chave_coluna_usuario_pedido, ativo_coluna_usuario_pedido, — (não existe no banco)_coluna_usuario_pedido

**PedidoDashboardPainel** (9): widgets_json_dashboard_painel, ordem_dashboard_painel, nome_dashboard_painel, is_visivel_dashboard_painel, id_usuario, id_organizacao, id_dashboard_painel, data_criacao_dashboard_painel, data_atualizacao_dashboard_painel

**PedidoDashboardPreferencias** (6): widgets_json_dashboard_preferencias, id_organizacao, id_dashboard_preferencias, data_criacao_dashboard_preferencias, data_atualizacao_dashboard_preferencias, chave_produto_gravity_dashboard_preferencias

**KanbanPreferencias** (6): preferencias_kanban_preferencias, id_usuario, id_organizacao, id_kanban_preferencias, data_criacao_kanban_preferencias, data_atualizacao_kanban_preferencias

**PedidoGeral** (89): valor_total_pedido, valor_total_cambio_pedido, unidade_comercializada_pedido, transferencias_pedido, tipo_operacao_pedido, taxa_cambio_estimada_pedido, status_pedido, snapshots_ope_pedido, snapshots_empresa_pedido, referencia_importador_pedido, referencia_fabricante_pedido, referencia_exportador_pedido, quantidade_volumes_pedido, quantidade_total_pedido, peso_liquido_total_pedido, peso_bruto_total_pedido, numero_proforma_pedido, numero_pedido, numero_invoice_pedido, moeda_pedido, moeda_cambio_pedido, itens_pedido, incoterm_pedido, ids_origem_consolidacao_pedido, id_workspace, id_status_pedido, id_pedido, id_organizacao, id_importacao_exportador_pedido, id_fabricante_pedido, id_exportacao_importador_pedido, detalhes_operacionais_pedido, data_prevista_pedido_pronto, data_prevista_inspecao_pedido, data_prevista_coleta_pedido, data_previsao_recebimento_original_proforma_pedido, data_previsao_recebimento_original_invoice_pedido, data_previsao_recebimento_draft_proforma_pedido, data_previsao_recebimento_draft_pedido, data_previsao_recebimento_draft_invoice_pedido, data_previsao_envio_original_proforma_pedido, data_previsao_envio_original_invoice_pedido, data_previsao_aprovacao_draft_proforma_pedido, data_previsao_aprovacao_draft_pedido, data_previsao_aprovacao_draft_invoice_pedido, data_meta_recebimento_original_proforma_pedido, data_meta_recebimento_original_invoice_pedido, data_meta_recebimento_draft_proforma_pedido, data_meta_recebimento_draft_pedido, data_meta_recebimento_draft_invoice_pedido, data_meta_pedido_pronto, data_meta_inspecao_pedido, data_meta_envio_original_proforma_pedido, data_meta_envio_original_invoice_pedido, data_meta_coleta_pedido, data_meta_aprovacao_draft_proforma_pedido, data_meta_aprovacao_draft_pedido, data_meta_aprovacao_draft_invoice_pedido, data_exclusao_pedido, data_emissao_pedido, data_documento_proforma_pedido, data_documento_pedido, data_documento_invoice_pedido, data_criacao_pedido, data_consolidacao_pedido, data_confirmada_pedido_pronto, data_confirmada_inspecao_pedido, data_confirmada_coleta_pedido, data_confirmacao_recebimento_original_proforma_pedido, data_confirmacao_recebimento_original_invoice_pedido, data_confirmacao_recebimento_draft_proforma_pedido, data_confirmacao_recebimento_draft_pedido, data_confirmacao_recebimento_draft_invoice_pedido, data_confirmacao_envio_original_proforma_pedido, data_confirmacao_envio_original_invoice_pedido, data_confirmacao_aprovacao_draft_proforma_pedido, data_confirmacao_aprovacao_draft_pedido, data_confirmacao_aprovacao_draft_invoice_pedido, data_atualizacao_pedido, dados_extras_importacao_pedido, cubagem_total_pedido, contrato_cambio_id_pedido, condicao_pagamento_pedido, cobertura_cambial_pedido, cnpj_importador_pedido, casas_decimais_valor_pedido, casas_decimais_quantidade_pedido, casas_decimais_peso_pedido, casas_decimais_cubagem_pedido

**Pedido** (7): — (não existe no banco)_pedido, — (não existe no banco)_pedido, — (não existe no banco)_pedido, — (não existe no banco)_pedido, — (não existe no banco)_pedido, — (não existe no banco)_pedido, — (não existe no banco)_pedido

**PedidoCasasDecimais** (16): valor_unitario_item_casas_decimais, valor_total_pedido_casas_decimais, saldo_itens_do_pedido_casas_decimais, quantidade_transferida_total_pedido_casas_decimais, quantidade_total_inicial_pedido_casas_decimais, quantidade_pronta_pedido_total_casas_decimais, quantidade_cancelada_total_pedido_casas_decimais, peso_liquido_total_pedido_casas_decimais, peso_bruto_total_pedido_casas_decimais, id_produto_gravity, id_pedido_casas_decimais, id_organizacao, formato_data_pedido, data_criacao_casas_decimais_pedido, data_atualizacao_pedido_casas_decimais, cubagem_total_pedido_casas_decimais

**PedidoColuna** (14): tipo_pedido_coluna, rotulo_pedido_coluna, ordem_pedido_coluna, opcoes_pedido_coluna, nome_pedido_coluna, index_criado_pedido_coluna, id_workspace, id_pedido_coluna, id_organizacao, filtravel_pedido_coluna, exibida_padrao_pedido_coluna, data_criacao_pedido_coluna, data_atualizacao_pedido_coluna, casas_decimais_pedido_coluna

**PedidoSnapshotConfiguracao** (6): matriz_snapshot_politica_snapshot_cadastros, id_workspace, id_politica_snapshot_cadastros, id_organizacao, data_criacao_politica_snapshot_cadastros, data_atualizacao_politica_snapshot_cadastros

**PedidoConfigAtualizacaoCadastros** (9): gatilho_emissao_politica_snapshot_cadastros, gatilho_embarque_politica_snapshot_cadastros, gatilho_desembaraco_politica_snapshot_cadastros, atualiza_ope_politica_snapshot_cadastros, atualiza_fabricante_politica_snapshot_cadastros, atualiza_exportador_politica_snapshot_cadastros, atualiza_despachante_politica_snapshot_cadastros, atualiza_armador_politica_snapshot_cadastros, atualiza_agente_politica_snapshot_cadastros

**PedidoItem** (39): valor_total_item, valor_por_unidade_item, unidade_comercializada_item, sequencia_item_pedido, referencia_importador_item, referencia_fabricante_item, referencia_exportador_item, quantidade_transferida_item, quantidade_pronta_item, quantidade_inicial_item, quantidade_cancelada_item, quantidade_atual_item, peso_liquido_unitario_item, peso_bruto_unitario_item, pedido_item, part_number_item, nome_importador_item, nome_fabricante_item, nome_exportador_item, ncm_item, moeda_item, incoterm_item, id_workspace, id_pedido, id_organizacao, id_item, embarques_efetivos_pedido_item, descricao_item, data_emissao_item, data_criacao_item, data_atualizacao_item, dados_extras_importacao_item, cubagem_unitaria_item, condicao_pagamento_item, cobertura_cambial_item, casas_decimais_valor_item, casas_decimais_quantidade_item, casas_decimais_peso_item, casas_decimais_cubagem_item

**PedidoPreferenciaPadrao** (6): id_workspace, id_pedido_preferencia_padrao, id_organizacao, data_atualizacao_pedido_preferencia_padrao, colunas_visiveis_pedido_preferencia_padrao, colunas_largura_pedido_preferencia_padrao

**PedidoPreferenciaUsuario** (7): id_workspace, id_usuario, id_pedido_colunas_preferencia_usuario, id_organizacao, data_atualizacao_pedido_preferencia_usuario, colunas_visiveis_pedido_preferencia_usuario, colunas_largura_pedido_preferencia_usuario

**PedidoSaldoFormula** (6): id_produto, id_pedido_saldo_formula, id_organizacao, formula_expressao_pedido_saldo_formula, data_criacao_pedido_saldo_formula, data_atualizacao_pedido_saldo_formula

**PedidoSnapshotEmpresa** (29): tipo_documento_pedido_snapshot_empresa, suid_pedido_snapshot_empresa, relacao_exportador_fabricante_pedido_snapshot_empresa, pedido_pedido_snapshot_empresa, papel_pedido_snapshot_empresa, pais_pedido_snapshot_empresa, nome_pedido_snapshot_empresa, nome_fantasia_pedido_snapshot_empresa, motivo_congelamento_pedido_snapshot_empresa, id_workspace, id_pedido_snapshot_empresa, id_pedido_snapshot_empresa, id_organizacao, exportador_e_fabricante_pedido_snapshot_empresa, estado_pedido_snapshot_empresa, endereco_pedido_snapshot_empresa, endereco_numero_pedido_snapshot_empresa, endereco_complemento_pedido_snapshot_empresa, endereco_bairro_pedido_snapshot_empresa, documento_principal_pedido_snapshot_empresa, contato_whatsapp_pedido_snapshot_empresa, contato_nome_pedido_snapshot_empresa, contato_email_pedido_snapshot_empresa, contato_departamento_pedido_snapshot_empresa, contato_cargo_pedido_snapshot_empresa, congelado_em_pedido_snapshot_empresa, cnpj_raiz_pedido_snapshot_empresa, cidade_pedido_snapshot_empresa, cep_pedido_snapshot_empresa

**PedidoSnapshotOpe** (19): zip_ope_pedido_snapshot_ope, versao_ope_pedido_snapshot_ope, tin_ope_pedido_snapshot_ope, situacao_ope_pedido_snapshot_ope, pais_ope_pedido_snapshot_ope, nome_ope_pedido_snapshot_ope, motivo_congelamento_pedido_snapshot_ope, id_workspace_pedido_snapshot_ope, id_pedido_snapshot_ope, id_pedido_pedido_snapshot_ope, id_organizacao_pedido_snapshot_ope, estado_ope_pedido_snapshot_ope, endereco_ope_pedido_snapshot_ope, email_ope_pedido_snapshot_ope, congelado_em_pedido_snapshot_ope, codigo_ope_pedido_snapshot_ope, cnpj_raiz_empresa_pedido_snapshot_ope, cidade_ope_pedido_snapshot_ope, acesso_pedido_snapshot_ope

**PedidoStatus** (12): rotulo_pedido_status, padrao_pedido_status, ordem_pedido_status, nome_pedido_status, id_workspace, id_pedido_status, id_organizacao, icone_pedido_status, gerenciado_sistema_pedido_status, data_criacao_pedido_status, data_atualizacao_pedido_status, cor_pedido_status

**Processo** (115): id_processo, id_organizacao, id_workspace, id_estimativa_custo, id_cotacao_frete, status_embarque_processo, tipo_operacao_processo, referencia_processo_processo, id_processo_processo, responsavel_processo_processo, responsavel_rotina_processo, setor_responsavel_processo, vendedor_responsavel_processo, canal_parametrizacao_processo, id_importacao_exportador, id_exportacao_importador, id_agente_carga, id_armador, id_cia_aerea, id_transportador_rodo_internacional, id_transportador_rodo_nacional, id_transportador_ferroviario, id_despachante, id_armazem_alfandegado, id_securadora_internacional, id_banco, id_corretora_cambio, moeda_pedido_processo, valor_total_pedido_processo, incoterm_processo, premio_seguro_internacional_processo, modal_frete_internacional_processo, porto_origem_processo, porto_transbordo_processo, porto_destino_processo, aeroporto_origem_processo, aeroporto_escala_processo, aeroporto_destino_processo, transit_time_previsto_frete_internacional_processo, moeda_frete_internacional_processo, tipo_frete_internacional_processo, proposta_frete_internacional_processo, valor_frete_internacional_estimado_processo, valor_total_frete_internacional_processo, valor_total_taxas_origem_frete_internacional_processo, valor_total_taxas_destino_frete_internacional_processo, tipo_volume_processo, quantidade_total_volumes_processo, peso_bruto_total_processo, peso_liquido_total_processo, data_pedido_processo, data_pedido_aberto_processo, data_previsao_pedido_processo, data_pedido_pronto_processo, data_pedido_consolidado_processo, data_previsao_coleta_pedido_origem_processo, data_coleta_pedido_origem_processo, data_previsao_entrega_pedido_origem_processo, data_entrega_pedido_origem_processo, data_previsao_carregamento_container_processo, data_carregamento_container_processo, data_previsao_coleta_embarque_origem_processo, data_coleta_embarque_origem_processo, data_previsao_entrega_embarque_origem_processo, data_entrega_embarque_origem_processo, data_previsao_coleta_container_origem_processo, data_coleta_container_origem_processo, data_previsao_entrega_container_origem_processo, data_entrega_container_origem_processo, data_previsao_embarque_origem_etd_processo, data_embarque_origem_processo, data_previsao_transbordo_embarque_processo, data_transbordo_embarque_processo, data_previsao_chegada_destino_eta_processo, data_chegada_destino_eta_processo, data_previsao_presenca_carga_destino_processo, data_presenca_carga_destino_processo, data_previsao_registro_duimp_processo, data_registro_duimp_processo, data_previsao_liberacao_duimp_processo, data_liberacao_duimp_processo, data_consulta_liberacao_duimp_processo, data_previsao_registro_lpco_processo, data_registro_lpco_processo, data_deferimento_lpco_processo, data_indeferimento_lpco_processo, data_pendencia_lpco_processo, data_consulta_liberacao_lpco_processo, numero_certificado_origem_processo, numero_bl_processo, numero_mbl_processo, numero_hbl_processo, numero_awb_processo, numero_mawb_processo, numero_hawb_processo, numero_crt_processo, numero_cim_processo, numero_ce_mercante_processo, numero_presenca_carga_destino_processo, numero_duimp_processo, numero_nfe_processo, chave_acesso_nfe_processo, total_imposto_ii_processo, total_imposto_ipi_processo, total_imposto_pis_processo, total_imposto_cofins_processo, total_imposto_icms_processo, detalhes_fiscais_processo, detalhes_logisticos_processo, detalhes_financeiros_processo, data_criacao_processo, data_atualizacao_processo, containers_processo, faturas_processo, itens_processo_processo

**ProcessoContainer** (15): id_processo_container, id_organizacao, id_workspace, id_processo, container_numero_processo_container, container_lacre_processo_container, container_tipo_processo_container, container_tara_processo_container, container_peso_bruto_processo_container, container_peso_liquido_processo_container, container_metragem_cubica_processo_container, data_devolucao_prevista_processo_container, data_devolucao_real_processo_container, local_devolucao_processo_container, processo_processo_container

**ProcessoFatura** (12): id_processo_fatura, id_organizacao, id_workspace, id_processo, tipo_fatura_processo_fatura, numero_fatura_processo_fatura, moeda_fatura_processo_fatura, valor_total_processo_fatura, valor_pago_processo_fatura, data_vencimento_processo_fatura, status_pagamento_processo_fatura, processo_processo_fatura

**ProcessoItem** (19): id_processo_item, id_organizacao, id_workspace, id_processo, id_pedido_item, sequencia_item_processo_item, part_number_processo_item, ncm_processo_item, descricao_po_processo_item, descricao_en_processo_item, quantidade_processo_item, unidade_comercializada_item_processo_item, valor_unitario_processo_item, valor_total_processo_item, peso_liquido_unitario_processo_item, peso_bruto_unitario_processo_item, detalhes_do_produto_processo_item, pedido_item_processo_item, processo_processo_item

**PedidoTemplate** (8): nome_template_pedido, id_template_pedido, id_produto_gravity, id_organizacao, descricao_template_pedido, data_criacao_template_pedido, data_atualizacao_template_pedido, conteudo_html_template_pedido

**PedidoTransferencia** (18): revertido_pedido_transferencia, revertido_por_pedido_transferencia, data_reversao_pedido_transferencia, quantidade_pedido_transferencia, pedido_origem, id_pedido_transferencia, id_produto_gravity, id_pedido_origem, id_organizacao, id_item_origem, destinos_pedido_transferencia, data_transferencia_pedido_transferencia, data_criacao_pedido_transferencia, criado_por_pedido_transferencia, cenario_pedido_transferencia, — (não existe no banco)_pedido_transferencia, — (não existe no banco)_pedido_transferencia, — (não existe no banco)_pedido_transferencia

**EmailRegistroEnvio** (19): id_email_registro_envio, id_organizacao, id_produto_gravity, id_usuario, destinatario_email_registro_envio, remetente_email_registro_envio, responder_para_email_registro_envio, assunto_email_registro_envio, id_template_email, status_email_registro_envio, id_resend, dedup_key_email_registro_envio, tentativas_email_registro_envio, max_tentativas_email_registro_envio, data_proxima_tentativa_email_registro_envio, mensagem_erro_email_registro_envio, data_envio_email_registro_envio, data_criacao_email_registro_envio, data_atualizacao_email_registro_envio

**EscopoTokenServico** (1): nan

**EmailTemplate** (14): id_template_email, id_organizacao, id_produto_gravity, id_usuario, nome_template_email, slug_template_email, assunto_template_email, corpo_html_template_email, corpo_texto_template_email, variaveis_template_email, ativo_template_email, descricao_template_email, data_criacao_template_email, data_atualizacao_template_email

**Empresa** (32): — (não existe no banco)_empresa, suid_empresa, id_organizacao, nome_empresa, cnpj_empresa, tin_empresa, pais_empresa, estado_empresa, cidade_empresa, endereco_empresa, zipcode_empresa, email_empresa, telefone_empresa, whatsapp_empresa, pode_ser_importador_empresa, pode_ser_exportador_empresa, pode_ser_fabricante_empresa, pode_ser_agente_empresa, pode_ser_despachante_empresa, pode_ser_armazem_alfandegado_empresa, pode_ser_transportadora_rodoviaria_nacional_empresa, pode_ser_armador_empresa, pode_ser_cia_aerea_empresa, pode_ser_transportadora_rodoviaria_internacional_empresa, pode_ser_seguradora_internacional_empresa, pode_ser_corretora_cambio_empresa, pode_ser_banco_empresa, pode_ser_armazem_nacional_empresa, ativo_empresa, criado_em_empresa, atualizado_em_empresa, — (não existe no banco)_empresa

**ExportarJob** (13): id_exportar_job, id_organizacao, id_produto_gravity, id_usuario, id_relatorios_salvos, status_exportar_job, formato_exportar_job, url_arquivo_exportar_job, erro_exportar_job, data_inicio_exportar_job, data_conclusao_exportar_job, data_criacao_exportar_job, data_atualizacao_exportar_job

**ExportarResultado** (10): id_exportar_resultado, id_organizacao, formato_exportar_resultado, conteudo_exportar_resultado, status_exportar_resultado, quantidade_registros_exportar_resultado, filtros_exportar_resultado, erro_exportar_resultado, data_criacao_exportar_resultado, data_expiracao_exportar_resultado

**FaturaStatus** (1): nan

**ExternalContact** (10): id_contato, id_organizacao, id_usuario_criador_contato, nome_contato, email_contato, whatsapp_telefone_contato, data_consentimento_whatsapp_contato, notas_contato, data_criacao_contato, data_atualizacao_contato

**GabiConversaCompleta** (8): id_conversa_completa_gabi, id_organizacao, id_produto_gravity, id_usuario, titulo_conversa_completa_gabi, data_criacao_conversa_completa_gabi, data_atualizacao_conversa_completa_gabi, mensagens_conversa_completa_gabi

**GabiLogUso** (13): id_gabi_log_uso, id_organizacao, id_produto_gravity, id_usuario, id_produto_gravity, snapshot_conversa_gabi_log_uso, tipo_ator_gabi_log_uso, disparado_por_gabi_log_uso, modelo_usado_gabi_log_uso, tokens_entrada_gabi_log_uso, tokens_saida_gabi_log_uso, custo_usd_gabi_log_uso, data_criacao_gabi_log_uso

**GabiMensagemIndividual** (11): id_mensagem_individual_gabi, id_organizacao, id_produto_gravity, id_usuario, id_conversa_completa_gabi, conversa_completa_gabi, papel_mensagem_individual_gabi, conteudo_mensagem_individual_gabi, anexos_mensagem_individual_gabi, data_criacao_mensagem_individual_gabi, data_atualizacao_mensagem_individual_gabi

**GabiPersonalizacaoOrganizacao** (10): id_personalizacao_organizacao_gabiai, id_organizacao, id_produto_gravity, prompt_sistema_personalizacao_organizacao_gabi, tom_voz_personalizacao_organizacao_gabi, limitacoes_personalizacao_organizacao_gabi, instrucoes_extras_personalizacao_organizacao_gabi, ativo_personalizacao_organizacao_gabi, data_criacao_personalizacao_organizacao_gabi, data_atualizacao_personalizacao_organizacao_gabi

**GabiTokensConsumidos** (10): id_gabi_token_consumidos, id_organizacao, id_produto_gravity, id_usuario, nome_campo_gabi_token_consumidos, tokens_entrada_gabi_token_consumidos, tokens_saida_gabi_token_consumidos, tokens_total_gabi_token_consumidos, mes_referencia_gabi_token_consumidos, data_criacao_gabi_token_consumidos

**GabiTokensWorkspace** (7): id_gabi_token_workspace, id_organizacao, id_produto_gravity, quota_mensal_gabi_token_workspace, mes_referencia_gabi_token_workspace, tokens_usados_gabi_token_workspace, data_atualizacao_gabi_token_workspace

**HistoricoLog** (20): id_historico_log, id_organizacao, tipo_ator_historico_log, id_ator, nome_ator_historico_log, ip_ator_historico_log, metadados_ator_historico_log, modulo_historico_log, tipo_recurso_historico_log, id_recurso, acao_historico_log, detalhe_acao_historico_log, antes_historico_log, depois_historico_log, status_historico_log, mensagem_erro_historico_log, hash_integridade_historico_log, id_produto_gravity, id_usuario, data_criacao_historico_log

**LlmMetricas** (12): id_metricas_gemini, nome_llm_metricas, data_analise_llm_metrica, total_analise_llm_metricas, total_token_llm_metricas, custo_llm_metricas, latencia_llm_metricas, confianca_alta_llm_metricas, confianca_media_llm_metricas, confianca_baixa_llm_metricas, quantidade_codigo_validado_llm_metricas, data_criacao_metricas

**Kanban** (19): — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban, — (não existe no banco)_kanban

**MapeamentoErp** (5): — (não existe no banco)_mapeamento_erp, — (não existe no banco)_mapeamento_erp, — (não existe no banco)_mapeamento_erp, — (não existe no banco)_mapeamento_erp, — (não existe no banco)_mapeamento_erp

**ModoDashboard** (1): nan

**NcmItem** (20): id_ncm_item, id_organizacao, id_produto_gravity, id_usuario, codigo_ncm_item, descricao_ncm_item, ativo_ncm_item, data_inicio_ncm_item, data_fim_ncm_item, id_ncm_sync_log, data_criacao_ncm_item, data_atualizacao_ncm_item, — (não existe no banco)_ncm_item, — (não existe no banco)_ncm_item, — (não existe no banco)_ncm_item, — (não existe no banco)_ncm_item, — (não existe no banco)_ncm_item, — (não existe no banco)_ncm_item, — (não existe no banco)_ncm_item, — (não existe no banco)_ncm_item

**NcmScheduleConfig** (9): id_ncm_schedule_config, id_organizacao, id_produto_gravity, id_usuario, ativo_ncm_schedule_config, cron_expressao_ncm_schedule_config, notificadores_ncm_schedule_config, data_criacao_ncm_schedule_config, data_atualizacao_ncm_schedule_config

**NegociacaoEspecial** (1): agreement_negociacao_especial

**NcmSyncLog** (16): id_ncm_sync_log, id_organizacao, id_produto_gravity, id_usuario, data_inicio_ncm_sync_log, data_conclusao_ncm_sync_log, status_ncm_sync_log, total_ncm_sync_log, adicionados_ncm_sync_log, alterados_ncm_sync_log, removidos_ncm_sync_log, origem_ncm_sync_log, disparado_por_ncm_sync_log, mensagem_erro_ncm_sync_log, data_criacao_ncm_sync_log, data_atualizacao_ncm_sync_log

**Organizacao** (20): id_organizacao, nome_organizacao, slug_organizacao, status_organizacao, id_clerk_org, nan, suid_empresa_organizacao, cnpj_organizacao, estado_organizacao, cidade_organizacao, segmento_organizacao, tipo_empresa_organizacao, data_criacao_organizacao, data_atualizacao_organizacao, usuarios_organizacao, assinaturas_produto_gravity_organizacao, permissao_usuario_organizacao, workspace_organizacao, configuracoes_produto_gravity_organizacao, produtos_gravity_workspace_organizacao

**OrganizacaoFornecedor** (6): id_fornecedor_organizacao, id_usuario_clerk, id_organizacao, status_organizacao_fornecedor, data_criacao_organizacao_fornecedor, data_atualizacao_organizacao_fornecedor

**PermissaoAdminGravity** (7): id_permissao_admin, id_admin, recurso_permissao_admin, acao_permissao_admin, concedido_por_permissao_admin, data_criacao_permissao_admin, data_atualizacao_permissao_admin

**NotificacoesInterna** (14): id_notificacoes_titulo_corpo, id_organizacao, id_produto_gravity, id_usuario, tipo_notificacoes_titulo_corpo, titulo_notificacoes_titulo_corpo, mensagem_notificacoes_titulo_corpo, lida_notificacoes_titulo_corpo, tipo_alvo_notificacoes_titulo_corpo, id_alvo_notificacoes_titulo_corpo, status_entrega_notificacoes_titulo_corpo, id_externo_notificacoes_titulo_corpo, data_criacao_notificacoes_titulo_corpo, data_atualizacao_notificacoes_titulo_corpo

**ProdutoGravity** (31): id_produto_gravity, nome_produto_gravity, slug_produto_gravity, descricao_produto_gravity, status_produto_gravity, data_lancamento_produto_gravity, tem_setup_produto_gravity, valor_setup_produto_gravity, moeda_setup_produto_gravity, tipo_cobranca_produto_gravity, valor_unitario_produto_gravity, moeda_unitaria_produto_gravity, valor_minimo_produto_gravity, moeda_minima_produto_gravity, valor_total_produto_gravity, moeda_total_produto_gravity, tipo_limite_usuario_produto_gravity, quantidade_usuarios_base_produto_gravity, valor_usuario_extra_produto_gravity, moeda_usuario_extra_produto_gravity, horas_help_desk_produto_gravity, valor_hora_extra_help_desk_produto_gravity, moeda_valor_hora_extra_help_desk_produto_gravity, gabi_quota_mensal_produto_gravity, modulo_backend_produto_gravity, target_audience_produto_gravity, data_criacao_produto_gravity , data_atualizacao_produto_gravity, data_exclusao_produto_gravity, faixas_preco_produto_gravity, negociacoes_especiais_produto_gravity

**ProdutoGravityAssinatura** (3): id_assinatura_produto_gravity, id_organizacao, status_assinatura

**ProdutoGravityConfiguracao** (8): id_configuracao_produto, id_organizacao, product_key_configuracao_produto, parametros_configuracao_produto, e_ativo_configuracao_produto, data_criacao_configuracao_produto, data_atualizacao_configuracao_produto, id_organizacao

**ProdutoGravityFaixaPreco** (8): id_faixa_preco_produto_gravity, id_produto_gravity, faixa_de_preco_produto_gravity, faixa_ate_preco_produto_gravity, preco_faixa_produto_gravity, moeda_faixa_preco_produto_gravity, data_criacao_faixa_preco_produto_gravity, produto_gravity_faixa_preco

**ProdutoGravityFatura** (12): id_fatura_produtos_gravity, id_organizacao, numero_fatura_produtos_gravity, status_fatura_produtos_gravity, organizacao_fatura_produtos_gravity, email_organizacao_fatura_produtos_gravity, valor_total_fatura_produtos_gravity, moeda_fatura_produtos_gravity, competencia_fatura_produtos_gravity, data_fatura_produtos_gravity, data_criacao_fatura_produtos_gravity, data_atualizacao_fatura_produtos_gravity

**ProdutoGravityNegociacaoEspecial** (10): id_negociacao_especial, id_produto_gravity, id_organizacao, nome_workspace_negociacao_especial, inicio_negociacao_especial_valor_produto_gravity, fim_negociacao_especial_valor_produto_gravity, ilimitado_negociacao_especial_valor_produto_gravity, data_criacao_negociacao_especial_valor_produto_gravity, data_utilizacao_negociacao_especial_valor_produto_gravity, produto_negociacao_especial_valor_produto_gravity

**ProdutoGravityWorkspace** (9): id_produto_gravity_workspace, id_organizacao, id_workspace, id_produto_gravity_workspace, ativo_produto_gravity_workspace, data_criacao_produto_gravity_workspace, ata_atualizacao_produto_gravity_workspace, id_organizacao, id_workspace

**NotificacoesTituloCorpo** (7): — (não existe no banco)_notificacoes_titulo_corpo, — (não existe no banco)_notificacoes_titulo_corpo, — (não existe no banco)_notificacoes_titulo_corpo, — (não existe no banco)_notificacoes_titulo_corpo, — (não existe no banco)_notificacoes_titulo_corpo, — (não existe no banco)_notificacoes_titulo_corpo, — (não existe no banco)_notificacoes_titulo_corpo

**RelatoriosConfiguracao** (11): id_relatorios_configuracao, id_organizacao, id_produto_gravity, id_usuario, id_relatorios_salvos, frequencia_relatorios_configuracao, canais_relatorios_configuracao, formato_relatorios_configuracao, ativo_relatorios_configuracao, data_criacao_relatorios_configuracao, data_atualizacao_relatorios_configuracao

**RelatoriosSalvos** (16): id_relatorios_salvos, id_organizacao, id_produto_gravity, id_usuario, nome_relatorios_salvos, tabelas_relatorios_salvos, colunas_relatorios_salvos, filtros_relatorios_salvos, tipo_join_relatorios_salvos, compartilhado_relatorios_salvos, data_criacao_relatorios_salvos, data_atualizacao_relatorios_salvos, — (não existe no banco)_relatorios_salvos, — (não existe no banco)_relatorios_salvos, — (não existe no banco)_relatorios_salvos, — (não existe no banco)_relatorios_salvos

**Requisicoes** (10): id_requisicoes, key_requisicoes, id_organizacao, ip_requisicoes, endpoint_requisicoes, numero_requisicoes, limite_maximo_requisicoes, bloqueadas_requisicoes, inicio_janela_requisicoes, data_criacao_requisicoes

**Seguranca** (15): id_seguranca, id_organizacao, id_ator_seguranca, tipo_ator_seguranca, acao_seguranca, severidade_seguranca, status_seguranca, descricao_seguranca, ip_seguranca, endpoint_seguranca, id_usuario, id_produto_gravity, id_correlacao_seguranca, metadados_seguranca, data_criacao_seguranca

**Servicos** (9): id_servicos, nome_servicos, url_servicos, status_servicos, latencia_ms_servicos, ultimo_erro_servicos, data_verificacao_servicos ou verificado_em_servicos, data_criacao_servicos, data_atualizacao_servicos

**RelatorioTempoCriacao** (10): id_tempo_criacao_relatorio, id_organizacao, id_usuario, id_produto_gravity, data_inicio_periodo_tempo_criacao_relatorio, data_fim_periodo_tempo_criacao_relatorio, total_minutos_tempo_criacao_relatorio, payload_tempo_criacao_relatorio, data_calculo_tempo_criacao_relatorio, data_expiracao_tempo_criacao_relatorio

**StatusAssinatura** (1): nan

**StatusDeploy** (1): nan

**Reserva** (10): id_reserva, id_organizacao, id_slot, id_usuario, nome_reserva, email_reserva, status_reserva, criadoEm_reserva, atualizadoEm_reserva, slot_reserva

**StatusEmpresa** (1): nan

**StatusOrganizacao** (1): nan

**StatusProduto** (1): nan

**Slot** (13): id_slot, id_organizacao, id_agenda, inicio_slot, fim_slot, capacidade_slot, criadoEm_slot, atualizadoEm_slot, agenda_slot, reservas_slot, — (não existe no banco)_slot, — (não existe no banco)_slot, — (não existe no banco)_slot

**NotificacaoCanalConfiguracao** (7): id_notificacao_canal_configuracao, id_organizacao, email_habilitado_notificacao_canal_configuracao, whatsapp_habilitado_notificacao_canal_configuracao, id_usuario_atualizador_notificacao_canal_configuracao, data_criacao_notificacao_canal_configuracao, data_atualizacao_notificacao_canal_configuracao

**Teste** (22): id_plano_teste, id_organizacao, versao_plano_teste, tipo_plano_teste, escopo_plano_teste, sublocal_plano_teste, tela_plano_teste, rota_plano_teste, criticidade_plano_teste, ambientes_plano_teste, componente_path_plano_teste, spec_path_plano_teste, mapeamento_path_plano_teste, cobertura_pct_plano_teste, passos_total_plano_teste, resumo_executivo_plano_teste, plano_completo_plano_teste, status_plano_teste, ultima_execucao_plano_teste, ultimo_resultado_plano_teste, data_criacao_plano_teste, data_atualizacao_plano_teste

**TesteAgendamento** (14): id_agendamento_teste, id_organizacao, ativo_teste, frequencia_teste, hora_teste, minuto_teste, tipos_teste, escopos_teste, ambiente_teste, alertas_teste, ultima_execucao_teste, proxima_execucao_teste, data_criacao_teste, data_atualizacao_teste

**Testes** (17): id_testes, id_organizacao, tipo_testes, escopo_testes, sublocal_testes, modulo_testes, nome_plano_testes, id_plano_teste_testes, resultado_testes, duracao_testes, log_erro_testes, analise_ia_testes, screenshot_testes, ambiente_testes, id_execucao_testes, gatilho_testes, data_criacao_testes

**TipoCobranca** (1): nan

**TipoLimiteUsuario** (1): nan

**TipoMembroEmpresa** (1): nan

**TipoUsuario** (1): nan

**UsuarioPreferencias** (11): id_preferencias_usuario, id_usuario, id_organizacao, tooltips_desabilitadas_preferencias_usuario, tema_preferencias_usuario, sidebar_aberta_preferencias_usuario, data_criacao_preferencias_usuario, data_atualizacao_preferencias_usuario, — (não existe no banco)_user_preferences, — (não existe no banco)_user_preferences, — (não existe no banco)_user_preferences

**Usuario** (13): id_usuario, id_organizacao, id_clerk_usuario, email_usuario, nome_usuario, tipo_usuario, id_workspace_preferido_usuario, data_criacao_usuario, data_atualizacao_usuario, id_organizacao, workspace_preferido_usuario, permissoes_usuario, vinculos_usuario

**UsuarioPermissao** (11): id_usuario, id_organizacao, id_workspace, id_usuario, id_produto_gravity, selecao_permissoes_usuario, concedido_por_usuario_permissao, data_criacao_usuario_permissao, data_atualizacao_usuario_permissao, id_organizacao, id_usuario

**OPEHistóricoStatus** (7): id_historico_status_ope, suid_ope_, status_anterior_historico_status_ope, status_novo_historico_status_ope, origem_historico_status_ope, payload_historico_status_ope, registrado_em_historico_status_ope

**Moeda** (4): codigo_moeda, nome_moeda, simbolo_moeda, ativo_moeda

**NCM** (7): codigo_ncm, descricao_ncm, ii_ncm, ipi_ncm, pis_ncm, cofins_ncm, ativo_ncm

**OPE** (16): suid_ope, id_organizacao_ope, codigo_portal_unico_ope, situacao_ope, versao_ope, nome_ope_ope, cnpj_raiz_empresa_ope, pais_ope, estado_ope, cidade_ope, endereco_ope, zip_ope, tin_ope, email_ope, ultima_sincronizacao_ope, origem_ope

**Unidade** (4): codigo_unidade, nome_unidade, tipo_unidade, ativo_unidade

**UsuarioWorkspace** (10): id_usuario, id_organizacao, id_usuario, id_workspace, tipo_usuario_workspace, ativo_usuario_workspace, data_criacao_usuario_workspace, data_atualizacao_usuario_workspace, id_usuario, id_workspace

**WhatsappConversa** (23): id_whatsapp_conversa, id_organizacao, id_produto_gravity, id_usuario, numero_telefone_whatsapp_conversa, status_whatsapp_conversa, id_contato_externo, id_workspace, nome_contato_whatsapp_conversa, nome_workspace_whatsapp_conversa, id_atividade_whatsapp_conversa, ia_habilitada_whatsapp_conversa, data_abertura_whatsapp_conversa, data_fechamento_whatsapp_conversa, gabi_temperatura_whatsapp_conversa, gabi_temperatura_score_whatsapp_conversa, gabi_resumo_whatsapp_conversa, gabi_acoes_sugeridas_whatsapp_conversa, data_criacao_whatsapp_conversa, data_atualizacao_whatsapp_conversa, — (não existe no banco)_whatsapp_conversa, — (não existe no banco)_whatsapp_conversa, — (não existe no banco)_whatsapp_conversa

**WhatsappLog** (11): id_whatsapp_log, id_organizacao, id_produto_gravity, id_usuario, id_whatsapp_conversa, id_workspace, categoria_conversa_whatsapp_log, origem_whatsapp_log, custo_usd_whatsapp_log, data_criacao_whatsapp_log, data_atualizacao_whatsapp_log

**WhatsappMensagem** (14): id_whatsapp_mensagem, id_organizacao, id_produto_gravity, id_usuario, id_whatsapp_conversa, id_wa_mensagem_whatsapp_mensagem, direcao_whatsapp_mensagem, tipo_conteudo_whatsapp_mensagem, conteudo_whatsapp_mensagem, origem_whatsapp_mensagem, enviado_por_whatsapp_mensagem, status_whatsapp_mensagem, data_criacao_whatsapp_mensagem, data_atualizacao_whatsapp_mensagem

**WhatsappRegra** (12): id_whatsapp_regra, id_organizacao, id_produto_gravity, id_usuario, nome_whatsapp_regra, gatilho_whatsapp_regra, condicoes_whatsapp_regra, id_template_email, destinatario_whatsapp_regra, ativa_whatsapp_regra, data_criacao_whatsapp_regra, data_atualizacao_whatsapp_regra

**Workspace** (14): id_workspace, id_organizacao_workspace, nome_workspace, subdominio_workspace, cnpj_workspace, status_workspace, data_criacao_workspace, data_atualizacao_workspace, organizacao_workspace, vinculos_usuario_workspace, produtos_gravity_workspace, usuario_preferenciais_workspace, — (não existe no banco)_workspace, — (não existe no banco)_workspace

**PedidoValorColunaUsuario** (8): vinculo_valor_coluna_usuario_pedido, valor_coluna_usuario_pedido, id_vinculo_valor_coluna_usuario_pedido, id_valor_coluna_usuario_pedido, id_produto_gravity, id_organizacao, id_coluna_usuario_pedido, coluna_valor_coluna_usuario_pedido