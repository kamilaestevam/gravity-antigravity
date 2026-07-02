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
