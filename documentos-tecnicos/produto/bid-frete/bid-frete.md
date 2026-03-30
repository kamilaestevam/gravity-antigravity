# BID Frete — Documentacao Tecnica

> Plataforma de cotacao de fretes internacionais que conecta importadores/exportadores a fornecedores logisticos.

**Produto:** BID Frete
**Porta:** 8023
**Diretorio:** `produto/bid-frete/`
**Stack:** React 18 + Vite (client) | Express + Prisma + Zod (server)
**Onda:** 3

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Arquitetura](#arquitetura)
3. [Modelos de Dados](#modelos-de-dados)
4. [Endpoints da API](#endpoints-da-api)
5. [Fluxos de Negocio](#fluxos-de-negocio)
6. [Engines e Servicos](#engines-e-servicos)
7. [Integracoes](#integracoes)
8. [Portal do Fornecedor](#portal-do-fornecedor)
9. [Monetizacao](#monetizacao)
10. [Configuracao e Deploy](#configuracao-e-deploy)
11. [Testes](#testes)

---

## 1. Visao Geral

BID Frete permite que empresas criem solicitacoes de cotacao de frete (RFQs), disparem BIDs para fornecedores via email/WhatsApp/portal, recebam respostas, comparem propostas em ranking automatico e aprovem o vencedor com calculo automatico de savings.

### Funcionalidades principais

- **Wizard de 7 etapas** para criacao de cotacoes
- **Disparo multicanal** (email, WhatsApp, API, portal)
- **Resposta publica** via token (sem login)
- **Auto-response** via tabela de precos do fornecedor
- **Comparativo** com ranking por preco, transit time e rating
- **Aprovacao 2-click** com calculo de savings
- **Portal do fornecedor** (dashboard, respostas, desempenho)
- **Rating cross-tenant** (40% automatico + 60% manual)
- **Monetizacao** (free tier 10 cotacoes + USD 5.00/cotacao)
- **Importacao em bloco** (CSV/Excel)

---

## 2. Arquitetura

```
produto/bid-frete/
├── client/
│   └── src/
│       ├── pages/           # 16 paginas (9 buyer + 7 portal)
│       ├── shared/          # types.ts, api.ts, config.ts
│       ├── App.tsx          # Rotas React Router
│       └── main.tsx         # Entry point Vite
├── server/
│   └── src/
│       ├── routes/          # 9 modulos de rotas
│       ├── services/        # 7 engines de negocio
│       ├── connectors/      # 4 conectores externos
│       ├── middleware/       # requireInternalKey, tenantIsolation
│       ├── lib/             # errors.ts, prisma.ts
│       └── index.ts         # Express (porta 8023)
└── prisma/
    ├── fragment.prisma      # Modelos do produto
    ├── schema.base.prisma   # Config base
    └── seed-*.ts            # Seeds de dados
```

### Stack de middleware (ordem no Express)

1. Body parser (10MB limit)
2. CORS (localhost:5175, localhost:8003, CLIENT_URL)
3. Static files (client build)
4. Health check (`GET /health`)
5. Master data routes (publico)
6. Portal public routes (publico via token)
7. `requireInternalKey` — validacao x-internal-key
8. `tenantIsolation` — injeta tenant context no req
9. Rotas protegidas (cotacoes, fornecedores, bids, comparativo, portal, avaliacoes, dashboard)
10. SPA fallback
11. Global error handler

---

## 3. Modelos de Dados

### Tabelas principais

| Model | Tabela | Descricao |
|:---|:---|:---|
| Cotacao | `bid_cotacoes` | Solicitacao de cotacao de frete |
| Fornecedor | `bid_fornecedores` | Cadastro de fornecedores logisticos |
| BidRequest | `bid_requests` | Registro de disparo para cada fornecedor |
| BidResponse | `bid_responses` | Resposta do fornecedor a uma cotacao |
| TabelaPreco | `bid_tabelas_preco` | Tabela de precos padrao do fornecedor |
| DetalheTaxa | `bid_detalhe_taxas` | Breakdown de taxas por tipo |
| Avaliacao | `bid_avaliacoes` | Avaliacao manual (1-5) por criterio |
| RatingFornecedor | `bid_rating_fornecedor_global` | Rating consolidado cross-tenant |
| Saving | `bid_savings` | Calculo de economia por cotacao |
| ConnectorConfig | `bid_connector_configs` | Config de conectores ERP/API |
| Porto | `bid_portos` | Cache de portos/aeroportos (UN/LOCODE) |

### Enums

| Enum | Valores |
|:---|:---|
| TipoOperacao | IMPORTACAO, EXPORTACAO |
| ModalFrete | MARITIMO, AEREO, RODOVIARIO |
| ModalidadeCarga | FCL, LCL, AEREO_GERAL, RODOVIARIO_FTL, RODOVIARIO_LTL |
| StatusCotacao | RASCUNHO, ENVIADA_FORNECEDORES, EM_COTACAO, AGUARDANDO_APROVACAO, APROVADA, REPROVADA, CANCELADA, FALTA_INFORMACAO, EXPIRADA |
| TipoFornecedor | AGENTE_CARGA, ARMADOR, CIA_AEREA, TRANSPORTADORA |
| CanalDisparo | EMAIL, WHATSAPP, API, PORTAL |

### Multi-tenant

- Todo model tem `tenant_id String` obrigatorio
- Indices: `@@index([tenant_id])`, `@@index([tenant_id, product_id])`, `@@index([tenant_id, user_id])`
- `RatingFornecedor` e a unica tabela cross-tenant (chave: email do fornecedor)

---

## 4. Endpoints da API

### Rotas publicas (sem autenticacao)

| Metodo | Rota | Descricao |
|:---|:---|:---|
| GET | `/health` | Health check com status do DB |
| GET | `/api/v1/master-data/portos` | Busca de portos/aeroportos |
| GET | `/api/v1/master-data/incoterms` | 11 incoterms (EXW a DDP) |
| GET | `/api/v1/master-data/modais` | Modais com modalidades |
| GET | `/api/v1/master-data/moedas` | Moedas (USD, BRL, EUR, CNY) |
| GET | `/api/v1/master-data/paises` | Lista de paises |
| GET | `/api/v1/master-data/containers` | Tipos de container |
| GET | `/api/v1/bid-frete/portal/public/cotacao/:token` | Ver cotacao via link publico |
| POST | `/api/v1/bid-frete/portal/public/responder/:token` | Responder cotacao via token |

### Rotas protegidas (x-internal-key + tenant isolation)

#### Cotacoes

| Metodo | Rota | Descricao |
|:---|:---|:---|
| POST | `/api/v1/bid-frete/cotacoes` | Criar cotacao |
| POST | `/api/v1/bid-frete/cotacoes/bloco` | Importar em bloco |
| GET | `/api/v1/bid-frete/cotacoes` | Listar com filtros (status, modal, datas) |
| GET | `/api/v1/bid-frete/cotacoes/:id` | Detalhe |
| PUT | `/api/v1/bid-frete/cotacoes/:id` | Atualizar |
| PATCH | `/api/v1/bid-frete/cotacoes/:id/status` | Mudar status |
| DELETE | `/api/v1/bid-frete/cotacoes/:id` | Deletar (somente RASCUNHO) |

#### Fornecedores

| Metodo | Rota | Descricao |
|:---|:---|:---|
| POST | `/api/v1/bid-frete/fornecedores` | Cadastrar fornecedor |
| GET | `/api/v1/bid-frete/fornecedores` | Listar com filtros |
| GET | `/api/v1/bid-frete/fornecedores/:id` | Detalhe + rating |
| PUT | `/api/v1/bid-frete/fornecedores/:id` | Atualizar |
| PATCH | `/api/v1/bid-frete/fornecedores/:id/status` | Mudar status (ATIVO/INATIVO/BLOQUEADO) |
| DELETE | `/api/v1/bid-frete/fornecedores/:id` | Remover |
| POST | `/api/v1/bid-frete/fornecedores/:id/tabela-preco` | Adicionar rota de preco |
| GET | `/api/v1/bid-frete/fornecedores/:id/tabela-preco` | Listar tabela |
| PUT | `/api/v1/bid-frete/fornecedores/:id/tabela-preco/:tpId` | Atualizar rota |
| DELETE | `/api/v1/bid-frete/fornecedores/:id/tabela-preco/:tpId` | Remover rota |

#### BIDs (Disparo)

| Metodo | Rota | Descricao |
|:---|:---|:---|
| POST | `/api/v1/bid-frete/bids/disparar` | Disparar para fornecedores selecionados |
| POST | `/api/v1/bid-frete/bids/cotacao-aberta` | Disparar para todos os ativos |
| GET | `/api/v1/bid-frete/bids/cotacao/:id` | BidRequests de uma cotacao |

#### Comparativo

| Metodo | Rota | Descricao |
|:---|:---|:---|
| GET | `/api/v1/bid-frete/comparativo/:cotacaoId` | Ranking com savings |
| POST | `/api/v1/bid-frete/comparativo/:cotacaoId/aprovar` | Aprovar resposta (2-click) |
| POST | `/api/v1/bid-frete/comparativo/:cotacaoId/reprovar` | Reprovar com motivo |

#### Portal Autenticado

| Metodo | Rota | Descricao |
|:---|:---|:---|
| GET | `/api/v1/bid-frete/portal/dashboard` | Overview do fornecedor |
| GET | `/api/v1/bid-frete/portal/cotacoes-pendentes` | Cotacoes pendentes |
| GET | `/api/v1/bid-frete/portal/minhas-respostas` | Historico de respostas |
| POST | `/api/v1/bid-frete/portal/responder/:bidRequestId` | Responder (autenticado) |
| GET | `/api/v1/bid-frete/portal/meu-desempenho` | Metricas do fornecedor |
| GET | `/api/v1/bid-frete/portal/tabela-precos` | Tabelas de preco |

#### Avaliacoes

| Metodo | Rota | Descricao |
|:---|:---|:---|
| POST | `/api/v1/bid-frete/avaliacoes` | Criar avaliacao (1-5 por criterio) |
| GET | `/api/v1/bid-frete/avaliacoes/fornecedor/:id` | Rating do fornecedor |
| GET | `/api/v1/bid-frete/avaliacoes/ranking` | Ranking global |

#### Dashboard

| Metodo | Rota | Descricao |
|:---|:---|:---|
| GET | `/api/v1/bid-frete/dashboard` | KPIs consolidados |
| GET | `/api/v1/bid-frete/dashboard/calendario` | Calendario de alertas |

---

## 5. Fluxos de Negocio

### 5.1 Ciclo de vida da cotacao

```
RASCUNHO ──disparar BID──> ENVIADA_FORNECEDORES ──resposta recebida──> EM_COTACAO
                                                                           │
                           ┌──────────────────────────────────────────────┘
                           │
                    AGUARDANDO_APROVACAO
                           │
               ┌───────────┼───────────┐
               ▼           ▼           ▼
           APROVADA    REPROVADA   CANCELADA
                                       ▲
                                       │
                                   EXPIRADA (cron)
```

**Status terminal:** APROVADA, REPROVADA, CANCELADA, EXPIRADA

### 5.2 Fluxo de disparo de BID

1. Usuario seleciona fornecedores (ou "cotacao aberta" = todos ativos)
2. Para cada fornecedor, sistema cria `BidRequest`
3. Verifica se fornecedor tem `TabelaPreco` que faz match (origem, destino, modal, modalidade, datas)
4. Se match: gera `BidResponse` automatica, marca BidRequest como RESPONDIDO
5. Se nao: envia notificacao via canal escolhido (EMAIL, WHATSAPP)
6. Gera token publico com validade de 7 dias
7. Cotacao muda para ENVIADA_FORNECEDORES

### 5.3 Fluxo de aprovacao (2-click)

1. Usuario visualiza comparativo (ranking automatico)
2. Clica "Aprovar" na resposta desejada → modal de confirmacao
3. Confirma → sistema executa:
   - `BidResponse.status = APROVADA`
   - `Cotacao.status = APROVADA`
   - `Cotacao.fornecedor_vencedor_id = fornecedor_id`
   - Calcula e registra `Saving`
   - Chama `monetizacao.registrarCobranca()`
   - Chama `ratingEngine.recalcular()`

### 5.4 Calculo de savings

```
Se target existe:
  saving = target - melhor_preco
  percentual = (saving / target) * 100

Se target nao existe:
  media = soma(respostas) / total
  saving = media - melhor_preco
  percentual = (saving / media) * 100
```

---

## 6. Engines e Servicos

### bidEngine.ts
- `disparar(cotacao_id, fornecedor_ids, canal)` — Orquestra o disparo completo
- `verificarTabelaPadrao(fornecedor, cotacao)` — Match com tabela de precos
- `gerarRespostaAutomatica(bidRequest, tabela)` — Cria BidResponse automatica

### comparativoEngine.ts
- `ranquear(cotacao_id)` — Gera ranking com tags (MELHOR_PRECO, MELHOR_TRANSIT, MELHOR_AVALIACAO)
- `aprovar(cotacao_id, response_id)` — Aprovacao com saving + monetizacao
- `reprovar(cotacao_id, motivo)` — Reprovacao com motivo registrado

### ratingEngine.ts
- `recalcular(fornecedor_email)` — Rating cross-tenant
  - **40% automatico:** taxa de resposta, taxa de aprovacao, tempo medio de resposta
  - **60% manual:** frete, atendimento, resposta, confiabilidade (media das avaliacoes)

### monetizacao.ts
- `registrarCobranca(fornecedor_id, cotacao_id)` — Verifica free tier e registra
  - Free tier: 10 primeiras cotacoes aprovadas = ISENTA
  - Apos: USD 5.00 por cotacao = PENDENTE
- `resumoFornecedor(fornecedor_id)` — Total cobrado, restante no free tier

### savingsEngine.ts
- `calcularMetricas(tenant_id, filtros)` — Agregacoes: total aprovado, savings total, media percentual

### cronJobs.ts
- Expiracao automatica de cotacoes sem resposta apos prazo
- Recalculo periodico de ratings

### tenantIntegrations.ts (fire-and-forget)
- Notifica servicos tenant: Atividades, Historico, Notificacoes, GABI

---

## 7. Integracoes

### Servicos internos (fire-and-forget via REST)

| Servico | URL Padrao | Quando |
|:---|:---|:---|
| Atividades | http://localhost:8012 | Log de eventos da cotacao |
| Historico | http://localhost:8014 | Audit trail imutavel |
| Notificacoes | http://localhost:8013 | Alertas ao usuario |
| GABI | interno | Alertas de procurement |

### Servicos externos

| Servico | Uso |
|:---|:---|
| Email (Resend) | Disparo de BID por email |
| WhatsApp (Meta Cloud API) | Disparo de BID por WhatsApp |

### Conectores ERP (`connectors/`)

| Conector | Arquivo | Protocolos |
|:---|:---|:---|
| ERP/SAP | `erp.ts` | OData, REST, HANA |
| Agentes de carga | `agentes.ts` | API REST |
| Armadores | `armadores.ts` | API REST |
| Cias aereas | `ciasAereas.ts` | API REST |

---

## 8. Portal do Fornecedor

Duas modalidades de acesso:

### Portal publico (sem login)
- Acesso via token gerado no disparo (`/api/v1/bid-frete/portal/public/cotacao/:token`)
- Permite visualizar dados da cotacao e enviar resposta
- Token expira em 7 dias
- Submissao unica (idempotente)

### Portal autenticado (com login Gravity)
- Dashboard com KPIs (pendentes, respondidas, aprovadas)
- Lista de cotacoes pendentes
- Historico de respostas
- Gestao de tabelas de preco
- Metricas de desempenho (taxa resposta, taxa aprovacao, tempo medio)

### Paginas do portal

| Pagina | Arquivo | Funcao |
|:---|:---|:---|
| Dashboard | `PortalDashboard.tsx` | Overview com KPIs |
| Pendentes | `CotacoesPendentes.tsx` | Cotacoes aguardando resposta |
| Respostas | `MinhasRespostas.tsx` | Historico de respostas enviadas |
| Tabela Precos | `TabelaPrecos.tsx` | Gestao de rotas e precos |
| Desempenho | `MeuDesempenho.tsx` | Metricas e avaliacao |
| Responder (auth) | `ResponderCotacao.tsx` | Form de resposta autenticada |
| Responder (pub) | `ResponderPublico.tsx` | Form de resposta via token |

---

## 9. Monetizacao

### Modelo de cobranca

```
Cotacoes aprovadas 1-10:   ISENTA (free tier)
Cotacoes aprovadas 11+:    USD 5.00 por cotacao (status PENDENTE)
```

### Campos da cobranca

| Campo | Tipo | Descricao |
|:---|:---|:---|
| fornecedor_id | String | Fornecedor cobrado |
| cotacao_id | String | Cotacao que gerou a cobranca |
| valor | Decimal | 0.00 (isenta) ou 5.00 |
| moeda | String | USD |
| status | Enum | ISENTA ou PENDENTE |

---

## 10. Configuracao e Deploy

### Variaveis de ambiente

| Variavel | Obrigatoria | Descricao |
|:---|:---|:---|
| DATABASE_URL | Sim | URL do PostgreSQL |
| INTERNAL_SERVICE_KEY | Sim | Chave de autenticacao inter-servico |
| PORT | Nao | Porta do servidor (default: 8023) |
| NODE_ENV | Nao | Ambiente (development, production) |
| APP_URL | Sim | URL base da aplicacao |
| CLIENT_URL | Sim | URL do frontend |
| EMAIL_SERVICE_URL | Sim | URL do servico de email |
| WHATSAPP_SERVICE_URL | Sim | URL do servico WhatsApp |
| ATIVIDADES_SERVICE_URL | Sim | URL do servico de atividades |
| HISTORICO_SERVICE_URL | Sim | URL do servico de historico |
| NOTIFICACOES_SERVICE_URL | Sim | URL do servico de notificacoes |

### Scripts

```bash
# Desenvolvimento
npm run dev:client     # Vite dev server (porta 5175)
npm run dev:server     # Express com tsx watch (porta 8023)

# Build
npm run build          # Build client + server

# Testes
npm run test           # Vitest
npm run test:watch     # Vitest watch mode

# Prisma
npx prisma generate    # Gerar client
npx prisma migrate dev # Migrar DB
```

### CORS

Origens permitidas: `localhost:5175` (client dev), `localhost:8003` (configurador), `CLIENT_URL`

---

## 11. Testes

### Estrutura

```
testes/
├── testes-unitarios/bid-frete/
│   ├── bidEngine.test.ts         # Engine de disparo
│   ├── comparativoEngine.test.ts # Ranking e aprovacao
│   ├── connectors.test.ts        # Validacao ERP
│   ├── monetizacao.test.ts       # Free tier e cobranca
│   └── savingsEngine.test.ts     # Calculo de economia
├── testes-funcionais/bid-frete/
│   ├── bloco.test.ts             # Importacao em bloco
│   ├── cotacoes.test.ts          # CRUD de cotacoes
│   ├── fornecedores.test.ts      # CRUD de fornecedores
│   └── masterData.test.ts        # Dados mestres
└── testes-e2e/bid-frete/
    ├── helpers.ts                # Utilidades compartilhadas
    ├── cotacoes-crud.spec.ts     # Cat 1 + 6 (CRUD, modais)
    ├── filtros-busca.spec.ts     # Cat 2 + 9 (filtros, visualizacoes)
    ├── fornecedores.spec.ts      # Cat 1 + 3 (CRUD, selects)
    ├── fluxo-completo.spec.ts    # Cat 11 (fluxos de dominio)
    ├── navegacao-estados.spec.ts # Cat 5 + 7 + 8 + 4 (navegacao, estados, massa, import)
    └── regressao.spec.ts         # Regressao (tenant isolation, seguranca, validacao)
```

### Cobertura

| Tipo | Suites | Cobertura |
|:---|:---|:---|
| Unitarios | 5 suites | Engines, monetizacao, savings, connectors |
| Funcionais | 4 suites | Todas as rotas CRUD + master data |
| E2E | 6 specs | 11 categorias obrigatorias + regressao |

### Testes de regressao criticos

| ID | O que valida |
|:---|:---|
| REG-01/02/03 | Tenant isolation (cotacoes e fornecedores) |
| REG-04/05/06 | Autenticacao (x-internal-key, tenant_id) |
| REG-07/08 | Validacao Zod (payloads invalidos) |
| REG-09/10 | Integridade (transicao de status, delete nao-rascunho) |
| REG-11 | Monetizacao (free tier de 10 cotacoes) |
| REG-12/13/14 | Master data e health check |
