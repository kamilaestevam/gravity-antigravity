# Aplica migration id_processo no Pedido Railway (public + schemas organizacao_*).
param(
  [ValidateSet('teste', 'producao')]
  [string]$Ambiente = 'teste'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$service = if ($Ambiente -eq 'producao') { 'gravity-pedido-producao' } else { 'gravity-pedido-teste' }

Write-Host "Servico Railway: $service" -ForegroundColor Cyan

$json = railway variables --service $service --json | ConvertFrom-Json
$url = [string]$json.DATABASE_PUBLIC_URL

if (-not $url -or $url -notmatch 'proxy\.rlwy\.net') {
  Write-Host "DATABASE_PUBLIC_URL invalida em $service — habilite TCP Proxy no Railway." -ForegroundColor Red
  exit 1
}

if ($url -match '@([^:/]+):(\d+)') { Write-Host "Destino: $($matches[1]):$($matches[2])" }

$env:PEDIDO_DATABASE_URL = $url
$env:DATABASE_URL = $url

Set-Location $root
npx tsx scripts/ativamente/compose-pedido-schema.ts
npx prisma migrate deploy --schema=servicos-global/produto/pedido/prisma/schema.prisma
npx tsx scripts/ativamente/aplicar-id-processo-tenants-pedido.ts

Write-Host "OK — Pedido id_processo ($Ambiente) concluido." -ForegroundColor Green
