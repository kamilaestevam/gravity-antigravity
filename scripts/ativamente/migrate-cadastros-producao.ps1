# Aplica migrations Prisma no gravity-cadastros-producao.
# Uso:
#   1. Crie servicos-global/cadastros/.env.producao (gitignored) com:
#        CADASTROS_DATABASE_URL="postgresql://...@HOST.proxy.rlwy.net:PORT/railway"
#      (copie DATABASE_PUBLIC_URL do Railway — NÃO use railway.internal)
#   2. .\scripts\ativamente\migrate-cadastros-producao.ps1
#
# Alternativa: railway login && railway run npx prisma migrate deploy --schema=prisma/schema.prisma

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cadastros = Join-Path $root 'servicos-global\cadastros'
$envFile = Join-Path $cadastros '.env.producao'

if (-not (Test-Path $envFile)) {
  Write-Host 'Arquivo ausente: servicos-global/cadastros/.env.producao' -ForegroundColor Red
  Write-Host 'Cole DATABASE_PUBLIC_URL do Railway (TCP Proxy habilitado).' -ForegroundColor Yellow
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
if ($url -match '@:/?') {
  Write-Host 'URL sem host (@:/railway). Habilite TCP Proxy no Railway.' -ForegroundColor Red
  exit 1
}
if ($url -notmatch 'proxy\.rlwy\.net') {
  Write-Host 'Aviso: host nao parece Railway publico (proxy.rlwy.net). Confira se e producao.' -ForegroundColor Yellow
}

if ($url -match '@([^:/]+):(\d+)') {
  Write-Host "Destino: $($matches[1]):$($matches[2])"
}

$env:CADASTROS_DATABASE_URL = $url
Set-Location $cadastros
npx prisma migrate deploy --schema=prisma/schema.prisma
Write-Host 'OK — migrate deploy concluido.' -ForegroundColor Green
