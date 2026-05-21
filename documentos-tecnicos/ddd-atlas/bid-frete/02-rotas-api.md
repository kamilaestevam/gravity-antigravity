# Atlas DDD — BID Frete Internacional — Aba 2: Rotas API (backend)

> Mapeamento DDD das 26 rotas do backend Express.
> Regras aplicadas: REGRA 02 (PT-BR sem acento), REGRA 13 (kebab-case), skill api-design.
> Produto renomeado: `bid-frete` → `bid-frete-internacional`.

## Como ler

- **#**: numero sequencial da rota.
- **Metodo**: verbo HTTP.
- **Rota atual (legado)**: rota como esta hoje no codigo.
- **Rota DDD**: rota final apos refatoracao DDD.
- **Grupo**: agrupamento funcional (Dashboard, Cotacoes, etc.).
- **Arquivo backend**: arquivo `.ts` em `server/src/routes/` que implementa a rota.
- **Descricao**: o que a rota faz.

Convencoes de rota DDD:
- Prefixo: `/api/v1/bid-frete-internacional/`
- Recursos em kebab-case plural PT-BR
- IDs com nome DDD: `:id_cotacao`, `:id_fornecedor`, `:id_pedido_cotacao`
- Sem sufixos em ingles (no `/create`, `/update`, `/delete`)

---

## Tabela de Rotas (26 rotas)

| # | Metodo | Rota atual (legado) | Rota DDD | Grupo | Arquivo backend | Descricao |
|---|--------|---------------------|----------|-------|-----------------|-----------|
| 1 | GET | `/api/v1/bid-frete/dashboard/kpis` | `/api/v1/bid-frete-internacional/dashboard/kpis` | Dashboard | `dashboard.ts` | KPIs do dashboard (cotacoes, savings, funil) |
| 2 | GET | `/api/v1/bid-frete/dashboard/calendario` | `/api/v1/bid-frete-internacional/dashboard/calendario` | Dashboard | `dashboard.ts` | Alertas do calendario (vencimentos, prazos) |
| 3 | GET | `/api/v1/bid-frete/cotacoes` | `/api/v1/bid-frete-internacional/cotacoes` | Cotacoes | `cotacoes.ts` | Lista cotacoes com paginacao e filtros |
| 4 | GET | `/api/v1/bid-frete/cotacoes/:id` | `/api/v1/bid-frete-internacional/cotacoes/:id_cotacao` | Cotacoes | `cotacoes.ts` | Detalhe de uma cotacao |
| 5 | POST | `/api/v1/bid-frete/cotacoes` | `/api/v1/bid-frete-internacional/cotacoes` | Cotacoes | `cotacoes.ts` | Criar nova cotacao |
| 6 | PATCH | `/api/v1/bid-frete/cotacoes/:id` | `/api/v1/bid-frete-internacional/cotacoes/:id_cotacao` | Cotacoes | `cotacoes.ts` | Atualizar cotacao existente |
| 7 | PATCH | `/api/v1/bid-frete/cotacoes/:id/status` | `/api/v1/bid-frete-internacional/cotacoes/:id_cotacao/status` | Cotacoes | `cotacoes.ts` | Mudar status da cotacao |
| 8 | DELETE | `/api/v1/bid-frete/cotacoes/:id` | `/api/v1/bid-frete-internacional/cotacoes/:id_cotacao` | Cotacoes | `cotacoes.ts` | Excluir cotacao |
| 9 | POST | `/api/v1/bid-frete/bids/disparar` | `/api/v1/bid-frete-internacional/pedidos-cotacao/disparar` | Pedidos de Cotacao | `bids.ts` | Disparar pedidos de cotacao para fornecedores |
| 10 | GET | `/api/v1/bid-frete/bids/cotacao/:cotacaoId` | `/api/v1/bid-frete-internacional/pedidos-cotacao/cotacao/:id_cotacao` | Pedidos de Cotacao | `bids.ts` | Listar pedidos de cotacao de uma cotacao |
| 11 | GET | `/api/v1/bid-frete/comparativo/:cotacaoId/ranking` | `/api/v1/bid-frete-internacional/comparativo/:id_cotacao/classificacao` | Comparativo | `comparativo.ts` | Classificacao de propostas por cotacao |
| 12 | POST | `/api/v1/bid-frete/comparativo/:cotacaoId/aprovar` | `/api/v1/bid-frete-internacional/comparativo/:id_cotacao/aprovar` | Comparativo | `comparativo.ts` | Aprovar proposta vencedora |
| 13 | POST | `/api/v1/bid-frete/comparativo/:cotacaoId/reprovar` | `/api/v1/bid-frete-internacional/comparativo/:id_cotacao/reprovar` | Comparativo | `comparativo.ts` | Reprovar todas as propostas |
| 14 | GET | `/api/v1/bid-frete/fornecedores` | `/api/v1/bid-frete-internacional/fornecedores` | Fornecedores | `fornecedores.ts` | Lista fornecedores com paginacao e filtros |
| 15 | GET | `/api/v1/bid-frete/fornecedores/:id` | `/api/v1/bid-frete-internacional/fornecedores/:id_fornecedor` | Fornecedores | `fornecedores.ts` | Detalhe de um fornecedor |
| 16 | GET | `/api/v1/bid-frete/fornecedores/:id/tabela` | `/api/v1/bid-frete-internacional/fornecedores/:id_fornecedor/tabelas-valor` | Fornecedores | `fornecedores.ts` | Tabelas de valor de um fornecedor |
| 17 | GET | `/api/v1/bid-frete/avaliacoes/fornecedor/:id` | `/api/v1/bid-frete-internacional/avaliacoes/fornecedor/:id_fornecedor` | Fornecedores | `avaliacoes.ts` | Avaliacoes de um fornecedor |
| 18 | GET | `/api/v1/bid-frete/portal/dashboard` | `/api/v1/bid-frete-internacional/portal/dashboard` | Portal Fornecedor | `portal.ts` | Dashboard do portal do fornecedor |
| 19 | GET | `/api/v1/bid-frete/portal/pendentes` | `/api/v1/bid-frete-internacional/portal/pendentes` | Portal Fornecedor | `portal.ts` | Pedidos de cotacao pendentes |
| 20 | POST | `/api/v1/bid-frete/portal/responder/:bidRequestId` | `/api/v1/bid-frete-internacional/portal/responder/:id_pedido_cotacao` | Portal Fornecedor | `portal.ts` | Responder a um pedido de cotacao |
| 21 | GET | `/api/v1/bid-frete/portal/respostas` | `/api/v1/bid-frete-internacional/portal/propostas` | Portal Fornecedor | `portal.ts` | Propostas enviadas pelo fornecedor |
| 22 | GET | `/api/v1/bid-frete/portal/desempenho` | `/api/v1/bid-frete-internacional/portal/desempenho` | Portal Fornecedor | `portal.ts` | Metricas de desempenho do fornecedor |
| 23 | GET | `/api/v1/bid-frete/portal/public/:token` | `/api/v1/bid-frete-internacional/portal/publico/:token` | Portal Publico | `cotacoes-publicas.ts` | Cotacao publica (sem login) |
| 24 | POST | `/api/v1/bid-frete/portal/public/:token/responder` | `/api/v1/bid-frete-internacional/portal/publico/:token/responder` | Portal Publico | `cotacoes-publicas.ts` | Responder via link publico (sem login) |
| 25 | GET | `/api/v1/bid-frete/master-data/portos` | `/api/v1/bid-frete-internacional/dados-mestre/portos` | Dados Mestre | `portos.ts` | Lista de portos/aeroportos |
| 26 | GET | `/api/v1/bid-frete/master-data/moedas` | `/api/v1/bid-frete-internacional/dados-mestre/moedas` | Dados Mestre | `moedas.ts` | Lista de moedas disponiveis |

---

## Mudancas DDD aplicadas nas rotas

### Prefixo do produto

| Legado | DDD |
|--------|-----|
| `bid-frete` | `bid-frete-internacional` |

### Recursos renomeados

| Segmento legado | Segmento DDD | Motivo |
|-----------------|-------------|--------|
| `bids` | `pedidos-cotacao` | DDD — model BidFreteInternacionalPedidoCotacao |
| `ranking` | `classificacao` | PT-BR sem anglicismo — model BidFreteInternacionalClassificacao |
| `respostas` | `propostas` | DDD — model BidFreteInternacionalProposta |
| `public` | `publico` | PT-BR sem acento (REGRA 02) |
| `master-data` | `dados-mestre` | PT-BR |
| `tabela` | `tabelas-valor` | DDD — model BidFreteInternacionalTabelaValor (plural) |

### Parametros de rota renomeados

| Parametro legado | Parametro DDD | Motivo |
|------------------|---------------|--------|
| `:id` (em cotacoes) | `:id_cotacao` | REGRA 01 — sufixo de entidade |
| `:id` (em fornecedores) | `:id_fornecedor` | REGRA 01 — sufixo de entidade |
| `:cotacaoId` | `:id_cotacao` | REGRA 04 — FK com prefixo `id_` |
| `:fornecedorId` | `:id_fornecedor` | REGRA 04 — FK com prefixo `id_` |
| `:bidRequestId` | `:id_pedido_cotacao` | DDD — FK para BidFreteInternacionalPedidoCotacao |

---

## Arquivos de rota backend que precisam ser renomeados

Localizacao: `servicos-global/produto/bid-frete/server/src/routes/`

| Arquivo atual | Acao | Motivo |
|---------------|------|--------|
| `bids.ts` | Renomear para `pedidos-cotacao.ts` | DDD — recurso `pedidos-cotacao` |
| `cotacoes-publicas.ts` | Manter | Nome ja esta em PT-BR |
| `cotacoes.ts` | Manter | Nome ja esta em PT-BR |
| `comparativo.ts` | Manter | Nome ja esta em PT-BR |
| `dashboard.ts` | Manter | Nome universal aceito |
| `fornecedores.ts` | Manter | Nome ja esta em PT-BR |
| `avaliacoes.ts` | Manter | Nome ja esta em PT-BR |
| `portal.ts` | Manter | Nome ja esta em PT-BR |
| `portos.ts` | Manter | Nome ja esta em PT-BR |
| `moedas.ts` | Manter | Nome ja esta em PT-BR |
| `containers.ts` | Avaliar renomear para `conteineres.ts` | PT-BR — ou manter se for termo tecnico universal |
| `incoterms.ts` | Manter | Termo tecnico universal (Incoterms ICC) |
| `modais.ts` | Manter | Nome ja esta em PT-BR |
| `dashboard.routes.ts` | Remover ou unificar com `dashboard.ts` | Duplicidade — verificar qual esta em uso |

---

## Mudancas de payload (request/response)

> Referencia completa de campos: `01-campos.md`

### POST `/api/v1/bid-frete-internacional/pedidos-cotacao/disparar` (rota #9)

**Request body:**

| Campo legado | Campo DDD | Tipo |
|-------------|-----------|------|
| `cotacao_id` | `id_cotacao_bid_frete_internacional` | String |
| `fornecedor_ids` | `ids_fornecedor_bid_frete_internacional` | String[] |
| `canais` | `canais_pedido_cotacao_bid_frete_internacional` | String[] (enum BidFreteInternacionalCanalDisparo) |

### POST `/api/v1/bid-frete-internacional/comparativo/:id_cotacao/aprovar` (rota #12)

**Request body:**

| Campo legado | Campo DDD | Tipo |
|-------------|-----------|------|
| `response_id` | `id_proposta_bid_frete_internacional` | String |

### POST `/api/v1/bid-frete-internacional/comparativo/:id_cotacao/reprovar` (rota #13)

**Request body:**

| Campo legado | Campo DDD | Tipo |
|-------------|-----------|------|
| `motivo` | `motivo_reprovacao_cotacao_bid_frete_internacional` | String |

### PATCH `/api/v1/bid-frete-internacional/cotacoes/:id_cotacao/status` (rota #7)

**Request body:**

| Campo legado | Campo DDD | Tipo |
|-------------|-----------|------|
| `status` | `status_cotacao_bid_frete_internacional` | Enum BidFreteInternacionalStatusCotacao |

### POST `/api/v1/bid-frete-internacional/portal/responder/:id_pedido_cotacao` (rota #20)

**Request body — campos principais da proposta (ver 01-campos.md, model BidFreteInternacionalProposta):**

| Campo legado | Campo DDD | Tipo |
|-------------|-----------|------|
| `moeda` | `moeda_proposta_bid_frete_internacional` | String |
| `valor_frete` | `valor_frete_proposta_bid_frete_internacional` | Float |
| `taxas_origem` | `taxas_origem_proposta_bid_frete_internacional` | Float |
| `taxas_destino` | `taxas_destino_proposta_bid_frete_internacional` | Float |
| `valor_total` | `valor_total_proposta_bid_frete_internacional` | Float |
| `transit_time_dias` | `transit_time_dias_proposta_bid_frete_internacional` | Int |
| `free_time_dias` | `free_time_dias_proposta_bid_frete_internacional` | Int |
| `validade_cotacao` | `validade_proposta_bid_frete_internacional` | DateTime |
| `transbordos` | `transbordos_proposta_bid_frete_internacional` | Int |
| `escalas` | `escalas_proposta_bid_frete_internacional` | String |
| `observacoes` | `observacoes_proposta_bid_frete_internacional` | String |

### POST `/api/v1/bid-frete-internacional/portal/publico/:token/responder` (rota #24)

Mesmo payload da rota #20 (portal/responder), porem sem autenticacao.

### GET (query params) — rotas de listagem (#3, #14)

| Query param legado | Query param DDD | Aplica-se a |
|-------------------|-----------------|-------------|
| `status` | `status` | Cotacoes (#3), Fornecedores (#14) — manter curto em query string |
| `page` | `pagina` | Todas as listagens |
| `limit` | `limite` | Todas as listagens |
| `busca` | `busca` | Todas as listagens |
| `tipo` | `tipo` | Fornecedores (#14), Portos (#25) |

---

## Resumo por grupo

| Grupo | Qtd rotas | Autenticacao |
|-------|-----------|-------------|
| Dashboard | 2 | JWT (usuario logado) |
| Cotacoes | 6 | JWT (usuario logado) |
| Pedidos de Cotacao | 2 | JWT (usuario logado) |
| Comparativo | 3 | JWT (usuario logado) |
| Fornecedores | 4 | JWT (usuario logado) |
| Portal Fornecedor | 5 | JWT (fornecedor logado) |
| Portal Publico | 2 | Nenhuma (token na URL) |
| Dados Mestre | 2 | Nenhuma (dados publicos) |
| **Total** | **26** | |
