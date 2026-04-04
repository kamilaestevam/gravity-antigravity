# Arquitetura Tecnica — Pedido (Gestao de Pedidos COMEX)

> **Versao:** 1.1
> **Data:** 03/04/2026
> **Porta Backend:** 8026 (processos-core)
> **Product ID:** pedido
> **Agente:** Tech Lead (Dream Team de Produtos)

---

## 1. PRODUCT_CONFIG

```typescript
export const PRODUCT_CONFIG = {
  id: 'pedido',
  productId: 'pedido',
  name: 'Pedido',

  // Servicos de tenant consumidos via proxy (residem em tenant-db)
  tenantServices: [
    'atividades',      // Log de acoes
    'historico',       // Audit trail imutavel
    'notificacoes',    // Alertas in-app
    'api-cockpit',     // Tokens de API, playground, webhooks, ERP
    'conector-erp',    // Integracao SAP/ERP, importacao de dados
  ],

  // Servicos de produto (logica interna — rotas em processos-core)
  productServices: [
    'saldo-engine',    // Matematica de saldo imutavel (transferir, cancelar, pronta)
    'import-engine',   // Parser multi-formato (Excel, CSV, XML, TXT, JSON)
  ],

  navigation: [
    { id: 'pedidos',  label: 'Pedidos',  icon: 'package',       source: 'product' },
    { id: 'importar', label: 'Importar', icon: 'upload-simple', source: 'product' },
    { id: 'historico',label: 'Historico', icon: 'clock',         source: 'tenant'  },
  ],

  features: {
    importacao_exportacao: true,   // Suporte dual importacao/exportacao
    importacao_arquivo: true,      // Upload de Excel, CSV, XML, TXT, JSON
    integracao_erp: true,          // Via API Cockpit + Conector ERP
    smart_read: false,             // Fase 2
    dashboard_analitico: false,    // Fase 2
  },
}
```

**Nota arquitetural:** O produto Pedido **nao possui servidor proprio**. Todas as rotas backend residem em `servicos-global/tenant/processos-core`, que serve como backend compartilhado para Pedido, Processo e futuros produtos logisticos. A porta 8026 no `contracts.json` aponta para o processos-core com `pathPrefix: /api/v1/pedidos`.

---

## 2. Estrutura de Pastas

```
produto/pedido/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── ListaPedidos.tsx           # Grid hierarquico (TabelaVirtualGlobal — 99 col. pai, 165 col. filho)
│       │   ├── NovoPedido.tsx             # Formulario criacao/edicao
│       │   └── ImportarArquivo.tsx         # Upload multi-formato + preview
│       └── shared/
│           ├── config.ts                   # PRODUCT_CONFIG
│           └── types.ts                    # Interfaces Pedido, PedidoItem, helpers
│
└── package.json

servicos-global/tenant/processos-core/     # Backend compartilhado
├── src/
│   ├── routes/
│   │   ├── pedidos.ts                     # CRUD Pedido + PedidoItem (12 endpoints)
│   │   └── importacao.ts                  # Upload, preview, confirmar, exportar
│   │
│   ├── services/
│   │   ├── saldoEngine.ts                 # Motor de saldo (transferir, cancelar, pronta)
│   │   └── importEngine.ts                # Parser multi-formato + normalizacao
│   │
│   └── middleware/
│       ├── requireInternalKey.ts           # Auth S2S
│       └── tenantIsolation.ts             # Injeta tenant_id + company_id
│
└── prisma/
    └── fragment.prisma                     # Models: Pedido, PedidoItem, Processo, ProcessoItem
```

---

## 3. Modelo de Dados (fragment.prisma)

### 3.1 Pedido

Documento comercial mestre — Purchase Order (importacao) ou Sales Order (exportacao).

```prisma
model Pedido {
  id         String @id         // Ex: pedi_id_0000001/26
  tenant_id  String
  company_id String

  tipo_operacao String          // 'importacao' | 'exportacao'
  numero_pedido String          // Referencia comercial. Ex: PO-8912
  status        String @default("aberto")  // draft | aberto | transferencia | consolidado | cancelado

  // Parceiros Negociais (Escudo Anti-Conflito)
  importacao_exportador_id String?  // Se importacao: fornecedor exterior
  exportacao_importador_id String?  // Se exportacao: cliente final exterior

  // Dados Comerciais
  incoterm                               String?
  moeda_pedido                           String  @default("USD")
  valor_total_pedido                     Float?
  casas_decimais_total_pedido            Int     @default(2)
  quantidade_total_pedido                Float?
  casas_decimais_quantidade_total_pedido Int     @default(2)
  unidade_comercializada_pedido          String?

  // Dados Financeiros
  cobertura_cambial  String  @default("com_cobertura")
  condicao_pagamento String?

  // Cambio (vinculo futuro com BID Cambio)
  valor_total_cambio   Float?
  moeda_cambio         String?
  taxa_cambio_estimada Float?
  contrato_cambio_id   String?

  data_emissao_pedido DateTime @default(now())

  // Metadados polimorficos (JSON livre)
  detalhes_operacionais Json?

  itens PedidoItem[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([tenant_id, company_id])
  @@map("pedidos_comerciais")
}
```

### 3.2 PedidoItem — O Elo Sagrado

Rastreador de saldo por linha. Controla quantidade inicial, atual, transferida, pronta e cancelada.

```prisma
model PedidoItem {
  id         String @id         // Ex: pite_id_00001/26
  tenant_id  String
  company_id String
  pedido_id  String

  // Identidade do Produto
  sequencia_item              Int?
  part_number                 String      // SKU interno
  ncm                         String      // Classificacao fiscal
  descricao                   String
  unidade_comercializada_item String?

  // Controle de Quantidades (Balance Tracking)
  quantidade_inicial        Float         // IMUTAVEL apos criacao
  quantidade_atual          Float         // Saldo vivo
  quantidade_pronta         Float @default(0)  // Produzido pela fabrica (informativo)
  quantidade_transferida    Float @default(0)  // Alocado em processos
  quantidade_cancelada      Float @default(0)  // Cancelado (irreversivel)
  casas_decimais_quantidade Int   @default(2)

  // Valores
  moeda_item                String @default("USD")
  valor_item                Float?
  valor_unitario            Float?
  casas_decimais_total_item Int    @default(2)

  pedido             Pedido         @relation(fields: [pedido_id], references: [id], onDelete: Cascade)
  embarques_efetivos ProcessoItem[] // Vinculo com Camada 3

  @@index([tenant_id, company_id])
  @@index([pedido_id])
  @@map("pedido_itens")
}
```

### 3.3 Formato de IDs

| Entidade | Prefixo | Exemplo |
|----------|---------|---------|
| Pedido | `pedi` | `pedi_id_0000001/26` |
| PedidoItem | `pite` | `pite_id_00001/26` |
| Processo | `proc` | `proc_id_0000001/26` |
| ProcessoItem | `prit` | `prit_id_00001/26` |

Formato: `{prefixo}_id_{sequencial_7dig}/{ano_2dig}`

---

## 4. API Completa

### Rotas de Pedido (`/api/v1/pedidos`)

Protegidas por: `requireInternalKey` + `tenantIsolation`

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/pedidos` | Listar pedidos com itens (filtros: status, tipo_operacao, busca, paginacao) |
| GET | `/api/v1/pedidos/:id` | Detalhe do pedido com itens ordenados por sequencia |
| POST | `/api/v1/pedidos` | Criar pedido com itens (calcula totais automaticamente) |
| PUT | `/api/v1/pedidos/:id` | Atualizar pedido (somente status Draft ou Aberto) |
| DELETE | `/api/v1/pedidos/:id` | Deletar pedido (somente status Draft) |
| PATCH | `/api/v1/pedidos/:id/status` | Transicao de status (Draft->Aberto, Draft->Cancelado, Aberto->Cancelado) |
| POST | `/api/v1/pedidos/:id/duplicar` | Duplicar pedido completo (itens resetam saldo, status = Draft) |

### Rotas de Itens (`/api/v1/pedidos/:id/itens`)

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/pedidos/:id/itens` | Adicionar item (somente Draft ou Aberto) |
| PUT | `/api/v1/pedidos/:id/itens/:itemId` | Atualizar item (part_number, ncm, descricao, valores) |
| DELETE | `/api/v1/pedidos/:id/itens/:itemId` | Remover item (bloqueado se quantidade_transferida > 0) |
| PATCH | `/api/v1/pedidos/:id/itens/:itemId/cancelar` | Cancelar quantidade (via saldoEngine, irreversivel) |
| PATCH | `/api/v1/pedidos/:id/itens/:itemId/pronta` | Atualizar quantidade pronta (informativo, nao afeta saldo) |

### Rotas de Importacao/Exportacao de Arquivos (`/api/v1/pedidos`)

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/pedidos/importar` | Upload + parse + preview (arquivo base64 + nome) |
| POST | `/api/v1/pedidos/importar/confirmar` | Criar pedidos em batch (transacao atomica) |
| POST | `/api/v1/pedidos/exportar` | Exportar pedidos filtrados (CSV ou JSON) |

**Total: 15 endpoints**

---

## 5. Matematica de Saldo (Balance Tracking)

### Formula Imutavel

```
quantidade_inicial = quantidade_atual + quantidade_transferida + quantidade_cancelada
```

- `quantidade_inicial` — NUNCA muda apos criacao. Constante de rastreabilidade.
- `quantidade_atual` — Saldo vivo. Unico campo que pode ser debitado.
- `quantidade_transferida` — Total alocado em processos logisticos via `saldoEngine.transferir()`.
- `quantidade_cancelada` — Total cancelado via `saldoEngine.cancelar()`. Irreversivel.
- `quantidade_pronta` — Produzido pela fabrica. **Informativo** — nao afeta a formula.

### Operacoes Atomicas (saldoEngine.ts)

| Operacao | Debita | Credita | Reversivel | Validacao |
|----------|--------|---------|-----------|-----------|
| `transferir()` | `quantidade_atual` | `quantidade_transferida` | Nao* | `quantidade_atual >= quantidade_solicitada` |
| `cancelar()` | `quantidade_atual` | `quantidade_cancelada` | Nao | `quantidade_atual >= quantidade_a_cancelar` |
| `atualizarPronta()` | — | — | Sim | `quantidade_pronta >= 0` |

> *A reversao de transferencia e responsabilidade do produto Processo, nao do Pedido.

### Anti-Sobre-Execucao

O sistema **rejeita** qualquer operacao onde `quantidade_atual < quantidade_solicitada`:

```typescript
if (item.quantidade_atual < quantidade) {
  throw new AppError(400,
    `Quantidade solicitada (${quantidade}) excede saldo disponivel (${item.quantidade_atual})`
  )
}
```

### Validacao de Integridade

```typescript
validarIntegridade(item: SaldoResult): boolean {
  const soma = item.quantidade_atual + item.quantidade_transferida + item.quantidade_cancelada
  return Math.abs(item.quantidade_inicial - soma) < 0.001 // tolerancia float
}
```

### Atualizacao Automatica de Status do Pedido

Apos cada operacao de saldo, o engine avalia todos os itens e atualiza o status do pedido pai:

```
Se TODOS os itens tem quantidade_atual == 0  → status = 'consolidado'  (Liquidado)
Se ALGUM item tem quantidade_transferida > 0 → status = 'transferencia' (Vinculado)
Senao                                        → status = 'aberto'
```

---

## 6. Fluxo de Status (Ciclo de Vida)

```
                   ┌─────────────────────────────────────────────┐
                   │                                             │
  ┌────────┐   ┌───▼────┐   ┌──────────────┐   ┌─────────────┐ │
  │ Draft  ├──►│ Aberto ├──►│ Transferencia├──►│ Consolidado │ │
  └───┬────┘   └───┬────┘   └──────────────┘   └─────────────┘ │
      │            │                                             │
      └────────────┴──────────► Cancelado ◄──────────────────────┘
```

### Transicoes Manuais (via PATCH /:id/status)

| De | Para | Condicao |
|-----|------|----------|
| Draft | Aberto | Dados validados pelo analista |
| Draft | Cancelado | Pedido descartado antes de validar |
| Aberto | Cancelado | Pedido cancelado pelo analista |

### Transicoes Automaticas (via saldoEngine)

| De | Para | Gatilho |
|-----|------|---------|
| Aberto | Transferencia | Primeiro PedidoItem com `quantidade_transferida > 0` |
| Transferencia | Consolidado | Todos PedidoItem com `quantidade_atual == 0` |
| Transferencia | Aberto | Reversao de transferencia (feita pelo Processo) |

### Descricao de Cada Status

| Status | Descricao | Editavel | Deletavel |
|--------|-----------|----------|-----------|
| **Draft** | Dados iniciais, ainda nao validados. Espelho do ERP ou criacao manual. | Sim | Sim |
| **Aberto** | Saldo positivo, apto para vincular a processos logisticos. | Sim (parcial) | Nao |
| **Transferencia** | Parte dos itens ja alocada em um ou mais Processos. | Nao | Nao |
| **Consolidado** | `quantidade_atual = 0` em todos os itens. Totalmente embarcado ou cancelado. | Nao | Nao |
| **Cancelado** | Pedido descartado. Terminal. | Nao | Nao |

---

## 7. Importacao/Exportacao de Arquivos

### 7.1 Import Engine (importEngine.ts)

Pipeline: **Upload -> Parse -> Normalizar -> Preview -> Confirmar**

#### Formatos Suportados

| Formato | Extensoes | Parser | Status |
|---------|-----------|--------|--------|
| JSON | `.json` | Nativo | Funcional |
| CSV | `.csv` | Nativo (auto-detecta separador: `,` `;` `\t` `\|`) | Funcional |
| TXT | `.txt` | Mesmo parser CSV | Funcional |
| XML | `.xml` | Regex (tags `<row>`, `<pedido>`, `<item>`, `<record>`) | Funcional |
| Excel | `.xlsx`, `.xls` | SheetJS (requer `npm install xlsx`) | Placeholder |

#### Mapeamento Automatico de Colunas

O engine detecta automaticamente o nome das colunas usando aliases comuns em COMEX:

| Campo Interno | Aliases Aceitos |
|---------------|----------------|
| `numero_pedido` | numero_pedido, pedido, po, po_number, purchase_order, order_number, numero |
| `tipo_operacao` | tipo_operacao, tipo, operacao, type |
| `exportador` | exportador, fornecedor, supplier, exporter, vendor |
| `part_number` | part_number, sku, codigo, code, item_code, produto |
| `ncm` | ncm, hs_code, hts, tariff, classificacao |
| `descricao` | descricao, description, desc, produto, product, item |
| `quantidade_inicial` | quantidade, qty, quantity, qtd, quantidade_inicial |
| `valor_unitario` | valor_unitario, unit_price, preco, price, unit_value |

#### Agrupamento Inteligente

Rows com o mesmo `numero_pedido` sao agrupados em um unico Pedido com multiplos itens. Isso permite que um arquivo CSV com 100 linhas gere 20 Pedidos com ~5 itens cada.

### 7.2 Exportacao

O endpoint `/api/v1/pedidos/exportar` gera:

- **CSV**: Headers + rows com dados do pedido expandidos por item (flat). Encoding UTF-8.
- **JSON**: Array completo de pedidos com itens aninhados.

Colunas exportadas no CSV:

```
numero_pedido, tipo_operacao, status, incoterm, moeda, valor_total,
quantidade_total, data_emissao, item_part_number, item_ncm, item_descricao,
item_qtd_inicial, item_qtd_atual, item_qtd_transferida, item_unidade, item_valor
```

---

## 8. Regras de Negocio

### 8.1 Escudo Anti-Conflito (Inversao Semantica)

Importacao e Exportacao coexistem nas mesmas tabelas. Para evitar ambiguidade:

- **NUNCA** usar `fornecedor_id` ou `cliente_id` genericos
- Se `tipo_operacao == 'importacao'`: usar `importacao_exportador_id` (fornecedor exterior)
- Se `tipo_operacao == 'exportacao'`: usar `exportacao_importador_id` (cliente exterior)

O importador/exportador local e sempre o proprio `company_id` (tenant).

### 8.2 Casas Decimais Configuraveis

Diferentes operacoes usam precisoes diferentes:

| Campo | Default | Uso |
|-------|---------|-----|
| `casas_decimais_total_pedido` | 2 | Valores FOB em USD |
| `casas_decimais_quantidade` | 2 | Quantidades inteiras (UN, PC) |
| `casas_decimais_total_item` | 2 | Valor monetario da linha |

Para quantidades fracionarias (TON, m3, LT), o analista pode configurar 3+ casas.

### 8.3 Calculo Automatico de Totais

Na criacao do pedido:

```typescript
valor_total_pedido = SUM(itens.valor_item)  // se nao informado manualmente
quantidade_total_pedido = SUM(itens.quantidade_inicial)  // se nao informado
valor_item = valor_unitario * quantidade_inicial  // se valor_item nao informado
```

### 8.4 Restricoes de Edicao/Exclusao

| Operacao | Draft | Aberto | Transferencia | Consolidado | Cancelado |
|----------|-------|--------|---------------|-------------|-----------|
| Editar pedido | Sim | Sim | Nao | Nao | Nao |
| Deletar pedido | Sim | Nao | Nao | Nao | Nao |
| Adicionar item | Sim | Sim | Nao | Nao | Nao |
| Editar item | Sim | Sim | Sim | Nao | Nao |
| Remover item | Sim* | Sim* | Nao** | Nao | Nao |
| Cancelar quantidade | Sim | Sim | Sim | Nao | Nao |

> *Item so pode ser removido se `quantidade_transferida == 0`
> **Item com transferencia nunca pode ser removido

### 8.5 Duplicacao de Pedido

Ao duplicar:
- Novo ID gerado (`pedi_id_...`)
- `numero_pedido` recebe sufixo `-COPIA`
- Status volta para `draft`
- Todos os itens sao duplicados com saldo resetado (`quantidade_atual = quantidade_inicial`, demais = 0)

### 8.6 Cobertura Cambial

| Valor | Descricao |
|-------|-----------|
| `com_cobertura` | Pedido tera fechamento de cambio (vinculo futuro com BID Cambio) |
| `sem_cobertura` | Sem necessidade de cambio (ex: operacao entre empresas do mesmo grupo) |

---

## 9. Seguranca

### 9.1 Isolamento Zero-Trust

- Toda query exige `tenant_id` + `company_id` extraidos dos headers `x-tenant-id` e `x-company-id`
- Uma filial NUNCA enxerga pedidos de outra
- Excecao: perfil Master Cross-Company (nao implementado no MVP)

### 9.2 Middleware Stack

```
1.  requireInternalKey    — Valida x-internal-key em toda chamada S2S
2.  tenantIsolation       — Injeta tenant_id + company_id do JWT/headers
3.  Zod validation        — Todo endpoint valida body antes de tocar o banco
4.  AppError              — Erros tratados via classe, nunca res.status().json() direto
```

### 9.3 Validacao Zod

| Schema | Campos Obrigatorios | Campos Opcionais |
|--------|-------------------|------------------|
| `criarPedidoSchema` | tipo_operacao, numero_pedido, itens[].part_number, itens[].ncm, itens[].descricao, itens[].quantidade_inicial | incoterm, moeda, valores, exportador_id, etc. |
| `atualizarPedidoSchema` | — (todos parciais) | Todos os campos do pedido (sem itens) |
| `atualizarItemSchema` | — | part_number, ncm, descricao, valores |
| `cancelarQuantidadeSchema` | quantidade (positivo) | — |
| `atualizarProntaSchema` | quantidade_pronta (>= 0) | — |
| `statusTransicaoSchema` | status (enum: draft, aberto, cancelado) | — |
| `confirmarSchema` | pedidos[].numero_pedido, pedidos[].tipo_operacao, pedidos[].itens | Demais campos do pedido |

### 9.4 Checklist de Seguranca

- [x] Todo model Prisma tem `tenant_id` obrigatorio
- [x] Todo endpoint tem validacao Zod
- [x] `tenantIsolation` middleware no servidor
- [x] `requireInternalKey` protege chamadas S2S
- [x] Nenhuma query sem filtro `tenant_id` + `company_id`
- [x] Nenhum `console.log` com dados sensiveis
- [x] Erros via `AppError`, nunca `res.status().json()` direto
- [x] Operacoes de saldo em `$transaction` atomica
- [x] Anti-sobre-execucao com validacao pre-debito
- [x] Valores monetarios com precisao controlada (casas configuraveis)
- [ ] Health check sem auth (a implementar)

---

## 10. Relacao com Processo (Arquitetura 3-Tier)

### Hierarquia

```
┌─────────────────────────────────────────────────────────┐
│ Camada 1: PEDIDO (Documento Comercial)                  │
│   Pedido = Purchase Order (importacao) / Sales Order     │
│   Define: Incoterm, Moeda, Parceiros, Itens              │
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │ Camada 2: PedidoItem (Rastreador de Saldo)       │   │
│   │   O "Elo Sagrado" — controla Balance Tracking    │   │
│   │   quantidade_inicial → quantidade_atual           │   │
│   │                    → quantidade_transferida       │   │
│   │                    → quantidade_cancelada         │   │
│   └────────────────┬─────────────────────────────────┘   │
└────────────────────┼─────────────────────────────────────┘
                     │ pedido_item_id (FK)
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Camada 3: PROCESSO (Execucao Logistica)                 │
│   Processo = Booking/Embarque Fisico                     │
│   ProcessoItem.pedido_item_id → PedidoItem.id            │
│                                                          │
│   NAO FAZ PARTE DESTE PRODUTO.                           │
│   Existe apenas no produto Processo.                     │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Transferencia (Pedido → Processo)

```
1. Analista cria Pedido com itens (Camada 1)
2. Analista abre produto Processo e seleciona itens do Pedido
3. Processo chama saldoEngine.transferir() → debita quantidade_atual do PedidoItem
4. ProcessoItem e criado com pedido_item_id apontando para o PedidoItem
5. Status do Pedido muda automaticamente para 'transferencia'
6. Quando todos os itens tem quantidade_atual == 0, status muda para 'consolidado'
```

### Regras de Fronteira

| Regra | Descricao |
|-------|-----------|
| **Pedido funciona standalone** | O produto Pedido nao depende do Processo para existir |
| **Quem debita e o Processo** | O Pedido nunca cria ProcessoItem — so o Processo faz isso |
| **Rastreabilidade bidirecional** | `ProcessoItem.pedido_item_id` permite rastrear de onde veio o item |
| **Sem dependencia circular** | Pedido nao importa codigo do Processo; comunicacao via REST/saldoEngine |
| **Single Source of Truth** | `fragment.prisma` em processos-core e a unica fonte de verdade para ambos |

### Cenarios Suportados

| Cenario | Como Funciona |
|---------|--------------|
| **Embarque parcial** | Pedido com 1000 UN → Processo A recebe 600, Processo B recebe 400. Saldo: 0 |
| **Backorder** | Pedido com 1000 UN → Processo A recebe 700. Saldo: 300 (disponivel para proximo embarque) |
| **Consolidacao** | Pedido X (500 UN) + Pedido Y (300 UN) → Processo A recebe itens de ambos |
| **Cancelamento parcial** | 200 UN canceladas via saldoEngine.cancelar(). Irreversivel. Saldo ajustado. |

---

## 11. Mapa de Reuso

### Servicos Gravity Reutilizados

| Servico | Porta | Uso no Pedido |
|---------|-------|---------------|
| Configurador | 8003 | Auth Clerk, JWT, permissoes, workspace |
| Atividades | 8012 | Log de todas as acoes (CRUD pedidos) |
| Notificacoes | 8013 | Alertas in-app |
| Historico | 8014 | Audit trail de alteracoes |
| API Cockpit | 8020 | Tokens de API, playground, webhooks |
| Conector ERP | 8021 | Integracao SAP/ERP para importacao de POs |

### Componentes nucleo-global Reutilizados

| Componente | Uso |
|-----------|-----|
| PaginaGlobal | Layout base (modo lista + formulario) |
| CabecalhoGlobal | Header com icone, titulo e subtitulo |
| TabelaVirtualGlobal | Grid hierarquico virtualizado (Pedido pai, PedidoItem filho, ate 1M linhas) |
| StatusBadgeGlobal | Badge colorido de status (Draft, Aberto, etc.) |
| CardBasicoGlobal | Cards de KPI (total pedidos, valor, quantidade) |
| BotaoGlobal | Acoes (Novo, Importar, Exportar, Salvar) |
| TooltipGlobal | Tooltips descritivos em todas as colunas |

### O que e criado do zero

| Componente/Engine | Justificativa |
|-------------------|-------------|
| saldoEngine | Matematica de saldo imutavel — core do Balance Tracking |
| importEngine | Parser multi-formato com mapeamento automatico de colunas COMEX |

---

## 12. Estimativas de Complexidade

### Por Funcionalidade

| Funcionalidade | Tamanho | Justificativa |
|---------------|---------|-------------|
| Lista de Pedidos (grid hierarquico) | G | TabelaVirtualGlobal — 99 col. pai (14 visiveis por padrao, 85 ocultaveis), 165 col. filho (6 visiveis por padrao, 159 ocultaveis). Scroll virtual, resize, overlay de edicao |
| Formulario Novo/Editar | M | 14 campos header + secao de itens dinamica |
| Importacao de Arquivo | M | Upload drag-and-drop, preview, confirmacao batch |
| saldoEngine | G | Operacoes atomicas, anti-sobre-execucao, atualizacao automatica de status |
| importEngine | M | 5 parsers, mapeamento automatico, agrupamento inteligente |
| CRUD Pedido API (12 endpoints) | M | CRUD padrao com validacao Zod + transacoes |
| Importacao/Exportacao API (3 endpoints) | P | Upload base64, batch create, CSV export |
| Integracao ERP (via API Cockpit) | P | Reuso do Conector ERP existente |

### Por Tela

| Tela | Complexidade |
|------|-------------|
| ListaPedidos | G |
| NovoPedido | M |
| ImportarArquivo | M |

### Estimativa Total MVP

| Categoria | Complexidade | Estimativa |
|-----------|-------------|-----------|
| Backend (routes + engines) | G | 1 semana (ja implementado) |
| Frontend (3 telas) | M | 1 semana (ja implementado) |
| Integracoes tenant | P | 2-3 dias |
| Testes | M | 3-5 dias |
| **TOTAL MVP** | **G** | **2-3 semanas** |

---

## 13. UI Avancado — TabelaVirtualGlobal

### 13.1 Truncamento + Tooltip Nativo

Todas as celulas usam `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` via `.gtv-celula`.

O atributo `title` e adicionado automaticamente:
- **Texto plano:** `title={String(valor)}` — tooltip nativo do browser mostra o valor completo ao hover
- **Render customizado (badge, etc.):** `title="Clique para editar"` quando editavel
- Custo de performance: **zero** — atributo HTML nativo, sem biblioteca

### 13.2 Resize Handle

Arrastar a borda direita de qualquer cabecalho para redimensionar a coluna.

| Acao | Comportamento |
|------|-------------|
| Arrastar handle | Redimensiona a coluna em tempo real (throttle com `requestAnimationFrame`) |
| Soltar | Salva largura em `GTPreferencias.larguras` via `onSalvarPreferencias` |
| Duplo clique | Reseta para largura padrao da coluna (remove do mapa de larguras) |
| Largura minima | 60px (bloqueio no drag) |

**Implementacao:** `onMouseDown` no handle → `document.addEventListener('mousemove')` com RAF → `onMouseUp` persiste. Cursor `col-resize` no container inteiro durante o drag (`gtv-container--resizing`).

**Performance com 1M linhas / 50 colunas:** O drag atualiza apenas o estado `larguraColunas` (um Record). O re-render recalcula `larguraTotalColunas` e `styleTh` / `styleCelula`. Como o virtualizador so renderiza ~20-40 linhas visíveis, o custo de re-render por RAF-frame e desprezivel.

### 13.3 Overlay de Edicao

Quando o usuario clica em uma celula editavel, um input flutuante e exibido com largura fixa, independente da largura da coluna.

| Propriedade | Valor |
|-------------|-------|
| Largura | `min(480px, 90vw)` |
| Posicao | `position: fixed` no canto superior da celula clicada (`getBoundingClientRect()`) |
| Z-index | 9999 (acima de tudo) |
| Fechar | Enter (confirmar), Escape (cancelar), blur (confirmar) |
| Backdrop | `position: fixed; inset: 0` transparente — clique fora confirma a edicao |

**Por que overlay em vez de input inline?** Colunas estreitas (60-100px) tornam impraticavel digitar valores longos dentro da celula. O overlay expande o campo de entrada sem alterar a largura da coluna.

**Celula durante edicao:** Mostra o valor atual com opacidade 0.45 e outline accent (`gtv-celula--editando-overlay`) para indicar que a edicao esta ativa.

### 13.4 Painel de Colunas (GTVisibilidadeColunas)

| Funcionalidade | Detalhe |
|---------------|---------|
| Scroll | `max-height: min(70vh, 520px); overflow-y: auto` |
| Busca | Input "Localizar coluna..." com filtro em tempo real |
| Ordenacao | Alfabetica automatica (`localeCompare('pt-BR')`) |
| Selecionar tudo | Marca todas as 99 + 165 colunas como visiveis |
| Restaurar padrao | Volta para colunas padrao (14 pai + 6 filho) |
| Drag & drop | Reordenar colunas visiveis |

---

## 14. Variaveis de Ambiente

```bash
# processos-core (backend compartilhado)
PORT=8026
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/tenant_db
INTERNAL_SERVICE_KEY=dev-key

# Tenant Services
ATIVIDADES_SERVICE_URL=http://localhost:8012
NOTIFICACOES_SERVICE_URL=http://localhost:8013
HISTORICO_SERVICE_URL=http://localhost:8014
API_COCKPIT_SERVICE_URL=http://localhost:8020
CONECTOR_ERP_SERVICE_URL=http://localhost:8021

# Application URLs
APP_URL=http://localhost:5180
CLIENT_URL=http://localhost:5180
```
