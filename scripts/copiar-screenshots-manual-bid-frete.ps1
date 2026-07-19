# Copia prints do Drive para public/university/screenshots/bid-frete-int-*.png
# Fonte: ...\6. Produtos Gravity\3. BID Frete Int

$ErrorActionPreference = 'Stop'

$candidatosOrigem = @(
  'G:\Meu Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\7. Produtos Gravity\3. BID Frete Int',
  'G:\Meu Drive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\3. BID Frete Int',
  'G:\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\3. BID Frete Int',
  "$env:USERPROFILE\Google Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\3. BID Frete Int",
  "$env:USERPROFILE\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\3. BID Frete Int",
  "$env:USERPROFILE\OneDrive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\3. BID Frete Int",
  "$env:USERPROFILE\OneDrive\4. Gravity\9. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\3. BID Frete Int",
  "$env:USERPROFILE\OneDrive - Personal\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\3. BID Frete Int"
)

$origem = $candidatosOrigem | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $origem) {
  $raizesBusca = @(
    "$env:USERPROFILE\OneDrive",
    "$env:USERPROFILE\OneDrive - Personal",
    "$env:USERPROFILE\OneDrive - DMM Ltda",
    "$env:USERPROFILE\Google Drive",
    "$env:USERPROFILE\My Drive",
    'G:\Meu Drive',
    'G:\'
  ) | Where-Object { Test-Path $_ }
  foreach ($raiz in $raizesBusca) {
    $achado = Get-ChildItem -Path $raiz -Recurse -Depth 10 -Directory -Filter '3. BID Frete Int' -ErrorAction SilentlyContinue |
      Select-Object -First 1
    if ($achado) {
      $origem = $achado.FullName
      Write-Host "Origem descoberta: $origem"
      break
    }
  }
}
if (-not $origem) {
  Write-Error "Pasta do Drive nao encontrada. Sincronize '6. Produtos Gravity\3. BID Frete Int' (ou marque os PNGs como disponiveis offline no OneDrive) e rode de novo."
}

$destino = Join-Path $PSScriptRoot '..\servicos-global\configurador\public\university\screenshots'
New-Item -ItemType Directory -Force -Path $destino | Out-Null

$prefixoDestino = 'bid-frete-int-'
$prefixosDrive = @('tela_bid_frete_int_', 'tela_bid_frete_manual_')
$copiados = 0
$pulados = 0

foreach ($prefixoDrive in $prefixosDrive) {
  $arquivos = Get-ChildItem -Path $origem -Filter "${prefixoDrive}*.png" -File
  foreach ($arquivo in $arquivos) {
    if (-not (Test-Path -LiteralPath $arquivo.FullName)) {
      $pulados++
      Write-Warning "Pulado (indisponivel no Drive): $($arquivo.Name)"
      continue
    }
    $sufixo = $arquivo.BaseName.Substring($prefixoDrive.Length)
    $nomeDestino = ($prefixoDestino + ($sufixo -replace '_', '-')) + '.png'
    Copy-Item -LiteralPath $arquivo.FullName -Destination (Join-Path $destino $nomeDestino) -Force
    $copiados++
  }
}

# Aliases manual — nomes no Drive que não batem 1:1 com o sufixo do catálogo
$aliasesManual = @{
  'tela_bid_frete_manual_origem_.png' = 'bid-frete-int-manual-origem-porto-origem.png'
  'tela_bid_frete_cotacao_bid_1.png' = 'bid-frete-int-cotacao-bid-1.png'
  'tela_bid_frete_cotacao_bid_modal.png' = 'bid-frete-int-cotacao-bid-modal.png'
  'tela_bid_frete_cotacao_bid_modal_selec.png' = 'bid-frete-int-cotacao-bid-modal-selec.png'
  'tela_bid_frete_painel_cotacao.png' = 'bid-frete-int-painel-cotacao.png'
  'tela_bid_frete_painel_cotacao_acesso_1.png' = 'bid-frete-int-painel-cotacao-acesso-1.png'
  'tela_bid_frete_painel_cotacao_acesso_2.png' = 'bid-frete-int-painel-cotacao-acesso-2.png'
  'tela_bid_frete_painel_cotacao_visao_geral.png' = 'bid-frete-int-painel-cotacao-visao-geral.png'
  'tela_bid_frete_painel_cotacao_menu_superior.png' = 'bid-frete-int-painel-cotacao-menu-superior.png'
  'tela_bid_frete_painel_cotacao_divisao.png' = 'bid-frete-int-painel-cotacao-divisao.png'
  'tela_bid_frete_painel_cotacao_1.png' = 'bid-frete-int-painel-cotacao-1.png'
  'tela_bid_frete_painel_cotacao_dados_gerais.png' = 'bid-frete-int-painel-cotacao-dados-gerais.png'
  'tela_bid_frete_painel_cotacao_solicitacao.png' = 'bid-frete-int-painel-cotacao-solicitacao.png'
  'tela_bid_frete_painel_cotacao_solicitacao_cotacao.png' = 'bid-frete-int-painel-cotacao-solicitacao-cotacao.png'
  'tela_bid_frete_painel_cotacao_solicitacao_cotacao_link_resposta.png' = 'bid-frete-int-painel-cotacao-solicitacao-cotacao-link-resposta.png'
  'tela_bid_frete_painel_cotacao_solicitacao_cotacao_link_acesso_cliente.png' = 'bid-frete-int-painel-cotacao-solicitacao-cotacao-link-acesso-cliente.png'
  'tela_bid_frete_painel_cotacao_solicitacao_cotacao_link_expirado.png' = 'bid-frete-int-painel-cotacao-solicitacao-cotacao-link-expirado.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_erro_email..png' = 'bid-frete-int-painel-cotacao-solicitacao-cotacao-erro-email.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_erro_email.png' = 'bid-frete-int-painel-cotacao-solicitacao-cotacao-erro-email.png'
  'tela_bid_frete_painel_cotacao_propostas.png' = 'bid-frete-int-painel-cotacao-propostas.png'
  'tela_bid_frete_painel_cotacao_propostas_1.png' = 'bid-frete-int-painel-cotacao-propostas-1.png'
  'tela_bid_frete_painel_cotacao_propostas_ranking.png' = 'bid-frete-int-painel-cotacao-propostas-ranking.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_completo.png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-completo.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_completo .png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-completo.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_aprovar_1.png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-aprovar-1.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_aprovar_2.png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-aprovar-2.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_aprovar_modal.png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-aprovar-modal.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_aprovar_modal_1.png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-aprovar-modal-1.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_aprovado_tela_1.png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-tela-1.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_aprovado_tela_2.png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-tela-2.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_aprovado_email_1.png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-email-1.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_aprovado_email_2.png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-email-2.png'
  'tela_bid_frete_painel_cotacao_propostas_detalhamento_aprovado_email_3.png' = 'bid-frete-int-painel-cotacao-propostas-detalhamento-aprovado-email-3.png'
  'tela_bid_frete_int_configuracoes_casas_decimais.png' = 'bid-frete-int-configuracoes-colunas-casas-decimais.png'
  'tela_bid_frete_lista_filtro_1.png' = 'bid-frete-int-lista-filtro-1.png'
  'tela_bid_frete_lista_filtro_2.png' = 'bid-frete-int-lista-filtro-2.png'
  'tela_bid_frete_lista_filtro_3.png' = 'bid-frete-int-lista-filtro-3.png'
  'tela_bid_frete_lista_filtro_4.png' = 'bid-frete-int-lista-filtro-4.png'
  'tela_bid_frete_lista_excluir_1.png' = 'bid-frete-int-lista-excluir-1.png'
  'tela_bid_frete_lista_excluir_2.png' = 'bid-frete-int-lista-excluir-2.png'
}
foreach ($nomeDrive in $aliasesManual.Keys) {
  $caminhoDrive = Join-Path $origem $nomeDrive
  if (-not (Test-Path -LiteralPath $caminhoDrive)) { continue }
  Copy-Item -LiteralPath $caminhoDrive -Destination (Join-Path $destino $aliasesManual[$nomeDrive]) -Force
  $copiados++
}

Write-Host "Copiados $copiados prints para $destino (pulados: $pulados)"

# Espelha no worktree guia-bid-frete (Academy dev :8003) quando existir.
$destinoEspelho = Join-Path $PSScriptRoot '..\..\guia-bid-frete\servicos-global\configurador\public\university\screenshots'
if (Test-Path (Split-Path $destinoEspelho -Parent)) {
  New-Item -ItemType Directory -Force -Path $destinoEspelho | Out-Null
  Copy-Item -Path (Join-Path $destino 'bid-frete-int-*.png') -Destination $destinoEspelho -Force
  Write-Host "Espelhados bid-frete-int-*.png em $destinoEspelho"
}
