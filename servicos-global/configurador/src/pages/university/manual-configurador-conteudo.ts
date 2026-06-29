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
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
  callouts?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }[]
  tooltipsKpi?: DocTooltipKpi[]
  galeriaTelas?: { legenda: string; imagem: string }[]
  linkCapitulo?: { texto: string; href: string }
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
  callout?: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
}

const DOCS_BASE = '/university-gravity/docs/configurador'

export const CONFIGURADOR_MANUAL_ITENS: ConfiguradorManualItem[] = [
  {
    pathSeg: 'visao-geral',
    label: 'Visão geral',
    secaoNum: 1,
    rotaApp: '/configurador',
    subtitulo: 'Mapa do Configurador: organização, workspaces, usuários, assinaturas e demais áreas de gestão da conta Gravity.',
  },
  {
    pathSeg: 'organizacao',
    label: 'Organização',
    secaoNum: 2,
    rotaApp: '/configurador/organizacao',
    subtitulo: 'A empresa que contrata o Gravity — criada no signup e onboarding, com dados cadastrais e identidade da conta.',
  },
  {
    pathSeg: 'workspaces',
    label: 'Workspaces',
    secaoNum: 3,
    rotaApp: '/configurador/workspaces',
    subtitulo: 'Filiais, empresas do grupo ou clientes do despachante: cada workspace isola dados e produtos dentro da organização.',
  },
  {
    pathSeg: 'usuarios',
    label: 'Usuários',
    secaoNum: 4,
    rotaApp: '/configurador/usuarios',
    subtitulo: 'Convites, patentes (Master, Standard, Fornecedor) e permissões por área do Configurador.',
  },
  {
    pathSeg: 'fornecedores',
    label: 'Fornecedores',
    secaoNum: 5,
    rotaApp: '/configurador/fornecedores',
    subtitulo: 'Cadastro e gestão de fornecedores vinculados à organização e aos workspaces.',
  },
  {
    pathSeg: 'assinaturas',
    label: 'Assinaturas',
    secaoNum: 6,
    rotaApp: '/configurador/assinaturas',
    subtitulo: 'Produtos contratados, planos e ciclo de cobrança da organização.',
  },
  {
    pathSeg: 'financeiro',
    label: 'Financeiro',
    secaoNum: 7,
    rotaApp: '/configurador/financeiro',
    subtitulo: 'Faturas, métodos de pagamento e histórico financeiro da conta.',
  },
  {
    pathSeg: 'api-cockpit',
    label: 'API Cockpit',
    secaoNum: 8,
    rotaApp: '/configurador/api-cockpit',
    subtitulo: 'Tokens de API, webhooks e integrações com ERPs e sistemas externos.',
  },
  {
    pathSeg: 'taxas-moeda',
    label: 'Taxas e moeda',
    secaoNum: 9,
    rotaApp: '/configurador/taxas-moeda',
    subtitulo: 'Câmbio, moedas operacionais e taxas usadas nos produtos da organização.',
  },
  {
    pathSeg: 'historico',
    label: 'Histórico',
    secaoNum: 10,
    rotaApp: '/configurador/historico-organizacao',
    subtitulo: 'Auditoria de alterações sensíveis na organização e nos workspaces.',
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
      'Total cadastradas — todas as filiais e clientes',
      'Adicionadas hoje — workspaces criados no dia',
    ],
  },
  {
    card: 'Workspaces Ativos',
    tituloTooltip: 'Atividade',
    descricao: 'Comparativo entre workspaces em operação e suspensos.',
    detalhes: [
      'Ativas — acesso liberado para usuários vinculados',
      'Suspensas — bloqueadas até reativação',
      'Taxa de atividade — percentual de workspaces ativos',
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

const TAXAS_MOEDA_TOOLTIPS_KPI: DocTooltipKpi[] = [
  {
    card: 'USD / BRL',
    tituloTooltip: 'DÓLAR AMERICANO · COTAÇÃO ATUAL',
    descricao: 'Última PTAX armazenada para o dólar americano.',
    detalhes: [
      'Compra e Venda — taxas do boletim BCB/PTAX',
      'Data e hora — referência do boletim sincronizado',
      'Fonte — BCB/PTAX',
    ],
  },
  {
    card: 'EUR / BRL',
    tituloTooltip: 'EURO · COTAÇÃO ATUAL',
    descricao: 'Última PTAX armazenada para o euro.',
    detalhes: [
      'Compra e Venda — taxas do boletim BCB/PTAX',
      'Data e hora — referência do boletim sincronizado',
      'Fonte — BCB/PTAX',
    ],
  },
  {
    card: 'Moedas ativas',
    tituloTooltip: 'SITUAÇÃO POR MOEDA',
    descricao: 'Quantas das sete moedas suportadas já possuem cotação armazenada.',
    detalhes: [
      'USD, EUR, GBP, CHF, CNY, JPY, CAD — lista completa no tooltip',
      'Sem dado — moeda ainda não sincronizada nesta organização',
      'Total ativas — contagem usada no valor do card',
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
    titulo: `Tooltip — ${tooltip.card}`,
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
        titulo: 'No Hub — menu do usuário',
        imagem: SCREENSHOT_HUB_ACESSO_CONFIGURADOR,
        paragrafos: [
          'De qualquer lugar da plataforma — Hub ou produto Gravity — clique no ícone do usuário no canto superior direito, como indicado pela seta na imagem.',
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
    { rotulo: 'Componente', valor: 'WorkspaceLayout' },
  ]
}

export const DOC_CONFIGURADOR_SECOES: DocSecao[] = [
  {
    num: 1,
    titulo: 'Visão geral do Configurador',
    paragrafos: [
      'O Configurador é o painel de gestão da sua conta Gravity. A partir dele você administra a organização (empresa contratante), os workspaces (filiais ou clientes), usuários, assinaturas de produtos e integrações.',
      'Use o menu abaixo para ir direto ao capítulo de cada área. Cada página deste manual descreve uma tela do Configurador com passos visuais e screenshots.',
    ],
    lista: [
      `– {{link:${DOCS_BASE}/organizacao|Organização}}: dados da empresa contratante — nasce no signup e onboarding`,
      `– {{link:${DOCS_BASE}/workspaces|Workspaces}}: matriz, filiais ou clientes do despachante`,
      `– {{link:${DOCS_BASE}/usuarios|Usuários}}: convites, patentes e permissões`,
      `– {{link:${DOCS_BASE}/fornecedores|Fornecedores}}: cadastro de parceiros comerciais`,
      `– {{link:${DOCS_BASE}/assinaturas|Assinaturas}}: produtos e planos contratados`,
      `– {{link:${DOCS_BASE}/financeiro|Financeiro}}: faturas e pagamentos`,
      `– {{link:${DOCS_BASE}/api-cockpit|API Cockpit}}: tokens, webhooks e ERP`,
      `– {{link:${DOCS_BASE}/taxas-moeda|Taxas e moeda}}: câmbio operacional`,
      `– {{link:${DOCS_BASE}/historico|Histórico}}: auditoria da organização`,
    ],
  },
  {
    num: 2,
    titulo: 'Organização',
    mostrarInfograficoOrganizacao: true,
    paragrafos: [
      'A Organização é a empresa que contrata o Gravity — o tenant principal da conta.',
      'No infográfico abaixo, veja de onde ela nasce. Os dados cadastrais que aparecem em Configurador → Organização vêm desse fluxo — depois do onboarding, você só revisa e mantém a identidade legal da conta.',
    ],
    origemDados: {
      paragrafos: [
        'As telas abaixo são o passo Onboarding do fluxo acima — é aqui que nome e CNPJ são informados pela primeira vez e viram a organização na plataforma.',
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
        titulo: 'Fluxo 1 — acessar Organização',
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
            'Nome da empresa e CNPJ são definidos no onboarding e ficam bloqueados (ícone de cadeado). Somente dados meramente informativos podem ser alterados aqui: estado, cidade, segmento e tipo de empresa. Clique em Salvar para confirmar as mudanças.',
          ],
        ),
      },
    ],
  },
  {
    num: 3,
    titulo: 'Workspaces',
    mostrarInfograficoOrganizacaoWorkspaces: true,
    paragrafos: [
      'Uma organização pode ter um ou vários workspaces. Cada workspace representa uma unidade operacional: filial do importador/exportador, empresa do grupo ou cliente atendido por um despachante.',
      'No Configurador → Workspaces você cria, edita, ativa ou suspende workspaces. Usuários Standard e Fornecedor só enxergam os workspaces aos quais foram vinculados.',
    ],
    fluxos: [
      {
        titulo: 'Fluxo 1 — acessar Workspaces',
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
              'Passe o mouse no ícone (i) de cada card para abrir o tooltip — veja abaixo o que cada indicador mostra:',
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
        titulo: 'Fluxo 2 — criar workspace',
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
        titulo: 'Fluxo 3 — editar workspace',
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
              'No modal, preencha o CNPJ da unidade operacional com atenção: ele identifica a empresa que concentra os registros do workspace na plataforma.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'O CNPJ do workspace é muito importante. Ele representa a empresa principal daquela unidade — é sobre ela que serão emitidos pedidos, processos, cotações de frete, DUIMP e demais operações COMEX vinculadas ao workspace.',
            },
          },
        ]),
      },
      {
        titulo: 'Fluxo 4 — ativar e suspender workspace',
        tituloSumario: 'Ativar e suspender workspace',
        paragrafos: [
          'Controle o acesso operacional de cada workspace sem apagá-lo. Ativar libera o ambiente para usuários vinculados; suspender bloqueia temporariamente.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Ativar um workspace suspenso',
            imagem: '/university/screenshots/configurador-workspaces-ativar-seta.png',
            paragrafos: [
              'Na listagem, localize o workspace com status Suspenso. No menu de ações da linha, clique no ícone de ativar — como indicado pela seta na imagem.',
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
        titulo: 'Fluxo 5 — excluir workspace',
        tituloSumario: 'Excluir workspace',
        paragrafos: [
          'Remova permanentemente um workspace que não será mais utilizado. A operação é irreversível — use apenas quando não houver dados operacionais a preservar.',
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
              'O sistema pede confirmação antes de apagar. Revise o nome do workspace — a exclusão remove o acesso de todos os usuários vinculados.',
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
    paragrafos: [
      'Em Configurador → Usuários você convida pessoas para a organização, define o tipo (Master, Standard ou Fornecedor) e controla permissões e workspaces de acesso.',
      'Apenas usuários Master podem convidar ou editar outros usuários. Standard e Fornecedor enxergam somente a si mesmos nesta lista.',
    ],
    fluxos: [
      {
        titulo: 'Fluxo 1 — acessar Usuários',
        tituloSumario: 'Acessar Usuários',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Usuários.'],
        passosVisuais: passosComAcessoPadrao(
          'Usuários',
          [{
            titulo: 'Visão geral da tela',
            imagem: '/university/screenshots/configurador-usuarios-tela.png',
            paragrafos: [
              'No topo, quatro cards resumem a situação dos usuários da organização. Passe o mouse no ícone (i) de cada card para abrir o tooltip — veja o que cada um significa abaixo.',
              'A tabela lista nome, e-mail, tipo, status e workspaces habilitados. Use a busca para localizar alguém rapidamente.',
            ],
            tooltipsKpi: [
              {
                card: 'Total de Usuários',
                tituloTooltip: 'Visão geral',
                descricao: 'Quantidade de pessoas cadastradas ou convidadas na organização.',
                detalhes: [
                  'Total de registros — ativos, inativos e convidados pendentes',
                  'Novos hoje — usuários adicionados no dia',
                ],
              },
              {
                card: 'Acessos Concedidos',
                tituloTooltip: 'Vínculos de acesso',
                descricao: 'Soma de todas as ligações usuário ↔ workspace na organização.',
                detalhes: [
                  'Total de acessos — cada workspace marcado para um usuário conta um vínculo',
                  'Master não precisa de vínculo explícito — acessa todos automaticamente',
                ],
              },
              {
                card: 'Média de Acessos Concedidos',
                tituloTooltip: 'Distribuição média',
                descricao: 'Média de workspaces por usuário ativo na organização.',
                detalhes: [
                  'Média geral — ajuda a identificar contas com pouco ou muito alcance',
                ],
              },
              {
                card: 'Total Workspaces',
                tituloTooltip: 'Densidade e distribuição',
                descricao: 'Gráfico comparando usuários com e sem acesso a algum workspace.',
                detalhes: [
                  'Com acesso — pelo menos um workspace habilitado (ou tipo Master)',
                  'Sem acesso — ainda sem workspace vinculado',
                  'Tooltip repete totais de usuários, workspaces e média por pessoa',
                ],
              },
            ],
          }],
          '/university/screenshots/configurador-usuarios-seta-menu.png',
          true,
          ['No menu lateral do Configurador, clique em Usuários — como indicado pela seta na imagem.'],
          undefined,
          '/university/screenshots/configurador-usuarios-acesso-atalho.png',
        ),
      },
      {
        titulo: 'Fluxo 2 — convidar usuário',
        tituloSumario: 'Convidar usuário',
        paragrafos: [
          'Envie um convite por e-mail para incluir Master, Standard ou Fornecedor na organização. O convidado completa o cadastro pelo link recebido.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar o convite',
            imagem: '/university/screenshots/configurador-usuarios-convidar-seta.png',
            paragrafos: [
              'Na tela de Usuários, clique em "Convidar usuário" no canto superior direito — como indicado pela seta na imagem. O modal de convite abre sobre a listagem.',
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
        titulo: 'Fluxo 3 — permissões do usuário',
        tituloSumario: 'Permissões Usuários',
        paragrafos: [
          'Defina o que cada pessoa pode fazer nas áreas do Configurador. No convite ou na edição, marque somente o necessário para o papel da pessoa.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Marcar permissões no convite',
            imagem: '/university/screenshots/configurador-usuarios-convite-permissoes.png',
            paragrafos: [
              'No modal de convite, role até a seção de permissões — como indicado pela seta na imagem. Marque as áreas do Configurador que o convidado poderá acessar.',
            ],
          },
          {
            titulo: 'Ajustar em usuário existente',
            paragrafos: [
              'Para quem já está na organização, clique no ícone de chave na linha do usuário ou abra Editar e vá à aba Permissões. As mudanças valem na próxima sessão do convidado.',
            ],
            callout: {
              tipo: 'seguranca',
              texto: 'Só usuários Master podem alterar permissões de outras pessoas. Standard e Fornecedor não editam a lista de usuários.',
            },
          },
        ]),
      },
      {
        titulo: 'Fluxo 4 — workspaces do usuário',
        tituloSumario: 'Workspaces do Usuário',
        paragrafos: [
          'Vincule Standard e Fornecedor aos workspaces em que poderão operar. Master acessa todos automaticamente, sem marcação individual.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Selecionar workspaces no convite',
            imagem: '/university/screenshots/configurador-usuarios-convite-workspaces.png',
            paragrafos: [
              'No modal de convite, marque os workspaces habilitados para o convidado — filial, empresa do grupo ou cliente de despachante.',
            ],
          },
          {
            titulo: 'Opção todos os workspaces',
            imagem: '/university/screenshots/configurador-usuarios-convite-workspaces-todos.png',
            paragrafos: [
              'Para Standard, você pode habilitar todos os workspaces de uma vez quando a pessoa precisa operar em toda a organização. Revise antes de confirmar — o acesso fica amplo.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'Master não precisa de vínculo explícito: a coluna Workspaces habilitados exibe "Todos os workspaces" automaticamente.',
            },
          },
          {
            titulo: 'Alterar vínculos depois',
            paragrafos: [
              'Em usuário já cadastrado, abra Editar e vá à aba Workspaces Vinculados para incluir ou remover unidades sem reenviar convite.',
            ],
          },
        ]),
      },
      {
        titulo: 'Fluxo 5 — desativar e ativar usuário',
        tituloSumario: 'Desativar e Ativar Usuário',
        paragrafos: [
          'Suspenda quem não deve mais entrar na plataforma, reative quando necessário ou gerencie convites ainda pendentes.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Desativar um usuário ativo',
            imagem: '/university/screenshots/configurador-usuarios-tela.png',
            paragrafos: [
              'Na linha de um usuário com status Ativo, clique no ícone de pausa. O acesso é suspenso imediatamente — o status muda para Inativo e novos logins são bloqueados.',
            ],
          },
          {
            titulo: 'Reativar um usuário inativo',
            paragrafos: [
              'Na mesma linha, com status Inativo, clique no ícone de play para liberar o acesso novamente. O histórico e os vínculos anteriores são preservados.',
            ],
          },
          {
            titulo: 'Convite pendente',
            paragrafos: [
              'Usuários com status Convidado ainda não concluíram o cadastro. Use Reenviar Convite (ícone de seta circular) para mandar um novo e-mail ou cancele o convite se o acesso não for mais necessário.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Cancelar convite remove a pessoa da lista. Desativar um usuário Ativo preserva o histórico — apenas bloqueia novos logins até reativação.',
            },
          },
        ]),
      },
    ],
  },
  {
    num: 5,
    titulo: 'Fornecedores',
    paragrafos: [
      'A área Fornecedores concentra o cadastro de parceiros comerciais que participam de cotações e processos da organização.',
    ],
    fluxos: [
      {
        titulo: 'Fluxo 1 — acessar Fornecedores',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Fornecedores.'],
        passosVisuais: passosComAcessoPadrao('Fornecedores', []),
      },
      fluxoEmBreve('Fluxo 2 — cadastrar fornecedor', 'Screenshots e passos detalhados desta tela serão adicionados em breve.'),
    ],
  },
  {
    num: 6,
    titulo: 'Assinaturas',
    paragrafos: [
      'Assinaturas reúne os produtos Gravity contratados pela organização, planos vigentes e opções de upgrade ou cancelamento.',
    ],
    fluxos: [
      {
        titulo: 'Fluxo 1 — acessar Assinaturas',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Assinaturas.'],
        passosVisuais: passosComAcessoPadrao('Assinaturas', []),
      },
      fluxoEmBreve('Fluxo 2 — gerenciar assinaturas', 'Screenshots e passos detalhados desta tela serão adicionados em breve.'),
    ],
  },
  {
    num: 7,
    titulo: 'Financeiro',
    paragrafos: [
      'O módulo Financeiro exibe faturas emitidas, status de pagamento e métodos cadastrados para cobrança da organização.',
    ],
    fluxos: [
      {
        titulo: 'Fluxo 1 — acessar Financeiro',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Financeiro.'],
        passosVisuais: passosComAcessoPadrao('Financeiro', []),
      },
      fluxoEmBreve('Fluxo 2 — consultar faturas', 'Screenshots e passos detalhados desta tela serão adicionados em breve.'),
    ],
  },
  {
    num: 8,
    titulo: 'API Cockpit',
    paragrafos: [
      'O API Cockpit centraliza tokens de integração, playground de requisições, webhooks e conectores com ERPs.',
    ],
    fluxos: [
      {
        titulo: 'Fluxo 1 — acessar API Cockpit',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar ao API Cockpit.'],
        passosVisuais: passosComAcessoPadrao('API Cockpit', []),
      },
      fluxoEmBreve('Fluxo 2 — configurar integrações', 'Screenshots e passos detalhados desta tela serão adicionados em breve.'),
    ],
  },
  {
    num: 9,
    titulo: 'Taxas e moeda',
    paragrafos: [
      'Taxas e moeda concentra o câmbio operacional da organização em duas abas: **Cotação Atual** (PTAX do Banco Central) e **Cotação Futura** (projeções do BACEN Focus).',
      'Os produtos Gravity consomem essas taxas para conversões, simulações e documentos fiscais. A sincronização PTAX roda automaticamente **4 vezes por dia** em dias úteis (10h03 / 11h03 / 12h03 / 13h03 BRT); o Focus é atualizado **semanalmente** (terça 22h BRT).',
      'Somente usuários **Master** acessam esta área. Use **Sincronizar PTAX** ou **Sincronizar Focus** para forçar atualização fora do cron, e **Agendamento** para ligar ou desligar a sincronização automática por aba.',
    ],
    fluxos: [
      {
        titulo: 'Fluxo 1 — acessar Taxas e moeda',
        tituloSumario: 'Acessar Taxas e moeda',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Taxas e moeda.'],
        passosVisuais: passosComAcessoPadrao(
          'Taxas e moeda',
          [
            {
              titulo: 'Tela principal — Cotação Atual',
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
            'No menu lateral do Configurador, clique em Taxas e moeda — como indicado pela seta na imagem. A tela abre na aba Cotação Atual.',
            'Alterne para Cotação Futura quando precisar consultar projeções do BACEN Focus. Nos passos seguintes, a tabela principal e cada tooltip dos cards são explicados separadamente.',
          ],
        ),
      },
      {
        titulo: 'Fluxo 2 — sincronizar PTAX',
        tituloSumario: 'Sincronizar PTAX',
        paragrafos: [
          'Dispare manualmente a busca dos boletins PTAX no BCB. Útil fora dos horários do cron automático ou para recuperar moeda que falhou na última rodada.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar sincronização',
            imagem: '/university/screenshots/configurador-taxas-moeda-sincronizar-seta.png',
            paragrafos: [
              'Na aba Cotação Atual, clique em **Sincronizar PTAX** — como indicado pela seta na imagem. O botão fica ao lado de Agendamento, no canto superior direito.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'O cron da Gravity já sincroniza PTAX 4× por dia em dias úteis. O botão manual não substitui o agendamento — apenas força uma rodada imediata.',
            },
          },
          {
            titulo: 'Sincronização em andamento',
            imagem: '/university/screenshots/configurador-taxas-moeda-sincronizando.png',
            paragrafos: [
              'Enquanto o serviço consulta o BCB, o botão exibe **Sincronizando…** com ícone girando. Aguarde a conclusão — não feche a aba.',
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
        titulo: 'Fluxo 3 — agendamento automático',
        tituloSumario: 'Agendamento automático',
        paragrafos: [
          'Configure se a sincronização automática fica ativa para a aba em que você está — PTAX na Cotação Atual, Focus na Cotação Futura.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Abrir o modal de agendamento',
            imagem: '/university/screenshots/configurador-taxas-moeda-agendamento-seta.png',
            paragrafos: [
              'Clique no botão **Agendamento** — como indicado pela seta. A pill **Ativo** (verde) ou **Inativo** (cinza) indica o estado atual da aba aberta.',
            ],
          },
          {
            titulo: 'Modal — configuração (aba Geral)',
            imagem: '/university/screenshots/configurador-taxas-moeda-agendamento-modal-1.png',
            paragrafos: [
              'Em **Agendamento automático**, escolha Ativado ou Desativado. Para PTAX, a frequência padrão é **Diário (4 boletins PTAX)** com horários fixos do BCB.',
              'Para Focus, use frequência **Semanal** — o cron padrão da Gravity é terça-feira às 22h BRT.',
            ],
          },
          {
            titulo: 'Modal — horários e alertas',
            imagem: '/university/screenshots/configurador-taxas-moeda-agendamento-modal-2.png',
            paragrafos: [
              'Na aba Horários, confira os slots PTAX (10h03 / 11h03 / 12h03 / 13h03) ou o horário semanal do Focus. A aba Alertas permite cadastrar e-mails para notificação de falha.',
              'Clique em **Salvar** para gravar. O badge do botão Agendamento na tela principal muda para Ativo quando a configuração está ligada.',
            ],
            callout: {
              tipo: 'dica',
              texto: 'PTAX e Focus têm agendamentos independentes — configure cada um na aba correspondente antes de abrir o modal.',
            },
          },
        ]),
      },
      {
        titulo: 'Fluxo 4 — cotação futura (BACEN Focus)',
        tituloSumario: 'Cotação Futura',
        paragrafos: [
          'A segunda aba exibe projeções de mercado do BACEN Focus para USD/BRL — **não são cotações negociadas**. Use para planejamento; o erro de previsão cresce com o horizonte.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Abrir a aba Cotação Futura',
            imagem: '/university/screenshots/configurador-taxas-moeda-cotacao-futura.png',
            paragrafos: [
              'Clique na aba **Cotação Futura** — como indicado na imagem. Os cards do topo mudam para USD próximo mês, USD horizonte e Publicação Focus.',
              'A tabela lista até quatro meses de projeção por padrão, com moeda, mês previsto, valor mediano, data de publicação e fonte BACEN/Focus.',
            ],
            callout: {
              tipo: 'aviso',
              texto: 'Projeções do Focus são indicativas. Não use como taxa de fechamento de contrato ou documento fiscal — para isso, utilize a PTAX da aba Cotação Atual.',
            },
          },
        ]),
      },
      {
        titulo: 'Fluxo 5 — sincronizar Focus',
        tituloSumario: 'Sincronizar Focus',
        paragrafos: [
          'Busque manualmente a última rodada de expectativas de mercado publicada pelo BACEN. O cron semanal já faz isso automaticamente quando o agendamento está ativo.',
        ],
        passosVisuais: renumerarPassos([
          {
            titulo: 'Iniciar sincronização Focus',
            imagem: '/university/screenshots/configurador-taxas-moeda-cotacao-futura-sincronizar-seta.png',
            paragrafos: [
              'Com a aba Cotação Futura ativa, clique em **Sincronizar Focus** — como indicado pela seta na imagem.',
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
            titulo: 'Resultado — visão geral',
            imagem: '/university/screenshots/configurador-taxas-moeda-cotacao-futura-sincronizar-modal-1.png',
            paragrafos: [
              'Após a conclusão, os cards e a tabela exibem mediana, mês previsto e data de publicação da rodada importada.',
            ],
          },
          {
            titulo: 'Resultado — detalhe das projeções',
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
      'O Histórico registra alterações sensíveis na organização e nos workspaces — convites, mudanças de permissão e eventos de auditoria.',
    ],
    fluxos: [
      {
        titulo: 'Fluxo 1 — acessar Histórico',
        paragrafos: ['Siga os passos abaixo para abrir o Configurador e chegar à tela de Histórico.'],
        passosVisuais: passosComAcessoPadrao('Histórico', []),
      },
      fluxoEmBreve('Fluxo 2 — consultar auditoria', 'Screenshots e passos detalhados desta tela serão adicionados em breve.'),
    ],
  },
]

export function secaoConfiguradorPorSlug(slug: ConfiguradorManualSlug): DocSecao | undefined {
  const item = CONFIGURADOR_MANUAL_ITENS.find(i => i.pathSeg === slug)
  if (!item) return undefined
  return DOC_CONFIGURADOR_SECOES.find(s => s.num === item.secaoNum)
}
