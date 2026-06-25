# Plano de Teste Funcional — Excluir Pedido

> **ID:** TST-FUN-PEDIDO-EXCLUIR-000001
> **Produto:** Pedido
> **Feature:** POST /exclusoes/preview com blacklist de status
> **Tipo:** Funcional (Supertest + ExcluirService real + Prisma mockado)

---

## Endpoints Cobertos

| Endpoint | Método | Foco desta entrega |
|----------|--------|-------------------|
| `/api/v1/pedidos/exclusoes/preview` | POST | Separação permitidos/bloqueados (blacklist) |

---

## Casos de Teste (F-EXP-xx)

| ID | Caso | Body | HTTP | Body response |
|----|------|------|------|---------------|
| F-EXP-01 | Status custom sem blacklist | `{ ids: ['ped-custom'] }` | 200 | permitidos=1 |
| F-EXP-02 | Status bloqueado na config | `{ ids: ['ped-bloq'] }` | 200 | bloqueados=1 |
| F-EXP-03 | Payload inválido (ids vazio) | `{ ids: [] }` | 400 | VALIDATION_ERROR |

---

## Arquivo de implementação

`preview-blacklist.test.ts`
