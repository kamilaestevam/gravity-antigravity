# Dream Team Tecnologia — Documentação Completa

> **Versão:** 1.0
> **Data:** Março 2026
> **Autor:** Daniel Mendes
> **Status:** Ativo

---

## O Que É o Dream Team Tecnologia

O Dream Team Tecnologia é o **framework completo de governança técnica** da plataforma Gravity. Ele reúne **57 skills** organizadas em **10 categorias**, representando o conhecimento de **11 profissionais** de tecnologia em um sistema integrado de regras, padrões e checklists.

Quando ativado (via comando `/dream-team-tecnologia`), o agente AI assume o conhecimento de todo o time técnico e aplica as regras corretas de acordo com o contexto da tarefa.

### Em uma frase

> "É como ter 11 profissionais seniores revisando cada linha de código, cada decisão de arquitetura e cada deploy — simultaneamente."

---

## Por Que Existe

A plataforma Gravity é um ecossistema SaaS complexo com:

- **Monorepo** com nucleo-global, servicos-global, produtos e testes centralizados
- **Multi-tenant** com isolamento em duas camadas (Prisma + RLS)
- **Múltiplos bancos** (configurador, tenant, cada produto)
- **Comunicação inter-serviços** via REST com JWT + x-internal-key
- **Metas de SLA** agressivas (200ms, 50k req, 99,9% uptime)

Sem governança técnica, agentes AI e desenvolvedores cometem erros que se propagam: queries sem tenant_id, imports cruzados entre serviços, deploys sem backup, APIs sem validação. O Dream Team elimina essas falhas por design.

---

## Os 11 Profissionais

| # | Profissional | Responsabilidade | Skills que carrega |
|---|:---|:---|:---|
| 1 | **Líder do Projeto** | Cadência, priorização, entrega | Sprint Management, Handoff, Definition of Done, Onboarding Produto |
| 2 | **Líder Técnico** | Qualidade de código, arquitetura | Code Review, API Design, Definition of Done |
| 3 | **PO** | Backlog, valor de negócio | Sprint Management, Onboarding Produto |
| 4 | **QA** | Testes, contratos, aprovação | Contract Testing, Definition of Done, Testes |
| 5 | **Backend** | APIs, performance, lógica | API Design, SLA & Performance, Caching Strategy |
| 6 | **Frontend** | UI, acessibilidade, UX | Acessibilidade, Design System |
| 7 | **Estrutura de Dados** | Banco, índices, migrations | Database Operations, Caching Strategy, SLA & Performance |
| 8 | **Estrutura de Sistemas** | Contratos, scaling | Contract Testing, Auto-Scaling |
| 9 | **UX** | Design, tokens, handoff | Acessibilidade, Handoff |
| 10 | **DevOps/SRE** | Infra, monitoramento, DR | Incident Response, Performance & Monitoring, Auto-Scaling, SLA & Performance, Backup & DR |
| 11 | **Segurança** | 5 camadas, pentest, rate limit | Segurança 5 Camadas, Pentest, Incident Response, Rate Limiting |

---

## As 57 Skills — Inventário Completo

### Governança (5) — Obrigatórias em toda tarefa

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 1 | Agent Policy | `skills/governanca/agent-policy/SKILL.md` | Regras universais de escopo, prioridade e comportamento |
| 2 | Ambiente | `skills/governanca/ambiente/SKILL.md` | Portas, dev servers, variáveis de ambiente |
| 3 | Code Standards | `skills/governanca/code-standards/SKILL.md` | TypeScript strict, Zod, AppError, naming, env vars |
| 4 | Deploy | `skills/governanca/deploy/SKILL.md` | Railway, staging→prod, backup, rollback, auto-scaling |
| 5 | Visão Geral | `skills/governanca/visao-geral/SKILL.md` | Arquitetura geral, ondas, stack |

### Agentes (3) — Papéis de orquestração

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 6 | Líder | `skills/agentes/lider/SKILL.md` | Distribuição de tarefas, relatórios |
| 7 | Coordenador | `skills/agentes/coordenador/SKILL.md` | Schema composition, contratos, ondas |
| 8 | QA | `skills/agentes/qa/SKILL.md` | Revisão pós-entrega, 6 categorias |

### Arquitetura (10) — Padrões técnicos

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 9 | Núcleo Global | `skills/arquitetura/nucleo-global/SKILL.md` | Componentes puros, sem estado |
| 10 | Observabilidade | `skills/arquitetura/observabilidade/SKILL.md` | Logs, correlation ID, health check P0, Sentry, p95/p99 |
| 11 | Schema Composition | `skills/arquitetura/schema-composition/SKILL.md` | Prisma fragments, compose-schema |
| 12 | Serviços Tenant | `skills/arquitetura/servicos-tenant/SKILL.md` | Servidor tenant, banco compartilhado |
| 13 | State Management | `skills/arquitetura/state-management/SKILL.md` | Zustand, shell vs produto, Event Bus |
| 14 | Tenant Isolation | `skills/arquitetura/tenant-isolation/SKILL.md` | Prisma Extensions + RLS, 3 índices, product_id nullable |
| 15 | Testes | `skills/arquitetura/testes/SKILL.md` | Vitest, Playwright, cobertura, contract tests Zod |
| 16 | Contract Testing | `skills/arquitetura/contract-testing/SKILL.md` | Zod como contrato, CI bloqueando breaking changes |
| 17 | Caching Strategy | `skills/arquitetura/caching-strategy/SKILL.md` | Redis, in-memory, TTL, invalidação, tenant isolation |
| 18 | Resilience Patterns | `skills/arquitetura/resilience-patterns/SKILL.md` | Degradação graciosa, retry, circuit breaker, DLQ |

### Segurança (9) — Proteção em profundidade

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 19 | Autenticação S2S | `skills/seguranca/autenticacao-s2s/SKILL.md` | JWT síncrono, machine token, x-internal-key, proxy tenant |
| 20 | Cross-Boundary | `skills/seguranca/cross-boundary/SKILL.md` | enqueueTenantAction, retry, DLQ, BullMQ, agregação |
| 21 | Permissões | `skills/seguranca/permissoes/SKILL.md` | RBAC, roles, Configurador |
| 22 | Incident Response | `skills/seguranca/incident-response/SKILL.md` | Severidades P0-P3, runbook, post-mortem |
| 23 | Performance & Monitoring | `skills/seguranca/performance-monitoring/SKILL.md` | APM, Sentry performance, dashboards, profiling |
| 24 | Pentest | `skills/seguranca/pentest/SKILL.md` | OWASP Top 10, ferramentas, relatório |
| 25 | SLA & Performance | `skills/seguranca/sla-performance/SKILL.md` | 200ms/50k/99,9%, budget por camada, k6 load tests |
| 26 | Rate Limiting | `skills/seguranca/rate-limiting/SKILL.md` | Por tenant, por rota, express-rate-limit, Redis store |
| 27 | Segurança 5 Camadas | `skills/seguranca/seguranca-5-camadas/SKILL.md` | Rede, Auth, Autorização, Isolamento, Auditoria |

### Infraestrutura (10) — Plataforma e infra

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 28 | Admin | `skills/infra-estrutura/admin/SKILL.md` | Painel admin interno |
| 29 | API Cockpit | `skills/infra-estrutura/api-cockpit/SKILL.md` | Tokens, playground, webhooks |
| 30 | Configurador | `skills/infra-estrutura/configurador/SKILL.md` | Clerk, Stripe, permissões, workspace |
| 31 | Criar Produto | `skills/infra-estrutura/criar-produto/SKILL.md` | **23 passos completos** para novo produto |
| 32 | Marketplace | `skills/infra-estrutura/marketplace/SKILL.md` | Landing, pricing, onboarding público |
| 33 | Service Registry | `skills/infra-estrutura/service-registry/SKILL.md` | PRODUCT_CONFIG, contracts.json |
| 34 | Simulador COMEX | `skills/infra-estrutura/simulador-comex/SKILL.md` | Bloqueado (aguarda regras de negócio) |
| 35 | Database Operations | `skills/infra-estrutura/database-operations/SKILL.md` | Migrations, PgBouncer, particionamento, vacuum |
| 36 | Auto-Scaling | `skills/infra-estrutura/auto-scaling/SKILL.md` | Railway scaling, budget, scale-to-zero |
| 37 | Backup & DR | `skills/infra-estrutura/backup-disaster-recovery/SKILL.md` | 4 backups, RPO/RTO, disaster recovery |

### Serviços Tenant (9) — Funcionalidades por empresa

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 38 | Conector ERP | `skills/servicos/conector-erp/SKILL.md` | SAP, importação de dados |
| 39 | Cronômetro | `skills/servicos/cronometro/SKILL.md` | Timer, controle de tempo |
| 40 | Dashboard | `skills/servicos/dashboard/SKILL.md` | KPIs, widgets, métricas |
| 41 | Email | `skills/servicos/email/SKILL.md` | Resend, inbox, threading |
| 42 | Gabi | `skills/servicos/gabi/SKILL.md` | IA, streaming, permissões |
| 43 | Histórico | `skills/servicos/historico/SKILL.md` | Audit trail, imutável |
| 44 | Notificações | `skills/servicos/notificacoes/SKILL.md` | Multi-canal, alertas |
| 45 | Relatórios | `skills/servicos/relatorios/SKILL.md` | Export, agendamento |
| 46 | WhatsApp | `skills/servicos/whatsapp/SKILL.md` | Meta API, conversas |

### Produtos (1)

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 47 | SimulaCusto | `skills/produtos/simulacusto/SKILL.md` | Cálculo fiscal, NCM, PTAX |

### UX (4) — Interface e experiência

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 48 | Componentes | `skills/ux/componentes/SKILL.md` | Qual componente usar |
| 49 | Design System | `skills/ux/design-system/SKILL.md` | Cores, tipografia, ícones |
| 50 | Tooltip | `skills/ux/tooltip/SKILL.md` | Texto de dicas |
| 51 | Acessibilidade | `skills/ux/acessibilidade/SKILL.md` | WCAG 2.1 AA, aria, teclado |

### Gestão (6) — Processos e cadência

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 52 | Sprint Management | `skills/gestao/sprint-management/SKILL.md` | Sprints 2 semanas, velocity, retro |
| 53 | Handoff | `skills/gestao/handoff/SKILL.md` | Design → Dev, tokens, specs |
| 54 | Definition of Done | `skills/gestao/definition-of-done/SKILL.md` | Checklist universal de entrega |
| 55 | Code Review | `skills/gestao/code-review/SKILL.md` | Review, feedback, aprovação |
| 56 | API Design | `skills/gestao/api-design/SKILL.md` | REST, versionamento, paginação |
| 57 | Onboarding Produto | `skills/gestao/onboarding-produto/SKILL.md` | Wizard, dados demo, ativação |

---

## Metas de SLA

| Requisito | Meta |
|:---|:---|
| Latência máxima (p95) | ≤ 200ms |
| Requisições simultâneas | 50.000 |
| Disponibilidade | 99,9% (≤ 8h45min downtime/ano) |
| Escalabilidade | Auto-scaling com budget controlado |
| RPO (perda de dados) | ≤ 24 horas |
| RTO (tempo de recuperação) | ≤ 1 hora |

### Budget de Latência

| Camada | Budget |
|:---|:---|
| Rede interna Railway | 5ms |
| Express middleware chain | 10ms |
| Validação Zod | 5ms |
| Query Prisma (DB) | 80ms |
| Lógica de negócio | 50ms |
| Serialização response | 5ms |
| Buffer de segurança | 45ms |
| **Total** | **200ms** |

---

## Segurança — 5 Camadas

Cada request passa por 5 camadas de proteção independentes:

```
Request → [1. Rede] → [2. Autenticação] → [3. Autorização] → [4. Isolamento] → [5. Auditoria] → Response
```

### Camada 1 — Rede

- Comunicação via rede interna Railway (`*.railway.internal`)
- `x-internal-key` obrigatório em toda chamada S2S (**Prioridade P1**)
- Sem exposição pública (exceto marketplace e gateway)
- HTTPS automático via Railway

### Camada 2 — Autenticação

- Clerk JWT validado **independentemente** em cada serviço
- Servidor de tenant **nunca** confia no produto cegamente
- JWT expira em 1h; machine tokens para ações assíncronas
- MFA disponível via Clerk

### Camada 3 — Autorização

- Configurador verifica: tenant tem acesso ao produto?
- Configurador verifica: user tem permissão para a ação?
- RBAC com roles granulares por produto
- Verificação via API (`GET /api/check-access`)

### Camada 4 — Isolamento de Dados

- **Prisma Client Extensions**: injeta `tenant_id` em toda query automaticamente
- **PostgreSQL RLS**: bloqueia acesso mesmo se o código falhar
- Duas camadas independentes de defesa
- `tenant_id` vem do JWT, **nunca** do body
- `product_id` nullable por design (atividades sem produto são válidas)
- **3 índices obrigatórios** em todo model:
  - `@@index([tenant_id])`
  - `@@index([tenant_id, product_id])`
  - `@@index([tenant_id, user_id])`

### Camada 5 — Auditoria

- Toda alteração (create, update, delete) registrada no serviço `historico`
- Logs de auditoria são **imutáveis** (sem DELETE/UPDATE)
- Tentativas de acesso negado também são logadas
- Dados sensíveis nunca aparecem nos logs

---

## Como Usar

### Ativar o Dream Team

No Claude Code, digite:

```
/dream-team-tecnologia
```

Isso carrega as 57 skills e ativa os 11 papéis. O agente passa a aplicar todas as regras automaticamente de acordo com o contexto.

### Criar um Novo Produto

```
/criar-produto
```

Segue os 23 passos da skill `antigravity-criar-produto`, desde o registro em contracts.json até o wizard de onboarding.

### Outros Comandos

| Comando | O que faz |
|:---|:---|
| `/dream-team-tecnologia` | Carrega o time completo (57 skills) |
| `/lider` | Ativa modo Líder (análise + distribuição) |
| `/coordenar` | Ativa modo Coordenador (schema + contratos + ondas) |
| `/qa` | Ativa modo QA (revisão completa pós-entrega) |
| `/criar-produto` | Fluxo para criar novo produto (23 passos) |
| `/deploy` | Fluxo de deploy/migração |
| `/skill [nome]` | Ler uma skill específica pelo nome |

---

## Evolução — O Que Veio de Onde

### Origem (38 skills)

As 38 skills originais foram criadas para cobrir a arquitetura do monorepo, padrões de código, segurança básica e os serviços da plataforma. Elas cobriam bem o "como construir", mas tinham gaps em:

- Processos de gestão (sem sprints, sem handoff, sem definition of done)
- Performance (sem SLAs, sem load testing, sem budget de latência)
- Segurança avançada (sem pentest, sem rate limiting, sem incident response)
- Infraestrutura (sem backup strategy, sem auto-scaling, sem DR)

### Análise de Gaps (documento técnico)

O documento `gravity_projeto_completo.docx` foi analisado capítulo por capítulo. Foram encontrados **16 gaps** entre o que o documento define e o que as skills cobriam. Os mais críticos:

1. **Rate Limiting por tenant** — sem isso, um tenant pode derrubar a plataforma
2. **Backup & DR** — documento define 4 tipos de backup, nenhuma skill governava
3. **Resilience Patterns** — degradação graciosa, retry, DLQ estavam dispersos

### Expansão (38 → 57 skills)

| Tipo | Quantidade | Detalhe |
|:---|:---|:---|
| Skills novas criadas | 19 | 6 gestão, 6 segurança, 3 infra, 3 arquitetura, 1 UX |
| Skills existentes enriquecidas | 8 | Observabilidade, Testes, Deploy, Tenant Isolation, State Management, Cross-Boundary, Code Standards, Autenticação S2S |
| **Total final** | **57** | |

### Skill Criar Produto — Reescrita Completa

A skill de criar produto foi a que mais evoluiu:

| Aspecto | Antes (4/10) | Depois (10/10) |
|:---|:---|:---|
| Linhas | 122 | 727 |
| Passos documentados | Checklist de 8 itens | 23 passos com código |
| contracts.json | Não mencionado | Passo 1 com porta |
| tsconfig.json paths | "Paths alinhados" | 5 aliases completos |
| Clerk integration | Não | main.tsx completo |
| PRODUCT_CONFIG | Parcial | id, port, tenantServices, productServices, navigation, features |
| Prisma indexes | 1 de 3 | 3 de 3 + product_id + user_id + is_demo |
| Rate limiting | Não | Código completo |
| 5 camadas segurança | Não | Checklist completo |
| Cross-references | Zero | 12 skills referenciadas |
| Testes | Não mencionado | Estrutura completa |
| Seed demo | Não | seedDemo + clearDemo |

---

## Estrutura de Arquivos

```
skills/                              ← 57 SKILL.md
├── agentes/                         ← 3 skills (lider, coordenador, qa)
├── arquitetura/                     ← 10 skills
├── gestao/                          ← 6 skills (NOVAS)
├── governanca/                      ← 5 skills
├── infra-estrutura/                 ← 10 skills (3 NOVAS)
├── produtos/                        ← 1 skill
├── seguranca/                       ← 9 skills (6 NOVAS)
├── servicos/                        ← 9 skills
└── ux/                              ← 4 skills (1 NOVA)

.claude/commands/
└── dream-team-tecnologia.md         ← Comando que carrega tudo

CLAUDE.md                            ← Mapa completo (carregado automaticamente)
```

---

## Regras Universais (Aplicadas por Todo o Time)

### Prioridade em caso de conflito

1. **Segurança** — nunca introduzir vulnerabilidade
2. **Integridade das ondas** — respeitar dependências
3. **Escopo** — nunca tocar em pastas não autorizadas
4. **Clareza** — só agir quando 100% definido
5. **Velocidade** — dentro das restrições acima

### Regras Invioláveis

- **TypeScript** strict, sem `any`, sem `@ts-ignore`, ESModules only
- **Banco**: todo model tem `tenant_id` + 3 índices, nenhuma query sem filtro
- **Segurança**: Zod em toda rota, JWT validado, `x-internal-key` em S2S
- **Isolamento**: serviços nunca importam código de outro serviço
- **Testes**: todo código entregue com unitários + funcionais, cobertura ≥ 70%
- **Entrega**: QA revisa com checklist completo → aprovado ou rejeitado

---

## Manutenção

### Quando Adicionar uma Nova Skill

1. Criar `skills/[categoria]/[nome]/SKILL.md` seguindo o formato frontmatter
2. Atualizar o mapa em `CLAUDE.md`
3. Atualizar `.claude/commands/dream-team-tecnologia.md`
4. Atualizar este documento (`documentos-tecnicos/skills/dream-team-tecnologia/README.md`)

### Quando Enriquecer uma Skill Existente

1. Adicionar a seção com tag `(Dream Team)` para rastreabilidade
2. Atualizar checklist se houver novos itens
3. Não remover conteúdo existente — apenas adicionar

### Quando Remover uma Skill

1. Verificar se alguma outra skill referencia a que será removida
2. Atualizar todas as referências
3. Remover do mapa em `CLAUDE.md`
4. Remover do comando `dream-team-tecnologia.md`
