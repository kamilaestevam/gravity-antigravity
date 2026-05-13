# Pedido — Incoterm (Técnico)

> SSOT: `cadastros.incoterm` (banco do serviço Cadastros).
> Esta página documenta como o produto Pedido consome Incoterms, valida cruzado contra Cadastros e renderiza o select com formato `SIGLA — Nome`.

---

## 1. Visão de alto nível

Cada **Pedido** tem `incoterm_pedido` (campo do pai) e cada **PedidoItem** tem `incoterm` (campo do filho). Ambos validam contra `cadastros.incoterm` (lista canônica Incoterms 2020 da ICC). Se itens divergem do pedido pai, o pai mostra alerta `⚠ Incoterms divergentes entre itens`.

| Onde | Coluna no banco | Onde edita | Validação |
|---|---|---|---|
| Pedido | `incoterm_pedido` | PUT `/api/v1/pedidos/:id` | `validarIncotermPedidoItem` |
| Item | `incoterm_item` | PUT `/api/v1/pedidos/:id/itens/:item` | `validarIncotermPedidoItem` |

---

## 2. Fonte da Verdade — `cadastros.incoterm`

Tabela `incoterm` em `gravity-cadastros-*` (catálogo global, sem `id_organizacao`):

```prisma
model Incoterm {
  codigo_incoterm    String  @id   // FOB, CIF, EXW, ...
  nome_incoterm      String
  descricao_incoterm String?
  modal_transporte   String        // "maritimo" | "qualquer"
  versao_incoterm    String  @default("2020")
  ativo_incoterm     Boolean @default(true)
  @@map("incoterm")
}
```

### Seed

`servicos-global/cadastros/prisma/data/incoterms-canonicos.ts` — 11 termos do Incoterms 2020:
- Marítimos (`modal_transporte = 'maritimo'`): FAS, FOB, CFR, CIF
- Multimodais (`modal_transporte = 'qualquer'`): EXW, FCA, CPT, CIP, DAP, DPU, DDP

Aplicar/atualizar via:
```bash
DATABASE_URL=<url_cadastros> npx tsx servicos-global/cadastros/prisma/seed-incoterms.ts
```

### Versões futuras

Quando a ICC publicar Incoterms 2030, **NÃO** sobrescrever as linhas existentes. Adicionar novas linhas com `versao_incoterm = '2030'` e manter as 2020 ativas — pedidos históricos podem continuar referenciando as antigas.

---

## 3. API REST (Cadastros)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/cadastros/incoterms` | Lista todos. Query: `apenas_ativos`, `modal_transporte` |
| GET | `/api/v1/cadastros/incoterms/:codigo` | Busca por sigla |
| POST | `/api/v1/cadastros/incoterms` | Cria (admin) |
| PUT | `/api/v1/cadastros/incoterms/:codigo` | Atualiza (admin) |
| DELETE | `/api/v1/cadastros/incoterms/:codigo` | Soft delete (ativo_incoterm = false) |

Autenticação: header `x-internal-key`.

---

## 4. Frontend — hook canônico

### nucleo-global

`@nucleo/modal-tabela-incoterm` expõe `useIncoterms()`:

```ts
const { incoterms, loading, erro, recarregar } = useIncoterms()
```

Cache singleton em memória + Zod parse + ordenação canônica (marítimos primeiro, depois multimodal; dentro de cada grupo, alfabético).

### produto Pedido

`pedido/client/src/shared/useIncotermsPedido.ts` envelopa `useIncoterms()` e formata como `SIGLA — Nome`:

```ts
const { incotermsOpcoes, incotermsMaritimos, incotermsMultimodais } = useIncotermsPedido()

// incotermsOpcoes[0] = { valor: 'FOB', label: 'FOB — Free On Board' }
```

---

## 5. Backend Pedido — validação cruzada

`processos-core/services/validarIncotermPedidoItem.ts` valida ambos `incoterm` (PedidoItem) e `incoterm_pedido` (Pedido) contra Cadastros antes do update:

```ts
await validarIncotermPedidoItem(payload, ctxCadastros)
```

Falha alta (HTTP 400) — Mandamento 08:
- Sigla inexistente → `Incoterm "XYZ" nao existe em cadastros.incoterm`
- Sigla inativa → `Incoterm "OLD" esta inativo em cadastros.incoterm`

Chamado em:
- `PUT /api/v1/pedidos/:id` (linha ~1324 de `routes/pedidos.ts`)
- `PUT /api/v1/pedidos/:id/itens/:item` (linha ~2078)

---

## 6. UI — coluna pai + filho

### Coluna pai (Pedido) — `ColunasPai.tsx:396`

```ts
{
  key: 'incoterm',
  tipo: 'select',
  opcoes: incotermsOpcoes,
  editavel: getEditavel('incoterm'),
  render: (_val, row) => renderAgregado(
    row.incoterm,
    row.incoterm_divergente,
    'Incoterms divergentes entre itens'
  ),
}
```

`incoterm_divergente` é populado por `calcularDivergencias` em `Pedidos.tsx` (campo está em `CAMPOS_ALERTAVEIS`). Quando os itens têm Incoterms diferentes do pedido pai → alerta visual à direita.

### Coluna filho (PedidoItem) — `ColunasFilho.tsx`

Filho herda `tipo: 'select'` e `opcoes` da coluna pai automaticamente via `MAPA_COLUNAS_FILHO`. Não precisa duplicar a definição.

### Permissão de edição

`getEditavel('incoterm')` lê do `columnBehaviorConfig.ts` → permite editar apenas se o usuário tiver permissão (Mandamento 01).

---

## 7. Migrations e aplicação

Migration: `cadastros/prisma/migrations/20260513000000_add_incoterm_table/migration.sql`

Script de aplicação ad-hoc (3 ambientes):
```bash
DATABASE_URL=<url> node scripts/sob-demanda/aplicar-migration-cadastros-incoterm.mjs
```

---

## 8. Testes

| Arquivo | Cobertura |
|---|---|
| `cadastros/__tests__/functional/incoterms.test.ts` | CRUD + filtro modal + validação enum |
| `testes/testes-unitarios/pedido/validar-incoterm.test.ts` | 10 testes — validação cruzada Pedido/Item |

---

## 9. Pontos de atenção (futuros agentes)

1. **NÃO hardcoded** lista de Incoterms no produto. Use `useIncotermsPedido()` ou estenda-o.
2. **Versionamento:** quando a ICC publicar nova versão, adicionar linhas com `versao_incoterm = 'YYYY'`. Não sobrescrever as antigas.
3. **Modal de transporte** está disponível para filtrar dropdowns contextualmente (`useIncotermsPedido().incotermsMaritimos`) — útil em flows que aceitam só FOB/CIF/CFR/FAS.
4. **`smartImportService.ts:797`** ainda tem lista local de cache para heurística de detecção. SSOT continua sendo Cadastros — flag para refatorar com lazy-load cacheado se a lista mudar.
5. **`seed.ts` / `auditarSeed.ts`** mantêm a lista hardcoded — são scripts internos de dev/teste, não runtime do produto. OK manter.

---

## 10. Histórico

- **2026-05-13** — Criação da tabela `cadastros.incoterm` + migration + 11 incoterms canônicos. Hook `useIncoterms()` em nucleo-global + `useIncotermsPedido()` no produto. Coluna `incoterm` migrada de `tipo: 'texto'` para `tipo: 'select'`. Validação cruzada nas rotas PUT do Pedido e PUT do Item. Deletadas 5 cópias hardcoded (kind-ui-pedido.ts, ModalPedidoNovo.tsx, CampoSmartImport.tsx; mantidas em seed.ts/auditarSeed.ts).
