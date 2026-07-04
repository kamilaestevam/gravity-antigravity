# Copia prints do Drive para public/university/screenshots/pedido-*.png
# Fonte: ...\6. Produtos Gravity\1. Pedido

$ErrorActionPreference = 'Stop'

$candidatosOrigem = @(
  'G:\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\1. Pedido',
  "$env:USERPROFILE\Google Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\1. Pedido",
  "$env:USERPROFILE\Meu Drive\4. Gravity\1. Manual e Onboarding\1. Imagens para manual e onboarding\6. Produtos Gravity\1. Pedido"
)

$origem = $candidatosOrigem | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $origem) {
  Write-Error "Pasta do Drive nao encontrada. Crie '6. Produtos Gravity\1. Pedido' ou rode scripts/capturar-screenshots-manual-pedido-visao-geral.ts"
}

$destino = Join-Path $PSScriptRoot '..\servicos-global\configurador\public\university\screenshots'
New-Item -ItemType Directory -Force -Path $destino | Out-Null

$mapa = @{
  'tela_pedido_visao_insight' = 'pedido-tela-principal.png'
  'tela_pedido_visao_lista' = 'pedido-lista.png'
  'tela_pedido_visao_dashboard' = 'pedido-dashboard.png'
  'tela_pedido_visao_kanban' = 'pedido-kanban.png'
  'tela_pedido_acesso_via_hub' = 'pedido-acesso-hub.png'
  'tela_pedido_acesso_via_menu_lateral' = 'pedido-acesso-menu-lateral.png'
  'tela_pedido_visao_lista_expandir_seta' = 'pedido-lista-expandir-seta.png'
  'tela_pedido_visao_lista_itens_expandidos' = 'pedido-lista-itens-expandidos.png'
  'tela_pedido_visao_lista_expandir_todos_seta' = 'pedido-lista-expandir-todos-seta.png'
  'tela_pedido_visao_lista_itens_expandidos_todos' = 'pedido-lista-expandir-todos-expandido.png'
  'tela_pedido_visao_lista_colunas_customizar' = 'pedido-lista-colunas-customizar.png'
  'tela_pedido_visao_lista_colunas_arrastar' = 'pedido-lista-colunas-arrastar.png'
  'tela_pedido_configuracoes_criar_coluna' = 'pedido-configuracoes-criar-coluna.png'
  'tela_pedido_configuracoes_seta' = 'pedido-configuracoes-seta.png'
  'tela_pedido_configuracoes_criar_coluna_modal' = 'pedido-configuracoes-criar-coluna-modal.png'
  'tela_pedido_lista_edicao_selecionar_salvo' = 'pedido-lista-edicao-selecionar-salvo.png'
  'tela_pedido_lista_edicao_selecionar_salvar' = 'pedido-lista-edicao-selecionar-salvar.png'
  'tela_pedido_lista_edicao_selecionar_opcal' = 'pedido-lista-edicao-selecionar-opcoes.png'
  'tela_pedido_lista_edicao_modal' = 'pedido-lista-edicao-modal.png'
  'tela_pedido_lista_alertas' = 'pedido-lista-alertas.png'
  'tela_pedido_lista_excluir_setas' = 'pedido-lista-excluir-setas.png'
  'tela_pedido_lista_excluir_modal' = 'pedido-lista-excluir-modal.png'
  'tela_pedido_lista_excluir_confirmacao' = 'pedido-lista-excluir-confirmacao.png'
  'tela_pedido_lista_filtro_seta' = 'pedido-lista-filtro-seta.png'
  'tela_pedido_lista_filtro_modal' = 'pedido-lista-filtro-modal.png'
  'tela_pedido_lista_filtro_aplicado' = 'pedido-lista-filtro-aplicado.png'
  'tela_pedido_lista_filtro_aplicado_2' = 'pedido-lista-filtro-aplicado-2.png'
  'tela_pedido_lista_exportar_seta' = 'pedido-lista-exportar-seta.png'
  'tela_pedido_lista_exportar_modal' = 'pedido-lista-exportar-modal.png'
  'tela_pedido_lista_exportar_planilha' = 'pedido-lista-exportar-planilha.png'
  'tela_pedido_lista_exportar_download' = 'pedido-lista-exportar-download.png'
  # Smart Import — nomes reais no Drive (modal_importacao_passo_*)
  'tela_pedido_lista_novo_seta' = 'pedido-lista-importar-seta-novo.png'
  'tela_pedido_lista_novo_pedido_seta' = 'pedido-lista-importar-seta-novo-pedido.png'
  'tela_pedido_lista_novo_pedido_modal' = 'pedido-lista-importar-seta-importacao.png'
  'tela_pedido_lista_novo_pedido_modal_importacao' = 'pedido-lista-importar-modal.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_1' = 'pedido-lista-importar-upload.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_1_baixar_modelo_seta' = 'pedido-lista-importar-template.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_selecionar_planilha_seta' = 'pedido-lista-importar-multiplas-abas.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_1_selecionar_pedidos' = 'pedido-lista-importar-analisando.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_2_completo' = 'pedido-lista-importar-mapeamento.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_2_select' = 'pedido-lista-importar-confianca.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_2_modal' = 'pedido-lista-importar-memoria.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_2_ver_documento' = 'pedido-lista-importar-ver-documento.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal' = 'pedido-lista-importar-preview-filtros.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal_expandido' = 'pedido-lista-importar-preview-card.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal_expandido_aviso_erro' = 'pedido-lista-importar-duplicata.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_3_modal_expandido_editando' = 'pedido-lista-importar-sobrescrever-diff.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_passo_4' = 'pedido-lista-importar-resultado.png'
  'tela_pedido_lista_novo_pedido_modal_importacao_tela_final' = 'pedido-lista-importar-erros-csv.png'
  'tela_pedido_visao_lista_paineis_seta' = 'pedido-lista-paineis-seta.png'
  'tela_pedido_visao_lista_paineis_novo_seta' = 'pedido-lista-paineis-novo-seta.png'
  'tela_pedido_visao_lista_paineis_novo_nome_seta' = 'pedido-lista-paineis-novo-nome-seta.png'
  'tela_pedido_visao_lista_paineis_novo_nome_validar' = 'pedido-lista-paineis-novo-nome-validar.png'
  'tela_pedido_visao_lista_paineis_novo_nome_validado' = 'pedido-lista-paineis-novo-nome-validado.png'
  # Consolidar
  'tela_pedido_lista_consolidar_botao_nao_selecionado_seta' = 'pedido-lista-consolidar-botao-sem-selecao-seta.png'
  'tela_pedido_lista_consolidar_botao_selecionado_seta' = 'pedido-lista-consolidar-botao-com-selecao-seta.png'
  'tela_pedido_lista_consolidar_passo_1' = 'pedido-lista-consolidar-passo-1-configurar.png'
  'tela_pedido_lista_consolidar_passo_2_modal' = 'pedido-lista-consolidar-passo-2-modal.png'
  'tela_pedido_lista_consolidar_passo_2_modal_selecao_pedidos_consolidados' = 'pedido-lista-consolidar-passo-2-filtro-origem.png'
  'tela_pedido_lista_consolidar_passo_2_modal_exemplo_dados_iguais_entre_pedidos' = 'pedido-lista-consolidar-passo-2-dados-iguais.png'
  'tela_pedido_lista_consolidar_passo_2_modal_exemplo_dados_divergentes_entre_pedidos' = 'pedido-lista-consolidar-passo-2-dados-divergentes.png'
  'tela_pedido_lista_consolidar_passo_2_modal_exemplo_dados_vazios' = 'pedido-lista-consolidar-passo-2-dados-vazios.png'
  'tela_pedido_lista_consolidar_passo_2_modal_peoximo' = 'pedido-lista-consolidar-passo-2-proximo.png'
  'tela_pedido_lista_consolidar_passo_3_confirmar' = 'pedido-lista-consolidar-passo-3-confirmar.png'
  'tela_pedido_lista_consolidar_passo_modal_consolidado' = 'pedido-lista-consolidar-concluido-modal.png'
  'tela_pedido_lista_consolidar_passo_modal_consolidado_na_lista' = 'pedido-lista-consolidar-concluido-lista.png'
  # Edição em massa
  'tela_pedido_lista_edicao_em_massa_selecao_seta' = 'pedido-lista-edicao-massa-selecao-seta.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_a_editar' = 'pedido-lista-edicao-massa-campos-a-editar.png'
  'tela_pedido_lista_edicao_em_massa_modal_preview' = 'pedido-lista-edicao-massa-preview.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_opcoes_pedido' = 'pedido-lista-edicao-massa-campos-opcoes-pedido.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_opcoes_item' = 'pedido-lista-edicao-massa-campos-opcoes-item.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_opcoes_combinado' = 'pedido-lista-edicao-massa-campos-opcoes-combinado.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_editar_exemplo_tipo_cada_campo_alfanumerico' = 'pedido-lista-edicao-massa-campo-alfanumerico.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_editar_exemplo_tipo_cada_campo_selet' = 'pedido-lista-edicao-massa-campo-select.png'
  'tela_pedido_lista_edicao_em_massa_modal_campos_adicionar_campo' = 'pedido-lista-edicao-massa-campos-adicionar-campo.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal' = 'pedido-lista-edicao-massa-revisao-modal.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_visualizacao_por_pedido' = 'pedido-lista-edicao-massa-revisao-por-pedido.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_todos_serao_alterados' = 'pedido-lista-edicao-massa-revisao-todos-serao-alterados.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_todos_com_alteracao' = 'pedido-lista-edicao-massa-revisao-com-alteracao.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_todos_sem_alteracao' = 'pedido-lista-edicao-massa-revisao-sem-alteracao.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_confirmar' = 'pedido-lista-edicao-massa-confirmar.png'
  'tela_pedido_lista_edicao_em_massa_modal_passo_2_modal_confirmado' = 'pedido-lista-edicao-massa-concluido-modal.png'
}

# Mesma origem Drive -> dois destinos (lembrar + reverter reutilizam print proximo)
$copiasExtrasImportar = @(
  @{ base = 'tela_pedido_lista_novo_pedido_modal_importacao_passo_2_completo'; dest = 'pedido-lista-importar-lembrar.png' },
  @{ base = 'tela_pedido_lista_novo_pedido_modal_importacao_tela_final'; dest = 'pedido-lista-importar-reverter.png' }
)

function Copiar-PrintManual {
  param([string]$Base, [string]$NomeDestino)
  $arquivo = Get-ChildItem -Path $origem -File -ErrorAction SilentlyContinue |
    Where-Object { $_.BaseName -eq $Base } |
    Select-Object -First 1
  if (-not $arquivo) {
    Write-Warning "Ausente no Drive: $Base"
    return $false
  }
  Copy-Item -LiteralPath $arquivo.FullName -Destination (Join-Path $destino $NomeDestino) -Force
  Write-Host "OK $($arquivo.Name) -> $NomeDestino"
  return $true
}

$copiados = 0
foreach ($par in $mapa.GetEnumerator()) {
  $base = $par.Key
  $nomeDestino = $par.Value
  $arquivo = Get-ChildItem -Path $origem -File -ErrorAction SilentlyContinue |
    Where-Object { $_.BaseName -eq $base } |
    Select-Object -First 1
  if (-not $arquivo) {
    Write-Warning "Ausente no Drive: $base"
    continue
  }
  Copy-Item -LiteralPath $arquivo.FullName -Destination (Join-Path $destino $nomeDestino) -Force
  Write-Host "OK $($arquivo.Name) -> $nomeDestino"
  $copiados++
}

foreach ($extra in $copiasExtrasImportar) {
  if (Copiar-PrintManual -Base $extra.base -NomeDestino $extra.dest) { $copiados++ }
}

# Fallback: prints de paineis ainda so no Drive Smart Docs -> copia smart-docs-*.png para pedido-*.png
$copiasFallbackPaineisSmartDocs = @(
  @{ src = 'smart-docs-lista-paineis-seta.png'; dest = 'pedido-lista-paineis-seta.png' },
  @{ src = 'smart-docs-lista-paineis-novo-seta.png'; dest = 'pedido-lista-paineis-novo-seta.png' },
  @{ src = 'smart-docs-lista-paineis-novo-nome-seta.png'; dest = 'pedido-lista-paineis-novo-nome-seta.png' },
  @{ src = 'smart-docs-lista-paineis-novo-nome-validar.png'; dest = 'pedido-lista-paineis-novo-nome-validar.png' },
  @{ src = 'smart-docs-lista-paineis-novo-nome-validado.png'; dest = 'pedido-lista-paineis-novo-nome-validado.png' }
)
foreach ($fb in $copiasFallbackPaineisSmartDocs) {
  $destPath = Join-Path $destino $fb.dest
  if (Test-Path $destPath) { continue }
  $srcPath = Join-Path $destino $fb.src
  if (-not (Test-Path $srcPath)) { continue }
  Copy-Item -LiteralPath $srcPath -Destination $destPath -Force
  Write-Host "Fallback $($fb.src) -> $($fb.dest)"
  $copiados++
}

Write-Host "`n$copiados arquivo(s) copiado(s) para $destino"
Write-Host 'Depois: bump MANUAL_SCREENSHOT_CACHE_KEY em manual-configurador-ui.tsx e hard refresh em :8001'
