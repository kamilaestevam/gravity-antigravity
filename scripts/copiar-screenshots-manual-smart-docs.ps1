# Copia prints do Drive para public/university/screenshots/smart-docs-*.png
# Fonte: ...\7. Produtos Gravity\2. Smart Docs (fallback: 6. Produtos Gravity)

$ErrorActionPreference = 'Stop'

$candidatosOrigem = @(
  'G:\Meu Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\7. Produtos Gravity\2. Smart Docs',
  "$env:USERPROFILE\Google Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\7. Produtos Gravity\2. Smart Docs",
  "$env:USERPROFILE\Meu Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\7. Produtos Gravity\2. Smart Docs",
  'G:\Meu Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\2. Smart Docs',
  "$env:USERPROFILE\Google Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\2. Smart Docs",
  "$env:USERPROFILE\Meu Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\2. Smart Docs",
  'G:\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\7. Produtos Gravity\2. Smart Docs',
  'G:\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\2. Smart Docs'
)

$origem = $candidatosOrigem | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $origem) {
  Write-Error "Pasta do Drive nao encontrada. Ajuste `$candidatosOrigem em scripts/copiar-screenshots-manual-smart-docs.ps1"
}

$destino = Join-Path $PSScriptRoot '..\servicos-global\configurador\public\university\screenshots'
New-Item -ItemType Directory -Force -Path $destino | Out-Null

$mapa = @{
  'tela_smart_read_acesso_hub' = 'smart-docs-acesso-hub.png'
  'tela_smart_read_acesso_menu_lateral' = 'smart-docs-acesso-menu-lateral.png'
  'tela_smart_docs_tela_principal' = 'smart-docs-tela-principal.png'
  'tela_smart_docs_tela_lista_visao_geral' = 'smart-docs-lista-visao-geral.png'
  'tela_smart_docs_tela_insight_nova_leitura' = 'smart-docs-insights-nova-leitura.png'
  'tela_smart_docs_tela_insight_tooltip_1' = 'smart-docs-insights-tooltip-1.png'
  'tela_smart_docs_tela_insight_tooltip_2' = 'smart-docs-insights-tooltip-2.png'
  'tela_smart_docs_tela_lista' = 'smart-docs-lista.png'
  'tela_smart_read_lista_colunas_customizar' = 'smart-docs-lista-colunas-customizar.png'
  'tela_smart_read_lista_colunas_customizar_arrastar' = 'smart-docs-lista-colunas-customizar-arrastar.png'
  'tela_smart_docs_tela_lista_excluir_seta' = 'smart-docs-lista-excluir-seta.png'
  'tela_smart_docs_tela_lista_excluir_modal' = 'smart-docs-lista-excluir-modal.png'
  'tela_smart_docs_tela_lista_excluir_confirmacao' = 'smart-docs-lista-excluir-confirmacao.png'
  'tela_smart_read_lista_exportar_seta' = 'smart-docs-lista-exportar-seta.png'
  'tela_smart_read_lista_exportar_modal' = 'smart-docs-lista-exportar-modal.png'
  'tela_smart_read_lista_exportar_planilha' = 'smart-docs-lista-exportar-planilha.png'
  'tela_smart_read_lista_exportar_download' = 'smart-docs-lista-exportar-download.png'
  'tela_smart_docs_tela_principal_expandir_seta' = 'smart-docs-lista-expandir-seta.png'
  'tela_smart_docs_tela_principal_linha_expandida' = 'smart-docs-lista-linha-expandida.png'
  'tela_smart_docs_tela_lista_expandir_todos_seta' = 'smart-docs-lista-expandir-todos-seta.png'
  'tela_smart_read_lista_expandir_todos_seta' = 'smart-docs-lista-expandir-todos-seta.png'
  'tela_smart_docs_tela_lista_expandir_todos_expandido' = 'smart-docs-lista-expandir-todos-expandido.png'
  'tela_smart_docs_tela_lista_paineis_seta' = 'smart-docs-lista-paineis-seta.png'
  'tela_smart_docs_tela_lista_paineis_novo_seta' = 'smart-docs-lista-paineis-novo-seta.png'
  'tela_smart_docs_tela_lista_paineis_novo_nome_seta' = 'smart-docs-lista-paineis-novo-nome-seta.png'
  'tela_smart_docs_tela_lista_paineis_novo_nome_validar' = 'smart-docs-lista-paineis-novo-nome-validar.png'
  'tela_smart_docs_tela_lista_paineis_novo_nome_validado' = 'smart-docs-lista-paineis-novo-nome-validado.png'
  'tela_smart_docs_tela_lista_transacoes_api' = 'smart-docs-lista-transacoes-api.png'
  'tela_smart_docs_tela_lista_nova_leitura' = 'smart-docs-lista-nova-leitura.png'
  'tela_smart_read_lista_4_passos' = 'smart-docs-nova-leitura-4-passos.png'
  'tela_smart_read_fluxo_edicao_1' = 'smart-docs-lista-fluxo-edicao-link.png'
  'tela_smart_read_fluxo_edicao_2' = 'smart-docs-lista-fluxo-edicao-conferencia.png'
  'tela_smart_read_lista_filtro_seta' = 'smart-docs-lista-filtro-seta.png'
  'tela_smart_read_lista_filtro_modal' = 'smart-docs-lista-filtro-modal.png'
  'tela_smart_read_lista_filtro_final' = 'smart-docs-lista-filtro-final.png'
  'tela_smart_docs_tela_lista_insight_nova_leitura_passo_1_tela_geral' = 'smart-docs-nova-leitura-passo-1-geral.png'
  'tela_smart_docs_tela_lista_insight_nova_leitura_passo_1_tela_geral_anexar' = 'smart-docs-nova-leitura-passo-1-anexar.png'
  'tela_smart_docs_tela_lista_insight_nova_leitura_passo_1_tela_geral_anexar_seta' = 'smart-docs-nova-leitura-passo-1-anexar-seta.png'
  'tela_smart_docs_tela_lista_insight_nova_leitura_passo_1_tela_geral_anexado' = 'smart-docs-nova-leitura-passo-1-anexado.png'
  'tela_smart_docs_tela_nova_leitura_passo_1_excluir_1' = 'smart-docs-nova-leitura-passo-1-excluir-1.png'
  'tela_smart_docs_tela_nova_leitura_passo_1_excluir_2' = 'smart-docs-nova-leitura-passo-1-excluir-2.png'
  'tela_smart_docs_tela_lista_insight_nova_leitura_passo_1_tela_geral_exemplo_erro' = 'smart-docs-nova-leitura-passo-1-exemplo-erro.png'
  'tela_smart_docs_tela_insight_nova_leitura_passo_2_a' = 'smart-docs-nova-leitura-passo-2-a.png'
  'tela_smart_docs_tela_insight_nova_leitura_passo_2_b' = 'smart-docs-nova-leitura-passo-2-b.png'
  'tela_smart_docs_tela_insight_nova_leitura_passo_2_c' = 'smart-docs-nova-leitura-passo-2-c.png'
  'tela_smart_docs_tela_nova_leitura_tokens' = 'smart-docs-nova-leitura-tokens.png'
  'tela_smart_docs_tela_nova_leitura_passo_2_avancar' = 'smart-docs-nova-leitura-passo-2-avancar.png'
  'tela_smart_docs_tela_nova_leitura_passo_3' = 'smart-docs-nova-leitura-passo-3.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_1' = 'smart-docs-nova-leitura-passo-3-conferencia-1.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_filtros' = 'smart-docs-nova-leitura-passo-3-conferencia-filtros.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_filtros_exemplo' = 'smart-docs-nova-leitura-passo-3-conferencia-filtros-exemplo.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_campos_sessao_juntas' = 'smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-juntas.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_campos_sessao_itens' = 'smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-itens.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_campos_sessao_itens_aberto' = 'smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-itens-aberto.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_campos_sessao_aberta' = 'smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-aberta.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_campos_sessao_aberta_editar' = 'smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-aberta-editar.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_campos_sessao_aberta_editado' = 'smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-aberta-editado.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_campos_sessao_conferido' = 'smart-docs-nova-leitura-passo-3-conferencia-campos-sessao-conferido.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_check_list_acesso' = 'smart-docs-nova-leitura-passo-3-check-list-acesso.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_check_list_acesso_1' = 'smart-docs-nova-leitura-passo-3-check-list-acesso-1.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_check_list_acesso_2' = 'smart-docs-nova-leitura-passo-3-check-list-acesso-2.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_check_list_acesso_3' = 'smart-docs-nova-leitura-passo-3-check-list-acesso-3.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_check_list_acesso_4' = 'smart-docs-nova-leitura-passo-3-check-list-acesso-4.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_comparar_arquivo_1' = 'smart-docs-nova-leitura-passo-3-comparar-arquivo-1.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_comparar_arquivo_2' = 'smart-docs-nova-leitura-passo-3-comparar-arquivo-2.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_comparar_arquivo_3' = 'smart-docs-nova-leitura-passo-3-comparar-arquivo-3.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_comparar_arquivo_4' = 'smart-docs-nova-leitura-passo-3-comparar-arquivo-4.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_comparar_arquivo_5' = 'smart-docs-nova-leitura-passo-3-comparar-arquivo-5.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_analise_risco_1' = 'smart-docs-nova-leitura-passo-3-analise-risco-1.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_analise_risco_2' = 'smart-docs-nova-leitura-passo-3-analise-risco-2.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_analise_risco_3' = 'smart-docs-nova-leitura-passo-3-analise-risco-3.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_comunicacao_fornecedor_1' = 'smart-docs-nova-leitura-passo-3-comunicacao-fornecedor-1.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_comunicacao_fornecedor_2' = 'smart-docs-nova-leitura-passo-3-comunicacao-fornecedor-2.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_comunicacao_fornecedor_3' = 'smart-docs-nova-leitura-passo-3-comunicacao-fornecedor-3.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_comunicacao_fornecedor_4' = 'smart-docs-nova-leitura-passo-3-comunicacao-fornecedor-4.png'
  'tela_smart_docs_tela_nova_leitura_passo_3_conferencia_consolutor_inteligente' = 'smart-docs-nova-leitura-passo-3-consultor-inteligente.png'
  'tela_smart_resultado_4' = 'smart-docs-nova-leitura-passo-4.png'
  'tela_smart_resultado_5' = 'smart-docs-nova-leitura-passo-4-performance.png'
  'tela_smart_resultado_6' = 'smart-docs-nova-leitura-passo-4-tempo-total.png'
  'tela_smart_resultado_7' = 'smart-docs-nova-leitura-passo-4-download-pacote.png'
  'tela_smart_resultado_1' = 'smart-docs-nova-leitura-passo-4-selecao.png'
  'tela_smart_resultado_2' = 'smart-docs-nova-leitura-passo-4-arquivos-baixados.png'
  'tela_smart_docs_tela_nova_leitura_passo_4_alterado_erro_metroca' = 'smart-docs-nova-leitura-passo-4-alterado-erro-metrica.png'
  'tela_smart_docs_status' = 'smart-docs-status.png'
  'tela_smart_read_configuracoes_seta' = 'smart-docs-configuracoes-seta.png'
  'tela_smart_docs_configuracoes' = 'smart-docs-configuracoes-tela-principal.png'
  'tela_smart_docs_configuracoes_acesso' = 'smart-docs-configuracoes-acesso.png'
  'tela_smart_docs_configuracoes_card_atualizado_1' = 'smart-docs-configuracoes-cards.png'
  'tela_smart_docs_configuracoes_card_atualizado_cards_1' = 'smart-docs-configuracoes-cards-adicionar.png'
  'tela_smart_docs_configuracoes_card_atualizado_cards_2' = 'smart-docs-configuracoes-cards-adicionar-salvar.png'
  'tela_smart_docs_configuracoes_card_atualizado_cards_3' = 'smart-docs-configuracoes-cards-lista-resultado.png'
  'tela_smart_docs_configuracoes_list' = 'smart-docs-configuracoes-tabelas.png'
  'tela_smart_docs_configuracoes_colunas_1' = 'smart-docs-configuracoes-colunas-1.png'
  'tela_smart_docs_configuracoes_colunas_2' = 'smart-docs-configuracoes-colunas-2.png'
  'tela_smart_docs_configuracoes_colunas_3' = 'smart-docs-configuracoes-colunas-3.png'
  'tela_smart_docs_configuracoes_colunas_4' = 'smart-docs-configuracoes-colunas-4.png'
  'tela_smart_read_configuracoes_tela_principal' = 'smart-docs-configuracoes-tela-principal.png'
  'tela_smart_read_configuracoes_colunas_personalizadas' = 'smart-docs-configuracoes-colunas-personalizadas.png'
  'tela_smart_read_configuracoes_criar_coluna_1' = 'smart-docs-configuracoes-criar-coluna-1.png'
  'tela_smart_read_configuracoes_criar_coluna_2' = 'smart-docs-configuracoes-criar-coluna-2.png'
  'tela_smart_docs_historico' = 'smart-docs-historico-1.png'
  'tela_smart_read_historico_2' = 'smart-docs-historico-2.png'
  'tela_smart_read_historico_3' = 'smart-docs-historico-3.png'
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

Write-Host "`n$copiados arquivo(s) copiado(s) para $destino"
Write-Host 'Depois: bump MANUAL_SCREENSHOT_CACHE_KEY em manual-configurador-ui.tsx e hard refresh em :8001'
