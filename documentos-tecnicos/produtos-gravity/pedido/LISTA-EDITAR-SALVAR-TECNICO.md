# Lista de Pedidos — Editar e Salvar (Técnico)

> Implementação da edição inline na Lista: colunas **Nº PEDIDO/ITEM**, **TIPO DE OPERAÇÃO** e **STATUS**.  
> **Regras de negócio:** [`LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md`](./LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md)

**Status:** vigente 2026-06-03

---

## 1. SSOT de comportamento por coluna

| Módulo | Papel |
|--------|--------|
| `pedido/client/src/shared/columnBehaviorConfig.ts` | `editavel` pai/filho; `ALERTA_OVERRIDE` |
| `pedido/shared/columnAlertConfig.ts` | Campos alertáveis; exclusão explícita de `tipo_operacao` |
| `pedido/shared/pedidoDivergencias.ts` | `calcularStatusDivergente`, inferência sem itens carregados |
| `pedido/client/src/pages/Pedidos.tsx` | `handleEditar`, `handleEditarFilho`, `montarContextoPaiItem` |

### Overrides em `columnBehaviorConfig.ts`

```ts
ALERTA_OVERRIDE = {
  tipo_operacao: false,  // sem alerta — replica automática do pedido
  status: true,          // pedido ≠ item ou item ≠ item
}

ITEM_EDITAVEL_OVERRIDE = {
  tipo_operacao: false,  // item travado
  status: true,          // item editável na UI
}
```

### Alertas em `columnAlertConfig.ts`

- `tipo_operacao` **fora** de `CAMPOS_ALERTAVEIS` — comentário documenta exclusão intencional.
- `status` calculado em `pedidoDivergencias.ts` via `_p.status` (não há coluna `status` persistida em `PedidoItem` para divergência na lista).

---

## 2. TIPO DE OPERAÇÃO

### Frontend (`Pedidos.tsx`)

- `handleEditar` — ramo genérico de campos propagáveis força replicação:

```ts
const replicar = campo === 'id_workspace' || campo === 'tipo_operacao'
  ? true
  : (opts?.replicar_em_itens ?? false)
```

- `permiteReplicacaoPaiEmItens` no `TabelaVirtualGlobal` **não** inclui `tipo_operacao` → checkbox oculto no popover.
- `buildMapaColunasFilho` / `mapaColunasFilho`: `tipo_operacao` com `editavel: false` e tooltip de bloqueio no item.
- Após save: `aplicarPropagacaoPedidoNoItem` atualiza `tipo_operacao_item` no cache; `setResetFilhos` se itens já expandidos.

### Backend

- `PATCH /api/v1/pedidos/:id/campo` com `replicar_em_itens: true` (enviado pelo client).
- Par no mapa: `tipo_operacao` → `tipo_operacao_item` (via `mapaPropagacaoPedidoItem` / edição em massa).

### Testes

- EMT: `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/` (passos 06–12).
- Funcional: `F-PROP-09`, `F-EMT-TOP-*` em `editar-salvar-funcional.md`.

---

## 3. STATUS

### Edição no pedido (`handleEditar`, `campo === 'status'`)

1. `pedidoLoteApi.mudarStatusConfirmar([id], novoStatus)` — persiste status do pedido.
2. `replicar = opts?.replicar_em_itens ?? false`.
3. Se `replicar` e cache de itens carregado → atualiza `_p.status` em cada item.
4. Se **não** replicar e pedido tem itens (`pedidoPossuiItensNaLista`):
   - Ghost `status_itens_snapshot` = status anterior dos itens (preserva na expansão).
   - `status_divergente: true` mesmo com cache vazio (`inferirStatusDivergenteSemItensCarregados`).
5. Se cache com itens → `sincronizarItensPedido` → `calcularStatusDivergente`.

### Edição no item (`handleEditarFilho`, `campo === 'status'`)

- Atualiza apenas `_p.status` do item em `itensCarregadosRef`.
- `sincronizarItensPedido` recalcula `status_divergente` no pedido pai.
- **Sem chamada API** para persistir status por item (dívida P0).

### Expansão de filhos (`handleCarregarFilhos` / `montarContextoPaiItem`)

- `resolverStatusEfetivoItemAoCarregar(pedido)` define `_p.status` do item:
  - Se `status_divergente` e existe `status_itens_snapshot` → usa snapshot (itens não «herdam» visualmente o status novo do pedido).
  - Caso contrário → `pedido.status`.

### Tipos ghost (`types.ts`)

```ts
status_divergente?: boolean | null        // virtual list view / recalculado
status_itens_snapshot?: PedidoStatus | null  // ghost UI — não persiste no model Pedido
```

### Funções SSOT (`pedidoDivergencias.ts`)

| Função | Uso |
|--------|-----|
| `lerStatusEfetivoItem` | Lê `_p.status` do item |
| `calcularStatusDivergente` | Com itens no cache; se vazio delega inferência |
| `pedidoPossuiItensNaLista` | `quantidade_total_pedido`, `saldo`, `ncms_distintos_count`, `itens.length` |
| `inferirStatusDivergenteSemItensCarregados` | Alerta no pai sem expandir |
| `resolverStatusEfetivoItemAoCarregar` | Status inicial do item ao expandir |

### UI

- Coluna pai: `renderAgregado` + `status_divergente` em `colunasComUsuario`.
- Coluna filho: badge + `Warning` âmbar se item ≠ pedido ou itens distintos entre si.
- i18n: `pedido.coluna_pai.status_divergente` (pt/en/es).

### Opções de status

- `statusOpts` — `useState` declarado **antes** de `mapaColunasFilho` e `colunasComUsuario` (evita TDZ).
- Sincroniza com `localStorage` `pedido:status_config` no `focus` da janela.

---

## 4. Nº PEDIDO / Part Number

| Coluna | Handler | API |
|--------|---------|-----|
| `numero_pedido` | `handleEditar` | `pedidoApi.atualizar` |
| `part_number` (item) | `handleEditarFilho` | `pedidoItemApi` |

- `marcarPartNumbersDuplicados` + `pedidoTemPartNumberDuplicado` em `sincronizarItensPedido`.
- Flag `part_number_duplicado_no_pedido` na linha pai.

---

## 5. Ordem de declaração no componente `Pedidos`

> Correção 2026-06-03 — erros de runtime «Cannot access X before initialization».

Hooks que **devem** vir antes dos `useMemo` que os referenciam:

1. `statusOpts` / `setStatusOpts`
2. `pedidos` / `setPedidos`
3. `mapaColunasFilho` (depende de `statusOpts`, `pedidos`)
4. `colunasComUsuario` (depende de `statusOpts`, `pedidos`)

---

## 6. Tooltips de coluna na lista

> Framework UX vigente desde **2026-06-07**. Regras por coluna são preenchidas progressivamente pelo dono; a infraestrutura já suporta os dois tipos abaixo.

### Dois tipos de tooltip

| Tipo | Onde | Título | Conteúdo |
|------|------|--------|----------|
| **Linha pedido** | Cabeçalho da coluna + célula da linha pai | `{Nome da coluna} do Pedido` (ex.: Moeda do Pedido) | Pills na ordem canônica (só as que a regra exigir) |
| **Linha item** | Célula da linha filho (pedido expandido) | `{Nome da coluna} do Item` (ex.: Moeda do item) | Subconjunto menor de pills (ver abaixo) |

**Aviso amarelo** (opcional, abaixo das pills): impacto de edição em outras colunas — ex. *«A alteração da moeda irá alterar também Valor Unitário do Item e Valor Total do Pedido/Item»* (`AvisoImpactoEdicao`, classe `.gtv-edit-aviso-impacto`).

### Ordem canônica das pills

**Pedido** (slots 1–7 — omitir os que não se aplicam):

1. Bloqueado para edição  
2. Total do xxx / somatória / sem somatória  
3. Editável no pedido  
4. Aplicar em todos os itens  
5. Editável no item  
6. Alerta se XX divergirem  
7. Depende de importação ou exportação  

**Item:**

1. Bloqueado para edição  
2. Editável no item  
3. Alerta se XX divergirem  

Implementação: `ORDEM_PILLS_PEDIDO`, `ORDEM_PILLS_ITEM` e `ordenarPillsCanonico()` em `pillsTooltipColunaLista.ts`. Máximo **7** pills por bloco (`MAX_PILLS_POR_BLOCO`).

### Camadas de código

| Arquivo | Papel |
|---------|--------|
| `pedido/client/src/shared/TooltipRegrasColuna.tsx` | Shell visual: ícone, cor, pills, `AvisoImpactoEdicao` |
| `pedido/client/src/shared/buildTooltipRegraLista.tsx` | Orquestração: `enriquecerColunaComRegraTooltip`, títulos por nível (`tituloTooltipColuna`, `tituloTooltipCelulaPorColuna`) |
| `pedido/client/src/shared/pillsTooltipColunaLista.ts` | Vocabulário (`RegraPillId`), matriz por coluna, `obterPillsTooltipColuna`, `pillsParaNivelColuna` |
| `pedido/client/src/shared/regrasTooltipColunaLista.ts` | Classificação da regra (`classificarRegraTooltipColuna`, `RegraTooltipId`) |
| `pedido/client/src/components/lista/ColunasPai.tsx` | `enriquecerColunasComRegraTooltip` no catálogo pai; `avisoImpacto` por coluna |
| `nucleo-global/.../tooltipCelulaResolver.ts` | SSOT núcleo: `resolverNivelTooltipCelula`, `resolverTituloTooltipCelula`, `resolverTooltipRegraCelula` |
| `nucleo-global/.../TabelaVirtualGlobal.tsx` | Consome `tooltipCelulaResolver` em `wrapTooltipRegraCelula` |

### Fluxo na tabela

1. `ColunasPai` / `ColunasFilho` definem `key`, `label`, `avisoImpacto` (quando houver).  
2. `enriquecerColunasComRegraTooltip` injeta `tooltipNivelCelula`, `tooltipTituloCelula`, `tooltipDescricaoCelula`, `tooltipTituloItem`.  
3. `tooltipCelulaResolver` no núcleo usa `tooltipNivelCelula` (quando presente) para **título e descrição base** — o flag `isFilho` da renderização é só fallback legado.  
4. Conteúdo renderizado: **pills** → `descricaoExtra` (se houver) → **aviso amarelo** (`avisoImpactoAposPills`).

**SSOT pedido vs item (2026-06-07):**

| Camada | Contrato | Regra |
|--------|----------|-------|
| Pedido | `isLinhaItemLista(row)` em `buildTooltipRegraLista.tsx` | Sinais de item (`_p`, `pedido_id`, `part_number`, `moeda_item`) **antes** de `numero_pedido` |
| Pedido | `tooltipNivelCelula` | Mesmo critério — injetado em colunas dual/piloto |
| Pedido | `tooltipTituloCelula(row)` | Título por linha; **não** recebe `isFilho` |
| Pedido | `tooltipDescricaoCelula(row)` | Pills por linha — mesmo critério que título |
| Núcleo | `tooltipCelulaResolver.ts` | **`isFilhoRender === true` → nível item sempre**; `tooltipNivelCelula` só na linha pai |
| Núcleo | `resolverTituloTooltipCelula` | Linha filha GTV + `tooltipTituloItem` → título de item (antes de qualquer callback) |
| Núcleo | `wrapTooltipRegraCelula` | Rede de segurança: filho com título = `tooltipTitulo` → substitui por `tooltipTituloItem` |
| UI | `TooltipGlobal.titulo` | Único lugar do título — `TooltipRegrasColuna` **não** repete título |

**Anti-padrão:** título «Moeda do Pedido» + pill «Editável no item» — indica dessincronia entre `isFilho` da GTV e nível real da linha; corrigir com `tooltipNivelCelula` + `isLinhaItemLista`.

### i18n

- Pills: `pedido.lista.regras_pill.*`  
- Descrições extras: `pedido.lista.regras_coluna.*`  
- Títulos dedicados (piloto): `pedido.coluna_pai.{campo}_titulo_linha_pedido`, `pedido.coluna_pai.{campo}_titulo` / `*_item_titulo`  
- Demais colunas: migração progressiva para o padrão `{Coluna} do Pedido` / `{Coluna} do Item`

### Colunas já alinhadas ao framework (piloto)

| Coluna | Pedido | Item | Aviso amarelo |
|--------|--------|------|----------------|
| `moeda_pedido` | Editável no pedido → Aplicar em todos → Editável no item | Só Editável no item | Sim (`aviso_impacto_moeda`) |
| `valor_total_pedido` | Bloqueado + soma mesma moeda + alerta moeda (+ editável nos itens no cabeçalho) | Editável nos itens + fórmula | Texto em `regras_coluna` |
| `valor_por_unidade_item` | Bloqueado + sem somatória + alerta (+ editável nos itens no cabeçalho) | Editável nos itens | Sim pedido e item (`valor_unitario_item_impacto_moeda`) |

### Testes

- Unitário: `testes/testes-unitarios/pedido/pills-tooltip-coluna-lista.test.ts` (matriz + ordem canônica)
- Unitário: `testes/testes-unitarios/pedido/tooltip-titulo-celula-lista.test.ts` (`isLinhaItemLista`, títulos piloto)
- Unitário: `testes/testes-unitarios/nucleo/tooltip-celula-resolver.test.ts` (SSOT núcleo: nível + título alinhados)

### Status da migração

- **Infraestrutura:** ✅ ordem canônica, limite 7, títulos por nível no núcleo, aviso amarelo  
- **Matriz legada:** 🟡 demais colunas ainda usam pills anteriores — apenas reordenadas; dono define regra campo a campo em [`LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md`](./LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md)

---

## 7. Dívidas e melhorias

| ID | Descrição | Prioridade |
|----|-----------|------------|
| **P0** | Persistir status editado no item (API + coluna ou contrato `_p`) | Produto pendente |
| **P1** | ✅ Alerta status sem expandir — entregue via `status_itens_snapshot` | Fechado 2026-06-03 |
| — | Testes unitários dedicados `calcularStatusDivergente` / inferência | Recomendado |
| — | Atualizar `status-cascade.test.ts` / `status-sem-espelhamento.test.ts` (regra antiga) | Recomendado |

---

## 8. Histórico

| Data | Alteração |
|------|-----------|
| 2026-06-03 | Doc criado; STATUS 00–04 + TOP 01–05; P1 snapshot; ordem hooks |
| 2026-06 | Runner EMT tipo_operacao: coluna via `data-find-col-key`, poll 15s, case badge |
| 2026-06-07 | Seção 6 — framework tooltips lista (pedido/item, pills, camadas, piloto moeda/valor) |
