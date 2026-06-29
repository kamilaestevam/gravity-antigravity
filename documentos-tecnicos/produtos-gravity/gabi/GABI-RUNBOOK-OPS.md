# GABI — Runbook de Operações (Onda 4)

> **SSOT:** `PLANO-PLENITUDE-GABI-v2.md` · matriz ambiente: `servicos-global/configurador/docs/GABI-AMBIENTE.md`

---

## Arquitetura rápida

| Camada | Componente | Porta default |
|:---|:---|:---|
| Browser | Configurador shell → `/api/v1/gabi/*` | `:8000` dev Vite / `:8005` prod |
| Proxy | `configurador/server/proxy/proxy-gabi.ts` | injeta S2S + identidade |
| Sidecar | `servicos-plataforma/gabi` | `:8009` Railway / `:3001` PM2 dev |
| Pedido Fase 3 | `gabiLlmInsightsService.ts` | S2S → `/api/v1/gabi/chats` |

---

## Variáveis críticas

| Variável | Onde | Efeito se ausente/errada |
|:---|:---|:---|
| `CHAVE_INTERNA_SERVICO` | Configurador + GABI + Pedido | Proxy 503; WRITE tools bloqueadas |
| `GABI_SERVICE_URL` | Proxy / callers | Upstream errado → 503 |
| `GABI_PROXY_ENABLED=false` | Configurador | Rollback — 503 `GABI_UNAVAILABLE` |
| `GEMINI_API_KEY` | Sidecar GABI | LLM offline; insights Fase 3 faz fallback |
| `GABI_INSIGHTS_LLM` | Pedido server | `true` só staging/prod com aprovação |
| `GABI_QUOTA_PEDIDO` | Pedido → GABI header | Limite USD por org |

---

## Sintomas e ações

### Widget Hub: 503 `GABI_DB_UNAVAILABLE`

Tabelas `gabi_conversa` ausentes no schema `tenant_<org>` (migrate deploy só grava em `public`).

1. Logs boot: `[start-site] DDL GABI em tenant_* concluído` ou `[ddl-gabi-organizacao]`
2. Manual: `ORGANIZACAO_DATABASE_URL=... CONFIGURADOR_DATABASE_URL=... npx tsx scripts/ativamente/aplicar-migration-gabi-organizacao.ts`
3. Sidecar aplica DDL lazy na 1ª mensagem (`[GABI/DDL] Tabelas garantidas`) se o boot falhou.

### Widget Hub: “GABI indisponível”

1. `curl -s http://127.0.0.1:8009/health` (no container Railway)
2. `curl -s http://localhost:8005/health` (Configurador)
3. Logs `[proxy-gabi] erro ao conectar` — sidecar down ou porta errada
4. **Rollback:** `GABI_PROXY_ENABLED=false` + comunicar usuários

### Insights dashboard sem personalização (Fase 2)

1. `curl http://localhost:8030/health` → `gabi_behavior_events: ok`
2. Se `missing`: `npx prisma migrate deploy` no Pedido
3. Verificar POST `/api/v1/pedidos/eventos-comportamento` nos logs

### Insights sem texto LLM (Fase 3)

1. Confirmar `GABI_INSIGHTS_LLM=true` (staging apenas)
2. Logs `[gabiLlmInsights] Fase 3 fallback` com `motivo`: `timeout` | `quota` | `zod` | `chave_ausente`
3. Quota: header `x-gabi-quota` + `limiteMonetarioService` no sidecar

### Tools WRITE retornam 403

1. `CHAVE_INTERNA_SERVICO` igual em GABI e Configurador
2. Endpoint `/api/v1/internal/permissoes/verificar` respondendo
3. Sem fallback permissivo (Onda 2+) — falha S2S = bloqueio

---

## Quota USD e limites LLM

- Serviço: `limiteMonetarioService.ts` no sidecar GABI
- Bloqueio HTTP **429** `LLM_USAGE_LIMIT_REACHED`
- Admin: rotas `/api/v1/gabi/admin/*` (requireGravityAdmin)
- Monitor futuro: API Cockpit (item 4.5) — métricas por `id_organizacao`

---

## Ingest RAG (base de conhecimento)

1. KB estática: `gabi/server/knowledge/` + `gravity-knowledge-base.txt`
2. RAG pgvector: requer `ORGANIZACAO_DATABASE_URL` no sidecar
3. Fallback automático para KB estática se pgvector indisponível
4. Agente v2: `selectKnowledge()` em POST/GET `/agente/chat`

---

## Deploy checklist

- [ ] Sidecar GABI no mesmo container (loopback `127.0.0.1:8009`)
- [ ] `CHAVE_INTERNA_SERVICO` sincronizada
- [ ] Migration `user_behavior_events` no Pedido (`migrate deploy`)
- [ ] Health Pedido: `gabi_behavior_events: ok`
- [ ] Smoke: widget Hub pergunta sobre produto (resposta com KB)
- [ ] `GABI_INSIGHTS_LLM` — prod só com opt-in explícito do dono

---

## Referências

- Política tools: `POLITICA-SELECAO-TOOLS.md`
- Insights personalizados: `GABI-INSIGHTS-PERSONALIZADOS.md`
- Incidentes: `skills/processos/incident-response/SKILL.md`
