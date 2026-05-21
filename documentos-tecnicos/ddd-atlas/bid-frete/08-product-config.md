# Atlas DDD — BID Frete Internacional — Aba 8: PRODUCT_CONFIG

> Mapeamento DDD do PRODUCT_CONFIG, navegacao e servicos do produto.
> Arquivo: `servicos-global/produto/bid-frete/client/src/shared/config.ts`

## Config atual vs DDD

| Campo | Valor atual (legado) | Valor DDD | Observacao |
|---|---|---|---|
| `id` | `'bid-frete'` | `'bid-frete-internacional'` | Identificador unico do produto |
| `productId` | `'bid-frete'` | `'bid-frete-internacional'` | Mesmo que `id` — usado em contracts.json |
| `name` | `'BID Frete'` | `'BID Frete Internacional'` | Nome de exibicao na UI |
| `port` | `8023` | `8023` | Sem mudanca |

## Navegacao — URLs

| URL atual | URL DDD | Observacao |
|---|---|---|
| `/produto/bid-frete/visao-geral` | `/produto/bid-frete-internacional/visao-geral` | Segmento do produto no path muda |
| `/produto/bid-frete/cotacoes` | `/produto/bid-frete-internacional/cotacoes` | Segmento do produto no path muda |
| `/produto/bid-frete/fornecedores` | `/produto/bid-frete-internacional/fornecedores` | Segmento do produto no path muda |
| `/produto/bid-frete/configuracoes` | `/produto/bid-frete-internacional/configuracoes` | Segmento do produto no path muda |

## Navegacao — Items

| ID | Label atual | Label DDD | Icon | Source |
|---|---|---|---|---|
| `visao-geral` | Visao Geral | Visao Geral | ChartPieSlice | product |
| `cotacoes` | Cotacoes | Cotacoes | FileText | product |
| `fornecedores` | Fornecedores | Fornecedores | Buildings | product |
| `configuracoes` | Configuracoes | Configuracoes | GearSix | product |
| `atividades` | Atividades | Atividades | BookOpen | tenant |
| `historico` | Historico | Historico | ClockCounterClockwise | tenant |

> IDs de navegacao ja usam kebab-case PT-BR. Sem mudanca nos IDs.
> Section label muda de `'BID Frete'` para `'BID Frete Internacional'`.

## Servicos Tenant (tenantServices)

Servicos tenant consumidos pelo produto. Sem mudanca nos nomes:

| Servico | Descricao |
|---|---|
| `atividades` | Log de atividades do workspace |
| `dashboard` | Dashboard unificado do workspace |
| `relatorios` | Motor de relatorios |
| `historico` | Historico de auditoria |
| `notificacoes` | Sistema de notificacoes |
| `gabi` | Assistente de IA |
| `email` | Servico de email |
| `whatsapp` | Integracao WhatsApp |
| `agendamento` | Agendamento de tarefas |
| `api-cockpit` | Gerenciamento de tokens e webhooks |

## Servicos do Produto (productServices)

| Servico atual | Servico DDD | Motivo |
|---|---|---|
| `bid-engine` | `bid-engine` | Sem mudanca (termo tecnico do dominio) |
| `comparativo-engine` | `comparativo-engine` | Sem mudanca |
| `rating-engine` | `classificacao-engine` | EN rating → PT-BR classificacao |
| `savings-engine` | `ganho-engine` | EN savings → PT-BR ganho |
| `connectors` | `connectors` | Sem mudanca (termo tecnico) |

---

## Impacto da mudanca

A renomeacao de `bid-frete` → `bid-frete-internacional` afeta:

1. **config.ts** — campos `id`, `productId`, `name`
2. **contracts.json** — registro do produto no service registry
3. **Rotas do React Router** — prefixo `/produto/bid-frete/` → `/produto/bid-frete-internacional/`
4. **Shell do Configurador** — secao de navegacao do produto (label + URLs)
5. **Prisma fragment** — o `id_produto_gravity` armazenado nos registros do banco
6. **Variavel de ambiente** — `PRODUCT_ID` no .env do server
7. **Railway** — nome do servico no deploy

> A porta `8023` NAO muda. O contracts.json deve ser atualizado para refletir o novo `productId`.
