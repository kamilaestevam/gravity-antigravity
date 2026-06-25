# Plano de Testes Unitários — BID Frete Internacional / Visão Fornecedor

**Escopo:** `BIDFRT-VF` — schemas Zod, mappers, link disparo e-mail  
**Status:** implementado (specs em `testes/testes-unitarios/produto-gravity/bid-frete-internacional/visao-fornecedor/`)  
**Data:** 26/05/2026

---

## Arquivos fonte

| Arquivo | Responsabilidade |
|---------|------------------|
| `visao-fornecedor-bid-frete-internacional-schemas.ts` | Contratos Zod dashboard, propostas, tabelas |
| `motor-bid-disparo-utils.ts` | Link público visão fornecedor no e-mail |

---

## Casos obrigatórios

### Schemas (`visao-fornecedor/visao-fornecedor-schemas.test.ts`)

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| VF-U01 | Dashboard wrapper | Parse `visao_fornecedor_bid_frete_internacional` |
| VF-U02 | Mapper KPIs | `mapDashboardMetricasFromServer` preenche pendentes/propostas |
| VF-U03 | Item tabela CRUD | Parse `tabela_bid_frete_internacional` no POST/PUT |

### Motor disparo (`motor-bid-disparo-utils.test.ts`)

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| VF-U04 | Link resposta | URL contém `visao-fornecedor-bid-frete-internacional/publico/` |

---

## Execução

```bash
npx vitest run --config testes/testes-unitarios/produto-gravity/bid-frete-internacional/vitest.config.ts testes/testes-unitarios/produto-gravity/bid-frete-internacional/visao-fornecedor
```
