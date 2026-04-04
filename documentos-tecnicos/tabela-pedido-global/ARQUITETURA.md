# Arquitetura Tecnica — TabelaVirtualGlobal e TabelaPedidos

> **Versao:** 1.0
> **Data:** 02/04/2026
> **Escopo:** nucleo-global/Tabelas/tabela-virtual-global + produto/pedido/client/src/componentes
> **Agente:** Tech Lead (Dream Team de Tecnologia)
> **Status da Etapa 1:** Diagnostico e Arquitetura — CONCLUIDA

---

## 1. Contexto e Objetivo

O produto Pedido precisa de uma tabela de alta performance capaz de exibir centenas de milhares de linhas hierarquicas (Processo → Pedido → Item) sem degradacao perceptivel de performance.

A solucao se divide em dois artefatos:

- **TabelaVirtualGlobal** — componente generico, puro, sem estado de servidor, publicado em `nucleo-global/Tabelas/tabela-virtual-global/`. Qualquer produto do ecossistema Gravity pode reutiliza-lo.
- **TabelaPedidos** — wrapper especifico do produto Pedido, em `produto/pedido/client/src/componentes/`. Configura colunas, acoes e fluxos de negocio proprios do modulo.

A separacao respeita a regra do nucleo-global: **componentes genericos nao chamam API, nao possuem estado de servidor, nao conhecem regras de negocio de produto**.

---

## 2. Stack e Dependencias

### 2.1 Dependencia Nova

| Pacote | Versao | Justificativa |
|--------|--------|---------------|
| `@tanstack/react-virtual` | `^3.13` | Virtualizacao de linhas DOM — unica dependencia nova |

**IMPORTANTE:** `@tanstack/react-table` NAO e adicionado. O projeto possui padrao proprio de colunas (GTColuna) e adicionar uma segunda API de colunas criaria fragmentacao de conhecimento no ecossistema.

### 2.2 Stack Existente Reutilizada

| Tecnologia | Uso no Componente |
|------------|------------------|
| React 19 | Base de componentes |
| TypeScript strict | Tipagem sem `any`, sem `@ts-ignore` |
| ESModules | `import`/`export` em todos os arquivos |
| Zod | Validacao de cursor, inputs e schemas de API |
| Vitest | Testes unitarios e funcionais |
| Playwright | Testes E2E dos fluxos criticos |
| @phosphor-icons/react | Icones de estado nas linhas |
| CSS Variables (Solid Slate) | Todas as cores via `var(--token)` |
| i18next | Todos os labels externalizados |
| Prisma + PostgreSQL | Novos models do modulo |
| Express + Node.js | Novos endpoints no processos-core |

---

## 3. Decisoes Arquiteturais

Cada decisao registra a alternativa rejeitada e o motivo da escolha.

### 3.1 TanStack Virtual ONLY (nao Table)

**Decisao:** Usar apenas `@tanstack/react-virtual` para virtualizacao do DOM. Nao usar `@tanstack/react-table`.

**Motivo:** O projeto ja possui padrao de colunas `GTColuna<T>` estabelecido em `TabelaCamadasGlobal`. Adicionar `@tanstack/react-table` criaria duas APIs de colunas incompativeis no mesmo monorepo, exigindo que desenvolvedores aprendam dois sistemas. A virtualizacao e o unico problema que o TanStack Virtual resolve — e o unico que precisamos.

### 3.2 Componente Generico Recebe Dados por Props (nao Faz Fetch)

**Decisao:** `TabelaVirtualGlobal` recebe `dados: T[]` e callbacks. Nunca chama `fetch` ou importa servi cos.

**Motivo:** Regra do nucleo-global. Componentes genericos devem ser puros, testados com mocks, sem acoplamento a endpoints. O `TabelaPedidos` (wrapper) e responsavel por buscar dados e repassar via props.

### 3.3 Cursor-Based Pagination (Keyset) para Modulos Novos

**Decisao:** Novos endpoints de listagem usam paginacao por cursor (keyset), nao por OFFSET.

**Motivo:** `OFFSET` em 1 milhao de linhas gera latencia de ~800ms porque o banco precisa contar e pular registros. Keyset com indice composto `(tenant_id, created_at DESC, id DESC)` mantem latencia em ~5ms independente do volume. Endpoints existentes que ja usam OFFSET sao suportados via prop `modo: 'offset'`.

### 3.4 Modo Dual: cursor | offset

**Decisao:** Prop `modo: 'cursor' | 'offset'` no componente generico.

**Motivo:** Nem todos os endpoints do ecossistema foram migrados para cursor. O modo dual permite adotar o componente imediatamente em telas que ainda usam OFFSET, sem bloquear o roadmap de migracao.

### 3.5 GIN Index + Expression Indexes para Colunas Customizadas

**Decisao:** Colunas customizadas armazenadas em JSONB com GIN index cobrindo texto/select; expression index automatico (`CREATE INDEX CONCURRENTLY`) para colunas de tipo numero/data.

**Motivo:** JSONB sem indice gera full-table-scan em filtros. GIN cobre igualdade e containment em texto/select. Expression index extrai o valor numerico/data do JSONB e cria um indice de arvore B sobre ele, permitindo filtros de intervalo (`> 100`, `BETWEEN`) em <80ms.

### 3.6 Float para Decimal em Campos Financeiros e Quantidades

**Decisao:** Todos os campos `Float` existentes em `Pedido` e `PedidoItem` que representam dinheiro ou quantidade serao migrados para `Decimal @db.Decimal(18,6)`.

**Motivo:** `Float` (IEEE 754) possui erro de ponto flutuante. `0.1 + 0.2 !== 0.3` em JavaScript e em PostgreSQL `double precision`. Para COMEX (valores em USD, EUR, quantidades em toneladas), o erro acumulado em milhares de operacoes e inaceitavel. `Decimal(18,6)` garante precisao exata com 6 casas fracionarias.

### 3.7 Preferencias de Usuario no Banco, nao localStorage

**Decisao:** Ordem e visibilidade de colunas por usuario sao persistidas em `PedidoPreferenciaUsuario` no banco de dados.

**Motivo:** `localStorage` e especifico por dispositivo e por navegador. Um analista que alterna entre computador e notebook perderia suas preferencias. O banco garante consistencia multi-device.

### 3.8 Limites por Tenant: 30 Colunas Customizadas, 5 com Expression Index

**Decisao:** Um tenant nao pode criar mais de 30 colunas customizadas no total. Maximo de 5 dessas colunas podem ter expression index (tipo numero ou data).

**Motivo:** Expression indexes consomem espaco em disco e aumentam o tempo de escrita (INSERT/UPDATE). 5 indexes por tenant e o limite que mantem performance de escrita aceitavel. 30 colunas customizadas e suficiente para qualquer operacao COMEX e evita que o JSONB fique desordenado.

### 3.9 Set para Selecao em Massa

**Decisao:** Estado de selecao armazenado em `Set<string>` (IDs), nao em array.

**Motivo:** Verificar se um item esta selecionado em `Array.includes()` e O(n). Em `Set.has()` e O(1). Com selecao de 10k itens, a diferenca e perceptivel em cada render de linha.

### 3.10 Altura de Linha Fixa

**Decisao:** Linha pai tem `44px`, linha filha tem `36px`. Valores configurados via props mas com defaults fixos.

**Motivo:** TanStack Virtual exige altura previsivel para calcular o viewport virtual corretamente. Altura dinamica (baseada em conteudo) exige medicao com `ResizeObserver` e re-calculo de offsets, adicionando complexidade sem beneficio real para tabelas de dados tabulares.

### 3.11 Lazy Load de Filhos

**Decisao:** Filhos (PedidoItem) so sao buscados quando o usuario expande a linha pai. Nunca sao pre-carregados.

**Motivo:** Pre-carregar todos os filhos de 10k pedidos resultaria em N+1 queries ou um payload gigante. Lazy load mantem o payload inicial minimo e distribui a carga conforme o usuario navega.

### 3.12 Hierarquia Maxima de 3 Niveis

**Decisao:** A estrutura hierarquica suporta no maximo: Processo (avo) → Pedido (pai) → Item (filho).

**Motivo:** Hierarquias mais profundas aumentam a complexidade de renderizacao, selecao em massa e acoes em lote sem proporcionar valor para o caso de uso COMEX. Niveis adicionais podem ser introduzidos em versoes futuras se o negocio exigir.

### 3.13 Padrao Preview para Acoes Criticas

**Decisao:** Acoes Transferir, Consolidar e Autorizar Embarque seguem o fluxo `preview → confirmar` com dois endpoints distintos.

**Motivo:** Essas acoes modificam saldo de forma irreversivel (ou semi-irreversivel). O preview permite ao usuario revisar exatamente o que sera alterado antes de confirmar, reduzindo erros operacionais. O padrao tambem facilita auditoria: o log registra tanto o preview quanto a confirmacao.

### 3.14 Expression Index com UUID da Coluna, Nunca Nome Digitado

**Decisao:** O nome do expression index usa o UUID da coluna (`idx_pedido_custom_{coluna_uuid_sem_hifens}`), nunca o nome digitado pelo usuario.

**Motivo:** DDL injection prevention. Se o nome do index fosse construido com o nome digitado pelo usuario (`idx_pedido_custom_meu_campo`), um usuario malicioso poderia inserir SQL no nome da coluna e executar DDL arbitrario. UUIDs sao gerados pelo sistema e nao contem caracteres especiais.

### 3.15 Batch Sincrono em Chunks de 100 IDs

**Decisao:** Edicao em massa processa IDs em chunks de 100, sincronamente, sem sistema de filas.

**Motivo:** Sistemas de filas (Bull, BullMQ) adicionam dependencia de Redis e complexidade operacional. Para o volume atual do MVP, processar 100 IDs por vez em transacao atomica e suficiente (≤500ms por chunk). Quando o volume exigir, a migracao para filas e transparente — a API externa nao muda.

---

## 4. Estrutura de Pastas Completa

```
nucleo-global/Tabelas/tabela-virtual-global/
├── package.json                        — @nucleo/tabela-virtual-global
└── src/
    ├── GravityTable.tsx                — componente principal, expoe props publicas
    ├── tipos.ts                        — interfaces publicas exportadas
    ├── gravity-table.css               — prefixo .gt-, tokens via var()
    ├── index.ts                        — re-exporta GravityTable e tipos publicos
    ├── componentes/
    │   ├── GravityTableVirtual.tsx     — corpo virtualizado usando TanStack Virtual
    │   ├── GravityTableHead.tsx        — cabecalho fixo (sticky) com ordenacao
    │   ├── GravityTableRow.tsx         — linha pai/filho/neto com edit inline e expand
    │   ├── GravityTableToolbar.tsx     — busca, filtros, gerenciar colunas, export, acoes
    │   ├── GravityTableBatchBar.tsx    — barra flutuante de selecao em massa
    │   ├── GravityTableSkeleton.tsx    — loading state com shimmer
    │   └── GravityTableEmpty.tsx       — empty state configuravel
    └── hooks/
        ├── useGravityTableSort.ts      — estado de ordenacao, toggle asc/desc
        ├── useGravityTableFilter.ts    — filtros ativos + busca + debounce 300ms
        ├── useGravityTableSelect.ts    — Set<string> para selecao O(1)
        └── useGravityTableEdit.ts      — editar inline + rollback otimista

produto/pedido/client/src/componentes/
├── TabelaPedidos.tsx                   — wrapper principal, busca dados, configura GravityTable
├── toolbar/
│   ├── ToolbarPedidos.tsx              — acoes especificas de pedido (Novo, Importar)
│   └── ImportarModal.tsx               — upload multi-formato + preview + hook onSmartReadResult
├── status/
│   ├── AbasPorStatus.tsx               — gera abas dinamicamente a partir dos status do tenant
│   └── GerenciarStatus.tsx             — CRUD de status (nome, cor hex, icone, ordem drag)
├── colunas/
│   ├── CriarColunaModal.tsx            — wizard de criacao de coluna customizada
│   └── ConfigurarColunaModal.tsx       — editar tipo, casas decimais, opcoes de select
├── acoes/
│   ├── CheckoutModal.tsx               — modal base de preview → confirmar
    ├── TransferirFlow.tsx              — fluxo Transferir (usa CheckoutModal)
│   ├── ConsolidarFlow.tsx              — fluxo Consolidar (usa CheckoutModal)
│   └── EdicaoEmMassaModal.tsx          — selecionar campos + valores + preview + confirmar
└── celulas/
    └── CelulaDecimal.tsx               — renderiza Decimal com casas configuradas por coluna
```

---

## 5. Interface Publica do Componente (TypeScript)

```typescript
// tipos.ts — exportado por @nucleo/tabela-virtual-global

/** Definicao de uma coluna */
export interface GTColuna<T> {
  id: string
  cabecalho: string
  acessor: keyof T | ((item: T) => React.ReactNode)
  ordenavel?: boolean
  filtravel?: boolean
  largura?: number           // px, default auto
  larguraMin?: number        // px
  larguraMax?: number        // px
  alinhamento?: 'left' | 'center' | 'right'
  renderizar?: (valor: unknown, item: T) => React.ReactNode
}

/** Acao de linha individual */
export interface GTAcao<T> {
  id: string
  label: string
  icone?: React.ReactNode
  executar: (item: T) => void | Promise<void>
  desabilitado?: (item: T) => boolean
  oculto?: (item: T) => boolean
  variante?: 'default' | 'destructive'
}

/** Acao em lote (batch) */
export interface GTAcaoLote<T> {
  id: string
  label: string
  icone?: React.ReactNode
  executar: (itens: T[]) => void | Promise<void>
  desabilitado?: (itens: T[]) => boolean
}

/** Acao de exportacao */
export interface GTAcaoExport<T> {
  id: string
  label: string
  icone?: React.ReactNode
  executar: (itens: T[]) => void | Promise<void>
}

/** Configuracao de filtro por coluna */
export interface GTFiltroConfig<T> {
  campo: keyof T & string
  tipo: 'texto' | 'numero' | 'data' | 'select' | 'booleano'
  opcoes?: { label: string; valor: string }[]  // para tipo select
}

/** Estado dos filtros ativos (passado nos callbacks) */
export interface GTFiltrosAtivos {
  [campo: string]: string | number | boolean | null
}

/** Props principais do componente */
export interface GravityTableProps<T, C = T> {
  // --- Dados ---
  dados: T[]
  colunas: GTColuna<T>[]

  // --- Paginacao ---
  modo?: 'cursor' | 'offset'
  cursor?: string                              // proximo cursor (modo cursor)
  temMais?: boolean
  carregandoMais?: boolean
  onCarregarMais?: () => void

  // --- Hierarquia ---
  onCarregarFilhos?: (item: T) => Promise<C[]>
  colunasFilhas?: GTColuna<C>[]
  acoesFilhas?: GTAcao<C>[]
  expandidosPadrao?: string[]                  // IDs de linhas pre-expandidas

  // --- Acoes ---
  acoes?: GTAcao<T>[]                          // menu de linha (pai)
  acoesLote?: GTAcaoLote<T>[]                  // barra de selecao em massa
  acoesExportacao?: GTAcaoExport<T>[]          // dropdown de exportacao
  acoesBarra?: React.ReactNode                 // slot livre no toolbar (ex: botao Novo)

  // --- Busca e Filtros ---
  filtros?: GTFiltroConfig<T>[]
  placeholderBusca?: string
  onBuscar?: (termo: string) => void           // chamado apos debounce 300ms
  onFiltrar?: (filtros: GTFiltrosAtivos) => void
  onOrdenar?: (campo: string, dir: 'asc' | 'desc') => void

  // --- Edicao Inline ---
  camposEditaveis?: (keyof T & string)[]
  onEditar?: (id: string, campo: string, valor: unknown) => Promise<T>

  // --- Estado Visual ---
  carregando?: boolean
  emptyIcon?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode

  // --- Performance ---
  rowHeight?: number                           // default 44
  childRowHeight?: number                      // default 36
  overscan?: number                            // default 5 (linhas fora do viewport pre-renderizadas)
  itensPorPagina?: number                      // default 50

  // --- Selecao ---
  onSelecao?: (itens: T[]) => void

  // --- Acessibilidade ---
  itemId?: (item: T) => string                 // extrai ID do item (default: item.id)
  id?: string                                  // id do elemento table para aria-controls
  ariaLabel?: string                           // aria-label da tabela
}
```

---

## 6. Schema Prisma — Novos Models (fragment.prisma do Pedido)

Os models abaixo sao adicionados ao `fragment.prisma` do produto Pedido em `servicos-global/tenant/processos-core/prisma/`.

### 6.1 PedidoStatus

Status criados e gerenciados pelo proprio tenant. Substituem o campo `status String` fixo existente.

```prisma
model PedidoStatus {
  id         String  @id @default(cuid())
  tenant_id  String
  product_id String?

  nome       String
  cor        String                      // hex, ex: "#22c55e"
  icone      String?                     // nome do icone Phosphor, ex: "CheckCircle"
  ordem      Int     @default(0)
  is_default Boolean @default(false)

  created_at DateTime @default(now())

  @@unique([tenant_id, nome])
  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@map("pedido_status")
}
```

Status iniciais provisionados para cada tenant na criacao do workspace:

| Nome | Cor | Icone | is_default |
|------|-----|-------|-----------|
| Pedido Criado | `#64748b` | `File` | true |
| Aguardando Data Prev. Pedido Pronto | `#f59e0b` | `Clock` | false |
| Pedido Pronto | `#3b82f6` | `CheckSquare` | false |
| Pedido Transferido | `#8b5cf6` | `ArrowsLeftRight` | false |
| Pedido Consolidado | `#22c55e` | `Seal` | false |

### 6.2 PedidoColuna

Colunas customizadas criadas pelo tenant para adicionar campos especificos ao negocio.

```prisma
model PedidoColuna {
  id         String  @id @default(cuid())
  tenant_id  String
  product_id String?

  nome             String
  tipo             String                // 'texto' | 'numero' | 'data' | 'select' | 'booleano'
  casas_decimais   Int?                  // para tipo numero
  opcoes           Json?                 // para tipo select: string[] com max 50 itens
  ordem            Int     @default(0)
  filtravel        Boolean @default(true)
  index_criado     Boolean @default(false) // true quando expression index estiver pronto
  exibida_padrao   Boolean @default(true)

  created_at DateTime @default(now())

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@map("pedido_colunas")
}
```

### 6.3 PedidoPreferenciaUsuario

Preferencias pessoais de visibilidade e ordem de colunas por usuario. Funciona across devices.

```prisma
model PedidoPreferenciaUsuario {
  id        String @id @default(cuid())
  tenant_id String
  user_id   String                       // Clerk user ID

  colunas_ordem    String[]              // lista ordenada de column IDs
  colunas_visiveis String[]              // subset de colunas_ordem que estao visiveis

  updated_at DateTime @updatedAt

  @@unique([tenant_id, user_id])
  @@index([tenant_id])
  @@map("pedido_preferencias_usuario")
}
```

### 6.4 PedidoPreferenciaPadrao

Padrao de colunas definido pelo admin do workspace. Novos usuarios herdam este padrao.

```prisma
model PedidoPreferenciaPadrao {
  id           String  @id @default(cuid())
  tenant_id    String
  workspace_id String?                   // null = padrao global do tenant

  colunas_ordem    String[]
  colunas_visiveis String[]

  updated_at DateTime @updatedAt

  @@unique([tenant_id, workspace_id])
  @@index([tenant_id])
  @@map("pedido_preferencias_padrao")
}
```

### 6.5 Alteracoes em Models Existentes

**Pedido** — adicionar campo de dados customizados e migrar Float para Decimal:

```prisma
// Campo novo
campos_custom Json? @default("{}")

// Campos Float → Decimal (todos os campos numericos de valor e quantidade)
valor_total_pedido          Decimal? @db.Decimal(18,6)
quantidade_total_pedido     Decimal? @db.Decimal(18,6)
valor_total_cambio          Decimal? @db.Decimal(18,6)
taxa_cambio_estimada        Decimal? @db.Decimal(18,6)
```

**PedidoItem** — adicionar campo de dados customizados e migrar Float para Decimal:

```prisma
// Campo novo
campos_custom Json? @default("{}")

// Campos Float → Decimal
quantidade_inicial        Decimal @db.Decimal(18,6)
quantidade_atual          Decimal @db.Decimal(18,6)
quantidade_pronta         Decimal @default(0) @db.Decimal(18,6)
quantidade_transferida    Decimal @default(0) @db.Decimal(18,6)
quantidade_cancelada      Decimal @default(0) @db.Decimal(18,6)
valor_item                Decimal? @db.Decimal(18,6)
valor_unitario            Decimal? @db.Decimal(18,6)
```

---

## 7. Indices do Banco (SQL)

Todos os indices sao criados em migration SQL separada para controle de versao. Indices de performance usam `CREATE INDEX CONCURRENTLY` para nao bloquear escrita em producao.

### 7.1 Indices de Cursor (Keyset Pagination)

```sql
-- 1. Listagem principal de pedidos
CREATE INDEX CONCURRENTLY idx_pedido_cursor
  ON pedidos_comerciais (tenant_id, created_at DESC, id DESC);

-- 2. Listagem filtrada por status (aba de status)
CREATE INDEX CONCURRENTLY idx_pedido_status_cursor
  ON pedidos_comerciais (tenant_id, status, created_at DESC, id DESC);

-- 3. Listagem filtrada por moeda
CREATE INDEX CONCURRENTLY idx_pedido_moeda_cursor
  ON pedidos_comerciais (tenant_id, moeda_pedido, created_at DESC, id DESC);

-- 4. Pedidos de um processo especifico (lazy load de vinculos)
CREATE INDEX CONCURRENTLY idx_pedido_processo_cursor
  ON pedidos_comerciais (tenant_id, processo_id, created_at DESC, id DESC)
  WHERE processo_id IS NOT NULL;

-- 5. Itens de um pedido (lazy load de filhos)
CREATE INDEX CONCURRENTLY idx_pedido_item_cursor
  ON pedido_itens (tenant_id, pedido_id, sequencia_item ASC);
```

### 7.2 Indices de Busca Full-Text

```sql
-- 6. Busca em numero_pedido e exportador_nome via pg_trgm
-- Requer: CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY idx_pedido_search_gin
  ON pedidos_comerciais
  USING gin ((numero_pedido || ' ' || COALESCE(exportador_nome, '')) gin_trgm_ops);
```

### 7.3 Indices em JSONB (Colunas Customizadas)

```sql
-- 7. GIN em campos_custom de pedidos (cobre texto e select)
CREATE INDEX CONCURRENTLY idx_pedido_custom_gin
  ON pedidos_comerciais
  USING gin (campos_custom);

-- 8. GIN em campos_custom de itens
CREATE INDEX CONCURRENTLY idx_pedido_item_custom_gin
  ON pedido_itens
  USING gin (campos_custom);
```

### 7.4 Expression Indexes Automaticos (Colunas Numero e Data)

Criados assincronamente quando usuario cria coluna customizada do tipo `numero` ou `data`. O nome usa o UUID da coluna sem hifens para prevenir DDL injection.

```sql
-- Formato do nome: idx_pedido_custom_{coluna_uuid_sem_hifens}
-- Exemplo para coluna tipo numero com ID "a1b2c3d4-e5f6-...":
CREATE INDEX CONCURRENTLY idx_pedido_custom_a1b2c3d4e5f6...
  ON pedidos_comerciais
  ((campos_custom->>'a1b2c3d4-e5f6-...')::numeric)
  WHERE campos_custom ? 'a1b2c3d4-e5f6-...';

-- Para tipo data:
CREATE INDEX CONCURRENTLY idx_pedido_custom_a1b2c3d4e5f6...
  ON pedidos_comerciais
  ((campos_custom->>'a1b2c3d4-e5f6-...')::date)
  WHERE campos_custom ? 'a1b2c3d4-e5f6-...';
```

Apos criacao, o job interno atualiza `PedidoColuna.index_criado = true`. Limite: 5 expression indexes por tenant.

---

## 8. Contrato da API

Todos os endpoints residem em `servicos-global/tenant/processos-core`. Prefixo base: `/api/v1/pedidos`. Protegidos por `requireInternalKey` + `tenantIsolation`.

### 8.1 Paginacao por Cursor

**Query params para listagem:**

| Param | Tipo | Descricao |
|-------|------|-----------|
| `cursor` | string (base64) | Cursor opaco retornado pelo endpoint |
| `limit` | number | Itens por pagina, max 100, default 50 |
| `sort_field` | string | Campo de ordenacao |
| `sort_dir` | `asc` \| `desc` | Direcao de ordenacao |
| `search` | string | Termo de busca full-text |
| `filter_{campo}` | string | Filtro por campo especifico |

**Estrutura interna do cursor (nunca exposta ao cliente):**

```typescript
interface GTCursor {
  sort_field: string
  sort_value: unknown
  sort_dir: 'asc' | 'desc'
  id: string               // ID do ultimo item retornado (desempate)
}
// Serializado para JSON → base64url → string opaca
```

**Formato de response de listagem:**

```typescript
interface GTListResponse<T> {
  data: T[]
  pagination: {
    next_cursor: string | null
    prev_cursor: string | null
    has_more: boolean
  }
}
```

### 8.2 CRUD Base de Pedido (Existentes — Estendidos)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/pedidos` | Listagem paginada (cursor ou offset) |
| GET | `/api/v1/pedidos/:id` | Detalhe do pedido |
| POST | `/api/v1/pedidos` | Criar pedido com itens |
| PATCH | `/api/v1/pedidos/:id` | Edicao inline de campos — valida permissao antes de aceitar |
| DELETE | `/api/v1/pedidos/:id` | Excluir pedido (somente status Draft) |

### 8.3 CRUD de Itens (Existentes — Estendidos)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/pedidos/:id/itens` | Lazy load de filhos (chamado ao expandir linha) |
| POST | `/api/v1/pedidos/:id/itens` | Criar item |
| PATCH | `/api/v1/pedidos/:id/itens/:itemId` | Editar item |
| DELETE | `/api/v1/pedidos/:id/itens/:itemId` | Excluir item |

### 8.4 Status (Novos)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/pedidos/status` | Listar status do tenant (cache 5min) |
| POST | `/api/v1/pedidos/status` | Criar status |
| PATCH | `/api/v1/pedidos/status/:id` | Editar status |
| DELETE | `/api/v1/pedidos/status/:id` | Excluir status (valida se ha pedidos vinculados) |
| PUT | `/api/v1/pedidos/status/reordenar` | Salvar nova ordem via drag |

### 8.5 Colunas Customizadas (Novos)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/pedidos/colunas` | Listar colunas do tenant (cache 5min) |
| POST | `/api/v1/pedidos/colunas` | Criar coluna — dispara job de expression index se tipo numero/data |
| PATCH | `/api/v1/pedidos/colunas/:id` | Editar coluna |
| DELETE | `/api/v1/pedidos/colunas/:id` | Remover coluna + seu expression index |

### 8.6 Preferencias do Usuario (Novos)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/pedidos/preferencias` | Preferencias do usuario logado (fallback para padrao do workspace) |
| PUT | `/api/v1/pedidos/preferencias` | Salvar ordem e visibilidade de colunas |
| GET | `/api/v1/pedidos/preferencias/padrao` | Padrao definido pelo admin do workspace |
| PUT | `/api/v1/pedidos/preferencias/padrao` | Admin define padrao do workspace |
| DELETE | `/api/v1/pedidos/preferencias` | Reset das preferencias do usuario para o padrao do workspace |

### 8.7 Fluxos com Checkout (Novos — Padrao Preview → Confirmar)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/pedidos/transferir/preview` | Calcula o que sera transferido sem executar |
| POST | `/api/v1/pedidos/transferir/confirmar` | Executa transferencia apos revisao |
| POST | `/api/v1/pedidos/consolidar/preview` | Calcula consolidacao sem executar |
| POST | `/api/v1/pedidos/consolidar/confirmar` | Executa consolidacao apos revisao |
| POST | `/api/v1/pedidos/autorizar-embarque/preview` | Calcula autorizacao sem executar |
| POST | `/api/v1/pedidos/autorizar-embarque/confirmar` | Executa autorizacao apos revisao |

### 8.8 Edicao em Massa (Novo)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/pedidos/edicao-em-massa/preview` | Simula alteracao nos IDs selecionados |
| POST | `/api/v1/pedidos/edicao-em-massa/confirmar` | Executa batch em chunks de 100 IDs |

### 8.9 Importacao (Novo)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/pedidos/importar/preview` | Upload do arquivo, retorna preview dos dados parseados |
| POST | `/api/v1/pedidos/importar/confirmar` | Cria pedidos em batch apos revisao do usuario |

**Restricoes de importacao:**

| Parametro | Valor |
|-----------|-------|
| Formatos aceitos | `xlsx`, `csv`, `txt`, `json`, `xml` |
| Tamanho maximo | 10 MB |
| Rate limit | 5 req/min por tenant |

### 8.10 Job Interno (Nao Exposto Publicamente)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/internal/criar-expression-index` | Chamado internamente apos criar coluna numerica/data. Protegido por `x-internal-key`. |

### 8.11 Response de Conflito em PATCH (409)

Quando um registro e alterado por outro usuario durante a edicao inline:

```typescript
// HTTP 409 Conflict
{
  error: {
    code: "EDIT_CONFLICT",
    message: "Registro alterado por outro usuario durante a edicao",
    details: {
      server_data: T,              // estado atual do servidor
      conflicting_fields: string[] // campos que divergem
    }
  }
}
```

O frontend exibe o conflito e permite ao usuario decidir entre sobrescrever ou descartar sua alteracao.

---

## 9. SLA de Performance

### 9.1 Metas por Operacao

| Operacao | Meta Total | Query Banco | Garantido por |
|----------|-----------|-------------|--------------|
| Listagem inicial (1M linhas) | ≤ 150ms | ≤ 20ms | Keyset cursor + indice composto |
| Expansao lazy (filhos) | ≤ 200ms | ≤ 60ms | Indice `(tenant_id, pedido_id, sequencia_item)` |
| Edicao inline | 0ms percebido | ≤ 100ms background | Estado otimista no frontend |
| Busca full-text | 300ms debounce + ≤ 100ms query | ≤ 80ms | GIN pg_trgm |
| Filtros combinados | ≤ 150ms total | ≤ 30ms | Indice composto com sort fields |
| DOM simultaneo | ≤ 50 linhas renderizadas | — | TanStack Virtual (44px fixo) |
| Colunas custom texto/select | ≤ 80ms | — | GIN index em JSONB |
| Colunas custom numero/data | ≤ 80ms apos index pronto | — | Expression index automatico |
| Batch edicao em massa | ≤ 500ms por chunk | — | Chunks de 100 IDs em transacao |

### 9.2 Volumes de Benchmark Obrigatorios (Etapa 4)

Os benchmarks devem ser executados com `EXPLAIN ANALYZE` antes de considerar a Etapa 4 concluida:

| Volume | Cenario | Meta |
|--------|---------|------|
| 100k linhas | Listagem + busca + filtro combinado | Dentro do SLA |
| 500k linhas | Listagem + expansao lazy | Dentro do SLA |
| 1M linhas | Listagem inicial + edicao inline | Dentro do SLA |

---

## 10. Seguranca

### 10.1 Validacao de Permissao em PATCH

Antes de aceitar qualquer edicao inline, o endpoint valida a permissao do usuario via Configurador API (`GET /api/v1/permissoes/verificar`). Se o usuario nao possui permissao de edicao no modulo Pedido, retorna 403.

### 10.2 Campos Protegidos em PATCH

O schema Zod de PATCH rejeita com erro 400 qualquer tentativa de alterar:

```typescript
const camposProtegidos = ['tenant_id', 'id', 'created_at', 'quantidade_inicial']
// quantidade_inicial somente quando PedidoColuna.bloquear_quantidade_inicial = true
```

### 10.3 IDOR Prevention em Batch

Antes de processar qualquer batch (edicao em massa, transferir, consolidar), o backend verifica que TODOS os IDs recebidos pertencem ao `tenant_id` do JWT. Se um ID nao pertencer ao tenant, a operacao inteira e rejeitada com 403.

```typescript
const countPertencem = await db.pedido.count({
  where: { id: { in: ids }, tenant_id }
})
if (countPertencem !== ids.length) {
  throw new AppError(403, 'Um ou mais IDs nao pertencem ao tenant')
}
```

### 10.4 Sanitizacao de Busca

Input de busca: `trim()` + max 200 caracteres validado por Zod no backend. A query usa parametro bindado (`$1` no PostgreSQL) — nunca interpolacao de string.

### 10.5 Validacao de Cursor

O cursor e decodificado de base64 e validado por schema Zod antes de ser usado na query. Cursor malformado retorna HTTP 400, nunca HTTP 500.

```typescript
const cursorSchema = z.object({
  sort_field: z.string().max(64),
  sort_value: z.unknown(),
  sort_dir: z.enum(['asc', 'desc']),
  id: z.string().min(1).max(64),
})
```

### 10.6 DDL Injection Prevention

O nome do expression index usa o UUID da coluna sem hifens, gerado pelo sistema. O nome digitado pelo usuario (campo `nome` em `PedidoColuna`) nunca e usado em DDL.

### 10.7 Importacao

- Validacao de tipo MIME via magic bytes, nao apenas extensao
- Tamanho maximo de 10MB validado antes de processar
- Rate limit de 5 req/min por tenant em `/importar/*`
- Nenhum dado do arquivo e executado como codigo

### 10.8 Regras Gerais

| Regra | Descricao |
|-------|-----------|
| `tenant_id` do JWT | Nunca aceitar `tenant_id` do body da requisicao |
| Rate limit geral | 100 req/min por tenant em todos os endpoints |
| RLS ativo | Row Level Security habilitado em todas as tabelas novas |
| Sem `console.log` sensivel | Nunca logar `tenant_id`, valores financeiros ou dados do usuario |
| Erros via AppError | Nunca `res.status().json()` direto |

---

## 11. Acessibilidade (WCAG 2.1 AA)

### 11.1 Estrutura Semantica da Tabela

```html
<table role="grid" aria-label={ariaLabel} aria-rowcount={totalLinhas}>
  <caption class="gt-sr-only">Descricao da tabela para leitores de tela</caption>
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">Numero do Pedido</th>
      <!-- aria-sort: "none" | "ascending" | "descending" -->
    </tr>
  </thead>
  <tbody>
    <tr aria-rowindex={indice}>
      <td>...</td>
    </tr>
  </tbody>
</table>
```

### 11.2 Linhas Expandiveis

```html
<button
  aria-expanded={expandido}
  aria-controls={`gt-filhos-${item.id}`}
  aria-label={`Expandir itens do pedido ${item.numero}`}
>
  <CaretDown />
</button>

<tbody id={`gt-filhos-${item.id}`} aria-hidden={!expandido}>
  <!-- linhas filhas -->
</tbody>
```

### 11.3 Checkboxes de Selecao

```html
<input
  type="checkbox"
  aria-label={`Selecionar pedido ${item.numero}`}
  checked={selecionado}
/>
<!-- Checkbox de selecionar todos: -->
<input
  type="checkbox"
  aria-label="Selecionar todos os pedidos"
  aria-checked={parcialmenteSelecionado ? 'mixed' : todosSelecionados}
/>
```

### 11.4 Navegacao por Teclado

| Tecla | Acao |
|-------|------|
| `Tab` / `Shift+Tab` | Navegar entre celulas editaveis e botoes |
| `Enter` / `Space` | Ativar botao ou iniciar edicao de celula |
| `Escape` | Cancelar edicao inline, fechar modal, fechar menu |
| `Arrow Up` / `Arrow Down` | Navegar entre opcoes em dropdowns e menus |
| `Arrow Left` / `Arrow Right` | Navegar entre abas de status |

### 11.5 Contraste Minimo

| Elemento | Ratio minimo |
|----------|-------------|
| Texto normal (< 18px) | 4.5:1 |
| Texto grande (≥ 18px ou negrito ≥ 14px) | 3:1 |
| Icones e elementos graficos | 3:1 |
| Foco visivel | 3:1 contra fundo adjacente |

---

## 12. CSS — Tokens e Prefixos

### 12.1 Prefixos

| Componente | Prefixo CSS |
|------------|-------------|
| TabelaVirtualGlobal | `.gt-` |
| TabelaPedidos (wrapper) | `.pp-` |

### 12.2 Tokens de Cor (sempre via `var()`)

| Seletor | Propriedade | Token |
|---------|-------------|-------|
| `.gt-tabela` | `background` | `var(--bg-base)` |
| `.gt-th` | `background` | `var(--bg-surface)` |
| `.gt-th` | `color` | `var(--text-secondary)` |
| `.gt-tr-pai:hover` | `background` | `var(--accent-dim)` |
| `.gt-tr-filho` | `background` | `var(--bg-body)` |
| `.gt-tr-neto` | `background` | `color-mix(in srgb, var(--bg-body) 90%, black)` |
| `.gt-tr--selecionada` | `background` | `var(--accent-dim)` |
| `.gt-tr--selecionada` | `border-left` | `2px solid var(--accent)` |
| `.gt-tr--editando` | `outline` | `1px solid var(--accent)` |

### 12.3 Icones de Estado por Linha (Phosphor Icons)

| Estado | Icone | Cor |
|--------|-------|-----|
| Item transferido | `ArrowRight` (weight: fill) | `var(--accent)` |
| Item consolidado | `CheckCircle` (weight: fill) | `var(--success)` |
| Item parcialmente transferido | `CircleHalf` (weight: fill) | `var(--warning)` |
| Pedido transferido | `ArrowsLeftRight` (weight: fill) | `var(--accent)` |
| Pedido consolidado | `Seal` (weight: fill) | `var(--success)` |
| Autorizado embarque | `Anchor` (weight: fill) | `#38bdf8` |
| Coluna indexando | Badge de texto com ponto pulsante | `var(--warning)` |

---

## 13. Sistema de Colunas Customizadas

### 13.1 Armazenamento

Dados das colunas customizadas armazenados em JSONB no campo `campos_custom` de `Pedido` e `PedidoItem`.

```json
{
  "a1b2c3d4-e5f6-7890-abcd-ef1234567890": "texto livre aqui",
  "b2c3d4e5-f6a7-8901-bcde-f12345678901": "42.50",
  "c3d4e5f6-a7b8-9012-cdef-123456789012": "2026-04-02"
}
```

Chaves sao os UUIDs de `PedidoColuna.id`. Valores sao sempre strings (para compatibilidade com expression index de extração JSONB).

### 13.2 Tipos Suportados

| Tipo | Armazenamento | Filtro | Index |
|------|---------------|--------|-------|
| `texto` | string | ILIKE + GIN trgm | GIN (jsonb containment) |
| `numero` | string numerica | `::numeric` comparison | Expression index `::numeric` |
| `data` | string ISO 8601 | `::date` comparison | Expression index `::date` |
| `select` | string (valor da opcao) | equality | GIN (jsonb containment) |
| `booleano` | `"true"` ou `"false"` | equality | GIN (jsonb containment) |

### 13.3 Limites por Tenant

| Limite | Valor |
|--------|-------|
| Total de colunas customizadas | 30 |
| Colunas com expression index (tipo numero ou data) | 5 |
| Opcoes por coluna do tipo select | 50 |

### 13.4 Badge de Indexacao

Enquanto `PedidoColuna.index_criado = false`, o cabecalho da coluna exibe um badge visual com texto "indexando..." e animacao pulsante. Filtros por essa coluna ficam desabilitados ate o index estar pronto. O frontend faz polling a cada 10 segundos via `GET /api/v1/pedidos/colunas` ate detectar `index_criado = true`.

---

## 14. Sistema de Preferencias de Usuario

### 14.1 Hierarquia de Preferencias

```
Novo usuario
    → herda PedidoPreferenciaPadrao do workspace
    → pode customizar via PedidoPreferenciaUsuario
    → pode resetar para o padrao via DELETE /preferencias
```

### 14.2 Comportamento de Merge

Quando o admin adiciona uma nova coluna ao padrao do workspace, ela aparece para todos os usuarios que nao a removeram explicitamente.

### 14.3 Salvamento Automatico

Preferencias sao salvas automaticamente via `PUT /api/v1/pedidos/preferencias` sempre que o usuario:
- Reordena colunas via drag-and-drop
- Oculta ou exibe uma coluna via menu de colunas

Debounce de 500ms para evitar multiplas chamadas durante drag.

---

## 15. Sistema de Status

### 15.1 Fluxo de Criacao

O usuario acessa `GerenciarStatus.tsx` (acessivel via botao "Gerenciar Status" no toolbar) e cria status com:
- Nome (obrigatorio, unico por tenant)
- Cor (hex picker — paleta pre-definida + campo livre)
- Icone (picker de icones Phosphor)
- Ordem (definida via drag, salva via `PUT /status/reordenar`)

### 15.2 Abas por Status

`AbasPorStatus.tsx` gera uma aba para cada `PedidoStatus` do tenant, mais a aba fixa "Todos". Ao clicar numa aba, o filtro `filter_status={status.id}` e aplicado na listagem.

### 15.3 Exclusao de Status

Antes de excluir, o backend verifica se ha pedidos com esse status. Se houver, retorna 409 com contagem. O usuario deve migrar os pedidos para outro status antes de excluir.

### 15.4 Caching

Status do tenant sao cacheados em memoria no backend com TTL de 5 minutos:

```typescript
const statusCache = new Map<string, { data: PedidoStatus[]; exp: number }>()
```

Cache invalidado imediatamente ao criar, editar ou remover qualquer status.

---

## 16. Caching

### 16.1 Cache In-Memory no Backend

| Dado | Estrutura | TTL | Invalidacao |
|------|-----------|-----|-------------|
| Status por tenant | `Map<tenantId, {data, exp}>` | 5 minutos | Criar/editar/remover status |
| Colunas customizadas por tenant | `Map<tenantId, {data, exp}>` | 5 minutos | Criar/editar/remover coluna |

### 16.2 Dados de Linha (Nao Cacheados no Servidor)

Linhas da tabela nao sao cacheadas no servidor. A paginacao por cursor ja garante queries eficientes independente do volume.

O frontend pode usar React Query ou SWR para cache local com stale-while-revalidate, mas este padrao e responsabilidade do `TabelaPedidos` (wrapper), nao do `TabelaVirtualGlobal` (generico).

---

## 17. Estrategia de Testes

### 17.1 Matriz de Cobertura

| Tipo | Dataset | Cobertura Minima |
|------|---------|-----------------|
| Unitarios (Vitest) | Mocks em memoria | ≥ 80% (por regra nucleo-global) |
| Funcionais (Vitest + banco real) | ~1k linhas | ≥ 70% |
| E2E (Playwright) | ~500 linhas | Fluxos criticos |
| Benchmark | 100k / 500k / 1M linhas | Manual, Etapa 4 |

### 17.2 Testes Obrigatorios

| Arquivo de Teste | O que Valida |
|-----------------|-------------|
| `saldo-imutavel.test.ts` | `quantidade_inicial` nunca muda apos criacao |
| `transferir-validacao.test.ts` | Nao pode transferir quantidade > `quantidade_atual` |
| `custom-column-types.test.ts` | CRUD de cada tipo de coluna customizada |
| `decimal-precision.test.ts` | Soma de 0.1 + 0.2 retorna 0.3 exato em Decimal |
| `status-tabs.test.ts` | Abas refletem status do tenant corretamente |
| `checkout-flow.test.ts` | Preview retorna dados corretos → confirmar persiste |
| `edicao-em-massa.test.ts` | Batch de 100+ IDs em chunks, rollback em erro |
| `importar-csv.test.ts` | Parsing de CSV com separadores diferentes, agrupamento por numero_pedido |
| `cross-tenant-custom-cols.test.ts` | Colunas de tenant A nunca aparecem para tenant B |

### 17.3 Testes E2E Criticos (Playwright)

| Cenario | Validacao |
|---------|-----------|
| Listagem com 500 linhas | Virtualizer renderiza ≤ 50 DOM nodes |
| Expandir linha pai | Filhos carregados via lazy load sem erro |
| Edicao inline com conflito | Modal de conflito aparece, usuario pode sobrescrever |
| Fluxo Transferir completo | Preview → Confirmar → status muda |
| Importar CSV | Upload → preview com dados corretos → confirmar → linhas na tabela |
| Criar coluna numero | Badge "indexando..." → desaparece → filtro habilitado |

---

## 18. Smart Read (Integracao Futura)

Smart Read e um produto legado sendo integrado ao Gravity na Fase 2. Le documentos (PDFs, imagens) e extrai dados automaticamente para criar pedidos.

### 18.1 Ponto de Integracao

O botao "Smart Read" e exibido em `ImportarModal.tsx` com status visual "Em breve" (desabilitado, tooltip explicativo). Quando a integracao for ativada, o botao dispara o flow do Smart Read sem nenhuma mudanca estrutural no componente.

### 18.2 Hook Preparado

```typescript
// ImportarModal.tsx
interface ImportarModalProps {
  // ... props existentes ...
  onSmartReadResult?: (dados: Partial<Pedido>[]) => void  // hook preparado
}
```

Quando o Smart Read retornar dados, o modal exibe os pedidos pre-preenchidos no mesmo preview usado pela importacao de arquivo. Zero retrabalho.

---

## 19. Fluxo de Implementacao por Etapas

### Etapa 1 — Diagnostico e Arquitetura

**Status:** CONCLUIDA

Entregaveis:
- Decisoes arquiteturais documentadas (Secao 3)
- Estrutura de pastas definida (Secao 4)
- Interfaces TypeScript publicas (Secao 5)
- Schema Prisma de novos models (Secao 6)
- Indices SQL (Secao 7)
- Contrato completo de API (Secao 8)

### Etapa 2 — Backend e Banco

**Prerequisito:** Aprovacao do Coordenador na Etapa 1.

Entregaveis:
- Migration SQL com novos models e indices
- Endpoints de status, colunas, preferencias (Secao 8.4 a 8.6)
- Endpoints de checkout (Secao 8.7)
- Endpoint de edicao em massa (Secao 8.8)
- Endpoint de importacao refatorado com preview (Secao 8.9)
- Job interno de expression index (Secao 8.10)
- Cache in-memory de status e colunas (Secao 16)

**Checkpoint 2:** Todos os endpoints testados com `EXPLAIN ANALYZE`. Queries dentro do SLA.

### Etapa 3 — Frontend

**Prerequisito:** Checkpoint 2 aprovado.

Entregaveis:
- `TabelaVirtualGlobal` completo com todos os componentes e hooks (Secao 4)
- `TabelaPedidos` completo com todos os componentes de wrapper (Secao 4)
- `AbasPorStatus.tsx` e `GerenciarStatus.tsx`
- `CriarColunaModal.tsx` e `ConfigurarColunaModal.tsx`
- `CheckoutModal.tsx`, `TransferirFlow.tsx`, `ConsolidarFlow.tsx`
- `EdicaoEmMassaModal.tsx`
- `ImportarModal.tsx` com slot Smart Read

**Checkpoint 3:** Tabela funcionando com dataset real do banco de staging.

### Etapa 4 — Testes e Benchmark

**Prerequisito:** Checkpoint 3 aprovado.

Entregaveis:
- Todos os testes unitarios da Secao 17.2
- Todos os testes E2E da Secao 17.3
- Benchmarks com 100k, 500k e 1M linhas
- Relatorio de `EXPLAIN ANALYZE` para cada volume

**Entrega Final:** Relatorio de testes aprovado pelo QA.

---

## 20. Variáveis de Ambiente

Sem variaveis novas alem das ja definidas em `produto/pedido/ARQUITETURA.md`. O `TabelaVirtualGlobal` e um componente React puro e nao acessa variaveis de ambiente.

O job de expression index (`/internal/criar-expression-index`) usa a mesma `INTERNAL_SERVICE_KEY` ja configurada no processos-core.

---

## 21. Relacao com Arquitetura Existente

### 21.1 Componentes nucleo-global Coexistentes

| Componente | Relacao com TabelaVirtualGlobal |
|------------|--------------------------------|
| `TabelaCamadasGlobal` | Coexiste. TabelaCamadasGlobal e usada em telas mais simples (sem virtualizacao). TabelaVirtualGlobal e usada para volumes grandes (>1k linhas). |
| `TabelaGlobal` | Coexiste. TabelaGlobal e o componente legado de tabela simples. Nao e substituida. |

### 21.2 Produto Pedido

O `TabelaPedidos` substitui o uso de `TabelaCamadasGlobal` em `ListaPedidos.tsx` para o cenario de alta performance. A tela `ListaPedidos.tsx` passa a importar `TabelaPedidos` em vez de `TabelaCamadasGlobal`.

### 21.3 Backend (processos-core)

Todos os novos endpoints residem no mesmo `processos-core` (porta 8026). O `fragment.prisma` e o unico ponto de edicao do schema — nunca editar `schema.prisma` diretamente.

---

## 22. Checklist de Entrega

### Antes de Iniciar Etapa 2

- [ ] Coordenador aprovou Etapa 1 (este documento)
- [ ] `fragment.prisma` revisado pelo Coordenador
- [ ] Indices SQL revisados por DBA ou Tech Lead
- [ ] Limites de colunas e expression indexes aprovados pelo negocio

### Antes de Iniciar Etapa 3

- [ ] Checkpoint 2: todos endpoints com `EXPLAIN ANALYZE` dentro do SLA
- [ ] Migration testada em ambiente de staging
- [ ] Nenhum endpoint retornando HTTP 500 em testes de carga basica

### Antes de Considerar Concluido

- [ ] Todos os testes unitarios passando (≥ 80% cobertura nucleo-global)
- [ ] Todos os testes E2E passando
- [ ] Benchmarks com 1M linhas dentro do SLA
- [ ] QA aprovou todos os 6 criterios do checklist universal
- [ ] Documentacao atualizada (este arquivo)
- [ ] Nenhum `@ts-ignore`, nenhum `any` explicito, nenhum `console.log` sensivel
