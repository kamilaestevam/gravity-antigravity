# Atlas DDD — BID Cambio — Aba 6: Paginas Frontend

> Mapeamento DDD de todas as paginas do client React.
> Diretorio base: `servicos-global/produto/bid-cambio/client/src/pages/`
> Regras aplicadas: REGRA 13 (kebab-case PT-BR), REGRA 02 (PT-BR sem acento).

## Como ler

- **Arquivo atual**: nome do componente .tsx hoje.
- **Arquivo DDD**: nome final apos rename kebab-case PT-BR.
- **Rota frontend**: URL no React Router (prefixo `/produto/bid-cambio`).
- **Descricao**: o que a pagina faz.

---

## Paginas principais

| Arquivo atual | Arquivo DDD | Rota frontend | Descricao |
|---|---|---|---|
| `VisaoGeral.tsx` | `visao-geral.tsx` | `/produto/bid-cambio/visao-geral` | Visao geral do produto — KPIs, metricas de cambio |
| `Dashboard.tsx` | `dashboard.tsx` | `/produto/bid-cambio/dashboard` | Dashboard com graficos e indicadores |
| `Lista.tsx` | `lista.tsx` | `/produto/bid-cambio/lista` | Lista unificada de cambios (view tabular) |
| `Kanban.tsx` | `kanban.tsx` | `/produto/bid-cambio/kanban` | Kanban de cambios por status |
| `ListaCambios.tsx` | `cambios-lista.tsx` | `/produto/bid-cambio/cambios` | Listagem de cambios/parcelas com filtros |
| `ModalCambioPagamento.tsx` | `cambio-pagamento-modal.tsx` | `/produto/bid-cambio/cambios/:id_cambio/pagar` | Modal de pagamento de parcela de cambio |
| `NovaCotacao.tsx` | `cotacao-nova.tsx` | `/produto/bid-cambio/cotacoes/nova` | Formulario de criacao de nova cotacao de cambio |
| `DetalheCotacao.tsx` | `cotacao-detalhe.tsx` | `/produto/bid-cambio/cotacoes/:id_cotacao` | Detalhe de uma cotacao — respostas, aprovacao, PTAX |
| `Comparativo.tsx` | `comparativo.tsx` | `/produto/bid-cambio/cotacoes/:id_cotacao/comparativo` | Comparacao de respostas de corretoras, ranking, aprovacao |
| `Corretoras.tsx` | `corretoras-lista.tsx` | `/produto/bid-cambio/corretoras` | Listagem de corretoras de cambio com filtros |
| `DetalheCorretora.tsx` | `corretora-detalhe.tsx` | `/produto/bid-cambio/corretoras/:id_corretora` | Detalhe da corretora — dados, avaliacoes, historico |
| `Configuracoes.tsx` | `configuracoes.tsx` | `/produto/bid-cambio/configuracoes` | Settings do produto |

## Paginas do Portal (portal/)

> Portal e a area acessada pelas corretoras de cambio para responder cotacoes.

| Arquivo atual | Arquivo DDD | Rota frontend | Descricao |
|---|---|---|---|
| `portal/PortalDashboard.tsx` | `portal/portal-dashboard.tsx` | `/produto/bid-cambio/portal/dashboard` | Dashboard da corretora — metricas de participacao |
| `portal/CotacoesPendentes.tsx` | `portal/portal-cotacoes-pendentes.tsx` | `/produto/bid-cambio/portal/pendentes` | Lista de cotacoes aguardando resposta da corretora |
| `portal/ResponderCotacao.tsx` | `portal/portal-responder-cotacao.tsx` | `/produto/bid-cambio/portal/responder/:id_cotacao` | Formulario de resposta a uma cotacao (autenticado) |
| `portal/ResponderPublico.tsx` | `portal/portal-responder-publico.tsx` | `/produto/bid-cambio/portal/public/responder/:token_resposta` | Formulario de resposta via link publico (sem auth, via token) |
| `portal/Respostas.tsx` | `portal/portal-respostas.tsx` | `/produto/bid-cambio/portal/respostas` | Historico de respostas enviadas pela corretora |
| `portal/Desempenho.tsx` | `portal/portal-desempenho.tsx` | `/produto/bid-cambio/portal/desempenho` | Metricas de desempenho da corretora |
| `portal/Configuracoes.tsx` | `portal/portal-configuracoes.tsx` | `/produto/bid-cambio/portal/configuracoes` | Configuracoes do portal da corretora |

---

## Notas

- A rota `/produto/bid-cambio/cotacoes` redireciona para `NovaCotacao` (mesma pagina que `/cotacoes/nova`)
- A rota `/produto/bid-cambio/portal` redireciona para `/portal/dashboard`
- A rota `/produto/bid-cambio/` redireciona para `/visao-geral`
- Rotas com fallback `*` redirecionam para `/visao-geral`
