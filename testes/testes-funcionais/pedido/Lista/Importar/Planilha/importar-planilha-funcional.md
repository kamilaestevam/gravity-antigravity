# Plano de Testes Funcionais — Importar Planilha (Smart Import)

**ID:** TST-FUN-PEDIDO-IMPORTAR-PLANILHA-001
**Data:** 2026-05-24
**Versão:** 1.0
**Criticidade:** alta
**Ambiente:** `@vitest-environment node`

---

## Resumo Executivo

Plano funcional para `POST /api/v1/pedidos/importacoes-inteligentes/confirmar`. Valida a cadeia HTTP completa: Zod real, error handler, resolução de parceiros **antes** de `withOrganizacao`, repasse de `parceirosPorNumero` ao service e segurança de preview por tenant.

---

## Endpoint Coberto

| Endpoint | Método | Arquivo |
|----------|--------|---------|
| `/api/v1/pedidos/importacoes-inteligentes/confirmar` | POST | `importacoes-inteligentes-pedido.ts` |

---

## Casos de Teste

### 1. POST /confirmar — Happy path

| ID | Caso | Resultado |
|----|------|-----------|
| F-CNF-01 | Payload válido com linhas stateless | `200`, body `{ criados, atualizados, erros }` |
| F-CNF-02 | Rota chama `resolverParceirosSmartImport` antes de `withOrganizacao` | Ordem verificada via mock |
| F-CNF-03 | Rota repassa mapa de parceiros ao `service.confirmar` | 5º argumento não vazio |

### 2. Validação Zod (400)

| ID | Caso | Resultado |
|----|------|-----------|
| F-CNF-10 | Body vazio | `400`, `VALIDATION_ERROR` |
| F-CNF-11 | `preview_id` ausente | `400` |
| F-CNF-12 | `linhas_incluidas` ausente | `400` |

### 3. Segurança

| ID | Caso | Resultado |
|----|------|-----------|
| F-CNF-20 | `preview_id` de outro tenant | `403`, `UNAUTHORIZED_PREVIEW` |
| F-CNF-21 | Falha Cadastros em `resolverParceirosSmartImport` | Propaga erro via `next(err)` |

---

## Estrutura de Arquivos

```
testes/testes-funcionais/pedido/Lista/Importar/planilha/
├── importar-planilha-funcional.md   ← este plano
└── confirmar-parceiros.test.ts      ← F-CNF-01 a F-CNF-21
```
