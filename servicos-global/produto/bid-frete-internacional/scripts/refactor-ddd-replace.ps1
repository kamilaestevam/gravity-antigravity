# Substituições DDD — BID Frete Internacional (server, prisma seeds, testes)
$productRoot = Split-Path $PSScriptRoot -Parent
$repoRoot = (Resolve-Path (Join-Path $productRoot "..\..\..")).Path
$dirs = @(
  (Join-Path $productRoot "server\src"),
  (Join-Path $productRoot "prisma"),
  (Join-Path $productRoot "client\src"),
  (Join-Path $repoRoot "testes\testes-unitarios\bid-frete-internacional"),
  (Join-Path $repoRoot "testes\testes-funcionais\bid-frete-internacional")
)

$replacements = [ordered]@{
  'bidFreteInternacionalPedidoCotacao' = 'disparoCotacaoBidFreteInternacional'
  'bidFreteInternacionalTabelaValor' = 'tabelaBidFreteInternacional'
  'bidFreteInternacionalClassificacao' = 'classificacaoBidFreteInternacional'
  'bidFreteInternacionalFornecedor' = 'fornecedorBidFreteInternacional'
  'bidFreteInternacionalCotacao' = 'cotacaoBidFreteInternacional'
  'bidFreteInternacionalProposta' = 'propostaBidFreteInternacional'
  'bidFreteInternacionalAvaliacao' = 'avaliacaoBidFreteInternacional'
  'bidFreteInternacionalGanho' = 'ganhoBidFreteInternacional'
  'bidFreteInternacionalPorto' = 'localOrigemBidFreteInternacional'
  'bidFreteInternacionalTaxa' = 'taxaOrigemBidFreteInternacional'
  'id_pedido_cotacao_bid_frete_internacional' = 'id_disparo_cotacao_bid_frete_internacional'
  'canal_pedido_cotacao_bid_frete_internacional' = 'canal_disparo_cotacao_bid_frete_internacional'
  'status_pedido_cotacao_bid_frete_internacional' = 'status_disparo_cotacao_bid_frete_internacional'
  'token_resposta_pedido_cotacao_bid_frete_internacional' = 'token_resposta_disparo_cotacao_bid_frete_internacional'
  'data_expiracao_token_pedido_cotacao_bid_frete_internacional' = 'data_expiracao_token_disparo_cotacao_bid_frete_internacional'
  'data_envio_pedido_cotacao_bid_frete_internacional' = 'data_envio_disparo_cotacao_bid_frete_internacional'
  'data_visualizacao_pedido_cotacao_bid_frete_internacional' = 'data_visualizacao_disparo_cotacao_bid_frete_internacional'
  'data_resposta_pedido_cotacao_bid_frete_internacional' = 'data_resposta_disparo_cotacao_bid_frete_internacional'
  'erro_envio_pedido_cotacao_bid_frete_internacional' = 'erro_envio_disparo_cotacao_bid_frete_internacional'
  'data_criacao_pedido_cotacao_bid_frete_internacional' = 'data_criacao_disparo_cotacao_bid_frete_internacional'
  'data_atualizacao_pedido_cotacao_bid_frete_internacional' = 'data_atualizacao_disparo_cotacao_bid_frete_internacional'
  'id_tabela_valor_bid_frete_internacional' = 'id_tabela_bid_frete_internacional'
  'origem_codigo_tabela_valor_bid_frete_internacional' = 'origem_codigo_tabela_bid_frete_internacional'
  'destino_codigo_tabela_valor_bid_frete_internacional' = 'destino_codigo_tabela_bid_frete_internacional'
  'origem_nome_tabela_valor_bid_frete_internacional' = 'origem_nome_tabela_bid_frete_internacional'
  'destino_nome_tabela_valor_bid_frete_internacional' = 'destino_nome_tabela_bid_frete_internacional'
  'modal_tabela_valor_bid_frete_internacional' = 'modal_tabela_bid_frete_internacional'
  'modalidade_tabela_valor_bid_frete_internacional' = 'modalidade_tabela_bid_frete_internacional'
  'moeda_tabela_valor_bid_frete_internacional' = 'moeda_tabela_bid_frete_internacional'
  'valor_frete_tabela_valor_bid_frete_internacional' = 'valor_frete_tabela_bid_frete_internacional'
  'taxas_origem_tabela_valor_bid_frete_internacional' = 'taxas_origem_tabela_bid_frete_internacional'
  'taxas_destino_tabela_valor_bid_frete_internacional' = 'taxas_destino_tabela_bid_frete_internacional'
  'valor_total_tabela_valor_bid_frete_internacional' = 'valor_total_tabela_bid_frete_internacional'
  'dias_transito_tabela_valor_bid_frete_internacional' = 'dias_transito_tabela_bid_frete_internacional'
  'dias_free_time_tabela_valor_bid_frete_internacional' = 'dias_free_time_tabela_bid_frete_internacional'
  'validade_inicio_tabela_valor_bid_frete_internacional' = 'validade_inicio_tabela_bid_frete_internacional'
  'validade_fim_tabela_valor_bid_frete_internacional' = 'validade_fim_tabela_bid_frete_internacional'
  'ativa_tabela_valor_bid_frete_internacional' = 'ativa_tabela_bid_frete_internacional'
  'via_tabela_valor_proposta_bid_frete_internacional' = 'via_tabela_proposta_bid_frete_internacional'
  'codigo_porto_bid_frete_internacional' = 'codigo_local_origem_bid_frete_internacional'
  'nome_porto_bid_frete_internacional' = 'nome_local_origem_bid_frete_internacional'
  'pais_porto_bid_frete_internacional' = 'pais_local_origem_bid_frete_internacional'
  'pais_codigo_porto_bid_frete_internacional' = 'pais_codigo_local_origem_bid_frete_internacional'
  'tipo_porto_bid_frete_internacional' = 'tipo_local_origem_bid_frete_internacional'
  'latitude_porto_bid_frete_internacional' = 'latitude_local_origem_bid_frete_internacional'
  'longitude_porto_bid_frete_internacional' = 'longitude_local_origem_bid_frete_internacional'
  'ativo_porto_bid_frete_internacional' = 'ativo_local_origem_bid_frete_internacional'
}

foreach ($dir in $dirs) {
  if (-not (Test-Path $dir)) { continue }
  Get-ChildItem -Path $dir -Recurse -Include *.ts,*.tsx,*.js -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $original = $content
    foreach ($key in $replacements.Keys) {
      $content = $content.Replace($key, $replacements[$key])
    }
    if ($content -ne $original) {
      Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
      Write-Host "Updated: $($_.FullName)"
    }
  }
}

Write-Host "Done."
