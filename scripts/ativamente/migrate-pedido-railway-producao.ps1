# Coordenador — aplica migrations Pedido em gravity-pedido-producao (produção).
# Inclui id_processo TEXT nullable em todos os schemas com tabela pedido.
#
# Opção A (recomendada se DATABASE_PUBLIC_URL quebrada no Postgres):
#   railway redeploy -s site-usegravity -e production
#   O start-site.sh roda aplicar-migrations-pedido.ts com rede interna.
#
# Opção B (este script — exige TCP Proxy no Postgres):
#   .\scripts\ativamente\migrate-pedido-railway-producao.ps1

param(
  [ValidateSet('teste', 'producao')]
  [string]$Ambiente = 'producao'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$service = if ($Ambiente -eq 'producao') { 'gravity-pedido-producao' } else { 'gravity-pedido-teste' }

Write-Host "Servico Railway Postgres: $service" -ForegroundColor Cyan

$json = railway variables --service $service --environment $Ambiente --json | ConvertFrom-Json
$url = [string]$json.DATABASE_PUBLIC_URL

if (-not $url -or $url -notmatch 'proxy\.rlwy\.net') {
  Write-Host "DATABASE_PUBLIC_URL invalida em $service (host vazio ou sem TCP Proxy)." -ForegroundColor Red
  Write-Host ""
  Write-Host "Correcao rapida em producao:" -ForegroundColor Yellow
  Write-Host "  1. Railway -> $service -> Settings -> Networking -> TCP Proxy porta 5432"
  Write-Host "  2. Confirme DATABASE_PUBLIC_URL com proxy.rlwy.net"
  Write-Host "  OU redeploy do site (migrations rodam na rede interna):" -ForegroundColor Yellow
  Write-Host "  railway redeploy -s site-usegravity -e production"
  exit 1
}

if ($url -match '@([^:/]+):(\d+)') {
  Write-Host "Destino: $($matches[1]):$($matches[2])"
}

$cfgJson = railway variables --service site-usegravity --environment $Ambiente --json | ConvertFrom-Json
$cfgUrl = [string]$cfgJson.CONFIGURADOR_DATABASE_URL
if (-not $cfgUrl) { $cfgUrl = [string]$cfgJson.DATABASE_URL }

$env:PEDIDO_DATABASE_URL = $url
if ($cfgUrl) { $env:CONFIGURADOR_DATABASE_URL = $cfgUrl }

Set-Location $root
Write-Host "Executando aplicar-migrations-pedido.ts..." -ForegroundColor Cyan
npx tsx scripts/ativamente/aplicar-migrations-pedido.ts
if ($LASTEXITCODE -ne 0) {
  Write-Host "FALHA — migrations Pedido ($Ambiente)." -ForegroundColor Red
  exit $LASTEXITCODE
}
Write-Host "OK — migrations Pedido ($Ambiente) concluidas. Valide GET /api/v1/pedidos na lista." -ForegroundColor Green
