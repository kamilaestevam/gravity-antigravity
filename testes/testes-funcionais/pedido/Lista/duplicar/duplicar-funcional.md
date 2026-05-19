# Plano de Testes Funcionais — Duplicar Pedido

**ID:** TST-FUN-PEDIDO-DUPLICAR-001
**Data:** 2026-05-16
**Versão:** 1.0
**Criticidade:** alta
**Ambiente:** `@vitest-environment node`

---

## Resumo Executivo

Plano de teste funcional para as 3 rotas HTTP de duplicação de pedidos. Testa a camada HTTP completa com Supertest: validação Zod real, error handler real, Prisma mockado, auth bypassado. Cobre preview, confirmação (1 pedido, 2 pedidos) e duplicação de itens (1 item, múltiplos itens). Criticidade alta: erro aqui permite criação de pedidos sem validação ou sem isolamento de organização.

---

## Endpoints Cobertos

| Endpoint | Método | Arquivo |
|----------|--------|---------|
| `/api/v1/pedidos/duplicacoes/preview` | POST | `duplicacoes-pedido.ts:61` |
| `/api/v1/pedidos/duplicacoes/confirmar` | POST | `duplicacoes-pedido.ts:85` |
| `/api/v1/pedidos/duplicacoes/itens` | POST | `duplicacoes-pedido.ts:117` |

---

## Setup do App de Teste

```typescript
// Zod real + error handler real + requireAuth bypassado + Prisma mockado
function buildTestApp() {
  const app = express()
  app.use(express.json())
  app.use(mockRequireAuth)            // injeta req.auth + req.organizacao
  app.use('/api/v1/pedidos/duplicacoes', duplicacoesPedidoRouter)
  app.use(errorHandler)               // error handler real
  return app
}
```

---

## Casos de Teste

### 1. POST /duplicacoes/preview

#### Happy path

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-PRV-01 | Preview com 1 pedido | `{ ids: ['ped-001'] }` | `200`, `{ config: {...}, pedidos: [{ id, numero_pedido, total_itens }] }` |
| F-PRV-02 | Preview com 2 pedidos | `{ ids: ['ped-001', 'ped-002'] }` | `200`, array com 2 pedidos |
| F-PRV-03 | Config retorna numero_auto=true | Mock config com `duplicar_numero_auto: true` | `config.numero_auto = true` |

#### Validação Zod (400)

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-PRV-04 | Body vazio `{}` | `{}` | `400`, `error.code = 'VALIDATION_ERROR'` |
| F-PRV-05 | ids vazio | `{ ids: [] }` | `400`, mensagem "Selecione ao menos 1" |
| F-PRV-06 | ids com string vazia | `{ ids: [''] }` | `400` |
| F-PRV-07 | ids com número | `{ ids: [123] }` | `400` |
| F-PRV-08 | Sem campo ids | `{ outro: 'campo' }` | `400` |

#### Erros de negócio

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-PRV-09 | Pedido não encontrado | `{ ids: ['inexistente'] }` | `404`, `error.code = 'NOT_FOUND'` |
| F-PRV-10 | 2 ids, 1 não existe | `{ ids: ['ped-001', 'ped-999'] }` | `404` |

#### Segurança

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-PRV-11 | Sem auth (middleware não injeta req.auth) | Remover mock de auth | `401` |
| F-PRV-12 | Sem permissão (role sem pedido:lista:editar) | Mock auth sem permissão | `403` |
| F-PRV-13 | Erro interno do banco | Prisma rejeita com erro | `500`, sem stack trace no body |

---

### 2. POST /duplicacoes/confirmar

#### Happy path — 1 pedido

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-CNF-01 | Duplicar 1 pedido com auto=true, opcoes all true | `{ ids: ['ped-001'] }` | `201`, `criados.length = 1`, todos campos copiados |
| F-CNF-02 | Duplicar 1 pedido com auto=false, número fornecido | `{ ids: ['ped-001'], numeros: { 'ped-001': 'COPIA-001' } }` | `201`, número = 'COPIA-001' |
| F-CNF-03 | Verificar que response body é `{ criados: [...], erros: [...] }` | Qualquer payload válido | Shape do body correto |

#### Happy path — 2 pedidos

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-CNF-04 | Duplicar 2 pedidos com auto=true | `{ ids: ['ped-001', 'ped-002'] }` | `201`, `criados.length = 2` |
| F-CNF-05 | Duplicar 2 pedidos com auto=false, números distintos | `{ ids: [...], numeros: { ped-001: 'A', ped-002: 'B' } }` | `201`, números corretos |
| F-CNF-06 | Duplicar 2 pedidos, 1 com número duplicado no banco | Mock findFirst retorna existente pro 2o | `201`, `criados.length = 1, erros.length = 1` |

#### Opções de duplicação — verificar persistência de CADA grupo

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-CNF-10 | `copiar_valores_precos=false` | `{ ids: ['ped-001'], opcoes: { ...allTrue, copiar_valores_precos: false } }` | Prisma.create chamado com `valor_total_pedido: null, valor_total_cambio_pedido: null, taxa_cambio_estimada_pedido: null` |
| F-CNF-11 | `copiar_valores_precos=false` nos itens | Mesmo payload | Items criados com `valor_total_item: null, valor_por_unidade_item: null` |
| F-CNF-12 | `copiar_referencias_externas=false` no pedido | Payload com opção false | `numero_proforma_pedido: null, numero_invoice_pedido: null, referencia_importador_pedido: null, referencia_exportador_pedido: null, referencia_fabricante_pedido: null, contrato_cambio_id_pedido: null` |
| F-CNF-13 | `copiar_referencias_externas=false` nos itens | Mesmo payload | `numero_lpco: null, numero_certificado_origem: null, referencia_importador_item: null, referencia_exportador_item: null, referencia_fabricante_item: null` |
| F-CNF-14 | `copiar_pesos_cubagem=false` no pedido | Payload com opção false | `peso_liquido_total_pedido: null, peso_bruto_total_pedido: null, cubagem_total_pedido: null, tipo_embalagem_pedido: null, quantidade_volumes_pedido: null` |
| F-CNF-15 | `copiar_pesos_cubagem=false` nos itens | Mesmo payload | `peso_liquido_unitario_item: null, peso_bruto_unitario_item: null, cubagem_unitaria_item: null, tipo_embalagem_item: null, quantidade_volumes_item: null` |
| F-CNF-16 | `copiar_descricoes_complementares=false` nos itens | Payload com opção false | `descricao_completa_item_pt: null, descricao_completa_item_en: null, descricao_completa_item_es: null, descricao_completa_item_nf: null, texto_posicao_ncm: null, grupo_item: null, subgrupo_item: null, campo_especial_item: null, atributos_catalogo: null` |
| F-CNF-17 | `copiar_datas=false` | Payload com opção false | Todos campos Date do pedido e itens = null |
| F-CNF-18 | Todas opções true (retrocompat) | `opcoes` ausente no payload | Nenhum campo zerado |

#### Campos SEMPRE resetados (verificação de cada campo)

| ID | Caso | Verificação |
|----|------|-------------|
| F-CNF-20 | id_pedido do clone é diferente do original | `Prisma.create.data.id_pedido !== 'ped-001'` |
| F-CNF-21 | data_criacao_pedido não é copiada | Não presente no spread |
| F-CNF-22 | data_atualizacao_pedido não é copiada | Não presente no spread |
| F-CNF-23 | ids_origem_consolidacao_pedido removido | Não presente no spread |
| F-CNF-24 | data_consolidacao_pedido removido | Não presente no spread |
| F-CNF-25 | data_transferencia_saldo_pedido removido | Não presente no spread |
| F-CNF-26 | Item clone: id_item novo | Diferente do original |
| F-CNF-27 | Item clone: quantidade_pronta_item = 0 | Zerado |
| F-CNF-28 | Item clone: quantidade_transferida_item = 0 | Zerado |
| F-CNF-29 | Item clone: quantidade_cancelada_item = 0 | Zerado |
| F-CNF-30 | Item clone: quantidade_atual_item = quantidade_inicial_item | Saldo volta ao inicial |

#### Validação Zod (400)

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-CNF-31 | Body vazio | `{}` | `400`, `VALIDATION_ERROR` |
| F-CNF-32 | ids vazio | `{ ids: [] }` | `400` |
| F-CNF-33 | opcoes com campo faltando | `{ ids: ['x'], opcoes: { copiar_datas: true } }` | `400` (schema strict nos opcoes) |
| F-CNF-34 | Adversarial: ids com `<script>` | `{ ids: ['<script>'] }` | `400` ou aceita string sem crash |

#### Erros de negócio (404, 500)

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-CNF-35 | Pedido não encontrado | `{ ids: ['nao-existe'] }` | `404` |
| F-CNF-36 | auto=false, número não fornecido | `{ ids: ['ped-001'] }` com config.auto=false | `400` |
| F-CNF-37 | Erro interno do Prisma | Mock rejeita | `500`, sem stack trace |

---

### 3. POST /duplicacoes/itens

#### Happy path — 1 item

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-ITN-01 | Duplicar 1 item dentro do pedido | `{ pedido_id: 'ped-001', item_ids: ['it-001'] }` | `201`, `criados.length = 1` |
| F-ITN-02 | Item duplicado fica no mesmo pedido_id | Verificar payload do create | `id_pedido = 'ped-001'` |
| F-ITN-03 | Sequência do item duplicado é imediatamente após o original | Verificar renumeração | Cópia em posição original+1 |

#### Happy path — múltiplos itens

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-ITN-04 | Duplicar 2 itens do mesmo pedido | `{ pedido_id: 'ped-001', item_ids: ['it-001', 'it-002'] }` | `201`, `criados.length = 2` |
| F-ITN-05 | Duplicar 3 itens, todos existem | Payload com 3 ids | `201`, `criados.length = 3` |

#### Opções de duplicação nos itens

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-ITN-10 | `copiar_valores_precos=false` | Com opcoes | `valor_total_item: null, valor_por_unidade_item: null` |
| F-ITN-11 | `copiar_referencias_externas=false` | Com opcoes | `numero_lpco: null, numero_certificado_origem: null, etc.` |
| F-ITN-12 | `copiar_pesos_cubagem=false` | Com opcoes | `peso_liquido_unitario_item: null, etc.` |
| F-ITN-13 | `copiar_descricoes_complementares=false` | Com opcoes | `descricao_completa_item_pt: null, etc.` |
| F-ITN-14 | `copiar_datas=false` | Com opcoes | Todos campos Date = null |
| F-ITN-15 | Todas opções true | Sem opcoes no payload | Todos campos preservados |

#### Campos SEMPRE resetados nos itens

| ID | Caso | Verificação |
|----|------|-------------|
| F-ITN-20 | id_item novo | Diferente do original |
| F-ITN-21 | quantidade_pronta_item = 0 | Zerado |
| F-ITN-22 | quantidade_transferida_item = 0 | Zerado |
| F-ITN-23 | quantidade_cancelada_item = 0 | Zerado |
| F-ITN-24 | quantidade_atual_item = quantidade_inicial_item | Saldo volta ao inicial |
| F-ITN-25 | sequencia_item_pedido renumerada 1..N contígua | Sem gaps, sem duplicatas |

#### Validação Zod (400)

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-ITN-30 | pedido_id vazio | `{ pedido_id: '', item_ids: ['it-001'] }` | `400` |
| F-ITN-31 | item_ids vazio | `{ pedido_id: 'ped-001', item_ids: [] }` | `400` |
| F-ITN-32 | Body vazio | `{}` | `400` |
| F-ITN-33 | pedido_id ausente | `{ item_ids: ['it-001'] }` | `400` |

#### Erros de negócio

| ID | Caso | Request | Resultado |
|----|------|---------|-----------|
| F-ITN-34 | Pedido não encontrado | `{ pedido_id: 'nao-existe', item_ids: ['it-001'] }` | `404` |
| F-ITN-35 | Item não pertence ao pedido | `{ pedido_id: 'ped-001', item_ids: ['it-de-outro-pedido'] }` | `404` |
| F-ITN-36 | 3 itens, 1 não encontrado | Mock retorna só 2 | `404` |

---

### 4. Isolamento de Organização (Cross-Organização)

| ID | Caso | Verificação |
|----|------|-------------|
| F-ISO-01 | Preview: WHERE inclui `id_organizacao` do req.organizacao | Verificar `mockFindMany.mock.calls[0][0].where.id_organizacao === 'org-001'` |
| F-ISO-02 | Confirmar: WHERE inclui `id_organizacao` | Idem |
| F-ISO-03 | Duplicar itens: WHERE inclui `id_organizacao` | Idem |
| F-ISO-04 | Preview de pedido da org A com token da org B | `404` (não vaza existência) |
| F-ISO-05 | Confirmar pedido da org A com token da org B | `404` |
| F-ISO-06 | Duplicar item da org A com token da org B | `404` |

---

## Mocks Necessários

| Dependência | Como mockar |
|-------------|-------------|
| `withOrganizacao` | `vi.mock('@gravity/resolver-organizacao')` — mock que executa callback com db mock |
| `DuplicarService` | Mock dos métodos `preview`, `confirmar`, `duplicarItens` |
| `exigirPermissao` | `vi.mock('../permissoes.js')` — passthrough por default, rejeita em teste de 403 |
| `requireAuth` | Middleware mock injetando `req.organizacao` e `req.auth` |

---

## Estrutura de Arquivos Esperada

```
testes/testes-funcionais/pedido/Lista/duplicar/
├── duplicar-funcional.md            ← este plano
├── preview.test.ts                  ← F-PRV-01 a F-PRV-13
├── confirmar.test.ts                ← F-CNF-01 a F-CNF-37
├── itens.test.ts                    ← F-ITN-01 a F-ITN-36
└── isolamento-organizacao.test.ts   ← F-ISO-01 a F-ISO-06
```

**Total de casos:** ~96
