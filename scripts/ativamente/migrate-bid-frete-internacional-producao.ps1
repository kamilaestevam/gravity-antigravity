# Aplica migrations Prisma no gravity-bidfrete-producao (SSOT cotacao_bid_frete_internacional).
# Uso:
#   1. Railway → gravity-bidfrete-producao → Settings → Networking → habilite TCP Proxy (5432)
#   2. Copie DATABASE_PUBLIC_URL (host *.proxy.rlwy.net — NÃO @:/railway)
#   3. Crie servicos-global/produto/bid-frete-internacional/.env.producao (gitignored):
#        DATABASE_URL="postgresql://postgres:...@HOST.proxy.rlwy.net:PORT/railway"
#   4. .\scripts\ativamente\migrate-bid-frete-internacional-producao.ps1
#
# Alternativa sem proxy: push master + redeploy site-usegravity (start-site.sh aplica via rede interna).

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$bid = Join-Path $root 'servicos-global\produto\bid-frete-internacional'
$envFile = Join-Path $bid '.env.producao'

if (-not (Test-Path $envFile)) {
  Write-Host 'Arquivo ausente: servicos-global/produto/bid-frete-internacional/.env.producao' -ForegroundColor Red
  Write-Host 'Cole DATABASE_PUBLIC_URL do Railway (TCP Proxy habilitado) ou redeploy site-usegravity.' -ForegroundColor Yellow
  exit 1
}

$line = Get-Content $envFile | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
if (-not $line) {
  Write-Host 'DATABASE_URL nao encontrado em .env.producao' -ForegroundColor Red
  exit 1
}

$url = ($line -replace '^DATABASE_URL=', '').Trim().Trim('"').Trim("'")
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

$env:DATABASE_URL = $url
Set-Location $bid
node prisma/compose-schema.js
npx prisma migrate deploy --schema=prisma/schema.prisma
Write-Host 'OK — migrate deploy BID Frete Internacional concluido.' -ForegroundColor Green
