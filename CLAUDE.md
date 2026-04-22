# Gravity — Instruções Obrigatórias para Agentes

> **Este arquivo é carregado automaticamente em toda conversa.**
> Todas as regras aqui são obrigatórias. Nenhuma pode ser ignorada.

---

## A quem estas regras se aplicam

**TODOS os agentes, em TODAS as conversas, sem exceção.**

Isto inclui:

- O agente padrão do Claude Code (quando o usuário conversa direto, sem invocar `/comando`)
- Qualquer subagente (`Explore`, `general-purpose`, `Plan`, etc.)
- Qualquer skill invocada via Skill tool
- Qualquer papel dos times (`/lider`, `/coordenar`, `/qa`, `/dream-team-*`)

**Não existe "conversa informal" ou "tarefa pequena" isenta dessas regras.** Se você está lendo este arquivo, as 9 Mandamentos abaixo e as regras de governança valem.

---

## Regra Zero — Ler Skills Antes de Agir

**NUNCA escreva código, sugira mudanças ou tome decisões sem antes ler as skills relevantes.**

Antes de qualquer tarefa — **mesmo quando nenhum time ou papel específico foi invocado** — o agente DEVE:

1. Ler `skills/governanca/9-mandamentos/SKILL.md` (**os 9 Mandamentos — não-negociáveis**)
2. Ler `skills/governanca/agent-policy/SKILL.md` (regras universais)
3. Ler `skills/governanca/code-standards/SKILL.md` (padrões de código)
4. Ler a(s) skill(s) específica(s) da área sendo trabalhada (ver mapa abaixo)
5. Confirmar que está dentro do escopo autorizado (ver agent-policy)

**Se a skill não foi lida, o trabalho não pode começar.**

---

## Os 9 Mandamentos do Gravity (não-negociáveis)

> **Estas regras são absolutas e valem para TODO agente, em TODA conversa, em TODA alteração de código — sem exceção.**
> Não dependem de invocação de papel, skill ou slash command. Se há código sendo escrito ou sugerido, essas regras aplicam.
> Cada uma existe porque já causou perda de tempo, retrabalho ou bug em produção.
> Violação = trabalho rejeitado pelo QA, sem exceção.

---

### REGRA 01 — ISOLAMENTO TOTAL DO CLERK (Autenticação ≠ Autorização)

O Clerk serve **apenas** para autenticação (login, senha, e-mail, `clerk_user_id`) e nada mais.

❌ **EXPRESSAMENTE PROIBIDO** ler ou gravar patentes/permissões no Clerk (ex: NUNCA use `user.publicMetadata.role` no frontend ou backend).

✅ A **Fonte da Verdade** para permissões é o nosso Banco de Dados (Prisma). O Frontend deve ler a patente do usuário a partir do nosso próprio backend (ex: consumindo o JSON da rota `/api/v1/me` através de um estado global).

---

### REGRA 02 — O `schema.prisma` É INTOCÁVEL

Você está PROIBIDO de alterar, adicionar ou remover qualquer linha do arquivo `schema.prisma`.

❌ **Jamais faça:** editar `schema.prisma` diretamente para "resolver" um erro de compilação ou adequar o banco ao código.

✅ **Sempre faça:** adeque o código TypeScript (Controllers, Services, React Components) à estrutura existente no Prisma, e não o contrário. Se a estrutura do banco precisar mudar, **pare** e abra um chamado para o Coordenador — ele é o único autorizado a alterar o schema via script controlado.

**Por quê:** o schema representa decisões de arquitetura revisadas e validadas. Alterá-lo sem controle quebra migrations, gera drift de banco e pode corromper dados em produção.

---

### REGRA 03 — ADESÃO ESTRITA AO NOSSO DDD (Dicionário de Dados)

> **Esta tabela está em construção e será refinada ao longo do projeto.** Os mapeamentos abaixo são os já decididos.

Nós abandonamos nomenclaturas legadas (`Tenant`, `Company`, `Role`). Você DEVE usar EXATAMENTE estes nomes nas propriedades de objetos, payloads JSON e variáveis:

- **Tenant** ➔ Use `id_organizacao`, `nome_organizacao`, `subdominio_organizacao`
- **Company** ➔ Use `id_workspace`, `nome_workspace`, `subdominio_workspace`
- **User** ➔ Use `id_usuario`, `nome_usuario`, `email_usuario`
- **Role** ➔ Use `tipo_usuario` (para patentes gerais) e `tipo_usuario_workspace` (para patentes na filial)
- **Admin** ➔ Use `is_gravity_admin` (Boolean para controle absoluto)

---

### REGRA 04 — LÓGICA DE VÍNCULO (O LIMBO)

Usuários **Master** (`is_gravity_admin = true`) ou **Super Admins** (`tipo_usuario = 'SUPER_ADMIN'`) **não podem** ficar presos em telas de "Nenhum workspace encontrado". O código deve garantir que o Frontend e o Backend reconheçam o acesso global deles, independentemente de estarem vinculados fisicamente na tabela de `UsuarioWorkspace`.

---

### REGRA 05 — PROIBIDO MOCKS PREGUIÇOSOS E CASTING VAZIO (`{}` ou `""`)

É estritamente proibido contornar erros de TypeScript injetando objetos vazios, strings vazias ou fazendo type assertions falsas.

**No Frontend (React):** NUNCA inicialize estados de entidades com objetos vazios (ex: `useState<Usuario>({} as Usuario)`). Se o dado não existe ou está carregando, o estado DEVE ser `null` ou `undefined`. Trate o carregamento corretamente na UI (ex: `if (!usuario) return <Loading />`).

**No Backend (Prisma):** NUNCA envie strings vazias (`""`) para relações ou IDs só para satisfazer o compilador. Se um campo é opcional e não tem valor, passe `null` ou `undefined`.

Não invente dados falsos no código. Se o dado precisa vir da API ou do Banco, faça o fluxo correto de busca.

---

### REGRA 06 — VALIDAÇÃO DE CONTRATO DE API OBRIGATÓRIA (ZOD)

Nunca deserialize resposta de API sem validação de schema. O `fetch().json()` retorna `any`, cegando o TypeScript.

❌ **Jamais faça:**
```ts
const data = await fetch('/api/v1/me').then(r => r.json())
const role = data?.user?.role
```

✅ **Sempre faça:**
```ts
const raw = await fetch('/api/v1/me').then(r => r.json())
const data = meResponseSchema.parse(raw)
const role = data.usuario.tipo_usuario
```

---

### REGRA 07 — SINCRONIA DE CONTRATOS (FRONT E BACK JUNTOS)

Nunca renomeie um campo de resposta de API sem atualizar TODOS os consumidores na mesma entrega.

Antes de renomear, faça uma busca global (ex: `grep -r "data\.user"`) e corrija todos os arquivos `.ts` e `.tsx` que leem o campo. Modifique back e front juntos para evitar quebras silenciosas.

---

### REGRA 08 — FIM DOS FALLBACKS SILENCIOSOS EM AUTORIZAÇÃO

Dados de autorização devem falhar fazendo barulho. Se o `tipo_usuario` não for encontrado, não mascare o erro com um valor padrão.

❌ **Jamais faça:**
```ts
const role = (data?.user?.role ?? null) as SystemRole
// null → fallback 'Standard' → usuário SUPER_ADMIN aparece como Standard
// Sem erro. Sem log. Bug invisível.
```

✅ **Sempre faça:**
```ts
// Opção A — falha ruidosa (preferível em autorização)
const role = meResponseSchema.parse(data).usuario.tipo_usuario

// Opção B — se precisar de fallback, deixe rastro obrigatório
const role = data?.usuario?.tipo_usuario ?? null
if (!role) console.warn('[useLoadSystemRole] tipo_usuario ausente na resposta de /me', data)
```

**Por quê:** nível de acesso errado não quebra a tela — exibe permissão falsa. A aplicação continua rodando e ninguém percebe. Autorização deve falhar alto ou deixar rastro, nunca engolir o problema em silêncio.

---

### REGRA 09 — SCHEMAS ZOD SÃO CONTRATOS BILATERAIS

O schema Zod do frontend deve ser mantido em sincronia com o payload de resposta do backend. Nunca use `z.any()` ou `.passthrough()` para "resolver" divergências entre os dois.

❌ **Jamais faça:**
```ts
// Backend mudou o campo mas o schema Zod não foi atualizado
const meResponseSchema = z.object({
  user: z.object({ role: z.string() })  // campo renomeado no backend, Zod desatualizado
})
// Resultado: parse passa, campo retorna undefined, bug silencioso
```

✅ **Sempre faça:**
- Sempre que uma rota mudar seu payload, atualize o schema Zod correspondente **no mesmo commit**
- Antes de renomear qualquer campo de resposta, busque globalmente pelo schema que o descreve: `grep -r "meResponseSchema\|z.object" --include="*.ts" --include="*.tsx"`
- O schema Zod é o contrato — se o backend mudou e o Zod não mudou, **o commit está incompleto**

**Por quê:** o Zod só protege se estiver correto. Um schema desatualizado dá falsa sensação de segurança — o parse "passa" mas retorna campos errados ou `undefined`, exatamente o mesmo bug que aconteceria sem validação nenhuma.

---

## Mapa de Skills — Quando Consultar Cada Uma

### Agentes (Papéis)

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Líder | `skills/agentes/lider/SKILL.md` | Distribuição de tarefas, análise de progresso, relatórios |
| Coordenador | `skills/agentes/coordenador/SKILL.md` | Composição de schema, validação de contratos, conflitos entre agentes, checklist de ondas |
| QA | `skills/agentes/qa/SKILL.md` | Revisão pós-entrega, validação de testes, aprovação/rejeição |
| Detetive de Tela | `skills/dream-team-detetive-tela/SKILL.md` | **Análise forense completa de uma tela** — front, back, rotas, APIs, banco, segurança, performance, UX |

### Governança (Sempre Obrigatórias)

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Agent Policy | `skills/governanca/agent-policy/SKILL.md` | **SEMPRE — antes de qualquer tarefa** |
| Ambiente | `skills/governanca/ambiente/SKILL.md` | Antes de iniciar servidor, definir porta |
| Code Standards | `skills/governanca/code-standards/SKILL.md` | **SEMPRE — antes de escrever código** |
| Deploy | `skills/governanca/deploy/SKILL.md` | Migrações, deploy, rollback, Railway |
| Database Governance | `skills/governanca/database-governance/SKILL.md` | **Criar/alterar models Prisma** — paridade nominal, Database-per-Service, public vazio |
| Lint Tenant-Safety | `skills/governanca/lint-tenant-safety/SKILL.md` | Linter custom CI — bloqueia PrismaClient direto, cache sem prefixo, etc. |
| Monorepo | `skills/governanca/monorepo/SKILL.md` | **Qualquer alteração em package.json, tsconfig, vite.config, dependências** |
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
| Nova Tela Produto | `skills/produtos/nova-tela-produto/SKILL.md` | **Criar/replicar tela de produto — padrão inviolável** |
| SimulaCusto | `skills/produtos/simulacusto/SKILL.md` | Produto SimulaCusto, cálculo fiscal, NCM |
| Dream Team Pedido | `skills/dream-team-pedido/SKILL.md` | **Qualquer trabalho em produto/pedido/*** — auth Clerk+Prisma, API interna, tabela, rotas SPA, armadilhas Prisma |

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
- `/dream-team-detetive-tela` — **Análise forense completa de uma tela (front + back + banco + segurança + UX)**
- `/dream-team-pedido` — **Regras de arquitetura e negócio do produto Pedido (auth, API, tabela, Prisma)**
- `/lider` — Ativar modo Líder (análise + distribuição)
- `/coordenar` — Ativar modo Coordenador (schema + contratos + ondas)
- `/qa` — Ativar modo QA (revisão completa pós-entrega)
- `/criar-produto` — Fluxo para criar novo produto
- `/deploy` — Fluxo de deploy/migração
- `/skill [nome]` — Ler uma skill específica pelo nome
