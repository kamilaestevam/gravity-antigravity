# Fluxo do Usuario — Gravity Platform

Jornada completa do usuario desde o primeiro acesso ate o uso do produto.

---

## Fluxograma Geral

```mermaid
flowchart TD
    START(["Acessa gravity.com.br"]) --> CHECK_LOGIN{"Tem conta?"}

    %% ── Autenticacao ──
    CHECK_LOGIN -->|Nao| SIGNUP["Criar Conta"]
    CHECK_LOGIN -->|Sim| LOGIN["Fazer Login"]
    SIGNUP --> LOGIN
    LOGIN --> CHECK_ORG{"Ja tem uma organizacao?"}

    %% ── Primeira vez (sem organizacao) ──
    CHECK_ORG -->|Nao| ONBOARDING["Configurar Organizacao"]
    ONBOARDING --> FILL_ORG["Preenche nome da empresa"]
    FILL_ORG --> AUTO_CREATE["Sistema cria automaticamente:
    - Organizacao
    - Primeiro Workspace
    - Periodo de teste 14 dias"]
    AUTO_CREATE --> SELECT_WS

    %% ── Selecionar Workspace ──
    CHECK_ORG -->|Sim| SELECT_WS{"Selecionar Workspace"}
    SELECT_WS --> HAS_MANY{"Quantos workspaces?"}
    HAS_MANY -->|"1 workspace"| AUTO_SELECT["Seleciona automaticamente"]
    HAS_MANY -->|"2+ workspaces"| PICK_WS["Escolhe qual acessar"]
    AUTO_SELECT --> HUB
    PICK_WS --> HUB

    %% ── Hub Principal ──
    HUB["Hub — Painel Principal"]
    HUB --> HAS_PRODUCTS{"Tem produtos ativos?"}

    %% ── Sem produtos ──
    HAS_PRODUCTS -->|Nenhum| GO_STORE["Ir para a Store"]
    GO_STORE --> STORE

    %% ── Com produtos ──
    HAS_PRODUCTS -->|Sim| SHOW_PRODUCTS["Mostra cards dos produtos"]
    SHOW_PRODUCTS --> CLICK_PRODUCT["Clica no produto"]
    CLICK_PRODUCT --> PRODUCT_APP

    %% ── Store ──
    STORE["Gravity Store — Catalogo"]
    STORE --> BROWSE["Navega pelos modulos"]
    BROWSE --> WANT_BUY{"Quer contratar?"}
    WANT_BUY -->|Nao| STORE
    WANT_BUY -->|Sim| SUBSCRIBE["Clica Contratar"]
    SUBSCRIBE --> ACTIVATED["Produto ativado no workspace"]
    ACTIVATED --> ACCESS_NOW{"Acessar agora?"}
    ACCESS_NOW -->|Sim| PRODUCT_APP
    ACCESS_NOW -->|Nao, depois| HUB

    %% ── Dentro do Produto ──
    PRODUCT_APP["Produto ex: SimulaCusto
    Menu lateral completo"]
    PRODUCT_APP --> USE_FEATURES["Usa as funcionalidades:
    - Dashboard
    - Estimativas
    - Relatorios
    - E-mails
    - WhatsApp
    - Historico"]

    %% ── Acoes do Hub ──
    HUB --> |"Menu"| ACTIONS{"Opcoes"}
    ACTIONS --> WS_MGMT["Gerenciar Workspace"]
    ACTIONS --> SWITCH_WS["Trocar Workspace"]
    ACTIONS --> STORE
    ACTIONS --> LOGOUT["Sair"]

    SWITCH_WS --> SELECT_WS
    LOGOUT --> START

    classDef startEnd fill:#6366f1,stroke:#4f46e5,color:#fff,rx:25
    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef action fill:#0f172a,stroke:#334155,color:#e2e8f0
    classDef highlight fill:#059669,stroke:#047857,color:#fff
    classDef store fill:#7c3aed,stroke:#6d28d9,color:#fff

    class START,LOGOUT startEnd
    class CHECK_LOGIN,CHECK_ORG,HAS_MANY,HAS_PRODUCTS,WANT_BUY,ACCESS_NOW,ACTIONS decision
    class LOGIN,SIGNUP,FILL_ORG,BROWSE,CLICK_PRODUCT,USE_FEATURES,WS_MGMT,SWITCH_WS action
    class AUTO_CREATE,ACTIVATED,AUTO_SELECT highlight
    class HUB,PRODUCT_APP,STORE store
```

---

## 1. Primeiro Acesso — Usuario Novo

```mermaid
flowchart LR
    A(["Acessa a plataforma"]) --> B["Tela de Login"]
    B --> C{"Tem conta?"}
    C -->|Nao| D["Clica em Criar Conta"]
    C -->|Sim| E["Digita email e senha"]
    D --> F["Preenche dados e cria conta"]
    F --> E
    E --> G["Login realizado"]
    G --> H{"Tem organizacao?"}
    H -->|Nao| I["Tela de Onboarding"]
    I --> J["Digita nome da empresa"]
    J --> K["Sistema cria tudo automaticamente"]
    K --> L(["Entra no Hub"])
    H -->|Sim| L

    classDef start fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef auto fill:#059669,stroke:#047857,color:#fff
    classDef step fill:#0f172a,stroke:#334155,color:#e2e8f0
    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9

    class A,L start
    class K auto
    class B,D,F,E,G,I,J step
    class C,H decision
```

**O que o sistema cria automaticamente no onboarding:**
- Organizacao (tenant) com status ativo
- Primeiro workspace com o nome da empresa
- Periodo de teste gratuito de 14 dias
- Usuario como Master (acesso total)

| Passo | O que acontece | O que o usuario ve |
|-------|---------------|-------------------|
| 1 | Acessa a plataforma | Tela de login com opcao de criar conta |
| 2 | Cria conta ou faz login | Formulario email + senha ou Google |
| 3 | Sistema detecta que nao tem organizacao | Redireciona para tela de configuracao |
| 4 | Preenche nome da empresa | Campo simples com nome da organizacao |
| 5 | Sistema cria tudo automaticamente | Organizacao + workspace + trial de 14 dias |
| 6 | Entra no Hub | Painel principal vazio, sem produtos ainda |

---

## 2. Contratando o Primeiro Produto

```mermaid
flowchart LR
    A(["Hub sem produtos"]) --> B["Mensagem: Nenhum produto"]
    B --> C["Clica: Ir para a Store"]
    C --> D["Gravity Store"]
    D --> E["Navega pelo catalogo"]
    E --> F["Escolhe um produto"]
    F --> G["Clica Contratar"]
    G --> H["Botao muda: Contratando..."]
    H --> I["Produto ativado"]
    I --> J{"O que fazer?"}
    J -->|"Acessar Produto"| K(["Entra no produto com menu lateral"])
    J -->|"Voltar ao Hub"| L(["Hub com card do produto"])

    classDef start fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef auto fill:#059669,stroke:#047857,color:#fff
    classDef step fill:#0f172a,stroke:#334155,color:#e2e8f0
    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9

    class A,K,L start
    class I auto
    class B,C,D,E,F,G,H step
    class J decision
```

**O que acontece nos bastidores ao contratar:**
- Produto e vinculado a organizacao (tenant)
- Produto e ativado automaticamente no workspace atual
- Nenhuma acao extra necessaria do usuario

| Passo | O que acontece | O que o usuario ve |
|-------|---------------|-------------------|
| 1 | Hub mostra que nao tem produtos | Mensagem com botao "Ir para a Store" |
| 2 | Clica e vai para a Store | Catalogo com todos os modulos disponiveis |
| 3 | Escolhe um produto e clica "Contratar" | Botao muda para "Contratando..." |
| 4 | Produto e ativado automaticamente | Card muda para "Contratado" com botao "Acessar" |
| 5 | Clica "Acessar Produto" | Entra no produto com menu lateral completo |

---

## 3. Uso Diario — Usuario Recorrente

```mermaid
flowchart LR
    A(["Abre a plataforma"]) --> B["Login automatico"]
    B --> C{"Quantos workspaces?"}
    C -->|"1"| D["Entra direto no Hub"]
    C -->|"2+"| E["Escolhe workspace"]
    E --> D
    D --> F["Ve seus produtos"]
    F --> G["Clica no produto"]
    G --> H(["Trabalha no produto"])

    H --> I["Dashboard"]
    H --> J["Estimativas"]
    H --> K["Relatorios"]
    H --> L["E-mails"]
    H --> M["WhatsApp"]

    classDef start fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef step fill:#0f172a,stroke:#334155,color:#e2e8f0
    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef feature fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0

    class A,H start
    class B,D,E,F,G step
    class C decision
    class I,J,K,L,M feature
```

| Passo | O que acontece | O que o usuario ve |
|-------|---------------|-------------------|
| 1 | Faz login | Vai direto para selecionar workspace |
| 2 | Seleciona workspace | Ve o Hub com seus produtos |
| 3 | Clica no produto | Abre com sidebar: Dashboard, Estimativas, etc. |
| 4 | Usa as funcionalidades | Tudo dentro do mesmo layout integrado |

---

## 4. Usuario Convidado

```mermaid
flowchart LR
    A(["Master convida por email"]) --> B["Convite chega no email"]
    B --> C["Clica no link do convite"]
    C --> D{"Ja tem conta Gravity?"}
    D -->|Nao| E["Cria conta"]
    D -->|Sim| F["Faz login"]
    E --> F
    F --> G["Sistema vincula ao workspace"]
    G --> H["Permissoes aplicadas automaticamente"]
    H --> I(["Entra no workspace com acesso definido"])

    classDef start fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef auto fill:#059669,stroke:#047857,color:#fff
    classDef step fill:#0f172a,stroke:#334155,color:#e2e8f0
    classDef decision fill:#1e293b,stroke:#818cf8,color:#f1f5f9

    class A,I start
    class G,H auto
    class B,C,E,F step
    class D decision
```

**O que o Master controla:**
- Qual role o convidado recebe (Standard ou Supplier)
- Em quais workspaces o convidado tem acesso
- Quais produtos o convidado pode usar

| Passo | O que acontece |
|-------|---------------|
| 1 | Master envia convite pelo painel de Usuarios |
| 2 | Convidado recebe email com link |
| 3 | Clica no link e cria conta (ou faz login) |
| 4 | Sistema vincula automaticamente ao tenant |
| 5 | Entra no workspace com as permissoes atribuidas |

---

## 5. Gerenciando a Organizacao

```mermaid
flowchart TD
    HUB(["Hub — Menu do Workspace"]) --> A["Gerenciar Workspace"]
    HUB --> B["Workspaces"]
    HUB --> C["Usuarios"]
    HUB --> D["Gravity Store"]
    HUB --> E["Trocar Workspace"]
    HUB --> F["Sair"]

    A --> A1["Ver dados da organizacao"]
    A --> A2["Assinaturas e plano"]
    A --> A3["Financeiro e faturas"]
    A --> A4["API Cockpit"]
    A --> A5["Conector ERP"]

    B --> B1["Ver workspaces existentes"]
    B --> B2["Criar novo workspace"]

    C --> C1["Ver usuarios do workspace"]
    C --> C2["Convidar novo usuario"]
    C --> C3["Alterar permissoes"]

    D --> D1["Navegar catalogo"]
    D --> D2["Contratar novo produto"]

    E --> E1["Voltar para selecao de workspace"]
    F --> F1["Logout e voltar ao login"]

    classDef hub fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef section fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef action fill:#0f172a,stroke:#334155,color:#e2e8f0

    class HUB hub
    class A,B,C,D,E,F section
    class A1,A2,A3,A4,A5,B1,B2,C1,C2,C3,D1,D2,E1,F1 action
```

| Acao | Onde encontrar | Quem pode |
|------|---------------|-----------|
| Convidar usuarios | Hub > Menu > Usuarios | Master |
| Criar novo workspace | Hub > Menu > Workspaces | Master |
| Ver assinaturas | Hub > Menu > Gerenciar Workspace > Assinaturas | Master |
| Contratar mais produtos | Hub > Menu > Gravity Store | Master, Admin |
| Trocar de workspace | Hub > Menu > Trocar Workspace | Todos |
| Alterar permissoes | Hub > Menu > Usuarios > Editar | Master |

---

## 6. Multiplos Workspaces

```mermaid
flowchart TD
    ORG["Organizacao: Acme Corp"] --> WS1["Workspace: Matriz SP"]
    ORG --> WS2["Workspace: Filial RJ"]
    ORG --> WS3["Workspace: Filial MIA"]

    WS1 --> P1["SimulaCusto"]
    WS1 --> P2["BID Frete"]

    WS2 --> P3["SimulaCusto"]

    WS3 --> P4["SimulaCusto"]
    WS3 --> P5["Smart Read"]

    WS1 --> U1["5 usuarios"]
    WS2 --> U2["3 usuarios"]
    WS3 --> U3["2 usuarios"]

    classDef org fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef ws fill:#1e293b,stroke:#818cf8,color:#f1f5f9
    classDef prod fill:#059669,stroke:#047857,color:#fff
    classDef users fill:#0f172a,stroke:#475569,color:#94a3b8

    class ORG org
    class WS1,WS2,WS3 ws
    class P1,P2,P3,P4,P5 prod
    class U1,U2,U3 users
```

- Cada workspace tem seus proprios produtos e dados isolados
- Usuario pode trocar de workspace a qualquer momento pelo menu
- Cada workspace pode ter produtos diferentes habilitados
- Dados nunca se misturam entre workspaces

---

## 7. Roles e Permissoes

```mermaid
flowchart LR
    MASTER["Master"] --> ALL["Acesso total"]
    ALL --> G1["Gerenciar organizacao"]
    ALL --> G2["Convidar e remover usuarios"]
    ALL --> G3["Criar workspaces"]
    ALL --> G4["Contratar produtos"]
    ALL --> G5["Usar todos os produtos"]

    STANDARD["Standard"] --> STD["Acesso operacional"]
    STD --> S1["Usar produtos atribuidos"]
    STD --> S2["Ver dados do workspace"]
    STD --> S3["Nao pode: gerenciar org"]
    STD --> S4["Nao pode: convidar usuarios"]

    SUPPLIER["Supplier"] --> SUP["Acesso restrito"]
    SUP --> SP1["Funcionalidades especificas"]
    SUP --> SP2["Portal do fornecedor"]
    SUP --> SP3["Nao pode: ver dados internos"]

    classDef master fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef standard fill:#0ea5e9,stroke:#0284c7,color:#fff
    classDef supplier fill:#f59e0b,stroke:#d97706,color:#fff
    classDef perm fill:#0f172a,stroke:#334155,color:#e2e8f0
    classDef deny fill:#1e293b,stroke:#ef4444,color:#f87171

    class MASTER master
    class STANDARD standard
    class SUPPLIER supplier
    class ALL,STD,SUP,G1,G2,G3,G4,G5,S1,S2,SP1,SP2 perm
    class S3,S4,SP3 deny
```

| Role | Gerenciar Org | Convidar | Criar Workspace | Contratar Produto | Usar Produto |
|------|:---:|:---:|:---:|:---:|:---:|
| **Master** | Sim | Sim | Sim | Sim | Todos |
| **Standard** | - | - | - | - | Atribuidos |
| **Supplier** | - | - | - | - | Portal especifico |

---

## Limites por Plano

```mermaid
flowchart LR
    STARTER["Starter"] --> S1["2 workspaces"]
    STARTER --> S2["Trial 14 dias"]

    PRO["Professional"] --> P1["20 workspaces"]
    PRO --> P2["Suporte prioritario"]

    ENT["Enterprise"] --> E1["50 workspaces"]
    ENT --> E2["SLA dedicado"]

    classDef starter fill:#334155,stroke:#475569,color:#e2e8f0
    classDef pro fill:#0ea5e9,stroke:#0284c7,color:#fff
    classDef ent fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef detail fill:#0f172a,stroke:#334155,color:#94a3b8

    class STARTER starter
    class PRO pro
    class ENT ent
    class S1,S2,P1,P2,E1,E2 detail
```

| Plano | Workspaces | Trial | Ideal para |
|-------|:---:|:---:|------------|
| **Starter** | 2 | 14 dias | Pequenas empresas testando a plataforma |
| **Professional** | 20 | - | Empresas em crescimento com filiais |
| **Enterprise** | 50 | - | Grandes operacoes com multiplas unidades |
