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

## Paginas do Portal (portal/)

> Portal e a area acessada pelos fornecedores externos para responder cotacoes.

| Arquivo atual | Arquivo DDD | Rota frontend | Descricao |
|---|---|---|---|
| `portal/PortalDashboard.tsx` | `portal/portal-dashboard.tsx` | `/produto/bid-frete-internacional/portal/visao-geral` | Dashboard do fornecedor — metricas de participacao |
| `portal/CotacoesPendentes.tsx` | `portal/portal-cotacoes-pendentes.tsx` | `/produto/bid-frete-internacional/portal/cotacoes-pendentes` | Lista de cotacoes aguardando resposta do fornecedor |
| `portal/ResponderCotacao.tsx` | `portal/portal-responder-cotacao.tsx` | `/produto/bid-frete-internacional/portal/cotacoes/:id_cotacao/responder` | Formulario de resposta a uma cotacao (autenticado) |
| `portal/ResponderPublico.tsx` | `portal/portal-responder-publico.tsx` | `/produto/bid-frete-internacional/portal/publico/:token` | Formulario de resposta via link publico (sem auth) |
| `portal/Respostas.tsx` | `portal/portal-propostas.tsx` | `/produto/bid-frete-internacional/portal/propostas` | Historico de propostas enviadas (renomeado: respostas → propostas) |
| `portal/Desempenho.tsx` | `portal/portal-desempenho.tsx` | `/produto/bid-frete-internacional/portal/desempenho` | Metricas de desempenho do fornecedor |
| `portal/TabelaPrecos.tsx` | `portal/portal-tabelas-valor.tsx` | `/produto/bid-frete-internacional/portal/tabelas-valor` | Tabelas de valor do fornecedor (renomeado: precos → valor) |

---

## Renames semanticos

| Termo legado | Termo DDD | Motivo |
|---|---|---|
| `Respostas` | `Propostas` | O fornecedor envia uma proposta, nao uma resposta. Alinhamento com model `BidFreteInternacionalProposta`. |
| `TabelaPrecos` | `TabelasValor` | Padrao DDD do Gravity — `valor` e o termo canonico para pricing/preco. |
