# Arquitetura Tecnica — Processo (Gestao de Processos Logisticos)

> **Versao:** 1.0
> **Data:** 31/03/2026
> **Porta:** 8026
> **Product ID:** processo
> **Agente:** Tech Lead (Dream Team de Produtos)

---

## 1. PRODUCT_CONFIG

```typescript
export const PRODUCT_CONFIG = {
  id: 'processo',
  productId: 'processo',
  name: 'Processo',
  port: 8026,

  tenantServices: [
    'atividades',      // Log de acoes
    'dashboard',       // KPIs consolidados
    'relatorios',      // Relatorios exportaveis
    'historico',       // Audit trail imutavel
    'notificacoes',    // Alertas in-app
    'gabi',            // IA — analise de processos
    'email',           // Comunicacao com despachantes, agentes
    'whatsapp',        // Comunicacao WhatsApp
    'api-cockpit',     // Tokens de API, playground, webhooks
  ],

  productServices: [
    'workflow-engine',         // Motor de workflow (status + etapas)
    'follow-up-tracker',       // Timeline de eventos
    'documento-manager',       // Upload/download de documentos
    'custo-estimator',         // Integracao com SimulaCusto
  ],

  navigation: [
    { id: 'workflow',        label: 'Workflow',           icon: 'flow-arrow',        source: 'product' },
    { id: 'pedidos',         label: 'Pedidos',            icon: 'package',           source: 'product' },
    { id: 'li',              label: 'LI',                 icon: 'file-text',         source: 'product' },
    { id: 'di',              label: 'DI',                 icon: 'file-dashed',       source: 'product' },
    { id: 'duimp',           label: 'DUIMP',              icon: 'cloud-arrow-up',    source: 'product' },
    { id: 'retificacao',     label: 'Retificacao',        icon: 'pencil-line',       source: 'product' },
    { id: 'financeiro',      label: 'Financeiro',         icon: 'currency-dollar',   source: 'product' },
    { id: 'containers',      label: 'Containers',         icon: 'cube',              source: 'product' },
    { id: 'dados-tecnicos',  label: 'Dados Tecnicos',     icon: 'gear-six',          source: 'product' },
    { id: 'dados-processo',  label: 'Dados do Processo',  icon: 'clipboard-text',    source: 'product' },
    { id: 'taxas',           label: 'Taxas',              icon: 'receipt',           source: 'product' },
    { id: 'email',           label: 'Email',              icon: 'envelope',          source: 'tenant' },
    { id: 'todo',            label: 'To Do',              icon: 'check-square',      source: 'tenant' },
  ],

  features: {
    workflow_automation: 'active',
    followup_tracking: true,
    documento_upload: true,
    custo_estimativa: true,
    email_integration: true,
  },
}
```

---

## 2. Estrutura de Pastas

```
produto/processo/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── ProcessoLayout.tsx         # Layout principal com abas
│       │   ├── WorkflowPage.tsx           # Timeline de status + etapas
│       │   ├── PedidosPage.tsx            # Pedidos vinculados
│       │   ├── FinanceiroPage.tsx         # Custos e estimativas
│       │   ├── ContainersPage.tsx         # Gestao de containers
│       │   ├── DadosTecnicosPage.tsx      # Dados tecnicos do processo
│       │   ├── DadosProcessoPage.tsx      # Dados gerais do processo
│       │   ├── DocumentosPage.tsx         # Documentos anexados
│       │   └── EmailPage.tsx              # Email integrado
│       └── shared/
│           ├── api.ts                     # Client API functions
│           ├── config.ts                  # PRODUCT_CONFIG
│           └── types.ts                   # TypeScript types
├── server/
│   └── src/
│       ├── index.ts                       # Express (porta 8026, 11 middlewares)
│       ├── routes/
│       │   ├── processos.ts               # CRUD de processos
│       │   ├── followup.ts                # Timeline de follow-up
│       │   └── documentos.ts              # Documentos anexados
│       ├── middleware/
│       │   ├── requireInternalKey.ts      # x-internal-key (S2S)
│       │   └── tenantIsolation.ts         # Filtro por tenant_id
│       └── (importa pedidos + importacao de processos-core)
```

**Dependencia compartilhada:**
```
servicos-global/tenant/processos-core/
├── src/routes/
│   ├── pedidos.ts                         # CRUD de pedidos (compartilhado com produto/pedido)
│   └── importacao.ts                      # Importacao de arquivos (Excel, CSV, XML, TXT, JSON)
└── prisma/
    └── fragment.prisma                    # Modelo de dados (Processo, Pedido, PedidoItem, etc.)
```

---

## 3. API Completa

### 3.1 Rotas Publicas

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Health check com status do banco |

### 3.2 Rotas do Processo (protegidas)

#### Processos CRUD (`/api/v1/processos/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/processos?status=&tipo=&search=&page=&limit=` | Listar processos com paginacao (inclui etapas) |
| GET | `/processos/:id` | Detalhe completo (etapas, pedidos com itens, followUps, documentos, estimativaCusto, dadosTecnicos) |
| POST | `/processos` | Criar processo (numero, tipo: importacao/exportacao, status, responsavel_id) |
| PATCH | `/processos/:id` | Atualizar processo existente |

#### Follow-Up (`/api/v1/follow-up/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/follow-up/processo/:processoId?tipo=&categoria=` | Listar follow-ups de um processo (filtro por tipo e categoria) |
| POST | `/follow-up` | Criar entrada de follow-up (titulo, descricao, tipo, categoria) |

**Tipos de follow-up:** `info`, `desvio`, `atualizacao`, `documento`
**Categorias:** `exportador`, `logistica`, `despachante`, `financeiro`, `sistema`

#### Documentos (`/api/v1/documentos/`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/documentos/processo/:processoId?categoria=` | Listar documentos de um processo (filtro por categoria) |
| POST | `/documentos` | Registrar metadados de documento (nome, tipo_arquivo, url, categoria) |
| DELETE | `/documentos/:id` | Remover documento |

**Tipos de arquivo:** `pdf`, `xlsx`, `xml`, `img`
**Categorias:** `bl`, `po`, `di`, `li`, `nfe`, `outro`

### 3.3 Rotas de Pedidos (herdadas de processos-core)

O servidor do Processo monta as rotas do `processos-core` em `/api/v1/pedidos`:

#### Pedidos CRUD

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/pedidos?status=&tipo_operacao=&busca=&page=&limit=` | Listar pedidos com paginacao |
| GET | `/pedidos/:id` | Detalhe do pedido com itens |
| POST | `/pedidos` | Criar pedido com array de itens |
| PUT | `/pedidos/:id` | Atualizar pedido (apenas Rascunho/Aberto) |
| DELETE | `/pedidos/:id` | Excluir pedido (apenas Rascunho) |
| PATCH | `/pedidos/:id/status` | Transicao de status (rascunho→aberto, aberto→cancelado) |
| POST | `/pedidos/:id/duplicar` | Duplicar pedido inteiro |

#### Itens de Pedido

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/pedidos/:id/itens` | Adicionar item ao pedido |
| PUT | `/pedidos/:id/itens/:itemId` | Atualizar item |
| DELETE | `/pedidos/:id/itens/:itemId` | Remover item (apenas se quantidade_transferida == 0) |
| PATCH | `/pedidos/:id/itens/:itemId/cancelar` | Cancelar quantidade (debita quantidade_atual) |
| PATCH | `/pedidos/:id/itens/:itemId/pronta` | Atualizar quantidade_pronta |

#### Importacao/Exportacao

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/pedidos/importar` | Upload + parse + preview (Excel, CSV, XML, TXT, JSON) |
| POST | `/pedidos/importar/confirmar` | Confirmar importacao e criar pedidos em lote |
| POST | `/pedidos/exportar` | Exportar pedidos filtrados (CSV, Excel) |

---

## 4. Total de Endpoints

| Categoria | Quantidade |
|-----------|------------|
| Health Check | 1 |
| Processos CRUD | 4 |
| Follow-Up | 2 |
| Documentos | 3 |
| Pedidos CRUD (via processos-core) | 7 |
| Itens de Pedido (via processos-core) | 5 |
| Importacao/Exportacao (via processos-core) | 3 |
| **TOTAL** | **25** |

---

## 5. Arquitetura 3-Tier

O Processo e a Camada 3 da hierarquia logistica da Gravity:

```
┌─────────────────────────────────────────────────────┐
│ Camada 1: PEDIDO (Comercial)                        │
│   Purchase Order / Sales Order                      │
│   → Incoterm, Moeda, Fornecedor/Cliente             │
├─────────────────────────────────────────────────────┤
│ Camada 2: PEDIDO ITEM (Rastreamento de Saldo)       │
│   Linha do item com controle de quantidade          │
│   → quantidade_inicial = quantidade_atual           │
│     + quantidade_transferida + quantidade_cancelada  │
├─────────────────────────────────────────────────────┤
│ Camada 3: PROCESSO (Execucao Logistica)             │
│   Evento decisorio de agrupamento e embarque        │
│   → Workflow de 7+ status, 30+ datas de tracking    │
│   → Pode carregar itens de multiplos pedidos        │
└─────────────────────────────────────────────────────┘
```

### 5.1 Fluxo de Status do Processo

```
[Aberto] → [Booking Confirmado] → [Pronto Embarque] → [Embarcado]
    → [Chegada Origem] → [Desembaracado] → [Entregue]
```

Cada transicao gera um `FollowUp` automatico na timeline.

### 5.2 Transferencia de Saldo (Pedido → Processo)

Quando itens de um Pedido sao vinculados a um Processo:
1. `ProcessoItem` grava a porcao fatiada (`quantidade_transferida`)
2. `PedidoItem.quantidade_atual` e debitada atomicamente
3. O Pedido muda automaticamente de status quando todo saldo foi transferido

**Cenarios suportados:**
- Embarque parcial (parte do pedido num navio)
- Backorder (restante num navio futuro)
- Consolidacao (itens de varios pedidos num processo)
- Cancelamento parcial (quantidade suprimida)

### 5.3 Linha do Tempo (30+ eventos)

O Processo rastreia eventos cronologicos estritamente tipados:
- `data_previsao_embarque_origem_etd`
- `data_embarque_efetivo`
- `data_chegada_destino_eta`
- `data_registro_duimp`
- `data_deferimento_lpco`
- `data_desembaraco`
- `data_entrega_final`
- *(e mais 20+ datas de tracking)*

### 5.4 Engates Magneticos

O Processo possui "engates" opcionais para dados de outros modulos:
- `estimativa_base_id` → SimulaCusto (congela estimativa ao vincular)
- `cotacao_frete_id` → BID Frete (referencia da cotacao aprovada)
- Parceiros logisticos: Armador, Agente, Securadora, Corretora de Cambio

---

## 6. Seguranca

### 6.1 Autenticacao e Autorizacao

| Camada | Implementacao |
|--------|--------------|
| S2S Authentication | `x-internal-key` validado via `requireInternalKey` middleware |
| Tenant Isolation | `x-tenant-id` no header → Prisma Extension filtra automaticamente |
| User Identity | `x-user-id` no header (propagado pelo Gateway) |
| Security Headers | Helmet com CSP strict |

### 6.2 Middlewares (ordem de execucao)

1. Helmet (CSP)
2. Body Parser
3. CORS (allowlist: localhost:8002, localhost:8000)
4. Static Files
5. Health Check (sem auth)
6. **requireInternalKey** (barreira de auth)
7. **tenantIsolation** (injeta req.prisma filtrado)
8. Rotas protegidas
9. SPA Fallback
10. Error Handler Global

### 6.3 Validacao

- `CreateProcessoSchema` — Zod: numero obrigatorio, tipo enum (importacao/exportacao)
- `UpdateProcessoSchema` — Zod: todos campos opcionais, nullable onde aplicavel
- `CreateFollowUpSchema` — Zod: processo_id e titulo obrigatorios, tipo e categoria enum
- `CreateDocumentoSchema` — Zod: processo_id, nome, tipo_arquivo enum, url valida

---

## 7. Modelo de Dados (Resumo)

### Entidades Principais

| Entidade | Descricao |
|----------|-----------|
| `Processo` | Processo logistico (numero, tipo, status, responsavel, 30+ datas de tracking) |
| `Etapa` | Etapa do workflow (data_prevista, status) |
| `Pedido` | Pedido comercial vinculado (via processos-core) |
| `PedidoItem` | Linha do pedido com controle de saldo |
| `ProcessoItem` | Porcao do item vinculada ao processo |
| `FollowUp` | Evento de timeline (tipo, categoria, descricao) |
| `Documento` | Documento anexado (BL, PO, DI, LI, NFe) |
| `EstimativaCusto` | Referencia a estimativa do SimulaCusto |
| `DadosTecnicos` | Dados tecnicos do processo |

### Campos Obrigatorios (Tenant Isolation)

Toda tabela possui:
- `tenant_id String` — isolamento por tenant
- `company_id String` — isolamento por workspace
- Indices: `@@index([tenant_id])`, `@@index([tenant_id, product_id])`, `@@index([tenant_id, user_id])`

### Escudo Anti-Conflito

- Importacao: `importacao_exportador_id` (fornecedor exterior), importador = `company_id`
- Exportacao: `exportacao_importador_id` (cliente exterior), exportador = `company_id`
- Nunca existe `importador_id` generico

---

## 8. Integracoes

### 8.1 Dependencia Direta

| Modulo | Tipo | Descricao |
|--------|------|-----------|
| processos-core | Import direto | Rotas de pedidos e importacao montadas no mesmo servidor |

### 8.2 Engates Opcionais (via ID)

| Modulo | Campo | Descricao |
|--------|-------|-----------|
| SimulaCusto | `estimativa_base_id` | Estimativa de custo vinculada (congela ao engate) |
| BID Frete | `cotacao_frete_id` | Cotacao de frete aprovada |
| BID Cambio | (via parcela) | Parcela de cambio do processo |

### 8.3 Tenant Services (S2S)

- atividades, dashboard, relatorios, historico, notificacoes, gabi, email, whatsapp

---

## 9. Variaveis de Ambiente

```env
PORT=8026
DATABASE_URL=postgresql://...
CHAVE_INTERNA_SERVICO=...
CLIENT_URL=http://localhost:8002
NODE_ENV=development
```

---

_Gravity — Processo Logistico · Arquitetura v1.0 · 31/03/2026_
