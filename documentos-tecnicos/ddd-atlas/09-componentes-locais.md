# Atlas DDD - Aba 9: Componentes Locais

> Gerado de planilha v52 em 2026-05-03 por `scripts/sob-demanda/gerar-atlas-ddd.py`.
> NAO edite manualmente. Re-execute o script apos mudanca na planilha mestre.

## Como ler

- **Produto**: produto/servico onde o componente vive.
- **Pasta**: pasta local dentro do produto (`components/`, `secoes/`, ...).
- **Arquivo DDD**: nome do arquivo apos rename DDD.
- **Componente DDD**: nome do componente React (PascalCase).
- **Paginas que usam**: paginas locais que importam o componente.
- **Path completo**: caminho do arquivo no monorepo.
- **Descricao**: o que o componente faz.
- **Alias historico**: nome antes do rename DDD.

Convencoes:
- Apenas valores DDD-finais. Nao mostra estado pre-rename.
- Onde aplicavel, coluna "Alias historico" mostra nome legado (util para grep e git log --follow).
- Linhas marcadas `—` na planilha estao no apendice (nao sao acionaveis).

## Tabela (22 linhas)

| Produto      | Pasta      | Arquivo DDD              | Componente DDD | Paginas que usam | Path completo                                                                   | Descricao                                                                                  | Alias historico                                      |
| ------------ | ---------- | ------------------------ | -------------- | ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Configurador | components | GabiOnboardingWidget.tsx |                |                  | servicos-global/configurador/src/components/GabiOnboardingWidget.tsx            | Widget de onboarding da Gabi exibido no Hub/Core — guia interativo do usuário.             | GabiOnboardingWidget.tsx \| GabiOnboardingWidget     |
| Configurador | components | HubBotao.tsx             |                | Core.tsx         | servicos-global/configurador/src/components/HubButton.tsx                       | Botão do Hub que lança um produto do catálogo no Shell.                                    | HubButton.tsx \| HubButton                           |
| Configurador | components | EcossistemaPremium.tsx   |                |                  | servicos-global/configurador/src/components/PremiumEcosystemPuzzle.tsx          | Visualização do ecossistema Premium (puzzle de produtos integrados).                       | PremiumEcosystemPuzzle.tsx \| PremiumEcosystemPuzzle |
| Configurador | layout     | AdminLayout.tsx          |                |                  | servicos-global/configurador/src/pages/admin/AdminLayout.tsx                    | Layout das telas administrativas (sidebar + outlet).                                       | AdminLayout.tsx \| AdminLayout                       |
| Configurador | layout     | WorkspaceLayout.tsx      |                |                  | servicos-global/configurador/src/pages/workspace/WorkspaceLayout.tsx            | Layout das telas do workspace (sidebar + outlet).                                          | WorkspaceLayout.tsx \| WorkspaceLayout               |
| Marketplace  | components | OnboardingPreview.tsx    |                | Home.tsx         | servicos-global/marketplace/src/components/flows/OnboardingPreview.tsx          | Preview visual do onboarding exibido na home do marketplace.                               | OnboardingPreview.tsx \| OnboardingPreview           |
| Marketplace  | components | Footer.tsx               |                |                  | servicos-global/marketplace/src/components/layout/Footer.tsx                    | Rodapé do marketplace público.                                                             | Footer.tsx \| Footer                                 |
| Marketplace  | components | Layout.tsx               |                |                  | servicos-global/marketplace/src/components/layout/Layout.tsx                    | Layout base do marketplace (navbar + outlet + footer).                                     | Layout.tsx \| Layout                                 |
| Marketplace  | components | Navbar.tsx               |                |                  | servicos-global/marketplace/src/components/layout/Navbar.tsx                    | Barra de navegação do marketplace público.                                                 | Navbar.tsx \| Navbar                                 |
| Produto      | components | CelulaAnexosColuna.tsx   |                |                  | produto/pedido/client/src/components/ConfiguracaoColunas/CelulaAnexosColuna.tsx | Célula especial da tabela de pedidos que renderiza anexos (thumbnails).                    | CelulaAnexosColuna.tsx \| CelulaAnexosColuna         |
| Produto      | components | GerenciadorColunas.tsx   |                |                  | produto/pedido/client/src/components/ConfiguracaoColunas/GerenciadorColunas.tsx | Gerenciador de colunas customizadas do tenant na tabela Pedido (CRUD de PedidoColuna).     | GerenciadorColunas.tsx \| GerenciadorColunas         |
| Produto      | components | BarraAcoesPedido.tsx     |                | ListaPedidos.tsx | produto/pedido/client/src/components/lista/BarraAcoesPedido.tsx                 | Toolbar com ações em lote para pedidos selecionados (excluir, duplicar, transferir, etc.). | BarraAcoesPedido.tsx \| BarraAcoesPedido             |
| Produto      | components | ColunasFilho.tsx         |                |                  | produto/pedido/client/src/components/lista/colunasFilho.tsx                     | Definições das colunas dos itens do pedido (tabela filho) — inclui fórmulas e formatação.  | colunasFilho.tsx \| ColunasFilho                     |
| Produto      | components | ColunasPai.tsx           |                |                  | produto/pedido/client/src/components/lista/colunasPai.tsx                       | Definições das colunas do pedido (tabela pai) — inclui fórmulas e formatação.              | colunasPai.tsx \| ColunasPai                         |
| Produto      | components | AnexosPainel.txt         |                |                  | produto/pedido/client/src/components/PainelAnexos.tsx                           | Painel lateral com lista de anexos do pedido.                                              | PainelAnexos.tsx \| PainelAnexos                     |
| Produto      | components | EtapaConfirmacao.tsx     |                |                  | produto/pedido/client/src/components/SmartImport/EtapaConfirmacao.tsx           | Etapa final do wizard SmartImport — confirma e aplica a importação.                        | EtapaConfirmacao.tsx \| EtapaConfirmacao             |
| Produto      | components | EtapaMapeamento.tsx      |                |                  | produto/pedido/client/src/components/SmartImport/EtapaMapeamento.tsx            | Etapa do wizard SmartImport — mapeamento de colunas da planilha ↔ campos do pedido (IA).   | EtapaMapeamento.tsx \| EtapaMapeamento               |
| Produto      | components | EtapaPreview.tsx         |                |                  | produto/pedido/client/src/components/SmartImport/EtapaPreview.tsx               | Etapa do wizard SmartImport — preview dos dados que serão importados.                      | EtapaPreview.tsx \| EtapaPreview                     |
| Produto      | components | EtapaUpload.tsx          |                |                  | produto/pedido/client/src/components/SmartImport/EtapaUpload.tsx                | Etapa inicial do wizard SmartImport — upload do arquivo Excel/CSV.                         | EtapaUpload.tsx \| EtapaUpload                       |
| Produto      | layout     | ProcessoLayout.tsx       |                |                  | produto/processo/client/src/pages/ProcessoLayout.tsx                            | Layout do produto Processo (abas internas).                                                | ProcessoLayout.tsx \| ProcessoLayout                 |
| Shell        | layout     | Layout.tsx               |                |                  | servicos-global/shell/Layout.tsx                                                | Layout base do Shell (navbar + outlet).                                                    | Layout.tsx \| Layout                                 |
| Tenant       | components | KPICard.tsx              |                |                  | servicos-global/tenant/dashboard/src/components/KPICard.tsx                     | Card genérico de KPI reutilizável no dashboard do tenant.                                  | KPICard.tsx \| KPICard                               |


## Apendice - Linhas SKIP / exempt (1 linhas)

Linhas onde o nome DDD principal foi marcado como `—` (nao acionavel: arquivo de teste, definicao Storybook, ruido de parsing, etc.).

| Produto      | Pasta | Arquivo DDD | Componente DDD | Paginas que usam | Path completo                                                     | Descricao                                                             | Alias historico                                      |
| ------------ | ----- | ----------- | -------------- | ---------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------- |
| Configurador | outro |             |                |                  | servicos-global/configurador/src/pages/E2ENotificacoesHarness.tsx | ⚠️ Test harness E2E para notificações — não é componente de produção. | E2ENotificacoesHarness.tsx \| E2ENotificacoesHarness |

