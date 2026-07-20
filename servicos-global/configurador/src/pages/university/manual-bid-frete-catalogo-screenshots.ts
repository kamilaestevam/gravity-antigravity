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
  'aceite_fornecedor_frete_vencido_1': '/university/screenshots/bid-frete-int-aceite-fornecedor-frete-vencido-1.png',
  'aceite_fornecedor_frete_vencido_2': '/university/screenshots/bid-frete-int-aceite-fornecedor-frete-vencido-2.png',
  'aceite_fornecedor_frete_vencido_3': '/university/screenshots/bid-frete-int-aceite-fornecedor-frete-vencido-3.png',
  'aceite_fornecedor_frete_vencido_4': '/university/screenshots/bid-frete-int-aceite-fornecedor-frete-vencido-4.png',
  'acesso_aguardando_confirmacao_aprovacao_ok_fornecedor_01': '/university/screenshots/bid-frete-int-acesso-aguardando-confirmacao-aprovacao-ok-fornecedor-01.png',
  'acesso_via_hub': '/university/screenshots/bid-frete-int-acesso-via-hub.png',
  'acesso_via_menu_lateral': '/university/screenshots/bid-frete-int-acesso-via-menu-lateral.png',
  'cargo_incoterm_1': '/university/screenshots/bid-frete-int-cargo-incoterm-1.png',
  'cargo_incoterm_2': '/university/screenshots/bid-frete-int-cargo-incoterm-2.png',
  'configuracoes_cards_desativar_1': '/university/screenshots/bid-frete-int-configuracoes-cards-desativar-1.png',
  'configuracoes_cards_desativar_2': '/university/screenshots/bid-frete-int-configuracoes-cards-desativar-2.png',
  'configuracoes_cards_incluir_2': '/university/screenshots/bid-frete-int-configuracoes-cards-incluir-2.png',
  'configuracoes_cards_incluir': '/university/screenshots/bid-frete-int-configuracoes-cards-incluir.png',
  'configuracoes_cards_periodo_de_comparacao': '/university/screenshots/bid-frete-int-configuracoes-cards-periodo-de-comparacao.png',
  'configuracoes_casas_decimais_1': '/university/screenshots/bid-frete-int-configuracoes-casas-decimais-1.png',
  'configuracoes_casas_decimais': '/university/screenshots/bid-frete-int-configuracoes-casas-decimais.png',
  'configuracoes_colunas_casas_decimais': '/university/screenshots/bid-frete-int-configuracoes-colunas-casas-decimais.png',
  'configuracoes_colunas_formato_datas': '/university/screenshots/bid-frete-int-configuracoes-colunas-formato-datas.png',
  'configuracoes_colunas_formato_personalizadas': '/university/screenshots/bid-frete-int-configuracoes-colunas-formato-personalizadas.png',
  'configuracoes_formato_data': '/university/screenshots/bid-frete-int-configuracoes-formato-data.png',
  'configuracoes_kanban_1': '/university/screenshots/bid-frete-int-configuracoes-kanban-1.png',
  'configuracoes_kanban_2': '/university/screenshots/bid-frete-int-configuracoes-kanban-2.png',
  'configuracoes_kanban_3': '/university/screenshots/bid-frete-int-configuracoes-kanban-3.png',
  'configuracoes_kanban_card_1': '/university/screenshots/bid-frete-int-configuracoes-kanban-card-1.png',
  'configuracoes_kanban_card_2': '/university/screenshots/bid-frete-int-configuracoes-kanban-card-2.png',
  'configuracoes_kanban_tela': '/university/screenshots/bid-frete-int-configuracoes-kanban-tela.png',
  'configuracoes_kanban': '/university/screenshots/bid-frete-int-configuracoes-kanban.png',
  'configuracoes_numeracao': '/university/screenshots/bid-frete-int-configuracoes-numeracao.png',
  'configuracoes_personalizada_1': '/university/screenshots/bid-frete-int-configuracoes-personalizada-1.png',
  'configuracoes_personalizada_2': '/university/screenshots/bid-frete-int-configuracoes-personalizada-2.png',
  'configuracoes_personalizada_3': '/university/screenshots/bid-frete-int-configuracoes-personalizada-3.png',
  'configuracoes_personalizada_4': '/university/screenshots/bid-frete-int-configuracoes-personalizada-4.png',
  'configuracoes_personalizada_5': '/university/screenshots/bid-frete-int-configuracoes-personalizada-5.png',
  'configuracoes_personalizada_6': '/university/screenshots/bid-frete-int-configuracoes-personalizada-6.png',
  'configuracoes_preferencia': '/university/screenshots/bid-frete-int-configuracoes-preferencia.png',
  'configuracoes_status': '/university/screenshots/bid-frete-int-configuracoes-status.png',
  'configuracoes_tabela_1': '/university/screenshots/bid-frete-int-configuracoes-tabela-1.png',
  'configuracoes_tabela_2': '/university/screenshots/bid-frete-int-configuracoes-tabela-2.png',
  'configuracoes_tabela_atualizada': '/university/screenshots/bid-frete-int-configuracoes-tabela-atualizada.png',
  'configuracoes_tabela': '/university/screenshots/bid-frete-int-configuracoes-tabela.png',
  'configuracoes_taxa_cambio': '/university/screenshots/bid-frete-int-configuracoes-taxa-cambio.png',
  'confirmacao_criacao_cotacao_detalhamento': '/university/screenshots/bid-frete-int-confirmacao-criacao-cotacao-detalhamento.png',
  'confirmacao_criacao_cotacao_lista': '/university/screenshots/bid-frete-int-confirmacao-criacao-cotacao-lista.png',
  'confirmacao_criacao_cotacao': '/university/screenshots/bid-frete-int-confirmacao-criacao-cotacao.png',
  'confirmacao_lista': '/university/screenshots/bid-frete-int-confirmacao-lista.png',
  'confirmacao_modal': '/university/screenshots/bid-frete-int-confirmacao-modal.png',
  'cotacao_avulsa': '/university/screenshots/bid-frete-int-cotacao-avulsa.png',
  'cotacao_bid_1': '/university/screenshots/bid-frete-int-cotacao-bid-1.png',
  'cotacao_bid_modal_selec': '/university/screenshots/bid-frete-int-cotacao-bid-modal-selec.png',
  'cotacao_bid_modal': '/university/screenshots/bid-frete-int-cotacao-bid-modal.png',
  'dashboard': '/university/screenshots/bid-frete-int-dashboard.png',
  'destino_1': '/university/screenshots/bid-frete-int-destino-1.png',
  'destino_2': '/university/screenshots/bid-frete-int-destino-2.png',
  'email_comprador_aviso_resposta_cotacao': '/university/screenshots/bid-frete-int-email-comprador-aviso-resposta-cotacao.png',
  'exportar_': '/university/screenshots/bid-frete-int-exportar-.png',
  'exportar_1': '/university/screenshots/bid-frete-int-exportar-1.png',
  'exportar_2': '/university/screenshots/bid-frete-int-exportar-2.png',
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
  'insight_nova_cotacao_tela_1': '/university/screenshots/bid-frete-int-insight-nova-cotacao-tela-1.png',
  'insight_nova_cotacao_tela_2': '/university/screenshots/bid-frete-int-insight-nova-cotacao-tela-2.png',
  'insight_nova_cotacao_tela_3': '/university/screenshots/bid-frete-int-insight-nova-cotacao-tela-3.png',
  'insight_tooltip_1_seta': '/university/screenshots/bid-frete-int-insight-tooltip-1-seta.png',
  'insight_tooltip_1_tela': '/university/screenshots/bid-frete-int-insight-tooltip-1-tela.png',
  'insight_tooltip_2_seta': '/university/screenshots/bid-frete-int-insight-tooltip-2-seta.png',
  'insight_tooltip_2_tela': '/university/screenshots/bid-frete-int-insight-tooltip-2-tela.png',
  'insight_tooltip_3': '/university/screenshots/bid-frete-int-insight-tooltip-3.png',
  'insight_visao_globo_pausar': '/university/screenshots/bid-frete-int-insight-visao-globo-pausar.png',
  'insight_visão_globo_pausar': '/university/screenshots/bid-frete-int-insight-visão-globo-pausar.png',
  'insight_visao_globo': '/university/screenshots/bid-frete-int-insight-visao-globo.png',
  'insight_visão_globo': '/university/screenshots/bid-frete-int-insight-visão-globo.png',
  'insight_visao_mapa_restaurar': '/university/screenshots/bid-frete-int-insight-visao-mapa-restaurar.png',
  'insight_visão_mapa_restaurar': '/university/screenshots/bid-frete-int-insight-visão-mapa-restaurar.png',
  'insight_visao_mapa': '/university/screenshots/bid-frete-int-insight-visao-mapa.png',
  'insight_visão_mapa': '/university/screenshots/bid-frete-int-insight-visão-mapa.png',
  'kanban': '/university/screenshots/bid-frete-int-kanban.png',
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
  'lista_editar': '/university/screenshots/bid-frete-int-lista-editar.png',
  'lista_excluir_1': '/university/screenshots/bid-frete-int-lista-excluir-1.png',
  'lista_excluir_2': '/university/screenshots/bid-frete-int-lista-excluir-2.png',
  'lista_filtro_1': '/university/screenshots/bid-frete-int-lista-filtro-1.png',
  'lista_filtro_2': '/university/screenshots/bid-frete-int-lista-filtro-2.png',
  'lista_filtro_3': '/university/screenshots/bid-frete-int-lista-filtro-3.png',
  'lista_filtro_4': '/university/screenshots/bid-frete-int-lista-filtro-4.png',
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
  'manual_modal_operaca': '/university/screenshots/bid-frete-int-manual-modal-operaca.png',
  'manual_origem_destino': '/university/screenshots/bid-frete-int-manual-origem-destino.png',
  'manual_origem_porto_origem_dados_pais_cidade_estado': '/university/screenshots/bid-frete-int-manual-origem-porto-origem-dados-pais-cidade-estado.png',
  'manual_origem_porto_origem_pais': '/university/screenshots/bid-frete-int-manual-origem-porto-origem-pais.png',
  'manual_origem_porto_origem_preferencias': '/university/screenshots/bid-frete-int-manual-origem-porto-origem-preferencias.png',
  'manual_origem_porto_origem': '/university/screenshots/bid-frete-int-manual-origem-porto-origem.png',
  'modal_coluna': '/university/screenshots/bid-frete-int-modal-coluna.png',
  'modal_operaca': '/university/screenshots/bid-frete-int-modal-operaca.png',
  'nova_via_smart_doc_acesso': '/university/screenshots/bid-frete-int-nova-via-smart-doc-acesso.png',
  'nova_via_smart_doc_passo_1': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-1.png',
  'nova_via_smart_doc_passo_2': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-2.png',
  'nova_via_smart_doc_passo_3': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-3.png',
  'nova_via_smart_doc_passo_4_ajuste_leituras_para_cotacao': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-4-ajuste-leituras-para-cotacao.png',
  'nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes_campos_obrigatorios_para_avancar_aviso_falta_campos': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-4-nova-cotacao-botao-revisar-cotacoes-campos-obrigatorios-para-avancar-aviso-falta-campos.png',
  'nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes_campos_obrigatorios_para_avancar': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-4-nova-cotacao-botao-revisar-cotacoes-campos-obrigatorios-para-avancar.png',
  'nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes_menu_selecionar_cotacao': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-4-nova-cotacao-botao-revisar-cotacoes-menu-selecionar-cotacao.png',
  'nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-4-nova-cotacao-botao-revisar-cotacoes.png',
  'nova_via_smart_doc_passo_4_nova_cotacao_documentos_analisados': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-4-nova-cotacao-documentos-analisados.png',
  'nova_via_smart_doc_passo_5_revisao_fornecedores_1': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-5-revisao-fornecedores-1.png',
  'nova_via_smart_doc_passo_5_revisao_fornecedores_2': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-5-revisao-fornecedores-2.png',
  'nova_via_smart_doc_passo_6_confirmacao_ir_painel_cotacao_1': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-6-confirmacao-ir-painel-cotacao-1.png',
  'nova_via_smart_doc_passo_6_confirmacao_ir_painel_cotacao_2': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-6-confirmacao-ir-painel-cotacao-2.png',
  'nova_via_smart_doc_passo_6_confirmacao_ir_painel_cotacao': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-6-confirmacao-ir-painel-cotacao.png',
  'nova_via_smart_doc_passo_6_confirmacao': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-6-confirmacao.png',
  'nova_via_smart_doc_passo_6_revisao_final': '/university/screenshots/bid-frete-int-nova-via-smart-doc-passo-6-revisao-final.png',
  'origem_': '/university/screenshots/bid-frete-int-origem-.png',
  'origem_1': '/university/screenshots/bid-frete-int-origem-1.png',
  'origem_destino': '/university/screenshots/bid-frete-int-origem-destino.png',
  'origem_porto_origem_dados_pais_cidade_estado': '/university/screenshots/bid-frete-int-origem-porto-origem-dados-pais-cidade-estado.png',
  'origem_porto_origem_pais': '/university/screenshots/bid-frete-int-origem-porto-origem-pais.png',
  'origem_porto_origem_preferencias': '/university/screenshots/bid-frete-int-origem-porto-origem-preferencias.png',
  'origem_porto_origem': '/university/screenshots/bid-frete-int-origem-porto-origem.png',
  'painel_cotacao_1': '/university/screenshots/bid-frete-int-painel-cotacao-1.png',
  'painel_cotacao_acesso_1': '/university/screenshots/bid-frete-int-painel-cotacao-acesso-1.png',
  'painel_cotacao_acesso_2': '/university/screenshots/bid-frete-int-painel-cotacao-acesso-2.png',
  'painel_cotacao_dados_gerais': '/university/screenshots/bid-frete-int-painel-cotacao-dados-gerais.png',
  'painel_cotacao_divisao': '/university/screenshots/bid-frete-int-painel-cotacao-divisao.png',
  'painel_cotacao_menu_superior': '/university/screenshots/bid-frete-int-painel-cotacao-menu-superior.png',
  'painel_cotacao_propostas_1': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-1.png',
  'painel_cotacao_propostas_aprovar': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-aprovar.png',
  'painel_cotacao_propostas_detalhamento_aprovado_email_1': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-email-1.png',
  'painel_cotacao_propostas_detalhamento_aprovado_email_2': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-email-2.png',
  'painel_cotacao_propostas_detalhamento_aprovado_email_3': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-email-3.png',
  'painel_cotacao_propostas_detalhamento_aprovado_tela_1': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-tela-1.png',
  'painel_cotacao_propostas_detalhamento_aprovado_tela_2': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-tela-2.png',
  'painel_cotacao_propostas_detalhamento_aprovado_tela_final': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-tela-final.png',
  'painel_cotacao_propostas_detalhamento_aprovar_1': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-aprovar-1.png',
  'painel_cotacao_propostas_detalhamento_aprovar_2': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-aprovar-2.png',
  'painel_cotacao_propostas_detalhamento_aprovar_modal_1': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-aprovar-modal-1.png',
  'painel_cotacao_propostas_detalhamento_aprovar_modal': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-aprovar-modal.png',
  'painel_cotacao_propostas_detalhamento_completo': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-detalhamento-completo.png',
  'painel_cotacao_propostas_ranking': '/university/screenshots/bid-frete-int-painel-cotacao-propostas-ranking.png',
  'painel_cotacao_propostas': '/university/screenshots/bid-frete-int-painel-cotacao-propostas.png',
  'painel_cotacao_solicitacao_cotacao_erro_email': '/university/screenshots/bid-frete-int-painel-cotacao-solicitacao-cotacao-erro-email.png',
  'painel_cotacao_solicitacao_cotacao_link_acesso_cliente': '/university/screenshots/bid-frete-int-painel-cotacao-solicitacao-cotacao-link-acesso-cliente.png',
  'painel_cotacao_solicitacao_cotacao_link_expirado': '/university/screenshots/bid-frete-int-painel-cotacao-solicitacao-cotacao-link-expirado.png',
  'painel_cotacao_solicitacao_cotacao_link_resposta': '/university/screenshots/bid-frete-int-painel-cotacao-solicitacao-cotacao-link-resposta.png',
  'painel_cotacao_solicitacao_cotacao': '/university/screenshots/bid-frete-int-painel-cotacao-solicitacao-cotacao.png',
  'painel_cotacao_solicitacao': '/university/screenshots/bid-frete-int-painel-cotacao-solicitacao.png',
  'painel_cotacao_visao_geral': '/university/screenshots/bid-frete-int-painel-cotacao-visao-geral.png',
  'painel_cotacao': '/university/screenshots/bid-frete-int-painel-cotacao.png',
  'preferencia_alterar_cotacao_1': '/university/screenshots/bid-frete-int-preferencia-alterar-cotacao-1.png',
  'preferencia_alterar_cotacao_2': '/university/screenshots/bid-frete-int-preferencia-alterar-cotacao-2.png',
  'preferencia_alterar_cotacao_3': '/university/screenshots/bid-frete-int-preferencia-alterar-cotacao-3.png',
  'preferencia_email_cotacao_1': '/university/screenshots/bid-frete-int-preferencia-email-cotacao-1.png',
  'preferencia_email_cotacao_2': '/university/screenshots/bid-frete-int-preferencia-email-cotacao-2.png',
  'preferencia_email_cotacao_3': '/university/screenshots/bid-frete-int-preferencia-email-cotacao-3.png',
  'preferencia_email_cotacao_4': '/university/screenshots/bid-frete-int-preferencia-email-cotacao-4.png',
  'preferencia_email_cotacao_4b': '/university/screenshots/bid-frete-int-preferencia-email-cotacao-4b.png',
  'preferencia_taxa_cambio': '/university/screenshots/bid-frete-int-preferencia-taxa-cambio.png',
  'resposta_fornecedor_1': '/university/screenshots/bid-frete-int-resposta-fornecedor-1.png',
  'resposta_fornecedor_2': '/university/screenshots/bid-frete-int-resposta-fornecedor-2.png',
  'solicitacao_aviso_envio_usuario_1': '/university/screenshots/bid-frete-int-solicitacao-aviso-envio-usuario-1.png',
  'solicitacao_aviso_envio_usuario_configuracoes': '/university/screenshots/bid-frete-int-solicitacao-aviso-envio-usuario-configuracoes.png',
  'solicitacao_email_fornecedor': '/university/screenshots/bid-frete-int-solicitacao-email-fornecedor.png',
  'status_1': '/university/screenshots/bid-frete-int-status-1.png',
  'status_2': '/university/screenshots/bid-frete-int-status-2.png',
  'status_3': '/university/screenshots/bid-frete-int-status-3.png',
  'status_4': '/university/screenshots/bid-frete-int-status-4.png',
  'status_5': '/university/screenshots/bid-frete-int-status-5.png',
  'status_6': '/university/screenshots/bid-frete-int-status-6.png',
  'taxa_quem_paga_1': '/university/screenshots/bid-frete-int-taxa-quem-paga-1.png',
  'taxa_quem_paga_2': '/university/screenshots/bid-frete-int-taxa-quem-paga-2.png',
  'taxa_quem_paga_3': '/university/screenshots/bid-frete-int-taxa-quem-paga-3.png',
  'taxa_quem_paga_4': '/university/screenshots/bid-frete-int-taxa-quem-paga-4.png',
  'taxa_quem_paga_5': '/university/screenshots/bid-frete-int-taxa-quem-paga-5.png',
  'taxa_quem_paga_6': '/university/screenshots/bid-frete-int-taxa-quem-paga-6.png',
  'taxa_quem_paga_7': '/university/screenshots/bid-frete-int-taxa-quem-paga-7.png',
  'tela_principal_configuracoes': '/university/screenshots/bid-frete-int-tela-principal-configuracoes.png',
  'tipo_volume_aereo_1': '/university/screenshots/bid-frete-int-tipo-volume-aereo-1.png',
  'tipo_volume_aereo_2': '/university/screenshots/bid-frete-int-tipo-volume-aereo-2.png',
  'tipo_volume_rodo_1': '/university/screenshots/bid-frete-int-tipo-volume-rodo-1.png',
  'tipo_volume_rodo_2': '/university/screenshots/bid-frete-int-tipo-volume-rodo-2.png',
  'tipo_volume_rodo_miniatura': '/university/screenshots/bid-frete-int-tipo-volume-rodo-miniatura.png',
  'tipo_volume': '/university/screenshots/bid-frete-int-tipo-volume.png',
}

// ── Atalhos nomeados (imports diretos nos conteudos) ──

export const SCREENSHOT_BID_FRETE_INT_ACEITE_FORNECEDOR_FRETE_VENCIDO_1 = screenshotBidFreteInt('aceite_fornecedor_frete_vencido_1')
export const SCREENSHOT_BID_FRETE_INT_ACEITE_FORNECEDOR_FRETE_VENCIDO_2 = screenshotBidFreteInt('aceite_fornecedor_frete_vencido_2')
export const SCREENSHOT_BID_FRETE_INT_ACEITE_FORNECEDOR_FRETE_VENCIDO_3 = screenshotBidFreteInt('aceite_fornecedor_frete_vencido_3')
export const SCREENSHOT_BID_FRETE_INT_ACEITE_FORNECEDOR_FRETE_VENCIDO_4 = screenshotBidFreteInt('aceite_fornecedor_frete_vencido_4')
export const SCREENSHOT_BID_FRETE_INT_ACESSO_AGUARDANDO_CONFIRMACAO_APROVACAO_OK_FORNECEDOR_01 = screenshotBidFreteInt('acesso_aguardando_confirmacao_aprovacao_ok_fornecedor_01')
export const SCREENSHOT_BID_FRETE_INT_ACESSO_VIA_HUB = screenshotBidFreteInt('acesso_via_hub')
export const SCREENSHOT_BID_FRETE_INT_ACESSO_VIA_MENU_LATERAL = screenshotBidFreteInt('acesso_via_menu_lateral')
export const SCREENSHOT_BID_FRETE_INT_CARGO_INCOTERM_1 = screenshotBidFreteInt('cargo_incoterm_1')
export const SCREENSHOT_BID_FRETE_INT_CARGO_INCOTERM_2 = screenshotBidFreteInt('cargo_incoterm_2')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CARDS_DESATIVAR_1 = screenshotBidFreteInt('configuracoes_cards_desativar_1')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CARDS_DESATIVAR_2 = screenshotBidFreteInt('configuracoes_cards_desativar_2')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CARDS_INCLUIR_2 = screenshotBidFreteInt('configuracoes_cards_incluir_2')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CARDS_INCLUIR = screenshotBidFreteInt('configuracoes_cards_incluir')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CARDS_PERIODO_DE_COMPARACAO = screenshotBidFreteInt('configuracoes_cards_periodo_de_comparacao')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CASAS_DECIMAIS_1 = screenshotBidFreteInt('configuracoes_casas_decimais_1')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_CASAS_DECIMAIS = screenshotBidFreteInt('configuracoes_casas_decimais')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_COLUNAS_CASAS_DECIMAIS = screenshotBidFreteInt('configuracoes_colunas_casas_decimais')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_COLUNAS_FORMATO_DATAS = screenshotBidFreteInt('configuracoes_colunas_formato_datas')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_COLUNAS_FORMATO_PERSONALIZADAS = screenshotBidFreteInt('configuracoes_colunas_formato_personalizadas')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_FORMATO_DATA = screenshotBidFreteInt('configuracoes_formato_data')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN_1 = screenshotBidFreteInt('configuracoes_kanban_1')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN_2 = screenshotBidFreteInt('configuracoes_kanban_2')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN_3 = screenshotBidFreteInt('configuracoes_kanban_3')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN_CARD_1 = screenshotBidFreteInt('configuracoes_kanban_card_1')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN_CARD_2 = screenshotBidFreteInt('configuracoes_kanban_card_2')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN_TELA = screenshotBidFreteInt('configuracoes_kanban_tela')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_KANBAN = screenshotBidFreteInt('configuracoes_kanban')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_NUMERACAO = screenshotBidFreteInt('configuracoes_numeracao')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_PERSONALIZADA_1 = screenshotBidFreteInt('configuracoes_personalizada_1')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_PERSONALIZADA_2 = screenshotBidFreteInt('configuracoes_personalizada_2')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_PERSONALIZADA_3 = screenshotBidFreteInt('configuracoes_personalizada_3')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_PERSONALIZADA_4 = screenshotBidFreteInt('configuracoes_personalizada_4')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_PERSONALIZADA_5 = screenshotBidFreteInt('configuracoes_personalizada_5')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_PERSONALIZADA_6 = screenshotBidFreteInt('configuracoes_personalizada_6')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_PREFERENCIA = screenshotBidFreteInt('configuracoes_preferencia')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_STATUS = screenshotBidFreteInt('configuracoes_status')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_TABELA_1 = screenshotBidFreteInt('configuracoes_tabela_1')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_TABELA_2 = screenshotBidFreteInt('configuracoes_tabela_2')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_TABELA_ATUALIZADA = screenshotBidFreteInt('configuracoes_tabela_atualizada')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_TABELA = screenshotBidFreteInt('configuracoes_tabela')
export const SCREENSHOT_BID_FRETE_INT_CONFIGURACOES_TAXA_CAMBIO = screenshotBidFreteInt('configuracoes_taxa_cambio')
export const SCREENSHOT_BID_FRETE_INT_CONFIRMACAO_CRIACAO_COTACAO_DETALHAMENTO = screenshotBidFreteInt('confirmacao_criacao_cotacao_detalhamento')
export const SCREENSHOT_BID_FRETE_INT_CONFIRMACAO_CRIACAO_COTACAO_LISTA = screenshotBidFreteInt('confirmacao_criacao_cotacao_lista')
export const SCREENSHOT_BID_FRETE_INT_CONFIRMACAO_CRIACAO_COTACAO = screenshotBidFreteInt('confirmacao_criacao_cotacao')
export const SCREENSHOT_BID_FRETE_INT_CONFIRMACAO_LISTA = screenshotBidFreteInt('confirmacao_lista')
export const SCREENSHOT_BID_FRETE_INT_CONFIRMACAO_MODAL = screenshotBidFreteInt('confirmacao_modal')
export const SCREENSHOT_BID_FRETE_INT_COTACAO_AVULSA = screenshotBidFreteInt('cotacao_avulsa')
export const SCREENSHOT_BID_FRETE_INT_COTACAO_BID_1 = screenshotBidFreteInt('cotacao_bid_1')
export const SCREENSHOT_BID_FRETE_INT_COTACAO_BID_MODAL_SELEC = screenshotBidFreteInt('cotacao_bid_modal_selec')
export const SCREENSHOT_BID_FRETE_INT_COTACAO_BID_MODAL = screenshotBidFreteInt('cotacao_bid_modal')
export const SCREENSHOT_BID_FRETE_INT_DASHBOARD = screenshotBidFreteInt('dashboard')
export const SCREENSHOT_BID_FRETE_INT_DESTINO_1 = screenshotBidFreteInt('destino_1')
export const SCREENSHOT_BID_FRETE_INT_DESTINO_2 = screenshotBidFreteInt('destino_2')
export const SCREENSHOT_BID_FRETE_INT_EMAIL_COMPRADOR_AVISO_RESPOSTA_COTACAO = screenshotBidFreteInt('email_comprador_aviso_resposta_cotacao')
export const SCREENSHOT_BID_FRETE_INT_EXPORTAR_ = screenshotBidFreteInt('exportar_')
export const SCREENSHOT_BID_FRETE_INT_EXPORTAR_1 = screenshotBidFreteInt('exportar_1')
export const SCREENSHOT_BID_FRETE_INT_EXPORTAR_2 = screenshotBidFreteInt('exportar_2')
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
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_NOVA_COTACAO_TELA_1 = screenshotBidFreteInt('insight_nova_cotacao_tela_1')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_NOVA_COTACAO_TELA_2 = screenshotBidFreteInt('insight_nova_cotacao_tela_2')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_NOVA_COTACAO_TELA_3 = screenshotBidFreteInt('insight_nova_cotacao_tela_3')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_TOOLTIP_1_SETA = screenshotBidFreteInt('insight_tooltip_1_seta')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_TOOLTIP_1_TELA = screenshotBidFreteInt('insight_tooltip_1_tela')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_TOOLTIP_2_SETA = screenshotBidFreteInt('insight_tooltip_2_seta')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_TOOLTIP_2_TELA = screenshotBidFreteInt('insight_tooltip_2_tela')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_TOOLTIP_3 = screenshotBidFreteInt('insight_tooltip_3')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_VISAO_GLOBO_PAUSAR = screenshotBidFreteInt('insight_visao_globo_pausar')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_VIS_O_GLOBO_PAUSAR = screenshotBidFreteInt('insight_visão_globo_pausar')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_VISAO_GLOBO = screenshotBidFreteInt('insight_visao_globo')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_VIS_O_GLOBO = screenshotBidFreteInt('insight_visão_globo')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_VISAO_MAPA_RESTAURAR = screenshotBidFreteInt('insight_visao_mapa_restaurar')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_VIS_O_MAPA_RESTAURAR = screenshotBidFreteInt('insight_visão_mapa_restaurar')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_VISAO_MAPA = screenshotBidFreteInt('insight_visao_mapa')
export const SCREENSHOT_BID_FRETE_INT_INSIGHT_VIS_O_MAPA = screenshotBidFreteInt('insight_visão_mapa')
export const SCREENSHOT_BID_FRETE_INT_KANBAN = screenshotBidFreteInt('kanban')
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
export const SCREENSHOT_BID_FRETE_INT_LISTA_EDITAR = screenshotBidFreteInt('lista_editar')
export const SCREENSHOT_BID_FRETE_INT_LISTA_EXCLUIR_1 = screenshotBidFreteInt('lista_excluir_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_EXCLUIR_2 = screenshotBidFreteInt('lista_excluir_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_FILTRO_1 = screenshotBidFreteInt('lista_filtro_1')
export const SCREENSHOT_BID_FRETE_INT_LISTA_FILTRO_2 = screenshotBidFreteInt('lista_filtro_2')
export const SCREENSHOT_BID_FRETE_INT_LISTA_FILTRO_3 = screenshotBidFreteInt('lista_filtro_3')
export const SCREENSHOT_BID_FRETE_INT_LISTA_FILTRO_4 = screenshotBidFreteInt('lista_filtro_4')
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
export const SCREENSHOT_BID_FRETE_INT_MANUAL_MODAL_OPERACA = screenshotBidFreteInt('manual_modal_operaca')
export const SCREENSHOT_BID_FRETE_INT_MANUAL_ORIGEM_DESTINO = screenshotBidFreteInt('manual_origem_destino')
export const SCREENSHOT_BID_FRETE_INT_MANUAL_ORIGEM_PORTO_ORIGEM_DADOS_PAIS_CIDADE_ESTADO = screenshotBidFreteInt('manual_origem_porto_origem_dados_pais_cidade_estado')
export const SCREENSHOT_BID_FRETE_INT_MANUAL_ORIGEM_PORTO_ORIGEM_PAIS = screenshotBidFreteInt('manual_origem_porto_origem_pais')
export const SCREENSHOT_BID_FRETE_INT_MANUAL_ORIGEM_PORTO_ORIGEM_PREFERENCIAS = screenshotBidFreteInt('manual_origem_porto_origem_preferencias')
export const SCREENSHOT_BID_FRETE_INT_MANUAL_ORIGEM_PORTO_ORIGEM = screenshotBidFreteInt('manual_origem_porto_origem')
export const SCREENSHOT_BID_FRETE_INT_MODAL_COLUNA = screenshotBidFreteInt('modal_coluna')
export const SCREENSHOT_BID_FRETE_INT_MODAL_OPERACA = screenshotBidFreteInt('modal_operaca')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_ACESSO = screenshotBidFreteInt('nova_via_smart_doc_acesso')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_1 = screenshotBidFreteInt('nova_via_smart_doc_passo_1')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_2 = screenshotBidFreteInt('nova_via_smart_doc_passo_2')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_3 = screenshotBidFreteInt('nova_via_smart_doc_passo_3')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_4_AJUSTE_LEITURAS_PARA_COTACAO = screenshotBidFreteInt('nova_via_smart_doc_passo_4_ajuste_leituras_para_cotacao')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_4_NOVA_COTACAO_BOTAO_REVISAR_COTACOES_CAMPOS_OBRIGATORIOS_PARA_AVANCAR_AVISO_FALTA_CAMPOS = screenshotBidFreteInt('nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes_campos_obrigatorios_para_avancar_aviso_falta_campos')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_4_NOVA_COTACAO_BOTAO_REVISAR_COTACOES_CAMPOS_OBRIGATORIOS_PARA_AVANCAR = screenshotBidFreteInt('nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes_campos_obrigatorios_para_avancar')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_4_NOVA_COTACAO_BOTAO_REVISAR_COTACOES_MENU_SELECIONAR_COTACAO = screenshotBidFreteInt('nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes_menu_selecionar_cotacao')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_4_NOVA_COTACAO_BOTAO_REVISAR_COTACOES = screenshotBidFreteInt('nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_4_NOVA_COTACAO_DOCUMENTOS_ANALISADOS = screenshotBidFreteInt('nova_via_smart_doc_passo_4_nova_cotacao_documentos_analisados')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_5_REVISAO_FORNECEDORES_1 = screenshotBidFreteInt('nova_via_smart_doc_passo_5_revisao_fornecedores_1')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_5_REVISAO_FORNECEDORES_2 = screenshotBidFreteInt('nova_via_smart_doc_passo_5_revisao_fornecedores_2')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_6_CONFIRMACAO_IR_PAINEL_COTACAO_1 = screenshotBidFreteInt('nova_via_smart_doc_passo_6_confirmacao_ir_painel_cotacao_1')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_6_CONFIRMACAO_IR_PAINEL_COTACAO_2 = screenshotBidFreteInt('nova_via_smart_doc_passo_6_confirmacao_ir_painel_cotacao_2')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_6_CONFIRMACAO_IR_PAINEL_COTACAO = screenshotBidFreteInt('nova_via_smart_doc_passo_6_confirmacao_ir_painel_cotacao')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_6_CONFIRMACAO = screenshotBidFreteInt('nova_via_smart_doc_passo_6_confirmacao')
export const SCREENSHOT_BID_FRETE_INT_NOVA_VIA_SMART_DOC_PASSO_6_REVISAO_FINAL = screenshotBidFreteInt('nova_via_smart_doc_passo_6_revisao_final')
export const SCREENSHOT_BID_FRETE_INT_ORIGEM_ = screenshotBidFreteInt('origem_')
export const SCREENSHOT_BID_FRETE_INT_ORIGEM_1 = screenshotBidFreteInt('origem_1')
export const SCREENSHOT_BID_FRETE_INT_ORIGEM_DESTINO = screenshotBidFreteInt('origem_destino')
export const SCREENSHOT_BID_FRETE_INT_ORIGEM_PORTO_ORIGEM_DADOS_PAIS_CIDADE_ESTADO = screenshotBidFreteInt('origem_porto_origem_dados_pais_cidade_estado')
export const SCREENSHOT_BID_FRETE_INT_ORIGEM_PORTO_ORIGEM_PAIS = screenshotBidFreteInt('origem_porto_origem_pais')
export const SCREENSHOT_BID_FRETE_INT_ORIGEM_PORTO_ORIGEM_PREFERENCIAS = screenshotBidFreteInt('origem_porto_origem_preferencias')
export const SCREENSHOT_BID_FRETE_INT_ORIGEM_PORTO_ORIGEM = screenshotBidFreteInt('origem_porto_origem')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_1 = screenshotBidFreteInt('painel_cotacao_1')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_ACESSO_1 = screenshotBidFreteInt('painel_cotacao_acesso_1')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_ACESSO_2 = screenshotBidFreteInt('painel_cotacao_acesso_2')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_DADOS_GERAIS = screenshotBidFreteInt('painel_cotacao_dados_gerais')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_DIVISAO = screenshotBidFreteInt('painel_cotacao_divisao')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_MENU_SUPERIOR = screenshotBidFreteInt('painel_cotacao_menu_superior')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_1 = screenshotBidFreteInt('painel_cotacao_propostas_1')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_APROVAR = screenshotBidFreteInt('painel_cotacao_propostas_aprovar')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_APROVADO_EMAIL_1 = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_aprovado_email_1')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_APROVADO_EMAIL_2 = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_aprovado_email_2')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_APROVADO_EMAIL_3 = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_aprovado_email_3')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_APROVADO_TELA_1 = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_aprovado_tela_1')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_APROVADO_TELA_2 = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_aprovado_tela_2')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_APROVADO_TELA_FINAL = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_aprovado_tela_final')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_APROVAR_1 = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_aprovar_1')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_APROVAR_2 = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_aprovar_2')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_APROVAR_MODAL_1 = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_aprovar_modal_1')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_APROVAR_MODAL = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_aprovar_modal')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_DETALHAMENTO_COMPLETO = screenshotBidFreteInt('painel_cotacao_propostas_detalhamento_completo')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS_RANKING = screenshotBidFreteInt('painel_cotacao_propostas_ranking')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_PROPOSTAS = screenshotBidFreteInt('painel_cotacao_propostas')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_SOLICITACAO_COTACAO_ERRO_EMAIL = screenshotBidFreteInt('painel_cotacao_solicitacao_cotacao_erro_email')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_SOLICITACAO_COTACAO_LINK_ACESSO_CLIENTE = screenshotBidFreteInt('painel_cotacao_solicitacao_cotacao_link_acesso_cliente')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_SOLICITACAO_COTACAO_LINK_EXPIRADO = screenshotBidFreteInt('painel_cotacao_solicitacao_cotacao_link_expirado')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_SOLICITACAO_COTACAO_LINK_RESPOSTA = screenshotBidFreteInt('painel_cotacao_solicitacao_cotacao_link_resposta')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_SOLICITACAO_COTACAO = screenshotBidFreteInt('painel_cotacao_solicitacao_cotacao')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_SOLICITACAO = screenshotBidFreteInt('painel_cotacao_solicitacao')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO_VISAO_GERAL = screenshotBidFreteInt('painel_cotacao_visao_geral')
export const SCREENSHOT_BID_FRETE_INT_PAINEL_COTACAO = screenshotBidFreteInt('painel_cotacao')
export const SCREENSHOT_BID_FRETE_INT_PREFERENCIA_ALTERAR_COTACAO_1 = screenshotBidFreteInt('preferencia_alterar_cotacao_1')
export const SCREENSHOT_BID_FRETE_INT_PREFERENCIA_ALTERAR_COTACAO_2 = screenshotBidFreteInt('preferencia_alterar_cotacao_2')
export const SCREENSHOT_BID_FRETE_INT_PREFERENCIA_ALTERAR_COTACAO_3 = screenshotBidFreteInt('preferencia_alterar_cotacao_3')
export const SCREENSHOT_BID_FRETE_INT_PREFERENCIA_EMAIL_COTACAO_1 = screenshotBidFreteInt('preferencia_email_cotacao_1')
export const SCREENSHOT_BID_FRETE_INT_PREFERENCIA_EMAIL_COTACAO_2 = screenshotBidFreteInt('preferencia_email_cotacao_2')
export const SCREENSHOT_BID_FRETE_INT_PREFERENCIA_EMAIL_COTACAO_3 = screenshotBidFreteInt('preferencia_email_cotacao_3')
export const SCREENSHOT_BID_FRETE_INT_PREFERENCIA_EMAIL_COTACAO_4 = screenshotBidFreteInt('preferencia_email_cotacao_4')
export const SCREENSHOT_BID_FRETE_INT_PREFERENCIA_EMAIL_COTACAO_4B = screenshotBidFreteInt('preferencia_email_cotacao_4b')
export const SCREENSHOT_BID_FRETE_INT_PREFERENCIA_TAXA_CAMBIO = screenshotBidFreteInt('preferencia_taxa_cambio')
export const SCREENSHOT_BID_FRETE_INT_RESPOSTA_FORNECEDOR_1 = screenshotBidFreteInt('resposta_fornecedor_1')
export const SCREENSHOT_BID_FRETE_INT_RESPOSTA_FORNECEDOR_2 = screenshotBidFreteInt('resposta_fornecedor_2')
export const SCREENSHOT_BID_FRETE_INT_SOLICITACAO_AVISO_ENVIO_USUARIO_1 = screenshotBidFreteInt('solicitacao_aviso_envio_usuario_1')
export const SCREENSHOT_BID_FRETE_INT_SOLICITACAO_AVISO_ENVIO_USUARIO_CONFIGURACOES = screenshotBidFreteInt('solicitacao_aviso_envio_usuario_configuracoes')
export const SCREENSHOT_BID_FRETE_INT_SOLICITACAO_EMAIL_FORNECEDOR = screenshotBidFreteInt('solicitacao_email_fornecedor')
export const SCREENSHOT_BID_FRETE_INT_STATUS_1 = screenshotBidFreteInt('status_1')
export const SCREENSHOT_BID_FRETE_INT_STATUS_2 = screenshotBidFreteInt('status_2')
export const SCREENSHOT_BID_FRETE_INT_STATUS_3 = screenshotBidFreteInt('status_3')
export const SCREENSHOT_BID_FRETE_INT_STATUS_4 = screenshotBidFreteInt('status_4')
export const SCREENSHOT_BID_FRETE_INT_STATUS_5 = screenshotBidFreteInt('status_5')
export const SCREENSHOT_BID_FRETE_INT_STATUS_6 = screenshotBidFreteInt('status_6')
export const SCREENSHOT_BID_FRETE_INT_TAXA_QUEM_PAGA_1 = screenshotBidFreteInt('taxa_quem_paga_1')
export const SCREENSHOT_BID_FRETE_INT_TAXA_QUEM_PAGA_2 = screenshotBidFreteInt('taxa_quem_paga_2')
export const SCREENSHOT_BID_FRETE_INT_TAXA_QUEM_PAGA_3 = screenshotBidFreteInt('taxa_quem_paga_3')
export const SCREENSHOT_BID_FRETE_INT_TAXA_QUEM_PAGA_4 = screenshotBidFreteInt('taxa_quem_paga_4')
export const SCREENSHOT_BID_FRETE_INT_TAXA_QUEM_PAGA_5 = screenshotBidFreteInt('taxa_quem_paga_5')
export const SCREENSHOT_BID_FRETE_INT_TAXA_QUEM_PAGA_6 = screenshotBidFreteInt('taxa_quem_paga_6')
export const SCREENSHOT_BID_FRETE_INT_TAXA_QUEM_PAGA_7 = screenshotBidFreteInt('taxa_quem_paga_7')
export const SCREENSHOT_BID_FRETE_INT_TELA_PRINCIPAL_CONFIGURACOES = screenshotBidFreteInt('tela_principal_configuracoes')
export const SCREENSHOT_BID_FRETE_INT_TIPO_VOLUME_AEREO_1 = screenshotBidFreteInt('tipo_volume_aereo_1')
export const SCREENSHOT_BID_FRETE_INT_TIPO_VOLUME_AEREO_2 = screenshotBidFreteInt('tipo_volume_aereo_2')
export const SCREENSHOT_BID_FRETE_INT_TIPO_VOLUME_RODO_1 = screenshotBidFreteInt('tipo_volume_rodo_1')
export const SCREENSHOT_BID_FRETE_INT_TIPO_VOLUME_RODO_2 = screenshotBidFreteInt('tipo_volume_rodo_2')
export const SCREENSHOT_BID_FRETE_INT_TIPO_VOLUME_RODO_MINIATURA = screenshotBidFreteInt('tipo_volume_rodo_miniatura')
export const SCREENSHOT_BID_FRETE_INT_TIPO_VOLUME = screenshotBidFreteInt('tipo_volume')
