# Pedido — Unidades de medida (Técnico)

> SSOT: `cadastros.unidade` (banco do serviço Cadastros).
> Esta página documenta como o produto Pedido consome unidades, persiste a unidade de exibição por campo, valida cruzado contra Cadastros e renderiza dropdown no formato `SIGLA — Nome`.

---

## 1. Visão de alto nível

Cada item do Pedido (`PedidoItem`) tem **4 unidades semânticas** independentes:

| Campo | Coluna no banco | Categorias aceitas (Cadastros) | Default |
|---|---|---|---|
| Unidade comercializada | `unidade_comercializada_item` | qualquer categoria (peso/contagem/volume/etc.) | — |
| Peso líquido | `peso_liquido_unidade_item` | `peso` (KG, G, TON) | `KG` |
| Peso bruto | `peso_bruto_unidade_item` | `peso` (KG, G, TON) | `KG` |
| Cubagem | `cubagem_unidade_item` | `comprimento`, `area`, `volume` (CM, M, CM2, M2, ML, LT, M3) | `M3` |

A unidade comercializada governa **5 campos numéricos** do item: `quantidade_inicial`, `quantidade_atual` (saldo), `quantidade_pronta`, `quantidade_transferida`, `quantidade_cancelada`. Os 3 campos `*_unidade_item` governam apenas seus respectivos `*_unitario`/`unitaria`.

**Cubagem aceita 1D/2D/3D** (decisão UX 2026-05-12 do dono do produto). O valor numérico é persistido como digitado — sem conversão entre dimensões, ao contrário do peso (que sempre persiste em KG e converte para a unidade de exibição via fator).

---

## 2. Fonte da Verdade — `cadastros.unidade`

A tabela `cadastros.unidade` (catálogo global, sem `id_organizacao`) é a única fonte de verdade. O produto Pedido **não pode** ter lista hardcoded de unidades em nenhuma camada.

### Hook canônico

`useUnidadesPedido()` em `servicos-global/pedido/client/src/shared/useUnidadesPedido.ts` envelopa `useUnidades()` do `nucleo-global/Modais/modal-tabela-unidades` e expõe 3 listas pré-filtradas + formatadas:

```ts
const { unidadesComercializadas, unidadesPeso, unidadesCubagem, loading, erro } = useUnidadesPedido()
```

- `unidadesComercializadas` — todas as unidades ativas (qualquer categoria) — usado em `DrawerPedido.tsx` no `<select>` da unidade do item
- `unidadesPeso` — apenas `tipo_unidade='peso'` — usado em colunas peso líquido e peso bruto
- `unidadesCubagem` — `tipo_unidade in ['comprimento','area','volume']` — usado em coluna cubagem

Formato dos rótulos: **`SIGLA — Nome`** (decisão UX 2026-05-12, padrão global em todos os dropdowns de unidade Gravity — ver `TabelaVirtualGlobal.unidadesPadrao`).

### Cache

`useUnidades` do nucleo-global usa cache singleton em memória (uma única requisição HTTP por sessão de browser, compartilhada entre todos os componentes). Invalidação manual via `invalidarCacheUnidades()`.

---

## 3. Fluxo de edição inline (PUT /api/v1/pedidos/:id/itens/:item)

### Frontend

`handleEditarFilho` em `Pedidos.tsx`:

```ts
const isUnidade = valor && typeof valor === 'object' && 'unit' in valor && 'quantity' in valor

// Persiste a quantidade (em kg quando peso, ou valor digitado quando outro)
const FATOR_PARA_KG = { 'KG': 1, 'G': 0.001, 'TON': 1000 }
const CAMPOS_PESO_ITEM = new Set(['peso_liquido_unitario', 'peso_bruto_unitario'])

// Persiste a unidade junto:
//   - unidade_comercializada_item para quantidade_*
//   - peso_liquido_unidade_item / peso_bruto_unidade_item para peso
//   - cubagem_unidade_item para cubagem
```

### Backend

`atualizarItemSchema` (`processos-core/routes/pedidos.ts:192`) aceita os 4 campos de unidade:

```ts
unidade_comercializada_item: z.string().optional().nullable(),
peso_liquido_unidade_item:   z.string().min(1).max(8).optional().nullable(),
peso_bruto_unidade_item:     z.string().min(1).max(8).optional().nullable(),
cubagem_unidade_item:        z.string().min(1).max(8).optional().nullable(),
```

`publicToDddItem` mapeia chaves públicas → colunas DDD (sem renomeação aqui — chaves já são DDD).

`mapItem` (linha 250) devolve as 4 unidades no contrato JSON com defaults (`KG`, `KG`, `M3`).

### Validação cruzada (Mandamento 06 + 09)

Antes do `prisma.update`, o handler chama `validarUnidadesItem` (`services/validarUnidadesItem.ts`):

```ts
UNIDADES_CATEGORIAS_VALIDAS = {
  peso_liquido_unidade_item:   ['peso'],
  peso_bruto_unidade_item:     ['peso'],
  cubagem_unidade_item:        ['comprimento', 'area', 'volume'],
  unidade_comercializada_item: [],  // qualquer categoria
}
```

Para cada campo de unidade presente no payload:
1. `buscarUnidadePorCodigo` (do `cadastrosClient`) busca a unidade em `cadastros.unidade`
2. Se não existe → `AppError(400, "Unidade X nao existe em cadastros.unidade")`
3. Se a categoria não bate → `AppError(400, "Unidade X tem categoria Y, mas campo aceita Z")`

Falha alta — Mandamento 08 (sem fallback silencioso). Mensagens incluem `correlation_id` para rastreio.

---

## 4. Render — coluna pai vs coluna filho

### Coluna pai (agregado do pedido)

`peso_liquido_total_pedido`, `peso_bruto_total_pedido`, `cubagem_total_pedido` — sempre exibidos em **kg** (peso) e **m³** (cubagem). Valor armazenado é a soma dos itens já convertida; badge é fixo.

`quantidade_total_pedido` (e variantes pronta/transferida/cancelada) — agregado segue a regra `renderQtdPedido`:
- Se todas as unidades dos itens contribuintes (qty > 0) são iguais → soma + badge
- Se qty=0 em todos → fallback para unidades declaradas (`unidade_comercializada_item`)
- Se divergem → alerta `⚠ Unidades divergentes entre itens` (sem soma)

### Coluna filho (item)

- Peso/cubagem: badge mostra `row.peso_liquido_unidade_item ?? 'KG'` etc.
- Quantidade: badge mostra `row.unidade_comercializada_item ?? 'UN'`

### Editor (popover)

Quando o usuário clica para editar uma célula `tipo: 'unidade'`, o `TabelaVirtualGlobal` abre um popover com:
- Campo numérico
- Dropdown de unidade

A lista do dropdown vem de:
1. Se a coluna passar `unidades: [...]` → essa lista é usada (Pedido faz isso para peso e cubagem via `useUnidadesPedido`)
2. Senão → `unidadesPadrao` = lista completa de `cadastros.unidade`, formatada `SIGLA — Nome`

Formato sempre `SIGLA — Nome` em qualquer cenário — ver `TabelaVirtualGlobal.tsx` (2 cópias: `tabela-virtual-global/` e `tabelas-componentes/tabela-virtual-global/`).

---

## 5. Migration

`servicos-global/pedido/prisma/migrations/20260512000000_pedido_item_unidades_peso_cubagem/migration.sql`:

```sql
ALTER TABLE "pedido_item" ADD COLUMN "peso_liquido_unidade_item" TEXT DEFAULT 'KG';
ALTER TABLE "pedido_item" ADD COLUMN "peso_bruto_unidade_item"   TEXT DEFAULT 'KG';
ALTER TABLE "pedido_item" ADD COLUMN "cubagem_unidade_item"      TEXT DEFAULT 'M3';
```

Defaults populam o histórico (todo registro existente assumia KG/M3). Sem backfill explícito.

Sem FK para `cadastros.unidade` — produtos não fazem FK física pra Cadastros (regra arquitetural). Validação é em runtime via `validarUnidadesItem`.

---

## 6. Testes

| Arquivo | Cobertura |
|---|---|
| `testes/testes-unitarios/pedido/use-unidades-pedido.test.ts` | 7 testes — filtro por categoria + formato `SIGLA — Nome` |
| `testes/testes-unitarios/pedido/validar-unidades-item.test.ts` | 18 testes — validação cruzada (categoria certa/errada, sigla inexistente, ctx correlation_id, no-op, etc.) |

---

## 7. Pontos de atenção (para futuros agentes)

1. **NUNCA hardcoded** lista de unidades no produto. Use `useUnidadesPedido()` ou estenda-o.
2. **Cubagem aceita 1D/2D/3D** — diferente de peso. Não tente converter CM para M3.
3. **Peso é sempre persistido em KG**. Frontend converte para a unidade de exibição via `KG_PARA_UNIDADE` no render. Backend recebe em KG.
4. **Validar no PUT, não confiar só em Zod**. Zod aceita string; runtime cruza com Cadastros.
5. **Editar a unidade comercializada** afeta o badge das 5 colunas de quantidade do item — todas elas leem `unidade_comercializada_item`.
6. **`PATCH /campo`** ainda não aceita campos de unidade (não estão em `CAMPOS_EDITAVEIS_ITEM`) — o front usa apenas PUT para edição que envolve `{unit, quantity}`. Se precisar editar unidade via PATCH inline no futuro, adicionar à whitelist + validação cruzada.

---

## 8. Histórico

- **2026-05-12** — Migration + ACL + mapItem + Zod + hook `useUnidadesPedido` + factory pattern em colunas. Decisão UX: cubagem 1D/2D/3D, formato `SIGLA — Nome` global em todos os dropdowns Gravity.
- **Antes:** unidade de peso/cubagem era ignorada silenciosamente pela ACL (Zod aceitava, mas não persistia). Bug visível: usuário trocava unidade, "salvava", recarregava e voltava ao default.
