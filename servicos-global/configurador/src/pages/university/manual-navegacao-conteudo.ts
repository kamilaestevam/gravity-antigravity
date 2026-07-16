import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

/**
 * SSOT dos screenshots: `public/university/screenshots/`
 * Menu superior — prints em `3. Navegação` (Drive) mapeados abaixo.
 */
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_VISAO =
  '/university/screenshots/navegacao-menu-superior-visao-geral.png'
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_HUB =
  '/university/screenshots/navegacao-menu-superior-icone-hub.png'
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_LOCALIZAR =
  '/university/screenshots/navegacao-menu-superior-icone-localizar.png'
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_UNIVERSITY =
  '/university/screenshots/navegacao-menu-superior-icone-university.png'
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_NOTIFICACOES =
  '/university/screenshots/navegacao-menu-superior-icone-notificacoes.png'
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_DICAS =
  '/university/screenshots/navegacao-menu-superior-icone-dicas.png'
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_IDIOMA =
  '/university/screenshots/navegacao-menu-superior-seletor-idioma.png'
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_CONFIGURADOR =
  '/university/screenshots/navegacao-menu-superior-icone-configurador.png'
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_USUARIO =
  '/university/screenshots/navegacao-menu-superior-menu-usuario.png'

export const SCREENSHOT_NAVEGACAO_INTRO_MENU_LATERAL =
  '/university/screenshots/navegacao-intro-exemplo-menu-lateral.png'

export const SCREENSHOT_NAVEGACAO_SHELL_VISAO =
  '/university/screenshots/navegacao-shell-produto-visao-geral.png'
export const SCREENSHOT_NAVEGACAO_SHELL_TROCA_PRODUTO =
  '/university/screenshots/navegacao-shell-troca-produto.png'
export const SCREENSHOT_NAVEGACAO_SHELL_MODULOS =
  '/university/screenshots/navegacao-shell-modulos-produto.png'
export const SCREENSHOT_NAVEGACAO_SHELL_MENU_RECOLHIDO =
  '/university/screenshots/navegacao-shell-menu-recolhido.png'

export const SCREENSHOT_NAVEGACAO_ACESSO_UNIVERSITY_TELA =
  '/university/screenshots/navegacao-university-tela-inicial.png'
export const SCREENSHOT_NAVEGACAO_UNIVERSITY_ONBOARDING =
  '/university/screenshots/navegacao-university-onboarding.png'
export const SCREENSHOT_NAVEGACAO_UNIVERSITY_MANUAIS =
  '/university/screenshots/navegacao-university-manuais-videos.png'

/** Reutiliza prints já publicados no manual Hub / Configurador */
export const SCREENSHOT_NAVEGACAO_HUB_SEM_MENU_LATERAL =
  '/university/screenshots/hub-tela-com-produto-contratado.png'
export const SCREENSHOT_NAVEGACAO_HUB_ESCOLHER_PRODUTO =
  '/university/screenshots/hub-puzzles-ativos-com-produto.png'
export const SCREENSHOT_NAVEGACAO_CONFIGURADOR_MENU_LATERAL =
  '/university/screenshots/configurador-organizacao-tela.png'
export const SCREENSHOT_NAVEGACAO_CONFIGURADOR_MENU_MODULOS =
  '/university/screenshots/configurador-usuarios-tela.png'
export const SCREENSHOT_NAVEGACAO_STORE_SEM_MENU_LATERAL =
  '/university/screenshots/navegacao-store-sem-menu-lateral.png'
export const SCREENSHOT_NAVEGACAO_PRODUTO_COM_MENU_LATERAL =
  '/university/screenshots/navegacao-produto-menu-lateral-exemplo.png'
export const SCREENSHOT_NAVEGACAO_MENU_LATERAL_SETA_NOME_PRODUTO =
  '/university/screenshots/navegacao-menu-lateral-seta-nome-produto.png'
export const SCREENSHOT_NAVEGACAO_MENU_LATERAL_TROCA_PRODUTO_ABERTO =
  '/university/screenshots/navegacao-menu-lateral-troca-produto-aberto.png'
export const SCREENSHOT_NAVEGACAO_MENU_LATERAL_SETA_WORKSPACES =
  '/university/screenshots/navegacao-menu-lateral-seta-workspaces.png'
export const SCREENSHOT_NAVEGACAO_MENU_LATERAL_TROCA_WORKSPACE_ABERTO =
  '/university/screenshots/navegacao-menu-lateral-troca-workspace-aberto.png'
export const SCREENSHOT_NAVEGACAO_ACESSO_CONFIGURADOR_MENU_SUPERIOR =
  '/university/screenshots/navegacao-menu-superior-acesso-configurador.png'
export const SCREENSHOT_NAVEGACAO_ACESSO_CONFIGURADOR_MENU_USUARIO =
  '/university/screenshots/configurador-hub-acesso-configurador.png'
export const SCREENSHOT_NAVEGACAO_ACESSO_CONFIGURADOR_OPCAO_MENU =
  '/university/screenshots/login-convite-passo-01-acesso-atalho.png'

/** Checklist para o dono — nomes dos arquivos PNG esperados em `public/university/screenshots/`. */
export const NAVEGACAO_PRINTS_CHECKLIST = [
  'navegacao-menu-superior-visao-geral.png',
  'navegacao-menu-superior-icone-hub.png',
  'navegacao-intro-exemplo-menu-lateral.png',
  'navegacao-menu-superior-icone-localizar.png',
  'navegacao-menu-superior-icone-university.png',
  'navegacao-menu-superior-icone-notificacoes.png',
  'navegacao-menu-superior-icone-dicas.png',
  'navegacao-menu-superior-seletor-idioma.png',
  'navegacao-menu-superior-icone-configurador.png',
  'navegacao-menu-superior-menu-usuario.png',
  'navegacao-shell-produto-visao-geral.png',
  'navegacao-shell-troca-produto.png',
  'navegacao-shell-modulos-produto.png',
  'navegacao-shell-menu-recolhido.png',
  'navegacao-university-onboarding.png',
  'navegacao-university-tela-inicial.png',
  'navegacao-university-manuais-videos.png',
  'navegacao-menu-superior-acesso-configurador.png',
  'navegacao-produto-menu-lateral-exemplo.png',
  'navegacao-menu-lateral-seta-nome-produto.png',
  'navegacao-menu-lateral-troca-produto-aberto.png',
  'navegacao-menu-lateral-seta-workspaces.png',
  'navegacao-menu-lateral-troca-workspace-aberto.png',
] as const

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export type IconeMenuSuperiorSlug =
  | 'hub'
  | 'localizar'
  | 'university'
  | 'notificacoes'
  | 'tooltip'
  | 'idioma'
  | 'configurador'
  | 'usuario'

export interface IconeMenuSuperiorManual {
  ordem: number
  slug: IconeMenuSuperiorSlug
  titulo: string
  resumo: string
  detalhe?: string
  dica?: string
  /** Miniatura à direita — `public/university/screenshots/`. */
  imagem?: string
}

/** SSOT — textos dos 8 atalhos do menu superior à direita (infográfico §03). */
export const ICONES_MENU_SUPERIOR_MANUAL: IconeMenuSuperiorManual[] = [
  {
    ordem: 1,
    slug: 'hub',
    titulo: 'Hub',
    resumo: 'Volta à tela principal da plataforma a partir de qualquer módulo aberto.',
    detalhe: 'No Hub você escolhe produtos, acessa a Store e retoma o centro da operação. O botão some quando você já está no Hub.',
    imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_HUB,
  },
  {
    ordem: 2,
    slug: 'localizar',
    titulo: 'Localizar',
    resumo: 'Busca e filtra o conteúdo da tela atual — listas, registros e campos visíveis.',
    detalhe: 'Clique na lupa, digite o termo e use Esc ou × para fechar sem sair da página.',
    imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_LOCALIZAR,
  },
  {
    ordem: 3,
    slug: 'university',
    titulo: 'Gravity University',
    resumo: 'Atalho para manuais, trilhas de onboarding e documentação por produto.',
    detalhe: 'Este manual está em Manuais → Navegação dentro da University.',
    imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_UNIVERSITY,
  },
  {
    ordem: 4,
    slug: 'notificacoes',
    titulo: 'Notificações',
    resumo: 'Quadro de avisos, alertas e pendências da organização nos produtos contratados.',
    detalhe: 'O ponto laranja no sininho indica itens não lidos ou novas mensagens.',
    imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_NOTIFICACOES,
  },
  {
    ordem: 5,
    slug: 'tooltip',
    titulo: 'Tooltip',
    resumo: 'Liga ou desliga as dicas que aparecem ao passar o mouse na interface.',
    detalhe: 'Ícone preenchido em azul = dicas ativas; contorno cinza = desativadas.',
    dica: 'Controla os tooltips globalmente — vale para Hub, produtos, Store e Configurador.',
    imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_DICAS,
  },
  {
    ordem: 6,
    slug: 'idioma',
    titulo: 'Idioma',
    resumo: 'Troca a interface entre português, inglês e espanhol com um clique.',
    detalhe: 'A sigla no botão (ex.: BR) mostra o idioma ativo na sessão.',
    imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_IDIOMA,
  },
  {
    ordem: 7,
    slug: 'configurador',
    titulo: 'Atalho ao Configurador',
    resumo: 'Abre a gestão da organização: workspaces, usuários, assinaturas e financeiro.',
    detalhe: 'Caminho direto para configurar a conta sem passar pelo menu do usuário.',
    imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_CONFIGURADOR,
  },
  {
    ordem: 8,
    slug: 'usuario',
    titulo: 'Menu via usuário',
    resumo: 'Perfil, tema claro/escuro, Gravity Store, Configurador e encerrar sessão.',
    detalhe: 'Masters e admins veem também Painel Admin e Trocar organização, quando habilitado.',
    imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_USUARIO,
  },
]

export const DOC_NAVEGACAO_SUBTITULO =
  'Menu superior, menu lateral e Gravity University'

export const DOC_NAVEGACAO_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'junho 2026' },
  { rotulo: 'Produto', valor: 'Plataforma Gravity' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/hub', href: true },
  { rotulo: 'Rota base', valor: '/hub' },
]

export const DOC_NAVEGACAO_SECAO: DocSecao = {
  num: 1,
  titulo: 'Navegação na plataforma Gravity',
  paragrafos: [
    'A Gravity organiza a navegação em **dois tipos de menus**:',
  ],
  topicosImagemLateral: [
    {
      titulo: 'Menu superior',
      texto: 'Faixa fixa no topo, presente em **todas as telas autenticadas**.',
      imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_VISAO,
    },
    {
      titulo: 'Menu lateral',
      texto: 'Coluna à esquerda: para **Produtos Gravity** e no **Configurador**.',
      imagem: SCREENSHOT_NAVEGACAO_INTRO_MENU_LATERAL,
    },
  ],
  fluxos: [
    {
      titulo: 'Menu superior',
      tituloSumario: 'Menu superior',
      paragrafos: [
        'Assim que você **acessa a plataforma pelo Hub** (tela principal após o login), o **menu superior** passa a acompanhar **todas** as telas autenticadas — Hub, produtos, Gravity Store, Configurador e Gravity University. **Não importa** qual módulo você abra: a faixa do topo é sempre a mesma, com os **mesmos ícones e na mesma ordem**.',
      ],
      mostrarInfograficoIconesMenuSuperior: true,
      passosVisuais: [],
    },
    {
      titulo: 'Menu lateral — Produtos Gravity',
      tituloSumario: 'Menu lateral — Produtos Gravity',
      modoCenarios: true,
      paragrafos: [
        'Todos os **Produtos Gravity** — Pedido, Smart Read, BID Frete, BID Câmbio e demais — possuem **menu lateral** para o usuário navegar entre **produtos**, entre **workspaces**, além de acessar **configuração** e **histórico**.',
      ],
      figurasAposParagrafo: [
        {
          indice: 0,
          imagem: SCREENSHOT_NAVEGACAO_PRODUTO_COM_MENU_LATERAL,
          legenda: 'Menu lateral em um Produto Gravity',
        },
      ],
      passosVisuais: [],
    },
    {
      titulo: 'Menu lateral — Acesso rápido troca de Produtos Gravity',
      tituloSumario: 'Menu lateral — Acesso rápido troca de Produtos Gravity',
      paragrafos: [
        'No **topo do menu lateral** (logo do produto + seta), o **seletor de produtos** permite trocar de **Produto Gravity** sem voltar ao Hub — desde que o workspace atual tenha **mais de um produto** habilitado para você.',
      ],
      calloutAposParagrafo: {
        indice: 0,
        callout: {
          tipo: 'dica',
          texto: 'A lista mostra apenas produtos **contratados pela organização**, **habilitados no workspace** e **liberados para o seu usuário**. Com mais de quatro itens, aparece busca *_Buscar produto…_*. O produto aberto fica marcado com ✓.',
        },
      },
      passosVisuais: renumerarPassos([
        {
          titulo: 'Onde clicar para trocar de produto',
          paragrafos: [
            'Clique no **nome do produto** (ex.: **Pedido by Gravity**) ou na **seta** ao lado do logo, no topo do menu lateral.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_MENU_LATERAL_SETA_NOME_PRODUTO,
          imagemAbaixoTexto: true,
          calloutAposImagem: {
            tipo: 'dica',
            texto: 'Trocar aqui **mantém o workspace** selecionado e abre o outro produto no mesmo contexto. Para escolher um produto pela primeira vez na sessão, você também pode usar o **Hub**.',
          },
        },
        {
          titulo: 'Lista de Produtos Gravity',
          paragrafos: [
            'O painel lista os **Produtos Gravity** disponíveis no workspace. O produto aberto fica marcado com **✓**; escolha outro para trocar sem voltar ao Hub.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_MENU_LATERAL_TROCA_PRODUTO_ABERTO,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Menu lateral — Acesso rápido troca de workspaces',
      tituloSumario: 'Menu lateral — Acesso rápido troca de workspaces',
      paragrafos: [
        'Logo **abaixo do logo do produto**, o botão com o **nome do workspace** abre o **seletor de workspaces** — filiais ou unidades em que você opera dentro da organização.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Onde clicar para trocar de workspace',
          paragrafos: [
            'Clique no **nome do workspace** ativo (avatar + nome + seta), logo **abaixo** do seletor de produto no menu lateral.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_MENU_LATERAL_SETA_WORKSPACES,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Lista de workspaces',
          paragrafos: [
            'O painel lista os **workspaces** disponíveis para você. No modo **único** (padrão), ao escolher outro workspace a tela **recarrega** no novo contexto. No modo **múltiplo** (ex.: **Pedido**), use as caixas de seleção e os atalhos *_Selecionar tudo_* / *_Desmarcar tudo_*. Com mais de quatro itens, use *_Buscar workspace…_* no topo.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_MENU_LATERAL_TROCA_WORKSPACE_ABERTO,
          imagemAbaixoTexto: true,
          calloutAposImagem: [
            {
              tipo: 'destaque',
              texto: 'No seletor, você pode marcar **um workspace**, **vários** ou **todos de uma vez** (*_Selecionar tudo_*). A partir da confirmação, **listas, dashboards e indicadores** da tela passam a refletir **somente** os workspaces escolhidos.',
            },
            {
              tipo: 'dica',
              texto: 'No rodapé do painel: **+ Criar workspace** e *_Gerenciar workspace_* levam ao Configurador para cadastrar ou editar filiais.',
            },
          ],
        },
      ]),
    },
    {
      titulo: 'Menu lateral — Configuração',
      tituloSumario: 'Menu lateral — Configuração',
      paragrafos: [
        'O **Configurador da Plataforma** tem **menu lateral próprio**. Ele organiza a **gestão e configuração da conta**: Organização, Workspaces, Usuários, Fornecedores, Assinaturas, Financeiro e demais abas.',
      ],
      callout: {
        tipo: 'dica',
        texto: 'O menu lateral do Configurador **permanece fixo** ao trocar de **aba** — só mudam o item destacado e o conteúdo à direita.',
      },
      calloutAposPassos: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Caminho 1 — ícone no menu superior',
          paragrafos: [
            'Em **qualquer tela** autenticada (Hub, produto, Store ou University), clique no **ícone Configurador** (engrenagem) na faixa do **menu superior**, à direita.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_ACESSO_CONFIGURADOR_MENU_SUPERIOR,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Caminho 2 — abrir o menu do usuário',
          paragrafos: [
            'Alternativa: clique no **ícone do usuário** no canto superior direito, como indicado pela seta na imagem.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_ACESSO_CONFIGURADOR_MENU_USUARIO,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Escolher Configurador no menu',
          paragrafos: [
            'No menu que abrir, selecione **Configurador**. A tela de gestão da organização carrega com o **menu lateral** à esquerda.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_ACESSO_CONFIGURADOR_OPCAO_MENU,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Menu lateral de gestão',
          paragrafos: [
            'No **Configurador**, o menu lateral concentra **Organização**, **Workspaces**, **Usuários**, **Fornecedores**, **Assinaturas**, **Financeiro** e demais abas de configuração.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_CONFIGURADOR_MENU_LATERAL,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Como acessar a Gravity University',
      tituloSumario: 'Como acessar a Gravity University',
      paragrafos: [
        'A **Gravity University** fica a um clique no **menu superior** — ícone de **chapéu de formatura**, terceiro atalho à direita (após **Hub** e **Localizar**). Vale em **qualquer tela** autenticada: Hub, produtos, Store ou Configurador.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Ícone Gravity University no menu superior',
          paragrafos: [
            'Clique no ícone **Gravity University** (chapéu de formatura) na faixa do **menu superior**, à direita.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_UNIVERSITY,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Tela da Gravity University',
          paragrafos: [
            'A **sidebar esquerda** abre com **Onboarding**, **Manuais**, **Gravity Partners** e **Minha Jornada**. Este manual está em **Manuais → Navegação**.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_ACESSO_UNIVERSITY_TELA,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Navegação na Gravity University',
      tituloSumario: 'Navegação na Gravity University',
      modoCenarios: true,
      cenariosLadoALado: true,
      cenariosImagensAlinhadas: true,
      paragrafos: [
        'Na **sidebar**, os principais blocos de conteúdo são:',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Onboarding',
          paragrafos: [
            'A seção **Onboarding** concentra a trilha de **primeiros passos** na plataforma.',
          ],
          figurasAposParagrafo: [
            {
              indice: 0,
              imagem: SCREENSHOT_NAVEGACAO_UNIVERSITY_ONBOARDING,
              legenda: 'Sidebar — Onboarding',
              larguraMaxima: 240,
            },
          ],
        },
        {
          titulo: 'Manuais',
          paragrafos: [
            'Em **Manuais** ficam **Login**, **Navegação**, Admin restrito e o submenu **Configurador** (Hub, Store, Pedido, Smart Docs, BID Frete, BID Câmbio, Processo…).',
          ],
          figurasAposParagrafo: [
            {
              indice: 0,
              imagem: SCREENSHOT_NAVEGACAO_UNIVERSITY_MANUAIS,
              legenda: 'Sidebar — Manuais',
              larguraMaxima: 240,
            },
          ],
        },
      ]),
    },
  ],
}
