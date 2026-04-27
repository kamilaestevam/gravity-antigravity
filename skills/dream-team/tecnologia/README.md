# Dream Team Tecnologia — Documentação Completa

> **Versão:** 3.0
> **Data:** Abril 2026
> **Autor:** Daniel Mendes
> **Status:** Ativo — pós-reorganização SSOT (Operação Linguagem Ubíqua)
> **Escopo:** esta é a ÚNICA fonte oficial do Dream Team Tecnologia

---

## O Que É o Dream Team Tecnologia

O Dream Team Tecnologia é o **framework completo de governança técnica** da plataforma Gravity. Ele reúne **64 skills** organizadas em **11 grupos**, representando o conhecimento de **11 profissionais** de tecnologia em um sistema integrado de regras, padrões e checklists.

Quando ativado (via comando `/dream-team-tecnologia`), o agente AI assume o conhecimento de todo o time técnico e aplica as regras corretas de acordo com o contexto da tarefa.

> **Importante:** As regras universais (9 Mandamentos, DDD, isolamento de organização) aplicam-se a **TODO agente em TODA conversa** — independem desta ativação. O Dream Team apenas concentra os papéis técnicos especializados.

> **Pós-reorganização (Abril 2026):** governança virou **Fonte Única de Verdade (SSOT)**. Toda regra absoluta vive em `skills/governanca/lei/` ou `skills/governanca/convencao-tecnica/`. Skills de operação e verticais **referenciam** as regras — nunca as redefinem.

### Em uma frase

> "É como ter 11 profissionais seniores revisando cada linha de código, cada decisão de arquitetura e cada deploy — simultaneamente."

---

## ⚠️ Clerk vs Prisma — Sem Confusão

Esta distinção é **absoluta e não-negociável** (Mandamento 01):

| Sistema | Responsabilidade única |
|:---|:---|
| **Clerk** | Autenticação (login, senha, e-mail, `clerk_user_id`) |
| **Prisma / Banco** | Autorização, permissões, `tipo_usuario`, dados de usuário |

**Fonte única de verdade para autorização:** `GET /api/v1/me` no backend Gravity (consulta Prisma).
**PROIBIDO** em todo o time: ler `publicMetadata.role` do Clerk ou decidir permissões com base em qualquer campo do Clerk.

Sempre que o Clerk aparecer neste documento, está estritamente no contexto de autenticação — nunca de autorização.

---

## LEITURAS OBRIGATÓRIAS — antes de qualquer trabalho

Na ordem:

1. **`skills/governanca/lei/9-mandamentos/SKILL.md`** — regras absolutas e não-negociáveis
2. **`CLAUDE.md` (raiz)** — instruções universais carregadas em toda conversa
3. **`skills/governanca/lei/ddd-nomenclatura/SKILL.md`** — **lei única de nomenclatura** (campos, tabelas, rotas, funções, arquivos, labels) — em conflito com qualquer outro doc, esta prevalece
4. **`skills/governanca/lei/agent-policy/SKILL.md`** — escopo, prioridades, comportamento
5. **`skills/governanca/convencao-tecnica/code-standards/SKILL.md`** — TypeScript, Zod, AppError, naming
6. **As skills do grupo da tarefa em mãos** (mapa abaixo)

Sem essas leituras, qualquer entrega será rejeitada pelo QA.

---

## Por Que Existe

A plataforma Gravity é um ecossistema SaaS complexo com:

- **Monorepo** com nucleo-global, servicos-global, produtos e testes centralizados
- **Multi-organização** com isolamento Schema-per-Organização (PostgreSQL schema dedicado por empresa)
- **Múltiplos bancos** (configurador, serviços compartilhados, cada produto)
- **Comunicação inter-serviços** via REST com JWT + `x-chave-interna`
- **Metas de SLA** agressivas (200ms, 50k req, 99,9% uptime)

Sem governança técnica, agentes AI e desenvolvedores cometem erros que se propagam: queries sem `id_organizacao`, imports cruzados entre serviços, deploys sem backup, APIs sem validação Zod. O Dream Team elimina essas falhas por design.

---

## Os 11 Profissionais

| # | Profissional | Responsabilidade | Skills que carrega |
|---|:---|:---|:---|
| 1 | **Líder do Projeto** | Cadência, priorização, entrega | Líder, Coordenador (papéis) |
| 2 | **Líder Técnico** | Qualidade de código, arquitetura | Code Review, API Design, Code Standards |
| 3 | **PO** | Backlog, valor de negócio | Visão Geral, Agent Policy |
| 4 | **QA** | Testes, contratos, aprovação | QA (papel), Contract Testing, Coordenação de Testes |
| 5 | **Backend** | APIs, performance, lógica | API Design, SLA Metas, Cache |
| 6 | **Frontend** | UI, acessibilidade, UX | Acessibilidade, Design System |
| 7 | **Estrutura de Dados** | Banco, índices, migrations | Database Governance, Cache, SLA Metas, Backup Policy |
| 8 | **Estrutura de Sistemas** | Contratos, scaling | Contract Testing, Auto-Scaling, Service Registry |
| 9 | **UX** | Design, tokens, telas | Acessibilidade, Design System, Criação de Telas |
| 10 | **DevOps/SRE** | Infra, monitoramento, DR | Incident Response, Performance Monitoring, Auto-Scaling, Cost Budget, Backup Policy, Backup & DR |
| 11 | **Segurança** | 5 camadas, pentest, rate limit | Segurança 5 Camadas, Pentest, Rate Limiting, Criptografia, Tier 1 Security |

---

## As 64 Skills — Inventário Ativo

### 1. Governança › Lei (10) — Regras absolutas

> Ler antes de qualquer tarefa. Estas valem sempre, independente de papel ou área.

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 1 | **9 Mandamentos** | `skills/governanca/lei/9-mandamentos/SKILL.md` | **Regras absolutas e não-negociáveis (Clerk isolado, schema intocável, DDD, sem fallback silencioso)** |
| 2 | **Agent Policy** | `skills/governanca/lei/agent-policy/SKILL.md` | Escopo, prioridade, bloqueios, comportamento universal |
| 3 | **Visão Geral** | `skills/governanca/lei/visao-geral/SKILL.md` | Arquitetura geral, ondas, stack |
| 4 | **DDD Nomenclatura** | `skills/governanca/lei/ddd-nomenclatura/SKILL.md` | **Lei única de nomenclatura** — em conflito com qualquer outro doc, esta prevalece |
| 5 | Terminal | `skills/governanca/lei/terminal/SKILL.md` | Autorização de comandos autônomos (instalar, build, kill-port) |
| 6 | Isolamento de Organização | `skills/governanca/lei/isolamento-organizacao/SKILL.md` | Schema-per-Organização — **qualquer acesso a banco** |
| 7 | SDK Resolvedor de Organização | `skills/governanca/lei/sdk-resolvedor-organizacao/SKILL.md` | `@gravity/tenant-resolver` — `withTenant`, `withTenantContext`, `TenantDatabase` |
| 8 | SLA Metas ⭐ | `skills/governanca/lei/sla-metas/SKILL.md` | 200ms p95, 50k req/s, 99,9% uptime, budget de latência |
| 9 | Cost Budget ⭐ | `skills/governanca/lei/cost-budget/SKILL.md` | Limites mensais, thresholds 70/80/90/95%, bloqueio de scaling em 95% |
| 10 | Backup Policy ⭐ | `skills/governanca/lei/backup-policy/SKILL.md` | RPO 24h, RTO 1h, backup pré-migration obrigatório, teste mensal |

> ⭐ = nova skill da Fase C1 (reorganização SSOT, Abril 2026)

### 2. Governança › Convenção Técnica (7) — Como escrever código

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 11 | Code Standards | `skills/governanca/convencao-tecnica/code-standards/SKILL.md` | TypeScript strict, Zod, AppError, naming, env vars |
| 12 | Monorepo | `skills/governanca/convencao-tecnica/monorepo/SKILL.md` | NPM workspaces, aliases, tsconfig, dependências |
| 13 | Lint Tenant-Safety | `skills/governanca/convencao-tecnica/lint-tenant-safety/SKILL.md` | Linter custom CI — bloqueia PrismaClient direto, cache sem prefixo `tenant:` |
| 14 | Database Governance | `skills/governanca/convencao-tecnica/database-governance/SKILL.md` | Paridade Prisma↔PG, Database-per-Service, schema `public` vazio, CUID |
| 15 | API Design | `skills/governanca/convencao-tecnica/api-design/SKILL.md` | Convenções REST, versionamento, paginação, validação Zod |
| 16 | Criptografia ⭐ | `skills/governanca/convencao-tecnica/criptografia/SKILL.md` | SHA-256 (tokens), AES-256-GCM (credenciais ERP), HMAC-SHA256 (webhooks) |
| 17 | Observabilidade Mínima ⭐ | `skills/governanca/convencao-tecnica/observabilidade-minima/SKILL.md` | Métricas obrigatórias por serviço, ferramentas obrigatórias, log de auditoria |

### 3. Governança › Operação (4) — Como a plataforma roda em produção

> Estas skills implementam as regras das duas seções acima. **Não duplicam** — referenciam.

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 18 | Auto-Scaling | `skills/governanca/operacao/auto-scaling/SKILL.md` | Configuração Railway (instâncias, triggers, scale-to-zero). Regras → `lei/cost-budget` |
| 19 | Backup & DR | `skills/governanca/operacao/backup-disaster-recovery/SKILL.md` | Scripts pg_dump, S3, plano de DR (4 cenários). Regras → `lei/backup-policy` |
| 20 | Performance Monitoring | `skills/governanca/operacao/performance-monitoring/SKILL.md` | Sentry, UptimeRobot, Grafana, alertas. Regras → `lei/sla-metas` + `convencao-tecnica/observabilidade-minima` |
| 21 | Service Registry | `skills/governanca/operacao/service-registry/SKILL.md` | PRODUCT_CONFIG, contracts.json, discovery |

### 4. Processos (4) — Fluxos de trabalho pontuais

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 22 | Deploy | `skills/processos/deploy/SKILL.md` | Migrações, deploy, rollback, Railway, bootstrap |
| 23 | Code Review | `skills/processos/code-review/SKILL.md` | Padrões de review, checklist técnico, aprovação |
| 24 | Criar Produto | `skills/processos/criar-produto/SKILL.md` | Passos completos para novo produto |
| 25 | Incident Response | `skills/processos/incident-response/SKILL.md` | Severidades P0-P3, runbook, post-mortem |

### 5. Papéis (4) — Quem age

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 26 | Líder | `skills/papeis/lider/SKILL.md` | Distribuição de tarefas, análise de progresso, relatórios |
| 27 | Coordenador | `skills/papeis/coordenador/SKILL.md` | Schema composition, contratos, ondas, aprovações |
| 28 | QA | `skills/papeis/qa/SKILL.md` | Revisão pós-entrega, 6 categorias obrigatórias |
| 29 | Analista de Erros (Testes) | `skills/papeis/analista-erros-testes/SKILL.md` | Análise de falhas de teste com Gemini |

### 6. Arquitetura (8) — Padrões dos sistemas Gravity

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 30 | Núcleo Global | `skills/arquitetura/nucleo-global/SKILL.md` | Componentes React puros, sem estado de servidor |
| 31 | Schema Composition | `skills/arquitetura/schema-composition/SKILL.md` | Composição de Prisma fragments por serviço |
| 32 | Serviços de Organização | `skills/arquitetura/servicos-organizacao/SKILL.md` | Serviços tenant — 1 banco compartilhado por organização |
| 33 | Estado | `skills/arquitetura/estado/SKILL.md` | Zustand, Event Bus, cache cliente |
| 34 | Cache | `skills/arquitetura/cache/SKILL.md` | Camadas (in-memory + Redis), Cache-Aside, TTL, invalidação, prefixo `tenant:` |
| 35 | Resiliência | `skills/arquitetura/resiliencia/SKILL.md` | Retry, circuit breaker, DLQ, degradação graciosa |
| 36 | Observabilidade | `skills/arquitetura/observabilidade/SKILL.md` | Logs estruturados, correlation ID, integração Sentry |
| 37 | Tradução (i18n) | `skills/arquitetura/traducao/SKILL.md` | i18next, pipeline Gemini, useLocale, lazy loading |

### 7. Segurança (7) — Padrões da camada de segurança

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 38 | Segurança 5 Camadas | `skills/seguranca/seguranca-5-camadas/SKILL.md` | **Checklist obrigatório** — Rede, Auth, Autorização, Isolamento, Auditoria |
| 39 | Permissões | `skills/seguranca/permissoes/SKILL.md` | RBAC via `tipo_usuario`, Configurador como fonte da verdade |
| 40 | Autenticação S2S | `skills/seguranca/autenticacao-s2s/SKILL.md` | JWT inter-serviço, machine tokens, `x-chave-interna` |
| 41 | Cross-Boundary | `skills/seguranca/cross-boundary/SKILL.md` | Ações cross-banco, BullMQ, DLQ, agregação eventual |
| 42 | Rate Limiting | `skills/seguranca/rate-limiting/SKILL.md` | `express-rate-limit` + Redis, limites por organização/rota |
| 43 | Pentest | `skills/seguranca/pentest/SKILL.md` | OWASP Top 10, ferramentas, relatório |
| 44 | Tier 1 Security | `skills/seguranca/tier1-security/SKILL.md` | Padrões P0 em endpoints críticos |

### 8. Testes (8) — Padrões e agentes de teste

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 45 | Coordenação de Testes | `skills/testes/SKILL.md` | Visão geral — Vitest unitário/funcional + Playwright E2E |
| 46 | Padrões Vitest/Playwright | `skills/testes/padroes-vitest-playwright/SKILL.md` | Estrutura centralizada, cobertura, mocks |
| 47 | Teste em Tela | `skills/testes/teste-em-tela/SKILL.md` | Validação visual em browser, snapshots Percy |
| 48 | Contract Testing | `skills/testes/contract-testing/SKILL.md` | Zod como contrato bilateral, CI bloqueia breaking changes |
| 49 | Agente Plano de Teste | `skills/testes/agente-plano-teste/SKILL.md` | Agente que cria planos de teste |
| 50 | Agente Plano E2E | `skills/testes/agente-plano-teste-e2e/SKILL.md` | Playwright + Percy em staging |
| 51 | Agente Plano Funcional | `skills/testes/agente-plano-teste-funcional/SKILL.md` | Rotas, fluxos, integração |
| 52 | Agente Plano Unitário | `skills/testes/agente-plano-teste-unitario/SKILL.md` | Vitest, cobertura, categorias |

### 9. UX (5) — Padrões de interface

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 53 | Design System | `skills/ux/design-system/SKILL.md` | Solid Slate (cores, tipografia, ícones, dark mode padrão) |
| 54 | Componentes | `skills/ux/componentes/SKILL.md` | Mapeamento nucleo-global vs custom |
| 55 | Criação de Telas | `skills/ux/criacao-telas/SKILL.md` | **Padrão inviolável** de criação/replicação de tela |
| 56 | Tooltip | `skills/ux/tooltip/SKILL.md` | Texto de tooltip (≤ 90 caracteres), i18n |
| 57 | Acessibilidade | `skills/ux/acessibilidade/SKILL.md` | WCAG 2.1 AA, aria-labels, navegação por teclado |

### 10. Produtos Gravity (5) — Verticais da empresa Gravity

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 58 | Configurador | `skills/produtos-gravity/configurador/SKILL.md` | Auth/Clerk, billing/Stripe, permissões, multi-workspace |
| 59 | Configurador › Admin | `skills/produtos-gravity/configurador/admin/SKILL.md` | Painel admin interno (impersonação, deploy Railway, monitor de APIs) |
| 60 | API Cockpit | `skills/produtos-gravity/api-cockpit/SKILL.md` | Tokens, playground, webhooks, conector ERP/SAP, fluxo Gabi OData |
| 61 | Marketplace | `skills/produtos-gravity/marketplace/SKILL.md` | Landing pública, pricing, onboarding (sem auth, sem backend) |
| 62 | Simulador COMEX | `skills/produtos-gravity/simulador-comex/SKILL.md` | **BLOQUEADO** — não iniciar sem regras de negócio |

> Futuros: `pedido/`, `bid-frete/`, etc. seguem o mesmo padrão (vertical em `produtos-gravity/`, **sem** regras absolutas embutidas — referenciar SSOT).

### 11. Dream Team — Umbrellas (2 SKILL.md + 12 arquivos especializados)

| # | Sub-projeto | Arquivo | Conteúdo |
|---|:---|:---|:---|
| 63 | Detetive de Tela | `skills/dream-team/detetive-tela/SKILL.md` | **Análise forense completa** — front, back, rotas, banco, segurança, performance, UX |
| 64 | Ajustes | `skills/dream-team/ajustes/SKILL.md` | Ajustes em produtos existentes |
| — | Produtos (umbrella) | `skills/dream-team/produtos/` | 11 arquivos: 8 agentes (PM, SME, Data, Pesquisador, UX, BA, Designer, Tech Lead) + fluxo + entregáveis/handoff |
| — | Tecnologia (este doc) | `skills/dream-team/tecnologia/README.md` | Mapa do time de tecnologia |

---

## Os 9 Mandamentos — Resumo Operacional

Detalhes completos em `skills/governanca/lei/9-mandamentos/SKILL.md`.

| # | Mandamento | Resumo |
|---|:---|:---|
| 01 | Isolamento total do Clerk | Clerk só para autenticação. Permissões vêm do banco via `/api/v1/me`. PROIBIDO ler `publicMetadata.role`. |
| 02 | `schema.prisma` é intocável | Apenas o Coordenador altera, via script. Adeque o código ao schema, não o contrário. |
| 03 | Adesão estrita ao DDD | `id_organizacao`, `id_workspace`, `id_usuario`, `tipo_usuario`, `gravity_admin` (booleans sem `is_` — REGRA 5). Lei única: `skills/governanca/lei/ddd-nomenclatura/SKILL.md`. |
| 04 | Lógica de Vínculo (O Limbo) | Master e Super Admin têm acesso global, sem depender de `UsuarioWorkspace`. |
| 05 | Proibido mocks preguiçosos | Sem `useState<T>({} as T)`, sem string vazia para satisfazer compilador. Use `null`/`undefined`. |
| 06 | Validação Zod obrigatória | Toda resposta de `fetch().json()` passa por `schema.parse()`. |
| 07 | Sincronia de contratos | Renomear campo de API exige atualizar TODOS os consumidores no MESMO commit. |
| 08 | Fim dos fallbacks silenciosos | Autorização falha alto. Nunca `(data?.x?.y ?? null) as Role`. |
| 09 | Schemas Zod são contratos bilaterais | Backend mudou? Zod muda no mesmo commit. Sem `z.any()`/`.passthrough()`. |

---

## Metas de SLA

> Fonte canônica: `skills/governanca/lei/sla-metas/SKILL.md` (SSOT).

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

> Fonte canônica: `skills/seguranca/seguranca-5-camadas/SKILL.md`.

Cada request passa por 5 camadas de proteção independentes:

```
Request → [1. Rede] → [2. Autenticação] → [3. Autorização] → [4. Isolamento] → [5. Auditoria] → Response
```

### Camada 1 — Rede

- Comunicação via rede interna Railway (`*.railway.internal`)
- `x-chave-interna` obrigatório em toda chamada S2S (**Prioridade P1**)
- Sem exposição pública (exceto marketplace e gateway)
- HTTPS automático via Railway

### Camada 2 — Autenticação (Clerk APENAS — Mandamento 01)

- Clerk JWT validado **independentemente** em cada serviço
- Servidor de organização **nunca** confia no produto cegamente
- JWT expira em 1h; machine tokens para ações assíncronas
- MFA disponível via Clerk
- **PROIBIDO** usar Clerk para autorização

### Camada 3 — Autorização (Banco = fonte única da verdade)

- Configurador verifica: organização tem acesso ao produto?
- Configurador verifica: usuário tem permissão para a ação?
- RBAC via `tipo_usuario` granulares por produto
- Verificação via API (`GET /api/v1/me` retorna `tipo_usuario`)
- Master e Super Admin têm acesso global (Mandamento 04)

### Camada 4 — Isolamento de Dados

- **Schema-per-Organização** no PostgreSQL — schema dedicado por empresa
- **SDK `@gravity/tenant-resolver`** obrigatório para acesso ao banco (`withTenant`, `withTenantContext`)
- `PrismaClient` direto é PROIBIDO em código de aplicação
- `id_organizacao` vem do JWT, **nunca** do body da requisição
- `id_produto` nullable por design (atividades sem produto são válidas)
- **3 índices obrigatórios** em todo model — campos Prisma têm paridade total com colunas PG (DDD REGRA 2: **`@map` em coluna é PROIBIDO**). Tabela PG é declarada via `@@map("snake_case")`.

### Camada 5 — Auditoria

- Toda alteração (create, update, delete) registrada no serviço `historico`
- Logs de auditoria são **imutáveis** (sem DELETE/UPDATE)
- Tentativas de acesso negado também são logadas
- Dados sensíveis nunca aparecem nos logs
- Detalhes: `skills/governanca/convencao-tecnica/observabilidade-minima/SKILL.md`

---

## Como Usar

### Ativar o Dream Team

No Claude Code, digite:

```
/dream-team-tecnologia
```

Isso carrega as 64 skills e ativa os 11 papéis. O agente passa a aplicar todas as regras automaticamente de acordo com o contexto.

> **Lembrete:** os 9 Mandamentos e o CLAUDE.md raiz já carregam automaticamente em toda conversa, mesmo sem este comando.

### Outros Comandos

| Comando | O que faz |
|:---|:---|
| `/dream-team-tecnologia` | Carrega o time completo (64 skills em 11 grupos) |
| `/dream-team-produtos` | Carrega o time de produtos (11 arquivos, 8 agentes) |
| `/dream-team-detetive-tela` | Análise forense completa de uma tela |
| `/lider` | Ativa modo Líder (análise + distribuição) |
| `/coordenar` | Ativa modo Coordenador (schema + contratos + ondas) |
| `/qa` | Ativa modo QA (revisão completa pós-entrega) |
| `/deploy` | Fluxo de deploy/migração |

---

## Evolução — O Que Mudou

| Marco | Resultado |
|:---|:---|
| Origem (Início 2026) | 38 skills cobrindo "como construir" |
| Análise de gaps | +19 skills (rate limiting, backup/DR, resilience patterns, etc.) |
| Pós-DDD (Abril 2026) | +9 skills de governança (9-mandamentos, ddd-nomenclatura, database-governance, lint-tenant-safety, monorepo, etc.) |
| Categorias pausadas | −10 skills (Serviços por Organização, Produtos antigos) |
| **Reorganização SSOT (Abril 2026)** — Operação Linguagem Ubíqua | Estrutural: 9 grupos no topo + governança subdividida em 3 (lei, convenção técnica, operação). Conteúdo: +5 skills novas em governança (sla-metas, cost-budget, backup-policy, criptografia, observabilidade-minima). Limpeza: −2 duplicatas (database-operations, sla-performance). 14 ponteiros REGRA ABSOLUTA inseridos nas verticais/operação. |
| **Total ativo atual** | **64 SKILL.md em 11 grupos** |

---

## Estrutura de Arquivos

```
skills/                                       ← 64 SKILL.md em 11 grupos
├── governanca/                               ← 21 skills (SSOT — Fonte Única de Verdade)
│   ├── lei/                                  ← 10 — regras absolutas
│   ├── convencao-tecnica/                    ← 7 — como escrever código
│   └── operacao/                             ← 4 — como a plataforma roda
├── processos/                                ← 4 skills (deploy, code-review, criar-produto, incident-response)
├── papeis/                                   ← 4 skills (lider, coordenador, qa, analista-erros-testes)
├── arquitetura/                              ← 8 skills (padrões dos sistemas Gravity)
├── seguranca/                                ← 7 skills (camada de segurança)
├── testes/                                   ← 8 skills (Vitest, Playwright, agentes de plano)
├── ux/                                       ← 5 skills (Solid Slate)
├── produtos-gravity/                         ← 5 skills (Configurador, Admin, API Cockpit, Marketplace, Simulador COMEX)
└── dream-team/                               ← 4 sub-projetos (produtos, tecnologia, detetive-tela, ajustes)

.claude/commands/
└── dream-team-tecnologia.md                  ← Comando que carrega tudo

CLAUDE.md                                     ← Mapa completo (carregado automaticamente)
```

---

## Regras Universais (Aplicadas por Todo o Time)

### Prioridade em caso de conflito

1. **Segurança** — nunca introduzir vulnerabilidade
2. **Integridade das ondas** — respeitar dependências
3. **Escopo** — nunca tocar em pastas não autorizadas
4. **Clareza** — só agir quando 100% definido
5. **Velocidade** — dentro das restrições acima

### Regras Invioláveis (alinhadas aos 9 Mandamentos)

- **TypeScript** strict, sem `any`, sem `@ts-ignore`, ESModules only
- **Banco**: bancos de produto usam Schema-per-Organização; acesso exclusivamente via `withTenant`/`withTenantContext` do `@gravity/tenant-resolver`; `PrismaClient` direto é PROIBIDO; Configurador usa single-schema `public`
- **Schema Prisma**: NUNCA alterar `schema.prisma` (Mandamento 02). Apenas o Coordenador, via script
- **DDD**: usar `id_organizacao`, `id_workspace`, `id_usuario`, `tipo_usuario`, `gravity_admin` em payloads, propriedades e variáveis (Mandamento 03; REGRA 5 — booleans sem prefixo `is_`). Lei única: `skills/governanca/lei/ddd-nomenclatura/SKILL.md`
- **Acesso global**: Master e Super Admin reconhecidos sem `UsuarioWorkspace` (Mandamento 04)
- **Estado React**: nunca `useState<T>({} as T)`, sempre `null`/`undefined` + tratamento (Mandamento 05)
- **Validação Zod**: toda resposta de `fetch().json()` passa por `schema.parse()` antes do uso (Mandamento 06)
- **Sincronia de contratos**: renomear campo de API exige atualizar TODOS os consumidores no MESMO commit (Mandamento 07)
- **Sem fallbacks silenciosos em autorização**: `tipo_usuario` ausente = falhar alto ou logar (Mandamento 08)
- **Schemas Zod bilaterais**: backend mudou → Zod do frontend muda no mesmo commit (Mandamento 09)
- **Autenticação**: Clerk APENAS para autenticação; permissões vêm do Prisma via `GET /api/v1/me` (Mandamento 01)
- **Segurança**: Zod em toda rota, JWT validado via `@clerk/backend`, `x-chave-interna` em S2S
- **Cache**: chave começa com `tenant:` (REGRA 4 do linter); detalhes em `skills/arquitetura/cache/SKILL.md`
- **Criptografia**: SHA-256 (tokens), AES-256-GCM (credenciais), HMAC-SHA256 (webhooks); `skills/governanca/convencao-tecnica/criptografia/SKILL.md`
- **SLA & Custo**: 200ms p95, 50k req/s, 99,9% uptime; budget mensal com bloqueio em 95%; `skills/governanca/lei/sla-metas/SKILL.md` + `cost-budget/SKILL.md`
- **Backup**: pré-migration destrutiva é obrigatório; teste de restauração mensal; `skills/governanca/lei/backup-policy/SKILL.md`
- **Isolamento**: serviços nunca importam código de outro serviço
- **Testes**: todo código entregue com unitários + funcionais, cobertura ≥ 70%
- **Entrega**: QA revisa com checklist completo → aprovado ou rejeitado

---

## Manutenção

### Quando Adicionar uma Nova Skill

1. Decidir o grupo correto (consultar a árvore de 11 grupos acima)
   - **Regra absoluta?** → `skills/governanca/lei/`
   - **Convenção de código universal?** → `skills/governanca/convencao-tecnica/`
   - **Operação de plataforma/SRE?** → `skills/governanca/operacao/`
   - **Padrão técnico transversal?** → `skills/arquitetura/`
   - **Camada específica?** → `skills/seguranca/`, `skills/testes/`, `skills/ux/`
   - **Vertical de produto Gravity?** → `skills/produtos-gravity/`
   - **Fluxo pontual?** → `skills/processos/`
   - **Papel/agente?** → `skills/papeis/`
2. Criar `skills/[grupo]/[nome]/SKILL.md` seguindo o formato frontmatter
3. Atualizar o mapa em `CLAUDE.md`
4. Atualizar este documento (`skills/dream-team/tecnologia/README.md`)
5. Garantir que a nova skill respeita os 9 Mandamentos e o DDD
6. **Se for vertical/operação/padrão:** NUNCA escrever regra absoluta — referenciar `governanca/lei/` ou `governanca/convencao-tecnica/` via bloco `> ⚠️ REGRA ABSOLUTA: Ver [...]`

### Quando Enriquecer uma Skill Existente

1. Verificar se o conteúdo a adicionar é regra absoluta
   - **Sim** → mover/reforçar em `skills/governanca/lei/` ou `convencao-tecnica/` (SSOT)
   - **Não (padrão/exemplo/operação)** → enriquecer a skill atual
2. Atualizar checklist se houver novos itens
3. Não remover conteúdo existente sem justificativa explícita no commit

### Quando Remover uma Skill

1. Verificar se alguma outra skill referencia a que será removida (`grep -r "skills/<grupo>/<nome>"`)
2. Atualizar todas as referências (incluindo `CLAUDE.md`, este README, e qualquer SKILL.md que aponte)
3. Remover do mapa em `CLAUDE.md`
4. Justificar a remoção no commit (motivo + impacto)

### Quando Reativar Categorias Pausadas

Quando um produto vertical (ex: Pedido, Bid Frete) for 100% definido:

1. Criar a pasta em `skills/produtos-gravity/<nome-produto>/`
2. Criar a SKILL.md sem regras absolutas embutidas (referenciar SSOT)
3. Atualizar este README e o `CLAUDE.md`
4. Validar que respeita os 9 Mandamentos e o DDD
