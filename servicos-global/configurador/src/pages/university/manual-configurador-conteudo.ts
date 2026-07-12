import type { ManualBidFreteEscopoConfig } from './manual-bid-frete-escopo-aplicacao'

export type ConfiguradorManualSlug =
  | 'visao-geral'
  | 'organizacao'
  | 'workspaces'
  | 'usuarios'
  | 'fornecedores'
  | 'assinaturas'
  | 'financeiro'
  | 'api-cockpit'
  | 'taxas-moeda'
  | 'historico'

export interface ConfiguradorManualItem {
  pathSeg: ConfiguradorManualSlug
  label: string
  secaoNum: number
  rotaApp: string
  subtitulo: string
}

export interface DocTooltipKpi {
  card: string
  tituloTooltip: string
  descricao: string
  detalhes: string[]
}

export interface DocPassoVisual {
  num: number
  titulo: string
  paragrafos: string[]
  imagem?: string
  /** Texto em cima, screenshot em largura total abaixo; tooltips/galeria depois da imagem. */
  imagemAbaixoTexto?: boolean
  /** Oculta «Passo NN» — use em cenários/estados da tela (não sequência operacional). */
  ocultarRotuloPasso?: boolean
  /** Oculta o título do bloco (ex.: screenshot complementar abaixo de uma Dica). */
  ocultarTituloPasso?: boolean
  /** Badge âmbar «Em desenvolvimento» no topo do conteúdo do passo. */
  badgeEmDesenvolvimento?: boolean
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
  /** Dica/lembrete logo após o parágrafo de índice `indice` (0 = primeiro). */
  calloutAposParagrafo?: { indice: number; callout: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string } }
  callouts?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }[]
  tooltipsKpi?: DocTooltipKpi[]
  galeriaTelas?: DocGaleriaTela[]
  /** Frase em largura total entre duas linhas da galeria (`indice` = último item da 1ª linha, 0-based). */
  galeriaFraseAposIndice?: { indice: number; texto: string }
  linkCapitulo?: { texto: string; href: string }
  /** Figura logo após o parágrafo de índice `indice` (0 = primeiro). */
  figurasAposParagrafo?: DocFiguraAposParagrafo[]
  /** Duas telas lado a lado na coluna direita (comparativo sem × com). */
  galeriaComparacao?: { legenda: string; imagem: string }[]
  /** Duas ou mais figuras lado a lado após um parágrafo (largura total). */
  galeriaComparacaoAposParagrafo?: {
    indice: number
    telas: DocGaleriaComparacaoTela[]
    ampliarInferiorDireito?: boolean
    /** Colunas da grade (padrão: até 2). */
    colunas?: number
    /** Texto acima de cada print no estilo parágrafo do manual (em vez do card UX10). */
    textoAcimaEstiloCorpo?: boolean
    /** Sobrescreve frase → print e margem entre cenários (px). */
    espacoTextoFiguraPx?: number
    /** Cabeçalho de passo (chip + legenda roxa) acima da grade — paridade com `galeriaTelasAposTabela`. */
    legendaPasso?: string
    /** Chips numerados do infográfico de importação (ex.: ['01'] = planilha). */
    pilaresImportarFormas?: Array<'01' | '02' | '03' | '04'>
    /** Título de etapa acima da grade (ex.: Etapa 2 — Mapeamento). */
    tituloEtapa?: string
    /** Parágrafo introdutório logo abaixo do título da etapa. */
    textoIntro?: string
    /** Blocos «Via Hub» / «Via Lista» com borda lateral (paridade passo visual modo cenários). */
    cenariosAcesso?: {
      titulo: string
      texto: string
      imagem?: string
      paragrafoAntesPrint?: string
      printsApos?: { imagem: string; paragrafoAntesPrint?: string }[]
      /** Manual BID Frete §7.01 — chip 01 + visão (mapa), 2 (tooltip) ou 3 (lista). */
      chipAcessoPainelCotacao?: 'mapa' | 'tooltip' | 'lista'
    }[]
    /** Parágrafos à direita do primeiro print (grade 4 col — ocupa 3 colunas). */
    textoAoLado?: string[]
    /** Infográfico compacto das colunas de mapeamento ao lado do print 08. */
    infograficoMapeamentoImportarColunas?: boolean
    /** Manual Pedido § Transferir — chips Novo pedido / Existente / Redução acima da grade. */
    mostrarChipsTransferirTresTipos?: boolean
    /** Manual Pedido § Transferir — badge do tipo no título da etapa (ex.: novo + «passo a passo»). */
    chipTransferirTituloEtapa?: 'novo' | 'existente' | 'reducao'
    /** Manual BID Frete § Nova cotação — chips Marítimo / Aéreo / Rodoviário acima da grade. */
    mostrarChipsBidFreteModalTransporte?: boolean
    /** Com `mostrarChipsBidFreteModalTransporte`, alinha «válido para» + chips à direita do título da etapa. */
    chipsBidFreteModalTransporteAoLadoTitulo?: boolean
    /** Manual BID Frete — ícones discretos de escopo (Operação · Modal) ao lado do título. */
    iconesEscopoBidFrete?: ManualBidFreteEscopoConfig
    /** Manual BID Frete § Nova cotação — badge do modal no título da etapa. */
    chipBidFreteModalTransporte?: 'maritimo' | 'aereo' | 'rodoviario'
    /** Manual BID Frete §4.02.01 — chip 01 + lápis da forma Manual no título da etapa. */
    chipBidFreteFormaManual?: boolean
    /** Manual BID Frete §6.03.01 — chip BID (Stack) no título da etapa. */
    chipBidFreteBid?: boolean
    /** Manual BID Frete §7.04 — ícone de token não utilizado no título da etapa. */
    chipBidFreteTokenNaoUtilizado?: boolean
    /** Ritmo extra após o bloco da etapa (antes da próxima etapa com título). */
    espacoInferiorAposEtapaPx?: number
    /** Manual BID Frete § Nova cotação — chips FCL / LCL / Aéreo-LCL-Rodo acima da grade. */
    mostrarChipsBidFreteTipoCarga?: boolean
    /** Manual BID Frete § Nova cotação — badge do tipo de carga no título da etapa. */
    chipBidFreteTipoCarga?: 'fcl' | 'lcl' | 'air_lcl_rodo'
    /** Manual Pedido § Transferir — mapa UX 10 do resultado esperado (saldos e quantidades). */
    infograficoTransferirResultadoEsperado?: 'novo' | 'existente' | 'reducao'
    /** Manual BID Frete § Nova cotação — mapa UX 10 do resultado esperado na Lista. */
    infograficoBidFreteNovaCotacaoResultadoEsperado?: boolean
    /** Manual BID Frete §6.03.01 — mapa UX 10: BID como pacote de cotações existentes. */
    infograficoBidFreteBidPacoteCotacoes?: boolean
    /** Manual BID Frete §4.02.01 — cards dos campos do passo Modal e Operação (após o print). */
    infograficoBidFreteModalOperacaoCampos?: boolean
    /** Manual BID Frete §4.02.01 — print(s) após infográfico «Campos deste passo», antes das DICAS. */
    telasAposInfograficoBidFreteModalOperacaoCampos?: DocGaleriaComparacaoTela[]
    /** Manual BID Frete §4.02.01 — parágrafo entre infográfico e print anotado (ritmo §9.1.1). */
    textoAposInfograficoBidFreteModalOperacaoCampos?: string
    /** Manual BID Frete §4.02.01 — réplica interativa do passo Modal e Operação (após DICAS). */
    simuladorBidFreteModalOperacao?: boolean
    /** Manual BID Frete §4.02.01 — cards dos campos do passo Origem e Destino (após o print). */
    infograficoBidFreteOrigemDestinoCampos?: boolean
    /** Manual BID Frete §4.02.01 — print(s) após infográfico Origem e Destino, antes das DICAS. */
    telasAposInfograficoBidFreteOrigemDestinoCampos?: DocGaleriaComparacaoTela[]
    /** Manual BID Frete §4.02.01 — parágrafo entre infográfico Origem e Destino e prints de exemplo. */
    textoAposInfograficoBidFreteOrigemDestinoCampos?: string
    /** Manual BID Frete §4.02.01 — DICA entre a 1ª e a 2ª linha da grade de prints (11–12 / 13–14). */
    calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos?: DocCalloutManual | DocCalloutManual[]
    /** Manual BID Frete §4.02.01 — parágrafo da seção destino (após DICAS de origem, antes dos prints 15–18). */
    textoSecaoDestinoAposCalloutOrigemDestinoBidFrete?: string
    /** Manual BID Frete §4.02.01 — prints da seção destino (após DICAS de origem). */
    telasSecaoDestinoAposCalloutOrigemDestinoBidFrete?: DocGaleriaComparacaoTela[]
    /** Manual BID Frete §4.02.01 — DICA entre linhas da grade destino (15–16 / 17–18). */
    calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete?: DocCalloutManual | DocCalloutManual[]
    /** Manual BID Frete §4.02.01 — DICAS após prints destino. */
    calloutAposSecaoDestinoOrigemDestinoBidFrete?: DocCalloutManual | DocCalloutManual[]
    /** Manual BID Frete §4.02.01 — réplica interativa do passo Origem e Destino (após DICAS destino). */
    simuladorBidFreteOrigemDestino?: boolean
    /** Manual Pedido § Consolidar — infográfico das regras do passo 2 (DE/PARA). */
    infograficoConsolidarPasso2Regras?: boolean
    /** Manual Pedido § Consolidar — resultado esperado após confirmar. */
    infograficoConsolidarResultadoEsperado?: boolean
    /** Manual Pedido § Consolidar — prints 05–06 + infográfico resultado num único bloco. */
    layoutConsolidarResultadoUnificado?: boolean
    /** Manual Pedido § Consolidar — grade de exemplos do passo 2 (não são passos numerados). */
    rotuloConsolidarExemplosPasso2?: boolean
    /** Manual Pedido § Consolidar — layout 1+3+1 (filtro → Igual/Divergente/Vazio → Próximo). */
    layoutConsolidarExemplosPasso2?: boolean
    /** Manual Pedido § Edição em massa — infográfico passo 1 (Campos). */
    infograficoEdicaoMassaPasso1Regras?: boolean
    /** Manual Pedido § Edição em massa — catálogo Colunas da Lista (Massa P/I). */
    mostrarCatalogoEdicaoMassaPedidoLista?: boolean
    /** Manual Pedido § Edição em massa — infográfico passo 2 (Revisão). */
    infograficoEdicaoMassaPasso2Regras?: boolean
    /** Manual Pedido § Edição em massa — resultado esperado após confirmar. */
    infograficoEdicaoMassaResultadoEsperado?: boolean
    /** Manual Pedido § Edição em massa — exemplos ilustrativos do passo 1. */
    rotuloEdicaoMassaExemplosPasso1?: boolean
    /** Manual Pedido § Edição em massa — exemplos ilustrativos do passo 2. */
    rotuloEdicaoMassaExemplosPasso2?: boolean
    /** Manual Pedido § Edição em massa — grade 3+3 de exemplos do passo 1. */
    layoutEdicaoMassaExemplosPasso1?: boolean
    /** Manual Pedido § Edição em massa — grade 1+3 de exemplos do passo 2. */
    layoutEdicaoMassaExemplosPasso2?: boolean
    /** Primeiro(s) print(s) em largura total; demais em grade (ex.: BID Frete § Abrir nova cotação). */
    layoutPrimeiroPrintLarguraTotal?: boolean
    /** Com `layoutPrimeiroPrintLarguraTotal`, quantos prints iniciais ocupam linha inteira (padrão: 1). */
    layoutPrimeirosPrintsLarguraTotal?: number
    /** Dica(s) logo abaixo desta grade (ex.: entre duas linhas de prints). */
    calloutApos?: DocCalloutManual | DocCalloutManual[]
    /** Manual Pedido §06 Dashboard — ícone de mão (grab) + área vermelha de guia ao mover. */
    mostrarIndicadoresMoverDashboardPedido?: boolean
    /** Manual Pedido §07 Kanban — cards do cabeçalho da coluna (status, contagem, ordenar). */
    mostrarCardsKanbanCabecalhoPedido?: boolean
  }[]
  /** Com `imagemAbaixoTexto`, renderiza os cards de tooltip KPI abaixo do screenshot. */
  tooltipsKpiAposImagem?: boolean
  /** Com `imagemAbaixoTexto`, parágrafos entre o screenshot e tooltips/galeria. */
  paragrafosAposImagem?: string[]
  /** Com `imagemAbaixoTexto`, grade (chip + título + prints) após o screenshot principal. */
  galeriaComparacaoAposImagem?: Omit<
    NonNullable<DocPassoVisual['galeriaComparacaoAposParagrafo']>[number],
    'indice'
  >[]
  /** Com `imagemAbaixoTexto`, callout logo abaixo do screenshot (antes de `paragrafosAposImagem`). */
  calloutAposImagem?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
  /** Com `imagemAbaixoTexto`, callout à direita do texto (antes do screenshot). */
  calloutAoLadoTexto?: boolean
  /** Dica compacta à esquerda e screenshot à direita (rodapé do bloco). */
  dicaAoLadoImagem?: {
    callout: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
    imagem: string
    legenda?: string
  }
  /** Grade de cards (colunas da tabela). */
  colunasTabela?: DocColunaTabela[]
  /** Manual Smart Docs §05 — tabela das 15 colunas padrão da Lista. */
  mostrarTabelaColunasPadraoLista?: boolean
  /** Manual Smart Docs §05 — catálogo completo nativo (accordion + busca). */
  mostrarCatalogoColunasListaSmartRead?: boolean
  /** Dica após a tabela de colunas padrão (antes da galeria de customização). */
  calloutAposTabelaColunasPadrao?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
  /** Manual Smart Docs §05 — infográfico dos 4 pilares de customização da Lista. */
  mostrarInfograficoSmartDocsListaCustomizacao?: boolean
  /** Manual Smart Docs §05 — infográfico dos painéis (abas) da Lista. */
  mostrarInfograficoSmartDocsListaPaineis?: boolean
  /** Manual Smart Docs §05.10 — swimlane Lista Leitura → integração API Cockpit. */
  mostrarInfograficoListaLeituraSmartReadIntegracaoApiCockpit?: boolean
  /** Manual Pedido §05 — tabela das colunas padrão da Lista. */
  mostrarTabelaColunasPadraoListaPedido?: boolean
  /** Manual Pedido §05 — infográfico dos 4 pilares de customização da Lista. */
  mostrarInfograficoPedidoListaCustomizacao?: boolean
  /** Manual Pedido §05 — mapa UX 10 do catálogo nativo (>100 colunas por grupo). */
  mostrarInfograficoPedidoCatalogoColunasLista?: boolean
  /** Manual Pedido — accordion «Colunas da Lista» (sem infográfico UX10). */
  mostrarCatalogoColunasPedidoLista?: boolean
  /** Manual Pedido §06 Dashboard — accordion de sugestões do modal Explorar sugestões. */
  mostrarCatalogoDashboardSugestoesPedido?: boolean
  /** Índice da galeria (0-based) após a qual inserir o catálogo; omitido = antes do callout final. */
  catalogoDashboardSugestoesAposGaleriaIndice?: number
  /** Manual Pedido §06 Dashboard — accordion dos tipos de dado (Passo 3 Criar do zero). */
  mostrarCatalogoDashboardTiposVisualizacaoPedido?: boolean
  /** Índice da galeria após a qual inserir o catálogo de tipos de visualização. */
  catalogoDashboardTiposVisualizacaoAposGaleriaIndice?: number
  /** Manual Pedido §09 Histórico — catálogo accordion de eventos auditados. */
  mostrarCatalogoHistoricoPedido?: boolean
  /** Índice do parágrafo após o qual inserir o catálogo (padrão: 0). */
  catalogoHistoricoPedidoAposParagrafo?: number
  /** Índice do parágrafo após o qual inserir o catálogo (padrão: 0). */
  catalogoColunasPedidoAposParagrafo?: number
  /** Manual Pedido §05 — infográfico pedido × itens e regras de alerta. */
  mostrarInfograficoPedidoListaAlertas?: boolean
  /** Manual Pedido §05 — mapa das 4 formas de criar via Novo (Importação, API, Smart Docs, Manual). */
  mostrarInfograficoPedidoListaImportarFormas?: boolean
  /** Manual Pedido § Transferir — mapa mental dos 3 tipos (Novo PO, Existente, Redução). */
  mostrarInfograficoPedidoListaTransferirFluxo?: boolean
  /** Índice do parágrafo após o qual inserir o mapa Transferir (padrão: 1). */
  transferirInfograficoAposParagrafo?: number
  /** Manual BID Frete § Insights — infográfico da seleção de rota no mapa global. */
  mostrarInfograficoBidFreteMapa?: boolean
  /** Manual BID Frete § Painel da Cotação — infográfico das três etapas do painel. */
  mostrarInfograficoBidFretePainelCotacao?: boolean
  /** Manual BID Frete §03 — infográfico dos cinco acordeões do painel Refinar mapa. */
  mostrarInfograficoBidFreteFiltrosMapa?: boolean
  /** Manual BID Frete §7.02 — infográfico das seis abas do Painel da Cotação. */
  mostrarInfograficoBidFreteAbasPainelCotacao?: boolean
  /** Manual BID Frete § Nova cotação manual — mapa comum + ramos modal/carga. */
  mostrarInfograficoBidFreteNovaCotacaoFluxo?: boolean
  /** Manual BID Frete §4.02 Cotação avulsa — mapa das quatro formas de criar. */
  mostrarInfograficoBidFreteCotacaoAvulsaFormas?: boolean
  /** Manual BID Frete §6.02 — comparação cotação avulsa (única) × BID (pacote). */
  mostrarInfograficoBidFreteCotacaoAvulsaVsBid?: boolean
  /** Índice do parágrafo após o qual inserir o infográfico avulsa × BID (padrão: 0). */
  bidFreteCotacaoAvulsaVsBidInfograficoAposParagrafo?: number
  /** Índice do parágrafo após o qual inserir o mapa Cotação avulsa (padrão: 0). */
  bidFreteCotacaoAvulsaFormasInfograficoAposParagrafo?: number
  /** Manual BID Frete § Controles do mapa — barra de ícones (layout distinto dos pilares). */
  mostrarInfograficoBidFreteControlesMapa?: boolean
  /** Índice do parágrafo após o qual inserir o mapa Nova cotação (padrão: 1). */
  bidFreteNovaCotacaoInfograficoAposParagrafo?: number
  /** Manual BID Frete §4.01 — fluxo + legenda de escopo após a galeria do parágrafo (em vez de antes). */
  bidFreteNovaCotacaoEscopoAposGaleriaParagrafo?: number
  /** Manual BID Frete §4.01 — frase introdutória antes do infográfico dos cinco passos (após galeria). */
  textoAntesInfograficoBidFreteNovaCotacaoFluxo?: string
  /** Manual BID Frete §4.01 — frase introdutória antes da legenda de ícones de escopo (após galeria). */
  textoAntesLegendaEscopoIconesBidFrete?: string
  /** Manual BID Frete § Nova cotação — barra de escopo Operação · Modal · Carga. */
  barraEscopoBidFrete?: ManualBidFreteEscopoConfig
  /** Índice do parágrafo após o qual inserir a barra de escopo (padrão: mesmo do infográfico). */
  barraEscopoBidFreteAposParagrafo?: number
  /** Manual BID Frete § Nova cotação — legenda dos ícones de escopo (exibir no 4.01). */
  mostrarLegendaEscopoIconesBidFrete?: boolean
  /** Índice do parágrafo após o qual inserir a legenda (padrão: mesmo do infográfico). */
  legendaEscopoIconesBidFreteAposParagrafo?: number
  /** Manual Pedido §05 — tabela de colunas/campos com alerta e acionamento. */
  mostrarTabelaAlertasPedidoLista?: boolean
  /** Manual Pedido §05 — ícones dos formatos de exportação da Lista. */
  mostrarFormatosExportacaoPedidoLista?: boolean
  /** Índice do parágrafo após o qual inserir os formatos de exportação (padrão: 1). */
  formatosExportacaoPedidoAposParagrafo?: number
  /** Manual Pedido §05 — grade dos dois caminhos do Smart Import (template vs planilha própria). */
  mostrarCaminhosImportacaoPlanilhaPedidoLista?: boolean
  /** Índice do parágrafo após o qual inserir os caminhos de importação (padrão: 1). */
  caminhosImportacaoPlanilhaAposParagrafo?: number
  /** Manual Pedido § Importar — galerias após cards dos dois caminhos (Novo → Importação + stepper). */
  galeriaComparacaoAposCaminhosImportacao?: {
    telas: DocGaleriaComparacaoTela[]
    ampliarInferiorDireito?: boolean
    colunas?: number
    textoAcimaEstiloCorpo?: boolean
    legendaPasso?: string
    pilaresImportarFormas?: Array<'01' | '02' | '03' | '04'>
    /** Título de etapa acima da grade (ex.: Etapa 1 — Upload). */
    tituloEtapa?: string
  }[]
  /** Manual Pedido §05 — ícones dos formatos de importação (Smart Import). */
  mostrarFormatosImportacaoPedidoLista?: boolean
  /** Índice do parágrafo após o qual inserir os formatos de importação. */
  formatosImportacaoPedidoAposParagrafo?: number
  /** Manual Smart Docs §05 — ícone de cursor bloqueado (lista somente visualização). */
  mostrarIndicadorCursorVisualizacao?: boolean
  /** Índice do parágrafo após o qual inserir o indicador de cursor (padrão: 1). */
  indicadorCursorVisualizacaoAposParagrafo?: number
  /** Screenshots e textos após a tabela de colunas padrão (ou após `colunasTabela`). */
  galeriaTelasAposTabela?: DocGaleriaTela[]
  /** Callout após tabela + galeria (ex.: resumo da customização completa). */
  calloutAposGaleriaTabela?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
  /** Parágrafo em texto corrido após tabela + galeria (sem caixa de callout). */
  paragrafoAposGaleriaTabela?: string
  /** Rótulo curto no mapa de subtópicos (quando `titulo` é longo). */
  tituloCurto?: string
  /** Etapa ativa (1-based) no mini-stepper do wizard — requer `wizardEtapas` no fluxo pai. */
  etapaWizard?: number
  /** Cabeçalho só com mini-stepper (sem pill `02` + prefixo nem título duplicado). */
  estiloTituloWizard?: boolean
  /** Subpassos aninhados (accordion dentro do accordion). */
  passosFilhos?: DocPassoVisual[]
  /** Rótulo hierárquico relativo ao capítulo (ex.: `02.01.03`). */
  rotuloSecao?: string
  /** `num` do passo pai — abre cadeia de acordeões ao navegar pelo sumário. */
  numPai?: number
}

export type PassoSemNumero = Omit<DocPassoVisual, 'num' | 'rotuloSecao' | 'numPai' | 'passosFilhos'> & {
  passosFilhos?: PassoSemNumero[]
}

export interface DocColunaTabela {
  coluna: string
  tituloColuna?: string
  descricao: string
  detalhes?: string[]
  imagem?: string
}

export interface DocGaleriaTelaFigura {
  imagem: string
  legenda?: string
  /** Texto explicativo acima desta figura (mesmo estilo do parágrafo do manual). */
  paragrafoAntes?: string
  /** Recorte estreito ou modal — limita largura quando a linha está centralizada. */
  larguraMaxima?: number
}

export interface DocGaleriaTelaLinhaFiguras {
  figuras: DocGaleriaTelaFigura[]
  /** Centraliza a linha (padrão: `true` quando há uma única figura). */
  centralizar?: boolean
  /** Legenda centralizada logo abaixo desta linha (estilo roxo de passo). */
  legendaApos?: string
  /** Parágrafo logo abaixo desta linha (mesmo estilo do corpo do manual). */
  paragrafoApos?: string
}

export type DocCalloutManual = {
  tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'
  texto: string
}

/** Célula de galeria comparativa (prints lado a lado após parágrafo). */
export type DocChipConsolidarExemploId = 'filtro_origem' | 'igual' | 'divergente' | 'vazio' | 'proximo'

export type DocChipEdicaoMassaExemploId =
  | 'nivel_pedido' | 'nivel_item' | 'nivel_combinado'
  | 'tipo_texto' | 'tipo_select' | 'adicionar_campo'
  | 'filtro_por_pedido' | 'filtro_todos' | 'filtro_alterados' | 'filtro_sem_efeito'

export interface DocGaleriaComparacaoTela {
  legenda: string
  imagem: string
  paragrafoAntes?: string
  /** Manual Pedido § Consolidar — badge do tipo de campo (ex.: Igual, Divergente). */
  chipConsolidarExemplo?: DocChipConsolidarExemploId
  /** Manual Pedido § Edição em massa — badge ilustrativo (nível, tipo, filtro). */
  chipEdicaoMassaExemplo?: DocChipEdicaoMassaExemploId
  /** Dica/aviso acima do print (em vez de `paragrafoAntes` descritivo). */
  calloutAntes?: DocCalloutManual
}

export interface DocGaleriaTela {
  legenda: string
  /** Obrigatório quando `imagensCompostas` não é usado. */
  imagem?: string
  /** Grade de figuras (ex.: duas telas lado a lado + modal centralizado abaixo). */
  imagensCompostas?: DocGaleriaTelaLinhaFiguras[]
  /** Card explicativo do tooltip KPI renderizado acima da legenda e do screenshot. */
  tooltipKpi?: DocTooltipKpi
  /** Texto explicativo acima da legenda e do screenshot (ex.: transição na jornada do convidado). */
  paragrafoAntes?: string
  /** Texto explicativo abaixo do screenshot, na mesma coluna da tela. */
  paragrafoDepois?: string
  /** Dica/aviso abaixo do screenshot (substitui `paragrafoDepois` quando presente). */
  calloutDepois?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
  /** Chips numerados do infográfico de customização (ex.: ['01', '02'] = ocultar + exibir). */
  pilaresCustomizacao?: Array<'01' | '02' | '03' | '04'>
  /** Chips numerados do infográfico do mapa BID Frete (ex.: ['01'] = selecionar rota). */
  pilaresMapaBidFrete?: Array<'01' | '02' | '03' | '04'>
  /** Chips numerados do infográfico do Painel da Cotação BID Frete (ex.: ['01'] = visão geral). */
  pilaresPainelCotacaoBidFrete?: Array<'01' | '02' | '03'>
  /** Chips numerados do infográfico de filtros do mapa BID Frete (ex.: ['01'] = operação). */
  pilaresFiltrosMapaBidFrete?: Array<'01' | '02' | '03' | '04' | '05'>
  /** Chips numerados do infográfico das abas do Painel da Cotação (ex.: ['01'] = Visão geral). */
  pilaresAbasPainelCotacaoBidFrete?: Array<'01' | '02' | '03' | '04' | '05' | '06'>
  /** Manual BID Frete §7.02 — réplica interativa do card Melhor proposta (Painel de Insights). */
  simuladorBidFretePainelInsights?: boolean
  /** Chips do infográfico de controles do mapa BID Frete (ex.: ['vista'] = globo/plano). */
  pilaresControlesMapaBidFrete?: Array<'vista' | 'zoom' | 'restaurar' | 'linhas' | 'rotacao'>
  /** Alinhamento da legenda do passo (padrão: `center`; com chips usa `left` ao lado). */
  legendaAlinhamento?: 'left' | 'center'
}

export interface DocFiguraAposParagrafo {
  indice: number
  imagem: string
  legenda?: string
  /** Recortes estreitos (menu lateral etc.) — evita esticar na coluna de texto. */
  larguraMaxima?: number
}

export interface DocOrigemDados {
  titulo?: string
  paragrafos: string[]
  etapas: {
    legenda: string
    paragrafos: string[]
    imagem: string
  }[]
}

export interface DocWizardEtapa {
  numero: number
  rotulo: string
}

export interface DocFluxo {
  titulo: string
  /** Rótulo curto no sumário (ex.: «Criar workspace»). Frase: só a primeira palavra e nomes próprios em maiúscula — ver ONBOARDING-DOCUMENTO.md §9.6. Se omitido, usa `titulo`. */
  tituloSumario?: string
  paragrafos?: string[]
  mostrarInfograficoPermissoesUsuario?: boolean
  /** Com `mostrarInfograficoPermissoesUsuario`, renderiza o infográfico após o passo visual de número `N` (em vez de antes dos passos). */
  infograficoPermissoesUsuarioAposPasso?: number
  mostrarInfograficoPapeisFornecedor?: boolean
  /** Manual Navegação §03 — mapa Hub/Store × produto × Configurador. */
  mostrarInfograficoMenuLateral?: boolean
  /** Manual Navegação §02 — barra de referência + grade dos 8 atalhos do menu superior. */
  mostrarInfograficoIconesMenuSuperior?: boolean
  /** Com `mostrarInfograficoIconesMenuSuperior`, renderiza o infográfico após os passos visuais. */
  infograficoIconesMenuSuperiorAposPassos?: boolean
  /** Manual Usuários §02 — fluxo de acesso e tipos Master / Standard / Fornecedor. */
  mostrarInfograficoTiposUsuario?: boolean
  /** Manual Histórico §04 — catálogo completo de eventos (tabelas). */
  mostrarCatalogoHistoricoCompleto?: boolean
  /** Manual Smart Docs §04 — mapa das métricas da tela Insights. */
  mostrarInfograficoSmartDocsInsights?: boolean
  /** Manual Pedido §04 — mapa UX 10 da tela Insights. */
  mostrarInfograficoPedidoInsights?: boolean
  /** Manual BID Frete §03 — mapa UX 10 da tela Insights. */
  mostrarInfograficoBidFreteInsights?: boolean
  /** Manual BID Frete §07 — três etapas do Painel da Cotação (após parágrafo introdutório do capítulo). */
  mostrarInfograficoBidFretePainelCotacao?: boolean
  /** Print(s) logo após o infográfico do fluxo, antes dos passos visuais. */
  figurasAposInfografico?: {
    imagem: string
    legenda?: string
    larguraMaxima?: number
    paragrafoAntes?: string
  }[]
  /** Cenários da mesma tela — oculta «Passo NN» em todos os blocos visuais do fluxo. */
  modoCenarios?: boolean
  /** Com `modoCenarios`, empilha os blocos em duas colunas 50% (comparativo sem × com). */
  cenariosLadoALado?: boolean
  /** Com `cenariosLadoALado`, textos em cima e figuras alinhadas na linha de baixo. */
  cenariosImagensAlinhadas?: boolean
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
  /** Dica/lembrete logo após o parágrafo de índice `indice` (antes do infográfico ou dos passos). */
  calloutAposParagrafo?: { indice: number; callout: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string } }
  /** Exibe o callout do fluxo depois dos passos visuais (ex.: Dica abaixo de screenshot). */
  calloutAposPassos?: boolean
  /** Figura logo após o parágrafo de índice `indice` (0 = primeiro). */
  figurasAposParagrafo?: DocFiguraAposParagrafo[]
  /** Prefixo visual em cada passo (ex.: «Lista — Visão geral»). */
  prefixoPassosVisuais?: string
  /** Slug para âncoras `manual-passo-{slug}-{num}`. */
  ancoraPassosPrefix?: string
  /** Mapa clicável de subtópicos antes dos passos (requer `prefixoPassosVisuais`). */
  mostrarMapaSubtopicosPassos?: boolean
  /** Mini-stepper das etapas do wizard (ex.: Anexar · Análise · Conferência · Resultado). */
  wizardEtapas?: DocWizardEtapa[]
  passosVisuais: DocPassoVisual[]
}

export interface DocSecao {
  num: number
  titulo: string
  paragrafos: string[]
  imagem?: string
  layoutTextoImagemLateral?: boolean
  listaEmLinha?: boolean
  lista?: string[]
  fluxos?: DocFluxo[]
  origemDados?: DocOrigemDados
  mostrarInfograficoOrganizacaoWorkspaces?: boolean
  mostrarInfograficoOrganizacao?: boolean
  mostrarInfograficoTiposUsuario?: boolean
  mostrarInfograficoFornecedoresComex?: boolean
  mostrarInfograficoHubTelas?: boolean
  /** Manual Smart Docs §01 — cards dos tipos de documento lidos pela IA. */
  mostrarInfograficoSmartDocsDocumentos?: boolean
  /** Manual Pedido §01 — mapa visual do ciclo do PO antes do embarque. */
  mostrarInfograficoPedidoVisaoGeral?: boolean
  /** Manual Navegação §01 — mapa completo de áreas, menus e caminhos. */
  mostrarInfograficoMapaNavegacaoGravity?: boolean
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
  /** Dica/aviso logo após o parágrafo de índice `indice` (só em layout texto+imagem lateral). */
  calloutAposParagrafo?: { indice: number; callout: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string } }
  /** Dica compacta à esquerda e screenshot à direita (intro com layout lateral). */
  dicaAoLadoImagem?: {
    callout: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
    imagem: string
    legenda?: string
  }
  /** Figura logo após o parágrafo de índice `indice` (0 = primeiro). */
  figurasAposParagrafo?: DocFiguraAposParagrafo[]
  /** Duas ou mais figuras lado a lado após um parágrafo (ex.: menu superior × menu lateral). */
  galeriaComparacaoAposParagrafo?: {
    indice: number
    telas: DocGaleriaComparacaoTela[]
    ampliarInferiorDireito?: boolean
    colunas?: number
    textoAcimaEstiloCorpo?: boolean
    legendaPasso?: string
    pilaresImportarFormas?: Array<'01' | '02' | '03' | '04'>
  }[]
  /** Tópicos com texto à esquerda e screenshot à direita (intro de seção). */
  topicosImagemLateral?: DocTopicoImagemLateral[]
}

export interface DocTopicoImagemLateral {
  titulo: string
  texto: string
  imagem: string
  /** Recorte estreito ou sidebar — evita esticar na coluna direita. */
  larguraMaxima?: number
}

const DOCS_BASE = '/university-gravity/docs/configurador'

export const CONFIGURADOR_MANUAL_ITENS: ConfiguradorManualItem[] = [
  {
    pathSeg: 'visao-geral',
    label: 'Visão geral',
    secaoNum: 1,
    rotaApp: '/configurador',
    subtitulo: 'Configurador principal da plataforma',
  },
  {
    pathSeg: 'organizacao',
    label: 'Organização',
    secaoNum: 2,
    rotaApp: '/configurador/organizacao',
    subtitulo: 'Empresa contratante: Dados cadastrais da conta',
  },
  {
    pathSeg: 'workspaces',
    label: 'Workspaces',
    secaoNum: 3,
    rotaApp: '/configurador/workspaces',
    subtitulo: 'Filiais, clientes e unidades operacionais',
  },
  {
    pathSeg: 'usuarios',
    label: 'Usuários',
    secaoNum: 4,
    rotaApp: '/configurador/usuarios',
    subtitulo: 'Convites, patentes e permissões da organização',
  },
  {
    pathSeg: 'fornecedores',
    label: 'Fornecedores',
    secaoNum: 5,
    rotaApp: '/configurador/fornecedores',
    subtitulo: 'Terceiros COMEX: Exportador, importador e agentes',
  },
  {
    pathSeg: 'assinaturas',
    label: 'Assinaturas',
    secaoNum: 6,
    rotaApp: '/configurador/assinaturas',
    subtitulo: 'Produtos contratados na Store e ciclo de cobrança',
  },
  {
    pathSeg: 'financeiro',
    label: 'Financeiro',
    secaoNum: 7,
    rotaApp: '/configurador/financeiro',
    subtitulo: 'Faturas, pagamentos e histórico da conta',
  },
  {
    pathSeg: 'api-cockpit',
    label: 'API Cockpit',
    secaoNum: 8,
    rotaApp: '/configurador/api-cockpit',
    subtitulo: 'Servidores, tokens, webhooks e consumo de API',
  },
  {
    pathSeg: 'taxas-moeda',
    label: 'Taxas e moeda',
    secaoNum: 9,
    rotaApp: '/configurador/taxas-moeda',
    subtitulo: 'Câmbio operacional: PTAX atual e projeção Focus',
  },
  {
    pathSeg: 'historico',
    label: 'Histórico',
    secaoNum: 10,
    rotaApp: '/configurador/historico-organizacao',
    subtitulo: 'Auditoria de alterações na organização',
  },
]

const SLUGS_VALIDOS = new Set<string>(CONFIGURADOR_MANUAL_ITENS.map(i => i.pathSeg))

const SCREENSHOT_ABRIR_CONFIGURADOR = '/university/screenshots/login-convite-passo-01-acesso-atalho.png'
/** Única tela em que o botão Ampliar fica abaixo da imagem (evita sobrepor o FAB do Hub). */
export const SCREENSHOT_HUB_ACESSO_CONFIGURADOR = '/university/screenshots/configurador-hub-acesso-configurador.png'
export const SCREENSHOT_USUARIOS_PERMISSAO_COTAR_FRETE =
  '/university/screenshots/configurador-usuarios-permissoes-cotar-frete.png'
export const SCREENSHOT_USUARIOS_PERMISSAO_MODAL =
  '/university/screenshots/configurador-usuarios-permissoes-modal.png'
const SCREENSHOT_USUARIOS_SETA_ACESSO =
  '/university/screenshots/configurador-usuarios-seta-acesso.png'
const SCREENSHOT_USUARIOS_PERMISSAO_POR_WORKSPACE_1 =
  '/university/screenshots/configurador-usuarios-permissao-por-workspace-1.png'
const SCREENSHOT_USUARIOS_PERMISSAO_POR_WORKSPACE_2 =
  '/university/screenshots/configurador-usuarios-permissao-por-workspace-2.png'
const SCREENSHOT_USUARIOS_STATUS_CONVIDADO_ATIVO =
  '/university/screenshots/configurador-usuarios-ativado.png'
const SCREENSHOT_CONFIGURADOR_MENU_LATERAL = '/university/screenshots/configurador-tela-menu-lateral.png'
const SCREENSHOT_HISTORICO_SETA_CONFIGURADOR =
  '/university/screenshots/configurador-historico-seta-configurador-menu.png'
const SCREENSHOT_HISTORICO_SETA_PRODUTO =
  '/university/screenshots/configurador-historico-seta-produto.png'

const LINK_MANUAL_WORKSPACES = '{{link:/university-gravity/docs/configurador/workspaces|workspaces}}'
const LINK_MANUAL_WORKSPACES_CAP = '{{link:/university-gravity/docs/configurador/workspaces|Workspaces}}'
const LINK_MANUAL_WORKSPACE = '{{link:/university-gravity/docs/configurador/workspaces|workspace}}'
/** Sumário §05 do manual Usuários — fluxo «Permissões do usuário». */
export const LINK_MANUAL_PERMISSOES = '{{link:/university-gravity/docs/configurador/usuarios#doc-sec-5|permissões}}'

interface PassoAreaExtras {
  paragrafos?: string[]
  tooltipsKpi?: DocTooltipKpi[]
  galeriaTelas?: DocGaleriaTela[]
  /** Texto em cima, screenshot em largura total abaixo; tooltips/galeria depois da imagem. */
  imagemAbaixoTexto?: boolean
  tooltipsKpiAposImagem?: boolean
  paragrafosAposImagem?: string[]
}

const WORKSPACES_TOOLTIPS_KPI: DocTooltipKpi[] = [
  {
    card: 'Total de Workspaces',
    tituloTooltip: 'Visão geral',
    descricao: 'Quantidade total de unidades cadastradas na organização.',
    detalhes: [
      'Total cadastradas: Todas as filiais e clientes',
      'Adicionadas hoje: Workspaces criados no dia',
    ],
  },
  {
    card: 'Workspaces Ativos',
    tituloTooltip: 'Atividade',
    descricao: 'Comparativo entre workspaces em operação e suspensos.',
    detalhes: [
      'Ativas: Acesso liberado para usuários vinculados',
      'Suspensas: Bloqueadas até reativação',
      'Taxa de atividade: Percentual de workspaces ativos',
    ],
  },
  {
    card: 'Status dos Workspaces',
    tituloTooltip: 'Distribuição',
    descricao: 'Gráfico com a proporção entre ativos e suspensos.',
    detalhes: [
      'Legenda Ativo / Suspenso no card',
      'Tooltip repete totais, soma geral e taxa de atividade',
    ],
  },
]

/** Screenshots com tooltip aberto — Drive 3. Usuarios: tooltip_1, tooltip_2, 3…tooltip_2 (média), 3…tooltip_4 */
const USUARIOS_GALERIA_TOOLTIPS_KPI = [
  { legenda: '1 · Total de Usuários', imagem: '/university/screenshots/configurador-usuarios-cards-tooltip-1.png' },
  { legenda: '2 · Acessos Concedidos', imagem: '/university/screenshots/configurador-usuarios-cards-tooltip-2.png' },
  { legenda: '3 · Média de Acessos Concedidos', imagem: '/university/screenshots/configurador-usuarios-cards-tooltip-3.png' },
  { legenda: '4 · Total Workspaces', imagem: '/university/screenshots/configurador-usuarios-cards-tooltip-4.png' },
] as const

const USUARIOS_JORNADA_FRASE_APOS_LINK =
  `A partir daqui, o usuário cria sua senha e entra no **Hub** de acordo com as ${LINK_MANUAL_PERMISSOES} e acessos concedidos (se **Standard** ou **Fornecedor**) ou com acesso completo se for novo usuário **Master**.`

/** Sequência pós-envio — jornada do convidado (Drive: 3. Usuarios/tela_configurador_convite_usuario_* e login_*). */
const USUARIOS_GALERIA_JORNADA_CONVIDADO: DocGaleriaTela[] = [
  { legenda: '1 · Convite enviado', imagem: '/university/screenshots/configurador-usuarios-convite-enviado-aviso.png' },
  { legenda: '2 · Link no e-mail', imagem: '/university/screenshots/configurador-usuarios-convite-email-recebido-seta.png' },
  {
    legenda: '3 · Primeiro acesso',
    imagem: '/university/screenshots/configurador-usuarios-convite-login-preenchido.png',
  },
  {
    legenda: '4 · Hub',
    imagem: '/university/screenshots/configurador-usuarios-convite-login-primeiro-acesso.png',
  },
]

const USUARIOS_TOOLTIPS_KPI: DocTooltipKpi[] = [
  {
    card: 'Total de Usuários',
    tituloTooltip: 'Visão geral',
    descricao: 'Quantidade de pessoas cadastradas ou convidadas na organização.',
    detalhes: [
      'Total de registros: Ativos, inativos e convidados pendentes',
      'Novos hoje: Usuários adicionados no dia',
    ],
  },
  {
    card: 'Acessos Concedidos',
    tituloTooltip: 'Vínculos de acesso',
    descricao: 'Soma de todas as ligações usuário ↔ workspace na organização.',
    detalhes: [
      `Total de acessos: Cada ${LINK_MANUAL_WORKSPACE} marcado para um usuário conta um vínculo`,
      'Master não precisa de vínculo explícito: Acessa todos automaticamente',
    ],
  },
  {
    card: 'Média de Acessos Concedidos',
    tituloTooltip: 'Distribuição média',
    descricao: `Média de ${LINK_MANUAL_WORKSPACES} por usuário ativo na organização.`,
    detalhes: [
      'Média geral: Ajuda a identificar contas com pouco ou muito alcance',
    ],
  },
  {
    card: 'Total Workspaces',
    tituloTooltip: 'Densidade e distribuição',
    descricao: `Gráfico comparando usuários com e sem acesso a algum ${LINK_MANUAL_WORKSPACE}.`,
    detalhes: [
      `Com acesso: Pelo menos um ${LINK_MANUAL_WORKSPACE} habilitado (ou tipo Master)`,
      `Sem acesso: Ainda sem ${LINK_MANUAL_WORKSPACE} vinculado`,
      `Tooltip repete totais de usuários, ${LINK_MANUAL_WORKSPACES} e média por pessoa`,
    ],
  },
]

const FORNECEDORES_TOOLTIPS_KPI: DocTooltipKpi[] = [
  {
    card: 'Total de fornecedores',
    tituloTooltip: 'Visão geral',
    descricao: 'Quantidade de terceiros cadastrados na organização.',
    detalhes: [
      'Ativas: Disponíveis em dropdowns operacionais',
      'Inativas: Ocultas em novos pedidos e processos',
      'Total: Soma de ativas e inativas',
    ],
  },
  {
    card: 'Fornecedores ativos',
    tituloTooltip: 'Disponibilidade',
    descricao: 'Parceiros que podem ser selecionados nos produtos.',
    detalhes: [
      'Ativas: Aparecem em cotações, pedidos e processos',
      'Inativas: Histórico preservado, sem uso em novas operações',
    ],
  },
  {
    card: 'Distribuição por tipo',
    tituloTooltip: 'Papéis COMEX',
    descricao: 'Gráfico com os papéis mais frequentes entre os cadastros.',
    detalhes: [
      'Exportador, Importador, Agente, Despachante etc.',
      'Um mesmo fornecedor pode acumular vários papéis',
    ],
  },
]

const FORNECEDORES_GALERIA_TOOLTIPS_KPI: DocGaleriaTela[] = [
  {
    legenda: '1 · Total de fornecedores',
    imagem: '/university/screenshots/configurador-fornecedores-cards-tooltip-1.png',
    tooltipKpi: FORNECEDORES_TOOLTIPS_KPI[0],
  },
  {
    legenda: '2 · Fornecedores ativos',
    imagem: '/university/screenshots/configurador-fornecedores-cards-tooltip-2.png',
    tooltipKpi: FORNECEDORES_TOOLTIPS_KPI[1],
  },
  {
    legenda: '3 · Distribuição por tipo',
    imagem: '/university/screenshots/configurador-fornecedores-cards-tooltip-3.png',
    tooltipKpi: FORNECEDORES_TOOLTIPS_KPI[2],
  },
]

/** Screenshots com tooltip aberto: Drive: 5. Assinaturas/tela_configurador_assinaturas_cards_tooltip_N.png */
const ASSINATURAS_TOOLTIPS_KPI: DocTooltipKpi[] = [
  {
    card: 'Produtos Ativos',
    tituloTooltip: 'STATUS DAS ASSINATURAS',
    descricao: 'Resumo de quantos produtos Gravity estão contratados e em uso na organização.',
    detalhes: [
      'Ativas: Produto contratado e operacional',
      'Em Teste: Período de trial manual antes do fechamento',
      'Suspensas: Acesso bloqueado temporariamente pelo administrador',
    ],
  },
  {
    card: 'Em Teste',
    tituloTooltip: 'PERÍODO DE TESTE',
    descricao: 'Produtos em avaliação antes da contratação definitiva.',
    detalhes: [
      'Em trial: Status atribuído manualmente pelo Master',
      'Não conta no card Produtos Ativos até virar Ativa',
    ],
  },
  {
    card: 'Acessos Suspensos',
    tituloTooltip: 'ATENÇÃO',
    descricao: 'Assinaturas com acesso bloqueado: Requerem ação do administrador.',
    detalhes: [
      'Assinaturas suspensas: Usuários perdem acesso ao produto',
      'Reative pelo ícone de pausa/play na linha da tabela',
    ],
  },
]

const ASSINATURAS_GALERIA_TOOLTIPS_KPI: DocGaleriaTela[] = [
  {
    legenda: '1 · Produtos Ativos',
    imagem: '/university/screenshots/configurador-assinaturas-cards-tooltip-1.png',
    tooltipKpi: ASSINATURAS_TOOLTIPS_KPI[0],
  },
  {
    legenda: '2 · Em Teste',
    imagem: '/university/screenshots/configurador-assinaturas-cards-tooltip-2.png',
    tooltipKpi: ASSINATURAS_TOOLTIPS_KPI[1],
  },
  {
    legenda: '3 · Acessos Suspensos',
    imagem: '/university/screenshots/configurador-assinaturas-cards-tooltip-3.png',
    tooltipKpi: ASSINATURAS_TOOLTIPS_KPI[2],
  },
]

const TAXAS_MOEDA_TOOLTIPS_KPI: DocTooltipKpi[] = [
  {
    card: 'USD / BRL',
    tituloTooltip: 'DÓLAR AMERICANO · COTAÇÃO ATUAL',
    descricao: 'Última PTAX armazenada para o dólar americano.',
    detalhes: [
      'Compra e Venda: Taxas do boletim BCB/PTAX',
      'Data e hora: Referência do boletim sincronizado',
      'Fonte: BCB/PTAX',
    ],
  },
  {
    card: 'EUR / BRL',
    tituloTooltip: 'EURO · COTAÇÃO ATUAL',
    descricao: 'Última PTAX armazenada para o euro.',
    detalhes: [
      'Compra e Venda: Taxas do boletim BCB/PTAX',
      'Data e hora: Referência do boletim sincronizado',
      'Fonte: BCB/PTAX',
    ],
  },
  {
    card: 'Moedas ativas',
    tituloTooltip: 'SITUAÇÃO POR MOEDA',
    descricao: 'Quantas das sete moedas suportadas já possuem cotação armazenada.',
    detalhes: [
      'USD, EUR, GBP, CHF, CNY, JPY, CAD: Lista completa no tooltip',
      'Sem dado: Moeda ainda não sincronizada nesta organização',
      'Total ativas: Contagem usada no valor do card',
    ],
  },
]

const TAXAS_MOEDA_GALERIA_TOOLTIPS_KPI: DocGaleriaTela[] = [
  {
    legenda: '1 · USD / BRL',
    imagem: '/university/screenshots/configurador-taxas-moeda-cards-tooltip-1.png',
    tooltipKpi: TAXAS_MOEDA_TOOLTIPS_KPI[0],
  },
  {
    legenda: '2 · EUR / BRL',
    imagem: '/university/screenshots/configurador-taxas-moeda-cards-tooltip-2.png',
    tooltipKpi: TAXAS_MOEDA_TOOLTIPS_KPI[1],
  },
  {
    legenda: '3 · Moedas ativas',
    imagem: '/university/screenshots/configurador-taxas-moeda-cards-tooltip-3.png',
    tooltipKpi: TAXAS_MOEDA_TOOLTIPS_KPI[2],
  },
]

const HISTORICO_TOOLTIPS_KPI: DocTooltipKpi[] = [
  {
    card: 'Total de eventos',
    tituloTooltip: 'Visão geral',
    descricao: 'Quantidade de registros carregados na página atual da auditoria.',
    detalhes: [
      'Paginação: 25 eventos por página',
      'Use Anterior/Próxima para percorrer o histórico completo',
    ],
  },
  {
    card: 'Últimos 7 dias',
    tituloTooltip: 'Atividade recente',
    descricao: 'Eventos registrados na última semana entre os registros carregados.',
    detalhes: ['% do total: Proporção em relação à página atual'],
  },
  {
    card: 'Status dos eventos',
    tituloTooltip: 'Distribuição por resultado',
    descricao: 'Proporção de Sucesso, Falha e Parcial nos eventos da página.',
    detalhes: [
      'Sucesso: Ação concluída sem erro',
      'Falha: Ação bloqueada ou com erro',
      'Parcial: Conclusão incompleta ou com ressalvas',
    ],
  },
]

const HISTORICO_COLUNAS_AUDITORIA: DocColunaTabela[] = [
  {
    coluna: 'Data/Hora',
    descricao: 'Momento em que o evento foi gravado (fuso da organização).',
    detalhes: ['Ordenação decrescente — o mais recente no topo'],
  },
  {
    coluna: 'Ação',
    descricao: 'O que aconteceu — ex.: **Convidou**, **Atualizou**, **Excluiu**.',
  },
  {
    coluna: 'Local',
    descricao: 'Tela ou módulo — ex.: Configurador | Usuários, Pedido | Lista.',
  },
  {
    coluna: 'Usuário',
    descricao: 'Quem fez: nome e e-mail quando o ator é pessoa.',
  },
  {
    coluna: 'Detalhes',
    descricao: 'Resumo do que mudou — permissão, convite, número do pedido, etc.',
  },
]

const HISTORICO_GALERIA_TOOLTIPS_KPI: DocGaleriaTela[] = [
  {
    legenda: '1 · Total de eventos',
    imagem: '/university/screenshots/configurador-historico-cards-tooltip-1.png',
    tooltipKpi: HISTORICO_TOOLTIPS_KPI[0],
  },
  {
    legenda: '2 · Últimos 7 dias',
    imagem: '/university/screenshots/configurador-historico-cards-tooltip-2.png',
    tooltipKpi: HISTORICO_TOOLTIPS_KPI[1],
  },
  {
    legenda: '3 · Status dos eventos',
    imagem: '/university/screenshots/configurador-historico-cards-tooltip-3.png',
    tooltipKpi: HISTORICO_TOOLTIPS_KPI[2],
  },
]

/** Aceita um parágrafo único (string) ou lista — evita crash quando `paragrafosAcessoArea` é string. */
function paragrafosPasso(valor?: string | string[]): string[] | undefined {
  if (valor == null) return undefined
  return Array.isArray(valor) ? valor : [valor]
}

/** Passos padrão de acesso: opcional Hub → menu do usuário → Configurador → área no menu lateral. */
export function passosComAcessoPadrao(
  areaMenu: string,
  passosEspecificos: PassoSemNumero[],
  imagemArea?: string,
  comPassoHub = false,
  paragrafosAcessoArea?: string | string[],
  extrasArea?: PassoAreaExtras,
  imagemAbrirConfigurador?: string,
): DocPassoVisual[] {
  const offset = comPassoHub ? 1 : 0
  const passoHub: DocPassoVisual[] = comPassoHub
    ? [{
        num: 1,
        titulo: 'Em qualquer tela da plataforma: Menu do usuário',
        imagem: SCREENSHOT_HUB_ACESSO_CONFIGURADOR,
        paragrafos: [
          'Em qualquer tela da plataforma, clique no **ícone do usuário** no canto superior direito, como indicado pela seta na imagem.',
        ],
      }]
    : []

  const base: DocPassoVisual[] = [
    {
      num: 1 + offset,
      titulo: 'Abrir o Configurador',
      imagem: imagemAbrirConfigurador ?? SCREENSHOT_ABRIR_CONFIGURADOR,
      paragrafos: [
        'No menu que abrir, escolha Configurador. Você também pode usar o atalho na barra lateral do Hub, quando disponível.',
      ],
    },
    {
      num: 2 + offset,
      titulo: `Acessar ${areaMenu}`,
      imagem: imagemArea,
      paragrafos: extrasArea?.paragrafos ?? paragrafosPasso(paragrafosAcessoArea) ?? [
        `No menu lateral do Configurador, clique em ${areaMenu}. A tela correspondente abre com os dados da sua organização.`,
      ],
      tooltipsKpi: extrasArea?.tooltipsKpi,
      galeriaTelas: extrasArea?.galeriaTelas,
      imagemAbaixoTexto: extrasArea?.imagemAbaixoTexto,
      tooltipsKpiAposImagem: extrasArea?.tooltipsKpiAposImagem,
      paragrafosAposImagem: extrasArea?.paragrafosAposImagem,
    },
  ]
  return [
    ...passoHub,
    ...base,
    ...passosEspecificos.map((passo, i) => ({ ...passo, num: i + 3 + offset })),
  ]
}

export function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  let contador = 0
  function processar(lista: PassoSemNumero[], numPai?: number, rotuloPai?: string): DocPassoVisual[] {
    return lista.map((passo, indice) => {
      contador += 1
      const num = contador
      const sufixo = String(indice + 1).padStart(2, '0')
      const rotuloSecao = rotuloPai ? `${rotuloPai}.${sufixo}` : sufixo
      const { passosFilhos, ...resto } = passo
      const filhos = passosFilhos?.length
        ? processar(passosFilhos, num, rotuloSecao)
        : undefined
      return {
        ...resto,
        num,
        numPai,
        rotuloSecao,
        passosFilhos: filhos,
      }
    })
  }
  return processar(passos)
}

/** Lista em profundidade (pais antes dos filhos). */
export function achatarPassosVisuais(passos: DocPassoVisual[]): DocPassoVisual[] {
  const saida: DocPassoVisual[] = []
  for (const passo of passos) {
    saida.push(passo)
    if (passo.passosFilhos?.length) {
      saida.push(...achatarPassosVisuais(passo.passosFilhos))
    }
  }
  return saida
}

export function contarPassosVisuais(passos: DocPassoVisual[]): number {
  return achatarPassosVisuais(passos).length
}

export function encontrarPassoPorNum(passos: DocPassoVisual[], num: number): DocPassoVisual | undefined {
  for (const passo of passos) {
    if (passo.num === num) return passo
    if (passo.passosFilhos?.length) {
      const filho = encontrarPassoPorNum(passo.passosFilhos, num)
      if (filho) return filho
    }
  }
  return undefined
}

export function rotuloPassoNoCapitulo(secaoNum: number, passo: DocPassoVisual): string {
  const rotulo = passo.rotuloSecao ?? String(passo.num).padStart(2, '0')
  return `${secaoNum}.${rotulo}`
}

/** Rótulo curto no sumário — só o segmento do nível (ex.: `02.01.03` → `03`). */
export function rotuloSumarioCurtoPasso(passo: DocPassoVisual): string {
  if (passo.rotuloSecao) {
    const partes = passo.rotuloSecao.split('.')
    return partes[partes.length - 1] ?? passo.rotuloSecao
  }
  return String(passo.num).padStart(2, '0')
}

function fluxoEmBreve(tituloFluxo: string, texto: string): DocFluxo {
  return {
    titulo: tituloFluxo,
    passosVisuais: renumerarPassos([{
      titulo: 'Em breve',
      paragrafos: [texto],
    }]),
  }
}

export interface DocItemSumarioManual {
  rotulo: string
  titulo: string
  /** Seção do acordeão (`doc-sec-N`) a expandir antes do scroll. */
  secaoAcordeao: number
  /** Âncora interna do subtópico (`manual-passo-*`). */
  elementoScroll?: string
  subitem?: boolean
  /** Profundidade no sumário (1 = subtópico direto; 2+ = aninhado). */
  subitemNivel?: number
  /** Número exibido no sumário (segmento do nível, ex.: `01` em vez de `4.02.01`). */
  rotuloExibicao?: string
  /** Número do capítulo (itens principais do sumário — compat. testes). */
  num?: number
}

export function montarItensSumarioManual(secao: DocSecao): DocItemSumarioManual[] {
  const itens: DocItemSumarioManual[] = [{
    rotulo: '1',
    titulo: secao.titulo,
    secaoAcordeao: 1,
    num: 1,
  }]
  secao.fluxos?.forEach((fluxo, i) => {
    const secaoNum = i + 2
    itens.push({
      rotulo: String(secaoNum),
      titulo: fluxo.tituloSumario ?? fluxo.titulo,
      secaoAcordeao: secaoNum,
      num: secaoNum,
    })
    if (
      fluxo.mostrarMapaSubtopicosPassos
      && fluxo.prefixoPassosVisuais
      && fluxo.ancoraPassosPrefix
      && (fluxo.passosVisuais?.length ?? 0) > 0
    ) {
      function adicionarPassosSumario(passos: DocPassoVisual[], subitemNivel: number) {
        passos.forEach((passo) => {
          itens.push({
            rotulo: rotuloPassoNoCapitulo(secaoNum, passo),
            titulo: passo.tituloCurto ?? passo.titulo,
            secaoAcordeao: secaoNum,
            elementoScroll: `manual-passo-${fluxo.ancoraPassosPrefix}-${passo.num}`,
            subitem: true,
            subitemNivel,
          })
          if (passo.passosFilhos?.length) {
            adicionarPassosSumario(passo.passosFilhos, subitemNivel + 1)
          }
        })
      }
      adicionarPassosSumario(fluxo.passosVisuais!, 1)
    }
  })
  return itens
}

export interface DocEntradaSumarioManual {
  capitulo: DocItemSumarioManual
  subitens?: DocItemSumarioManual[]
}

export interface DocItemSumarioManualArvore extends DocItemSumarioManual {
  filhos?: DocItemSumarioManualArvore[]
}

/** Converte lista plana (ordem depth-first) em árvore pelo `subitemNivel`. */
export function montarArvoreSubitensSumario(
  subitens: DocItemSumarioManual[],
): DocItemSumarioManualArvore[] {
  const raiz: DocItemSumarioManualArvore[] = []
  const pilha: DocItemSumarioManualArvore[] = []

  for (const item of subitens) {
    const nivel = item.subitemNivel ?? 1
    const no: DocItemSumarioManualArvore = { ...item }

    while (pilha.length >= nivel) pilha.pop()

    if (pilha.length === 0) raiz.push(no)
    else {
      const pai = pilha[pilha.length - 1]
      if (!pai.filhos) pai.filhos = []
      pai.filhos.push(no)
    }
    pilha.push(no)
  }
  return raiz
}

/** Agrupa capítulos principais e subtópicos (ex.: passos da Visão Lista) para o sumário hierárquico. */
export function montarEntradasSumarioManual(secao: DocSecao): DocEntradaSumarioManual[] {
  const itens = montarItensSumarioManual(secao)
  const entradas: DocEntradaSumarioManual[] = []
  let i = 0
  while (i < itens.length) {
    const capitulo = itens[i]
    if (capitulo.subitem) {
      i += 1
      continue
    }
    const subitens: DocItemSumarioManual[] = []
    let j = i + 1
    while (j < itens.length && itens[j].subitem) {
      subitens.push(itens[j])
      j += 1
    }
    entradas.push({
      capitulo,
      subitens: subitens.length > 0 ? subitens : undefined,
    })
    i = j
  }
  return entradas
}

export function resolverConfiguradorManualSlug(pathSeg: string | undefined): ConfiguradorManualSlug {
  if (pathSeg && SLUGS_VALIDOS.has(pathSeg)) {
    return pathSeg as ConfiguradorManualSlug
  }
  return 'visao-geral'
}

export function metadadosConfiguradorPagina(slug: ConfiguradorManualSlug): { rotulo: string; valor: string; href?: boolean }[] {
  const item = CONFIGURADOR_MANUAL_ITENS.find(i => i.pathSeg === slug)
  const rota = item?.rotaApp ?? '/configurador'
  return [
    { rotulo: 'Versão', valor: '1.0' },
    { rotulo: 'Atualizado em', valor: 'junho 2026' },
    { rotulo: 'Produto', valor: 'Configurador' },
    { rotulo: 'URL de acesso', valor: `https://usegravity.com.br${rota}`, href: true },
    { rotulo: 'Rota base', valor: rota },
  ]
}

export const DOC_CONFIGURADOR_SECOES: DocSecao[] = [
  {
    num: 1,
    titulo: 'Visão geral do Configurador',
    layoutTextoImagemLateral: true,
    imagem: '/university/screenshots/configurador-hub-acesso-configurador.png',
    paragrafos: [
      'O **Configurador** é o painel de gestão da sua conta **Gravity**. A partir dele você administra a **organização** (empresa contratante), os **workspaces** (filiais ou clientes), **usuários**, **assinaturas** de produtos e **integrações**.',
      'No **Configurador**, o **menu lateral** à esquerda concentra **Organização**, **Workspaces**, **Usuários**, **Assinaturas** e as demais áreas de gestão da conta (exemplo abaixo).',
    ],
    figurasAposParagrafo: [
      {
        indice: 1,
        imagem: SCREENSHOT_CONFIGURADOR_MENU_LATERAL,
        legenda: 'Menu lateral do Configurador',
        larguraMaxima: 220,
      },
    ],
  },
  {
    num: 2,
    titulo: 'Organização',
    layoutTextoImagemLateral: true,
    imagem: '/university/screenshots/configurador-organizacao-tela.png',
    mostrarInfograficoOrganizacao: true,
    paragrafos: [
      'A **Organização** é a empresa que contrata o **Gravity**.',
    ],
    origemDados: {
      paragrafos: [
        'As telas abaixo são os passos do **onboarding** do fluxo acima: É aqui que **nome** e **CNPJ** são informados pela primeira vez e viram a **organização** na plataforma.',
      ],
      etapas: [
        {
          legenda: '1 · Nome da empresa',
          paragrafos: [
            'No primeiro acesso após criar a conta, o wizard pede o nome da empresa contratante. Esse nome vira o **nome da Organização**.',
          ],
          imagem: '/university/screenshots/onboarding-nome-preenchido.png',
        },
        {
          legenda: '2 · CNPJ',
          paragrafos: [
            'Na etapa seguinte, informe o **CNPJ da Organização**. Com nome e CNPJ validados, a **organização** é criada e você segue para o {{link:/university-gravity/docs/hub|Hub}}.',
          ],
          imagem: '/university/screenshots/onboarding-cnpj-preenchido.png',
        },
      ],
    },
    fluxos: [
      {
        titulo: 'Fluxo 1: Acessar organização',
        paragrafos: [
          'Siga os passos abaixo para abrir o Configurador e revisar os dados cadastrais da organização.',
        ],
        passosVisuais: passosComAcessoPadrao(
          'Organização',
          [],
          '/university/screenshots/configurador-organizacao-tela.png',
          true,
          [
            'No menu lateral do Configurador, clique em Organização. A tela abre com os dados cadastrais da empresa contratante.',
            'Nome da empresa e CNPJ são definidos no onboarding e ficam bloqueados (ícone de cadeado). Somente dados meramente informativos podem ser alterados aqui: Estado, cidade, segmento e tipo de empresa. Clique em Salvar para confirmar as mudanças.',
          ],
        ),
      },
    ],
  },
  {
    num: 3,
    titulo: 'Workspaces',
    layoutTextoImagemLateral: true,
    imagem: '/university/screenshots/configurador-workspaces-acesso-tela.png',
    mostrarInfograficoOrganizacaoWorkspaces: true,
    paragrafos: [
      '**Workspaces** são as unidades operacionais da organização — cada unidade opera com dados, usuários e registros isolados.',
    ],
    calloutAposParagrafo: {
      indice: 0,
      callout: {
        tipo: 'dica',
        texto: 'Usuários **Standard** e **Fornecedor** só enxergam os workspaces aos quais foram vinculados.',
      },
    },
    callout: {
      tipo: 'dica',
      texto: 'O **CNPJ do workspace** identifica a empresa que concentra pedidos, processos e cotações daquela unidade.',
    },
    fluxos: [
      {
        titulo: 'Acessar workspaces',
        tituloSumario: 'Acessar workspaces',
        paragrafos: [
          'Siga os passos abaixo para abrir o Configurador e chegar à tela de Workspaces.',
        ],
        passosVisuais: passosComAcessoPadrao(
          'Workspaces',
          [{
            titulo: 'Tela de Workspaces',
            imagem: '/university/screenshots/configurador-workspaces-cards-selecao.png',
            imagemAbaixoTexto: true,
            tooltipsKpiAposImagem: true,
            paragrafos: [
              'A tela abre com a listagem de workspaces e os três cards de resumo no topo.',
              'Passe o mouse no ícone (i) de cada card para abrir o tooltip. Veja abaixo o que cada indicador mostra:',
            ],
            tooltipsKpi: WORKSPACES_TOOLTIPS_KPI,
            galeriaTelas: [
              { legenda: '1 · Total de Workspaces', imagem: '/university/screenshots/configurador-workspaces-cards-tooltip-1.png' },
              { legenda: '2 · Workspaces Ativos', imagem: '/university/screenshots/configurador-workspaces-cards-tooltip-2.png' },
              { legenda: '3 · Status dos Workspaces', imagem: '/university/screenshots/configurador-workspaces-cards-tooltip-3.png' },
            ],
          }],
          '/university/screenshots/configurador-workspaces-acesso-tela.png',
          true,
          [
            'No menu lateral do Configurador, clique em **Workspaces**, como indicado pela seta na imagem.',
          ],
        ),
      },
      {
        titulo: 'Criar workspace',
        tituloSumario: 'Criar workspace',
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar criação de workspace',
            imagem: '/university/screenshots/configurador-workspaces-novo-seta.png',
            paragrafos: [
              'Para adicionar uma filial ou cliente, clique em "Novo workspace". O modal de cadastro abre sobre a listagem.',
            ],
          },
          {
            titulo: 'Preencher e salvar o novo workspace',
            paragrafos: [
              'Informe nome e demais campos obrigatórios. Após salvar, o workspace aparece na listagem pronto para ativação.',
            ],
            galeriaTelas: [
              { legenda: '1 · Modal vazio', imagem: '/university/screenshots/configurador-workspaces-novo-modal.png' },
              { legenda: '2 · Formulário preenchido', imagem: '/university/screenshots/configurador-workspaces-novo-modal-preenchido.png' },
              { legenda: '3 · Workspace salvo', imagem: '/university/screenshots/configurador-workspaces-novo-salvo.png' },
            ],
          },
        ]),
      },
      {
        titulo: 'Editar workspace',
        tituloSumario: 'Editar workspace',
        paragrafos: [
          'Altere nome ou demais dados de um workspace já cadastrado.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Abrir edição do workspace',
            imagem: '/university/screenshots/configurador-workspaces-editar-seta.png',
            paragrafos: [
              'Na tela de Workspaces, clique no ícone **Editar** no card do workspace, como indicado pela seta na imagem.',
            ],
          },
          {
            titulo: 'Editar dados no modal',
            imagem: '/university/screenshots/configurador-workspaces-modal-editar.png',
            paragrafos: [
              'No modal, altere nome ou demais dados do workspace. As mudanças refletem imediatamente no seletor de workspace do Hub.',
              'Preencha o **CNPJ** da unidade operacional com atenção: Ele identifica a empresa que concentra os registros do workspace na plataforma.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'O **CNPJ do workspace** é muito importante. Ele representa a empresa principal daquela unidade: É sobre ela que serão emitidos pedidos, processos, cotações de frete, DUIMP e demais operações COMEX vinculadas ao workspace.',
            },
          },
        ]),
      },
      {
        titulo: 'Ativar e suspender workspace',
        tituloSumario: 'Ativar e suspender workspace',
        paragrafos: [
          'Controle o acesso operacional de cada workspace sem apagá-lo. Ativar libera o ambiente para usuários vinculados; suspender bloqueia temporariamente.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Ativar um workspace suspenso',
            imagem: '/university/screenshots/configurador-workspaces-ativar-seta.png',
            paragrafos: [
              'Na listagem, localize o workspace com status Suspenso. No menu de ações da linha, clique no ícone de ativar: Como indicado pela seta na imagem.',
            ],
          },
          {
            titulo: 'Confirmar ativação',
            imagem: '/university/screenshots/configurador-workspaces-ativado.png',
            paragrafos: [
              'O status muda para Ativo e uma notificação confirma que o workspace foi habilitado. Usuários vinculados voltam a operar normalmente naquele ambiente.',
            ],
          },
          {
            titulo: 'Suspender um workspace ativo',
            imagem: '/university/screenshots/configurador-workspaces-suspender-seta.png',
            paragrafos: [
              'Para bloquear o acesso temporariamente, use a ação Suspender no menu da linha. O workspace permanece cadastrado, mas ninguém opera nele até reativar.',
            ],
          },
          {
            titulo: 'Confirmar suspensão',
            imagem: '/university/screenshots/configurador-workspaces-suspenso.png',
            paragrafos: [
              'O status volta para Suspenso e a notificação confirma a operação. Workspaces recém-criados podem precisar de ativação antes do primeiro uso.',
            ],
          },
        ]),
      },
      {
        titulo: 'Excluir workspace',
        tituloSumario: 'Excluir workspace',
        paragrafos: [
          'Remova permanentemente um workspace que não será mais utilizado. A operação é irreversível: Use apenas quando não houver dados operacionais a preservar.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar exclusão',
            imagem: '/university/screenshots/configurador-workspaces-excluir-seta.png',
            paragrafos: [
              'No menu contextual do workspace, clique em Excluir para remover a unidade da organização.',
            ],
          },
          {
            titulo: 'Confirmar no modal',
            imagem: '/university/screenshots/configurador-workspaces-excluir-modal.png',
            paragrafos: [
              'O sistema pede confirmação antes de apagar. Revise o nome do workspace: A exclusão remove o acesso de todos os usuários vinculados.',
            ],
          },
          {
            titulo: 'Workspace excluído',
            imagem: '/university/screenshots/configurador-workspaces-excluir-confirmado.png',
            paragrafos: [
              'Após confirmar, o workspace some da listagem. Preserve pedidos, processos e cotações antes de excluir, se ainda forem necessários.',
            ],
          },
        ]),
      },
    ],
  },
  {
    num: 4,
    titulo: 'Usuários',
    layoutTextoImagemLateral: true,
    imagem: '/university/screenshots/configurador-usuarios-tela.png',
    paragrafos: [
      `O controle dos **Usuários** fica localizado no menu lateral do **Configurador** (item **Usuários**), onde você gerencia quem acessa a organização: convites, edições de cadastro, ${LINK_MANUAL_PERMISSOES} por produto e vínculo com ${LINK_MANUAL_WORKSPACES}.`,
    ],
    calloutAposParagrafo: {
      indice: 0,
      callout: {
        tipo: 'dica',
        texto: `Somente **Master** convida pessoas e altera patentes, ${LINK_MANUAL_PERMISSOES} e ${LINK_MANUAL_WORKSPACES} de outros usuários.`,
      },
    },
    callout: {
      tipo: 'aviso',
      texto: 'Usuários não são excluídos da plataforma. Para bloquear acesso, **desative** o cadastro e preserve o histórico de auditoria.',
    },
    fluxos: [
      {
        titulo: 'Tipos de usuário',
        tituloSumario: 'Tipos de usuário',
        mostrarInfograficoTiposUsuario: true,
        paragrafos: [
          'No Gravity existem três tipos de usuário: **Master**, **Standard** e **Fornecedor**. Cada tipo define quanto da plataforma cada pessoa pode ver e operar.',
          `**Master** administra a conta com acesso irrestrito. **Standard** (equipe interna) e **Fornecedor** (parceiro externo) dependem de duas camadas definidas pelo Master: ${LINK_MANUAL_WORKSPACES} habilitados e ${LINK_MANUAL_PERMISSOES} granulares em cada produto.`,
        ],
        passosVisuais: [],
      },
      {
        titulo: 'Acessar usuários',
        tituloSumario: 'Acessar usuários',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Usuários.'],
        passosVisuais: passosComAcessoPadrao(
          'Usuários',
          [],
          '/university/screenshots/configurador-usuarios-seta-menu.png',
          true,
          undefined,
          {
            paragrafos: [
              'No menu lateral do Configurador, clique em Usuários. A tela abre com a listagem e os quatro cards de resumo no topo.',
            ],
            paragrafosAposImagem: [
              'Cada card possui ícone (i) com tooltip explicativo — passe o mouse para ver o significado de cada indicador. Veja abaixo o que cada indicador mostra:',
            ],
            imagemAbaixoTexto: true,
            tooltipsKpiAposImagem: true,
            tooltipsKpi: USUARIOS_TOOLTIPS_KPI,
            galeriaTelas: [...USUARIOS_GALERIA_TOOLTIPS_KPI],
          },
          '/university/screenshots/configurador-usuarios-acesso-atalho.png',
        ),
      },
      {
        titulo: 'Convidar usuário',
        tituloSumario: 'Convidar usuário',
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar o convite',
            imagem: '/university/screenshots/configurador-usuarios-convidar-seta.png',
            paragrafos: [
              'Na tela de Usuários, clique em "Convidar usuário" no canto superior direito: Como indicado pela seta na imagem. O modal de convite abre sobre a listagem.',
            ],
          },
          {
            titulo: 'Preencher dados e enviar',
            paragrafos: [
              `Informe o e-mail do convidado e escolha o tipo de usuário. Master tem acesso total na organização; Standard e Fornecedor dependem das ${LINK_MANUAL_PERMISSOES} e ${LINK_MANUAL_WORKSPACES} definidos nos fluxos seguintes.`,
              `Revise ${LINK_MANUAL_PERMISSOES} e ${LINK_MANUAL_WORKSPACES} no modal e clique em **Enviar convite**. O convidado entra na lista com badge Convidado (amarelo) até concluir o cadastro.`,
            ],
            galeriaTelas: [
              { legenda: '1 · Modal vazio', imagem: '/university/screenshots/configurador-usuarios-convite-modal-vazio.png' },
              { legenda: '2 · Dados e tipo', imagem: '/university/screenshots/configurador-usuarios-convite-dados-tipo.png' },
            ],
            callout: {
              tipo: 'dica',
              texto: 'O e-mail do convite é o login do convidado. Confira se não há erro de digitação antes de enviar.',
            },
          },
          {
            titulo: 'O que acontece depois do envio',
            ocultarRotuloPasso: true,
            paragrafos: [
              'Esta sequência mostra o que o **convidado** vê depois que você envia o convite — não é um passo para você repetir, apenas o fluxo que acontece automaticamente.',
            ],
            galeriaTelas: [...USUARIOS_GALERIA_JORNADA_CONVIDADO],
            galeriaFraseAposIndice: { indice: 1, texto: USUARIOS_JORNADA_FRASE_APOS_LINK },
            callout: {
              tipo: 'dica',
              texto: 'Cada link de convite é de uso único. Se expirar ou for perdido, reenvie ou cancele o convite pela lista de Usuários.',
            },
          },
          {
            titulo: 'Status Convidado e Ativo na listagem',
            ocultarRotuloPasso: true,
            ocultarTituloPasso: true,
            paragrafos: [
              'Depois que o convite é enviado, o status do usuário permanece como **Convidado** na listagem. Quando o convidado aceita o link e conclui o cadastro, o status é alterado para **Ativo**.',
            ],
            imagem: SCREENSHOT_USUARIOS_STATUS_CONVIDADO_ATIVO,
            imagemAbaixoTexto: true,
          },
        ]),
      },
      {
        titulo: 'Permissões do usuário',
        tituloSumario: 'Permissões do usuário',
        mostrarInfograficoPermissoesUsuario: true,
        infograficoPermissoesUsuarioAposPasso: 6,
        paragrafos: [
          'As permissões granulares **valem somente para Standard e Fornecedor**.',
        ],
        calloutAposParagrafo: {
          indice: 0,
          callout: {
            tipo: 'lembrete',
            texto: `Master não passa por essa grade: Tem acesso total à organização, a todos os ${LINK_MANUAL_WORKSPACES} e a todas as áreas do Configurador.`,
          },
        },
        passosVisuais: renumerarPassos([
          ...passosComAcessoPadrao(
            'Usuários',
            [
              {
                titulo: 'Selecionar o usuário',
                imagem: '/university/screenshots/configurador-usuarios-lista-selecionar.png',
                paragrafos: [
                  'Na listagem de Usuários, clique na linha da pessoa **Standard** ou **Fornecedor** que você vai configurar.',
                ],
              },
              {
                titulo: 'Abrir permissões',
                imagem: '/university/screenshots/configurador-usuarios-seta-permissoes-chave.png',
                paragrafos: [
                  'Na coluna de ações, clique no **ícone de chave** (permissões), como indicado pela seta na imagem.',
                ],
              },
              {
                titulo: 'Entrar na grade de permissões',
                imagem: '/university/screenshots/configurador-usuarios-convite-permissoes.png',
                paragrafos: [
                  'O modal *_Editar usuário_* abre na aba **Permissões**. A grade lista cada produto contratado com as colunas **Ver** e **Editar**.',
                ],
              },
            ],
            '/university/screenshots/configurador-usuarios-seta-menu.png',
            true,
            'No menu lateral do Configurador, clique em **Usuários**. A listagem abre com os cards de resumo no topo.',
            undefined,
            '/university/screenshots/configurador-usuarios-acesso-atalho.png',
          ).map(({ num: _n, ...passo }) => passo),
          {
            titulo: 'Habilitar cotação de frete internacional',
            imagem: SCREENSHOT_USUARIOS_PERMISSAO_COTAR_FRETE,
            imagemAbaixoTexto: true,
            paragrafos: [
              '*_Permissão especial: Pode cotar frete internacional_* — Para habilitar fornecedores como agentes de carga, marque esta opção no produto *_BID Frete Internacional_*. Libera a visão de parceiro: **responder cotações**, **enviar propostas** e *_acessar o painel BID Frete Internacional, Fornecedor_*. Vale para usuários tipo **Fornecedor** com empresa vinculada (ex.: Agente de carga).',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'O convidado precisa ser tipo Fornecedor, com empresa fornecedora vinculada (ex.: Agente de carga) em Configurador → Fornecedores, e status Ativo: Não apenas Convidado.',
            },
          },
        ]),
      },
      {
        titulo: 'Workspaces do usuário',
        tituloSumario: 'Workspaces do usuário',
        paragrafos: [
          `Vincule **Standard** e **Fornecedor** aos ${LINK_MANUAL_WORKSPACES} em que poderão operar.`,
          `Somente os ${LINK_MANUAL_WORKSPACES} selecionados ficam disponíveis para o usuário: No Hub, no seletor de unidade e nos Produtos Gravity. Unidades desmarcadas permanecem fora do alcance dele.`,
        ],
        calloutAposParagrafo: {
          indice: 0,
          callout: {
            tipo: 'lembrete',
            texto: '**Master** acessa todos automaticamente, sem marcação individual.',
          },
        },
        passosVisuais: renumerarPassos([
          {
            titulo: 'Abrir o cadastro do usuário',
            imagem: SCREENSHOT_USUARIOS_SETA_ACESSO,
            paragrafos: [
              'Na listagem de **Usuários**, clique no **ícone de lupa** na coluna **Ações** da pessoa que você vai configurar.',
            ],
          },
          {
            titulo: 'Selecionar workspace na grade',
            imagem: SCREENSHOT_USUARIOS_PERMISSAO_POR_WORKSPACE_1,
            paragrafos: [
              `Na aba **Permissões**, é possível definir permissões diferentes para cada ${LINK_MANUAL_WORKSPACE} habilitado. Use o seletor **Workspace** no topo da grade e escolha a unidade em que vai marcar **Ver** ou **Editar**.`,
              `Repita para cada unidade quando a pessoa precisar de conjuntos distintos de acesso por filial.`,
            ],
            callout: {
              tipo: 'aviso',
              texto: `Sem nenhum ${LINK_MANUAL_WORKSPACE} marcado, Standard e Fornecedor ficam sem unidade operacional: Mesmo com ${LINK_MANUAL_PERMISSOES} de produto liberadas na etapa anterior.`,
            },
          },
          {
            titulo: 'Aplicar a todos os workspaces',
            imagem: SCREENSHOT_USUARIOS_PERMISSAO_POR_WORKSPACE_2,
            paragrafos: [
              `Quando o mesmo conjunto de **Ver** e **Editar** vale para todas as unidades, clique em **Aplicar a todos os workspaces**.`,
              `Revise antes de salvar: O acesso fica amplo em todos os ${LINK_MANUAL_WORKSPACES} vinculados ao usuário.`,
            ],
            callout: {
              tipo: 'dica',
              texto: `Master não precisa de vínculo explícito: A coluna ${LINK_MANUAL_WORKSPACES_CAP} habilitados exibe "Todos os ${LINK_MANUAL_WORKSPACES}" automaticamente.`,
            },
          },
          {
            titulo: 'Alterar vínculos depois',
            imagem: '/university/screenshots/configurador-usuarios-editar-workspaces-vinculados.png',
            paragrafos: [
              `Em usuário já cadastrado, abra Editar e vá à aba ${LINK_MANUAL_WORKSPACES_CAP} Vinculados para incluir ou remover unidades sem reenviar convite.`,
              `Ao desmarcar um ${LINK_MANUAL_WORKSPACE}, o acesso some na próxima sessão: A pessoa deixa de ver aquela unidade no Hub e nos produtos.`,
            ],
          },
        ]),
      },
      {
        titulo: 'Desativar e ativar usuário',
        tituloSumario: 'Desativar e ativar usuário',
        paragrafos: [
          'Suspenda quem não deve mais entrar na plataforma e reative quando necessário.',
          'Usuários não podem ser excluídos: O Master precisa preservar o histórico de tudo o que cada pessoa fez enquanto estava ativa. O cadastro permanece gravado; o controle de acesso é feito por desativação, não por exclusão.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Desativar um usuário ativo',
            imagem: '/university/screenshots/configurador-usuarios-desativar-seta.png',
            imagemAbaixoTexto: true,
            paragrafos: [
              'Na linha de um usuário com status Ativo, clique no ícone de pausa na coluna **Ações**. O acesso é suspenso imediatamente e novos logins são bloqueados.',
            ],
            galeriaTelas: [
              {
                legenda: 'Status Inativo na lista',
                imagem: '/university/screenshots/configurador-usuarios-desativado.png',
              },
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Não existe exclusão de usuário na plataforma. Se alguém não deve mais entrar, desative: Assim o Master mantém auditoria e histórico das ações que essa pessoa realizou quando estava ativa.',
            },
          },
          {
            titulo: 'Reativar um usuário inativo',
            imagem: '/university/screenshots/configurador-usuarios-ativar-seta.png',
            imagemAbaixoTexto: true,
            paragrafos: [
              'Na mesma linha, com status Inativo, clique no ícone de play na coluna **Ações** para liberar o acesso novamente. O histórico e os vínculos anteriores são preservados.',
            ],
            galeriaTelas: [
              {
                legenda: 'Status Ativo na lista',
                imagem: '/university/screenshots/configurador-usuarios-ativado.png',
              },
            ],
          },
        ]),
      },
    ],
  },
  {
    num: 5,
    titulo: 'Fornecedores',
    layoutTextoImagemLateral: true,
    imagem: '/university/screenshots/configurador-fornecedores-tela-principal.png',
    mostrarInfograficoFornecedoresComex: true,
    paragrafos: [
      '**Fornecedores** cadastra terceiros COMEX da organização: **despachantes** aduaneiros, **agentes de carga**, armadores, companhias aéreas, **transportadoras rodoviárias** nacionais, **transportadoras rodoviárias** internacionais, seguradoras internacionais, corretoras de câmbio e bancos.',
      'Aqui também os **exportadores (na importação)** e os **importadores (na exportação)** são cadastrados. O infográfico abaixo explica a diferença: O papel descreve a função do terceiro na sua operação, não o tipo da sua empresa.',
    ],
    lista: [
      '**Exportador na importação**: Vendedor no exterior quando você importa',
      '**Importador na exportação**: Comprador no exterior quando você exporta',
      '**Despachante / Agente / Armador**: Parceiros logísticos e aduaneiros',
    ],
    fluxos: [
      {
        titulo: 'Acessar fornecedores',
        tituloSumario: 'Acessar fornecedores',
        paragrafos: [
          'Siga os passos abaixo para abrir o Configurador e chegar à tela de Fornecedores.',
        ],
        passosVisuais: passosComAcessoPadrao(
          'Fornecedores',
          [],
          '/university/screenshots/configurador-fornecedores-acesso-tela.png',
          true,
          undefined,
          {
            paragrafos: [
              'No menu lateral do Configurador, clique em Fornecedores. A tela abre com a listagem e os cards de resumo no topo.',
              'Passe o mouse no ícone (i) de cada card para abrir o tooltip: Veja abaixo o que cada indicador mostra:',
            ],
            galeriaTelas: [...FORNECEDORES_GALERIA_TOOLTIPS_KPI],
          },
        ),
      },
      {
        titulo: 'Criar fornecedor',
        tituloSumario: 'Criar fornecedor',
        paragrafos: [
          'Todo cadastro passa pelo modal Novo Fornecedor em três abas: Dados gerais, papéis COMEX e contato.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar novo cadastro',
            imagem: '/university/screenshots/configurador-fornecedores-novo-seta.png',
            paragrafos: [
              'Na listagem, clique em Novo Fornecedor. O modal abre sobre a tela principal.',
            ],
          },
          {
            titulo: 'Aba 1: Dados gerais',
            imagem: '/university/screenshots/configurador-fornecedores-novo-modal-1.png',
            paragrafos: [
              'Informe razão social, país, CNPJ ou TIN e endereço. Fornecedores brasileiros usam CNPJ; estrangeiros usam TIN.',
            ],
          },
          {
            titulo: 'Aba 2: Papéis COMEX',
            imagem: '/university/screenshots/configurador-fornecedores-novo-modal-2.png',
            paragrafos: [
              'Marque um ou mais papéis que o terceiro pode desempenhar. Exportador e Importador são os mais comuns: Veja os fluxos 3 e 4 para entender quando usar cada um.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'Papéis definem em quais dropdowns o fornecedor aparece (Pedido, Processo, BID Frete etc.). Um agente de carga pode ter Exportador + Agente; um cliente no exterior pode ter só Importador.',
            },
          },
          {
            titulo: 'Aba 3: Contato e salvar',
            imagem: '/university/screenshots/configurador-fornecedores-novo-modal-3.png',
            paragrafos: [
              'Preencha e-mail, telefone e WhatsApp. Clique em Salvar: O fornecedor entra na listagem com status Ativa.',
            ],
          },
        ]),
      },
      {
        titulo: 'Exportador na importação',
        tituloSumario: 'Exportador na importação',
        paragrafos: [
          'Quando sua **empresa importa**, o vendedor no exterior é **cadastrado como fornecedor** com papel **Exportador**: Ele exporta a mercadoria para você.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Marcar papel Exportador',
            imagem: '/university/screenshots/configurador-fornecedores-exportador-importacao-modal.png',
            imagemAbaixoTexto: true,
            paragrafos: [
              'Na aba Papéis COMEX, ative Exportador. Esse terceiro figurará como vendedor/exportador nas suas operações de importação.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Exportador na importação = o parceiro estrangeiro que vende para você. Não confunda com o workspace da sua empresa (que é quem importa). É um fornecedor cadastrado no Configurador.',
            },
          },
          {
            titulo: 'Preencher dados do exportador',
            imagem: '/university/screenshots/configurador-fornecedores-exportador-importacao-passo-1.png',
            paragrafos: [
              'Informe razão social, país e TIN do fabricante ou trading company no exterior. **Esses dados podem alimentar** invoices, processos e DUIMP.',
            ],
          },
          {
            titulo: 'Conferir papéis e contato',
            imagem: '/university/screenshots/configurador-fornecedores-exportador-importacao-passo-2.png',
            paragrafos: [
              'Revise Exportador marcado e complete o contato. Você pode combinar com Fabricante se o exportador também produz a mercadoria.',
            ],
          },
          {
            titulo: 'Exportador salvo na listagem',
            imagem: '/university/screenshots/configurador-fornecedores-exportador-importacao-salvo.png',
            paragrafos: [
              'O fornecedor aparece na tabela com chip Exportador na coluna Papel COMEX. Já pode ser selecionado em pedidos e processos de importação.',
            ],
          },
        ]),
      },
      {
        titulo: 'Importador na exportação',
        tituloSumario: 'Importador na exportação',
        paragrafos: [
          'Quando sua **empresa exporta**, o comprador no exterior é **cadastrado como fornecedor** com papel **Importador**: Ele importa a mercadoria que você vende.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Marcar papel Importador',
            imagemAbaixoTexto: true,
            paragrafos: [
              'Na aba Papéis COMEX do modal, ative Importador. Esse terceiro figurará como cliente/comprador nas suas operações de exportação.',
            ],
            imagem: '/university/screenshots/configurador-fornecedores-importador-exportacao-passo-1.png',
            callout: {
              tipo: 'aviso',
              texto: 'Importador na exportação = o parceiro estrangeiro que compra de você. Não é o workspace da sua empresa (que é quem exporta). É um fornecedor: Como diz o subtítulo da tela: Em exportação, o importador pode atuar como cliente na operação.',
            },
          },
          {
            titulo: 'Preencher dados do importador',
            imagem: '/university/screenshots/configurador-fornecedores-importador-exportacao-passo-2.png',
            paragrafos: [
              'Cadastre razão social, país e documento fiscal do comprador no destino. **Esses dados podem alimentar** invoices, processos e DUIMP.',
            ],
          },
          {
            titulo: 'Importador salvo na listagem',
            imagem: '/university/screenshots/configurador-fornecedores-importador-exportacao-salvo.png',
            paragrafos: [
              'O fornecedor aparece com chip Importador. Use-o em processos de exportação, invoices e cotações em que o comprador externo precisa estar identificado.',
            ],
          },
        ]),
      },
      {
        titulo: 'Outros tipos de fornecedor',
        tituloSumario: 'Outros tipos de fornecedor',
        mostrarInfograficoPapeisFornecedor: true,
        paragrafos: [
          'Além de Importador e Exportador, cadastre despachantes aduaneiros, agentes de carga, armadores, companhias aéreas, transportadoras, armazéns, bancos e seguradoras: Cada papel define onde o terceiro aparece na plataforma.',
          'A mesma empresa pode acumular vários papéis (ex.: Despachante + Agente de Carga). O cadastro correto alimenta comunicações, cotações de frete e câmbio, acessos de usuários tipo Fornecedor e registros em Pedido, Processo e DUIMP.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Marcar papéis logísticos',
            imagem: '/university/screenshots/configurador-fornecedores-despachante-passo-1.png',
            paragrafos: [
              'Na aba Papéis COMEX, ative os papéis que o terceiro exerce. No exemplo, Despachante Aduaneiro e Agente de Carga na mesma razão social.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'Não crie cadastros duplicados para a mesma empresa só porque ela atua em mais de um papel. Um único fornecedor com múltiplos chips na coluna Papel COMEX mantém contato, histórico e cotações centralizados.',
            },
          },
          {
            titulo: 'Completar dados e contato',
            imagem: '/university/screenshots/configurador-fornecedores-despachante-passo-2.png',
            paragrafos: [
              'Preencha documento fiscal, endereço e canais de contato. E-mail e WhatsApp são usados em convites, notificações e comunicação operacional com parceiros.',
            ],
          },
          {
            titulo: 'Fornecedor salvo com múltiplos papéis',
            imagem: '/university/screenshots/configurador-fornecedores-despachante-salvo.png',
            paragrafos: [
              'Na listagem, os chips mostram todos os papéis marcados (ex.: Despachante + Agente). O fornecedor já pode ser selecionado nos produtos que filtram por cada papel.',
            ],
          },
        ]),
      },
      {
        titulo: 'Editar fornecedor',
        tituloSumario: 'Editar fornecedor',
        paragrafos: [
          'Altere dados cadastrais, papéis COMEX ou contato de um fornecedor existente.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Abrir edição',
            imagem: '/university/screenshots/configurador-fornecedores-editar-seta.png',
            paragrafos: [
              'Na linha do fornecedor, clique no ícone Editar. O mesmo modal de cadastro abre em modo edição.',
            ],
          },
          {
            titulo: 'Ajustar dados gerais',
            imagem: '/university/screenshots/configurador-fornecedores-editar-modal-1.png',
            paragrafos: [
              'Atualize razão social, documento fiscal ou endereço. Mudanças refletem nos produtos que consomem o Cadastros.',
            ],
          },
          {
            titulo: 'Revisar papéis COMEX',
            imagem: '/university/screenshots/configurador-fornecedores-editar-modal-2.png',
            paragrafos: [
              'Adicione ou remova papéis conforme a relação comercial evolui: Por exemplo, um exportador que passa a ser também fabricante.',
            ],
          },
          {
            titulo: 'Atualizar contato',
            imagem: '/university/screenshots/configurador-fornecedores-editar-modal-contato.png',
            paragrafos: [
              'Revise e-mail, telefone e WhatsApp. Clique em Salvar Alterações para confirmar.',
            ],
          },
        ]),
      },
      {
        titulo: 'Ativar e desativar fornecedor',
        tituloSumario: 'Ativar e desativar',
        paragrafos: [
          'Desative temporariamente um fornecedor sem apagar o cadastro. Fornecedores inativos não aparecem em novos dropdowns operacionais.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Desativar fornecedor',
            imagem: '/university/screenshots/configurador-fornecedores-suspender-seta.png',
            paragrafos: [
              'Na linha do fornecedor ativo, clique no ícone de desativar: Como indicado pela seta na imagem.',
            ],
          },
          {
            titulo: 'Confirmar desativação',
            imagem: '/university/screenshots/configurador-fornecedores-suspender-confirmacao.png',
            paragrafos: [
              'O status muda para Inativa e uma notificação confirma. O histórico em processos antigos é preservado.',
            ],
          },
          {
            titulo: 'Reativar fornecedor',
            imagem: '/university/screenshots/configurador-fornecedores-reativar-seta.png',
            paragrafos: [
              'Para voltar a usar o parceiro em novas operações, clique no ícone de reativar na linha do fornecedor inativo.',
            ],
          },
          {
            titulo: 'Confirmar reativação',
            imagem: '/university/screenshots/configurador-fornecedores-reativado.png',
            paragrafos: [
              'O status volta para Ativa. O fornecedor reaparece nos seletores de Pedido, Processo e demais produtos.',
            ],
          },
        ]),
      },
    ],
  },
  {
    num: 6,
    titulo: 'Assinaturas',
    layoutTextoImagemLateral: true,
    imagem: '/university/screenshots/configurador-assinaturas-tela.png',
    paragrafos: [
      '**Assinaturas** reúne os Produtos Gravity que a organização contratou na **Gravity Store**: Cobrança, valor, renovação, workspaces habilitados e status de cada plano.',
      'Somente usuários **Master** gerenciam assinaturas: Suspender, consultar contrato, distribuir em workspaces e cancelar. Standard e Fornecedor consultam apenas o que está liberado nos produtos.',
    ],
    lista: [
      '**Ativa**: Módulo em uso normalmente',
      '**Em Teste**: Trial manual antes do contrato',
      '**Suspensa**: Acesso bloqueado temporariamente',
      '**Cancelada**: Encerrada, some da listagem',
    ],
    callout: {
      tipo: 'dica',
      texto: 'O modal *_Editar assinatura_* é somente leitura, exceto a aba **Workspaces**, onde você habilita o produto por unidade.',
    },
    fluxos: [
      {
        titulo: 'Acessar assinaturas',
        tituloSumario: 'Acessar assinaturas',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Assinaturas.'],
        passosVisuais: passosComAcessoPadrao(
          'Assinaturas',
          [],
          '/university/screenshots/configurador-assinaturas-seta-menu.png',
          true,
          [
            'Esta é a tela onde é feita a gestão dos produtos Gravity contratados pela organização: Produto, tipo de cobrança, valor, renovação, status, boletos, nota fiscal e demais informações do contrato.',
          ],
          {
            paragrafos: [
              'Em **Produtos Contratados** aparecem somente os módulos assinados pela **Gravity Store**. A tabela centraliza cobrança, renovação, workspaces habilitados e status de cada plano.',
              'Passe o mouse no ícone (i) de cada card para abrir o tooltip. Veja abaixo o que cada indicador mostra:',
            ],
            galeriaTelas: [...ASSINATURAS_GALERIA_TOOLTIPS_KPI],
          },
          '/university/screenshots/configurador-assinaturas-acesso-atalho.png',
        ),
      },
      {
        titulo: 'Consultar assinatura',
        tituloSumario: 'Consultar assinatura',
        paragrafos: [
          'O ícone de lápis abre o modal Configurar Assinatura para **consultar** o que foi contratado na Gravity Store: Uma aba por tema: Dados, Setup, Valor, Usuários, Suporte, Tokens, Acordos e Workspaces.',
          'Todas as abas são **somente leitura**, exceto Workspaces, onde você pode alterar em quais unidades o produto está habilitado (ou use o Fluxo 3 na tabela).',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Abrir detalhes da assinatura',
            imagem: '/university/screenshots/configurador-assinaturas-editar-seta.png',
            paragrafos: [
              'Na linha do produto, clique no ícone de lápis (Editar assinatura). O modal Configurar Assinatura abre com uma aba por tema do contrato: Todas em modo consulta, exceto Workspaces.',
            ],
          },
          {
            titulo: 'Aba Dados',
            imagem: '/university/screenshots/configurador-assinaturas-modal-geral.png',
            paragrafos: [
              'Identificação do Produto Gravity contratado: Nome, descrição, status da assinatura e datas relevantes do contrato. Somente leitura.',
            ],
          },
          {
            titulo: 'Aba Setup',
            imagem: '/university/screenshots/configurador-assinaturas-modal-setup.png',
            paragrafos: [
              'Alguns produtos Gravity têm custo referente a **implantação**, **treinamento** e **configurações iniciais**. Esta aba mostra se o plano inclui setup e qual o valor previsto: Sem edição nesta tela.',
            ],
          },
          {
            titulo: 'Aba Valor',
            galeriaTelas: [
              { legenda: '1 · Tipo de cobrança', imagem: '/university/screenshots/configurador-assinaturas-modal-valor-1.png' },
              { legenda: '2 · Detalhamento unitário', imagem: '/university/screenshots/configurador-assinaturas-modal-valor-2.png' },
            ],
            paragrafos: [
              'Descritivo do valor do Produto Gravity contratado. A cobrança pode ser **mensalidade fixa**, **por documento**, **por leitura**, **por DUIMP**, **por processo** ou outro modelo definido no catálogo.',
              'Aqui você encontra o **detalhamento completo unitário**: Faixas de volume, quantidades e preço por unidade, conforme fechado na Gravity Store.',
            ],
          },
          {
            titulo: 'Aba Usuários',
            imagem: '/university/screenshots/configurador-assinaturas-modal-usuarios.png',
            paragrafos: [
              'Indica se o produto tem **usuários ilimitados** ou **quantidade limitada** incluída no plano, e o **valor por usuário adicional** quando houver extrapolação.',
            ],
          },
          {
            titulo: 'Aba Suporte',
            imagem: '/university/screenshots/configurador-assinaturas-modal-suporte.png',
            paragrafos: [
              'Quantidade de **horas por mês** inclusas no valor para atendimento com o time Gravity, e o **valor da hora adicional** caso a organização ultrapasse o pacote contratado.',
            ],
          },
          {
            titulo: 'Aba Tokens',
            imagem: '/university/screenshots/configurador-assinaturas-modal-tokens.png',
            paragrafos: [
              'Quantidade de **tokens GABI inclusos por mês** no plano e o **valor adicional por token** quando o consumo exceder a cota contratada.',
            ],
          },
          {
            titulo: 'Aba Acordos',
            imagem: '/university/screenshots/configurador-assinaturas-modal-acordos-especiais.png',
            paragrafos: [
              '**Acordos especiais** de valores negociados para a organização: Em geral por **alta quantidade** de uso ou condições comerciais diferenciadas fechadas com o time Gravity.',
            ],
          },
          {
            titulo: 'Aba Workspaces',
            imagem: '/university/screenshots/configurador-assinaturas-modal-workspaces.png',
            paragrafos: [
              'Lista os **workspaces vinculados** a esta assinatura do Produto Gravity: Em quais filiais ou unidades o módulo está habilitado.',
              'É a única aba do modal onde você pode **alterar** a distribuição (marcar ou desmarcar unidades). A mesma operação pode ser feita na tabela, no Fluxo 3.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'Preço, limites, suporte, tokens e acordos não são editados aqui: Vêm do contrato na Gravity Store ou do comercial. Neste modal você consulta; para workspaces na tabela, use o Fluxo 3.',
            },
          },
        ]),
      },
      {
        titulo: 'Workspaces do produto',
        tituloSumario: 'Workspaces do produto',
        paragrafos: [
          `Cada assinatura pode estar **ativa em um ou mais** ${LINK_MANUAL_WORKSPACES}. Expanda a linha na tabela para ver e alterar em quais ${LINK_MANUAL_WORKSPACES} o produto está habilitado.`,
          `Marque ou desmarque ${LINK_MANUAL_WORKSPACES}, use Habilitar/Bloquear em lote e clique em Salvar alterações: As mudanças valem na próxima sessão dos usuários daquela unidade.`,
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Expandir a linha do produto',
            imagem: '/university/screenshots/configurador-assinaturas-workspaces-expandido.png',
            paragrafos: [
              `Clique na **seta** à esquerda da linha do produto para **abrir a** **subtabela de** ${LINK_MANUAL_WORKSPACES} **vinculados**: Nome do ${LINK_MANUAL_WORKSPACE}, status do produto e ações por unidade.`,
            ],
          },
          {
            titulo: 'Bloquear workspace',
            galeriaTelas: [
              { legenda: '1 · Seta desabilitar', imagem: '/university/screenshots/configurador-assinaturas-workspaces-seta-desabilitar.png' },
              { legenda: '2 · Workspace bloqueado', imagem: '/university/screenshots/configurador-assinaturas-workspaces-bloqueado.png' },
            ],
            paragrafos: [
              `Selecione um ou mais ${LINK_MANUAL_WORKSPACES} e use Bloquear para remover o acesso ao produto naquela unidade. O status muda para bloqueado até você reabilitar.`,
            ],
          },
          {
            titulo: 'Reabilitar workspace',
            galeriaTelas: [
              { legenda: '1 · Seta reabilitar', imagem: '/university/screenshots/configurador-assinaturas-workspaces-seta-reabilitar.png' },
              { legenda: '2 · Workspace reabilitado', imagem: '/university/screenshots/configurador-assinaturas-workspaces-reabilitado.png' },
            ],
            paragrafos: [
              `Com ${LINK_MANUAL_WORKSPACES} selecionados, clique em Habilitar para restaurar o acesso. O produto volta a aparecer no Hub e nos seletores daquela unidade.`,
            ],
            callout: {
              tipo: 'aviso',
              texto: `Se nenhum ${LINK_MANUAL_WORKSPACE} estiver habilitado, o produto não fica acessível na organização: Mesmo com assinatura Ativa.`,
            },
          },
          {
            titulo: 'Salvar alterações pendentes',
            imagem: '/university/screenshots/configurador-assinaturas-workspaces-salvar-pendente.png',
            paragrafos: [
              'Enquanto houver mudanças em rascunho, o badge de alterações pendentes aparece. Clique em Salvar alterações para persistir: Ou Descartar para voltar ao estado anterior.',
            ],
          },
        ]),
      },
      {
        titulo: 'Suspender e reativar',
        tituloSumario: 'Suspender e reativar',
        paragrafos: [
          'Suspenda **temporariamente** o acesso ao produto sem cancelar a assinatura. A operação é reversível pelo mesmo ícone de **pausa/play**: O bloqueio é imediato, mas o plano continua contratado.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Suspender assinatura',
            imagem: '/university/screenshots/configurador-assinaturas-suspender-seta.png',
            paragrafos: [
              'Na coluna de **ações**, clique no **ícone de pausa (Suspender)**. O status muda para **Suspensa** e o card **Acessos Suspensos** é atualizado.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Suspender bloqueia o acesso ao produto imediatamente, mas não encerra o contrato nem interrompe a cobrança no meio do ciclo. Para encerrar de vez, use o fluxo **Cancelar assinatura**.',
            },
          },
          {
            titulo: 'Confirmar status suspenso',
            imagem: '/university/screenshots/configurador-assinaturas-suspenso.png',
            paragrafos: [
              'A linha exibe o **badge Suspensa**. Usuários perdem acesso ao produto até a reativação.',
            ],
          },
          {
            titulo: 'Reativar assinatura',
            imagem: '/university/screenshots/configurador-assinaturas-reativar-seta.png',
            paragrafos: [
              'Com status **Suspensa**, o ícone vira **play (Reativar)**. Clique para voltar o produto ao status **Ativa**.',
            ],
          },
          {
            titulo: 'Confirmar reativação',
            imagem: '/university/screenshots/configurador-assinaturas-reativado.png',
            paragrafos: [
              `O status volta para **Ativa** e o acesso é restaurado nos ${LINK_MANUAL_WORKSPACES} habilitados.`,
            ],
          },
        ]),
      },
      {
        titulo: 'Cancelar assinatura',
        tituloSumario: 'Cancelar assinatura',
        paragrafos: [
          'Encerre definitivamente o contrato de um produto Gravity. Diferente de **suspender**, o cancelamento é **irreversível**: A assinatura sai de **Produtos Contratados** e o módulo pode voltar a aparecer em **Produtos Disponíveis para Contratação** se a organização quiser reassinar.',
          'A cobrança da Gravity **não é pró rata**: Ao cancelar, a próxima fatura não é gerada e o encerramento vale no **vencimento do ciclo vigente**, não na data do clique. Exemplo: Contratação em 05/02 com vigência até 05/03 — cancelamento em 20/02 só passa a valer em 05/03.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar cancelamento',
            imagem: '/university/screenshots/configurador-assinaturas-cancelar-seta.png',
            paragrafos: [
              'Na coluna **Ações** da linha do produto, clique no ícone de lixeira (**Cancelar assinatura**), como indicado pela seta na imagem.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Somente usuários **Master** podem cancelar. A operação não pode ser desfeita nesta tela — para voltar a usar o produto, será necessário contratar novamente.',
            },
          },
          {
            titulo: 'Confirmar no modal',
            imagem: '/university/screenshots/configurador-assinaturas-cancelar-modal.png',
            paragrafos: [
              'O modal *_Cancelar Assinatura_* exibe o nome do produto e avisa que a ação é irreversível e que o acesso será bloqueado.',
            ],
          },
          {
            titulo: 'Concluir cancelamento',
            imagem: '/university/screenshots/configurador-assinaturas-cancelar-confirmacao.png',
            paragrafos: [
              'Clique em confirmar no modal. A linha desaparece de **Produtos Contratados** e uma notificação confirma o cancelamento. O produto passa a constar entre os disponíveis para nova contratação, se desejado.',
            ],
          },
        ]),
      },
    ],
  },
  {
    num: 7,
    titulo: 'Financeiro',
    paragrafos: [
      '**Financeiro** é onde a empresa que contratou a plataforma Gravity gerencia todos os dados de **cobrança**, **pagamentos**, **valores**, **produtos**, **boletos** e **notas** da relação comercial entre a organização e a Gravity.',
      'Consulte faturas, baixe documentos de cobrança e acompanhe a tabela de **Produtos × Valores** do catálogo contratado. Status de fatura: **Emitida** e **Enviada** (em aberto), **Paga**, **Em atraso**, **Anulada** e **Incobrável**. Os cards do topo resumem vencimento, valor pendente e quantidade em aberto.',
    ],
    figurasAposParagrafo: [
      {
        indice: 0,
        imagem: '/university/screenshots/configurador-financeiro-aba-faturas.png',
        legenda: 'Tela principal do Financeiro',
      },
    ],
    lista: [
      '**Histórico de Faturas**: Cobranças, vencimentos, boleto e NF-e',
      '**Produtos & Valores**: Preços, franquias e negociações do catálogo',
      '**Bid Frete Internacional**: Cotação de frete por processo na tabela de preços',
    ],
    callout: {
      tipo: 'aviso',
      texto: 'Somente usuários **Master** acessam esta área. Standard e Fornecedor não veem faturas nem preços.',
    },
    fluxos: [
      {
        titulo: 'Acessar financeiro',
        tituloSumario: 'Acessar financeiro',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Financeiro.'],
        passosVisuais: passosComAcessoPadrao(
          'Financeiro',
          [],
          '/university/screenshots/configurador-financeiro-seta-menu.png',
          true,
          undefined,
          {
            paragrafos: [
              'No menu lateral do Configurador, clique em Financeiro, como indicado pela seta na imagem.',
            ],
          },
          '/university/screenshots/configurador-financeiro-acesso-atalho.png',
        ),
      },
      {
        titulo: 'Histórico de faturas',
        tituloSumario: 'Histórico de faturas',
        paragrafos: [
          'Consulte faturas emitidas, acompanhe vencimentos e baixe boleto ou NF-e quando disponíveis. Passe o mouse sobre o valor para ver a composição sem expandir a linha.',
          '**Visão geral da aba Faturas** — A tabela lista número, competência, descrição, valor, vencimento e status. Use Buscar para filtrar por número ou descrição, e Exportar para planilha.',
        ],
        figurasAposParagrafo: [
          {
            indice: 1,
            imagem: '/university/screenshots/configurador-financeiro-aba-faturas.png',
            legenda: 'Visão geral da aba Faturas',
          },
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Expandir detalhamento da fatura',
            imagem: '/university/screenshots/configurador-financeiro-fatura-expandir-seta.png',
            paragrafos: [
              'Clique na seta à esquerda da linha: Como indicado na imagem: Para abrir o detalhamento inline.',
            ],
          },
          {
            titulo: 'Itens da fatura expandidos',
            imagem: '/university/screenshots/configurador-financeiro-fatura-expandida.png',
            paragrafos: [
              'A subtabela mostra descrição, quantidade, valor unitário e total de cada item que compõe a fatura.',
            ],
          },
          {
            titulo: 'Baixar boleto',
            imagem: '/university/screenshots/configurador-financeiro-boleto-seta.png',
            paragrafos: [
              'Na coluna de ações, clique no ícone de download do boleto: Como indicado pela seta. O documento abre em nova aba quando já foi anexado pela Gravity.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'Se o ícone estiver desabilitado, o boleto ainda não foi disponibilizado: Aguarde a emissão ou contate financeiro@gravity.com.br.',
            },
          },
          {
            titulo: 'Baixar NF-e',
            imagem: '/university/screenshots/configurador-financeiro-nfe-seta.png',
            paragrafos: [
              'No mesmo menu de ações, use o segundo ícone de download para a nota fiscal eletrônica (NF-e), quando disponível.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Segunda via: Os downloads abrem o arquivo direto do provedor de cobrança configurado. Dúvidas: Financeiro@gravity.com.br.',
            },
          },
        ]),
      },
      {
        titulo: 'Produtos e valores',
        tituloSumario: 'Produtos e valores',
        paragrafos: [
          'A segunda aba exibe o catálogo de produtos Gravity com tipo de cobrança, franquia inclusa, limites de usuários, help desk e eventuais negociações especiais da organização.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Abrir a aba Produtos & Valores',
            imagem: '/university/screenshots/configurador-financeiro-aba-produtos.png',
            paragrafos: [
              'Clique na aba Produtos & Valores: Como indicado pela seta na imagem. A tabela mostra preço unitário, franquia free e status de negociação especial por produto.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'Quando houver acordo comercial ativo, um banner verde destaca a Negociação Especial da organização no topo da aba.',
            },
          },
          {
            titulo: 'Ver detalhes do produto',
            imagem: '/university/screenshots/configurador-financeiro-produtos-ver-detalhes-seta.png',
            paragrafos: [
              'Na coluna de ações, clique no ícone de olho (Ver detalhes): Como indicado pela seta. O modal abre em modo somente leitura com as abas do catálogo Gravity.',
            ],
          },
          {
            titulo: 'Modal de detalhes (Dados Básicos)',
            imagem: '/university/screenshots/configurador-financeiro-modal-produto-dados.png',
            paragrafos: [
              'Percorra Dados Básicos, Setup, Valor do Produto, Usuários, Help Desk e Negociação para entender como cada produto é cobrado. Feche com o X quando terminar: Não há edição nesta tela.',
            ],
          },
        ]),
      },
    ],
  },
  {
    num: 9,
    titulo: 'Taxas e moeda',
    paragrafos: [
      '**Taxas e moeda** concentra o câmbio operacional da organização em duas abas, cada uma com sincronização, agendamento e consulta próprios.',
      'Produtos como **BID Frete Internacional**, **BID Câmbio**, **Pedido**, **Smart Docs** e outros módulos Gravity consomem essas taxas para conversões, simulações e documentos fiscais. A sincronização PTAX roda automaticamente **4 vezes por dia** em dias úteis (10h03 / 11h03 / 12h03 / 13h03 BRT); o Focus é atualizado **semanalmente** (terça 22h BRT).',
    ],
    figurasAposParagrafo: [
      {
        indice: 0,
        imagem: '/university/screenshots/configurador-taxas-moeda-tela-principal.png',
        legenda: 'Tela principal — aba Cotação Atual',
      },
    ],
    lista: [
      '**Cotação Atual**: PTAX do Banco Central, compra e venda das sete moedas suportadas (USD, EUR, GBP, CHF, CNY, JPY, CAD)',
      '**Cotação Futura**: Projeções do BACEN Focus para planejamento de câmbio',
    ],
    callout: {
      tipo: 'aviso',
      texto: 'Somente usuários **Master** acessam esta área do Configurador.',
    },
    fluxos: [
      {
        titulo: 'Acessar Taxas e moeda',
        tituloSumario: 'Acessar Taxas e moeda',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Taxas e moeda.'],
        passosVisuais: passosComAcessoPadrao(
          'Taxas e moeda',
          [],
          '/university/screenshots/configurador-taxas-moeda-tela-principal.png',
          true,
          undefined,
          {
            paragrafos: [
              'No menu lateral do Configurador, clique em Taxas e moeda. A tela abre na aba Cotação Atual, com os cards de resumo no topo.',
              'Passe o mouse no ícone (i) de cada card para abrir o tooltip: Veja abaixo o que cada indicador mostra:',
            ],
            galeriaTelas: [...TAXAS_MOEDA_GALERIA_TOOLTIPS_KPI],
          },
        ),
      },
      {
        titulo: 'Cotação futura (BACEN Focus)',
        tituloSumario: 'Cotação futura (BACEN Focus)',
        paragrafos: [
          'A segunda aba exibe projeções de mercado do BACEN Focus para USD/BRL: **não são cotações negociadas**. Use para planejamento; o erro de previsão cresce com o horizonte.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Abrir a aba Cotação Futura',
            imagem: '/university/screenshots/configurador-taxas-moeda-cotacao-futura.png',
            paragrafos: [
              'Clique na aba **Cotação Futura**: Como indicado na imagem. Os cards do topo mudam para USD próximo mês, USD horizonte e Publicação Focus.',
              'A tabela lista até quatro meses de projeção por padrão, com moeda, mês previsto, valor mediano, data de publicação e fonte BACEN/Focus.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Projeções do Focus são indicativas. Não use como taxa de fechamento de contrato ou documento fiscal: Para isso, utilize a PTAX da aba Cotação Atual.',
            },
          },
        ]),
      },
    ],
  },
  {
    num: 10,
    titulo: 'Histórico',
    paragrafos: [
      `**Histórico** registra alterações sensíveis na organização e nos ${LINK_MANUAL_WORKSPACES}: Convites, mudanças de ${LINK_MANUAL_PERMISSOES}, workspaces, assinaturas e eventos de segurança.`,
      'A tela é **somente leitura**: investiga quem fez o quê, em qual módulo e quando — sem alterar registros.',
    ],
    figurasAposParagrafo: [
      {
        indice: 1,
        imagem: '/university/screenshots/configurador-historico-tela-principal.png',
        legenda: 'Visão geral — cards de resumo e tabela de auditoria',
      },
    ],
    lista: [
      '**Auditoria**: Quem fez o quê e quando',
      '**Organização**: Eventos da conta contratante',
      `${LINK_MANUAL_WORKSPACES_CAP}: Alterações por unidade operacional`,
      '**Segurança**: Bloqueios, falhas de login e tentativas cross-tenant',
    ],
    callout: {
      tipo: 'dica',
      texto: `**Master** vê toda a organização. **Padrão** e **Fornecedor** só veem linhas em que são ator ou alvo. O acesso à tela exige **historico:ver** em ${LINK_MANUAL_PERMISSOES}.`,
    },
    fluxos: [
      {
        titulo: 'Acessar histórico',
        tituloSumario: 'Acessar histórico',
        paragrafos: [
          'Siga os passos abaixo para abrir o Configurador e chegar à tela de **Histórico**.',
        ],
        passosVisuais: passosComAcessoPadrao(
          'Histórico',
          [
            {
              titulo: 'Tela de Histórico',
              imagem: '/university/screenshots/configurador-historico-tela-principal.png',
              imagemAbaixoTexto: true,
              paragrafos: [
                'A tela abre com os **três cards de resumo** no topo e a **tabela de auditoria** abaixo.',
                'Passe o mouse no ícone **(i)** de cada card para abrir o tooltip. Veja abaixo o que cada indicador mostra:',
              ],
              galeriaTelas: [...HISTORICO_GALERIA_TOOLTIPS_KPI],
            },
            {
              titulo: 'Caminho alternativo: pelo produto',
              imagem: SCREENSHOT_HISTORICO_SETA_PRODUTO,
              paragrafos: [
                'Sem passar pelo Configurador, cada **produto Gravity** (Pedido, Smart Docs, etc.) traz **Histórico** no menu lateral inferior — como na imagem.',
                'Esse atalho abre os eventos **daquele módulo**, não o histórico geral da organização.',
              ],
              callout: {
                tipo: 'dica',
                texto: '**Configurador › Histórico** — convites, permissões e segurança da conta. **Histórico do produto** — operações do módulo.',
              },
            },
          ],
          SCREENSHOT_HISTORICO_SETA_CONFIGURADOR,
          true,
          ['No menu lateral do Configurador, clique em **Histórico** (último item da lista).'],
        ),
      },
      {
        titulo: 'Consultar auditoria',
        tituloSumario: 'Consultar auditoria',
        paragrafos: [
          'Use a tabela para investigar eventos. Os **cards do topo** refletem só a **página atual** (25 registros); a paginação abaixo percorre o histórico completo.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Entender as colunas',
            imagem: '/university/screenshots/configurador-historico-tabela.png',
            imagemAbaixoTexto: true,
            paragrafos: ['Cada linha é um evento gravado automaticamente. As cinco colunas resumem o que aconteceu:'],
            colunasTabela: [...HISTORICO_COLUNAS_AUDITORIA],
          },
          {
            titulo: 'Filtrar e localizar',
            imagem: '/university/screenshots/configurador-historico-filtros.png',
            paragrafos: [
              'Use os filtros no cabeçalho de cada coluna para restringir por período, **Ação**, **Local** ou **Usuário**.',
              'A busca textual percorre **Detalhes**, nome do ator e tipo de recurso.',
            ],
          },
          {
            titulo: 'Exportar registros',
            imagem: '/university/screenshots/configurador-historico-exportar.png',
            paragrafos: [
              'No menu de exportação, baixe os registros **visíveis na página** em Excel, CSV, TXT, XML, PDF ou JSON.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'A exportação reflete o recorte atual (filtros + página).',
            },
          },
          {
            titulo: 'Navegar entre páginas',
            paragrafos: [
              'A listagem carrega **25 eventos por página**. Use **Anterior** e **Próxima** na base da tela.',
            ],
          },
        ]),
      },
      {
        titulo: 'O que o histórico registra',
        tituloSumario: 'O que o histórico registra',
        paragrafos: [
          'Nesta tela do Configurador aparecem convites, permissões, workspaces, login e segurança da conta. Operações de **Pedido**, **Smart Docs** e outros produtos ficam no **Histórico do produto** (menu lateral de cada módulo).',
          'Abaixo, a tabela com todos os eventos que o histórico registra na plataforma.',
        ],
        calloutAposParagrafo: {
          indice: 1,
          callout: {
            tipo: 'dica',
            texto: 'Nos produtos prontos (**Pedido**, **BID Frete**, **Smart Docs**) o histórico **não grava cada clique** — só **alterações que salvam no servidor** e operações especiais (duplicar, transferir, aprovar cotação, etc.).',
          },
        },
        mostrarCatalogoHistoricoCompleto: true,
        callout: {
          tipo: 'lembrete',
          texto: 'Algumas rotas podem gerar **dois** registros (ex.: alteração de permissão: evento de segurança + captura automática). Isso é esperado.',
        },
        calloutAposPassos: true,
        passosVisuais: [],
      },
    ],
  },
]

export function secaoConfiguradorPorSlug(slug: ConfiguradorManualSlug): DocSecao | undefined {
  const item = CONFIGURADOR_MANUAL_ITENS.find(i => i.pathSeg === slug)
  if (!item) return undefined
  if (item.secaoNum === 8) return undefined
  return DOC_CONFIGURADOR_SECOES.find(s => s.num === item.secaoNum)
}
