# Arquitetura Tecnica — LPCO (Licencas, Permissoes, Certificados e Outros)

> **Versao:** 1.0
> **Data:** 30/03/2026
> **Elaborado por:** Tech Lead — Dream Team de Produtos

---

## 1. PRODUCT_CONFIG

```typescript
export const PRODUCT_CONFIG = {
  id: 'lpco',
  name: 'LPCO',
  description: 'Licencas, Permissoes, Certificados e Outros',
  icon: 'FileCheck2',
  color: '#10B981',    // emerald-500 — compliance/aprovacao
  basePath: '/lpco',
  serverPort: 8027,
  tenantServices: ['email', 'notifications', 'history', 'dashboard'],
  productServices: [],
  navigation: [
    { label: 'LPCOs', path: '/lpco', icon: 'FileCheck2', permission: 'lpco:read' },
    { label: 'Novo LPCO', path: '/lpco/novo', icon: 'Plus', permission: 'lpco:create' },
    { label: 'Simulador TA', path: '/lpco/simulador', icon: 'Search', permission: 'lpco:read' },
    { label: 'Dashboard', path: '/lpco/dashboard', icon: 'LayoutDashboard', permission: 'lpco:dashboard' },
  ],
}
```

---

## 2. Estrutura de Pastas

```
produto/lpco/
├── package.json                    (workspaces: ["client", "server"])
├── client/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts              (port: 5182)
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── pages/
│       │   ├── LpcoLista/
│       │   │   ├── LpcoLista.tsx            # T-01: Grid de LPCOs
│       │   │   └── LpcoLista.css
│       │   ├── LpcoNovo/
│       │   │   ├── LpcoNovoEscolhaCanal.tsx # T-00: Step 0 — como criar
│       │   │   ├── LpcoNovoDadosGerais.tsx  # T-02: Step 1
│       │   │   ├── LpcoNovoItens.tsx        # T-03: Step 2
│       │   │   ├── LpcoNovoRevisao.tsx      # T-04: Step 3
│       │   │   ├── LpcoImportPlanilha.tsx   # Canal: upload Excel/CSV
│       │   │   ├── LpcoSmartRead.tsx        # Canal: upload doc → OCR+IA
│       │   │   └── LpcoNovo.css
│       │   ├── LpcoDetalhe/
│       │   │   ├── LpcoDetalhe.tsx          # T-05: Container com abas
│       │   │   ├── LpcoFormulario.tsx       # T-06: Aba formulario
│       │   │   ├── LpcoDocumentos.tsx       # T-07: Aba documentos
│       │   │   ├── LpcoExigencias.tsx       # T-08: Aba exigencias
│       │   │   ├── LpcoVinculos.tsx         # T-09: Aba vinculos
│       │   │   ├── LpcoHistorico.tsx        # T-10: Aba historico
│       │   │   └── LpcoDetalhe.css
│       │   └── LpcoSimulador/
│       │       ├── LpcoSimulador.tsx        # T-11: Simulador TA
│       │       └── LpcoSimulador.css
│       └── shared/
│           ├── config.ts                     # PRODUCT_CONFIG
│           ├── api.ts                        # REST client
│           ├── types.ts                      # Tipos do dominio
│           └── constants.ts                  # Orgaos, status, etc.
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.ts                          # Express + 11 middlewares
│       ├── routes/
│       │   ├── lpco.ts                       # CRUD de LPCOs
│       │   ├── lpcoItem.ts                   # CRUD de itens
│       │   ├── lpcoExigencia.ts              # Exigencias + respostas
│       │   ├── lpcoVinculo.ts                # Vinculos a processos
│       │   ├── lpcoDocumento.ts              # Upload/download documentos
│       │   ├── lpcoHistorico.ts              # Timeline (read-only)
│       │   └── simuladorTA.ts                # Simulador de tratamento
│       ├── middleware/
│       │   ├── requireInternalKey.ts
│       │   └── tenantIsolation.ts
│       ├── services/
│       │   ├── lpcoStatusEngine.ts           # Maquina de estados
│       │   ├── lpcoSaldoEngine.ts            # Controle de saldo (Flex)
│       │   ├── lpcoCancelamentoJob.ts        # Cron: cancelamento 90 dias
│       │   ├── lpcoAlertaService.ts          # Alertas de prazo
│       │   ├── lpcoImportService.ts          # Import de planilha (Excel/CSV)
│       │   └── lpcoSmartReadService.ts       # Orquestrador Smart Read → rascunho
│       ├── connectors/
│       │   ├── portalUnicoAdapter.ts         # Adapter: registro, consulta, exigencia
│       │   ├── portalUnicoAuth.ts            # Strategy: certificado digital vs token OAuth2
│       │   ├── portalUnicoTypes.ts           # Tipos da API do Portal Unico
│       │   └── simuladorTAConnector.ts       # Consulta tratamento administrativo
│       ├── validators/
│       │   ├── lpcoSchema.ts                 # Zod schemas
│       │   ├── lpcoItemSchema.ts
│       │   ├── lpcoVinculoSchema.ts
│       │   └── siscomexCredencialSchema.ts   # Zod para credenciais
│       └── lib/
│           ├── idGenerator.ts                # IDs corporativos
│           ├── orgaosAnuentes.ts             # Registry de orgaos + modelos
│           └── cryptoUtils.ts                # AES-256-GCM encrypt/decrypt
│   └── prisma/
│       ├── schema.base.prisma
│       ├── fragment.prisma
│       └── schema.prisma                     # GERADO (gitignore)
└── scripts/
    └── compose-schema.ts
```

---

## 3. Prisma Schema (fragment.prisma)

```prisma
// ============================================
// LPCO — Licencas, Permissoes, Certificados e Outros
// ============================================

model Lpco {
  id                    String    @id                     // lpco_id_XXXXXXX/YY
  tenant_id             String
  company_id            String
  product_id            String    @default("lpco")

  // Classificacao
  tipo_operacao         String                            // IMPORTACAO | EXPORTACAO
  tipo_lpco             String                            // POR_OPERACAO | FLEX | TAXA
  orgao_anuente         String                            // Sigla: ANVISA, MAPA, etc.
  modelo_lpco           String                            // Codigo do modelo: I00004, etc.

  // Dados gerais
  numero_portal         String?                           // Numero gerado pelo Portal Unico
  pais_procedencia      String                            // ISO 3166-1 alpha-2
  unidade_entrada       String?                           // Codigo da unidade RFB
  recinto_armazenamento String?
  fundamento_legal      String
  condicao_mercadoria   String?

  // Parceiros (escudo anti-conflito)
  importacao_exportador_id  String?                       // Fornecedor estrangeiro (imp)
  exportacao_importador_id  String?                       // Cliente estrangeiro (exp)

  // Canal de entrada e rastreabilidade
  canal_entrada         String    @default("MANUAL")      // MANUAL|PLANILHA|PEDIDO|SMART_READ|DUPLICAR|API
  pedido_origem_id      String?                           // Se canal=PEDIDO, ref ao Pedido de origem
  lpco_origem_id        String?                           // Se canal=DUPLICAR, ref ao LPCO copiado

  // Status e datas
  status                String    @default("rascunho")    // LpcoStatus enum
  data_registro         DateTime?                         // Quando registrado no Portal
  data_deferimento      DateTime?                         // Quando deferido
  data_vigencia_inicio  DateTime?                         // Inicio da vigencia
  data_vigencia_fim     DateTime?                         // Fim da vigencia
  data_ultima_exigencia DateTime?                         // Para calculo de cancelamento auto

  // Saldo (apenas FLEX)
  quantidade_deferida   Decimal?  @db.Decimal(18, 4)
  unidade_medida_saldo  String?

  // Metadados
  created_by            String
  updated_by            String?
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  // Relacoes
  itens                 LpcoItem[]
  exigencias            LpcoExigencia[]
  vinculos              LpcoVinculo[]
  documentos            LpcoDocumento[]
  historico             LpcoHistorico[]

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@index([tenant_id, company_id])
  @@index([tenant_id, company_id, status])
  @@index([tenant_id, company_id, orgao_anuente])
  @@index([status, data_ultima_exigencia])              // Para cron de cancelamento
  @@index([pedido_origem_id])
}

// ============================================
// Credenciais do Portal Unico Siscomex
// ============================================

model SiscomexCredencial {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String

  // Tipo de autenticacao
  tipo_auth             String                            // CERTIFICADO_DIGITAL | TOKEN_OAUTH2

  // Certificado Digital (AES-256-GCM)
  certificado_encrypted String?                           // .pfx criptografado
  certificado_senha_encrypted String?                     // Senha criptografada
  certificado_validade  DateTime?                         // Expiracao do certificado
  certificado_cn        String?                           // Common Name (CNPJ/CPF)

  // Token OAuth2 (AES-256-GCM)
  oauth_client_id       String?
  oauth_client_secret_encrypted String?
  oauth_scope           String?

  // Controle
  ultimo_uso            DateTime?
  status                String    @default("ativo")       // ativo | expirado | revogado

  created_by            String
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, company_id])
  @@unique([tenant_id, company_id, tipo_auth])
}

model LpcoItem {
  id                    String    @id                     // lpit_id_XXXXXXX/YY
  tenant_id             String
  company_id            String
  lpco_id               String

  // Produto
  ncm                   String                            // 8 digitos
  catalogo_produto_id   String?                           // Ref ao Catalogo de Produtos
  descricao_produto     String
  fabricante            String?
  exportador            String?

  // Quantidades e valores
  quantidade_estatistica  Decimal   @db.Decimal(18, 4)
  unidade_medida          String
  quantidade_comercial    Decimal?  @db.Decimal(18, 4)
  unidade_medida_comercial String?
  peso_liquido            Decimal   @db.Decimal(18, 4)
  vmle                    Decimal   @db.Decimal(18, 2)    // Valor Mercadoria Local Embarque
  moeda                   String                          // ISO 4217
  condicao_venda          String?                         // Incoterm

  // Atributos dinamicos do orgao anuente
  atributos             Json?                             // Array<LpcoAtributo>

  // Metadados
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  // Relacao
  lpco                  Lpco      @relation(fields: [lpco_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@index([lpco_id])
  @@index([ncm])
}

model LpcoExigencia {
  id                    String    @id                     // lpex_id_XXXXXXX/YY
  tenant_id             String
  company_id            String
  lpco_id               String

  // Exigencia do orgao
  numero_exigencia      Int                               // Sequencial dentro do LPCO
  descricao_exigencia   String                            // Texto da exigencia
  data_exigencia        DateTime                          // Quando o orgao formulou
  prazo_resposta        DateTime?                         // Deadline

  // Resposta do usuario
  resposta              String?                           // Texto da resposta
  data_resposta         DateTime?
  respondido_por        String?                           // user_id

  status                String    @default("pendente")    // pendente | respondida | aceita | rejeitada

  // Metadados
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  // Relacao
  lpco                  Lpco      @relation(fields: [lpco_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@index([lpco_id])
}

model LpcoVinculo {
  id                    String    @id                     // lpvc_id_XXXXXXX/YY
  tenant_id             String
  company_id            String
  lpco_id               String

  // Vinculo
  processo_id           String                            // Ref ao Processo (DUIMP/DU-E)
  tipo_documento        String                            // DUIMP | DUE
  numero_documento      String?                           // Numero da DUIMP/DU-E

  // Saldo consumido (LPCO Flex)
  quantidade_vinculada  Decimal?  @db.Decimal(18, 4)
  unidade_medida        String?

  // Status
  status                String    @default("ativo")       // ativo | cancelado

  // Metadados
  created_by            String
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  // Relacao
  lpco                  Lpco      @relation(fields: [lpco_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@index([lpco_id])
  @@index([processo_id])
}

model LpcoDocumento {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String
  lpco_id               String

  nome_arquivo          String
  tipo_documento        String                            // Categoria: fatura, certificado, laudo, etc.
  mime_type             String
  tamanho_bytes         Int
  storage_key           String                            // Referencia ao storage (S3/R2)

  uploaded_by           String
  created_at            DateTime  @default(now())

  lpco                  Lpco      @relation(fields: [lpco_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@index([lpco_id])
}

model LpcoHistorico {
  id                    String    @id @default(cuid())
  tenant_id             String
  company_id            String
  lpco_id               String

  // Evento
  evento                String                            // status_change, exigencia_recebida, etc.
  status_anterior       String?
  status_novo           String?
  descricao             String
  dados_extras          Json?                             // Metadados do evento

  // Quem
  user_id               String?                           // null = sistema (cron, webhook)
  user_nome             String?

  // Imutavel — sem updated_at
  created_at            DateTime  @default(now())

  lpco                  Lpco      @relation(fields: [lpco_id], references: [id])

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@index([lpco_id])
  @@index([lpco_id, created_at])
}
```

---

## 4. Endpoints da API

### LPCO Principal

| Metodo | Endpoint | Descricao | Auth | Body (Zod) |
|--------|----------|-----------|------|-----------|
| GET | `/api/v1/lpcos` | Listar LPCOs (paginado, filtrado) | S2S + tenant | query: status, orgao, tipo, page, limit |
| GET | `/api/v1/lpcos/:id` | Detalhar LPCO | S2S + tenant | — |
| POST | `/api/v1/lpcos` | Criar LPCO (rascunho) | S2S + tenant | LpcoCreateSchema |
| PUT | `/api/v1/lpcos/:id` | Atualizar LPCO (rascunho) | S2S + tenant | LpcoUpdateSchema |
| POST | `/api/v1/lpcos/:id/registrar` | Registrar (rascunho → para_analise) | S2S + tenant | — |
| POST | `/api/v1/lpcos/:id/cancelar` | Cancelar LPCO | S2S + tenant | LpcoCancelarSchema |
| POST | `/api/v1/lpcos/:id/atualizar-status` | Atualizar status (sync manual) | S2S + tenant | LpcoStatusSchema |
| POST | `/api/v1/lpcos/:id/duplicar` | Duplicar LPCO como novo rascunho | S2S + tenant | — |
| GET | `/api/v1/lpcos/stats` | KPIs de compliance | S2S + tenant | query: periodo |

### Itens

| Metodo | Endpoint | Descricao | Auth | Body (Zod) |
|--------|----------|-----------|------|-----------|
| GET | `/api/v1/lpcos/:id/itens` | Listar itens do LPCO | S2S + tenant | — |
| POST | `/api/v1/lpcos/:id/itens` | Adicionar item | S2S + tenant | LpcoItemCreateSchema |
| PUT | `/api/v1/lpcos/:id/itens/:itemId` | Atualizar item | S2S + tenant | LpcoItemUpdateSchema |
| DELETE | `/api/v1/lpcos/:id/itens/:itemId` | Remover item | S2S + tenant | — |

### Exigencias

| Metodo | Endpoint | Descricao | Auth | Body (Zod) |
|--------|----------|-----------|------|-----------|
| GET | `/api/v1/lpcos/:id/exigencias` | Listar exigencias | S2S + tenant | — |
| POST | `/api/v1/lpcos/:id/exigencias` | Registrar exigencia recebida | S2S + tenant | ExigenciaCreateSchema |
| POST | `/api/v1/lpcos/:id/exigencias/:exId/responder` | Responder exigencia | S2S + tenant | ExigenciaRespostaSchema |

### Vinculos

| Metodo | Endpoint | Descricao | Auth | Body (Zod) |
|--------|----------|-----------|------|-----------|
| GET | `/api/v1/lpcos/:id/vinculos` | Listar vinculos | S2S + tenant | — |
| POST | `/api/v1/lpcos/:id/vinculos` | Criar vinculo (consome saldo) | S2S + tenant | VinculoCreateSchema |
| DELETE | `/api/v1/lpcos/:id/vinculos/:vincId` | Cancelar vinculo (devolve saldo) | S2S + tenant | — |
| GET | `/api/v1/lpcos/:id/saldo` | Consultar saldo (Flex) | S2S + tenant | — |

### Documentos

| Metodo | Endpoint | Descricao | Auth | Body |
|--------|----------|-----------|------|------|
| GET | `/api/v1/lpcos/:id/documentos` | Listar documentos | S2S + tenant | — |
| POST | `/api/v1/lpcos/:id/documentos` | Upload documento | S2S + tenant | multipart/form-data |
| GET | `/api/v1/lpcos/:id/documentos/:docId/download` | Download documento | S2S + tenant | — |
| DELETE | `/api/v1/lpcos/:id/documentos/:docId` | Remover documento | S2S + tenant | — |

### Historico

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/lpcos/:id/historico` | Timeline de eventos | S2S + tenant |

### Simulador de Tratamento Administrativo

| Metodo | Endpoint | Descricao | Auth | Body (Zod) |
|--------|----------|-----------|------|-----------|
| GET | `/api/v1/simulador-ta` | Consultar NCM → orgaos anuentes | S2S + tenant | query: ncm, operacao |

### Importacao em Lote (Planilha)

| Metodo | Endpoint | Descricao | Auth | Body |
|--------|----------|-----------|------|------|
| POST | `/api/v1/lpcos/import/planilha` | Upload Excel/CSV → cria LPCOs em lote | S2S + tenant | multipart/form-data |
| GET | `/api/v1/lpcos/import/template` | Download template Excel | S2S + tenant | — |
| GET | `/api/v1/lpcos/import/:jobId/status` | Status do import em andamento | S2S + tenant | — |

### Smart Read

| Metodo | Endpoint | Descricao | Auth | Body |
|--------|----------|-----------|------|------|
| POST | `/api/v1/lpcos/smart-read` | Upload documento → OCR+IA → rascunho | S2S + tenant | multipart/form-data |
| GET | `/api/v1/lpcos/smart-read/:jobId` | Resultado da extracao | S2S + tenant | — |

### Auto-Preenchimento a partir de Pedido

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/lpcos/prefill/pedido/:pedidoId` | Retorna dados pre-preenchidos do Pedido | S2S + tenant |

### Credenciais do Portal Unico Siscomex

| Metodo | Endpoint | Descricao | Auth | Body (Zod) |
|--------|----------|-----------|------|-----------|
| GET | `/api/v1/siscomex/credenciais` | Listar credenciais configuradas | S2S + tenant | — |
| POST | `/api/v1/siscomex/credenciais/certificado` | Upload certificado digital (.pfx) | S2S + tenant | multipart + senha |
| POST | `/api/v1/siscomex/credenciais/token` | Salvar client_id + secret OAuth2 | S2S + tenant | SiscomexTokenSchema |
| POST | `/api/v1/siscomex/credenciais/testar` | Testar conexao com Portal Unico | S2S + tenant | — |
| DELETE | `/api/v1/siscomex/credenciais/:id` | Revogar credencial | S2S + tenant | — |

### Portal Unico — Operacoes Integradas

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/lpcos/:id/portal/registrar` | Registrar LPCO no Portal Unico | S2S + tenant |
| GET | `/api/v1/lpcos/:id/portal/sincronizar` | Sincronizar status do Portal Unico | S2S + tenant |
| POST | `/api/v1/lpcos/:id/portal/exigencia/:exId/responder` | Responder exigencia no Portal | S2S + tenant |
| POST | `/api/v1/lpcos/:id/portal/anexar` | Anexar documento no Portal Unico | S2S + tenant |
| POST | `/api/v1/portal/webhooks` | Receiver de webhooks do Portal Unico | Assinatura HMAC |

### Health

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | `/health` | Health check | Nenhum |

---

## 5. Portas

| Servico | Porta | Registro |
|---------|-------|---------|
| Server | 8027 | contracts.json |
| Client (dev) | 5182 | vite.config.ts |

---

## 6. Mapa de Reutilizacao

### Servicos que Vamos Reutilizar (0 esforco de criacao)

| Servico | Como Usar | Integracao |
|---------|----------|-----------|
| Notificacoes (tenant) | Alertas de prazo, mudanca de status | REST API |
| Email (tenant) | Notificacao de exigencia, cancelamento | REST API |
| Historico (tenant) | Audit trail de eventos | REST API |
| Dashboard (tenant) | Widget de KPIs LPCO | REST API |
| Configurador | Check-access, permissoes | JWT + REST API |
| API Cockpit | Tokens, docs, playground, webhooks para integracao ERP | Ja existe |
| Conector ERP | OData/SAP/REST para import de dados | Ja existe |
| Smart Read | OCR + IA para extracao de dados de documentos | Ja existe — reutilizar |

### Componentes do nucleo-global que Vamos Reutilizar

| Componente | Onde Usar | Props Principais |
|-----------|----------|-----------------|
| TabelaGlobal | T-01: Lista de LPCOs | columns, data, filters, pagination |
| CaixaSelectGlobal | T-02: Selecao de orgao, pais, modelo | options, value, onChange |
| InputTexto | T-02, T-03: Campos de formulario | label, value, error, onChange |
| ModalGlobal | Confirmacao de registro, cancelamento | title, children, onConfirm |
| BadgeStatus | T-01, T-05: Status do LPCO | status, variant |
| BotaoGlobal | Todas as telas: acoes | label, variant, onClick, loading |
| Loading | Todas as telas: skeleton | variant (skeleton/spinner) |
| TabsGlobal | T-05: Abas do detalhe | tabs, activeTab, onChange |

### O Que Precisa Ser Criado do Zero

| Item | Tipo | Complexidade | Justificativa |
|------|------|-------------|--------------|
| lpcoStatusEngine | Backend service | M | Maquina de estados especifica do LPCO |
| lpcoSaldoEngine | Backend service | M | Controle de saldo LPCO Flex |
| lpcoCancelamentoJob | Backend cron | P | Cancelamento automatico 90 dias |
| lpcoAlertaService | Backend service | P | Alertas de prazo |
| lpcoImportService | Backend service | M | Parser de Excel/CSV → validacao → criacao em lote |
| lpcoSmartReadService | Backend service | M | Orquestrador: upload → Smart Read → rascunho |
| portalUnicoAdapter | Backend connector | G | Adapter bidirecional com API do Portal Unico |
| portalUnicoAuth | Backend connector | G | Strategy: certificado digital + token OAuth2 + AES-256 |
| simuladorTAConnector | Backend connector | M | Consulta tratamento administrativo via API |
| FormularioDinamico | Frontend component | G | Renderiza atributos por orgao/modelo |
| TimelineLpco | Frontend component | M | Timeline de eventos do historico |
| SaldoIndicador | Frontend component | P | Barra visual de saldo consumido (Flex) |
| SimuladorTA | Frontend page + backend | G | NCM → orgaos × modelos |
| EscolhaCanalLpco | Frontend component | P | Step 0: cards para escolha de canal de entrada |
| ImportPlanilhaLpco | Frontend component | M | Upload + mapeamento de colunas + preview |
| SmartReadLpco | Frontend component | M | Upload + preview de extracao + confirmacao |
| ConfigCredenciais | Frontend page | M | Config certificado digital / token OAuth2 |

### Resumo

- **Reutilizado:** 6 servicos + 8 componentes
- **Criado do zero:** 18 itens (10 backend + 8 frontend)
- **Economia estimada:** ~3 semanas de desenvolvimento (reutilizacao)

---

## 7. Estimativa de Complexidade por Tela

| Tela | Frontend | Backend | Integracao | Total | Notas |
|------|---------|---------|-----------|-------|-------|
| T-01: Lista LPCOs | M | M | — | M | TabelaGlobal + filtros + paginacao |
| T-02: Dados Gerais | M | P | — | M | CaixaSelectGlobal para orgao/pais/modelo |
| T-03: Itens NCM | G | M | — | G | FormularioDinamico (atributos por orgao) |
| T-04: Revisao | P | M | — | M | Validacao Zod completa |
| T-05: Detalhe (container) | P | P | — | P | TabsGlobal |
| T-06: Aba Formulario | M | P | — | M | Readonly com dados formatados |
| T-07: Aba Documentos | M | M | Storage | M | Upload + download + preview |
| T-08: Aba Exigencias | M | M | — | M | Lista + formulario resposta |
| T-09: Aba Vinculos | M | G | Processo | G | Saldo engine + integracao |
| T-10: Aba Historico | M | P | — | M | TimelineLpco novo componente |
| T-11: Simulador TA | G | G | — | G | NCM → orgaos (dados complexos) |

### Resumo de Estimativa

| Categoria | Quantidade | Esforco Total |
|-----------|-----------|--------------|
| Infraestrutura (setup) | 1 | M (3-5 dias) |
| Telas simples (P) | 1 | 1-2 dias |
| Telas medias (M) | 6 | 18-30 dias |
| Telas complexas (G) | 4 | 4-8 semanas |
| Services backend | 4 | 1-2 semanas |
| **MVP Total** | — | **6-8 semanas** |

---

## 8. Diagrama de Fluxo de Dados

```
                    ┌──────────────────────────────────────────────┐
                    │            CANAIS DE ENTRADA                  │
                    │                                              │
                    │  Manual  Planilha  Pedido  SmartRead  API    │
                    │    │        │        │        │        │     │
                    └────┴────────┴────────┴────────┴────────┴─────┘
                                         ↓
Usuario → Client (React/Vite:5182) → Server (Express:8027)
                                           ↓
                                    [DB LPCO] (Prisma + RLS)
                                           ↓
                    ┌──────────────────────┼──────────────────────┐
                    ↓                      ↓                      ↓
             Configurador           Tenant Services          Processo
             (check-access)        (notif, email,           (vinculo
              :4001)                historico)               DUIMP/DUE)
                                                                 ↓
                    ┌────────────────────────────────────────────────┐
                    │         PORTAL UNICO SISCOMEX                  │
                    │                                                │
                    │  portalUnicoAuth (strategy pattern)            │
                    │  ┌─────────────────┐ ┌──────────────────┐     │
                    │  │ Certificado     │ │ Token OAuth2     │     │
                    │  │ Digital (.pfx)  │ │ (gov.br/Serpro)  │     │
                    │  │ AES-256-GCM    │ │ AES-256-GCM     │     │
                    │  └────────┬────────┘ └────────┬─────────┘     │
                    │           └──────────┬─────────┘               │
                    │                      ↓                         │
                    │  portalUnicoAdapter                             │
                    │  - Registrar LPCO  - Consultar status          │
                    │  - Responder exig. - Anexar docs               │
                    │  - Simular TA      - Receber webhooks (15)     │
                    └────────────────────────────────────────────────┘
```

---

## 9. Integracao com Portal Unico Siscomex

### APIs Consumidas

| API | Base URL (prod) | Autenticacao |
|-----|----------------|-------------|
| LPCO Importacao | `api.portalunico.siscomex.gov.br/portal/api/ext/lpco-importacao` | mTLS + JWT ou OAuth2 |
| LPCO Exportacao | `api.portalunico.siscomex.gov.br/portal/api/ext/lpco-exportacao` | mTLS + JWT ou OAuth2 |
| Tratamento Administrativo | `api.portalunico.siscomex.gov.br/portal/api/ext/tratamento-administrativo` | mTLS + JWT ou OAuth2 |
| Catalogo de Produtos | `api.portalunico.siscomex.gov.br/portal/api/ext/catalogo-produtos` | mTLS + JWT ou OAuth2 |

### Ambientes

| Ambiente | URL | Uso |
|----------|-----|-----|
| Treinamento | `val.portalunico.siscomex.gov.br` | Testes com dados ficticios |
| Producao | `api.portalunico.siscomex.gov.br` | Operacoes reais |

### Rate Limits do Portal Unico

| Ambiente | Limite |
|----------|--------|
| Producao | 60 req/min por certificado/token |
| Treinamento | 30 req/min |

### Strategy Pattern — Autenticacao

```typescript
// portalUnicoAuth.ts

interface PortalUnicoAuthStrategy {
  authenticate(): Promise<{ token: string; expiresAt: Date }>
  canWrite(): boolean
  getType(): 'CERTIFICADO_DIGITAL' | 'TOKEN_OAUTH2'
}

class CertificadoDigitalStrategy implements PortalUnicoAuthStrategy {
  // 1. Descriptografa .pfx do banco (AES-256-GCM)
  // 2. Faz mTLS handshake com Portal Unico
  // 3. Recebe JWT com validade de 1h
  // 4. Cache em memoria (nunca persiste JWT)
  // 5. Auto-refresh 5 min antes de expirar
  canWrite(): true  // certificado permite tudo
}

class TokenOAuth2Strategy implements PortalUnicoAuthStrategy {
  // 1. Descriptografa client_secret do banco (AES-256-GCM)
  // 2. POST /auth/oauth2/token (client_credentials)
  // 3. Recebe access_token
  // 4. Cache em memoria
  canWrite(): boolean  // depende do scope do token
}

// Adapter escolhe a melhor strategy disponivel
class PortalUnicoAdapter {
  async getAuth(tenantId: string, companyId: string): Promise<PortalUnicoAuthStrategy> {
    // 1. Busca credenciais do tenant/company
    // 2. Prioriza certificado digital (full access)
    // 3. Fallback para token OAuth2
    // 4. Se nenhum → throw AppError('CREDENCIAL_NAO_CONFIGURADA')
  }
}
```

### 15 Webhooks do Portal Unico

| # | Evento | Quando | Acao no Gravity |
|---|--------|--------|----------------|
| 1 | `talp-registro-lpco` | LPCO registrado | Atualizar status → PARA_ANALISE |
| 2 | `talp-incvinc-lpco` | Vinculado a DUIMP/DU-E | Criar LpcoVinculo |
| 3 | `talp-canvinc-lpco` | Vinculo cancelado | Cancelar LpcoVinculo + devolver saldo |
| 4 | `talp-altsit-lpco-int` | Status alterado | Sincronizar status via lpcoStatusEngine |
| 5 | `talp-incretif-lpco` | Retificacao solicitada | Registrar no historico |
| 6 | `talp-canc-retif` | Retificacao cancelada | Registrar no historico |
| 7 | `talp-incpror-lpco` | Prorrogacao solicitada | Atualizar data_vigencia_fim |
| 8 | `talp-canc-prorrog` | Prorrogacao cancelada | Reverter data_vigencia_fim |
| 9 | `talp-resposta-exig` | Resposta a exigencia | Atualizar LpcoExigencia |
| 10 | `talp-pen-due-averb` | TA pendente em DU-E averbada | Alerta ao usuario |
| 11 | `talp-inc-compat-lpco` | Compatibilidade solicitada | Registrar no historico |
| 12 | `talp-canc-compat` | Compatibilidade cancelada | Registrar no historico |
| 13 | `talp-msg-lpco-int` | Mensagem do operador | Criar notificacao |
| 14 | `talp-tentativa-pagamento` | Pagamento sinalizado | Registrar no historico |
| 15 | `talp-timeout-certif` | Timeout de certificado | Alerta ao usuario |

### 3 Modos de Operacao

| Modo | Credencial | Funcionalidades |
|------|-----------|----------------|
| **Integrado (certificado)** | e-CNPJ/e-CPF .pfx | Registrar, consultar, responder, anexar — tudo via API |
| **Integrado (token)** | OAuth2 client_credentials | Consultar status, simular TA — escrita depende do escopo |
| **Manual** | Nenhuma | Usuario opera no Portal por fora, atualiza status no Gravity |

---

## 10. Canais de Entrada — Arquitetura

### Step 0 — Escolha do Canal

```
┌─────────────────────────────────────────────────────┐
│          Como voce quer criar este LPCO?             │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Digitar  │  │ Planilha │  │ A partir │           │
│  │ manual   │  │ Excel/CSV│  │ do Pedido│           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                       │
│  ┌──────────┐  ┌──────────┐                          │
│  │ Smart    │  │ Duplicar │                          │
│  │ Read     │  │ existente│                          │
│  └──────────┘  └──────────┘                          │
│                                                       │
│  Via API? Use o API Cockpit (tokens, docs, etc.)      │
└─────────────────────────────────────────────────────┘
```

### Fluxo por Canal

| Canal | Fluxo |
|-------|-------|
| Manual | Step 0 → Step 1 (dados gerais) → Step 2 (itens) → Step 3 (revisao) → Registrar |
| Planilha | Step 0 → Upload → Mapeamento colunas → Preview → Confirmar → Cria N rascunhos |
| Pedido | Step 0 → Selecionar Pedido → Auto-preenche → Step 1 (completa orgao) → Step 2 (completa atributos) → Step 3 → Registrar |
| Smart Read | Step 0 → Upload docs → OCR+IA → Preview extracao (amarelo) → Confirma campos → Step 1 → Step 2 → Step 3 → Registrar |
| Duplicar | Step 0 → Selecionar LPCO → Copia → Step 1 (ajusta) → Step 2 (ajusta) → Step 3 → Registrar |
| API | POST /api/v1/lpcos com canal_entrada="API" → validacao Zod → cria rascunho ou registra direto |

### Auto-Preenchimento — Mapa de Campos

| Campo LPCO | Manual | Planilha | Pedido | Smart Read | API |
|-----------|--------|----------|--------|-----------|-----|
| tipo_operacao | Digita | Coluna | Auto (Pedido) | Inferido | Enviado |
| orgao_anuente | Digita | Coluna | Digita | Inferido (NCM) | Enviado |
| pais_procedencia | Digita | Coluna | Auto (Pedido) | Extraido (fatura) | Enviado |
| exportador | Digita | Coluna | Auto (Pedido) | Extraido (fatura) | Enviado |
| NCM | Digita | Coluna | Auto (PedidoItem) | Extraido (fatura) | Enviado |
| quantidade | Digita | Coluna | Auto (PedidoItem) | Extraido (packing) | Enviado |
| peso | Digita | Coluna | Auto (PedidoItem) | Extraido (packing) | Enviado |
| vmle | Digita | Coluna | Auto (PedidoItem) | Extraido (fatura) | Enviado |
| moeda | Digita | Coluna | Auto (Pedido) | Extraido (fatura) | Enviado |
| atributos orgao | Digita | Coluna | Digita | Parcial (laudo) | Enviado |

---

## 11. Seguranca — Checklist

- [ ] Todo model Prisma tem `tenant_id` + `company_id` obrigatorios
- [ ] 3+ indices por model incluindo `[tenant_id]`
- [ ] `tenantIsolationMiddleware` no Express
- [ ] `requireInternalKey` em chamadas S2S
- [ ] JWT validado em rotas protegidas via `@clerk/backend`
- [ ] Validacao Zod em toda rota de criacao/atualizacao
- [ ] Anti-enumeracao: HTTP 404 para cross-tenant (nao 403)
- [ ] Health check `/health` sem autenticacao
- [ ] Nenhum `console.log` com dados sensíveis
- [ ] Variaveis de ambiente via `process.env`
- [ ] Erros via `AppError`
- [ ] `LpcoHistorico` append-only (sem UPDATE/DELETE)
- [ ] Upload de documentos com validacao de tipo e tamanho
- [ ] Certificado digital .pfx armazenado com AES-256-GCM
- [ ] Senha do certificado NUNCA em plain text — AES-256-GCM
- [ ] JWT do Portal Unico cacheado em memoria APENAS — nunca no banco
- [ ] OAuth client_secret criptografado com AES-256-GCM
- [ ] Alerta 30 dias antes do vencimento do certificado
- [ ] Smart Read: campos extraidos requerem confirmacao humana
