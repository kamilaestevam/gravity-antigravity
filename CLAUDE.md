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
| Testes | `skills/arquitetura/testes/SKILL.md` | Criar/modificar testes, validar cobertura |

### Segurança

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Autenticação S2S | `skills/seguranca/autenticacao-s2s/SKILL.md` | Chamadas entre serviços, JWT, machine tokens |
| Cross-Boundary | `skills/seguranca/cross-boundary/SKILL.md` | Ações que cruzam dois bancos (produto → tenant) |
| Permissões | `skills/seguranca/permissoes/SKILL.md` | Roles, permissões granulares, middleware de auth |

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

**Banco de Dados:**
- Todo model tem `tenant_id String` obrigatório
- Todo model tem 3 índices: `@@index([tenant_id])`, `@@index([tenant_id, product_id])`, `@@index([tenant_id, user_id])`
- Nenhuma query sem filtro por `tenant_id`
- Nenhum agente edita `schema.prisma` — só o Coordenador via script
- Cada serviço escreve apenas seu `fragment.prisma`

**Segurança:**
- Toda rota tem validação Zod antes do banco
- JWT validado em rotas protegidas via `@clerk/backend`
- `x-internal-key` em toda chamada inter-serviço
- Sem `console.log` expondo dados sensíveis
- Sem variáveis de ambiente hardcoded
- Erros via `AppError` — nunca `res.status().json()` direto

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
├── skills/                  ← 38 SKILL.md (este mapa)
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

- `/lider` — Ativar modo Líder (análise + distribuição)
- `/coordenar` — Ativar modo Coordenador (schema + contratos + ondas)
- `/qa` — Ativar modo QA (revisão completa pós-entrega)
- `/criar-produto` — Fluxo para criar novo produto
- `/deploy` — Fluxo de deploy/migração
- `/skill [nome]` — Ler uma skill específica pelo nome
