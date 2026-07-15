# Copia prints do Drive para public/university/screenshots/pedido-*.png
# Fonte: ...\6. Produtos Gravity\1. Pedido

$ErrorActionPreference = 'Stop'

$candidatosOrigem = @(
  'G:\Meu Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\1. Pedido',
  'G:\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\1. Pedido',
  "$env:USERPROFILE\Google Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\1. Pedido",
  "$env:USERPROFILE\Meu Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\1. Pedido",
  "$env:USERPROFILE\Google Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\1. Pedido",
  "$env:USERPROFILE\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\1. Pedido"
)

$origem = $candidatosOrigem | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $origem) {
  Write-Error "Pasta do Drive nao encontrada. Crie '6. Produtos Gravity\1. Pedido' ou rode scripts/capturar-screenshots-manual-pedido-visao-geral.ts"
}

$destino = Join-Path $PSScriptRoot '..\servicos-global\configurador\public\university\screenshots'
New-Item -ItemType Directory -Force -Path $destino | Out-Null

$mapa = @{
  'tela_pedido_visao_insight' = 'pedido-tela-principal.png'
  'tela_pedido_visao_lista' = 'pedido-lista.png'
  'tela_pedido_visao_dashboard' = 'pedido-dashboard.png'
  'tela_pedido_visao_kanban' = 'pedido-kanban.png'
  'tela_pedido_acesso_via_hub' = 'pedido-acesso-hub.png'
  'tela_pedido_acesso_via_menu_lateral' = 'pedido-acesso-menu-lateral.png'
  'tela_pedido_visao_lista_expandir_seta' = 'pedido-lista-expandir-seta.png'
  'tela_pedido_visao_lista_itens_expandidos' = 'pedido-lista-itens-expandidos.png'
  'tela_pedido_visao_lista_expandir_todos_seta' = 'pedido-lista-expandir-todos-seta.png'
  'tela_pedido_visao_lista_itens_expandidos_todos' = 'pedido-lista-expandir-todos-expandido.png'
  'tela_pedido_visao_lista_ocultar_exibir_1' = 'pedido-lista-colunas-customizar.png'
  'tela_pedido_visao_lista_arrastar_exibir_1' = 'pedido-lista-colunas-arrastar.png'
  'tela_pedido_visao_lista_gerar_documento_1' = 'pedido-lista-gerar-documento-1.png'
  'tela_pedido_visao_lista_gerar_documento_2' = 'pedido-lista-gerar-documento-2.png'
  'tela_pedido_configuracoes_criar_coluna' = 'pedido-configuracoes-criar-coluna.png'
  'tela_pedido_configuracoes_seta' = 'pedido-configuracoes-seta.png'
  'tela_pedido_configuracoes_criar_coluna_modal' = 'pedido-configuracoes-criar-coluna-modal.png'
  'tela_pedido_lista_edicao_selecionar_salvo' = 'pedido-lista-edicao-selecionar-salvo.png'
  'tela_pedido_lista_edicao_selecionar_salvar' = 'pedido-lista-edicao-selecionar-salvar.png'
  'tela_pedido_lista_edicao_selecionar_opcal' = 'pedido-lista-edicao-selecionar-opcoes.png'
  'tela_pedido_lista_edicao_modal' = 'pedido-lista-edicao-modal.png'
  'tela_pedido_lista_alertas' = 'pedido-lista-alertas.png'
  'tela_pedido_lista_excluir_setas' = 'pedido-lista-excluir-setas.png'
  'tela_pedido_lista_excluir_modal' = 'pedido-lista-excluir-modal.png'
  'tela_pedido_lista_excluir_confirmacao' = 'pedido-lista-excluir-confirmacao.png'
  'tela_pedido_lista_filtro_seta' = 'pedido-lista-filtro-seta.png'
  'tela_pedido_lista_filtro_modal' = 'pedido-lista-filtro-modal.png'
  'tela_pedido_lista_filtro_aplicado' = 'pedido-lista-filtro-aplicado.png'
  'tela_pedido_lista_filtro_aplicado_2' = 'pedido-lista-filtro-aplicado-2.png'
  'tela_pedido_lista_exportar_seta' = 'pedido-lista-exportar-seta.png'
  'tela_pedido_lista_exportar_modal' = 'pedido-lista-exportar-modal.png'
  'tela_pedido_lista_exportar_planilha' = 'pedido-lista-exportar-planilha.png'
  'tela_pedido_lista_exportar_download' = 'pedido-lista-exportar-download.png'
  # Smart Import — nomes reais no Drive (modal_importacao_passo_*)
  'tela_pedido_lista_novo_seta' = 'pedido-lista-importar-seta-novo.png'
  'tela_pedido_lista_novo_pedido_seta' = 'pedido-lista-importar-seta-novo-pedido.png'
  'tela_pedido_lista_novo_pedido_modal' = 'pedido-lista-importar-seta-importacao.png'
  'tela_pedido_lista_novo_pedido_modal_importacao' = 'pedido-lista-importar-modal.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_1' = 'pedido-lista-importar-upload.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_1_baixar_modelo_seta' = 'pedido-lista-importar-template.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_selecionar_planilha_seta' = 'pedido-lista-importar-multiplas-abas.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_1_selecionar_pedidos' = 'pedido-lista-importar-analisando.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_2_completo' = 'pedido-lista-importar-mapeamento.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_2_select' = 'pedido-lista-importar-confianca.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_2_modal' = 'pedido-lista-importar-memoria.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_2_ver_documento' = 'pedido-lista-importar-ver-documento.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal' = 'pedido-lista-importar-preview-filtros.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal_expandido' = 'pedido-lista-importar-preview-card.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal_expandido_aviso_erro' = 'pedido-lista-importar-duplicata.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal_expandido_editando' = 'pedido-lista-importar-sobrescrever-diff.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_4' = 'pedido-lista-importar-resultado.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_tela_final' = 'pedido-lista-importar-erros-csv.png'
  # §5.12 Novo pedido — manual e novo item
  'tela_pedido_lista_novo_pedido_manual_seta' = 'pedido-lista-novo-pedido-manual-seta.png'
  'tela_pedido_lista_novo_pedido_manual_modal_1' = 'pedido-lista-novo-pedido-manual-passo-1.png'
  'tela_pedido_lista_novo_pedido_manual_modal_2' = 'pedido-lista-novo-pedido-manual-passo-1-requisitos.png'
  'tela_pedido_lista_novo_pedido_manual_modal_importacao_selecionar_exportador_nova_seta' = 'pedido-lista-novo-pedido-manual-exportador-nova-seta.png'
  'tela_pedido_lista_novo_pedido_manual_modal_importacao_selecionar_exportador_nova_modal' = 'pedido-lista-novo-pedido-manual-exportador-nova-modal.png'
  'tela_pedido_lista_novo_pedido_manual_modal_importacao_selecionar_exportador' = 'pedido-lista-novo-pedido-manual-exportador-select.png'
  'tela_pedido_lista_novo_pedido_manual_modal_3' = 'pedido-lista-novo-pedido-manual-passo-2-itens.png'
  'tela_pedido_lista_novo_pedido_manual_modal_3_ncm_1' = 'pedido-lista-novo-pedido-manual-passo-2-ncm-1.png'
  'tela_pedido_lista_novo_pedido_manual_modal_3_ncm_2' = 'pedido-lista-novo-pedido-manual-passo-2-ncm-2.png'
  'tela_pedido_lista_novo_pedido_manual_modal_4' = 'pedido-lista-novo-pedido-manual-passo-2-criar.png'
  'tela_pedido_lista_novo_pedido_manual_tela_salva' = 'pedido-lista-novo-pedido-manual-salvo-lista.png'
  'tela_pedido_lista_novo_item_seta' = 'pedido-lista-novo-item-seta.png'
  'tela_pedido_lista_novo_item_modal' = 'pedido-lista-novo-item-modal-opcoes.png'
  'tela_pedido_lista_novo_item_modal_1' = 'pedido-lista-novo-item-manual-passo-1.png'
  'tela_pedido_lista_novo_item_modal_1_adicionar_item' = 'pedido-lista-novo-item-manual-adicionar.png'
  'tela_pedido_lista_novo_item_modal_1_adicionado_1' = 'pedido-lista-novo-item-manual-item-1.png'
  'tela_pedido_lista_novo_item_modal_1_adicionado_2' = 'pedido-lista-novo-item-manual-itens-salvos.png'
  'tela_pedido_visao_lista_paineis_seta' = 'pedido-lista-paineis-seta.png'
  'tela_pedido_visao_lista_paineis_novo_seta' = 'pedido-lista-paineis-novo-seta.png'
  'tela_pedido_visao_lista_paineis_novo_nome_seta' = 'pedido-lista-paineis-novo-nome-seta.png'
  'tela_pedido_visao_lista_paineis_novo_nome_validar' = 'pedido-lista-paineis-novo-nome-validar.png'
  'tela_pedido_visao_lista_paineis_novo_nome_validado' = 'pedido-lista-paineis-novo-nome-validado.png'
  # Consolidar
  'tela_pedido_lista_consolidar_botao_nao_selecionado_seta' = 'pedido-lista-consolidar-botao-sem-selecao-seta.png'
  'tela_pedido_lista_consolidar_botao_selecionado_seta' = 'pedido-lista-consolidar-botao-com-selecao-seta.png'
  'tela_pedido_lista_consolidar_passo_1' = 'pedido-lista-consolidar-passo-1-configurar.png'
  'tela_pedido_lista_consolidar_passo_2_modal' = 'pedido-lista-consolidar-passo-2-modal.png'
  'tela_pedido_lista_consolidar_passo_2_modal_selecao_pedidos_consolidados' = 'pedido-lista-consolidar-passo-2-filtro-origem.png'
  'tela_pedido_lista_consolidar_passo_2_modal_exemplo_dados_iguais_entre_pedidos' = 'pedido-lista-consolidar-passo-2-dados-iguais.png'
  'tela_pedido_lista_consolidar_passo_2_modal_exemplo_dados_divergentes_entre_pedidos' = 'pedido-lista-consolidar-passo-2-dados-divergentes.png'
  'tela_pedido_lista_consolidar_passo_2_modal_exemplo_dados_vazios' = 'pedido-lista-consolidar-passo-2-dados-vazios.png'
  'tela_pedido_lista_consolidar_passo_2_modal_peoximo' = 'pedido-lista-consolidar-passo-2-proximo.png'
  'tela_pedido_lista_consolidar_passo_3_confirmar' = 'pedido-lista-consolidar-passo-3-confirmar.png'
  'tela_pedido_lista_consolidar_passo_modal_consolidado' = 'pedido-lista-consolidar-concluido-modal.png'
  'tela_pedido_lista_consolidar_passo_modal_consolidado_na_lista' = 'pedido-lista-consolidar-concluido-lista.png'
  # Edição em massa
  'tela_pedido_lista_edicao_em_massa_selecao_seta' = 'pedido-lista-edicao-massa-selecao-seta.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_a_editar' = 'pedido-lista-edicao-massa-campos-a-editar.png'
  'tela_pedido_lista_edicao_em_massa_modal_preview' = 'pedido-lista-edicao-massa-preview.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_opcoes_pedido' = 'pedido-lista-edicao-massa-campos-opcoes-pedido.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_opcoes_item' = 'pedido-lista-edicao-massa-campos-opcoes-item.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_opcoes_combinado' = 'pedido-lista-edicao-massa-campos-opcoes-combinado.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_editar_exemplo_tipo_cada_campo_alfanumerico' = 'pedido-lista-edicao-massa-campo-alfanumerico.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_editar_exemplo_tipo_cada_campo_selet' = 'pedido-lista-edicao-massa-campo-select.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_adicionar_campo' = 'pedido-lista-edicao-massa-campos-adicionar-campo.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal' = 'pedido-lista-edicao-massa-revisao-modal.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_visualizacao_por_pedido' = 'pedido-lista-edicao-massa-revisao-por-pedido.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_todos_serao_alterados' = 'pedido-lista-edicao-massa-revisao-todos-serao-alterados.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_todos_com_alteracao' = 'pedido-lista-edicao-massa-revisao-com-alteracao.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_todos_sem_alteracao' = 'pedido-lista-edicao-massa-revisao-sem-alteracao.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_confirmar' = 'pedido-lista-edicao-massa-confirmar.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_confirmado' = 'pedido-lista-edicao-massa-concluido-modal.png'
  # Dashboard
  'tela_pedido_dashboard_icone_acesso' = 'pedido-dashboard-icone-acesso.png'
  'tela_pedido_dashboard_icone_tela_principal_1' = 'pedido-dashboard-icone-tela-principal-1.png'
  'tela_pedido_dashboard_icone_tela_principal_2' = 'pedido-dashboard-icone-tela-principal-2.png'
  'tela_pedido_dashboard_teka_principal_paineis_seta' = 'pedido-dashboard-paineis-seta.png'
  'tela_pedido_dashboard_teka_principal_paineis_novo_seta' = 'pedido-dashboard-paineis-novo-seta.png'
  'tela_pedido_dashboard_teka_principal_paineis_novo_preenchido' = 'pedido-dashboard-paineis-novo-preenchido.png'
  'tela_pedido_dashboard_teka_principal_paineis_novo_feito' = 'pedido-dashboard-paineis-novo-feito.png'
  'tela_pedido_dashboard_teka_principal_paineis_renomear_excluir' = 'pedido-dashboard-paineis-renomear-excluir.png'
  'tela_pedido_dashboard_teka_principal_periodo' = 'pedido-dashboard-periodo-seta.png'
  'tela_pedido_dashboard_teka_principal_periodo_selecao' = 'pedido-dashboard-periodo-selecao.png'
  'tela_pedido_dashboard_teka_principal_periodo_selecao_feita' = 'pedido-dashboard-periodo-selecao-feita.png'
  'tela_pedido_dashboard_teka_principal_periodo_selecao_feita_filtro_ativo' = 'pedido-dashboard-periodo-filtro-ativo.png'
  'tela_pedido_dashboard_teka_principal_filtro' = 'pedido-dashboard-filtro.png'
  'tela_pedido_dashboard_teka_principal_filtros_selecao_widgets' = 'pedido-dashboard-filtros-selecao-widgets.png'
  'tela_pedido_dashboard_teka_principal_status' = 'pedido-dashboard-status.png'
  'tela_pedido_dashboard_teka_principal_novo_seta' = 'pedido-dashboard-novo-seta.png'
  'tela_pedido_dashboard_teka_principal_novo_sugestoes_' = 'pedido-dashboard-novo-sugestoes-seta.png'
  'tela_pedido_dashboard_teka_principal_novo_sugestoes_modal' = 'pedido-dashboard-novo-sugestoes-modal.png'
  'tela_pedido_dashboard_teka_principal_novo_sugestoes_modal_feito' = 'pedido-dashboard-novo-sugestoes-modal-feito.png'
  'tela_pedido_dashboard_teka_principal_novo_criar_zero_seta' = 'pedido-dashboard-novo-criar-zero-seta.png'
  'tela_pedido_dashboard_teka_principal_novo_criar_zero_modal_1' = 'pedido-dashboard-novo-criar-zero-modal-1.png'
  'tela_pedido_dashboard_teka_principal_novo_criar_zero_modal_selecao' = 'pedido-dashboard-novo-criar-zero-modal-selecao.png'
  'tela_pedido_dashboard_teka_principal_novo_criar_zero_modal_selecao_OPERACAO' = 'pedido-dashboard-novo-criar-zero-modal-operacao.png'
  'tela_pedido_dashboard_teka_principal_novo_criar_zero_modal_selecao_tipo_grafico' = 'pedido-dashboard-novo-criar-zero-modal-tipo-grafico.png'
  'tela_pedido_dashboard_teka_principal_novo_criar_zero_modal_selecao_tipo_grafico_feito' = 'pedido-dashboard-novo-criar-zero-modal-tipo-grafico-feito.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_seta' = 'pedido-dashboard-tres-pontos-seta.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_editar_seta' = 'pedido-dashboard-tres-pontos-editar-seta.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_editar_modal' = 'pedido-dashboard-tres-pontos-editar-modal.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_editar_modal_titulo' = 'pedido-dashboard-tres-pontos-editar-modal-titulo.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_editar_modal_indicador' = 'pedido-dashboard-tres-pontos-editar-modal-indicador.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_editar_modal_periodo' = 'pedido-dashboard-tres-pontos-editar-modal-periodo.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_editar_modal_tipo_grafico' = 'pedido-dashboard-tres-pontos-editar-modal-tipo-grafico.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_mover_seta' = 'pedido-dashboard-tres-pontos-mover-seta.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_mover_linha' = 'pedido-dashboard-tres-pontos-mover-linha.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_mover_concluir' = 'pedido-dashboard-tres-pontos-mover-concluir.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_mudar_tamanho_seta' = 'pedido-dashboard-tres-pontos-mudar-tamanho-seta.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_mudar_tamanho' = 'pedido-dashboard-tres-pontos-mudar-tamanho.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_mudar_tamanho_feito' = 'pedido-dashboard-tres-pontos-mudar-tamanho-feito.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_excluir_seta' = 'pedido-dashboard-tres-pontos-excluir-seta.png'
  'tela_pedido_dashboard_teka_principal_tres_pontos_excluido' = 'pedido-dashboard-tres-pontos-excluido.png'
  'tela_pedido_dashboard_teka_principal_detalhamento_grafico_mouse_1' = 'pedido-dashboard-detalhamento-grafico-mouse.png'
  # Historico
  'tela_pedido_historico_1' = 'pedido-historico-1.png'
  'tela_pedido_historico_2' = 'pedido-historico-2.png'
  'tela_pedido_historico_3' = 'pedido-historico-3.png'
  # Configuracoes (tela principal)
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_adicionar' = 'pedido-configuracoes-cards-ativos-disponiveis-adicionar.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_adicionar_ver_detalhes' = 'pedido-configuracoes-cards-ativos-disponiveis-adicionar-ver-detalhes.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_adicionar_ver_detalhes_aberto' = 'pedido-configuracoes-cards-ativos-disponiveis-adicionar-ver-detalhes-aberto.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_ocultado' = 'pedido-configuracoes-cards-ativos-disponiveis-ocultado.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_ocultado_exibido' = 'pedido-configuracoes-cards-ativos-disponiveis-ocultado-exibido.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_ocultado_exibir' = 'pedido-configuracoes-cards-ativos-disponiveis-ocultado-exibir.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_ocultar_seta' = 'pedido-configuracoes-cards-ativos-disponiveis-ocultar-seta.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_ativar_fluxo_1' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-ativar-fluxo-1.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_ativar_fluxo_2' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-ativar-fluxo-2.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_ativar_fluxo_3' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-ativar-fluxo-3.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_informacao' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-informacao.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_informacao_detalhes' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-informacao-detalhes.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_lista_card_lista' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-lista-card-lista.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_lista_salvar' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-lista-salvar.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_lista_salvar_confirmacao_1' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-lista-salvar-confirmacao-1.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_lista_salvar_confirmacao_2' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-lista-salvar-confirmacao-2.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_lista_salvar_confirmacao_nao_esta_tela_lista' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-lista-salvar-confirmacao-nao-esta-tela-lista.png'
  'tela_pedido_configuracoes_tela_principal_cards_ativos_disponiveis_remover_lista_seta' = 'pedido-configuracoes-cards-ativos-disponiveis-remover-lista-seta.png'
  'tela_pedido_configuracoes_tela_principal_cards_periodo_comparacao' = 'pedido-configuracoes-cards-periodo-comparacao.png'
  'tela_pedido_configuracoes_tela_principal_colunas_campos_calculados' = 'pedido-configuracoes-colunas-campos-calculados.png'
  'tela_pedido_configuracoes_tela_principal_colunas_casas_decimais' = 'pedido-configuracoes-colunas-casas-decimais.png'
  'tela_pedido_configuracoes_tela_principal_colunas_casas_decimais_editar_1' = 'pedido-configuracoes-colunas-casas-decimais-editar-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_casas_decimais_editar_2' = 'pedido-configuracoes-colunas-casas-decimais-editar-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_casas_decimais_editar_3' = 'pedido-configuracoes-colunas-casas-decimais-editar-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_casas_decimais_editar_4' = 'pedido-configuracoes-colunas-casas-decimais-editar-4.png'
  'tela_pedido_configuracoes_tela_principal_colunas_casas_decimais_editar_5' = 'pedido-configuracoes-colunas-casas-decimais-editar-5.png'
  'tela_pedido_configuracoes_tela_principal_colunas_formato_data' = 'pedido-configuracoes-colunas-formato-data.png'
  'tela_pedido_configuracoes_tela_principal_colunas_formato_data_fluxo_1' = 'pedido-configuracoes-colunas-formato-data-fluxo-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_formato_data_fluxo_2' = 'pedido-configuracoes-colunas-formato-data-fluxo-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_formato_data_fluxo_3' = 'pedido-configuracoes-colunas-formato-data-fluxo-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas' = 'pedido-configuracoes-colunas-personalizadas.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_1' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_2' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_CHECKBOX_1' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-checkbox-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_CHECKBOX_2' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-checkbox-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_CHECKBOX_3' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-checkbox-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_data_1' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-data-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_data_2' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-data-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_data_3' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-data-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_lista_1' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-lista-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_lista_2' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-lista-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_lista_3' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-lista-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_lista_4' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-lista-4.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_numero_1' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-numero-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_numero_2' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-numero-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_numero_3' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-numero-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_PERCENTUAL_1' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-percentual-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_PERCENTUAL_2' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-percentual-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_PERCENTUAL_3' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-percentual-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_texto' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-texto.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_texto_1' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-texto-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_texto_na_tela' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-texto-na-tela.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_tipo_documento_1' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-documento-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_tipo_documento_2' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-documento-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_tipo_documento_3' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-documento-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_tipo_formula_1' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-formula-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_tipo_formula_2' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-formula-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_tipo_formula_3' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-formula-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_criar_coluna_tipo_formula_4' = 'pedido-configuracoes-colunas-personalizadas-criar-coluna-tipo-formula-4.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_editar_coluna_1' = 'pedido-configuracoes-colunas-personalizadas-editar-coluna-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_editar_coluna_3' = 'pedido-configuracoes-colunas-personalizadas-editar-coluna-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_excluir_coluna_1' = 'pedido-configuracoes-colunas-personalizadas-excluir-coluna-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_excluir_coluna_2' = 'pedido-configuracoes-colunas-personalizadas-excluir-coluna-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_excluir_coluna_3' = 'pedido-configuracoes-colunas-personalizadas-excluir-coluna-3.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_excluir_coluna_4' = 'pedido-configuracoes-colunas-personalizadas-excluir-coluna-4.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_ocultar_coluna_1' = 'pedido-configuracoes-colunas-personalizadas-ocultar-coluna-1.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_ocultar_coluna_2' = 'pedido-configuracoes-colunas-personalizadas-ocultar-coluna-2.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_ocultar_coluna_4' = 'pedido-configuracoes-colunas-personalizadas-ocultar-coluna-4.png'
  'tela_pedido_configuracoes_tela_principal_colunas_personalizadas_ocultar_coluna_5' = 'pedido-configuracoes-colunas-personalizadas-ocultar-coluna-5.png'
  'tela_pedido_configuracoes_tela_principal_kanban_card_1' = 'pedido-configuracoes-kanban-card-1.png'
  'tela_pedido_configuracoes_tela_principal_kanban_card_2' = 'pedido-configuracoes-kanban-card-2.png'
  'tela_pedido_configuracoes_tela_principal_kanban_card_3' = 'pedido-configuracoes-kanban-card-3.png'
  'tela_pedido_configuracoes_tela_principal_kanban_card_4' = 'pedido-configuracoes-kanban-card-4.png'
  'tela_pedido_configuracoes_tela_principal_kanban_colunas' = 'pedido-configuracoes-kanban-colunas.png'
  'tela_pedido_configuracoes_tela_principal_kanban_colunas_1' = 'pedido-configuracoes-kanban-colunas-1.png'
  'tela_pedido_configuracoes_tela_principal_kanban_colunas_2' = 'pedido-configuracoes-kanban-colunas-2.png'
  'tela_pedido_configuracoes_tela_principal_kanban_colunas_3' = 'pedido-configuracoes-kanban-colunas-3.png'
  'tela_pedido_configuracoes_tela_principal_kanban_colunas_4' = 'pedido-configuracoes-kanban-colunas-4.png'
  'tela_pedido_configuracoes_tela_principal_kanban_modal_1' = 'pedido-configuracoes-kanban-modal-1.png'
  'tela_pedido_configuracoes_tela_principal_kanban_modal_2' = 'pedido-configuracoes-kanban-modal-2.png'
  'tela_pedido_configuracoes_tela_principal_kanban_modal_3' = 'pedido-configuracoes-kanban-modal-3.png'
  'tela_pedido_configuracoes_tela_principal_kanban_modal_4' = 'pedido-configuracoes-kanban-modal-4.png'
  'tela_pedido_configuracoes_tela_principal_numeracao' = 'pedido-configuracoes-numeracao.png'
  'tela_pedido_configuracoes_tela_principal_status_1' = 'pedido-configuracoes-status-1.png'
  'tela_pedido_configuracoes_tela_principal_status_2' = 'pedido-configuracoes-status-2.png'
  'tela_pedido_configuracoes_tela_principal_status_3' = 'pedido-configuracoes-status-3.png'
  'tela_pedido_configuracoes_tela_principal_status_4' = 'pedido-configuracoes-status-4.png'
  'tela_pedido_configuracoes_tela_principal_status_5' = 'pedido-configuracoes-status-5.png'
  'tela_pedido_configuracoes_tela_principal_status_6' = 'pedido-configuracoes-status-6.png'
  'tela_pedido_configuracoes_tela_principal_status_7' = 'pedido-configuracoes-status-7.png'
  'tela_pedido_configuracoes_tela_principal_status_ARRASTAR_1' = 'pedido-configuracoes-status-arrastar-1.png'
  'tela_pedido_configuracoes_tela_principal_status_ARRASTAR_2' = 'pedido-configuracoes-status-arrastar-2.png'
  'tela_pedido_configuracoes_tela_principal_status_novo_1' = 'pedido-configuracoes-status-novo-1.png'
  'tela_pedido_configuracoes_tela_principal_status_novo_2' = 'pedido-configuracoes-status-novo-2.png'
  'tela_pedido_configuracoes_tela_principal_status_novo_3' = 'pedido-configuracoes-status-novo-3.png'
  'tela_pedido_configuracoes_tela_principal_status_novo_4' = 'pedido-configuracoes-status-novo-4.png'
  'tela_pedido_configuracoes_tela_principal_tabela_linhas_pagina' = 'pedido-configuracoes-tabela-linhas-pagina.png'
  'tela_pedido_configuracoes_tela_principal_tabela_linhas_pagina_1' = 'pedido-configuracoes-tabela-linhas-pagina-1.png'
  'tela_pedido_configuracoes_tela_principal_tabela_pedidos_em_atraso_vermelho' = 'pedido-configuracoes-tabela-pedidos-em-atraso-vermelho.png'
  'tela_pedido_configuracoes_tela_principal ' = 'pedido-configuracoes-tela-principal.png'
  # Kanban
  'tela_pedido_kanban_acesso_seta' = 'pedido-kanban-acesso-seta.png'
  'tela_pedido_kanban_tela_principal' = 'pedido-kanban-tela-principal.png'
  'tela_pedido_kanban_tela_principal_cabecalho' = 'pedido-kanban-cabecalho.png'
  'tela_pedido_kanban_tela_principal_mover' = 'pedido-kanban-mover.png'
}

# Mesma origem Drive -> dois destinos (lembrar + reverter reutilizam print proximo)
$copiasExtrasImportar = @(
  @{ base = 'tela_pedido_lista_novo_pedido_modal_importacao_passo_2_completo'; dest = 'pedido-lista-importar-lembrar.png' },
  @{ base = 'tela_pedido_lista_novo_pedido_modal_importacao_tela_final'; dest = 'pedido-lista-importar-reverter.png' },
  @{ base = 'tela_pedido_lista_novo_pedido_modal'; dest = 'pedido-lista-novo-pedido-modal-opcoes.png' }
)

function Copiar-PrintManual {
  param([string]$Base, [string]$NomeDestino)
  $arquivo = Get-ChildItem -Path $origem -File -ErrorAction SilentlyContinue |
    Where-Object { $_.BaseName -eq $Base } |
    Select-Object -First 1
  if (-not $arquivo) {
    Write-Warning "Ausente no Drive: $Base"
    return $false
  }
  Copy-Item -LiteralPath $arquivo.FullName -Destination (Join-Path $destino $NomeDestino) -Force
  Write-Host "OK $($arquivo.Name) -> $NomeDestino"
  return $true
}

$copiados = 0
foreach ($par in $mapa.GetEnumerator()) {
  $base = $par.Key
  $nomeDestino = $par.Value
  $arquivo = Get-ChildItem -Path $origem -File -ErrorAction SilentlyContinue |
    Where-Object { $_.BaseName -eq $base } |
    Select-Object -First 1
  if (-not $arquivo) {
    Write-Warning "Ausente no Drive: $base"
    continue
  }
  Copy-Item -LiteralPath $arquivo.FullName -Destination (Join-Path $destino $nomeDestino) -Force
  Write-Host "OK $($arquivo.Name) -> $nomeDestino"
  $copiados++
}

foreach ($extra in $copiasExtrasImportar) {
  if (Copiar-PrintManual -Base $extra.base -NomeDestino $extra.dest) { $copiados++ }
}

# Fallback: prints de paineis ainda so no Drive Smart Docs -> copia smart-docs-*.png para pedido-*.png
$copiasFallbackPaineisSmartDocs = @(
  @{ src = 'smart-docs-lista-paineis-seta.png'; dest = 'pedido-lista-paineis-seta.png' },
  @{ src = 'smart-docs-lista-paineis-novo-seta.png'; dest = 'pedido-lista-paineis-novo-seta.png' },
  @{ src = 'smart-docs-lista-paineis-novo-nome-seta.png'; dest = 'pedido-lista-paineis-novo-nome-seta.png' },
  @{ src = 'smart-docs-lista-paineis-novo-nome-validar.png'; dest = 'pedido-lista-paineis-novo-nome-validar.png' },
  @{ src = 'smart-docs-lista-paineis-novo-nome-validado.png'; dest = 'pedido-lista-paineis-novo-nome-validado.png' }
)
foreach ($fb in $copiasFallbackPaineisSmartDocs) {
  $destPath = Join-Path $destino $fb.dest
  if (Test-Path $destPath) { continue }
  $srcPath = Join-Path $destino $fb.src
  if (-not (Test-Path $srcPath)) { continue }
  Copy-Item -LiteralPath $srcPath -Destination $destPath -Force
  Write-Host "Fallback $($fb.src) -> $($fb.dest)"
  $copiados++
}

Write-Host "`n$copiados arquivo(s) copiado(s) para $destino"
Write-Host 'Depois: bump MANUAL_SCREENSHOT_CACHE_KEY em manual-configurador-ui.tsx e hard refresh em :8001'
