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

1. Ler `skills/governanca/lei/9-mandamentos/SKILL.md` (**os 9 Mandamentos — não-negociáveis**)
2. Ler `skills/governanca/lei/agent-policy/SKILL.md` (regras universais)
3. Ler `skills/governanca/convencao-tecnica/code-standards/SKILL.md` (padrões de código)
4. Ler `skills/governanca/lei/ddd-nomenclatura/SKILL.md` (**lei única de nomenclatura — nomes de campo, tabela, rota, função, arquivo, label**)
5. Ler a(s) skill(s) específica(s) da área sendo trabalhada (ver mapa abaixo)
6. Confirmar que está dentro do escopo autorizado (ver agent-policy)

**Se a skill não foi lida, o trabalho não pode começar.**

---

## Regra de Criação Restrita — Slash Commands

**PROIBIDO criar, recriar ou restaurar qualquer slash command** (`.claude/commands/*.md` no projeto OU `~/.claude/commands/*.md` user-global) **sem confirmação dupla explícita do dono do projeto.**

❌ Jamais faça:
- Criar arquivo novo em `.claude/commands/` ou `~/.claude/commands/`
- Sugerir "vou recriar o `/lider` para você" sem pedir autorização
- Restaurar via `git checkout` ou cópia de outra fonte sem aval

✅ Sempre faça:
- Se identificar necessidade de slash command, **descrever a proposta** e aguardar duas confirmações explícitas do dono antes de criar
- Documentar no commit a justificativa da criação

**Por quê:** os 11 slash commands originais foram deletados em 21/04/2026 como parte da FASE 1 do alinhamento DDD. Recriação descontrolada gera ruído, comandos desatualizados e regressão dos padrões.

---

## Regra de Criação Restrita — Memory Persistente

**PROIBIDO criar, atualizar ou restaurar arquivos de memory** (`~/.claude/projects/<projeto>/memory/*.md`) **sem confirmação dupla explícita do dono do projeto.**

❌ Jamais faça:
- Salvar memory automaticamente quando o usuário diz "lembra que..." sem confirmar duas vezes
- Criar memory novo só porque a auto-memory do system prompt sugere
- Restaurar entries deletadas

✅ Sempre faça:
- Se identificar potencial memory útil, **descrever em uma frase** o que seria salvo e aguardar duas confirmações explícitas
- Quando confirmar, atualizar também o `MEMORY.md` (índice) com a nova entrada
- Em caso de dúvida sobre sobrescrita: parar e perguntar

**Por quê:** memory carrega automaticamente em toda conversa, sem o usuário pedir. Memory desatualizada ou conflitante causa propagação silenciosa de erros entre sessões. Em 21/04/2026 foram deletadas 5 entries por conterem nomenclatura legada ou anti-padrões de autorização (Clerk publicMetadata).

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
- **Admin** ➔ Use `gravity_admin` (Boolean para controle absoluto — sem prefixo `is_`, ver skill `ddd-nomenclatura` REGRA 5)

---

### REGRA 04 — LÓGICA DE VÍNCULO (O LIMBO)

Usuários **Master** (`gravity_admin = true`) ou **Super Admins** (`tipo_usuario = 'SUPER_ADMIN'`) **não podem** ficar presos em telas de "Nenhum workspace encontrado". O código deve garantir que o Frontend e o Backend reconheçam o acesso global deles, independentemente de estarem vinculados fisicamente na tabela de `UsuarioWorkspace`.

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
const tipoUsuario = (data?.user?.role ?? null) as TipoUsuario
// null → fallback 'Standard' → usuário SUPER_ADMIN aparece como Standard
// Sem erro. Sem log. Bug invisível.
```

✅ **Sempre faça:**
```ts
// Opção A — falha ruidosa (preferível em autorização)
const tipoUsuario = meResponseSchema.parse(data).usuario.tipo_usuario

// Opção B — se precisar de fallback, deixe rastro obrigatório
const tipoUsuario = data?.usuario?.tipo_usuario ?? null
if (!tipoUsuario) console.warn('[useCarregarTipoUsuario] tipo_usuario ausente na resposta de /me', data)
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

> ⚠️ **PRINCÍPIO ARQUITETURAL — FONTE ÚNICA DE VERDADE (SSOT)**
>
> **NENHUMA REGRA ABSOLUTA DEVE SER ESCRITA EM SKILLS DE OPERAÇÃO OU VERTICAIS. REGRAS MORAM EM GOVERNANÇA.**
>
> Toda regra absoluta vive em `skills/governanca/lei/` (regras de negócio/arquitetura) ou `skills/governanca/convencao-tecnica/` (convenções de código). Skills em `produtos-gravity/`, `arquitetura/`, `seguranca/`, `governanca/operacao/` etc. **referenciam** as regras via blocos `> ⚠️ REGRA ABSOLUTA: Ver [...]`. **Nunca redefinem.**
>
> Se você for escrever uma regra absoluta em uma vertical/operação — pare. Mova para `governanca/lei/` ou `governanca/convencao-tecnica/` e referencie da vertical.

**Estrutura:** 65 SKILL.md em 11 grupos. Governança subdividida em 3 categorias (lei + convenção técnica + operação).

---

### 1. Governança › Lei (12 skills) — Regras absolutas

> Ler **antes de qualquer tarefa**. Estas valem sempre, independente de papel ou área.

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| 9 Mandamentos | `skills/governanca/lei/9-mandamentos/SKILL.md` | **SEMPRE — antes de qualquer tarefa** |
| Agent Policy | `skills/governanca/lei/agent-policy/SKILL.md` | **SEMPRE — escopo, prioridades, bloqueios** |
| Visão Geral | `skills/governanca/lei/visao-geral/SKILL.md` | Entender o projeto, stack, estrutura, ondas |
| DDD Nomenclatura | `skills/governanca/lei/ddd-nomenclatura/SKILL.md` | **SEMPRE — antes de nomear qualquer coisa (campo, tabela, rota, função, arquivo, label)** |
| Terminal | `skills/governanca/lei/terminal/SKILL.md` | Antes de rodar comando autônomo (instalar, build, kill-port) |
| Isolamento de Organização | `skills/governanca/lei/isolamento-organizacao/SKILL.md` | **Qualquer acesso a banco de dados** |
| SDK Resolvedor de Organização | `skills/governanca/lei/sdk-resolvedor-organizacao/SKILL.md` | **`@gravity/tenant-resolver` — `withTenant`, `withTenantContext`, `TenantDatabase`** |
| SLA Metas ⭐ | `skills/governanca/lei/sla-metas/SKILL.md` | 200ms p95, 50k req/s, 99,9% uptime, budget de latência por camada |
| Cost Budget ⭐ | `skills/governanca/lei/cost-budget/SKILL.md` | Limites mensais por ambiente, thresholds 70/80/90/95%, bloqueio de scaling em 95% |
| Backup Policy ⭐ | `skills/governanca/lei/backup-policy/SKILL.md` | RPO 24h, RTO 1h, backup pré-migration obrigatório, teste de restauração mensal |
| Database Governance ⭐ | `skills/governanca/lei/database-governance/SKILL.md` | **Criar/alterar models Prisma** — paridade Front=Back=Banco, schema-per-org, public vazio, CUID, FK Nullable Proibida (promovida de convenção-técnica em 2026-04-28) |
| Cadastros Snapshot Policy ⭐ | `skills/governanca/lei/cadastros-snapshot-policy/SKILL.md` | **Como cada produto consome Empresa/Moeda/Unidade/NCM do Cadastros** — leitura ao vivo (gestão) vs snapshot congelado (emissão de documento legal/fiscal/financeiro) |

> ⭐ = nova skill (Fase C1 da reorganização SSOT)

---

### 2. Governança › Convenção Técnica (7 skills) — Como escrever código

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Code Standards | `skills/governanca/convencao-tecnica/code-standards/SKILL.md` | **SEMPRE — antes de escrever código** |
| Monorepo | `skills/governanca/convencao-tecnica/monorepo/SKILL.md` | **Qualquer alteração em package.json, tsconfig, vite.config, dependências** |
| Lint Tenant-Safety | `skills/governanca/convencao-tecnica/lint-tenant-safety/SKILL.md` | Linter custom CI — bloqueia `PrismaClient` direto, cache sem prefixo |
| API Design | `skills/governanca/convencao-tecnica/api-design/SKILL.md` | Convenções REST, versionamento, paginação, validação Zod |
| Criptografia ⭐ | `skills/governanca/convencao-tecnica/criptografia/SKILL.md` | SHA-256 (tokens), AES-256-GCM (credenciais ERP), HMAC-SHA256 (webhooks) |
| Observabilidade Mínima ⭐ | `skills/governanca/convencao-tecnica/observabilidade-minima/SKILL.md` | Métricas obrigatórias por serviço, ferramentas obrigatórias, log de auditoria de ações sensíveis |
| Enum ⭐ | `skills/governanca/convencao-tecnica/enum/SKILL.md` | Criar/renomear enum, auditar a aba `4. mapa-enums` da planilha DDD, propor correção de nome na planilha (não toca em código) |

---

### 3. Governança › Operação (4 skills) — Como a plataforma roda em produção

> Estas skills implementam as regras das duas seções acima. **Não duplicam** as regras — referenciam.

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Auto-Scaling | `skills/governanca/operacao/auto-scaling/SKILL.md` | Configuração Railway (min/max instâncias, triggers CPU/RAM, scale-to-zero). Regras → `lei/cost-budget` |
| Backup & DR | `skills/governanca/operacao/backup-disaster-recovery/SKILL.md` | Scripts pg_dump, S3, plano de DR (4 cenários). Regras → `lei/backup-policy` |
| Performance Monitoring | `skills/governanca/operacao/performance-monitoring/SKILL.md` | Sentry, UptimeRobot, dashboards Grafana, alertas, profiling. Regras → `lei/sla-metas` + `convencao-tecnica/observabilidade-minima` |
| Service Registry | `skills/governanca/operacao/service-registry/SKILL.md` | PRODUCT_CONFIG, contracts.json, discovery, navegação |

---

### 4. Processos (4 skills) — Fluxos de trabalho pontuais

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Deploy | `skills/processos/deploy/SKILL.md` | Migrações, deploy, rollback, Railway, bootstrap |
| Code Review | `skills/processos/code-review/SKILL.md` | Padrões de review, checklist técnico, aprovação |
| Criar Produto | `skills/processos/criar-produto/SKILL.md` | **Criar novo produto do zero** |
| Incident Response | `skills/processos/incident-response/SKILL.md` | Runbook P0-P3, post-mortem, escalonamento |

---

### 5. Papéis (4 skills) — Quem age

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Líder | `skills/papeis/lider/SKILL.md` | Distribuição de tarefas, análise de progresso, relatórios |
| Coordenador | `skills/papeis/coordenador/SKILL.md` | Schema composition, contratos, ondas, aprovações |
| QA | `skills/papeis/qa/SKILL.md` | Revisão pós-entrega, 6 categorias obrigatórias |
| Analista de Erros (Testes) | `skills/papeis/analista-erros-testes/SKILL.md` | Análise de falhas de teste com Gemini |

---

### 6. Arquitetura (8 skills) — Padrões dos sistemas Gravity

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Núcleo Global | `skills/arquitetura/nucleo-global/SKILL.md` | Componentes em `nucleo-global/` |
| Schema Composition | `skills/arquitetura/schema-composition/SKILL.md` | Composição de Prisma fragments por serviço |
| Serviços de Organização | `skills/arquitetura/servicos-plataforma/SKILL.md` | Serviços tenant — 1 banco compartilhado por organização |
| Estado | `skills/arquitetura/estado/SKILL.md` | Zustand, Event Bus, cache cliente |
| Cache | `skills/arquitetura/cache/SKILL.md` | Camadas (in-memory + Redis), Cache-Aside, TTL, invalidação por evento, prefixo `organizacao:` (REGRA 4 do linter) |
| Resiliência | `skills/arquitetura/resiliencia/SKILL.md` | Retry, circuit breaker, DLQ, degradação graciosa |
| Observabilidade | `skills/arquitetura/observabilidade/SKILL.md` | Logs estruturados, correlation ID, integração Sentry |
| Tradução (i18n) | `skills/arquitetura/traducao/SKILL.md` | i18next, pipeline Gemini, useLocale, lazy loading |

---

### 7. Segurança (7 skills) — Padrões da camada de segurança

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Segurança 5 Camadas | `skills/seguranca/seguranca-5-camadas/SKILL.md` | **Checklist obrigatório de segurança para toda entrega** |
| Permissões | `skills/seguranca/permissoes/SKILL.md` | RBAC via `tipo_usuario`, fonte da verdade Configurador |
| Autenticação S2S | `skills/seguranca/autenticacao-s2s/SKILL.md` | JWT inter-serviço, machine tokens, `x-chave-interna-servico` |
| Cross-Boundary | `skills/seguranca/cross-boundary/SKILL.md` | Ações cross-banco, BullMQ, DLQ, agregação eventual |
| Rate Limiting | `skills/seguranca/rate-limiting/SKILL.md` | `express-rate-limit` com Redis, limites por org/rota |
| Pentest | `skills/seguranca/pentest/SKILL.md` | OWASP Top 10, ferramentas, relatório |
| Tier 1 Security | `skills/seguranca/tier1-security/SKILL.md` | Padrões P0 em endpoints críticos |

---

### 8. Testes (8 skills) — Padrões e agentes de teste

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Coordenação de Testes | `skills/testes/SKILL.md` | Visão geral — Vitest unitário/funcional + Playwright E2E |
| Padrões Vitest/Playwright | `skills/testes/padroes-vitest-playwright/SKILL.md` | Estrutura centralizada, cobertura 70%+, mocks |
| Teste em Tela | `skills/testes/teste-em-tela/SKILL.md` | Validação visual, snapshots Percy |
| Contract Testing | `skills/testes/contract-testing/SKILL.md` | Zod como contrato bilateral, CI bloqueia breaking changes |
| Agente Plano de Teste | `skills/testes/agente-plano-teste/SKILL.md` | Agente que cria planos de teste |
| Agente Plano E2E | `skills/testes/agente-plano-teste-e2e/SKILL.md` | Playwright + Percy em staging |
| Agente Plano Funcional | `skills/testes/agente-plano-teste-funcional/SKILL.md` | Rotas, fluxos, integração |
| Agente Plano Unitário | `skills/testes/agente-plano-teste-unitario/SKILL.md` | Vitest, cobertura, categorias |

---

### 9. UX (5 skills) — Padrões de interface

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Design System | `skills/ux/design-system/SKILL.md` | Solid Slate (cores, tipografia, ícones, dark mode padrão) |
| Componentes | `skills/ux/componentes/SKILL.md` | Mapeamento nucleo-global vs custom |
| Criação de Telas | `skills/ux/criacao-telas/SKILL.md` | **Padrão inviolável de criação/replicação de tela** |
| Tooltip | `skills/ux/tooltip/SKILL.md` | Texto de tooltip (≤ 90 caracteres), i18n |
| Acessibilidade | `skills/ux/acessibilidade/SKILL.md` | WCAG 2.1 AA, aria-labels, navegação por teclado |

---

### 10. Produtos Gravity (6 skills + futuros) — Verticais da empresa Gravity

| Skill | Caminho | Quando Consultar |
|-------|---------|-----------------|
| Configurador | `skills/produtos-gravity/configurador/SKILL.md` | Auth/Clerk, billing/Stripe, permissões, multi-workspace |
| Configurador › Admin | `skills/produtos-gravity/configurador/admin/SKILL.md` | Painel admin interno (impersonação, deploy Railway, monitor de APIs) |
| API Cockpit | `skills/produtos-gravity/api-cockpit/SKILL.md` | Tokens, playground, webhooks, conector ERP/SAP, fluxo Gabi OData |
| Marketplace | `skills/produtos-gravity/marketplace/SKILL.md` | Landing pública, pricing, onboarding (sem auth, sem backend) |
| Pedido | `skills/produtos-gravity/pedido/SKILL.md` | Lista, edição em massa (cascade Pedido→Item), consolidação, transferência. Convenção `@@unique` e anti-padrões |
| Simulador COMEX | `skills/produtos-gravity/simulador-comex/SKILL.md` | **BLOQUEADO — não iniciar sem regras de negócio** |

> Futuros: `bid-frete/`, etc. seguem o mesmo padrão (vertical em `produtos-gravity/`, **sem** regras absolutas embutidas — referenciar SSOT).

---

### 11. Dream Team — Umbrellas (4 sub-projetos, 14 arquivos)

| Sub-projeto | Caminho | Conteúdo |
|-------|---------|----------|
| Produtos | `skills/dream-team/produtos/` | 11 arquivos: 8 agentes (PM, SME, Data, Pesquisador, UX, BA, Designer, Tech Lead) + fluxo completo + entregáveis/handoff |
| Tecnologia | `skills/dream-team/tecnologia/README.md` | Mapa do time de tecnologia |
| Detetive de Tela | `skills/dream-team/detetive-tela/SKILL.md` | **Análise forense completa de uma tela** — front, back, rotas, banco, segurança, performance, UX |
| Ajustes | `skills/dream-team/ajustes/SKILL.md` | Ajustes em produtos existentes |

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
- Todo model tem `id_organizacao String` obrigatório
- Todo model tem 3 índices: `@@index([id_organizacao])`, `@@index([id_organizacao, id_produto])`, `@@index([id_organizacao, id_usuario])`
- Nenhuma query sem filtro por `id_organizacao`
- Nenhum agente edita `schema.prisma` — só o Coordenador via script
- Cada serviço escreve apenas seu `fragment.prisma`

**Segurança:**
- Toda rota tem validação Zod antes do banco
- JWT validado em rotas protegidas via `@clerk/backend`
- `x-chave-interna-servico` em toda chamada inter-serviço
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
├── skills/                  ← 65 SKILL.md em 11 grupos (governança como SSOT)
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

- `/dream-team-tecnologia` — **Carregar o time de tecnologia (65 skills em 11 grupos)**
- `/dream-team-produtos` — **Carregar o time de produtos (11 arquivos, 8 agentes)**
- `/dream-team-detetive-tela` — **Análise forense completa de uma tela (front + back + banco + segurança + UX)**
- `/lider` — Ativar modo Líder (análise + distribuição)
- `/coordenar` — Ativar modo Coordenador (schema + contratos + ondas)
- `/qa` — Ativar modo QA (revisão completa pós-entrega)
- `/criar-produto` — Fluxo para criar novo produto
- `/deploy` — Fluxo de deploy/migração
- `/skill [nome]` — Ler uma skill específica pelo nome
