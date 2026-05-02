# ADR-0001 — Propagação Cadastros → Produtos via Webhook (Opção b1)

**Status:** Aceito
**Data:** 2026-04-30
**Decisores:** Daniel + Líder Tecnologia
**Contexto:** banco Cadastros (4º banco isolado) virou fonte de verdade COMEX em 2026-04. Produtos (Pedido, Processo, NF-Importacao etc.) mantêm snapshots locais (Opção δ — ver `produtos-gravity/cadastros/cadastros-arquitetura.md` § 2.5).

## Contexto

Quando uma entidade do Cadastros muda (Empresa, OPE, NCM, Moeda, Unidade), produtos que mantêm snapshot daquele registro precisam ser notificados para:

- **Re-snapshot opcional** dos pedidos em status editável (rascunho, em_emissao)
- **Banner retroativo** ("Cadastros mudou desde a emissão") em pedidos em status posterior
- **Reconciliação** de jobs noturnos para pedidos perdidos

A questão: qual mecanismo dispara essa propagação?

## Decisão

**Trigger = webhook HTTP fire-and-forget** disparado pelo Cadastros após commit da mutação.

- **Receptor:** rota interna `/internal/cadastros-changed` em cada produto consumidor.
- **Autenticação:** HMAC-SHA256 + header `x-internal-key` (ver [`skills/seguranca/autenticacao-s2s/SKILL.md`](../../skills/seguranca/autenticacao-s2s/SKILL.md)).
- **Idempotência:** receptor identifica eventos por `(suid, versao)` — re-disparo é seguro.
- **Fan-out cross-org:** quando `id_organizacao = ''` (entidades globais como NCM/Moeda/Unidade), receptor enumera orgs que têm snapshot e re-emite eventos por org.

### Payload do webhook

```json
{
  "tipo_entidade": "empresa",        // empresa | ope | ncm | moeda | unidade
  "suid": "<suid>",                  // identificador estável da entidade
  "versao": 42,                      // monotonic counter por entidade
  "id_organizacao": "<id_org>",      // "" para entidades globais
  "campos_alterados": ["nome_empresa", "endereco_empresa"],  // best-effort
  "estado_atual": { ... }            // snapshot completo pós-mudança
}
```

## Alternativas rejeitadas

### Outbox Pattern (tabela de eventos + worker)

❌ Complexidade desnecessária. Não temos exactly-once como requisito — fan-out best-effort + reconciliação por job noturno é suficiente. Outbox dobraria a complexidade do Cadastros (tabela `outbox_event`, worker, dedup, GC) sem ganho prático para os SLAs atuais.

### CDC (Debezium / pg_logical)

❌ Infra extra (Kafka cluster, conector Debezium, schema registry). Latência maior. Custo operacional de manter Kafka multi-tenant. Acoplamento ao schema físico do Cadastros — qualquer rename de coluna quebra os consumidores.

### Polling

❌ Desperdício de chamadas HTTP. Latência alta (intervalo mínimo de polling). Não escala com número de produtos consumidores.

### Push direto via Prisma client (cross-DB)

❌ Quebra Database-per-Service. Cadastros não pode escrever em banco de produto sem virar acoplamento forte.

## Consequências

**Positivas:**

- Implementação simples: cliente HTTP no Cadastros + rota receptora em cada produto.
- Latência baixa em caminho feliz (~50ms).
- Cada produto decide independentemente se aceita ou ignora a notificação.
- Reconciliação por job noturno já cobre eventos perdidos (sem Outbox).

**Negativas e mitigações:**

| Negativa | Mitigação |
|---|---|
| Perda de evento (rede falha) | Job noturno reconcilia usando `versao` do snapshot vs. `versao` atual em Cadastros |
| Receptor processando duplicado | Idempotência via `(suid, versao)` |
| Cadastros precisa conhecer URL de cada produto | Lista de webhooks em `Cadastros.config_webhook_<entidade>`, configurável |
| Fan-out de entidades globais sobrecarrega | Receptor enumera orgs com snapshot, batch de N em N (config) |

## Implementação de referência

- **Emitter:** `servicos-global/cadastros/server/services/notify-changed.ts`
- **Receptor genérico:** `servicos-global/<produto>/server/routes/internal-cadastros-changed.ts`
- **Job de reconciliação:** `servicos-global/<produto>/server/jobs/reconcile-cadastros.ts` (rodando 03:00 UTC)

## Histórico

- **2026-04-30:** decisão inicial, aprovada por Daniel.
- **2026-05-02:** ADR formalizado neste documento.
