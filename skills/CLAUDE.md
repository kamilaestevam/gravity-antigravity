# Gravity — Instruções Obrigatórias para Agentes

> **Este arquivo é carregado automaticamente em toda conversa.**
> Todas as regras aqui são obrigatórias. Nenhuma pode ser ignorada.

---

## Regra Zero — Ler Skills Antes de Agir

**NUNCA escreva código, sugira mudanças ou tome decisões sem antes ler as skills relevantes.**

Antes de qualquer tarefa, o agente DEVE:

1. Ler `skills/governanca/agent-policy/SKILL.md` (regras universais)
2. Ler `skills/governanca/code-standards/SKILL.md` (padrões de código)
3. Ler a(s) skill(s) específica(s) da área sendo trabalhada (ver mapa abaixo)
4. Confirmar que está dentro do escopo autorizado (ver agent-policy)

**Se a skill não foi lida, o trabalho não pode começar.**

---

## Mapa de Skills — Quando Consultar Cada Uma

### Agentes (Papéis)

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Líder | `skills/agentes/lider/SKILL.md` | Distribuição de tarefas, análise de progresso, relatórios |
| Coordenador | `skills/agentes/coordenador/SKILL.md` | Composição de schema, validação de contratos, conflitos entre agentes, checklist de ondas |
| QA | `skills/agentes/qa/SKILL.md` | Revisão pós-entrega, validação de testes, aprovação/rejeição |

### Governança (Sempre Obrigatórias)

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Agent Policy | `skills/governanca/agent-policy/SKILL.md` | **SEMPRE — antes de qualquer tarefa** |
| Ambiente | `skills/governanca/ambiente/SKILL.md` | Antes de iniciar servidor, definir porta |
| Code Standards | `skills/governanca/code-standards/SKILL.md` | **SEMPRE — antes de escrever código** |
| Deploy | `skills/governanca/deploy/SKILL.md` | Migrações, deploy, rollback, Railway |
| Database Governance | `skills/governanca/database-governance/SKILL.md` | **Criar/alterar models Prisma** — paridade nominal, Database-per-Service, public vazio |
| Lint Tenant-Safety | `skills/governanca/lint-tenant-safety/SKILL.md` | Linter custom CI — bloqueia PrismaClient direto, cache sem prefixo, etc. |
| Visão Geral | `skills/governanca/visao-geral/SKILL.md` | Entender o projeto, stack, estrutura, ondas |

### Arquitetura

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Núcleo Global | `skills/arquitetura/nucleo-global/SKILL.md` | Criar/modificar componentes em `nucleo-global/` |
| Observabilidade | `skills/arquitetura/observabilidade/SKILL.md` | Logs, correlation ID, health checks, Sentry |
| Schema Composition | `skills/arquitetura/schema-composition/SKILL.md` | Qualquer alteração em Prisma/schema/fragment |
| Serviços Tenant | `skills/arquitetura/servicos-tenant/SKILL.md` | Criar/modificar serviços em `servicos-global/tenant/` |
| State Management | `skills/arquitetura/state-management/SKILL.md` | Gerenciar estado (stores, event bus, queries) |
| Tenant Isolation | `skills/arquitetura/tenant-isolation/SKILL.md` | **Qualquer acesso a banco de dados** |
| SDK Tenant-Resolver | `skills/arquitetura/sdk-tenant-resolver/SKILL.md` | **Usar `@gravity/tenant-resolver` — withTenant, withTenantContext, TenantDatabase** |
| Testes | `skills/arquitetura/testes/SKILL.md` | Criar/modificar testes, validar cobertura |
| Contract Testing | `skills/arquitetura/contract-testing/SKILL.md` | Zod schemas como contratos, CI bloqueando breaking changes |
| Caching Strategy | `skills/arquitetura/caching-strategy/SKILL.md` | Redis/in-memory, TTL, invalidação, performance |
| Resilience Patterns | `skills/arquitetura/resilience-patterns/SKILL.md` | Degradação graciosa, retry, circuit breaker, health P0 |

### Segurança

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Autenticação S2S | `skills/seguranca/autenticacao-s2s/SKILL.md` | Chamadas entre serviços, JWT, machine tokens, proxy de tenant |
| Cross-Boundary | `skills/seguranca/cross-boundary/SKILL.md` | Ações que cruzam dois bancos (produto → tenant), DLQ, agregação |
| Permissões | `skills/seguranca/permissoes/SKILL.md` | Roles, permissões granulares, middleware de auth |
| Incident Response | `skills/seguranca/incident-response/SKILL.md` | Runbook de incidentes, severidades, post-mortem |
| Performance & Monitoring | `skills/seguranca/performance-monitoring/SKILL.md` | APM, dashboards, alertas, profiling |
| Pentest | `skills/seguranca/pentest/SKILL.md` | OWASP Top 10, ferramentas, relatório de pentest |
| SLA & Performance | `skills/seguranca/sla-performance/SKILL.md` | 200ms/50k req/99,9%, budget de latência, load testing |
| Rate Limiting | `skills/seguranca/rate-limiting/SKILL.md` | Limites por tenant/rota, proteção contra abuso |
| Segurança 5 Camadas | `skills/seguranca/seguranca-5-camadas/SKILL.md` | **Checklist obrigatório de segurança para toda entrega** |

### Infraestrutura

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Admin | `skills/infra-estrutura/admin/SKILL.md` | Painel admin interno Gravity |
| API Cockpit | `skills/infra-estrutura/api-cockpit/SKILL.md` | Tokens de API, playground, webhooks, ERP |
| Configurador | `skills/infra-estrutura/configurador/SKILL.md` | Auth/Clerk, billing/Stripe, permissões, workspace |
| Criar Produto | `skills/infra-estrutura/criar-produto/SKILL.md` | **Criar novo produto do zero** |
| Marketplace | `skills/infra-estrutura/marketplace/SKILL.md` | Landing page, pricing, onboarding público |
| Service Registry | `skills/infra-estrutura/service-registry/SKILL.md` | PRODUCT_CONFIG, navegação, integração com Shell |
| Simulador COMEX | `skills/infra-estrutura/simulador-comex/SKILL.md` | **BLOQUEADO — não iniciar sem regras de negócio** |
| Database Operations | `skills/infra-estrutura/database-operations/SKILL.md` | Migrations, índices, particionamento, PgBouncer |
| Auto-Scaling | `skills/infra-estrutura/auto-scaling/SKILL.md` | Regras de scaling Railway, limites de orçamento |
| Backup & DR | `skills/infra-estrutura/backup-disaster-recovery/SKILL.md` | 4 tipos de backup, RPO/RTO, disaster recovery |

### Serviços Tenant

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Conector ERP | `skills/servicos/conector-erp/SKILL.md` | Integração SAP/ERP, importação de dados |
| Cronômetro | `skills/servicos/cronometro/SKILL.md` | Timer de sessões, controle de tempo |
| Dashboard | `skills/servicos/dashboard/SKILL.md` | Widgets, KPIs, painel consolidado |
| Email | `skills/servicos/email/SKILL.md` | Envio/recebimento de email, Resend, threading |
| Gabi | `skills/servicos/gabi/SKILL.md` | Assistente IA, permissões espelhadas, streaming |
| Histórico | `skills/servicos/historico/SKILL.md` | Audit trail, logs imutáveis, compliance |
| Notificações | `skills/servicos/notificacoes/SKILL.md` | Alertas multi-canal (in-app, email, WhatsApp) |
| Relatórios | `skills/servicos/relatorios/SKILL.md` | Relatórios customizados, exportação, agendamento |
| WhatsApp | `skills/servicos/whatsapp/SKILL.md` | Meta Cloud API, conversas, Gabi auto-reply |

### Produtos

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| SimulaCusto | `skills/produtos/simulacusto/SKILL.md` | Produto SimulaCusto, cálculo fiscal, NCM |

### UX

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Componentes | `skills/ux/componentes/SKILL.md` | Escolher qual componente usar para cada caso |
| Design System | `skills/ux/design-system/SKILL.md` | CSS, cores, tipografia, ícones, padrões visuais |
| Tooltip | `skills/ux/tooltip/SKILL.md` | Escrever texto de tooltip em qualquer campo |
| Acessibilidade | `skills/ux/acessibilidade/SKILL.md` | WCAG 2.1 AA, aria-labels, navegação por teclado |

### Gestão

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Sprint Management | `skills/gestao/sprint-management/SKILL.md` | Cadência de sprints, planning, retrospectiva |
| Handoff | `skills/gestao/handoff/SKILL.md` | Processo Design → Dev, tokens, specs |
| Definition of Done | `skills/gestao/definition-of-done/SKILL.md` | Checklist universal de "pronto" para entregas |
| Code Review | `skills/gestao/code-review/SKILL.md` | Padrões de review, checklist, aprovação |
| API Design | `skills/gestao/api-design/SKILL.md` | Convenções REST, versionamento, paginação |
| Onboarding Produto | `skills/gestao/onboarding-produto/SKILL.md` | Wizard de primeiro uso, dados demo, tutorial |

### Dream Team de Produtos (11 skills — criação de novos produtos)

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Projeto Gravity | `skills/dream-team-produtos/00-projeto-gravity.md` | Regras do ecossistema, design system, tenant isolation |
| PM | `skills/dream-team-produtos/01-agente-pm.md` | PRD, entrevistas, MVP, checkpoints |
| SME | `skills/dream-team-produtos/02-agente-sme.md` | Regras de negócio, legislação, armadilhas |
| Data Analyst | `skills/dream-team-produtos/03-agente-data-analyst.md` | TAM/SAM/SOM, benchmarks, pricing |
| Pesquisador | `skills/dream-team-produtos/04-agente-pesquisador.md` | Concorrentes, tendências, gaps |
| UX Researcher | `skills/dream-team-produtos/05-agente-ux-researcher.md` | Personas, jornadas, fricções, testes |
| Business Analyst | `skills/dream-team-produtos/06-agente-business-analyst.md` | Casos de uso, critérios de aceite, integrações |
| Designer | `skills/dream-team-produtos/07-agente-designer.md` | Fluxos, wireframes, telas Solid Slate |
| Tech Lead | `skills/dream-team-produtos/08-agente-tech-lead.md` | Viabilidade, arquitetura, estimativas |
| Fluxo Completo | `skills/dream-team-produtos/09-time-fluxo-completo.md` | Workflow dos 8 agentes, 3 checkpoints |
| Entregáveis/Handoff | `skills/dream-team-produtos/10-entregaveis-handoff.md` | Pacote de handoff para tecnologia |

---

## Regras Universais (Resumo do agent-policy)

Estas regras se aplicam a TODOS os agentes, em TODAS as tarefas:

### Prioridade (em caso de conflito)
1. **Segurança** — nunca introduzir vulnerabilidade
2. **Integridade das ondas** — respeitar dependências
3. **Escopo** — nunca tocar em pastas não autorizadas
4. **Clareza** — só agir quando 100% definido
5. **Velocidade** — dentro das restrições acima

### Regras Invioláveis

**TypeScript:**
- Todo arquivo `.ts` ou `.tsx` — nenhum `.js` novo
- `strict: true` — sem `@ts-ignore`
- Sem `any` explícito
- ESModules (`import`/`export`) — nunca `require()`
- Imports via alias: `@nucleo/`, `@tenant/`, `@produto/`

**Banco de Dados (pós-pivô Schema-per-Tenant — 2026-04-17):**
- **Schema-per-Tenant** em todos os bancos de produto: 1 schema PostgreSQL por tenant (`tenant_<cuid>`)
- Models de produto **NÃO** têm `tenant_id` (o schema **é** o tenant) — após migração completa (Pivô 2026-04-17)
- Models de produto **NÃO** têm `@@index([tenant_id, ...])` — o schema isola fisicamente
- Acesso ao banco **exclusivamente** via `withTenant(req, async db => ...)` ou `withTenantContext(tenantId, fn)` do `@gravity/tenant-resolver`
- `import { PrismaClient } from '@prisma/client'` é **proibido** fora do SDK — linter CI bloqueia deploy
- `new PrismaClient(` é **proibido** em código de aplicação
- Configurador permanece single-schema `public` (fonte de verdade global de identidade)
- Migrations rodam via orquestrador `scripts/migrate-all-tenants.ts` em N schemas — nunca `prisma migrate dev` solto
- Provisionamento de schema novo é responsabilidade do worker do evento `TenantProvisioned` (DLQ + retry)
- Nenhum agente edita `schema.prisma` final — só o Coordenador via script de composição
- Cada serviço/produto escreve apenas seu `fragment.prisma` ou `schema.base.prisma`
- Decisão: Pivô Arquitetural de 2026-04-17 (schema-per-tenant e Configurador como hub central).

**Segurança (pós-pivô):**
- Toda rota tem validação Zod antes do banco
- JWT validado em rotas protegidas via `@clerk/backend`
- `x-internal-key` em toda chamada inter-serviço
- Sem `console.log` expondo dados sensíveis
- Sem variáveis de ambiente hardcoded
- Erros via `AppError` — nunca `res.status().json()` direto
- `tenantId` lido de `req.tenant` (vem do `GET /api/me` do Configurador, cacheado pelo SDK) — **nunca** do `publicMetadata` do Clerk
- Toda chave de cache prefixada por `tenant:<id>:` ou `tenant:_global:` (com justificativa) — linter CI bloqueia
- Pre-signed URLs S3 com TTL ≤ 300s e `tenant_<id>/...` no caminho

**Isolamento:**
- Serviços tenant NUNCA importam código de outro serviço tenant
- Produtos NUNCA acessam banco do Configurador diretamente
- Produtos NUNCA acessam banco de outro produto
- Comunicação entre serviços APENAS via REST API

**Testes:**
- Todo código entregue deve ter testes unitários + funcionais
- Cobertura mínima: `nucleo-global` 80%, demais 70%
- Testes cross-tenant obrigatórios para serviços tenant
- E2E só após plano aprovado pelo dono

**Entrega:**
- Após qualquer entrega de código → acionar QA
- QA revisa com checklist completo (6 categorias)
- Rejeitado → volta para o agente corrigir
- Aprovado → Líder é notificado

---

## Estrutura do Monorepo

```
gravity/
├── nucleo-global/           ← Componentes React puros, sem estado/servidor
├── servicos-global/
│   ├── tenant/              ← Serviços 1x por empresa (email, dashboard, etc.)
│   ├── produto/             ← Templates reutilizáveis (helpdesk)
│   ├── configurador/        ← Auth, billing, permissões (Clerk + Stripe)
│   ├── marketplace/         ← Landing pública (sem auth, sem backend)
│   └── devops/              ← CI/CD, scripts, infra
├── produtos/                ← Cada produto isolado (client/ + server/)
├── scripts/                 ← compose-tenant-schema.ts, etc.
├── testes/                  ← Unitários, funcionais, E2E centralizados
├── skills/                  ← 57 SKILL.md (Dream Team completo)
└── documentos-tecnicos/     ← Documentação técnica
```

---

## As 4 Ondas de Desenvolvimento

| Onda | O que constrói | Bloqueia |
|------|---------------|----------|
| **0 — Fundação** | Skeleton, Prisma base, RLS, Marketplace | Tudo da Onda 1 |
| **1 — Base Reutilizável** | Núcleo UI, Shell, Configurador | Tudo da Onda 2 |
| **2 — Serviços Paralelos** | 9 tenant + 3 produto + 1 template (13 agentes) | Tudo da Onda 3 |
| **3 — Integração** | Proxy, Auth Flow, SimulaCusto, DevOps | Plataforma completa |

**Regra:** Onda N+1 só inicia após Onda N validada pelo Coordenador.

---

## Checklist Antes de Começar Qualquer Tarefa

- [ ] Li `agent-policy`?
- [ ] Li `code-standards`?
- [ ] Li a(s) skill(s) específica(s) da área?
- [ ] Estou dentro do escopo autorizado?
- [ ] Os pré-requisitos (onda anterior) estão validados?
- [ ] Se bloqueado → parar e notificar o Líder

---

## Slash Commands Disponíveis

Use `/comando` para ativar papéis e fluxos específicos:

- `/dream-team-tecnologia` — **Carregar o time de tecnologia (57 skills, 11 papéis)**
- `/dream-team-produtos` — **Carregar o time de produtos (11 skills, 8 agentes)**
- `/lider` — Ativar modo Líder (análise + distribuição)
- `/coordenar` — Ativar modo Coordenador (schema + contratos + ondas)
- `/qa` — Ativar modo QA (revisão completa pós-entrega)
- `/criar-produto` — Fluxo para criar novo produto
- `/deploy` — Fluxo de deploy/migração
- `/skill [nome]` — Ler uma skill específica pelo nome
