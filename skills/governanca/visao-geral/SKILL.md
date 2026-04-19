---
name: antigravity-visao-geral
description: "Use esta skill quando precisar entender o projeto Gravity como um todo antes de qualquer tarefa: o que é o produto, qual é a stack completa, como o monorepo está organizado, quais são as quatro ondas de desenvolvimento e quais skills consultar para cada assunto. Esta é a skill de entrada do projeto — leia antes de qualquer outra quando estiver começando do zero ou orientando um novo agente."
---

# Gravity — Visão Geral do Projeto

## O que é o Gravity

Gravity é uma plataforma multi-tenant SaaS B2B modular. Uma empresa assina a plataforma e passa a ter acesso a serviços compartilhados (email, atividades, dashboard, WhatsApp, cronômetro, etc.) e a produtos verticais especializados (como SimulaCusto, NF Importação). Cada produto usa os serviços compartilhados sem duplicar dados. Os dados do tenant existem uma vez — independente de quantos produtos ele contrate.

---

## Stack Completa

### Linguagem e Runtime

| Tecnologia | Uso |
|:---|:---|
| TypeScript (`strict: true`) | Todo o código — frontend e backend |
| Node.js | Runtime de todos os servidores |
| ESModules (`"type": "module"`) | Padrão em todos os packages |

### Frontend

| Tecnologia | Uso |
|:---|:---|
| React | Todos os produtos e o marketplace |
| React lazy loading | Carregamento de módulos de navegação |
| Plus Jakarta Sans | Tipografia padrão |
| CSS Variables (Solid Slate) | Design system — dark mode como padrão |

### Backend

| Tecnologia | Uso |
|:---|:---|
| Express | Framework HTTP de todos os servidores |
| Zod | Validação obrigatória em toda rota |
| AppError | Classe centralizada de erros (toda rota lança, o handler responde) |

### Banco de Dados

| Tecnologia | Uso |
|:---|:---|
| PostgreSQL | Banco de dados de todos os serviços |
| Prisma | ORM — schemas por fragment, compose via script |

### Autenticação e Billing

| Tecnologia | Uso |
|:---|:---|
| Clerk | Autenticação de usuários e multi-tenant |
| Stripe | Billing, planos e assinaturas |

### Integrações Externas

| Tecnologia | Uso |
|:---|:---|
| Resend | Envio de emails transacionais |
| Meta / WhatsApp Cloud API | Integração de WhatsApp |
| OpenAI | Motor da Gabi (assistente de IA do tenant) |
| NF-e APIs | Emissão e importação de notas fiscais |

### Infraestrutura e Deploy

| Tecnologia | Uso |
|:---|:---|
| Railway | Hosting de todos os serviços |
| GitHub Actions | CI/CD — testes → staging → produção (aprovação manual) |
| Sentry | Monitoramento de erros em produção |
| UptimeRobot | Health check de cada serviço a cada 5 minutos |

### Testes

| Tecnologia | Uso |
|:---|:---|
| Vitest | Testes unitários e funcionais |
| Playwright | Testes E2E |

---

## Estrutura do Monorepo

```
gravity/
├── nucleo-global/              ← componentes React puro, sem estado de servidor
│   ├── tabela-global/          ← TabelaGlobal — tabela reutilizável
│   ├── modal-global/           ← ModalGlobal — modal com abas
│   ├── select/                 ← SelectGlobal
│   └── utils/                  ← helpers compartilhados
│
├── servicos-global/
│   ├── tenant/                 ← serviços que existem uma vez por empresa
│   │   ├── atividades/
│   │   ├── cronometro/
│   │   ├── email/
│   │   ├── whatsapp/
│   │   ├── dashboard/
│   │   ├── relatorios/
│   │   ├── historico/
│   │   ├── notificacoes/
│   │   ├── agendamento/
│   │   ├── gabi/
│   │   ├── api-cockpit/
│   │   └── conector-erp/
│   │
│   ├── produto/                ← templates reutilizáveis — dados ficam no produto
│   │   └── helpdesk/
│   │
│   ├── configurador/           ← Clerk, Stripe, billing, permissões, Admin Panel
│   ├── marketplace/            ← landing e catálogo de produtos (frontend puro)
│   └── devops/                 ← CI/CD, scripts, infraestrutura
│
├── produtos/                   ← cada produto é um monorepo interno
│   ├── simulacusto/            ← primeiro produto real
│   │   ├── client/             ← React
│   │   └── server/             ← Express + Prisma
│   └── nf-importacao/          ← próximo produto
│
└── scripts/                    ← compose-tenant-schema.ts, compose-schema.js
```

### Aliases TypeScript

```typescript
@nucleo/*   → nucleo-global/*
@tenant/*   → servicos-global/tenant/*
@produto/*  → servicos-global/produto/*
```

---

## As Quatro Ondas de Desenvolvimento

As ondas são sequenciais. Nenhuma onda inicia sem que a anterior tenha sido validada pelo Coordenador.

### Onda 1 — Fundação (3 agentes em paralelo)

| Agente | O que constrói | Bloqueia |
|:---|:---|:---|
| 0A Esqueleto | Pastas, configs, `package.json` de todo o monorepo | Onda 2 inteira |
| 0B Banco | Schema Prisma base, RLS, `withTenantIsolation` | Onda 2 Configurador + Onda 3 |
| Marketplace | Frontend do marketplace (100% estático) | Ninguém |

### Onda 2 — Base Reutilizável (3 agentes em paralelo)

| Agente | O que constrói | Bloqueia |
|:---|:---|:---|
| 1A Núcleo UI | `TabelaGlobal`, `ModalGlobal`, `SelectGlobal`, utilitários | Onda 3 (componentes) |
| 1B Shell | Layout, sidebar, header, `Navigation.tsx`, state global | Onda 3 (frontend dos serviços) |
| Configurador | Clerk, Stripe, multi-tenant, billing, NF-e, permissões, Admin Panel | Onda 4 (Auth Flow) |

### Onda 3 — Serviços em Paralelo (13 agentes)

**Serviços de tenant (9):**
`atividades` · `cronômetro` · `email` · `whatsapp` · `dashboard` · `relatórios` · `histórico` · `notificações` · `agendamento`

**Serviços de produto (3):**
`gabi` · `api-cockpit` · `conector-erp`

**Template (1):**
`helpdesk`

### Onda 4 — Integração e Produtos (4 agentes em paralelo)

| Agente | O que constrói |
|:---|:---|
| Proxy + Agregação | `createTenantProxy`, `enqueueTenantAction`, retry logic |
| Auth Flow | JWT propagação, `GET /api/check-access` |
| SimulaCusto | Primeiro produto real — consome todos os serviços da Onda 3 |
| DevOps | Railway CI/CD, Vitest, Playwright, Sentry, UptimeRobot |

---

## As Duas Naturezas de Serviço

### Serviço de Tenant

- Existe **uma vez por empresa**, independente de quantos produtos ela use
- **Todos os 11 serviços rodam em processo único — super-servidor tenant (porta 3001)**
- Banco de dados próprio compartilhado entre os 11 serviços (`tenant-db`)
- Acessado por todos os produtos via API REST (`/api/v1/[servico]` na porta 3001)
- Dados filtrados por `tenant_id` e opcionalmente `product_id`
- Todo model Prisma tem `tenant_id` obrigatório + 3 índices obrigatórios

### Serviço de Produto

- É um **template reutilizável** — o código é compartilhado, os dados pertencem ao produto
- Roda dentro do servidor do produto (não tem servidor próprio)
- Expõe `fragment.prisma` para composição no schema do produto
- Exemplo: `helpdesk` tem SLAs diferentes por produto — os dados não podem ser centralizados

---

## Bancos de Dados

| Banco | Pertence a | Modelo | O que armazena |
|:---|:---|:---|:---|
| `configurador-db` | Configurador | single-schema `public` | Tenants, usuários, billing, permissões (fonte global) |
| `tenant-db` | Serviços de tenant | **schema-per-tenant** (`tenant_<uuid>`) | Atividades, email, WhatsApp, dashboard, etc. |
| `simulacusto-db`, `pedido-db`, `processo-db`, etc. | Cada produto | **schema-per-tenant** | Dados isolados em schema próprio por tenant |

**Regras:**
- Nenhum produto compartilha banco com outro produto.
- Cada banco de produto contém N schemas (1 por tenant), nomeados `tenant_<uuid_sem_hifens>`.
- Provisionamento de schema dispara via evento `TenantProvisioned` do Configurador (worker + DLQ — ADR-003).

---

## Regras Arquiteturais Fundamentais (pós-pivô 2026-04-17)

> As regras completas estão nas skills específicas. Este é apenas o mapa de entrada.

- **Imports:** serviços tenant/produto nunca importam código de outro serviço — só comunicam via API REST
- **Schema:** **schema-per-tenant** em todos os bancos de produto — 1 schema PostgreSQL por tenant. Configurador permanece single-schema. Ver [ADR-001](../../../documentos-tecnicos/adr/ADR-001-schema-per-tenant.md).
- **Acesso ao banco de produto:** **exclusivamente via `withTenant(req, db => ...)` do `@gravity/tenant-resolver`** — `import { PrismaClient }` direto é proibido (linter CI bloqueia). Ver [ADR-002](../../../documentos-tecnicos/adr/ADR-002-tenant-resolver-sdk.md).
- **Validação:** nenhuma rota Express sem schema Zod
- **Erros:** toda rota lança `AppError` — o handler global responde
- **Auth:** JWT validado em toda rota protegida via `@clerk/backend`; `x-internal-key` em toda chamada entre serviços
- **Identidade:** vem do `GET /api/me` do Configurador (cacheado pelo SDK), **nunca** do `publicMetadata` do Clerk

---

## Mapa de Skills — O Que Consultar para Cada Assunto

| Assunto | Skill |
|:---|:---|
| Visão geral antes de qualquer ação | `antigravity-visao-geral` ← você está aqui |
| Regras gerais de comportamento do agente | `antigravity-agent-policy` |
| Ambiente de trabalho (porta, navegador) | `antigravity-ambiente` |
| Padrões de código (TypeScript, Zod, AppError, naming) | `antigravity-code-standards` |
| Schema Prisma, fragments, composição | `antigravity-schema-composition` |
| Serviços tenant vs produto, estrutura de pastas | `antigravity-servicos-tenant` |
| Isolamento de tenant (Schema-per-Tenant + SDK) | `antigravity-tenant-isolation` (reescrita 2026-04-17) |
| Auth entre serviços (`x-internal-key`, JWT) | `antigravity-autenticacao-s2s` |
| Ações cross-boundary entre serviços | `antigravity-cross-boundary` |
| Permissões de usuário (roles, granulares, produtos) | `antigravity-permissoes` |
| Papel do Coordenador, checklists de onda | `antigravity-coordenador` |
| Papel do Líder, distribuição de tarefas | `antigravity-lider` |
| Revisão de qualidade pós-entrega | `antigravity-qa` |
| Deploy, Railway, migrations, rollback | `antigravity-deploy` |
| Monitoramento, Sentry, UptimeRobot | `antigravity-observabilidade` |
| Design system, cores, tipografia, tokens CSS | `antigravity-design-system` |
| Componentes globais (Tabela, Modal, Select) | `antigravity-nucleo-global` |
| State management frontend | `antigravity-state-management` |
| Marketplace (landing e catálogo) | `antigravity-marketplace` |
| Configurador (Clerk, Stripe, permissões) | `antigravity-configurador` |
| Gabi (assistente de IA) | `antigravity-gabi` |
| SimulaCusto (primeiro produto) | `antigravity-simulacusto` |
| Testes unitários e funcionais | `antigravity-testes` |
