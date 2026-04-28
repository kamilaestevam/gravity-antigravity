# Arquitetura Tecnica — BID Frete Internacional

> **Versao:** 1.0
> **Data:** 31/03/2026
> **Porta:** 8023
> **Product ID:** bid-frete
> **Agente:** Tech Lead (Dream Team de Produtos)

---

## 1. PRODUCT_CONFIG

```typescript
export const PRODUCT_CONFIG = {
  id: 'bid-frete',
  productId: 'bid-frete',
  name: 'BID Frete',
  port: 8023,

  tenantServices: [
    'atividades',      // Log de acoes
    'dashboard',       // KPIs consolidados
    'relatorios',      // Relatorios exportaveis
    'historico',       // Audit trail imutavel
    'notificacoes',    // Alertas in-app
    'gabi',            // IA — analise de propostas
    'email',           // Disparo de cotacoes para fornecedores
    'whatsapp',        // Disparo de cotacoes via WhatsApp
    'agendamento',     // Cron jobs (expiracao, alertas)
    'api-cockpit',     // Tokens de API, playground, webhooks
  ],

  productServices: [
    'bid-engine',              // Disparo de cotacoes para fornecedores
    'comparativo-engine',      // Ranking de propostas e aprovacao
    'rating-engine',           // Rating cross-tenant de fornecedores
    'savings-engine',          // Calculo de economia (best vs worst)
    'connectors',              // Agentes, Armadores, Cias Aereas, ERP
  ],

  navigation: [
    { id: 'visao-geral',   label: 'Visao Geral',   icon: 'ChartPieSlice', source: 'product' },
    { id: 'cotacoes',      label: 'Cotacoes',       icon: 'FileText',      source: 'product' },
    { id: 'fornecedores',  label: 'Fornecedores',   icon: 'Buildings',     source: 'product' },
    { id: 'configuracoes', label: 'Configuracoes',  icon: 'GearSix',       source: 'product' },
    { id: 'atividades',    label: 'Atividades',     icon: 'BookOpen',      source: 'tenant' },
    { id: 'historico',     label: 'Historico',       icon: 'ClockCounterClockwise', source: 'tenant' },
  ],

  features: {
    cotacao_aberta: true,       // Cotacoes abertas (todos fornecedores ativos)
    rating_global: true,        // Rating cross-tenant de fornecedores
    monetizacao: false,         // Cobranca dos fornecedores (futuro)
    portal_publico: true,       // Resposta via token (sem login)
    importacao_bloco: true,     // Import de ate 500 cotacoes por vez
    mapa_rotas: true,           // Mapa visual de rotas (futuro)
    conectores_erp: false,      // Conector ERP (futuro)
  },
}
```

---

## 2. Estrutura de Pastas

```
produto/bid-frete/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.tsx              # KPIs comprador
│       │   ├── ListaCotacoes.tsx          # Grid de cotacoes
│       │   ├── NovaCotacao.tsx            # Criar + disparar cotacao
│       │   ├── DetalheCotacao.tsx         # Detalhe com respostas
│       │   ├── Comparativo.tsx            # Ranking de propostas
│       │   ├── Fornecedores.tsx           # Lista de fornecedores
│       │   ├── DetalheFornecedor.tsx      # Rating + tabela de precos
│       │   ├── Configuracoes.tsx          # Preferencias
│       │   └── portal/
│       │       ├── PortalDashboard.tsx    # Dashboard fornecedor
│       │       ├── CotacoesPendentes.tsx  # Cotacoes aguardando resposta
│       │       ├── ResponderCotacao.tsx   # Formulario de resposta (auth)
│       │       ├── ResponderPublico.tsx   # Formulario de resposta (token)
│       │       ├── MinhasRespostas.tsx    # Historico de respostas
│       │       └── MeuDesempenho.tsx      # Metricas e rating
│       └── shared/
│           ├── api.ts                     # Client API functions
│           ├── config.ts                  # PRODUCT_CONFIG
│           └── types.ts                   # TypeScript types + enums
├── server/
│   └── src/
│       ├── index.ts                       # Express (porta 8023, 11 middlewares)
│       ├── routes/
│       │   ├── masterData.ts              # Portos, incoterms, modais, moedas, paises, containers
│       │   ├── cotacoes.ts                # CRUD de cotacoes + importacao em bloco
│       │   ├── fornecedores.ts            # CRUD de fornecedores + tabela de precos
│       │   ├── bids.ts                    # Disparo de BIDs (direcionado + aberto)
│       │   ├── comparativo.ts             # Ranking, aprovacao, reprovacao, analise IA
│       │   ├── portal.ts                  # Portal do fornecedor (autenticado)
│       │   ├── portalPublic.ts            # Portal publico (token, sem auth)
│       │   ├── avaliacoes.ts              # Rating de fornecedores + ranking global
│       │   └── dashboard.ts               # KPIs, calendario, funil
│       ├── services/
│       │   ├── bidEngine.ts               # Motor de disparo (email + whatsapp)
│       │   ├── comparativoEngine.ts       # Ranking automatico de propostas
│       │   ├── ratingEngine.ts            # Recalculo de rating cross-tenant
│       │   ├── savingsEngine.ts           # Calculo de economia (spread)
│       │   ├── monetizacao.ts             # Billing de fornecedores (futuro)
│       │   ├── cronJobs.ts                # Expiracao automatica, alertas
│       │   └── tenantIntegrations.ts      # S2S: atividades, historico, notificacoes, gabi
│       ├── connectors/
│       │   ├── agentes.ts                 # Conector para agentes de carga
│       │   ├── armadores.ts               # Conector para armadores
│       │   ├── ciasAereas.ts              # Conector para cias aereas
│       │   └── erp.ts                     # Conector ERP (SAP, TOTVS)
│       ├── middleware/
│       │   ├── requireInternalKey.ts      # x-internal-key (S2S)
│       │   └── tenantIsolation.ts         # Filtro por tenant_id
│       └── lib/
│           └── errors.ts                  # AppError padrao
```

---

## 3. API Completa

### 3.1 Rotas Publicas (sem autenticacao)

#### Master Data (`/api/v1/master-data/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/master-data/portos?q=&tipo=&pais=&limit=` | Buscar portos/aeroportos (filtro por nome/codigo) |
| GET | `/api/v1/master-data/incoterms` | Lista de 11 incoterms (EXW a DDP) |
| GET | `/api/v1/master-data/modais` | Lista de modais com modalidades (FCL, LCL, etc.) |
| GET | `/api/v1/master-data/moedas` | Lista de moedas (USD, BRL, EUR, CNY, GBP, JPY) |
| GET | `/api/v1/master-data/paises` | Lista de 30 paises |
| GET | `/api/v1/master-data/containers` | Tipos de container (20DRY a 20TK, 10 tipos) |

#### Portal Publico (`/api/v1/bid-frete/portal/public/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/portal/public/cotacao/:token` | Ver cotacao via link publico (valida token + expiracao) |
| POST | `/portal/public/responder/:token` | Responder cotacao via link publico (sem login) |

#### Health Check

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Health check com status do banco |

### 3.2 Rotas Protegidas (x-internal-key + tenant isolation)

#### Cotacoes (`/api/v1/bid-frete/cotacoes/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/cotacoes` | Criar cotacao (manual) |
| GET | `/cotacoes?status=&modal=&tipo_operacao=&origem=&destino=&page=&limit=&order_by=&order_dir=` | Listar cotacoes com filtros e paginacao |
| GET | `/cotacoes/:id` | Detalhe da cotacao (com bid_requests e bid_responses) |
| PATCH | `/cotacoes/:id` | Atualizar cotacao (apenas RASCUNHO ou FALTA_INFORMACAO) |
| PATCH | `/cotacoes/:id/status` | Mudar status: APROVADA, REPROVADA ou CANCELADA |
| DELETE | `/cotacoes/:id` | Excluir cotacao (apenas RASCUNHO) |
| POST | `/cotacoes/bloco` | Importacao em bloco (ate 500 cotacoes por vez) |

#### Fornecedores (`/api/v1/bid-frete/fornecedores/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/fornecedores` | Cadastrar fornecedor (tipos: AGENTE_CARGA, ARMADOR, CIA_AEREA, TRANSPORTADORA) |
| GET | `/fornecedores?tipo=&status=&busca=&page=&limit=` | Listar fornecedores com filtros |
| GET | `/fornecedores/:id` | Detalhe do fornecedor (com tabelas de preco + rating global) |
| PUT | `/fornecedores/:id` | Atualizar fornecedor |
| PATCH | `/fornecedores/:id/status` | Mudar status: ATIVO, INATIVO ou BLOQUEADO |
| DELETE | `/fornecedores/:id` | Excluir fornecedor |
| POST | `/fornecedores/:id/tabela` | Adicionar rota na tabela de precos |
| GET | `/fornecedores/:id/tabela` | Listar tabela de precos do fornecedor |
| PUT | `/fornecedores/:id/tabela/:tpId` | Atualizar item da tabela de precos |
| DELETE | `/fornecedores/:id/tabela/:tpId` | Excluir item da tabela de precos |

#### BIDs — Disparo (`/api/v1/bid-frete/bids/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/bids/disparar` | Disparar BIDs para fornecedores selecionados (canais: EMAIL, WHATSAPP) |
| POST | `/bids/cotacao-aberta` | Disparar para todos fornecedores ativos que aceitam cotacao aberta |
| GET | `/bids/cotacao/:id` | Listar BidRequests de uma cotacao (com fornecedor e response) |

#### Comparativo (`/api/v1/bid-frete/comparativo/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/comparativo/:cotacaoId` | Ranking comparativo automatico de propostas |
| POST | `/comparativo/:cotacaoId/aprovar` | Aprovar cotacao (2 cliques: selecionar fornecedor vencedor) |
| POST | `/comparativo/:cotacaoId/reprovar` | Reprovar todas as respostas com justificativa |
| GET | `/comparativo/:cotacaoId/analise-ia` | Analise Gabi AI das propostas (top 3 resumo) |

#### Portal do Fornecedor — Autenticado (`/api/v1/bid-frete/portal/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/portal/dashboard` | Dashboard do fornecedor (metricas: pendentes, respondidas, aprovadas, taxa_resposta, taxa_aprovacao) |
| GET | `/portal/cotacoes-pendentes` | Cotacoes pendentes para resposta (marca como VISUALIZADO) |
| GET | `/portal/respostas?page=&limit=` | Historico de respostas do fornecedor |
| POST | `/portal/responder/:bidRequestId` | Responder cotacao (com detalhes de taxas: origem, destino, frete) |
| GET | `/portal/desempenho` | Rating + avaliacoes recentes (recalcula em tempo real) |
| GET | `/portal/meu-billing` | Resumo de cobrancas do fornecedor |

#### Avaliacoes (`/api/v1/bid-frete/avaliacoes/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/avaliacoes` | Avaliar fornecedor (notas 1-5: frete, atendimento, resposta, confiabilidade) |
| GET | `/avaliacoes/fornecedor/:id` | Rating de um fornecedor (global + avaliacoes recentes) |
| GET | `/avaliacoes/ranking?tipo=&limit=` | Ranking global de fornecedores (cross-tenant) |

#### Dashboard (`/api/v1/bid-frete/dashboard/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/dashboard` | KPIs gerais (cotacoes_andamento, cotacoes_passadas, valores, aprovacao, savings, funil) |
| GET | `/dashboard/kpis` | Alias para `/dashboard` |
| GET | `/dashboard/calendario` | Alertas: respostas recentes, proximo vencimento, vence hoje, fora do prazo |

---

## 4. Total de Endpoints

| Categoria | Quantidade |
|-----------|------------|
| Master Data (publico) | 6 |
| Portal Publico (token) | 2 |
| Health Check | 1 |
| Cotacoes (protegido) | 7 |
| Fornecedores (protegido) | 10 |
| BIDs (protegido) | 3 |
| Comparativo (protegido) | 4 |
| Portal Autenticado (protegido) | 6 |
| Avaliacoes (protegido) | 3 |
| Dashboard (protegido) | 3 |
| **TOTAL** | **45** |

---

## 5. Regras de Negocio

### 5.1 Ciclo de Vida da Cotacao

```
RASCUNHO → ENVIADA_FORNECEDORES → EM_COTACAO → AGUARDANDO_APROVACAO → APROVADA
                                                                     → REPROVADA
                                                                     → CANCELADA
                                      → FALTA_INFORMACAO (volta para edicao)
                                      → EXPIRADA (cron job automatico)
```

**Regras de transicao:**
- Edicao so permitida em status `RASCUNHO` ou `FALTA_INFORMACAO`
- Exclusao so permitida em `RASCUNHO`
- Quando todas as respostas chegam → status muda automaticamente para `AGUARDANDO_APROVACAO`
- Aprovacao requer `response_id` do fornecedor vencedor

### 5.2 Cotacao Aberta vs Direcionada

- **Direcionada:** Seleciona manualmente os fornecedores (com `fornecedor_ids`)
- **Aberta:** Dispara para todos os fornecedores ativos com `aceita_cotacao_aberta: true`
- Pode filtrar por tipo de fornecedor: AGENTE_CARGA, ARMADOR, CIA_AEREA, TRANSPORTADORA

### 5.3 Importacao em Bloco

- Ate 500 cotacoes por vez via `POST /cotacoes/bloco`
- Processamento individual (nao transacional) — cada linha pode falhar independentemente
- Retorna resultado por linha: `{ linha, id, numero, status: 'ok' | 'erro', erro? }`

### 5.4 Portal Publico (Token)

- Fornecedores recebem link com token unico via email/whatsapp
- Token tem expiracao (`token_expira_em`)
- Apos responder, token fica inutilizavel (`status: RESPONDIDO`)
- Sem necessidade de login no Gravity

### 5.5 Rating Cross-Tenant

- Rating de fornecedores e calculado globalmente (cross-tenant) por email
- Notas de 1 a 5 em 4 criterios: frete, atendimento, resposta, confiabilidade
- `ratingEngine.recalcular()` usa `basePrisma` (sem filtro de tenant) para agregar
- Ranking global visivel para todos os compradores

### 5.6 BID Engine — Motor de Disparo

- Dispara cotacoes via canais: EMAIL e/ou WHATSAPP
- Cria `BidRequest` para cada fornecedor selecionado
- Gera token unico de resposta para portal publico
- Atualiza status da cotacao para `ENVIADA_FORNECEDORES`
- Integracoes S2S: atividades, historico, notificacoes

### 5.7 Comparativo Engine

- Ranqueia automaticamente as propostas por valor_total (crescente)
- Aprovacao em 2 cliques: selecionar proposta → confirmar
- Reprovacao marca todas as respostas como `REPROVADA` com justificativa
- Analise IA via Gabi: resume top 3 propostas com recomendacao

### 5.8 Savings Engine

- Calcula economia comparando melhor proposta vs pior proposta
- Metricas: total economizado, percentual de economia, media por cotacao
- Filtros por company_id e periodo (data_inicio, data_fim)

---

## 6. Seguranca

### 6.1 Autenticacao e Autorizacao

| Camada | Implementacao |
|--------|--------------|
| S2S Authentication | `x-internal-key` validado via `requireInternalKey` middleware (timing-safe compare) |
| Tenant Isolation | `x-tenant-id` no header → Prisma Extension filtra automaticamente |
| User Identity | `x-user-id` no header (propagado pelo Gateway) |
| Rate Limiting | `rateLimitPresets.public()` para rotas publicas |
| Security Headers | Helmet com CSP strict |

### 6.2 Middlewares (ordem de execucao)

1. Helmet (CSP)
2. Body Parser (10mb limit)
3. CORS (allowlist)
4. Static Files
5. Health Check (sem auth)
6. Master Data (sem auth, rate limited)
7. Portal Publico (sem auth, rate limited)
8. **requireInternalKey** (barreira de auth)
9. **tenantIsolation** (injeta req.prisma filtrado)
10. Rotas protegidas
11. SPA Fallback
12. Error Handler Global

### 6.3 Validacao

- Toda rota usa Zod schemas antes do banco
- Schemas tipados: CriarCotacaoSchema, FiltrosCotacaoSchema, AtualizarStatusSchema, CriarFornecedorSchema, TabelaPrecoSchema, DispararSchema, ResponderSchema, AvaliarSchema, etc.
- Erros via `AppError` com codigo estruturado

---

## 7. Integracoes Externas

### 7.1 Connectors

| Conector | Arquivo | Descricao |
|----------|---------|-----------|
| Agentes de Carga | `connectors/agentes.ts` | Integracao com sistemas de agentes de carga |
| Armadores | `connectors/armadores.ts` | Integracao com armadores (Maersk, MSC, etc.) |
| Cias Aereas | `connectors/ciasAereas.ts` | Integracao com cias aereas de carga |
| ERP | `connectors/erp.ts` | Conector ERP (SAP, TOTVS) |

### 7.2 Integracoes S2S (Tenant Services)

| Servico | Funcoes |
|---------|---------|
| Atividades | `cotacaoCriada()`, `aguardandoAprovacao()` |
| Historico | `cotacaoCriada()`, `cotacaoAprovada()`, `cotacaoReprovada()`, `fornecedorRespondeu()`, `fornecedorAvaliado()`, `registrar()` (bloco) |
| Notificacoes | `cotacaoAprovada()`, `fornecedorRespondeu()` |
| Gabi | `analisarPropostas()` — analise IA das propostas do comparativo |

### 7.3 Cron Jobs

| Job | Descricao |
|-----|-----------|
| Expiracao | Marca cotacoes com `data_limite_resposta` expirada como `EXPIRADA` |
| Alertas | Envia notificacoes de cotacoes proximas ao vencimento |

---

## 8. Modelo de Dados (Resumo)

### Entidades Principais

| Entidade | Descricao |
|----------|-----------|
| `Cotacao` | Cotacao de frete (referencia, rota, modal, modalidade, incoterm, target) |
| `Fornecedor` | Fornecedor de frete (agente, armador, cia aerea, transportadora) |
| `TabelaPreco` | Tabela de precos do fornecedor (rota + valores + validade) |
| `BidRequest` | Solicitacao de proposta enviada ao fornecedor (com token publico) |
| `BidResponse` | Proposta do fornecedor (valores, transit time, taxas detalhadas) |
| `DetalheTaxa` | Breakdown de taxas da proposta (origem, destino, frete) |
| `Avaliacao` | Avaliacao individual (notas 1-5 em 4 criterios) |
| `RatingFornecedor` | Rating agregado cross-tenant (calculado por email) |

### Campos Obrigatorios (Tenant Isolation)

Toda tabela possui:
- `tenant_id String` — isolamento por tenant
- `product_id String` — sempre `'bid-frete'`
- `user_id String` — usuario que criou
- `created_at DateTime @default(now())`

---

## 9. Variaveis de Ambiente

```env
PORT=8023
DATABASE_URL=postgresql://...
INTERNAL_SERVICE_KEY=...
CLIENT_URL=http://localhost:5175
NODE_ENV=development
```

---

_Gravity — BID Frete Internacional · Arquitetura v1.0 · 31/03/2026_
