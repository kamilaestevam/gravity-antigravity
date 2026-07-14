# Aplica kit integração ERP em gravity-servicos-producao + gravity-pedido-producao.
#
# Requer: railway login
# Uso:
#   .\scripts\ativamente\migrate-kit-integracao-railway-producao.ps1
#   .\scripts\ativamente\migrate-kit-integracao-railway-producao.ps1 -Ambiente teste

param(
  [ValidateSet('teste', 'producao')]
  [string]$Ambiente = 'producao'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$servicosServices = if ($Ambiente -eq 'producao') {
  @('gravity-servicos-producao', 'gravity-servicos-prod')
} else {
  @('gravity-servicos-teste')
}
$pedidoService = if ($Ambiente -eq 'producao') { 'gravity-pedido-producao' } else { 'gravity-pedido-teste' }
$cfgService = if ($Ambiente -eq 'producao') { 'site-usegravity' } else { 'gravity-configurador-teste' }

function Test-UrlPostgresValida {
  param([string]$Url)
  return ($Url -and $Url -match 'proxy\.rlwy\.net|localhost|127\.0\.0\.1')
}

function Obter-Variaveis-Railway {
  param([string]$Service)
  $raw = railway variables --service $Service --environment production --json 2>&1
  if ($LASTEXITCODE -ne 0) { throw "railway variables falhou em $Service : $raw" }
  return $raw | ConvertFrom-Json
}

Write-Host "Kit integracao ERP — ambiente Railway: $Ambiente" -ForegroundColor Cyan

$orgUrl = $null
foreach ($svc in $servicosServices) {
  try {
    $json = Obter-Variaveis-Railway $svc
    $candidatos = @(
      [string]$json.DATABASE_PUBLIC_URL,
      [string]$json.ORGANIZACAO_DATABASE_URL,
      [string]$json.DATABASE_URL
    )
    foreach ($c in $candidatos) {
      if (Test-UrlPostgresValida $c) { $orgUrl = $c; break }
    }
    if ($orgUrl) {
      Write-Host "ORG URL via $svc" -ForegroundColor DarkGray
      break
    }
  } catch {
    Write-Host "Aviso: $svc — $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

if (-not (Test-UrlPostgresValida $orgUrl)) {
  Write-Host "DATABASE_PUBLIC_URL ausente em servicos — tentando ORGANIZACAO_DATABASE_URL em $cfgService" -ForegroundColor Yellow
  $cfgJson = Obter-Variaveis-Railway $cfgService
  $orgUrl = [string]$cfgJson.ORGANIZACAO_DATABASE_URL
  if (-not $orgUrl) { $orgUrl = [string]$cfgJson.SERVICOS_PLATAFORMA_DATABASE_URL }
  if (-not $orgUrl) { $orgUrl = [string]$cfgJson.TENANT_DATABASE_URL }
}

$pedJson = Obter-Variaveis-Railway $pedidoService
$pedUrl = [string]$pedJson.DATABASE_PUBLIC_URL
if (-not (Test-UrlPostgresValida $pedUrl)) { $pedUrl = [string]$pedJson.DATABASE_URL }

$cfgJson = Obter-Variaveis-Railway $cfgService
$cfgUrl = [string]$cfgJson.CONFIGURADOR_DATABASE_URL
if (-not $cfgUrl) { $cfgUrl = [string]$cfgJson.DATABASE_URL }

if (-not (Test-UrlPostgresValida $orgUrl)) {
  Write-Host "ORGANIZACAO_DATABASE_URL invalida (sem TCP Proxy publico?)." -ForegroundColor Red
  Write-Host "  1. Railway -> gravity-servicos-producao -> Settings -> Networking -> TCP Proxy :5432" -ForegroundColor Yellow
  Write-Host "  2. OU redeploy site-usegravity (migrations na rede interna no boot):" -ForegroundColor Yellow
  Write-Host "     railway redeploy -s site-usegravity -e production" -ForegroundColor Yellow
  exit 1
}
if (-not (Test-UrlPostgresValida $pedUrl)) {
  Write-Host "DATABASE_URL invalida em $pedidoService — habilite TCP Proxy no Postgres Pedido." -ForegroundColor Red
  exit 1
}

if ($orgUrl -match '@([^:/]+):(\d+)') { Write-Host "Org destino: $($matches[1]):$($matches[2])" }
if ($pedUrl -match '@([^:/]+):(\d+)') { Write-Host "Pedido destino: $($matches[1]):$($matches[2])" }

$env:ORGANIZACAO_DATABASE_URL = $orgUrl
$env:PEDIDO_DATABASE_URL = $pedUrl
if ($cfgUrl) { $env:CONFIGURADOR_DATABASE_URL = $cfgUrl }

Set-Location $root
Write-Host "Aplicando kit ($Ambiente) ..." -ForegroundColor Cyan
npx tsx scripts/ativamente/aplicar-kit-integracao-sap.ts
if ($LASTEXITCODE -ne 0) {
  Write-Host "FALHA — kit integracao ($Ambiente)." -ForegroundColor Red
  exit $LASTEXITCODE
}
Write-Host "OK — valide no Railway Data: api_credencial_oauth, api_registro_idempotencia, webhook_evento_enfileirado e pedido.referencia_externa_erp_pedido" -ForegroundColor Green
