# Aplica migrations Prisma no gravity-smart-read-producao / gravity-smart-read-teste.
#
# Uso (Railway CLI logado):
#   .\scripts\ativamente\migrate-smart-read-railway.ps1 -Ambiente producao
#   .\scripts\ativamente\migrate-smart-read-railway.ps1 -Ambiente teste
#
# Uso (sem CLI): crie servicos-global/produto/smart-read/.env.producao ou .env.teste:
#   DATABASE_URL="postgresql://postgres:...@HOST.proxy.rlwy.net:PORT/railway"

param(
  [ValidateSet('teste', 'producao')]
  [string]$Ambiente = 'producao'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$smartRead = Join-Path $root 'servicos-global\produto\smart-read'
$service = if ($Ambiente -eq 'producao') { 'gravity-smart-read-producao' } else { 'gravity-smart-read-teste' }
$envFile = Join-Path $smartRead $(if ($Ambiente -eq 'producao') { '.env.producao' } else { '.env.teste' })

Write-Host "Servico Railway: $service" -ForegroundColor Cyan

$url = $null
try {
  $json = railway variables --service $service --json 2>$null | ConvertFrom-Json
  if ($json.DATABASE_PUBLIC_URL) { $url = [string]$json.DATABASE_PUBLIC_URL }
  elseif ($json.DATABASE_URL) { $url = [string]$json.DATABASE_URL }
} catch {
  Write-Host "Railway CLI indisponivel — tentando $envFile" -ForegroundColor Yellow
}

if (-not $url -and (Test-Path $envFile)) {
  $line = Get-Content $envFile | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
  if ($line) {
    $url = ($line -replace '^DATABASE_URL=', '').Trim().Trim('"').Trim("'")
  }
}

if (-not $url -or $url -notmatch '^postgres(ql)?://') {
  Write-Host "DATABASE_URL nao encontrada para $service." -ForegroundColor Red
  Write-Host "Opcao A: railway login && railway link && rode este script de novo." -ForegroundColor Yellow
  Write-Host "Opcao B: crie $envFile com DATABASE_URL (TCP Proxy / DATABASE_PUBLIC_URL)." -ForegroundColor Yellow
  exit 1
}

if ($url -match 'railway\.internal') {
  Write-Host 'URL privada (railway.internal). Use DATABASE_PUBLIC_URL com proxy.rlwy.net' -ForegroundColor Red
  exit 1
}

if ($url -match '@:/?') {
  Write-Host 'URL sem host (@:/railway). Habilite TCP Proxy no Railway.' -ForegroundColor Red
  exit 1
}

if ($url -match '@([^:/]+):(\d+)') {
  Write-Host "Destino: $($matches[1]):$($matches[2])"
}

$env:DATABASE_URL = $url
Set-Location $smartRead
node prisma/compose-schema.js
npx prisma migrate deploy --schema=prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
  Write-Host "FALHA — migrate deploy Smart Read ($Ambiente) exit $LASTEXITCODE." -ForegroundColor Red
  exit $LASTEXITCODE
}
Write-Host "OK — migrate deploy Smart Read ($Ambiente) concluido." -ForegroundColor Green
Write-Host "Tabela: progresso_leitura_smart_read" -ForegroundColor Green
