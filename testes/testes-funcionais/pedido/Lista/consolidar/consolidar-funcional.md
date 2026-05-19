# Plano de Testes Funcionais — Consolidar Pedido

**ID:** TST-FUN-PEDIDO-CONSOLIDAR-001
**Data:** 2026-05-17
**Versão:** 1.0
**Criticidade:** alta
**Ambiente:** `@vitest-environment node`

---

## Resumo Executivo

Plano de teste funcional para as 2 rotas HTTP de consolidação de pedidos. Testa a camada HTTP completa com Supertest: validação Zod real, error handler real, Prisma mockado, auth bypassado. Cobre preview (detecção de divergências entre pedidos) e confirmação (merge real com soft delete dos originais). Criticidade alta: erro aqui permite consolidação sem isolamento de organização, perda de dados ou merge incorreto de itens.

---

## Endpoints Cobertos

| Endpoint | Método | Arquivo |
|----------|--------|---------|
| `/api/v1/pedidos/consolidacoes/preview` | POST | `consolidacoes-pedido.ts:218` |
| `/api/v1/pedidos/consolidacoes/confirmar` | POST | `consolidacoes-pedido.ts:334` |

---

## Setup do App de Teste

```typescript
// Zod real + error handler real (local ao router) + Prisma mockado via withOrganizacao
function buildTestApp() {
  const app = express()
  app.use(express.json())
  app.use(mockRequireAuth)            // injeta req.organizacao
  app.use('/api/v1/pedidos/consolidacoes', consolidarRouter)
  // consolidarRouter já tem error handler local
  return app
}
```

---

## Casos de Teste

### 1. POST /consolidacoes/preview

#### Happy path

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-PRV-01 | Preview com 2 pedidos iguais (sem divergências) | `{ ids: ['ped-001', 'ped-002'] }` | `200`, `campos_divergentes: []`, `campos_iguais.length > 0` |
| F-PRV-02 | Preview com 2 pedidos divergentes (incoterm diferente) | `{ ids: ['ped-001', 'ped-002'] }` (incoterms diferentes) | `200`, `campos_divergentes` contém campo `incoterm_pedido` |
| F-PRV-03 | Preview retorna itens consolidados por part_number | 2 pedidos com itens de mesmo part_number | `itens` agrupa quantidades |
| F-PRV-04 | Preview retorna valor_total_soma = soma dos pedidos | 2 pedidos com valores diferentes | `valor_total_soma = p1.valor + p2.valor` |
| F-PRV-05 | Preview retorna numero_sugerido no formato PO-CONS-{ANO}/{SEQ} | Qualquer payload válido | `numero_sugerido` match `/^PO-CONS-\d{4}\/\d{3}$/` |
| F-PRV-06 | Preview detecta conflito_tipo_operacao quando tipos mistos | 1 importação + 1 exportação | `conflito_tipo_operacao = true` |
| F-PRV-07 | Preview retorna pedidos_info com id, numero, total_itens | 2 pedidos | `pedidos_info.length = 2` com shape correto |

#### Validação Zod (400)

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-PRV-10 | Body vazio `{}` | `{}` | `400`, `error.code = 'VALIDATION_ERROR'` |
| F-PRV-11 | ids vazio | `{ ids: [] }` | `400`, mensagem "Selecione ao menos 2" |
| F-PRV-12 | ids com 1 só pedido | `{ ids: ['ped-001'] }` | `400` (min 2) |
| F-PRV-13 | ids com string vazia | `{ ids: ['', 'ped-002'] }` | `400` |
| F-PRV-14 | ids com número | `{ ids: [123, 456] }` | `400` |
| F-PRV-15 | Sem campo ids | `{ outro: 'campo' }` | `400` |

#### Erros de negócio

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-PRV-20 | Nenhum pedido encontrado | `{ ids: ['inexistente-1', 'inexistente-2'] }` | `404`, `NOT_FOUND` |
| F-PRV-21 | 2 ids, 1 não existe (parcial) | `{ ids: ['ped-001', 'ped-999'] }` | `404`, "Um ou mais pedidos não foram encontrados" |

#### Erro interno

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-PRV-30 | Erro interno do banco | findMany rejeita | `500`, sem stack trace |

---

### 2. POST /consolidacoes/confirmar

#### Happy path

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-CNF-01 | Confirmar com 2 pedidos, campos válidos | Payload completo | `201`, pedido consolidado retornado |
| F-CNF-02 | Novo pedido tem status 'consolidado' | Verificar response | `status_pedido = 'consolidado'` |
| F-CNF-03 | Novo pedido guarda ids_origem_consolidacao_pedido | Verificar response | `ids_origem_consolidacao_pedido = ids` |
| F-CNF-04 | Pedidos originais recebem soft delete | Verificar updateMany | `data_exclusao_pedido` setado + `status_pedido = 'consolidado'` |
| F-CNF-05 | Itens são copiados para novo pedido com sequência 1..N | Verificar create.data.itens_pedido | Sequência contígua |
| F-CNF-06 | fundir_itens_mesmo_part_number=true soma quantidades | 2 pedidos com item de mesmo part_number | Quantidades somadas |
| F-CNF-07 | fundir_itens_mesmo_part_number=false mantém itens separados | Mesmo cenário com flag false | Cada item preservado individualmente |
| F-CNF-08 | campos_escolhidos do usuário fazem override nos divergentes | `campos_escolhidos: { incoterm_pedido: 'CIF' }` | Campo aplicado no create |
| F-CNF-09 | valor_total_pedido = soma dos originais | 2 pedidos com valores | `valor_total_pedido = soma` |
| F-CNF-10 | recalcularAgregadosPedido é chamado após criação | Verificar mock | Chamado com id do novo pedido |

#### Validação Zod (400)

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-CNF-20 | Body vazio | `{}` | `400`, `VALIDATION_ERROR` |
| F-CNF-21 | ids com 1 só pedido | `{ ids: ['ped-001'], ... }` | `400` (min 2) |
| F-CNF-22 | numero_pedido vazio | `{ ids: [...], numero_pedido: '', ... }` | `400` |
| F-CNF-23 | Sem fundir_itens_mesmo_part_number | Payload sem campo boolean | `400` |
| F-CNF-24 | numero_pedido > 100 chars | String com 101 chars | `400` |

#### Erros de negócio

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-CNF-30 | Pedidos não encontrados | ids inexistentes | `404`, `NOT_FOUND` |
| F-CNF-31 | Tipos de operação mistos (importação + exportação) | 1 imp + 1 exp | `422`, `TIPO_OPERACAO_MISTO` |
| F-CNF-32 | Número de pedido já em uso | Mock findFirst retorna existente | `409`, `CONFLICT` |

#### Erro interno

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-CNF-40 | Erro interno do Prisma | Mock rejeita | `500`, sem stack trace |

---

### 3. Isolamento de Organização (Cross-Organização)

| ID | Caso | Verificação |
|----|------|-------------|
| F-ISO-01 | Preview: WHERE inclui `id_organizacao` do req.organizacao | `mockFindMany.mock.calls[0][0].where.id_organizacao === 'org-001'` |
| F-ISO-02 | Confirmar: WHERE inclui `id_organizacao` | Idem |
| F-ISO-03 | Preview de pedido da org A com token da org B → 404 | Não vaza existência |
| F-ISO-04 | Confirmar pedido da org A com token da org B → 404 | Não vaza existência |
| F-ISO-05 | Soft delete só marca pedidos da mesma org | updateMany.where inclui id_organizacao |

---

## Mocks Necessários

| Dependência | Como mockar |
|-------------|-------------|
| `withOrganizacao` | `vi.mock('@gravity/resolver-organizacao')` — mock que executa callback com db mock |
| `detectarTiposMistos` | Import real de `bulkSchemas.js` (função pura, não precisa mock) |
| `auditLog` | `vi.mock('historico-global/audit-client.js')` — fire-and-forget, só verificar chamada |
| `resolverIdStatusPedidoOpcional` | `vi.mock('statusPedidoLookup.js')` — retorna id fixo |
| `recalcularAgregadosPedido` | `vi.mock('recalcularAgregadosPedido.js')` — verificar se é chamado |

---

## Estrutura de Arquivos Esperada

```
testes/testes-funcionais/pedido/Lista/consolidar/
├── consolidar-funcional.md            ← este plano
├── preview.test.ts                    ← F-PRV-01 a F-PRV-30
├── confirmar.test.ts                  ← F-CNF-01 a F-CNF-40
└── isolamento-organizacao.test.ts     ← F-ISO-01 a F-ISO-05
```

**Total de casos:** ~42
