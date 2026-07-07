# Upsert portos faltantes (UN/LOCODE) no gravity-cadastros-producao.
# Uso:
#   1. Crie servicos-global/cadastros/.env.producao (gitignored) com:
#        CADASTROS_DATABASE_URL="postgresql://...@zephyr.proxy.rlwy.net:16684/railway"
#      (DATABASE_PUBLIC_URL do Railway — NÃO use railway.internal)
#   2. .\scripts\ativamente\upsert-portos-cadastros-producao.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envFile = Join-Path $root 'servicos-global\cadastros\.env.producao'

if (-not (Test-Path $envFile)) {
  Write-Host 'Arquivo ausente: servicos-global/cadastros/.env.producao' -ForegroundColor Red
  Write-Host 'Railway → gravity-cadastros-producao → Connect → DATABASE_PUBLIC_URL (TCP Proxy).' -ForegroundColor Yellow
  exit 1
}

$line = Get-Content $envFile | Where-Object { $_ -match '^CADASTROS_DATABASE_URL=' } | Select-Object -First 1
if (-not $line) {
  Write-Host 'CADASTROS_DATABASE_URL nao encontrado em .env.producao' -ForegroundColor Red
  exit 1
}

$url = ($line -replace '^CADASTROS_DATABASE_URL=', '').Trim().Trim('"').Trim("'")
if ($url -notmatch '^postgres(ql)?://') {
  Write-Host 'URL invalida: deve comecar com postgresql://' -ForegroundColor Red
  exit 1
}
if ($url -match 'railway\.internal') {
  Write-Host 'URL privada (railway.internal). Use DATABASE_PUBLIC_URL com proxy.rlwy.net' -ForegroundColor Red
  exit 1
}

if ($url -match '@([^:/]+):(\d+)') {
  Write-Host "Destino: $($matches[1]):$($matches[2])"
}

$env:CADASTROS_DATABASE_URL = $url
Set-Location $root
npx tsx scripts/sob-demanda/upsert-portos-faltantes-todas-levas.ts
Write-Host 'OK — upsert portos producao concluido.' -ForegroundColor Green
