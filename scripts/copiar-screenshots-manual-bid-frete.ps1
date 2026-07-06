# Copia prints do Drive para public/university/screenshots/bid-frete-int-*.png
# Fonte: ...\6. Produtos Gravity\3. BID Frete Int

$ErrorActionPreference = 'Stop'

$candidatosOrigem = @(
  'G:\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\3. BID Frete Int',
  "$env:USERPROFILE\Google Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\3. BID Frete Int",
  "$env:USERPROFILE\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\3. BID Frete Int"
)

$origem = $candidatosOrigem | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $origem) {
  Write-Error "Pasta do Drive nao encontrada. Crie '6. Produtos Gravity\3. BID Frete Int' no Drive."
}

$destino = Join-Path $PSScriptRoot '..\servicos-global\configurador\public\university\screenshots'
New-Item -ItemType Directory -Force -Path $destino | Out-Null

$prefixoDrive = 'tela_bid_frete_int_'
$prefixoDestino = 'bid-frete-int-'

$arquivos = Get-ChildItem -Path $origem -Filter "${prefixoDrive}*.png" -File
$copiados = 0
$pulados = 0

foreach ($arquivo in $arquivos) {
  if (-not (Test-Path -LiteralPath $arquivo.FullName)) {
    $pulados++
    Write-Warning "Pulado (indisponivel no Drive): $($arquivo.Name)"
    continue
  }
  $sufixo = $arquivo.BaseName.Substring($prefixoDrive.Length)
  $nomeDestino = ($prefixoDestino + ($sufixo -replace '_', '-')) + '.png'
  Copy-Item -LiteralPath $arquivo.FullName -Destination (Join-Path $destino $nomeDestino) -Force
  $copiados++
}

Write-Host "Copiados $copiados prints para $destino (pulados: $pulados)"
