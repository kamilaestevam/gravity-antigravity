# Atlas DDD — BID Cambio — Aba 2: Rotas API (backend)

> Mapeamento das rotas do backend Express.
> Fonte: `servicos-global/produto/bid-cambio/server/src/`
> Porta: 8025

## Como ler

- **#**: numero sequencial da rota.
- **Metodo**: verbo HTTP.
- **Rota atual**: rota como esta hoje no codigo.
- **Grupo**: agrupamento funcional (Dashboard, Cotacoes, Cambios, etc.).
- **Arquivo backend**: arquivo `.ts` em `server/src/routes/` que implementa a rota.
- **Descricao**: o que a rota faz.

Convencoes de rota:
- Prefixo protegido: `/api/v1/bid-cambio/`
- Prefixo publico (master data): `/api/v1/`
- Prefixo portal publico: `/api/v1/bid-cambio/portal/public/`
- Recursos em kebab-case plural PT-BR
- IDs com nome DDD: `:id` referencia PK da entidade do contexto

---

## Rotas Publicas (sem autenticacao)

### Master Data (4 rotas)

| # | Metodo | Rota atual | Grupo | Arquivo backend | Descricao |
|---|--------|-----------|-------|-----------------|-----------|
| 1 | GET | `/api/v1/moedas` | Dados Mestre | `moedas.ts` | Catalogo de moedas suportadas (codigo, nome, simbolo, codigo BCB) |
| 2 | GET | `/api/v1/tipos-liquidacao` | Dados Mestre | `tipos-liquidacao.ts` | Catalogo de tipos de liquidacao (D0, D1, D2) |
| 3 | GET | `/api/v1/metodos-vencimento` | Dados Mestre | `metodos-vencimento.ts` | Catalogo de metodos de calculo de vencimento |
| 4 | GET | `/api/v1/cotacoes-ptax?moeda=USD` | Dados Mestre | `cotacoes-ptax.ts` | PTAX do dia (BCB OLINDA API, cache 5min) |
| 5 | GET | `/api/v1/cotacoes-ptax/historico?moeda=USD&dias=30` | Dados Mestre | `cotacoes-ptax.ts` | Historico de PTAX com fallback retroativo |

### Portal Publico (2 rotas — token-based, sem auth)

| # | Metodo | Rota atual | Grupo | Arquivo backend | Descricao |
|---|--------|-----------|-------|-----------------|-----------|
| 6 | GET | `/api/v1/bid-cambio/portal/public/cotacao/:token` | Portal Publico | `portalPublic.ts` | Visualizar cotacao via link publico (sem login) |
| 7 | POST | `/api/v1/bid-cambio/portal/public/responder/:token` | Portal Publico | `portalPublic.ts` | Responder cotacao via link publico (sem login) |

---

## Rotas Protegidas (requireInternalKey + tenantIsolation)

### Health Check (1 rota — sem auth)

| # | Metodo | Rota atual | Grupo | Arquivo backend | Descricao |
|---|--------|-----------|-------|-----------------|-----------|
| 8 | GET | `/health` | Infra | `index.ts` | Health check com verificacao de conexao ao banco |

### Pilar 1 — Gestao de Cambio (8 rotas)

| # | Metodo | Rota atual | Grupo | Arquivo backend | Descricao |
|---|--------|-----------|-------|-----------------|-----------|
| 9 | GET | `/api/v1/bid-cambio/cambios` | Cambios | `cambios.ts` | Lista parcelas com paginacao e filtros (status, moeda, datas) |
| 10 | GET | `/api/v1/bid-cambio/cambios/totais` | Cambios | `cambios.ts` | Totais agrupados por moeda (valor a pagar, contagem) |
| 11 | GET | `/api/v1/bid-cambio/cambios/:id` | Cambios | `cambios.ts` | Detalhe de uma parcela (com anexos) |
| 12 | POST | `/api/v1/bid-cambio/cambios/agendar` | Cambios | `cambios.ts` | Agendar pagamento de parcelas (em lote) |
| 13 | POST | `/api/v1/bid-cambio/cambios/pagar` | Cambios | `cambios.ts` | Registrar pagamento de parcela (com taxa, banco, anexos) |
| 14 | POST | `/api/v1/bid-cambio/cambios/retornar-pendente` | Cambios | `cambios.ts` | Retornar parcela agendada para status pendente |
| 15 | POST | `/api/v1/bid-cambio/cambios/exportar` | Cambios | `cambios.ts` | Exportar parcelas em CSV ou XLSX |
| 16 | GET | `/api/v1/bid-cambio/preferencias` | Preferencias | `preferencias.ts` | Obter preferencias do tenant (ou defaults) |
| 17 | PUT | `/api/v1/bid-cambio/preferencias` | Preferencias | `preferencias.ts` | Atualizar preferencias do tenant (upsert) |
| 18 | GET | `/api/v1/bid-cambio/preferencias/grid` | Preferencias | `preferencias.ts` | Obter preferencias de grid do usuario |
| 19 | PUT | `/api/v1/bid-cambio/preferencias/grid` | Preferencias | `preferencias.ts` | Atualizar preferencias de grid do usuario (upsert) |

### Pilar 2 — Marketplace (22 rotas)

| # | Metodo | Rota atual | Grupo | Arquivo backend | Descricao |
|---|--------|-----------|-------|-----------------|-----------|
| 20 | POST | `/api/v1/bid-cambio/cotacoes` | Cotacoes | `cotacoes.ts` | Criar nova cotacao de cambio |
| 21 | GET | `/api/v1/bid-cambio/cotacoes` | Cotacoes | `cotacoes.ts` | Lista cotacoes com paginacao e filtro por status |
| 22 | GET | `/api/v1/bid-cambio/cotacoes/:id` | Cotacoes | `cotacoes.ts` | Detalhe de uma cotacao (com disparos e respostas) |
| 23 | PATCH | `/api/v1/bid-cambio/cotacoes/:id` | Cotacoes | `cotacoes.ts` | Atualizar cotacao (somente em RASCUNHO) |
| 24 | DELETE | `/api/v1/bid-cambio/cotacoes/:id` | Cotacoes | `cotacoes.ts` | Excluir cotacao (somente em RASCUNHO) |
| 25 | POST | `/api/v1/bid-cambio/bids/disparar` | Disparos | `bids.ts` | Disparar cotacao para corretoras selecionadas (gera token + email) |
| 26 | POST | `/api/v1/bid-cambio/bids/cotacao-aberta` | Disparos | `bids.ts` | Disparar cotacao aberta para TODAS as corretoras ativas |
| 27 | GET | `/api/v1/bid-cambio/bids/cotacao/:id` | Disparos | `bids.ts` | Listar disparos de uma cotacao (com status e corretora) |
| 28 | GET | `/api/v1/bid-cambio/comparativo/:cotacaoId` | Comparativo | `comparativo.ts` | Ranking de respostas por cotacao (com tags: MELHOR_TAXA, MELHOR_SPREAD, MELHOR_AVALIACAO) |
| 29 | POST | `/api/v1/bid-cambio/comparativo/:cotacaoId/aprovar` | Comparativo | `comparativo.ts` | Aprovar resposta vencedora (calcula economia, atualiza status) |
| 30 | POST | `/api/v1/bid-cambio/comparativo/:cotacaoId/reprovar` | Comparativo | `comparativo.ts` | Reprovar todas as respostas de uma cotacao |
| 31 | POST | `/api/v1/bid-cambio/corretoras` | Corretoras | `corretoras.ts` | Cadastrar nova corretora (com validacao CNPJ duplicado) |
| 32 | GET | `/api/v1/bid-cambio/corretoras` | Corretoras | `corretoras.ts` | Lista corretoras com paginacao, filtro por status e busca |
| 33 | GET | `/api/v1/bid-cambio/corretoras/:id` | Corretoras | `corretoras.ts` | Detalhe de uma corretora |
| 34 | PUT | `/api/v1/bid-cambio/corretoras/:id` | Corretoras | `corretoras.ts` | Atualizar corretora (com validacao CNPJ duplicado) |
| 35 | PATCH | `/api/v1/bid-cambio/corretoras/:id/status` | Corretoras | `corretoras.ts` | Alterar status da corretora (ATIVA/INATIVA/BLOQUEADA) |
| 36 | POST | `/api/v1/bid-cambio/avaliacoes` | Avaliacoes | `avaliacoes.ts` | Criar avaliacao de corretora (4 criterios, 1-5) |
| 37 | GET | `/api/v1/bid-cambio/avaliacoes/corretora/:id` | Avaliacoes | `avaliacoes.ts` | Avaliacoes de uma corretora (medias + lista paginada) |
| 38 | GET | `/api/v1/bid-cambio/avaliacoes/ranking` | Avaliacoes | `avaliacoes.ts` | Ranking geral de corretoras ativas |
| 39 | GET | `/api/v1/bid-cambio/portal/dashboard` | Portal Corretora | `portal.ts` | Dashboard da corretora (metricas, taxa aprovacao) |
| 40 | GET | `/api/v1/bid-cambio/portal/cotacoes-pendentes` | Portal Corretora | `portal.ts` | Cotacoes pendentes de resposta da corretora |
| 41 | GET | `/api/v1/bid-cambio/portal/minhas-respostas` | Portal Corretora | `portal.ts` | Respostas enviadas pela corretora (com status) |
| 42 | POST | `/api/v1/bid-cambio/portal/responder/:bidRequestId` | Portal Corretora | `portal.ts` | Responder cotacao via portal autenticado (calcula IOF, valor BRL) |
| 43 | GET | `/api/v1/bid-cambio/portal/meu-desempenho` | Portal Corretora | `portal.ts` | Metricas de desempenho da corretora (aprovacoes, medias) |

### Pilar 3 — Analytics / Dashboard (3 rotas)

| # | Metodo | Rota atual | Grupo | Arquivo backend | Descricao |
|---|--------|-----------|-------|-----------------|-----------|
| 44 | GET | `/api/v1/bid-cambio/dashboard` | Dashboard | `dashboard.ts` | KPIs agregados (parcelas, financeiro, marketplace) |
| 45 | GET | `/api/v1/bid-cambio/dashboard/vencimentos` | Dashboard | `dashboard.ts` | Vencimentos proximos e vencidos (com agrupamento por moeda) |
| 46 | POST | `/api/v1/bid-cambio/dashboard/widgets` | Dashboard | `dashboard.routes.ts` | Endpoint de widgets (saving_total, valor_operado, cotacoes_status, taxa_resposta, economia_percentual, volume_mensal) |

---

## Resumo por Arquivo de Rota

| Arquivo | Total rotas | Grupo funcional |
|---------|-------------|-----------------|
| `moedas.ts` | 1 | Dados Mestre (publico) |
| `tipos-liquidacao.ts` | 1 | Dados Mestre (publico) |
| `metodos-vencimento.ts` | 1 | Dados Mestre (publico) |
| `cotacoes-ptax.ts` | 2 | Dados Mestre (publico) |
| `portalPublic.ts` | 2 | Portal Publico (token-based) |
| `cambios.ts` | 7 | Pilar 1 — Gestao de Cambio |
| `preferencias.ts` | 4 | Pilar 1 — Preferencias |
| `cotacoes.ts` | 5 | Pilar 2 — Cotacoes |
| `bids.ts` | 3 | Pilar 2 — Disparos |
| `comparativo.ts` | 3 | Pilar 2 — Comparativo |
| `corretoras.ts` | 5 | Pilar 2 — Corretoras |
| `avaliacoes.ts` | 3 | Pilar 2 — Avaliacoes |
| `portal.ts` | 5 | Pilar 2 — Portal Corretora |
| `dashboard.ts` | 2 | Pilar 3 — Dashboard |
| `dashboard.routes.ts` | 1 | Pilar 3 — Widgets |
| **Total** | **46** | |

---

## Middleware Stack (ordem de execucao)

1. `helmet` — Security headers
2. `express.json` — Body parser (10mb limit)
3. CORS — Origens: `localhost:5176` (client comprador), `localhost:5177` (client corretora), `localhost:8003` (configurador)
4. Static files — Client build em `client/dist/`
5. Health check — `/health` (sem auth)
6. Master Data — 4 routers publicos (sem auth)
7. Portal Publico — Token-based (sem internal key)
8. `requireInternalKey` — Protege todas as rotas abaixo
9. `tenantIsolationMiddleware` — Injeta `req.prisma` com filtro por tenant
10. `apiObservability` — Metricas para API Cockpit
11. `createProductAuditPlugin` — Audit trail
12. Rotas do produto (protegidas)
13. SPA Fallback — Serve `index.html` para rotas nao-API
14. Error Handler Global — Formata erros com correlation ID
