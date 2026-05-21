# Atlas DDD — BID Cambio — Aba 7: Inventario de Arquivos

> Inventario completo de todos os arquivos fonte do produto BID Cambio.
> Regra aplicada: REGRA 13 (kebab-case PT-BR sem acento).
> Caminho base: `servicos-global/produto/bid-cambio/`

## Como ler

- **Diretorio**: pasta relativa dentro do produto.
- **Arquivo atual**: nome do arquivo hoje.
- **Arquivo DDD**: nome final apos rename.
- **Regra**: qual regra DDD justifica o rename.
- **Motivo**: explicacao da mudanca.

---

## client/src/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `client/src/` | `App.tsx` | `App.tsx` | — | Componente raiz React (convencao universal) |
| `client/src/` | `main.tsx` | `main.tsx` | — | Entry point (convencao universal) |

## client/src/pages/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `client/src/pages/` | `VisaoGeral.tsx` | `visao-geral.tsx` | REGRA 13 | PascalCase → kebab-case |
| `client/src/pages/` | `Dashboard.tsx` | `dashboard.tsx` | REGRA 13 | PascalCase → lowercase |
| `client/src/pages/` | `Lista.tsx` | `lista.tsx` | REGRA 13 | PascalCase → lowercase |
| `client/src/pages/` | `Kanban.tsx` | `kanban.tsx` | REGRA 13 | PascalCase → lowercase |
| `client/src/pages/` | `ListaCambios.tsx` | `cambios-lista.tsx` | REGRA 13 | PascalCase → kebab-case + sufixo semantico |
| `client/src/pages/` | `ModalCambioPagamento.tsx` | `cambio-pagamento-modal.tsx` | REGRA 13 | PascalCase → kebab-case PT-BR |
| `client/src/pages/` | `NovaCotacao.tsx` | `cotacao-nova.tsx` | REGRA 13 | PascalCase → kebab-case PT-BR |
| `client/src/pages/` | `DetalheCotacao.tsx` | `cotacao-detalhe.tsx` | REGRA 13 | PascalCase → kebab-case PT-BR |
| `client/src/pages/` | `Comparativo.tsx` | `comparativo.tsx` | REGRA 13 | PascalCase → lowercase |
| `client/src/pages/` | `Corretoras.tsx` | `corretoras-lista.tsx` | REGRA 13 | PascalCase → kebab-case + sufixo semantico |
| `client/src/pages/` | `DetalheCorretora.tsx` | `corretora-detalhe.tsx` | REGRA 13 | PascalCase → kebab-case PT-BR |
| `client/src/pages/` | `Configuracoes.tsx` | `configuracoes.tsx` | REGRA 13 | PascalCase → lowercase |

## client/src/pages/portal/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `client/src/pages/portal/` | `PortalDashboard.tsx` | `portal-dashboard.tsx` | REGRA 13 | PascalCase → kebab-case |
| `client/src/pages/portal/` | `CotacoesPendentes.tsx` | `portal-cotacoes-pendentes.tsx` | REGRA 13 | PascalCase → kebab-case + prefixo portal |
| `client/src/pages/portal/` | `ResponderCotacao.tsx` | `portal-responder-cotacao.tsx` | REGRA 13 | PascalCase → kebab-case + prefixo portal |
| `client/src/pages/portal/` | `ResponderPublico.tsx` | `portal-responder-publico.tsx` | REGRA 13 | PascalCase → kebab-case + prefixo portal |
| `client/src/pages/portal/` | `Respostas.tsx` | `portal-respostas.tsx` | REGRA 13 | PascalCase → kebab-case + prefixo portal |
| `client/src/pages/portal/` | `Desempenho.tsx` | `portal-desempenho.tsx` | REGRA 13 | PascalCase → kebab-case + prefixo portal |
| `client/src/pages/portal/` | `Configuracoes.tsx` | `portal-configuracoes.tsx` | REGRA 13 | PascalCase → kebab-case + prefixo portal |

## client/src/shared/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `client/src/shared/` | `api.ts` | `api.ts` | — | Sem mudanca (sigla universal) |
| `client/src/shared/` | `config.ts` | `config.ts` | — | Sem mudanca (sigla universal) |
| `client/src/shared/` | `types.ts` | `types.ts` | — | Sem mudanca (ja kebab-case) |

## server/src/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/` | `index.ts` | `index.ts` | — | Entry point (convencao universal) |

## server/src/routes/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/routes/` | `avaliacoes.ts` | `avaliacoes.ts` | — | Sem mudanca (ja kebab-case PT-BR) |
| `server/src/routes/` | `bids.ts` | `disparos-cotacao.ts` | REGRA 13 + DDD | EN bids → PT-BR disparos-cotacao |
| `server/src/routes/` | `cambios.ts` | `cambios.ts` | — | Sem mudanca |
| `server/src/routes/` | `comparativo.ts` | `comparativo.ts` | — | Sem mudanca |
| `server/src/routes/` | `corretoras.ts` | `corretoras.ts` | — | Sem mudanca |
| `server/src/routes/` | `cotacoes.ts` | `cotacoes.ts` | — | Sem mudanca |
| `server/src/routes/` | `cotacoes-ptax.ts` | `cotacoes-ptax.ts` | — | Sem mudanca (ja kebab-case) |
| `server/src/routes/` | `dashboard.ts` | `dashboard.ts` | — | Sem mudanca |
| `server/src/routes/` | `dashboard.routes.ts` | `dashboard.routes.ts` | — | Sem mudanca |
| `server/src/routes/` | `metodos-vencimento.ts` | `metodos-vencimento.ts` | — | Sem mudanca (ja kebab-case PT-BR) |
| `server/src/routes/` | `moedas.ts` | `moedas.ts` | — | Sem mudanca (ja PT-BR) |
| `server/src/routes/` | `portal.ts` | `portal.ts` | — | Sem mudanca |
| `server/src/routes/` | `portalPublic.ts` | `portal-publico.ts` | REGRA 13 | camelCase EN → kebab-case PT-BR |
| `server/src/routes/` | `preferencias.ts` | `preferencias.ts` | — | Sem mudanca (ja PT-BR) |
| `server/src/routes/` | `tipos-liquidacao.ts` | `tipos-liquidacao.ts` | — | Sem mudanca (ja kebab-case PT-BR) |

## server/src/services/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/services/` | `cronJobs.ts` | `tarefas-agendadas.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |
| `server/src/services/` | `parcelaEngine.ts` | `motor-parcela.ts` | REGRA 13 | camelCase EN → kebab-case PT-BR |
| `server/src/services/` | `tenantIntegrations.ts` | `integracoes-tenant.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |
| `server/src/services/` | `vencimentoEngine.ts` | `motor-vencimento.ts` | REGRA 13 | camelCase → kebab-case PT-BR |

## server/src/middleware/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/middleware/` | `tenantIsolation.ts` | `isolamento-tenant.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |
| `server/src/middleware/` | `requireInternalKey.ts` | `validar-chave-interna.ts` | REGRA 13 + DDD | camelCase EN → kebab-case PT-BR |

## server/src/lib/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/lib/` | `errors.ts` | `erros.ts` | REGRA 13 | EN → PT-BR |
| `server/src/lib/` | `prisma.ts` | `prisma.ts` | — | Sem mudanca (nome de framework) |

## server/src/types/

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `server/src/types/` | `express.d.ts` | `express.d.ts` | — | Sem mudanca (augmentation de tipo do framework) |

## Prisma

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `prisma/` | `fragment.prisma` | `fragment.prisma` | — | Sem mudanca no nome do arquivo |
| `prisma/` | `schema.base.prisma` | `schema.base.prisma` | — | Sem mudanca |
| `prisma/` | `schema.prisma` | `schema.prisma` | — | Sem mudanca (gerado) |
| `prisma/` | `compose-schema.js` | `compose-schema.js` | — | Sem mudanca (script utilitario) |
| `prisma/` | `seed.ts` | `seed.ts` | — | Sem mudanca |

## Raiz do produto

| Diretorio | Arquivo atual | Arquivo DDD | Regra | Motivo |
|---|---|---|---|---|
| `/` | `package.json` | `package.json` | — | Sem mudanca |
| `/` | `tsconfig.json` | `tsconfig.json` | — | Sem mudanca |
| `client/` | `index.html` | `index.html` | — | Sem mudanca |
| `client/` | `vite.config.ts` | `vite.config.ts` | — | Sem mudanca |

---

## Resumo de renames

| Categoria | Total arquivos | Renames necessarios |
|---|---|---|
| Pages (principal) | 12 | 8 |
| Pages (portal) | 7 | 7 |
| Shared | 3 | 0 |
| App/Main | 2 | 0 |
| Routes | 15 | 2 |
| Services | 4 | 4 |
| Middleware | 2 | 2 |
| Lib | 2 | 1 |
| Types | 1 | 0 |
| Prisma | 5 | 0 |
| Raiz | 4 | 0 |
| **Total** | **57** | **24** |
