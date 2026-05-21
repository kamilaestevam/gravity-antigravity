# Atlas DDD — BID Frete Internacional — Aba 3: Models Prisma

> Mapeamento DDD dos 11 models do fragment.prisma.
> Regras aplicadas: REGRA 10 (PascalCase + @@map), REGRA 03 (audit), REGRA 04 (FK prefixo).

## Como ler

- **Nome atual (legado)**: nome do model como esta hoje no fragment.prisma.
- **Nome DDD (PascalCase)**: nome final apos refatoracao DDD.
- **@@map DDD**: valor do `@@map("...")` — nome da tabela PG em snake_case.
- **@@map atual (legado)**: valor atual do `@@map` no fragment.prisma.
- **Tem id_organizacao?**: se possui campo de isolamento de tenant.
- **PK**: chave primaria.
- **Soft delete / Auditoria**: marcadores de governanca.
- **Arquivo fragment**: caminho do fragment.prisma.
- **Descricao**: o que o model representa.

## Tabela (11 models)

| Nome atual (legado) | Nome DDD (PascalCase) | @@map DDD | @@map atual (legado) | Tem id_organizacao? | PK | Soft delete | Auditoria | Arquivo fragment | Descricao |
|---|---|---|---|---|---|---|---|---|---|
| FreteIntBidFornecedores | BidFreteInternacionalFornecedor | `bid_frete_internacional_fornecedores` | `bid_fornecedores` | Sim | id (CUID) | Nao | created_at + updated_at | produto/bid-frete/prisma/fragment.prisma | Fornecedor cadastrado para receber cotacoes de frete |
| FreteIntBidCotacoes | BidFreteInternacionalCotacao | `bid_frete_internacional_cotacoes` | `bid_cotacoes` | Sim | id (CUID) | Nao | created_at + updated_at | produto/bid-frete/prisma/fragment.prisma | Cotacao de frete internacional aberta pelo usuario |
| FreteIntBidPedidoCotacoes | BidFreteInternacionalPedidoCotacao | `bid_frete_internacional_pedidos_cotacao` | `bid_requests` | Sim | id (CUID) | Nao | created_at + updated_at | produto/bid-frete/prisma/fragment.prisma | Disparo de cotacao para um fornecedor especifico (bid request) |
| FreteIntBidPropostas | BidFreteInternacionalProposta | `bid_frete_internacional_propostas` | `bid_responses` | Sim | id (CUID) | Nao | created_at + updated_at | produto/bid-frete/prisma/fragment.prisma | Resposta/proposta do fornecedor a uma cotacao (bid response) |
| FreteIntBidPropostasTaxasCambio | BidFreteInternacionalTaxa | `bid_frete_internacional_taxas` | `bid_detalhe_taxas` | Sim | id (CUID) | Nao | Nao | produto/bid-frete/prisma/fragment.prisma | Breakdown de taxas de uma proposta (THC, BL Fee, ISPS, Bunker, etc.) |
| FreteIntBidTabelasProntas | BidFreteInternacionalTabelaValor | `bid_frete_internacional_tabelas_valor` | `bid_tabelas_preco` | Sim | id (CUID) | Nao | created_at + updated_at | produto/bid-frete/prisma/fragment.prisma | Tabela padrao de valores do fornecedor (resposta automatica) |
| FreteIntBidFornecedoresAvaliacoes | BidFreteInternacionalAvaliacao | `bid_frete_internacional_avaliacoes` | `bid_avaliacoes` | Sim | id (CUID) | Nao | created_at + updated_at | produto/bid-frete/prisma/fragment.prisma | Avaliacao manual (1-5 estrelas) de um fornecedor por cotacao |
| FreteIntBidClassificacaoFornecedores | BidFreteInternacionalClassificacao | `bid_frete_internacional_classificacoes` | `bid_rating_fornecedor_global` | Nao (global cross-tenant) | id (CUID) | Nao | updated_at | produto/bid-frete/prisma/fragment.prisma | Rating automatico agregado cross-tenant por email do fornecedor |
| FreteIntBidGanhoEstimado | BidFreteInternacionalGanho | `bid_frete_internacional_ganhos` | `bid_savings` | Sim | id (CUID) | Nao | created_at | produto/bid-frete/prisma/fragment.prisma | Registro de economia (saving) por cotacao aprovada |
| FreteIntBidIntegracoes | BidFreteInternacionalIntegracao | `bid_frete_internacional_integracoes` | `bid_connector_configs` | Sim | id (CUID) | Nao | created_at + updated_at | produto/bid-frete/prisma/fragment.prisma | Configuracao de conector externo (API armador, ERP, SAP OData) |
| FreteIntBidPortosCadastro | BidFreteInternacionalPorto | `bid_frete_internacional_portos` | `bid_portos` | Nao (cache global) | codigo (UN/LOCODE) | Nao | Nao | produto/bid-frete/prisma/fragment.prisma | Cache de portos, aeroportos e pontos rodoviarios |
