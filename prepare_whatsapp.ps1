
$source = "C:\Users\danie\OneDrive\Documents\Antigravity\3. DMM Landing Page - Carro"
$temp = "C:\Users\danie\OneDrive\Documents\Antigravity\temp-whatsapp-bundle"
$destination = "C:\Users\danie\OneDrive\Documents\Antigravity\DMM-Landing-Page-Carro.zip"

Write-Host "Iniciando a preparação do pacote para WhatsApp..."

# Remove old temp if exists
if (Test-Path $temp) { 
    Write-Host "Removendo pasta temporária antiga..."
    Remove-Item -Recurse -Force $temp 
}

# Copy project excluding node_modules, .next, .git
Write-Host "Copiando arquivos (excluindo pastas pesadas)..."
# Robocopy usage: robocopy source destination /mir /xd excludes
# Note: robocopy return codes can be tricky, so we ignore them for now.
robocopy $source $temp /MIR /XD node_modules .next .git /NJH /NJS /NDL /NC /NS /NP

# Zipping
Write-Host "Compactando em arquivo ZIP..."
if (Test-Path $destination) { Remove-Item $destination }
Compress-Archive -Path "$temp\*" -DestinationPath $destination -Force

# Clean up
Write-Host "Limpando arquivos temporários..."
Remove-Item -Recurse -Force $temp

Write-Host "Pronto! O arquivo '$destination' foi criado."
