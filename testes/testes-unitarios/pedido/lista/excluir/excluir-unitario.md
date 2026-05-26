# Plano de Teste Unitário — Excluir Pedido

> **ID:** TST-UNI-PEDIDO-EXCLUIR-000001
> **Produto:** Pedido
> **Feature:** Exclusão de pedidos e itens (blacklist de status)
> **Tipo:** Unitário (Vitest, sem I/O)

---

## Resumo Executivo

Testa a semântica **blacklist opt-out** de `excluir_status_permitidos` (coluna legada), migração da whitelist canônica e `ExcluirService.preview` com Prisma mockado.

Regressões desta entrega (2026-05-26):

- Default `[]` → todos os status permitidos (inclui custom como `pagamento_aprovado`)
- Whitelist legada (7 canônicos) → normalizada para `[]`
- Status na blacklist → bloqueado com motivo explícito

---

## Casos de Teste — Normalização (U-EXB-xx)

| ID | Caso | Input | Resultado |
|----|------|-------|-----------|
| U-EXB-01 | Array vazio | `[]` | `[]` (todos permitidos) |
| U-EXB-02 | null/undefined | `null` | `[]` |
| U-EXB-03 | Whitelist legada (7 canônicos) | lista completa legada | `[]` (migração) |
| U-EXB-04 | Blacklist parcial | `['aprovado', 'consolidado']` | preserva lista |
| U-EXB-05 | Status custom na blacklist | `['pagamento_aprovado']` | preserva lista |

## Casos de Teste — ExcluirService.preview (U-EXS-xx)

| ID | Caso | Config DB | Status pedido | Resultado |
|----|------|-----------|---------------|-----------|
| U-EXS-01 | Sem blacklist | `[]` | `pagamento_aprovado` | permitidos=1 |
| U-EXS-02 | Status bloqueado | `['aprovado']` | `aprovado` | bloqueados=1 |
| U-EXS-03 | Mix permitido + bloqueado | `['consolidado']` | 2 pedidos | split correto |
| U-EXS-04 | Whitelist legada migrada | 7 canônicos | qualquer status | permitidos=N |

---

## Arquivo de implementação

`excluir-status-blacklist.test.ts`
