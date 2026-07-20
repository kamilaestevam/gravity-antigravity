/**
 * dados-tutorial-opcional-simulador-smart-doc.ts — mapa de cliques por tela (demo landing)
 */

import type { PosicaoPreferencialTutorial } from './tutorial-opcional-simulador-smart-doc'

export type ItemTutorialOpcional = {
  titulo: string
  descricao: string
  idAlvo?: string
}

export type AvancarTutorialOpcional = {
  titulo: string
  descricao: string
  acao?: string
  idAlvo?: string
}

export type TelaTutorialOpcional = {
  id: string
  titulo: string
  resumo: string
  explorar: ItemTutorialOpcional[]
  avancar: AvancarTutorialOpcional
  /** Segunda fase do card "Siga em frente" (ex.: após simular anexo no passo 1) */
  avancarAposAnexo?: AvancarTutorialOpcional
}

export const TELAS_TUTORIAL_OPCIONAL: Record<string, TelaTutorialOpcional> = {
  /* ── Shell Smart Docs ── */
  insights: {
    id: 'insights',
    titulo: 'Insights',
    resumo: 'Painel executivo com métricas, gráficos e ranking — tudo interativo nesta demo.',
    explorar: [
      { titulo: '4 cards de KPI', descricao: 'Passe o mouse em Documentos, Campos, Saving digitação e Saving em erros', idAlvo: 'insights-kpis' },
      { titulo: 'Evolução diária', descricao: 'Troque o período (7 · 30 · 60 · 90 dias) e passe o mouse nas barras', idAlvo: 'insights-evolucao' },
      { titulo: 'Donut de acertos', descricao: 'Veja a proporção corretos × errados com tooltip em cada fatia', idAlvo: 'insights-donut' },
      { titulo: 'Tipos de documento', descricao: 'Confira o volume por Invoice, Packing List, BL e AWB', idAlvo: 'insights-tipos-documento' },
      { titulo: 'Ranking de fornecedores', descricao: 'Clique nas linhas de maiores acertos e erros para detalhes', idAlvo: 'insights-ranking' },
      { titulo: 'Seletor de filial', descricao: 'Troque a empresa no topo da barra lateral para ver outros perfis', idAlvo: 'insights-seletor-filial' },
      { titulo: 'Abas Insights / Lista', descricao: 'Alterne a visão no topo — a Lista mostra o histórico de leituras', idAlvo: 'insights-aba-lista' },
    ],
    avancar: {
      acao: 'Iniciar demonstração',
      titulo: '+ Novo → Nova Leitura',
      descricao: 'Abra o menu no canto superior direito e escolha Nova Leitura para ver o fluxo completo',
      idAlvo: 'insights-novo',
    },
  },
  lista: {
    id: 'lista',
    titulo: 'Lista de leituras',
    resumo: 'Histórico operacional — paridade Smart Read com KPIs, painéis, status e tabela hierárquica.',
    explorar: [
      { titulo: 'Cards de KPI', descricao: 'Total, média de acertos e saving agregado do escopo filtrado', idAlvo: 'lista-kpis' },
      { titulo: 'Segmentos', descricao: 'Alterne Visão geral e Transações API', idAlvo: 'lista-segmentos' },
      { titulo: 'Painéis e status', descricao: 'Filtre por painel salvo e por status da leitura', idAlvo: 'lista-status-pills' },
      { titulo: 'Tabela de leituras', descricao: 'Colunas, filtros, exportação e expansão leitura → documentos', idAlvo: 'lista-tabela' },
      { titulo: 'Seletor de colunas', descricao: '245+ campos do catálogo — Todas, Exibidas, Ocultas e busca por nome', idAlvo: 'lista-colunas' },
      { titulo: 'Pills de status', descricao: 'Pendente, Processando, Concluída e Falhou — mesmo contrato do produto real', idAlvo: 'lista-status' },
      { titulo: 'Abas Insights / Lista', descricao: 'Volte aos gráficos pela aba Insights', idAlvo: 'shell-aba-insights' },
    ],
    avancar: {
      acao: 'Ver detalhe',
      titulo: 'Expanda uma leitura',
      descricao: 'Abra os documentos filhos e clique no nome para retomar a leitura',
      idAlvo: 'lista-linha',
    },
  },
  'lista-detalhe': {
    id: 'lista-detalhe',
    titulo: 'Documentos da leitura',
    resumo: 'Segunda camada da lista — cada documento extraído dentro da leitura.',
    explorar: [
      { titulo: 'Linhas-filhas', descricao: 'Documentos com tipo, número e status próprios', idAlvo: 'lista-documento-filho' },
      { titulo: 'Ver no Insights', descricao: 'Atalho na barra de ações para voltar aos gráficos', idAlvo: 'lista-detalhe-insights' },
      { titulo: 'Recolher', descricao: 'Use expandir/recolher na linha pai ou no botão da barra', idAlvo: 'lista-expandir-todos' },
    ],
    avancar: {
      acao: 'Nova demonstração',
      titulo: '+ Novo → Nova Leitura',
      descricao: 'Inicie outro fluxo completo ou volte à aba Insights pelos gráficos',
      idAlvo: 'insights-novo',
    },
  },
  historico: {
    id: 'historico',
    titulo: 'Histórico',
    resumo: 'Visão filtrada dos últimos 30 dias — preview do módulo de histórico no tenant.',
    explorar: [
      { titulo: 'Faixa de contexto', descricao: 'O banner superior indica o recorte temporal simulado', idAlvo: 'shell-banner-historico' },
      { titulo: 'Conteúdo abaixo', descricao: 'Insights ou Lista continuam visíveis conforme a aba ativa', idAlvo: 'shell-conteudo' },
      { titulo: 'Menu lateral', descricao: 'Histórico, Insights e Configurações ficam na barra esquerda', idAlvo: 'shell-nav-lateral' },
    ],
    avancar: {
      acao: 'Voltar ao painel',
      titulo: 'Clique em Insights',
      descricao: 'Na barra de abas superior, selecione Insights para retomar a demonstração principal',
      idAlvo: 'shell-aba-insights',
    },
  },
  config: {
    id: 'config',
    titulo: 'Configurações',
    resumo: 'Personalize cards, tabela e colunas da lista de leituras.',
    explorar: [
      { titulo: '1. Menu Visualizações', descricao: 'Card, Tabelas e Colunas — cada seção configura um aspecto da tela', idAlvo: 'sdoc-config-sidebar' },
      { titulo: '2. Meus Cards', descricao: 'Período, preview ao vivo, ativos e disponíveis — arraste e use o olho para ocultar', idAlvo: 'sdoc-config-cards' },
      { titulo: '3. Tabelas', descricao: 'Linhas por página e densidade da grade de leituras', idAlvo: 'sdoc-config-tabelas' },
      { titulo: '4. Colunas', descricao: 'Crie colunas personalizadas com renomear, ocultar e excluir', idAlvo: 'sdoc-config-colunas' },
      { titulo: '5. Abas do produto', descricao: 'Insights e Lista continuam acessíveis na barra superior', idAlvo: 'shell-aba-insights' },
    ],
    avancar: {
      acao: 'Retomar demo',
      titulo: 'Clique em Insights',
      descricao: 'Volte ao painel principal pela aba Insights para continuar explorando',
      idAlvo: 'shell-aba-insights',
    },
  },
  'meu-espaco-atividades': {
    id: 'meu-espaco-atividades',
    titulo: 'Minhas Atividades',
    resumo: 'Central de tarefas do usuário — preview do Meu Espaço no tenant.',
    explorar: [
      { titulo: 'Submenu Meu Espaço', descricao: 'Atividades, E-mail e WhatsApp ficam agrupados na lateral', idAlvo: 'shell-meu-espaco-submenu' },
      { titulo: 'Banner de preview', descricao: 'Confirma que este módulo chegará no tenant completo', idAlvo: 'shell-banner-preview' },
    ],
    avancar: {
      acao: 'Retomar demo',
      titulo: 'Insights na barra superior',
      descricao: 'Clique na aba Insights para voltar ao painel Smart Docs',
      idAlvo: 'shell-aba-insights',
    },
  },
  'meu-espaco-email': {
    id: 'meu-espaco-email',
    titulo: 'E-mail',
    resumo: 'Caixa integrada de comunicação — preview do módulo no tenant.',
    explorar: [
      { titulo: 'Integração de e-mail', descricao: 'Simula o hub de mensagens ligado às leituras', idAlvo: 'shell-banner-preview' },
      { titulo: 'Outros itens do espaço', descricao: 'Troque para Atividades ou WhatsApp no submenu', idAlvo: 'shell-meu-espaco-submenu' },
    ],
    avancar: {
      acao: 'Retomar demo',
      titulo: 'Insights na barra superior',
      descricao: 'Selecione a aba Insights para continuar a demonstração do Smart Docs',
      idAlvo: 'shell-aba-insights',
    },
  },
  'meu-espaco-whatsapp': {
    id: 'meu-espaco-whatsapp',
    titulo: 'WhatsApp',
    resumo: 'Canal de mensagens operacionais — preview no tenant completo.',
    explorar: [
      { titulo: 'Canal WhatsApp', descricao: 'Simula alertas e follow-ups com fornecedores e equipe', idAlvo: 'shell-banner-preview' },
      { titulo: 'Navegação lateral', descricao: 'Alterne entre os itens do Meu Espaço', idAlvo: 'shell-meu-espaco-submenu' },
    ],
    avancar: {
      acao: 'Retomar demo',
      titulo: 'Insights na barra superior',
      descricao: 'Volte ao painel principal clicando na aba Insights',
      idAlvo: 'shell-aba-insights',
    },
  },

  /* ── Wizard Nova Leitura ── */
  'nova-leitura-1': {
    id: 'nova-leitura-1',
    titulo: 'Anexar arquivo',
    resumo: 'Nesta demo não há upload real — um clique na zona central simula o anexo de um PDF.',
    explorar: [
      { titulo: 'Nome da leitura', descricao: 'Edite o título na lateral esquerda antes de simular o envio', idAlvo: 'nl-nome-leitura' },
      { titulo: 'Zona de simulação', descricao: 'Clique na caixa central — não abre seletor de arquivo, apenas dispara os PDFs demo', idAlvo: 'nl-dropzone' },
      { titulo: 'Lista na lateral', descricao: 'Após o clique, os PDFs de demonstração aparecem agrupados nesta área', idAlvo: 'nl-arquivos-lateral' },
      { titulo: 'Ícone PDF', descricao: 'Identifica o tipo de cada arquivo anexado na simulação', idAlvo: 'nl-icone-pdf-arquivo' },
      { titulo: 'Nome do arquivo', descricao: 'Passe o mouse no nome para ver o PDF completo da demo', idAlvo: 'nl-nome-arquivo' },
      { titulo: 'Visualizar arquivo', descricao: 'Abre a prévia do PDF antes de clicar em Enviar', idAlvo: 'nl-visualizar-original' },
      { titulo: 'Remover arquivo', descricao: 'Exclui um anexo da lista — você pode simular o anexo de novo', idAlvo: 'nl-remover-arquivo' },
      { titulo: 'Status do anexo', descricao: 'Mostra que o arquivo está pronto aguardando o envio', idAlvo: 'nl-status-arquivo' },
      { titulo: 'Formatos aceitos', descricao: 'PDF, imagens, XML, planilhas e outros formatos suportados na plataforma', idAlvo: 'nl-formatos-aceitos' },
      { titulo: 'Aviso multi-documento', descricao: 'Leia a nota azul — arquivos com vários tipos são separados automaticamente', idAlvo: 'nl-aviso-multidoc' },
    ],
    avancar: {
      acao: 'Passo 1 de 4',
      titulo: 'Clique para simular o anexo',
      descricao: 'Clique na caixa central com o ícone de nuvem — um PDF demo será carregado automaticamente',
      idAlvo: 'nl-dropzone',
    },
    avancarAposAnexo: {
      acao: 'Passo 1 de 4',
      titulo: 'Clique em Enviar',
      descricao: 'O PDF demo já está na lateral, confirme com Enviar para iniciar a análise',
      idAlvo: 'nl-enviar-lateral',
    },
  },
  'nova-leitura-2': {
    id: 'nova-leitura-2',
    titulo: 'Análise do arquivo',
    resumo: 'Acompanhe a IA classificando páginas, extraindo campos e validando consistência.',
    explorar: [
      { titulo: 'Etapas da análise', descricao: 'Veja o progresso em tempo real na área principal', idAlvo: 'nl-analise-progresso' },
      { titulo: 'Animação central', descricao: 'O ícone de cérebro indica processamento ativo da IA', idAlvo: 'nl-analise-cerebro' },
      { titulo: 'Ícone PDF', descricao: 'Identifica o arquivo original enviado na simulação', idAlvo: 'nl-icone-pdf-arquivo' },
      { titulo: 'Expandir documentos', descricao: 'Clique na seta para listar Invoice, Packing List e demais tipos extraídos', idAlvo: 'nl-expandir-arquivo' },
      { titulo: 'Documento extraído', descricao: 'Cada linha mostra o tipo identificado e a quantidade de itens lidos', idAlvo: 'nl-documento-extraido' },
      { titulo: 'Visualizar original', descricao: 'Abre a prévia do PDF completo anexado na leitura', idAlvo: 'nl-visualizar-original' },
      { titulo: 'Visualizar documento', descricao: 'Prévia só do documento extraído (ex.: Invoice) com a contagem de itens', idAlvo: 'nl-visualizar-documento' },
    ],
    avancar: {
      acao: 'Passo 2 de 4',
      titulo: 'Ir para conferência',
      descricao: 'Quando a análise concluir, clique em Continuar na lateral (não em Voltar)',
      idAlvo: 'nl-continuar-lateral',
    },
  },
  'nova-leitura-4': {
    id: 'nova-leitura-4',
    titulo: 'Resultado das leituras',
    resumo: 'Pacote final pronto — exporte no formato do Smart Docs como no produto real.',
    explorar: [
      { titulo: 'Métricas finais', descricao: 'Confira acertos, tempo total e performance da leitura', idAlvo: 'nl-resultado-metricas' },
      { titulo: 'Seleção em lote', descricao: 'Marque arquivos individuais para download parcial', idAlvo: 'nl-resultado-selecao' },
      { titulo: 'Baixar todos', descricao: 'Gere ZIPs de todos os PDFs processados de uma vez', idAlvo: 'nl-resultado-baixar-todos' },
      { titulo: 'Feedback de download', descricao: 'Acompanhe progresso e confirmação após cada exportação', idAlvo: 'nl-resultado-feedback' },
    ],
    avancar: {
      acao: 'Passo 4 de 4',
      titulo: 'Baixar pacote docs',
      descricao: 'Clique Baixar em cada arquivo — o ZIP segue o padrão {arquivo}-docs.zip',
      idAlvo: 'nl-baixar-docs',
    },
  },
  'preview-documento': {
    id: 'preview-documento',
    titulo: 'Visualizar documento',
    resumo: 'Prévia do PDF ou documento extraído em tela cheia.',
    explorar: [
      { titulo: 'Área de prévia', descricao: 'Navegue pelo conteúdo renderizado do documento', idAlvo: 'nl-preview-area' },
      { titulo: 'Cabeçalho', descricao: 'O título mostra qual arquivo ou documento está aberto', idAlvo: 'nl-preview-cabecalho' },
    ],
    avancar: {
      acao: 'Fechar prévia',
      titulo: 'X no canto superior',
      descricao: 'Feche a visualização para voltar ao passo em que estava',
      idAlvo: 'nl-preview-fechar',
    },
  },

  /* ── Conferência (passo 3) ── */
  'conferencia-campos': {
    id: 'conferencia-campos',
    titulo: 'Conferência de campos',
    resumo: 'Valide cada campo extraído — edite, filtre e compare com o original.',
    explorar: [
      { titulo: 'Abas na lateral', descricao: 'Troque Invoice, Packing List, BL e outros documentos do PDF', idAlvo: 'conf-documentos-lateral' },
      { titulo: 'Barra de progresso', descricao: 'Acompanhe quantos campos já foram preenchidos no documento', idAlvo: 'conf-progresso' },
      { titulo: 'Filtros e busca', descricao: 'Filtre por preenchidos, vazios ou busque por nome de campo', idAlvo: 'conf-filtros' },
      { titulo: 'Seções colapsáveis', descricao: 'Expanda Dados gerais, Mercadoria, Containers e demais blocos', idAlvo: 'conf-secoes' },
      { titulo: 'Campos da grade', descricao: 'Clique nos valores para simular edição e conferência manual', idAlvo: 'conf-campos' },
      { titulo: 'Comparar arquivo', descricao: 'Abre o PDF original lado a lado com os campos extraídos', idAlvo: 'conf-comparar' },
      { titulo: 'Abas de conferência', descricao: 'Alterne Campos, Análise de Riscos e Consultor inteligente', idAlvo: 'conf-abas-principais' },
      { titulo: 'Continuar', descricao: 'Quando terminar de explorar, avance para o resultado das leituras', idAlvo: 'nl-continuar-lateral' },
    ],
    avancar: {
      acao: 'Passo 3 de 4',
      titulo: 'Continuar para o resultado',
      descricao: 'Depois de testar as abas, clique em Continuar na lateral (não em Voltar)',
      idAlvo: 'nl-continuar-lateral',
    },
  },
  'conferencia-riscos': {
    id: 'conferencia-riscos',
    titulo: 'Análise de riscos',
    resumo: 'Alertas de inconsistência, gráficos e comunicação com fornecedor.',
    explorar: [
      { titulo: 'Gráfico de aprovação', descricao: 'Veja a distribuição de riscos por severidade', idAlvo: 'riscos-grafico' },
      { titulo: 'Lista de alertas', descricao: 'Expanda cada risco para ler descrição e impacto', idAlvo: 'riscos-lista' },
      { titulo: 'Conferência manual', descricao: 'Marque itens revisados para simular validação humana', idAlvo: 'riscos-conferencia-manual' },
      { titulo: 'E-mail ao fornecedor', descricao: 'Teste o fluxo de notificação sobre inconsistências', idAlvo: 'riscos-email-fornecedor' },
      { titulo: 'Comparar arquivo', descricao: 'Cruze o alerta com o PDF original', idAlvo: 'riscos-comparar' },
    ],
    avancar: {
      acao: 'Passo 3 de 4',
      titulo: 'Marque e avance',
      descricao: 'Revise os riscos críticos e depois clique em Continuar na lateral',
      idAlvo: 'nl-continuar-lateral',
    },
  },
  'conferencia-qa': {
    id: 'conferencia-qa',
    titulo: 'Consultor inteligente',
    resumo: 'Pergunte à Gabi sobre o documento — atalhos e chat como no produto real.',
    explorar: [
      { titulo: 'Sugestões rápidas', descricao: 'Clique nos chips de pergunta para ver respostas instantâneas', idAlvo: 'qa-sugestoes' },
      { titulo: 'Campo de pergunta', descricao: 'Digite dúvidas sobre campos, riscos ou consistência', idAlvo: 'qa-composer' },
      { titulo: 'Respostas em markdown', descricao: 'A Gabi responde com formatação e destaques como no Smart Docs', idAlvo: 'qa-respostas' },
      { titulo: 'Contexto do documento', descricao: 'As respostas usam o documento selecionado na lateral', idAlvo: 'qa-contexto' },
    ],
    avancar: {
      acao: 'Passo 3 de 4',
      titulo: 'Avançar para resultado',
      descricao: 'Depois de testar o consultor, clique em Continuar na lateral',
      idAlvo: 'nl-continuar-lateral',
    },
  },
}

export type EstadoShellTutorialSimulador = {
  abaAtiva: 'insights' | 'lista'
  sidebarAtivo: 'insights' | 'historico' | 'config'
  meuEspacoItemAtivo: string | null
  modalNovoAberto: boolean
  linhaListaExpandida: string | null
}

/** Shell — + Novo aberto libera o canto direito do toolbar */
export function resolverPosicaoPreferencialTutorialShellSimulador(
  novoDropdownAberto: boolean,
): PosicaoPreferencialTutorial {
  return novoDropdownAberto ? 'inferior-esquerda' : 'inferior-direita'
}

export type EstadoPosicaoTutorialNovaLeituraSimulador = {
  idTela: string
  passo: number
  totalArquivos: number
  previewAberto: boolean
}

/**
 * Wizard Nova Leitura — canto inferior direito: libera dropzone, fechar (topo) e CTAs da lateral esquerda.
 */
export function resolverPosicaoPreferencialTutorialNovaLeituraSimulador(
  _estado: EstadoPosicaoTutorialNovaLeituraSimulador,
): PosicaoPreferencialTutorial {
  return 'inferior-direita'
}

export function resolverIdTelaShellSimulador(estado: EstadoShellTutorialSimulador): string | null {
  if (estado.modalNovoAberto) return null
  if (estado.meuEspacoItemAtivo) return `meu-espaco-${estado.meuEspacoItemAtivo}`
  if (estado.sidebarAtivo === 'config') return 'config'
  if (estado.sidebarAtivo === 'historico') return 'historico'
  if (estado.abaAtiva === 'lista') {
    return estado.linhaListaExpandida ? 'lista-detalhe' : 'lista'
  }
  if (estado.sidebarAtivo === 'insights') return 'insights'
  return null
}

export type EstadoNovaLeituraTutorialSimulador = {
  passo: number
  previewAberto: boolean
}

export function resolverIdTelaNovaLeituraSimulador(estado: EstadoNovaLeituraTutorialSimulador): string | null {
  if (estado.previewAberto) return 'preview-documento'
  if (estado.passo === 3) return null
  return `nova-leitura-${estado.passo}`
}

export type AbaConferenciaTutorial = 'campos' | 'riscos' | 'qa'

export function resolverIdTelaConferenciaSimulador(aba: AbaConferenciaTutorial): string {
  return `conferencia-${aba}`
}

/** @deprecated Use resolverIdTelaNovaLeituraSimulador */
export function resolverIdTelaNovaLeitura(passo: number): string {
  return `nova-leitura-${passo}`
}
