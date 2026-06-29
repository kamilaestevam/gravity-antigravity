import type { DocPassoVisual, DocSecao } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

/** SSOT: arquivos em public/university/screenshots/ */
const SCREENSHOT_HUB_SEM_PRODUTO_PUZZLES_OPACO = '/university/screenshots/hub-puzzles-opaco-sem-produto.png'
const SCREENSHOT_HUB_COM_PRODUTO_PUZZLES_ATIVOS = '/university/screenshots/hub-puzzles-ativos-com-produto.png'
const SCREENSHOT_HUB_INTRO_COM_SETA = '/university/screenshots/hub-tela-principal-com-seta.png'
const SCREENSHOT_HUB_MENU_SUPERIOR = '/university/screenshots/hub-menu-superior-seta-hub.png'
const SCREENSHOT_HUB_PUZZLES = '/university/screenshots/hub-puzzles-produtos-gravity.png'
const SCREENSHOT_HUB_ACESSO_STORE_123 = '/university/screenshots/hub-acesso-gravity-store-numeros-1-2-3.png'
const SCREENSHOT_HUB_MENU_USUARIO_STORE = '/university/screenshots/hub-menu-usuario-ir-gravity-store.png'
const SCREENSHOT_HUB_AGUARDANDO_ACAO = '/university/screenshots/hub-destaque-aguardando-acao.png'
const SCREENSHOT_HUB_CARROSSEL_VITRINE = '/university/screenshots/hub-carrossel-vitrine-gravity-store.png'
const SCREENSHOT_HUB_GABI_DESTAQUE = '/university/screenshots/hub-gabi-insights-destaque.png'

function renumerarPassos(passos: PassoSemNumero[]): DocPassoVisual[] {
  return passos.map((passo, i) => ({ ...passo, num: i + 1 }))
}

export const DOC_HUB_SUBTITULO =
  'Tela principal: Produtos Gravity, Store e Gabi Insights'

export const DOC_HUB_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'junho 2026' },
  { rotulo: 'Produto', valor: 'Hub' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/hub', href: true },
]

export const DOC_HUB_SECAO: DocSecao = {
  num: 1,
  titulo: 'Hub: tela principal da plataforma',
  layoutTextoImagemLateral: true,
  imagem: SCREENSHOT_HUB_INTRO_COM_SETA,
  paragrafos: [
    'O **Hub** é a **tela principal da plataforma Gravity**, o painel central para onde você vai após o login e para onde pode voltar a qualquer momento pelo **ícone Hub** no menu superior das telas.',
    'Por meio do Hub você **acessa qualquer produto Gravity** que a organização tenha contratado e habilitado no workspace. Pedido, Processo, Smart Docs, BID Frete, Simula Custo e demais módulos aparecem na seção **Seus Produtos Gravity**: Basta clicar no módulo para abrir o produto no workspace selecionado.',
  ],
  figurasAposParagrafo: [
    {
      indice: 0,
      imagem: SCREENSHOT_HUB_MENU_SUPERIOR,
      legenda: 'Ícone Hub no menu superior',
    },
    {
      indice: 1,
      imagem: SCREENSHOT_HUB_PUZZLES,
      legenda: 'Seção Seus Produtos Gravity',
    },
  ],
  mostrarInfograficoHubTelas: true,
  fluxos: [
    {
      titulo: 'Seus produtos Gravity',
      tituloSumario: 'Seus produtos Gravity',
      modoCenarios: true,
      paragrafos: [
        'Aqui no **Hub** são exibidos **todos os produtos Gravity** na plataforma, **comprados e não comprados** pela organização.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Sem produto contratado',
          paragrafos: [
            'Quando nenhum **Produto Gravity** está contratado, os **ícones dos produtos** aparecem em prévia (cinza) e um banner convida a **Ativar na Gravity Store**.',
          ],
          imagem: SCREENSHOT_HUB_SEM_PRODUTO_PUZZLES_OPACO,
          imagemAbaixoTexto: true,
          callout: {
            tipo: 'dica',
            texto: 'Assim que entrar no Hub, vá até a {{link:/university-gravity/docs/store|Gravity Store}} e contrate seu primeiro produto para iniciar na plataforma.',
          },
        },
        {
          titulo: 'Com produto contratado',
          paragrafos: [
            'Com assinaturas **ativas**, os **Produtos Gravity contratados** ficam iluminados e clicáveis e abrem o produto no workspace selecionado.',
          ],
          imagem: SCREENSHOT_HUB_COM_PRODUTO_PUZZLES_ATIVOS,
          imagemAbaixoTexto: true,
        },
      ]),
    },
    {
      titulo: 'Acesso à Gravity Store',
      tituloSumario: 'Acesso à Gravity Store',
      paragrafos: [
        'A Gravity Store é o catálogo de produtos Gravity. No Hub existem **três caminhos** principais até ela.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Caminhos para abrir a Store',
          paragrafos: [
            '1. **Botão “Ir para Gravity Store”**: aparece **apenas no primeiro acesso** ou enquanto a organização **não tiver nenhum Produto Gravity contratado**, como indicado pelo **1** na imagem.',
            '2. **Link “Gravity Store” (2 na imagem)** no cabeçalho de **Seus Produtos Gravity**. Este atalho fica **disponível de forma permanente**.',
            '3. **Painel Gravity Store** na faixa inferior (card em carrossel; ver seção **Vitrine Store**), **3** na imagem.',
          ],
          figurasAposParagrafo: [
            {
              indice: 2,
              imagem: SCREENSHOT_HUB_ACESSO_STORE_123,
              legenda: 'Caminhos 1, 2 e 3 na tela do Hub',
            },
          ],
          dicaAoLadoImagem: {
            callout: {
              tipo: 'dica',
              texto: 'Também é possível acessar a {{link:/university-gravity/docs/store|Gravity Store}} de **qualquer tela** da plataforma: clique no **ícone do usuário** (canto superior direito) e escolha **Ir para Gravity Store**.',
            },
            imagem: SCREENSHOT_HUB_MENU_USUARIO_STORE,
            legenda: 'Menu do usuário — Ir para Gravity Store',
          },
        },
      ]),
    },
    {
      titulo: 'Aguardando ação',
      tituloSumario: 'Aguardando ação',
      paragrafos: [
        'O card **Aguardando ação** reúne **pendências e alertas** do usuário nos **produtos contratados**, um panorama rápido do que precisa de ação no workspace.',
      ],
      callout: {
        tipo: 'dica',
        texto: 'Aqui é só o **resumo**. Para **controle total**, use o **dashboard de cada produto**.',
      },
      calloutAposPassos: true,
      passosVisuais: [
        {
          num: 1,
          titulo: 'Card Aguardando ação',
          ocultarRotuloPasso: true,
          ocultarTituloPasso: true,
          imagem: SCREENSHOT_HUB_AGUARDANDO_ACAO,
          imagemAbaixoTexto: true,
          paragrafos: [],
        },
      ],
    },
    {
      titulo: 'Vitrine Gravity Store no Hub',
      tituloSumario: 'Vitrine Gravity Store no Hub',
      modoCenarios: true,
      paragrafos: [
        'O painel inferior esquerdo **Gravity Store** é uma vitrine dos Produtos Gravity que você **ainda não contratou**.',
        'Cada card exibe um **selo de status** no canto superior:',
        '**Disponível** (verde): o produto já pode ser **contratado na Store**. Clique no card para abrir a vitrine.',
        '**Em breve** (âmbar): o produto já aparece no ecossistema, mas a **contratação ainda não foi liberada**. O card é só para conhecer o que vem aí.',
      ],
      figurasAposParagrafo: [
        {
          indice: 3,
          imagem: SCREENSHOT_HUB_CARROSSEL_VITRINE,
          legenda: 'Vitrine Gravity Store no Hub',
        },
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Carrossel da vitrine',
          paragrafos: [
            'O carrossel mostra somente produtos **disponíveis** ou **em breve**, os que você já contratou não aparecem aqui.',
            'A vitrine **gira automaticamente a cada 3,5 segundos**; ao passar o mouse, a rotação **pausa**.',
            'Use as **setas** e as **bolinhas** para navegar manualmente. Clique no card para abrir a {{link:/university-gravity/docs/store|Gravity Store}}.',
          ],
        },
      ]),
    },
    {
      titulo: 'Gabi Insights',
      tituloSumario: 'Gabi Insights',
      callout: {
        tipo: 'dica',
        texto: 'Assim como **Aguardando ação**, os insights são um **resumo no Hub**. Para análise completa, abra o **dashboard do produto** indicado no card.',
      },
      calloutAposPassos: true,
      passosVisuais: [
        {
          num: 1,
          titulo: 'Painel Gabi Insights',
          ocultarRotuloPasso: true,
          ocultarTituloPasso: true,
          imagem: SCREENSHOT_HUB_GABI_DESTAQUE,
          paragrafos: [
            'O painel **Gabi Insights** (faixa inferior direita do Hub) mostra **alertas e dicas** sobre a sua operação nos **Produtos Gravity contratados**, um resumo do que merece atenção agora.',
            'A Gabi cruza indicadores de **Pedido**, **BID Frete**, **BID Câmbio**, **Simula Custo**, **LPCO**, **NF de Importação** e demais produtos **ativos na sua organização**. Só entram insights dos produtos que você pode acessar.',
            'Cada página mostra **até três cards**. O painel **avança sozinho a cada 5 segundos**; passe o mouse para pausar. O selo **AO VIVO** (ponto verde) indica que o conteúdo está atualizado.',
            'Use as **setas** e as **bolinhas** para mudar de página manualmente.',
            'Em cada card você vê **de qual produto vem o insight** (ex.: «PEDIDO · Atrasos»), a **mensagem em linguagem clara**, um **número de apoio** quando fizer sentido e um **atalho** para abrir o produto e agir (ex.: «Corrigir agora»).',
            'Cards em destaque **âmbar** sinalizam **pendências**; os demais trazem **oportunidades** ou **dicas de uso da plataforma**.',
          ],
        },
      ],
    },
  ],
}
