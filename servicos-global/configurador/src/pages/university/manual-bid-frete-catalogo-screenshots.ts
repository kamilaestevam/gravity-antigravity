/**
 * SSOT: Drive `6. Produtos Gravity/3. BID Frete Int`
 *   → `public/university/screenshots/bid-frete-int-*.png`
 * Copiar: `powershell -ExecutionPolicy Bypass -File scripts/copiar-screenshots-manual-bid-frete.ps1`
 * Regenerar exports: `node scripts/gerar-catalogo-screenshots-manual-bid-frete.mjs`
 *
 * Regra: `tela_bid_frete_int_{sufixo}` → `bid-frete-int-{sufixo com _ → -}.png`
 */

export const SCREENSHOTS_BID_FRETE_INT_BASE = '/university/screenshots'

export function screenshotBidFreteInt(sufixoDrive: string): string {
  const arquivo = sufixoDrive.replaceAll('_', '-')
  return `${SCREENSHOTS_BID_FRETE_INT_BASE}/bid-frete-int-${arquivo}.png`
}

/** Todos os prints copiados — chave = sufixo Drive (sem prefixo tela_bid_frete_int_). */
export const MAPA_SCREENSHOTS_BID_FRETE_INT: Record<string, string> = {
  'acesso_via_hub': '/university/screenshots/bid-frete-int-acesso-via-hub.png',
  'acesso_via_menu_lateral': '/university/screenshots/bid-frete-int-acesso-via-menu-lateral.png',
  'configuracoes_cards_desativar_1': '/university/screenshots/bid-frete-int-configuracoes-cards-desativar-1.png',
  'configuracoes_cards_desativar_2': '/university/screenshots/bid-frete-int-configuracoes-cards-desativar-2.png',
  'configuracoes_cards_incluir_2': '/university/screenshots/bid-frete-int-configuracoes-cards-incluir-2.png',
  'configuracoes_cards_incluir': '/university/screenshots/bid-frete-int-configuracoes-cards-incluir.png',
  'configuracoes_cards_periodo_de_comparacao': '/university/screenshots/bid-frete-int-configuracoes-cards-periodo-de-comparacao.png',
  'configuracoes_colunas_casas_decimais': '/university/screenshots/bid-frete-int-configuracoes-colunas-casas-decimais.png',
  'configuracoes_colunas_formato_datas': '/university/screenshots/bid-frete-int-configuracoes-colunas-formato-datas.png',
  'configuracoes_colunas_formato_personalizadas': '/university/screenshots/bid-frete-int-configuracoes-colunas-formato-personalizadas.png',
  'configuracoes_kanban_card_1': '/university/screenshots/bid-frete-int-configuracoes-kanban-card-1.png',
  'configuracoes_kanban_card_2': '/university/screenshots/bid-frete-int-configuracoes-kanban-card-2.png',
  'configuracoes_kanban_tela': '/university/screenshots/bid-frete-int-configuracoes-kanban-tela.png',
  'configuracoes_kanban': '/university/screenshots/bid-frete-int-configuracoes-kanban.png',
  'configuracoes_numeracao': '/university/screenshots/bid-frete-int-configuracoes-numeracao.png',
  'configuracoes_preferencia': '/university/screenshots/bid-frete-int-configuracoes-preferencia.png',
  'configuracoes_status': '/university/screenshots/bid-frete-int-configuracoes-status.png',
  'configuracoes_tabela': '/university/screenshots/bid-frete-int-configuracoes-tabela.png',
  'configuracoes_taxa_cambio': '/university/screenshots/bid-frete-int-configuracoes-taxa-cambio.png',
  'insight_1': '/university/screenshots/bid-frete-int-insight-1.png',
  'insight_2': '/university/screenshots/bid-frete-int-insight-2.png',
  'insight_3': '/university/screenshots/bid-frete-int-insight-3.png',
  'insight_controle_exibicao': '/university/screenshots/bid-frete-int-insight-controle-exibicao.png',
  'insight_mapa_acesso_cotacoes_1': '/university/screenshots/bid-frete-int-insight-mapa-acesso-cotacoes-1.png',
  'insight_mapa_acesso_cotacoes_2': '/university/screenshots/bid-frete-int-insight-mapa-acesso-cotacoes-2.png',
  'insight_mapa_acesso_cotacoes_3': '/university/screenshots/bid-frete-int-insight-mapa-acesso-cotacoes-3.png',
  'insight_mapa_acesso_cotacoes': '/university/screenshots/bid-frete-int-insight-mapa-acesso-cotacoes.png',
  'insight_mapa_seta': '/university/screenshots/bid-frete-int-insight-mapa-seta.png',
  'insight_menu_mapa_botoes_destino_resultado': '/university/screenshots/bid-frete-int-insight-menu-mapa-botoes-destino-resultado.png',
  'insight_menu_mapa_botoes_modal_resultado': '/university/screenshots/bid-frete-int-insight-menu-mapa-botoes-modal-resultado.png',
  'insight_menu_mapa_botoes_modal': '/university/screenshots/bid-frete-int-insight-menu-mapa-botoes-modal.png',
  'insight_menu_mapa_botoes_operacoes_resultado': '/university/screenshots/bid-frete-int-insight-menu-mapa-botoes-operacoes-resultado.png',
  'insight_menu_mapa_botoes_operacoes': '/university/screenshots/bid-frete-int-insight-menu-mapa-botoes-operacoes.png',
  'insight_menu_mapa_botoes_origem_resultado': '/university/screenshots/bid-frete-int-insight-menu-mapa-botoes-origem-resultado.png',
  'insight_menu_mapa_botoes_origem': '/university/screenshots/bid-frete-int-insight-menu-mapa-botoes-origem.png',
  'insight_menu_mapa_botoes_status': '/university/screenshots/bid-frete-int-insight-menu-mapa-botoes-status.png',
  'insight_menu_mapa_botoes': '/university/screenshots/bid-frete-int-insight-menu-mapa-botoes.png',
  'insight_menu_mapa_expandir_menu': '/university/screenshots/bid-frete-int-insight-menu-mapa-expandir-menu.png',
  'insight_menu_mapa_globo_mapa': '/university/screenshots/bid-frete-int-insight-menu-mapa-globo-mapa.png',
  'insight_menu_mapa_globo': '/university/screenshots/bid-frete-int-insight-menu-mapa-globo.png',
  'insight_menu_mapa_ocultar_exibir_linha_resultado': '/university/screenshots/bid-frete-int-insight-menu-mapa-ocultar-exibir-linha-resultado.png',
  'insight_menu_mapa_ocultar_exibir_linha': '/university/screenshots/bid-frete-int-insight-menu-mapa-ocultar-exibir-linha.png',
  'insight_menu_mapa_recolher_menu': '/university/screenshots/bid-frete-int-insight-menu-mapa-recolher-menu.png',
  'insight_menu_mapa_restaurar_mapa': '/university/screenshots/bid-frete-int-insight-menu-mapa-restaurar-mapa.png',
  'insight_menu_mapa_zoom_in_1': '/university/screenshots/bid-frete-int-insight-menu-mapa-zoom-in-1.png',
  'insight_menu_mapa_zoom_in_2': '/university/screenshots/bid-frete-int-insight-menu-mapa-zoom-in-2.png',
  'insight_menu_mapa_zoom_out_1': '/university/screenshots/bid-frete-int-insight-menu-mapa-zoom-out-1.png',
  'insight_menu_mapa_zoom_out_2': '/university/screenshots/bid-frete-int-insight-menu-mapa-zoom-out-2.png',
  'insight_menu_mapa': '/university/screenshots/bid-frete-int-insight-menu-mapa.png',
  'insight_modal_refinar_mapa': '/university/screenshots/bid-frete-int-insight-modal-refinar-mapa.png',
  'insight_tooltip_1_seta': '/university/screenshots/bid-frete-int-insight-tooltip-1-seta.png',
  'insight_tooltip_1_tela': '/university/screenshots/bid-frete-int-insight-tooltip-1-tela.png',
  'insight_tooltip_2_seta': '/university/screenshots/bid-frete-int-insight-tooltip-2-seta.png',
  'insight_tooltip_2_tela': '/university/screenshots/bid-frete-int-insight-tooltip-2-tela.png',
  'insight_tooltip_3': '/university/screenshots/bid-frete-int-insight-tooltip-3.png',
  'lista_cotacao_nova_1': '/university/screenshots/bid-frete-int-lista-cotacao-nova-1.png',
  'lista_cotacao_nova_2': '/university/screenshots/bid-frete-int-lista-cotacao-nova-2.png',
  'lista_cotacao_nova_cotacao_avulsa_': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_gerada_aviso': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-gerada-aviso.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_aereo': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-01-modal-selecionado-aereo.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_maritimo': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-01-modal-selecionado-maritimo.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_rodoviario': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-01-modal-selecionado-rodoviario.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-01-modal.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_01_numero_cotacao': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-01-numero-cotacao.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_01_tipo_operacao_selecionado': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-01-tipo-operacao-selecionado.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_01_tipo_operacao': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-01-tipo-operacao.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_destino_campos': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-local-destino-campos.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_destino_seta': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-local-destino-seta.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_origem_campos': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-local-origem-campos.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_origem_seta': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-local-origem-seta.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_adicionar_seta': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-destino-portos-preferenciais-adicionar-seta.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_novo_preenchido': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-destino-portos-preferenciais-novo-preenchido.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_segundo': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-destino-portos-preferenciais-segundo.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_seta': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-destino-portos-preferenciais-seta.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_selecao': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-destino-selecao.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_selecionado': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-destino-selecionado.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_seta': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-destino-seta.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais_adicionar_novo_porto': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-embarque-portos-preferenciais-adicionar-novo-porto.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais_adicionar_porto': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-embarque-portos-preferenciais-adicionar-porto.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais_novo_porto': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-embarque-portos-preferenciais-novo-porto.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-embarque-portos-preferenciais.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_selecionado': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-embarque-selecionado.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_selecionar': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-embarque-selecionar.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-maritimo-porto-embarque.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_MODAL': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-MODAL.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_02_proximo': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-02-proximo.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_cubagem_1': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-cubagem-1.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_cubagem_modal_preenchido': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-cubagem-modal-preenchido.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_cubagem_modal': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-cubagem-modal.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_descricao': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-descricao.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_hs_code': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-hs-code.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_incoterm': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-incoterm.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_nao_encontrado': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-ncm-nao-encontrado.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_modal': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-ncm-pesquisar-modal.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_ncm_resultado': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-ncm-pesquisar-ncm-resultado.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_ncm_ultima_sincronizacao': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-ncm-pesquisar-ncm-ultima-sincronizacao.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_palavra_resultado': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-ncm-pesquisar-palavra-resultado.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_seta': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-ncm-pesquisar-seta.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_seta': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-ncm-seta.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_proximo': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-proximo.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_air_lcl_rodo_adicionado_container': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-air-lcl-rodo-adicionado-container.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_air_lcl_rodo_adicionar_container': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-air-lcl-rodo-adicionar-container.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_excluir_container': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-excluir-container.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_fcl_tela_1': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-fcl-tela-1.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_fcl_tela_2': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-fcl-tela-2.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_1': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-lcl-tela-1.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_2': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-lcl-tela-2.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_3': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-lcl-tela-3.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_4': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-lcl-tela-4.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_tela_air_lcl_rodo_quantidade': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-tela-air-lcl-rodo-quantidade.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_tela_fcl_3': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-tipo-volume-tela-fcl-3.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_03_valor_alvo': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-03-valor-alvo.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_04_modal_01': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-04-modal-01.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_04_modal_novo_armazem': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-04-modal-novo-armazem.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_04_modal': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-04-modal.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_04_proximo': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-04-proximo.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_alterar_proposta_configuracaoes': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-alterar-proposta-configuracaoes.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_alterar_proposta_tela': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-alterar-proposta-tela.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_alterar_proposta': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-alterar-proposta.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_calendario': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-calendario.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_1': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-envio-1.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_adicionar_email_1': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-envio-adicionar-email-1.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_adicionar_email_2': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-envio-adicionar-email-2.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_editar_1': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-envio-editar-1.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_editar_2': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-envio-editar-2.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_editar': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-envio-editar.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_excluir_1': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-envio-excluir-1.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_selecionar_fornecedores_emails': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-envio-selecionar-fornecedores-emails.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_hora': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-hora.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_visibilidade_anonima': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-visibilidade-anonima.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_visibilidade_direcionada_aberta': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal-visibilidade-direcionada-aberta.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-05-modal.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_06_modal_1': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-06-modal-1.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_passo_06_modal_2': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-passo-06-modal-2.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_processo_cotacao_solicitacao': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-processo-cotacao-solicitacao.png',
  'lista_cotacao_nova_cotacao_avulsa_manual_processo_cotacao': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual-processo-cotacao.png',
  'lista_cotacao_nova_cotacao_avulsa_manual': '/university/screenshots/bid-frete-int-lista-cotacao-nova-cotacao-avulsa-manual.png',
  'lista_localizar': '/university/screenshots/bid-frete-int-lista-localizar.png',
  'lista_paineis_editar_1': '/university/screenshots/bid-frete-int-lista-paineis-editar-1.png',
  'lista_paineis_editar_2': '/university/screenshots/bid-frete-int-lista-paineis-editar-2.png',
  'lista_paineis_NOVO_1': '/university/screenshots/bid-frete-int-lista-paineis-NOVO-1.png',
  'lista_paineis_NOVO_2': '/university/screenshots/bid-frete-int-lista-paineis-NOVO-2.png',
  'lista_paineis_NOVO_3': '/university/screenshots/bid-frete-int-lista-paineis-NOVO-3.png',
  'lista_paineis': '/university/screenshots/bid-frete-int-lista-paineis.png',
  'lista_tooltip_1': '/university/screenshots/bid-frete-int-lista-tooltip-1.png',
  'lista_tooltip_2': '/university/screenshots/bid-frete-int-lista-tooltip-2.png',
  'lista_tooltip_3': '/university/screenshots/bid-frete-int-lista-tooltip-3.png',
  'lista': '/university/screenshots/bid-frete-int-lista.png',
}

// ── Atalhos nomeados (imports diretos nos conteudos) ──

export const SCREENSHOT_BID_FRETE_INT_ACESSO_VIA_HUB = screenshotBidFreteInt('acesso_via_hub')
export const SCREENSHOT_BID_FRETE_INT_ACESSO_VIA_MENU_LATERAL = screenshotBidFreteInt('acesso_via_menu_lateral')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CARDS_DESATIVAR_1 = screenshotBidFreteInt('configuracoes_cards_desativar_1')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CARDS_DESATIVAR_2 = screenshotBidFreteInt('configuracoes_cards_desativar_2')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CARDS_INCLUIR_2 = screenshotBidFreteInt('configuracoes_cards_incluir_2')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CARDS_INCLUIR = screenshotBidFreteInt('configuracoes_cards_incluir')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CARDS_PERIODO_DE_COMPARACAO = screenshotBidFreteInt('configuracoes_cards_periodo_de_comparacao')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_COLUNAS_CASAS_DECIMAIS = screenshotBidFreteInt('configuracoes_colunas_casas_decimais')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_COLUNAS_FORMATO_DATAS = screenshotBidFreteInt('configuracoes_colunas_formato_datas')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_COLUNAS_FORMATO_PERSONALIZADAS = screenshotBidFreteInt('configuracoes_colunas_formato_personalizadas')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN_CARD_1 = screenshotBidFreteInt('configuracoes_kanban_card_1')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN_CARD_2 = screenshotBidFreteInt('configuracoes_kanban_card_2')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN_TELA = screenshotBidFreteInt('configuracoes_kanban_tela')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN = screenshotBidFreteInt('configuracoes_kanban')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_NUMERACAO = screenshotBidFreteInt('configuracoes_numeracao')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_PREFERENCIA = screenshotBidFreteInt('configuracoes_preferencia')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_STATUS = screenshotBidFreteInt('configuracoes_status')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_TABELA = screenshotBidFreteInt('configuracoes_tabela')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_TAXA_CAMBIO = screenshotBidFreteInt('configuracoes_taxa_cambio')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_1 = screenshotBidFreteInt('insight_1')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_2 = screenshotBidFreteInt('insight_2')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_3 = screenshotBidFreteInt('insight_3')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_CONTROLE_EXIBICAO = screenshotBidFreteInt('insight_controle_exibicao')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MAPA_ACESSO_COTACOES_1 = screenshotBidFreteInt('insight_mapa_acesso_cotacoes_1')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MAPA_ACESSO_COTACOES_2 = screenshotBidFreteInt('insight_mapa_acesso_cotacoes_2')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MAPA_ACESSO_COTACOES_3 = screenshotBidFreteInt('insight_mapa_acesso_cotacoes_3')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MAPA_ACESSO_COTACOES = screenshotBidFreteInt('insight_mapa_acesso_cotacoes')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MAPA_SETA = screenshotBidFreteInt('insight_mapa_seta')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_BOTOES_DESTINO_RESULTADO = screenshotBidFreteInt('insight_menu_mapa_botoes_destino_resultado')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_BOTOES_MODAL_RESULTADO = screenshotBidFreteInt('insight_menu_mapa_botoes_modal_resultado')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_BOTOES_MODAL = screenshotBidFreteInt('insight_menu_mapa_botoes_modal')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_BOTOES_OPERACOES_RESULTADO = screenshotBidFreteInt('insight_menu_mapa_botoes_operacoes_resultado')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_BOTOES_OPERACOES = screenshotBidFreteInt('insight_menu_mapa_botoes_operacoes')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_BOTOES_ORIGEM_RESULTADO = screenshotBidFreteInt('insight_menu_mapa_botoes_origem_resultado')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_BOTOES_ORIGEM = screenshotBidFreteInt('insight_menu_mapa_botoes_origem')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_BOTOES_STATUS = screenshotBidFreteInt('insight_menu_mapa_botoes_status')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_BOTOES = screenshotBidFreteInt('insight_menu_mapa_botoes')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_EXPANDIR_MENU = screenshotBidFreteInt('insight_menu_mapa_expandir_menu')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_GLOBO_MAPA = screenshotBidFreteInt('insight_menu_mapa_globo_mapa')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_GLOBO = screenshotBidFreteInt('insight_menu_mapa_globo')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_OCULTAR_EXIBIR_LINHA_RESULTADO = screenshotBidFreteInt('insight_menu_mapa_ocultar_exibir_linha_resultado')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_OCULTAR_EXIBIR_LINHA = screenshotBidFreteInt('insight_menu_mapa_ocultar_exibir_linha')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_RECOLHER_MENU = screenshotBidFreteInt('insight_menu_mapa_recolher_menu')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_RESTAURAR_MAPA = screenshotBidFreteInt('insight_menu_mapa_restaurar_mapa')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_ZOOM_IN_1 = screenshotBidFreteInt('insight_menu_mapa_zoom_in_1')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_ZOOM_IN_2 = screenshotBidFreteInt('insight_menu_mapa_zoom_in_2')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_ZOOM_OUT_1 = screenshotBidFreteInt('insight_menu_mapa_zoom_out_1')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA_ZOOM_OUT_2 = screenshotBidFreteInt('insight_menu_mapa_zoom_out_2')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MENU_MAPA = screenshotBidFreteInt('insight_menu_mapa')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_MODAL_REFINAR_MAPA = screenshotBidFreteInt('insight_modal_refinar_mapa')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_TOOLTIP_1_SETA = screenshotBidFreteInt('insight_tooltip_1_seta')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_TOOLTIP_1_TELA = screenshotBidFreteInt('insight_tooltip_1_tela')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_TOOLTIP_2_SETA = screenshotBidFreteInt('insight_tooltip_2_seta')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_TOOLTIP_2_TELA = screenshotBidFreteInt('insight_tooltip_2_tela')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_TOOLTIP_3 = screenshotBidFreteInt('insight_tooltip_3')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_1 = screenshotBidFreteInt('lista_cotacao_nova_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_2 = screenshotBidFreteInt('lista_cotacao_nova_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_ = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_GERADA_AVISO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_gerada_aviso')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_01_MODAL_SELECIONADO_AEREO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_aereo')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_01_MODAL_SELECIONADO_MARITIMO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_maritimo')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_01_MODAL_SELECIONADO_RODOVIARIO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_rodoviario')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_01_MODAL = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_01_NUMERO_COTACAO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_numero_cotacao')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_01_TIPO_OPERACAO_SELECIONADO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_tipo_operacao_selecionado')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_01_TIPO_OPERACAO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_tipo_operacao')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_LOCAL_DESTINO_CAMPOS = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_destino_campos')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_LOCAL_DESTINO_SETA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_destino_seta')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_LOCAL_ORIGEM_CAMPOS = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_origem_campos')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_LOCAL_ORIGEM_SETA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_origem_seta')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_DESTINO_PORTOS_PREFERENCIAIS_ADICIONAR_SETA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_adicionar_seta')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_DESTINO_PORTOS_PREFERENCIAIS_NOVO_PREENCHIDO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_novo_preenchido')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_DESTINO_PORTOS_PREFERENCIAIS_SEGUNDO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_segundo')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_DESTINO_PORTOS_PREFERENCIAIS_SETA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_seta')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_DESTINO_SELECAO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_selecao')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_DESTINO_SELECIONADO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_selecionado')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_DESTINO_SETA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_seta')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_EMBARQUE_PORTOS_PREFERENCIAIS_ADICIONAR_NOVO_PORTO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais_adicionar_novo_porto')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_EMBARQUE_PORTOS_PREFERENCIAIS_ADICIONAR_PORTO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais_adicionar_porto')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_EMBARQUE_PORTOS_PREFERENCIAIS_NOVO_PORTO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais_novo_porto')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_EMBARQUE_PORTOS_PREFERENCIAIS = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_EMBARQUE_SELECIONADO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_selecionado')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_EMBARQUE_SELECIONAR = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_selecionar')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MARITIMO_PORTO_EMBARQUE = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_MODAL = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_MODAL')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_02_PROXIMO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_proximo')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_CUBAGEM_1 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_cubagem_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_CUBAGEM_MODAL_PREENCHIDO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_cubagem_modal_preenchido')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_CUBAGEM_MODAL = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_cubagem_modal')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_DESCRICAO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_descricao')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_HS_CODE = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_hs_code')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_INCOTERM = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_incoterm')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_NCM_NAO_ENCONTRADO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_nao_encontrado')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_NCM_PESQUISAR_MODAL = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_modal')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_NCM_PESQUISAR_NCM_RESULTADO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_ncm_resultado')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_NCM_PESQUISAR_NCM_ULTIMA_SINCRONIZACAO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_ncm_ultima_sincronizacao')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_NCM_PESQUISAR_PALAVRA_RESULTADO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_palavra_resultado')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_NCM_PESQUISAR_SETA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_seta')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_NCM_SETA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_seta')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_PROXIMO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_proximo')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_AIR_LCL_RODO_ADICIONADO_CONTAINER = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_air_lcl_rodo_adicionado_container')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_AIR_LCL_RODO_ADICIONAR_CONTAINER = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_air_lcl_rodo_adicionar_container')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_EXCLUIR_CONTAINER = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_excluir_container')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_FCL_TELA_1 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_fcl_tela_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_FCL_TELA_2 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_fcl_tela_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_LCL_TELA_1 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_LCL_TELA_2 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_LCL_TELA_3 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_3')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_LCL_TELA_4 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_4')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_TELA_AIR_LCL_RODO_QUANTIDADE = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_tela_air_lcl_rodo_quantidade')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_TIPO_VOLUME_TELA_FCL_3 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_tela_fcl_3')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_03_VALOR_ALVO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_valor_alvo')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_04_MODAL_01 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_04_modal_01')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_04_MODAL_NOVO_ARMAZEM = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_04_modal_novo_armazem')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_04_MODAL = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_04_modal')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_04_PROXIMO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_04_proximo')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ALTERAR_PROPOSTA_CONFIGURACAOES = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_alterar_proposta_configuracaoes')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ALTERAR_PROPOSTA_TELA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_alterar_proposta_tela')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ALTERAR_PROPOSTA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_alterar_proposta')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_CALENDARIO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_calendario')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ENVIO_1 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ENVIO_ADICIONAR_EMAIL_1 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_adicionar_email_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ENVIO_ADICIONAR_EMAIL_2 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_adicionar_email_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ENVIO_EDITAR_1 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_editar_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ENVIO_EDITAR_2 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_editar_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ENVIO_EDITAR = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_editar')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ENVIO_EXCLUIR_1 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_excluir_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_ENVIO_SELECIONAR_FORNECEDORES_EMAILS = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_selecionar_fornecedores_emails')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_HORA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_hora')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_VISIBILIDADE_ANONIMA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_visibilidade_anonima')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL_VISIBILIDADE_DIRECIONADA_ABERTA = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_visibilidade_direcionada_aberta')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_05_MODAL = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_06_MODAL_1 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_06_modal_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PASSO_06_MODAL_2 = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_passo_06_modal_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PROCESSO_COTACAO_SOLICITACAO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_processo_cotacao_solicitacao')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL_PROCESSO_COTACAO = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual_processo_cotacao')
export const SCREENSHOT_BID_FRETE_INT_LISTA_COTACAO_NOVA_COTACAO_AVULSA_MANUAL = screenshotBidFreteInt('lista_cotacao_nova_cotacao_avulsa_manual')
export const SCREENSHOT_BID_FRETE_INT_LISTA_LOCALIZAR = screenshotBidFreteInt('lista_localizar')
export const SCREENSHOT_BID_FRETE_INT_LISTA_PAINEIS_EDITAR_1 = screenshotBidFreteInt('lista_paineis_editar_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_PAINEIS_EDITAR_2 = screenshotBidFreteInt('lista_paineis_editar_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_PAINEIS_NOVO_1 = screenshotBidFreteInt('lista_paineis_NOVO_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_PAINEIS_NOVO_2 = screenshotBidFreteInt('lista_paineis_NOVO_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_PAINEIS_NOVO_3 = screenshotBidFreteInt('lista_paineis_NOVO_3')
export const SCREENSHOT_BID_FRETE_INT_LISTA_PAINEIS = screenshotBidFreteInt('lista_paineis')
export const SCREENSHOT_BID_FRETE_INT_LISTA_TOOLTIP_1 = screenshotBidFreteInt('lista_tooltip_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_TOOLTIP_2 = screenshotBidFreteInt('lista_tooltip_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_TOOLTIP_3 = screenshotBidFreteInt('lista_tooltip_3')
export const SCREENSHOT_BID_FRETE_INT_LISTA = screenshotBidFreteInt('lista')
