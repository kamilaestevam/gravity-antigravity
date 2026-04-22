# Dream Team Tecnologia — Documentação Completa

> **Versão:** 2.0
> **Data:** Abril 2026
> **Autor:** Daniel Mendes
> **Status:** Ativo — alinhado aos 9 Mandamentos e ao DDD
> **Escopo:** esta é a ÚNICA fonte oficial do Dream Team Tecnologia

---

## O Que É o Dream Team Tecnologia

O Dream Team Tecnologia é o **framework completo de governança técnica** da plataforma Gravity. Ele reúne **48 skills** organizadas em **8 categorias ativas**, representando o conhecimento de **11 profissionais** de tecnologia em um sistema integrado de regras, padrões e checklists.

Quando ativado (via comando `/dream-team-tecnologia`), o agente AI assume o conhecimento de todo o time técnico e aplica as regras corretas de acordo com o contexto da tarefa.

> **Importante:** As regras universais (9 Mandamentos, DDD, isolamento de organização) aplicam-se a **TODO agente em TODA conversa** — independem desta ativação. O Dream Team apenas concentra os papéis técnicos especializados.

> **Categorias pendentes de definição** (serviços por organização e produtos) não estão listadas nesta versão; serão incorporadas quando 100% definidas. Produto em andamento atualmente: **Pedido**.

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

1. **`skills/governanca/9-mandamentos/SKILL.md`** — regras absolutas e não-negociáveis
2. **`CLAUDE.md` (raiz)** — instruções universais carregadas em toda conversa
3. **`skills/governanca/ddd-regras-usuario/SKILL.md`** — plano de alinhamento DDD em vigor
4. **As 48 skills do Dream Team** (mapa abaixo)

Sem essas leituras, qualquer entrega será rejeitada pelo QA.

---

## Por Que Existe

A plataforma Gravity é um ecossistema SaaS complexo com:

- **Monorepo** com nucleo-global, servicos-global, produtos e testes centralizados
- **Multi-organização** com isolamento Schema-per-Organização (PostgreSQL schema dedicado por empresa)
- **Múltiplos bancos** (configurador, serviços compartilhados, cada produto)
- **Comunicação inter-serviços** via REST com JWT + `x-internal-key`
- **Metas de SLA** agressivas (200ms, 50k req, 99,9% uptime)

Sem governança técnica, agentes AI e desenvolvedores cometem erros que se propagam: queries sem `id_organizacao`, imports cruzados entre serviços, deploys sem backup, APIs sem validação Zod. O Dream Team elimina essas falhas por design.

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

## As 48 Skills — Inventário Ativo

### Governança (6) — Obrigatórias em toda tarefa

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 1 | **9 Mandamentos** | `skills/governanca/9-mandamentos/SKILL.md` | **Regras absolutas e não-negociáveis (Clerk isolado, schema intocável, DDD, sem fallback silencioso)** |
| 2 | Agent Policy | `skills/governanca/agent-policy/SKILL.md` | Regras universais de escopo, prioridade e comportamento |
| 3 | Ambiente | `skills/governanca/ambiente/SKILL.md` | Portas, dev servers, variáveis de ambiente |
| 4 | Code Standards | `skills/governanca/code-standards/SKILL.md` | TypeScript strict, Zod, AppError, naming, env vars |
| 5 | Deploy | `skills/governanca/deploy/SKILL.md` | Railway, staging→prod, backup, rollback, auto-scaling |
| 6 | Visão Geral | `skills/governanca/visao-geral/SKILL.md` | Arquitetura geral, ondas, stack |

### Agentes (3) — Papéis de orquestração

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 7 | Líder | `skills/agentes/lider/SKILL.md` | Distribuição de tarefas, relatórios |
| 8 | Coordenador | `skills/agentes/coordenador/SKILL.md` | Schema composition, contratos, ondas |
| 9 | QA | `skills/agentes/qa/SKILL.md` | Revisão pós-entrega, 6 categorias |

### Arquitetura (10) — Padrões técnicos

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 10 | Núcleo Global | `skills/arquitetura/nucleo-global/SKILL.md` | Componentes puros, sem estado |
| 11 | Observabilidade | `skills/arquitetura/observabilidade/SKILL.md` | Logs, correlation ID, health check P0, Sentry, p95/p99 |
| 12 | Schema Composition | `skills/arquitetura/schema-composition/SKILL.md` | Prisma fragments, compose-schema |
| 13 | Serviços da Organização | `skills/arquitetura/servicos-tenant/SKILL.md` | Servidor por organização, banco compartilhado |
| 14 | State Management | `skills/arquitetura/state-management/SKILL.md` | Zustand, shell vs produto, Event Bus |
| 15 | Isolamento de Organização | `skills/arquitetura/tenant-isolation/SKILL.md` | Schema-per-Organização, SDK `@gravity/tenant-resolver` obrigatório, `withTenant`/`withTenantContext` |
| 16 | Testes | `skills/arquitetura/testes/SKILL.md` | Vitest, Playwright, cobertura, contract tests Zod |
| 17 | Contract Testing | `skills/arquitetura/contract-testing/SKILL.md` | Zod como contrato, CI bloqueando breaking changes |
| 18 | Caching Strategy | `skills/arquitetura/caching-strategy/SKILL.md` | Redis, in-memory, TTL, invalidação, isolamento por organização |
| 19 | Resilience Patterns | `skills/arquitetura/resilience-patterns/SKILL.md` | Degradação graciosa, retry, circuit breaker, DLQ |

### Segurança (9) — Proteção em profundidade

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 20 | Autenticação S2S | `skills/seguranca/autenticacao-s2s/SKILL.md` | JWT síncrono, machine token, `x-internal-key`, proxy de organização |
| 21 | Cross-Boundary | `skills/seguranca/cross-boundary/SKILL.md` | enqueueOrgAction, retry, DLQ, BullMQ, agregação |
| 22 | Permissões | `skills/seguranca/permissoes/SKILL.md` | RBAC via `tipo_usuario`, Configurador como fonte da verdade |
| 23 | Incident Response | `skills/seguranca/incident-response/SKILL.md` | Severidades P0-P3, runbook, post-mortem |
| 24 | Performance & Monitoring | `skills/seguranca/performance-monitoring/SKILL.md` | APM, Sentry performance, dashboards, profiling |
| 25 | Pentest | `skills/seguranca/pentest/SKILL.md` | OWASP Top 10, ferramentas, relatório |
| 26 | SLA & Performance | `skills/seguranca/sla-performance/SKILL.md` | 200ms/50k/99,9%, budget por camada, k6 load tests |
| 27 | Rate Limiting | `skills/seguranca/rate-limiting/SKILL.md` | Por organização, por rota, express-rate-limit, Redis store |
| 28 | Segurança 5 Camadas | `skills/seguranca/seguranca-5-camadas/SKILL.md` | Rede, Auth, Autorização, Isolamento, Auditoria |

### Infraestrutura (10) — Plataforma e infra

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 29 | Admin | `skills/infra-estrutura/admin/SKILL.md` | Painel admin interno |
| 30 | API Cockpit | `skills/infra-estrutura/api-cockpit/SKILL.md` | Tokens, playground, webhooks |
| 31 | Configurador | `skills/infra-estrutura/configurador/SKILL.md` | Clerk (apenas autenticação), permissões via `tipo_usuario`, workspaces |
| 32 | Criar Produto | `skills/infra-estrutura/criar-produto/SKILL.md` | Passos completos para novo produto |
| 33 | Marketplace | `skills/infra-estrutura/marketplace/SKILL.md` | Landing, pricing, onboarding público |
| 34 | Service Registry | `skills/infra-estrutura/service-registry/SKILL.md` | PRODUCT_CONFIG, contracts.json |
| 35 | Simulador COMEX | `skills/infra-estrutura/simulador-comex/SKILL.md` | Bloqueado (aguarda regras de negócio) |
| 36 | Database Operations | `skills/infra-estrutura/database-operations/SKILL.md` | Migrations, PgBouncer, particionamento, vacuum |
| 37 | Auto-Scaling | `skills/infra-estrutura/auto-scaling/SKILL.md` | Railway scaling, budget, scale-to-zero |
| 38 | Backup & DR | `skills/infra-estrutura/backup-disaster-recovery/SKILL.md` | 4 backups, RPO/RTO, disaster recovery |

### UX (4) — Interface e experiência

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 39 | Componentes | `skills/ux/componentes/SKILL.md` | Qual componente usar |
| 40 | Design System | `skills/ux/design-system/SKILL.md` | Cores, tipografia, ícones |
| 41 | Tooltip | `skills/ux/tooltip/SKILL.md` | Texto de dicas |
| 42 | Acessibilidade | `skills/ux/acessibilidade/SKILL.md` | WCAG 2.1 AA, aria, teclado |

### Gestão (6) — Processos e cadência

| # | Skill | Arquivo | Escopo |
|---|:---|:---|:---|
| 43 | Sprint Management | `skills/gestao/sprint-management/SKILL.md` | Sprints 2 semanas, velocity, retro |
| 44 | Handoff | `skills/gestao/handoff/SKILL.md` | Design → Dev, tokens, specs |
| 45 | Definition of Done | `skills/gestao/definition-of-done/SKILL.md` | Checklist universal de entrega |
| 46 | Code Review | `skills/gestao/code-review/SKILL.md` | Review, feedback, aprovação |
| 47 | API Design | `skills/gestao/api-design/SKILL.md` | REST, versionamento, paginação |
| 48 | Onboarding Produto | `skills/gestao/onboarding-produto/SKILL.md` | Wizard, dados demo, ativação |

---

## Os 9 Mandamentos — Resumo Operacional

Detalhes completos em `skills/governanca/9-mandamentos/SKILL.md`.

| # | Mandamento | Resumo |
|---|:---|:---|
| 01 | Isolamento total do Clerk | Clerk só para autenticação. Permissões vêm do banco via `/api/v1/me`. PROIBIDO ler `publicMetadata.role`. |
| 02 | `schema.prisma` é intocável | Apenas o Coordenador altera, via script. Adeque o código ao schema, não o contrário. |
| 03 | Adesão estrita ao DDD | `id_organizacao`, `id_workspace`, `id_usuario`, `tipo_usuario`, `is_gravity_admin`. |
| 04 | Lógica de Vínculo (O Limbo) | Master e Super Admin têm acesso global, sem depender de `UsuarioWorkspace`. |
| 05 | Proibido mocks preguiçosos | Sem `useState<T>({} as T)`, sem string vazia para satisfazer compilador. Use `null`/`undefined`. |
| 06 | Validação Zod obrigatória | Toda resposta de `fetch().json()` passa por `schema.parse()`. |
| 07 | Sincronia de contratos | Renomear campo de API exige atualizar TODOS os consumidores no MESMO commit. |
| 08 | Fim dos fallbacks silenciosos | Autorização falha alto. Nunca `(data?.x?.y ?? null) as Role`. |
| 09 | Schemas Zod são contratos bilaterais | Backend mudou? Zod muda no mesmo commit. Sem `z.any()`/`.passthrough()`. |

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
- **3 índices obrigatórios** em todo model (campos Prisma mapeados via `@map` para colunas DDD no banco)

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

Isso carrega as 48 skills e ativa os 11 papéis. O agente passa a aplicar todas as regras automaticamente de acordo com o contexto.

> **Lembrete:** os 9 Mandamentos e o CLAUDE.md raiz já carregam automaticamente em toda conversa, mesmo sem este comando.

### Outros Comandos

| Comando | O que faz |
|:---|:---|
| `/dream-team-tecnologia` | Carrega o time completo (48 skills) |
| `/lider` | Ativa modo Líder (análise + distribuição) |
| `/coordenar` | Ativa modo Coordenador (schema + contratos + ondas) |
| `/qa` | Ativa modo QA (revisão completa pós-entrega) |
| `/deploy` | Fluxo de deploy/migração |

---

## Evolução — O Que Veio de Onde

### Origem (38 skills)

As 38 skills originais foram criadas para cobrir a arquitetura do monorepo, padrões de código, segurança básica e serviços da plataforma. Elas cobriam bem o "como construir", mas tinham gaps em:

- Processos de gestão (sem sprints, sem handoff, sem definition of done)
- Performance (sem SLAs, sem load testing, sem budget de latência)
- Segurança avançada (sem pentest, sem rate limiting, sem incident response)
- Infraestrutura (sem backup strategy, sem auto-scaling, sem DR)

### Análise de Gaps

O documento `gravity_projeto_completo.docx` foi analisado capítulo por capítulo. Foram encontrados **16 gaps** entre o que o documento define e o que as skills cobriam. Os mais críticos:

1. **Rate Limiting por organização** — sem isso, uma organização pode derrubar a plataforma
2. **Backup & DR** — documento define 4 tipos de backup, nenhuma skill governava
3. **Resilience Patterns** — degradação graciosa, retry, DLQ estavam dispersos

### Expansão e alinhamento pós-refatoração

| Fase | Resultado |
|:---|:---|
| Expansão inicial | 38 → 57 skills (19 novas + 8 enriquecidas) |
| Pós-refatoração DDD (Abril 2026) | +1 skill (9 Mandamentos) |
| Categorias pausadas (Serviços por Organização, Produtos) | −10 skills do inventário ativo |
| **Total ativo atual** | **48 skills** |

---

## Estrutura de Arquivos

```
skills/                              ← 48 SKILL.md ativos
├── agentes/                         ← 3 skills (lider, coordenador, qa)
├── arquitetura/                     ← 10 skills
├── gestao/                          ← 6 skills
├── governanca/                      ← 6 skills (incluindo 9-mandamentos e ddd-regras-usuario)
├── infra-estrutura/                 ← 10 skills
├── seguranca/                       ← 9 skills
└── ux/                              ← 4 skills

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

### Regras Invioláveis (alinhadas aos 9 Mandamentos)

- **TypeScript** strict, sem `any`, sem `@ts-ignore`, ESModules only
- **Banco**: bancos de produto usam Schema-per-Organização; acesso exclusivamente via `withTenant`/`withTenantContext` do `@gravity/tenant-resolver`; `PrismaClient` direto é PROIBIDO; Configurador usa single-schema `public`
- **Schema Prisma**: NUNCA alterar `schema.prisma` (Mandamento 02). Apenas o Coordenador, via script
- **DDD**: usar `id_organizacao`, `id_workspace`, `id_usuario`, `tipo_usuario`, `is_gravity_admin` em payloads, propriedades e variáveis (Mandamento 03)
- **Acesso global**: Master e Super Admin reconhecidos sem `UsuarioWorkspace` (Mandamento 04)
- **Estado React**: nunca `useState<T>({} as T)`, sempre `null`/`undefined` + tratamento (Mandamento 05)
- **Validação Zod**: toda resposta de `fetch().json()` passa por `schema.parse()` antes do uso (Mandamento 06)
- **Sincronia de contratos**: renomear campo de API exige atualizar TODOS os consumidores no MESMO commit (Mandamento 07)
- **Sem fallbacks silenciosos em autorização**: `tipo_usuario` ausente = falhar alto ou logar (Mandamento 08)
- **Schemas Zod bilaterais**: backend mudou → Zod do frontend muda no mesmo commit (Mandamento 09)
- **Autenticação**: Clerk APENAS para autenticação; permissões vêm do Prisma via `GET /api/v1/me` (Mandamento 01)
- **Segurança**: Zod em toda rota, JWT validado via `@clerk/backend`, `x-internal-key` em S2S
- **Isolamento**: serviços nunca importam código de outro serviço
- **Testes**: todo código entregue com unitários + funcionais, cobertura ≥ 70%
- **Entrega**: QA revisa com checklist completo → aprovado ou rejeitado

---

## Manutenção

### Quando Adicionar uma Nova Skill

1. Criar `skills/[categoria]/[nome]/SKILL.md` seguindo o formato frontmatter
2. Atualizar o mapa em `CLAUDE.md`
3. Atualizar `.claude/commands/dream-team-tecnologia.md`
4. Atualizar este documento (`skills/dream-team-tecnologia/README.md`)
5. Garantir que a nova skill respeita os 9 Mandamentos e o DDD

### Quando Enriquecer uma Skill Existente

1. Adicionar a seção com tag `(Dream Team)` para rastreabilidade
2. Atualizar checklist se houver novos itens
3. Não remover conteúdo existente — apenas adicionar
4. Reler os 9 Mandamentos antes de qualquer mudança em contratos ou autorização

### Quando Remover uma Skill

1. Verificar se alguma outra skill referencia a que será removida
2. Atualizar todas as referências
3. Remover do mapa em `CLAUDE.md`
4. Remover do comando `dream-team-tecnologia.md`
5. Justificar a remoção no commit (motivo + impacto)

### Quando Reativar Categorias Pausadas

Quando as categorias **Serviços por Organização** ou **Produtos** (hoje em andamento com Pedido) forem 100% definidas:

1. Reinserir as seções no inventário deste README
2. Atualizar a contagem total de skills
3. Incluir as skills no comando `dream-team-tecnologia.md`
4. Validar que todas as skills reativadas passam nos 9 Mandamentos
