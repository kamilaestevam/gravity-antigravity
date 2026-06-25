# Smart Read ù Documentaùùo Tùcnica

> **Produto:** `smart-read`  
> **Cùdigo:** `servicos-global/produto/smart-read/`  
> **Skill operacional:** [`skills/produtos-gravity/smart-read/SKILL.md`](../../../skills/produtos-gravity/smart-read/SKILL.md)

---

## ùndice

| Documento | Conteùdo |
|-----------|----------|
| [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) | **Onde vive cada dado:** banco DATI = leituras reais (PDF, OCR, extraùùo); Postgres Gravity = snapshot, progresso, painùis |
| [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) | Dashboard Insights: acerto/erro, emissor responsùvel, contrato BFF, rankings |
| [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) | Lista por workspace, layout/paginaùùo/painùis, BFF leituras, progresso por usuùrio, nome do wizard, **KPI cards ù13**, **status de fluxo ù14** (fundaùùo + wiring pendente) |
| [ANALISE-DE-RISCOS-TECNICO.md](./ANALISE-DE-RISCOS-TECNICO.md) | **Aba Anùlise de Riscos:** V1 determinùstico, piloto LLM (V2), fundamentaùùo NCM/lei/RAG (V3) |
| [NOVA-LEITURA-PASSO-UM-TECNICO.md](./NOVA-LEITURA-PASSO-UM-TECNICO.md) | **Passo 1 ù Anexar:** layout container stepper, upload, sidebar, checklist EMT 11 itens |
| [NOVA-LEITURA-PASSO-DOIS-TECNICO.md](./NOVA-LEITURA-PASSO-DOIS-TECNICO.md) | **Passo 2 ù Anùlise:** dashboard mùtricas, pipeline IA, globo, polling, checklist EMT 10 itens, suite 000151ù000155 |
| [Barra de status dos campos (`.dt-row-status`)](../../ux/design-system/padrao-dt-row-status-campos.md) | **Regra oficial:** cinza vazio, verde preenchido, roxo ùAlteradoù na conferùncia (Smart Read); Processo sem estado roxo |

---

## Painùis da lista (padrùo Pedido/BID)

O Smart Read replica o **mesmo model e contrato** de `ListaPainelUsuarioGlobal` (`lista_painel_usuario_global` no banco `gravity-smart-read`), com `id_produto_gravity = 'smart-read'`. SSOT do contrato transversal: [PAINEL-LISTA-CONTRATO.md](../pedido/PAINEL-LISTA-CONTRATO.md).

| Camada | Caminho |
|--------|---------|
| Model | `prisma/fragment.prisma` ? `ListaPainelUsuarioGlobal` |
| API | `GET\|POST\|PUT\|DELETE /api/v1/smart-read/lista/paineis` |
| Zod | `shared/listaPainelConfigSchema.ts`, `shared/listaPainelApiSchema.ts` |
| Hook | `client/src/shared/use-lista-painel-smart-read.ts` |
| UI faixa | `client/src/components/SmartReadListaPainelBar.tsx` + `client/src/shared/smart-read-lista-layout.css` |

---

## Identidade do produto

| Atributo | Valor |
|----------|-------|
| `id_produto_gravity` | `smart-read` |
| Client | `servicos-global/produto/smart-read/client/` |
| Server (BFF) | `servicos-global/produto/smart-read/server/` |

---

## Visualizaùùes (abas)

Seletor em `client/src/components/SmartReadVisualizacaoTabs.tsx`.

| Aba | Rota | Estado | Visùvel |
|-----|------|--------|---------|
| Insights | `/smart-read/insights` | Implementado (cockpit operacional, **default**) | **Sim** |
| Lista | `/smart-read/lista` | Implementado | **Sim** |
| Dashboard | `/smart-read/dashboard` | Placeholder ("em breve") | **Oculto** |
| Kanban | `/smart-read/kanban` | Implementado | **Oculto** |

> **Dashboard e Kanban estùo ocultos do seletor** (TASK-000306). As rotas continuam existindo; apenas os botùes das abas foram removidos do array `TABS`. Para reexibir, basta voltar as entradas `dashboard` e `kanban` (e seus ùcones `ChartBar` / `Kanban`).

---

## Rotas de entrada (configurador)

O Smart Read roda **embutido** no configurador (`/smart-read/*`). Rotas internas do produto (`lista`, `insights`, ù) sùo **relativas** no `App.tsx` do Smart Read ù mesmo padrùo do BID Frete.

| URL de entrada | Destino canùnico | Onde |
|----------------|------------------|------|
| `/smart-read` | `/smart-read/insights` | `configurador/src/App.tsx` + server 301 |
| `/smart-read-` | `/smart-read/insights` | typo/bookmark legado (hùfen solto no final) |
| `/produto/smart-read` | `/smart-read/insights` | `configurador/src/App.tsx` + server 301 |
| `/produto/smart-read-` | `/smart-read/insights` | idem typo com prefixo legado |
| `/produto/smart-read/*` | `/smart-read/*` | `NavigateComPrefixo` (legado 90 dias) |

**SSOT da entrada:** `ROTA_ENTRADA_SMART_READ` em `servicos-global/shell/utils/resolver-rota-produto.ts` (exportada via `@gravity/shell`). Hub, Core e puzzle consomem `resolverRotaProdutoGravity('smart-read')`.

**Nùo fazer:** rotas absolutas `/smart-read/lista` dentro do `Routes` do produto embutido ù quebra match local e deixa a tela em branco.

---

## Menu lateral (padrùo do sistema)

Configurado em `client/src/shared/config.ts` (`PRODUCT_CONFIG.navigation`) e mapeado para `MenuLateralGlobal` em `client/src/App.tsx`. Segue o padrùo dos demais produtos (Pedido/BID):

| Grupo / item | Rota | Observaùùo |
|--------------|------|------------|
| Meu Espaùo ? Minhas Atividades / Email / WhatsApp | `/hub` | Desabilitados (badge "Em Breve") |
| Smart Read (divisor) ? Lista | `/smart-read/lista` | Acesso direto ù lista (toggle Insights\|Lista no topo) |
| Histùrico | `/workspace/historico-organizacao?id_produto_historico_log=smart-read` | Link externo (tela centralizada do Configurador) |
| Configuraùùes | `/smart-read/configuracoes` | Ver abaixo |

---

## Configuraùùes (`/smart-read/configuracoes`)

Tela em `client/src/pages/configuracoes-smart-read/`, com paridade de layout 1:1 com a Configuraùùes do Pedido (abas de visualizaùùo no topo + sidebar de categorias; sù a categoria ativa ù renderizada). Categorias: **Card**, **Visùo Geral**, **Tabelas**, **Colunas Personalizadas** (criar/renomear/ocultar/excluir + reordenar por drag).

> **Estado ù local (`useState`)** ù o Smart Read ainda nùo tem backend de preferùncias. Sem botùo "Salvar" e sem mock de persistùncia (Mandamentos 05/08). As preferùncias nùo sobrevivem ao refresh atù existir endpoint/persistùncia.

---

## Entregas recentes (2026-06)

| Task / entrega | Escopo |
|----------------|--------|
| **PR #394** (merge 2026-06-22) | Lista com paridade Pedido/BID: altura flex atù o rodapù, contagem/paginaùùo no GTV, colunas/filtros/exportaùùo, painùis persistidos em Postgres ù ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) ù9ù11 |
| TASK-000311 | Layout lista (viewport flex) + rodapù `N leituras ù M arquivos ù pùgina X de Y` |
| TASK-000310 | Colunas dinùmicas, filtros por coluna, seletor/arrastar colunas, exportaùùo multi-formato |
| Hotfix rotas (2026-06) | Entrada `/smart-read` e `/produto/smart-read` ? `/smart-read/insights`; rotas internas relativas no produto embutido |
| TASK-000308 | Lista real (BFF + progresso Postgres), link nome?retomar wizard, nome customizado (sessao.nome), recarregar lista ao fechar modal ù ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) |
| TASK-000307 | Menu lateral no padrùo do sistema + tela de Configuraùùes (estado local; PR #388) |
| TASK-000306 | Ocultar abas Dashboard e Kanban do seletor (mantidas sù Insights e Lista) |
| TASK-000318 | Snapshot de leitura no Postgres Gravity (`snapshot_leitura_smart_read`) ù ver [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) |
| TASK-000303 | Dashboard Insights (KPIs, savings, rankings) ù ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) |
| **PR #409** (merge 2026-06-23) | Insights: modal **Base de cùlculo** (tempos do estudo + observaùùes documento mùdio), KPI Saving em Erros = contagem de campos, fallback degradado, cadeia GET snapshot?legado?progresso ù ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) ù5ù6 e [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) ù4.6 |
| **TASK-000317** / PR #409 | Lista: colunas de **mùtricas da leitura** (documentos, campos, saving, tempos) ù ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) ù12 |
| **TASK-000321** | Lista: ordem dos KPI cards (Performance de acertos = 2ù) + card **Recursos reduzidos** agregando saving das leituras visùveis ù ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) ù13 |
| **PR #448** (merge 2026-06-24) | Saving SSOT unificado (TASK-334): recursos reduzidos = soma base manual ? cronùmetro; wizard passo 2, insights e lista alinhados ù ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) ù6 |
| **TASK-000324** | Lista: faixa **Painùis** roxa no chrome da tabela (criar/trocar/renomear/reordenar/excluir) + segmento ùVisùo geralù / ùTransaùùes APIù na faixa unificada ù paridade Pedido/BID Frete ù ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) ù11 |
| **PR #449** (merge 2026-06-25) | Docs status fluxo (ù14), fix crash wizard, fetch sù aba ativa, rate limit off em dev ù ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) ù6 e ù9 |
| **TASK-000334** / PR #445 | Wizard passo 1: exclusùo de arquivo com confirmaùùo (modal acima do wizard), persistùncia local/progresso; `DELETE` legado ainda `501` ù ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) ù3 |
| **Status de fluxo** (2026-06) | **Fundaùùo:** migration `20260625120000`, colunas `status_fluxo_*`, SSOT `shared/status-fluxo-leitura-smart-read.ts`, pill isolada + testes; **pendente:** wiring BFF/Lista (ù14.3) ù ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) ù14 |
| **TASK-000343** | Passo 2: suite testes 000151ù000155, `tempo_analise_segundos`, Base de cùlculo no wizard ù [NOVA-LEITURA-PASSO-DOIS-TECNICO.md](./NOVA-LEITURA-PASSO-DOIS-TECNICO.md) |
| Refatoraùùo Insights | Fonte ùnica acerto/erro por ediùùo do usuùrio; emissor responsùvel por tipo de documento; `dados_original` no contrato bilateral |
