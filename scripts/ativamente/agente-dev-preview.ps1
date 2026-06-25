# agente-dev-preview.ps1 — alertas de preview hub (:8000+) e porta seguinte automática
# Uso: npm run agente:preview -- status | hook-checkout | registrar

param(
  [Parameter(Position = 0)]
  [ValidateSet('status', 'registrar', 'hook-checkout', 'alocar')]
  [string]$Acao = 'status',

  [string]$Task,
  [string]$RefAnterior,
  [string]$RefNovo,
  [string]$FlagCheckout
)

function Get-RepoRoot {
  $dir = Split-Path -Parent $PSScriptRoot
  Split-Path -Parent $dir
}

function Read-Registry {
  param([string]$Root)
  $path = Join-Path $Root 'tasks/dev-preview-registry.json'
  if (-not (Test-Path $path)) { throw "Registry não encontrado: $path" }
  Get-Content $path -Raw | ConvertFrom-Json
}

function Write-Registry {
  param([string]$Root, $Config)
  $path = Join-Path $Root 'tasks/dev-preview-registry.json'
  ($Config | ConvertTo-Json -Depth 8) | Set-Content -Path $path -Encoding utf8
}

function Get-BranchName {
  param([string]$Root, [string]$Ref)
  if ([string]::IsNullOrWhiteSpace($Ref)) { return $null }
  Push-Location $Root
  try {
    $name = git rev-parse --abbrev-ref $Ref 2>$null
    if ($LASTEXITCODE -ne 0) { return $null }
    if ($name -eq 'HEAD') {
      $name = git branch --show-current 2>$null
    }
    return $name
  } finally {
    Pop-Location
  }
}

function Test-PortListening {
  param([int]$Port)
  $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)
}

function Get-PortasReservadas {
  param($Config)
  if ($Config.portas_reservadas) {
    return @($Config.portas_reservadas | ForEach-Object { [int]$_ })
  }
  return @(8005, 8009)
}

function Test-PortReserved {
  param($Config, [int]$Port)
  (Get-PortasReservadas -Config $Config) -contains $Port
}

function Get-HubPortRange {
  param($Config)
  $reserved = Get-PortasReservadas -Config $Config
  @([int]$Config.porta_hub_base..[int]$Config.porta_hub_max) | Where-Object { $_ -notin $reserved }
}

function Get-NextFreePort {
  param($Config, [int]$Start)
  $max = [int]$Config.porta_hub_max
  for ($p = $Start; $p -le $max; $p++) {
    if (Test-PortReserved -Config $Config -Port $p) { continue }
    if (-not (Test-PortListening -Port $p)) { return $p }
  }
  throw "Nenhuma porta livre entre $Start e $max (reservadas: $(Get-PortasReservadas -Config $Config -join ', '))"
}

function Sanitize-BranchFolder {
  param([string]$Branch)
  ($Branch -replace '[\\/:*?"<>|]', '-').ToLower()
}

function Ensure-WorktreePreview {
  param([string]$Root, [string]$Branch)
  $parent = Split-Path -Parent $Root
  $folder = "gravity-preview-$(Sanitize-BranchFolder -Branch $Branch)"
  $wtPath = Join-Path $parent $folder

  Push-Location $Root
  try {
    if (-not (Test-Path $wtPath)) {
      git worktree add $wtPath $Branch 2>&1 | Out-Null
      if ($LASTEXITCODE -ne 0) { throw "git worktree add falhou: $Branch" }
    }
    $rootNm = Join-Path $Root 'node_modules'
    $wtNm = Join-Path $wtPath 'node_modules'
    if ((Test-Path $rootNm) -and -not (Test-Path $wtNm)) {
      cmd /c "mklink /J `"$wtNm`" `"$rootNm`"" 2>&1 | Out-Null
    }
  } finally {
    Pop-Location
  }
  $wtPath
}

function Start-HubVite {
  param([string]$WorktreePath, [int]$Port)
  $cfg = Join-Path $WorktreePath 'servicos-global\configurador'
  if (-not (Test-Path $cfg)) { throw "Configurador não encontrado: $cfg" }
  $cmd = @"
cd '$cfg'; `$env:GRAVITY_AGENTE_WORKTREE='1'; `$env:VITE_DEV_UI_PORT='$Port'; npx vite --host 127.0.0.1 --port $Port --strictPort
"@
  Start-Process powershell -ArgumentList '-NoExit', '-Command', $cmd | Out-Null
}

function Emit-Alerta {
  param([string]$Mensagem)
  Write-Host "ALERTA_PREVIEW=1"
  Write-Host "ALERTA_MSG=$Mensagem"
  try {
    [console]::beep(880, 200)
    [console]::beep(660, 200)
  } catch {}
}

$root = Get-RepoRoot
$config = Read-Registry -Root $root

switch ($Acao) {
  'status' {
    $branch = Get-BranchName -Root $root -Ref 'HEAD'
    $port8000 = Test-PortListening -Port 8000
    Write-Host "BRANCH_ATUAL=$branch"
    Write-Host "PORTA_8000_ATIVA=$($port8000.ToString().ToLower())"
    $hubPorts = Get-HubPortRange -Config $config
    foreach ($p in $hubPorts) {
      if (Test-PortListening -Port $p) {
        $sess = $config.sessoes | Where-Object { [int]$_.porta -eq $p } | Select-Object -First 1
        $b = if ($sess) { $sess.branch } else { '?' }
        Write-Host "PREVIEW_ATIVO=$p|$b|http://127.0.0.1:${p}/"
      }
    }
    if ($port8000 -and $config.sessoes) {
      $reg8000 = $config.sessoes | Where-Object { [int]$_.porta -eq 8000 } | Select-Object -First 1
      if ($reg8000 -and $reg8000.branch -ne $branch) {
        Emit-Alerta "Branch no disco ($branch) difere do registrado em :8000 ($($reg8000.branch)) — recarregue ou confira preview."
      }
    }
    exit 0
  }

  'registrar' {
    $branch = Get-BranchName -Root $root -Ref 'HEAD'
    $port = if (Test-PortListening -Port 8000) { 8000 } else { Get-NextFreePort -Config $config -Start $config.porta_hub_base }
    $entrada = [ordered]@{
      porta         = $port
      branch        = $branch
      task          = $Task
      worktree_path = $root
      url           = "http://127.0.0.1:${port}/"
      data_registro = (Get-Date).ToUniversalTime().ToString('o')
    }
    $config.sessoes = @(@($config.sessoes | Where-Object { [int]$_.porta -ne $port }) + @([pscustomobject]$entrada))
    Write-Registry -Root $root -Config $config
    Write-Host "OK=1"
    Write-Host "PREVIEW=$($entrada.url)"
    Write-Host "PORTA=$port"
    Write-Host "BRANCH=$branch"
    exit 0
  }

  'alocar' {
    $branch = Get-BranchName -Root $root -Ref 'HEAD'
    $port = Get-NextFreePort -Config $config -Start ([int]$config.porta_hub_base + 1)
    $wt = if ($port -eq 8000) { $root } else { Ensure-WorktreePreview -Root $root -Branch $branch }
    Start-HubVite -WorktreePath $wt -Port $port
    $entrada = [ordered]@{
      porta         = $port
      branch        = $branch
      task          = $Task
      worktree_path = ($wt -replace '\\', '/')
      url           = "http://127.0.0.1:${port}/"
      data_registro = (Get-Date).ToUniversalTime().ToString('o')
    }
    $config.sessoes = @($config.sessoes) + @([pscustomobject]$entrada)
    Write-Registry -Root $root -Config $config
    Write-Host "OK=1"
    Write-Host "PREVIEW=$($entrada.url)"
    Write-Host "PORTA=$port"
    Write-Host "BRANCH=$branch"
    exit 0
  }

  'hook-checkout' {
    if ($FlagCheckout -ne '1') { exit 0 }
    $branchAnt = Get-BranchName -Root $root -Ref $RefAnterior
    $branchNova = Get-BranchName -Root $root -Ref $RefNovo
    if (-not $branchAnt -or -not $branchNova -or $branchAnt -eq $branchNova) { exit 0 }

    if (-not (Test-PortListening -Port 8000)) {
      Emit-Alerta "Branch mudou: $branchAnt → $branchNova (:8000 inativo — suba o hub antes de testar)."
      exit 0
    }

    $portAntiga = Get-NextFreePort -Config $config -Start ([int]$config.porta_hub_base + 1)
    $wtAnt = Ensure-WorktreePreview -Root $root -Branch $branchAnt
    $ja = $config.sessoes | Where-Object { $_.branch -eq $branchAnt -and [int]$_.porta -eq $portAntiga } | Select-Object -First 1
    if (-not $ja) {
      Start-HubVite -WorktreePath $wtAnt -Port $portAntiga
      $config.sessoes = @($config.sessoes) + @([pscustomobject][ordered]@{
        porta         = $portAntiga
        branch        = $branchAnt
        task          = $null
        worktree_path = ($wtAnt -replace '\\', '/')
        url           = "http://127.0.0.1:${portAntiga}/"
        data_registro = (Get-Date).ToUniversalTime().ToString('o')
      })
    }

    $config.sessoes = @(@($config.sessoes | Where-Object { [int]$_.porta -ne 8000 }) + @([pscustomobject][ordered]@{
      porta         = 8000
      branch        = $branchNova
      task          = $null
      worktree_path = ($root -replace '\\', '/')
      url           = 'http://127.0.0.1:8000/'
      data_registro = (Get-Date).ToUniversalTime().ToString('o')
    }))
    Write-Registry -Root $root -Config $config

    $urlAnt = "http://127.0.0.1:${portAntiga}/"
    Emit-Alerta ":8000 agora e branch $branchNova | preview anterior ($branchAnt) preservado em $urlAnt"
    Write-Host "PREVIEW_NOVO=http://127.0.0.1:8000/"
    Write-Host "PREVIEW_ANTERIOR=$urlAnt"
    Write-Host "BRANCH_NOVA=$branchNova"
    Write-Host "BRANCH_ANTERIOR=$branchAnt"
    exit 0
  }
}
