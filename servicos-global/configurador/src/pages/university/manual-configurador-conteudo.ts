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
  /** Oculta «Passo NN» — use em cenários/estados da tela (não sequência operacional). */
  ocultarRotuloPasso?: boolean
  /** Oculta o título do bloco (ex.: screenshot complementar abaixo de uma Dica). */
  ocultarTituloPasso?: boolean
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
  callouts?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }[]
  tooltipsKpi?: DocTooltipKpi[]
  galeriaTelas?: { legenda: string; imagem: string }[]
  linkCapitulo?: { texto: string; href: string }
  /** Figura logo após o parágrafo de índice `indice` (0 = primeiro). */
  figurasAposParagrafo?: { indice: number; imagem: string; legenda?: string }[]
  /** Duas telas lado a lado na coluna direita (comparativo sem × com). */
  galeriaComparacao?: { legenda: string; imagem: string }[]
  /** Screenshot em largura total abaixo do texto (em vez de coluna lateral). */
  imagemAbaixoTexto?: boolean
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

export interface DocFluxo {
  titulo: string
  /** Rótulo curto no sumário (ex.: "Criar workspace"). Se omitido, usa `titulo`. */
  tituloSumario?: string
  paragrafos?: string[]
  mostrarInfograficoPermissoesUsuario?: boolean
  mostrarInfograficoPapeisFornecedor?: boolean
  /** Cenários da mesma tela — oculta «Passo NN» em todos os blocos visuais do fluxo. */
  modoCenarios?: boolean
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
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
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
  /** Figura logo após o parágrafo de índice `indice` (0 = primeiro). */
  figurasAposParagrafo?: { indice: number; imagem: string; legenda?: string }[]
}

const DOCS_BASE = '/university-gravity/docs/configurador'

export const CONFIGURADOR_MANUAL_ITENS: ConfiguradorManualItem[] = [
  {
    pathSeg: 'visao-geral',
    label: 'Visão geral',
    secaoNum: 1,
    rotaApp: '/configurador',
    subtitulo: 'Mapa das áreas de gestão da conta Gravity',
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
    subtitulo: 'Tokens, webhooks e integrações com ERPs',
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

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

interface PassoAreaExtras {
  paragrafos?: string[]
  tooltipsKpi?: DocTooltipKpi[]
  galeriaTelas?: { legenda: string; imagem: string }[]
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
      'Total de acessos: Cada workspace marcado para um usuário conta um vínculo',
      'Master não precisa de vínculo explícito: Acessa todos automaticamente',
    ],
  },
  {
    card: 'Média de Acessos Concedidos',
    tituloTooltip: 'Distribuição média',
    descricao: 'Média de workspaces por usuário ativo na organização.',
    detalhes: [
      'Média geral: Ajuda a identificar contas com pouco ou muito alcance',
    ],
  },
  {
    card: 'Total Workspaces',
    tituloTooltip: 'Densidade e distribuição',
    descricao: 'Gráfico comparando usuários com e sem acesso a algum workspace.',
    detalhes: [
      'Com acesso: Pelo menos um workspace habilitado (ou tipo Master)',
      'Sem acesso: Ainda sem workspace vinculado',
      'Tooltip repete totais de usuários, workspaces e média por pessoa',
    ],
  },
]

/** Screenshots com tooltip aberto: Drive: 3. Usuarios/tela_configurador_usuarios_cards_tooltip_N.png */
const USUARIOS_TOOLTIP_KPI_IMAGENS: Partial<Record<string, string>> = {
  'Total de Usuários': '/university/screenshots/configurador-usuarios-cards-tooltip-1.png',
  'Acessos Concedidos': '/university/screenshots/configurador-usuarios-cards-tooltip-2.png',
  'Total Workspaces': '/university/screenshots/configurador-usuarios-cards-tooltip-3.png',
}

function criarPassosTooltipKpiUsuario(): PassoSemNumero[] {
  return USUARIOS_TOOLTIPS_KPI.map((tooltip) => ({
    titulo: `Tooltip: ${tooltip.card}`,
    imagem: USUARIOS_TOOLTIP_KPI_IMAGENS[tooltip.card],
    paragrafos: [
      `Passe o mouse no ícone (i) do card ${tooltip.card}. O balão ao lado mostra o que cada linha do tooltip significa na tela real.`,
    ],
    tooltipsKpi: [tooltip],
  }))
}

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

const FORNECEDORES_GALERIA_TOOLTIPS_KPI = [
  { legenda: '1 · Total de fornecedores', imagem: '/university/screenshots/configurador-fornecedores-cards-tooltip-1.png' },
  { legenda: '2 · Fornecedores ativos', imagem: '/university/screenshots/configurador-fornecedores-cards-tooltip-2.png' },
  { legenda: '3 · Distribuição por tipo', imagem: '/university/screenshots/configurador-fornecedores-cards-tooltip-3.png' },
] as const

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

const ASSINATURAS_TOOLTIP_KPI_IMAGENS: Partial<Record<string, string>> = {
  'Produtos Ativos': '/university/screenshots/configurador-assinaturas-cards-tooltip-1.png',
  'Em Teste': '/university/screenshots/configurador-assinaturas-cards-tooltip-2.png',
  'Acessos Suspensos': '/university/screenshots/configurador-assinaturas-cards-tooltip-3.png',
}

function criarPassosTooltipKpiAssinaturas(): PassoSemNumero[] {
  return ASSINATURAS_TOOLTIPS_KPI.map((tooltip) => ({
    titulo: `Tooltip: ${tooltip.card}`,
    imagem: ASSINATURAS_TOOLTIP_KPI_IMAGENS[tooltip.card],
    paragrafos: [
      `Passe o mouse no ícone (i) do card ${tooltip.card}. O balão ao lado mostra o que cada linha do tooltip significa na tela real.`,
    ],
    tooltipsKpi: [tooltip],
  }))
}

const FINANCEIRO_TOOLTIPS_KPI: DocTooltipKpi[] = [
  {
    card: 'Próximo Vencimento',
    tituloTooltip: 'DETALHES DA FATURA',
    descricao: 'Data e valor da fatura em aberto com vencimento mais próximo.',
    detalhes: [
      'Fatura Nº: Identificador legível da cobrança',
      'Valor esperado: Total a pagar naquela fatura',
      'Competência: Mês/ano de referência do serviço',
    ],
  },
  {
    card: 'Valor a Pagar',
    tituloTooltip: 'COMPOSIÇÃO DO VALOR',
    descricao: 'Soma de todas as faturas ainda não quitadas na organização.',
    detalhes: [
      'Faturas pendentes: Emitidas ou enviadas, aguardando pagamento',
      'Faturas atrasadas: Vencidas (status Em atraso)',
    ],
  },
  {
    card: 'Faturas em Aberto',
    tituloTooltip: 'SITUAÇÃO GERAL',
    descricao: 'Panorama do histórico de cobrança da conta Gravity.',
    detalhes: [
      'Total lançadas: Todas as faturas já geradas',
      'Faturas pagas: Quitadas com sucesso',
    ],
  },
]

/** Screenshots com tooltip aberto: Drive: 6. Financeiro/tela_financeiro_tela_principal_tootip_N.png */
const FINANCEIRO_TOOLTIP_KPI_IMAGENS: Partial<Record<string, string>> = {
  'Próximo Vencimento': '/university/screenshots/configurador-financeiro-cards-tooltip-1.png',
  'Valor a Pagar': '/university/screenshots/configurador-financeiro-cards-tooltip-2.png',
  'Faturas em Aberto': '/university/screenshots/configurador-financeiro-cards-tooltip-3.png',
}

function criarPassosTooltipKpiFinanceiro(): PassoSemNumero[] {
  return FINANCEIRO_TOOLTIPS_KPI.map((tooltip) => ({
    titulo: `Tooltip: ${tooltip.card}`,
    imagem: FINANCEIRO_TOOLTIP_KPI_IMAGENS[tooltip.card],
    paragrafos: [
      `Passe o mouse no ícone (i) do card ${tooltip.card}. O balão ao lado mostra o que cada linha do tooltip significa na tela real.`,
    ],
    tooltipsKpi: [tooltip],
  }))
}

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

const TAXAS_MOEDA_TOOLTIP_KPI_IMAGENS: Partial<Record<string, string>> = {
  'USD / BRL': '/university/screenshots/configurador-taxas-moeda-cards-tooltip-1.png',
  'EUR / BRL': '/university/screenshots/configurador-taxas-moeda-cards-tooltip-2.png',
  'Moedas ativas': '/university/screenshots/configurador-taxas-moeda-cards-tooltip-3.png',
}

function criarPassosTooltipKpiTaxasMoeda(): PassoSemNumero[] {
  return TAXAS_MOEDA_TOOLTIPS_KPI.map((tooltip) => ({
    titulo: `Tooltip: ${tooltip.card}`,
    imagem: TAXAS_MOEDA_TOOLTIP_KPI_IMAGENS[tooltip.card],
    paragrafos: [
      `Passe o mouse no ícone (i) do card ${tooltip.card}. O balão ao lado mostra o que cada linha do tooltip significa na tela real.`,
    ],
    tooltipsKpi: [tooltip],
  }))
}

/** Passos padrão de acesso: opcional Hub → menu do usuário → Configurador → área no menu lateral. */
function passosComAcessoPadrao(
  areaMenu: string,
  passosEspecificos: PassoSemNumero[],
  imagemArea?: string,
  comPassoHub = false,
  paragrafosAcessoArea?: string[],
  extrasArea?: PassoAreaExtras,
  imagemAbrirConfigurador?: string,
): DocPassoVisual[] {
  const offset = comPassoHub ? 1 : 0
  const passoHub: DocPassoVisual[] = comPassoHub
    ? [{
        num: 1,
        titulo: 'No Hub: Menu do usuário',
        imagem: SCREENSHOT_HUB_ACESSO_CONFIGURADOR,
        paragrafos: [
          'De qualquer lugar da plataforma: Hub ou produto Gravity: Clique no ícone do usuário no canto superior direito, como indicado pela seta na imagem.',
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
      paragrafos: extrasArea?.paragrafos ?? paragrafosAcessoArea ?? [
        `No menu lateral do Configurador, clique em ${areaMenu}. A tela correspondente abre com os dados da sua organização.`,
      ],
      tooltipsKpi: extrasArea?.tooltipsKpi,
      galeriaTelas: extrasArea?.galeriaTelas,
    },
  ]
  return [
    ...passoHub,
    ...base,
    ...passosEspecificos.map((passo, i) => ({ ...passo, num: i + 3 + offset })),
  ]
}

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
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
      'O Configurador é o painel de gestão da sua conta Gravity. A partir dele você administra a organização (empresa contratante), os workspaces (filiais ou clientes), usuários, assinaturas de produtos e integrações.',
      'Use o menu abaixo para ir direto ao capítulo de cada área. Cada página deste manual descreve uma tela do Configurador com passos visuais e screenshots.',
    ],
    lista: [
      `{{link:${DOCS_BASE}/organizacao|Organização}}: Dados da empresa contratante, nasce no signup e onboarding`,
      `{{link:${DOCS_BASE}/workspaces|Workspaces}}: Matriz, filiais ou clientes do despachante`,
      `{{link:${DOCS_BASE}/usuarios|Usuários}}: Convites, patentes e permissões`,
      `{{link:${DOCS_BASE}/fornecedores|Fornecedores}}: Terceiros COMEX, exportador na importação, importador na exportação, agente, despachante`,
      `{{link:${DOCS_BASE}/assinaturas|Assinaturas}}: Produtos e planos contratados`,
      `{{link:${DOCS_BASE}/financeiro|Financeiro}}: Faturas e pagamentos`,
      `{{link:${DOCS_BASE}/api-cockpit|API Cockpit}}: Tokens, webhooks e ERP`,
      `{{link:${DOCS_BASE}/taxas-moeda|Taxas e moeda}}: Câmbio operacional`,
      `{{link:${DOCS_BASE}/historico|Histórico}}: Auditoria da organização`,
    ],
  },
  {
    num: 2,
    titulo: 'Organização',
    layoutTextoImagemLateral: true,
    imagem: '/university/screenshots/configurador-organizacao-tela.png',
    mostrarInfograficoOrganizacao: true,
    paragrafos: [
      'A Organização é a empresa que contrata o Gravity: O tenant principal da conta.',
      'No infográfico abaixo, veja de onde ela nasce. Os dados cadastrais que aparecem em Configurador → Organização vêm desse fluxo: Depois do onboarding, você só revisa e mantém a identidade legal da conta.',
    ],
    origemDados: {
      paragrafos: [
        'As telas abaixo são o passo Onboarding do fluxo acima: É aqui que nome e CNPJ são informados pela primeira vez e viram a organização na plataforma.',
      ],
      etapas: [
        {
          legenda: '1 · Nome da empresa',
          paragrafos: [
            'No primeiro acesso após criar a conta, o wizard pede o nome da empresa contratante. Esse nome vira o rótulo inicial da organização.',
          ],
          imagem: '/university/screenshots/onboarding-nome-preenchido.png',
        },
        {
          legenda: '2 · CNPJ',
          paragrafos: [
            'Na etapa seguinte, informe o CNPJ. Com nome e CNPJ validados, a organização é criada e você segue para o {{link:/university-gravity/docs/hub|Hub}}.',
          ],
          imagem: '/university/screenshots/onboarding-cnpj-preenchido.png',
        },
      ],
    },
    fluxos: [
      {
        titulo: 'Fluxo 1: Acessar Organização',
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
      '**Workspaces** são as unidades operacionais da organização: Filial do importador/exportador, empresa do grupo ou cliente atendido por um despachante.',
      'No Configurador → Workspaces você cria, edita, ativa ou suspende ambientes. Usuários Standard e Fornecedor só enxergam os workspaces aos quais foram vinculados.',
    ],
    lista: [
      '**Criar**: Cadastrar nova filial ou cliente com nome e subdomínio',
      '**Editar**: Ajustar CNPJ e dados da unidade operacional',
      '**Ativar / Suspender**: Liberar ou bloquear acesso sem apagar o cadastro',
    ],
    callout: {
      tipo: 'dica',
      texto: 'O **CNPJ do workspace** identifica a empresa que concentra pedidos, processos e cotações daquela unidade.',
    },
    fluxos: [
      {
        titulo: 'Fluxo 1: Acessar Workspaces',
        paragrafos: [
          'Siga os passos abaixo para abrir o Configurador e chegar à tela de Workspaces.',
        ],
        passosVisuais: passosComAcessoPadrao(
          'Workspaces',
          [],
          '/university/screenshots/configurador-workspaces-acesso-tela.png',
          true,
          undefined,
          {
            paragrafos: [
              'No menu lateral do Configurador, clique em Workspaces. A tela abre com a listagem e os três cards de resumo no topo.',
              'Passe o mouse no ícone (i) de cada card para abrir o tooltip: Veja abaixo o que cada indicador mostra:',
            ],
            tooltipsKpi: WORKSPACES_TOOLTIPS_KPI,
            galeriaTelas: [
              { legenda: '1 · Total de Workspaces', imagem: '/university/screenshots/configurador-workspaces-cards-tooltip-1.png' },
              { legenda: '2 · Workspaces Ativos', imagem: '/university/screenshots/configurador-workspaces-cards-tooltip-2.png' },
              { legenda: '3 · Status dos Workspaces', imagem: '/university/screenshots/configurador-workspaces-cards-tooltip-3.png' },
            ],
          },
        ),
      },
      {
        titulo: 'Fluxo 2: Criar workspace',
        tituloSumario: 'Criar workspace',
        paragrafos: [
          'Na tela de Workspaces você cadastra filiais ou clientes como novas unidades operacionais da organização.',
        ],
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
              'Informe nome, subdomínio e demais campos obrigatórios. Após salvar, o workspace aparece na listagem pronto para ativação.',
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
        titulo: 'Fluxo 3: Editar workspace',
        tituloSumario: 'Editar workspace',
        paragrafos: [
          'Altere nome, subdomínio ou demais dados de um workspace já cadastrado.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Editar um workspace existente',
            imagem: '/university/screenshots/configurador-workspaces-modal-editar.png',
            paragrafos: [
              'Use a ação Editar no card do workspace para alterar nome, subdomínio ou demais dados. As mudanças refletem imediatamente no seletor de workspace do Hub.',
              'No modal, preencha o CNPJ da unidade operacional com atenção: Ele identifica a empresa que concentra os registros do workspace na plataforma.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'O CNPJ do workspace é muito importante. Ele representa a empresa principal daquela unidade: É sobre ela que serão emitidos pedidos, processos, cotações de frete, DUIMP e demais operações COMEX vinculadas ao workspace.',
            },
          },
        ]),
      },
      {
        titulo: 'Fluxo 4: Ativar e suspender workspace',
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
        titulo: 'Fluxo 5: Excluir workspace',
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
    mostrarInfograficoTiposUsuario: true,
    paragrafos: [
      '**Usuários** concentra convites, patentes e permissões: Quem acessa a organização, quais produtos cada pessoa opera e em quais workspaces.',
      'Master convida e gerencia todos os cadastros. Standard e Fornecedor seguem as permissões e workspaces definidos pelo administrador.',
    ],
    lista: [
      '**Master**: Acesso total à organização e ao Configurador',
      '**Standard**: Opera produtos conforme permissões e workspaces vinculados',
      '**Fornecedor**: Parceiro externo com acesso restrito (ex.: Cotar frete)',
    ],
    callout: {
      tipo: 'aviso',
      texto: 'Usuários não são excluídos da plataforma. Para bloquear acesso, **desative** o cadastro e preserve o histórico de auditoria.',
    },
    fluxos: [
      {
        titulo: 'Fluxo 1: Acessar Usuários',
        tituloSumario: 'Acessar Usuários',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Usuários.'],
        passosVisuais: passosComAcessoPadrao(
          'Usuários',
          criarPassosTooltipKpiUsuario(),
          '/university/screenshots/configurador-usuarios-seta-menu.png',
          true,
          [
            'No menu lateral do Configurador, clique em Usuários: Como indicado pela seta na imagem. A tela abre com a listagem e os quatro cards de resumo no topo.',
            'A tabela lista nome, e-mail, tipo, status e workspaces habilitados. Nos passos seguintes, cada tooltip dos cards é explicado separadamente.',
          ],
          undefined,
          '/university/screenshots/configurador-usuarios-acesso-atalho.png',
        ),
      },
      {
        titulo: 'Fluxo 2: Convidar usuário',
        tituloSumario: 'Convidar usuário',
        paragrafos: [
          'Envie um convite por e-mail para incluir Master, Standard ou Fornecedor na organização. O convidado completa o cadastro pelo link recebido.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar o convite',
            imagem: '/university/screenshots/configurador-usuarios-convidar-seta.png',
            paragrafos: [
              'Na tela de Usuários, clique em "Convidar usuário" no canto superior direito: Como indicado pela seta na imagem. O modal de convite abre sobre a listagem.',
            ],
          },
          {
            titulo: 'Preencher dados básicos',
            paragrafos: [
              'Informe o e-mail do convidado e escolha o tipo de usuário. Master tem acesso total na organização; Standard e Fornecedor dependem das permissões e workspaces definidos nos fluxos seguintes.',
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
            titulo: 'Confirmar envio',
            imagem: '/university/screenshots/configurador-usuarios-convite-enviado.png',
            paragrafos: [
              'Após revisar permissões e workspaces, envie o convite. O convidado aparece na lista com badge Convidado (amarelo) até concluir o cadastro pelo e-mail.',
              'O fluxo do convidado (senha, termos e verificação) está no {{link:/university-gravity/docs/login|Manual de Login}}, seção Fluxo 4.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'Cada link de convite é de uso único. Se expirar ou for perdido, reenvie ou cancele o convite pela mesma lista.',
            },
          },
        ]),
      },
      {
        titulo: 'Fluxo 3: Permissões do usuário',
        tituloSumario: 'Permissões Usuários',
        mostrarInfograficoPermissoesUsuario: true,
        paragrafos: [
          'As permissões granulares valem somente para Standard e Fornecedor: O Master define o que cada um pode ver e editar em cada produto.',
          'Master não passa por essa grade: Tem acesso total à organização, a todos os workspaces e a todas as áreas do Configurador.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Marcar permissões no convite',
            imagem: '/university/screenshots/configurador-usuarios-convite-permissoes.png',
            paragrafos: [
              'No modal de convite, escolha Standard ou Fornecedor e role até a seção de permissões: Como indicado pela seta na imagem.',
              'Para cada Produto Gravity contratado, marque Ver ou Editar nas linhas que a pessoa precisa usar. Se o tipo for Master, ignore esta etapa.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'A grade de permissões aparece para Standard e Fornecedor. Master ignora essas marcações e opera com acesso irrestrito na organização.',
            },
          },
          {
            titulo: 'Ajustar em usuário existente',
            imagem: '/university/screenshots/configurador-usuarios-convite-permissoes.png',
            paragrafos: [
              'Para Standard ou Fornecedor já cadastrado, clique no ícone de chave na linha ou abra Editar → aba Permissões. A grade é a mesma do convite: Produto, visualização padrão e colunas Ver / Editar.',
              'Use Todo ou Limpar no cabeçalho de cada produto para marcar ou desmarcar todas as linhas de uma vez. As mudanças valem na próxima sessão.',
            ],
            callout: {
              tipo: 'seguranca',
              texto: 'Só Master pode alterar permissões de outras pessoas. Standard e Fornecedor não editam a lista de usuários nem as patentes de colegas.',
            },
          },
          {
            titulo: 'Habilitar cotação de frete internacional',
            imagem: '/university/screenshots/configurador-usuarios-permissoes-cotar-frete.png',
            paragrafos: [
              'Para fornecedores que atuam como agente de carga, existe a permissão específica Pode cotar frete internacional: No bloco do produto BID Frete Internacional.',
              'Ao marcar, o usuário Fornecedor acessa a visão de parceiro: Responder cotações, enviar propostas e operar o painel BID Frete Internacional, Fornecedor.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'O convidado precisa ser tipo Fornecedor, com empresa fornecedora vinculada (ex.: Agente de carga) em Configurador → Fornecedores, e status Ativo: Não apenas Convidado.',
            },
          },
        ]),
      },
      {
        titulo: 'Fluxo 4: Workspaces do usuário',
        tituloSumario: 'Workspaces do Usuário',
        paragrafos: [
          'Vincule Standard e Fornecedor aos workspaces em que poderão operar. Master acessa todos automaticamente, sem marcação individual.',
          'Somente os workspaces selecionados ficam disponíveis para o usuário: No Hub, no seletor de unidade e nos Produtos Gravity. Unidades desmarcadas permanecem fora do alcance dele.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Selecionar workspaces no convite',
            imagem: '/university/screenshots/configurador-usuarios-convite-workspaces-todos.png',
            paragrafos: [
              'No modal de convite, marque os workspaces habilitados para o convidado: Filial, empresa do grupo ou cliente de despachante.',
              'Apenas os itens com checkbox ativo entram no acesso. O convidado não enxerga nem opera nas demais unidades da organização.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Sem nenhum workspace marcado, Standard e Fornecedor ficam sem unidade operacional: Mesmo com permissões de produto liberadas na etapa anterior.',
            },
          },
          {
            titulo: 'Opção todos os workspaces',
            imagem: '/university/screenshots/configurador-usuarios-convite-workspaces-todos.png',
            paragrafos: [
              'Para Standard, você pode habilitar todos os workspaces de uma vez quando a pessoa precisa operar em toda a organização. Revise antes de confirmar: O acesso fica amplo.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'Master não precisa de vínculo explícito: A coluna Workspaces habilitados exibe "Todos os workspaces" automaticamente.',
            },
          },
          {
            titulo: 'Alterar vínculos depois',
            imagem: '/university/screenshots/configurador-usuarios-editar-workspaces-vinculados.png',
            paragrafos: [
              'Em usuário já cadastrado, abra Editar e vá à aba Workspaces Vinculados para incluir ou remover unidades sem reenviar convite.',
              'Ao desmarcar um workspace, o acesso some na próxima sessão: A pessoa deixa de ver aquela unidade no Hub e nos produtos.',
            ],
          },
        ]),
      },
      {
        titulo: 'Fluxo 5: Desativar e ativar usuário',
        tituloSumario: 'Desativar e Ativar Usuário',
        paragrafos: [
          'Suspenda quem não deve mais entrar na plataforma, reative quando necessário ou gerencie convites ainda pendentes.',
          'Usuários não podem ser excluídos: O Master precisa preservar o histórico de tudo o que cada pessoa fez enquanto estava ativa. O cadastro permanece gravado; o controle de acesso é feito por desativação, não por exclusão.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Desativar um usuário ativo',
            imagem: '/university/screenshots/configurador-usuarios-desativar-seta.png',
            paragrafos: [
              'Na linha de um usuário com status Ativo, clique no ícone de pausa: Como indicado pela seta na imagem. O acesso é suspenso imediatamente: O status muda para Inativo e novos logins são bloqueados.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Não existe exclusão de usuário na plataforma. Se alguém não deve mais entrar, desative: Assim o Master mantém auditoria e histórico das ações que essa pessoa realizou quando estava ativa.',
            },
          },
          {
            titulo: 'Reativar um usuário inativo',
            imagem: '/university/screenshots/configurador-usuarios-reativar-seta.png',
            paragrafos: [
              'Na mesma linha, com status Inativo, clique no ícone de play: Como indicado pela seta na imagem: Para liberar o acesso novamente. O histórico e os vínculos anteriores são preservados.',
            ],
          },
          {
            titulo: 'Convite pendente',
            imagem: '/university/screenshots/configurador-usuarios-convite-pendente-lista.png',
            paragrafos: [
              'Usuários com status Convidado ainda não concluíram o cadastro. Use Reenviar Convite (ícone de seta circular) para mandar um novo e-mail ou cancele o convite se o acesso não for mais necessário.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Cancelar convite remove a pessoa da lista. Desativar um usuário Ativo preserva o histórico: Apenas bloqueia novos logins até reativação.',
            },
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
      '**Fornecedores** cadastra terceiros COMEX da organização: Fabricantes, compradores, agentes de carga, despachantes e demais parceiros de pedidos, processos e cotações.',
      'O infográfico abaixo explica a diferença entre **Exportador na importação** e **Importador na exportação**: O papel descreve a função do terceiro na sua operação, não o tipo da sua empresa.',
    ],
    lista: [
      '**Exportador na importação**: Vendedor no exterior quando você importa',
      '**Importador na exportação**: Comprador no exterior quando você exporta',
      '**Despachante / Agente / Armador**: Parceiros logísticos e aduaneiros',
    ],
    fluxos: [
      {
        titulo: 'Fluxo 1: Acessar Fornecedores',
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
            tooltipsKpi: FORNECEDORES_TOOLTIPS_KPI,
            galeriaTelas: [...FORNECEDORES_GALERIA_TOOLTIPS_KPI],
          },
        ),
      },
      {
        titulo: 'Fluxo 2: Criar fornecedor',
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
        titulo: 'Fluxo 3: Exportador na importação',
        tituloSumario: 'Exportador na importação',
        paragrafos: [
          'Quando sua empresa importa, o vendedor no exterior é cadastrado como fornecedor com papel Exportador: Ele exporta a mercadoria para você.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Marcar papel Exportador',
            imagem: '/university/screenshots/configurador-fornecedores-exportador-importacao-modal.png',
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
              'Informe razão social, país e TIN do fabricante ou trading company no exterior. Esses dados alimentam invoices, processos e DUIMP.',
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
        titulo: 'Fluxo 4: Importador na exportação',
        tituloSumario: 'Importador na exportação',
        paragrafos: [
          'Quando sua empresa exporta, o comprador no exterior é cadastrado como fornecedor com papel Importador: Ele importa a mercadoria que você vende.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Marcar papel Importador',
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
              'Cadastre razão social, país e documento fiscal do comprador no destino. Esses dados vinculam o cliente às suas vendas internacionais.',
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
        titulo: 'Fluxo 5: Outros tipos de fornecedor',
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
        titulo: 'Fluxo 6: Editar fornecedor',
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
        titulo: 'Fluxo 7: Ativar e desativar fornecedor',
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
      texto: 'O modal **Editar assinatura** é somente leitura, exceto a aba **Workspaces**, onde você habilita o produto por unidade.',
    },
    fluxos: [
      {
        titulo: 'Fluxo 1: Acessar Assinaturas',
        tituloSumario: 'Acessar Assinaturas',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Assinaturas.'],
        passosVisuais: passosComAcessoPadrao(
          'Assinaturas',
          criarPassosTooltipKpiAssinaturas(),
          '/university/screenshots/configurador-assinaturas-seta-menu.png',
          true,
          [
            'No menu lateral do Configurador, clique em Assinaturas: Como indicado pela seta na imagem. A tela abre com os três cards de resumo e a tabela Produtos Contratados.',
            'Em **Produtos Contratados** aparecem somente os módulos que a organização assinou pela **Gravity Store**: Contratos feitos na vitrine de produtos da plataforma.',
            'A tabela lista produto, tipo de cobrança (SaaS, Uso ou Setup), valor, renovação, workspaces habilitados e status. Nos passos seguintes, cada tooltip dos cards é explicado separadamente.',
          ],
          undefined,
          '/university/screenshots/configurador-assinaturas-acesso-atalho.png',
        ),
      },
      {
        titulo: 'Fluxo 2: Consultar assinatura',
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
        titulo: 'Fluxo 3: Workspaces do produto',
        tituloSumario: 'Workspaces do Produto',
        paragrafos: [
          'Cada assinatura pode estar ativa em um ou mais workspaces. Expanda a linha na tabela para ver e alterar em quais unidades o produto está habilitado.',
          'Marque ou desmarque workspaces, use Habilitar/Bloquear em lote e clique em Salvar alterações: As mudanças valem na próxima sessão dos usuários daquela unidade.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Expandir a linha do produto',
            imagem: '/university/screenshots/configurador-assinaturas-workspaces-expandido.png',
            paragrafos: [
              'Clique na seta à esquerda da linha do produto para abrir a subtabela de workspaces vinculados: Nome do workspace, status do produto e ações por unidade.',
            ],
          },
          {
            titulo: 'Bloquear workspace',
            galeriaTelas: [
              { legenda: '1 · Seta desabilitar', imagem: '/university/screenshots/configurador-assinaturas-workspaces-seta-desabilitar.png' },
              { legenda: '2 · Workspace bloqueado', imagem: '/university/screenshots/configurador-assinaturas-workspaces-bloqueado.png' },
            ],
            paragrafos: [
              'Selecione um ou mais workspaces e use Bloquear para remover o acesso ao produto naquela unidade. O status muda para bloqueado até você reabilitar.',
            ],
          },
          {
            titulo: 'Reabilitar workspace',
            galeriaTelas: [
              { legenda: '1 · Seta reabilitar', imagem: '/university/screenshots/configurador-assinaturas-workspaces-seta-reabilitar.png' },
              { legenda: '2 · Workspace reabilitado', imagem: '/university/screenshots/configurador-assinaturas-workspaces-reabilitado.png' },
            ],
            paragrafos: [
              'Com workspaces selecionados, clique em Habilitar para restaurar o acesso. O produto volta a aparecer no Hub e nos seletores daquela unidade.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Se nenhum workspace estiver habilitado, o produto não fica acessível na organização: Mesmo com assinatura Ativa.',
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
        titulo: 'Fluxo 4: Suspender e reativar',
        tituloSumario: 'Suspender e Reativar',
        paragrafos: [
          'Suspenda temporariamente o acesso ao produto sem cancelar a assinatura. A operação é reversível pelo mesmo ícone de pausa/play: O bloqueio é imediato, mas o plano continua contratado até você cancelar de fato.',
          '**Não confunda com cancelar.** A cobrança da Gravity **não é pró rata**: Se o usuário cancelar a assinatura, a próxima fatura não é gerada e o encerramento vale no **vencimento do ciclo vigente**, não na data do clique. Exemplo: Contratação em 05/02 com vigência até 05/03: Cancelamento solicitado em 20/02 só passa a valer em 05/03.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Suspender assinatura',
            imagem: '/university/screenshots/configurador-assinaturas-suspender-seta.png',
            paragrafos: [
              'Na coluna de ações, clique no ícone de pausa (Suspender). O status muda para Suspensa e o card Acessos Suspensos é atualizado.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Suspender bloqueia o acesso ao produto imediatamente, mas não encerra o contrato nem interrompe a cobrança no meio do ciclo. Para encerrar de vez, use o ícone de lixeira na linha: Com efeito no vencimento, sem pró rata.',
            },
          },
          {
            titulo: 'Confirmar status suspenso',
            imagem: '/university/screenshots/configurador-assinaturas-suspenso.png',
            paragrafos: [
              'A linha exibe o badge Suspensa. Usuários perdem acesso ao produto até a reativação.',
            ],
          },
          {
            titulo: 'Reativar assinatura',
            imagem: '/university/screenshots/configurador-assinaturas-reativar-seta.png',
            paragrafos: [
              'Com status Suspensa, o ícone vira play (Reativar). Clique para voltar o produto ao status Ativa.',
            ],
          },
          {
            titulo: 'Confirmar reativação',
            imagem: '/university/screenshots/configurador-assinaturas-reativado.png',
            paragrafos: [
              'O status volta para Ativa e o acesso é restaurado nos workspaces habilitados.',
            ],
          },
        ]),
      },
    ],
  },
  {
    num: 7,
    titulo: 'Financeiro',
    layoutTextoImagemLateral: true,
    imagem: '/university/screenshots/configurador-financeiro-aba-faturas.png',
    paragrafos: [
      '**Financeiro** concentra faturas da organização na Gravity, documentos de cobrança (boleto e NF-e) e a tabela de **Produtos × Valores** do catálogo contratado.',
      'Status de fatura: **Emitida** e **Enviada** (em aberto), **Paga**, **Em atraso**, **Anulada** e **Incobrável**. Os cards do topo resumem vencimento, valor pendente e quantidade em aberto.',
    ],
    lista: [
      '**Histórico de Faturas**: Cobranças, vencimentos, boleto e NF-e',
      '**Produtos & Valores**: Preços, franquias e negociações do catálogo',
    ],
    callout: {
      tipo: 'aviso',
      texto: 'Somente usuários **Master** acessam esta área. Standard e Fornecedor não veem faturas nem preços.',
    },
    fluxos: [
      {
        titulo: 'Fluxo 1: Acessar Financeiro',
        tituloSumario: 'Acessar Financeiro',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Financeiro.'],
        passosVisuais: passosComAcessoPadrao(
          'Financeiro',
          criarPassosTooltipKpiFinanceiro(),
          '/university/screenshots/configurador-financeiro-seta-menu.png',
          true,
          [
            'No menu lateral do Configurador, clique em Financeiro: Como indicado pela seta na imagem. A tela abre com os três cards de resumo e a aba Histórico de Faturas ativa por padrão.',
            'Use as abas Histórico de Faturas e Produtos & Valores para alternar entre cobranças e tabela de preços. Nos passos seguintes, cada tooltip dos cards é explicado separadamente.',
          ],
          undefined,
          '/university/screenshots/configurador-financeiro-acesso-atalho.png',
        ),
      },
      {
        titulo: 'Fluxo 2: Histórico de faturas',
        tituloSumario: 'Histórico de Faturas',
        paragrafos: [
          'Consulte faturas emitidas, acompanhe vencimentos e baixe boleto ou NF-e quando disponíveis. Passe o mouse sobre o valor para ver a composição sem expandir a linha.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Visão geral da aba Faturas',
            imagem: '/university/screenshots/configurador-financeiro-aba-faturas.png',
            paragrafos: [
              'A tabela lista número, competência, descrição, valor, vencimento e status. Use Buscar para filtrar por número ou descrição, e Exportar para planilha.',
            ],
          },
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
        titulo: 'Fluxo 3: Produtos e valores',
        tituloSumario: 'Produtos & Valores',
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
    num: 8,
    titulo: 'API Cockpit',
    paragrafos: [
      '**API Cockpit** centraliza tokens de integração, playground de requisições, webhooks e conectores com ERPs.',
    ],
    lista: [
      '**Tokens**: Credenciais para integrações REST',
      '**Playground**: Testar requisições antes de publicar',
      '**Webhooks**: Notificações de eventos para sistemas externos',
    ],
    callout: {
      tipo: 'dica',
      texto: 'Capítulos detalhados com screenshots serão publicados em breve. Use o Fluxo 1 para chegar à tela no Configurador.',
    },
    fluxos: [
      {
        titulo: 'Fluxo 1: Acessar API Cockpit',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar ao API Cockpit.'],
        passosVisuais: passosComAcessoPadrao('API Cockpit', []),
      },
      fluxoEmBreve('Fluxo 2: Configurar integrações', 'Screenshots e passos detalhados desta tela serão adicionados em breve.'),
    ],
  },
  {
    num: 9,
    titulo: 'Taxas e moeda',
    layoutTextoImagemLateral: true,
    imagem: '/university/screenshots/configurador-taxas-moeda-tela-principal.png',
    paragrafos: [
      '**Taxas e moeda** concentra o câmbio operacional da organização em duas abas, cada uma com sincronização, agendamento e consulta próprios.',
      'Os produtos Gravity consomem essas taxas para conversões, simulações e documentos fiscais. A sincronização PTAX roda automaticamente **4 vezes por dia** em dias úteis (10h03 / 11h03 / 12h03 / 13h03 BRT); o Focus é atualizado **semanalmente** (terça 22h BRT).',
      'Use **Sincronizar PTAX** ou **Sincronizar Focus** para forçar atualização fora do cron, e **Agendamento** para ligar ou desligar a sincronização automática por aba.',
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
        titulo: 'Fluxo 1: Acessar Taxas e moeda',
        tituloSumario: 'Acessar Taxas e moeda',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Taxas e moeda.'],
        passosVisuais: passosComAcessoPadrao(
          'Taxas e moeda',
          [
            {
              titulo: 'Tela principal: Cotação Atual',
              imagem: '/university/screenshots/configurador-taxas-moeda-tela-principal.png',
              paragrafos: [
                'A aba Cotação Atual abre por padrão. No topo, três cards resumem USD, EUR e quantas moedas já possuem PTAX armazenada.',
                'A tabela lista as sete moedas suportadas (USD, EUR, GBP, CHF, CNY, JPY, CAD) com compra, venda, data, hora, fonte e data de armazenamento. Use Buscar para filtrar; Exportar gera planilha da listagem.',
              ],
            },
            ...criarPassosTooltipKpiTaxasMoeda(),
          ],
          '/university/screenshots/configurador-taxas-moeda-acesso-seta.png',
          true,
          [
            'No menu lateral do Configurador, clique em Taxas e moeda: Como indicado pela seta na imagem. A tela abre na aba Cotação Atual.',
            'Alterne para Cotação Futura quando precisar consultar projeções do BACEN Focus. Nos passos seguintes, a tabela principal e cada tooltip dos cards são explicados separadamente.',
          ],
        ),
      },
      {
        titulo: 'Fluxo 2: Sincronizar PTAX',
        tituloSumario: 'Sincronizar PTAX',
        paragrafos: [
          'Dispare manualmente a busca dos boletins PTAX no BCB. Útil fora dos horários do cron automático ou para recuperar moeda que falhou na última rodada.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar sincronização',
            imagem: '/university/screenshots/configurador-taxas-moeda-sincronizar-seta.png',
            paragrafos: [
              'Na aba Cotação Atual, clique em **Sincronizar PTAX**: Como indicado pela seta na imagem. O botão fica ao lado de Agendamento, no canto superior direito.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'O cron da Gravity já sincroniza PTAX 4× por dia em dias úteis. O botão manual não substitui o agendamento: Apenas força uma rodada imediata.',
            },
          },
          {
            titulo: 'Sincronização em andamento',
            imagem: '/university/screenshots/configurador-taxas-moeda-sincronizando.png',
            paragrafos: [
              'Enquanto o serviço consulta o BCB, o botão exibe **Sincronizando…** com ícone girando. Aguarde a conclusão: Não feche a aba.',
            ],
          },
          {
            titulo: 'Sincronização concluída',
            imagem: '/university/screenshots/configurador-taxas-moeda-sincronizado.png',
            paragrafos: [
              'Ao terminar, um toast confirma quantas moedas foram atualizadas e o horário da última sincronização aparece ao lado do relógio. Os cards e a tabela refletem os novos valores de compra e venda.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Se nenhuma moeda for atualizada, verifique se o sidecar taxas-moeda está online ou tente novamente em horário de publicação do BCB (dias úteis, após 10h BRT).',
            },
          },
        ]),
      },
      {
        titulo: 'Fluxo 3: Agendamento automático',
        tituloSumario: 'Agendamento automático',
        paragrafos: [
          'Configure se a sincronização automática fica ativa para a aba em que você está: PTAX na Cotação Atual, Focus na Cotação Futura. O modal segue o mesmo padrão visual do painel Admin › Testes.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Abrir o modal de agendamento',
            imagem: '/university/screenshots/configurador-taxas-moeda-agendamento-seta.png',
            paragrafos: [
              'Clique no botão **Agendamento**: Como indicado pela seta. A pill **Ativo** (verde) ou **Inativo** (cinza) indica o estado atual da aba aberta.',
            ],
          },
          {
            titulo: 'Modal: Configuração (aba Geral)',
            imagem: '/university/screenshots/configurador-taxas-moeda-agendamento-modal-1.png',
            paragrafos: [
              'Em **Agendamento automático**, escolha Ativado ou Desativado. Para PTAX, a frequência padrão é **Diário (4 boletins PTAX)** com horários fixos do BCB.',
              'Para Focus, use frequência **Semanal**: O cron padrão da Gravity é terça-feira às 22h BRT.',
            ],
          },
          {
            titulo: 'Modal: Horários e alertas',
            imagem: '/university/screenshots/configurador-taxas-moeda-agendamento-modal-2.png',
            paragrafos: [
              'Na aba Horários, confira os slots PTAX (10h03 / 11h03 / 12h03 / 13h03) ou o horário semanal do Focus. A aba Alertas permite cadastrar e-mails para notificação de falha.',
              'Clique em **Salvar** para gravar. O badge do botão Agendamento na tela principal muda para Ativo quando a configuração está ligada.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'PTAX e Focus têm agendamentos independentes: Configure cada um na aba correspondente antes de abrir o modal.',
            },
          },
        ]),
      },
      {
        titulo: 'Fluxo 4: Cotação futura (BACEN Focus)',
        tituloSumario: 'Cotação Futura',
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
      {
        titulo: 'Fluxo 5: Sincronizar Focus',
        tituloSumario: 'Sincronizar Focus',
        paragrafos: [
          'Busque manualmente a última rodada de expectativas de mercado publicada pelo BACEN. O cron semanal já faz isso automaticamente quando o agendamento está ativo.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar sincronização Focus',
            imagem: '/university/screenshots/configurador-taxas-moeda-cotacao-futura-sincronizar-seta.png',
            paragrafos: [
              'Com a aba Cotação Futura ativa, clique em **Sincronizar Focus**: Como indicado pela seta na imagem.',
            ],
          },
          {
            titulo: 'Sincronização em andamento',
            imagem: '/university/screenshots/configurador-taxas-moeda-cotacao-futura-sincronizando.png',
            paragrafos: [
              'O botão exibe **Sincronizando…** enquanto o serviço consulta o BACEN Focus. A operação atualiza apenas a série USD/BRL.',
            ],
          },
          {
            titulo: 'Resultado: Visão geral',
            imagem: '/university/screenshots/configurador-taxas-moeda-cotacao-futura-sincronizar-modal-1.png',
            paragrafos: [
              'Após a conclusão, os cards e a tabela exibem mediana, mês previsto e data de publicação da rodada importada.',
            ],
          },
          {
            titulo: 'Resultado: Detalhe das projeções',
            imagem: '/university/screenshots/configurador-taxas-moeda-cotacao-futura-sincronizar-modal-2.png',
            paragrafos: [
              'Confira linha a linha os meses carregados e o valor mediano de cada projeção. Um toast confirma quantos meses foram gravados para USD.',
            ],
          },
        ]),
      },
    ],
  },
  {
    num: 10,
    titulo: 'Histórico',
    paragrafos: [
      '**Histórico** registra alterações sensíveis na organização e nos workspaces: Convites, mudanças de permissão e eventos de auditoria.',
    ],
    lista: [
      '**Auditoria**: Quem fez o quê e quando',
      '**Organização**: Eventos da conta contratante',
      '**Workspaces**: Alterações por unidade operacional',
    ],
    callout: {
      tipo: 'dica',
      texto: 'Screenshots e fluxos detalhados desta tela serão adicionados em breve.',
    },
    fluxos: [
      {
        titulo: 'Fluxo 1: Acessar Histórico',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Histórico.'],
        passosVisuais: passosComAcessoPadrao('Histórico', []),
      },
      fluxoEmBreve('Fluxo 2: Consultar auditoria', 'Screenshots e passos detalhados desta tela serão adicionados em breve.'),
    ],
  },
]

export function secaoConfiguradorPorSlug(slug: ConfiguradorManualSlug): DocSecao | undefined {
  const item = CONFIGURADOR_MANUAL_ITENS.find(i => i.pathSeg === slug)
  if (!item) return undefined
  return DOC_CONFIGURADOR_SECOES.find(s => s.num === item.secaoNum)
}
