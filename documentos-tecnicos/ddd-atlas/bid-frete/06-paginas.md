# Atlas DDD — BID Frete Internacional — Aba 6: Paginas Frontend

> Mapeamento DDD de todas as paginas do client React.
> Diretorio base: `servicos-global/produto/bid-frete/client/src/pages/`
> Regras aplicadas: REGRA 13 (kebab-case PT-BR), REGRA 02 (PT-BR sem acento).

## Como ler

- **Arquivo atual**: nome do componente .tsx hoje.
- **Arquivo DDD**: nome final apos rename kebab-case PT-BR.
- **Rota frontend**: URL no React Router (prefixo `/produto/bid-frete-internacional`).
- **Descricao**: o que a pagina faz.

---

## Paginas principais

| Arquivo atual | Arquivo DDD | Rota frontend | Descricao |
|---|---|---|---|
| `Dashboard.tsx` | `dashboard.tsx` | `/produto/bid-frete-internacional/visao-geral` | Visao geral do produto — KPIs, funil de cotacoes, calendario |
| `Cotacoes.tsx` | `cotacoes-lista.tsx` | `/produto/bid-frete-internacional/cotacoes` | Listagem de cotacoes com filtros e busca |
| `NovaCotacao.tsx` | `cotacao-nova.tsx` | `/produto/bid-frete-internacional/cotacoes/nova` | Formulario de criacao de nova cotacao |
| `DetalheCotacao.tsx` | `cotacao-detalhe.tsx` | `/produto/bid-frete-internacional/cotacoes/:id_cotacao` | Detalhe de uma cotacao — timeline, propostas, aprovacao |
| `CotacoesImportar.tsx` | `cotacoes-importar.tsx` | `/produto/bid-frete-internacional/cotacoes/importar` | Importacao de cotacoes em bloco |
| `Comparativo.tsx` | `comparativo.tsx` | `/produto/bid-frete-internacional/cotacoes/:id_cotacao/comparativo` | Comparacao de propostas, ranking, aprovacao |
| `Fornecedores.tsx` | `fornecedores-lista.tsx` | `/produto/bid-frete-internacional/fornecedores` | Listagem de fornecedores com filtros |
| `DetalheFornecedor.tsx` | `fornecedor-detalhe.tsx` | `/produto/bid-frete-internacional/fornecedores/:id_fornecedor` | Detalhe do fornecedor — dados, tabelas de valor, avaliacoes |
| `Configuracoes.tsx` | `configuracoes.tsx` | `/produto/bid-frete-internacional/configuracoes` | Settings do produto |

## Paginas da Visao Fornecedor (`visao-fornecedor-bid-frete-internacional/`)

> Area acessada pelos fornecedores externos para responder cotacoes e gerenciar tabelas de valor.

| Arquivo atual | Arquivo DDD | Rota frontend | Descricao |
|---|---|---|---|
| `visao-fornecedor-bid-frete-internacional-dashboard.tsx` | (implementado) | `/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/visao-geral` | Dashboard do fornecedor — metricas de participacao |
| `visao-fornecedor-bid-frete-internacional-cotacoes-pendentes.tsx` | (implementado) | `/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/cotacoes-pendentes` | Disparos aguardando proposta |
| `visao-fornecedor-bid-frete-internacional-responder-cotacao.tsx` | (implementado) | `/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/cotacoes/:id_disparo_cotacao_bid_frete_internacional/responder` | Formulario de proposta (autenticado) |
| `visao-fornecedor-bid-frete-internacional-responder-publico.tsx` | (implementado) | `/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/publico/:token_resposta_disparo_cotacao_bid_frete_internacional` | Proposta via link publico (sem auth) |
| `visao-fornecedor-bid-frete-internacional-propostas.tsx` | (implementado) | `/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/propostas` | Historico de propostas enviadas |
| `visao-fornecedor-bid-frete-internacional-desempenho.tsx` | (implementado) | `/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/desempenho` | Metricas de desempenho do fornecedor |
| `visao-fornecedor-bid-frete-internacional-tabelas-valor.tsx` | (implementado) | `/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/tabelas-valor` | CRUD de tabelas de valor do fornecedor |

> Redirect legado: `/produto/bid-frete-internacional/portal/*` → rotas equivalentes em `visao-fornecedor-bid-frete-internacional/*`.

---

## Renames semanticos

| Termo legado | Termo DDD | Motivo |
|---|---|---|
| `Respostas` | `Propostas` | O fornecedor envia uma proposta, nao uma resposta. Alinhamento com model `BidFreteInternacionalProposta`. |
| `TabelaPrecos` | `TabelasValor` | Padrao DDD do Gravity — `valor` e o termo canonico para pricing/preco. |
