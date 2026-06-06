# Plano de Testes Funcionais — Editar e Salvar Inline (Lista de Pedidos)

**ID:** TST-FUN-PEDIDO-EDITAR-SALVAR-001
**Data:** 2026-05-17
**Versao:** 1.0
**Criticidade:** alta
**Ambiente:** `@vitest-environment node`

---

## Resumo Executivo

Plano de teste funcional para edicao inline e salvamento de campos individuais via API REST. Testa a camada HTTP completa com Supertest: validacao Zod real, error handler real, Prisma mockado, auth bypassado. Cobre as rotas PUT /api/v1/pedidos/:id (atualizar pedido), PUT /api/v1/pedidos/:id/itens/:itemId (atualizar item), POST /api/v1/pedidos/alteracoes-status-lote/confirmar (status). Cenarios: salvar campo alfanumerico no pedido sem afetar itens, propagacao pedido→itens, salvar campo de item individual, campos calculados rejeitados, divergencia pai/filho, validacao Zod, isolamento de organizacao.

---

## Endpoints Cobertos

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/api/v1/pedidos/:id` | PUT | Atualiza campos do pedido pai (inline edit) |
| `/api/v1/pedidos/:id/itens/:itemId` | PUT | Atualiza campos do item individual |
| `/api/v1/pedidos/alteracoes-status-lote/confirmar` | POST | Muda status de pedidos em lote |

---

## Setup do App de Teste

```typescript
function buildTestApp() {
  const app = express()
  app.use(express.json())
  app.use(mockRequireAuth)         // injeta req.auth + req.organizacao
  app.use('/api/v1/pedidos', pedidosRouter)
  app.use(errorHandler)            // error handler real
  return app
}
```

---

## Casos de Teste

### 1. PUT /api/v1/pedidos/:id — Editar campo alfanumerico do pedido

**Arquivo:** `pedido-inline-edit.test.ts`

#### Happy path

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-PED-01 | Editar numero_pedido | `PUT /pedidos/:id` body `{ numero_pedido: 'PED-NOVO-001' }` | `200`, pedido com numero_pedido atualizado |
| F-PED-02 | Editar tipo_operacao | body `{ tipo_operacao: 'exportacao' }` | `200`, tipo_operacao atualizado |
| F-PED-03 | Editar nome_fabricante | body `{ nome_fabricante: 'Novo Fabricante' }` | `200` |
| F-PED-04 | Editar referencia_importador | body `{ referencia_importador: 'REF-IMP-001' }` | `200` |
| F-PED-05 | Editar ncm | body `{ ncm: '8471.30.19' }` | `200` |
| F-PED-06 | Editar incoterm | body `{ incoterm: 'CIF' }` | `200` |
| F-PED-07 | Editar condicao_pagamento | body `{ condicao_pagamento: '30/60/90 dias' }` | `200` |
| F-PED-08 | Editar data_emissao_pedido | body `{ data_emissao_pedido: '2026-06-15T00:00:00.000Z' }` | `200`, data no formato ISO |
| F-PED-09 | Itens NAO alterados apos editar pedido | GET itens apos PUT pedido | Nenhum item teve campo correspondente alterado |
| F-PED-10 | updated_at do pedido atualizado | Verificar campo no response | Timestamp recente |

#### Campos de data (47 campos)

| ID | Caso | Resultado |
|----|------|-----------|
| F-PED-15 | Editar cada um dos 47 campos de data | `200` com data salva em ISO 8601 |
| F-PED-16 | Data null antes → preenchida apos PUT | Campo antes null, depois com valor |
| F-PED-17 | Data invalida (ex: 'abc') | `400` com erro de validacao |

#### Campos condicionais

| ID | Caso | Resultado |
|----|------|-----------|
| F-PED-20 | nome_exportador em pedido importacao | `200` (aceito) |
| F-PED-21 | nome_exportador em pedido exportacao | `400` ou campo ignorado |
| F-PED-22 | nome_importador em pedido exportacao | `200` (aceito) |
| F-PED-23 | nome_importador em pedido importacao | `400` ou campo ignorado |

#### Campos calculados rejeitados

| ID | Caso | Resultado |
|----|------|-----------|
| F-PED-30 | PUT com valor_total_pedido (calculado) | `400` ou campo ignorado |
| F-PED-31 | PUT com saldo_itens_do_pedido (saldo) | `400` ou campo ignorado |
| F-PED-32 | PUT com pais_exportador (somente_leitura) | `400` ou campo ignorado |
| F-PED-33 | Valor original permanece inalterado no banco | Confirmacao pos-PUT |

### 2. Propagacao pedido → itens

**Arquivo:** `propagacao-inline.test.ts`

| ID | Caso | Resultado |
|----|------|-----------|
| F-PROP-01 | PUT com replicar_em_itens=true em campo propagavel (incoterm) | Pedido + TODOS itens atualizados |
| F-PROP-02 | PUT com replicar_em_itens=true em moeda | Pedido + todos itens com nova moeda |
| F-PROP-03 | PUT com replicar_em_itens=true em condicao_pagamento | Pedido + itens |
| F-PROP-04 | PUT com replicar_em_itens=true em data (pedido_pronto) | Pedido + itens via MAPA_PROPAGACAO |
| F-PROP-05 | Itens com valor divergente pre-existente tambem sobrescritos | Todos alinhados |
| F-PROP-06 | PUT com replicar_em_itens=true em campo SEM par no MAPA | Apenas pedido muda, itens intactos |
| F-PROP-07 | PUT com replicar_em_itens=false | Apenas pedido muda |
| F-PROP-08 | updated_at de todos itens afetados atualizado | Timestamps recentes |

### 3. PUT /api/v1/pedidos/:id/itens/:itemId — Editar item individual

**Arquivo:** `item-inline-edit.test.ts`

#### Happy path

| ID | Caso | Resultado |
|----|------|-----------|
| F-ITM-01 | Editar valor_total_item + moeda_item | `200`, item atualizado |
| F-ITM-02 | Editar quantidade_inicial_pedido | `200` |
| F-ITM-03 | Editar peso_liquido_unitario | `200` |
| F-ITM-04 | Editar peso_bruto_unitario | `200` |
| F-ITM-05 | Editar cubagem_unitaria | `200` |
| F-ITM-06 | Editar ncm do item | `200` |
| F-ITM-07 | Editar part_number | `200` |
| F-ITM-08 | Editar descricao_item | `200` |
| F-ITM-09 | Editar unidade_comercializada_item | `200` |
| F-ITM-10 | Demais itens NAO alterados | GET itens: apenas item editado mudou |
| F-ITM-11 | Pedido pai NAO alterado | GET pedido: sem mudanca nos campos diretos |
| F-ITM-12 | updated_at do item editado atualizado | Timestamp recente |

#### GTValorMoeda { currency, amount }

| ID | Caso | Resultado |
|----|------|-----------|
| F-ITM-20 | PUT valor_total_item=1500.50 + moeda_item='EUR' | Item com ambos campos |
| F-ITM-21 | Moedas mistas entre itens apos edicao → aggregate = null | Regra de homogeneidade |
| F-ITM-22 | Todas moedas iguais → aggregate = soma | Recalculo correto |

#### Divergencia pai/filho

| ID | Caso | Resultado |
|----|------|-----------|
| F-ITM-30 | Item com ncm diferente do pedido → ncm_divergente=true | Flag de divergencia |
| F-ITM-31 | Item com incoterm diferente → incoterm_divergente=true | Flag |
| F-ITM-32 | Item com moeda diferente → moeda_item_divergente=true | Flag |
| F-ITM-33 | Item com valor IGUAL ao pedido → campo_divergente=false | Sem divergencia |
| F-ITM-34 | Propagacao replicar_em_itens → todos flags voltam a false | Divergencia resolvida |

### 4. POST /alteracoes-status-lote/confirmar — Status cascade

**Arquivo:** `status-cascade.test.ts`

| ID | Caso | Resultado |
|----|------|-----------|
| F-STS-01 | Mudar status para 'consolidado' | Pedido + todos itens = 'consolidado' |
| F-STS-02 | Status invalido | `400` |
| F-STS-03 | Permissao negada | `403` |

### 5. Validacao Zod — Payloads invalidos

**Arquivo:** `validacao-inline.test.ts`

| ID | Caso | Resultado |
|----|------|-----------|
| F-VAL-01 | PUT com campo_inexistente | `400` ou campo ignorado |
| F-VAL-02 | PUT com numero_pedido=12345 (number, nao string) | `400` |
| F-VAL-03 | PUT item com valor_total_item='abc' | `400` |
| F-VAL-04 | PUT com body vazio {} | `400` |
| F-VAL-05 | PUT com SQL injection em campo texto | `400` ou valor sanitizado |
| F-VAL-06 | PUT com XSS em campo texto | Valor sanitizado |
| F-VAL-07 | PUT item inexistente | `404` |
| F-VAL-08 | PUT pedido de outra organizacao | `404` (isolamento) |

### 6. Isolamento de organizacao

**Arquivo:** `isolamento-inline.test.ts`

| ID | Caso | Resultado |
|----|------|-----------|
| F-ISO-01 | PUT pedido com id de outra org | `404` (nao encontrado, nao 403) |
| F-ISO-02 | PUT item com pedido de outra org | `404` |
| F-ISO-03 | PUT com header org A editando pedido org B | `404` |
| F-ISO-04 | Nenhum dado da org B retornado ou modificado | Confirmacao negativa |

---

## Mocks Necessarios

| Dependencia | Como mockar |
|-------------|-------------|
| `withOrganizacao` | `vi.mock('@gravity/resolver-organizacao')` — callback com db mock |
| `requireAuth` | Middleware mock injetando `req.organizacao` e `req.auth` |
| `exigirPermissao` | `vi.mock('../permissoes.js')` — passthrough por default |
| Prisma (backend) | `vi.hoisted()` + `vi.mock()` — mock de findUnique, update, findMany |

---

## Estrutura de Arquivos Esperada

```
testes/testes-funcionais/pedido/Lista/editar-salvar/
├── editar-salvar-funcional.md       ← este plano
├── pedido-inline-edit.test.ts       ← F-PED-01 a F-PED-33 (PUT pedido + calculados bloqueados)
├── propagacao-inline.test.ts        ← F-PROP-01 a F-PROP-08 (replicar_em_itens)
├── item-inline-edit.test.ts         ← F-ITM-01 a F-ITM-34 (PUT item + divergencia)
├── status-cascade.test.ts           ← F-STS-01 a F-STS-03 (POST status lote)
├── validacao-inline.test.ts         ← F-VAL-01 a F-VAL-08 (Zod + XSS + SQL injection)
└── isolamento-inline.test.ts        ← F-ISO-01 a F-ISO-04 (cross-tenant)
```

**Total de casos:** ~90
