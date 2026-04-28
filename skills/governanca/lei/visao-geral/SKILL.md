---
name: antigravity-visao-geral
description: "Use esta skill quando precisar entender o projeto Gravity como um todo antes de qualquer tarefa: o que é o produto, qual é a stack completa, como o monorepo está organizado, quais são as quatro ondas de desenvolvimento e quais skills consultar para cada assunto. Esta é a skill de entrada do projeto — leia antes de qualquer outra quando estiver começando do zero ou orientando um novo agente."
---

# Gravity — Visão Geral do Projeto

## O que é o Gravity

Gravity é uma plataforma multi-organizacao SaaS B2B modular. Uma empresa (organizacao) assina a plataforma e passa a ter acesso a serviços compartilhados (email, atividades, dashboard, WhatsApp, cronômetro, etc.) e a produtos verticais especializados (como SimulaCusto, NF Importação). Cada produto usa os serviços compartilhados sem duplicar dados. Os dados da organizacao existem uma vez — independente de quantos produtos ela contrate.

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

### Autenticação

| Tecnologia | Uso |
|:---|:---|
| Clerk | Autenticação APENAS (login, senha, e-mail, `clerk_user_id`) — Mandamento 01. Autorização vem do Prisma via `GET /api/v1/me`. |

### Integrações Externas

| Tecnologia | Uso |
|:---|:---|
| Resend | Envio de emails transacionais |
| Meta / WhatsApp Cloud API | Integração de WhatsApp |
| OpenAI | Motor da Gabi (assistente de IA do organizacao) |
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
│   └── (estrutura por categorias PascalCase: Botoes, Campos, Tabelas, Modais,
│        Utilidades, Composicao, etc. — ver `arquitetura/nucleo-global/SKILL.md`)
│
├── servicos-global/
│   ├── organizacao/                 ← serviços que existem uma vez por empresa
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
│   ├── configurador/           ← Clerk (autenticação), permissões, Admin Panel
│   ├── marketplace/            ← landing e catálogo de produtos (frontend puro)
│   └── devops/                 ← CI/CD, scripts, infraestrutura
│
├── produto/                    ← cada produto é um monorepo interno
│   ├── simula-custo/           ← primeiro produto real
│   │   ├── client/             ← React
│   │   └── server/             ← Express + Prisma
│   └── nf-importacao/          ← próximo produto
│
└── scripts/                    ← compose-product-schema.ts, migrate-all-tenants.ts
```

### Aliases TypeScript

```typescript
@nucleo/*   → nucleo-global/*
@tenant/*   → servicos-global/organizacao/*       (alias técnico real — preservado por vite-aliases.ts)
@produto/*  → servicos-global/produto/*
```

---

## As Quatro Ondas de Desenvolvimento

As ondas são sequenciais. Nenhuma onda inicia sem que a anterior tenha sido validada pelo Coordenador.

### Onda 1 — Fundação (3 agentes em paralelo)

| Agente | O que constrói | Bloqueia |
|:---|:---|:---|
| 0A Esqueleto | Pastas, configs, `package.json` de todo o monorepo | Onda 2 inteira |
| 0B Banco | Schema Prisma base, isolamento, SDK base | Onda 2 Configurador + Onda 3 |
| Marketplace | Frontend do marketplace (100% estático) | Ninguém |

### Onda 2 — Base Reutilizável (3 agentes em paralelo)

| Agente | O que constrói | Bloqueia |
|:---|:---|:---|
| 1A Núcleo UI | `TabelaGlobal`, `ModalGlobal`, `SelectGlobal`, utilitários | Onda 3 (componentes) |
| 1B Shell | Layout, sidebar, header, `Navigation.tsx`, state global | Onda 3 (frontend dos serviços) |
| Configurador | Clerk (autenticação), multi-organizacao, NF-e, permissões via `tipo_usuario`, Admin Panel | Onda 4 (Auth Flow) |

### Onda 3 — Serviços em Paralelo (13 agentes)

**Serviços por organizacao (9):**
`atividades` · `cronometro` · `email` · `whatsapp` · `dashboard` · `relatorios` · `historico` · `notificacoes` · `agendamento`

**Serviços de produto (3):**
`gabi` · `api-cockpit` · `conector-erp`

**Template (1):**
`helpdesk`

### Onda 4 — Integração e Produtos (4 agentes em paralelo)

| Agente | O que constrói |
|:---|:---|
| Proxy + Agregação | `createOrganizacaoProxy`, `enqueueOrganizacaoAction`, retry logic |
| Auth Flow | JWT propagação, `GET /api/v1/me`, `GET /api/check-access` |
| SimulaCusto | Primeiro produto real — consome todos os serviços da Onda 3 |
| DevOps | Railway CI/CD, Vitest, Playwright, Sentry, UptimeRobot |

---

## As Duas Naturezas de Serviço

### Serviço por Organizacao

- Existe **uma vez por empresa (organizacao)**, independente de quantos produtos ela use
- **Todos os 11 serviços rodam em processo único — super-servidor por organizacao (porta 3001)**
- Banco de dados próprio compartilhado entre os 11 serviços (`organizacao-db`)
- Acessado por todos os produtos via API REST (`/api/v1/[servico]` na porta 3001)
- Dados isolados por **Schema-per-Organizacao** (PostgreSQL `tenant_<cuid>`) e opcionalmente `id_produto`
- Acesso ao banco exclusivamente via `withOrganizacao`/`withOrganizacaoContext` do `@gravity/resolver-organizacao`

### Serviço de Produto

- É um **template reutilizável** — o código é compartilhado, os dados pertencem ao produto
- Roda dentro do servidor do produto (não tem servidor próprio)
- Expõe `fragment.prisma` para composição no schema do produto
- Exemplo: `helpdesk` tem SLAs diferentes por produto — os dados não podem ser centralizados

---

## Bancos de Dados

| Banco | Pertence a | Modelo | O que armazena |
|:---|:---|:---|:---|
| `configurador-db` | Configurador | single-schema `public` | Organizações, Workspaces, Usuários, permissões (fonte global) |
| `organizacao-db` | Serviços por organizacao | **Schema-per-Organizacao** (`tenant_<cuid>`) | Atividades, email, WhatsApp, dashboard, etc. |
| `simulacusto-db`, `pedido-db`, `processo-db`, etc. | Cada produto | **Schema-per-Organizacao** | Dados isolados em schema próprio por organizacao |

**Regras:**
- Nenhum produto compartilha banco com outro produto.
- Cada banco de produto contém N schemas (1 por organizacao), nomeados `tenant_<cuid_sem_hifens>` (prefixo técnico real do PostgreSQL — manter).
- Provisionamento de schema dispara via evento `OrganizacaoProvisionada` do Configurador (worker + DLQ).

---

## Regras Arquiteturais Fundamentais (alinhadas aos 9 Mandamentos)

> As regras completas estão nas skills específicas. Este é apenas o mapa de entrada.

- **Imports:** serviços por organizacao e produtos nunca importam código de outro serviço — só comunicam via API REST
- **Schema:** **Schema-per-Organizacao** em todos os bancos de produto — 1 schema PostgreSQL por organizacao. Configurador permanece single-schema.
- **Schema Prisma é INTOCÁVEL** (Mandamento 02): nenhum agente edita `schema.prisma` manualmente. Adeque o código ao schema.
- **Acesso ao banco de produto:** **exclusivamente via `withOrganizacao(req, db => ...)` do `@gravity/resolver-organizacao`** — `import { PrismaClient }` direto é proibido (linter CI bloqueia).
- **Validação:** nenhuma rota Express sem schema Zod (Mandamento 06)
- **Erros:** toda rota lança `AppError` — o handler global responde
- **Auth:** JWT validado em toda rota protegida via `@clerk/backend`; `x-chave-interna` em toda chamada entre serviços. **Clerk APENAS para autenticação** (Mandamento 01).
- **Autorização:** vem do Prisma via `GET /api/v1/me` (cacheado pelo SDK). PROIBIDO ler `publicMetadata.role` do Clerk para decidir permissões.
- **DDD obrigatório** (Mandamento 03): payloads, props e variáveis usam `id_organizacao`, `id_workspace`, `id_usuario`, `tipo_usuario`, `gravity_admin` (booleans sem prefixo `is_` — REGRA 5 de [DDD Nomenclatura](../ddd-nomenclatura/SKILL.md)).

---

## Mapa de Skills — O Que Consultar para Cada Assunto

| Assunto | Skill |
|:---|:---|
| Visão geral antes de qualquer ação | `antigravity-visao-geral` ← você está aqui |
| **9 Mandamentos (regras absolutas)** | `antigravity-9-mandamentos` |
| Regras gerais de comportamento do agente | `antigravity-agent-policy` |
| Padrões de código (TypeScript, Zod, AppError, naming) | `antigravity-code-standards` |
| Schema Prisma, fragments, composição | `antigravity-schema-composition` |
| Serviços por organizacao vs produto, estrutura de pastas | `antigravity-servicos-organizacao` |
| Isolamento de Organizacao (Schema-per-Organizacao + SDK) | `antigravity-isolamento-organizacao` |
| Auth entre serviços (`x-chave-interna`, JWT) | `antigravity-autenticacao-s2s` |
| Ações cross-boundary entre serviços | `antigravity-cross-boundary` |
| Permissões de usuário (`tipo_usuario`, granulares, produtos) | `antigravity-permissoes` |
| Papel do Coordenador, checklists de onda | `antigravity-coordenador` |
| Papel do Líder, distribuição de tarefas | `antigravity-lider` |
| Revisão de qualidade pós-entrega | `antigravity-qa` |
| Deploy, Railway, migrations, rollback | `antigravity-deploy` |
| Monitoramento, Sentry, UptimeRobot | `antigravity-observabilidade` |
| Design system, cores, tipografia, tokens CSS | `antigravity-design-system` |
| Componentes globais (Tabela, Modal, Select) | `antigravity-nucleo-global` |
| State management frontend | `antigravity-estado` |
| Marketplace (landing e catálogo) | `antigravity-marketplace` |
| Configurador (Clerk autenticação, permissões) | `antigravity-configurador` |
| Gabi (assistente de IA) | `antigravity-gabi` |
| SimulaCusto (primeiro produto) | `antigravity-simulacusto` |
| Testes unitários e funcionais | `antigravity-testes` |
