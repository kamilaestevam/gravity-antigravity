# Arquitetura Técnica — Financeiro Comex

## Tech Lead Sign-off: ✅ Viável com reutilização máxima do ecossistema

---

## 1. Estrutura de Pastas

```
produto/financeiro-comex/
├── client/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Movimentacao/
│   │   │   │   ├── MovimentacaoPage.tsx        # Tela principal (lista + KPIs)
│   │   │   │   ├── MovimentacaoPage.css
│   │   │   │   ├── ModalNovoLancamento.tsx     # Modal de criação/edição
│   │   │   │   ├── ModalImportar.tsx           # Modal de importação (multi-canal)
│   │   │   │   └── ModalHistorico.tsx          # Histórico de alterações
│   │   │   ├── Numerario/
│   │   │   │   ├── NumerarioPage.tsx           # Lista de numerários
│   │   │   │   ├── NumerarioPage.css
│   │   │   │   ├── ModalInserirNumerario.tsx   # Modal numerário complementar
│   │   │   │   └── ModalExibirAnexo.tsx        # PDF viewer
│   │   │   ├── Rateio/
│   │   │   │   ├── RateioPage.tsx              # Lista de arquivos gerados
│   │   │   │   └── RateioPage.css
│   │   │   └── Config/
│   │   │       ├── CategoriasPage.tsx          # Catálogo de categorias
│   │   │       └── CondicoesPagamentoPage.tsx  # Condições de pagamento
│   │   └── shared/
│   │       ├── config.ts                       # PRODUCT_CONFIG
│   │       ├── api.ts                          # Client API
│   │       └── types.ts                        # Tipos do domínio
│   ├── vite.config.ts
│   └── tsconfig.json
└── server/
    ├── src/
    │   ├── index.ts                            # Express + 11 middlewares
    │   ├── routes/
    │   │   ├── lancamentos.ts                  # CRUD movimentação
    │   │   ├── importar.ts                     # Multi-canal de importação
    │   │   ├── numerario.ts                    # CRUD numerário
    │   │   ├── rateio.ts                       # Geração de rateio Excel
    │   │   ├── dashboard.ts                    # KPIs consolidados
    │   │   ├── historico.ts                    # Audit trail
    │   │   └── config.ts                       # Catálogos (categorias, condições)
    │   ├── middleware/
    │   │   ├── requireInternalKey.ts
    │   │   └── tenantIsolation.ts
    │   ├── services/
    │   │   ├── rateioEngine.ts                 # REUSO do NF Importação (sem fork)
    │   │   ├── xmlParser.ts                    # Parser DUIMP XML
    │   │   ├── portalUnicoConnector.ts         # REUSO do NF Importação
    │   │   └── excelGenerator.ts              # Gerador planilha custos_processo
    │   └── lib/
    │       ├── rateioAlgorithms.ts             # REUSO do NF Importação (sem fork)
    │       ├── currencyConverter.ts            # Conversão multi-moeda
    │       └── kpiCalculator.ts               # Cálculo de KPIs financeiros
    ├── prisma/
    │   ├── fragment.prisma                     # Modelos do Financeiro Comex
    │   └── schema.prisma                       # GERADO pelo compose-tenant-schema
    └── .env.example
```

---

## 2. PRODUCT_CONFIG

```typescript
export const PRODUCT_CONFIG = {
  id: 'financeiro-comex',
  name: 'Financeiro Comex',
  icon: 'CircleDollarSign',
  color: '#22c55e',          // Verde (--success) — financeiro
  basePath: '/financeiro-comex',
  serverPort: 8029,
  clientPort: 5184,          // dev only

  tenantServices: [
    'historico',
    'notificacoes',
    'email',
    'dashboard',
    'conector-erp',
  ],

  navigation: [
    { label: 'Movimentação', path: '/movimentacao', icon: 'List',          permission: 'financeiro:view' },
    { label: 'Numerário',    path: '/numerario',    icon: 'Wallet',         permission: 'financeiro:view' },
    { label: 'Rateio',       path: '/rateio',       icon: 'GitBranch',      permission: 'financeiro:view' },
    { label: 'Categorias',   path: '/config/categorias', icon: 'Tag',       permission: 'financeiro:admin' },
    { label: 'Condições',    path: '/config/condicoes',  icon: 'FileText',  permission: 'financeiro:admin' },
  ],
}
```

---

## 3. Fragment.prisma — Modelos de Dados

```prisma
// ============================================================
// FINANCEIRO COMEX — fragment.prisma
// ============================================================

enum TipoOperacaoFinanceiro {
  IMPORTACAO
  EXPORTACAO
}

enum MoedaFinanceiro {
  BRL
  USD
  EUR
  GBP
  CHF
  CNY
  ARS
  UYU
}

enum StatusPagamento {
  PENDENTE
  AGENDADO
  PAGO
}

enum CanalEntradaFinanceiro {
  MANUAL
  XML_DUIMP
  PORTAL_UNICO
  SMART_READ
  PLANILHA
  EMAIL
}

enum TipoDocumentoFinanceiro {
  BOLETO
  NOTA_FISCAL
  DEMONSTRATIVO
  FATURA
  FATURAMENTO
  OUTRO
}

enum TipoFornecedorFinanceiro {
  AGENTE_DE_CARGA
  ARMADOR
  CIA_AEREA
  ARMAZEM_ALFANDEGADO
  ARMAZEM
  TRANSPORTADORA_RODOVIARIA
  SEGURADORA
  CORRETORA_DE_CAMBIO
  EXPORTADOR
  FABRICANTE
  TRADING
  DESPACHANTE
  RECEITA_FEDERAL
  OUTRO
}

enum GrupoCusto {
  IMPOSTOS_FEDERAIS   // Grupo 1: DUIMP (II, IPI, PIS, COFINS, ICMS, AFRMM)
  CUSTO_OPERACIONAL   // Grupo 2: Taxas, fretes, etc.
}

// Financeiro de um processo (1 por processo)
model FinanceiroProcesso {
  id               String   @id @default(cuid())
  tenant_id        String
  company_id       String
  processo_id      String   @unique   // FK para o Processo
  tipo_operacao    TipoOperacaoFinanceiro
  referencia       String?  // Referência do processo (display)

  // Totalizadores cache (recalculados a cada lançamento)
  total_brl        Decimal  @default(0) @db.Decimal(18, 4)
  total_usd        Decimal  @default(0) @db.Decimal(18, 4)
  total_eur        Decimal  @default(0) @db.Decimal(18, 4)
  total_outros     Decimal  @default(0) @db.Decimal(18, 4)

  saldo            Decimal  @default(0) @db.Decimal(18, 4)
  adiantado        Decimal  @default(0) @db.Decimal(18, 4)
  pagos            Decimal  @default(0) @db.Decimal(18, 4)
  agendados        Decimal  @default(0) @db.Decimal(18, 4)
  pendente         Decimal  @default(0) @db.Decimal(18, 4)

  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  lancamentos      FinanceiroLancamento[]
  numerarios       FinanceiroNumerario[]
  rateios          FinanceiroRateio[]

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([tenant_id, processo_id])
}

// Cada lançamento financeiro (movimentação)
model FinanceiroLancamento {
  id               String   @id @default(cuid())
  tenant_id        String
  company_id       String
  financeiro_id    String

  // Identificação
  categoria_id     String   // FK FinanceiroCategorias
  categoria_nome   String   // Desnormalizado para histórico
  grupo_custo      GrupoCusto

  // Multi-moeda
  moeda            MoedaFinanceiro
  taxa_cambio      Decimal  @db.Decimal(10, 7)  // Ex: 5.6923000
  valor            Decimal  @db.Decimal(18, 4)  // Na moeda original
  valor_brl        Decimal  @db.Decimal(18, 4)  // valor × taxa_cambio

  // Fornecedor
  fornecedor_id    String?
  fornecedor_nome  String?               // Desnormalizado
  tipo_fornecedor  TipoFornecedorFinanceiro?

  // Pagamento
  condicao_id      String?
  condicao_descricao String?  // Desnormalizado
  data_pagamento   DateTime?
  data_vencimento  DateTime?
  status_pagamento StatusPagamento @default(PENDENTE)
  observacao       String?

  // Classificações
  despesa_aduaneira Boolean  @default(false)
  despesa_nf        Boolean  @default(false)
  espelho_nf        Boolean  @default(true)

  // Documento de origem
  tipo_documento   TipoDocumentoFinanceiro?  // Boleto, NF, Fatura, etc.
  numero_documento String?                   // Número do documento (NF, boleto, etc.)

  // Origem
  canal_entrada    CanalEntradaFinanceiro @default(MANUAL)
  icms_origem_portal Boolean @default(false)  // True quando ICMS veio do Portal Único

  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  created_by       String   // user_id

  financeiro       FinanceiroProcesso  @relation(fields: [financeiro_id], references: [id])
  categoria        FinanceiroCategorias @relation(fields: [categoria_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([tenant_id, financeiro_id])
  @@index([tenant_id, status_pagamento])
  @@index([tenant_id, data_vencimento])
}

// Catálogo de categorias de despesa (por tenant)
model FinanceiroCategorias {
  id               String   @id @default(cuid())
  tenant_id        String
  company_id       String

  codigo           String   // Ex: "3", "3333", "74"
  nome             String   // Ex: "Frete Internacional", "Imposto de Importação"
  grupo_custo      GrupoCusto
  tipo_operacao    TipoOperacaoFinanceiro?  // null = ambas
  conta_contabil   String?
  centro_custo     String?
  ativo            Boolean  @default(true)

  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  lancamentos      FinanceiroLancamento[]

  @@unique([tenant_id, company_id, codigo])
  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([tenant_id, tipo_operacao])
}

// Condições de pagamento (por tenant)
model FinanceiroCondicaoPagamento {
  id               String   @id @default(cuid())
  tenant_id        String
  company_id       String

  codigo           String   // Ex: "002"
  descricao        String   // Ex: "Pagamento em 60 dias"
  dias_prazo       Int?     // Dias após embarque/desembaraço
  ativo            Boolean  @default(true)

  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  @@unique([tenant_id, company_id, codigo])
  @@index([tenant_id])
  @@index([tenant_id, company_id])
}

// Numerário (adiantamento ao despachante)
// MÓDULO ISOLÁVEL — projetado para virar produto independente
model FinanceiroNumerario {
  id               String   @id @default(cuid())
  tenant_id        String
  company_id       String
  financeiro_id    String

  descricao        String   // Ex: "Numerário Principal", "Numerário Complementar 1"
  is_principal     Boolean  @default(false)
  data             DateTime
  valor_total      Decimal  @db.Decimal(18, 4)

  // Documento de prestação de contas
  documento_storage_key  String?
  documento_nome         String?
  documento_mime_type    String?

  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  created_by       String

  financeiro       FinanceiroProcesso    @relation(fields: [financeiro_id], references: [id])
  despesas         FinanceiroNumerarioDespesa[]

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@index([tenant_id, financeiro_id])
}

// Despesas dentro de um numerário
model FinanceiroNumerarioDespesa {
  id               String   @id @default(cuid())
  tenant_id        String
  numerario_id     String

  descricao        String
  moeda            MoedaFinanceiro
  taxa_cambio      Decimal  @db.Decimal(10, 7)
  valor            Decimal  @db.Decimal(18, 4)
  valor_brl        Decimal  @db.Decimal(18, 4)
  responsavel      String?  // "IMPORTADOR", "EXPORTADOR", etc.

  created_at       DateTime @default(now())

  numerario        FinanceiroNumerario @relation(fields: [numerario_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, numerario_id])
}

// Registro de rateio gerado (arquivo Excel)
model FinanceiroRateio {
  id               String   @id @default(cuid())
  tenant_id        String
  company_id       String
  financeiro_id    String

  storage_key      String   // Path no storage (S3/Railway)
  nome_arquivo     String   // Ex: "Rateio.xlsx"
  gerado_em        DateTime @default(now())
  gerado_por       String   // user_id

  financeiro       FinanceiroProcesso @relation(fields: [financeiro_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, financeiro_id])
}

// Histórico imutável (append-only)
model FinanceiroHistorico {
  id               String   @id @default(cuid())
  tenant_id        String
  financeiro_id    String
  lancamento_id    String?  // null = ação no nível do processo

  acao             String   // "lancamento_criado", "lancamento_editado", etc.
  descricao        String
  dados_anteriores Json?
  dados_novos      Json?

  user_id          String
  user_nome        String
  created_at       DateTime @default(now())

  @@index([tenant_id])
  @@index([tenant_id, financeiro_id])
  @@index([tenant_id, lancamento_id])
}
```

---

## 4. Endpoints da API

### Movimentação

| Método | Endpoint | Descrição | Auth |
|:---|:---|:---|:---|
| GET | `/api/v1/financeiro/:processoId` | Dashboard KPIs + meta do processo | S2S + tenant |
| GET | `/api/v1/financeiro/:processoId/lancamentos` | Listar lançamentos (paginado, filtros) | S2S + tenant |
| POST | `/api/v1/financeiro/:processoId/lancamentos` | Criar lançamento manual | S2S + tenant |
| PUT | `/api/v1/financeiro/:processoId/lancamentos/:id` | Editar lançamento | S2S + tenant |
| DELETE | `/api/v1/financeiro/:processoId/lancamentos/:id` | Excluir lançamento | S2S + tenant |
| POST | `/api/v1/financeiro/:processoId/importar/xml` | Importar impostos via XML DUIMP | S2S + tenant |
| POST | `/api/v1/financeiro/:processoId/importar/portal-unico` | Importar via Portal Único | S2S + tenant |
| POST | `/api/v1/financeiro/:processoId/importar/smart-read` | Importar via Smart Read | S2S + tenant |
| POST | `/api/v1/financeiro/:processoId/importar/planilha` | Importar via Excel | S2S + tenant |

### Numerário

| Método | Endpoint | Descrição |
|:---|:---|:---|
| GET | `/api/v1/financeiro/:processoId/numerario` | Listar numerários |
| POST | `/api/v1/financeiro/:processoId/numerario` | Criar numerário (principal ou complementar) |
| PUT | `/api/v1/financeiro/:processoId/numerario/:id` | Editar numerário |
| DELETE | `/api/v1/financeiro/:processoId/numerario/:id` | Excluir |
| POST | `/api/v1/financeiro/:processoId/numerario/:id/documento` | Upload PDF |
| GET | `/api/v1/financeiro/:processoId/numerario/:id/documento` | Download PDF |

### Rateio

| Método | Endpoint | Descrição |
|:---|:---|:---|
| POST | `/api/v1/financeiro/:processoId/rateio/gerar` | Gerar Excel de rateio |
| GET | `/api/v1/financeiro/:processoId/rateio` | Listar arquivos gerados |
| GET | `/api/v1/financeiro/:processoId/rateio/:id/download` | Download Excel |

### Config

| Método | Endpoint | Descrição |
|:---|:---|:---|
| GET/POST/PUT/DELETE | `/api/v1/financeiro/config/categorias` | CRUD catálogo de categorias |
| GET/POST/PUT/DELETE | `/api/v1/financeiro/config/condicoes` | CRUD condições de pagamento |

### Health

| Método | Endpoint |
|:---|:---|
| GET | `/health` |

---

## 5. Diagrama de Fluxo de Dados

```
Usuário → Client (React, porta 5184)
              ↓ HTTP (x-internal-key + JWT)
         Server (Express, porta 8029)
              ↓ Prisma + RLS
         [DB financeiro-comex] (tenant isolado)
              ↓
     ┌────────┴─────────────────┐
     ↓                         ↓
 Processo (S2S)          Portal Único (reuso)
 processo_id             DUIMP → impostos
 itens (para rateio)
     ↓
 NF Importação (S2S)    RateioEngine (reuso)
 espelho de custos      rateioAlgorithms.ts
     ↓
 Serviços Tenant
 (historico, notificacoes, email)
```

---

## 6. Reutilização do Ecossistema

### O que reutilizar sem fork (0 esforço de criação)

| Item | Origem | Como Usar |
|:---|:---|:---|
| `rateioAlgorithms.ts` | NF Importação | Import direto via S2S ou lib compartilhada |
| `portalUnicoConnector.ts` | NF Importação | Reuso do mesmo conector DUIMP |
| Smart Read service | NF Importação | Mesma API de OCR |
| `tenantIsolationMiddleware` | Gravity infra | Copy padrão |
| `requireInternalKey` | Gravity infra | Copy padrão |
| Serviços tenant | Gravity infra | Email, Histórico, Notificações via S2S |
| `TabelaGlobal` | nucleo-global | Lista de lançamentos |
| `ModalGlobal` | nucleo-global | Todos os modals |
| `CaixaSelectGlobal` | nucleo-global | Selects de moeda, fornecedor, categoria |
| `InputTexto` | nucleo-global | Campos de valor, taxa, observação |
| `BadgeStatus` | nucleo-global | Status do pagamento (Pago/Pendente/Agendado) |

### O que criar do zero

| Item | Complexidade | Justificativa |
|:---|:---|:---|
| `FinanceiroProcesso` scaffold completo | G | Novo produto, structure + routes + models |
| `kpiCalculator.ts` (Saldo, Adiantado, Pagos...) | M | Lógica financeira específica do produto |
| `currencyConverter.ts` (multi-moeda) | P | Conversão valor × taxa |
| `excelGenerator.ts` (formato custos_processo) | G | Layout exato da planilha de rateio |
| `xmlParser.ts` (DUIMP XML) | M | Parse XML específico do SISCOMEX |
| Modal Novo Lançamento (multi-campo, flags) | M | Formulário complexo com validações |
| KPI header (4+ badges multi-moeda) | P | Componente visual específico |
| PDF viewer no Numerário | P | Exibir PDF do numerário anexado |

---

## 7. Estimativa de Complexidade por Tela

| Tela/Feature | Frontend | Backend | Total | Notas |
|:---|:---|:---|:---|:---|
| Scaffold inicial (setup, config, health) | — | M | M | Padrão Gravity |
| Fragment.prisma + migration | — | M | M | 6 models novos |
| Movimentação — Lista + KPIs | M | M | G | TabelaGlobal + cálculo KPI |
| Modal Novo Lançamento | M | P | M | Formulário + validação Zod |
| Importar via XML DUIMP | P | G | G | Parser XML SISCOMEX |
| Importar via Portal Único | P | M | M | Reuso da integração NF Importação |
| Importar via Smart Read | P | M | M | Reuso do serviço |
| Importar via Planilha Excel | P | M | M | Parser de template |
| Numerário — Lista | P | P | P | Simples |
| Numerário — Modal + upload PDF | M | P | M | Upload + preview |
| Rateio — Geração Excel | P | G | G | Formato exato custos_processo |
| Catálogo Categorias | P | P | P | CRUD simples |
| Condições de Pagamento | P | P | P | CRUD simples |
| **MVP Total** | | | **~6-8 semanas** | 2 devs |

---

## 8. Checklist de Segurança

- [ ] Todo model tem `tenant_id` obrigatório
- [ ] Todo endpoint tem validação Zod antes do banco
- [ ] `tenantIsolationMiddleware` no server
- [ ] `requireInternalKey` em todas as rotas S2S
- [ ] JWT validado em rotas de usuário
- [ ] Nenhuma query sem filtro por `tenant_id`
- [ ] Health check sem autenticação em `/health`
- [ ] Nenhum `console.log` com dados sensíveis (valores financeiros)
- [ ] Variáveis de ambiente via `process.env`
- [ ] Erros via `AppError`
- [ ] Upload de PDF: validar mime_type e tamanho máximo
- [ ] Download de PDF: validar que storage_key pertence ao tenant
