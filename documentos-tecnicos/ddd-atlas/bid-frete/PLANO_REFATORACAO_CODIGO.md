# Plano de Refatoracao DDD — BID Frete Internacional

> Ordem de execucao para aplicar todos os renames DDD no codigo.
> Cada fase e atomica — pode ser commitada separadamente.
> Seguir estritamente: Mandamento 07 (renomear front+back+banco juntos).

---

## Pre-requisitos

- [ ] Planilha DDD atualizada com todos os nomes finais deste atlas
- [ ] Atlas regenerado pelo script `gerar-atlas-ddd.py`
- [ ] Backup do banco de dev (skill backup-policy: RPO 24h, backup pre-migration)
- [ ] Nenhuma PR aberta tocando os mesmos arquivos

---

## Fase 1 — Enums (11 renames)

**Risco: BAIXO** — enums sao usados como tipos, rename e refactor seguro.

| # | De | Para | @@map |
|---|---|---|---|
| 1 | BidFreteTipoOperacao | BidFreteInternacionalTipoOperacao | `bid_frete_internacional_tipo_operacao` |
| 2 | BidFreteModalidade | BidFreteInternacionalModalidade | `bid_frete_internacional_modalidade` |
| 3 | BidFreteCargaModalidade | BidFreteInternacionalModalidadeCarga | `bid_frete_internacional_modalidade_carga` |
| 4 | BidFreteCotacaoStatus | BidFreteInternacionalStatusCotacao | `bid_frete_internacional_status_cotacao` |
| 5 | BidFreteCotacaoFreteIntCanal | BidFreteInternacionalCanalDisparo | `bid_frete_internacional_canal_disparo` |
| 6 | BidFreteCotacao | BidFreteInternacionalStatusPedidoCotacao | `bid_frete_internacional_status_pedido_cotacao` |
| 7 | BidFretePropostaStatus | BidFreteInternacionalStatusProposta | `bid_frete_internacional_status_proposta` |
| 8 | BidFreteTipoFornecedor | BidFreteInternacionalTipoFornecedor | `bid_frete_internacional_tipo_fornecedor` |
| 9 | BidFreteStatusFornecedor | BidFreteInternacionalStatusFornecedor | `bid_frete_internacional_status_fornecedor` |
| 10 | BidFreteCotacaoVisibilidade | BidFreteInternacionalVisibilidade | `bid_frete_internacional_visibilidade` |
| 11 | BidFreteIntegracao | BidFreteInternacionalTipoIntegracao | `bid_frete_internacional_tipo_integracao` |

**Checklist Fase 1:**
- [ ] Renomear no fragment.prisma (adicionar @@map)
- [ ] Grep e substituir em todos os .ts/.tsx do client
- [ ] Grep e substituir no server
- [ ] Rodar testes
- [ ] Commit: `refactor(bid-frete): fase 1 — rename DDD de 11 enums`

---

## Fase 2 — Models (11 renames + @@map)

**Risco: MEDIO** — requer migration SQL `ALTER TABLE ... RENAME TO ...`

| # | De | Para | @@map atual | @@map DDD |
|---|---|---|---|---|
| 1 | FreteIntBidFornecedores | BidFreteInternacionalFornecedor | `bid_fornecedores` | `bid_frete_internacional_fornecedores` |
| 2 | FreteIntBidCotacoes | BidFreteInternacionalCotacao | `bid_cotacoes` | `bid_frete_internacional_cotacoes` |
| 3 | FreteIntBidPedidoCotacoes | BidFreteInternacionalPedidoCotacao | `bid_requests` | `bid_frete_internacional_pedidos_cotacao` |
| 4 | FreteIntBidPropostas | BidFreteInternacionalProposta | `bid_responses` | `bid_frete_internacional_propostas` |
| 5 | FreteIntBidPropostasTaxasCambio | BidFreteInternacionalTaxa | `bid_detalhe_taxas` | `bid_frete_internacional_taxas` |
| 6 | FreteIntBidTabelasProntas | BidFreteInternacionalTabelaValor | `bid_tabelas_preco` | `bid_frete_internacional_tabelas_valor` |
| 7 | FreteIntBidFornecedoresAvaliacoes | BidFreteInternacionalAvaliacao | `bid_avaliacoes` | `bid_frete_internacional_avaliacoes` |
| 8 | FreteIntBidClassificacaoFornecedores | BidFreteInternacionalClassificacao | `bid_rating_fornecedor_global` | `bid_frete_internacional_classificacoes` |
| 9 | FreteIntBidGanhoEstimado | BidFreteInternacionalGanho | `bid_savings` | `bid_frete_internacional_ganhos` |
| 10 | FreteIntBidIntegracoes | BidFreteInternacionalIntegracao | `bid_connector_configs` | `bid_frete_internacional_integracoes` |
| 11 | FreteIntBidPortosCadastro | BidFreteInternacionalPorto | `bid_portos` | `bid_frete_internacional_portos` |

**Checklist Fase 2:**
- [ ] Gerar SQL de rename de tabelas (por schema de cada org)
- [ ] Aplicar @@map novo no fragment.prisma
- [ ] Renomear model names no fragment.prisma
- [ ] Grep e substituir em todos os .ts/.tsx
- [ ] Executar migration em dev
- [ ] Rodar testes
- [ ] Commit: `refactor(bid-frete): fase 2 — rename DDD de 11 models + migration`

---

## Fase 3 — Campos (FKs canonicas: product_id, user_id, company_id)

**Risco: ALTO** — campos usados em indices, queries, e cross-servico.

| Campo legado | Campo DDD | Afeta models |
|---|---|---|
| `product_id` | `id_produto_gravity` | 8 models |
| `user_id` | `id_usuario` | 8 models |
| `company_id` | `id_workspace` | 2 models (Cotacao, Ganho) |

**Checklist Fase 3:**
- [ ] Gerar SQL `ALTER TABLE ... RENAME COLUMN ...` (por schema)
- [ ] Atualizar fragment.prisma
- [ ] Atualizar todos os indices que referenciam esses campos
- [ ] Grep e substituir em server (queries, services, routes)
- [ ] Grep e substituir em client (types, api, components)
- [ ] Atualizar schemas Zod (Mandamento 09)
- [ ] Rodar testes
- [ ] Commit: `refactor(bid-frete): fase 3 — rename FKs canonicas (product_id, user_id, company_id)`

---

## Fase 4 — Campos (FKs internas)

**Risco: ALTO** — campos com @relation, @unique, indices.

| Campo legado | Campo DDD | Model |
|---|---|---|
| `cotacao_id` | `id_cotacao_bid_frete_internacional` | PedidoCotacao, Proposta, Avaliacao, Ganho |
| `fornecedor_id` | `id_fornecedor_bid_frete_internacional` | PedidoCotacao, Proposta, TabelaValor, Avaliacao, Integracao |
| `bid_request_id` | `id_pedido_bid_cotacao_bid_frete_internacional` | Proposta |
| `response_id` | `id_proposta_bid_frete_internacional` | Taxa |
| `fornecedor_vencedor_id` | `id_fornecedor_vencedor_cotacao_bid_frete_internacional` | Cotacao |

**Checklist Fase 4:**
- [ ] Gerar SQL de rename de colunas
- [ ] Atualizar @relation fields no fragment.prisma
- [ ] Atualizar indices
- [ ] Grep e substituir em server e client
- [ ] Atualizar schemas Zod
- [ ] Rodar testes
- [ ] Commit: `refactor(bid-frete): fase 4 — rename FKs internas`

---

## Fase 5 — Campos de dominio (todos os demais)

**Risco: MEDIO** — muitos campos, mas sem impacto em relacoes.

Aplicar REGRA 01 (sufixo entidade) + REGRA 02 (PT-BR) + REGRA 05 (boolean sem is_) em todos os campos restantes conforme `01-campos.md`.

Campos agrupados por tipo de mudanca:
- **Sufixo de entidade**: `nome` → `nome_fornecedor_bid_frete_internacional`, `status` → `status_cotacao_bid_frete_internacional`, etc.
- **EN → PT-BR**: `ranking_preco` → `ranking_valor_proposta_bid_frete_internacional`
- **Boolean (REGRA 05)**: `ocultar_nome_empresa` → `anonima_cotacao_bid_frete_internacional`
- **Target → Meta**: `valor_target` → `valor_meta_cotacao_bid_frete_internacional`
- **CEP → Zipcode**: `zip_code_origem` → `zipcode_origem_cotacao_bid_frete_internacional`

**Checklist Fase 5:**
- [ ] Gerar SQL de rename de colunas (batch por model)
- [ ] Atualizar fragment.prisma
- [ ] Grep e substituir em server e client
- [ ] Atualizar schemas Zod e types.ts
- [ ] Atualizar labels de UI (i18n)
- [ ] Rodar testes
- [ ] Commit: `refactor(bid-frete): fase 5 — rename campos de dominio`

---

## Fase 6 — Relations (REGRA 06)

**Risco: BAIXO** — nomes de relacao sao logicos (Prisma), nao geram coluna no banco.

| Relacao atual | Relacao DDD | Model |
|---|---|---|
| `tabelas_preco` | `tabelas_valor` | Fornecedor |
| `bid_requests` | `pedidos_cotacao` | Fornecedor, Cotacao |
| `bid_responses` | `propostas` | Fornecedor, Cotacao |
| `avaliacoes` | `avaliacoes` | Fornecedor (sem mudanca) |
| `connectors` | `integracoes` | Fornecedor |
| `response` | `proposta` | PedidoCotacao |
| `cotacao` | `cotacao` | PedidoCotacao, Proposta (sem mudanca) |
| `fornecedor` | `fornecedor` | PedidoCotacao, Proposta, TabelaValor, Avaliacao, Integracao (sem mudanca) |
| `bid_request` | `pedido_cotacao` | Proposta |
| `detalhes_taxas` | `taxas` | Proposta |

**Checklist Fase 6:**
- [ ] Renomear no fragment.prisma
- [ ] Grep e substituir em server (includes, selects)
- [ ] Grep e substituir em client (se usado em tipos)
- [ ] Rodar testes
- [ ] Commit: `refactor(bid-frete): fase 6 — rename relations DDD`

---

## Fase 7 — Rotas API

**Risco: ALTO** — breaking change para consumidores.

Renomear todas as 23+ rotas conforme `02-rotas-api.md`:
- Prefixo: `/api/v1/bid-frete/` → `/api/v1/bid-frete-internacional/`
- Parametros: `:id` → `:id_cotacao`, `:id_fornecedor`
- Recursos: `bids` → `pedidos-cotacao`, `master-data` → `dados-mestre`
- Portal: `public` → `publico`, `respostas` → `propostas`

**Checklist Fase 7:**
- [ ] Atualizar rotas no server Express
- [ ] Atualizar client api.ts (API_BASE e todos os endpoints)
- [ ] Atualizar PRODUCT_CONFIG (id, productId, name)
- [ ] Atualizar schemas Zod de request/response
- [ ] Rodar testes
- [ ] Commit: `refactor(bid-frete): fase 7 — rename rotas API + PRODUCT_CONFIG`

---

## Fase 8 — Arquivos (REGRA 13)

**Risco: BAIXO** — rename de arquivo, sem impacto funcional (atualizar imports).

Renomear todos os arquivos conforme `07-arquivos.md`:
- Pages: PascalCase → kebab-case PT-BR
- Components: PascalCase → kebab-case PT-BR
- Services: camelCase EN → kebab-case PT-BR
- Routes: camelCase EN → kebab-case PT-BR

**Checklist Fase 8:**
- [ ] `git mv` de cada arquivo
- [ ] Atualizar imports em todos os arquivos que referenciam
- [ ] Atualizar Router (lazy imports em main.tsx)
- [ ] Rodar testes
- [ ] Commit: `refactor(bid-frete): fase 8 — rename arquivos kebab-case PT-BR`

---

## Fase 9 — Pasta raiz do produto

**Risco: MEDIO** — afeta monorepo (package.json, tsconfig paths, vite config).

- [ ] Renomear `servicos-global/produto/bid-frete/` → `servicos-global/produto/bid-frete-internacional/`
- [ ] Atualizar `package.json` (name, scripts)
- [ ] Atualizar `tsconfig.json` (paths)
- [ ] Atualizar `vite.config.ts`
- [ ] Atualizar contracts.json (service registry)
- [ ] Atualizar imports em servicos que referenciam bid-frete
- [ ] Rodar testes
- [ ] Commit: `refactor(bid-frete): fase 9 — rename pasta raiz para bid-frete-internacional`

---

## Resumo de Risco

| Fase | Risco | Motivo |
|---|---|---|
| 1 — Enums | BAIXO | Refactor de tipos, sem impacto em banco |
| 2 — Models | MEDIO | Requer ALTER TABLE RENAME |
| 3 — FKs canonicas | ALTO | Campos em indices, queries, cross-servico |
| 4 — FKs internas | ALTO | @relation, @unique, indices |
| 5 — Campos dominio | MEDIO | Volume grande, mas sem relacoes |
| 6 — Relations | BAIXO | Logico, sem coluna no banco |
| 7 — Rotas API | ALTO | Breaking change para consumidores |
| 8 — Arquivos | BAIXO | Rename + imports |
| 9 — Pasta raiz | MEDIO | Monorepo config |

**Ordem recomendada:** 1 → 2 → 6 → 3 → 4 → 5 → 8 → 7 → 9

> Enums e relations primeiro (baixo risco), depois campos (alto risco com mais contexto), depois arquivos e rotas (visible changes por ultimo).
