# dev-local.ps1 — Sobe toda a plataforma Gravity local
# Uso: powershell -File scripts/dev-local.ps1

$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

Write-Host ""
Write-Host "=== GRAVITY DEV LOCAL ===" -ForegroundColor Cyan
Write-Host ""

# Backend Configurador (porta 8005)
Write-Host "[1/4] Backend Configurador (porta 8005)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\servicos-global\configurador'; npm run dev"

# Frontend Configurador (porta 8000)
Write-Host "[2/4] Frontend Configurador (porta 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\servicos-global\configurador'; npx vite"

# Backend SimulaCusto (porta 8020)
Write-Host "[3/4] Backend SimulaCusto (porta 8020)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\produto\simula-custo\server'; npx tsx watch src/index.ts"

# Backend Processo (porta 8025)
Write-Host "[4/4] Backend Processo (porta 8025)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\produto\processo\server'; npx tsx watch src/index.ts"

Write-Host ""
Write-Host "Todos os servicos iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "  Configurador:  http://localhost:8000" -ForegroundColor White
Write-Host "  API Config:    http://localhost:8005" -ForegroundColor DarkGray
Write-Host "  API SimulaCusto: http://localhost:8020" -ForegroundColor DarkGray
Write-Host "  API Processo:  http://localhost:8025" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Para parar tudo, feche as janelas do PowerShell." -ForegroundColor DarkGray
