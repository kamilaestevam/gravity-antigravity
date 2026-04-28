# BID Frete — Plano de Refatoracao DDD e Entrega

> Status: documento de planejamento, sem alteracao de codigo.
> Produto: `bid-frete`
> Diretorio tecnico: `documentos-tecnicos/produto/bid-frete/`
> Diretorio de codigo: `produto/bid-frete/`
> Branch recomendada para execucao futura: `bid-frete-ddd`
> Data-base: 2026-04-24

---

## 1. Objetivo

Consolidar o plano completo para transformar o draft atual do BID Frete em um produto alinhado ao padrao Gravity pos-refatoracao DDD, com foco em:

- Separacao segura entre comprador e fornecedor.
- Isolamento absoluto de Organizacao/Workspace.
- Fluxo multi-organizacao para fornecedores.
- Refatoracao DDD de nomes, contratos, rotas e schemas.
- Priorizacao das engines proprias do produto antes das integracoes secundarias.
- Plano de testes unitarios, funcionais, E2E, contratos e seguranca.
- Distribuicao por ondas, agentes, dependencias e criterios de aceite.

Este documento nao autoriza edicao direta em `schema.prisma`. Qualquer alteracao de schema deve passar pelo Coordenador, via fluxo controlado de fragment/composicao/migration.

---

## 2. Contexto Atual

O BID Frete ja existe como draft em `produto/bid-frete/`.

### Frontend existente

Ha 16 telas em `produto/bid-frete/client/src/pages`:

#### Comprador

- `Dashboard.tsx` — visao geral, KPIs e funil.
- `Cotacoes.tsx` — lista/kanban de cotacoes.
- `NovaCotacao.tsx` — wizard de criacao de cotacao.
- `ImportarBloco.tsx` — importacao em bloco.
- `DetalheCotacao.tsx` — detalhe da cotacao e respostas.
- `Comparativo.tsx` — ranking/comparativo de propostas.
- `Fornecedores.tsx` — lista de fornecedores logisticos.
- `DetalheFornecedor.tsx` — rating, historico e tabela de precos.
- `Configuracoes.tsx` — preferencias do produto.

#### Fornecedor

- `portal/PortalDashboard.tsx` — dashboard do fornecedor.
- `portal/CotacoesPendentes.tsx` — cotacoes aguardando resposta.
- `portal/ResponderCotacao.tsx` — resposta autenticada.
- `portal/ResponderPublico.tsx` — resposta via token publico.
- `portal/MinhasRespostas.tsx` — historico de respostas.
- `portal/TabelaPrecos.tsx` — tabela de precos do fornecedor.
- `portal/MeuDesempenho.tsx` — metricas e desempenho.

### Backend existente

Rotas atuais:

- `masterData.ts`
- `cotacoes.ts`
- `fornecedores.ts`
- `bids.ts`
- `comparativo.ts`
- `portal.ts`
- `portalPublic.ts`
- `avaliacoes.ts`
- `dashboard.ts`
- `dashboard.routes.ts`

Engines e servicos internos do produto:

- `bidEngine.ts`
- `comparativoEngine.ts`
- `ratingEngine.ts`
- `savingsEngine.ts`
- `monetizacao.ts`
- `cronJobs.ts`
- `tenantIntegrations.ts`

Conectores:

- `agentes.ts`
- `armadores.ts`
- `ciasAereas.ts`
- `erp.ts`

### Estado tecnico atual

O draft atual ainda carrega padroes antigos:

- Campos legados: `tenant_id`, `company_id`, `user_id`, `product_id`, `created_at`, `updated_at`.
- Nomes em ingles: `BidRequest`, `BidResponse`, `Saving`, `ConnectorConfig`.
- Uso de `PrismaClient` direto em produto.
- Middleware proprio de tenant isolation.
- Frontend consumindo `fetch().json()` sem schema Zod de resposta.
- Divergencias entre `fragment.prisma`, `types.ts`, `api.ts` e rotas reais.
- Rotas frontend/backend desalinhadas em alguns pontos.

---

## 3. Decisoes Ja Definidas

### 3.1 Prioridade de produto

Prioridade 1: engines proprias do BID Frete.

- Disparo de cotacoes.
- Recebimento de respostas.
- Comparativo/ranking.
- Aprovacao.
- Savings.
- Rating do fornecedor.
- Portal autenticado e portal publico.

Prioridade 2: servicos tenant e integracoes complementares.

- Atividades.
- Historico.
- Notificacoes.
- Relatorios.
- Email.
- WhatsApp.
- Gabi.
- Agendamento.
- API Cockpit.

### 3.2 Comprador e fornecedor

O produto tem dois perfis funcionais:

- Comprador: Organizacao/Workspace que cria cotacoes e escolhe fornecedores.
- Fornecedor: empresa ou usuario externo que recebe e responde cotacoes.

Comprador ve apenas suas cotacoes, no seu escopo de Organizacao/Workspace.

Fornecedor ve de forma consolidada as cotacoes destinadas a ele, mesmo que venham de varias Organizacoes/Workspaces.

### 3.3 Fornecedor independente

Fornecedor pode entrar no Gravity de duas formas:

1. Convite por uma Organizacao/Workspace compradora.
2. Entrada autonoma, criando sua propria Organizacao Gravity.

Para fornecedor que entra sozinho, a solucao definida e criar uma Organizacao propria no Configurador, com `categoria_organizacao = SUPPLIER`.

### 3.4 Categoria de Organizacao

Categoria pertence a `Organizacao`, nao ao cadastro local de fornecedor.

Campo proposto em codigo: `categoria_organizacao`.

Nome do enum proposto: `CategoriaOrganizacao`.

Valores tecnicos do enum, seguindo DDD (UPPER_SNAKE em ingles):

- `BUYER`
- `SUPPLIER`
- `MIXED`

Labels canonicos em tela:

- `Compradora`
- `Fornecedora`
- `Mista`

Fonte da verdade: banco do Configurador.

Propagacao:

- Banco Configurador: campo em `Organizacao`.
- Backend Configurador: onboarding, `/api/v1/me`, APIs de organizacao.
- Front Configurador: onboarding e HUB.
- Shell/HUB: experiencia inicial por categoria.
- Produto BID Frete: usa para UX e roteamento, nunca como unica trava de seguranca.

---

## 4. Modelo de Acesso Seguro

### 4.1 Regra de ouro

Comprador filtra por Organizacao/Workspace comprador.

Fornecedor filtra por solicitacoes destinadas a ele.

Nunca acessar cotacao por `id_cotacao` puro.

### 4.2 Comprador

Comprador pode ver uma cotacao se:

- Esta autenticado.
- Tem acesso ao produto BID Frete.
- Pertence a Organizacao compradora da cotacao.
- Tem acesso ao Workspace comprador da cotacao, quando aplicavel.
- Tem permissao granular ou e `MASTER` dentro da Organizacao.

Trava obrigatoria no contrato de autorizacao. Em banco de produto pos schema-per-organizacao, a Organizacao e inferida pelo schema ativo do `@gravity/tenant-resolver`, nao por coluna persistida.

```text
id_cotacao_frete
+ contexto de Organizacao resolvido pelo tenant-resolver
+ id_workspace_comprador permitido
```

### 4.3 Fornecedor autenticado

Fornecedor pode ver uma cotacao se:

- Esta autenticado como `SUPPLIER`.
- Possui vinculo ativo com a Organizacao/Workspace compradora.
- Possui permissao explicita para BID Frete.
- Existe uma solicitacao de proposta destinada a ele.

Trava obrigatoria no contrato de autorizacao. Para visao consolidada do fornecedor, cada Organizacao deve ser resolvida como contexto separado; nenhuma query deve misturar schemas.

```text
id_cotacao_frete
+ id_usuario_fornecedor ou id_fornecedor_frete
+ solicitacao destinada ao fornecedor
+ vinculo ativo Organizacao/Workspace/Produto
```

### 4.4 Portal publico

Fornecedor sem login pode responder apenas via token.

Trava obrigatoria:

```text
token_resposta
+ id_solicitacao_proposta_frete
+ status pendente
+ data_expiracao valida
+ uso unico
```

Token publico nao concede acesso ao portal autenticado, historico, dashboard ou qualquer outra cotacao.

### 4.5 Pontos cegos que precisam ser bloqueados

- `findUnique({ id })` sem escopo.
- Dashboard agregando dados de mais de uma Organizacao sem regra explicita.
- Fornecedor listado por organizacao e recebendo todas as cotacoes daquela organizacao.
- Comprador acessando cotacao de outro Workspace dentro da mesma Organizacao.
- Relatorios/exportacoes ignorando o mesmo filtro das telas.
- Portal publico reutilizando token ja respondido.
- Rating global revelando detalhes de outra Organizacao em vez de metrica agregada.
- Logs, auditoria ou erros retornando dados sensiveis.

---

## 5. Modelo Conceitual Pos-DDD

### 5.1 Entidades principais

| Draft atual | Nome DDD proposto | Observacao |
|---|---|---|
| `Cotacao` | `CotacaoFrete` | Cotacao criada pelo comprador. |
| `Fornecedor` | `FornecedorFrete` | Cadastro local do fornecedor no produto. |
| `BidRequest` | `SolicitacaoPropostaFrete` | Convite/solicitacao enviada ao fornecedor. |
| `BidResponse` | `RespostaCotacaoFrete` | Resposta/proposta do fornecedor. |
| `TabelaPreco` | `TabelaPrecoFrete` | Rotas e precos padrao do fornecedor. |
| `DetalheTaxa` | `DetalheTaxaFrete` | Breakdown de taxas. |
| `Avaliacao` | `AvaliacaoFornecedorFrete` | Avaliacao manual. |
| `RatingFornecedor` | `ClassificacaoFornecedorFrete` | Agregado global controlado. |
| `Saving` | `EconomiaCotacaoFrete` | Economia calculada na aprovacao. |
| `ConnectorConfig` | `ConfiguracaoConectorFrete` | Conectores ERP/API. |
| `Porto` | `LocalidadeLogistica` | Pode representar porto, aeroporto ou ponto rodoviario. |

### 5.2 Campos comuns

| Draft atual | DDD esperado |
|---|---|
| `id` | `id_<entidade>` |
| `tenant_id` | `id_organizacao` apenas durante janela de migracao; remover em produto apos schema-per-organizacao completo |
| `company_id` | `id_workspace` |
| `user_id` | `id_usuario` |
| `product_id` | `id_produto` |
| `created_at` | `data_criacao_<entidade>` |
| `updated_at` | `data_atualizacao_<entidade>` |
| `cotacao_id` | `id_cotacao_frete` |
| `fornecedor_id` | `id_fornecedor_frete` |
| `bid_request_id` | `id_solicitacao_proposta_frete` |
| `response_id` | `id_resposta_cotacao_frete` |

### 5.3 Campos especificos relevantes

| Draft atual | DDD esperado |
|---|---|
| `valor_target` | `valor_alvo_cotacao_frete` |
| `moeda_target` | `moeda_alvo_cotacao_frete` |
| `saving_valor` | `valor_economia_cotacao_frete` |
| `saving_percentual` | `percentual_economia_cotacao_frete` |
| `transit_time_dias` | `prazo_transito_dias` |
| `free_time_dias` | `prazo_livre_dias` |
| `zip_code_origem` | `codigo_postal_origem` |
| `zip_code_destino` | `codigo_postal_destino` |
| `ocultar_nome_empresa` | `nome_empresa_oculto` |
| `token_resposta` | `token_resposta_fornecedor` |
| `token_expira_em` | `data_expiracao_token_resposta` |

---

## 6. Arquitetura Alvo

### 6.1 Configurador

Responsavel por:

- Autenticacao via Clerk.
- Fonte da verdade de `tipo_usuario`.
- Categoria da Organizacao.
- Criacao de Organizacao no onboarding.
- Convite de usuarios `MASTER`, `STANDARD`, `SUPPLIER`.
- Vinculos fornecedor-organizacao.
- Permissoes granulares por produto.
- Endpoint canonico `/api/v1/me`.

### 6.2 Shell/HUB

Responsavel por:

- Sincronizar `/api/v1/me`.
- Exibir contexto correto.
- Para fornecedor com multiplos vinculos, exibir HUB consolidado.
- Encaminhar para o BID Frete no contexto correto.

### 6.3 BID Frete

Responsavel por:

- Cadastrar fornecedores logisticos no escopo do comprador.
- Criar cotacoes de frete.
- Disparar solicitacoes de proposta.
- Receber respostas via portal autenticado ou token publico.
- Comparar propostas.
- Aprovar fornecedor vencedor.
- Calcular economia.
- Avaliar fornecedores.
- Expor portal do fornecedor.

### 6.4 Servicos tenant

Entram em segundo plano:

- Historico/auditoria.
- Notificacoes.
- Email.
- WhatsApp.
- Relatorios.
- Gabi.
- Agendamento.

Para MVP, o fluxo principal nao pode depender criticamente desses servicos estarem completos. Eles devem ser chamados por integracao minima, fire-and-forget, com falha controlada.

---

## 7. Ondas de Execucao

### Onda 0 — Congelamento e Preparacao

Objetivo: evitar conflito com a refatoracao paralela do projeto.

Tasks:

- `BF-0001` Aguardar conclusao da refatoracao principal.
- `BF-0002` Criar branch especifica `bid-frete-ddd`.
- `BF-0003` Validar estado do git antes de iniciar.
- `BF-0004` Reconfirmar skills obrigatorias.
- `BF-0005` Revalidar `ARQUITETURA.md`, `bid-frete.md` e este plano.

Agentes:

- Lider: autoriza inicio.
- Coordenador: valida pre-requisitos de schema/contratos.
- Produto BID Frete: executa levantamento.

Dependencias:

- Refatoracao DDD principal concluida.
- Nenhum conflito ativo em Configurador, Cadastros ou Pedido que impacte nomes globais.

Entregaveis:

- Branch criada.
- Relatorio de estado inicial.
- Plano confirmado pelo dono.

---

### Onda 1 — Configurador, Usuario e Onboarding Fornecedor

Objetivo: permitir fornecedor entrar via convite ou autonomamente.

Tasks:

- `BF-0101` Adicionar `categoria_organizacao` com enum `CategoriaOrganizacao` (`BUYER`, `SUPPLIER`, `MIXED`) no fluxo controlado pelo Coordenador.
- `BF-0102` Ajustar onboarding para perguntar como a empresa usara o Gravity.
- `BF-0103` Criar fluxo "Entrar como fornecedor" gerando Organizacao propria com `categoria_organizacao = SUPPLIER`.
- `BF-0104` Garantir que `/api/v1/me` retorne categoria da Organizacao.
- `BF-0105` Revisar convite de `SUPPLIER`.
- `BF-0106` Definir/validar vinculos fornecedor-organizacao-workspace-produto.
- `BF-0107` Definir permissoes especificas do BID Frete no Configurador.

Agentes:

- Configurador Backend.
- Configurador Frontend.
- Coordenador.
- QA.

Dependencias:

- Skill `permissoes`.
- Skill `configurador`.
- Mandamento 01: autorizacao nunca via Clerk `publicMetadata`.

Entregaveis:

- Fluxo de onboarding fornecedor.
- Categoria da Organizacao persistida e exposta.
- Convite SUPPLIER revisado.
- Permissoes BID Frete registraveis.

---

### Onda 2 — HUB do Fornecedor

Objetivo: fornecedor consolidar acessos sem vazar dados entre compradores.

Tasks:

- `BF-0201` Criar HUB do fornecedor no Configurador/Shell.
- `BF-0202` Listar Organizacoes/Workspaces onde o fornecedor tem vinculo ativo.
- `BF-0203` Exibir cotações pendentes consolidadas por solicitacao destinada ao fornecedor.
- `BF-0204` Permitir troca de contexto sem perder isolamento.
- `BF-0205` Bloquear preferencia automatica de workspace para `SUPPLIER`.

Agentes:

- Shell/Frontend.
- Configurador Backend.
- Produto BID Frete Frontend.
- QA.

Dependencias:

- Onda 1 concluida.
- `/api/v1/me` sincronizado.
- Vinculo fornecedor-organizacao definido.

Entregaveis:

- HUB fornecedor.
- Navegacao consolidada.
- Testes de acesso multi-organizacao.

---

### Onda 3 — Refatoracao DDD do BID Frete

Objetivo: alinhar schema, rotas, payloads, types e UI ao DDD.

Tasks:

- `BF-0301` Mapear nomes atuais para nomes DDD.
- `BF-0302` Refatorar fragment/schema via fluxo do Coordenador.
- `BF-0303` Atualizar backend routes e services.
- `BF-0304` Atualizar `types.ts`, `api.ts` e schemas Zod do frontend.
- `BF-0305` Corrigir rotas divergentes front/back.
- `BF-0306` Versionar ou compatibilizar endpoints quando necessario.
- `BF-0307` Atualizar documentacao tecnica.

Agentes:

- Coordenador: schema, migrations, contratos.
- Backend Produto.
- Frontend Produto.
- QA.

Dependencias:

- Onda 1 e Onda 2.
- Decisao final sobre nomes DDD.
- Nenhum trabalho paralelo conflitante no BID Frete.

Entregaveis:

- DDD aplicado.
- Contratos sincronizados.
- Front/back alinhados.
- Docs atualizadas.

---

### Onda 4 — Engines Prioritarias

Objetivo: tornar o coracao do produto funcional.

Tasks:

- `BF-0401` Refatorar `bidEngine` para criar solicitacoes seguras.
- `BF-0402` Refatorar portal publico com token de uso unico.
- `BF-0403` Refatorar portal autenticado para fornecedor.
- `BF-0404` Refatorar `comparativoEngine`.
- `BF-0405` Refatorar `savingsEngine`.
- `BF-0406` Refatorar `ratingEngine` com agregacao segura.
- `BF-0407` Manter `monetizacao` desligada ou feature-flag ate decisao comercial.

Agentes:

- Backend Produto.
- Frontend Produto.
- QA.

Dependencias:

- Onda 3 concluida.
- Contratos definidos.

Entregaveis:

- Fluxo principal funcional: criar cotacao, disparar, responder, comparar, aprovar, calcular economia.

---

### Onda 5 — Servicos Secundarios e Integracoes

Objetivo: adicionar integracoes sem bloquear o MVP.

Tasks:

- `BF-0501` Integracao minima com Historico.
- `BF-0502` Integracao minima com Atividades.
- `BF-0503` Integracao com Email.
- `BF-0504` Integracao com WhatsApp.
- `BF-0505` Integracao com Notificacoes.
- `BF-0506` Relatorios e exportacoes.
- `BF-0507` Gabi para analise de propostas.
- `BF-0508` Agendamento para expiracao e alertas.

Agentes:

- Servicos tenant especificos.
- Backend Produto.
- QA.

Dependencias:

- Onda 4 concluida.
- Services tenant disponiveis e contratos publicados.

Entregaveis:

- Integracoes fire-and-forget.
- Logs/auditoria.
- Relatorios basicos.

---

### Onda 6 — QA, Hardening e Homologacao

Objetivo: validar seguranca, UX, performance e regressao.

Tasks:

- `BF-0601` Testes unitarios.
- `BF-0602` Testes funcionais.
- `BF-0603` Contract tests com Zod.
- `BF-0604` Testes anti-cross-organizacao.
- `BF-0605` Testes anti-cross-fornecedor.
- `BF-0606` Plano E2E aprovado pelo dono.
- `BF-0607` Execucao E2E.
- `BF-0608` Percy para telas principais.
- `BF-0609` QA final.

Agentes:

- QA.
- Backend Produto.
- Frontend Produto.
- Coordenador.
- Lider.

Dependencias:

- Onda 4 concluida para MVP.
- Onda 5 concluida para versao integrada.

Entregaveis:

- Relatorio QA.
- Lista de pendencias ou aprovacao.
- Evidencias de testes.

---

## 8. Tasks Priorizadas

### P0 — Bloqueadoras de seguranca

- `BF-P0-01` Nenhuma cotacao por ID puro.
- `BF-P0-02` Fornecedor ve apenas solicitacoes destinadas a ele.
- `BF-P0-03` Comprador ve apenas cotacoes da sua Organizacao/Workspace.
- `BF-P0-04` Token publico com expiracao e uso unico.
- `BF-P0-05` Frontend valida respostas com Zod.
- `BF-P0-06` Remover `PrismaClient` direto do produto.
- `BF-P0-07` Acesso ao banco via `@gravity/tenant-resolver`.
- `BF-P0-08` Testes anti-cross-organizacao e anti-cross-fornecedor.

### P1 — MVP funcional

- `BF-P1-01` Criar cotacao.
- `BF-P1-02` Cadastrar fornecedor.
- `BF-P1-03` Disparar solicitacao.
- `BF-P1-04` Responder cotacao via token.
- `BF-P1-05` Responder cotacao via portal autenticado.
- `BF-P1-06` Comparar propostas.
- `BF-P1-07` Aprovar vencedor.
- `BF-P1-08` Calcular savings.
- `BF-P1-09` Exibir dashboard comprador.
- `BF-P1-10` Exibir dashboard fornecedor.

### P2 — Complementares

- `BF-P2-01` Rating global controlado.
- `BF-P2-02` Tabela de precos do fornecedor.
- `BF-P2-03` Auto-resposta por tabela.
- `BF-P2-04` Importacao em bloco.
- `BF-P2-05` Exportacoes/relatorios.
- `BF-P2-06` Gabi para analise de propostas.
- `BF-P2-07` Email/WhatsApp reais.
- `BF-P2-08` Monetizacao.

---

## 9. Agentes e Responsabilidades

| Agente | Responsabilidade |
|---|---|
| Lider | Priorizar ondas, liberar inicio, resolver decisao de produto. |
| Coordenador | Schema, migrations, contratos, validacao tecnica de ondas. |
| Configurador Backend | Onboarding, categoria de Organizacao, vinculos, permissoes. |
| Configurador Frontend | Telas de onboarding, usuarios, HUB. |
| Shell/Frontend | Sincronizacao `/me`, HUB e navegacao entre contextos. |
| Produto BID Frete Backend | Rotas, engines, seguranca de cotacoes e respostas. |
| Produto BID Frete Frontend | Telas comprador/fornecedor e contratos Zod. |
| Servicos Tenant | Email, WhatsApp, Historico, Notificacoes, Relatorios, Gabi. |
| QA | Revisao final, testes unitarios/funcionais/E2E, Percy. |
| DevOps | Variaveis, deploy, observabilidade e pipelines. |

---

## 10. Locais de Trabalho

### Produto BID Frete

- `produto/bid-frete/client/src/App.tsx`
- `produto/bid-frete/client/src/pages/`
- `produto/bid-frete/client/src/shared/api.ts`
- `produto/bid-frete/client/src/shared/types.ts`
- `produto/bid-frete/client/src/shared/config.ts`
- `produto/bid-frete/server/src/routes/`
- `produto/bid-frete/server/src/services/`
- `produto/bid-frete/server/src/connectors/`
- `produto/bid-frete/server/src/middleware/`
- `produto/bid-frete/server/prisma/fragment.prisma`
- `produto/bid-frete/server/prisma/schema.base.prisma`

### Configurador

- `servicos-global/configurador/server/routes/me.ts`
- `servicos-global/configurador/server/routes/users.ts`
- `servicos-global/configurador/server/routes/auth.ts`
- `servicos-global/configurador/server/services/permissionsService.ts`
- `servicos-global/configurador/src/pages/SelecionarWorkspace.tsx`
- `servicos-global/configurador/src/pages/Hub.tsx`
- `servicos-global/configurador/src/pages/workspace/Usuarios.tsx`

### Documentacao

- `documentos-tecnicos/produto/bid-frete/ARQUITETURA.md`
- `documentos-tecnicos/produto/bid-frete/bid-frete.md`
- `documentos-tecnicos/produto/bid-frete/PLANO-REFATORACAO-DDD-E-ENTREGA.md`

### Testes

- `testes/testes-unitarios/produtos/bid-frete/`
- `testes/testes-funcionais/produtos/bid-frete/`
- `testes/testes-e2e/produtos/bid-frete/`
- `testes/testes-unitarios/plano-de-testes/`
- `testes/testes-funcionais/plano-de-testes/`
- `testes/testes-e2e/plano-de-testes/`

---

## 11. Contratos e Rotas a Alinhar

### Divergencias ja identificadas

- Front chama `/api/v1/bid-frete/master-data/...`; backend expoe `/api/v1/master-data/...`.
- Front chama `/portal/pendentes`; backend expoe `/portal/cotacoes-pendentes`.
- Front chama `/portal/public/:token`; backend expoe `/portal/public/cotacao/:token`.
- Front chama `/portal/public/:token/responder`; backend expoe `/portal/public/responder/:token`.
- Front chama `/comparativo/:id/ranking`; backend expoe `GET /comparativo/:cotacaoId`.
- `types.ts` nao bate com Prisma em campos como `valor_alvo`, `moeda_alvo`, `anonima`, `token_publico`, `validade`, `score_*`, `aprovada`.

### Regra de correcao

Toda correcao de contrato deve atualizar na mesma entrega:

- Rota backend.
- Schema Zod de request.
- Schema Zod de response.
- API client.
- Types derivados de Zod.
- Consumidores React.
- Teste funcional.
- Contract test.
- Documentacao.

---

## 12. Plano de Testes

### 12.1 Unitarios

Local:

```text
testes/testes-unitarios/produtos/bid-frete/
```

Suites minimas:

- `bid-engine.test.ts`
- `comparativo-engine.test.ts`
- `savings-engine.test.ts`
- `rating-engine.test.ts`
- `portal-token.test.ts`
- `schemas-zod.test.ts`
- `permissoes-fornecedor.test.ts`

Cobertura minima:

- 70% geral.
- 80% nas engines criticas.

### 12.2 Funcionais

Local:

```text
testes/testes-funcionais/produtos/bid-frete/
```

Suites minimas:

- `cotacoes.test.ts`
- `fornecedores.test.ts`
- `solicitacoes-proposta.test.ts`
- `respostas-fornecedor.test.ts`
- `comparativo.test.ts`
- `portal-publico.test.ts`
- `portal-fornecedor.test.ts`
- `dashboard.test.ts`
- `anti-cross-organizacao.test.ts`
- `anti-cross-fornecedor.test.ts`

Casos obrigatorios:

- Comprador A nao ve cotacao da Organizacao B.
- Comprador A workspace 1 nao ve cotacao do workspace 2 sem permissao.
- Fornecedor A nao ve solicitacao enviada ao Fornecedor B.
- Fornecedor A ve suas solicitacoes em mais de uma Organizacao.
- Token expirado falha.
- Token ja usado falha.
- Cotacao nao enviada ao fornecedor nao aparece no portal.

### 12.3 Contract tests

Obrigatorio para:

- `/cotacoes`
- `/fornecedores`
- `/solicitacoes-proposta`
- `/respostas`
- `/comparativo`
- `/portal`
- `/portal-publico`
- `/dashboard`

Regras:

- Response de API sempre validado por Zod.
- Frontend deriva tipos de schemas ou valida antes de usar.
- Remover, renomear ou mudar tipo de campo sem versionar deve quebrar teste.

### 12.4 E2E

Local:

```text
testes/testes-e2e/produtos/bid-frete/
```

Plano E2E precisa ser aprovado pelo dono antes da execucao.

Fluxos obrigatorios:

- Onboarding comprador.
- Onboarding fornecedor autonomo.
- Convite fornecedor por comprador.
- Fornecedor com multiplas Organizacoes.
- Criar cotacao.
- Disparar cotacao para fornecedor.
- Responder por token.
- Responder autenticado.
- Comparar propostas.
- Aprovar vencedor.
- Validar que fornecedor B nao ve cotacao do fornecedor A.
- Validar que Organizacao Y nao ve cotacao da Organizacao X.

### 12.5 Percy / visual

Snapshots minimos:

- Dashboard comprador vazio.
- Dashboard comprador com dados.
- Lista de cotacoes.
- Nova cotacao.
- Detalhe cotacao.
- Comparativo.
- Portal fornecedor.
- Responder cotacao.
- HUB fornecedor.
- Estados de erro e loading.

---

## 13. Criterios de Aceite do MVP

O MVP do BID Frete esta pronto quando:

- Comprador cria cotacao.
- Comprador cadastra fornecedor.
- Comprador dispara solicitacao para fornecedor.
- Fornecedor responde por token publico.
- Fornecedor responde autenticado.
- Comprador compara propostas.
- Comprador aprova vencedor.
- Sistema calcula economia.
- Comprador nao ve dados de outra Organizacao/Workspace.
- Fornecedor nao ve cotacoes de outro fornecedor.
- Contratos front/back estao validados por Zod.
- Unitarios e funcionais passam.
- Plano E2E aprovado pelo dono.
- QA nao encontra violacao dos 9 Mandamentos.

---

## 14. Definition of Done

Nenhuma entrega sera considerada pronta sem:

- TypeScript strict.
- Sem `any` explicito.
- Sem `@ts-ignore`.
- Sem `PrismaClient` direto em produto.
- Sem autorizacao via Clerk `publicMetadata`.
- Sem `fetch().json()` sem Zod.
- Rotas com validacao Zod.
- Erros via `AppError`.
- Acesso ao banco via tenant resolver.
- Testes unitarios.
- Testes funcionais.
- Teste anti-cross-organizacao.
- Teste anti-cross-fornecedor.
- Documentacao atualizada.
- QA acionado apos entrega.

---

## 15. Riscos Principais

| Risco | Severidade | Mitigacao |
|---|---|---|
| Fornecedor ver cotacao de outro fornecedor | Critica | Query sempre por solicitacao destinada ao fornecedor. |
| Organizacao ver cotacao de outra Organizacao | Critica | Schema-per-organizacao + tenant resolver + testes anti-cross. |
| Workspace acessar cotacao de outro workspace | Alta | Permissao granular por workspace. |
| Token publico reutilizado | Alta | Status, expiracao e uso unico. |
| Rating global vazar detalhes | Alta | Apenas metricas agregadas, sem payload de cotacoes. |
| Front/back divergirem | Alta | Zod e contract tests. |
| Servicos secundarios bloquearem MVP | Media | Fire-and-forget, feature flags e degradacao controlada. |
| Refatoracao conflitar com trabalho paralelo | Alta | Aguardar, branch propria e validar git antes de iniciar. |

---

## 16. Perguntas Ainda Abertas

- Nome final da categoria da Organizacao: manter `categoria_organizacao` ou usar outro nome DDD aprovado?
- Organizacao com `categoria_organizacao = SUPPLIER` pode contratar produtos como compradora futuramente ou precisa virar `MIXED`?
- Quais permissoes granulares exatas do BID Frete no Configurador?
- Monetizacao entra no MVP ou permanece desligada?
- Rating global sera visivel para compradores em quais detalhes?
- Tabela de precos do fornecedor pertence a Organizacao propria do fornecedor ou e replicada por comprador?
- Portal publico pode permitir anexos ou apenas campos estruturados?

---

## 17. Proxima Acao Recomendada

Enquanto a refatoracao principal segue em paralelo, manter este documento como base de alinhamento.

Quando liberado:

1. Criar branch `bid-frete-ddd`.
2. Revalidar estado atual do BID Frete.
3. Confirmar decisoes abertas com o dono.
4. Executar Onda 1.
5. So iniciar Onda 3 depois de Configurador/HUB fornecedor estarem definidos.

---

## 18. Referencias

- `skills/governanca/9-mandamentos/SKILL.md`
- `skills/governanca/agent-policy/SKILL.md`
- `skills/governanca/code-standards/SKILL.md`
- `skills/governanca/lei/ddd-nomenclatura/SKILL.md`
- `skills/seguranca/permissoes/SKILL.md`
- `skills/produtos-gravity/configurador/SKILL.md`
- `skills/governanca/lei/isolamento-organizacao/SKILL.md`
- `skills/testes/padroes-vitest-playwright/SKILL.md`
- `skills/papeis/qa/SKILL.md`
- `skills/papeis/coordenador/SKILL.md`
- `skills/papeis/lider/SKILL.md`
- `documentos-tecnicos/produto/bid-frete/ARQUITETURA.md`
- `documentos-tecnicos/produto/bid-frete/bid-frete.md`
