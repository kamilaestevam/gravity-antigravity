/**
 * dados-tutorial-opcional-simulador-pedido.ts — mapa de cliques por tela (demo landing Pedido)
 */

import type { TelaTutorialOpcional, ItemTutorialOpcional } from '../smart-doc/dados-tutorial-opcional-simulador-smart-doc'
import type { CenarioTransferSimulador } from './transferir-lista-simulador-pedido'

/** Passos de painéis repetidos em TODAS as telas contextuais do Dashboard */
export const EXPLORAR_PAINELS_DASHBOARD_PEDIDO: ItemTutorialOpcional[] = [
  {
    titulo: 'Painéis — faixa',
    descricao: 'Padrão, COMERCIAL e FINANCEIRO guardam layouts independentes — cada aba lembra seus próprios widgets',
    idAlvo: 'pedido-dashboard-faixa-paineis',
  },
  {
    titulo: 'Painéis — Padrão',
    descricao: 'Layout inicial com KPIs, GABI e gráficos — o painel ativo define qual grade você está editando',
    idAlvo: 'pedido-dashboard-painel-padrao',
  },
  {
    titulo: 'Painéis — COMERCIAL',
    descricao: 'Segunda vista salva — troque de aba sem misturar widgets com os outros painéis',
    idAlvo: 'pedido-dashboard-painel-comercial',
  },
  {
    titulo: 'Painéis — FINANCEIRO',
    descricao: 'Terceira vista para métricas financeiras — layout exclusivo desta aba',
    idAlvo: 'pedido-dashboard-painel-financeiro',
  },
  {
    titulo: 'Painéis — criar (+)',
    descricao: 'Use o + para nomear um painel novo — widgets adicionados ficam só neste painel',
    idAlvo: 'pedido-dashboard-painel-criar',
  },
]

function explorarComPaineisDashboard(passos: ItemTutorialOpcional[]): ItemTutorialOpcional[] {
  return [...EXPLORAR_PAINELS_DASHBOARD_PEDIDO, ...passos]
}

/** Passos de Configurações — criar coluna no Kanban (repetidos nas telas contextuais do Kanban) */
export const EXPLORAR_CONFIG_COLUNA_KANBAN: ItemTutorialOpcional[] = [
  {
    titulo: 'Config — menu lateral',
    descricao: 'Em Configurações você cria novas colunas do Kanban, renomeia etapas e define cores do pipeline',
    idAlvo: 'pedido-shell-nav-config',
  },
  {
    titulo: 'Config — ícone topo',
    descricao: 'Atalho rápido (engrenagem) para as mesmas preferências de colunas e automações',
    idAlvo: 'pedido-kanban-config-topo',
  },
  {
    titulo: 'Config — nova coluna',
    descricao: 'Em Configurações › Colunas, use + Nova coluna para adicionar etapas personalizadas ao board',
    idAlvo: 'pedido-kanban-config-topo',
  },
]

function explorarComConfigColunaKanban(passos: ItemTutorialOpcional[]): ItemTutorialOpcional[] {
  return [...EXPLORAR_CONFIG_COLUNA_KANBAN, ...passos]
}

export const TELAS_TUTORIAL_OPCIONAL_PEDIDO: Record<string, TelaTutorialOpcional> = {
  insights: {
    id: 'insights',
    titulo: 'Insights',
    resumo: 'Visão executiva — KPIs, mapa global com filtros, alertas e gráficos interativos.',
    explorar: [
      { titulo: '1. KPIs executivos', descricao: 'Passe o mouse em Rascunho, Aberto, Em andamento e Consolidado para ver detalhes', idAlvo: 'pedido-insights-kpis' },
      { titulo: '2. Abas do produto', descricao: 'Alterne Insights, Lista, Dashboard e Kanban — cada guia abre um modo diferente', idAlvo: 'pedido-shell-abas' },
      { titulo: '3. Painel Refinar mapa', descricao: 'Painel lateral com todos os filtros do globo — expanda cada seção do acordeão', idAlvo: 'pedido-insights-refinar-mapa' },
      { titulo: '4. Expandir mapa', descricao: 'Clique no ícone no canto do card para abrir o mapa em tela cheia', idAlvo: 'pedido-insights-mapa-expandir' },
      { titulo: '5. Contadores do mapa', descricao: 'Veja quantos terminais e rotas estão visíveis — atualiza ao filtrar', idAlvo: 'pedido-insights-refinar-contadores' },
      { titulo: '6. Recolher painel', descricao: 'Clique no botão lateral para alternar entre painel completo e menu compacto', idAlvo: 'pedido-insights-refinar-toggle' },
      { titulo: '7. Menu compacto', descricao: 'No modo recolhido, use os ícones — operação, origem, destino, empresas e status', idAlvo: 'pedido-insights-refinar-rail' },
      { titulo: '8. Regras do painel', descricao: 'Expanda ou recolha todas as seções e use Limpar filtros para resetar', idAlvo: 'pedido-insights-refinar-toolbar' },
      { titulo: '9. Filtro Operação', descricao: 'Marque Importação e/ou Exportação para refinar as rotas no globo', idAlvo: 'pedido-insights-refinar-operacao' },
      { titulo: '10. Filtro Origem', descricao: 'Expanda Origem e selecione países de embarque', idAlvo: 'pedido-insights-refinar-origem' },
      { titulo: '11. Filtro Destino', descricao: 'Expanda Destino e filtre por país de desembarque', idAlvo: 'pedido-insights-refinar-destino' },
      { titulo: '12. Exportadores', descricao: 'Restrinja o mapa por exportador — expanda a seção e marque empresas', idAlvo: 'pedido-insights-refinar-exportadores' },
      { titulo: '13. Importadores', descricao: 'Filtre por importador para ver só pedidos daquela empresa', idAlvo: 'pedido-insights-refinar-importadores' },
      { titulo: '14. Status', descricao: 'Combine status (Rascunho, Aberto, etc.) para refinar pins e rotas', idAlvo: 'pedido-insights-refinar-status' },
      { titulo: '15. Gire o globo', descricao: 'Arraste o mapa para rotacionar e explorar origens e destinos', idAlvo: 'pedido-insights-mapa-interacao' },
      { titulo: '16. Zoom e vista', descricao: 'Use +/−, alterne globo/mapa plano, reset e play/pause da rotação', idAlvo: 'pedido-insights-mapa-controles' },
      { titulo: '17. Linhas de rota', descricao: 'Clique no ícone de olho para exibir ou ocultar as linhas animadas entre portos', idAlvo: 'pedido-insights-mapa-linhas' },
      { titulo: '18. Legenda', descricao: 'Laranja = importação · Roxo = exportação — cores das rotas e dos pins', idAlvo: 'pedido-insights-mapa-legenda' },
      { titulo: '19. Pins e câmbio', descricao: 'Passe o mouse nos pinos — veja pedidos, contratos de câmbio e valores a pagar/receber', idAlvo: 'pedido-insights-mapa-pins' },
      { titulo: '20. Alertas', descricao: 'Confira pedidos atrasados, vencimentos e novos dos últimos 7 dias', idAlvo: 'pedido-insights-alertas' },
      { titulo: '21. Observações', descricao: 'Clique em um card de alerta para abrir a observação detalhada', idAlvo: 'pedido-insights-alertas-observacoes' },
      { titulo: '22. Funil', descricao: 'Passe o mouse nas etapas para ver a distribuição do pipeline', idAlvo: 'pedido-insights-funil' },
      { titulo: '23. Pedidos por mês', descricao: 'Compare volume dos últimos 6 meses entre importação e exportação', idAlvo: 'pedido-insights-pedidos-mes' },
      { titulo: '24. Donut de operação', descricao: 'Passe o mouse nas fatias para ver proporção importação × exportação', idAlvo: 'pedido-insights-donut-operacao' },
      { titulo: '25. Moedas', descricao: 'Passe o mouse em cada moeda para ver volume e percentual', idAlvo: 'pedido-insights-moedas' },
      { titulo: '26. Maior pedido', descricao: 'Veja o pedido de maior valor do período filtrado', idAlvo: 'pedido-insights-maior-pedido' },
      { titulo: '27. Top incoterms', descricao: 'Passe o mouse nas barras para ver participação de cada incoterm', idAlvo: 'pedido-insights-incoterms' },
      { titulo: '28. Taxa de aprovação', descricao: 'Compare pedidos em tempo vs. atrasados no período', idAlvo: 'pedido-insights-taxa-aprovacao' },
      { titulo: '29. Troque o workspace', descricao: 'Selecione outra filial no menu lateral para mudar o escopo dos dados', idAlvo: 'pedido-insights-seletor-workspace' },
      { titulo: '30. Vá para a Lista', descricao: 'Clique na aba Lista para ver pedidos editáveis em grade', idAlvo: 'pedido-shell-aba-lista' },
    ],
    avancar: {
      acao: 'Iniciar demonstração',
      titulo: 'Abra a Lista',
      descricao: 'Clique na aba Lista, depois em Novo → Pedido manual para criar um pedido',
      idAlvo: 'pedido-shell-aba-lista',
    },
  },
  historico: {
    id: 'historico',
    titulo: 'Histórico',
    resumo: 'Auditoria de ações no produto Pedido — última parada do menu lateral; use as abas acima para sair.',
    explorar: [
      {
        titulo: '1. Filtro do produto',
        descricao: 'O banner indica que os logs estão filtrados ao Pedido e aos últimos 30 dias',
        idAlvo: 'pedido-historico-banner',
      },
      {
        titulo: '2. KPIs de atividade',
        descricao: 'Total de eventos, volume dos últimos 7 dias e distribuição por status (sucesso, falha, parcial)',
        idAlvo: 'pedido-historico-kpis',
      },
      {
        titulo: '3. Tabela de auditoria',
        descricao: 'Data, ação, local, usuário e detalhes — use Buscar, filtros por coluna e Exportar',
        idAlvo: 'pedido-historico-tabela',
      },
      {
        titulo: '4. Menu lateral',
        descricao: 'Histórico e Configurações ficam na barra esquerda do módulo Pedido',
        idAlvo: 'pedido-shell-nav-historico',
      },
      {
        titulo: '5. Topo desativado',
        descricao:
          'Hub, busca, University e demais ícones do topo estão inativos — passe o mouse em cada um para ver o que existe no produto real',
        idAlvo: 'pedido-shell-hub-demo',
      },
      {
        titulo: '6. Como sair desta tela',
        descricao: 'Use as abas Insights, Lista, Dashboard ou Kanban logo acima para continuar explorando o Pedido',
        idAlvo: 'pedido-shell-abas',
      },
    ],
    avancar: {
      acao: 'Sair do Histórico',
      titulo: 'Clique na aba Lista',
      descricao:
        'Nesta demo o Hub não funciona. Clique em Lista, na faixa de abas acima, para voltar à grade de pedidos.',
      idAlvo: 'pedido-shell-aba-lista',
    },
  },
  lista: {
    id: 'lista',
    titulo: 'Lista de pedidos',
    resumo: 'Grade operacional com busca, filtros, ações em massa e expansão de itens.',
    explorar: [
      { titulo: '1. Veja os cards de resumo', descricao: 'Valor total e quantidade de pedidos do escopo filtrado', idAlvo: 'pedido-lista-cards' },
      { titulo: '2. Filtre por status', descricao: 'Clique nas pills Rascunho, Aberto, Em andamento etc.', idAlvo: 'pedido-lista-status-pills' },
      { titulo: '3. Revise filtros ativos', descricao: 'Veja e remova filtros de busca, status e colunas no chip Filtros', idAlvo: 'pedido-lista-filtros' },
      { titulo: '4. Busque na grade', descricao: 'Digite no campo Buscar para filtrar pedidos e itens por texto', idAlvo: 'pedido-lista-busca' },
      { titulo: '5. Veja os nomes das colunas', descricao: 'Passe o mouse nos cabeçalhos — arraste para reordenar colunas na grade', idAlvo: 'pedido-lista-cabecalho-colunas' },
      { titulo: '6. Filtre por coluna', descricao: 'Clique no ícone de funil no cabeçalho para filtrar aquela coluna', idAlvo: 'pedido-lista-filtro-coluna' },
      { titulo: '7. Expanda um pedido', descricao: 'Clique na seta à esquerda da linha para ver os itens do pedido', idAlvo: 'pedido-lista-expandir' },
      { titulo: '8. Expanda todos', descricao: 'Use o botão ao lado da busca para abrir ou fechar todos os itens', idAlvo: 'pedido-lista-expandir-todos' },
      { titulo: '9. Selecione linhas', descricao: 'Marque checkboxes para habilitar ações em lote na barra', idAlvo: 'pedido-lista-selecao' },
      { titulo: '10. Transferir', descricao: 'Com linhas selecionadas, mova itens entre pedidos', idAlvo: 'pedido-lista-transferir' },
      { titulo: '11. Consolidar', descricao: 'Una 2+ pedidos compatíveis no wizard de 3 passos (configurar, comparar, confirmar)', idAlvo: 'pedido-lista-consolidar' },
      { titulo: '12. Edição em massa', descricao: 'Altere campos de vários pedidos ou itens de uma vez', idAlvo: 'pedido-lista-edicao-massa' },
      { titulo: '13. Gerar documento', descricao: 'Gere PDF da seleção quando houver pedidos marcados', idAlvo: 'pedido-lista-gerar-documento' },
      { titulo: '14. Excluir', descricao: 'Remova pedidos ou itens selecionados da grade', idAlvo: 'pedido-lista-excluir' },
      { titulo: '15. Personalize colunas', descricao: 'Abra Colunas para exibir, ocultar e arrastar a ordem das colunas', idAlvo: 'pedido-lista-colunas' },
      { titulo: '16. Nova coluna (Config)', descricao: 'Em Configurações › Colunas › Personalizadas, crie colunas de texto, número, data, checkbox, fórmula e mais', idAlvo: 'pedido-shell-nav-config' },
      { titulo: '17. Saldo do pedido', descricao: 'Coluna Saldo = Qtd. Inicial − Transferida − Cancelada. Ajuste a fórmula em Configurações › Campos Calculados', idAlvo: 'pedido-lista-coluna-saldo' },
      { titulo: '18. Status do pedido', descricao: 'Cada status (Rascunho, Aberto, Em andamento…) define o pipeline — crie novos em Configurações › Status', idAlvo: 'pedido-lista-status-pills' },
      { titulo: '19. Exportar a grade', descricao: 'Exporte a lista em Excel, CSV, PDF e outros formatos', idAlvo: 'pedido-lista-exportar' },
      { titulo: '20. Crie registros', descricao: 'Abra Novo para pedido manual, item, Smart Import ou API', idAlvo: 'pedido-lista-novo' },
    ],
    avancar: {
      acao: 'Ver detalhe',
      titulo: 'Expanda um pedido',
      descricao: 'Clique na seta à esquerda da primeira linha para abrir os itens',
      idAlvo: 'pedido-lista-expandir',
    },
  },
  'lista-detalhe': {
    id: 'lista-detalhe',
    titulo: 'Itens do pedido',
    resumo: 'Linhas filhas com part number, quantidades e edição inline na grade.',
    explorar: [
      { titulo: '1. Veja os itens', descricao: 'Cada linha filha é um item vinculado ao pedido expandido', idAlvo: 'pedido-lista-itens' },
      { titulo: '2. Edite uma célula', descricao: 'Clique no status do primeiro item (célula marcada com lápis) para simular edição inline', idAlvo: 'pedido-lista-celulas' },
      { titulo: '3. Recolha o pedido', descricao: 'Clique novamente na seta do pedido pai para fechar os itens', idAlvo: 'pedido-lista-expandir' },
      { titulo: '4. Selecione itens', descricao: 'Marque checkboxes das linhas filhas para ações em lote', idAlvo: 'pedido-lista-selecao' },
      { titulo: '5. Transferir ou editar', descricao: 'Use Transferir ou Edição em massa na barra com itens selecionados', idAlvo: 'pedido-lista-transferir' },
    ],
    avancar: {
      acao: 'Nova demonstração',
      titulo: 'Crie ou transfira',
      descricao: 'Abra Novo → Pedido manual ou selecione linhas e clique em Transferir',
      idAlvo: 'pedido-lista-novo',
    },
  },
  dashboard: {
    id: 'dashboard',
    titulo: 'Dashboard',
    resumo: 'Painéis personalizáveis, KPIs, GABI AI, gráficos e widgets com drag-and-drop.',
    explorar: [
      { titulo: '1. Abas do produto', descricao: 'Alterne Insights, Lista, Dashboard e Kanban — cada modo mostra outra visão dos pedidos', idAlvo: 'pedido-shell-abas' },
      { titulo: '2. Painéis — faixa', descricao: 'Padrão, COMERCIAL e FINANCEIRO guardam layouts independentes de widgets', idAlvo: 'pedido-dashboard-faixa-paineis' },
      { titulo: '3. Painéis — Padrão', descricao: 'Layout inicial — KPIs, GABI e gráficos do painel ativo', idAlvo: 'pedido-dashboard-painel-padrao' },
      { titulo: '4. Painéis — COMERCIAL', descricao: 'Clique para trocar — cada aba lembra seus próprios widgets e posições', idAlvo: 'pedido-dashboard-painel-comercial' },
      { titulo: '5. Painéis — FINANCEIRO', descricao: 'Aba dedicada a métricas financeiras — independente dos outros painéis', idAlvo: 'pedido-dashboard-painel-financeiro' },
      { titulo: '6. Painéis — criar (+)', descricao: 'Use o + para nomear um painel personalizado com layout exclusivo', idAlvo: 'pedido-dashboard-painel-criar' },
      { titulo: '7. Filtro de período', descricao: 'Abra o calendário e mude o intervalo — KPIs e gráficos recalculam', idAlvo: 'pedido-dashboard-periodo' },
      { titulo: '8. Filtro de status', descricao: 'Marque Abertos, Em andamento, Atrasados ou Concluídos — combine com o período', idAlvo: 'pedido-dashboard-status' },
      { titulo: '9. Adicionar widget', descricao: 'Clique no + da barra — abre o menu com Sugestões da GABI ou Criar do zero', idAlvo: 'pedido-dashboard-adicionar' },
      { titulo: '10. Gerenciar widgets', descricao: 'Botão Widgets: exiba, oculte, reordene ou restaure o layout padrão', idAlvo: 'pedido-dashboard-widgets-seletor' },
      { titulo: '11. KPI Rascunho', descricao: 'Primeiro card da linha de status — contagem de pedidos em rascunho', idAlvo: 'pedido-dashboard-kpi-rascunho' },
      { titulo: '12. KPI Aberto', descricao: 'Segundo card — pedidos abertos no escopo filtrado', idAlvo: 'pedido-dashboard-kpi-aberto' },
      { titulo: '13. KPI Em andamento', descricao: 'Terceiro card — pedidos em execução operacional', idAlvo: 'pedido-dashboard-kpi-andamento' },
      { titulo: '14. KPI Consolidado', descricao: 'Quarto card — pedidos já consolidados', idAlvo: 'pedido-dashboard-kpi-consolidado' },
      { titulo: '15. GABI AI · Insights', descricao: 'Widget roxo com alertas acionáveis gerados pela IA sobre seus pedidos', idAlvo: 'pedido-dashboard-gabi' },
      { titulo: '16. Carrossel GABI', descricao: 'Passe o mouse para pausar; use as setas ou aguarde a rotação automática', idAlvo: 'pedido-dashboard-gabi-nav' },
      { titulo: '17. Ação rápida GABI', descricao: 'Clique em Corrigir agora ou Publicar pedidos nos cards de insight', idAlvo: 'pedido-dashboard-gabi-acao' },
      { titulo: '18. Pedidos por mês', descricao: 'Gráfico de linha com volume mensal — passe o mouse nos pontos', idAlvo: 'pedido-dashboard-grafico-pedidos-mes' },
      { titulo: '19. Evolução do valor', descricao: 'Tendência financeira dos últimos meses', idAlvo: 'pedido-dashboard-grafico-valor' },
      { titulo: '20. Faixa Alertas', descricao: 'Separador que agrupa KPIs operacionais críticos', idAlvo: 'pedido-dashboard-section-alertas' },
      { titulo: '21. Pedidos atrasados', descricao: 'KPI em vermelho — fora do prazo no filtro atual', idAlvo: 'pedido-dashboard-kpi-atrasados' },
      { titulo: '22. Sem exportador', descricao: 'Pendência de vínculo com exportador', idAlvo: 'pedido-dashboard-kpi-sem-exportador' },
      { titulo: '23. Qtd. pronta', descricao: 'Itens prontos para embarque ou faturamento', idAlvo: 'pedido-dashboard-kpi-qtd-pronta' },
      { titulo: '24. Distribuição por status', descricao: 'Proporção Aberto, Andamento, Consolidado, Rascunho e Cancelado', idAlvo: 'pedido-dashboard-dist-status' },
      { titulo: '25. Importação × Exportação', descricao: 'Mix de operações no painel de distribuição', idAlvo: 'pedido-dashboard-dist-operacao' },
      { titulo: '26. Qtd. inicial', descricao: 'Quantidade inicial total dos itens', idAlvo: 'pedido-dashboard-kpi-qtd-inicial' },
      { titulo: '27. Qtd. transferida', descricao: 'Volume já transferido entre pedidos', idAlvo: 'pedido-dashboard-kpi-qtd-transferida' },
      { titulo: '28. Valor dos itens', descricao: 'Valor total agregado das linhas de item', idAlvo: 'pedido-dashboard-kpi-valor-itens' },
      { titulo: '29. Menu do widget (⋮)', descricao: 'Em qualquer card — abre Editar, Excluir, Mover e Mudar tamanho', idAlvo: 'pedido-dashboard-widget-menu' },
      { titulo: '30. Grade completa', descricao: 'Role a página — todos os widgets respondem aos filtros globais', idAlvo: 'pedido-dashboard-grid' },
      { titulo: '31. Filtros ativos', descricao: 'Quando período ou status estão aplicados, o rodapé lista os chips — clique em Limpar para resetar', idAlvo: 'pedido-dashboard-filtros-ativos' },
      { titulo: '32. Troque o workspace', descricao: 'Selecione outra filial no menu lateral para mudar o escopo', idAlvo: 'pedido-insights-seletor-workspace' },
      { titulo: '33. Vá para o Kanban', descricao: 'Pipeline visual por etapa', idAlvo: 'pedido-shell-aba-kanban' },
    ],
    avancar: {
      acao: 'Menu do widget',
      titulo: 'Abra o menu ⋮',
      descricao: 'Clique nos três pontos do primeiro KPI (Rascunho) para ver Editar, Excluir e layout',
      idAlvo: 'pedido-dashboard-widget-menu',
    },
  },
  'dashboard-painel-nome': {
    id: 'dashboard-painel-nome',
    titulo: 'Novo painel',
    resumo: 'Nomeie o painel — cada aba guarda widgets e layout independentes.',
    explorar: explorarComPaineisDashboard([
      { titulo: '1. Nome do painel', descricao: 'Digite um nome curto (ex.: Exportação Q2, Diretoria) — até 60 caracteres', idAlvo: 'pedido-dashboard-painel-nome' },
      { titulo: '2. Confirmar (✓)', descricao: 'Salva o painel e ativa a nova aba — widgets que você adicionar ficam só aqui', idAlvo: 'pedido-dashboard-painel-nome-salvar' },
      { titulo: '3. Cancelar (×)', descricao: 'Descarta a criação e volta à faixa de painéis sem alterar nada', idAlvo: 'pedido-dashboard-painel-nome-cancelar' },
    ]),
    avancar: {
      acao: 'Confirmar',
      titulo: 'Crie o painel',
      descricao: 'Digite o nome e clique em ✓ — a nova aba abre automaticamente',
      idAlvo: 'pedido-dashboard-painel-nome-salvar',
    },
  },
  'dashboard-menu-adicionar': {
    id: 'dashboard-menu-adicionar',
    titulo: 'Adicionar widget',
    resumo: 'Escolha entre sugestões inteligentes da GABI ou montar um widget personalizado.',
    explorar: explorarComPaineisDashboard([
      { titulo: '1. Sugestões da GABI', descricao: 'Widgets recomendados com base no catálogo e no layout atual', idAlvo: 'pedido-dashboard-adicionar-sugestoes' },
      { titulo: '2. Criar do zero', descricao: 'Abre o wizard em 3 passos: campo, operação/nome e tipo de gráfico', idAlvo: 'pedido-dashboard-adicionar-criar-zero' },
    ]),
    avancar: {
      acao: 'Explorar sugestões',
      titulo: 'Abra as sugestões',
      descricao: 'Clique em Sugestões da GABI para ver widgets recomendados',
      idAlvo: 'pedido-dashboard-adicionar-sugestoes',
    },
  },
  'dashboard-menu-widget': {
    id: 'dashboard-menu-widget',
    titulo: 'Menu do card',
    resumo: 'Ações por widget — edição, exclusão e layout no grid.',
    explorar: explorarComPaineisDashboard([
      { titulo: '1. Editar', descricao: 'Renomeie o card, troque o tipo de gráfico ou defina período próprio', idAlvo: 'pedido-dashboard-widget-editar' },
      { titulo: '2. Excluir', descricao: 'Remove o widget do painel atual (ação imediata na demo)', idAlvo: 'pedido-dashboard-widget-excluir' },
      { titulo: '3. Mover', descricao: 'Ativa o modo arrastar — reposicione o card na grade do painel ativo', idAlvo: 'pedido-dashboard-widget-mover-item' },
      { titulo: '4. Mudar tamanho', descricao: 'Ativa alças de redimensionamento nas bordas do card', idAlvo: 'pedido-dashboard-widget-redimensionar-item' },
    ]),
    avancar: {
      acao: 'Editar card',
      titulo: 'Abra a edição',
      descricao: 'Clique em Editar para ajustar nome, gráfico e período',
      idAlvo: 'pedido-dashboard-widget-editar',
    },
  },
  'dashboard-movendo-widget': {
    id: 'dashboard-movendo-widget',
    titulo: 'Movendo widget',
    resumo: 'Modo de reorganização — arraste o card pelo cabeçalho ou corpo.',
    explorar: explorarComPaineisDashboard([
      { titulo: '1. Arraste o card', descricao: 'Solte em outra célula da grade para trocar a posição neste painel', idAlvo: 'pedido-dashboard-widget-mover' },
      { titulo: '2. Concluir', descricao: 'No menu ⋮, clique em Concluir para sair do modo mover', idAlvo: 'pedido-dashboard-widget-concluir' },
    ]),
    avancar: {
      acao: 'Concluir',
      titulo: 'Finalize o layout',
      descricao: 'Abra o ⋮ e clique em Concluir',
      idAlvo: 'pedido-dashboard-widget-concluir',
    },
  },
  'dashboard-redimensionando-widget': {
    id: 'dashboard-redimensionando-widget',
    titulo: 'Redimensionando widget',
    resumo: 'Modo de tamanho — arraste bordas ou cantos do card.',
    explorar: explorarComPaineisDashboard([
      { titulo: '1. Ajuste o tamanho', descricao: 'Use as alças nas bordas para ampliar ou reduzir o widget', idAlvo: 'pedido-dashboard-widget-redimensionar' },
      { titulo: '2. Concluir', descricao: 'No menu ⋮, clique em Concluir para fixar o novo tamanho', idAlvo: 'pedido-dashboard-widget-concluir' },
    ]),
    avancar: {
      acao: 'Concluir',
      titulo: 'Finalize o tamanho',
      descricao: 'Abra o ⋮ e clique em Concluir',
      idAlvo: 'pedido-dashboard-widget-concluir',
    },
  },
  'dashboard-widgets-painel': {
    id: 'dashboard-widgets-painel',
    titulo: 'Gerenciar widgets',
    resumo: 'Painel para exibir, ocultar, reordenar e restaurar widgets do painel.',
    explorar: explorarComPaineisDashboard([
      { titulo: '1. Marque visibilidade', descricao: 'Checkbox em cada widget — oculte cards sem excluir do painel atual', idAlvo: 'pedido-dashboard-widgets-painel' },
      { titulo: '2. Reordene', descricao: 'Arraste pelo ícone ≡ para mudar a ordem na lista (reflete na grade)', idAlvo: 'pedido-dashboard-widgets-painel' },
      { titulo: '3. Selecionar tudo', descricao: 'Exibe todos os widgets de uma vez neste painel', idAlvo: 'pedido-dashboard-widgets-painel' },
      { titulo: '4. Restaurar padrão', descricao: 'Volta ao layout original de widgets e posições do painel', idAlvo: 'pedido-dashboard-widgets-painel' },
    ]),
    avancar: {
      acao: 'Fechar painel',
      titulo: 'Volte ao dashboard',
      descricao: 'Clique fora ou no X para fechar o painel Widgets',
      idAlvo: 'pedido-dashboard-grid',
    },
  },
  'dashboard-sugestoes': {
    id: 'dashboard-sugestoes',
    titulo: 'Sugestões da GABI',
    resumo: 'Widgets recomendados com base no seu catálogo de métricas e no layout atual.',
    explorar: explorarComPaineisDashboard([
      { titulo: '1. Confiança da sugestão', descricao: 'Badges Alta, Média ou Baixa indicam o quão relevante é cada widget', idAlvo: 'pedido-dashboard-sugestoes-lista' },
      { titulo: '2. Adicionar sugestão', descricao: 'Clique em Adicionar — o widget entra na grade do painel ativo', idAlvo: 'pedido-dashboard-sugestoes-adicionar' },
      { titulo: '3. Métricas derivadas', descricao: 'Taxa de atraso, ticket médio e conclusão de itens — KPIs calculados', idAlvo: 'pedido-dashboard-sugestoes-derivadas' },
      { titulo: '4. Criar do zero', descricao: 'Abra o construtor para escolher campos, operação e tipo de gráfico', idAlvo: 'pedido-dashboard-sugestoes-criar-zero' },
    ]),
    avancar: {
      acao: 'Fechar painel',
      titulo: 'Volte ao dashboard',
      descricao: 'Feche o painel lateral ou adicione um widget sugerido',
      idAlvo: 'pedido-dashboard-grid',
    },
  },
  'dashboard-construtor': {
    id: 'dashboard-construtor',
    titulo: 'Criar widget',
    resumo: 'Wizard em 3 passos: campos, operação e visualização do gráfico.',
    explorar: explorarComPaineisDashboard([
      { titulo: '1. Buscar campo', descricao: 'Filtre o catálogo por nome da métrica (ex.: valor, pedidos, qtd.)', idAlvo: 'pedido-dashboard-construtor-busca' },
      { titulo: '2. Escolha a métrica', descricao: 'Marque um campo — badges indicam moeda (R$), percentual ou número', idAlvo: 'pedido-dashboard-construtor-campos' },
      { titulo: '3. Nome do widget', descricao: 'Passo 2 — título exibido no cabeçalho do card (obrigatório)', idAlvo: 'pedido-dashboard-construtor-titulo' },
      { titulo: '4. Operação', descricao: 'COUNT, SUM ou AVG — conforme agregações disponíveis do campo', idAlvo: 'pedido-dashboard-construtor-operacao' },
      { titulo: '5. Período do widget', descricao: 'Intervalo exclusivo deste card — pode diferir do filtro global', idAlvo: 'pedido-dashboard-construtor-periodo' },
      { titulo: '6. Tipos de gráfico', descricao: 'KPI, linha, área, barras, barras H, distribuição, donut, tabela, funil ou gauge', idAlvo: 'pedido-dashboard-construtor-tipos-grafico' },
      { titulo: '7. Salvar', descricao: 'Clique em Salvar widget — o card entra na grade do painel ativo', idAlvo: 'pedido-dashboard-construtor-salvar' },
    ]),
    avancar: {
      acao: 'Passo 1 de 3',
      titulo: 'Escolha um campo',
      descricao: 'Marque uma métrica e clique em Próximo',
      idAlvo: 'pedido-dashboard-construtor-campos',
    },
  },
  'dashboard-editar-widget': {
    id: 'dashboard-editar-widget',
    titulo: 'Editar widget',
    resumo: 'Ajuste título, tipo de gráfico e período próprio do card.',
    explorar: explorarComPaineisDashboard([
      { titulo: '1. Renomeie o card', descricao: 'Altere o título exibido no cabeçalho do widget', idAlvo: 'pedido-dashboard-editar-titulo' },
      { titulo: '2. Tipos de gráfico', descricao: 'KPI, linha, área, barras, donut, distribuição, tabela, funil ou gauge — só tipos compatíveis', idAlvo: 'pedido-dashboard-editar-grafico' },
      { titulo: '3. Período do widget', descricao: 'Intervalo exclusivo — independente do filtro global da barra', idAlvo: 'pedido-dashboard-editar-periodo' },
      { titulo: '4. Indicador (leitura)', descricao: 'Campos e operações do widget — somente visualização nesta edição rápida', idAlvo: 'pedido-dashboard-editar-indicador' },
      { titulo: '5. Cancelar ou salvar', descricao: 'Cancelar descarta; Salvar aplica no painel ativo', idAlvo: 'pedido-dashboard-editar-salvar' },
    ]),
    avancar: {
      acao: 'Salvar',
      titulo: 'Aplique as mudanças',
      descricao: 'Clique em Salvar para atualizar o card na grade',
      idAlvo: 'pedido-dashboard-editar-salvar',
    },
  },
  kanban: {
    id: 'kanban',
    titulo: 'Kanban',
    resumo: 'Pipeline visual por status — busque, ordene, arraste cards entre colunas e personalize colunas em Configurações.',
    explorar: [
      { titulo: '1. Buscar pedido', descricao: 'Digite número, exportador, importador ou incoterm para filtrar os cards', idAlvo: 'pedido-kanban-busca' },
      { titulo: '2. Total filtrado', descricao: 'Contador atualiza conforme a busca — mostra quantos pedidos estão visíveis', idAlvo: 'pedido-kanban-total' },
      { titulo: '3. Board completo', descricao: 'Sete colunas de status — role horizontalmente para ver todo o pipeline', idAlvo: 'pedido-kanban-board' },
      { titulo: '4. Coluna Rascunho', descricao: 'Pedidos ainda não publicados — cinza', idAlvo: 'pedido-kanban-coluna-rascunho' },
      { titulo: '5. Coluna Aberto', descricao: 'Pedidos abertos aguardando execução — azul', idAlvo: 'pedido-kanban-coluna-aberto' },
      { titulo: '6. Coluna Em Andamento', descricao: 'Operação em curso — laranja', idAlvo: 'pedido-kanban-coluna-em-andamento' },
      { titulo: '7. Coluna Aprovado', descricao: 'Pedidos aprovados internamente — amarelo', idAlvo: 'pedido-kanban-coluna-aprovado' },
      { titulo: '8. Coluna Transferido', descricao: 'Itens já transferidos entre pedidos — teal', idAlvo: 'pedido-kanban-coluna-transferencia' },
      { titulo: '9. Coluna Consolidado', descricao: 'Pedidos consolidados — roxo', idAlvo: 'pedido-kanban-coluna-consolidado' },
      { titulo: '10. Coluna Cancelado', descricao: 'Somente leitura — cards não podem ser arrastados para cá nem de lá', idAlvo: 'pedido-kanban-coluna-cancelado' },
      { titulo: '11. Ordenar coluna', descricao: 'No cabeçalho de Aberto — mais recente, mais antigo ou ordem alfabética', idAlvo: 'pedido-kanban-ordenar' },
      { titulo: '12. Card de pedido', descricao: 'Cada card resume exportador, datas e valor — clique para abrir o modal', idAlvo: 'pedido-kanban-card' },
      { titulo: '13. Número do pedido', descricao: 'Identificador no topo do card', idAlvo: 'pedido-kanban-card-numero' },
      { titulo: '14. Tipo de operação', descricao: 'Badge Importação (índigo) ou Exportação (verde)', idAlvo: 'pedido-kanban-card-tipo' },
      { titulo: '15. Parceiros', descricao: 'Exportador e importador configurados nas preferências do card', idAlvo: 'pedido-kanban-card-parceiro' },
      { titulo: '16. Data crítica', descricao: 'Prev. coleta com cor de urgência — verde, amarelo ou vermelho', idAlvo: 'pedido-kanban-card-data-critica' },
      { titulo: '17. Valor e incoterm', descricao: 'Rodapé do card com valor total, moeda e incoterm', idAlvo: 'pedido-kanban-card-rodape' },
      { titulo: '18. Menu Mover para (⋮)', descricao: 'Alternativa ao arrastar — escolha a coluna de destino no menu', idAlvo: 'pedido-kanban-mover-menu' },
      { titulo: '19. Arrastar entre colunas', descricao: 'Segure e arraste o card — solte em outra coluna para mudar o status', idAlvo: 'pedido-kanban-card' },
      { titulo: '20. Clique no card', descricao: 'Abre o painel rápido com abas Pedido, Quantidades, Datas e Lembrete', idAlvo: 'pedido-kanban-card' },
      { titulo: '21. Configurações (menu)', descricao: 'No menu lateral — abre preferências do pipeline e colunas do Kanban', idAlvo: 'pedido-shell-nav-config' },
      { titulo: '22. Configurações (topo)', descricao: 'Ícone de engrenagem no cabeçalho — mesmo atalho para Configurações', idAlvo: 'pedido-kanban-config-topo' },
      { titulo: '23. Nova coluna', descricao: 'Em Configurações › Colunas, clique em + Nova coluna para criar etapas personalizadas no pipeline', idAlvo: 'pedido-kanban-config-topo' },
    ],
    avancar: {
      acao: 'Abrir detalhe',
      titulo: 'Clique em um card',
      descricao: 'Abra o modal de detalhe para ver campos, quantidades e datas',
      idAlvo: 'pedido-kanban-card',
    },
  },
  'kanban-menu-mover': {
    id: 'kanban-menu-mover',
    titulo: 'Mover card',
    resumo: 'Escolha a coluna de destino sem arrastar.',
    explorar: explorarComConfigColunaKanban([
      { titulo: '1. Colunas disponíveis', descricao: 'Lista todas as colunas exceto a atual — Cancelado fica desabilitado', idAlvo: 'pedido-kanban-mover-opcoes' },
      { titulo: '2. Confirme o destino', descricao: 'Clique na coluna — o card muda de status na demonstração', idAlvo: 'pedido-kanban-mover-opcoes' },
    ]),
    avancar: {
      acao: 'Fechar menu',
      titulo: 'Volte ao board',
      descricao: 'Clique fora ou escolha uma coluna para mover o card',
      idAlvo: 'pedido-kanban-board',
    },
  },
  'kanban-ordenar': {
    id: 'kanban-ordenar',
    titulo: 'Ordenar coluna',
    resumo: 'Reorganize os cards dentro da coluna Aberto.',
    explorar: explorarComConfigColunaKanban([
      { titulo: '1. Mais recente', descricao: 'Ordena por data de emissão — padrão do board', idAlvo: 'pedido-kanban-ordenar-opcoes' },
      { titulo: '2. Mais antigo', descricao: 'Inverte a ordem cronológica', idAlvo: 'pedido-kanban-ordenar-opcoes' },
      { titulo: '3. Alfabética', descricao: 'Ordena pelo número do pedido', idAlvo: 'pedido-kanban-ordenar-opcoes' },
    ]),
    avancar: {
      acao: 'Fechar',
      titulo: 'Aplique a ordenação',
      descricao: 'Escolha uma opção — o popover fecha automaticamente',
      idAlvo: 'pedido-kanban-ordenar',
    },
  },
  'kanban-modal-pedido': {
    id: 'kanban-modal-pedido',
    titulo: 'Detalhe do pedido',
    resumo: 'Painel rápido — aba Pedido com dados comerciais do card selecionado.',
    explorar: explorarComConfigColunaKanban([
      { titulo: '1. Cabeçalho', descricao: 'Número do pedido e badge Importação/Exportação', idAlvo: 'pedido-kanban-modal-cabecalho' },
      { titulo: '2. Status atual', descricao: 'Badge colorido conforme a coluna onde o card está', idAlvo: 'pedido-kanban-modal-status' },
      { titulo: '3. Abas do modal', descricao: 'Alterne Pedido, Quantidades, Datas e Lembrete', idAlvo: 'pedido-kanban-modal-abas' },
      { titulo: '4. Campos do pedido', descricao: 'Exportador, moeda, invoice, incoterm, valor e referências', idAlvo: 'pedido-kanban-modal-campos-pedido' },
      { titulo: '5. Abrir pedido completo', descricao: 'Vai para a Lista com o pedido em foco', idAlvo: 'pedido-kanban-modal-abrir-completo' },
      { titulo: '6. Fechar', descricao: 'Retorna ao board sem sair da aba Kanban', idAlvo: 'pedido-kanban-modal-fechar' },
    ]),
    avancar: {
      acao: 'Quantidades',
      titulo: 'Veja as quantidades',
      descricao: 'Clique na aba Quantidades para saldos e volumes',
      idAlvo: 'pedido-kanban-modal-aba-quantidades',
    },
  },
  'kanban-modal-quantidades': {
    id: 'kanban-modal-quantidades',
    titulo: 'Detalhe — Quantidades',
    resumo: 'Volumes do pedido: inicial, pronta, transferida, cancelada e saldo.',
    explorar: explorarComConfigColunaKanban([
      { titulo: '1. Qtd. inicial', descricao: 'Volume total contratado no pedido', idAlvo: 'pedido-kanban-modal-qtd-inicial' },
      { titulo: '2. Qtd. pronta', descricao: 'Itens prontos para embarque ou faturamento', idAlvo: 'pedido-kanban-modal-qtd-pronta' },
      { titulo: '3. Qtd. transferida', descricao: 'Volume já movido para outro pedido', idAlvo: 'pedido-kanban-modal-qtd-transferida' },
      { titulo: '4. Saldo', descricao: 'Destaque em roxo — saldo restante dos itens', idAlvo: 'pedido-kanban-modal-qtd-saldo' },
    ]),
    avancar: {
      acao: 'Datas',
      titulo: 'Veja o cronograma',
      descricao: 'Clique na aba Datas para prazos e confirmações',
      idAlvo: 'pedido-kanban-modal-aba-datas',
    },
  },
  'kanban-modal-datas': {
    id: 'kanban-modal-datas',
    titulo: 'Detalhe — Datas',
    resumo: 'Cronograma operacional — previstas e confirmadas.',
    explorar: explorarComConfigColunaKanban([
      { titulo: '1. Data P.O.', descricao: 'Data de emissão do pedido', idAlvo: 'pedido-kanban-modal-data-emissao' },
      { titulo: '2. Prev. coleta', descricao: 'Prazo previsto de coleta — vermelho se vencida', idAlvo: 'pedido-kanban-modal-data-coleta' },
      { titulo: '3. Prev. pronto', descricao: 'Quando o pedido deve estar pronto', idAlvo: 'pedido-kanban-modal-data-pronto' },
      { titulo: '4. Prev. inspeção', descricao: 'Data prevista de inspeção de qualidade', idAlvo: 'pedido-kanban-modal-data-inspecao' },
    ]),
    avancar: {
      acao: 'Lembrete',
      titulo: 'Configure lembretes',
      descricao: 'Clique na aba Lembrete para ir ao pedido completo',
      idAlvo: 'pedido-kanban-modal-aba-lembrete',
    },
  },
  'kanban-modal-lembrete': {
    id: 'kanban-modal-lembrete',
    titulo: 'Detalhe — Lembrete',
    resumo: 'Atalho para configurar lembretes no pedido completo.',
    explorar: explorarComConfigColunaKanban([
      { titulo: '1. Informação', descricao: 'Lembretes são configurados na tela completa do pedido', idAlvo: 'pedido-kanban-modal-lembrete-info' },
      { titulo: '2. Abrir pedido completo', descricao: 'Redireciona para a Lista com o pedido selecionado', idAlvo: 'pedido-kanban-modal-abrir-completo' },
    ]),
    avancar: {
      acao: 'Fechar',
      titulo: 'Volte ao Kanban',
      descricao: 'Clique em Fechar ou no X para retornar ao board',
      idAlvo: 'pedido-kanban-modal-fechar',
    },
  },
  config: {
    id: 'config',
    titulo: 'Configurações',
    resumo: 'Personalize cards, colunas, Kanban e status — tudo reflete na Lista, Dashboard e Kanban.',
    explorar: [
      { titulo: '1. Menu lateral', descricao: 'Navegue entre Cards, Tabela, Colunas, Kanban, Status e mais', idAlvo: 'pedido-config-sidebar' },
      { titulo: '2. Cards KPI', descricao: 'Escolha indicadores do topo da Lista — período, ativos e catálogo', idAlvo: 'pedido-config-cards' },
      { titulo: '3. Tabela', descricao: 'Linhas por página e destaque de pedidos atrasados', idAlvo: 'pedido-config-tabela' },
      { titulo: '4. Colunas personalizadas', descricao: 'Crie campos extras — texto, número, data, fórmula…', idAlvo: 'pedido-config-colunas-personalizadas' },
      { titulo: '5. Status', descricao: 'Pipeline de etapas — reordene e crie novos status', idAlvo: 'pedido-config-status' },
      { titulo: '6. Salvar', descricao: 'Clique em Salvar — as preferências aplicam em todas as visualizações', idAlvo: 'pedido-config-salvar' },
    ],
    avancar: {
      acao: 'Explorar Cards',
      titulo: 'Abra Cards',
      descricao: 'No menu lateral, clique em Cards para configurar os KPIs da Lista',
      idAlvo: 'pedido-config-sidebar',
    },
  },
  'config-cards': {
    id: 'config-cards',
    titulo: 'Config — Cards',
    resumo: 'KPIs no topo da Lista e Insights.',
    explorar: [
      { titulo: '1. Período', descricao: '7 dias, 30 dias, 6 meses, 1 ano ou Tudo — comparação dos indicadores', idAlvo: 'pedido-config-cards' },
      { titulo: '2. Preview', descricao: 'Veja como os cards ficarão na tela antes de salvar', idAlvo: 'pedido-config-cards-preview' },
      { titulo: '3. Ativos', descricao: 'Arraste, oculte (olho) ou remova cards da faixa superior', idAlvo: 'pedido-config-cards' },
      { titulo: '4. Catálogo', descricao: 'Clique em + para adicionar Total BRL, Atrasados, Saldo Atual, Alertas…', idAlvo: 'pedido-config-cards' },
      { titulo: '5. Adicionar KPI', descricao: 'Botão para criar card personalizado com métrica própria', idAlvo: 'pedido-config-cards-adicionar' },
    ],
    avancar: { acao: 'Tabela', titulo: 'Próxima seção', descricao: 'Clique em Tabela no menu lateral', idAlvo: 'pedido-config-sidebar' },
  },
  'config-tabela': {
    id: 'config-tabela',
    titulo: 'Config — Tabela',
    resumo: 'Preferências da grade da Lista.',
    explorar: [
      { titulo: '1. Linhas por página', descricao: '25, 50, 100 ou 200 — padrão ao abrir a Lista', idAlvo: 'pedido-config-tabela-linhas' },
      { titulo: '2. Pedidos atrasados', descricao: 'Toggle para destacar linhas vencidas em vermelho', idAlvo: 'pedido-config-tabela-atrasados' },
    ],
    avancar: { acao: 'Colunas', titulo: 'Abra Colunas', descricao: 'Expanda Colunas no menu lateral', idAlvo: 'pedido-config-sidebar' },
  },
  'config-colunas-casas-decimais': {
    id: 'config-colunas-casas-decimais',
    titulo: 'Config — Casas decimais',
    resumo: 'Precisão numérica por coluna.',
    explorar: [
      { titulo: '1. Campos do pedido', descricao: 'Valor total, quantidades, peso, cubagem — ajuste com +/−', idAlvo: 'pedido-config-colunas-decimais' },
      { titulo: '2. Saldo', descricao: 'Casas decimais do Saldo do Pedido refletem na Lista e no Kanban', idAlvo: 'pedido-config-colunas-decimais' },
    ],
    avancar: { acao: 'Formato data', titulo: 'Formato de Data', descricao: 'Clique em Formato de Data no submenu Colunas', idAlvo: 'pedido-config-sidebar' },
  },
  'config-colunas-formato-data': {
    id: 'config-colunas-formato-data',
    titulo: 'Config — Formato de data',
    resumo: 'Padrão global de datas na grade e exportações.',
    explorar: [
      { titulo: '1. Escolha o formato', descricao: 'DD/MM/AAAA (Brasil), ISO, EUA, compacto…', idAlvo: 'pedido-config-formato-data-opcoes' },
      { titulo: '2. Preview', descricao: 'Veja a data de hoje no formato selecionado', idAlvo: 'pedido-config-colunas-data' },
    ],
    avancar: { acao: 'Personalizadas', titulo: 'Colunas personalizadas', descricao: 'Abra Personalizadas no submenu', idAlvo: 'pedido-config-colunas-personalizadas' },
  },
  'config-colunas-personalizadas': {
    id: 'config-colunas-personalizadas',
    titulo: 'Config — Colunas personalizadas',
    resumo: 'Crie campos extras na tabela de pedidos.',
    explorar: [
      { titulo: '1. Criar coluna', descricao: 'Botão + Criar Coluna — escolha tipo: texto, número, data, checkbox, fórmula…', idAlvo: 'pedido-kanban-config-nova-coluna' },
      { titulo: '2. Lista ativa', descricao: 'Arraste para reordenar, olho para ocultar, lixo para excluir', idAlvo: 'pedido-config-colunas-lista' },
      { titulo: '3. Reflete na Lista', descricao: 'Colunas criadas aparecem na grade e no seletor Colunas da Lista', idAlvo: 'pedido-shell-aba-lista' },
    ],
    avancar: { acao: 'Criar', titulo: 'Crie uma coluna', descricao: 'Clique em + Criar Coluna', idAlvo: 'pedido-kanban-config-nova-coluna' },
  },
  'config-modal-nova-coluna': {
    id: 'config-modal-nova-coluna',
    titulo: 'Nova coluna',
    resumo: 'Defina nome e tipo do campo personalizado.',
    explorar: [
      { titulo: '1. Nome', descricao: 'Identificador exibido no cabeçalho da grade', idAlvo: 'pedido-config-modal-nova-coluna' },
      { titulo: '2. Tipo', descricao: 'Texto, Número, Data, Checkbox, Percentual, Fórmula…', idAlvo: 'pedido-config-modal-nova-coluna' },
    ],
    avancar: { acao: 'Confirmar', titulo: 'Clique em Salvar', descricao: 'A coluna entra na lista Ativas e na grade da Lista', idAlvo: 'pedido-config-modal-nova-coluna' },
  },
  'config-colunas-campos-calculados': {
    id: 'config-colunas-campos-calculados',
    titulo: 'Config — Campos calculados',
    resumo: 'Fórmulas como Saldo do Pedido.',
    explorar: [
      { titulo: '1. Saldo do pedido', descricao: 'Fórmula nativa: Inicial − Transferida − Cancelada', idAlvo: 'pedido-config-saldo-formula' },
      { titulo: '2. Validar com GABI', descricao: 'A fórmula é validada antes de salvar', idAlvo: 'pedido-config-saldo-formula' },
      { titulo: '3. Na Lista', descricao: 'Saldo aparece na grade e na aba Quantidades do Kanban', idAlvo: 'pedido-lista-coluna-saldo' },
    ],
    avancar: { acao: 'Kanban', titulo: 'Kanban', descricao: 'Expanda Kanban no menu lateral', idAlvo: 'pedido-config-sidebar' },
  },
  'config-kanban-colunas': {
    id: 'config-kanban-colunas',
    titulo: 'Config — Kanban colunas',
    resumo: 'Quais status viram colunas no board.',
    explorar: [
      { titulo: '1. Preview', descricao: 'Pílulas mostram colunas visíveis no board', idAlvo: 'pedido-config-kanban-preview' },
      { titulo: '2. Ocultar coluna', descricao: 'Clique no olho para remover coluna do Kanban (não exclui o status)', idAlvo: 'pedido-kanban-config-ordem-colunas' },
      { titulo: '3. Novo status', descricao: 'Para nova coluna de pipeline, crie um Status em Configurações › Status', idAlvo: 'pedido-config-status' },
    ],
    avancar: { acao: 'Ver board', titulo: 'Abra o Kanban', descricao: 'Clique na aba Kanban no topo', idAlvo: 'pedido-shell-aba-kanban' },
  },
  'config-kanban-card': {
    id: 'config-kanban-card',
    titulo: 'Config — Card Kanban',
    resumo: 'Campos exibidos em cada card.',
    explorar: [
      { titulo: '1. Preview do card', descricao: 'Mock mostra exportador, valor, incoterm e barra de saldo', idAlvo: 'pedido-config-kanban-card-preview' },
      { titulo: '2. Saldo (barra)', descricao: 'Barra de progresso do saldo — adicione em Disponíveis se oculto', idAlvo: 'pedido-kanban-config-campos-card' },
      { titulo: '3. Data crítica', descricao: 'Prev. Coleta ou Prev. Pronto — cor de urgência no card', idAlvo: 'pedido-kanban-config-campos-card' },
    ],
    avancar: { acao: 'Modal', titulo: 'Campos do modal', descricao: 'Clique em Modal no submenu Kanban', idAlvo: 'pedido-config-kanban-modal' },
  },
  'config-kanban-modal': {
    id: 'config-kanban-modal',
    titulo: 'Config — Modal Kanban',
    resumo: 'Abas Pedido, Quantidades e Datas do painel rápido.',
    explorar: [
      { titulo: '1. Abas', descricao: 'Alterne Pedido, Quantidades e Datas — contador mostra campos ativos', idAlvo: 'pedido-config-kanban-modal-abas' },
      { titulo: '2. Reordenar', descricao: 'Arraste campos ativos — olho oculta, X remove', idAlvo: 'pedido-config-kanban-modal' },
      { titulo: '3. Lembrete', descricao: 'Aba Lembrete é fixa e não configurável', idAlvo: 'pedido-config-kanban-modal' },
    ],
    avancar: { acao: 'Status', titulo: 'Status do pedido', descricao: 'Abra Status em PEDIDO no menu lateral', idAlvo: 'pedido-config-status' },
  },
  'config-status': {
    id: 'config-status',
    titulo: 'Config — Status',
    resumo: 'Pipeline de etapas do pedido.',
    explorar: [
      { titulo: '1. Status de sistema', descricao: 'Rascunho, Aberto, Cancelado… — fixos, não excluíveis', idAlvo: 'pedido-config-status-lista' },
      { titulo: '2. Novo status', descricao: 'Clique em + Novo Status — nome e cor personalizados', idAlvo: 'pedido-config-novo-status' },
      { titulo: '3. Reflete em tudo', descricao: 'Mudanças aparecem nas pills da Lista, colunas do Kanban e KPIs do Dashboard', idAlvo: 'pedido-lista-status-pills' },
    ],
    avancar: { acao: 'Criar status', titulo: '+ Novo Status', descricao: 'Expanda o pipeline com etapas customizadas', idAlvo: 'pedido-config-novo-status' },
  },
  'config-numeracao': {
    id: 'config-numeracao',
    titulo: 'Config — Numeração',
    resumo: 'Formato automático do número do pedido.',
    explorar: [
      { titulo: '1. Prefixo e dígitos', descricao: 'Ex: PO-2026/0001 — ajuste prefixo, ano e casas', idAlvo: 'pedido-config-numeracao' },
      { titulo: '2. Reinício', descricao: 'Nunca, todo ano ou todo mês', idAlvo: 'pedido-config-numeracao' },
      { titulo: '3. Automação', descricao: 'Número automático ao criar, duplicar ou consolidar', idAlvo: 'pedido-config-numeracao' },
    ],
    avancar: { acao: 'Templates', titulo: 'Templates PDF', descricao: 'Abra Templates PDF no menu', idAlvo: 'pedido-config-templates-pdf' },
  },
  'config-templates-pdf': {
    id: 'config-templates-pdf',
    titulo: 'Config — Templates PDF',
    resumo: 'Handlebars para geração de documentos.',
    explorar: [
      { titulo: '1. Novo template', descricao: 'Crie template com variáveis {{numero_pedido}}, {{exportador}}, {{itens}}', idAlvo: 'pedido-config-novo-template' },
      { titulo: '2. Lista vazia', descricao: 'Sem templates — use + Novo template para começar', idAlvo: 'pedido-config-templates-vazio' },
    ],
    avancar: { acao: 'Voltar', titulo: 'Retome a demo', descricao: 'Clique na aba Lista ou Kanban', idAlvo: 'pedido-shell-aba-lista' },
  },
  'config-kanban': {
    id: 'config-kanban',
    titulo: 'Configurações — Kanban',
    resumo: 'Atalho do tour quando você abre Config a partir do Kanban.',
    explorar: [
      { titulo: '1. Colunas do board', descricao: 'Kanban › Colunas — visibilidade das etapas', idAlvo: 'pedido-kanban-config-colunas' },
      { titulo: '2. Card e Modal', descricao: 'Personalize campos do card e do painel rápido', idAlvo: 'pedido-kanban-config-campos-card' },
      { titulo: '3. Voltar ao Kanban', descricao: 'Clique na aba Kanban para ver as mudanças', idAlvo: 'pedido-shell-aba-kanban' },
    ],
    avancar: {
      acao: 'Colunas Kanban',
      titulo: 'Abra Kanban › Colunas',
      descricao: 'No menu lateral, Kanban › Colunas',
      idAlvo: 'pedido-kanban-config-colunas',
    },
  },
  'novo-pedido-1': {
    id: 'novo-pedido-1',
    titulo: 'Novo pedido — Dados',
    resumo: 'Passo 1: preencha operação, empresas, incoterm e moeda.',
    explorar: [
      { titulo: '1. Escolha operação e empresas', descricao: 'Selecione importação/exportação, número do pedido e exportador ou importador', idAlvo: 'pedido-novo-dados-campos' },
      { titulo: '2. Preencha incoterm e moeda', descricao: 'Informe condições comerciais e a moeda do pedido', idAlvo: 'pedido-novo-dados-comercial' },
      { titulo: '3. Veja o que falta', descricao: 'O banner indica campos obrigatórios pendentes para avançar', idAlvo: 'pedido-novo-requisitos' },
      { titulo: '4. Cadastre empresa na hora', descricao: 'Clique em + Nova ao lado do exportador ou importador', idAlvo: 'pedido-novo-cadastro-rapido' },
    ],
    avancar: {
      acao: 'Passo 1 de 2',
      titulo: 'Avance para itens',
      descricao: 'Preencha os obrigatórios e clique em Próximo',
      idAlvo: 'pedido-novo-proximo',
    },
  },
  'novo-pedido-2': {
    id: 'novo-pedido-2',
    titulo: 'Novo pedido — Itens',
    resumo: 'Passo 2: adicione part numbers, NCM, quantidades e valores.',
    explorar: [
      { titulo: '1. Preencha as linhas', descricao: 'Informe part number, descrição, NCM, quantidade e valor unitário', idAlvo: 'pedido-novo-itens-grade' },
      { titulo: '2. Adicione mais itens', descricao: 'Clique no botão + para incluir outra linha na grade', idAlvo: 'pedido-novo-itens-adicionar' },
      { titulo: '3. Confira o total', descricao: 'Quantidade × valor unitário atualiza o total de cada linha', idAlvo: 'pedido-novo-itens-total' },
    ],
    avancar: {
      acao: 'Passo 2 de 2',
      titulo: 'Crie o pedido',
      descricao: 'Clique em Criar pedido — ele entra no topo da lista em rascunho',
      idAlvo: 'pedido-novo-salvar',
    },
  },
  'novo-item': {
    id: 'novo-item',
    titulo: 'Novo item',
    resumo: 'Inclua um item avulso em um pedido existente da lista.',
    explorar: [
      { titulo: '1. Escolha o pedido', descricao: 'Selecione no dropdown em qual pedido o item será vinculado', idAlvo: 'pedido-novo-item-pedido' },
      { titulo: '2. Informe part number', descricao: 'Digite o SKU ou part number do item', idAlvo: 'pedido-novo-item-part-number' },
      { titulo: '3. Preencha a descrição', descricao: 'Descreva o item que será adicionado à grade', idAlvo: 'pedido-novo-item-descricao' },
    ],
    avancar: {
      acao: 'Salvar item',
      titulo: 'Confirme a inclusão',
      descricao: 'Clique em Salvar — o item aparece no pedido escolhido',
      idAlvo: 'pedido-novo-item-salvar',
    },
  },
  'transferir-1': {
    id: 'transferir-1',
    titulo: 'Transferir — Cenário',
    resumo: 'Passo 1: escolha como a diferença de quantidade será tratada.',
    explorar: [
      { titulo: '1. Escolha o tipo', descricao: 'Clique em um card: Split novo pedido, Split pedido existente ou Redução simples', idAlvo: 'pedido-transferir-cenarios' },
      { titulo: '2. Atenção à irreversibilidade', descricao: 'Redução simples exibe badge Irreversível — cancela saldo sem destino', idAlvo: 'pedido-transferir-badge-irreversivel' },
    ],
    avancar: {
      acao: 'Passo 1 de 5',
      titulo: 'Selecione o cenário',
      descricao: 'Clique em um card e depois em Próximo',
      idAlvo: 'pedido-transferir-proximo',
    },
  },
  'transferir-2': {
    id: 'transferir-2',
    titulo: 'Transferir — Quantidades',
    resumo: 'Passo 2: selecione itens no checkbox e informe a quantidade a transferir.',
    explorar: [
      {
        titulo: '1. Selecione no checkbox',
        descricao: 'Marque um ou mais itens no checkbox da tabela',
        idAlvo: 'pedido-transferir-checkbox',
      },
      {
        titulo: '2. Informe a quantidade',
        descricao: 'Coloque a quantidade que será transferida em cada linha selecionada',
        idAlvo: 'pedido-transferir-qtd',
      },
    ],
    avancar: {
      acao: 'Passo 2 de 5',
      titulo: 'Selecione e preencha',
      descricao: 'Marque um ou mais itens no checkbox, informe a quantidade e clique em Próximo',
      idAlvo: 'pedido-transferir-proximo',
    },
  },
  'transferir-3-novo': {
    id: 'transferir-3-novo',
    titulo: 'Transferir — Destino',
    resumo: 'Passo 3: informe o número do novo pedido destino.',
    explorar: [
      {
        titulo: '1. Informe o número do novo pedido',
        descricao: 'Digite no campo Número do novo pedido o código do pedido que receberá os itens',
        idAlvo: 'pedido-transferir-destino-novo-pedido',
      },
    ],
    avancar: {
      acao: 'Passo 3 de 5',
      titulo: 'Preencha o novo pedido',
      descricao: 'Informe o número no campo destacado e clique em Próximo',
      idAlvo: 'pedido-transferir-proximo',
    },
  },
  'transferir-3-existente': {
    id: 'transferir-3-existente',
    titulo: 'Transferir — Destino',
    resumo: 'Passo 3: selecione o pedido existente que receberá os itens.',
    explorar: [
      {
        titulo: '1. Selecione o pedido destino',
        descricao: 'Escolha no dropdown qual pedido existente receberá a transferência',
        idAlvo: 'pedido-transferir-destino-pedido-existente',
      },
    ],
    avancar: {
      acao: 'Passo 3 de 5',
      titulo: 'Escolha o destino',
      descricao: 'Selecione o pedido no dropdown e clique em Próximo',
      idAlvo: 'pedido-transferir-proximo',
    },
  },
  'transferir-3-reducao': {
    id: 'transferir-3-reducao',
    titulo: 'Transferir — Destino',
    resumo: 'Passo 3: confirme o alerta da redução simples.',
    explorar: [
      {
        titulo: '1. Leia o alerta',
        descricao: 'Confirme que entendeu o impacto irreversível da redução simples',
        idAlvo: 'pedido-transferir-alerta-reducao',
      },
    ],
    avancar: {
      acao: 'Passo 3 de 5',
      titulo: 'Leia e avance',
      descricao: 'Após ler o alerta, clique em Próximo para revisar o impacto',
      idAlvo: 'pedido-transferir-proximo',
    },
  },
  'transferir-4': {
    id: 'transferir-4',
    titulo: 'Transferir — Revisão',
    resumo: 'Passo 4: confira origem, destino e saldos antes de confirmar.',
    explorar: [
      { titulo: '1. Revise o impacto', descricao: 'Veja quantidades antes e depois em origem e destino', idAlvo: 'pedido-transferir-preview' },
      { titulo: '2. Confirme tipos divergentes', descricao: 'Se aparecer aviso, marque o checkbox para autorizar importação × exportação', idAlvo: 'pedido-transferir-aviso-tipos' },
    ],
    avancar: {
      acao: 'Passo 4 de 5',
      titulo: 'Vá à confirmação',
      descricao: 'Clique em Revisar e confirmar para a etapa final',
      idAlvo: 'pedido-transferir-proximo',
    },
  },
  'transferir-5': {
    id: 'transferir-5',
    titulo: 'Transferir — Confirmação',
    resumo: 'Passo 5: última checagem antes de executar a transferência.',
    explorar: [
      { titulo: '1. Confira o resumo', descricao: 'Revise origem, destino e quantidades no preview final', idAlvo: 'pedido-transferir-preview' },
      { titulo: '2. Leia a reversibilidade', descricao: 'Split é reversível; redução simples é irreversível', idAlvo: 'pedido-transferir-confirmacao-alerta' },
    ],
    avancar: {
      acao: 'Passo 5 de 5',
      titulo: 'Execute a transferência',
      descricao: 'Clique em Confirmar — a lista atualiza com o guia pós-transferência',
      idAlvo: 'pedido-transferir-confirmar',
    },
  },
  'transferir-resultado': {
    id: 'transferir-resultado',
    titulo: 'Transferência concluída',
    resumo: 'Operação executada — revise o resumo antes de fechar.',
    explorar: [
      { titulo: '1. Leia o resumo', descricao: 'Confira cenário, pedidos e quantidades transferidas com sucesso', idAlvo: 'pedido-transferir-resultado' },
    ],
    avancar: {
      acao: 'Fechar modal',
      titulo: 'Volte à lista',
      descricao: 'Clique em Fechar — um guia na grade mostrará o que mudou',
      idAlvo: 'pedido-transferir-fechar',
    },
  },
  'consolidar-1': {
    id: 'consolidar-1',
    titulo: 'Consolidar — Configurar',
    resumo: 'Passo 1: defina o número do pedido consolidado e revise a prévia.',
    explorar: [
      { titulo: '1. Número consolidado', descricao: 'Edite o número sugerido do novo pedido — campo obrigatório', idAlvo: 'pedido-consolidar-numero' },
      { titulo: '2. Fundir Part Numbers', descricao: 'Se houver itens repetidos, marque para somar quantidades', idAlvo: 'pedido-consolidar-fundir' },
      { titulo: '3. Cards de prévia', descricao: 'Veja pedidos, itens, inteiros/parciais e divergências de campo', idAlvo: 'pedido-consolidar-resumo' },
    ],
    avancar: {
      acao: 'Passo 1 de 3',
      titulo: 'Configure e avance',
      descricao: 'Confira o número e clique em Próximo para comparar campos',
      idAlvo: 'pedido-consolidar-proximo',
    },
  },
  'consolidar-2': {
    id: 'consolidar-2',
    titulo: 'Consolidar — Comparar',
    resumo: 'Passo 2: pedidos de origem diferentes podem ter dados diferentes — escolha o que fica no consolidado.',
    explorar: [
      {
        titulo: '1. Pedidos diferentes',
        descricao: 'Cada PO de origem trouxe seus próprios dados. Campos iguais seguem automaticamente; os divergentes aparecem para você decidir',
        idAlvo: 'pedido-consolidar-aviso-pedidos-diferentes',
      },
      {
        titulo: '2. Escolha valores',
        descricao: 'No select, cada opção mostra o valor e o pedido de origem (ex.: CFR · PO-7675). Defina qual prevalece no pedido consolidado',
        idAlvo: 'pedido-consolidar-campo-divergente',
      },
      {
        titulo: '3. Filtre se quiser',
        descricao: 'Use as pills ou o filtro por pedido de origem para focar só nas divergências que importam agora',
        idAlvo: 'pedido-consolidar-filtro-origem',
      },
    ],
    avancar: {
      acao: 'Passo 2 de 3',
      titulo: 'Resolva as divergências',
      descricao: 'Campos em laranja unem dados de pedidos diferentes — escolha o valor final em cada um e clique em Próximo',
      idAlvo: 'pedido-consolidar-proximo',
    },
  },
  'consolidar-3': {
    id: 'consolidar-3',
    titulo: 'Consolidar — Confirmar',
    resumo: 'Passo 3: revise o resumo final e execute a consolidação.',
    explorar: [
      { titulo: '1. Leia a confirmação', descricao: 'Veja quantos pedidos serão unidos e o número consolidado', idAlvo: 'pedido-consolidar-dialog' },
      { titulo: '2. Pedidos de origem', descricao: 'Chips mostram pedidos inteiros e parciais que sairão da lista', idAlvo: 'pedido-consolidar-dialog' },
    ],
    avancar: {
      acao: 'Passo 3 de 3',
      titulo: 'Execute a consolidação',
      descricao: 'Clique em Consolidar para criar o pedido unificado',
      idAlvo: 'pedido-consolidar-confirmar',
    },
  },
  'consolidar-resultado': {
    id: 'consolidar-resultado',
    titulo: 'Consolidação concluída',
    resumo: 'Pedido consolidado criado — revise origens arquivadas e divergências resolvidas.',
    explorar: [
      { titulo: '1. Leia o banner', descricao: 'Confira número consolidado, itens e pedidos de origem', idAlvo: 'pedido-consolidar-resultado' },
    ],
    avancar: {
      acao: 'Fechar modal',
      titulo: 'Volte à lista',
      descricao: 'Clique em Fechar para ver o novo pedido consolidado na grade',
      idAlvo: 'pedido-consolidar-fechar',
    },
  },
  'explicacao-transferencia': {
    id: 'explicacao-transferencia',
    titulo: 'O que aconteceu',
    resumo: 'Resumo narrativo da transferência — origem, destino e impacto nos pedidos.',
    explorar: [
      { titulo: '1. Compare origem e destino', descricao: 'Veja nos cards o que mudou em cada pedido envolvido', idAlvo: 'pedido-explicacao-transferencia-cards' },
      { titulo: '2. Leia os detalhes', descricao: 'Confira cenário, itens e quantidades movidas na demo', idAlvo: 'pedido-explicacao-transferencia-detalhes' },
    ],
    avancar: {
      acao: 'Entendi',
      titulo: 'Continue na lista',
      descricao: 'Clique em Entendi — as colunas destacadas guiam o próximo passo',
      idAlvo: 'pedido-explicacao-transferencia-entendi',
    },
  },
  'edicao-massa': {
    id: 'edicao-massa',
    titulo: 'Edição em massa — Campos',
    resumo: 'Passo 1: escolha o nível e edite várias colunas de uma vez nos pedidos e itens selecionados.',
    explorar: [
      {
        titulo: '1. Nível de edição',
        descricao: 'Combinado une pedido + item; Pedido muda só o cabeçalho; Item muda só as linhas selecionadas — escolha antes de definir os campos',
        idAlvo: 'pedido-edicao-massa-nivel',
      },
      {
        titulo: '2. Várias colunas',
        descricao: 'Use Adicionar campo para incluir mais linhas — cada uma altera uma coluna diferente, aplicada a todos os pedidos e itens que você selecionou na lista',
        idAlvo: 'pedido-edicao-massa-adicionar-campo',
      },
      {
        titulo: '3. Pré-visualização',
        descricao: 'Os cards refletem a seleção da lista: pedidos no escopo, itens afetados, pedidos inteiros e parciais',
        idAlvo: 'pedido-edicao-massa-preview',
      },
    ],
    avancar: {
      acao: 'Revisar',
      titulo: 'Vá para revisão',
      descricao: 'Com o nível e os campos definidos, clique em Revisar para ver o antes/depois',
      idAlvo: 'pedido-edicao-massa-revisar',
    },
  },
  'edicao-massa-2': {
    id: 'edicao-massa-2',
    titulo: 'Edição em massa — Revisão',
    resumo: 'Passo 2: confira campo a campo o que mudará.',
    explorar: [
      { titulo: '1. Revise as alterações', descricao: 'Compare valores antes e depois por campo selecionado', idAlvo: 'pedido-edicao-massa-revisao' },
      { titulo: '2. Filtre a revisão', descricao: 'Mostre só campos com alteração ou sem efeito', idAlvo: 'pedido-edicao-massa-filtros-revisao' },
    ],
    avancar: {
      acao: 'Aplicar',
      titulo: 'Salve as alterações',
      descricao: 'Clique em Aplicar — a grade atualiza todas as linhas selecionadas',
      idAlvo: 'pedido-edicao-massa-salvar',
    },
  },
  'edicao-massa-3': {
    id: 'edicao-massa-3',
    titulo: 'Edição em massa — Concluída',
    resumo: 'Alterações aplicadas — revise o resumo antes de fechar.',
    explorar: [
      { titulo: '1. Leia o resumo', descricao: 'Pedidos e itens atualizados com sucesso', idAlvo: 'pedido-edicao-massa-resultado' },
    ],
    avancar: {
      acao: 'Fechar',
      titulo: 'Volte à lista',
      descricao: 'Clique em Fechar e confira os valores na grade',
      idAlvo: 'pedido-edicao-massa-fechar',
    },
  },
  'menu-novo': {
    id: 'menu-novo',
    titulo: 'Menu Novo',
    resumo: 'Atalhos para criar pedidos, itens e painéis personalizados.',
    explorar: [
      { titulo: '1. Novo pedido', descricao: 'Importação, API, Smart Docs ou preenchimento manual', idAlvo: 'pedido-menu-novo-pedido' },
      { titulo: '2. Novo item', descricao: 'Item avulso vinculado a um pedido existente', idAlvo: 'pedido-menu-novo-item' },
      { titulo: '3. Novo painel', descricao: 'Salve os filtros atuais da lista como painel reutilizável', idAlvo: 'pedido-menu-novo-painel' },
    ],
    avancar: {
      acao: 'Demo completa',
      titulo: 'Abra pedido manual',
      descricao: 'Clique em Novo Pedido → Manual para abrir o wizard',
      idAlvo: 'pedido-menu-novo-manual',
    },
  },
  'cadastro-rapido-empresa': {
    id: 'cadastro-rapido-empresa',
    titulo: 'Cadastro rápido',
    resumo: 'Inclua importador, exportador ou fabricante sem sair do novo pedido.',
    explorar: [
      { titulo: '1. Preencha nome e país', descricao: 'Digite o nome da empresa e selecione o país', idAlvo: 'pedido-cadastro-rapido-campos' },
      { titulo: '2. Informe o documento fiscal', descricao: 'Preencha CNPJ (Brasil) ou Tax ID / TIN (exterior)', idAlvo: 'pedido-cadastro-rapido-fiscal' },
    ],
    avancar: {
      acao: 'Salvar',
      titulo: 'Use na demo',
      descricao: 'Clique em Salvar e usar — a empresa entra no select do pedido',
      idAlvo: 'pedido-cadastro-rapido-salvar',
    },
  },
  duplicar: {
    id: 'duplicar',
    titulo: 'Duplicar pedidos',
    resumo: 'Gere cópias dos pedidos selecionados com numeração automática.',
    explorar: [
      { titulo: '1. Confira o que será copiado', descricao: 'Leia quantos pedidos e itens entrarão na duplicação', idAlvo: 'pedido-duplicar-resumo' },
    ],
    avancar: {
      acao: 'Duplicar',
      titulo: 'Confirme a duplicação',
      descricao: 'Clique em Duplicar — novos pedidos entram no topo da lista',
      idAlvo: 'pedido-duplicar-confirmar',
    },
  },
  excluir: {
    id: 'excluir',
    titulo: 'Excluir seleção',
    resumo: 'Remova pedidos ou itens marcados — ação simulada na demo.',
    explorar: [
      { titulo: '1. Leia o que será removido', descricao: 'Confira pedidos e itens incluídos na seleção atual', idAlvo: 'pedido-excluir-resumo' },
      { titulo: '2. Atenção: irreversível', descricao: 'A exclusão não pode ser desfeita — leia o aviso antes de confirmar', idAlvo: 'pedido-excluir-aviso' },
    ],
    avancar: {
      acao: 'Excluir',
      titulo: 'Confirme a exclusão',
      descricao: 'Clique em Excluir para remover as linhas da grade',
      idAlvo: 'pedido-excluir-confirmar',
    },
  },
}

export type AbaModalKanbanPedido = 'pedido' | 'quantidades' | 'datas' | 'lembrete'

export type EstadoTutorialKanbanPedido = {
  modalKanbanAberto: boolean
  abaModalKanban: AbaModalKanbanPedido
  menuMoverCardKanbanAberto: boolean
  sortPopoverKanbanAberto: boolean
}

export type EstadoTutorialDashboardPedido = {
  sugestoesDashboardAberto: boolean
  construtorDashboardAberto: boolean
  editarWidgetDashboardAberto: boolean
  modoLayoutWidget: 'moving' | 'resizing' | null
  adicionarWidgetMenuAberto: boolean
  widgetsSeletorAberto: boolean
  widgetMenuAberto: boolean
  criandoPainelDashboardAberto: boolean
}

export type EstadoTutorialListaPedido = {
  linhaListaExpandida: string | null
  menuNovoAberto: boolean
  modalNovoPedidoAberto: boolean
  passoModalNovoPedido: number
  cadastroRapidoEmpresaAberto: boolean
  modalTransferirAberto: boolean
  passoModalTransferir: number
  cenarioModalTransferir: CenarioTransferSimulador | null
  modalTransferirConcluido: boolean
  modalNovoItemAberto: boolean
  modalEdicaoMassaAberto: boolean
  passoModalEdicaoMassa: number
  modalDuplicarAberto: boolean
  modalExcluirAberto: boolean
  modalConsolidarAberto: boolean
  passoModalConsolidar: number
  modalConsolidarConcluido: boolean
  idPedidoConsolidadoDestaque: string | null
  guiaPosConsolidacaoPasso: number | null
  explicacaoTransferenciaAberta: boolean
  guiaPosTransferenciaPasso: number | null
}

export type EstadoTutorialConfigPedido = {
  categoriaAtiva: string
  modalNovaColunaAberto: boolean
  modalNovoStatusAberto: boolean
  modalNovoTemplateAberto: boolean
  abaModalKanbanConfig: 'pedido' | 'quantidades' | 'datas'
}

export const ESTADO_TUTORIAL_CONFIG_PEDIDO_INICIAL: EstadoTutorialConfigPedido = {
  categoriaAtiva: 'cards',
  modalNovaColunaAberto: false,
  modalNovoStatusAberto: false,
  modalNovoTemplateAberto: false,
  abaModalKanbanConfig: 'pedido',
}

export const ESTADO_TUTORIAL_KANBAN_PEDIDO_INICIAL: EstadoTutorialKanbanPedido = {
  modalKanbanAberto: false,
  abaModalKanban: 'pedido',
  menuMoverCardKanbanAberto: false,
  sortPopoverKanbanAberto: false,
}

export const ESTADO_TUTORIAL_DASHBOARD_PEDIDO_INICIAL: EstadoTutorialDashboardPedido = {
  sugestoesDashboardAberto: false,
  construtorDashboardAberto: false,
  editarWidgetDashboardAberto: false,
  modoLayoutWidget: null,
  adicionarWidgetMenuAberto: false,
  widgetsSeletorAberto: false,
  widgetMenuAberto: false,
  criandoPainelDashboardAberto: false,
}

export const ESTADO_TUTORIAL_LISTA_PEDIDO_INICIAL: EstadoTutorialListaPedido = {
  linhaListaExpandida: null,
  menuNovoAberto: false,
  modalNovoPedidoAberto: false,
  passoModalNovoPedido: 1,
  cadastroRapidoEmpresaAberto: false,
  modalTransferirAberto: false,
  passoModalTransferir: 1,
  cenarioModalTransferir: null,
  modalTransferirConcluido: false,
  modalNovoItemAberto: false,
  modalEdicaoMassaAberto: false,
  passoModalEdicaoMassa: 1,
  modalDuplicarAberto: false,
  modalExcluirAberto: false,
  modalConsolidarAberto: false,
  passoModalConsolidar: 1,
  modalConsolidarConcluido: false,
  idPedidoConsolidadoDestaque: null,
  guiaPosConsolidacaoPasso: null,
  explicacaoTransferenciaAberta: false,
  guiaPosTransferenciaPasso: null,
}

export type EstadoShellTutorialPedido = {
  abaAtiva: 'insights' | 'lista' | 'dashboard' | 'kanban'
  isConfiguracoes: boolean
  isHistorico: boolean
  configAcessoDeKanban: boolean
} & EstadoTutorialListaPedido & EstadoTutorialDashboardPedido & EstadoTutorialKanbanPedido & EstadoTutorialConfigPedido

export function resolverIdTelaShellSimuladorPedido(estado: EstadoShellTutorialPedido): string | null {
  if (estado.cadastroRapidoEmpresaAberto) return 'cadastro-rapido-empresa'
  if (estado.menuNovoAberto) return 'menu-novo'
  if (estado.modalNovoPedidoAberto) {
    return estado.passoModalNovoPedido === 2 ? 'novo-pedido-2' : 'novo-pedido-1'
  }
  if (estado.modalTransferirAberto) {
    if (estado.modalTransferirConcluido) return 'transferir-resultado'
    if (estado.passoModalTransferir === 3) {
      if (estado.cenarioModalTransferir === 'split_novo_pedido') return 'transferir-3-novo'
      if (estado.cenarioModalTransferir === 'split_pedido_existente') return 'transferir-3-existente'
      if (estado.cenarioModalTransferir === 'reducao_simples') return 'transferir-3-reducao'
    }
    return `transferir-${estado.passoModalTransferir}`
  }
  if (estado.modalConsolidarAberto) {
    if (estado.modalConsolidarConcluido) return 'consolidar-resultado'
    return `consolidar-${estado.passoModalConsolidar}`
  }
  if (estado.modalNovoItemAberto) return 'novo-item'
  if (estado.modalEdicaoMassaAberto) {
    if (estado.passoModalEdicaoMassa === 3) return 'edicao-massa-3'
    if (estado.passoModalEdicaoMassa === 2) return 'edicao-massa-2'
    return 'edicao-massa'
  }
  if (estado.modalDuplicarAberto) return 'duplicar'
  if (estado.modalExcluirAberto) return 'excluir'
  if (estado.explicacaoTransferenciaAberta) return 'explicacao-transferencia'
  if (estado.isConfiguracoes) {
    if (estado.modalNovaColunaAberto) return 'config-modal-nova-coluna'
    if (estado.configAcessoDeKanban && estado.categoriaAtiva.startsWith('kanban')) {
      return `config-${estado.categoriaAtiva}`
    }
    const telaConfig = `config-${estado.categoriaAtiva}`
    if (telaConfig in TELAS_TUTORIAL_OPCIONAL_PEDIDO) return telaConfig
    return estado.configAcessoDeKanban ? 'config-kanban' : 'config'
  }
  if (estado.isHistorico) return 'historico'
  if (estado.criandoPainelDashboardAberto) return 'dashboard-painel-nome'
  if (estado.editarWidgetDashboardAberto) return 'dashboard-editar-widget'
  if (estado.construtorDashboardAberto) return 'dashboard-construtor'
  if (estado.sugestoesDashboardAberto) return 'dashboard-sugestoes'
  if (estado.modoLayoutWidget === 'moving') return 'dashboard-movendo-widget'
  if (estado.modoLayoutWidget === 'resizing') return 'dashboard-redimensionando-widget'
  if (estado.widgetMenuAberto) return 'dashboard-menu-widget'
  if (estado.adicionarWidgetMenuAberto) return 'dashboard-menu-adicionar'
  if (estado.widgetsSeletorAberto) return 'dashboard-widgets-painel'
  if (estado.modalKanbanAberto) {
    if (estado.abaModalKanban === 'quantidades') return 'kanban-modal-quantidades'
    if (estado.abaModalKanban === 'datas') return 'kanban-modal-datas'
    if (estado.abaModalKanban === 'lembrete') return 'kanban-modal-lembrete'
    return 'kanban-modal-pedido'
  }
  if (estado.menuMoverCardKanbanAberto) return 'kanban-menu-mover'
  if (estado.sortPopoverKanbanAberto) return 'kanban-ordenar'
  if (estado.abaAtiva === 'dashboard') return 'dashboard'
  if (estado.abaAtiva === 'kanban') return 'kanban'
  if (estado.abaAtiva === 'lista') {
    return estado.linhaListaExpandida ? 'lista-detalhe' : 'lista'
  }
  if (estado.abaAtiva === 'insights') return 'insights'
  return null
}

const PREFIXOS_TELA_TUTORIAL_MODAL_PEDIDO = [
  'transferir-',
  'consolidar-',
  'novo-pedido-',
  'edicao-massa',
  'menu-novo',
  'cadastro-rapido',
  'novo-item',
  'duplicar',
  'excluir',
  'explicacao-transferencia',
  'historico',
  'config',
  'config-kanban',
  'config-cards',
  'config-tabela',
  'config-colunas-casas-decimais',
  'config-colunas-formato-data',
  'config-colunas-personalizadas',
  'config-colunas-campos-calculados',
  'config-modal-nova-coluna',
  'config-kanban-colunas',
  'config-kanban-card',
  'config-kanban-modal',
  'config-status',
  'config-numeracao',
  'config-templates-pdf',
  'dashboard-',
  'kanban-',
] as const

/** Modais e overlays — Gabi abre no canto superior direito da placa */
export function resolverPosicaoPreferencialTutorialPedido(
  idTela: string | null,
): 'inferior-direita' | 'superior-direita' {
  if (!idTela) return 'inferior-direita'
  return PREFIXOS_TELA_TUTORIAL_MODAL_PEDIDO.some(
    (prefixo) => idTela === prefixo || idTela.startsWith(prefixo),
  )
    ? 'superior-direita'
    : 'inferior-direita'
}
