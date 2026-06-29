import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

/**
 * SSOT dos screenshots: `public/university/screenshots/`
 * Arquivos abaixo ainda não existem — preencher `imagem` nos passos quando o dono enviar os prints.
 */
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_VISAO =
  '/university/screenshots/navegacao-menu-superior-visao-geral.png'
export const SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_ICONES_DIREITA =
  '/university/screenshots/navegacao-menu-superior-icones-direita.png'
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

export const SCREENSHOT_NAVEGACAO_SHELL_VISAO =
  '/university/screenshots/navegacao-shell-produto-visao-geral.png'
export const SCREENSHOT_NAVEGACAO_SHELL_TROCA_PRODUTO =
  '/university/screenshots/navegacao-shell-troca-produto.png'
export const SCREENSHOT_NAVEGACAO_SHELL_MODULOS =
  '/university/screenshots/navegacao-shell-modulos-produto.png'
export const SCREENSHOT_NAVEGACAO_SHELL_MENU_RECOLHIDO =
  '/university/screenshots/navegacao-shell-menu-recolhido.png'

export const SCREENSHOT_NAVEGACAO_UNIVERSITY_SIDEBAR =
  '/university/screenshots/navegacao-university-sidebar-completa.png'
export const SCREENSHOT_NAVEGACAO_UNIVERSITY_MANUAIS =
  '/university/screenshots/navegacao-university-manuais-videos.png'
export const SCREENSHOT_NAVEGACAO_UNIVERSITY_CONFIGURADOR_SUB =
  '/university/screenshots/navegacao-university-submenu-configurador.png'
export const SCREENSHOT_NAVEGACAO_UNIVERSITY_ACADEMY_DOCS =
  '/university/screenshots/navegacao-university-academy-vs-docs.png'

export const SCREENSHOT_NAVEGACAO_ATALHOS_MAPA =
  '/university/screenshots/navegacao-atalhos-mapa-global.png'
export const SCREENSHOT_NAVEGACAO_ATALHOS_HUB =
  '/university/screenshots/navegacao-atalhos-voltar-hub.png'
export const SCREENSHOT_NAVEGACAO_ATALHOS_STORE_CONFIG =
  '/university/screenshots/navegacao-atalhos-store-configurador.png'

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

/** Checklist para o dono — nomes dos arquivos PNG esperados em `public/university/screenshots/`. */
export const NAVEGACAO_PRINTS_CHECKLIST = [
  'navegacao-menu-superior-visao-geral.png',
  'navegacao-menu-superior-icones-direita.png',
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
  'navegacao-university-sidebar-completa.png',
  'navegacao-university-manuais-videos.png',
  'navegacao-university-submenu-configurador.png',
  'navegacao-university-academy-vs-docs.png',
  'navegacao-atalhos-mapa-global.png',
  'navegacao-atalhos-voltar-hub.png',
  'navegacao-atalhos-store-configurador.png',
  'navegacao-store-sem-menu-lateral.png',
  'navegacao-produto-menu-lateral-exemplo.png',
] as const

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const DOC_NAVEGACAO_SUBTITULO =
  'Menu superior, menu lateral e atalhos globais'

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
    'Este manual explica **como se orientar em qualquer tela** da Gravity: o **menu superior** (Hub, produtos, Store, University), o **menu lateral** (só após abrir um produto ou no Configurador), a **sidebar da Gravity University** e os **atalhos globais** entre áreas.',
    'Use o **sumário** abaixo para ir direto a cada tema. O capítulo **Menu lateral** mostra em quais telas ele aparece — e em quais **não** aparece.',
  ],
  fluxos: [
    {
      titulo: 'Menu superior global',
      tituloSumario: 'Menu superior',
      paragrafos: [
        'Assim que você **acessa a plataforma pelo Hub** (tela principal após o login), o **menu superior** passa a acompanhar **todas** as telas autenticadas — Hub, produtos, Gravity Store, Configurador e Gravity University. **Não importa** qual módulo você abra: a faixa do topo é sempre a mesma, com os **mesmos ícones e na mesma ordem**.',
        'É o principal ponto de retorno ao **Hub**, de acesso à **conta**, troca de **idioma** e demais atalhos transversais da plataforma.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Visão geral do menu superior',
          ocultarRotuloPasso: true,
          imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_VISAO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'O **menu superior** é a faixa fixa no topo. À **esquerda** ficam o título da tela atual; à **direita**, o atalho **Hub** e os **sete ícones globais** descritos no capítulo seguinte — sempre na **mesma ordem**.',
            'A imagem mostra a tela **Pedido — Insights**, mas o menu é **idêntico** em qualquer produto ou área — você já o viu no Hub ao entrar na plataforma. O destaque aponta o botão **Hub**, usado para voltar à tela principal.',
          ],
        },
      ]),
    },
    {
      titulo: 'Ícones do menu superior',
      tituloSumario: 'Ícones do menu',
      modoCenarios: true,
      paragrafos: [
        'À direita do botão **Hub**, estes **sete ícones** acompanham **todas** as telas autenticadas. Passe o mouse para ver a dica rápida; clique para executar a ação. A ordem **nunca muda** — da esquerda para a direita: **Localizar**, **Gravity University**, **Notificações**, **Tooltip**, **Idioma**, **Atalho ao Configurador** e **Menu via usuário**.',
      ],
      figurasAposParagrafo: [
        {
          indice: 0,
          imagem: SCREENSHOT_NAVEGACAO_MENU_SUPERIOR_ICONES_DIREITA,
          legenda: 'Ícones à direita do Hub — mesma ordem em Hub, produtos, Store, Configurador e University',
        },
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Localizar',
          paragrafos: [
            'Ícone de **lupa** — abre a **busca na tela**. Em produtos e listas, o campo expande no próprio menu e filtra registros, colunas e conteúdo visível conforme você digita. Pressione **Esc** ou clique no **×** para fechar sem sair da página.',
            'Use quando precisar achar um pedido, processo ou item em uma tabela longa sem rolar a tela inteira.',
          ],
        },
        {
          titulo: 'Gravity University',
          paragrafos: [
            'Ícone de **capelo** — atalho fixo para a **Gravity University**, a central de aprendizado da plataforma. Abre manuais, trilhas de onboarding e documentação por produto **a partir de qualquer tela**, sem precisar voltar ao Hub.',
            'Este manual de Navegação que você está lendo fica em **Manuais e Vídeos → Navegação** dentro da University.',
          ],
        },
        {
          titulo: 'Notificações',
          paragrafos: [
            'Ícone de **sininho** — abre o **quadro de avisos** da organização: alertas, pendências e mensagens internas que exigem sua atenção nos produtos contratados.',
            'O **ponto laranja** no canto do ícone indica itens **não lidos** ou novas notificações. Sem pendências, o sininho aparece sem destaque.',
          ],
        },
        {
          titulo: 'Tooltip',
          paragrafos: [
            'Ícone **i** (informação) — **liga ou desliga** as dicas explicativas que aparecem ao passar o mouse sobre botões, cards, campos e indicadores em toda a plataforma.',
            'Quando as dicas estão **ativas**, o ícone fica **preenchido em azul**. Desativadas, volta ao contorno cinza — útil quando você já conhece a tela e quer menos ruído visual.',
          ],
          callout: {
            tipo: 'dica',
            texto: 'As dicas são as mesmas “tooltips” citadas nos manuais de produto — este botão controla se elas aparecem ou não, **globalmente**, em qualquer módulo.',
          },
        },
        {
          titulo: 'Idioma',
          paragrafos: [
            'Botão com a **sigla do idioma atual** (ex.: **BR** para português) — troca a interface entre **português**, **inglês** e **espanhol** com um clique.',
            'A escolha vale para **toda** a plataforma na sessão atual: menus, rótulos, manuais traduzidos e mensagens do sistema seguem o idioma selecionado.',
          ],
        },
        {
          titulo: 'Atalho ao Configurador',
          paragrafos: [
            'Ícone de **engrenagem** — abre o **Configurador da organização**: gestão de workspaces, usuários, fornecedores, assinaturas, financeiro e demais ajustes da conta.',
            'É o caminho mais rápido para **configurar a operação** sem passar pelo menu do usuário — a engrenagem leva direto à área de gestão, independente do produto que você estava usando.',
          ],
        },
        {
          titulo: 'Menu via usuário',
          paragrafos: [
            '**Avatar** com suas iniciais (ou foto) — abre o menu de **conta e preferências**: nome, e-mail, patente no workspace, **tema claro/escuro**, atalhos para **Gravity Store** e **Configurador**, e **encerrar sessão**.',
            'Usuários com perfil **Master** ou **Admin** veem opções extras, como **Painel Admin** e **Trocar organização** (quando habilitado). O traço vertical antes do avatar separa os atalhos globais do bloco de identidade.',
          ],
        },
      ]),
    },
    {
      titulo: 'Menu lateral',
      tituloSumario: 'Menu lateral',
      modoCenarios: true,
      paragrafos: [
        'O **menu lateral esquerdo** só existe **depois** que você escolhe um **Produto Gravity** no Hub (Pedido, Smart Docs, BID Frete, Processo, etc.). Enquanto você está no **Hub** ou na **Gravity Store**, a tela usa **apenas o menu superior** — **não há menu lateral**.',
        'O **Configurador da organização** é outra área com **menu lateral próprio**: gestão de Organização, Usuários, Workspaces, Assinaturas e demais capítulos. Você entra pelo **menu do usuário**, não ao clicar um produto no Hub.',
      ],
      mostrarInfograficoMenuLateral: true,
      callout: {
        tipo: 'dica',
        texto: '**Regra rápida:** Hub e Store = só menu superior. Produto aberto no Hub = menu lateral do produto. Configurador = menu lateral de gestão (independente dos produtos).',
      },
      passosVisuais: renumerarPassos([
        {
          titulo: 'Hub — sem menu lateral',
          paragrafos: [
            'No **Hub**, a área central mostra produtos, vitrine da Store e painéis de resumo. A navegação é pelo **menu superior** e pelos **cards e ícones** da própria tela — não há coluna de módulos à esquerda.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_HUB_SEM_MENU_LATERAL,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Gravity Store — sem menu lateral',
          paragrafos: [
            'Na **Gravity Store**, o catálogo de contratação também usa **somente o menu superior**. Os produtos aparecem em cards e abas da vitrine — o layout é parecido com o Hub nesse aspecto.',
            'Screenshot previsto: `navegacao-store-sem-menu-lateral.png` (tela completa da Store).',
          ],
        },
        {
          titulo: 'Escolher o produto no Hub',
          paragrafos: [
            'Para ver o menu lateral, volte ao **Hub** e clique no **ícone do Produto Gravity** que deseja usar (na seção **Seus produtos Gravity**). Só então a plataforma abre o **shell do produto** com a coluna de módulos à esquerda.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_HUB_ESCOLHER_PRODUTO,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Produto Gravity — com menu lateral',
          paragrafos: [
            'Dentro do produto, o **menu lateral** lista os módulos daquele Produto Gravity (ex.: Lista, Insights, Dashboard — conforme o produto contratado).',
            'Screenshot previsto: `navegacao-produto-menu-lateral-exemplo.png` (ex.: Pedido ou Smart Docs com menu à esquerda).',
          ],
        },
        {
          titulo: 'Configurador — menu lateral de gestão',
          paragrafos: [
            'No **Configurador**, o menu lateral é **fixo** e organiza a gestão da conta: Organização, Workspaces, Usuários, Fornecedores, Assinaturas, Financeiro, etc. É independente do menu de um produto operacional.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_CONFIGURADOR_MENU_LATERAL,
          imagemAbaixoTexto: true,
        },
        {
          titulo: 'Outros capítulos do Configurador',
          paragrafos: [
            'Ao trocar de capítulo (ex.: **Usuários**), o menu lateral **permanece** com a mesma estrutura — mudam apenas os itens destacados e o conteúdo à direita.',
          ],
          imagem: SCREENSHOT_NAVEGACAO_CONFIGURADOR_MENU_MODULOS,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Navegação na Gravity University',
      tituloSumario: 'Navegação na Gravity University',
      paragrafos: [
        'Na **Gravity University**, a **sidebar esquerda** organiza trilhas de aprendizado, manuais por produto e builders futuros. Este manual que você está lendo fica em **Manuais e Vídeos → Navegação**.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Sidebar completa',
          paragrafos: [
            'Visão da árvore: Organização, Onboarding, Manuais e Vídeos, Builders, Minha Jornada.',
            'Screenshot pendente: navegacao-university-sidebar-completa.png.',
          ],
        },
        {
          titulo: 'Seção Manuais e Vídeos',
          paragrafos: [
            'Login, Navegação, Admin (restrito), Configurador e futuros manuais de produto.',
            'Screenshot pendente: navegacao-university-manuais-videos.png.',
          ],
        },
        {
          titulo: 'Submenu Configurador',
          paragrafos: [
            'Capítulos Hub, Store, Pedido, Smart Docs, BID Frete, BID Câmbio, Processo, etc.',
            'Screenshot pendente: navegacao-university-submenu-configurador.png.',
          ],
        },
        {
          titulo: 'Academy vs Manuais',
          paragrafos: [
            'Diferença entre trilhas gamificadas (**Academy**) e documentação descritiva (**Manuais**).',
            'Screenshot pendente: navegacao-university-academy-vs-docs.png.',
          ],
        },
      ]),
    },
    {
      titulo: 'Atalhos globais',
      tituloSumario: 'Atalhos globais',
      paragrafos: [
        'Além dos menus, existem **caminhos recorrentes** entre Hub, **Gravity Store**, **Configurador da organização** e produtos — pelo menu do usuário, cards do Hub ou links internos nos manuais.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Mapa de atalhos entre áreas',
          paragrafos: [
            'Diagrama ou screenshot anotado ligando Hub ↔ Store ↔ Configurador ↔ Produtos.',
            'Screenshot pendente: navegacao-atalhos-mapa-global.png.',
          ],
        },
        {
          titulo: 'Voltar ao Hub',
          paragrafos: [
            'Todos os caminhos principais para retornar à tela inicial após abrir um produto.',
            'Screenshot pendente: navegacao-atalhos-voltar-hub.png.',
          ],
        },
        {
          titulo: 'Store e Configurador',
          paragrafos: [
            'Atalhos pelo menu do usuário, Hub e University para gestão da conta e contratação.',
            'Screenshot pendente: navegacao-atalhos-store-configurador.png.',
          ],
        },
      ]),
    },
  ],
}
