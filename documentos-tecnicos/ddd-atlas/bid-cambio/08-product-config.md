# Atlas DDD — BID Cambio — Aba 8: PRODUCT_CONFIG

> Mapeamento DDD do PRODUCT_CONFIG, navegacao e servicos do produto.
> Arquivo: `servicos-global/produto/bid-cambio/client/src/shared/config.ts`

## Config

| Campo | Valor | Observacao |
|---|---|---|
| `id` | `'bid-cambio'` | Identificador unico do produto |
| `productId` | `'bid-cambio'` | Mesmo que `id` — usado em contracts.json |
| `name` | `'BID Cambio'` | Nome de exibicao na UI |
| `port` | `8025` | Porta backend do produto |

## Navegacao — Items principais

| ID | Label | Icon | Source | Observacao |
|---|---|---|---|---|
| `meu-espaco` | Meu Espaco | user-circle | tenant | Grupo colapsavel com sub-itens |
| `/core/atividades` | Minhas Atividades | check-circle | tenant | Disabled — badge "Em Breve" |
| `/core/email` | Email | envelope | tenant | Disabled — badge "Em Breve" |
| `section-bid-cambio` | BID Cambio | — | — | Section divider |
| `/produto/bid-cambio/visao-geral` | Visao Geral | chart-pie-slice | product | Pagina inicial |
| `/produto/bid-cambio/dashboard` | Dashboard | chart-bar | product | Graficos e indicadores |
| `/produto/bid-cambio/lista` | Lista | list-bullets | product | View tabular unificada |
| `/produto/bid-cambio/kanban` | Kanban | kanban | product | View kanban por status |
| `/produto/bid-cambio/cambios` | Cambios | file-text | product | Listagem de cambios/parcelas |
| `/produto/bid-cambio/cotacoes` | Cotacoes | arrows-left-right | product | Cotacoes de cambio |
| `/produto/bid-cambio/corretoras` | Corretoras | buildings | product | Cadastro de corretoras |
| `/workspace/historico-organizacao?id_produto_historico_log=bid-cambio` | Historico | clock-counter-clockwise | tenant | Link externo para historico da organizacao |
| `/produto/bid-cambio/configuracoes` | Configuracoes | gear-six | product | Settings do produto |

## Navegacao — Portal da Corretora (navigationCorretora)

| ID | Label | Icon | Source |
|---|---|---|---|
| `dashboard` | Dashboard | chart-pie-slice | product |
| `cotacoes-pendentes` | Cotacoes Pendentes | clock | product |
| `minhas-respostas` | Minhas Respostas | check-circle | product |
| `meu-desempenho` | Meu Desempenho | chart-line-up | product |
| `configuracoes` | Configuracoes | gear-six | product |

## Features (flags)

| Feature | Valor | Descricao |
|---|---|---|
| `cotacao_aberta` | `true` | Permite cotacao aberta (sem corretoras pre-selecionadas) |
| `rating_global` | `true` | Rating cross-tenant de corretoras por email |
| `monetizacao_corretora` | `true` | Modelo de monetizacao com corretoras |
| `portal_publico` | `true` | Portal publico via token (sem auth) |
| `gestao_parcelas` | `true` | Gestao de parcelas de cambio (Pilar 1) |
| `integracao_processo` | `true` | Vinculacao com processos/pedidos de importacao |
| `alerta_vencimento` | `true` | Alertas de vencimento de parcelas |
| `exportacao` | `true` | Suporte a operacoes de exportacao |

## Servicos Tenant (tenantServices)

Servicos tenant consumidos pelo produto:

| Servico | Descricao |
|---|---|
| `atividades` | Log de atividades do workspace |
| `dashboard` | Dashboard unificado do workspace |
| `relatorios` | Motor de relatorios |
| `historico` | Historico de auditoria |
| `notificacoes` | Sistema de notificacoes |
| `gabi` | Assistente de IA |
| `email` | Servico de email |
| `agendamento` | Agendamento de tarefas |
| `api-cockpit` | Gerenciamento de tokens e webhooks |

## Servicos do Produto (productServices)

| Servico | Arquivo atual | Arquivo DDD | Descricao |
|---|---|---|---|
| `bid-engine` | — | — | Motor de disparos de cotacao (termo tecnico do dominio) |
| `comparativo-engine` | — | — | Motor de comparacao de respostas |
| `rating-engine` | — | `classificacao-engine` | Motor de classificacao de corretoras (EN rating → PT-BR classificacao) |
| `parcela-engine` | `parcelaEngine.ts` | `motor-parcela.ts` | Motor de calculo e gestao de parcelas |
| `savings-engine` | — | `ganho-engine` | Motor de calculo de economia (EN savings → PT-BR ganho) |
| `vencimento-engine` | `vencimentoEngine.ts` | `motor-vencimento.ts` | Motor de calculo de datas de vencimento |
| `email-engine` | — | — | Motor de envio de emails para corretoras |
