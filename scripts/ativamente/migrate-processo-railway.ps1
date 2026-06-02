# Aplica migrations Processo no Railway (gravity-processo-producao / gravity-processo-teste).
# Pre-requisito: servico Postgres com DATABASE_PUBLIC_URL (TCP Proxy habilitado).
#
# Uso:
#   .\scripts\ativamente\migrate-processo-railway.ps1 -Ambiente teste
#   .\scripts\ativamente\migrate-processo-railway.ps1 -Ambiente producao

param(
  [ValidateSet('teste', 'producao')]
  [string]$Ambiente = 'teste'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$processo = Join-Path $root 'servicos-global\produto\processo'
$service = if ($Ambiente -eq 'producao') { 'gravity-processo-producao' } else { 'gravity-processo-teste' }

Write-Host "Servico Railway: $service" -ForegroundColor Cyan

$json = railway variables --service $service --json | ConvertFrom-Json
$url = [string]$json.DATABASE_PUBLIC_URL

if (-not $url -or $url -notmatch 'proxy\.rlwy\.net') {
  Write-Host "DATABASE_PUBLIC_URL invalida ou ausente em $service." -ForegroundColor Red
  Write-Host "No Railway: servico Postgres -> Settings -> Networking -> Enable TCP Proxy" -ForegroundColor Yellow
  Write-Host "O servico precisa ser template Postgres (nao servico vazio)." -ForegroundColor Yellow
  exit 1
}

if ($url -match '@([^:/]+):(\d+)') {
  Write-Host "Destino: $($matches[1]):$($matches[2])"
}

$env:DATABASE_URL = $url
Set-Location $processo
node server/scripts/compose-schema.js
npx prisma migrate deploy --schema=prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
  Write-Host "FALHA — migrate deploy Processo ($Ambiente) retornou exit $LASTEXITCODE." -ForegroundColor Red
  exit $LASTEXITCODE
}
Write-Host "OK — migrate deploy Processo ($Ambiente) concluido." -ForegroundColor Green
