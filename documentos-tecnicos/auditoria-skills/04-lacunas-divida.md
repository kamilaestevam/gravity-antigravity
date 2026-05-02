# 04 — Lacunas + Dívida Técnica

> Áreas onde **não existe skill** cobrindo um padrão real do código (Lacunas)
> e decisões conscientes de **manter algo subótimo por retrocompatibilidade** (Dívida).

---

## Convenção

- **Lacuna** = código real usa o padrão; skill ausente cria risco de regressão
- **Dívida Técnica Consciente** = decisão registrada de manter por agora; remoção exige sessão dedicada

---

## L1 — Webhooks recebidos (HMAC, raw body, idempotência)

| Aspecto | Conteúdo |
|---|---|
| **Onde aparece no código** | `servicos-global/configurador/server/routes/auth.ts` (Clerk webhooks), `servicos-global/servicos-plataforma/server/index.ts:3` (raw body parser), `produtos-gravity/api-cockpit/SKILL.md` (webhooks outbound) |
| **O que falta cobrir** | Validação HMAC-SHA256, raw body parser obrigatório (não JSON parser), idempotência via `x-chave-idempotencia` ou hash do payload, retry exponencial, secret rotation, header `X-Gravity-Signature` |
| **Skill sugerida** | `seguranca/webhooks-recebidos/SKILL.md` (criar) **OU** seção dedicada em `seguranca/cross-boundary` |
| **Risco de Regressão** | 🔴 **ALTO** — webhooks têm falha silenciosa (200 OK retornado mesmo em assinatura inválida) e payload pode ser malicioso. Sem skill, agente vai inventar padrão diferente em cada webhook novo |
| **Status** | ❌ Pendente — criar skill |

---

## L2 — BullMQ / Jobs assíncronos

| Aspecto | Conteúdo |
|---|---|
| **Onde aparece** | Mencionado como "Fase 3" em `cross-boundary`, `arquitetura/resiliencia`, `auto-scaling`, `governanca/operacao/performance-monitoring` |
| **O que falta cobrir** | Quando usar BullMQ vs cron simples vs `enqueueOrgAction` (tabela atual `FailedOrgAction`); padrões de retry com backoff exponencial; DLQ Redis; concurrency settings; `removeOnComplete`/`removeOnFail`; observabilidade de filas |
| **Skill sugerida** | `arquitetura/jobs-assincronos/SKILL.md` (criar) **OU** consolidar em `cross-boundary` quando BullMQ for adotado |
| **Risco de Regressão** | 🟡 **MÉDIO** — sistema atual funciona com tabela `FailedOrgAction` + cron 5 min (cobre 99% dos casos por enquanto). Quando volume crescer, sem skill, padrão fica refém de quem implementar primeiro |
| **Status** | ❌ Pendente — pode aguardar até adoção real do BullMQ |

---

## L3 — Graceful shutdown / drain de conexões

| Aspecto | Conteúdo |
|---|---|
| **Onde aparece** | Ausente |
| **O que falta cobrir** | Tratamento de SIGTERM/SIGINT, drain de pool Prisma, fechamento de Redis, espera por requests em-voo, hot reload em desenvolvimento |
| **Skill sugerida** | Tolerável sem skill por enquanto. Criar quando aparecer regressão |
| **Risco de Regressão** | 🟢 **BAIXO** — Railway gerencia restarts; em produção raramente é problema. Em CI pode causar flakiness em testes integrados |
| **Status** | ⏸️ Não criar agora — observar |

---

## D1 — Termo `tenant` em artefatos físicos preservados

| Aspecto | Conteúdo |
|---|---|
| **Decisão** | Manter `tenant` em **5 artefatos físicos**: pacote NPM `@gravity/resolver-organizacao` (já renomeado, mas o histórico do pacote contém `tenant-resolver`), prefixo de schema PostgreSQL `tenant_<cuid>`, eventos de message bus `TenantProvisioned` / `TenantProvisionedComplete`, script `migrate-all-tenants.ts`, coluna física legada `tenant_id` (em janela de migração) |
| **Por que é dívida e não conflito** | Renomear esses artefatos exige: (a) versão major do pacote NPM com breaking change, (b) migração de schemas PostgreSQL com pgname rename + pause de tráfego, (c) backfill da coluna `tenant_id`, (d) renomeação de eventos no Configurador + workers + DLQs. Cada um é projeto dedicado. |
| **Como conviver** | Em **prosa de skills**, evitar a palavra `tenant` (preferir `organizacao`). Em **código que cita o artefato**, manter o nome físico real. Skills `isolamento-organizacao`, `sdk-resolvedor-organizacao`, `database-governance` documentam essa convivência |
| **Risco de Regressão** | 🟢 **BAIXO** — drift se for renomeado parcialmente (uma camada renomeia, outra não). Mitigação: regra clara "se você vê `tenant` num desses 5 contextos, é intencional" |
| **Quando remover a dívida** | Sessão dedicada com ADR. Provavelmente após Fase 4 do ADR-003 (cleanup de coluna `tenant_id`) |
| **Status** | ⚠️ Dívida técnica consciente — sem ação |

---

## D2 — `database-governance` veio de convenção-técnica para lei

| Aspecto | Conteúdo |
|---|---|
| **Decisão** | Skill foi criada em 2026-04-18 dentro de `governanca/convencao-tecnica/`, mas seu conteúdo é todo de **regras absolutas** (não convenções). Promovida para `governanca/lei/` em 2026-04-28 |
| **Risco de Regressão** | 🟡 **MÉDIO** — skills que linkam para o path antigo quebram. Mitigação: grep limpo aplicado (Fase 3 desta sessão) |
| **Quando remover a dívida** | Já removida — é dívida histórica documentada |
| **Status** | ✅ Resolvido nesta sessão |

---

## D3 — Skill `governanca/convencao-tecnica/lint-tenant-safety` mantém nome com `tenant`

| Aspecto | Conteúdo |
|---|---|
| **Decisão** | A skill referencia o linter custom de CI cujo nome no código é `Tenant Safety` (artefato real). Renomear só após renomeação do linter |
| **Risco de Regressão** | 🟢 BAIXO — está documentado em D1 (artefatos físicos) |
| **Quando remover** | Junto com D1 — sessão de limpeza de `tenant` |
| **Status** | ⚠️ Dívida técnica consciente |

---

## Resumo

| # | Tipo | Risco | Status |
|:---|:---|:---:|:---|
| L1 | Lacuna (webhooks) | 🔴 Alto | ❌ **Criar skill `seguranca/webhooks-recebidos/`** |
| L2 | Lacuna (jobs assíncronos) | 🟡 Médio | ❌ Pendente, não-urgente |
| L3 | Lacuna (graceful shutdown) | 🟢 Baixo | ⏸️ Observar |
| D1 | Dívida (`tenant` físico) | 🟢 Baixo | ⚠️ Consciente |
| D2 | Dívida (`database-governance` no path errado) | 🟡 Médio | ✅ Resolvida nesta sessão |
| D3 | Dívida (`lint-tenant-safety` nome) | 🟢 Baixo | ⚠️ Consciente |

## Próxima ação recomendada

**P0:** Criar `skills/seguranca/webhooks-recebidos/SKILL.md` antes do próximo webhook recebido novo. Conteúdo mínimo:
- Padrão raw body parser (não JSON)
- Validação HMAC-SHA256 com `timingSafeEqual`
- Header `X-Gravity-Signature` esperado
- Idempotência via `x-chave-idempotencia` ou hash do payload
- Retorno 401 sem processar payload em assinatura inválida
- Retry exponencial documentado
- Lista de webhooks atuais (Clerk, Resend, Meta WhatsApp Cloud API) com seus quirks
