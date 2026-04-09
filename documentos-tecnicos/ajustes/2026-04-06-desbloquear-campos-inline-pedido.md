# Ajuste — Desbloquear campos inline do Pedido (PATCH /campo)

**Data:** 2026-04-06
**Classificação:** MEDIUM
**Arquivo:** `servicos-global/tenant/processos-core/src/routes/pedidos.ts`

---

## Problema

7 campos que o frontend tenta salvar via `PATCH /:id/campo` retornavam 400 porque não estavam em `CAMPOS_EDITAVEIS`. O usuário via o toast "Erro ao salvar."

## Campos e tratamento

| Campo (frontend) | Prisma | Tratamento |
|---|---|---|
| `unidade_comercializada_pedido` | `String?` ✅ | Edição direta — adicionado a CAMPOS_EDITAVEIS |
| `valor_total_pedido` | `Decimal?` ✅ | Recalculado: `sum(valor_total_item)`, casas = `casas_decimais_total_pedido` |
| `quantidade_total_inicial_pedido` | Alias → `quantidade_total_pedido` (`Float?`) | Recalculado: `sum(quantidade_inicial_pedido)`, casas = `casas_decimais_quantidade_total_pedido` |
| `quantidade_pronta_itens_pedido_total` | Sem campo Prisma | Virtual: `sum(quantidade_pronta_pedido)` — computado em `mapPedido`, não persistido |
| `peso_liquido_total_pedido` | Sem campo Prisma | Aceita chamada, retorna pedido atual sem persistir |
| `peso_bruto_total_pedido` | Sem campo Prisma | Idem |
| `cubagem_total_pedido` | Sem campo Prisma | Idem |

## Mudanças no código

### 1. CAMPOS_EDITAVEIS — adicionar `unidade_comercializada_pedido`
### 2. Novo set CAMPOS_RECALCULAVEIS — 6 campos acima (exceto unidade)
### 3. Handler PATCH /:id/campo — aceitar ambos os sets, branch RECALCULAVEIS antes do branch direto
### 4. mapPedido — adicionar alias `quantidade_total_inicial_pedido` e virtual `quantidade_pronta_itens_pedido_total`

## Sem impacto em
- Schema/migrations (nenhum campo novo)
- Frontend (apenas o backend para de retornar 400)
- Outros endpoints
- Testes existentes (os campos recalculados já eram computados no frontend)
