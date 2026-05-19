# Plano de Testes Unitários — Duplicar Pedido

**ID:** TST-UNIT-PEDIDO-DUPLICAR-001
**Data:** 2026-05-16
**Versão:** 1.0
**Criticidade:** alta
**Cobertura mínima:** 70%
**Ambiente:** `@vitest-environment node`

---

## Resumo Executivo

Plano de teste unitário para a feature de duplicação de pedidos. Cobre 3 camadas: função pura `aplicarZeramentoOpcoes`, schemas Zod das rotas, e lógica do service `DuplicarService`. A criticidade é alta porque envolve clonagem de dados financeiros e operacionais — erro aqui cria pedidos com dados incorretos ou vazamento cross-organização.

---

## Módulos Cobertos

| Módulo | Tipo | Arquivo Fonte |
|--------|------|---------------|
| `aplicarZeramentoOpcoes` | Função Pura | `servicos-global/produto/pedido/server/src/services/duplicarExcluirService.ts` |
| `DuplicarService.preview` | Service | `servicos-global/produto/pedido/server/src/services/duplicarExcluirService.ts` |
| `DuplicarService.confirmar` | Service | `servicos-global/produto/pedido/server/src/services/duplicarExcluirService.ts` |
| `DuplicarService.duplicarItens` | Service | `servicos-global/produto/pedido/server/src/services/duplicarExcluirService.ts` |
| `OpcoesDuplicacaoSchema` | Schema Zod | `servicos-global/produto/pedido/server/src/routes/duplicacoes-pedido.ts` |
| `DuplicarPreviewSchema` | Schema Zod | `servicos-global/produto/pedido/server/src/routes/duplicacoes-pedido.ts` |
| `DuplicarConfirmarSchema` | Schema Zod | `servicos-global/produto/pedido/server/src/routes/duplicacoes-pedido.ts` |
| `DuplicarItensSchema` | Schema Zod | `servicos-global/produto/pedido/server/src/routes/duplicacoes-pedido.ts` |
| `ModalDuplicarPedidos` (React) | Componente | `servicos-global/produto/pedido/client/src/components/ModalPedidosDuplicar.tsx` |

---

## Teste Existente

- `testes/testes-unitarios/pedido/duplicar-opcoes-zeramento.test.ts` — 15 casos cobrindo `aplicarZeramentoOpcoes`. Manter como está (`origem: existente`).

---

## Casos de Teste

### 1. aplicarZeramentoOpcoes — Função Pura (existente: 15 testes)

> ✅ **Já coberto** em `duplicar-opcoes-zeramento.test.ts` — não duplicar.

---

### 2. Schemas Zod — `OpcoesDuplicacaoSchema`

**Arquivo:** `duplicar-schemas.test.ts`

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-ZOD-01 | Objeto completo com todos os 5 booleans `true` | `safeParse.success = true` |
| U-ZOD-02 | Objeto completo com todos os 5 booleans `false` | `safeParse.success = true` |
| U-ZOD-03 | `copiar_datas` ausente | `safeParse.success = false`, fieldError em `copiar_datas` |
| U-ZOD-04 | `copiar_valores_precos` ausente | `safeParse.success = false` |
| U-ZOD-05 | `copiar_referencias_externas` ausente | `safeParse.success = false` |
| U-ZOD-06 | `copiar_pesos_cubagem` ausente | `safeParse.success = false` |
| U-ZOD-07 | `copiar_descricoes_complementares` ausente | `safeParse.success = false` |
| U-ZOD-08 | `copiar_datas` com string em vez de boolean | `safeParse.success = false` |
| U-ZOD-09 | Objeto vazio `{}` | `safeParse.success = false`, 5 fieldErrors |
| U-ZOD-10 | Campo extra `copiar_xyz: true` (campo inventado) | `safeParse.success = true` (Zod strip por default) |

### 3. Schemas Zod — `DuplicarPreviewSchema`

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-ZOD-11 | `{ ids: ['id1', 'id2'] }` | `success = true` |
| U-ZOD-12 | `{ ids: [] }` (array vazio) | `success = false`, mensagem "Selecione ao menos 1 pedido" |
| U-ZOD-13 | `{ ids: [''] }` (string vazia dentro) | `success = false` |
| U-ZOD-14 | `{}` (ids ausente) | `success = false` |
| U-ZOD-15 | `{ ids: 'nao-array' }` (tipo errado) | `success = false` |
| U-ZOD-16 | `{ ids: [123] }` (número em vez de string) | `success = false` |

### 4. Schemas Zod — `DuplicarConfirmarSchema`

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-ZOD-17 | `{ ids: ['id1'], numeros: { id1: 'PED-001' }, opcoes: { ...allTrue } }` | `success = true` |
| U-ZOD-18 | `{ ids: ['id1'] }` (sem numeros, sem opcoes) | `success = true` (ambos opcionais) |
| U-ZOD-19 | `{ ids: [] }` | `success = false` |
| U-ZOD-20 | `{ ids: ['id1'], opcoes: { copiar_datas: 'sim' } }` (tipo errado) | `success = false` |
| U-ZOD-21 | `{ ids: ['id1'], numeros: { id1: '' } }` (número vazio no record) | `success = true` (record aceita string vazia; validação de negócio fica no service) |

### 5. Schemas Zod — `DuplicarItensSchema`

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-ZOD-22 | `{ pedido_id: 'ped1', item_ids: ['it1', 'it2'] }` | `success = true` |
| U-ZOD-23 | `{ pedido_id: '', item_ids: ['it1'] }` (pedido_id vazio) | `success = false` |
| U-ZOD-24 | `{ pedido_id: 'ped1', item_ids: [] }` | `success = false` |
| U-ZOD-25 | `{ item_ids: ['it1'] }` (pedido_id ausente) | `success = false` |
| U-ZOD-26 | `{ pedido_id: 'ped1', item_ids: ['it1'], opcoes: { ...allFalse } }` | `success = true` |

### 6. DuplicarService.preview — Service (Prisma mockado)

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-SVC-01 | Preview com 1 pedido existente | Retorna config + array com 1 pedido, total_itens correto |
| U-SVC-02 | Preview com 2 pedidos existentes | Retorna array com 2 pedidos |
| U-SVC-03 | Preview com id inexistente | `throw AppError('não encontrados', 404)` |
| U-SVC-04 | Preview com 3 ids mas só 2 existem no banco | `throw AppError(404)` |
| U-SVC-05 | Preview sem configuração no banco (fallback defaults) | `config.numero_auto = false, copiar_datas = false, status_inicial = 'copiar'` |
| U-SVC-06 | Preview com configuração custom no banco | Config retornada reflete a tabela |

### 7. DuplicarService.confirmar — Service (Prisma mockado)

**Cenário: 1 pedido**

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-SVC-10 | Duplicar 1 pedido com numero_auto=true, opcoes tudo true | `criados.length = 1`, número gerado automaticamente, todos campos copiados |
| U-SVC-11 | Duplicar 1 pedido com numero_auto=false, número fornecido | `criados.length = 1`, número = fornecido |
| U-SVC-12 | Duplicar 1 pedido com numero_auto=false sem número | `throw AppError(400, 'VALIDATION_ERROR')` |
| U-SVC-13 | Duplicar 1 pedido com número já existente | `erros.length = 1, motivo contém "já está em uso"` |
| U-SVC-14 | Duplicar 1 pedido com status_inicial='copiar' | Status do novo = status do original |
| U-SVC-15 | Duplicar 1 pedido com status_inicial='rascunho' | Status do novo = 'rascunho' |
| U-SVC-16 | Duplicar 1 pedido com status FK inexistente | `console.warn` + pedido criado sem id_status_pedido |

**Cenário: 2 pedidos**

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-SVC-17 | Duplicar 2 pedidos com numero_auto=true | `criados.length = 2`, números distintos |
| U-SVC-18 | Duplicar 2 pedidos com numero_auto=false | Ambos usam números fornecidos |
| U-SVC-19 | Duplicar 2 pedidos, 1 falha (número duplicado) | `criados.length = 1, erros.length = 1` |

**Cenário: opções de duplicação (zeramento condicional)**

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-SVC-20 | `copiar_valores_precos=false` → campos de valor no pedido são null | `valor_total_pedido = null, valor_total_cambio_pedido = null, taxa_cambio_estimada_pedido = null` |
| U-SVC-21 | `copiar_valores_precos=false` → campos de valor nos ITENS são null | `valor_total_item = null, valor_por_unidade_item = null` |
| U-SVC-22 | `copiar_referencias_externas=false` → campos de referência no pedido null | `numero_proforma_pedido = null, numero_invoice_pedido = null, etc.` |
| U-SVC-23 | `copiar_referencias_externas=false` → campos de referência nos ITENS null | `numero_lpco = null, numero_certificado_origem = null, etc.` |
| U-SVC-24 | `copiar_pesos_cubagem=false` → campos de peso no pedido null | `peso_liquido_total_pedido = null, peso_bruto_total_pedido = null, cubagem_total_pedido = null` |
| U-SVC-25 | `copiar_pesos_cubagem=false` → campos de peso nos ITENS null | `peso_liquido_unitario_item = null, etc.` |
| U-SVC-26 | `copiar_descricoes_complementares=false` → descrições do item null | `descricao_completa_item_pt = null, descricao_completa_item_en = null, etc.` |
| U-SVC-27 | `copiar_datas=false` → TODOS os campos DateTime do pedido são null | Verificar cada campo Date do pedido |
| U-SVC-28 | `copiar_datas=false` → TODOS os campos DateTime dos ITENS são null | Verificar cada campo Date do item |
| U-SVC-29 | Todas opções true (retrocompat) → nenhum campo zerado | Todos os campos copiados intactos |

**Cenário: campos SEMPRE resetados (nunca copiados)**

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-SVC-30 | id_pedido do clone é novo (diferente do original) | `novoPedido.id_pedido !== pedidoOriginal.id_pedido` |
| U-SVC-31 | data_criacao_pedido do clone é nova (não copiada) | Não herda data_criacao do original |
| U-SVC-32 | data_atualizacao_pedido do clone é nova | Não herda data_atualizacao do original |
| U-SVC-33 | ids_origem_consolidacao_pedido é null/excluído no clone | Não herda campo de consolidação |
| U-SVC-34 | data_consolidacao_pedido é null no clone | Não herda campo de consolidação |
| U-SVC-35 | data_transferencia_saldo_pedido é null no clone | Não herda campo de transferência |
| U-SVC-36 | Itens clonados: id_item novo, quantidade_pronta=0, quantidade_transferida=0, quantidade_cancelada=0 | Saldo de execução zerado |
| U-SVC-37 | Itens clonados: quantidade_atual_item = quantidade_inicial_item do original | Saldo volta ao estado inicial |

**Cenário: workspace**

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-SVC-38 | Duplicar com x-id-workspace no header | Clone herda workspace do header |
| U-SVC-39 | Duplicar sem x-id-workspace | Clone herda workspace do pedido original |

### 8. DuplicarService.duplicarItens — Service (Prisma mockado)

**Cenário: 1 item**

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-SVC-40 | Duplicar 1 item dentro do pedido | `criados.length = 1`, item criado no mesmo pedido_id |
| U-SVC-41 | Duplicar 1 item com pedido inexistente | `throw AppError(404)` |
| U-SVC-42 | Duplicar 1 item com item_id inexistente | `throw AppError(404)` |
| U-SVC-43 | Item duplicado fica imediatamente abaixo do original (sequência) | Renumeração coloca cópia logo após original |

**Cenário: múltiplos itens**

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-SVC-44 | Duplicar 2 itens do mesmo pedido | `criados.length = 2` |
| U-SVC-45 | Duplicar 3 itens, 1 pertence a outro pedido | `throw AppError(404)` (item não encontrado naquele pedido) |
| U-SVC-46 | Duplicar itens com opções de zeramento aplicadas | Campos dos grupos desativados são null |

**Cenário: campos SEMPRE resetados nos itens duplicados**

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-SVC-47 | id_item do clone é novo | `novoItem.id_item !== itemOriginal.id_item` |
| U-SVC-48 | sequencia_item_pedido é reordenada (não null, não duplicada) | Sequência final é 1..N contíguo |
| U-SVC-49 | quantidade_pronta_item = 0 no clone | Zerado independente do original |
| U-SVC-50 | quantidade_transferida_item = 0 no clone | Zerado |
| U-SVC-51 | quantidade_cancelada_item = 0 no clone | Zerado |
| U-SVC-52 | quantidade_atual_item = quantidade_inicial_item do original | Saldo volta ao inicial |

### 9. ModalDuplicarPedidos — Componente React (lógica)

**Arquivo:** `modal-duplicar-logica.test.ts`
**Ambiente:** `@vitest-environment jsdom`

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-UI-01 | Render com 1 pedido selecionado | Título mostra "Duplicar 1 pedido" |
| U-UI-02 | Render com 2 pedidos selecionados | Título mostra "Duplicar 2 pedidos" |
| U-UI-03 | Render com 0 pedidos + 3 itens | Título mostra "Duplicar 3 itens" |
| U-UI-04 | Render misto: 1 pedido + 2 itens de outro pedido | Título misto correto |
| U-UI-05 | Estado inicial das opções: todas true | Checkboxes marcados |
| U-UI-06 | Toggle copiar_datas para false | Estado atualizado |
| U-UI-07 | Toggle copiar_valores_precos para false | Estado atualizado |
| U-UI-08 | Wizard passo 1 → passo 2 via botão Próximo | passoAtual muda de 1 para 2 |
| U-UI-09 | Wizard passo 2 → passo 1 via botão Voltar | passoAtual volta para 1 |
| U-UI-10 | `podeAvancar` = false quando carregando | Botão Próximo desabilitado |
| U-UI-11 | `podeAvancar` = true quando config carregada (passo 1) | Botão habilitado |
| U-UI-12 | `podeAvancar` = false quando número vazio e auto=false (passo 2) | Botão desabilitado |
| U-UI-13 | `podeDuplicar` = true quando numero_auto=true | Não exige número |
| U-UI-14 | Seção "Sempre resetado" renderiza chips de campo corretos | Chips de pedido e item presentes |
| U-UI-15 | Itens filtrados excluem itens cujo pedido_id já está nos pedidos selecionados | Sem duplicação |

---

## Mocks Necessários

| Dependência | Mock | Padrão |
|-------------|------|--------|
| `pedidoDuplicarApi.preview` | `vi.fn()` | Retorna `{ config, pedidos }` |
| `pedidoDuplicarApi.confirmar` | `vi.fn()` | Retorna `{ criados, erros }` |
| `pedidoDuplicarApi.duplicarItens` | `vi.fn()` | Retorna `{ criados, erros }` |
| `useShellStore` | `vi.mock()` | `{ addNotification: vi.fn() }` |
| `useTranslation` | `vi.mock()` | `{ t: (key) => key }` |
| Prisma (backend) | `vi.hoisted()` + `vi.mock()` | Mock de todos os models usados |
| `auditLog` | `vi.fn()` | Fire-and-forget, sem retorno |

---

## Cobertura por Categoria

| Categoria | Status | Casos |
|-----------|--------|-------|
| Happy path | ✅ | 20+ |
| Sad path (erro) | ✅ | 12+ |
| Edge cases | ✅ | 10+ |
| Adversarial | ⚠️ | Coberto via Zod schemas |
| Retrocompat | ✅ | 3 (opcoes undefined/parcial) |

---

## Estrutura de Arquivos Esperada

```
testes/testes-unitarios/pedido/Lista/duplicar/
├── duplicar-unitario.md          ← este plano
├── duplicar-schemas.test.ts      ← Zod schemas (U-ZOD-01 a U-ZOD-26)
├── duplicar-service.test.ts      ← DuplicarService (U-SVC-01 a U-SVC-52)
└── modal-duplicar-logica.test.ts ← Componente React (U-UI-01 a U-UI-15)

testes/testes-unitarios/pedido/
└── duplicar-opcoes-zeramento.test.ts ← existente (15 testes, preservar)
```

**Total de casos novos:** ~78
**Total com existentes:** ~93
