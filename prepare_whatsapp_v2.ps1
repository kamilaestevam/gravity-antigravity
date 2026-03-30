
$source = "C:\Users\danie\OneDrive\Documents\Antigravity\3. DMM Landing Page - Carro\src"
$desktop = [Environment]::GetFolderPath("Desktop")
$temp = "C:\Users\danie\OneDrive\Documents\Antigravity\temp-whatsapp-bundle"
$destination = Join-Path $desktop "DMM-Landing-Page-Carro.zip"

Write-Host "Iniciando a preparação do pacote para WhatsApp na Área de Trabalho..."

# Remove old temp if exists
if (Test-Path $temp) { 
    Remove-Item -Recurse -Force $temp 
}

# Copy contents of src to temp (excluding node_modules, .next, .git)
Write-Host "Copiando arquivos de '$source' para pasta temporária..."
robocopy $source $temp /MIR /XD node_modules .next .git /NJH /NJS /NDL /NC /NS /NP

# Zipping
Write-Host "Compactando em arquivo ZIP na Área de Trabalho..."
if (Test-Path $destination) { Remove-Item $destination -ErrorAction SilentlyContinue }
Compress-Archive -Path "$temp\*" -DestinationPath $destination -Force

# Clean up
Write-Host "Limpando arquivos temporários..."
Remove-Item -Recurse -Force $temp

Write-Host "Pronto! O arquivo está aqui: $destination"
