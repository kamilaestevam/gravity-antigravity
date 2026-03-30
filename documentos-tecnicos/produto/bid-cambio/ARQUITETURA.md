# Arquitetura Tecnica — BID Cambio

> **Versao:** 1.0
> **Data:** 29/03/2026
> **Porta:** 8025
> **Product ID:** bid-cambio
> **Agente:** Tech Lead (Dream Team de Produtos)

---

## 1. PRODUCT_CONFIG

```typescript
export const PRODUCT_CONFIG = {
  id: 'bid-cambio',
  productId: 'bid-cambio',
  name: 'BID Cambio',
  port: 8025,

  tenantServices: [
    'atividades',      // Log de acoes
    'dashboard',       // KPIs consolidados
    'relatorios',      // Relatorios exportaveis
    'historico',       // Audit trail imutavel (compliance BACEN)
    'notificacoes',    // Alertas in-app
    'gabi',            // IA — analise de taxas
    'email',           // Disparo de cotacoes + alertas de vencimento
    'agendamento',     // Cron job diario 7h (alertas)
  ],

  productServices: [
    'bid-engine',              // Disparo de cotacoes para corretoras
    'comparativo-engine',      // Ranking de taxas e aprovacao
    'rating-engine',           // Rating de corretoras (cross-tenant)
    'parcela-engine',          // Gestao de parcelas (agendamento, pagamento, recalculo)
    'savings-engine',          // Calculo de economia (spread)
    'vencimento-engine',       // Calculo de datas de vencimento (metodos)
    'email-engine',            // Templates e disparo de e-mails especificos
  ],

  navigation: [
    { id: 'visao-geral',    label: 'Visao Geral',    icon: 'LayoutDashboard' },
    { id: 'cambios',        label: 'Cambios',        icon: 'FileText' },
    { id: 'cotacoes',       label: 'Cotacoes',       icon: 'ArrowLeftRight' },
    { id: 'corretoras',     label: 'Corretoras',     icon: 'Building2' },
    { id: 'configuracoes',  label: 'Configuracoes',  icon: 'Settings' },
  ],

  // Navegacao do Portal da Corretora (separado)
  navigationCorretora: [
    { id: 'dashboard',          label: 'Dashboard',          icon: 'LayoutDashboard' },
    { id: 'cotacoes-pendentes', label: 'Cotacoes Pendentes', icon: 'Clock' },
    { id: 'minhas-respostas',   label: 'Minhas Respostas',   icon: 'CheckCircle' },
    { id: 'meu-desempenho',     label: 'Meu Desempenho',     icon: 'TrendingUp' },
    { id: 'configuracoes',      label: 'Configuracoes',      icon: 'Settings' },
  ],

  features: {
    cotacao_aberta: true,         // Cotacoes abertas (todas corretoras ativas)
    rating_global: true,          // Rating cross-tenant de corretoras
    monetizacao_corretora: true,  // Cobranca das corretoras
    portal_publico: true,         // Resposta via token (sem login)
    gestao_parcelas: true,        // Pilar 1 — gestao completa
    integracao_processo: true,    // Leitura de dados do Processo (opcional)
    alerta_vencimento: true,      // Cron job de e-mails
    exportacao: true,             // CSV, Excel, PDF
  },
}
```

---

## 2. Estrutura de Pastas

```
produto/bid-cambio/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.tsx              # KPIs comprador
│       │   ├── ListaCambios.tsx           # Grid 25+ colunas customizavel
│       │   ├── NovaCotacao.tsx            # Criar + disparar cotacao
│       │   ├── DetalheCotacao.tsx         # Detalhe com respostas
│       │   ├── Comparativo.tsx            # Ranking de taxas
│       │   ├── Corretoras.tsx             # Lista de corretoras
│       │   ├── DetalheCorretora.tsx       # Rating + historico
│       │   ├── Configuracoes.tsx          # Preferencias do comprador
│       │   └── portal/
│       │       ├── PortalDashboard.tsx    # Dashboard corretora
│       │       ├── CotacoesPendentes.tsx  # Cotacoes aguardando resposta
│       │       ├── ResponderCotacao.tsx   # Formulario de resposta (auth)
│       │       ├── ResponderPublico.tsx   # Formulario de resposta (token)
│       │       ├── MinhasRespostas.tsx    # Historico de respostas
│       │       ├── MeuDesempenho.tsx      # Metricas da corretora
│       │       └── ConfigCorretora.tsx    # Dados e preferencias
│       └── shared/
│           ├── api.ts                     # Client API functions
│           ├── config.ts                  # PRODUCT_CONFIG
│           └── types.ts                   # TypeScript types + enums
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── cambios.ts                # CRUD parcelas de cambio
│   │   │   ├── cotacoes.ts               # CRUD cotacoes de cambio
│   │   │   ├── bids.ts                   # Disparo para corretoras
│   │   │   ├── comparativo.ts            # Ranking + aprovacao
│   │   │   ├── corretoras.ts             # Cadastro de corretoras
│   │   │   ├── portal.ts                 # Portal autenticado corretora
│   │   │   ├── portalPublic.ts           # Portal publico (token)
│   │   │   ├── avaliacoes.ts             # Rating de corretoras
│   │   │   ├── dashboard.ts              # KPIs agregados
│   │   │   ├── masterData.ts             # Moedas, bancos, PTAX
│   │   │   └── preferencias.ts           # Preferencias de cambio do tenant
│   │   │
│   │   ├── services/
│   │   │   ├── bidEngine.ts              # Orquestracao de disparo
│   │   │   ├── comparativoEngine.ts      # Ranking + aprovacao 2-click
│   │   │   ├── parcelaEngine.ts          # Gestao de parcelas (agendar, pagar, recalcular)
│   │   │   ├── ratingEngine.ts           # Rating cross-tenant de corretoras
│   │   │   ├── savingsEngine.ts          # Calculo de economia (spread)
│   │   │   ├── vencimentoEngine.ts       # Calculo de datas de vencimento
│   │   │   ├── emailEngine.ts            # Templates de e-mail + disparo
│   │   │   ├── monetizacao.ts            # Cobranca das corretoras
│   │   │   ├── tenantIntegrations.ts     # Fire-and-forget S2S
│   │   │   └── cronJobs.ts              # Alertas de vencimento (7h) + expiracao cotacoes
│   │   │
│   │   ├── middleware/
│   │   │   ├── requireInternalKey.ts     # Auth S2S
│   │   │   └── tenantIsolation.ts        # Injeta tenant_id
│   │   │
│   │   ├── lib/
│   │   │   ├── errors.ts                 # AppError
│   │   │   └── prisma.ts                 # Prisma client com extension
│   │   │
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   │
│   │   └── index.ts                      # Express server (porta 8025)
│   │
│   └── prisma/
│       ├── fragment.prisma               # Models do BID Cambio
│       ├── schema.base.prisma
│       ├── schema.prisma
│       └── compose-schema.js
│
└── package.json
```

---

## 3. fragment.prisma

```prisma
// ============================================
// BID Cambio — Fragment Prisma
// Produto: bid-cambio | Porta: 8025
// ============================================

// ---- ENUMS ----

enum TipoOperacaoCambio {
  IMPORTACAO
  EXPORTACAO
}

enum ModalidadeCambio {
  PRONTO        // D+0, D+1, D+2
  FUTURO        // NDF/Trava (Fase 2)
}

enum LiquidacaoCambio {
  D0
  D1
  D2
}

enum MoedaCambio {
  USD
  EUR
  GBP
  CHF
  BRL
  CNY
  JPY
}

enum StatusParcela {
  PENDENTE
  AGENDADO
  PAGO
}

enum StatusCotacaoCambio {
  RASCUNHO
  ENVIADA_CORRETORAS
  EM_COTACAO
  AGUARDANDO_APROVACAO
  APROVADA
  REPROVADA
  CANCELADA
  EXPIRADA
}

enum CanalDisparoCambio {
  EMAIL
  PORTAL
}

enum StatusBidRequestCambio {
  PENDENTE
  ENVIADO
  VISUALIZADO
  RESPONDIDO
  EXPIRADO
  ERRO_ENVIO
}

enum StatusBidResponseCambio {
  RECEBIDA
  EM_ANALISE
  MELHOR_TAXA
  MELHOR_SPREAD
  MELHOR_AVALIACAO
  APROVADA
  REPROVADA
}

enum TipoCorretora {
  CORRETORA_CAMBIO
  BANCO_COMERCIAL
  BANCO_CAMBIO
  FINTECH
}

enum StatusCorretora {
  ATIVA
  INATIVA
  BLOQUEADA
}

enum MetodoVencimento {
  DATA_EMBARQUE
  DATA_CHEGADA
  DATA_REGISTRO_DI
  DATA_DESEMBARACO
  DATA_ENTREGA
  PRONTIDAO_CARGA    // Usa Data Carga Pronta; fallback: Data Esperada da Prontidao
  DATA_FIXA
}

// ---- MODELS ----

/// Parcela de cambio vinculada a um pedido/processo
model ParcelaCambio {
  id                    String          @id @default(cuid())
  tenant_id             String
  product_id            String          @default("bid-cambio")
  user_id               String

  // Dados do processo/pedido (pode vir do Processo ou ser manual)
  referencia_processo   String?         // DATI NUMBER ou referencia externa
  numero_pedido         String?         // PO Number
  exportador            String?
  numero_di             String?
  numero_invoice        String?
  numero_bl             String?
  numero_contrato_cambio String?
  numero_transmissao_di String?
  referencia_cliente    String?

  // Valores
  moeda                 MoedaCambio     @default(USD)
  cambio_total          Decimal         @db.Decimal(18, 4)
  porcentagem_parcela   Decimal         @db.Decimal(5, 2)   // ex: 24.50
  valor_a_pagar         Decimal         @db.Decimal(18, 2)   // em moeda
  valor_a_pagar_brl     Decimal         @db.Decimal(18, 2)   // em reais
  valor_pago            Decimal?        @db.Decimal(18, 2)   // valor efetivamente pago
  valor_pago_brl        Decimal?        @db.Decimal(18, 2)

  // Parcela
  numero_parcela        Int                                   // 1, 2, 3...
  total_parcelas        Int                                   // total do pedido
  // Display: "numero_parcela/total_parcelas" => "1/3"

  // Status
  status                StatusParcela   @default(PENDENTE)

  // Datas
  data_vencimento       DateTime?
  data_agendamento      DateTime?
  data_pagamento        DateTime?
  data_vencimento_original DateTime?     // guardada para retorno a pendente

  // Metodo de vencimento
  metodo_vencimento     MetodoVencimento?
  prazo_dias            Int?             // dias apos o marco

  // Datas do processo (para calculo de vencimento)
  data_carga_pronta     DateTime?
  data_esperada_prontidao DateTime?
  data_embarque_final   DateTime?
  data_chegada_final    DateTime?
  data_registro_di      DateTime?
  data_desembaraco      DateTime?
  data_entrega          DateTime?
  data_abertura_pedido  DateTime?

  // Pagamento
  taxa_fechamento       Decimal?        @db.Decimal(10, 4)   // 4 casas decimais
  banco_corretora       String?
  condicao_pagamento    String?

  // Enderecos
  endereco_desembaraco  String?          // CNPJ + Nome
  endereco_entrega      String?          // CNPJ + Nome

  // Vinculacao com cotacao (Pilar 2)
  cotacao_cambio_id     String?
  bid_response_id       String?          // Resposta aprovada que gerou o pagamento

  // Anexos
  anexos                AnexoCambio[]

  // Timestamps
  created_at            DateTime         @default(now())
  updated_at            DateTime         @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@index([tenant_id, status])
  @@index([tenant_id, data_vencimento])
  @@map("cambio_parcelas")
}

/// Anexo de comprovante de pagamento
model AnexoCambio {
  id                    String          @id @default(cuid())
  tenant_id             String
  parcela_id            String
  parcela               ParcelaCambio   @relation(fields: [parcela_id], references: [id])
  nome_arquivo          String?         // nome customizado (opcional)
  nome_original         String          // nome real do arquivo
  url                   String          // URL do storage
  categoria             String          @default("Contrato de Cambio")
  tamanho_bytes         Int?
  created_at            DateTime        @default(now())

  @@index([tenant_id])
  @@index([tenant_id, parcela_id])
  @@map("cambio_anexos")
}

/// Forma de pagamento do cambio (config por pedido)
model FormaPagamentoCambio {
  id                    String              @id @default(cuid())
  tenant_id             String
  product_id            String              @default("bid-cambio")
  user_id               String
  referencia_processo   String?             // Vinculo com processo/pedido
  numero_pedido         String?

  descricao             String?             // Nome da forma de pagamento
  parcelas              ConfigParcelaCambio[]

  created_at            DateTime            @default(now())
  updated_at            DateTime            @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@map("cambio_formas_pagamento")
}

/// Configuracao de cada parcela dentro da forma de pagamento
model ConfigParcelaCambio {
  id                    String                  @id @default(cuid())
  tenant_id             String
  forma_pagamento_id    String
  forma_pagamento       FormaPagamentoCambio    @relation(fields: [forma_pagamento_id], references: [id])

  a_partir_de           MetodoVencimento        // "A partir de qual momento"
  prazo_dias            Int                     // Prazo em dias
  porcentagem           Decimal                 @db.Decimal(5, 2) // ex: 24.50
  ordem                 Int                     // Ordem da parcela

  @@index([tenant_id])
  @@index([tenant_id, forma_pagamento_id])
  @@map("cambio_config_parcelas")
}

/// Cotacao de cambio (Pilar 2 — Marketplace)
model CotacaoCambio {
  id                    String                  @id @default(cuid())
  tenant_id             String
  product_id            String                  @default("bid-cambio")
  user_id               String

  // Dados da cotacao
  moeda                 MoedaCambio             @default(USD)
  valor                 Decimal                 @db.Decimal(18, 2)
  tipo_operacao         TipoOperacaoCambio      @default(IMPORTACAO)
  modalidade            ModalidadeCambio        @default(PRONTO)
  liquidacao            LiquidacaoCambio        @default(D2)

  // Vinculacao com processo (opcional)
  referencia_processo   String?
  numero_pedido         String?
  exportador            String?

  // Status
  status                StatusCotacaoCambio     @default(RASCUNHO)

  // PTAX de referencia no momento da cotacao
  ptax_referencia       Decimal?                @db.Decimal(10, 4)
  ptax_data             DateTime?

  // Validade
  data_expiracao        DateTime?

  // Resultado
  economia_brl          Decimal?                @db.Decimal(18, 2)
  economia_percentual   Decimal?                @db.Decimal(5, 2)

  // Relacoes
  bid_requests          BidRequestCambio[]
  bid_responses         BidResponseCambio[]

  created_at            DateTime                @default(now())
  updated_at            DateTime                @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@index([tenant_id, status])
  @@map("cambio_cotacoes")
}

/// Disparo de cotacao para uma corretora
model BidRequestCambio {
  id                    String                      @id @default(cuid())
  tenant_id             String
  cotacao_id            String
  cotacao               CotacaoCambio               @relation(fields: [cotacao_id], references: [id])
  corretora_id          String
  corretora             Corretora                   @relation(fields: [corretora_id], references: [id])

  canal                 CanalDisparoCambio          @default(EMAIL)
  status                StatusBidRequestCambio      @default(PENDENTE)

  // Token publico para resposta sem login
  token_publico         String?                     @unique
  token_expiracao       DateTime?

  // Timestamps de tracking
  enviado_em            DateTime?
  visualizado_em        DateTime?
  respondido_em         DateTime?

  // Resposta vinculada
  response              BidResponseCambio?

  created_at            DateTime                    @default(now())
  updated_at            DateTime                    @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, cotacao_id])
  @@index([token_publico])
  @@map("cambio_bid_requests")
}

/// Resposta de uma corretora a uma cotacao
model BidResponseCambio {
  id                    String                      @id @default(cuid())
  tenant_id             String
  cotacao_id            String
  cotacao               CotacaoCambio               @relation(fields: [cotacao_id], references: [id])
  corretora_id          String
  corretora             Corretora                   @relation(fields: [corretora_id], references: [id])
  bid_request_id        String                      @unique
  bid_request           BidRequestCambio            @relation(fields: [bid_request_id], references: [id])

  // Proposta
  taxa_oferecida        Decimal                     @db.Decimal(10, 4) // ex: 5.2350
  spread                Decimal                     @db.Decimal(10, 4) // diferenca vs PTAX
  valor_total_brl       Decimal                     @db.Decimal(18, 2) // valor x taxa
  iof_percentual        Decimal                     @db.Decimal(5, 2)  // ex: 0.38
  iof_valor             Decimal                     @db.Decimal(18, 2)
  liquidacao_proposta   LiquidacaoCambio
  validade_minutos      Int                          // ex: 10 (minutos)
  validade_ate          DateTime                     // timestamp exato
  condicoes             String?                      // observacoes da corretora

  // Status
  status                StatusBidResponseCambio     @default(RECEBIDA)

  created_at            DateTime                    @default(now())
  updated_at            DateTime                    @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, cotacao_id])
  @@index([tenant_id, corretora_id])
  @@map("cambio_bid_responses")
}

/// Cadastro de corretoras de cambio / bancos
model Corretora {
  id                    String                  @id @default(cuid())
  tenant_id             String
  product_id            String                  @default("bid-cambio")
  user_id               String

  // Dados
  razao_social          String
  nome_fantasia         String?
  cnpj                  String?
  tipo                  TipoCorretora           @default(CORRETORA_CAMBIO)
  status                StatusCorretora         @default(ATIVA)

  // Contato
  email                 String
  telefone              String?
  contato_nome          String?
  contato_cargo         String?

  // Portal
  portal_habilitado     Boolean                 @default(false)

  // Moedas que opera
  moedas_operadas       String?                 // JSON array: ["USD","EUR","GBP"]

  // Relacoes
  bid_requests          BidRequestCambio[]
  bid_responses         BidResponseCambio[]
  avaliacoes            AvaliacaoCorretora[]

  created_at            DateTime                @default(now())
  updated_at            DateTime                @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@index([tenant_id, status])
  @@index([email])
  @@map("cambio_corretoras")
}

/// Avaliacao manual de corretora (1-5 por criterio)
model AvaliacaoCorretora {
  id                    String          @id @default(cuid())
  tenant_id             String
  user_id               String
  corretora_id          String
  corretora             Corretora       @relation(fields: [corretora_id], references: [id])
  cotacao_id            String?

  nota_taxa             Int             // 1-5 — competitividade da taxa
  nota_agilidade        Int             // 1-5 — velocidade de resposta
  nota_atendimento      Int             // 1-5 — qualidade do servico
  nota_confiabilidade   Int             // 1-5 — cumpre o que promete
  comentario            String?

  created_at            DateTime        @default(now())

  @@index([tenant_id])
  @@index([tenant_id, corretora_id])
  @@map("cambio_avaliacoes")
}

/// Rating global de corretora (cross-tenant, por e-mail)
model RatingCorretora {
  id                    String          @id @default(cuid())
  corretora_email       String          @unique
  // Cross-tenant: NAO tem tenant_id como filtro unico

  // Metricas automaticas (40%)
  taxa_resposta         Decimal         @db.Decimal(5, 2)  // % de cotacoes respondidas
  taxa_aprovacao        Decimal         @db.Decimal(5, 2)  // % de respostas aprovadas
  tempo_medio_resposta  Int             // minutos
  total_cotacoes        Int             @default(0)
  total_aprovacoes      Int             @default(0)

  // Metricas manuais (60%)
  nota_media_taxa       Decimal         @db.Decimal(3, 2)  // media 1-5
  nota_media_agilidade  Decimal         @db.Decimal(3, 2)
  nota_media_atendimento Decimal        @db.Decimal(3, 2)
  nota_media_confiabilidade Decimal     @db.Decimal(3, 2)
  total_avaliacoes      Int             @default(0)

  // Score final
  score_global          Decimal         @db.Decimal(3, 2)  // 0-5

  updated_at            DateTime        @updatedAt

  @@map("cambio_rating_corretora_global")
}

/// Saving por cotacao aprovada
model SavingCambio {
  id                    String          @id @default(cuid())
  tenant_id             String
  cotacao_id            String
  corretora_id          String

  valor_operacao        Decimal         @db.Decimal(18, 2)
  moeda                 MoedaCambio
  taxa_aprovada         Decimal         @db.Decimal(10, 4)
  taxa_media_respostas  Decimal         @db.Decimal(10, 4)  // media das outras propostas
  ptax_referencia       Decimal         @db.Decimal(10, 4)
  economia_brl          Decimal         @db.Decimal(18, 2)
  economia_percentual   Decimal         @db.Decimal(5, 2)

  created_at            DateTime        @default(now())

  @@index([tenant_id])
  @@index([tenant_id, cotacao_id])
  @@map("cambio_savings")
}

/// Preferencias de cambio do tenant
model PreferenciaCambio {
  id                              String      @id @default(cuid())
  tenant_id                       String      @unique
  product_id                      String      @default("bid-cambio")

  // Preferencias (do legado DATI)
  mostrar_no_financeiro           Boolean     @default(false)  // Apresentar cambios pagos no financeiro?
  alerta_email_vencimento         Boolean     @default(false)  // Alertar por e-mail?
  dias_antecedencia_alerta        Int?                          // Quantos dias antes?
  enviar_email_exportador         Boolean     @default(false)  // E-mail ao exportador apos pagamento?
  enviar_email_fim_de_semana      Boolean     @default(true)   // Enviar nos fins de semana?

  updated_at                      DateTime    @updatedAt

  @@index([tenant_id])
  @@map("cambio_preferencias")
}

/// Preferencia de grid do usuario (colunas, ordem, filtros)
model PreferenciaGridCambio {
  id                    String      @id @default(cuid())
  tenant_id             String
  user_id               String

  colunas_visiveis      String      // JSON array de nomes de colunas
  ordem_colunas         String      // JSON array com ordem
  filtros_salvos        String?     // JSON object com filtros ativos
  ordenacao             String?     // JSON: { campo: "data_vencimento", direcao: "asc" }

  updated_at            DateTime    @updatedAt

  @@unique([tenant_id, user_id])
  @@index([tenant_id])
  @@map("cambio_preferencias_grid")
}
```

---

## 4. API Endpoints

### Rotas Publicas (sem auth)

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Health check com status do DB |
| GET | `/api/v1/master-data/moedas` | Lista de moedas (USD, EUR, etc.) |
| GET | `/api/v1/master-data/bancos` | Lista de bancos/corretoras publicos |
| GET | `/api/v1/master-data/ptax` | PTAX do dia (cache BCB) |
| GET | `/api/v1/master-data/ptax/historico` | Historico PTAX (ultimos 30 dias) |
| GET | `/api/v1/bid-cambio/portal/public/cotacao/:token` | Ver cotacao via link publico |
| POST | `/api/v1/bid-cambio/portal/public/responder/:token` | Responder cotacao via token |

### Rotas Protegidas — Comprador (x-internal-key + tenant isolation)

#### Parcelas de Cambio (Gestao — Pilar 1)

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/bid-cambio/cambios` | Listar parcelas (filtros: status, moeda, datas, paginacao) |
| GET | `/api/v1/bid-cambio/cambios/:id` | Detalhe da parcela |
| POST | `/api/v1/bid-cambio/cambios` | Criar parcela manual |
| PATCH | `/api/v1/bid-cambio/cambios/:id` | Atualizar parcela |
| POST | `/api/v1/bid-cambio/cambios/agendar` | Agendar parcelas (batch) |
| POST | `/api/v1/bid-cambio/cambios/pagar` | Registrar pagamento (3 etapas) |
| POST | `/api/v1/bid-cambio/cambios/retornar-pendente` | Retornar parcela para pendente |
| GET | `/api/v1/bid-cambio/cambios/totais` | Totais em aberto por moeda |
| POST | `/api/v1/bid-cambio/cambios/exportar` | Exportar (CSV, Excel, PDF) |

#### Forma de Pagamento

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/bid-cambio/formas-pagamento` | Listar formas de pagamento |
| POST | `/api/v1/bid-cambio/formas-pagamento` | Criar forma (parcelas com %) |
| PUT | `/api/v1/bid-cambio/formas-pagamento/:id` | Editar (so se nenhuma parcela paga) |
| DELETE | `/api/v1/bid-cambio/formas-pagamento/:id` | Remover |

#### Cotacoes de Cambio (Marketplace — Pilar 2)

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/bid-cambio/cotacoes` | Criar cotacao |
| GET | `/api/v1/bid-cambio/cotacoes` | Listar cotacoes (status, moeda, datas) |
| GET | `/api/v1/bid-cambio/cotacoes/:id` | Detalhe com requests/responses |
| PATCH | `/api/v1/bid-cambio/cotacoes/:id` | Atualizar (so RASCUNHO) |
| DELETE | `/api/v1/bid-cambio/cotacoes/:id` | Deletar (so RASCUNHO) |

#### Disparo de BIDs

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/bid-cambio/bids/disparar` | Disparar para corretoras selecionadas |
| POST | `/api/v1/bid-cambio/bids/cotacao-aberta` | Disparar para todas ativas |
| GET | `/api/v1/bid-cambio/bids/cotacao/:id` | Listar BidRequests da cotacao |

#### Comparativo

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/bid-cambio/comparativo/:cotacaoId` | Ranking com tags |
| POST | `/api/v1/bid-cambio/comparativo/:cotacaoId/aprovar` | Aprovar resposta (2-click) |
| POST | `/api/v1/bid-cambio/comparativo/:cotacaoId/reprovar` | Reprovar com motivo |

#### Corretoras

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/bid-cambio/corretoras` | Cadastrar corretora |
| GET | `/api/v1/bid-cambio/corretoras` | Listar (tipo, status) |
| GET | `/api/v1/bid-cambio/corretoras/:id` | Detalhe + rating |
| PUT | `/api/v1/bid-cambio/corretoras/:id` | Atualizar |
| PATCH | `/api/v1/bid-cambio/corretoras/:id/status` | Ativar/Inativar/Bloquear |

#### Avaliacoes

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/v1/bid-cambio/avaliacoes` | Avaliar corretora (1-5, 4 criterios) |
| GET | `/api/v1/bid-cambio/avaliacoes/corretora/:id` | Rating da corretora |
| GET | `/api/v1/bid-cambio/avaliacoes/ranking` | Ranking global |

#### Dashboard

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/bid-cambio/dashboard` | KPIs consolidados |
| GET | `/api/v1/bid-cambio/dashboard/vencimentos` | Calendario de vencimentos |

#### Preferencias

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/bid-cambio/preferencias` | Preferencias do tenant |
| PUT | `/api/v1/bid-cambio/preferencias` | Atualizar preferencias |
| GET | `/api/v1/bid-cambio/preferencias/grid` | Grid do usuario |
| PUT | `/api/v1/bid-cambio/preferencias/grid` | Salvar grid do usuario |

### Rotas Protegidas — Portal da Corretora (auth separado)

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/bid-cambio/portal/dashboard` | Dashboard da corretora |
| GET | `/api/v1/bid-cambio/portal/cotacoes-pendentes` | Cotacoes aguardando resposta |
| GET | `/api/v1/bid-cambio/portal/minhas-respostas` | Historico de respostas |
| POST | `/api/v1/bid-cambio/portal/responder/:bidRequestId` | Responder cotacao (auth) |
| GET | `/api/v1/bid-cambio/portal/meu-desempenho` | Metricas da corretora |

---

## 5. Middleware Stack (index.ts)

```
1.  Helmet (security headers)
2.  Body parser (JSON, 10MB limit)
3.  CORS (localhost:5176, localhost:8003, CLIENT_URL)
4.  Static files (client build)
5.  Health check (GET /health — sem auth)
6.  Master data routes (GET /api/v1/master-data/* — sem auth)
7.  Portal public routes (token-based — sem auth)
8.  requireInternalKey middleware
9.  tenantIsolationMiddleware
10. Portal corretora routes (auth corretora)
11. Cambios routes (gestao parcelas)
12. Cotacoes routes (marketplace)
13. Bids routes (disparo)
14. Comparativo routes (ranking/aprovacao)
15. Corretoras routes (cadastro)
16. Avaliacoes routes (rating)
17. Dashboard routes (KPIs)
18. Preferencias routes
19. SPA fallback
20. Global error handler
```

---

## 6. Mapa de Reuso

### Servicos Gravity Reutilizados

| Servico | Porta | Uso no BID Cambio |
|---------|-------|-------------------|
| Configurador | 8003 | Auth Clerk, JWT, permissoes, workspace |
| Atividades | 8012 | Log de todas as acoes |
| Notificacoes | 8013 | Alertas in-app |
| Historico | 8014 | Audit trail (compliance BACEN) |
| GABI | 8015 | Analise IA de taxas |
| Agendamento | 8018 | Cron job diario 7h |
| Email | 8022 | Disparo de cotacoes + alertas |
| Dashboard | 8010 | KPIs cross-product |
| Relatorios | 8011 | Exportacao de relatorios |

### Componentes nucleo-global Reutilizados

| Componente | Uso |
|-----------|-----|
| TabelaGlobal | Grid de parcelas (25+ colunas, customizavel) |
| CaixaSelectGlobal | Filtros de status, moeda, corretora |
| InputTexto | Formularios (cotacao, pagamento) |
| ModalGlobal | Agendamento, pagamento (3 etapas), avaliacao |
| BadgeStatus | Status de parcelas e cotacoes |
| BotaoGlobal | Acoes (Agendar, Pagar, Disparar, Aprovar) |
| Loading | Skeleton/spinner |

### O que precisa ser criado do zero

| Componente/Engine | Justificativa |
|-------------------|-------------|
| parcelaEngine | Logica de gestao de parcelas (recalculo, retorno a pendente) — nao existe em BID Frete |
| vencimentoEngine | Calculo de datas de vencimento por metodo — especifico de cambio |
| emailEngine | Templates de e-mail especificos (alerta vencimento PT-BR, exportador EN) |
| CountdownTimer | Componente visual de validade da taxa (minutos) |
| GridCustomizavel | Extensao do TabelaGlobal com drag-and-drop de colunas + preferencia salva |

---

## 7. Estimativas de Complexidade

### Por Funcionalidade

| Funcionalidade | Tamanho | Justificativa |
|---------------|---------|-------------|
| Lista de Cambios (grid customizavel) | G | Grid com 25+ colunas, drag-and-drop, preferencia por usuario, filtros por coluna |
| Agendamento de Parcelas | P | Modal simples, batch update, follow-up |
| Pagamento de Cambio (3 etapas) | M | Fluxo multi-step, recalculo de saldo, anexos |
| parcelaEngine (recalculos) | G | Logica complexa: pagamento parcial, retorno a pendente, recalculo proporcional |
| vencimentoEngine | M | 7 metodos de calculo, fallback Data Esperada |
| Cotacao + Disparo | M | Formulario + bidEngine (reuso do padrao BID Frete) |
| Portal da Corretora | M | 7 telas, auth separado, dashboard |
| Comparativo + Aprovacao | M | Ranking, tags, savings (reuso do padrao BID Frete) |
| Rating de Corretoras | P | CRUD + calculo cross-tenant (reuso BID Frete) |
| E-mails Automaticos | M | 2 templates, cron job, logica de dias uteis/fim de semana |
| Preferencias do Tenant | P | CRUD de configuracao |
| Exportacao (CSV/Excel/PDF) | P | Biblioteca de export |
| Dashboard | M | KPIs, graficos, calendario de vencimentos |
| Resposta Publica (token) | P | Reuso do padrao BID Frete |

### Por Tela

| Tela | Complexidade |
|------|-------------|
| Dashboard Comprador | M |
| Lista de Cambios | G |
| Nova Cotacao | M |
| Detalhe Cotacao | M |
| Comparativo | M |
| Corretoras | P |
| Detalhe Corretora | P |
| Configuracoes | P |
| Modal Pagamento | M |
| Dashboard Corretora | M |
| Cotacoes Pendentes | P |
| Responder Cotacao | P |
| Minhas Respostas | P |
| Meu Desempenho | P |
| Responder Publico | P |
| Config Corretora | P |

### Estimativa Total MVP

| Categoria | Complexidade | Estimativa |
|-----------|-------------|-----------|
| Backend (models + engines + routes) | GG | 2-3 semanas |
| Frontend Comprador (9 telas) | G | 1-2 semanas |
| Frontend Corretora (7 telas) | M | 1 semana |
| Integracoes tenant | P | 2-3 dias |
| Testes | M | 1 semana |
| **TOTAL MVP** | **GG** | **4-6 semanas** |

---

## 8. Checklist de Seguranca

- [ ] Todo model Prisma tem `tenant_id` obrigatorio
- [ ] Todo endpoint tem validacao Zod
- [ ] `tenantIsolationMiddleware` no servidor
- [ ] `requireInternalKey` protege chamadas S2S
- [ ] JWT validado nas rotas protegidas
- [ ] Nenhuma query sem filtro `tenant_id` (exceto RatingCorretora)
- [ ] Health check sem auth em `/health`
- [ ] Nenhum `console.log` com dados sensiveis
- [ ] Variaveis via `process.env`, nunca hardcoded
- [ ] Erros via `AppError`, nunca `res.status().json()` direto
- [ ] Taxa de cambio nunca exposta sem auth (exceto PTAX publica)
- [ ] Token publico com expiracao (7 dias)
- [ ] Valores monetarios com precisao controlada (2 ou 4 casas)

---

## 9. Variaveis de Ambiente

```bash
PORT=8025
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/bid_cambio_db
INTERNAL_SERVICE_KEY=dev-key

# Tenant Services
EMAIL_SERVICE_URL=http://localhost:8022
ATIVIDADES_SERVICE_URL=http://localhost:8012
NOTIFICACOES_SERVICE_URL=http://localhost:8013
HISTORICO_SERVICE_URL=http://localhost:8014
GABI_SERVICE_URL=http://localhost:8015
AGENDAMENTO_SERVICE_URL=http://localhost:8018
DASHBOARD_SERVICE_URL=http://localhost:8010

# Application URLs
APP_URL=http://localhost:5176
CLIENT_URL=http://localhost:5176
PORTAL_CORRETORA_URL=http://localhost:5177

# PTAX (BCB)
BCB_PTAX_URL=https://olinda.bcb.gov.br/olinda/servico/PTAX
```
