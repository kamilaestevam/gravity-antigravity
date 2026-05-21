# Atlas DDD — BID Frete Internacional — Aba 7: Renomeacao de Arquivos

> Mapeamento DDD completo de todos os arquivos que precisam ser renomeados no produto.
> Regra aplicada: REGRA 13 (kebab-case PT-BR sem acento).
> Caminho base: `servicos-global/produto/bid-frete/`

## Como ler

- **Diretorio**: pasta relativa dentro do produto.
- **Arquivo atual**: nome do arquivo hoje.
- **Arquivo DDD**: nome final apos rename.
- **Regra**: qual regra DDD justifica o rename.
- **Motivo**: explicacao da mudanca.

---

## Pasta raiz

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `/` | `bid-frete/` | `bid-frete-internacional/` | REGRA 13 | Rename da pasta raiz do produto |

## client/src/pages/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `client/src/pages/` | `Dashboard.tsx` | `dashboard.tsx` | REGRA 13 | PascalCase → kebab-case |
| `client/src/pages/` | `Cotacoes.tsx` | `cotacoes-lista.tsx` | REGRA 13 | PascalCase → kebab-case + sufixo semantico |
| `client/src/pages/` | `NovaCotacao.tsx` | `cotacao-nova.tsx` | REGRA 13 | PascalCase → kebab-case PT-BR |
| `client/src/pages/` | `DetalheCotacao.tsx` | `cotacao-detalhe.tsx` | REGRA 13 | PascalCase → kebab-case PT-BR |
| `client/src/pages/` | `CotacoesImportar.tsx` | `cotacoes-importar.tsx` | REGRA 13 | PascalCase → kebab-case |
| `client/src/pages/` | `Comparativo.tsx` | `comparativo.tsx` | REGRA 13 | PascalCase → lowercase |
| `client/src/pages/` | `Fornecedores.tsx` | `fornecedores-lista.tsx` | REGRA 13 | PascalCase → kebab-case + sufixo semantico |
| `client/src/pages/` | `DetalheFornecedor.tsx` | `fornecedor-detalhe.tsx` | REGRA 13 | PascalCase → kebab-case PT-BR |
| `client/src/pages/` | `Configuracoes.tsx` | `configuracoes.tsx` | REGRA 13 | PascalCase → lowercase |

## client/src/pages/portal/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `client/src/pages/portal/` | `PortalDashboard.tsx` | `portal-dashboard.tsx` | REGRA 13 | PascalCase → kebab-case |
| `client/src/pages/portal/` | `CotacoesPendentes.tsx` | `portal-cotacoes-pendentes.tsx` | REGRA 13 | PascalCase → kebab-case + prefixo portal |
| `client/src/pages/portal/` | `ResponderCotacao.tsx` | `portal-responder-cotacao.tsx` | REGRA 13 | PascalCase → kebab-case + prefixo portal |
| `client/src/pages/portal/` | `ResponderPublico.tsx` | `portal-responder-publico.tsx` | REGRA 13 | PascalCase → kebab-case + prefixo portal |
| `client/src/pages/portal/` | `Respostas.tsx` | `portal-propostas.tsx` | REGRA 13 + DDD | Rename semantico: respostas → propostas |
| `client/src/pages/portal/` | `Desempenho.tsx` | `portal-desempenho.tsx` | REGRA 13 | PascalCase → kebab-case + prefixo portal |
| `client/src/pages/portal/` | `TabelaPrecos.tsx` | `portal-tabelas-valor.tsx` | REGRA 13 + DDD | Rename semantico: precos → valor |

## client/src/shared/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `client/src/shared/` | `api.ts` | `api.ts` | — | Sem mudanca (sigla universal) |
| `client/src/shared/` | `config.ts` | `config.ts` | — | Sem mudanca (sigla universal) |
| `client/src/shared/` | `types.ts` | `types.ts` | — | Sem mudanca (ja kebab-case) |

## server/src/routes/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/routes/` | `avaliacoes.ts` | `avaliacoes.ts` | — | Sem mudanca (ja kebab-case PT-BR) |
| `server/src/routes/` | `bids.ts` | `pedidos-cotacao.ts` | REGRA 13 + DDD | EN bids → PT-BR pedidos-cotacao |
| `server/src/routes/` | `comparativo.ts` | `comparativo.ts` | — | Sem mudanca |
| `server/src/routes/` | `containers.ts` | `containers.ts` | — | Sem mudanca (termo tecnico universal) |
| `server/src/routes/` | `cotacoes.ts` | `cotacoes.ts` | — | Sem mudanca |
| `server/src/routes/` | `cotacoes-publicas.ts` | `cotacoes-publicas.ts` | — | Sem mudanca (ja kebab-case PT-BR) |
| `server/src/routes/` | `dashboard.ts` | `dashboard.ts` | — | Sem mudanca |
| `server/src/routes/` | `dashboard.routes.ts` | `dashboard.routes.ts` | — | Sem mudanca |
| `server/src/routes/` | `fornecedores.ts` | `fornecedores.ts` | — | Sem mudanca |
| `server/src/routes/` | `incoterms.ts` | `incoterms.ts` | — | Sem mudanca (termo tecnico internacional) |
| `server/src/routes/` | `modais.ts` | `modais.ts` | — | Sem mudanca (ja PT-BR) |
| `server/src/routes/` | `moedas.ts` | `moedas.ts` | — | Sem mudanca (ja PT-BR) |
| `server/src/routes/` | `portal.ts` | `portal.ts` | — | Sem mudanca |
| `server/src/routes/` | `portos.ts` | `portos.ts` | — | Sem mudanca (ja PT-BR) |

## server/src/services/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/services/` | `bidEngine.ts` | `motor-bid.ts` | REGRA 13 | camelCase EN → kebab-case PT-BR |
| `server/src/services/` | `comparativoEngine.ts` | `motor-comparativo.ts` | REGRA 13 | camelCase → kebab-case PT-BR |
| `server/src/services/` | `cronJobs.ts` | `tarefas-agendadas.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |
| `server/src/services/` | `monetizacao.ts` | `monetizacao.ts` | — | Sem mudanca (ja kebab-case PT-BR) |
| `server/src/services/` | `ratingEngine.ts` | `motor-classificacao.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |
| `server/src/services/` | `savingsEngine.ts` | `motor-ganho.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |
| `server/src/services/` | `tenantIntegrations.ts` | `integracoes-tenant.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |

## server/src/connectors/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/connectors/` | `agentes.ts` | `agentes.ts` | — | Sem mudanca |
| `server/src/connectors/` | `armadores.ts` | `armadores.ts` | — | Sem mudanca |
| `server/src/connectors/` | `ciasAereas.ts` | `cias-aereas.ts` | REGRA 13 | camelCase → kebab-case |
| `server/src/connectors/` | `erp.ts` | `erp.ts` | — | Sem mudanca (sigla universal) |

## server/src/middleware/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/middleware/` | `rateLimiter.ts` | `limitador-taxa.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |
| `server/src/middleware/` | `tenantIsolation.ts` | `isolamento-tenant.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |
| `server/src/middleware/` | `requireInternalKey.ts` | `validar-chave-interna.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |

## server/src/lib/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/lib/` | `errors.ts` | `erros.ts` | REGRA 13 | EN → PT-BR |
| `server/src/lib/` | `prisma.ts` | `prisma.ts` | — | Sem mudanca (nome de framework) |

## Prisma

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `prisma/` | `fragment.prisma` | `fragment.prisma` | — | Sem mudanca no nome do arquivo |

---

## Resumo de renames

| Categoria | Total arquivos | Renames necessarios |
|---|---|---|
| Pages (principal) | 9 | 9 |
| Pages (portal) | 7 | 7 |
| Shared | 3 | 0 |
| Routes | 14 | 1 |
| Services | 7 | 6 |
| Connectors | 4 | 1 |
| Middleware | 3 | 3 |
| Lib | 2 | 1 |
| Prisma | 1 | 0 |
| **Total** | **50** | **28** |
