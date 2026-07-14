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

$servicosService = if ($Ambiente -eq 'producao') { 'gravity-servicos-prod' } else { 'gravity-servicos-teste' }
$pedidoService = if ($Ambiente -eq 'producao') { 'gravity-pedido-producao' } else { 'gravity-pedido-teste' }
$cfgService = if ($Ambiente -eq 'producao') { 'site-usegravity' } else { 'gravity-configurador-teste' }

Write-Host "Kit integracao ERP — ambiente Railway: $Ambiente" -ForegroundColor Cyan

$orgJson = railway variables --service $servicosService --environment production --json | ConvertFrom-Json
$orgUrl = [string]$orgJson.DATABASE_PUBLIC_URL
if (-not $orgUrl) { $orgUrl = [string]$orgJson.ORGANIZACAO_DATABASE_URL }
if (-not $orgUrl) { $orgUrl = [string]$orgJson.DATABASE_URL }

$pedJson = railway variables --service $pedidoService --environment production --json | ConvertFrom-Json
$pedUrl = [string]$pedJson.DATABASE_PUBLIC_URL
if (-not $pedUrl) { $pedUrl = [string]$pedJson.DATABASE_URL }

$cfgJson = railway variables --service $cfgService --environment production --json | ConvertFrom-Json
$cfgUrl = [string]$cfgJson.CONFIGURADOR_DATABASE_URL
if (-not $cfgUrl) { $cfgUrl = [string]$cfgJson.DATABASE_URL }

if (-not $orgUrl -or $orgUrl -notmatch 'rlwy\.net|postgres') {
  Write-Host "ORGANIZACAO_DATABASE_URL invalida em $servicosService" -ForegroundColor Red
  exit 1
}
if (-not $pedUrl -or $pedUrl -notmatch 'rlwy\.net|postgres') {
  Write-Host "DATABASE_URL invalida em $pedidoService" -ForegroundColor Red
  exit 1
}

$env:ORGANIZACAO_DATABASE_URL = $orgUrl
$env:PEDIDO_DATABASE_URL = $pedUrl
if ($cfgUrl) { $env:CONFIGURADOR_DATABASE_URL = $cfgUrl }

Set-Location $root
Write-Host "Aplicando kit em $servicosService + $pedidoService ..." -ForegroundColor Cyan
npx tsx scripts/ativamente/aplicar-kit-integracao-sap.ts
if ($LASTEXITCODE -ne 0) {
  Write-Host "FALHA — kit integracao ($Ambiente)." -ForegroundColor Red
  exit $LASTEXITCODE
}
Write-Host "OK — valide no Railway Data: api_credencial_oauth, api_registro_idempotencia, webhook_evento_enfileirado e pedido.referencia_externa_erp_pedido" -ForegroundColor Green
