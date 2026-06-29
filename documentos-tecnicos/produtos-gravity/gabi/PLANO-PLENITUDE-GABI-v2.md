# Plano de Plenitude GABI — v2

> **Versão:** 2.1  
> **Data:** 29/06/2026  
> **Status:** Ondas 0–4 **implementadas** (TASK-000390, PR #523) — validação staging/prod e QA checklist pendentes  
> **Classificação:** CRITICAL — fundação de plataforma  
> **Origem:** consolidação das auditorias TASK-000386 (plataforma) + auditoria forense Dashboard Pedido (Fases 1–3) + refinamentos de governança

---

## Índice

1. [Objetivo e definição de pronto](#1-objetivo-e-definição-de-pronto)
2. [Diagnóstico consolidado](#2-diagnóstico-consolidado)
3. [Visão alvo](#3-visão-alvo)
4. [Regras de ouro (não negociáveis)](#4-regras-de-ouro-não-negociáveis)
5. [Matriz de ambiente](#5-matriz-de-ambiente)
6. [Ondas de execução](#6-ondas-de-execução)
7. [Rollback e degradação graciosa](#7-rollback-e-degradação-graciosa)
8. [Critério de seleção de tools (Onda 2)](#8-critério-de-seleção-de-tools-onda-2)
9. [Definição de pronto por onda](#9-definição-de-pronto-por-onda)
10. [Mapa de tasks sugeridas](#10-mapa-de-tasks-sugeridas)
11. [Documentos relacionados](#11-documentos-relacionados)

---

## 1. Objetivo e definição de pronto

### Objetivo

Levar a GABI ao estado em que **todas as capacidades planejadas funcionam de forma previsível** em produção:

| Capacidade | Descrição |
|:---|:---|
| **Chat / widget** | Hub, onboarding e workspace — resposta real, sem mock |
| **Agente v2** | RAG + tools + permissões espelhadas do usuário |
| **Field-help (✦)** | Ícone on-demand em campos de produto |
| **Insights Dashboard** | Fases 1 (KPI), 2 (comportamento) e 3 (LLM) operacionais |
| **Operação** | Falhas visíveis, auditáveis, sem fallback silencioso |

### Definição de “plenitude”

A GABI está na plenitude quando:

1. Browser e produtos alcançam **um único caminho HTTP** até o sidecar (`:8009` em deploy monolítico).
2. **Contratos Zod bilaterais** em todas as integrações (Mandamentos 06–09).
3. **Erro 503 explícito** quando o sidecar está indisponível — nunca 500 em cascata no Configurador, nunca `MOCK_RESPONSES` em produção.
4. Agente v2 é o **caminho principal**; chat v1 deprecado ou fundido.
5. Insights: migration aplicada, Fase 2 com dados, Fase 3 com flag + observabilidade antes de ligar em staging.

---

## 2. Diagnóstico consolidado

### Por que “cada hora é uma falha diferente”

Não é intermitência aleatória — são **camadas diferentes falhando em silêncio**:

| Camada | Sintoma | Causa raiz |
|:---|:---|:---|
| **Rede / proxy** | Widget não conecta; HTML em vez de JSON | Sem `app.use('/api/v1/gabi')` no Express prod; só Vite proxy em dev |
| **URL / porta** | `ECONNREFUSED` em S2S | Defaults divergentes: `3001` (contracts.json) vs `8009` (sidecar Railway) |
| **Contrato HTTP** | LLM “não enriquece”; field icon vazio | Body `{ mensagem }` vs `{ message }`; parse `resposta` vs `response` |
| **Feature flag** | Fase 3 nunca roda | `GABI_INSIGHTS_LLM !== 'true'` → skip sem log |
| **Stack duplicada** | Resposta certa numa tela, errada noutra | v1 com RAG; v2 sem RAG; dois executores de tools |
| **Fallbacks** | Parece funcionar | `MOCK_RESPONSES`, `catch { return null }`, `permission.ts` permissivo |

### Status atual por subsistema

| Subsistema | Status | Notas |
|:---|:---:|:---|
| Insights Fase 1 (KPI determinístico) | ✅ | `generateInsights()` — OK |
| Insights Fase 2 (comportamento) | ⚠️ | Hook existe; tabela pode faltar; scores vazios = no-op |
| Insights Fase 3 (LLM) | ❌ | Flag off + contrato quebrado + porta errada |
| Widget Hub (agente v2) | ❌ | Proxy prod ausente; mock em falha |
| Chat `/gabi` (v1) | ⚠️ | Dev ok; prod quebrado |
| Field-help ✦ | ❌ | Campo `resposta` vs `titulo`/`texto` |
| Tools cross-produto | ⚠️ | Dois executores; URLs localhost em Railway |

### Tasks de auditoria relacionadas

| Task | Escopo |
|:---|:---|
| TASK-000379 | AUD consultoria GABI execução/resposta (ABR) |
| TASK-000381 | MEL alinhar Smart Docs na KB/prompt (ABR) |

---

## 3. Visão alvo

```
Browser (widget, /gabi, ✦)
        │
        ▼
Configurador :8005 — proxy único /api/v1/gabi
  • injeta x-chave-interna-servico
  • injeta x-id-organizacao, x-id-usuario, x-tipo-usuario (JWT + /me)
  • timeout 3s → 503 GABI_UNAVAILABLE se sidecar down
        │
        ▼
GABI sidecar :8009
  • Agente v2 (principal): RAG + tools + memória
  • Rotas satélite: ajuda-campo, chats (legado até deprecar)
        ▲
        │ S2S (mesma URL canônica)
        │
Pedido / BID / Cockpit / workers
```

**URL canônica por ambiente** (única variável `GABI_SERVICE_URL` em todos os callers):

| Ambiente | Valor |
|:---|:---|
| Dev com PM2 super-servidor | `http://localhost:3001` |
| Dev/prod monolítico (sidecar) | `http://127.0.0.1:8009` |
| Railway produção | `http://127.0.0.1:8009` (loopback no mesmo container) |

---

## 4. Regras de ouro (não negociáveis)

1. **SSOT de autenticação S2S:** apenas `CHAVE_INTERNA_SERVICO` + header `x-chave-interna-servico`.  
   - `INTERNAL_API_KEY` e `x-internal-key`: **deprecar** com log de warning por 1 sprint, depois remover.  
   - Não manter alias silencioso dos dois nomes — impossibilita auditoria e rotação de secret.

2. **Browser nunca chama GABI direto** — sempre proxy Configurador com identidade real.

3. **Contrato Zod bilateral** em toda integração nova ou corrigida (body + response no mesmo commit).

4. **Falhar alto** (Mandamento 08): sem `catch {}`, sem mock em produção, sem `permitido: true` em falha S2S.

5. **Agente v2 = caminho principal**; chat v1 entra em deprecação após Onda 2.

---

## 5. Matriz de ambiente

Documento obrigatório da Onda 0 (item 0.2). Evita bugs que só aparecem em produção.

| Ambiente | Quem injeta headers | `GABI_SERVICE_URL` | `id_organizacao` | `tipo_usuario` |
|:---|:---|:---|:---|:---|
| **Dev — Vite proxy** | `vite.config.ts` | `localhost:3001` | `org_dev_default` (fixo) | `SUPER_ADMIN` (fixo) |
| **Prod — Express proxy** | `configurador/server` após `requireAuth` | `127.0.0.1:8009` | JWT real | `/me` real |
| **S2S (Pedido, BID, workers)** | Caller explícito | conforme tabela acima | header `x-id-organizacao` | header quando aplicável |

### Smoke obrigatório pós-Onda 0

- [ ] Widget Hub em **staging** com usuário **PADRAO** (não SUPER_ADMIN)
- [ ] `/gabi` responde sem mock
- [ ] Sidecar down → proxy retorna **503** (não 500 no shell)

---

## 6. Ondas de execução

### Onda 0 — Fundação (P0)

*Sem isso, nada mais importa.*

| ID | Entrega | Detalhe |
|:---|:---|:---|
| 0.1 | Proxy `/api/v1/gabi` no Express prod | Padrão Pedido/Smart Read; upstream `127.0.0.1:8009` |
| 0.2 | Matriz de ambiente | Seção 5 deste documento no README Configurador |
| 0.3 | Unificar `GABI_SERVICE_URL` | Pedido, BID, Cockpit, `roteador-ferramentas` — mesmo default por ambiente |
| 0.4 | Headers no front | `GabiChat`, `WorkspaceLayout`, `Core` — paridade com `GabiOnboardingWidget` |
| 0.5 | Degradação 503 | Ver [Seção 7](#7-rollback-e-degradação-graciosa) |

**Estimativa:** 4–8h

---

### Onda 1 — Contratos e integrações quebradas (P0/P1)

| ID | Entrega | Detalhe |
|:---|:---|:---|
| 1.1 | Pedido Fase 3 — body/response | `{ conversationId: 'new', message }` → parse `response` |
| 1.2 | Field icon ✦ | Alinhar `useGabiOnDemand` com `titulo`/`texto` ou normalizar no proxy Pedido |
| 1.3 | `.env.example` Pedido | `GABI_SERVICE_URL`, `GABI_INSIGHTS_LLM`, `GABI_QUOTA_PEDIDO`, `CHAVE_INTERNA_SERVICO` |
| 1.4 | Zod nos consumers | Widget v2 (`gabiAgenteChatResponseSchema`); `gabiLlmInsightsService` |
| 1.5 | Migrar chave S2S | Só `CHAVE_INTERNA_SERVICO`; deprecar `INTERNAL_API_KEY` com prazo |

**Estimativa:** 6–10h

---

### Onda 2 — Agente v2 completo (P1)

| ID | Entrega | Detalhe |
|:---|:---|:---|
| 2.1 | RAG no agente v2 | `selectKnowledge()` como no chat v1 |
| 2.2 | KB Smart Docs | TASK-000381 — renomear Smart Read → Smart Docs |
| 2.3 | Unificar tools | Um executor: `roteador-ferramentas`; deprecar `execTool` |
| 2.4 | URLs de tools por env | Sem `localhost` hardcoded em Railway |
| 2.5 | Permissões reais | Remover fallback permissivo em `permission.ts` |
| 2.6 | Política de tools | Ver [Seção 8](#8-critério-de-seleção-de-tools-onda-2) — entregável documentado + teste CI |

**Estimativa:** 12–20h

---

### Onda 3 — Insights personalizados (P1/P2)

**Ordem obrigatória dentro da onda:**

| ID | Entrega | Detalhe |
|:---|:---|:---|
| 3.1 | Migration `user_behavior_events` | `prisma migrate deploy` no Pedido **antes** de validar Fase 2; responsável: fluxo `/deploy` |
| 3.2 | Health check pós-deploy | Step deploy: tabela existe? (`SELECT 1` ou Prisma introspect) |
| 3.3 | Fase 2 operacional | Validar eventos de `useTrackBehavior` persistindo; log mínimo em falha de track |
| 3.4 | Observabilidade Fase 3 | Log/Sentry com `tenantId`, `userId`, motivo (timeout, 401, Zod, quota) |
| 3.5 | Flag LLM em staging | `GABI_INSIGHTS_LLM=true` **somente após 3.4**; quota USD monitorada |
| 3.6 | Prod | Opt-in explícito — nunca default on sem aprovação |

**Nota:** `getUserBehaviorScores` hoje retorna `{}` em erro (não crasha request), mas Fase 2 permanece inútil sem migration.

**Estimativa:** 4–8h

---

### Onda 4 — Resiliência, UX e governança (P2)

| ID | Entrega | Detalhe |
|:---|:---|:---|
| 4.1 | Remover `MOCK_RESPONSES` em prod | Erro claro: “GABI indisponível” |
| 4.2 | Deprecar chat v1 | Fundir com v2 ou marcar `@deprecated` nas rotas |
| 4.3 | Testes | UNI contratos + FUN proxy + E2E widget Hub (staging) |
| 4.4 | Runbook ops | Quota USD, `GEMINI_API_KEY`, sidecar, ingest RAG |
| 4.5 | Admin Cockpit | Monitor uso/erros por org |

**Estimativa:** 8–12h

---

### Sequência e paralelismo

```
Onda 0 ──► Onda 1 ──► Onda 2 ──► Onda 4
              │
              └──► Onda 3 (após 0.3; migration independente do proxy)
```

**Total estimado:** 35–58h engenharia + QA/deploy.

---

## 7. Rollback e degradação graciosa

### Comportamento do proxy (Onda 0.5)

```
Sidecar não responde em ≤ 3s
  → proxy retorna 503 { error: { code: 'GABI_UNAVAILABLE' } }
  → NÃO propaga 500 para o Configurador / shell
  → front exibe estado de indisponibilidade (sem MOCK)
```

### Rollback operacional

| Cenário | Ação |
|:---|:---|
| Sidecar instável após deploy | `GABI_PROXY_ENABLED=false` (feature flag) — proxy responde 503 estático |
| Regressão em tools | Desabilitar subset via config (Onda 2.6) |
| Custo LLM inesperado em staging | `GABI_INSIGHTS_LLM=false` imediato |

Documentar toggle no runbook (`skills/processos/deploy/SKILL.md` referência cruzada).

---

## 8. Critério de seleção de tools (Onda 2)

**Entregável obrigatório** — não basta cortar de 56 para 28 sem regra.

### Limites técnicos

| Limite | Valor | Motivo |
|:---|:---|:---|
| Tool declarations Gemini | ~28 | Acima disso, resposta vazia (documentado em `orquestrador-agente.ts`) |
| Tool calls por turno | 5 | Circuit breaker |
| Tool calls por minuto | 30 | Circuit breaker |

### Matriz página → subset (exemplo — completar na implementação)

| Contexto (`page`) | Tools incluídas | Tools excluídas |
|:---|:---|:---|
| Hub / onboarding | `gabi.*`, `config.hub.*` (READ) | tools de produto tenant |
| Pedido lista | `pedido.*` READ + filtros | `bid.*`, `processo.*` |
| BID Frete cotação | `bidfrete.*` | demais produtos |

### Regra para nova tool

1. Deve mapear para produto + classe READ/WRITE documentados em `catalogo-ferramentas.ts`.
2. Se catálogo exportado > 28, PR deve incluir **qual tool foi removida ou rebaixada** da matriz.
3. Teste CI: `tools-export-count <= 28` ou allowlist por contexto.

---

## 9. Definição de pronto por onda

### Onda 0 — Pronto quando

- [ ] Widget Hub responde em staging (usuário PADRAO)
- [ ] `/gabi` sem mock em staging
- [ ] Sidecar down → 503 (não 500 cascata)
- [x] Matriz de ambiente publicada

### Onda 1 — Pronto quando

- [ ] Dashboard com `GABI_INSIGHTS_LLM=true` enriquece texto em dev
- [x] Field icon ✦ exibe resposta (contrato Zod)
- [x] Testes de contrato no CI
- [x] Zero referências novas a `INTERNAL_API_KEY`

### Onda 2 — Pronto quando

- [ ] Widget responde com conhecimento RAG (pergunta sobre produto) — staging
- [ ] Tool READ executa em staging
- [ ] Tool WRITE pede confirmação e completa
- [x] Documento Seção 8 + `POLITICA-SELECAO-TOOLS.md`

### Onda 3 — Pronto quando

- [ ] Migration deployada em staging + prod
- [ ] Eventos de comportamento visíveis no banco
- [ ] Insight reordenado por comportamento (teste manual)
- [x] Logs Fase 3 com `tenantId` / `motivo` estruturado

### Onda 4 — Pronto quando

- [ ] QA checklist 6 categorias verde
- [x] Runbook ops publicado (`GABI-RUNBOOK-OPS.md`)
- [ ] Smoke produção documentado

---

## 10. Mapa de tasks sugeridas

| Task sugerida | Onda | Escopo fechado |
|:---|:---:|:---|
| `CONFIG-GABI-NOV-ONDA-0-PROXY-HEADERS` | 0 | Itens 0.1–0.5 |
| `CONFIG-GABI-MEL-CONTRATOS-PEDIDO-ZOD` | 1 | Itens 1.1–1.5 |
| `CONFIG-GABI-NOV-AGENTE-V2-RAG-TOOLS` | 2 | Itens 2.1–2.6 |
| `PEDIDO-GABI-MEL-INSIGHTS-FASE-2-3` | 3 | Itens 3.1–3.6 |
| `CONFIG-GABI-REF-RESILIENCIA-QA-RUNBOOK` | 4 | Itens 4.1–4.5 |

Abrir com `/novo-agente` — uma task por onda; não misturar Onda 0 com Onda 2 no mesmo PR.

---

## 11. Documentos relacionados

| Documento | Conteúdo |
|:---|:---|
| [GABI-AGENTE-USUARIO.md](./GABI-AGENTE-USUARIO.md) | Arquitetura agente v2, tools, memória |
| [GABI-INSIGHTS-PERSONALIZADOS.md](./GABI-INSIGHTS-PERSONALIZADOS.md) | Fases 1–3 do Dashboard Pedido |
| [GABI-TECNICO.md](./GABI-TECNICO.md) | Fórmulas determinísticas + on-demand |
| [GABI-ONDEMAND-TOKENS.md](./GABI-ONDEMAND-TOKENS.md) | Ícone ✦ e quota |
| [gabi-rag-pgvector.md](../../gabi/gabi-rag-pgvector.md) | RAG e ingest KB |
| [GABI-LIMITES-MONETARIOS-F2.md](./GABI-LIMITES-MONETARIOS-F2.md) | Quota USD |
| [GABI-RUNBOOK-OPS.md](./GABI-RUNBOOK-OPS.md) | Runbook operação (Onda 4) |
| [POLITICA-SELECAO-TOOLS.md](./POLITICA-SELECAO-TOOLS.md) | Seleção de tools agente v2 (Onda 2) |
| [README.md](./README.md) | Índice desta pasta |
| `servicos-global/contracts.json` | Porta 3001 super-servidor (dev PM2) |
| `servicos-global/configurador/.env.example` | `GABI_SERVICE_URL=8009` |
| `servicos-global/configurador/docs/GABI-AMBIENTE.md` | Matriz dev vs prod (Onda 0) |

---

## Histórico de versões

| Versão | Data | Mudança |
|:---|:---|:---|
| 1.0 | 28/06/2026 | Plano inicial (chat TASK-000386) |
| 2.0 | 29/06/2026 | Consolidação forense + refinamentos: chave única, rollback 503, ordem Onda 3, critério tools |
| 2.1 | 29/06/2026 | Ondas 0–4 entregues (TASK-000390); README índice; checkboxes código vs staging |
