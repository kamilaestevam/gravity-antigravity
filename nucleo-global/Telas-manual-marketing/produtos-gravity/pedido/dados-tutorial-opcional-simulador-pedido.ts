/**
 * dados-tutorial-opcional-simulador-pedido.ts — mapa de cliques por tela (demo landing Pedido)
 */

import type { TelaTutorialOpcional } from '../smart-doc/dados-tutorial-opcional-simulador-smart-doc'
import type { CenarioTransferSimulador } from './transferir-lista-simulador-pedido'

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
      { titulo: '16. Exportar a grade', descricao: 'Exporte a lista em Excel, CSV, PDF e outros formatos', idAlvo: 'pedido-lista-exportar' },
      { titulo: '17. Crie registros', descricao: 'Abra Novo para pedido manual, item, Smart Import ou API', idAlvo: 'pedido-lista-novo' },
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
    resumo: 'Visão operacional em tempo real — preview do módulo no tenant completo.',
    explorar: [
      { titulo: '1. Leia o banner', descricao: 'Indica que o dashboard completo chegará no produto real', idAlvo: 'pedido-shell-banner-dashboard' },
      { titulo: '2. Use as abas superiores', descricao: 'Clique em Insights ou Lista para retomar a demonstração', idAlvo: 'pedido-shell-abas' },
    ],
    avancar: {
      acao: 'Retomar demo',
      titulo: 'Volte ao Insights',
      descricao: 'Clique na aba Insights no topo da tela',
      idAlvo: 'pedido-shell-aba-insights',
    },
  },
  kanban: {
    id: 'kanban',
    titulo: 'Kanban',
    resumo: 'Pipeline visual por etapa — arraste cards entre colunas na demonstração.',
    explorar: [
      { titulo: '1. Veja as colunas', descricao: 'Abertura, Anuência e Desembaraço com contagem por etapa', idAlvo: 'pedido-kanban-colunas' },
      { titulo: '2. Arraste um card', descricao: 'Mova um card para outra coluna ou clique para abrir detalhes', idAlvo: 'pedido-kanban-card' },
      { titulo: '3. Leia a timeline', descricao: 'No painel lateral, veja etapas concluídas do pedido selecionado', idAlvo: 'pedido-kanban-detalhe' },
    ],
    avancar: {
      acao: 'Retomar demo',
      titulo: 'Volte ao Insights',
      descricao: 'Clique na aba Insights na barra superior',
      idAlvo: 'pedido-shell-aba-insights',
    },
  },
  config: {
    id: 'config',
    titulo: 'Configurações',
    resumo: 'Preferências de pipeline e colunas — módulo simulado para o tenant.',
    explorar: [
      { titulo: '1. Leia o banner', descricao: 'Pipeline e colunas da lista serão configuráveis no produto real', idAlvo: 'pedido-shell-banner-config' },
      { titulo: '2. Use o menu lateral', descricao: 'Navegue entre módulos ou volte às abas Insights e Lista', idAlvo: 'pedido-shell-nav-lateral' },
    ],
    avancar: {
      acao: 'Retomar demo',
      titulo: 'Volte ao Insights',
      descricao: 'Clique na aba Insights no topo da tela',
      idAlvo: 'pedido-shell-aba-insights',
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

export type EstadoShellTutorialPedido = {
  abaAtiva: 'insights' | 'lista' | 'dashboard' | 'kanban'
  isConfiguracoes: boolean
} & EstadoTutorialListaPedido

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
  if (estado.isConfiguracoes) return 'config'
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
