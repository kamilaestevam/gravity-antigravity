# Copia prints do Drive para public/university/screenshots/smart-docs-*.png
# Fonte: ...\6. Produtos Gravity\2. Smart Docs

$ErrorActionPreference = 'Stop'

$candidatosOrigem = @(
  'G:\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\2. Smart Docs',
  "$env:USERPROFILE\Google Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\2. Smart Docs",
  "$env:USERPROFILE\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\2. Smart Docs"
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
  'tela_smart_docs_tela_lista_insight_nova_leitura_passo_1_tela_geral_exemplo_erro' = 'smart-docs-nova-leitura-passo-1-exemplo-erro.png'
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
