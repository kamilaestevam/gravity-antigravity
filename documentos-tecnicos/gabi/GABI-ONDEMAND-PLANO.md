# GABI On-Demand — Plano de Implementação

> **Dream Team Tecnologia — Análise completa**
> **Status:** Planejamento aprovado — aguardando execução
> **Data:** Abril 2026

---

## Decisões Arquiteturais

### 1. Onde fica o endpoint `/api/gabi/field-help`?

**Decisão: `servicos-global/tenant/gabi/`**

O serviço gabi já é o repositório canônico de toda inteligência Gemini no Gravity, com chain de fallback de modelos, cálculo de custo e lógica de retry. Duplicar em cada produto seria manutenção N vezes com risco de inconsistência. O campo `produto` no body permite que o serviço monte o system prompt correto sem conhecer o domínio do produto.

---

### 2. Onde ficam `GabiTokenLog` e `GabiTokenQuota`?

**Decisão: divididos em dois bancos por responsabilidade:**

| Model | Banco | Motivo |
|-------|-------|--------|
| `GabiTokenLog` | Tenant DB — `fragment.prisma` da gabi | Dado operacional de runtime, precisa de RLS e reset mensal |
| `GabiTokenQuota` | Tenant DB — `fragment.prisma` da gabi | Mesma razão — consultado em tempo real por chamada |
| `gabi_quota_mensal` (campo) | Configurador — model `Product` | Configuração de catálogo, pertence ao mesmo nível que preço e billing |

---

### 3. Onde fica o job de reset mensal?

**Decisão: worker pg-boss em `servicos-global/tenant/gabi/server/queue/token-reset-worker.ts`, inicializado no startup do Configurador.**

Segue o padrão já estabelecido do `partition-worker` e `integrity-check-worker` do historico-global. Cron: `0 0 1 * *` (dia 1, meia-noite BRT).

---

### 4. Conflito com GABI-EXTRACAO-PLANO?

**Baixo risco — podem rodar em paralelo.**

O EXTRACAO mexe em `nucleo-global/Gabi/gabi-formula-global/` e `formulaEngine`. O ONDEMAND mexe em `nucleo-global/Gabi/gabi-field-icon-global/` (pasta diferente) e `fragment.prisma`. Único ponto de atenção: PRs simultâneos em `fragment.prisma` precisam de coordenação de merge entre os dois squads.

---

### Risco crítico identificado

O `server/routes/usage.ts` da gabi referencia campos (`model_used`, `tokens_input`, `tokens_output`, `cost_usd`) que **não existem no `fragment.prisma` atual**. A task T-01-01 deve reconciliar isso antes de criar os novos models, ou o `prisma generate` vai falhar.

---

## Ondas de Execução

### Onda 0 — Contratos (bloqueante para tudo)

| ID | Tarefa | Responsável |
|----|--------|-------------|
| T-00-01 | Definir contrato público de `GabiFieldIcon`: props, 5 estados, eventos, assinatura CSS | UX + Líder Técnico |
| T-00-02 | Definir contrato de `GabiTokenBadge`: props, paleta de cores por faixa, posicionamento | UX + Líder Técnico |
| T-00-03 | Definir contrato do endpoint: body Zod, response shape, códigos de erro (QUOTA_EXCEEDED, etc.) | Líder Técnico + Backend |
| T-00-04 | Mapear tokens do design system para 4 estados de cor (verde/amarelo/laranja/vermelho) | UX |
| T-00-05 | Definir escopo de permissão RBAC: role `gabi:tokens:buy` para autorizar compra adicional | PO + Segurança |
| T-00-06 | Definir valor padrão de `quota_mensal_gabi` para novos produtos no seed | PO + Líder do Projeto |

Todas as 6 tasks rodam em paralelo. **Critério de saída:** artefatos aprovados e registrados em `GABI-ONDEMAND-TOKENS.md`.

---

### Onda 1 — Banco de Dados (bloqueante para Ondas 2 e 3)

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| T-01-01 | Reconciliar `fragment.prisma` da gabi com `usage.ts` (campos `model_used`, `tokens_input`, etc.) | Estrutura de Dados | Onda 0 |
| T-01-02 | Adicionar `GabiTokenLog` ao `fragment.prisma` da gabi | Estrutura de Dados | T-01-01 |
| T-01-03 | Adicionar `GabiTokenQuota` ao `fragment.prisma` da gabi | Estrutura de Dados | T-01-02 |
| T-01-04 | Rodar `compose-tenant-schema.ts` e `prisma migrate dev` no banco tenant | Estrutura de Dados | T-01-03 |
| T-01-05 | Adicionar `gabi_quota_mensal Int @default(0)` ao model `Product` no Configurador | Estrutura de Dados | T-01-01 |
| T-01-06 | Rodar `prisma migrate dev` no banco do Configurador | Estrutura de Dados | T-01-05 |
| T-01-07 | Atualizar mock Prisma da gabi — adicionar `gabiTokenLog` e `gabiTokenQuota` | Backend | T-01-04 |
| T-01-08 | Testes de migração: criar logs, criar quota, verificar índices e constraints | QA | T-01-06 |

T-01-02/T-01-03 sequenciais. T-01-04 e T-01-05/T-01-06 paralelos entre si após T-01-01.

---

### Onda 2 — Backend: Serviço Gabi (paralela com Onda 3)

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| T-02-01 | Criar `quotaService.ts`: `checkQuota()`, `registerTokens()`, `getQuotaInfo()` | Backend | Onda 1 |
| T-02-02 | Criar `POST /api/gabi/field-help` com Zod, verificação de quota, chamada Gemini, registro em `GabiTokenLog` | Backend | T-02-01 |
| T-02-03 | Criar `fieldHelpPrompt.ts`: system prompt contextual por `produto` e `campo` | Backend | T-02-02 |
| T-02-04 | Registrar `fieldHelpRouter` no `server/index.ts` da gabi | Backend | T-02-02 |
| T-02-05 | Criar `GET /api/gabi/quota`: retorna `{ tokens_usados, quota_mensal, percentual, mes_ref, dias_para_renovar }` | Backend | T-02-01 |
| T-02-06 | Adicionar rate limit por tenant no `field-help` (máx 10 req/min/tenant) | Segurança + Backend | T-02-02 |
| T-02-07 | Testes unitários de `quotaService` | QA | T-02-01 |
| T-02-08 | Testes de integração do endpoint: quota ok, quota esgotada (403), body inválido (400), sem auth (401) | QA | T-02-05 |

---

### Onda 3 — Backend: Reset + Admin API (paralela com Onda 2)

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| T-03-01 | Criar `token-reset-worker.ts` — pg-boss, zera `tokens_usados`, cron `0 0 1 * * America/Sao_Paulo` | Backend + DevOps/SRE | Onda 1 |
| T-03-02 | Registrar `startTokenResetWorker()` no startup do Configurador | Backend | T-03-01 |
| T-03-03 | Criar `GET /api/v1/admin/produtos-gravity/:id_produto_gravity/tokens/estatisticas` — consumo agregado de todos os tenants do produto | Backend | Onda 1 |
| T-03-04 | Atualizar `productCatalogService.ts` — incluir `gabi_quota_mensal` no CRUD | Backend | T-01-05 |
| T-03-05 | Registrar `adminProductTokensRouter` no `server/index.ts` do Configurador | Backend | T-03-03 |
| T-03-06 | Testes do worker: reset zera corretamente, idempotência, cron expression | QA | T-03-01 |

---

### Onda 4 — Frontend: nucleo-global (bloqueante para Onda 5)

Inicia após Ondas 2 e 3 completas.

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| T-04-01 | Criar `nucleo-global/Gabi/gabi-field-icon-global/` com `package.json` (`@nucleo/gabi-field-icon-global`), `tsconfig.json`, `src/index.ts` | Líder Técnico | Onda 0 |
| T-04-02 | Implementar `GabiFieldIcon.tsx`: 5 estados, popover 360px com skeleton, CSS spin loading, fade-in resposta | Frontend | T-04-01 |
| T-04-03 | Implementar `GabiTokenBadge.tsx`: `✦ X / Y tokens`, 4 cores por faixa, tokens do design system | Frontend | T-04-01 |
| T-04-04 | Implementar `useGabiOnDemand.ts`: chama `POST /api/gabi/field-help`, estado loading/esgotado, cache de quota em memória | Frontend | T-04-02 |
| T-04-05 | Implementar `useGabiQuota.ts`: chama `GET /api/gabi/quota`, atualiza badge após cada chamada | Frontend | T-04-03 |
| T-04-06 | Auditoria CSS: zero valores hardcoded — somente variáveis de `nucleo-global/Tokens/tokens.css` | UX + Frontend | T-04-02, T-04-03 |
| T-04-07 | Exportar todos os artefatos de `src/index.ts` | Frontend | T-04-05 |
| T-04-08 | Testes de renderização: 5 estados do ícone, popover, skeleton, fade-in | QA | T-04-07 |
| T-04-09 | Testes do hook `useGabiOnDemand`: quota ok, esgotada, loading, cache | QA | T-04-08 |
| T-04-10 | Adicionar alias `@nucleo/gabi-field-icon-global` no `tsconfig.json` raiz e produtos consumidores | DevOps/SRE | T-04-07 |

T-04-02 e T-04-03 paralelos. T-04-04 depende de T-04-02, T-04-05 depende de T-04-03.
**Cobertura mínima:** 80% branches (regra nucleo-global).

---

### Onda 5 — Frontend: Admin — Aba Tokens

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| T-05-01 | Adicionar aba `tokens` entre `help_desk` e `negociacao` em `ProdutosAdmin.tsx` | Frontend | Onda 3, T-04-07 |
| T-05-02 | Seção 1: campo "Token padrão mensal por tenant", validação Zod mín 0 | Frontend | T-05-01 |
| T-05-03 | Seção 2: donut SVG ~64px animado, tooltip % + tokens + dias para renovar, dados de `GET /api/v1/admin/produtos-gravity/:id_produto_gravity/tokens/estatisticas` | Frontend | T-05-01, T-03-03 |
| T-05-04 | Seção 3: radio do comportamento ao estourar, checkboxes de alertas em 80%/90%/100% | Frontend | T-05-01 |
| T-05-05 | Atualizar serviço frontend do Configurador: incluir `gabi_quota_mensal` no payload de criação/atualização | Frontend | T-03-04 |
| T-05-06 | Adicionar chaves i18n: `ptBR.ts` e `en.ts` do Configurador | Frontend | T-05-04 |
| T-05-07 | Testes de renderização da aba Tokens: campos visíveis, donut animado, save com quota no payload | QA | T-05-05 |

T-05-02, T-05-03 e T-05-04 paralelos após T-05-01.

---

### Onda 6 — Integração no Produto Piloto (Pedido)

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| T-06-01 | Identificar 3–5 campos candidatos no Pedido para `GabiFieldIcon` (ex: incoterm, condição pagamento, NCM) | PO + UX | Onda 4 |
| T-06-02 | Instalar `@nucleo/gabi-field-icon-global` no `produto/pedido/client/` | DevOps/SRE | T-06-01 |
| T-06-03 | Adicionar `GabiFieldIcon` nos campos selecionados, passando `campo`, `contexto` e `useGabiOnDemand` | Frontend (Pedido) | T-06-02 |
| T-06-04 | Adicionar `GabiTokenBadge` no layout do Pedido (header), alimentado por `useGabiQuota` | Frontend (Pedido) | T-06-02 |
| T-06-05 | Implementar modal "Autorizar tokens adicionais" para usuário com permissão `gabi:tokens:buy` | Frontend (Pedido) | T-06-03 |
| T-06-06 | Implementar mensagem "Tokens esgotados — contate o administrador" para usuário sem permissão | Frontend (Pedido) | T-06-03 |
| T-06-07 | Teste E2E completo: clique ✦, loading, resposta, badge atualiza, quota esgotada, modal autorização | QA | T-06-06 |
| T-06-08 | Review de código pelo Líder Técnico: sem chave no frontend, isolamento tenant, rate limit ativo | Líder Técnico | T-06-07 |

T-06-03 e T-06-04 paralelos. T-06-05 e T-06-06 paralelos.

---

### Onda 7 — Segurança, Observabilidade e Documentação

| ID | Tarefa | Responsável | Dependência |
|----|--------|-------------|-------------|
| T-07-01 | `SecurityEvent` para tentativas `field-help` com quota esgotada | Segurança | Onda 6 |
| T-07-02 | Sanitizar `contexto` no body — sem injeção de prompt via valores de campo | Segurança + Backend | T-07-01 |
| T-07-03 | Adicionar delimitadores `<campo>...</campo>` e `<contexto>...</contexto>` no prompt do Gemini | Segurança + Backend | T-07-02 |
| T-07-04 | Incluir `GabiTokenLog` e `GabiTokenQuota` no mapa de exclusão LGPD em `lgpdService.ts` | Segurança + Backend | Onda 1 |
| T-07-05 | Atualizar `GABI-TECNICO.md` e `GABI-ONDEMAND-TOKENS.md` com arquitetura final | Líder Técnico | Onda 6 |
| T-07-06 | Escrever `nucleo-global/Gabi/gabi-field-icon-global/README.md` com exemplo mínimo | Líder Técnico | T-07-05 |
| T-07-07 | Contract test em CI: props de `GabiFieldIcon` e shape da resposta `field-help` não mudam sem versionamento | Sistemas + DevOps/SRE | T-07-06 |
| T-07-08 | QA final: estados do ícone, badge cores, reset simulado, quota esgotada, i18n, mobile, a11y | QA | T-07-07 |

T-07-01/T-07-02/T-07-03 sequenciais. T-07-04 pode rodar desde a Onda 1. T-07-05/T-07-06/T-07-07/T-07-08 sequenciais.

---

## Mapa de Dependências (resumido)

```
Onda 0 (todos paralelos)
   │
   ▼
Onda 1 (banco)
   │
   ├──────────────────┐
   ▼                  ▼
Onda 2            Onda 3
(backend gabi)    (reset + admin API)
   │                  │
   └────────┬─────────┘
            ▼
         Onda 4 (nucleo-global)
            │
            ▼
         Onda 5 (admin aba tokens)
            │
            ▼
         Onda 6 (integração Pedido)
            │
            ▼
         Onda 7 (segurança + docs)

Paralelo desde Onda 1: T-07-04 (LGPD)
```

---

## Resumo por Responsável

| Responsável | Ondas | Total tasks |
|---|---|---|
| Estrutura de Dados | 1 | 6 |
| Backend | 1, 2, 3, 7 | 18 |
| Segurança | 0, 2, 7 | 6 |
| Frontend | 4, 5, 6 | 17 |
| UX | 0, 4 | 4 |
| QA | 1, 2, 3, 4, 5, 6, 7 | 12 |
| DevOps/SRE | 3, 4, 6 | 4 |
| Líder Técnico | 0, 4, 7 | 5 |
| PO | 0, 6 | 3 |
| Sistemas | 7 | 1 |
| Líder do Projeto | 0 | 1 |
| **Total** | **7 ondas** | **44 tasks** |

---

## O que NÃO muda

- Análise determinística de fórmulas (`formulaEngine` + `gabiSemantica`) — permanece sempre-ativa, gratuita
- Endpoint `/gabi-analise` do produto Pedido (análise de fórmula via Gemini) — permanece, mas passa a ser opcional/on-demand
- Nenhum produto perde funcionalidade existente
