# Política de seleção de tools — GABI (Onda 2)

> **SSOT:** complementa a Seção 8 de [`PLANO-PLENITUDE-GABI-v2.md`](./PLANO-PLENITUDE-GABI-v2.md).  
> **Implementação:** `catalogo-ferramentas.ts`, `orquestrador-agente.ts`, `roteador-ferramentas.ts`.

---

## Limites técnicos

| Limite | Valor | Onde |
|:---|:---|:---|
| Tool declarations enviadas ao Gemini | **≤ 28** | `orquestrador-agente.ts` — acima disso o modelo pode retornar vazio |
| Tool calls por turno | 5 | `servico-circuit-breaker.ts` |
| Tool calls por minuto | 30 | `servico-circuit-breaker.ts` |

---

## Dois executores (transição Onda 2 → 4)

| Caminho | Rota | Executor | Status |
|:---|:---|:---|:---|
| **v2 (principal)** | `/api/v1/gabi/agente/*` | `roteador-ferramentas.ts` + catálogo declarativo | Ativo |
| **v1 (legado)** | `/api/v1/gabi/chats` | `gemini.ts` → `execTool.ts` | Deprecado — remoção na Onda 4 |

Novas tools **só** entram em `catalogo-ferramentas.ts`. Não adicionar cases em `execTool.ts`.

---

## Matriz contexto → subset (referência)

Completar por PR quando o catálogo exportado ultrapassar 28 tools.

| Contexto (`page` / produto ativo) | Incluir | Excluir |
|:---|:---|:---|
| Hub / onboarding | `gabi.*`, `configurador.*` READ | tools tenant de produto não contratado |
| Pedido lista | `pedido.*` READ + KPIs | `bidfrete.*`, `processo.*` |
| Smart Docs (`smart-read`) | `smartread.*` | demais produtos |
| Admin Gravity | `admin.*` | tools de tenant sem patente |

**Regra:** `filtrarToolsPorPermissao(tipo_usuario)` aplica RBAC; a matriz por página é camada adicional (futuro: `filtrarToolsPorContexto(page)`).

---

## Regra para nova tool

1. Entrada em `catalogo-ferramentas.ts` com `produto`, `classe` (`READ` | `WRITE_SAFE` | `WRITE_DESTRUTIVA`), `permissao_minima`, endpoint e método HTTP.
2. URL do serviço via env em `roteador-ferramentas.ts` (`PEDIDO_SERVICE_URL`, `CONFIGURADOR_SERVICE_URL`, etc.) — default `127.0.0.1`.
3. S2S: header `x-chave-interna-servico` com `CHAVE_INTERNA_SERVICO` (sem `INTERNAL_API_KEY`).
4. WRITE exige `verificarPermissaoS2S` — **sem fallback permissivo** se Configurador indisponível.
5. Se exportação ao Gemini > 28: PR deve documentar qual tool foi removida ou rebaixada da matriz.

---

## Toggle de emergência

Desabilitar subset de tools em incidente:

- Variável `GABI_TOOLS_DISABLED` (lista CSV de `tool_id`) — implementação futura na Onda 4.
- Runbook: `skills/processos/incident-response/SKILL.md`.

---

## Critério de aceite (Onda 2)

- [ ] Agente v2 responde com trecho RAG em pergunta sobre produto (Hub/Pedido).
- [ ] Tool READ executa em staging com headers S2S corretos.
- [ ] Tool WRITE bloqueada se S2S falhar (403, não execução silenciosa).
- [ ] Este documento revisado pelo Coordenador.
