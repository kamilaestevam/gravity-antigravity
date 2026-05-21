# Atlas DDD — BID Frete Internacional — Aba 5: Glossario Canonico de FKs

> Mapeamento canonico de todas as FKs usadas no produto BID Frete Internacional.
> Regras aplicadas: REGRA 04 (FK com prefixo `id_<entidade_alvo>`), Mandamento 01 (Clerk = auth only).

## Como ler

- **FK atual (legado)**: nome do campo como esta hoje no fragment.prisma (ingles, sufixo `_id`).
- **FK DDD**: nome canonical conforme DDD do Gravity (snake_case PT-BR).
- **Fonte da verdade**: model e campo que e a referencia autoritativa.
- **Descricao**: significado, contexto e restricoes.

---

## FKs externas (cross-schema — Configurador)

| FK atual (legado) | FK DDD | Fonte da verdade | Descricao |
|---|---|---|---|
| `product_id` | `id_produto_gravity` | Configurador → ProdutoGravity.id_produto_gravity (CUID) | Identificador do produto Gravity. No BID Frete Internacional sera sempre `"bid-frete-internacional"`. FK soft (sem @relation — referencia cross-schema). |
| `user_id` | `id_usuario` | Configurador → Usuario.id_usuario (CUID) | Identificador interno do usuario no Gravity. NAO e o `clerk_user_id` (UUID do Clerk) — e o CUID interno. FK soft (cross-schema). |
| `company_id` | `id_workspace` | Configurador → Workspace.id_workspace (CUID) | Identificador do workspace/filial. Usado para segregar cotacoes por filial dentro da mesma organizacao. FK soft (cross-schema). |
| `clerk_user_id` | `id_clerk_usuario` | Clerk (externo) | ID do Clerk para login. Campo tecnico de integracao — presente em `FreteIntBidFornecedores` para vincular fornecedor com conta Clerk. NAO usar para permissoes (ver Mandamento 01). |

## FKs internas (dentro do produto)

| FK atual (legado) | FK DDD | Fonte da verdade | Descricao |
|---|---|---|---|
| `fornecedor_id` | `id_fornecedor_bid_frete_internacional` | BidFreteInternacionalFornecedor | FK interna do produto. Referencia o fornecedor cadastrado no BID Frete Internacional. |
| `cotacao_id` | `id_cotacao_bid_frete_internacional` | BidFreteInternacionalCotacao | FK interna do produto. Referencia a cotacao (processo de licitacao de frete). |
| `bid_request_id` | `id_pedido_bid_cotacao_bid_frete_internacional` | BidFreteInternacionalPedidoCotacao | FK interna do produto. Referencia o pedido de cotacao enviado ao fornecedor. Decisao do dono sobre nomenclatura. |
| `response_id` | `id_proposta_bid_frete_internacional` | BidFreteInternacionalProposta | FK interna do produto. Referencia a proposta recebida de um fornecedor. |
| `fornecedor_vencedor_id` | `id_fornecedor_vencedor_cotacao_bid_frete_internacional` | BidFreteInternacionalFornecedor (vencedor) | FK interna. Referencia o fornecedor que venceu a cotacao. Mesmo model que `id_fornecedor_bid_frete_internacional`, alias semantico. |

---

## Nota sobre Mandamento 01 — Isolamento Total do Clerk

Conforme o Mandamento 01 dos 9 Mandamentos do Gravity:

> O Clerk serve **apenas** para autenticacao (login, senha, e-mail, `clerk_user_id`) e nada mais.

O campo `id_clerk_usuario` (mapeado de `clerk_user_id`) NAO deve ser usado para:
- Determinar permissoes ou patentes (`tipo_usuario`, `tipo_usuario_workspace`)
- Controlar acesso a funcionalidades
- Filtrar dados por nivel de autorizacao

A **fonte da verdade** para permissoes e sempre o banco de dados do Configurador via Prisma. O `id_clerk_usuario` existe apenas para vincular a identidade de login com o registro interno do usuario.
