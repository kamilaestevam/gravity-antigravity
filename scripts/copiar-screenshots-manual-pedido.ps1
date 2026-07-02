# Copia prints do Drive para public/university/screenshots/pedido-*.png
# Fonte: ...\6. Produtos Gravity\1. Pedido

$ErrorActionPreference = 'Stop'

$candidatosOrigem = @(
  'G:\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\1. Pedido',
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
  'tela_pedido_visao_lista_colunas_customizar' = 'pedido-lista-colunas-customizar.png'
  'tela_pedido_visao_lista_colunas_arrastar' = 'pedido-lista-colunas-arrastar.png'
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
