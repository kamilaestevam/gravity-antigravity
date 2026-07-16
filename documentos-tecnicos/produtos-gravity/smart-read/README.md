# Smart Docs � Documenta��o T�cnica

> **Produto:** `smart-read`  
> **C�digo:** `servicos-global/produto/smart-read/`  
> **Skill operacional:** [`skills/produtos-gravity/smart-read/SKILL.md`](../../../skills/produtos-gravity/smart-read/SKILL.md)

---

## �ndice

| Documento | Conte�do |
|-----------|----------|
| [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) | **Onde vive cada dado:** banco DATI = leituras reais (PDF, OCR, extra��o); Postgres Gravity = snapshot, progresso, pain�is |
| [SMART-READ-CRIAR-PEDIDO-TECNICO.md](./SMART-READ-CRIAR-PEDIDO-TECNICO.md) | **Ponte Pedido (+ Novo → Smart Docs):** rotas S2S, 4 camadas, migration `conversao_leitura_pedido_smart_read` (TASK-000408) |
| [REQUISITOS-TECNICOS.md](./REQUISITOS-TECNICOS.md) | **Rate limit (100 req/min)**, chamadas HTTP no mount da Lista, upload 50 MB, pagina��o, erro 429 � SSOT limites e API |
| [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) | Dashboard Insights: acerto/erro, emissor respons�vel, contrato BFF, rankings |
| [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) | Lista por workspace, layout/pagina��o/pain�is, BFF leituras, progresso por usu�rio, nome do wizard, **KPI cards �13**, **status de fluxo �14** (funda��o + wiring pendente) |
| [ANALISE-DE-RISCOS-TECNICO.md](./ANALISE-DE-RISCOS-TECNICO.md) | **Aba An�lise de Riscos:** V1 determin�stico, piloto LLM (V2), fundamenta��o NCM/lei/RAG (V3) |
| [NOVA-LEITURA-PASSO-UM-TECNICO.md](./NOVA-LEITURA-PASSO-UM-TECNICO.md) | **Passo 1 � Anexar:** layout container stepper, upload, sidebar, checklist EMT 11 itens |
| [NOVA-LEITURA-PASSO-DOIS-TECNICO.md](./NOVA-LEITURA-PASSO-DOIS-TECNICO.md) | **Passo 2 � An�lise:** dashboard m�tricas, pipeline IA, globo, polling, checklist EMT 10 itens, suite 000151�000155 |
| [NOVA-LEITURA-PASSO-TRES-TECNICO.md](./NOVA-LEITURA-PASSO-TRES-TECNICO.md) | **Passo 3 — Conferência:** grid dt-*, resumo triplo (usuário/Gravity/riscos), modal checklist, stores marcação, toolbar, campo data |
| [Barra de status dos campos (`.dt-row-status`)](../../ux/design-system/padrao-dt-row-status-campos.md) | **Regra oficial:** cinza vazio, verde preenchido, roxo �Alterado� na confer�ncia (Smart Docs); Processo sem estado roxo |

---

## Pain�is da lista (padr�o Pedido/BID)

O Smart Docs replica o **mesmo model e contrato** de `ListaPainelUsuarioGlobal` (`lista_painel_usuario_global` no banco `gravity-smart-read`), com `id_produto_gravity = 'smart-read'`. SSOT do contrato transversal: [PAINEL-LISTA-CONTRATO.md](../pedido/PAINEL-LISTA-CONTRATO.md).

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

## Visualiza��es (abas)

Seletor em `client/src/components/SmartReadVisualizacaoTabs.tsx`.

| Aba | Rota | Estado | Vis�vel |
|-----|------|--------|---------|
| Insights | `/smart-read/insights` | Implementado (cockpit operacional, **default**) | **Sim** |
| Lista | `/smart-read/lista` | Implementado | **Sim** |
| Dashboard | `/smart-read/dashboard` | Placeholder ("em breve") | **Oculto** |
| Kanban | `/smart-read/kanban` | Implementado | **Oculto** |

> **Dashboard e Kanban est�o ocultos do seletor** (TASK-000306). As rotas continuam existindo; apenas os bot�es das abas foram removidos do array `TABS`. Para reexibir, basta voltar as entradas `dashboard` e `kanban` (e seus �cones `ChartBar` / `Kanban`).

---

## Rotas de entrada (configurador)

O Smart Docs roda **embutido** no configurador (`/smart-read/*`). Rotas internas do produto (`lista`, `insights`, �) s�o **relativas** no `App.tsx` do Smart Docs � mesmo padr�o do BID Frete.

| URL de entrada | Destino can�nico | Onde |
|----------------|------------------|------|
| `/smart-read` | `/smart-read/insights` | `configurador/src/App.tsx` + server 301 |
| `/smart-read-` | `/smart-read/insights` | typo/bookmark legado (h�fen solto no final) |
| `/produto/smart-read` | `/smart-read/insights` | `configurador/src/App.tsx` + server 301 |
| `/produto/smart-read-` | `/smart-read/insights` | idem typo com prefixo legado |
| `/produto/smart-read/*` | `/smart-read/*` | `NavigateComPrefixo` (legado 90 dias) |

**SSOT da entrada:** `ROTA_ENTRADA_SMART_READ` em `servicos-global/shell/utils/resolver-rota-produto.ts` (exportada via `@gravity/shell`). Hub, Core e puzzle consomem `resolverRotaProdutoGravity('smart-read')`.

**N�o fazer:** rotas absolutas `/smart-read/lista` dentro do `Routes` do produto embutido � quebra match local e deixa a tela em branco.

---

## Menu lateral (padr�o do sistema)

Configurado em `client/src/shared/config.ts` (`PRODUCT_CONFIG.navigation`) e mapeado para `MenuLateralGlobal` em `client/src/App.tsx`. Segue o padr�o dos demais produtos (Pedido/BID):

| Grupo / item | Rota | Observa��o |
|--------------|------|------------|
| Meu Espa�o ? Minhas Atividades / Email / WhatsApp | `/hub` | Desabilitados (badge "Em Breve") |
| Smart Docs (divisor) ? Lista | `/smart-read/lista` | Acesso direto � lista (toggle Insights\|Lista no topo) |
| Hist�rico | `/workspace/historico-organizacao?id_produto_historico_log=smart-read` | Link externo (tela centralizada do Configurador) |
| Configura��es | `/smart-read/configuracoes` | Ver abaixo |

---

## Configura��es (`/smart-read/configuracoes`)

Tela em `client/src/pages/configuracoes-smart-read/`, com paridade de layout 1:1 com a Configura��es do Pedido (abas de visualiza��o no topo + sidebar de categorias; s� a categoria ativa � renderizada). Categorias: **Card**, **Vis�o Geral**, **Tabelas**, **Colunas Personalizadas** (criar/renomear/ocultar/excluir + reordenar por drag).

> **Estado � local (`useState`)** � o Smart Docs ainda n�o tem backend de prefer�ncias. Sem bot�o "Salvar" e sem mock de persist�ncia (Mandamentos 05/08). As prefer�ncias n�o sobrevivem ao refresh at� existir endpoint/persist�ncia.

---

## Entregas recentes (2026-06)

| Task / entrega | Escopo |
|----------------|--------|
| **PR #394** (merge 2026-06-22) | Lista com paridade Pedido/BID: altura flex at� o rodap�, contagem/pagina��o no GTV, colunas/filtros/exporta��o, pain�is persistidos em Postgres � ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) �9�11 |
| TASK-000311 | Layout lista (viewport flex) + rodap� `N leituras � M arquivos � p�gina X de Y` |
| TASK-000310 | Colunas din�micas, filtros por coluna, seletor/arrastar colunas, exporta��o multi-formato |
| Hotfix rotas (2026-06) | Entrada `/smart-read` e `/produto/smart-read` ? `/smart-read/insights`; rotas internas relativas no produto embutido |
| TASK-000308 | Lista real (BFF + progresso Postgres), link nome?retomar wizard, nome customizado (sessao.nome), recarregar lista ao fechar modal � ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) |
| TASK-000307 | Menu lateral no padr�o do sistema + tela de Configura��es (estado local; PR #388) |
| TASK-000306 | Ocultar abas Dashboard e Kanban do seletor (mantidas s� Insights e Lista) |
| TASK-000318 | Snapshot de leitura no Postgres Gravity (`snapshot_leitura_smart_read`) � ver [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) |
| TASK-000303 | Dashboard Insights (KPIs, savings, rankings) � ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) |
| **PR #409** (merge 2026-06-23) | Insights: modal **Base de c�lculo** (tempos do estudo + observa��es documento m�dio), KPI Saving em Erros = contagem de campos, fallback degradado, cadeia GET snapshot?legado?progresso � ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) �5�6 e [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) �4.6 |
| **TASK-000317** / PR #409 | Lista: colunas de **m�tricas da leitura** (documentos, campos, saving, tempos) � ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) �12 |
| **TASK-000321** | Lista: ordem dos KPI cards (Performance de acertos = 2�) + card **Recursos reduzidos** agregando saving das leituras vis�veis � ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) �13 |
| **PR #448** (merge 2026-06-24) | Saving SSOT unificado (TASK-334): recursos reduzidos = soma base manual ? cron�metro; wizard passo 2, insights e lista alinhados � ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) �6 |
| **TASK-000324** | Lista: faixa **Pain�is** roxa no chrome da tabela (criar/trocar/renomear/reordenar/excluir) + segmento �Vis�o geral� / �Transa��es API� na faixa unificada � paridade Pedido/BID Frete � ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) �11 |
| **PR #449** (merge 2026-06-25) | Docs status fluxo (�14), fix crash wizard, fetch s� aba ativa, rate limit off em dev � ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) �6 e �9 |
| **TASK-000334** / PR #445 | Wizard passo 1: exclus�o de arquivo com confirma��o (modal acima do wizard), persist�ncia local/progresso; `DELETE` legado ainda `501` � ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) �3 |
| **Status de fluxo** (2026-06) | **Funda��o:** migration `20260625120000`, colunas `status_fluxo_*`, SSOT `shared/status-fluxo-leitura-smart-read.ts`, pill isolada + testes; **pendente:** wiring BFF/Lista (�14.3) � ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) �14 |
| **TASK-000343** | Passo 2: suite testes 000151�000155, `tempo_processo_total_ms`, Base de c�lculo no wizard � [NOVA-LEITURA-PASSO-DOIS-TECNICO.md](./NOVA-LEITURA-PASSO-DOIS-TECNICO.md) |
| Erros passo 2 (2026-06) | Sidebar motivo amigavel + nao sera cobrado; mapeamento legado Excel/XML � [NOVA-LEITURA-PASSO-DOIS-TECNICO.md](./NOVA-LEITURA-PASSO-DOIS-TECNICO.md) �7 |
| Refatora��o Insights | Fonte �nica acerto/erro por edi��o do usu�rio; emissor respons�vel por tipo de documento; `dados_original` no contrato bilateral |
| **TASK-000357** | Contador discreto tokens Gemini (sidebar passo 2+), tabela `log_uso_llm_leitura_smart_read`, rotas `GET /leituras/tokens/*` - ver [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) secao 3.1 e [NOVA-LEITURA-PASSO-TRES-TECNICO.md](./NOVA-LEITURA-PASSO-TRES-TECNICO.md) secao 6 |
| **TASK-000403** | Passo 4 (Resultado): fix download "Baixar pacote DATI". O DATI responde HTTP 404 "Task result data not found" no `GET /download-tasks/{id}` enquanto o worker `GENERATE_READING_DOWNLOAD` ainda gera o ZIP. `obterStatusTarefaDownloadLegado` (BFF) passa a tratar esse 404 especifico como status `processing` (nao-terminal), deixando o poll do front (limite 120s) prosseguir ate `completed` ou timeout honesto; outros 404 (ex.: "Task not found") continuam ruidosos (Mand. 08). Front emite `console.warn` estruturado UNICO no timeout (nunca por poll). Testes: `testes/testes-unitarios/produto-gravity/smart-read/obter-status-tarefa-download-legado.test.ts` (3 casos) + suite FUN 000368 |
| **TASK-000408** | Ponte **Pedido → Smart Docs → criar pedido:** `+ Novo` redirect, wizard passo 4, S2S Pedido, tabela `conversao_leitura_pedido_smart_read`, migration `20260703230000` — ver [SMART-READ-CRIAR-PEDIDO-TECNICO.md](./SMART-READ-CRIAR-PEDIDO-TECNICO.md) |
