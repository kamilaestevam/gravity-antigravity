# Fluxo Tecnico Completo — Gravity Platform

Documentacao tecnica de todas as rotas, APIs, guards e branching logic da plataforma.

---

## Arquitetura de Navegacao (Visao Geral)

```mermaid
flowchart TD
    VISIT(["localhost:8000"]) --> ROOT["RootRedirect"]
    ROOT --> IS_SIGNED{"isSignedIn?
    Clerk useAuth"}

    IS_SIGNED -->|NAO| AUTH["AuthPage
    /sign-in /sign-up /forgot-password"]
    AUTH -->|"PublicRoute guard:
    se logado expulsa"| IS_SIGNED

    IS_SIGNED -->|SIM| SEL_WS["/selecionar-workspace
    ProtectedRoute"]

    SEL_WS --> API_COMPANIES["GET /api/v1/tenants/companies
    Bearer token"]
    API_COMPANIES --> API_STATUS{"Response status?"}

    API_STATUS -->|"401 user sem
    tenant no DB"| TRIAL["/trial Onboarding"]
    API_STATUS -->|"200 OK"| HAS_COMPANIES{"companies.length?"}

    TRIAL --> TX["Transacao atomica cria:
    Tenant + User + Subscription + Company"]
    TX --> SEL_WS

    HAS_COMPANIES -->|"0"| EMPTY["Nenhuma empresa
    + Botao criar"]
    HAS_COMPANIES -->|">= 1"| LIST_WS["Lista cards"]
    LIST_WS --> HUB

    HUB["/hub"] --> CP_ACTIVE{"Company products?"}
    CP_ACTIVE -->|"> 0"| SHOW_CARDS["Cards clicaveis"]
    CP_ACTIVE -->|"0"| CHECK_TENANT{"Tenant products?"}
    CHECK_TENANT -->|"> 0"| AUTO_ENABLE["Auto-habilita"]
    CHECK_TENANT -->|"0"| STORE
    AUTO_ENABLE --> SHOW_CARDS

    STORE["/store"] --> HANDLE_SUB["Subscribe + auto-enable company"]
    HANDLE_SUB --> SHOW_CARDS

    SHOW_CARDS --> PRODUCT["/produto/slug
    React.lazy + Shell Layout"]

    classDef api fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef page fill:#0f172a,stroke:#334155,color:#e2e8f0
    classDef auto fill:#064e3b,stroke:#10b981,color:#d1fae5

    class API_COMPANIES,TX,HANDLE_SUB api
    class IS_SIGNED,API_STATUS,HAS_COMPANIES,CP_ACTIVE,CHECK_TENANT decision
    class AUTH,SEL_WS,HUB,STORE,PRODUCT page
    class AUTO_ENABLE auto
```

---

## 1. Fluxo de Autenticacao

```mermaid
flowchart LR
    VISIT(["Request /"]) --> ROOT["RootRedirect"]
    ROOT --> LOADED{"isLoaded?"}
    LOADED -->|Nao| NULL["return null
    evita flash"]
    LOADED -->|Sim| SIGNED{"isSignedIn?"}

    SIGNED -->|Nao| AUTH["AuthPage
    Clerk SignIn/SignUp"]
    SIGNED -->|Sim| REDIRECT["Navigate to
    /selecionar-workspace"]

    AUTH --> CLERK["Clerk processa:
    email+senha ou Google"]
    CLERK --> WEBHOOK["Webhook: user.created
    POST /api/v1/webhooks/clerk
    svix signature verify"]
    WEBHOOK --> SIGNED

    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef page fill:#0f172a,stroke:#334155,color:#e2e8f0
    classDef api fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0

    class LOADED,SIGNED decision
    class AUTH,ROOT,REDIRECT,NULL page
    class CLERK,WEBHOOK api
```

**Guards de rota:**

| Guard | Comportamento | Usado em |
|-------|--------------|----------|
| `PublicRoute` | Se logado → redirect /selecionar-workspace | /sign-in, /sign-up, /forgot-password |
| `ProtectedRoute` | Se nao logado → RedirectToSignIn | /hub, /store, /workspace/*, /admin/* |
| `RootRedirect` | Logado → /selecionar-workspace, Nao → AuthPage | / |

---

## 2. Fluxo de Onboarding (User Novo)

```mermaid
flowchart TD
    SEL["/selecionar-workspace"] --> FETCH["GET /api/v1/tenants/companies
    Authorization: Bearer token"]
    FETCH --> AUTH_MW["requireAuth middleware"]

    AUTH_MW --> FIND["prisma.user.findFirst
    where: clerk_user_id = verified.sub"]
    FIND --> EXISTS{"User existe no DB?"}

    EXISTS -->|Nao| ERR401["401 UNAUTHORIZED
    'Usuario nao encontrado'"]
    ERR401 --> REDIRECT["Frontend: navigate /trial"]

    EXISTS -->|Sim| RETURN["200 OK
    companies: Company array"]

    REDIRECT --> TRIAL["/trial Onboarding"]
    TRIAL --> FORM["User preenche nome da empresa"]
    FORM --> SLUG["Gera slug: lowercase, normalizado"]
    SLUG --> POST["POST /api/v1/tenants"]

    POST --> TRANSACTION["prisma.$transaction"]
    TRANSACTION --> T1["1. Verifica slug unico"]
    T1 --> T2["2. Verifica user sem tenant"]
    T2 --> T3["3. Cria Tenant
    status: PENDING_SETUP"]
    T3 --> T4["4. Cria User
    role: MASTER
    clerk_user_id vinculado"]
    T4 --> T5["5. Cria Subscription
    plan: STARTER
    trial: 14 dias"]
    T5 --> T6["6. Cria Company
    name: nome do tenant
    status: ACTIVE"]

    T6 --> CHECKOUT["POST /api/v1/billing/checkout
    Stripe session"]
    CHECKOUT --> BACK["Redirect /selecionar-workspace
    agora tem 1 company"]

    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef api fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef auto fill:#064e3b,stroke:#10b981,color:#d1fae5
    classDef error fill:#451a1a,stroke:#ef4444,color:#fca5a5

    class EXISTS decision
    class FETCH,POST,CHECKOUT api
    class T3,T4,T5,T6,TRANSACTION auto
    class ERR401 error
```

**Validacoes na transacao:**

| Check | Erro se falhar |
|-------|---------------|
| Slug ja existe | 409 CONFLICT |
| clerk_user_id ja tem tenant | 409 CONFLICT |

---

## 3. Fluxo de Selecao de Workspace

```mermaid
flowchart TD
    PAGE["/selecionar-workspace"] --> FETCH["GET /api/v1/tenants/companies"]
    FETCH --> STATUS{"Response?"}

    STATUS -->|"401"| TRIAL["redirect /trial"]
    STATUS -->|"200"| DATA["Recebe companies array"]

    DATA --> MAP["Mapeia para componente visual:
    id, nome, cnpj, plano, cor, iniciais"]

    MAP --> COUNT{"companies.length?"}
    COUNT -->|"0"| EMPTY["Nenhuma empresa encontrada
    + Botao criar nova empresa"]
    COUNT -->|">= 1"| LIST["Renderiza cards"]

    LIST --> CLICK["Usuario clica no card"]
    CLICK --> SAVE["sessionStorage.setItem:
    gravity_company_id
    gravity_company_name"]
    SAVE --> NAV["navigate /hub
    delay 600ms animacao"]

    EMPTY --> CREATE["Botao: Criar nova empresa
    navigate /workspace/workspaces"]

    LIST --> ADMIN{"publicMetadata.role
    === gravity_admin?"}
    ADMIN -->|Sim| ADMIN_BTN["Botao verde:
    Acessar Painel Admin
    navigate /admin"]
    ADMIN -->|Nao| HIDDEN["oculto"]

    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef api fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef storage fill:#064e3b,stroke:#10b981,color:#d1fae5

    class STATUS,COUNT,ADMIN decision
    class FETCH api
    class SAVE storage
```

---

## 4. Fluxo do Hub (Carregamento de Produtos)

```mermaid
flowchart TD
    HUB["/hub monta"] --> CHECK_SS{"sessionStorage
    gravity_company_id?"}

    CHECK_SS -->|Nao| NO_COMPANY["loading = false
    sem produtos"]
    CHECK_SS -->|Sim| FETCH_CP["GET /api/v1/companies/companyId/products
    Bearer token"]

    FETCH_CP --> VERIFY["Backend: verifica
    company.tenant_id === req.auth.tenantId"]
    VERIFY --> RES_CP["Response: CompanyProduct array"]

    RES_CP --> FILTER["filter: is_active === true"]
    FILTER --> HAS_CP{"activeProducts.length?"}

    HAS_CP -->|"> 0"| RENDER["Renderiza cards clicaveis
    click: navigate /produto/slug"]

    HAS_CP -->|"0"| FETCH_TP["GET /api/v1/assinaturas
    Bearer token"]
    FETCH_TP --> FILTER_TP["filter: is_active === true"]
    FILTER_TP --> HAS_TP{"tenantActive.length?"}

    HAS_TP -->|"> 0"| AUTO["Para cada produto do tenant:
    POST /companies/companyId/products
    body: product_key"]
    AUTO --> REFRESH["GET /companies/companyId/products
    recarrega"]
    REFRESH --> RENDER

    HAS_TP -->|"0"| EMPTY["Nenhum produto habilitado
    CTA: Ir para Store
    navigate /store"]

    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef api fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef auto fill:#064e3b,stroke:#10b981,color:#d1fae5

    class CHECK_SS,HAS_CP,HAS_TP decision
    class FETCH_CP,FETCH_TP,AUTO,REFRESH api
    class AUTO auto
```

---

## 5. Fluxo da Store (Contratacao)

```mermaid
flowchart TD
    STORE["/store monta"] --> PARALLEL["Promise.all"]
    PARALLEL --> CAT["GET /api/v1/products
    publico, sem auth
    catalogo completo"]
    PARALLEL --> SUB["GET /api/v1/assinaturas
    Bearer token
    produtos contratados"]

    CAT --> FILTER_CAT["filter: status === Ativo"]
    SUB --> MAP_SUB["Map: product_key → SubscribedProduct"]

    FILTER_CAT --> EACH["Para cada produto no catalogo"]
    MAP_SUB --> EACH

    EACH --> STATUS{"getStatus: subscribed.get slug
    is_active?"}

    STATUS -->|"owned"| CARD_OWNED["Card com:
    Badge verde Contratado
    Botao Acessar Produto
    Card clicavel"]
    CARD_OWNED -->|click| NAV_PROD["navigate /produto/slug"]

    STATUS -->|"available"| CARD_AVAIL["Card com:
    Preco + Botao Contratar"]
    CARD_AVAIL -->|click| SUBSCRIBE["handleSubscribe slug"]

    SUBSCRIBE --> S1["1. POST /api/v1/assinaturas/subscribe
    body: product_key: slug"]
    S1 --> S1_OK{"res.ok?"}
    S1_OK -->|Sim| S2["2. POST /companies/companyId/products
    body: product_key: slug
    companyId from sessionStorage"]
    S1_OK -->|Nao| ERROR["Erro silencioso"]

    S2 --> UPDATE["setSubscribed: adiciona ao Map
    Card muda para owned"]

    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef api fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef auto fill:#064e3b,stroke:#10b981,color:#d1fae5

    class STATUS,S1_OK decision
    class S1,S2 api
    class UPDATE auto
```

---

## 6. Fluxo de Carregamento do Produto

```mermaid
flowchart TD
    ROUTE["Route path=/produto/simula-custo/*"] --> GUARD["ProtectedRoute
    SignedIn / SignedOut"]
    GUARD --> SUSPENSE["React.Suspense
    fallback: Carregando produto..."]
    SUSPENSE --> LAZY["React.lazy
    import App from produto/simula-custo"]

    LAZY --> APP["SimulaCusto App monta"]
    APP --> SHELL["Shell Layout
    Sidebar + Header + Main"]

    SHELL --> SIDEBAR["MenuLateralGlobal
    navItems from PRODUCT_CONFIG"]
    SHELL --> HEADER["Header global"]
    SHELL --> MAIN["main area"]

    MAIN --> ROUTES["Routes relativas:
    sem / no inicio"]
    ROUTES --> R1["index → Navigate to dashboard"]
    ROUTES --> R2["dashboard → DashboardSimulaCusto"]
    ROUTES --> R3["estimativas → Estimativas"]
    ROUTES --> R4["relatorios → Relatorios"]
    ROUTES --> R5["meu-espaco → GlobalDashboard"]
    ROUTES --> R6["meu-espaco/atividades"]
    ROUTES --> R7["meu-espaco/email"]
    ROUTES --> R8["meu-espaco/whatsapp"]
    ROUTES --> R9["historico"]
    ROUTES --> R10["* → Navigate to dashboard"]

    classDef shell fill:#3b1f5e,stroke:#8b5cf6,color:#e2e8f0
    classDef route fill:#0f172a,stroke:#334155,color:#e2e8f0
    classDef guard fill:#1e293b,stroke:#818cf8,color:#f1f5f9

    class SHELL,SIDEBAR,HEADER shell
    class R1,R2,R3,R4,R5,R6,R7,R8,R9,R10 route
    class GUARD,SUSPENSE guard
```

**Importante — rotas relativas:**
- Todas as rotas do produto usam paths sem `/` no inicio
- React Router v6 resolve relativo ao parent match `/produto/simula-custo/*`
- `dashboard` resolve para `/produto/simula-custo/dashboard`
- Funciona igual em standalone (porta 8001) e embedded (porta 8000)

---

## 7. Fluxo de Seguranca (requireAuth)

```mermaid
flowchart LR
    REQ(["Request HTTP"]) --> HEADER{"Authorization
    header presente?"}
    HEADER -->|Nao| ERR1["401: Token ausente"]
    HEADER -->|Sim| EXTRACT["Extrai token:
    Bearer xxx → xxx"]

    EXTRACT --> VERIFY["clerkClient.verifyToken
    token"]
    VERIFY --> VALID{"Token valido?"}
    VALID -->|Nao| ERR2["401: Token invalido
    ou expirado"]
    VALID -->|Sim| SUB["Extrai verified.sub
    clerk_user_id"]

    SUB --> FIND["prisma.user.findFirst
    where: clerk_user_id"]
    FIND --> EXISTS{"User existe?"}
    EXISTS -->|Nao| ERR3["401: Usuario nao
    encontrado no sistema"]
    EXISTS -->|Sim| INJECT["req.auth =
    userId + tenantId + clerkUserId"]

    INJECT --> NEXT["next - prossegue
    para o handler da rota"]

    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef error fill:#451a1a,stroke:#ef4444,color:#fca5a5
    classDef success fill:#064e3b,stroke:#10b981,color:#d1fae5

    class HEADER,VALID,EXISTS decision
    class ERR1,ERR2,ERR3 error
    class INJECT,NEXT success
```

---

## 8. Fluxo de Tenant Isolation

```mermaid
flowchart TD
    REQ(["Request autenticado"]) --> AUTH["req.auth.tenantId
    injetado pelo requireAuth"]

    AUTH --> QUERY["Toda query Prisma filtra:
    WHERE tenant_id = req.auth.tenantId"]

    QUERY --> Q1["Companies:
    company.tenant_id === tenantId"]
    QUERY --> Q2["Users:
    user.tenant_id === tenantId"]
    QUERY --> Q3["Products:
    productConfig.tenant_id === tenantId"]
    QUERY --> Q4["Company Products:
    companyProduct.tenant_id === tenantId"]

    Q1 --> RESULT["Retorna apenas dados
    do tenant do usuario"]
    Q2 --> RESULT
    Q3 --> RESULT
    Q4 --> RESULT

    RESULT --> CROSS{"Tentou acessar
    dado de outro tenant?"}
    CROSS -->|"Query retorna vazio"| SAFE["404 ou array vazio
    dados protegidos"]

    classDef auth fill:#064e3b,stroke:#10b981,color:#d1fae5
    classDef query fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
    classDef safe fill:#064e3b,stroke:#10b981,color:#d1fae5
    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9

    class AUTH auth
    class Q1,Q2,Q3,Q4 query
    class SAFE safe
    class CROSS decision
```

---

## Mapa de Rotas

### Rotas Publicas
| Rota | Componente | Guard |
|------|-----------|-------|
| `/` | RootRedirect | Nenhum — redireciona baseado em auth |
| `/sign-in/*` | AuthPage | PublicRoute (se logado → expulsa) |
| `/sign-up/*` | AuthPage | PublicRoute |
| `/forgot-password/*` | AuthPage | PublicRoute |
| `/trial` | Onboarding | Nenhum (Clerk embutido) |

### Rotas Protegidas (requer login)
| Rota | Componente | Dados |
|------|-----------|-------|
| `/selecionar-workspace` | SelecionarWorkspace | GET /tenants/companies |
| `/hub` | Hub | GET /companies/{id}/products |
| `/store` | Store | GET /products + GET /api/v1/assinaturas |
| `/produto/simula-custo/*` | SimulaCustoApp (lazy) | PRODUCT_CONFIG, rotas relativas |
| `/produto/processo/*` | ProcessoApp (lazy) | PRODUCT_CONFIG, rotas relativas |

### Rotas Workspace (requer login)
| Rota | Componente |
|------|-----------|
| `/workspace/organizacao` | Organizacao |
| `/workspace/workspaces` | Workspaces |
| `/workspace/usuarios` | Usuarios |
| `/workspace/assinaturas` | Assinaturas |
| `/workspace/financeiro` | Financeiro |
| `/workspace/api-cockpit` | ApiCockpit |
| `/workspace/conector-cargowise` | ConectorCargoWise |

### Rotas Admin (requer gravity_admin)
| Rota | Componente |
|------|-----------|
| `/admin/visao-geral` | VisaoGeralAdmin |
| `/admin/usuarios` | UsuariosGlobaisAdmin |
| `/admin/produtos` | ProdutosAdmin |
| `/admin/financeiro` | AdminFinanceiro |
| `/admin/historico` | HistoricoGlobalAdmin |
| `/admin/deploy` | DeployRailwayAdmin |
| `/admin/testes` | LogTestes |
| `/admin/apis` | MonitorApisAdmin |
| `/admin/tenants` | AdminPanel |
| `/admin/tenant/:id` | TenantDetail |

---

## APIs Backend

### Autenticacao
| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| POST | `/api/v1/webhooks/clerk` | svix signature | Sincroniza user.created/updated/deleted |

### Tenants
| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| POST | `/api/v1/tenants` | Nenhum | Cria tenant + user + subscription + company |
| GET | `/api/v1/tenants/me` | requireAuth | Dados do tenant atual |
| GET | `/api/v1/tenants/companies` | requireAuth | Lista companies do tenant |
| POST | `/api/v1/tenants/companies` | requireAuth | Cria company (limite por plano) |

### Produtos — Nivel Tenant
| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | `/api/v1/assinaturas` | requireAuth | Lista produtos contratados |
| POST | `/api/v1/assinaturas/subscribe` | requireAuth | Contrata produto do catalogo |
| DELETE | `/api/v1/assinaturas/:key` | requireAuth | Cancela produto (soft delete) |

### Produtos — Nivel Company
| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | `/api/v1/companies/:id/products` | requireAuth | Lista produtos do workspace |
| POST | `/api/v1/companies/:id/products` | requireAuth | Ativa produto no workspace |
| DELETE | `/api/v1/companies/:id/products/:key` | requireAuth | Desativa produto no workspace |

### Catalogo (publico)
| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | `/api/v1/products` | Nenhum | Lista catalogo de produtos ativos |

### Acesso Interno
| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | `/api/internal/check-access` | x-internal-key | Valida acesso do produto |

---

## Persistencia de Estado

| Local | Chave | Dado | Lifecycle |
|-------|-------|------|-----------|
| Clerk (browser) | JWT | Token de autenticacao | Por sessao, auto-refresh |
| Clerk | publicMetadata | role, tenantId | Permanente |
| sessionStorage | `gravity_company_id` | ID da company selecionada | Ate fechar aba |
| sessionStorage | `gravity_company_name` | Nome da company | Ate fechar aba |
| localStorage | `gravity-shell-state` | tema, sidebar, tooltips | Permanente |
| PostgreSQL | Tenant, User, Company | Dados de negocio | Permanente |
| PostgreSQL | ProductConfig | Produtos contratados (tenant) | Permanente |
| PostgreSQL | CompanyProduct | Produtos habilitados (workspace) | Permanente |

---

## Hierarquia de Dados

```mermaid
flowchart TD
    TENANT["Tenant - organizacao"] --> SUB["Subscription
    STARTER / PROFESSIONAL / ENTERPRISE"]
    TENANT --> USERS["User array
    clerk_user_id
    role: MASTER / STANDARD / SUPPLIER"]
    TENANT --> PC["ProductConfig array
    produtos contratados pelo tenant"]
    TENANT --> COMPANIES["Company array - workspaces"]

    COMPANIES --> CP["CompanyProduct array
    produtos ativos neste workspace"]
    COMPANIES --> UM["UserMembership array
    usuarios vinculados a esta company"]

    classDef root fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef entity fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef child fill:#0f172a,stroke:#334155,color:#e2e8f0

    class TENANT root
    class SUB,USERS,PC,COMPANIES entity
    class CP,UM child
```

## Limites por Plano

| Plano | Max Companies | Trial |
|-------|:---:|:---:|
| STARTER | 2 | 14 dias |
| PROFESSIONAL | 20 | — |
| ENTERPRISE | 50 | — |
