# Coordenador — aplica migrations Configurador em gravity-configurador-producao.
#
# Pré-requisito: railway login (CLI autenticada)
#   railway login
#
# Uso:
#   .\scripts\ativamente\migrate-configurador-railway-producao.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$service = 'gravity-configurador-producao'

Write-Host "Servico Railway Postgres: $service" -ForegroundColor Cyan

$json = railway variables --service $service --environment production --json | ConvertFrom-Json
$url = [string]$json.DATABASE_PUBLIC_URL
if (-not $url) { $url = [string]$json.DATABASE_URL }

if (-not $url -or $url -notmatch 'proxy\.rlwy\.net') {
  Write-Host "DATABASE_PUBLIC_URL invalida em $service." -ForegroundColor Red
  Write-Host "Railway -> $service -> Settings -> Networking -> TCP Proxy (5432)" -ForegroundColor Yellow
  Write-Host "Ou rode: gh workflow run 'Migrate Configurador Produção'" -ForegroundColor Yellow
  exit 1
}

if ($url -match '@([^:/]+):(\d+)') {
  Write-Host "Destino: $($matches[1]):$($matches[2])"
}

$env:CONFIGURADOR_DATABASE_URL = $url
$env:DATABASE_URL = $url

Set-Location (Join-Path $root 'servicos-global\configurador')
Write-Host "Executando prisma migrate deploy..." -ForegroundColor Cyan
npm run prisma:migrate:deploy
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Garantindo tabela taxa_moeda_sync_agendamento (SQL idempotente)..." -ForegroundColor Cyan
Set-Location $root
npx tsx scripts/ativamente/aplicar-taxa-moeda-sync-agendamento-producao.ts
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "OK — migration Configurador producao. Confira taxa_moeda_sync_agendamento no Railway Data." -ForegroundColor Green
