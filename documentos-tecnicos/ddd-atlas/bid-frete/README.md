# Atlas DDD — BID Frete Internacional

> Documentacao DDD completa do produto **BID Frete Internacional** (`bid-frete-internacional`).
> Produto de cotacao e comparacao de fretes internacionais (maritimo, aereo, rodoviario).

---

## Indice

| # | Arquivo | O que mapeia | Linhas |
|---|---|---|---:|
| 1 | [`01-campos.md`](./01-campos.md) | Campos (db/back/front + label de tela) — todos os 11 models | ~205 |
| 2 | [`02-rotas-api.md`](./02-rotas-api.md) | Rotas API (backend Express) | 23 |
| 3 | [`03-models.md`](./03-models.md) | Models Prisma (11 models) | 11 |
| 4 | [`04-enums.md`](./04-enums.md) | Enums (11 enums + valores) | 11 |
| 5 | [`05-glossario-fk.md`](./05-glossario-fk.md) | Glossario canonico de FKs (product_id, user_id, company_id) | 3 |
| 6 | [`06-paginas.md`](./06-paginas.md) | Paginas frontend (client/src/pages) | 6+ |
| 7 | [`07-arquivos.md`](./07-arquivos.md) | Renomeacao de arquivos (kebab-case PT-BR) | 39 |
| 8 | [`08-product-config.md`](./08-product-config.md) | PRODUCT_CONFIG e navegacao | 1 |
| 9 | [`PLANO_REFATORACAO_CODIGO.md`](./PLANO_REFATORACAO_CODIGO.md) | Plano de refatoracao com ordem de execucao | — |

---

## Identidade do Produto

| Atributo | Valor |
|----------|-------|
| Nome canonical | `bid-frete-internacional` |
| Prefixo de tabela PG | `bid_frete_internacional_` |
| Prefixo de model Prisma | `BidFreteInternacional` |
| Prefixo de enum Prisma | `BidFreteInternacional` |
| Porta backend | 8023 |
| fragment.prisma | `servicos-global/produto/bid-frete/prisma/fragment.prisma` |
| PRODUCT_CONFIG | `servicos-global/produto/bid-frete/client/src/shared/config.ts` |

---

## Regras DDD Aplicadas

Este atlas segue as 13 regras da skill [`ddd-nomenclatura`](../../../skills/governanca/lei/ddd-nomenclatura/SKILL.md):

| Regra | Resumo | Aplicacao neste produto |
|-------|--------|------------------------|
| 01 | Campo generico recebe sufixo da entidade | `status` → `status_cotacao_bid_frete_internacional` |
| 02 | PT-BR, sem acentos | `descricao_mercadoria`, `quantidade`, `observacoes` |
| 03 | Audit: `id_<entidade>`, `data_criacao_<entidade>`, `data_atualizacao_<entidade>` | Aplicado em todos os 11 models |
| 04 | FK: `id_<entidade_alvo>` (prefixo, nao sufixo) | `id_fornecedor`, `id_cotacao`, nao `fornecedor_id` |
| 05 | Boolean sem `is_` — adjetivo PT-BR | `anonima`, `ativa`, `aceita_cotacao_aberta` |
| 06 | Relations plural PT-BR snake_case | `propostas`, `avaliacoes`, `tabelas_valor` |
| 07 | Enum PascalCase PT-BR, valores UPPER_SNAKE | `BidFreteInternacionalStatusCotacao` |
| 08 | Colecoes plural PT-BR | `cotacoes`, `fornecedores`, `taxas` |
| 09 | Consistencia cross-layer (db = back = front) | Nome unico em todas as camadas |
| 10 | Model PascalCase + `@@map("snake_case")` | `BidFreteInternacionalCotacao` + `@@map("bid_frete_internacional_cotacoes")` |
| 11 | Proibido `@map` de coluna | Colunas ja em snake_case DDD |
| 12 | Enum `@@map` obrigatorio | `@@map("bid_frete_internacional_status_cotacao")` |
| 13 | Arquivos kebab-case PT-BR | `cotacoes-lista.tsx`, `fornecedor-detalhe.tsx` |

---

## Decisoes do Dono (Owner Decisions)

Decisoes tomadas durante a sessao DDD de 2026-05-20:

1. **`preco` → `valor`**: Todo campo/model/enum com "preco" foi renomeado para "valor" (ex: `TabelaPreco` → `TabelaValor`)
2. **`DetalheTaxa` → `Taxa`**: Removido "detalhe", simplificado para `BidFreteInternacionalTaxa`
3. **`valor_alvo` → `valor_meta`**: Campos target/alvo renomeados para meta
4. **`cep` → `zipcode`**: CEP nao e universal, zipcode e o padrao internacional
5. **`id_pedido_cotacao` → `id_pedido_bid_cotacao`**: FK com prefixo completo
6. **`product_id` → `id_produto_gravity`**: FK canonical do Configurador
7. **`company_id` → `id_workspace`**: FK canonical do Configurador
8. **`user_id` → `id_usuario`**: FK canonical do Configurador
9. **Status unificado**: Padrao `BidFreteInternacionalStatus<Entidade>` para todos os enums de status
