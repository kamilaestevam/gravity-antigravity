# Plano de Testes Funcionais — BID Frete Internacional / Visão Fornecedor

**Escopo:** rotas autenticadas `visao-fornecedor-bid-frete-internacional`  
**Status:** implementado (specs em `testes/testes-funcionais/produto-gravity/bid-frete-internacional/visao-fornecedor/`)  
**Data:** 26/05/2026

---

## Rotas cobertas

| Método | Path | Spec |
|--------|------|------|
| GET | `/dashboard` | `visao-fornecedor-routes.test.ts` |
| GET | `/cotacoes-pendentes` | `visao-fornecedor-routes.test.ts` |
| POST | `/tabelas-valor` | `visao-fornecedor-routes.test.ts` |
| PUT | `/tabelas-valor/:id_tabela_bid_frete_internacional` | `visao-fornecedor-routes.test.ts` |
| DELETE | `/tabelas-valor/:id_tabela_bid_frete_internacional` | `visao-fornecedor-routes.test.ts` |

---

## Casos obrigatórios

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| VF-F01 | Dashboard DDD | Wrapper `visao_fornecedor_bid_frete_internacional`; sem `bidRequest` legado |
| VF-F02 | Pendentes | Array `disparos_cotacao_bid_frete_internacional` |
| VF-F03 | Criar tabela | 201 + `tabela_bid_frete_internacional` |
| VF-F04 | Atualizar tabela | 200 + campos DDD `tabela_bid_frete_internacional_*` |
| VF-F05 | Excluir tabela | 200 + delete no Prisma mock |

---

## Execução

```bash
npx vitest run --config testes/testes-funcionais/produto-gravity/bid-frete-internacional/vitest.config.ts testes/testes-funcionais/produto-gravity/bid-frete-internacional/visao-fornecedor
```
