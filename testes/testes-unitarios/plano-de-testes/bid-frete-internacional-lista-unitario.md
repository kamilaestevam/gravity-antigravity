# Plano de Testes Unitários — BID Frete Internacional / Lista

**Escopo:** `BIDFRT` — colunas da lista, hierarquia BID, KPIs, cards, exportação  
**Status:** implementado (specs em `testes/testes-unitarios/bid-frete-internacional/lista/`)  
**Data:** 26/05/2026

---

## Arquivos fonte

| Arquivo | Responsabilidade |
|---------|------------------|
| `colunas-lista-bid-frete-internacional.tsx` | Colunas, nomes legíveis, export |
| `lista-bid-frete-internacional-utils.ts` | Hierarquia BID pai/filho |
| `lista-bid-frete-kpi-metrics.ts` | KPIs da lista |
| `lista-bid-frete-card-periodo.ts` | Filtro período cards |
| `lista-bid-frete-card-custom.ts` | Card customizado |

---

## Casos obrigatórios

### Colunas (`colunas-lista-bid-frete-internacional.test.ts`)

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| COL-U01 | `CHAVES_COLUNAS_PADRAO_VISIVEIS` | Não contém `id_cotacao_bid_frete_internacional` |
| COL-U02 | `CHAVES_COLUNAS_COTACAO` | Contém ID para validação de prefs |
| COL-U03 | Coluna ID | `oculta: true` |
| COL-U04 | Export organização | Nome legível |
| COL-U05 | Export usuário | Nome legível |
| COL-U06 | Export workspace | Nome legível |
| COL-U07 | Export produto | Label "BID Frete Internacional" |
| COL-U08 | Fallback workspace | Só usuário logado sem `id_workspace` |
| COL-U09 | `user_dev_default` | Resolve via `nomeUsuarioAtual` |

### Hierarquia (`lista-hierarquia-bid.test.ts`)

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| HIE-U01 | Cotação avulsa | Linha plana |
| HIE-U02 | 2+ mesma referência | Linha BID expandível |
| HIE-U03 | Referência única | Permanece avulsa |
| HIE-U04 | Agregação ids iguais | `id_usuario`, `id_workspace` na linha pai |
| HIE-U05 | Divergência | `usuarios_divergentes`, `workspaces_divergentes` |

### KPIs e cards

| Arquivo | Cobertura |
|---------|-----------|
| `lista-bid-frete-kpi-metrics.test.ts` | Stats, tempo médio, frete aprovado |
| `lista-bid-frete-card-periodo.test.ts` | Filtro período |
| `lista-bid-frete-card-custom.test.ts` | Métrica card custom |

---

## Execução

```bash
npx vitest run --config testes/testes-unitarios/bid-frete-internacional/vitest.config.ts
```
