# Lista — Ações em lote (expandir, seleção, duplicar, excluir)

> **Status:** Implementado (PR #289 + #294)  
> **Data:** 2026-06-12  
> **Paridade UX:** Lista de Pedidos (`Pedidos.tsx` / `BarraAcoesPedido`)

---

## 1. Escopo

Quatro capacidades na visão **Lista** (`lista-bid-frete-internacional.tsx`), via `TabelaVirtualGlobal`:

| # | Ação | Onde | Backend |
|---|------|------|---------|
| 1 | Expandir / Recolher todos | Toolbar (ícone `CaretDoubleDown` / `CaretDoubleUp`) | — (client via `imperativeRef`) |
| 2 | Seleção BID ou cotação | Checkbox pai + filhas | — |
| 3 | Duplicar | Toolbar (ícone `StackPlus` + tooltip) | `POST .../duplicacoes` |
| 4 | Excluir | Toolbar (ícone `Trash` vermelho + tooltip) + modal preview | `POST .../exclusoes/preview` + `confirmar` |

**Propostas** (3º nível, filhas de cotação avulsa) **não são selecionáveis** — checkbox oculto via classe `bf-linha-filha-proposta`.

---

## 2. Frontend

### Arquivos

| Arquivo | Papel |
|---------|-------|
| `client/src/pages/lista-bid-frete-internacional.tsx` | Toolbar, seleção, handlers duplicar/excluir |
| `client/src/pages/modal-excluir-lista-bid-frete-internacional.tsx` | Modal exclusão com preview permitidos × bloqueados |
| `client/src/pages/lista-bid-frete-internacional-utils.ts` | Hierarquia BID → cotações → propostas |
| `client/src/shared/api.ts` | `duplicacoesBidFreteApi`, `exclusoesBidFreteApi` + schemas Zod |

### Seleção

- **Pai:** BID (grupo) ou cotação avulsa — `onSelecaoMudar`
- **Filhas:** cotações dentro de BID expandido — `selecionavelFilhos` + `onSelecaoFilho`
- **Deduplicação:** se o BID inteiro está selecionado, cotações filhas selecionadas separadamente não entram duas vezes nas ações em lote (`cotacoesSelecionadasParaAcao`)

### Toolbar — paridade Pedido (PR #294)

- Duplicar: `BotaoGlobal` `secundario` `pequeno`, **só ícone** `StackPlus`, `TooltipGlobal` com contagem
- Excluir: `BotaoGlobal` **`perigo`** `pequeno`, **só ícone** `Trash`, `TooltipGlobal` com contagem
- Sem rótulo visível na barra (diferente do rascunho inicial com texto "Duplicar (N)")

---

## 3. API — Duplicações (sub-recurso substantivado, precedente Pedido)

Prefixo base: `/api/v1/bid-frete-internacional`

| Método | Rota | Arquivo | Descrição |
|--------|------|---------|-----------|
| POST | `/cotacoes/duplicacoes` | `duplicacoes-bid-frete-internacional.ts` | Duplica cotações (avulsa continua avulsa; filha permanece no mesmo BID) |
| POST | `/bids-frete-internacional/duplicacoes` | idem | Duplica BID + **todas** as cotações filhas |

**Body:** `{ ids: string[] }` (1–100 itens)

**Regras da cópia:**

- Status → `RASCUNHO`
- Número novo (`gerarNumeroCotacao` / `gerarNumeroBidFreteInternacional`)
- Zera: datas de aprovação/cancelamento, vencedor, ganhos, prazo de resposta
- **Não** copia propostas nem disparos
- `id_usuario` → quem duplicou
- Após duplicar filhas de BID: `sincronizarResumoBid`

---

## 4. API — Exclusões (preview + confirmar)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/cotacoes/exclusoes/preview` | Classifica permitidas × bloqueadas |
| POST | `/cotacoes/exclusoes/confirmar` | Exclui permitidas (revalida no confirmar) |
| POST | `/bids-frete-internacional/exclusoes/preview` | BID só permitido se **todas** as filhas forem excluíveis |
| POST | `/bids-frete-internacional/exclusoes/confirmar` | Transaction: exclui filhas + BID |

Arquivo: `exclusoes-bid-frete-internacional.ts`

### Regra de bloqueio (exclusão definitiva)

Exportada para teste: `motivoBloqueioExclusaoCotacao`

| Condição | Motivo | Exclusível? |
|----------|--------|-------------|
| Tem propostas (`_count.propostas > 0`) | `COM_PROPOSTAS` | Não |
| Status ≠ `RASCUNHO` e tem disparos | `ENVIADA_FORNECEDOR` | Não |
| `RASCUNHO` sem propostas | — | Sim |
| Nunca enviada (sem disparos) e sem propostas | — | Sim |

Itens bloqueados devem ser **cancelados**, não excluídos. O modal lista bloqueados com motivo antes de confirmar.

**Cascade:** disparos caem com a cotação (`onDelete: Cascade`). BID excluído remove filhas explicitamente antes do BID (FK cotação→BID é `SetNull`).

---

## 5. Montagem no servidor

`server/src/index.ts` — rotas de lote **antes** dos CRUDs (paths fixos têm precedência sobre `/:id`):

```ts
app.use('/api/v1/bid-frete-internacional', duplicacoesBidFreteInternacionalRouter)
app.use('/api/v1/bid-frete-internacional', exclusoesBidFreteInternacionalRouter)
```

---

## 6. Testes

| Tipo | Arquivo |
|------|---------|
| Funcional (13) | `testes/testes-funcionais/bid-frete-internacional/lista/duplicacoes-exclusoes-routes.test.ts` |
| Unitário (6) | `testes/testes-unitarios/bid-frete-internacional/lista/exclusao-regra-bloqueio-bid-frete-internacional.test.ts` |

> Plano completo da tela (UNI/FUN/E2E/EMT) será fechado quando a lista estiver finalizada — estes testes cobrem apenas duplicação/exclusão em lote.

---

## 7. Referências

- Precedente Pedido: `duplicacoes-pedido.ts`, `exclusoes-pedido.ts`
- PR #289 — feature completa (backend + frontend + testes)
- PR #294 — layout toolbar (ícones iguais Pedido)
